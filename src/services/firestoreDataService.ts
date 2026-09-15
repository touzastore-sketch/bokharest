import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { Category, MenuItem, OrderRecord, ReservationRecord, CustomerFeedback, RestaurantInfo, AdvertisementItem, GalleryImage } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, OFFICIAL_RESTAURANT_INFO } from '../data/restaurantData';
import { INITIAL_ADVERTISEMENTS } from '../data/ads';
import { GALLERY_IMAGES } from '../data/galleryData';
import { CLOUDINARY_ASSETS } from './cloudinaryService';

export const COLLECTIONS = {
  CATEGORIES: 'categories',
  MENU_ITEMS: 'menu_items',
  ORDERS: 'orders',
  RESERVATIONS: 'reservations',
  FEEDBACKS: 'feedbacks',
  RESTAURANT_INFO: 'restaurant_info',
  ADVERTISEMENTS: 'advertisements',
  GALLERY: 'gallery',
};

/**
 * تنظيف الكائنات من الحقول التي قيمتها undefined قبل إرسالها إلى Firestore
 * لتجنب خطأ Firebase SDK الشهير: "Unsupported field value: undefined"
 */
export function cleanDataForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj === null || obj === undefined) return {};
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = cleanDataForFirestore(val);
      } else if (Array.isArray(val)) {
        clean[key] = val.map((item) =>
          item !== null && typeof item === 'object' && !(item instanceof Date)
            ? cleanDataForFirestore(item)
            : item
        );
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

/**
 * فحص وتهيئة بيانات القائمة والأصناف في Cloud Firestore عند الإطلاق لأول مرة
 */
export async function seedFirestoreIfEmpty(): Promise<{ seeded: boolean; categoriesCount: number; menuItemsCount: number }> {
  try {
    const catSnapshot = await getDocs(collection(firestoreDb, COLLECTIONS.CATEGORIES));
    const itemsSnapshot = await getDocs(collection(firestoreDb, COLLECTIONS.MENU_ITEMS));

    let seededCategories = 0;
    let seededItems = 0;

    // تهيئة التصنيفات إذا كانت فارغة
    if (catSnapshot.empty) {
      console.log(`[FirestoreData] جارٍ رفع وتأسيس ${INITIAL_CATEGORIES.length} تصنيف في Cloud Firestore...`);
      const batch = writeBatch(firestoreDb);
      for (const cat of INITIAL_CATEGORIES) {
        const ref = doc(firestoreDb, COLLECTIONS.CATEGORIES, cat.id);
        batch.set(ref, {
          ...cleanDataForFirestore(cat),
          updatedAt: serverTimestamp(),
        });
        seededCategories++;
      }
      await batch.commit();
      console.log(`[FirestoreData] ✅ تم بنجاح نقل التصنيفات إلى Cloud Firestore.`);
    }

    // تهيئة أصناف المنيو إذا كانت فارغة
    if (itemsSnapshot.empty) {
      console.log(`[FirestoreData] جارٍ رفع وتأسيس ${INITIAL_MENU_ITEMS.length} صنف في Cloud Firestore...`);
      // Firestore batches are limited to 500 operations per batch
      const chunkSize = 350;
      for (let i = 0; i < INITIAL_MENU_ITEMS.length; i += chunkSize) {
        const chunk = INITIAL_MENU_ITEMS.slice(i, i + chunkSize);
        const batch = writeBatch(firestoreDb);
        for (const item of chunk) {
          const ref = doc(firestoreDb, COLLECTIONS.MENU_ITEMS, item.id);
          batch.set(ref, {
            ...cleanDataForFirestore(item),
            updatedAt: serverTimestamp(),
          });
          seededItems++;
        }
        await batch.commit();
      }
      console.log(`[FirestoreData] ✅ تم بنجاح نقل كافة أصناف المنيو إلى Cloud Firestore.`);
    }

    // حفظ معلومات المطعم الرسمية
    const infoRef = doc(firestoreDb, COLLECTIONS.RESTAURANT_INFO, 'official');
    const infoSnap = await getDoc(infoRef);
    if (!infoSnap.exists()) {
      await setDoc(infoRef, {
        ...cleanDataForFirestore(OFFICIAL_RESTAURANT_INFO),
        updatedAt: serverTimestamp(),
      });
    }

    // تهيئة الإعلانات والبنرات إذا كانت فارغة
    const adsSnapshot = await getDocs(collection(firestoreDb, COLLECTIONS.ADVERTISEMENTS));
    if (adsSnapshot.empty && INITIAL_ADVERTISEMENTS.length > 0) {
      console.log(`[FirestoreData] جارٍ رفع وتأسيس ${INITIAL_ADVERTISEMENTS.length} بنرات إعلانية في Cloud Firestore...`);
      const batch = writeBatch(firestoreDb);
      for (const ad of INITIAL_ADVERTISEMENTS) {
        const ref = doc(firestoreDb, COLLECTIONS.ADVERTISEMENTS, ad.id);
        batch.set(ref, {
          ...ad,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      console.log(`[FirestoreData] ✅ تم بنجاح نقل البنرات الإعلانية إلى Cloud Firestore.`);
    }

    // تهيئة صور المعرض (Gallery) فقط إذا لم تتم تهيئتها مسبقاً
    const galleryMetaRef = doc(firestoreDb, 'system_metadata', 'gallery_status');
    const galleryMetaSnap = await getDoc(galleryMetaRef).catch(() => null);
    const galleryMeta = galleryMetaSnap?.exists() ? galleryMetaSnap.data() : null;
    const isGalleryInitialized = galleryMeta?.initialized === true;
    const remoteDeletedGallery = new Set<string>(galleryMeta?.deletedIds || []);

    if (!isGalleryInitialized) {
      const gallerySnapshot = await getDocs(collection(firestoreDb, COLLECTIONS.GALLERY));
      if (gallerySnapshot.empty && GALLERY_IMAGES.length > 0) {
        console.log(`[FirestoreData] جارٍ رفع وتأسيس ${GALLERY_IMAGES.length} صور للمعرض في Cloud Firestore...`);
        const batch = writeBatch(firestoreDb);
        const localDeleted = getLocalDeletedGalleryIds();
        for (const img of GALLERY_IMAGES) {
          if (!localDeleted.has(img.id) && !remoteDeletedGallery.has(img.id) && (!img.url || !localDeleted.has(img.url))) {
            const ref = doc(firestoreDb, COLLECTIONS.GALLERY, img.id);
            batch.set(ref, {
              ...cleanDataForFirestore(img),
              updatedAt: serverTimestamp(),
            });
          }
        }
        await batch.commit();
        console.log(`[FirestoreData] ✅ تم بنجاح نقل صور المعرض إلى Cloud Firestore.`);
      }
      // وضع علامة أن المعرض تمت تهيئته سحابياً حتى لا تعود الصور المحذوفة مطلقاً
      await setDoc(galleryMetaRef, { initialized: true }, { merge: true }).catch(() => {});
    }

    return {
      seeded: seededCategories > 0 || seededItems > 0,
      categoriesCount: seededCategories || catSnapshot.size,
      menuItemsCount: seededItems || itemsSnapshot.size,
    };
  } catch (error) {
    console.warn('[FirestoreData] ملاحظة أثناء فحص / تهيئة بيانات Firestore:', error);
    return { seeded: false, categoriesCount: 0, menuItemsCount: 0 };
  }
}

/**
 * الاستماع اللحظي (Real-time listener) للتصنيفات من Firestore
 */
export function subscribeToCategories(
  onUpdate: (categories: Category[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const q = collection(firestoreDb, COLLECTIONS.CATEGORIES);
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name_ar: data.name_ar || '',
              name_en: data.name_en || '',
              note_ar: data.note_ar,
              note_en: data.note_en,
              iconName: data.iconName,
              display_order: data.display_order ?? 0,
            });
          });
          // فرز التصنيفات بحسب الترتيب
          list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('[FirestoreData] Category subscription error, using local fallback:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('[FirestoreData] Error creating category listener:', error);
    return () => {};
  }
}

/**
 * الاستماع اللحظي (Real-time listener) لأصناف المنيو من Firestore
 */
export function subscribeToMenuItems(
  onUpdate: (items: MenuItem[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const q = collection(firestoreDb, COLLECTIONS.MENU_ITEMS);
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MenuItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              category_id: data.category_id || '',
              name_ar: data.name_ar || '',
              name_en: data.name_en || '',
              description_ar: data.description_ar || '',
              description_en: data.description_en || '',
              price: Number(data.price) || 0,
              image: data.image || '',
              available: data.available !== false,
              featured: Boolean(data.featured),
              calories: data.calories ? Number(data.calories) : undefined,
              preparation_time: data.preparation_time,
              badge_en: data.badge_en,
              badge_ar: data.badge_ar,
              type: data.type,
            });
          });
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('[FirestoreData] Menu subscription error, using local fallback:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('[FirestoreData] Error creating menu listener:', error);
    return () => {};
  }
}

