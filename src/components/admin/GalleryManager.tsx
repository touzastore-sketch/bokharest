import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Check,
  X,
  Upload,
  UploadCloud,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GalleryImage } from '../../types';
import { uploadImageToFirebase } from '../../services/firebaseStorageService';

interface GalleryManagerProps {
  onNotify: (msg: string) => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ onNotify }) => {
  const { galleryImages, saveGalleryImage, deleteGalleryImage, openImageUploadCenter, language } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<GalleryImage>>({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    category: 'ambiance',
    category_ar: 'أجواء بوخارست',
    category_en: 'Ambiance',
    url: '',
    localUrl: '',
    featured: false,
  });

  const resetForm = () => {
    setFormData({
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      category: 'ambiance',
      category_ar: 'أجواء بوخارست',
      category_en: 'Ambiance',
      url: '',
      localUrl: '',
      featured: false,
    });
    setIsAdding(false);
    setEditingImage(null);
  };

  const handleStartEdit = (img: GalleryImage) => {
    setEditingImage(img);
    setFormData({ ...img });
    setIsAdding(true);
  };

  const handleCategoryChange = (cat: 'ambiance' | 'dining' | 'drinks') => {
    let cat_ar = 'أجواء بوخارست';
    let cat_en = 'Ambiance';
    if (cat === 'dining') {
      cat_ar = 'المأكولات الفاخرة';
      cat_en = 'Fine Dining';
    } else if (cat === 'drinks') {
      cat_ar = 'المشروبات والكوكتيلات';
      cat_en = 'Cocktails & Drinks';
    }
    setFormData((prev) => ({
      ...prev,
      category: cat,
      category_ar: cat_ar,
      category_en: cat_en,
    }));
  };

  // Upload photo file directly to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadImageToFirebase(file, 'gallery');
      const uploadedUrl = res.url;
      setFormData((prev) => ({
        ...prev,
        url: uploadedUrl,
        localUrl: uploadedUrl,
      }));
      onNotify('📸 تم رفع صورة المعرض إلى سحابة Firebase بنجاح!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى أو إدخال الرابط يدوياً');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url?.trim()) {
      alert('يرجى تحديد أو رفع صورة للمعرض أولاً');
      return;
    }

    const titleAr = formData.title_ar?.trim() || 'صورة من بوخارست';
    const titleEn = formData.title_en?.trim() || 'Bokharest Photo';

    const imageToSave: GalleryImage = {
      id: editingImage ? editingImage.id : `gallery_${Date.now()}`,
      url: formData.url.trim(),
      localUrl: formData.localUrl?.trim() || formData.url.trim(),
      title_ar: titleAr,
      title_en: titleEn,
      description_ar: formData.description_ar?.trim() || '',
      description_en: formData.description_en?.trim() || '',
      category: formData.category || 'ambiance',
      category_ar: formData.category_ar || 'أجواء بوخارست',
      category_en: formData.category_en || 'Ambiance',
      featured: Boolean(formData.featured),
    };

    const success = await saveGalleryImage(imageToSave);
    if (success) {
      onNotify(editingImage ? '✅ تم تحديث صورة المعرض بنجاح!' : '✨ تم إضافة صورة جديدة للمعرض وسحابة Firestore!');
      resetForm();
    } else {
      alert('حدث خطأ أثناء حفظ الصورة');
    }
  };

  const handleDelete = async (img: GalleryImage) => {
    if (!confirm(`هل أنت متأكد من حذف الصورة "${img.title_ar}" نهائياً من المعرض؟`)) {
      return;
    }

    const ok = await deleteGalleryImage(img.id);
    if (ok) {
      onNotify('🗑️ تم حذف الصورة من المعرض بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111] p-5 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">إدارة صور معرض بوخارست (Gallery)</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            تحكم كامل في الصور المعروضة لزوار التطبيق والموقع (إضافة، تعديل، حذف) مع مزامنة سحابية فورية.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openImageUploadCenter}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="نقل ورفع صور التطبيق إلى Firebase Storage"
          >
            <UploadCloud className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>نقل الصور إلى Firebase</span>
          </button>

          <button
            onClick={() => {
              if (isAdding) {
                resetForm();
              } else {
                setIsAdding(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? 'إلغاء النافذة' : 'إضافة صورة جديدة للمعرض'}</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal or Block */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#121212] border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{editingImage ? 'تعديل بيانات الصورة' : 'إضافة صورة جديدة للمعرض'}</span>
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title AR */}
            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">
                عنوان الصورة (بالعربي) *
              </label>
              <input
                type="text"
                required
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="مثال: ركن العائلات الفاخر"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Title EN */}
            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">
                عنوان الصورة (English)
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="e.g. Luxury Family Lounge"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">
                تصنيف الصورة
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('ambiance')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    formData.category === 'ambiance'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  أجواء المكان
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('dining')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    formData.category === 'dining'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  المأكولات
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('drinks')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    formData.category === 'drinks'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  المشروبات
                </button>
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 pt-6">
              <label className="relative flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-black/60 border-white/20 focus:ring-0 cursor-pointer"
                />
                <span>صورة رئيسية ومميزة في المعرض (تظهر بحجم أكبر)</span>
              </label>
            </div>
          </div>

          {/* Image Upload and URL */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs text-neutral-300 font-medium">
              صورة المعرض (يمكنك رفع ملف صورة من جهازك أو لصق رابط مباشر) *
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-medium cursor-pointer transition-all active:scale-95">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{isUploading ? 'جاري الرفع إلى Firebase...' : 'رفع صورة من الجهاز'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              <div className="flex-1 w-full">
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value, localUrl: e.target.value })}
                  placeholder="https://... رابط الصورة المباشر"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Preview image */}
            {formData.url && (
              <div className="relative w-36 h-28 rounded-xl overflow-hidden border border-white/20 mt-2 bg-black">
                <img
                  src={formData.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">وصف مختصر (عربي - اختياري)</label>
              <input
                type="text"
                value={formData.description_ar || ''}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                placeholder="مثال: جلسات هادئة وديكورات عصرية راقية"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">وصف مختصر (English - Optional)</label>
              <input
                type="text"
                value={formData.description_en || ''}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="e.g. Modern and intimate dining atmosphere"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingImage ? 'حفظ التعديلات' : 'إضافة إلى المعرض'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {galleryImages.map((img, index) => {
          return (
            <div
              key={img.id}
              className="group relative bg-[#111111] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/30 transition-all shadow-md"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-video w-full bg-black overflow-hidden">
                <img
                  src={img.url || img.localUrl}
                  onError={(e) => {
                    if (img.localUrl) {
                      (e.currentTarget as HTMLImageElement).src = img.localUrl;
                    }
                  }}
                  alt={img.title_ar}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Badge for featured */}
                {img.featured && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                    صورة مميزة ⭐
                  </span>
                )}

                {/* Category badge */}
                <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md border border-white/10">
                  {img.category_ar || img.category}
                </span>
              </div>

              {/* Info & Actions */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{img.title_ar}</h4>
                  <p className="text-neutral-400 text-xs line-clamp-1 font-sans mt-0.5">{img.title_en}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                  <span className="text-[10px] text-neutral-500 font-mono">#{index + 1}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(img)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-neutral-200 rounded-lg transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(img)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="حذف من المعرض"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {galleryImages.length === 0 && (
        <div className="p-12 text-center bg-[#111] border border-white/10 rounded-2xl">
          <Camera className="w-10 h-10 text-neutral-500 mx-auto mb-2" />
          <p className="text-neutral-300 font-bold text-sm">لا توجد صور في المعرض حالياً</p>
          <p className="text-neutral-500 text-xs mt-1">اضغط على زر "إضافة صورة جديدة للمعرض" لإضافة أول صورة</p>
        </div>
      )}
    </div>
  );
};
