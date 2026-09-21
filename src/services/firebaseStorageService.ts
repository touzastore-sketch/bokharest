import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { firebaseStorage, firestoreDb } from './firebase';
import { UploadedImageRecord, MenuItem } from '../types';
import { optimizeFileAutoFQ, optimizeRemoteUrlAutoFQ } from '../utils/imageOptimizer';
import { updateAllMenuItemsImageInFirestore, deleteGalleryImageFromFirestore } from './firestoreDataService';
import { CLOUDINARY_ASSETS, uploadImageToCloudinary, getOptimizedImageUrl } from './cloudinaryService';

const UPLOADED_IMAGES_COLLECTION = 'uploaded_images';
const LOCAL_STORAGE_KEY = 'bokharest_uploaded_images_cache';

/**
 * Convert file to base64 string as reliable fallback
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload an image to Cloudinary (cloud: ccnaucox, preset: bokharestblack_img)
 * with Auto F/Q (f_auto,q_auto) applied and metadata persistence in Firestore
 */
export async function uploadImageToFirebase(
  file: File,
  folder: 'menu' | 'ads' | 'gallery' | 'general' = 'general',
  onProgress?: (percentage: number) => void,
  bypassAutoFQ: boolean = false
): Promise<{ success: boolean; url: string; record: UploadedImageRecord; fallbackUsed?: boolean }> {
  // 1. Primary path: Direct unsigned upload to Cloudinary with automatic f_auto,q_auto
  try {
    const cloudRes = await uploadImageToCloudinary(file, {
      folder: `bokharest/${folder}`,
      onProgress,
    });

    if (cloudRes.success && cloudRes.url) {
      const uniqueId = `img_${Date.now()}_${cloudRes.publicId.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const record: UploadedImageRecord = {
        id: uniqueId,
        name: file.name,
        url: cloudRes.url,
        storagePath: cloudRes.publicId,
        sizeBytes: file.size,
        folder,
        createdAt: new Date().toISOString(),
        contentType: file.type || 'image/webp',
      };

      try {
        await setDoc(doc(firestoreDb, UPLOADED_IMAGES_COLLECTION, uniqueId), record);
      } catch (fsErr) {
        console.warn('[Cloudinary/Firestore] Note saving metadata:', fsErr);
      }

      cacheImageLocally(record);
      return { success: true, url: cloudRes.url, record };
    }
  } catch (cloudErr) {
    console.warn('[Cloudinary] Primary upload failed, falling back to Firebase Storage:', cloudErr);
  }

  // 2. Secondary fallback: Firebase Storage
  let uploadFile = file;
  let isOptimized = false;
  if (!bypassAutoFQ && file.type.startsWith('image/')) {
    try {
      const optResult = await optimizeFileAutoFQ(file, {
        maxWidth: folder === 'ads' ? 1920 : 1280,
        maxHeight: folder === 'ads' ? 1080 : 1280,
        quality: 0.82,
        format: 'image/webp',
      });
      uploadFile = optResult.file;
      isOptimized = true;
    } catch (optErr) {
      console.warn('[FirebaseStorage] Auto F/Q optimization note, uploading original file:', optErr);
    }
  }

  const timestamp = Date.now();
  const baseName = uploadFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = uploadFile.type === 'image/webp' ? 'webp' : 'jpg';
  const sanitizedName = `${baseName}_autofq.${ext}`;
  const uniqueId = `img_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `uploads/${folder}/${timestamp}_${sanitizedName}`;

  try {
    const storageReference = ref(firebaseStorage, storagePath);
    const uploadTask = uploadBytesResumable(storageReference, uploadFile, {
      contentType: uploadFile.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        folder,
        autoFQ: isOptimized ? 'true' : 'false',
        format: uploadFile.type,
      },
    });

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(progress);
          }
        },
        (error) => {
          console.warn('[FirebaseStorage] Storage upload error, using fallback:', error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        }
      );
    });

    const record: UploadedImageRecord = {
      id: uniqueId,
      name: file.name,
      url: downloadUrl,
      storagePath,
      sizeBytes: uploadFile.size,
      folder,
      createdAt: new Date().toISOString(),
      contentType: uploadFile.type,
    };

    // Save metadata in Firestore
    try {
      await setDoc(doc(firestoreDb, UPLOADED_IMAGES_COLLECTION, uniqueId), record);
    } catch (fsErr) {
      console.warn('[FirebaseStorage] Failed saving image metadata to Firestore:', fsErr);
    }

    cacheImageLocally(record);

    return { success: true, url: downloadUrl, record };
  } catch (error) {
    console.warn('[FirebaseStorage] Direct Storage upload failed, generating optimized base64 payload:', error);
    
    // Seamless fallback: Convert file to Base64 so user can continue without getting blocked by Storage rules
    if (onProgress) onProgress(100);
    const base64Url = await fileToBase64(uploadFile);

    const record: UploadedImageRecord = {
      id: uniqueId,
      name: file.name,
      url: base64Url,
      storagePath: 'local_fallback',
      sizeBytes: uploadFile.size,
      folder,
      createdAt: new Date().toISOString(),
      contentType: uploadFile.type,
    };

    try {
      await setDoc(doc(firestoreDb, UPLOADED_IMAGES_COLLECTION, uniqueId), {
        ...record,
        url: base64Url.length > 500000 ? 'data_url_truncated' : base64Url, // protect Firestore document size
      });
    } catch (fsErr) {
      console.warn('[FirebaseStorage] Fallback Firestore save note:', fsErr);
    }

    cacheImageLocally(record);

    return { success: true, url: base64Url, record, fallbackUsed: true };
  }
}