/**
 * حفظ أو تعديل صنف في قائمة الطعام في Firestore
 */
export async function saveMenuItemToFirestore(item: MenuItem): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.MENU_ITEMS, item.id);
    const cleaned = cleanDataForFirestore(item);
    await setDoc(
      ref,
      {
        ...cleaned,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save menu item to Firestore:', error);
    return false;
  }
}

/**
 * حذف صنف من قائمة الطعام في Firestore
 */
export async function deleteMenuItemFromFirestore(itemId: string): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.MENU_ITEMS, itemId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete menu item from Firestore:', error);
    return false;
  }
}

/**
 * حفظ طلب جديد في Cloud Firestore
 */
export async function saveOrderToFirestore(order: OrderRecord): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.ORDERS, order.id);
    const cleaned = cleanDataForFirestore(order);
    await setDoc(ref, {
      ...cleaned,
      serverTime: serverTimestamp(),
      platform: 'Web App',
    });
    console.log(`[FirestoreData] ✅ تم حفظ الطلب بنجاح في Cloud Firestore (${order.id})`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save order to Firestore:', error);
    return false;
  }
}

/**
 * تحديث حالة طلب طعام في Cloud Firestore
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: OrderRecord['status']
): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.ORDERS, orderId);
    await setDoc(ref, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`[FirestoreData] ✅ تم تحديث حالة الطلب (${orderId}) إلى ${newStatus}`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to update order status in Firestore:', error);
    return false;
  }
}

export const DELETED_ORDERS_KEY = 'bokharest_deleted_order_ids_v1';
export const DELETED_RESERVATIONS_KEY = 'bokharest_deleted_reservation_ids_v1';

export function getLocalDeletedOrderIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_ORDERS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

export function recordLocalDeletedOrderId(orderId: string): void {
  try {
    const set = getLocalDeletedOrderIds();
    set.add(orderId);
    localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function unmarkDeletedOrderId(orderId: string): void {
  try {
    const set = getLocalDeletedOrderIds();
    set.delete(orderId);
    localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getLocalDeletedReservationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_RESERVATIONS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

export function recordLocalDeletedReservationId(resId: string): void {
  try {
    const set = getLocalDeletedReservationIds();
    set.add(resId);
    localStorage.setItem(DELETED_RESERVATIONS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function unmarkDeletedReservationId(resId: string): void {
  try {
    const set = getLocalDeletedReservationIds();
    set.delete(resId);
    localStorage.setItem(DELETED_RESERVATIONS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

/**
 * حذف طلب من Cloud Firestore وإشعار كافة أجهزة العملاء بحذفه فوراً
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<boolean> {
  try {
    recordLocalDeletedOrderId(orderId);

    const ref = doc(firestoreDb, COLLECTIONS.ORDERS, orderId);
    await deleteDoc(ref);

    // تسجيل معرف الطلب المحذوف في system_metadata/orders_status ليحذفه تطبيق العميل فوراً
    const metaRef = doc(firestoreDb, 'system_metadata', 'orders_status');
    await setDoc(
      metaRef,
      {
        deletedOrderIds: arrayUnion(orderId),
        lastDeletedId: orderId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});

    console.log(`[FirestoreData] 🗑️ تم حذف الطلب (${orderId}) من Cloud Firestore وتعميم الحذف على العملاء`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete order from Firestore:', error);
    return false;
  }
}

/**
 * الاستماع لسجل الطلبات من Firestore مع مزامنة الحذف المباشر للعميل
 */
