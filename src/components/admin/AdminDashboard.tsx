import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  CalendarCheck,
  UploadCloud,
  Megaphone,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  MessageCircle,
  Copy,
  Trash2,
  Edit3,
  RefreshCw,
  Eye,
  AlertCircle,
  Sparkles,
  DollarSign,
  ChevronRight,
  Filter,
  Check,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Camera,
  Share2,
  MapPin,
  Globe,
  Percent,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  MenuItem,
  Category,
  OrderRecord,
  ReservationRecord,
  CustomerFeedback,
  UploadedImageRecord,
  RestaurantInfo,
  PricingPolicy,
} from '../../types';
import { CLOUDINARY_ASSETS, CLOUDINARY_CONFIG } from '../../services/cloudinaryService';
import {
  saveMenuItemToFirestore,
  deleteMenuItemFromFirestore,
  updateAllMenuItemsImageInFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  updateReservationStatusInFirestore,
  deleteReservationFromFirestore,
  subscribeToOrders,
  subscribeToReservations,
  subscribeToFeedbacks,
  saveRestaurantInfoToFirestore,
} from '../../services/firestoreDataService';
import {
  getUploadedImages,
  uploadImageToFirebase,
  deleteUploadedImage,
  migrateAllAppImagesToFirebase,
  APP_DEFAULT_IMAGES,
} from '../../services/firebaseStorageService';
import { AdvertisementsManager } from './AdvertisementsManager';
import { GalleryManager } from './GalleryManager';
import { APP_VERSION } from '../../data/restaurantData';
import { getItemSideOptions, parseSideOptions } from '../../utils/sideOptions';

type AdminTab =
  | 'overview'
  | 'menu'
  | 'orders'
  | 'reservations'
  | 'ads'
  | 'categories'
  | 'gallery'
  | 'pricing'
  | 'settings';

