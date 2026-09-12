import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Eye,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdvertisementItem } from '../../types';
import { uploadImageToFirebase } from '../../services/firebaseStorageService';

interface AdvertisementsManagerProps {
  onPreviewInApp?: () => void;
  showNotification: (msg: string) => void;
}

export const AdvertisementsManager: React.FC<AdvertisementsManagerProps> = ({
  onPreviewInApp,
  showNotification,
}) => {
  const {
    advertisements,
    saveAdvertisement,
    deleteAdvertisement,
    toggleAdvertisementActive,
    categories,
    menuItems,
    language,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editingAd, setEditingAd] = useState<AdvertisementItem | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [autoFQInfo, setAutoFQInfo] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AdvertisementItem>>({
    title_ar: '',
    title_en: '',
    subtitle_ar: '',
    subtitle_en: '',
    badge_ar: 'عرض حصري',
    badge_en: 'Exclusive Offer',
    badgeColor: '#D4AF37',
    image: '',
    active: true,
    priority: 1,
    actionType: 'menu',
    actionLabel_ar: 'تصفح العرض',
    actionLabel_en: 'Explore Offer',
  });

  const handleOpenAdd = () => {
    setEditingAd(null);
    setFormData({
      id: `ad_${Date.now()}`,
      title_ar: '',
      title_en: '',
      subtitle_ar: '',
      subtitle_en: '',
      badge_ar: 'عرض مميز',
      badge_en: 'Special Offer',
      badgeColor: '#D4AF37',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
      active: true,
      priority: (advertisements.length || 0) + 1,
      link: '',
      actionType: 'menu',
      actionLabel_ar: 'اطلب الآن',
      actionLabel_en: 'Order Now',
    });
    setAutoFQInfo(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (ad: AdvertisementItem) => {
    setEditingAd(ad);
    setFormData({ ...ad });
    setAutoFQInfo(ad.image.includes('webp') ? 'صورة محسنة بنظام WebP Auto F/Q' : null);
    setIsEditing(true);
  };

  // Auto F/Q Image Upload to Firebase Storage
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadProgress(10);
    setAutoFQInfo('جاري ضغط الصورة ومعالجتها بنظام Auto F/Q (WebP)...');

    try {
      const res = await uploadImageToFirebase(file, 'ads', (progress) => {
        setUploadProgress(progress);
      });

      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          image: res.url,
        }));
        setAutoFQInfo(`✅ تم التحسين والرفع بنجاح (Auto F/Q WebP) - توفير الحجم والحفاظ على الدقة`);
        showNotification('✅ تم رفع صورة الإعلان بنجاح إلى Firebase Storage بنظام Auto F/Q');
      } else {
        showNotification('⚠️ تعذر رفع الصورة');
      }
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Submit Ad to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_ar || !formData.image) {
      alert('يرجى ملء عنوان الإعلان ورابط الصورة');
      return;
    }

    const itemToSave: AdvertisementItem = {
      id: editingAd ? editingAd.id : formData.id || `ad_${Date.now()}`,
      title_ar: formData.title_ar || '',
      title_en: formData.title_en || formData.title_ar || '',
      subtitle_ar: formData.subtitle_ar || '',
      subtitle_en: formData.subtitle_en || '',
      badge_ar: formData.badge_ar || '',
      badge_en: formData.badge_en || '',
      badgeColor: formData.badgeColor || '#D4AF37',
      image: formData.image || '',
      active: formData.active ?? true,
      priority: Number(formData.priority) || 1,
      link: formData.link ? formData.link.trim() : undefined,
      actionType: formData.actionType || 'menu',
      actionLabel_ar: formData.actionLabel_ar || 'اطلب الآن',
      actionLabel_en: formData.actionLabel_en || 'Order Now',
      targetId: formData.targetId,
      hotspots: editingAd?.hotspots || [],
    };

    const success = await saveAdvertisement(itemToSave);
    if (success) {
      showNotification(
        editingAd
          ? `✅ تم تحديث الإعلان "${itemToSave.title_ar}" فوراً في قاعدة بيانات Firestore!`
          : `✅ تم إضافة الإعلان الجديد بنجاح في Firestore ويظهر حالياً في التطبيق!`
      );
      setIsEditing(false);
      setEditingAd(null);
    } else {
      showNotification('⚠️ حدث خطأ أثناء حفظ الإعلان.');
    }
  };

  // Delete Ad
  const handleDelete = async (ad: AdvertisementItem) => {
    if (!confirm(`هل أنت متأكد من حذف إعلان "${ad.title_ar}" من Firestore نهائياً؟`)) {
      return;
    }
    const success = await deleteAdvertisement(ad.id);
    if (success) {
      showNotification(`🗑️ تم حذف الإعلان "${ad.title_ar}" من السحابة بنجاح.`);
    }
  };

  // Toggle Active
  const handleToggleActive = async (ad: AdvertisementItem) => {
    const newActiveState = !ad.active;
    await toggleAdvertisementActive(ad.id, newActiveState);
    showNotification(
      newActiveState
        ? `🟢 تم تفعيل إعلان "${ad.title_ar}" ويظهر في التطبيق الآن`
        : `⚪ تم إيقاف إعلان "${ad.title_ar}" مؤقتاً من شاشات العملاء`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] p-5 rounded-2xl border border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Megaphone className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              إدارة الإعلانات والبانرات الترويجية ({advertisements.length})
            </h2>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              مزامنة فورية Real-time
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            التحكم في البانرات الإعلانية لشاشة العميل، مع دعم التحسين التلقائي للصور Auto F/Q والربط المباشر مع المنيو والحجوزات.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onPreviewInApp && (
            <button
              onClick={onPreviewInApp}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              معاينة التطبيق الحية
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة إعلان جديد
          </button>
        </div>
      </div>

      {/* Auto F/Q Info Banner */}
      <div className="bg-gradient-to-r from-amber-950/30 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-white flex items-center gap-2">
              نظام Auto F/Q (Auto Format & Quality) مدمج
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-mono font-bold">WebP @ 82%</span>
            </h4>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              عند رفع أي صورة إعلانية، يقوم النظام تلقائياً بتحويلها إلى صيغة WebP المضغوطة بذكاء بأعلى دقة ممكنة وأقل حجم، مما يجعل فتح التطبيق فورياً دون بطء.
            </p>
          </div>
        </div>
      </div>

      {/* List of Advertisements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {advertisements.map((ad) => {
          const isWebP = ad.image?.toLowerCase().includes('.webp');
          return (
            <div
              key={ad.id}
              className={`bg-[#111111] border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                ad.active
                  ? 'border-white/10 hover:border-amber-500/40'
                  : 'border-white/5 opacity-60 bg-neutral-950'
              }`}
            >
              {/* Ad Card Top Preview */}
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-white/10">
                  <img
                    src={ad.image}
                    alt={ad.title_ar}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  {ad.badge_ar && (
                    <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/80 text-amber-300 border border-amber-500/30">
                      {ad.badge_ar}
                    </span>
                  )}
                  {isWebP && (
                    <span className="absolute bottom-1 left-1 text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                      WEBP
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white text-sm truncate">{ad.title_ar}</h3>
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
                        ad.active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {ad.active ? 'نشط في التطبيق' : 'معطل مؤقتاً'}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 truncate">{ad.subtitle_ar || 'بدون وصف إضافي'}</p>
                  <p className="text-[11px] text-neutral-500 font-sans truncate">{ad.title_en}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                      الإجراء: {ad.actionType === 'menu' ? 'المنيو' : ad.actionType === 'reservation' ? 'حجز طاولة' : ad.actionType}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono">
                      الأولوية: #{ad.priority || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[180px]">
                  ID: {ad.id}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(ad)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors cursor-pointer flex items-center gap-1 text-[11px] px-2.5"
                    title="تعديل الإعلان"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    تعديل
                  </button>

                  <button
                    onClick={() => handleDelete(ad)}
                    className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px] px-2.5 border border-rose-500/20"
                    title="حذف الإعلان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {advertisements.length === 0 && (
        <div className="py-16 text-center text-neutral-400 space-y-3 bg-[#111111] rounded-2xl border border-white/5">
          <Megaphone className="w-10 h-10 mx-auto text-neutral-600" />
          <p className="text-sm font-medium">لا توجد إعلانات مسجلة في قاعدة البيانات</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl"
          >
            إضافة أول إعلان ترويجي
          </button>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD / EDIT ADVERTISEMENT
      ========================================== */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingAd ? `تعديل إعلان: ${editingAd.title_ar}` : 'إضافة إعلان ترويجي جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title AR / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">عنوان الإعلان بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_ar || ''}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    placeholder="مثال: خصم 20% على المشاوي الفاخرة"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">العنوان بالإنجليزية</label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="e.g. 20% Off Premium Mixed Grills"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Subtitle AR / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">الوصف الفرعي (عربي)</label>
                  <input
                    type="text"
                    value={formData.subtitle_ar || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
                    placeholder="مثال: متوفر طوال الأسبوع من الساعة 1 ظهراً"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">الوصف الفرعي (إنجليزي)</label>
                  <input
                    type="text"
                    value={formData.subtitle_en || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    placeholder="e.g. Available all week from 1:00 PM"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Badge & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 mb-1">الشارة الترويجية (Badge)</label>
                  <input
                    type="text"
                    value={formData.badge_ar || ''}
                    onChange={(e) => setFormData({ ...formData, badge_ar: e.target.value })}
                    placeholder="مثال: عرض حصري / لفترة محدودة / الأكثر طلباً"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">الأولوية (الترتيب)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.priority || 1}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Auto F/Q Upload */}
              <div className="space-y-2 bg-black/40 p-3.5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-200 font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    صورة الإعلان (مع دعم Auto F/Q المباشر) *
                  </label>
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors">
                    <UploadCloud className="w-3 h-3" />
                    {isUploadingImage ? `جاري الرفع ${uploadProgress}%` : 'رفع صورة جديدة (Auto F/Q)'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="url"
                  required
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="رابط الصورة (HTTPS) أو اضغط رفع صورة جديدة"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                />

                {autoFQInfo && (
                  <p className="text-[11px] text-emerald-400 font-medium">{autoFQInfo}</p>
                )}

                {/* Preview Thumbnail */}
                {formData.image && (
                  <div className="relative h-28 rounded-xl overflow-hidden border border-white/15 bg-neutral-950">
                    <img
                      src={formData.image}
                      alt="معاينة"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-white font-bold text-xs">
                        {formData.title_ar || 'معاينة الإعلان'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Link Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-neutral-300 text-xs font-semibold">
                    رابط الإعلان (اختياري)
                  </label>
                  <span className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    اختياري — يمكنك تركه فارغاً
                  </span>
                </div>
                <input
                  type="url"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com أو wa.me/... (اختياري حسب رغبتك)"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-neutral-500">
                  إذا تركت هذا الحقل فارغاً، سيعمل الإعلان بناءً على وجهة النقر المحددة بالأسفل (مثل فتح المنيو أو الحجز).
                </p>
              </div>

              {/* Action Type & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">وجهة النقر (Action)</label>
                  <select
                    value={formData.actionType || 'menu'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actionType: e.target.value as AdvertisementItem['actionType'],
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="menu">فتح المنيو (Menu)</option>
                    <option value="reservation">حجز طاولة (Reservation)</option>
                    <option value="cart">سلة الطلبات (Cart)</option>
                    <option value="whatsapp">محادثة واتساب مباشرة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">نص زر الإجراء</label>
                  <input
                    type="text"
                    value={formData.actionLabel_ar || ''}
                    onChange={(e) => setFormData({ ...formData, actionLabel_ar: e.target.value })}
                    placeholder="مثال: اطلب الآن / احجز طاولتك"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="ad-active-checkbox"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="ad-active-checkbox" className="text-white font-medium cursor-pointer">
                  تفعيل ونشر الإعلان فوراً في التطبيق للعملاء
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold shadow-md shadow-amber-500/20"
                >
                  {editingAd ? 'حفظ التعديلات في Firestore' : 'نشر الإعلان في Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