export function subscribeToOrders(
  onUpdate: (orders: OrderRecord[], deletedOrderIds?: string[]) => void
): () => void {
  try {
    let currentOrders: OrderRecord[] = [];
    let currentDeletedIds: string[] = Array.from(getLocalDeletedOrderIds());
    let isInitialized = false;

    const dispatch = () => {
      const deletedSet = new Set(currentDeletedIds);
      const filtered = currentOrders.filter((o) => !deletedSet.has(o.id));
      onUpdate(filtered, currentDeletedIds);
    };

    // الاستماع لبيانات المحذوفات السحابية
    const metaRef = doc(firestoreDb, 'system_metadata', 'orders_status');
    const unsubMeta = onSnapshot(
      metaRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.deletedOrderIds)) {
            const combined = new Set([...currentDeletedIds, ...data.deletedOrderIds]);
            currentDeletedIds = Array.from(combined);
            try {
              localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(currentDeletedIds));
            } catch {}
            if (isInitialized) {
              dispatch();
            }
          }
        }
      },
      (err) => {
        console.warn('[FirestoreData] Orders status metadata note:', err);
      }
    );

    // الاستماع لمجموعة الطلبات
    const q = query(collection(firestoreDb, COLLECTIONS.ORDERS), limit(100));
    const unsubCollection = onSnapshot(
      q,
      (snapshot) => {
        isInitialized = true;
        const orders: OrderRecord[] = [];
        snapshot.forEach((d) => {
          orders.push(d.data() as OrderRecord);
        });

        orders.sort((a, b) => {
          const timeA = new Date(a.date || 0).getTime();
          const timeB = new Date(b.date || 0).getTime();
          return timeB - timeA;
        });

        // التقاط أي وثيقة حُذفت مباشرة
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            const removedId = change.doc.id;
            recordLocalDeletedOrderId(removedId);
            if (!currentDeletedIds.includes(removedId)) {
              currentDeletedIds.push(removedId);
            }
          }
        });

        currentOrders = orders;
        dispatch();
      },
      (error) => {
        console.warn('[FirestoreData] Orders listener note:', error);
      }
    );

    return () => {
      unsubMeta();
      unsubCollection();
    };
  } catch {
    return () => {};
  }
}

