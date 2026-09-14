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
} from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { Category, MenuItem, OrderRecord, ReservationRecord, CustomerFeedback, RestaurantInfo, AdvertisementItem, GalleryImage } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, OFFICIAL_RESTAURANT_INFO } from '../data/restaurantData';
import { INITIAL_ADVERTISEMENTS } from '../data/ads';
import { GALLERY_IMAGES } from '../data/galleryData';

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

    // تهيئة صور المعرض (Gallery) إذا كانت فارغة
    const gallerySnapshot = await getDocs(collection(firestoreDb, COLLECTIONS.GALLERY));
    if (gallerySnapshot.empty && GALLERY_IMAGES.length > 0) {
      console.log(`[FirestoreData] جارٍ رفع وتأسيس ${GALLERY_IMAGES.length} صور للمعرض في Cloud Firestore...`);
      const batch = writeBatch(firestoreDb);
      for (const img of GALLERY_IMAGES) {
        const ref = doc(firestoreDb, COLLECTIONS.GALLERY, img.id);
        batch.set(ref, {
          ...cleanDataForFirestore(img),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      console.log(`[FirestoreData] ✅ تم بنجاح نقل صور المعرض إلى Cloud Firestore.`);
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

/**
 * حذف طلب من Cloud Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.ORDERS, orderId);
    await deleteDoc(ref);
    console.log(`[FirestoreData] 🗑️ تم حذف الطلب (${orderId}) من Cloud Firestore`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete order from Firestore:', error);
    return false;
  }
}


/**
 * الاستماع لسجل الطلبات من Firestore
 */
export function subscribeToOrders(
  onUpdate: (orders: OrderRecord[]) => void
): () => void {
  try {
    const q = query(collection(firestoreDb, COLLECTIONS.ORDERS), orderBy('serverTime', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: OrderRecord[] = [];
        snapshot.forEach((d) => {
          orders.push(d.data() as OrderRecord);
        });
        onUpdate(orders);
      },
      (error) => {
        console.warn('[FirestoreData] Orders listener note:', error);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * حفظ حجز طاولة في Cloud Firestore
 */
export async function saveReservationToFirestore(reservation: ReservationRecord): Promise<boolean> {
  try {
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
 * حذف حجز طاولة من Cloud Firestore
 */
export async function deleteReservationFromFirestore(reservationId: string): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.RESERVATIONS, reservationId);
    await deleteDoc(ref);
    console.log(`[FirestoreData] 🗑️ تم حذف حجز الطاولة (${reservationId}) من Cloud Firestore`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete reservation from Firestore:', error);
    return false;
  }
}

/**
 * الاستماع لسجل حجوزات الطاولات من Firestore
 */
export function subscribeToReservations(
  onUpdate: (reservations: ReservationRecord[]) => void
): () => void {
  try {
    const q = query(collection(firestoreDb, COLLECTIONS.RESERVATIONS), orderBy('serverTime', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: ReservationRecord[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ReservationRecord);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('[FirestoreData] Reservations listener note:', error);
      }
    );
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

/**
 * الاستماع اللحظي لصور المعرض في Cloud Firestore
 */
export function subscribeToGallery(
  onUpdate: (images: GalleryImage[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const q = query(collection(firestoreDb, COLLECTIONS.GALLERY));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: GalleryImage[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as GalleryImage);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('[FirestoreData] Gallery listener note:', error);
        if (onError) onError(error);
      }
    );
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
 * حذف صورة من المعرض في Cloud Firestore
 */
export async function deleteGalleryImageFromFirestore(imageId: string): Promise<boolean> {
  try {
    const ref = doc(firestoreDb, COLLECTIONS.GALLERY, imageId);
    await deleteDoc(ref);
    console.log(`[FirestoreData] 🗑️ تم حذف صورة المعرض (${imageId}) من Cloud Firestore`);
    return true;
  } catch (error) {
    console.error('[FirestoreData] Failed to delete gallery image:', error);
    return false;
  }
}




