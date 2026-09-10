import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Category, MenuItem, CartItem, OrderRecord, ReservationRecord, ReservationData, RestaurantInfo, Language, CustomerFeedback } from '../types';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS, OFFICIAL_RESTAURANT_INFO } from '../data/restaurantData';

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
  updateMenuItem: (item: MenuItem) => void;
  updateItemPrice: (id: string, newPrice: number) => void;
  toggleItemAvailability: (id: string) => void;
  toggleItemFeatured: (id: string) => void;
  resetMenuToDefaults: () => void;
  
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
  cartTotal: number;
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
  generateWhatsAppReservationMessage: (data: ReservationData) => string;
  sendWhatsAppReservation: (data: ReservationData) => { success: boolean; url: string; message: string };

  // Gallery Modal
  isGalleryOpen: boolean;
  setIsGalleryOpen: (open: boolean) => void;
  selectedGalleryIndex: number;
  setSelectedGalleryIndex: (index: number) => void;
  openGallery: (initialIndex?: number) => void;

  // Orders history
  orderHistory: OrderRecord[];
  
  // Favorites
  favorites: string[];
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  
  // Restaurant info
  restaurantInfo: RestaurantInfo;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'bokharest_lang',
  MENU_ITEMS: 'bokharest_menu_items_v1',
  CATEGORIES: 'bokharest_categories_v1',
  CART: 'bokharest_cart',
  FAVORITES: 'bokharest_favorites',
  ORDERS: 'bokharest_orders',
  CUSTOMER: 'bokharest_customer_info',
  RESERVATIONS: 'bokharest_reservations',
  FEEDBACK: 'bokharest_feedbacks',
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

  const openGallery = (initialIndex: number = 0) => {
    setSelectedGalleryIndex(initialIndex);
    setIsGalleryOpen(true);
  };

  // Synchronize document dir and lang attributes
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.lang = language;
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem(STORAGE_KEYS.LANG, language);
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

  // Save menu items when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
  }, [menuItems]);

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

  const toggleItemFeatured = (id: string) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, featured: !item.featured } : item));
  };

  const resetMenuToDefaults = () => {
    setCategories(INITIAL_CATEGORIES);
    setMenuItems(INITIAL_MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem, quantity: number = 1, notes: string = '') => {
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

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  }, [cart]);

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
        ci => `${ci.quantity} × ${ci.item.name_ar} — ${ci.item.price * ci.quantity} ج.م`
      ).join('\n');

      return `*بوخارست بلاك | BOKHAREST BLACK — طلب جديد* 🍽️
-----------------------------------
*اسم العميل:* ${customerInfo.name || 'عميل كريم'}
*رقم الهاتف:* \u202A${customerInfo.phone || 'غير محدد'}\u202C

*تفاصيل الطلب:*
${itemsList}

-----------------------------------
*الإجمالي:* ${cartTotal} ج.م
${customerInfo.notes ? `*ملاحظات خاصة:* ${customerInfo.notes}` : ''}
-----------------------------------
_تم إرسال الطلب عبر تطبيق بوخارست بلاك الرسمي_`;
    } else {
      const itemsList = cart.map(
        ci => `${ci.quantity} × ${ci.item.name_en} — ${ci.item.price * ci.quantity} EGP`
      ).join('\n');

      return `*BOKHAREST BLACK — NEW ORDER* 🍽️
-----------------------------------
*Customer:* ${customerInfo.name || 'Valued Guest'}
*Phone:* ${customerInfo.phone || 'Not provided'}

*Order Details:*
${itemsList}

-----------------------------------
*Total:* ${cartTotal} EGP
${customerInfo.notes ? `*Notes:* ${customerInfo.notes}` : ''}
-----------------------------------
_Sent via official Bokharest Black mobile application_`;
    }
  };

  const sendWhatsAppOrder = () => {
    const message = generateWhatsAppOrderMessage();
    if (!message) return { success: false, url: '', message: '' };

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${OFFICIAL_RESTAURANT_INFO.whatsappRaw}?text=${encodedMessage}`;

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
    const whatsappUrl = `https://wa.me/${OFFICIAL_RESTAURANT_INFO.whatsappRaw}?text=${encodedMessage}`;

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
    notes_placeholder: { ar: 'مثال: بدون بصل، صوص إضافي، درجة التسوية...', en: 'e.g., No onions, extra dressing...' },
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
        updateMenuItem,
        updateItemPrice,
        toggleItemAvailability,
        toggleItemFeatured,
        resetMenuToDefaults,
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
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        customerInfo,
        setCustomerInfo,
        generateWhatsAppOrderMessage,
        sendWhatsAppOrder,
        isReservationOpen,
        setIsReservationOpen,
        reservationHistory,
        generateWhatsAppReservationMessage,
        sendWhatsAppReservation,
        isGalleryOpen,
        setIsGalleryOpen,
        selectedGalleryIndex,
        setSelectedGalleryIndex,
        openGallery,
        orderHistory,
        favorites,
        toggleFavorite,
        isFavorite,
        restaurantInfo: OFFICIAL_RESTAURANT_INFO,
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