/**
 * حفظ حجز طاولة في Cloud Firestore
 */
export async function saveReservationToFirestore(reservation: ReservationRecord): Promise<boolean> {
  try {
    unmarkDeletedReservationId(reservation.id);
    const ref = doc(firestoreDb, COLLECTIONS.RESERVATIONS, reservation.id);
    const cleaned = cleanDataForFirestore(reservation);
    await setDoc(ref, {
      ...cleaned,
      serverTime: serverTimestamp(),
      platform: 'Web App',
    });
    console.log(`[FirestoreData] ✅ تم حفظ حجز الطاولة بنجاح في Cloud Firestore (${reservation.id})`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save reservation to Firestore:', error);
    return false;
  }
}

/**
 * تحديث حالة حجز طاولة في Cloud Firestore
 */
export async function updateReservationStatusInFirestore(
  reservationId: string,
  newStatus: ReservationRecord['status']
): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.RESERVATIONS, reservationId);
    await setDoc(ref, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`[FirestoreData] ✅ تم تحديث حالة الحجز (${reservationId}) إلى ${newStatus}`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to update reservation status in Firestore:', error);
    return false;
  }
}

/**
 * حذف حجز طاولة من Cloud Firestore وإشعار العميل بحذفه فوراً
 */
export async function deleteReservationFromFirestore(reservationId: string): Promise<boolean> {
  try {
    recordLocalDeletedReservationId(reservationId);

    const ref = doc(firestoreDb, COLLECTIONS.RESERVATIONS, reservationId);
    await deleteDoc(ref);

    const metaRef = doc(firestoreDb, 'system_metadata', 'reservations_status');
    await setDoc(
      metaRef,
      {
        deletedReservationIds: arrayUnion(reservationId),
        lastDeletedId: reservationId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});

    console.log(`[FirestoreData] 🗑️ تم حذف حجز الطاولة (${reservationId}) وتعميم الحذف`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete reservation from Firestore:', error);
    return false;
  }
}

/**
 * الاستماع لسجل حجوزات الطاولات من Firestore مع المزامنة اللحظية للحذف
 */
export function subscribeToReservations(
  onUpdate: (reservations: ReservationRecord[], deletedReservationIds?: string[]) => void
): () => void {
  try {
    let currentReservations: ReservationRecord[] = [];
    let currentDeletedIds: string[] = Array.from(getLocalDeletedReservationIds());
    let isInitialized = false;

    const dispatch = () => {
      const deletedSet = new Set(currentDeletedIds);
      const filtered = currentReservations.filter((r) => !deletedSet.has(r.id));
      onUpdate(filtered, currentDeletedIds);
    };

    const metaRef = doc(firestoreDb, 'system_metadata', 'reservations_status');
    const unsubMeta = onSnapshot(
      metaRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.deletedReservationIds)) {
            const combined = new Set([...currentDeletedIds, ...data.deletedReservationIds]);
            currentDeletedIds = Array.from(combined);
            try {
              localStorage.setItem(DELETED_RESERVATIONS_KEY, JSON.stringify(currentDeletedIds));
            } catch {}
            if (isInitialized) {
              dispatch();
            }
          }
        }
      },
      (err) => {
        console.warn('[FirestoreData] Reservations status metadata note:', err);
      }
    );

    const q = query(collection(firestoreDb, COLLECTIONS.RESERVATIONS), limit(150));
    const unsubCollection = onSnapshot(
      q,
      (snapshot) => {
        isInitialized = true;
        const list: ReservationRecord[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ReservationRecord);
        });

        list.sort((a, b) => {
          const timeA = new Date(a.date || 0).getTime();
          const timeB = new Date(b.date || 0).getTime();
          return timeB - timeA;
        });

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            const removedId = change.doc.id;
            recordLocalDeletedReservationId(removedId);
            if (!currentDeletedIds.includes(removedId)) {
              currentDeletedIds.push(removedId);
            }
          }
        });

        currentReservations = list;
        dispatch();
      },
      (error) => {
        console.warn('[FirestoreData] Reservations listener note:', error);
      }
    );

    return () => {
      unsubMeta();
      unsubCollection();
    };
  } catch {
    return () => {};
  }
}

