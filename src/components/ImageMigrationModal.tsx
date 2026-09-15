import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Layers,
  Database,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ImageMigrationModal: React.FC = () => {
  const {
    isMigrationModalOpen,
    isMigratingAppImages,
    migrationProgress,
    migrationResult,
    closeMigrationModal,
    executeImageMigration,
    openImageUploadCenter,
  } = useApp();

  if (!isMigrationModalOpen) return null;

  const percent = migrationProgress?.percent || 0;
  const isFinished = !!migrationResult;
  const isSuccess = migrationResult?.success;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-[#141414] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-right text-white"
          dir="rtl"
        >
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button (only when not actively migrating) */}
          {!isMigratingAppImages && (
            <button
              onClick={closeMigrationModal}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header Icon & Title */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
                {isFinished ? (
                  isSuccess ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                  )
                ) : (
                  <UploadCloud className="w-8 h-8 text-amber-400 animate-pulse" />
                )}
              </div>
              {isMigratingAppImages && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif-luxury text-white">
                {isFinished
                  ? isSuccess
                    ? 'اكتمل نقل كافة الصور إلى Cloudinary بنجاح!'
                    : 'تعذر استكمال النقل'
                  : 'جاري نقل وتحديث صور التطبيق إلى Cloudinary (f_auto, q_auto)'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                {isFinished
                  ? isSuccess
                    ? 'تم حفظ كافة روابط الصور المحسنة (f_auto, q_auto) وتعميمها على سحابة Cloud Firestore وبوخارست بلاك.'
                    : 'حدث تعذر أثناء مزامنة بعض الصور، يمكنك إعادة المحاولة الآن.'
                  : 'ترحيل سريع لصور قائمة الطعام، البانرات الإعلانية، وصور المعرض إلى Cloudinary CDN.'}
              </p>
            </div>
          </div>

          {/* Active Migration Progress State */}
          {isMigratingAppImages && (
            <div className="space-y-5 my-4 bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-5">
              {/* Progress Bar & Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-400">{percent}%</span>
                  <span className="text-neutral-300">
                    {migrationProgress?.current || 0} من {migrationProgress?.total || 13}
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${percent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
                  </motion.div>
                </div>
              </div>

              {/* Current Status Item */}
              <div className="flex items-center gap-3 bg-neutral-900/60 rounded-xl p-3 border border-white/5">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-neutral-400">الإجراء الحالي:</p>
                  <p className="text-xs font-bold text-neutral-200 truncate mt-0.5">
                    {migrationProgress?.itemName || 'بدء فحص وتجهيز الملفات...'}
                  </p>
                </div>
              </div>

              {/* Live Info Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-[10px] text-neutral-400">قائمة الطعام</p>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">مزامنة فورية</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-[10px] text-neutral-400">معرض الصور</p>
                  <p className="text-xs font-bold text-amber-300 mt-0.5">9 صور</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-[10px] text-neutral-400">قاعدة البيانات</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">Firestore</p>
                </div>
              </div>
            </div>
          )}

          {/* Completed Success State */}
          {isFinished && isSuccess && (
            <div className="space-y-4 my-4">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>تم حفظ وتأكيد كافة صور التطبيق بنجاح</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {migrationResult.message}
                </p>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-neutral-400 text-xs mb-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>الصور المحفوظة</span>
                  </div>
                  <span className="text-xl font-bold font-serif-luxury text-amber-400">
                    {migrationResult.totalMigrated}
                  </span>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-neutral-400 text-xs mb-1">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>أصناف تم تحديثها</span>
                  </div>
                  <span className="text-xl font-bold font-serif-luxury text-emerald-400">
                    {migrationResult.menuItemsUpdated}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {isFinished && !isSuccess && (
            <div className="my-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 text-center space-y-2">
              <p className="text-xs text-rose-300">{migrationResult.message}</p>
              <p className="text-[11px] text-neutral-400">
                يرجى التحقق من اتصال الشبكة ثم إعادة المحاولة.
              </p>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="mt-6 flex items-center gap-3">
            {isFinished ? (
              <>
                <button
                  type="button"
                  onClick={closeMigrationModal}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer text-center"
                >
                  تم، إغلاق النافذة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMigrationModal();
                    openImageUploadCenter();
                  }}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>مركز الرفع المتقدم</span>
                </button>
              </>
            ) : isMigratingAppImages ? (
              <div className="w-full py-2.5 text-center text-xs text-neutral-400 italic">
                يرجى الانتظار ثوانٍ معدودة حتى تكتمل العملية...
              </div>
            ) : (
              <button
                type="button"
                onClick={executeImageMigration}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                إعادة المحاولة الآن
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