interface AdminDashboardProps {
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    menuItems,
    categories,
    restaurantInfo,
    advertisements,
    galleryImages,
    language,
    saveMenuItem,
    deleteMenuItem,
    saveCategory,
    deleteCategory,
    updateRestaurantSettings,
    openImageUploadCenter,
    executeImageMigration,
    isMigratingAppImages,
    pricingPolicy,
    updatePricingPolicy,
  } = useApp();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bb_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Current Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Pricing & Taxes Management State
  const [pricingForm, setPricingForm] = useState({
    vatEnabled: pricingPolicy.vatEnabled,
    vatRatePercent: Math.round(pricingPolicy.vatRate * 100),
    serviceChargeEnabled: pricingPolicy.serviceChargeEnabled,
    serviceChargeRatePercent: Math.round(pricingPolicy.serviceChargeRate * 100),
  });
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [testSimulatorAmount, setTestSimulatorAmount] = useState<number>(500);

  // Sync pricingForm when pricingPolicy updates from Firestore
  useEffect(() => {
    setPricingForm({
      vatEnabled: pricingPolicy.vatEnabled,
      vatRatePercent: Math.round(pricingPolicy.vatRate * 100),
      serviceChargeEnabled: pricingPolicy.serviceChargeEnabled,
      serviceChargeRatePercent: Math.round(pricingPolicy.serviceChargeRate * 100),
    });
  }, [pricingPolicy]);

  const handleSavePricing = async () => {
    setIsSavingPricing(true);
    try {
      const ok = await updatePricingPolicy({
        vatEnabled: pricingForm.vatEnabled,
        vatRate: (Number(pricingForm.vatRatePercent) || 0) / 100,
        serviceChargeEnabled: pricingForm.serviceChargeEnabled,
        serviceChargeRate: (Number(pricingForm.serviceChargeRatePercent) || 0) / 100,
      });
      if (ok) {
        showNotification('✅ تم بنجاح حفظ وتحديث سياسة الضرائب ورسوم الخدمة في سحابة Cloud Firestore!');
      } else {
        showNotification('⚠️ حدث تعذر أثناء الحفظ، يرجى المحاولة ثانية.');
      }
    } catch (e) {
      showNotification('⚠️ خطأ في الاتصال بقاعدة البيانات.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  // Real-time Firestore States
  const [liveOrders, setLiveOrders] = useState<OrderRecord[]>([]);
  const [liveReservations, setLiveReservations] = useState<ReservationRecord[]>([]);
  const [liveFeedbacks, setLiveFeedbacks] = useState<CustomerFeedback[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageRecord[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Menu Management State
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [batchImageUrlInput, setBatchImageUrlInput] = useState('');
  const [isBatchUpdatingImages, setIsBatchUpdatingImages] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New/Edit Item Form State
  const [itemFormData, setItemFormData] = useState<Partial<MenuItem>>({
    name_ar: '',
    name_en: '',
    category_id: '',
    price: 0,
    description_ar: '',
    description_en: '',
    image: '',
    available: true,
    featured: false,
    calories: 250,
    preparation_time: '15 دقيقة',
    badge_ar: '',
    badge_en: '',
    side_options: undefined,
  });

  // State for side dishes inside full item form
  const [itemFormNewSideInput, setItemFormNewSideInput] = useState('');
  const [itemFormEditingSideIdx, setItemFormEditingSideIdx] = useState<number | null>(null);
  const [itemFormEditingSideVal, setItemFormEditingSideVal] = useState('');

  // Quick Side Dishes Management Modal for single item
  const [quickSidesItem, setQuickSidesItem] = useState<MenuItem | null>(null);
  const [quickSidesList, setQuickSidesList] = useState<string[]>([]);
  const [newQuickSideInput, setNewQuickSideInput] = useState('');
  const [editingQuickSideIdx, setEditingQuickSideIdx] = useState<number | null>(null);
  const [editingQuickSideVal, setEditingQuickSideVal] = useState('');

  // Category Management State
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatData, setNewCatData] = useState({ name_ar: '', name_en: '', note_ar: '', note_en: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatData, setEditCatData] = useState({ name_ar: '', name_en: '', note_ar: '', note_en: '' });

  // Product Image Direct Upload State
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [productImageProgress, setProductImageProgress] = useState(0);

  // Settings Form State
  const [settingsData, setSettingsData] = useState<RestaurantInfo>(restaurantInfo);

  // Sync settings when restaurantInfo updates from Firestore
  useEffect(() => {
    if (restaurantInfo) {
      setSettingsData(restaurantInfo);
    }
  }, [restaurantInfo]);

  // Real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubOrders = subscribeToOrders((orders) => {
      setLiveOrders(orders);
    });

    const unsubReservations = subscribeToReservations((res) => {
      setLiveReservations(res);
    });

    const unsubFeedbacks = subscribeToFeedbacks((fb) => {
      setLiveFeedbacks(fb);
    });

    loadImages();

    return () => {
      unsubOrders();
      unsubReservations();
      unsubFeedbacks();
    };
  }, [isAuthenticated]);

  const loadImages = async () => {
    setIsLoadingImages(true);
    try {
      let imgs = await getUploadedImages();
      if (!imgs || imgs.length === 0) {
        const res = await migrateAllAppImagesToFirebase();
        imgs = res.records;
      }
      setUploadedImages(imgs || []);
    } catch (e) {
      console.warn('Error loading images:', e);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'bokharest!!@') {
      setIsAuthenticated(true);
      localStorage.setItem('bb_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bb_admin_auth');
    if (onClose) {
      onClose();
    }
  };

  const navigateToClientApp = () => {
    if (onClose) {
      onClose();
    } else {
      try {
        window.location.hash = '';
      } catch {}
      try {
        window.history.pushState(null, '', '/');
      } catch {}
    }
  };

  // Batch update all menu items' image in Firestore
  const handleBatchUpdateAllImages = async (urlToUse?: string) => {
    const targetUrl = urlToUse || batchImageUrlInput.trim();
    if (!targetUrl) {
      alert('يرجى إدخال أو اختيار رابط صورة صالح');
      return;
    }

    if (!confirm(`هل أنت متأكد من تحديث صور جميع الأطباق (${menuItems.length} صنف) في قاعدة بيانات Firebase بهذا الرابط فوراً؟`)) {
      return;
    }

    setIsBatchUpdatingImages(true);
    setBatchProgress({ current: 0, total: menuItems.length });

    try {
      const res = await updateAllMenuItemsImageInFirestore(targetUrl, (curr, tot) => {
        setBatchProgress({ current: curr, total: tot });
      });

      if (res.success) {
        showNotification(`✅ تم بنجاح تحديث وتثبيت صور كافة الأصناف (${res.count} صنف) في قاعدة بيانات Cloud Firestore!`);
        setBatchImageUrlInput('');
      } else {
        showNotification('⚠️ تعذر إكمال التحديث الشامل، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء التحديث في قاعدة البيانات.');
    } finally {
      setIsBatchUpdatingImages(false);
      setBatchProgress(null);
    }
  };

  // Save/Edit single item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name_ar?.trim() || !itemFormData.price) {
      alert('يرجى كتابة اسم الصنف والسعر');
      return;
    }

    const itemToSave: MenuItem = {
      id: editingItem ? editingItem.id : `item_${Date.now()}`,
      category_id: itemFormData.category_id || categories[0]?.id || 'salads',
      name_ar: itemFormData.name_ar.trim(),
      name_en: itemFormData.name_en?.trim() || itemFormData.name_ar.trim(),
      description_ar: itemFormData.description_ar?.trim() || '',
      description_en: itemFormData.description_en?.trim() || '',
      price: Number(itemFormData.price) || 0,
      image: itemFormData.image?.trim() || CLOUDINARY_ASSETS.unifiedMenuItem,
      available: itemFormData.available !== false,
      featured: Boolean(itemFormData.featured),
      calories: itemFormData.calories ? Number(itemFormData.calories) : 250,
      preparation_time: itemFormData.preparation_time || '15 دقيقة',
      badge_ar: itemFormData.badge_ar,
      badge_en: itemFormData.badge_en,
      type: itemFormData.type,
      side_options: itemFormData.side_options,
    };

    await saveMenuItem(itemToSave);
    showNotification(`✅ تم حفظ وإضافة الصنف "${itemToSave.name_ar}" بنجاح في القائمة وسحابة Firebase!`);
    setEditingItem(null);
    setIsAddingItem(false);
  };

  // Open Quick Side Options Modal for an item
  const handleOpenQuickSides = (item: MenuItem) => {
    setQuickSidesItem(item);
    const cat = categories.find((c) => c.id === item.category_id);
    const sideData = getItemSideOptions(item, cat?.note_ar, 'ar');
    if (item.side_options !== undefined) {
      setQuickSidesList([...item.side_options]);
    } else {
      setQuickSidesList(sideData.hasOptions ? [...sideData.options] : []);
    }
    setNewQuickSideInput('');
    setEditingQuickSideIdx(null);
    setEditingQuickSideVal('');
  };

  // Save quick sides directly to Firestore
  const handleSaveQuickSides = async () => {
    if (!quickSidesItem) return;
    const updated: MenuItem = {
      ...quickSidesItem,
      side_options: quickSidesList,
    };
    await saveMenuItem(updated);
    showNotification(`✅ تم تحديث الأطباق الجانبية لـ "${quickSidesItem.name_ar}" بنجاح في Firestore!`);
    setQuickSidesItem(null);
  };

  // Reset item side options to category default
  const handleResetToCategoryDefault = async () => {
    if (!quickSidesItem) return;
    const updated: MenuItem = {
      ...quickSidesItem,
      side_options: undefined,
    };
    await saveMenuItem(updated);
    showNotification(`🔄 تمت إعادة ضبط الأطباق الجانبية للوضع التلقائي (حسب القسم) لـ "${quickSidesItem.name_ar}"`);
    setQuickSidesItem(null);
  };

  // Delete single item
  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`هل أنت متأكد من حذف "${item.name_ar}" نهائياً من القائمة وقاعدة بيانات Firestore؟`)) {
      return;
    }
    await deleteMenuItem(item.id);
    showNotification(`🗑️ تم حذف "${item.name_ar}" من القائمة والسحابة بنجاح.`);
  };

  // Toggle item availability in Firestore
  const handleToggleAvailability = async (item: MenuItem) => {
    const updated = { ...item, available: !item.available };
    await saveMenuItem(updated);
    showNotification(`${updated.available ? '🟢 أصبح الصنف متاحاً' : '🔴 أصبح الصنف غير متاح'}`);
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderRecord['status']) => {
    const ok = await updateOrderStatusInFirestore(orderId, newStatus);
    if (ok) {
      showNotification(`✅ تم تغيير حالة الطلب إلى: ${newStatus}`);
    }
  };

  // Delete order from Firestore
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟ سيتم حذفه مباشرة من شاشة العميل أيضاً.')) {
      return;
    }
    const ok = await deleteOrderFromFirestore(orderId);
    if (ok) {
      setLiveOrders((prev) => prev.filter((o) => o.id !== orderId));
      showNotification('🗑️ تم حذف الطلب نهائياً من Firestore وحذفه مباشرة من عند العميل بنجاح');
    }
  };

  // Update reservation status
  const handleUpdateReservationStatus = async (resId: string, newStatus: ReservationRecord['status']) => {
    const ok = await updateReservationStatusInFirestore(resId, newStatus);
    if (ok) {
      showNotification(`✅ تم تغيير حالة الحجز إلى: ${newStatus}`);
    }
  };

  // Delete reservation from Firestore
  const handleDeleteReservation = async (resId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟ سيتم حذفه مباشرة من شاشة العميل أيضاً.')) {
      return;
    }
    const ok = await deleteReservationFromFirestore(resId);
    if (ok) {
      setLiveReservations((prev) => prev.filter((r) => r.id !== resId));
      showNotification('🗑️ تم حذف الحجز نهائياً من Firestore وحذفه مباشرة من عند العميل بنجاح');
    }
  };

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showNotification('📋 تم نسخ الرابط المباشر إلى الحافظة!');
  };

  // Open WhatsApp with customer
  const openWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('2') ? cleanPhone : `2${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ==========================================
  // VIEW: AUTHENTICATION LOCK SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#070707] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111111] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold font-serif-luxury text-white">
              لوحة التحكم الإدارية السحابية
            </h1>
            <p className="text-xs text-neutral-400">
              Bokharest Black Cloud Admin Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                أدخل رمز المرور الإداري (PIN):
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="أدخل رمز المرور"
                  className={`w-full bg-black/70 border ${
                    pinError ? 'border-rose-500' : 'border-white/20 focus:border-amber-500'
                  } rounded-xl px-4 py-3 text-sm text-center tracking-widest font-mono text-white focus:outline-none transition-all`}
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
              </div>
              {pinError && (
                <p className="text-rose-400 text-xs mt-1 text-center">
                  رمز المرور غير صحيح! يرجى المحاولة مرة أخرى
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              تسجيل الدخول إلى لوحة التحكم
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <button
              type="button"
              onClick={navigateToClientApp}
              className="hover:text-white flex items-center gap-1 text-neutral-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              العودة لتطبيق العملاء
            </button>
            <span className="font-mono text-[10px] text-neutral-500">
              Bokharest Black Cloud
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = liveOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const pendingOrdersCount = liveOrders.filter((o) => o.status === 'pending' || !o.status).length;
  const pendingReservationsCount = liveReservations.filter((r) => r.status === 'pending' || !r.status).length;
  const outOfStockCount = menuItems.filter((i) => !i.available).length;

  return (
    <div dir="rtl" className="min-h-screen bg-[#080808] text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* ==========================================
          ADMIN TOP NAVIGATION BAR
      ========================================== */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black flex items-center justify-center shadow-md shadow-amber-500/20 font-serif-luxury text-base">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white font-serif-luxury">
                بوخارست بلاك | لوحة التحكم الإدارية
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Live
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              إدارة القائمة، الطلبات المباشرة، الحجوزات، والوسائط السحابية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={executeImageMigration}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all border border-amber-500/40 shadow-sm cursor-pointer active:scale-95"
            title="نقل ومزامنة صور التطبيق إلى Firebase"
          >
            <UploadCloud className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-bold">نقل ورفع الصور لـ Firebase</span>
          </button>

          <button
            onClick={navigateToClientApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors border border-white/10"
            title="فتح تطبيق العملاء"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">عرض تطبيق العملاء</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs text-rose-300 hover:text-white transition-colors border border-rose-500/30"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">قفل اللوحة</span>
          </button>
        </div>
      </header>

      {/* Global Notification Banner */}
      {actionNotice && (
        <div className="bg-amber-500 text-black px-4 py-2.5 text-xs sm:text-sm font-bold text-center transition-all sticky top-[57px] z-50 shadow-md">
          {actionNotice}
        </div>
      )}

      {/* ==========================================
          MAIN ADMIN LAYOUT: SIDEBAR + CONTENT
      ========================================== */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#0c0c0c] border-b md:border-b-0 md:border-l border-white/10 p-3 sm:p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none">
          <div className="hidden md:block pb-3 mb-2 border-b border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              الأقسام الإدارية
            </span>
          </div>

          {[
            { id: 'overview', label: 'المؤشرات والملخص', icon: LayoutDashboard },
            {
              id: 'menu',
              label: 'قائمة الطعام والأسعار',
              icon: UtensilsCrossed,
              badge: menuItems.length,
            },
            {
              id: 'orders',
              label: 'الطلبات المباشرة',
              icon: ShoppingBag,
              badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} جديد` : liveOrders.length,
              badgeColor: pendingOrdersCount > 0 ? 'bg-amber-500 text-black font-bold' : '',
            },
            {
              id: 'reservations',
              label: 'حجوزات الطاولات',
              icon: CalendarCheck,
              badge: pendingReservationsCount > 0 ? `${pendingReservationsCount} جديد` : liveReservations.length,
              badgeColor: pendingReservationsCount > 0 ? 'bg-amber-500 text-black font-bold' : '',
            },
            {
              id: 'ads',
              label: 'إدارة الإعلانات والبانرات',
              icon: Megaphone,
              badge: advertisements.length,
            },
            { id: 'categories', label: 'إدارة الأقسام', icon: Layers, badge: categories.length },
            { id: 'gallery', label: 'إدارة المعرض والأنشطة', icon: Camera, badge: galleryImages.length },
            { id: 'pricing', label: 'الضرائب والخدمة والأسعار', icon: Percent },
            { id: 'settings', label: 'الواتساب والتواصل الاجتماعي', icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 md:shrink select-none cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      tab.badgeColor || 'bg-white/10 text-neutral-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Storage Migration Button in Sidebar */}
          <div className="pt-2 mt-2 border-t border-white/10 hidden md:block">
            <button
              type="button"
              onClick={executeImageMigration}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition-all text-right cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>نقل الصور لـ Firebase</span>
              </div>
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold">
                سحابي
              </span>
            </button>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* ==========================================
              TAB 1: OVERVIEW & KPIS
          ========================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold font-serif-luxury text-white">
                    نظرة عامة على النشاط والمبيعات
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    مزامنة حية مع قاعدة بيانات Cloud Firestore لبوخارست بلاك
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={executeImageMigration}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-black" />
                    نقل الصور لـ Firebase
                  </button>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                    إدارة قائمة الطعام
                  </button>
                  <button
                    onClick={() => setActiveTab('ads')}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                    إدارة الإعلانات
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Orders Card */}
                <div className="bg-[#121212] border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-xs font-semibold">إجمالي الطلبات</span>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {liveOrders.length}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400">
                    <span>{pendingOrdersCount} طلب قيد المراجعة</span>
                  </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-[#121212] border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-xs font-semibold">إجمالي المبيعات</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {totalRevenue.toLocaleString()} ج.م
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    محسوبة من طلبات السحابة الحية
                  </div>
                </div>

                {/* Reservations Card */}
                <div className="bg-[#121212] border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-xs font-semibold">حجوزات الطاولات</span>
                    <CalendarCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {liveReservations.length}
                  </div>
                  <div className="text-[11px] text-amber-400">
                    <span>{pendingReservationsCount} حجز بانتظار التأكيد</span>
                  </div>
                </div>

                {/* Menu Stats Card */}
                <div className="bg-[#121212] border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-xs font-semibold">أصناف المنيو</span>
                    <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {menuItems.length}
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                    <span>{categories.length} أقسام</span>
                    <span className="text-rose-400">{outOfStockCount} غير متاح</span>
                  </div>
                </div>
              </div>

              {/* Quick Ads Management Callout */}
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      إدارة الإعلانات والبانرات الترويجية ({advertisements.length} إعلانات)
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      أضف أو عدّل البانرات المعروضة للمستخدم في أعلى الشاشة الرئيسية مع تحسين Auto F/Q
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('ads')}
                  className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors shrink-0"
                >
                  فتح قسم الإعلانات ←
                </button>
              </div>

              {/* Recent Orders & Reservations Quick Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      أحدث الطلبات الواردة
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      عرض الكل ({liveOrders.length})
                    </button>
                  </div>

                  {liveOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-500">
                      لا توجد طلبات مسجلة بعد
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {liveOrders.slice(0, 4).map((order) => (
                        <div
                          key={order.id}
                          className="p-3 bg-black/50 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {order.customerName || 'عميل'}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {order.phoneNumber}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-400">
                              {order.items?.length || 0} أصناف • {order.total} ج.م
                            </span>
                            {order.address && (
                              <span className="block text-[10px] text-amber-400/90 truncate max-w-[220px]">
                                📍 {order.address}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : order.status === 'preparing'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {order.status === 'completed'
                                ? 'مكتمل'
                                : order.status === 'preparing'
                                ? 'قيد التجهيز'
                                : 'جديد'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Reservations */}
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-amber-400" />
                      أحدث حجوزات الطاولات
                    </h3>
                    <button
                      onClick={() => setActiveTab('reservations')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      عرض الكل ({liveReservations.length})
                    </button>
                  </div>

                  {liveReservations.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-500">
                      لا توجد حجوزات مسجلة بعد
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {liveReservations.slice(0, 4).map((res) => (
                        <div
                          key={res.id}
                          className="p-3 bg-black/50 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {res.customerName}
                              </span>
                              <span className="text-[10px] text-amber-400">
                                ({res.guests} أفراد)
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-400">
                              {res.date} • {res.time}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              res.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {res.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: MENU & DISHES MANAGEMENT
          ========================================== */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-white/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                    إدارة قائمة الطعام والأطباق ({menuItems.length})
                  </h2>
                  <p className="text-xs text-neutral-400">
                    تعديل الأسعار، الصور، والتوفر، وحفظها مباشرة في قاعدة بيانات Firestore
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setItemFormData({
                        name_ar: '',
                        name_en: '',
                        category_id: categories[0]?.id || 'hot_coffee',
                        price: 60,
                        description_ar: '',
                        description_en: '',
                        image: APP_DEFAULT_IMAGES[0].url,
                        available: true,
                        featured: false,
                        calories: 200,
                        preparation_time: '15 دقيقة',
                      });
                      setEditingItem(null);
                      setIsAddingItem(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة صنف جديد
                  </button>

                  <button
                    onClick={() => handleBatchUpdateAllImages(APP_DEFAULT_IMAGES[0].url)}
                    disabled={isBatchUpdatingImages}
                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    title="تحديث صور جميع الأصناف في Firestore دفعة واحدة"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    تحديث صور كافة الأصناف في السحابة
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#0d0d0d] p-3 rounded-xl border border-white/5">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="ابحث عن طبق بالاسم أو الوصف..."
                    className="w-full bg-black/60 border border-white/10 focus:border-amber-500 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="all">جميع الأقسام ({menuItems.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar} ({menuItems.filter((i) => i.category_id === c.id).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Menu Items Table / Grid */}
              <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-black/80 text-neutral-400 border-b border-white/10 font-semibold">
                      <tr>
                        <th className="p-3">الصورة</th>
                        <th className="p-3">اسم الصنف</th>
                        <th className="p-3">القسم</th>
                        <th className="p-3">الأطباق الجانبية</th>
                        <th className="p-3">السعر (ج.م)</th>
                        <th className="p-3 text-center">التوفر</th>
                        <th className="p-3 text-center">مميز</th>
                        <th className="p-3 text-left">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {menuItems
                        .filter((item) => {
                          const matchesSearch =
                            !menuSearch ||
                            item.name_ar.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            item.name_en.toLowerCase().includes(menuSearch.toLowerCase());
                          const matchesCat =
                            selectedCatFilter === 'all' || item.category_id === selectedCatFilter;
                          return matchesSearch && matchesCat;
                        })
                        .map((item) => {
                          const cat = categories.find((c) => c.id === item.category_id);
                          return (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/10 relative group shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.name_ar}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="font-bold text-white text-xs sm:text-sm">
                                  {item.name_ar}
                                </div>
                                <div className="text-[11px] text-neutral-400 font-sans">
                                  {item.name_en}
                                </div>
                                {item.calories && (
                                  <span className="text-[10px] text-neutral-500 font-mono">
                                    {item.calories} سعرة
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <span className="px-2 py-1 rounded-md bg-white/5 text-neutral-300 text-[11px] font-medium border border-white/5">
                                  {cat?.name_ar || item.category_id}
                                </span>
                              </td>

                              <td className="p-3">
                                {(() => {
                                  const itemSideData = getItemSideOptions(item, cat?.note_ar, 'ar');
                                  const isCustom = item.side_options !== undefined;
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuickSides(item)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
                                        itemSideData.hasOptions
                                          ? isCustom
                                            ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                                          : 'bg-white/5 hover:bg-white/10 border-dashed border-white/15 text-neutral-400 hover:text-white'
                                      }`}
                                      title="اضغط للتحكم الكامل (تعديل / حذف / إضافة) بالأطباق الجانبية لهذا الصنف"
                                    >
                                      <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>
                                        {itemSideData.hasOptions
                                          ? `${itemSideData.options.length} أطباق`
                                          : '+ أطباق'}
                                      </span>
                                      {isCustom && (
                                        <span className="text-[9px] font-bold px-1 rounded bg-amber-400/20 text-amber-300">
                                          مخصص
                                        </span>
                                      )}
                                    </button>
                                  );
                                })()}
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    defaultValue={item.price}
                                    onBlur={async (e) => {
                                      const newPrice = Number(e.target.value);
                                      if (newPrice !== item.price && newPrice >= 0) {
                                        await saveMenuItem({ ...item, price: newPrice });
                                        showNotification(`✅ تم تحديث سعر "${item.name_ar}" إلى ${newPrice} ج.م`);
                                      }
                                    }}
                                    className="w-20 bg-black/80 border border-white/10 focus:border-amber-500 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-300 text-center"
                                  />
                                  <span className="text-[10px] text-neutral-400">ج.م</span>
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleToggleAvailability(item)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                    item.available
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {item.available ? 'متاح' : 'غير متاح'}
                                </button>
                              </td>

                              <td className="p-3 text-center">
                                <button
                                  onClick={async () => {
                                    const updated = { ...item, featured: !item.featured };
                                    await saveMenuItem(updated);
                                    showNotification(`⭐ تم تحديث حالة تمييز "${item.name_ar}"`);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    item.featured ? 'text-amber-400' : 'text-neutral-600 hover:text-neutral-400'
                                  }`}
                                >
                                  <Star className={`w-4 h-4 ${item.featured ? 'fill-amber-400' : ''}`} />
                                </button>
                              </td>

                              <td className="p-3 text-left">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingItem(item);
                                      setItemFormData(item);
                                      setIsAddingItem(true);
                                    }}
                                    className="p-1.5 bg-white/5 hover:bg-white/15 text-neutral-300 rounded-lg transition-colors"
                                    title="تعديل التفاصيل والصورة"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item)}
                                    className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                                    title="حذف الصنف"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add / Edit Modal Drawer */}
              {isAddingItem && (
                <div
                  className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                  onClick={() => setIsAddingItem(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-xl bg-[#111111] border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد إلى قائمة الطعام'}
                      </h3>
                      <button
                        onClick={() => setIsAddingItem(false)}
                        className="text-neutral-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveItem} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-300 mb-1">
                            الاسم بالعربية *
                          </label>
                          <input
                            type="text"
                            required
                            value={itemFormData.name_ar || ''}
                            onChange={(e) => setItemFormData({ ...itemFormData, name_ar: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-300 mb-1">
                            الاسم بالإنجليزية
                          </label>
                          <input
                            type="text"
                            value={itemFormData.name_en || ''}
                            onChange={(e) => setItemFormData({ ...itemFormData, name_en: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-300 mb-1">
                            القسم *
                          </label>
                          <select
                            value={itemFormData.category_id || categories[0]?.id}
                            onChange={(e) => setItemFormData({ ...itemFormData, category_id: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name_ar} ({c.name_en})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-300 mb-1">
                            السعر (ج.م) *
                          </label>
                          <input
                            type="number"
                            required
                            value={itemFormData.price || 0}
                            onChange={(e) => setItemFormData({ ...itemFormData, price: Number(e.target.value) })}
                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          صورة الصنف (Firebase Storage)
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={itemFormData.image || ''}
                              onChange={(e) => setItemFormData({ ...itemFormData, image: e.target.value })}
                              placeholder="https://... أو اضغط على زر الرفع أدناه"
                              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                            {itemFormData.image && (
                              <img
                                src={itemFormData.image}
                                alt="preview"
                                className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shrink-0"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-medium cursor-pointer flex items-center justify-center gap-2 transition-colors">
                              <UploadCloud className="w-4 h-4 text-amber-400" />
                              <span>
                                {isUploadingProductImage
                                  ? `جارٍ الرفع (${productImageProgress}%)...`
                                  : '📸 رفع صورة من جهازك إلى Firebase مباشرة'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={isUploadingProductImage}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setIsUploadingProductImage(true);
                                  setProductImageProgress(15);
                                  try {
                                    const res = await uploadImageToFirebase(file, 'menu', (p) =>
                                      setProductImageProgress(p)
                                    );
                                    if (res.url) {
                                      setItemFormData((prev) => ({ ...prev, image: res.url }));
                                      showNotification('✅ تم رفع صورة الصنف بنجاح بنظام Auto F/Q إلى Firebase Storage!');
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    showNotification('تعذر رفع الصورة.');
                                  } finally {
                                    setIsUploadingProductImage(false);
                                    setProductImageProgress(0);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                setItemFormData({
                                  ...itemFormData,
                                  image: CLOUDINARY_ASSETS.unifiedMenuItem,
                                })
                              }
                              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs border border-white/10 shrink-0"
                              title="استعادة الصورة الافتراضية"
                            >
                              الافتراضية (Cloudinary)
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-300 mb-1">
                          الوصف بالعربية
                        </label>
                        <textarea
                          rows={2}
                          value={itemFormData.description_ar || ''}
                          onChange={(e) => setItemFormData({ ...itemFormData, description_ar: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-300 mb-1">
                            السعرات الحرارية
                          </label>
                          <input
                            type="number"
                            value={itemFormData.calories || 200}
                            onChange={(e) => setItemFormData({ ...itemFormData, calories: Number(e.target.value) })}
                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-300 mb-1">
                            وقت التجهيز
                          </label>
                          <input
                            type="text"
                            value={itemFormData.preparation_time || '15 دقيقة'}
                            onChange={(e) => setItemFormData({ ...itemFormData, preparation_time: e.target.value })}
                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Side Options / Dishes Management Section */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/25 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                              <UtensilsCrossed className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>الأصناف والأطباق الجانبية</span>
                                <span className="text-[10px] text-amber-400/90 font-mono">(Side Dishes)</span>
                              </h4>
                              <p className="text-[11px] text-neutral-400">
                                الخيارات التي تظهر للعميل لاختيارها مباشرة مع هذا الصنف
                              </p>
                            </div>
                          </div>

                          {/* Mode Badge */}
                          <div className="flex items-center gap-1.5">
                            {itemFormData.side_options === undefined ? (
                              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                                🔄 تلقائي (حسب القسم)
                              </span>
                            ) : (
                              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                ⭐ مخصص للصنف ({itemFormData.side_options.length})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* If still undefined, show preview of category defaults + button to customize */}
                        {itemFormData.side_options === undefined ? (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                            {(() => {
                              const currCat = categories.find((c) => c.id === itemFormData.category_id);
                              const parsedCatSides = parseSideOptions(currCat?.note_ar, 'ar');
                              return (
                                <>
                                  <div className="text-[11px] text-neutral-300 leading-relaxed">
                                    {parsedCatSides.hasOptions ? (
                                      <span>
                                        يرث هذا الصنف حالياً أطباق قسم{' '}
                                        <strong className="text-amber-400">{currCat?.name_ar}</strong>:{' '}
                                        <span className="text-white font-semibold">
                                          {parsedCatSides.options.join(' ، ')}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-neutral-400">
                                        لا توجد أطباق جانبية افتراضية في هذا القسم. يمكنك تخصيص أطباق جانبية لهذا الصنف مباشرة.
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setItemFormData((prev) => ({
                                        ...prev,
                                        side_options: parsedCatSides.hasOptions
                                          ? [...parsedCatSides.options]
                                          : [],
                                      }));
                                    }}
                                    className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>تخصيص الأطباق الجانبية لهذا الصنف (تعديل / حذف / إضافة)</span>
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          /* Custom side options controls */
                          <div className="space-y-3">
                            {/* Chips List */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold text-neutral-300 block">
                                قائمة الأطباق الجانبية المتاحة (اضغط ✏️ للتعديل أو ✕ للحذف):
                              </label>

                              {itemFormData.side_options.length === 0 ? (
                                <div className="p-3 text-center rounded-xl bg-white/5 border border-dashed border-white/10 text-neutral-400 text-xs">
                                  🚫 تم تعطيل الأطباق الجانبية لهذا الصنف (لن تظهر له اختيارات جانبية).
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {itemFormData.side_options.map((opt, idx) => (
                                    <div
                                      key={idx}
                                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-amber-500/30 text-xs text-white shadow-sm"
                                    >
                                      {itemFormEditingSideIdx === idx ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            value={itemFormEditingSideVal}
                                            onChange={(e) => setItemFormEditingSideVal(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (itemFormEditingSideVal.trim()) {
                                                  const copy = [...(itemFormData.side_options || [])];
                                                  copy[idx] = itemFormEditingSideVal.trim();
                                                  setItemFormData({ ...itemFormData, side_options: copy });
                                                  setItemFormEditingSideIdx(null);
                                                }
                                              }
                                            }}
                                            className="w-28 bg-black border border-amber-500 rounded px-2 py-0.5 text-xs text-white"
                                            autoFocus
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (itemFormEditingSideVal.trim()) {
                                                const copy = [...(itemFormData.side_options || [])];
                                                copy[idx] = itemFormEditingSideVal.trim();
                                                setItemFormData({ ...itemFormData, side_options: copy });
                                                setItemFormEditingSideIdx(null);
                                              }
                                            }}
                                            className="text-emerald-400 hover:text-emerald-300 p-0.5"
                                            title="تأكيد التعديل"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setItemFormEditingSideIdx(null)}
                                            className="text-neutral-400 hover:text-white p-0.5"
                                            title="إلغاء"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <span className="font-medium text-amber-200">{opt}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setItemFormEditingSideIdx(idx);
                                              setItemFormEditingSideVal(opt);
                                            }}
                                            className="text-neutral-400 hover:text-amber-300 transition-colors p-0.5"
                                            title="تعديل اسم الصنف الجانبي"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const copy = [...(itemFormData.side_options || [])];
                                              copy.splice(idx, 1);
                                              setItemFormData({ ...itemFormData, side_options: copy });
                                            }}
                                            className="text-neutral-400 hover:text-rose-400 transition-colors p-0.5"
                                            title="حذف هذا الصنف الجانبي"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Add New Side Option Input */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="اكتب اسم صنف جانبي جديد (مثال: أرز بالخلطة، بطاطس محمرة)..."
                                value={itemFormNewSideInput}
                                onChange={(e) => setItemFormNewSideInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = itemFormNewSideInput.trim();
                                    if (val) {
                                      const cur = itemFormData.side_options || [];
                                      if (!cur.includes(val)) {
                                        setItemFormData({ ...itemFormData, side_options: [...cur, val] });
                                      }
                                      setItemFormNewSideInput('');
                                    }
                                  }
                                }}
                                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const val = itemFormNewSideInput.trim();
                                  if (val) {
                                    const cur = itemFormData.side_options || [];
                                    if (!cur.includes(val)) {
                                      setItemFormData({ ...itemFormData, side_options: [...cur, val] });
                                    }
                                    setItemFormNewSideInput('');
                                  }
                                }}
                                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة صنف</span>
                              </button>
                            </div>

                            {/* Quick Preset Badges */}
                            <div>
                              <span className="text-[10px] text-neutral-400 block mb-1">
                                💡 خيارات سريعة شائعة (اضغط للإضافة الفورية):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  'بطاطس محمرة',
                                  'أرز أبيض',
                                  'أرز بالخلطة',
                                  'خضار سوتيه',
                                  'مهروسة بطاطس',
                                  'باستا وايت',
                                  'باستا ريد',
                                  'ذرة مشوية',
                                  'سلطة كول سلو',
                                ].map((preset) => {
                                  const isAlreadyIn = (itemFormData.side_options || []).includes(preset);
                                  return (
                                    <button
                                      key={preset}
                                      type="button"
                                      disabled={isAlreadyIn}
                                      onClick={() => {
                                        const cur = itemFormData.side_options || [];
                                        if (!cur.includes(preset)) {
                                          setItemFormData({ ...itemFormData, side_options: [...cur, preset] });
                                        }
                                      }}
                                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                                        isAlreadyIn
                                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300/40 cursor-not-allowed'
                                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                                      }`}
                                    >
                                      + {preset}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Action Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px]">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currCat = categories.find((c) => c.id === itemFormData.category_id);
                                    const parsed = parseSideOptions(currCat?.note_ar, 'ar');
                                    if (parsed.hasOptions) {
                                      setItemFormData({
                                        ...itemFormData,
                                        side_options: [...parsed.options],
                                      });
                                    } else {
                                      alert('لا توجد أطباق مسجلة في هذا القسم لاستيرادها.');
                                    }
                                  }}
                                  className="text-neutral-400 hover:text-amber-300 underline"
                                >
                                  📥 استيراد من القسم
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemFormData({ ...itemFormData, side_options: [] });
                                  }}
                                  className="text-neutral-400 hover:text-rose-400 underline"
                                >
                                  🚫 مسح الكل (بدون أطباق)
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setItemFormData({ ...itemFormData, side_options: undefined });
                                }}
                                className="text-amber-400 hover:text-amber-300 font-medium"
                              >
                                🔄 استعادة الوضع التلقائي (حسب القسم)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsAddingItem(false)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs"
                        >
                          حفظ الصنف في Firestore
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Quick Side Dishes Management Modal for single item */}
              {quickSidesItem && (
                <div
                  className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                  onClick={() => setQuickSidesItem(null)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-[#121212] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            إدارة الأطباق الجانبية للصنف
                          </h3>
                          <p className="text-xs text-amber-300 font-semibold truncate max-w-[260px]">
                            {quickSidesItem.name_ar}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setQuickSidesItem(null)}
                        className="text-neutral-400 hover:text-white p-1 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Chips list */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-neutral-200">
                            الأطباق الجانبية الحالية ({quickSidesList.length}):
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            (تعديل ✏️ أو حذف ✕)
                          </span>
                        </div>

                        {quickSidesList.length === 0 ? (
                          <div className="p-4 text-center rounded-2xl bg-white/5 border border-dashed border-white/15 text-neutral-400 text-xs">
                            🚫 لا توجد أطباق جانبية لهذا الصنف (لن يطلب من العميل اختيار طبق جانبي).
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {quickSidesList.map((opt, idx) => (
                              <div
                                key={idx}
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-amber-500/30 text-xs text-white shadow"
                              >
                                {editingQuickSideIdx === idx ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editingQuickSideVal}
                                      onChange={(e) => setEditingQuickSideVal(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          if (editingQuickSideVal.trim()) {
                                            const copy = [...quickSidesList];
                                            copy[idx] = editingQuickSideVal.trim();
                                            setQuickSidesList(copy);
                                            setEditingQuickSideIdx(null);
                                          }
                                        }
                                      }}
                                      className="w-28 bg-black border border-amber-500 rounded px-2 py-0.5 text-xs text-white"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (editingQuickSideVal.trim()) {
                                          const copy = [...quickSidesList];
                                          copy[idx] = editingQuickSideVal.trim();
                                          setQuickSidesList(copy);
                                          setEditingQuickSideIdx(null);
                                        }
                                      }}
                                      className="text-emerald-400 hover:text-emerald-300 p-0.5"
                                      title="حفظ التعديل"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuickSideIdx(null)}
                                      className="text-neutral-400 hover:text-white p-0.5"
                                      title="إلغاء"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-semibold text-amber-200">{opt}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingQuickSideIdx(idx);
                                        setEditingQuickSideVal(opt);
                                      }}
                                      className="text-neutral-400 hover:text-amber-300 p-0.5 transition-colors"
                                      title="تعديل هذا الصنف"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const copy = [...quickSidesList];
                                        copy.splice(idx, 1);
                                        setQuickSidesList(copy);
                                      }}
                                      className="text-neutral-400 hover:text-rose-400 p-0.5 transition-colors"
                                      title="حذف هذا الصنف"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add new option */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="اكتب صنف جانبي جديد (مثلاً: بطاطس محمرة، أرز بالخلطة)..."
                          value={newQuickSideInput}
                          onChange={(e) => setNewQuickSideInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = newQuickSideInput.trim();
                              if (val && !quickSidesList.includes(val)) {
                                setQuickSidesList([...quickSidesList, val]);
                                setNewQuickSideInput('');
                              }
                            }
                          }}
                          className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = newQuickSideInput.trim();
                            if (val && !quickSidesList.includes(val)) {
                              setQuickSidesList([...quickSidesList, val]);
                              setNewQuickSideInput('');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">
                          💡 أطباق شائعة للإضافة بنقرة واحدة:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'بطاطس محمرة',
                            'أرز أبيض',
                            'أرز بالخلطة',
                            'خضار سوتيه',
                            'مهروسة بطاطس',
                            'باستا وايت',
                            'باستا ريد',
                            'ذرة مشوية',
                            'سلطة كول سلو',
                          ].map((preset) => {
                            const inList = quickSidesList.includes(preset);
                            return (
                              <button
                                key={preset}
                                type="button"
                                disabled={inList}
                                onClick={() => {
                                  if (!quickSidesList.includes(preset)) {
                                    setQuickSidesList([...quickSidesList, preset]);
                                  }
                                }}
                                className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                                  inList
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300/40 cursor-not-allowed'
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                                }`}
                              >
                                + {preset}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Helper options */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-neutral-400">
                        <button
                          type="button"
                          onClick={() => {
                            const cat = categories.find((c) => c.id === quickSidesItem.category_id);
                            const parsed = parseSideOptions(cat?.note_ar, 'ar');
                            if (parsed.hasOptions) {
                              setQuickSidesList([...parsed.options]);
                            } else {
                              alert('لا توجد أطباق افتراضية مسجلة في هذا القسم.');
                            }
                          }}
                          className="hover:text-amber-300 underline"
                        >
                          📥 استيراد من القسم
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuickSidesList([])}
                          className="hover:text-rose-400 underline"
                        >
                          🚫 مسح الكل
                        </button>

                        <button
                          type="button"
                          onClick={handleResetToCategoryDefault}
                          className="text-amber-400 hover:text-amber-300 font-semibold"
                          title="حذف التخصيص والرجوع إلى الإعداد الافتراضي للقسم"
                        >
                          🔄 استعادة الوضع التلقائي
                        </button>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setQuickSidesItem(null)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveQuickSides}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs shadow-lg transition-all"
                      >
                        💾 حفظ الأطباق الجانبية في Firestore
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 3: LIVE ORDERS MONITOR
          ========================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-white/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    مراقبة وإدارة الطلبات الحية ({liveOrders.length})
                  </h2>
                  <p className="text-xs text-neutral-400">
                    استقبال وتحديث حالات طلبات العملاء فوراً من قاعدة بيانات Firestore
                  </p>
                </div>
              </div>

              {liveOrders.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 space-y-2 bg-[#111111] rounded-2xl border border-white/5">
                  <ShoppingBag className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-sm font-medium">لا توجد طلبات واردة في السحابة حتى الآن</p>
                  <p className="text-xs text-neutral-500">
                    عند قيام أي عميل بطلب من المنيو، سيظهر هنا تلقائياً في ثوانٍ.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveOrders.map((order) => {
                    const status = order.status || 'pending';
                    return (
                      <div
                        key={order.id}
                        className={`bg-[#121212] border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                          status === 'pending'
                            ? 'border-amber-500/40 bg-gradient-to-br from-[#121212] to-amber-950/10'
                            : status === 'preparing'
                            ? 'border-blue-500/40'
                            : status === 'completed'
                            ? 'border-emerald-500/40'
                            : 'border-white/10 opacity-70'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {order.customerName || 'عميل'}
                              </span>
                              <span className="font-mono text-[11px] text-neutral-400">
                                {order.phoneNumber}
                              </span>
                            </div>
                            {order.address && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-300/90 mt-0.5">
                                <span className="text-[10px] text-neutral-400">العنوان:</span>
                                <span>{order.address}</span>
                              </div>
                            )}
                            <span className="text-[10px] text-neutral-500">
                              {order.date || 'اليوم'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : status === 'preparing'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : status === 'cancelled'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {status === 'completed'
                                ? 'مكتمل'
                                : status === 'preparing'
                                ? 'جاري التجهيز'
                                : status === 'cancelled'
                                ? 'ملغي'
                                : 'جديد (قيد الانتظار)'}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-1.5 py-1">
                          {order.items?.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs text-neutral-300"
                            >
                              <span>
                                {it.name_ar} × <strong className="text-white">{it.quantity}</strong>
                              </span>
                              <span className="font-mono text-neutral-400">
                                {it.price * it.quantity} ج.م
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Customer Notes */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-neutral-400">
                            {order.notes ? `ملاحظات: ${order.notes}` : 'الإجمالي النهائي:'}
                          </span>
                          <span className="text-sm font-bold font-mono text-amber-400">
                            {order.total} ج.م
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 flex-wrap">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold transition-colors"
                          >
                            👨‍🍳 جاري التجهيز
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors"
                          >
                            ✅ اكتمل
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            className="px-2 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] transition-colors"
                          >
                            إلغاء
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-[11px] transition-colors"
                            title="حذف الطلب نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {order.phoneNumber && (
                            <button
                              onClick={() =>
                                openWhatsApp(
                                  order.phoneNumber,
                                  `مرحباً ${order.customerName}، يسعدنا إبلاغك بأن طلبك في بوخارست بلاك بإجمالي ${order.total} ج.م جاري تجهيزه حالياً وسيكون جاهزاً في أقرب وقت! شرفتنا دائماً.`
                                )
                              }
                              className="mr-auto px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] flex items-center gap-1 font-bold"
                              title="مراسلة العميل واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              واتساب
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 4: RESERVATIONS
          ========================================== */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-white/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-amber-400" />
                    إدارة ومتابعة حجوزات الطاولات ({liveReservations.length})
                  </h2>
                  <p className="text-xs text-neutral-400">
                    تأكيد وإلغاء حجوزات الطاولات والمناسبات مباشرة في Firestore
                  </p>
                </div>
              </div>

              {liveReservations.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 space-y-2 bg-[#111111] rounded-2xl border border-white/5">
                  <CalendarCheck className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-sm font-medium">لا توجد حجوزات مسجلة في السحابة حتى الآن</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveReservations.map((res) => {
                    const status = res.status || 'pending';
                    return (
                      <div
                        key={res.id}
                        className={`bg-[#121212] border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                          status === 'confirmed'
                            ? 'border-emerald-500/40'
                            : status === 'cancelled'
                            ? 'border-white/10 opacity-70'
                            : 'border-amber-500/40 bg-gradient-to-br from-[#121212] to-amber-950/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {res.customerName}
                              </span>
                              <span className="font-mono text-xs text-amber-400 font-bold">
                                ({res.guests} أفراد)
                              </span>
                            </div>
                            <span className="text-xs text-neutral-300 font-mono">
                              {res.date} • {res.time}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : status === 'cancelled'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {status === 'confirmed' ? 'حجز مؤكد' : status === 'cancelled' ? 'ملغي' : 'قيد المراجعة'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-neutral-300">
                          {res.seatingArea && (
                            <div>
                              <span className="text-neutral-500">منطقة الجلوس:</span> {res.seatingArea}
                            </div>
                          )}
                          {res.occasion && (
                            <div>
                              <span className="text-neutral-500">المناسبة:</span> {res.occasion}
                            </div>
                          )}
                          {res.specialRequests && (
                            <div>
                              <span className="text-neutral-500">طلبات خاصة:</span> {res.specialRequests}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors"
                          >
                            تأكيد الحجز
                          </button>
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs transition-colors"
                          >
                            إلغاء الحجز
                          </button>

                          <button
                            onClick={() => handleDeleteReservation(res.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs transition-colors"
                            title="حذف الحجز نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {res.phoneNumber && (
                            <button
                              onClick={() =>
                                openWhatsApp(
                                  res.phoneNumber,
                                  `مرحباً ${res.customerName}، يسعدنا في بوخارست بلاك تأكيد حجز طاولتكم لعدد (${res.guests}) أفراد بتاريخ ${res.date} الساعة ${res.time}. نتطلع لاستقبالكم وتقديم أفضل تجربة!`
                                )
                              }
                              className="mr-auto px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs flex items-center gap-1 font-bold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              واتساب
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB: ADVERTISEMENTS & BANNERS (Full CRUD & Auto F/Q)
          ========================================== */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <AdvertisementsManager
                onPreviewInApp={navigateToClientApp}
                showNotification={showNotification}
              />
            </div>
          )}

          {/* ==========================================
              TAB 5: CATEGORIES MANAGEMENT
          ========================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-white/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    إدارة أقسام قائمة الطعام ({categories.length})
                  </h2>
                  <p className="text-xs text-neutral-400">
                    إضافة وتعديل الأقسام وحفظها في سحابة Firestore
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingCat(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  إضافة قسم جديد
                </button>
              </div>

              {/* Add Category Drawer */}
              {isAddingCat && (
                <div className="bg-[#141414] border border-amber-500/40 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white">إضافة قسم جديد</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-300 block mb-1">اسم القسم بالعربية *</label>
                      <input
                        type="text"
                        placeholder="مثال: مشويات، طواجن، مقبلات..."
                        value={newCatData.name_ar}
                        onChange={(e) => setNewCatData({ ...newCatData, name_ar: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-300 block mb-1">اسم القسم بالإنجليزية</label>
                      <input
                        type="text"
                        placeholder="e.g. Grills, Casseroles, Appetizers..."
                        value={newCatData.name_en}
                        onChange={(e) => setNewCatData({ ...newCatData, name_en: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-300 block mb-1">
                      ملاحظة القسم الافتراضية / الأطباق الجانبية المقترحة (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: يقدم مع (بطاطس محمرة / أرز بالخلطة / سلطة كول سلو)"
                      value={newCatData.note_ar}
                      onChange={(e) => setNewCatData({ ...newCatData, note_ar: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsAddingCat(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-neutral-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={async () => {
                        if (!newCatData.name_ar.trim()) {
                          alert('يرجى كتابة اسم القسم بالعربية');
                          return;
                        }
                        const catId = `cat_${Date.now()}`;
                        const newCat: Category = {
                          id: catId,
                          name_ar: newCatData.name_ar.trim(),
                          name_en: newCatData.name_en.trim() || newCatData.name_ar.trim(),
                          note_ar: newCatData.note_ar.trim() || undefined,
                          display_order: categories.length + 1,
                        };
                        await saveCategory(newCat);
                        showNotification(`✅ تم إضافة قسم "${newCat.name_ar}" في Firestore`);
                        setNewCatData({ name_ar: '', name_en: '', note_ar: '', note_en: '' });
                        setIsAddingCat(false);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                    >
                      حفظ في Firestore
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Category Modal */}
              {editingCategory && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                  onClick={() => setEditingCategory(null)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-[#141414] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            تعديل اسم وبيانات القسم
                          </h3>
                          <p className="text-xs text-neutral-400">
                            يتم حفظ التعديلات فوراً في سحابة Firestore
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-neutral-400 hover:text-white p-1 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-neutral-200 block mb-1">
                          اسم القسم بالعربية *
                        </label>
                        <input
                          type="text"
                          value={editCatData.name_ar}
                          onChange={(e) => setEditCatData({ ...editCatData, name_ar: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="اسم القسم بالعربية"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-200 block mb-1">
                          اسم القسم بالإنجليزية
                        </label>
                        <input
                          type="text"
                          value={editCatData.name_en}
                          onChange={(e) => setEditCatData({ ...editCatData, name_en: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Category Name in English"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-200 block mb-1">
                          الملاحظة الافتراضية / الأطباق الجانبية للقسم (اختياري)
                        </label>
                        <input
                          type="text"
                          value={editCatData.note_ar}
                          onChange={(e) => setEditCatData({ ...editCatData, note_ar: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-neutral-500"
                          placeholder="مثال: يقدم مع (بطاطس محمرة / أرز بالخلطة / سلطة كول سلو)"
                        />
                        <p className="text-[10px] text-neutral-500 mt-1">
                          💡 هذه الأطباق تظهر كخيارات افتراضية للأصناف التي تنتمي لهذا القسم ما لم يتم تخصيص أطباق خاصة بها.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!editCatData.name_ar.trim()) {
                            alert('اسم القسم بالعربية مطلوب');
                            return;
                          }
                          const updatedCategory: Category = {
                            ...editingCategory,
                            name_ar: editCatData.name_ar.trim(),
                            name_en: editCatData.name_en.trim() || editCatData.name_ar.trim(),
                            note_ar: editCatData.note_ar.trim() || undefined,
                          };
                          await saveCategory(updatedCategory);
                          showNotification(`✅ تم تحديث قسم "${updatedCategory.name_ar}" بنجاح في Firestore`);
                          setEditingCategory(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs shadow-lg transition-all"
                      >
                        💾 حفظ التعديلات في Firestore
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const itemsCount = menuItems.filter((i) => i.category_id === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-[#111111] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-sm truncate">{cat.name_ar}</h4>
                        <p className="text-xs text-neutral-400 font-sans truncate">{cat.name_en}</p>
                        {cat.note_ar && (
                          <p className="text-[11px] text-amber-300/80 truncate mt-0.5" title={cat.note_ar}>
                            {cat.note_ar}
                          </p>
                        )}
                        <span className="text-[10px] text-amber-400 font-mono mt-1 inline-block">
                          {itemsCount} أصناف مرتبطة
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCatData({
                              name_ar: cat.name_ar || '',
                              name_en: cat.name_en || '',
                              note_ar: cat.note_ar || '',
                              note_en: cat.note_en || '',
                            });
                          }}
                          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="تعديل اسم القسم والملاحظات"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">تعديل</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (itemsCount > 0) {
                              alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${itemsCount} أصناف! يجب نقل أو حذف الأصناف التابعة له أولاً.`);
                              return;
                            }
                            if (confirm(`حذف قسم "${cat.name_ar}" من Firestore؟`)) {
                              await deleteCategory(cat.id);
                              showNotification('🗑️ تم حذف القسم من السحابة.');
                            }
                          }}
                          className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
                          title="حذف القسم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: GALLERY MANAGEMENT
          ========================================== */}
          {activeTab === 'gallery' && (
            <GalleryManager onNotify={showNotification} />
          )}

          {/* ==========================================
              TAB: PRICING, TAXES & CLOUDINARY CONTROL
          ========================================== */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Header & Main Save Bar */}
              <div className="bg-[#111111] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Percent className="w-5 h-5 text-amber-400" />
                    التحكم في الضرائب ورسوم الخدمة وسياسة الفواتير
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    يمكنك تفعيل أو إيقاف ضريبة القيمة المضافة ورسوم الخدمة في أي وقت، وتحديد نسبتها بدقة مع التحديث الفوري في سحابة Firestore
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSavePricing}
                  disabled={isSavingPricing}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingPricing ? 'جاري الحفظ...' : 'حفظ السياسة في Cloud Firestore'}</span>
                </button>
              </div>

              {/* Grid: VAT & Service Charge Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. VAT Control Card */}
                <div className="bg-[#141414] p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pricingForm.vatEnabled ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30' : 'bg-white/5 text-neutral-500 border border-white/10'}`}>
                        <Percent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">ضريبة القيمة المضافة (VAT)</h3>
                        <p className="text-[11px] text-neutral-400">القيمة الرسمية المضافة على الفاتورة</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setPricingForm({ ...pricingForm, vatEnabled: !pricingForm.vatEnabled })}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${pricingForm.vatEnabled ? 'bg-amber-400' : 'bg-neutral-700'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${pricingForm.vatEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300">
                        نسبة الضريبة المطبقة (%)
                      </label>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${pricingForm.vatEnabled ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-neutral-800 text-neutral-500'}`}>
                        {pricingForm.vatEnabled ? `مفعلة (${pricingForm.vatRatePercent}%)` : 'معطلة (٠%)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          disabled={!pricingForm.vatEnabled}
                          value={pricingForm.vatRatePercent}
                          onChange={(e) => setPricingForm({ ...pricingForm, vatRatePercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                          className={`w-full bg-black/70 border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono ${pricingForm.vatEnabled ? 'border-white/15 focus:border-amber-400' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
                          placeholder="14"
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono">%</span>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {[0, 5, 10, 14, 15].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            disabled={!pricingForm.vatEnabled}
                            onClick={() => setPricingForm({ ...pricingForm, vatRatePercent: rate })}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors ${pricingForm.vatRatePercent === rate && pricingForm.vatEnabled ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 hover:bg-white/10 text-neutral-400 border border-white/5'} disabled:opacity-30`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      عند التفعيل، تُحسب الضريبة تلقائياً على إجمالي الطلب ومجموع رسوم الخدمة، وتنعكس في سلة المشتريات وفاتورة الواتساب وتنبيهات المنيو.
                    </p>
                  </div>
                </div>

                {/* 2. Service Charge Control Card */}
                <div className="bg-[#141414] p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pricingForm.serviceChargeEnabled ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30' : 'bg-white/5 text-neutral-500 border border-white/10'}`}>
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">رسوم الخدمة (Service Charge)</h3>
                        <p className="text-[11px] text-neutral-400">رسوم صالة وخدمة الضيافة</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setPricingForm({ ...pricingForm, serviceChargeEnabled: !pricingForm.serviceChargeEnabled })}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${pricingForm.serviceChargeEnabled ? 'bg-amber-400' : 'bg-neutral-700'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${pricingForm.serviceChargeEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300">
                        نسبة رسوم الخدمة (%)
                      </label>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${pricingForm.serviceChargeEnabled ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-neutral-800 text-neutral-500'}`}>
                        {pricingForm.serviceChargeEnabled ? `مفعلة (${pricingForm.serviceChargeRatePercent}%)` : 'معطلة (٠%)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          disabled={!pricingForm.serviceChargeEnabled}
                          value={pricingForm.serviceChargeRatePercent}
                          onChange={(e) => setPricingForm({ ...pricingForm, serviceChargeRatePercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                          className={`w-full bg-black/70 border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono ${pricingForm.serviceChargeEnabled ? 'border-white/15 focus:border-amber-400' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
                          placeholder="12"
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono">%</span>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {[0, 8, 10, 12, 15].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            disabled={!pricingForm.serviceChargeEnabled}
                            onClick={() => setPricingForm({ ...pricingForm, serviceChargeRatePercent: rate })}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors ${pricingForm.serviceChargeRatePercent === rate && pricingForm.serviceChargeEnabled ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 hover:bg-white/10 text-neutral-400 border border-white/5'} disabled:opacity-30`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      عند التفعيل، تُضاف رسوم الخدمة مباشرة على مجموع الأصناف وتخضع لحساب الضريبة القانونية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Live Bill Simulator & Policy Preview */}
              <div className="bg-[#141414] p-5 rounded-2xl border border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-400" />
                      محاكي الفاتورة للعميل في الوقت الفعلي (Live Bill Simulator)
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      جرّب إدخال أي قيمة طلب لترى كيف ستظهر الفاتورة للعميل داخل التطبيق ورسالة الواتساب
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-xs text-neutral-400">طلب تجريبي:</span>
                    <input
                      type="number"
                      min="10"
                      step="50"
                      value={testSimulatorAmount}
                      onChange={(e) => setTestSimulatorAmount(Math.max(1, Number(e.target.value) || 0))}
                      className="w-20 bg-transparent text-white font-mono font-bold text-xs text-center border-b border-amber-400/50 focus:outline-none"
                    />
                    <span className="text-xs text-amber-400 font-bold">ج.م</span>
                  </div>
                </div>

                {/* Calculation breakdown */}
                {(() => {
                  const subtotal = testSimulatorAmount;
                  const service = (pricingForm.serviceChargeEnabled && pricingForm.serviceChargeRatePercent > 0)
                    ? Math.round(subtotal * (pricingForm.serviceChargeRatePercent / 100) * 100) / 100
                    : 0;
                  const vat = (pricingForm.vatEnabled && pricingForm.vatRatePercent > 0)
                    ? Math.round((subtotal + service) * (pricingForm.vatRatePercent / 100) * 100) / 100
                    : 0;
                  const total = Math.round((subtotal + service + vat) * 100) / 100;

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Live Bill Card */}
                      <div className="bg-black/80 rounded-xl p-4 border border-white/10 space-y-3 font-mono">
                        <div className="text-xs text-neutral-400 font-bold flex justify-between border-b border-white/10 pb-2">
                          <span>بيان الفاتورة التجريبي</span>
                          <span className="text-amber-400">بوخارست بلاك</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-neutral-300">
                            <span>المجموع الفرعي للطلب:</span>
                            <span>{subtotal.toFixed(2)} ج.م</span>
                          </div>

                          <div className="flex justify-between">
                            <span className={pricingForm.serviceChargeEnabled ? 'text-neutral-300' : 'text-neutral-600'}>
                              رسوم الخدمة ({pricingForm.serviceChargeEnabled ? `${pricingForm.serviceChargeRatePercent}%` : 'معطلة'}):
                            </span>
                            <span className={pricingForm.serviceChargeEnabled ? 'text-amber-300' : 'text-neutral-600'}>
                              {pricingForm.serviceChargeEnabled ? `+${service.toFixed(2)} ج.م` : '٠.٠٠ ج.م'}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className={pricingForm.vatEnabled ? 'text-neutral-300' : 'text-neutral-600'}>
                              ضريبة القيمة المضافة ({pricingForm.vatEnabled ? `${pricingForm.vatRatePercent}%` : 'معطلة'}):
                            </span>
                            <span className={pricingForm.vatEnabled ? 'text-amber-300' : 'text-neutral-600'}>
                              {pricingForm.vatEnabled ? `+${vat.toFixed(2)} ج.م` : '٠.٠٠ ج.م'}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-white/15 flex justify-between text-sm font-bold text-emerald-400">
                            <span>الإجمالي النهائي المطلوب:</span>
                            <span>{total.toFixed(2)} ج.م</span>
                          </div>
                        </div>
                      </div>

                      {/* Notice Generator Preview */}
                      <div className="bg-black/60 rounded-xl p-4 border border-white/10 space-y-3">
                        <div className="text-xs text-neutral-400 font-bold border-b border-white/10 pb-2">
                          التنويه القانوني التلقائي المعروض على المنيو والفواتير
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                            <span className="text-[10px] text-amber-400 block font-bold mb-1">باللغة العربية:</span>
                            <p className="text-neutral-200 leading-relaxed">
                              {pricingForm.serviceChargeEnabled && pricingForm.vatEnabled
                                ? `كل الأسعار بالجنيه المصري، وتخضع لـ ${pricingForm.serviceChargeRatePercent}% رسوم خدمة و${pricingForm.vatRatePercent}% ضريبة قيمة مضافة تُضاف على الفاتورة.`
                                : pricingForm.vatEnabled
                                ? `كل الأسعار بالجنيه المصري، وتخضع لـ ${pricingForm.vatRatePercent}% ضريبة قيمة مضافة تُضاف على الفاتورة.`
                                : pricingForm.serviceChargeEnabled
                                ? `كل الأسعار بالجنيه المصري، وتخضع لـ ${pricingForm.serviceChargeRatePercent}% رسوم خدمة تُضاف على الفاتورة.`
                                : 'كل الأسعار بالجنيه المصري وشاملة الحساب بالكامل بدون أي ضرائب أو رسوم إضافية.'}
                            </p>
                          </div>

                          <div className="bg-white/5 p-2.5 rounded-lg border border-white/5" dir="ltr">
                            <span className="text-[10px] text-amber-400 block font-bold mb-1 text-left">In English:</span>
                            <p className="text-neutral-200 leading-relaxed text-left text-[11px]">
                              {pricingForm.serviceChargeEnabled && pricingForm.vatEnabled
                                ? `All prices are in EGP and subject to ${pricingForm.serviceChargeRatePercent}% Service Charge & ${pricingForm.vatRatePercent}% VAT added to the bill.`
                                : pricingForm.vatEnabled
                                ? `All prices are in EGP and subject to ${pricingForm.vatRatePercent}% VAT added to the bill.`
                                : pricingForm.serviceChargeEnabled
                                ? `All prices are in EGP and subject to ${pricingForm.serviceChargeRatePercent}% Service Charge added to the bill.`
                                : 'All prices are in EGP and fully inclusive. No extra taxes or service charges apply.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Save button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePricing}
                    disabled={isSavingPricing}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSavingPricing ? 'جاري الحفظ في Firestore...' : 'حفظ وتطبيق التغييرات على سحابة Firestore'}</span>
                  </button>
                </div>
              </div>

              {/* Cloudinary CDN Management & Migration Card */}
              <div className="bg-[#141414] p-5 rounded-2xl border border-amber-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        سحابة Cloudinary CDN & نظام التحسين التلقائي (f_auto, q_auto)
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                          Active & Optimized
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        كافة صور الأطباق والمعرض والبانرات مخدمة عبر شبكة Cloudinary فائقة السرعة
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={executeImageMigration}
                    disabled={isMigratingAppImages}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isMigratingAppImages ? 'animate-spin' : ''}`} />
                    <span>{isMigratingAppImages ? 'جاري ترحيل وتحديث الصور...' : 'ترحيل كافة روابط وصور التطبيق إلى Cloudinary الآن'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-neutral-500 text-[10px] block">Cloud Name</span>
                    <span className="font-mono text-white font-bold">{CLOUDINARY_CONFIG.cloudName}</span>
                  </div>
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-neutral-500 text-[10px] block">Upload Preset (Unsigned)</span>
                    <span className="font-mono text-white font-bold">{CLOUDINARY_CONFIG.uploadPreset}</span>
                  </div>
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-neutral-500 text-[10px] block">Auto Optimization Flags</span>
                    <span className="font-mono text-emerald-400 font-bold">f_auto, q_auto (WebP/AVIF)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 7: RESTAURANT SETTINGS & INFO
          ========================================== */}
          {/* ==========================================
              TAB 7: WHATSAPP, SOCIAL MEDIA & RESTAURANT SETTINGS
          ========================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[#111111] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    التحكم في رقم الواتساب ولينكات السوشيال ميديا
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    أي تعديل هنا يتم حفظه مباشرة في Cloud Firestore ويتحدث فوراً في تطبيق الزبائن
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await updateRestaurantSettings(settingsData);
                    if (ok) {
                      showNotification('✅ تم حفظ كافة الإعدادات والروابط بنجاح في Cloud Firestore!');
                    }
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  حفظ التعديلات الآن
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await updateRestaurantSettings(settingsData);
                  if (ok) {
                    showNotification('✅ تم حفظ كافة الإعدادات والروابط بنجاح في Cloud Firestore!');
                  }
                }}
                className="space-y-6"
              >
                {/* SECTION 1: WHATSAPP & PHONE CALL */}
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">إعدادات الواتساب واستقبال الطلبات</h3>
                      <p className="text-[11px] text-neutral-400">الرقم الذي يستقبل رسائل طلبات الطعام وحجوزات الطاولات</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-200">
                        رقم الواتساب الرسمي (استقبال الطلبات والحجوزات) *
                      </label>
                      <input
                        type="text"
                        value={settingsData.whatsappRaw || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, whatsappRaw: e.target.value })}
                        placeholder="201201016669"
                        className="w-full bg-black/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                        dir="ltr"
                      />
                      <p className="text-[10px] text-neutral-400">
                        اكتب الرقم مع كود مصر 20 بدون علامة + أو مسافات (مثال: <span className="font-mono text-emerald-400">201201016669</span>)
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-200">
                        رقم الهاتف للاتصال المباشر (خدمة العملاء)
                      </label>
                      <input
                        type="text"
                        value={settingsData.phoneDisplay || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, phoneDisplay: e.target.value })}
                        placeholder="01201016669"
                        className="w-full bg-black/70 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                        dir="ltr"
                      />
                      <p className="text-[10px] text-neutral-400">
                        الرقم الظاهر للعملاء عند الضغط على زر "اتصل بنا"
                      </p>
                    </div>
                  </div>

                  {/* Test WhatsApp Link Button */}
                  <div className="pt-2 flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-neutral-300">
                      معاينة رابط الواتساب النشط حالياً:
                    </span>
                    <a
                      href={`https://wa.me/${(settingsData.whatsappRaw || '201201016669').replace(/\D/g, '')}?text=${encodeURIComponent('تجربة التواصل مع بوخارست بلاك')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      تجربة فتح محادثة الواتساب
                    </a>
                  </div>
                </div>

                {/* SECTION 2: SOCIAL MEDIA LINKS */}
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">روابط السوشيال ميديا وحسابات المطعم</h3>
                      <p className="text-[11px] text-neutral-400">الروابط التي تفتح عند ضغط الزبون على أزرار التواصل في الشاشة الرئيسية وقسم المزيد</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Facebook */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                          <span>رابط صفحة الفيسبوك (Facebook)</span>
                        </label>
                        {settingsData.facebookUrl && (
                          <a
                            href={settingsData.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            معاينة الرابط
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        value={settingsData.facebookUrl || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/bokharestblackeg"
                        className="w-full bg-black/70 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                        dir="ltr"
                      />
                    </div>

                    {/* Instagram */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                          <span>رابط حساب إنستجرام (Instagram)</span>
                        </label>
                        {settingsData.instagramUrl && (
                          <a
                            href={settingsData.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-pink-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            معاينة الرابط
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        value={settingsData.instagramUrl || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/bokharestblackeg"
                        className="w-full bg-black/70 border border-white/15 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                        dir="ltr"
                      />
                    </div>

                    {/* TikTok */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                          <span>رابط حساب تيك توك (TikTok)</span>
                        </label>
                        {settingsData.tiktokUrl && (
                          <a
                            href={settingsData.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-neutral-300 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            معاينة الرابط
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        value={settingsData.tiktokUrl || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, tiktokUrl: e.target.value })}
                        placeholder="https://tiktok.com/@bokharestblackeg"
                        className="w-full bg-black/70 border border-white/15 focus:border-neutral-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                        dir="ltr"
                      />
                    </div>

                    {/* Google Maps */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span>رابط خرائط جوجل (Google Maps Location)</span>
                        </label>
                        {settingsData.googleMapsUrl && (
                          <a
                            href={settingsData.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            معاينة الموقع
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        value={settingsData.googleMapsUrl || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, googleMapsUrl: e.target.value })}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full bg-black/70 border border-white/15 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: HOURS & ADDRESS */}
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">مواعيد العمل والعنوان</h3>
                      <p className="text-[11px] text-neutral-400">تظهر في الشاشة الرئيسية وبطاقات المعلومات</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        ساعات العمل بالعربية
                      </label>
                      <input
                        type="text"
                        value={settingsData.openingHours_ar || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, openingHours_ar: e.target.value })}
                        placeholder="يومياً من 12:00 ظهراً حتى 2:00 صباحاً"
                        className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        ساعات العمل بالإنجليزية
                      </label>
                      <input
                        type="text"
                        value={settingsData.openingHours_en || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, openingHours_en: e.target.value })}
                        placeholder="Daily: 12:00 PM – 2:00 AM"
                        className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        العنوان بالعربية
                      </label>
                      <input
                        type="text"
                        value={settingsData.address_ar || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, address_ar: e.target.value })}
                        placeholder="فرع الزقازيق - طريق الشوبك"
                        className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        العنوان بالإنجليزية
                      </label>
                      <input
                        type="text"
                        value={settingsData.address_en || ''}
                        onChange={(e) => setSettingsData({ ...settingsData, address_en: e.target.value })}
                        placeholder="Zagazig Branch - El-Shobak Road"
                        className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ التغييرات في سحابة Firebase (تحديث حي فوري)</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