/**
 * الاستماع لتقييمات وآراء العملاء
 */
export function subscribeToFeedbacks(
  onUpdate: (feedbacks: CustomerFeedback[]) => void
): () => void {
  try {
    const q = query(collection(firestoreDb, COLLECTIONS.FEEDBACKS), orderBy('serverTime', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: CustomerFeedback[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as CustomerFeedback);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('[FirestoreData] Feedback listener note:', error);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * تحديث رابط الصورة لجميع أصناف المنيو في Cloud Firestore دفعة واحدة
 */
export async function updateAllMenuItemsImageInFirestore(
  newImageUrl: string,
  onProgress?: (updatedCount: number, totalCount: number) => void
): Promise<{ success: boolean; count: number }> {
  try {
    const snapshot = await getDocs(collection(firestoreDb, COLLECTIONS.MENU_ITEMS));
    if (snapshot.empty) {
      return { success: true, count: 0 };
    }

    const docs = snapshot.docs;
    const total = docs.length;
    let updatedCount = 0;
    const chunkSize = 350;

    for (let i = 0; i < total; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      const batch = writeBatch(firestoreDb);

      for (const d of chunk) {
        batch.update(d.ref, {
          image: newImageUrl,
          updatedAt: serverTimestamp(),
        });
        updatedCount++;
      }

      await batch.commit();
      if (onProgress) {
        onProgress(updatedCount, total);
      }
    }

    console.log(`[FirestoreData] ✅ تم بنجاح تحديث روابط الصور لـ ${updatedCount} صنف في Cloud Firestore!`);
    return { success: true, count: updatedCount };
  } catch (error) {
    console.error('[FirestoreData] Error batch updating menu items image:', error);
    return { success: false, count: 0 };
  }
}

/**
 * ترحيل وتحديث كافة روابط الصور في Cloud Firestore إلى روابط Cloudinary المحسنة (f_auto, q_auto)
 */
export async function migrateAllCollectionsToCloudinary(
  onProgress?: (stepName: string, percent: number) => void
): Promise<{ success: boolean; menuCount: number; adsCount: number; galleryCount: number }> {
  try {
    if (onProgress) onProgress('بدء تحديث صور قائمة الطعام في Cloud Firestore إلى Cloudinary...', 10);

    // 1. Update all menu items to Cloudinary unified item image
    const menuResult = await updateAllMenuItemsImageInFirestore(
      CLOUDINARY_ASSETS.unifiedMenuItem,
      (curr, tot) => {
        if (onProgress) {
          const pct = Math.round(10 + (curr / tot) * 45);
          onProgress(`تحديث أصناف المنيو إلى Cloudinary (${curr}/${tot})...`, pct);
        }
      }
    );

    // 2. Update advertisements to Cloudinary banner
    if (onProgress) onProgress('تحديث البانرات الإعلانية في Cloud Firestore...', 60);
    const adsSnap = await getDocs(collection(firestoreDb, COLLECTIONS.ADVERTISEMENTS));
    let adsCount = 0;
    if (!adsSnap.empty) {
      const adsBatch = writeBatch(firestoreDb);
      adsSnap.forEach((adDoc) => {
        adsBatch.update(adDoc.ref, {
          image: CLOUDINARY_ASSETS.adsBanner,
          updatedAt: serverTimestamp(),
        });
        adsCount++;
      });
      await adsBatch.commit();
    }

    // 3. Update Gallery images to Cloudinary gallery assets
    if (onProgress) onProgress('تحديث صور المعرض في Cloud Firestore...', 75);
    const gallerySnap = await getDocs(collection(firestoreDb, COLLECTIONS.GALLERY));
    let galleryCount = 0;
    if (!gallerySnap.empty) {
      const galBatch = writeBatch(firestoreDb);
      const docs = gallerySnap.docs;
      docs.forEach((docSnap, index) => {
        const cloudUrl = CLOUDINARY_ASSETS.gallery[index % CLOUDINARY_ASSETS.gallery.length];
        galBatch.update(docSnap.ref, {
          url: cloudUrl,
          localUrl: cloudUrl,
          image: cloudUrl,
          updatedAt: serverTimestamp(),
        });
        galleryCount++;
      });
      await galBatch.commit();
    }

    // 4. Update Restaurant Info official logo and hero
    if (onProgress) onProgress('تحديث بيانات المطعم والشعار في Cloud Firestore...', 90);
    const infoRef = doc(firestoreDb, COLLECTIONS.RESTAURANT_INFO, 'official');
    await setDoc(
      infoRef,
      {
        logo: CLOUDINARY_ASSETS.logo,
        cafeHero: CLOUDINARY_ASSETS.cafeHero,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (onProgress) onProgress('اكتمل ترحيل كافة الصور إلى Cloudinary بنجاح!', 100);

    return {
      success: true,
      menuCount: menuResult.count,
      adsCount,
      galleryCount,
    };
  } catch (error) {
    console.error('[FirestoreData] Error migrating collections to Cloudinary:', error);
    return { success: false, menuCount: 0, adsCount: 0, galleryCount: 0 };
  }
}

/**
 * حفظ قسم جديد أو تعديل قسم في Firestore
 */
export async function saveCategoryToFirestore(category: Category): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.CATEGORIES, category.id);
    const cleaned = cleanDataForFirestore(category);
    await setDoc(ref, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save category:', error);
    return false;
  }
}

/**
 * حذف قسم من Firestore
 */
export async function deleteCategoryFromFirestore(categoryId: string): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete category:', error);
    return false;
  }
}

/**
 * حفظ أو تحديث معلومات المطعم الرسمية
 */
export async function saveRestaurantInfoToFirestore(info: RestaurantInfo): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.RESTAURANT_INFO, 'official');
    const cleaned = cleanDataForFirestore(info);
    await setDoc(ref, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save restaurant info:', error);
    return false;
  }
}

