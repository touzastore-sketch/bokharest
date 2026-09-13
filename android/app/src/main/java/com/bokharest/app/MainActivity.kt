package com.bokharest.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // اختبار الاتصال بـ Cloud Firestore فور فتح الشاشة الرئيسية
        FirestoreTestHelper.testConnection(this)
    }
}
