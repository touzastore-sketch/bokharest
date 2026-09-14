import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Category, MenuItem, CartItem, OrderRecord, ReservationRecord, ReservationData, RestaurantInfo, Language, CustomerFeedback, AdvertisementItem, GalleryImage } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, OFFICIAL_RESTAURANT_INFO, MENU_PRICING_POLICY, UNIFIED_MENU_ITEM_IMAGE } from '../data/restaurantData';
import { INITIAL_ADVERTISEMENTS } from '../data/ads';
import { GALLERY_IMAGES } from '../data/galleryData';
import {
  seedFirestoreIfEmpty,
  subscribeToCategories,
  subscribeToMenuItems,
  subscribeToAdvertisements,
  subscribeToRestaurantInfo,
  subscribeToOrders,
  subscribeToReservations,
  subscribeToGallery,
  saveGalleryImageToFirestore,
  deleteGalleryImageFromFirestore,
  saveMenuItemToFirestore,
  deleteMenuItemFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveAdvertisementToFirestore,
  deleteAdvertisementFromFirestore,
  toggleAdvertisementActiveInFirestore,
  saveRestaurantInfoToFirestore,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  saveReservationToFirestore,
  deleteReservationFromFirestore,
  saveFeedbackToFirestore,
} from '../services/firestoreDataService';
import { autoSyncAllAppAssetsToFirebase, migrateAllAppImagesToFirebase } from '../services/firebaseStorageService';

interface CustomerInfo {
  name: string;
  phone: string;
  notes: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  
  // Navigation
  activeTab: 'home' | 'menu' | 'orders' | 'more';
  setActiveTab: (tab: 'home' | 'menu' | 'orders' | 'more') => void;
  
  // Menu data & management (centralized for Google Play & Admin readiness)
  categories: Category[];
  menuItems: MenuItem[];
  saveMenuItem: (item: MenuItem) => Promise<boolean>;
  deleteMenuItem: (itemId: string) => Promise<boolean>;
  updateMenuItem: (item: MenuItem) => void;
  updateItemPrice: (id: string, newPrice: number) => void;
  toggleItemAvailability: (id: string) => void;
  toggleItemFeatured: (id: string) => void;
  resetMenuToDefaults: () => void;
  refreshMenu: () => Promise<{ success: boolean; count: number }>;
  isMenuRefreshing: boolean;
  lastMenuRefreshed: Date;
  
  // Active selection & details modal
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedItemForDetail: MenuItem | null;
  setSelectedItemForDetail: (item: MenuItem | null) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartServiceCharge: number;
  cartVat: number;
  cartTotal: number;
  pricingPolicy: typeof MENU_PRICING_POLICY;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Customer info & WhatsApp order
  customerInfo: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  generateWhatsAppOrderMessage: () => string;
  sendWhatsAppOrder: () => { success: boolean; url: string; message: string; order?: OrderRecord };
  
  // Feedback & Customer Satisfaction
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  activeFeedbackOrder: OrderRecord | null;
  setActiveFeedbackOrder: (order: OrderRecord | null) => void;
  feedbacks: CustomerFeedback[];
  submitFeedback: (feedbackData: {
    orderId?: string;
    customerName?: string;
    phoneNumber?: string;
    rating: number;
    tags: string[];
    comment: string;
  }) => CustomerFeedback;

  // Table Reservations
  isReservationOpen: boolean;
  setIsReservationOpen: (open: boolean) => void;
  reservationHistory: ReservationRecord[];
  deleteReservation: (reservationId: string) => Promise<boolean>;
  clearAllReservations: () => void;
  generateWhatsAppReservationMessage: (data: ReservationData) => string;
  sendWhatsAppReservation: (data: ReservationData) => { success: boolean; url: string; message: string };

  // Gallery Modal & Cloud Data
  isGalleryOpen: boolean;
  setIsGalleryOpen: (open: boolean) => void;
  selectedGalleryIndex: number;
  setSelectedGalleryIndex: (index: number) => void;
  openGallery: (initialIndex?: number) => void;
  galleryImages: GalleryImage[];
  saveGalleryImage: (image: GalleryImage) => Promise<boolean>;
  deleteGalleryImage: (imageId: string) => Promise<boolean>;

  // Orders history
  orderHistory: OrderRecord[];
  deleteOrder: (orderId: string) => Promise<boolean>;
  clearAllOrders: () => void;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  
  // Restaurant info
  restaurantInfo: RestaurantInfo;
  saveRestaurantInfo: (info: RestaurantInfo) => Promise<boolean>;
  updateRestaurantSettings: (info: RestaurantInfo) => Promise<boolean>;

  // Advertisements & Banners Management
  advertisements: AdvertisementItem[];
  saveAdvertisement: (ad: AdvertisementItem) => Promise<boolean>;
  deleteAdvertisement: (adId: string) => Promise<boolean>;
  toggleAdvertisementActive: (adId: string, active: boolean) => Promise<boolean>;

  // Categories mutation
  saveCategory: (category: Category) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;

  // Firebase Cloud Storage & Image Upload Center
  isImageUploadCenterOpen: boolean;
  setIsImageUploadCenterOpen: (open: boolean) => void;
  openImageUploadCenter: () => void;
  firestoreSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';

