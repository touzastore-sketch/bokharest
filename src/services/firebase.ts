import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// كتم السجلات التحذيرية التلقائية لحالات تقلب الشبكة أو إعادة الاتصال في الخلفية
try {
  setLogLevel('silent');
} catch {
  // ignore
}

// إعدادات Firebase المشتقة من ملف google-services.json المرفق (Project ID: bo5arestblack)
export const firebaseConfig = {
  apiKey: 'AIzaSyCq0d_UtMgKsQvWQrGkF7ShgTGqR1V984I',
  authDomain: 'bo5arestblack.firebaseapp.com',
  projectId: 'bo5arestblack',
  storageBucket: 'bo5arestblack.firebasestorage.app',
  messagingSenderId: '783909464406',
  appId: '1:783909464406:android:dfc9e420eb8778e96dcef7',
};

// تهيئة تطبيق Firebase
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// تهيئة Cloud Firestore مع دعم التخزين المؤقت المستمر (Persistent Local Cache) والاتصال التلقائي المستقر
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(firebaseApp, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  try {
    firestoreInstance = initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    });
  } catch {
    firestoreInstance = getFirestore(firebaseApp);
  }
}

export const firestoreDb = firestoreInstance;

// تهيئة Firebase Storage لرفع الصور
export const firebaseStorage = getStorage(firebaseApp);


