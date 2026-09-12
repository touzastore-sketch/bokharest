package com.bokharest.app

import android.content.Context
import android.util.Log
import android.widget.Toast
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Date

/**
 * فئة اختبارية للتحقق من الاتصال بـ Cloud Firestore
 */
object FirestoreTestHelper {
    private const val TAG = "FirestoreTest"

    /**
     * تنفيذ اختبار الكتابة ثم القراءة من مجموعة test_connection
     * وعرض النتائج عبر Logcat ورسائل Toast
     */
    fun testConnection(context: Context) {
        val db = FirebaseFirestore.getInstance()
        val testDocRef = db.collection("test_connection").document("android_test_doc")

        val testData = hashMapOf(
            "message" to "اتصال تجريبي ناجح من تطبيق أندرويد بوخارست بلاك",
            "timestamp" to Timestamp(Date()),
            "platform" to "Android",
            "status" to "connected"
        )

        Log.d(TAG, "⏳ جاري بدء اختبار الاتصال بـ Cloud Firestore...")

        // 1. كتابة مستند تجريبي في مجموعة test_connection
        testDocRef.set(testData)
            .addOnSuccessListener {
                Log.d(TAG, "✅ تمت كتابة المستند التجريبي بنجاح في test_connection.")

                // 2. قراءة نفس المستند للتحقق
                testDocRef.get()
                    .addOnSuccessListener { document ->
                        if (document != null && document.exists()) {
                            val msg = document.getString("message") ?: "لا توجد رسالة"
                            val time = document.getTimestamp("timestamp")?.toDate()?.toString() ?: "غير محدد"
                            val successLog = "✅ تم قراءة المستند بنجاح!\n- الرسالة: $msg\n- الوقت: $time"
                            
                            Log.d(TAG, successLog)
                            Toast.makeText(
                                context,
                                "✅ نجح الاتصال بـ Firestore!\nتمت الكتابة والقراءة بنجاح.",
                                Toast.LENGTH_LONG
                            ).show()
                        } else {
                            val notFoundLog = "⚠️ تعذر العثور على المستند بعد عملية الكتابة."
                            Log.w(TAG, notFoundLog)
                            Toast.makeText(context, notFoundLog, Toast.LENGTH_LONG).show()
                        }
                    }
                    .addOnFailureListener { e ->
                        val readError = "❌ فشل قراءة المستند من Firestore: ${e.localizedMessage}"
                        Log.e(TAG, readError, e)
                        Toast.makeText(context, readError, Toast.LENGTH_LONG).show()
                    }
            }
            .addOnFailureListener { e ->
                val writeError = "❌ فشل الاتصال بـ Firestore عند الكتابة: ${e.localizedMessage}"
                Log.e(TAG, writeError, e)
                Toast.makeText(context, writeError, Toast.LENGTH_LONG).show()
            }
    }
}
