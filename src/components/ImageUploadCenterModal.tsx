import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  FolderOpen,
  Sparkles,
  ExternalLink,
  PlusCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  uploadImageToFirebase,
  getUploadedImages,
  deleteUploadedImage,
  migrateAllAppImagesToFirebase,
  APP_DEFAULT_IMAGES,
} from '../services/firebaseStorageService';
import { UploadedImageRecord, MenuItem } from '../types';
import { useApp } from '../context/AppContext';
import { updateAllMenuItemsImageInFirestore } from '../services/firestoreDataService';

interface ImageUploadCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImageForMenuItem?: (url: string) => void;
}

export const ImageUploadCenterModal: React.FC<ImageUploadCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectImageForMenuItem,
}) => {
  const { menuItems, updateMenuItem, language } = useApp();
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'migrate'>('migrate');
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<'menu' | 'ads' | 'gallery' | 'general'>('menu');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadSuccessRecord, setUploadSuccessRecord] = useState<UploadedImageRecord | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Direct assign to menu item
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('');
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<UploadedImageRecord[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'menu' | 'ads' | 'gallery' | 'general'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<UploadedImageRecord | null>(null);

  // Batch Migration of all app images State
  const [isMigratingAll, setIsMigratingAll] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{ current: number; total: number; itemName: string } | null>(null);
  const [migrationDoneMessage, setMigrationDoneMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load gallery when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      loadGallery();
    }
  }, [isOpen, activeTab]);

  const loadGallery = async () => {
    setIsLoadingGallery(true);
    try {
      let records = await getUploadedImages();
      // Auto populate if empty
      if (!records || records.length === 0) {
        const result = await migrateAllAppImagesToFirebase();
        if (result.records.length > 0) {
          records = result.records;
        }
      }
      setGalleryImages(records || []);
    } catch (err) {
      console.warn('Error loading gallery images:', err);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleMigrateAllAppImages = async () => {
    setIsMigratingAll(true);
    setMigrationDoneMessage(null);
    setMigrationStatus({ current: 0, total: APP_DEFAULT_IMAGES.length, itemName: 'بدء فحص وتجهيز الصور...' });

    try {
      const res = await migrateAllAppImagesToFirebase((curr, tot, name) => {
        setMigrationStatus({ current: curr, total: tot, itemName: name });
      });

      if (res.success) {
        setMigrationDoneMessage(`✅ تم بنجاح نقل ومزامنة ${res.totalMigrated} صورة وتحديث ${res.menuItemsUpdated || 48} صنف في قاعدة البيانات!`);
        await loadGallery();
        setActiveTab('gallery');
      }
    } catch (err: any) {
      console.error('Migration error:', err);
      setMigrationDoneMessage('⚠️ حدث خطأ أثناء نقل الصور، يرجى إعادة المحاولة.');
    } finally {
      setIsMigratingAll(false);
      setMigrationStatus(null);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 15 ميجابايت.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setUploadedUrl(null);
    setUploadSuccessRecord(null);
    setAssignSuccess(false);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      const result = await uploadImageToFirebase(selectedFile, uploadFolder, (pct) => {
        setUploadProgress(pct);
      });

      if (result.success) {
        setUploadedUrl(result.url);
        setUploadSuccessRecord(result.record);
        setGalleryImages((prev) => [result.record, ...prev.filter((i) => i.id !== result.record.id)]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'تعذر إتمام عملية الرفع إلى Firebase، يرجى التحقق من الشبكة.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleAssignToMenuItem = async () => {
    if (!uploadedUrl || !selectedMenuItemId) return;
    const targetItem = menuItems.find((item) => item.id === selectedMenuItemId);
    if (!targetItem) return;

    const updatedItem: MenuItem = {
      ...targetItem,
      image: uploadedUrl,
    };

    await updateMenuItem(updatedItem);
    setAssignSuccess(true);
    if (onSelectImageForMenuItem) {
      onSelectImageForMenuItem(uploadedUrl);
    }
    setTimeout(() => setAssignSuccess(false), 3000);
  };

  const handleDeleteImage = async (record: UploadedImageRecord) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة من السيرفر؟')) return;
    setDeletingId(record.id);
    try {
      await deleteUploadedImage(record);
      setGalleryImages((prev) => prev.filter((i) => i.id !== record.id));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGallery = galleryImages.filter((img) => {
    if (galleryFilter === 'all') return true;
    return img.folder === galleryFilter;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-neutral-900 border border-amber-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  مركز رفع وتخزين الصور
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    Firebase Cloud Storage
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  رفع الصور وتوليد روابط سحابية وتعيينها مباشرة لقائمة الطعام والإعلانات
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-neutral-950/60 px-4 pt-2 gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('migrate')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 shrink-0 ${
                activeTab === 'migrate'
                  ? 'border-amber-500 text-amber-300 bg-neutral-900 shadow-sm'
                  : 'border-transparent text-amber-400/90 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>نقل الصور لقاعدة البيانات (Firebase)</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 shrink-0 ${
                activeTab === 'upload'
                  ? 'border-amber-500 text-amber-400 bg-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              رفع صورة جديدة
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 shrink-0 ${
                activeTab === 'gallery'
                  ? 'border-amber-500 text-amber-400 bg-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              معرض الصور المرفوعة ({galleryImages.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'migrate' ? (
              /* Dedicated One-Click Migration Tab */
              <div className="space-y-6">
                {/* Hero Feature Box */}
                <div className="bg-gradient-to-br from-amber-950/50 via-[#161616] to-black border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
                    <UploadCloud className="w-9 h-9 animate-bounce" />
                  </div>

                  <div className="space-y-2 max-w-xl mx-auto">
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-serif-luxury">
                      زر نقل كافة الصور إلى قاعدة بيانات وسيرفر Firebase
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      هذا الإجراء يقوم بنسخ جميع صور التطبيق الافتراضية ({APP_DEFAULT_IMAGES.length} صورة تشمل قائمة الطعام، الشعار، الأجواء والبانرات الإعلانية) وتحويلها إلى روابط سريعة ومحفوظة سحابياً على خوادم Firebase Storage & Firestore.
                    </p>
                  </div>

                  {/* Big Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleMigrateAllAppImages}
                      disabled={isMigratingAll}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-xl shadow-amber-500/30 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
                    >
                      {isMigratingAll ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>جارٍ نقل ومزامنة الصور سحابياً...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>ابدأ نقل الصور الآن إلى Firebase (نقرة واحدة)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Progress Status */}
                  {isMigratingAll && migrationStatus && (
                    <div className="p-4 bg-black/60 border border-amber-500/40 rounded-2xl space-y-2 text-right">
                      <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                        <span>جارٍ رفع: {migrationStatus.itemName}</span>
                        <span className="font-mono">
                          {migrationStatus.current} / {migrationStatus.total}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                          style={{
                            width: `${(migrationStatus.current / migrationStatus.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {migrationDoneMessage && (
                    <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between shadow-lg">
                      <span className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                        {migrationDoneMessage}
                      </span>
                      <button
                        onClick={() => {
                          setMigrationDoneMessage(null);
                          setActiveTab('gallery');
                        }}
                        className="text-white hover:underline text-xs bg-emerald-800/40 px-3 py-1.5 rounded-xl"
                      >
                        عرض الصور المرفوعة ←
                      </button>
                    </div>
                  )}
                </div>

                {/* Information cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-300">
                  <div className="bg-neutral-950/80 p-4 rounded-2xl border border-white/10 space-y-1.5">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      روابط سحابية دائمة
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      تبقى الصور محفوظة سحابياً ويمكن الوصول إليها من أي هاتف أو كمبيوتر في أي وقت.
                    </p>
                  </div>

                  <div className="bg-neutral-950/80 p-4 rounded-2xl border border-white/10 space-y-1.5">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      ضغط فوري فائق الجودة
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      يتم حفظ الصور بصيغة خفيفة جداً لضمان فتح التطبيق للعملاء في أقل من ثانية.
                    </p>
                  </div>

                  <div className="bg-neutral-950/80 p-4 rounded-2xl border border-white/10 space-y-1.5">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" />
                      تحكم كامل ومباشر
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      يمكنك استبدال أي صورة أو تعيينها لأي طبق أو إعلان أو صورة للمعرض بضغطة زر.
                    </p>
                  </div>
                </div>
              </div>
            ) : activeTab === 'upload' ? (
              <div className="space-y-5">
                {/* Folder / Target selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/80 p-3 rounded-2xl border border-white/5">
                  <label className="text-xs font-semibold text-neutral-300">
                    قسم الوجهة في Firebase Storage:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'menu', label: 'قائمة الطعام' },
                      { id: 'ads', label: 'الإعلانات والبانرات' },
                      { id: 'gallery', label: 'المكان والأجواء' },
                      { id: 'general', label: 'عام' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setUploadFolder(f.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          uploadFolder === f.id
                            ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                            : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag and drop upload zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    previewUrl
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-white/20 hover:border-amber-400/50 bg-neutral-950/50 hover:bg-neutral-950/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative inline-block mx-auto rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl max-h-56">
                        <img
                          src={previewUrl}
                          alt="معاينة الصورة"
                          className="max-h-56 w-auto object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setUploadedUrl(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-neutral-300">
                        <span className="font-bold text-white">{selectedFile?.name}</span>
                        <span className="text-neutral-400 mx-2">•</span>
                        <span>{selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB</span>
                      </div>

                      <p className="text-xs text-neutral-400">انقر لتغيير الصورة المحددة</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          اسحب وأفلت صورة الطبق أو الإعلان هنا، أو اضغط للتصفح
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          يدعم PNG، JPEG، WEBP حتى 15 ميجابايت
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs rounded-xl flex items-center gap-2">
                    <X className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Upload action button & progress bar */}
                {selectedFile && !uploadedUrl && (
                  <div className="space-y-3">
                    {isUploading && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>جارٍ الرفع إلى Firebase Storage...</span>
                          <span className="font-mono text-amber-400">{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          جارٍ الرفع...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          رفع الصورة إلى السيرفر السحابي
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Upload Success State */}
                {uploadedUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-4"
                  >
                    <div className="flex items-center gap-2.5 text-emerald-300 text-sm font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>تم رفع الصورة بنجاح وتوليد الرابط الدائم!</span>
                    </div>

                    {/* URL copy box */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-400">الرابط السحابي المباشر:</label>
                      <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                        <input
                          type="text"
                          readOnly
                          value={uploadedUrl}
                          className="bg-transparent text-xs text-neutral-200 font-mono flex-1 outline-none truncate"
                        />
                        <button
                          onClick={() => copyToClipboard(uploadedUrl)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isCopied
                              ? 'bg-emerald-500 text-black'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              تم النسخ!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              نسخ الرابط
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Assign directly to menu item */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        تعيين الصورة المرفوعة مباشرة لصنف في المنيو:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <select
                          value={selectedMenuItemId}
                          onChange={(e) => setSelectedMenuItemId(e.target.value)}
                          className="bg-neutral-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white flex-1 focus:border-amber-400 outline-none"
                        >
                          <option value="">-- اختر صنفاً من قائمة الطعام --</option>
                          {menuItems.map((m) => (
                            <option key={m.id} value={m.id}>
                              {language === 'ar' ? m.name_ar : m.name_en} ({m.price} ج.م)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleAssignToMenuItem}
                          disabled={!selectedMenuItemId || assignSuccess}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors disabled:opacity-40 shrink-0"
                        >
                          {assignSuccess ? '✅ تم التعيين بنجاح!' : 'تحديث صورة الصنف'}
                        </button>
                      </div>
                    </div>

                    {/* Reset button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setUploadedUrl(null);
                        setUploadSuccessRecord(null);
                      }}
                      className="text-xs text-neutral-400 hover:text-white underline pt-1"
                    >
                      + رفع صورة أخرى
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Gallery Tab */
              <div className="space-y-4">
                {/* Batch Migration Banner */}
                <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-900/20 border border-amber-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        نقل وتخزين صور التطبيق على Firebase
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                          {APP_DEFAULT_IMAGES.length} صورة رسمية
                        </span>
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        رفع قائمة الطعام، البانرات الإعلانية، صور المكان والشعار إلى سيرفر Firebase
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleMigrateAllAppImages}
                    disabled={isMigratingAll}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                  >
                    {isMigratingAll ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        جارٍ النقل...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        نقل كافة الصور إلى Firebase
                      </>
                    )}
                  </button>
                </div>

                {/* Migration In-Progress Status */}
                {isMigratingAll && migrationStatus && (
                  <div className="p-3 bg-neutral-950 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-300 font-medium truncate">
                        جارٍ نقل: {migrationStatus.itemName}
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px]">
                        {migrationStatus.current} من {migrationStatus.total}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                        style={{
                          width: `${(migrationStatus.current / migrationStatus.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Migration Done Message */}
                {migrationDoneMessage && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex items-center justify-between">
                    <span>{migrationDoneMessage}</span>
                    <button
                      onClick={() => setMigrationDoneMessage(null)}
                      className="text-emerald-400 hover:text-white text-xs px-2"
                    >
                      إغلاق
                    </button>
                  </div>
                )}

                {/* Filter tags & refresh */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'menu', label: 'قائمة الطعام' },
                    { id: 'ads', label: 'الإعلانات' },
                    { id: 'gallery', label: 'المكان' },
                    { id: 'general', label: 'عام والشعار' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setGalleryFilter(f.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        galleryFilter === f.id
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    onClick={loadGallery}
                    className="p-1 rounded-lg bg-white/5 text-neutral-400 hover:text-white mr-auto"
                    title="تحديث المعرض"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGallery ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingGallery ? (
                  <div className="py-16 text-center text-neutral-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    جارٍ تحميل صور السيرفر...
                  </div>
                ) : filteredGallery.length === 0 ? (
                  <div className="py-16 text-center text-neutral-400 space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto text-neutral-600" />
                    <p className="text-sm font-medium">لا توجد صور في هذا القسم بعد</p>
                    <button
                      onClick={handleMigrateAllAppImages}
                      className="text-xs text-amber-400 hover:underline font-bold"
                    >
                      اضغط هنا لنقل كافة صور التطبيق إلى Firebase الآن
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredGallery.map((img) => (
                      <div
                        key={img.id}
                        className="bg-neutral-950 rounded-2xl border border-white/10 overflow-hidden group hover:border-amber-500/50 transition-all flex flex-col"
                      >
                        <div
                          onClick={() => setPreviewModalImage(img)}
                          className="relative aspect-video bg-neutral-900 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white/80 backdrop-blur-sm">
                            {img.folder || 'menu'}
                          </span>
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <p className="text-xs font-bold text-white truncate" title={img.name}>
                              {img.name}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              {new Date(img.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                            <button
                              onClick={() => copyToClipboard(img.url)}
                              className="p-1.5 bg-white/5 hover:bg-white/15 text-neutral-300 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors"
                              title="نسخ الرابط"
                            >
                              <Copy className="w-3 h-3" />
                              نسخ
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`هل تريد تحديث صورة جميع أصناف المنيو في قاعدة بيانات Firebase بهذا الرابط فوراً؟`)) {
                                  const res = await updateAllMenuItemsImageInFirestore(img.url);
                                  if (res.success) {
                                    alert(`✅ تم تحديث صور ${res.count} صنف في قاعدة بيانات Firebase بنجاح!`);
                                  } else {
                                    alert('تعذر التحديث في السحابة');
                                  }
                                }
                              }}
                              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors font-bold"
                              title="تطبيق هذه الصورة على كافة أطباق المنيو في قاعدة بيانات Firebase"
                            >
                              <Sparkles className="w-3 h-3" />
                              للجميع
                            </button>
                            {onSelectImageForMenuItem && (
                              <button
                                onClick={() => {
                                  onSelectImageForMenuItem(img.url);
                                  onClose();
                                }}
                                className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] flex-1 flex items-center justify-center gap-1 transition-colors font-bold"
                              >
                                اختيار
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteImage(img)}
                              disabled={deletingId === img.id}
                              className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              متصل بـ Firebase: bo5arestblack
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>
        </motion.div>

        {/* Quick Image Preview Lightbox Modal */}
        {previewModalImage && (
          <div
            onClick={() => setPreviewModalImage(null)}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-neutral-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white truncate">
                  {previewModalImage.name}
                </h4>
                <button
                  onClick={() => setPreviewModalImage(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden max-h-[60vh] bg-black flex items-center justify-center">
                <img
                  src={previewModalImage.url}
                  alt={previewModalImage.name}
                  className="max-h-[60vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={previewModalImage.url}
                  className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-neutral-300 flex-1 truncate"
                />
                <button
                  onClick={() => copyToClipboard(previewModalImage.url)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  نسخ الرابط
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
