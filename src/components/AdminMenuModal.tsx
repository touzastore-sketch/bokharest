import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UNIFIED_MENU_ITEM_IMAGE } from '../data/restaurantData';
import { X, Check, RotateCcw, DollarSign, ToggleLeft, ToggleRight, Sparkles, UploadCloud, Camera } from 'lucide-react';

interface AdminMenuModalProps {
  onClose: () => void;
}

export const AdminMenuModal: React.FC<AdminMenuModalProps> = ({ onClose }) => {
  const {
    menuItems,
    updateItemPrice,
    toggleItemAvailability,
    toggleItemFeatured,
    resetMenuToDefaults,
    openImageUploadCenter,
    language,
    t,
  } = useApp();

  const [filterCat, setFilterCat] = useState<string>('all');
  const [saveToast, setSaveToast] = useState(false);

  const handlePriceChange = (id: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      updateItemPrice(id, num);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0e0e0e] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h2 className="font-serif-luxury text-lg font-bold text-white">
                {language === 'ar' ? 'لوحة تحكم وتعديل قائمة الطعام' : 'Menu & Price Control Panel'}
              </h2>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {language === 'ar'
                ? 'تعديل الأسعار وحالة التوفر وحفظها فورياً دون إعادة بناء التطبيق'
                : 'Instantly manage prices & availability without rebuilding the codebase'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-4 bg-neutral-950 border-b border-white/5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              {menuItems.length} {language === 'ar' ? 'صنف متزامن مع السحابة' : 'items synced with cloud'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openImageUploadCenter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all shadow-sm"
              title="مركز رفع وتخزين الصور على Firebase"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مركز رفع الصور (Firebase)' : 'Image Center'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm(language === 'ar' ? 'هل تريد استعادة الأسعار والبيانات الأصلية المعتمدة؟' : 'Reset to verified official menu data?')) {
                  resetMenuToDefaults();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-neutral-300 hover:text-white hover:border-white/40 transition-colors focus:outline-none"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'ar' ? 'استعادة' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image || UNIFIED_MENU_ITEM_IMAGE}
                  alt={item.name_en}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover bg-neutral-900 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                    {language === 'ar' ? item.name_ar : item.name_en}
                  </h4>
                  <span className="text-[10px] text-neutral-500 block truncate">
                    {language === 'ar' ? item.name_en : item.name_ar}
                  </span>
                </div>
              </div>

              {/* Controls: Price input & availability toggle */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Price input */}
                <div className="flex items-center bg-black border border-white/20 rounded-xl px-2.5 py-1">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    className="w-14 bg-transparent text-right rtl:text-left text-xs font-bold text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 ml-1 rtl:mr-1 rtl:ml-0 font-medium">
                    {t('egp')}
                  </span>
                </div>

                {/* Availability Toggle */}
                <button
                  onClick={() => toggleItemAvailability(item.id)}
                  title={item.available ? 'Mark as Unavailable' : 'Mark as Available'}
                  className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors focus:outline-none ${
                    item.available
                      ? 'bg-white/10 text-white border-white/30'
                      : 'bg-red-950/30 text-red-400 border-red-900/50'
                  }`}
                >
                  <span className="text-[10px]">
                    {item.available
                      ? language === 'ar'
                        ? 'متاح'
                        : 'Active'
                      : language === 'ar'
                      ? 'مغلق'
                      : 'Off'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {saveToast ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {language === 'ar' ? 'تم الحفظ تلقائياً' : 'Changes saved locally'}
              </span>
            ) : (
              <span>{language === 'ar' ? 'يتم حفظ التعديلات فورياً في التطبيق' : 'All changes update live in the app'}</span>
            )}
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
