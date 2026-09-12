import React, { useState } from 'react';
import {
  UploadCloud,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { migrateAllMenuItemsToFirebaseAutoFQ } from '../../services/firebaseStorageService';

interface AutoFQMigrationCardProps {
  onSuccessNotice: (msg: string) => void;
  onPreviewInApp?: () => void;
}

export const AutoFQMigrationCard: React.FC<AutoFQMigrationCardProps> = ({
  onSuccessNotice,
  onPreviewInApp,
}) => {
  const { menuItems, firestoreSyncStatus } = useApp();

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{
    current: number;
    total: number;
    statusText: string;
    percentage: number;
  } | null>(null);

  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    count: number;
    firebaseUrl: string;
  } | null>(null);

  const handleStartAutoFQMigration = async () => {
    if (menuItems.length === 0) {
      alert('لا توجد أصناف في قائمة الطعام لتحسينها.');
      return;
    }

    if (
      !confirm(
        `سيتم الآن ضغط ومعالجة صور جميع الأصناف (${menuItems.length} صنف) بصيغة WebP Auto F/Q (جودة 82% وأعلى أداء) ورفعها على Firebase Storage وتحديث قاعدة بيانات Cloud Firestore فوراً.\n\nهل ترغب في المتابعة؟`
      )
    ) {
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);
    setMigrationProgress({
      current: 0,
      total: menuItems.length,
      statusText: 'بدء تهيئة محرك Auto F/Q ومعالجة الصور...',
      percentage: 5,
    });

    try {
      const res = await migrateAllMenuItemsToFirebaseAutoFQ(
        menuItems,
        (curr, tot, text, percent) => {
          setMigrationProgress({
            current: curr,
            total: tot,
            statusText: text,
            percentage: percent,
          });
        }
      );

      if (res.success) {
        setMigrationResult({
          success: true,
          count: res.updatedCount,
          firebaseUrl: res.firebaseUrl,
        });
        onSuccessNotice(
          `🎉 تم بنجاح نقل وتحديث كافة صور المنيو (${res.updatedCount} صنف) على Firebase بنظام Auto F/Q!`
        );
      } else {
        alert('تعذر استكمال النقل بالكامل، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاتصال بـ Firebase.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#121212] via-[#101010] to-amber-950/20 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base">
                نقل وترقية كافة الصور إلى Firebase بنظام Auto F/Q
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black font-mono">
                WebP @ 82%
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              تحويل الصور إلى صيغة WebP فائقة الخفة والسرعة وحفظها وتعميمها في قاعدة بيانات Firestore لحظياً.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartAutoFQMigration}
          disabled={isMigrating}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-md ${
            isMigrating
              ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-white/10'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/25 active:scale-95'
          }`}
        >
          {isMigrating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>جاري النقل والتحسين...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>بدء النقل الشامل إلى Firebase (Auto F/Q)</span>
            </>
          )}
        </button>
      </div>

      {/* Benefits Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-[11px]">صيغة WebP الحديثة</div>
            <div className="text-[10px] text-neutral-400">توفير حتى 75% من حجم استهلاك الإنترنت</div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-[11px]">مقياس الجودة التلقائي (0.82)</div>
            <div className="text-[10px] text-neutral-400">حفظ النقاء العالي مع إزالة الوزن الزائد</div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-[11px]">تحديث Firestore اللحظي</div>
            <div className="text-[10px] text-neutral-400">ظهور الصور الجديدة على هواتف العملاء فوراً</div>
          </div>
        </div>
      </div>

      {/* Active Progress Bar */}
      {isMigrating && migrationProgress && (
        <div className="bg-black/70 border border-amber-500/40 rounded-xl p-4 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {migrationProgress.statusText}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {migrationProgress.percentage}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
              style={{ width: `${migrationProgress.percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-neutral-400 font-mono pt-1">
            <span>قاعدة البيانات: Cloud Firestore</span>
            <span>الأصناف المعالجة: {migrationProgress.current} من {migrationProgress.total}</span>
          </div>
        </div>
      )}

      {/* Migration Success Result Card */}
      {migrationResult && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-300 text-sm">
                تم بنجاح ربط ونقل جميع الأصناف ({migrationResult.count} صنف) في Firestore
              </h4>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                كافة مستندات المنيو في السحابة أصبحت تستخدم الرابط المحسن WebP Auto F/Q مباشرة.
              </p>
              <div className="font-mono text-[10px] text-emerald-400/90 truncate max-w-md mt-1">
                الرابط: {migrationResult.firebaseUrl}
              </div>
            </div>
          </div>

          {onPreviewInApp && (
            <button
              onClick={onPreviewInApp}
              className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors shrink-0 flex items-center gap-1.5"
            >
              معاينة فورية في التطبيق
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
