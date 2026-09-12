import React, { useEffect, useState } from 'react';
import { testFirestoreConnection, FirestoreTestResult } from '../services/firestoreTest';
import { CheckCircle2, AlertTriangle, RefreshCw, X, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FirestoreConnectionToast: React.FC = () => {
  const [result, setResult] = useState<FirestoreTestResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const runTest = async () => {
    setIsLoading(true);
    setIsVisible(true);
    try {
      const res = await testFirestoreConnection();
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        message: 'خطأ غير متوقع أثناء فحص الاتصال',
        details: err?.message || String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // تشغيل الاختبار تلقائياً عند فتح الشاشة الرئيسية
    runTest();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
        >
          <div
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
              isLoading
                ? 'bg-neutral-900/95 border-amber-500/30 text-amber-200'
                : result?.success
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isLoading
                    ? 'bg-amber-500/20 text-amber-300'
                    : result?.success
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : result?.success ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-3.5 h-3.5 opacity-80" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {isLoading
                      ? 'جاري فحص اتصال Cloud Firestore...'
                      : result?.success
                      ? 'اتصال Cloud Firestore ناجح'
                      : 'تنبيه اتصال Cloud Firestore'}
                  </h4>
                </div>

                <p className="text-sm font-medium leading-snug">
                  {isLoading
                    ? 'يتم كتابة وقراءة مستند تجريبي في مجموعة test_connection...'
                    : result?.message}
                </p>

                {result?.details && (
                  <p className="text-xs mt-1.5 opacity-80 leading-relaxed font-mono bg-black/30 p-2 rounded-lg border border-white/5 break-words">
                    {result.details}
                  </p>
                )}

                {!isLoading && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={runTest}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors border border-white/15"
                    >
                      <RefreshCw className="w-3 h-3" />
                      إعادة الفحص
                    </button>
                    <button
                      onClick={() => setIsVisible(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                    >
                      إغلاق
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors shrink-0"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