  // Dedicated Image Migration Process
  isMigrationModalOpen: boolean;
  setIsMigrationModalOpen: (open: boolean) => void;
  isMigratingAppImages: boolean;
  migrationProgress: { current: number; total: number; itemName: string; percent: number } | null;
  migrationResult: { success: boolean; totalMigrated: number; menuItemsUpdated: number; message: string } | null;
  executeImageMigration: () => Promise<void>;
  closeMigrationModal: () => void;

  // Standalone Cloud Admin Dashboard
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  openAdmin: () => void;
  closeAdmin: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'bokharest_lang',
  MENU_ITEMS: 'bokharest_menu_items_v3',
  CATEGORIES: 'bokharest_categories_v2',
  CART: 'bokharest_cart_v2',
  FAVORITES: 'bokharest_favorites_v2',
  ORDERS: 'bokharest_orders',
  CUSTOMER: 'bokharest_customer_info',
  RESERVATIONS: 'bokharest_reservations',
  FEEDBACK: 'bokharest_feedbacks',
  GALLERY: 'bokharest_gallery_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language initialization: Default Arabic for authentic Egypt dining brand, or saved preference
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'en' ? 'en' : 'ar';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'orders' | 'more'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isReservationOpen, setIsReservationOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number>(0);

  // Firebase Cloud Storage Image Upload Center State
  const [isImageUploadCenterOpen, setIsImageUploadCenterOpen] = useState<boolean>(false);
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Standalone Cloud Admin Portal State
  const checkInitialAdminState = (): boolean => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash.startsWith('#/admin') ||
      search.includes('view=admin') ||
      search.includes('page=admin') ||
      search.includes('admin=true')
    );
  };

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(checkInitialAdminState);

  const openAdmin = () => {
    setIsAdminOpen(true);
    try {
      window.location.hash = '#/admin';
    } catch {
      // safe fallback for restricted iframes
    }
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    try {
      if (window.location.hash.includes('admin')) {
        window.location.hash = '';
      }
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      if (checkInitialAdminState()) {
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const openImageUploadCenter = () => {
    setIsImageUploadCenterOpen(true);
  };

  // Image Migration State & Actions
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState<boolean>(false);
  const [isMigratingAppImages, setIsMigratingAppImages] = useState<boolean>(false);
  const [migrationProgress, setMigrationProgress] = useState<{
    current: number;
    total: number;
    itemName: string;
    percent: number;
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    totalMigrated: number;
    menuItemsUpdated: number;
    message: string;
  } | null>(null);

  const executeImageMigration = async () => {
    setIsMigrationModalOpen(true);
    setIsMigratingAppImages(true);
    setMigrationResult(null);
    setMigrationProgress({
      current: 0,
      total: 13,
      itemName: 'بدء الاتصال بقاعدة بيانات Cloud Firestore...',
      percent: 5,
    });

    try {
      const res = await migrateAllAppImagesToFirebase((curr, tot, name, pct) => {
        setMigrationProgress({
          current: curr,
          total: tot,
          itemName: name,
          percent: pct || Math.round((curr / tot) * 100),
        });
      });

      if (res.success) {
        setMigrationResult({
          success: true,
          totalMigrated: res.totalMigrated,
          menuItemsUpdated: res.menuItemsUpdated || menuItems.length,
          message: `تم بنجاح نقل وتأكيد ${res.totalMigrated} صورة من صور التطبيق، وتحديث ${res.menuItemsUpdated || menuItems.length} صنف في قاعدة البيانات!`,
        });
      } else {
        setMigrationResult({
          success: false,
          totalMigrated: 0,
          menuItemsUpdated: 0,
          message: 'حدث تعذر جزئي أثناء المزامنة، يرجى المحاولة مرة أخرى.',
        });
      }
    } catch (err) {
      console.error('[AppContext] Migration error:', err);
      setMigrationResult({
        success: false,
        totalMigrated: 0,
        menuItemsUpdated: 0,
        message: 'حدث خطأ أثناء نقل الصور، يرجى التحقق من اتصال الإنترنت.',
      });
    } finally {
      setIsMigratingAppImages(false);
    }
  };

  const closeMigrationModal = () => {
    if (isMigratingAppImages) return;
    setIsMigrationModalOpen(false);
    setMigrationResult(null);
  };

  const openGallery = (initialIndex: number = 0) => {
    setSelectedGalleryIndex(initialIndex);
    setIsGalleryOpen(true);
  };

  // Gallery Images state backed by Firestore and local storage
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return saved ? JSON.parse(saved) : GALLERY_IMAGES;
    } catch {
      return GALLERY_IMAGES;
    }
  });

  const saveGalleryImage = async (image: GalleryImage): Promise<boolean> => {
    setGalleryImages(prev => {
      const existingIdx = prev.findIndex(img => img.id === image.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = image;
        return updated;
      }
      return [image, ...prev];
    });
    return await saveGalleryImageToFirestore(image);
  };

  const deleteGalleryImage = async (imageId: string): Promise<boolean> => {
    setGalleryImages(prev => prev.filter(img => img.id !== imageId));
    return await deleteGalleryImageFromFirestore(imageId);
  };

  // Synchronize document dir and lang attributes
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.lang = language;
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem(STORAGE_KEYS.LANG, language);

    // Clear legacy cache keys to ensure exclusively fresh menu data
    try {
      localStorage.removeItem('bokharest_menu_items_v1');
      localStorage.removeItem('bokharest_categories_v1');
      localStorage.removeItem('bokharest_cart');
      localStorage.removeItem('bokharest_favorites');
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('lang', lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => {
      const next = prev === 'ar' ? 'en' : 'ar';
      const dir = next === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.lang = next;
      document.documentElement.setAttribute('lang', next);
      return next;
    });
  };

  // Categories state with local caching
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Menu items state with local caching for dynamic updates / future control panel
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // Advertisements state with local caching
  const [advertisements, setAdvertisements] = useState<AdvertisementItem[]>(() => {
    try {
      const saved = localStorage.getItem('bokharest_advertisements_v2');
      return saved ? JSON.parse(saved) : INITIAL_ADVERTISEMENTS;
    } catch {
      return INITIAL_ADVERTISEMENTS;
    }
  });

  // Restaurant Info state with local caching
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(() => {
    try {
      const saved = localStorage.getItem('bokharest_restaurant_info_v1');
      return saved ? JSON.parse(saved) : OFFICIAL_RESTAURANT_INFO;
    } catch {
      return OFFICIAL_RESTAURANT_INFO;
    }
  });

  // Cloud Firestore Initialization and Real-time Synchronization
  useEffect(() => {
    setFirestoreSyncStatus('syncing');
    
    // 1. Seed or verify collections in Cloud Firestore
    seedFirestoreIfEmpty()
      .then((res) => {
        if (res.seeded) {
          console.log(`[AppContext] Cloud Firestore populated with ${res.menuItemsCount} dishes & ${res.categoriesCount} categories`);
        }
        setFirestoreSyncStatus('synced');
      })
      .catch((err) => {
        console.warn('[AppContext] Firestore seeding notice:', err);
        setFirestoreSyncStatus('error');
      });

    // 2. Real-time subscription to Categories in Cloud Firestore
    const unsubCategories = subscribeToCategories((remoteCategories) => {
      if (remoteCategories && remoteCategories.length > 0) {
        setCategories(remoteCategories);
        try {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteCategories));
        } catch {
          // ignore
        }
      }
    });

    // 3. Real-time subscription to Menu Items in Cloud Firestore
    const unsubMenuItems = subscribeToMenuItems((remoteItems) => {
      if (remoteItems && remoteItems.length > 0) {
        setMenuItems(remoteItems);
        try {
          localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(remoteItems));
        } catch {
          // ignore
        }
      }
    });

    // 4. Real-time subscription to Advertisements in Cloud Firestore
    const unsubAdvertisements = subscribeToAdvertisements((remoteAds) => {
      if (remoteAds && remoteAds.length > 0) {
        setAdvertisements(remoteAds);
        try {
          localStorage.setItem('bokharest_advertisements_v2', JSON.stringify(remoteAds));
        } catch {
          // ignore
        }
      }
    });

    // 5. Real-time subscription to Restaurant Info in Cloud Firestore
    const unsubRestaurantInfo = subscribeToRestaurantInfo((remoteInfo) => {
      if (remoteInfo) {
        setRestaurantInfo(remoteInfo);
        try {
          localStorage.setItem('bokharest_restaurant_info_v1', JSON.stringify(remoteInfo));
        } catch {
          // ignore
        }
      }
    });

    // 6. Real-time subscription to Gallery Images in Cloud Firestore
    const unsubGallery = subscribeToGallery((remoteGallery) => {
      if (remoteGallery && remoteGallery.length > 0) {
        setGalleryImages(remoteGallery);
        try {
          localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(remoteGallery));
        } catch {
          // ignore
        }
      }
    });

    // 7. Real-time subscription to Orders in Cloud Firestore (for live status updates)
    const unsubOrders = subscribeToOrders((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrderHistory(remoteOrders);
        try {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remoteOrders));
        } catch {
          // ignore
        }
      }
    });

    // 8. Real-time subscription to Reservations in Cloud Firestore (for live status updates)
    const unsubReservations = subscribeToReservations((remoteReservations) => {
      if (remoteReservations && remoteReservations.length > 0) {
        setReservationHistory(remoteReservations);
        try {
          localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(remoteReservations));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      unsubCategories();
      unsubMenuItems();
      unsubAdvertisements();
      unsubRestaurantInfo();
      unsubGallery();
      unsubOrders();
      unsubReservations();
    };
  }, []);

  // Auto-sync all app assets to Firebase Storage & Firestore with Auto F/Q
  useEffect(() => {
    autoSyncAllAppAssetsToFirebase()
      .then((res) => {
        if (res.menuItemUrl) {
          console.log('[AppContext] ✅ كافة صور التطبيق تمت مزامنتها تلقائياً على Firebase بنظام Auto F/Q');
        }
      })
      .catch((err) => {
        console.warn('[AppContext] Auto assets sync note:', err);
      });
  }, []);

  // Save menu items locally when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
    } catch {
      // ignore
    }
  }, [menuItems]);

  const saveMenuItem = async (item: MenuItem): Promise<boolean> => {
    setMenuItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const updated = exists ? prev.map((i) => (i.id === item.id ? item : i)) : [item, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    const ok = await saveMenuItemToFirestore(item);
    return ok;
  };

  const deleteMenuItem = async (itemId: string): Promise<boolean> => {
    setMenuItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      try {
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    const ok = await deleteMenuItemFromFirestore(itemId);
    return ok;
  };

  const updateRestaurantSettings = async (info: RestaurantInfo): Promise<boolean> => {
    const rawNumber = (info.whatsappRaw || '').replace(/\D/g, '');
    const cleanWa = rawNumber || '201201016669';
    const preparedInfo: RestaurantInfo = {
      ...info,
      whatsappRaw: cleanWa,
      whatsappPhone: info.whatsappPhone || (cleanWa.startsWith('2') ? `+${cleanWa}` : `+2${cleanWa}`),
      whatsappUrl: `https://wa.me/${cleanWa}`,
      phoneCall: info.phoneCall || info.phoneDisplay,
    };
    setRestaurantInfo(preparedInfo);
    try {
      localStorage.setItem('bokharest_restaurant_info_v1', JSON.stringify(preparedInfo));
    } catch {}
    return await saveRestaurantInfoToFirestore(preparedInfo);
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    saveMenuItemToFirestore(updatedItem);
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setMenuItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, price: newPrice } : item);
      const target = next.find(item => item.id === id);
      if (target) saveMenuItemToFirestore(target);
      return next;
    });
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, available: !item.available } : item);
      const target = next.find(item => item.id === id);
      if (target) saveMenuItemToFirestore(target);
      return next;
    });
  };

  const toggleItemFeatured = (id: string) => {
    setMenuItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, featured: !item.featured } : item);
      const target = next.find(item => item.id === id);
      if (target) saveMenuItemToFirestore(target);
      return next;
    });
  };

  const resetMenuToDefaults = () => {
    setCategories(INITIAL_CATEGORIES);
    setMenuItems(INITIAL_MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  };

  const saveAdvertisement = async (ad: AdvertisementItem): Promise<boolean> => {
    setAdvertisements((prev) => {
      const exists = prev.some((a) => a.id === ad.id);
      return exists ? prev.map((a) => (a.id === ad.id ? ad : a)) : [ad, ...prev];
    });
    return await saveAdvertisementToFirestore(ad);
  };

  const deleteAdvertisement = async (adId: string): Promise<boolean> => {
    setAdvertisements((prev) => prev.filter((a) => a.id !== adId));
    return await deleteAdvertisementFromFirestore(adId);
  };

  const toggleAdvertisementActive = async (adId: string, active: boolean): Promise<boolean> => {
    setAdvertisements((prev) => prev.map((a) => (a.id === adId ? { ...a, active } : a)));
    return await toggleAdvertisementActiveInFirestore(adId, active);
  };

  const saveCategory = async (cat: Category): Promise<boolean> => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      return exists ? prev.map((c) => (c.id === cat.id ? cat : c)) : [...prev, cat];
    });
    return await saveCategoryToFirestore(cat);
  };

  const deleteCategory = async (catId: string): Promise<boolean> => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    return await deleteCategoryFromFirestore(catId);
  };

  const saveRestaurantInfo = async (info: RestaurantInfo): Promise<boolean> => {
    setRestaurantInfo(info);
    return await saveRestaurantInfoToFirestore(info);
  };

  // Pull-to-refresh & synchronization for fine-dining menu
  const [lastMenuRefreshed, setLastMenuRefreshed] = useState<Date>(new Date());
  const [isMenuRefreshing, setIsMenuRefreshing] = useState<boolean>(false);

  const refreshMenu = async (): Promise<{ success: boolean; count: number }> => {
    setIsMenuRefreshing(true);
    // Simulate real-time fine dining catalog sync and cache re-evaluation
    await new Promise(resolve => setTimeout(resolve, 850));
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
      if (saved) {
        setMenuItems(JSON.parse(saved));
      } else {
        setMenuItems(INITIAL_MENU_ITEMS);
      }
    } catch {
      setMenuItems(INITIAL_MENU_ITEMS);
    }
    setLastMenuRefreshed(new Date());
    setIsMenuRefreshing(false);
    return { success: true, count: menuItems.length };
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (!saved) return [];
      const parsed: CartItem[] = JSON.parse(saved);
      return parsed.map((ci) => ({
        ...ci,
        item: {
          ...ci.item,
          image: UNIFIED_MENU_ITEM_IMAGE,
        },
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem, quantity: number = 1, notes: string = '') => {
    if (item.available === false) {
      return;
    }
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.item.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          notes: notes || next[existingIndex].notes,
        };
        return next;
      }
      return [...prev, { item, quantity, notes }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        return prev.filter(ci => ci.item.id !== itemId);
      }
      return prev.map(ci => ci.item.id === itemId ? { ...ci, quantity } : ci);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  // Subtotal (sum of menu item prices)
  const cartSubtotal = useMemo(() => {
    const raw = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    return Math.round(raw * 100) / 100;
  }, [cart]);

  // 12% Service charge
  const cartServiceCharge = useMemo(() => {
    return Math.round(cartSubtotal * MENU_PRICING_POLICY.serviceChargeRate * 100) / 100;
  }, [cartSubtotal]);

  // 14% VAT applied on the bill (Subtotal + Service Charge)
  const cartVat = useMemo(() => {
    return Math.round((cartSubtotal + cartServiceCharge) * MENU_PRICING_POLICY.vatRate * 100) / 100;
  }, [cartSubtotal, cartServiceCharge]);

  // Final Total including service charge and VAT
  const cartTotal = useMemo(() => {
    return Math.round((cartSubtotal + cartServiceCharge + cartVat) * 100) / 100;
  }, [cartSubtotal, cartServiceCharge, cartVat]);

  // Customer Info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      return saved ? JSON.parse(saved) : { name: '', phone: '', notes: '' };
    } catch {
      return { name: '', phone: '', notes: '' };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customerInfo));
  }, [customerInfo]);

  // Order history
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orderHistory));
  }, [orderHistory]);

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    setOrderHistory(prev => prev.filter(o => o.id !== orderId));
    return await deleteOrderFromFirestore(orderId);
  };

  const clearAllOrders = () => {
    setOrderHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
    } catch {}
  };

  // Reservation history
  const [reservationHistory, setReservationHistory] = useState<ReservationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservationHistory));
  }, [reservationHistory]);

  const deleteReservation = async (reservationId: string): Promise<boolean> => {
    setReservationHistory(prev => prev.filter(r => r.id !== reservationId));
    return await deleteReservationFromFirestore(reservationId);
  };

  const clearAllReservations = () => {
    setReservationHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    } catch {}
  };

  // Customer Feedback & Rating state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState<OrderRecord | null>(null);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
  }, [feedbacks]);

  const submitFeedback = (data: {
    orderId?: string;
    customerName?: string;
    phoneNumber?: string;
    rating: number;
    tags: string[];
    comment: string;
  }): CustomerFeedback => {
    const newFeedback: CustomerFeedback = {
      id: 'FB-' + Date.now(),
      orderId: data.orderId,
      customerName: data.customerName || customerInfo.name,
      phoneNumber: data.phoneNumber || customerInfo.phone,
      rating: data.rating,
      tags: data.tags,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };

    setFeedbacks(prev => [newFeedback, ...prev]);
    saveFeedbackToFirestore(newFeedback);

    // If linked to an order, update rating on that order in order history
    if (data.orderId) {
      setOrderHistory(prev =>
        prev.map(ord =>
          ord.id === data.orderId
            ? { ...ord, rating: data.rating, feedbackComment: data.comment }
            : ord
        )
      );
    }

    return newFeedback;
  };

  // Favorites (Starts completely clean and empty as user requested)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear old mock/sample defaults if stored previously
        const legacyDefault = ['pasta-alfredo', 'pizza-bokharest', 'platter-bokharest-grill'];
        const isLegacySample = Array.isArray(parsed) &&
          parsed.length === legacyDefault.length &&
          legacyDefault.every(id => parsed.includes(id));
        if (isLegacySample) {
          localStorage.removeItem(STORAGE_KEYS.FAVORITES);
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  // Generate WhatsApp order message matching exact prompt specification
  const generateWhatsAppOrderMessage = (): string => {
    if (cart.length === 0) return '';

    if (language === 'ar') {
      const itemsList = cart.map(
        ci => `• ${ci.quantity} × ${ci.item.name_ar} — ${(ci.item.price * ci.quantity).toFixed(2)} ج.م${ci.notes ? ` (${ci.notes})` : ''}`
      ).join('\n');

      return `*بوخارست بلاك | BOKHAREST BLACK — طلب جديد* 🍽️
-----------------------------------
*اسم العميل:* ${customerInfo.name || 'عميل كريم'}
*رقم الهاتف:* \u202A${customerInfo.phone || 'غير محدد'}\u202C

*تفاصيل الأصناف المطلوبة:*
${itemsList}

-----------------------------------
*المجموع الفرعي:* ${cartSubtotal.toFixed(2)} ج.م
*رسوم الخدمة (12%):* ${cartServiceCharge.toFixed(2)} ج.م
*ضريبة القيمة المضافة (14%):* ${cartVat.toFixed(2)} ج.م
*الإجمالي النهائي المطلوب:* ${cartTotal.toFixed(2)} ج.م
${customerInfo.notes ? `\n*ملاحظات خاصة:* ${customerInfo.notes}\n` : ''}-----------------------------------
_تخضع جميع الأسعار لـ 12% رسوم خدمة و14% ضريبة قيمة مضافة_
_تم إرسال الطلب عبر تطبيق بوخارست بلاك الرسمي_`;
    } else {
      const itemsList = cart.map(
        ci => `• ${ci.quantity} × ${ci.item.name_en} — ${(ci.item.price * ci.quantity).toFixed(2)} EGP${ci.notes ? ` (${ci.notes})` : ''}`
      ).join('\n');

      return `*BOKHAREST BLACK — NEW ORDER* 🍽️
-----------------------------------
*Customer:* ${customerInfo.name || 'Valued Guest'}
*Phone:* ${customerInfo.phone || 'Not provided'}

*Order Items:*
${itemsList}

-----------------------------------
*Subtotal:* ${cartSubtotal.toFixed(2)} EGP
*Service Charge (12%):* ${cartServiceCharge.toFixed(2)} EGP
*VAT (14%):* ${cartVat.toFixed(2)} EGP
*Final Total:* ${cartTotal.toFixed(2)} EGP
${customerInfo.notes ? `\n*Special Notes:* ${customerInfo.notes}\n` : ''}-----------------------------------
_All prices are subject to 12% Service Charge & 14% VAT_
_Sent via official Bokharest Black mobile application_`;
    }
  };

  const sendWhatsAppOrder = () => {
    const message = generateWhatsAppOrderMessage();
    if (!message) return { success: false, url: '', message: '' };

    const encodedMessage = encodeURIComponent(message);
    const targetWhatsapp = (restaurantInfo.whatsappRaw || OFFICIAL_RESTAURANT_INFO.whatsappRaw || '201201016669').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodedMessage}`;

    // Record order in order history
    const newRecord: OrderRecord = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customerName: customerInfo.name || (language === 'ar' ? 'عميل كريم' : 'Valued Guest'),
      phoneNumber: customerInfo.phone || '',
      notes: customerInfo.notes,
      items: cart.map(ci => ({
        name_ar: ci.item.name_ar,
        name_en: ci.item.name_en,
        price: ci.item.price,
        quantity: ci.quantity,
      })),
      total: cartTotal,
      date: new Date().toISOString(),
      language,
    };

    setOrderHistory(prev => [newRecord, ...prev]);
    saveOrderToFirestore(newRecord);

    return {
      success: true,
      url: whatsappUrl,
      message,
    };
  };

  // Generate WhatsApp reservation message matching restaurant brand etiquette
  const generateWhatsAppReservationMessage = (data: ReservationData): string => {
    const { customerName, phoneNumber, date, time, guests, seatingArea, specialRequests } = data;

    if (language === 'ar') {
      const parts = [
        `*بوخارست بلاك | BOKHAREST BLACK — طلب حجز طاولة* 🍽️🥂`,
        `-----------------------------------`,
        `*اسم الضيف:* ${customerName || 'عميل كريم'}`,
        `*رقم الهاتف:* \u202A${phoneNumber || 'غير محدد'}\u202C`,
        `*تاريخ الحجز:* \u202A${date}\u202C`,
        `*الوقت:* \u202A${time}\u202C`,
        `*عدد الضيوف:* ${guests} ${guests > 2 ? 'أشخاص' : 'أفراد'}`,
      ];
      if (seatingArea) parts.push(`*منطقة الجلوس المفضلة:* ${seatingArea}`);
      if (specialRequests) parts.push(`*طلبات خاصة:* ${specialRequests}`);
      parts.push(
        `-----------------------------------`,
        `_تم إرسال طلب الحجز عبر تطبيق بوخارست بلاك الرسمي_`,
        `_نرجو تأكيد إمكانية الحجز وتوفر الطاولة_`
      );
      return parts.join('\n');
    } else {
      const parts = [
        `*BOKHAREST BLACK — TABLE RESERVATION REQUEST* 🍽️🥂`,
        `-----------------------------------`,
        `*Guest Name:* ${customerName || 'Valued Guest'}`,
        `*Phone Number:* ${phoneNumber || 'Not provided'}`,
        `*Reservation Date:* ${date}`,
        `*Time Slot:* ${time}`,
        `*Number of Guests:* ${guests} ${guests > 1 ? 'Guests' : 'Guest'}`,
      ];
      if (seatingArea) parts.push(`*Seating Area:* ${seatingArea}`);
      if (specialRequests) parts.push(`*Special Requests:* ${specialRequests}`);
      parts.push(
        `-----------------------------------`,
        `_Sent via official Bokharest Black mobile application_`,
        `_Please confirm table availability_`
      );
      return parts.join('\n');
    }
  };

  const sendWhatsAppReservation = (data: ReservationData) => {
    const message = generateWhatsAppReservationMessage(data);
    if (!message) return { success: false, url: '', message: '' };

    const encodedMessage = encodeURIComponent(message);
    const targetWhatsapp = (restaurantInfo.whatsappRaw || OFFICIAL_RESTAURANT_INFO.whatsappRaw || '201201016669').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodedMessage}`;

    // Record reservation in history
    const newRecord: ReservationRecord = {
      id: 'RES-' + Math.floor(100000 + Math.random() * 900000),
      customerName: data.customerName || (language === 'ar' ? 'عميل كريم' : 'Valued Guest'),
      phoneNumber: data.phoneNumber || '',
      date: data.date,
      time: data.time,
      guests: data.guests,
      seatingArea: data.seatingArea,
      occasion: data.occasion,
      specialRequests: data.specialRequests,
      createdAt: new Date().toISOString(),
      language,
    };

    setReservationHistory(prev => [newRecord, ...prev]);
    saveReservationToFirestore(newRecord);

    return {
      success: true,
      url: whatsappUrl,
      message,
    };
  };

  // Translations dictionary for instant UI switching
  const translations: Record<string, { ar: string; en: string }> = {
    // Navigation
    home: { ar: 'الرئيسية', en: 'Home' },
    menu: { ar: 'المنيو', en: 'Menu' },
    orders: { ar: 'طلباتي', en: 'Orders' },
    more: { ar: 'المزيد', en: 'More' },
    
    // Actions & Buttons
    view_menu: { ar: 'عرض المنيو', en: 'View Menu' },
    order_now: { ar: 'اطلب الآن', en: 'Order Now' },
    add_to_order: { ar: 'إضافة إلى الطلب', en: 'Add to Order' },
    added_to_cart: { ar: 'تمت الإضافة', en: 'Added' },
    your_order: { ar: 'طلبك', en: 'Your Order' },
    continue_whatsapp: { ar: 'متابعة عبر واتساب', en: 'Continue to WhatsApp' },
    view_cart: { ar: 'معاينة الطلب', en: 'View Order' },
    clear_order: { ar: 'إفراغ السلة', en: 'Clear Cart' },
    search_placeholder: { ar: 'ابحث في قائمة بوخارست بلاك...', en: 'Search Bokharest Black menu...' },
    all_categories: { ar: 'الكل', en: 'All' },
    chefs_selection: { ar: 'اختيارات الشيف', en: "Chef's Selection" },
    popular_categories: { ar: 'الأقسام المميزة', en: 'Featured Categories' },
    find_us: { ar: 'زورونا', en: 'Find Us' },
    open_maps: { ar: 'فتح الموقع على خرائط Google', en: 'Open in Google Maps' },
    get_directions: { ar: 'الحصول على الاتجاهات', en: 'Get Directions' },
    about_title: { ar: 'عن بوخارست بلاك', en: 'About Bokharest Black' },
    follow_us: { ar: 'تابع بوخارست بلاك', en: 'Follow Bokharest Black' },
    hours: { ar: 'ساعات العمل', en: 'Opening Hours' },
    call_us: { ar: 'اتصال هاتفي', en: 'Call Restaurant' },
    favorites: { ar: 'المفضلة', en: 'Favorites' },
    subtotal: { ar: 'المجموع الفرعي', en: 'Subtotal' },
    total: { ar: 'الإجمالي', en: 'Total' },
    egp: { ar: 'ج.م', en: 'EGP' },
    customer_name: { ar: 'اسم العميل', en: 'Customer Name' },
    customer_phone: { ar: 'رقم الهاتف (واتساب)', en: 'Phone Number (WhatsApp)' },
    special_notes: { ar: 'ملاحظات خاصة (اختياري)', en: 'Special Notes (Optional)' },
    notes_placeholder: { ar: 'اكتب اختيار الطبق الجانبي أو أي ملاحظات أخرى...', en: 'Specify your side dish choice or special requests...' },
    empty_cart_title: { ar: 'سلة طلبك فارغة', en: 'Your cart is empty' },
    empty_cart_desc: { ar: 'استكشف قائمتنا الفاخرة واختر أشهى الأطباق والمشروبات', en: 'Explore our luxurious menu and indulge in fine dishes and signature drinks.' },
    empty_orders_title: { ar: 'لا توجد طلبات سابقة', en: 'No previous orders' },
    empty_orders_desc: { ar: 'ستظهر هنا تفاصيل الطلبات التي ترسلها عبر واتساب', en: 'Orders you place via WhatsApp will be recorded here.' },
    order_sent_success: { ar: 'تم تجهيز رسالة طلبك بنجاح!', en: 'Order generated successfully!' },
    redirecting_whatsapp: { ar: 'جارٍ فتح تطبيق واتساب...', en: 'Opening WhatsApp...' },
    copy_order: { ar: 'نسخ نص الطلب', en: 'Copy Order Text' },
    copied: { ar: 'تم النسخ!', en: 'Copied!' },
    open_whatsapp_web: { ar: 'فتح واتساب ويب', en: 'Open WhatsApp Web' },
    unavailable: { ar: 'غير متوفر حالياً', en: 'Currently Unavailable' },
    app_settings: { ar: 'إعدادات التطبيق', en: 'App Settings' },
    switch_language: { ar: 'تغيير اللغة (English)', en: 'Switch to Arabic (العربية)' },
    admin_preview: { ar: 'لوحة تحكم الأسعار والمنيو', en: 'Menu & Price Manager' },

    // Reservations specific translations
    reservations: { ar: 'الحجوزات', en: 'Reservations' },
    book_table: { ar: 'حجز طاولة', en: 'Book a Table' },
    table_reservation: { ar: 'حجز طاولة فاخرة', en: 'Luxury Table Reservation' },
    table_reservation_desc: { ar: 'اختر الموعد وعدد الضيوف وسنقوم بتأكيد حجزك وتجهيز طاولتك فوراً عبر واتساب', en: 'Select date, time, and party size to confirm your table directly via WhatsApp' },
    reservation_date: { ar: 'تاريخ الحجز', en: 'Reservation Date' },
    reservation_time: { ar: 'وقت الحجز', en: 'Reservation Time' },
    guests_count: { ar: 'عدد الضيوف', en: 'Number of Guests' },
    guests: { ar: 'ضيوف', en: 'Guests' },
    guest_singular: { ar: 'ضيف', en: 'Guest' },
    seating_preference: { ar: 'منطقة الجلوس المفضلة', en: 'Seating Preference' },
    seating_indoor: { ar: 'الصالة الداخلية الفاخرة', en: 'Indoor Luxury Lounge' },
    seating_outdoor: { ar: 'التراس المفتوح (في الهواء الطلق)', en: 'Outdoor Terrace' },
    seating_vip: { ar: 'صالة VIP خاصة للمناسبات', en: 'VIP Private Area' },
    seating_nonsmoking: { ar: 'منطقة لغير المدخنين', en: 'Non-Smoking Zone' },
    occasion: { ar: 'نوع المناسبة (اختياري)', en: 'Occasion (Optional)' },
    occasion_casual: { ar: 'عشاء / غداء عادي', en: 'Casual Dining' },
    occasion_birthday: { ar: 'عيد ميلاد', en: 'Birthday Celebration' },
    occasion_anniversary: { ar: 'ذكرى سنوية', en: 'Anniversary' },
    occasion_business: { ar: 'اجتماع أو غداء عمل', en: 'Business Meeting' },
    occasion_romantic: { ar: 'عشاء رومانسي', en: 'Romantic Dinner' },
    occasion_family: { ar: 'تجمع عائلي', en: 'Family Gathering' },
    special_requests: { ar: 'طلبات خاصة أو تجهيزات إضافية', en: 'Special Requests (Optional)' },
    special_requests_placeholder: { ar: 'مثال: طاولة جانبية هادئة، تورتة عيد ميلاد، مقعد أطفال...', en: 'e.g. Quiet corner table, high chair, birthday surprise...' },
    submit_reservation: { ar: 'تأكيد الحجز عبر واتساب', en: 'Confirm Reservation via WhatsApp' },
    reservation_sent_success: { ar: 'تم تجهيز تفاصيل حجزك بنجاح!', en: 'Reservation details prepared!' },
    reservation_history: { ar: 'سجل الحجوزات', en: 'Reservation History' },
    no_reservations: { ar: 'لا توجد حجوزات سابقة', en: 'No previous reservations' },
    no_reservations_desc: { ar: 'ستظهر هنا تفاصيل الحجوزات التي ترسلها عبر واتساب', en: 'Reservations you send via WhatsApp will appear here' },
    today: { ar: 'اليوم', en: 'Today' },
    tomorrow: { ar: 'غداً', en: 'Tomorrow' },
    day_after_tomorrow: { ar: 'بعد غد', en: 'In 2 Days' },
    pick_custom_date: { ar: 'اختيار تاريخ آخر', en: 'Choose Custom Date' },
    contact_details_reservation: { ar: 'بيانات الضيف للتواصل', en: 'Guest Contact Information' },
    copy_reservation: { ar: 'نسخ تفاصيل الحجز', en: 'Copy Reservation Text' },
    new_reservation: { ar: 'حجز جديد', en: 'New Reservation' },

    // Pull to refresh translations
    pull_to_refresh: { ar: 'اسحب لأسفل لتحديث قائمة الطعام...', en: 'Pull down to refresh menu...' },
    release_to_refresh: { ar: 'أفلت لتحديث القائمة الآن', en: 'Release to refresh menu now' },
    refreshing_menu: { ar: 'جاري تحديث أحدث أطباق بوخارست بلاك...', en: 'Updating latest fine-dining offerings...' },
    menu_refreshed: { ar: 'تم تحديث القائمة بأحدث الإبداعات ✨', en: 'Menu updated with latest offerings ✨' },
    menu_up_to_date: { ar: 'القائمة محدثة بالكامل', en: 'Menu is up to date' },
    refresh_now: { ar: 'تحديث القائمة', en: 'Refresh Menu' },
    last_updated: { ar: 'آخر تحديث: للتو', en: 'Updated: Just now' },
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        activeTab,
        setActiveTab,
        categories,
        menuItems,
        saveMenuItem,
        deleteMenuItem,
        updateMenuItem,
        updateItemPrice,
        toggleItemAvailability,
        toggleItemFeatured,
        resetMenuToDefaults,
        refreshMenu,
        isMenuRefreshing,
        lastMenuRefreshed,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedItemForDetail,
        setSelectedItemForDetail,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartServiceCharge,
        cartVat,
        cartTotal,
        pricingPolicy: MENU_PRICING_POLICY,
        isCartOpen,
        setIsCartOpen,
        customerInfo,
        setCustomerInfo,
        generateWhatsAppOrderMessage,
        sendWhatsAppOrder,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        activeFeedbackOrder,
        setActiveFeedbackOrder,
        feedbacks,
        submitFeedback,
        isReservationOpen,
        setIsReservationOpen,
        reservationHistory,
        deleteReservation,
        clearAllReservations,
        generateWhatsAppReservationMessage,
        sendWhatsAppReservation,
        isGalleryOpen,
        setIsGalleryOpen,
        selectedGalleryIndex,
        setSelectedGalleryIndex,
        openGallery,
        galleryImages,
        saveGalleryImage,
        deleteGalleryImage,
        orderHistory,
        deleteOrder,
        clearAllOrders,
        favorites,
        toggleFavorite,
        isFavorite,
        restaurantInfo,
        saveRestaurantInfo,
        updateRestaurantSettings,
        advertisements,
        saveAdvertisement,
        deleteAdvertisement,
        toggleAdvertisementActive,
        saveCategory,
        deleteCategory,
        isImageUploadCenterOpen,
        setIsImageUploadCenterOpen,
        openImageUploadCenter,
        firestoreSyncStatus,
        isMigrationModalOpen,
        setIsMigrationModalOpen,
        isMigratingAppImages,
        migrationProgress,
        migrationResult,
        executeImageMigration,
        closeMigrationModal,
        isAdminOpen,
        setIsAdminOpen,
        openAdmin,
        closeAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