/**
 * حفظ تقييم عميل في Cloud Firestore
 */
export async function saveFeedbackToFirestore(feedback: CustomerFeedback): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.FEEDBACKS, feedback.id);
    const cleaned = cleanDataForFirestore(feedback);
    await setDoc(ref, {
      ...cleaned,
      serverTime: serverTimestamp(),
    });
    console.log(`[FirestoreData] ✅ تم حفظ التقييم بنجاح في Cloud Firestore (${feedback.id})`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save feedback to Firestore:', error);
    return false;
  }
}

/**
 * الاستماع اللحظي (Real-time listener) للإعلانات والبنرات من Firestore
 */
export function subscribeToAdvertisements(
  onUpdate: (ads: AdvertisementItem[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const q = collection(firestoreDb, COLLECTIONS.ADVERTISEMENTS);
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AdvertisementItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              title_ar: data.title_ar || '',
              title_en: data.title_en || '',
              subtitle_ar: data.subtitle_ar || '',
              subtitle_en: data.subtitle_en || '',
              badge_ar: data.badge_ar || '',
              badge_en: data.badge_en || '',
              badgeColor: data.badgeColor || '#D4AF37',
              image: data.image || '',
              fallbackImage: data.fallbackImage,
              aspectRatio: data.aspectRatio,
              action: data.action || 'whatsapp',
              actionType: data.actionType || 'menu',
              actionLabel_ar: data.actionLabel_ar,
              actionLabel_en: data.actionLabel_en,
              priority: typeof data.priority === 'number' ? data.priority : 1,
              link: data.link,
              whatsappMessage: data.whatsappMessage,
              hotspots: data.hotspots,
              active: data.active !== false,
            });
          });
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('[FirestoreData] Advertisements listener note:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('[FirestoreData] Error subscribing to advertisements:', error);
    return () => {};
  }
}

/**
 * حفظ أو تعديل بنر إعلاني في Cloud Firestore
 */
