export type Language = 'ar' | 'en';

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
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
  rating?: number;
  feedbackComment?: string;
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
