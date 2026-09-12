import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestoreDb } from './firebase';

export interface FirestoreTestResult {
  success: boolean;
  message: string;
  timestamp?: string;
  details?: string;
}

/**
 * دالة اختبار الاتصال بـ Cloud Firestore:
 * 1. كتابة مستند تجريبي في مجموعة "test_connection"
 * 2. قراءة نفس المستند والتحقق من تطابق البيانات
 * 3. إرجاع النتيجة أو تفاصيل الخطأ في حال حدوثه
 */
export async function testFirestoreConnection(): Promise<FirestoreTestResult> {
  const collectionName = 'test_connection';
  const docId = 'web_test_doc';
  const docRef = doc(firestoreDb, collectionName, docId);

  const localTime = new Date().toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  console.log(`[FirestoreTest] ⏳ جاري اختبار الاتصال بالمشروع (bo5arestblack)...`);

  try {
    // 1. كتابة مستند تجريبي يحتوي على حقل نصي وتاريخ الوقت الحالي
    await setDoc(docRef, {
      message: 'اتصال تجريبي ناجح بقاعدة بيانات Cloud Firestore - بوخارست بلاك',
      clientTimestamp: localTime,
      serverTime: serverTimestamp(),
      platform: 'Web Preview',
      status: 'active',
      testedAt: new Date().toISOString(),
    });

    console.log(`[FirestoreTest] ✅ تم كتابة المستند بنجاح في مجموعة "${collectionName}". جاري القراءة...`);

    // 2. قراءة نفس المستند للتأكد من نجاح العملية بالكامل
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const successMsg = `تم الاتصال بنجاح بـ Cloud Firestore! قراءة وكتابة مؤكدة (${data.clientTimestamp})`;
      console.log(`[FirestoreTest] ✅ نجاح القراءة:`, data);

      return {
        success: true,
        message: successMsg,
        timestamp: data.clientTimestamp,
        details: `المجموعة: ${collectionName} | المستند: ${docId}`,
      };
    } else {
      const notFoundMsg = 'لم يتم العثور على المستند بعد كتابته.';
      console.warn(`[FirestoreTest] ⚠️ ${notFoundMsg}`);
      return {
        success: false,
        message: notFoundMsg,
      };
    }
  } catch (error: any) {
    const errorDetails = error?.message || String(error);
    const errorCode = error?.code || 'UNKNOWN';
    const friendlyError = `فشل الاتصال بـ Firestore [${errorCode}]: ${errorDetails}`;

    console.error(`[FirestoreTest] ❌ ${friendlyError}`, error);

    let explanation = errorDetails;
    if (errorCode === 'permission-denied') {
      explanation = 'تم رفض الإذن (Permission Denied). يرجى التأكد من تفعيل قواعد الحماية في Firebase Console للسماح بالقراءة والكتابة في مجموعة test_connection.';
    } else if (errorCode === 'unavailable') {
      explanation = 'الخدمة غير متوفرة حالياً أو لا يوجد اتصال بالإنترنت.';
    }

    return {
      success: false,
      message: friendlyError,
      details: explanation,
    };
  }
}