export async function saveAdvertisementToFirestore(ad: AdvertisementItem): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.ADVERTISEMENTS, ad.id);
    const cleaned = cleanDataForFirestore(ad);
    await setDoc(
      ref,
      {
        ...cleaned,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[FirestoreData] ✅ تم حفظ البنر الإعلاني (${ad.id}) في Cloud Firestore`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save advertisement:', error);
    return false;
  }
}

/**
 * حذف بنر إعلاني من Cloud Firestore
 */
export async function deleteAdvertisementFromFirestore(adId: string): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.ADVERTISEMENTS, adId);
    await deleteDoc(ref);
    console.log(`[FirestoreData] 🗑️ تم حذف البنر الإعلاني (${adId}) من Cloud Firestore`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete advertisement:', error);
    return false;
  }
}

/**
 * تبديل حالة تفعيل البنر الإعلاني مباشرة
 */
export async function toggleAdvertisementActiveInFirestore(
  adId: string,
  active: boolean
): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.ADVERTISEMENTS, adId);
    await setDoc(ref, { active, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to toggle advertisement status:', error);
    return false;
  }
}

/**
 * الاستماع اللحظي لمعلومات المطعم الرسمية
 */
export function subscribeToRestaurantInfo(
  onUpdate: (info: RestaurantInfo) => void
): () => void {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.RESTAURANT_INFO, 'official');
    return onSnapshot(
      ref,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as RestaurantInfo);
        }
      },
      (error) => {
        console.warn('[FirestoreData] Restaurant info listener note:', error);
      }
    );
  } catch {
    return () => {};
  }
}

export const DELETED_GALLERY_KEY = 'bokharest_deleted_gallery_ids_v2';

/**
 * الحصول على قائمة معرفات وروابط صور المعرض المحذوفة محلياً
 */
export function getLocalDeletedGalleryIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_GALLERY_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

/**
 * تسجيل معرف أو رابط صورة معرض محذوفة لمنع عودتها نهائياً
 */
export function recordLocalDeletedGalleryId(id: string, url?: string): void {
  try {
    const set = getLocalDeletedGalleryIds();
    if (id) set.add(id);
    if (url) set.add(url);
    localStorage.setItem(DELETED_GALLERY_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

/**
 * إزالة المعرف أو الرابط من قائمة المحذوفات في حال قام المدير بإعادة إضافتها يدوياً
 */
export function unmarkDeletedGalleryId(id: string, url?: string): void {
  try {
    const set = getLocalDeletedGalleryIds();
    if (id) set.delete(id);
    if (url) set.delete(url);
    localStorage.setItem(DELETED_GALLERY_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

/**
 * الاستماع اللحظي لصور المعرض في Cloud Firestore مع حظر تام للصور المحذوفة
 */
export function subscribeToGallery(
  onUpdate: (images: GalleryImage[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const q = query(collection(firestoreDb, COLLECTIONS.GALLERY));
    
    // استماع إضافي لقائمة الصور المحذوفة سحابياً لتحديث الحظر فورياً
    let cloudDeletedIds = new Set<string>();
    const metaRef = doc(firestoreDb, 'system_metadata', 'gallery_status');
    const unsubMeta = onSnapshot(
      metaRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.deletedIds)) {
            cloudDeletedIds = new Set<string>(data.deletedIds);
            // مزامنة مع التخزين المحلي
            const local = getLocalDeletedGalleryIds();
            data.deletedIds.forEach((id: string) => local.add(id));
            try {
              localStorage.setItem(DELETED_GALLERY_KEY, JSON.stringify(Array.from(local)));
            } catch {}
          }
        }
      },
      () => {}
    );

    const unsubGallery = onSnapshot(
      q,
      (snapshot) => {
        const localDeleted = getLocalDeletedGalleryIds();
        const list: GalleryImage[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id || data.id;
          const photoUrl = data.url || data.image || data.localUrl || '';
          const localPhotoUrl = data.localUrl || data.url || data.image || '';

          // إذا تم حذف الصورة سابقاً سواء بالمعرف أو الرابط، نستبعدها فوراً
          if (
            localDeleted.has(docId) ||
            cloudDeletedIds.has(docId) ||
            (photoUrl && (localDeleted.has(photoUrl) || cloudDeletedIds.has(photoUrl)))
          ) {
            return;
          }

          list.push({
            id: docId,
            url: photoUrl,
            localUrl: localPhotoUrl,
            title_ar: data.title_ar || '',
            title_en: data.title_en || '',
            description_ar: data.description_ar || '',
            description_en: data.description_en || '',
            category: data.category || 'ambiance',
            category_ar: data.category_ar || 'أجواء الكافيه',
            category_en: data.category_en || 'Ambiance',
            featured: Boolean(data.featured),
          });
        });

        // استدعاء التحديث دائماً حتى لو كانت القائمة فارغة أو تم حذف كافة الصور
        onUpdate(list);
      },
      (error) => {
        console.warn('[FirestoreData] Gallery listener note:', error);
        if (onError) onError(error);
      }
    );

    return () => {
      unsubGallery();
      unsubMeta();
    };
  } catch (err) {
    console.warn('[FirestoreData] Error setting up gallery listener:', err);
    return () => {};
  }
}

/**
 * حفظ أو تعديل صورة في المعرض في Cloud Firestore
 */
export async function saveGalleryImageToFirestore(image: GalleryImage): Promise<boolean> {
  try {
    // إلغاء حظر الصورة إذا كان المدير يضيفها أو يعدلها
    unmarkDeletedGalleryId(image.id, image.url);

    const ref = doc(firestoreDb, COLLECTIONS.GALLERY, image.id);
    const cleaned = cleanDataForFirestore(image);
    await setDoc(
      ref,
      {
        ...cleaned,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[FirestoreData] ✅ تم حفظ صورة المعرض (${image.id}) في Cloud Firestore`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to save gallery image:', error);
    return false;
  }
}