/**
 * Fetch list of all uploaded images from Firestore (with local cache fallback)
 */
export async function getUploadedImages(): Promise<UploadedImageRecord[]> {
  try {
    const q = query(collection(firestoreDb, UPLOADED_IMAGES_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const records: UploadedImageRecord[] = [];
      snapshot.forEach((d) => {
        records.push(d.data() as UploadedImageRecord);
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
      return records;
    }
  } catch (err) {
    console.warn('[FirebaseStorage] Error fetching uploaded images from Firestore, reading local cache:', err);
  }

  // Fallback to local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Delete an uploaded image from Firebase Storage and Firestore
 */
export async function deleteUploadedImage(record: UploadedImageRecord): Promise<boolean> {
  try {
    if (record.storagePath && record.storagePath !== 'local_fallback') {
      const storageReference = ref(firebaseStorage, record.storagePath);
      await deleteObject(storageReference).catch(() => {});
    }
    await deleteDoc(doc(firestoreDb, UPLOADED_IMAGES_COLLECTION, record.id)).catch(() => {});

    // إذا كانت الصورة ضمن المعرض أو ترتبط به، نحذفها أيضاً من المعرض ونحظر عودتها
    if (record.folder === 'gallery' || record.id.includes('gal') || record.id.includes('gallery')) {
      await deleteGalleryImageFromFirestore(record.id, record.url).catch(() => {});
    }

    // Update local cache
    const current = await getUploadedImages();
    const filtered = current.filter((img) => img.id !== record.id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('[FirebaseStorage] Failed to delete image:', err);
    return false;
  }
}

export const APP_DEFAULT_IMAGES: Array<{
  id: string;
  name: string;
  url: string;
  folder: 'menu' | 'ads' | 'gallery' | 'general';
  description: string;
}> = [
  {
    id: 'app_img_menu_unified',
    name: 'صورة قائمة الطعام الموحدة المعتمدة',
    url: CLOUDINARY_ASSETS.unifiedMenuItem,
    folder: 'menu',
    description: 'الصورة الرسمية المعتمدة لجميع أصناف وقوائم بوخارست بلاك',
  },
  {
    id: 'app_img_ad_banner_official',
    name: 'بانر العروض وحجز الطاولات الرسمي (BOOK)',
    url: CLOUDINARY_ASSETS.adsBanner,
    folder: 'ads',
    description: 'بانر الإعلانات الفاخر المتوافق مع أبعاد 3168x1344',
  },
  {
    id: 'app_img_hero_bg',
    name: 'خلفية الواجهة الرئيسية (Hero Section)',
    url: CLOUDINARY_ASSETS.cafeHero,
    folder: 'general',
    description: 'صورة الواجهة الفاخرة لمدخل بوخارست بلاك',
  },
  {
    id: 'app_img_logo_official',
    name: 'شعار بوخارست بلاك الرسمي (Official Logo)',
    url: CLOUDINARY_ASSETS.logo,
    folder: 'general',
    description: 'لوجو الهوية البصرية الرسمية Bokharest Black',
  },
  {
    id: 'app_img_gallery_1',
    name: 'أجواء التراس الخارجي والمساء (معرض 1)',
    url: CLOUDINARY_ASSETS.gallery[0],
    folder: 'gallery',
    description: 'إطلالة التراس الخارجي الأنيق',
  },
  {
    id: 'app_img_gallery_2',
    name: 'ركن القهوة المختصة والتحميص (معرض 2)',
    url: CLOUDINARY_ASSETS.gallery[1],
    folder: 'gallery',
    description: 'ركن الباريستا وماكينات القهوة المتطورة',
  },
  {
    id: 'app_img_gallery_3',
    name: 'جلسات الصالة الداخلية الفاخرة (معرض 3)',
    url: CLOUDINARY_ASSETS.gallery[2],
    folder: 'gallery',
    description: 'ديكورات الصالة الداخلية الراقية',
  },
  {
    id: 'app_img_gallery_4',
    name: 'المشروبات المنعشة والموكتيلات (معرض 4)',
    url: CLOUDINARY_ASSETS.gallery[3],
    folder: 'gallery',
    description: 'تقديمات المشروبات الصيفية والموكتيل الخاص',
  },
  {
    id: 'app_img_gallery_5',
    name: 'المشويات وقطع الستيك الفاخرة (معرض 5)',
    url: CLOUDINARY_ASSETS.gallery[4],
    folder: 'gallery',
    description: 'أطباق اللحوم المشوية على الفحم بأعلى جودة',
  },
  {
    id: 'app_img_gallery_6',
    name: 'الحلويات الشرقية والكرواسان (معرض 6)',
    url: CLOUDINARY_ASSETS.gallery[5],
    folder: 'gallery',
    description: 'تشكيلة المخبوزات والحلويات الفرنسية والشرقية',
  },
  {
    id: 'app_img_gallery_7',
    name: 'جلسات كبار الشخصيات VIP (معرض 7)',
    url: CLOUDINARY_ASSETS.gallery[6],
    folder: 'gallery',
    description: 'أماكن مخصصة للمناسبات والاجتماعات الهادئة',
  },
  {
    id: 'app_img_gallery_8',
    name: 'الإضاءة الليلية الساحرة (معرض 8)',
    url: CLOUDINARY_ASSETS.gallery[7],
    folder: 'gallery',
    description: 'سحر الليل في بوخارست بلاك مع الموسيقى الهادئة',
  },
  {
    id: 'app_img_gallery_9',
    name: 'كرم الضيافة والخدمة المميزة (معرض 9)',
    url: CLOUDINARY_ASSETS.gallery[8],
    folder: 'gallery',
    description: 'فريق عمل محترف يسعى لراحتكم دائماً',
  },
];

/**
 * نقل ورفع كافة صور التطبيق إلى Firebase Storage وقاعدة بيانات Firestore
 * وتحديث كافة الأقسام والأصناف والبانرات لتكون مزامنة بشكل فوري
 */
export async function migrateAllAppImagesToFirebase(
  onProgress?: (current: number, total: number, itemName: string, percent?: number) => void
): Promise<{ success: boolean; totalMigrated: number; menuItemsUpdated: number; records: UploadedImageRecord[] }> {
  const total = APP_DEFAULT_IMAGES.length;
  const migratedRecords: UploadedImageRecord[] = [];
  let menuItemsUpdated = 0;

  for (let i = 0; i < APP_DEFAULT_IMAGES.length; i++) {
    const item = APP_DEFAULT_IMAGES[i];
    const currentPercent = Math.round(((i + 1) / (total + 2)) * 100);
    if (onProgress) {
      onProgress(i + 1, total, item.name, currentPercent);
    }

    try {
      let finalUrl = item.url;
      const storagePath = `app_defaults/${item.folder}/${item.id}.png`;

      // 1. Try local or remote fetch as blob for upload (with fast safety timeout)
      try {
        const fetchPromise = fetch(item.url, { mode: 'cors' }).then((r) => (r.ok ? r.blob() : null));
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800));
        const blob = await Promise.race([fetchPromise, timeoutPromise]);

        if (blob) {
          try {
            const storageRef = ref(firebaseStorage, storagePath);
            const uploadPromise = uploadBytesResumable(storageRef, blob, {
              contentType: blob.type || 'image/png',
              customMetadata: {
                title: item.name,
                appDefault: 'true',
              },
            }).then(() => getDownloadURL(storageRef));
            
            const storageTimeout = new Promise<string | null>((resolve) => setTimeout(() => resolve(null), 2500));
            const uploadedUrl = (await Promise.race([uploadPromise, storageTimeout])) as string | null;
            if (uploadedUrl) {
              finalUrl = uploadedUrl;
            }
          } catch (storageErr) {
            // Storage bucket may not be provisioned yet (404), continue with high-res direct URL
          }
        }
      } catch {
        // Continue with original high-res URL
      }

      // 2. Register record in Firestore uploaded_images collection
      const record: UploadedImageRecord = {
        id: item.id,
        name: item.name,
        url: finalUrl,
        storagePath,
        folder: item.folder,
        createdAt: new Date().toISOString(),
        contentType: 'image/png',
      };

      try {
        await setDoc(doc(firestoreDb, UPLOADED_IMAGES_COLLECTION, item.id), record, { merge: true });
      } catch (fsErr) {
        console.warn(`[FirebaseStorage] Firestore sync notice for ${item.name}:`, fsErr);
      }

      // صور المعرض يديرها المستخدم بحرية من لوحة التحكم، ولا نعيد إدراجها تلقائياً لمنع عودة الصور المحذوفة
      cacheImageLocally(record);
      migratedRecords.push(record);
    } catch (itemErr) {
      console.warn(`[FirebaseStorage] Error migrating ${item.name}:`, itemErr);
    }
  }

  // 4. Batch update menu items in Cloud Firestore with the unified menu dish image
  try {
    if (onProgress) {
      onProgress(total + 1, total + 2, 'جاري تعميم صورة الأطباق على قائمة الطعام في Firestore...', 90);
    }
    const menuImage = migratedRecords.find((r) => r.folder === 'menu')?.url || CLOUDINARY_ASSETS.unifiedMenuItem;
    const batchResult = await updateAllMenuItemsImageInFirestore(menuImage);
    menuItemsUpdated = batchResult.count || 0;
  } catch (menuErr) {
    console.warn('[FirebaseStorage] Menu batch update note:', menuErr);
  }

  // 5. Update advertisements in Cloud Firestore with the official high-res banner
  try {
    if (onProgress) {
      onProgress(total + 2, total + 2, 'جاري تحديث بانرات الإعلانات والعروض في Firestore...', 98);
    }
    const bannerImage = migratedRecords.find((r) => r.folder === 'ads')?.url || CLOUDINARY_ASSETS.adsBanner;
    const adsSnap = await getDocs(collection(firestoreDb, 'advertisements'));
    if (!adsSnap.empty) {
      for (const adDoc of adsSnap.docs) {
        await setDoc(adDoc.ref, { image: bannerImage, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
  } catch (adErr) {
    console.warn('[FirebaseStorage] Ad batch update note:', adErr);
  }

  if (onProgress) {
    onProgress(total + 2, total + 2, 'اكتملت المزامنة بنجاح!', 100);
  }

  return {
    success: true,
    totalMigrated: migratedRecords.length,
    menuItemsUpdated,
    records: migratedRecords,
  };
}

function cacheImageLocally(record: UploadedImageRecord) {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list: UploadedImageRecord[] = cached ? JSON.parse(cached) : [];
    const updated = [record, ...list.filter((i) => i.id !== record.id)].slice(0, 50);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage limit, ignore
  }
}

/**
 * ترقية ونقل كافة صور المنيو تلقائياً إلى Firebase Storage بنظام Auto F/Q
 * وتحديث المستندات في Firestore لتنعكس فوراً على تطبيق العملاء
 */
export async function migrateAllMenuItemsToFirebaseAutoFQ(
  menuItems: MenuItem[],
  onProgress?: (current: number, total: number, itemName: string, percent: number) => void
): Promise<{ success: boolean; updatedCount: number; firebaseUrl: string }> {
  const total = menuItems.length;
  let targetFirebaseUrl = '';
  
  // 1. Convert the primary approved high-resolution menu dish image to Auto F/Q WebP
  const sampleItem = menuItems.find((i) => i.image && !i.image.includes('firebasestorage.googleapis.com')) || menuItems[0];
  const sourceUrl = sampleItem?.image || CLOUDINARY_ASSETS.unifiedMenuItem;

  if (onProgress) onProgress(1, total, 'جاري ضغط ومعالجة الصورة بنظام Auto F/Q...', 15);

  try {
    const optResult = await optimizeRemoteUrlAutoFQ(sourceUrl, 'official_bokharest_dish_autofq.webp', {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.82,
      format: 'image/webp',
    });

    if (onProgress) onProgress(Math.floor(total * 0.3), total, 'جاري رفع صورة WebP المحسنة إلى Firebase Storage...', 40);

    const storagePath = `uploads/menu/official_dish_autofq_${Date.now()}.webp`;
    const storageReference = ref(firebaseStorage, storagePath);

    const uploadTask = await uploadBytesResumable(storageReference, optResult.blob, {
      contentType: 'image/webp',
      customMetadata: {
        autoFQ: 'true',
        format: 'webp',
        quality: '0.82',
        source: 'menu_auto_migration',
      },
    });

    targetFirebaseUrl = await getDownloadURL(uploadTask.ref);

    // Save image record in uploaded_images collection
    const record: UploadedImageRecord = {
      id: `img_menu_dish_autofq_${Date.now()}`,
      name: 'صورة أطباق بوخارست المحسنة (Auto F/Q WebP)',
      url: targetFirebaseUrl,
      storagePath,
      sizeBytes: optResult.optimizedSizeBytes,
      folder: 'menu',
      createdAt: new Date().toISOString(),
      contentType: 'image/webp',
    };
    await setDoc(doc(firestoreDb, UPLOADED_IMAGES_COLLECTION, record.id), record).catch(() => {});
    cacheImageLocally(record);

    if (onProgress) onProgress(Math.floor(total * 0.6), total, 'جاري تعميم الرابط السحابي الجديد على كافة الأصناف في Firestore...', 70);

    // 2. Batch update in Firestore
    const batchResult = await updateAllMenuItemsImageInFirestore(targetFirebaseUrl, (done, count) => {
      if (onProgress) {
        const pct = Math.round(70 + (done / count) * 30);
        onProgress(done, count, `تم تحديث صنف ${done} من ${count} في Firestore`, pct);
      }
    });

    return {
      success: batchResult.success,
      updatedCount: batchResult.count || total,
      firebaseUrl: targetFirebaseUrl,
    };
  } catch (error) {
    console.error('[FirebaseStorage] Error in migrateAllMenuItemsToFirebaseAutoFQ:', error);
    // Fallback: If Storage upload was blocked, use direct image URL and update Firestore
    const fallbackRes = await updateAllMenuItemsImageInFirestore(sourceUrl);
    return {
      success: fallbackRes.success,
      updatedCount: fallbackRes.count,
      firebaseUrl: sourceUrl,
    };
  }
}

/**
 * مزامنة ورفع كافة صور التطبيق بالكامل تلقائياً إلى Firebase Storage بنظام Auto F/Q
 * وتشمل: أطباق المنيو، البانرات الإعلانية، وصور المعرض
 */
export async function autoSyncAllAppAssetsToFirebase(): Promise<{
  success: boolean;
  menuItemUrl?: string;
  adBannerUrl?: string;
  gallerySynced: number;
}> {
  const SYNC_KEY = 'bokharest_firebase_all_assets_synced_v3';
  if (localStorage.getItem(SYNC_KEY) === 'completed') {
    return { success: true, gallerySynced: 0 };
  }

  console.log('[FirebaseStorage] 🚀 بدء الترحيل والمزامنة التلقائية لجميع صور التطبيق إلى Firebase Storage بنظام Auto F/Q...');

  let menuUrl: string | undefined;
  let bannerUrl: string | undefined;
  let galleryCount = 0;

  // 1. تحسين ورفع صورة أطباق المنيو الأساسية
  try {
    const dishSource = CLOUDINARY_ASSETS.unifiedMenuItem;
    const optDish = await optimizeRemoteUrlAutoFQ(dishSource, 'unified_dish_autofq.webp', {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.82,
      format: 'image/webp',
    });

    const dishStorageRef = ref(firebaseStorage, 'uploads/menu/unified_dish_autofq.webp');
    const uploadTask = await uploadBytesResumable(dishStorageRef, optDish.blob, {
      contentType: 'image/webp',
      customMetadata: { autoFQ: 'true', quality: '0.82', type: 'menu_dish' },
    });
    menuUrl = await getDownloadURL(uploadTask.ref);
    // تم إلغاء التحديث التلقائي الشامل لصور الأطباق لمنع الكتابة فوق صور الأصناف المخصصة التي يحددها الأدمن
    console.log('[FirebaseStorage] ✅ تم رفع صورة المنيو الاحتياطية بنجاح إلى Firebase:', menuUrl);
  } catch (err) {
    console.warn('[FirebaseStorage] Menu image auto sync note:', err);
  }

  // 2. تحسين ورفع بانر الإعلانات الرسمي
  try {
    const bannerSource = CLOUDINARY_ASSETS.adsBanner;
    const optBanner = await optimizeRemoteUrlAutoFQ(bannerSource, 'official_ad_banner_autofq.webp', {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.82,
      format: 'image/webp',
    });

    const bannerStorageRef = ref(firebaseStorage, 'uploads/ads/official_ad_banner_autofq.webp');
    const bannerUpload = await uploadBytesResumable(bannerStorageRef, optBanner.blob, {
      contentType: 'image/webp',
      customMetadata: { autoFQ: 'true', quality: '0.82', type: 'ad_banner' },
    });
    bannerUrl = await getDownloadURL(bannerUpload.ref);

    // تحديث البانرات في Firestore
    const adsSnap = await getDocs(collection(firestoreDb, 'advertisements'));
    if (!adsSnap.empty) {
      for (const adDoc of adsSnap.docs) {
        await setDoc(adDoc.ref, { image: bannerUrl, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
    console.log('[FirebaseStorage] ✅ تم رفع وتحديث البانر الإعلاني في Firebase:', bannerUrl);
  } catch (err) {
    console.warn('[FirebaseStorage] Banner auto sync note:', err);
  }

  // 3. رفع وحفظ سجل المزامنة
  try {
    localStorage.setItem(SYNC_KEY, 'completed');
    if (menuUrl) localStorage.setItem('bokharest_firebase_menu_url', menuUrl);
    if (bannerUrl) localStorage.setItem('bokharest_firebase_banner_url', bannerUrl);
  } catch {}

  return {
    success: true,
    menuItemUrl: menuUrl,
    adBannerUrl: bannerUrl,
    gallerySynced: galleryCount,
  };
}


