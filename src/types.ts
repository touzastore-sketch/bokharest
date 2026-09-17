export type Language = 'ar' | 'en';

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  note_ar?: string;
  note_en?: string;
  iconName?: string;
  display_order?: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
  calories?: number;
  preparation_time?: string;
  badge_en?: string;
  badge_ar?: string;
  type?: 'hot' | 'cold';
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  tableNumber?: string;
  address?: string;
  type?: 'dine_in' | 'takeaway' | 'delivery';
  notes?: string;
  items: {
    name_ar: string;
    name_en: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  date: string;
  language: Language;
  status?: 'pending' | 'preparing' | 'completed' | 'cancelled';
  rating?: number;
  feedbackComment?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  notes: string;
}

export interface CustomerFeedback {
  id: string;
  orderId?: string;
  customerName?: string;
  phoneNumber?: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface ReservationRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  date: string;
  time: string;
  guests: number;
  seatingArea?: string;
  occasion?: string;
  specialRequests?: string;
  createdAt: string;
  language: Language;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface ReservationData {
  customerName: string;
  phoneNumber: string;
  date: string;
  time: string;
  guests: number;
  seatingArea?: string;
  occasion?: string;
  specialRequests?: string;
}

export interface PricingPolicy {
  currency_ar: string;
  currency_en: string;
  serviceChargeRate: number; // e.g. 0.12 for 12%
  serviceChargeEnabled: boolean; // toggle service charge on/off
  vatRate: number; // e.g. 0.14 for 14%
  vatEnabled: boolean; // toggle VAT on/off
  taxNotice_ar: string;
  taxNotice_en: string;
}

export interface RestaurantInfo {
  name_en: string;
  name_ar: string;
  tagline_en: string;
  tagline_ar: string;
  about_en: string;
  about_ar: string;
  whatsappPhone: string;
  whatsappRaw: string;
  whatsappUrl: string;
  phoneDisplay: string;
  phoneCall: string;
  googleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  address_en: string;
  address_ar: string;
  openingHours_en: string;
  openingHours_ar: string;
  pricingPolicy?: PricingPolicy;
  vatEnabled?: boolean;
  vatRate?: number;
  serviceChargeEnabled?: boolean;
  serviceChargeRate?: number;
  taxNotice_ar?: string;
  taxNotice_en?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  localUrl: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  category: 'ambiance' | 'dining' | 'drinks';
  category_ar: string;
  category_en: string;
  featured?: boolean;
}

export type AdvertisementActionType =
  | 'whatsapp'
  | 'external_url'
  | 'internal_page'
  | 'menu'
  | 'reservation'
  | 'cart'
  | 'none';

export interface AdvertisementHotspot {
  id: string;
  label?: string;
  xPercent: number;      // left percentage [0..100]
  yPercent: number;      // top percentage [0..100]
  widthPercent: number;  // width percentage [0..100]
  heightPercent: number; // height percentage [0..100]
  action: AdvertisementActionType;
  link?: string;
  whatsappMessage?: { ar: string; en: string };
}

export interface AdvertisementItem {
  id: string;
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  badge_ar?: string;
  badge_en?: string;
  badgeColor?: string;
  image: string;
  fallbackImage?: string;
  aspectRatio?: number; // width / height, e.g. 3168 / 1344
  action?: AdvertisementActionType;
  actionType?: AdvertisementActionType;
  actionLabel_ar?: string;
  actionLabel_en?: string;
  priority?: number;
  link?: string;
  targetId?: string;
  whatsappMessage?: { ar: string; en: string };
  hotspots?: AdvertisementHotspot[];
  active?: boolean;
}

export interface UploadedImageRecord {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  sizeBytes?: number;
  folder?: 'menu' | 'ads' | 'gallery' | 'general';
  createdAt: string;
  contentType?: string;
}