/**
 * حذف صورة نهائياً من المعرض في Cloud Firestore مع حظر عودتها التلقائية
 */
export async function deleteGalleryImageFromFirestore(imageId: string, imageUrl?: string): Promise<boolean> {
  try {
    // 1. تسجيل الحذف محلياً فوراً
    recordLocalDeletedGalleryId(imageId, imageUrl);

    // جمع كافة المعرفات البديلة الشائعة للصورة (مثل gal-1 و gallery_1 و app_img_gallery_1)
    const idsToDelete = new Set<string>([imageId]);
    if (imageId.startsWith('gal-')) {
      const num = imageId.replace('gal-', '');
      idsToDelete.add(`gallery_${num}`);
      idsToDelete.add(`app_img_gallery_${num}`);
    } else if (imageId.startsWith('gallery_')) {
      const num = imageId.replace('gallery_', '');
      idsToDelete.add(`gal-${num}`);
      idsToDelete.add(`app_img_gallery_${num}`);
    } else if (imageId.startsWith('app_img_gallery_')) {
      const num = imageId.replace('app_img_gallery_', '');
      idsToDelete.add(`gal-${num}`);
      idsToDelete.add(`gallery_${num}`);
    }

    // 2. حذف الوثائق من مجموعة gallery
    const deletePromises: Promise<any>[] = [];
    for (const id of idsToDelete) {
      deletePromises.push(deleteDoc(doc(firestoreDb, COLLECTIONS.GALLERY, id)).catch(() => {}));
    }

    // 3. إذا كان الرابط معروفاً، نحذف أي وثائق أخرى تحمل نفس الرابط في المعرض لتنظيف أي تكرارات
    if (imageUrl) {
      try {
        const snap = await getDocs(collection(firestoreDb, COLLECTIONS.GALLERY));
        snap.forEach((d) => {
          const dData = d.data();
          if (dData.url === imageUrl || dData.image === imageUrl || dData.localUrl === imageUrl) {
            deletePromises.push(deleteDoc(d.ref).catch(() => {}));
          }
        });
      } catch (searchErr) {
        console.warn('[FirestoreData] Search gallery by url notice:', searchErr);
      }
    }

    await Promise.all(deletePromises);

    // 4. تسجيل المعرفات والرابط في قائمة الصور المحذوفة سحابياً لمنع أي سكريبت تهيئة أو ترحيل من إعادتها
    const galleryMetaRef = doc(firestoreDb, 'system_metadata', 'gallery_status');
    const idsToRecord = Array.from(idsToDelete);
    if (imageUrl) idsToRecord.push(imageUrl);

    await setDoc(
      galleryMetaRef,
      {
        initialized: true,
        deletedIds: arrayUnion(...idsToRecord),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});

    console.log(`[FirestoreData] 🗑️ تم حذف صورة المعرض (${imageId}) نهائياً وحظر عودتها في Cloud Firestore`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete gallery image:', error);
    return false;
  }
}




