import { AdvertisementItem, AdvertisementHotspot, AdvertisementActionType } from '../types';

/**
 * Advertisement Configuration Constants
 * Decoupled settings for autoplay, transition timing, gestures, and CMS integration.
 */
export interface AdvertisementConfig {
  autoPlayIntervalMs: number;
  transitionDurationMs: number;
  pauseOnHover: boolean;
  dragThresholdPx: number;
  bannerAspectRatio: number; // width / height (e.g. 3168 / 1344)
  firebaseCollectionName: string; // Ready for Firestore / CMS sync
  defaultWhatsAppMessage: {
    ar: string;
    en: string;
  };
}

export const ADVERTISEMENT_CONFIG: AdvertisementConfig = {
  autoPlayIntervalMs: 5000,
  transitionDurationMs: 450,
  pauseOnHover: true,
  dragThresholdPx: 40,
  bannerAspectRatio: 3168 / 1344, // 2.357:1 exact aspect ratio of original banner
  firebaseCollectionName: 'advertisements',
  defaultWhatsAppMessage: {
    ar: 'مرحباً بوخارست بلاك، أود الاستفسار والحجز بخصوص العرض المعلن 🍽️',
    en: 'Hello Bokharest Black, I would like to book/inquire regarding your special offer 🍽️',
  },
};

/**
 * Common Button Hotspot Configuration
 * Matches the embedded "BOOK" button on the official Bucharest Black banner (3168 x 1344)
 */
export const OFFICIAL_BANNER_BOOK_HOTSPOT: AdvertisementHotspot = {
  id: 'hotspot-book-btn',
  label: 'BOOK',
  xPercent: 70.23,
  yPercent: 61.09,
  widthPercent: 19.82,
  heightPercent: 12.28,
  action: 'whatsapp' as AdvertisementActionType,
  whatsappMessage: {
    ar: 'مرحباً بوخارست بلاك، أود حجز طاولة والاستفسار عن تفاصيل العرض 🍽️',
    en: 'Hello Bokharest Black, I would like to book a table and inquire about the offer 🍽️',
  },
};

/**
 * Initial / Default Advertisements List
 * Decoupled data model ready for CMS, Firebase Firestore, or local fallback.
 */
export const OFFICIAL_CLOUDINARY_BANNER_IMAGE = 'https://res.cloudinary.com/ccnaucox/image/upload/f_auto,q_auto/v1789476558/mecc5eyptfz7cxrrqblo.png';

export const INITIAL_ADVERTISEMENTS: AdvertisementItem[] = [
  {
    id: 'ad-bokharest-official-banner-1',
    title_ar: 'بوخارست بلاك — تجربة الفخامة والضيافة الراقية',
    title_en: 'Bokharest Black — Luxury Dining Experience',
    image: OFFICIAL_CLOUDINARY_BANNER_IMAGE,
    aspectRatio: ADVERTISEMENT_CONFIG.bannerAspectRatio,
    action: 'whatsapp',
    link: 'https://wa.me/201214444108',
    whatsappMessage: {
      ar: 'مرحباً بوخارست بلاك، أود الاستفسار والحجز بخصوص العرض المعلن 🍽️',
      en: 'Hello Bokharest Black, I would like to book/inquire regarding your special offer 🍽️',
    },
    hotspots: [
      {
        ...OFFICIAL_BANNER_BOOK_HOTSPOT,
        id: 'hotspot-book-btn-1',
      },
    ],
    active: true,
  },
  {
    id: 'ad-bokharest-official-banner-2',
    title_ar: 'بوخارست بلاك — أشهى الأطباق والمشويات الفاخرة',
    title_en: 'Bokharest Black — Exquisite Cuts & Fine Grills',
    image: OFFICIAL_CLOUDINARY_BANNER_IMAGE,
    aspectRatio: ADVERTISEMENT_CONFIG.bannerAspectRatio,
    action: 'whatsapp',
    link: 'https://wa.me/201214444108',
    whatsappMessage: {
      ar: 'مرحباً بوخارست بلاك، أود حجز طاولة والاستفسار عن العرض الخاص 🥩',
      en: 'Hello Bokharest Black, I would like to reserve a table for your special offer 🥩',
    },
    hotspots: [
      {
        ...OFFICIAL_BANNER_BOOK_HOTSPOT,
        id: 'hotspot-book-btn-2',
      },
    ],
    active: true,
  },
  {
    id: 'ad-bokharest-official-banner-3',
    title_ar: 'بوخارست بلاك — أمسيات ساحرة وجلسات تراس مميزة',
    title_en: 'Bokharest Black — Outdoor Terrace & Dining',
    image: OFFICIAL_CLOUDINARY_BANNER_IMAGE,
    aspectRatio: ADVERTISEMENT_CONFIG.bannerAspectRatio,
    action: 'whatsapp',
    link: 'https://wa.me/201214444108',
    whatsappMessage: {
      ar: 'مرحباً بوخارست بلاك، أود حجز طاولة في جلسات التراس 🥂',
      en: 'Hello Bokharest Black, I would like to reserve a table on the terrace 🥂',
    },
    hotspots: [
      {
        ...OFFICIAL_BANNER_BOOK_HOTSPOT,
        id: 'hotspot-book-btn-3',
      },
    ],
    active: true,
  },
  {
    id: 'ad-bokharest-official-banner-4',
    title_ar: 'بوخارست بلاك — المشروبات والحلويات الفاخرة',
    title_en: 'Bokharest Black — Signature Drinks & Desserts',
    image: OFFICIAL_CLOUDINARY_BANNER_IMAGE,
    aspectRatio: ADVERTISEMENT_CONFIG.bannerAspectRatio,
    action: 'whatsapp',
    link: 'https://wa.me/201214444108',
    whatsappMessage: {
      ar: 'مرحباً بوخارست بلاك، أود حجز طاولة والاستفسار عن عروض بوخارست بلاك ✨',
      en: 'Hello Bokharest Black, I would like to reserve and inquire about your offers ✨',
    },
    hotspots: [
      {
        ...OFFICIAL_BANNER_BOOK_HOTSPOT,
        id: 'hotspot-book-btn-4',
      },
    ],
    active: true,
  },
];

/**
 * Utility helper: Generates the target WhatsApp URL based on ad configuration
 */
export function buildAdWhatsAppUrl(params: {
  rawPhoneNumber: string;
  language: 'ar' | 'en';
  customMessage?: { ar: string; en: string };
  customLink?: string;
}): string {
  const { rawPhoneNumber, language, customMessage, customLink } = params;

  if (customLink && customLink.startsWith('https://wa.me/')) {
    return customLink;
  }

  const cleanNumber = rawPhoneNumber.replace(/[^0-9]/g, '') || '201214444108';
  const text = customMessage
    ? language === 'ar'
      ? customMessage.ar
      : customMessage.en
    : language === 'ar'
    ? ADVERTISEMENT_CONFIG.defaultWhatsAppMessage.ar
    : ADVERTISEMENT_CONFIG.defaultWhatsAppMessage.en;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Utility helper: Filter only active advertisements
 */
export function getActiveAdvertisements(ads: AdvertisementItem[]): AdvertisementItem[] {
  return ads.filter((ad) => ad.active !== false);
}

/**
 * Future CMS / Firebase integration stub
 * When connecting Firebase Firestore or a custom CMS, this function can query the 'advertisements' collection.
 */
export async function fetchAdvertisementsFromSource(): Promise<AdvertisementItem[]> {
  // In the future: return await firestore.collection(ADVERTISEMENT_CONFIG.firebaseCollectionName).get()...
  return INITIAL_ADVERTISEMENTS;
}
