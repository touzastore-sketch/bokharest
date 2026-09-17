import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { ScrollReveal } from './ScrollReveal';
import {
  Globe,
  MapPin,
  Phone,
  MessageSquare,
  ExternalLink,
  Heart,
  Clock,
  Calendar,
  Camera,
  Sparkles,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Check,
  ArrowLeftRight,
} from 'lucide-react';
import { haptic } from '../utils/haptics';
import { APP_VERSION } from '../data/restaurantData';
import { getOptimizedImageUrl } from '../services/cloudinaryService';

export const MoreScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    toggleLanguage,
    t,
    restaurantInfo,
    favorites,
    reservationHistory,
    setIsReservationOpen,
    openGallery,
    galleryImages,
    setActiveTab,
    setSelectedCategory,
  } = useApp();

  const Chevron = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-md sm:max-w-xl mx-auto select-none space-y-6">
      {/* Title */}
      <ScrollReveal yOffset={16}>
        <div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Settings & Information
          </span>
          <h1 className="font-serif-luxury text-2xl font-bold text-white tracking-wide mt-0.5">
            {t('more')}
          </h1>
        </div>
      </ScrollReveal>

      {/* Brand Identity Header Card */}
      <ScrollReveal yOffset={24} delay={0.05}>
        <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-white/15 text-center flex flex-col items-center shadow-xl">
          <div className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center bg-black mb-3 overflow-hidden shadow-2xl p-0.5">
            <BrandLogo variant="icon" className="w-full h-full" imgClassName="w-full h-full object-cover rounded-full" />
          </div>
          <h2 className="font-serif-luxury text-xl font-bold text-white tracking-wide">
            Bokharest Black | بوخارست بلاك
          </h2>
          <p className="font-serif-luxury italic text-xs text-neutral-300 mt-1">
            "{language === 'ar' ? restaurantInfo.tagline_ar : restaurantInfo.tagline_en}"
          </p>
          <p className="text-xs text-neutral-400 mt-3 max-w-sm leading-relaxed">
            {language === 'ar' ? restaurantInfo.about_ar : restaurantInfo.about_en}
          </p>
        </div>
      </ScrollReveal>

      {/* Language Switcher & Direction Setting */}
      <ScrollReveal yOffset={20} delay={0.08}>
        <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-white/15 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'ar' ? 'لغة التطبيق واتجاه الواجهة' : 'Language & Display Direction'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {language === 'ar'
                    ? 'تعديل اتجاه التطبيق بين RTL للعربية و LTR للإنجليزية'
                    : 'Toggle layout direction between RTL (Arabic) and LTR (English)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] text-neutral-300 shrink-0">
              <span className="text-neutral-500">dir:</span>
              <span className="font-bold text-white uppercase">{language === 'ar' ? 'rtl' : 'ltr'}</span>
            </div>
          </div>

          {/* Segmented Controls for Language & Direction */}
          <div 
            role="radiogroup" 
            aria-label={language === 'ar' ? 'اختيار لغة واتجاه التطبيق' : 'Select app language and layout direction'}
            className="grid grid-cols-2 gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10"
          >
            {/* Arabic (RTL) Option */}
            <button
              type="button"
              role="radio"
              aria-checked={language === 'ar'}
              onClick={() => {
                if (language !== 'ar') {
                  haptic.toggle();
                }
                setLanguage('ar');
              }}
              className={`min-h-[48px] py-3.5 px-3.5 rounded-xl flex items-center justify-between transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press ${
                language === 'ar'
                  ? 'bg-white text-black font-bold shadow-lg shadow-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold leading-tight">العربية</span>
                <span className={`text-[10px] leading-tight ${language === 'ar' ? 'text-neutral-700 font-semibold' : 'text-neutral-500'}`}>
                  RTL • اليمين لليسار
                </span>
              </div>
              {language === 'ar' && (
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>

            {/* English (LTR) Option */}
            <button
              type="button"
              role="radio"
              aria-checked={language === 'en'}
              onClick={() => {
                if (language !== 'en') {
                  haptic.toggle();
                }
                setLanguage('en');
              }}
              className={`min-h-[48px] py-3.5 px-3.5 rounded-xl flex items-center justify-between transition-all duration-150 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press ${
                language === 'en'
                  ? 'bg-white text-black font-bold shadow-lg shadow-white/10'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">English</span>
                <span className={`text-[10px] leading-tight ${language === 'en' ? 'text-neutral-700 font-semibold' : 'text-neutral-500'}`}>
                  LTR • Left to Right
                </span>
              </div>
              {language === 'en' && (
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          </div>

          {/* Quick Toggle Button */}
          <button
            type="button"
            onClick={() => {
              haptic.toggle();
              toggleLanguage();
            }}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[11px] font-medium transition-all duration-150 flex items-center justify-center gap-2 border border-white/5 focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-neutral-400" />
            <span>
              {language === 'ar' 
                ? 'التبديل السريع إلى الإنجليزية والاتجاه (LTR)' 
                : 'Quick switch to Arabic & Direction (RTL)'}
            </span>
          </button>
        </div>
      </ScrollReveal>

      {/* Authentic Cafe Ambiance Showcase */}
      {galleryImages.length > 0 && (
        <ScrollReveal yOffset={20} delay={0.09}>
          <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-white/15 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'ar' ? 'استعراض أجواء بوخارست الحقيقية' : 'Authentic Bokharest Ambiance'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {language === 'ar'
                      ? 'جولة بصرية في رقي الديكور الكلاسيكي، الإضاءة الساحرة، وجلسات الـ VIP'
                      : 'A visual tour of classic luxury decor, warm lighting, and VIP lounges'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 shrink-0">
                {galleryImages.length} {language === 'ar' ? 'مشاهد' : 'Scenes'}
              </span>
            </div>

            {/* Horizontal photo preview cards for quick touch & fullscreen view */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar touch-pan-x pt-1">
              {galleryImages.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => {
                    haptic.tab();
                    openGallery(idx);
                  }}
                  className="relative shrink-0 w-44 sm:w-52 aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 group cursor-pointer active:scale-95 transition-all shadow-lg"
                >
                  <img
                    src={getOptimizedImageUrl(img.url || img.localUrl)}
                    alt={language === 'ar' ? img.title_ar : img.title_en}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* Top-right fullscreen icon hint */}
                  <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-80 group-hover:opacity-100">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>

                  {/* Title badge overlay */}
                  <div className="absolute bottom-2.5 inset-x-2.5">
                    <span className="text-xs font-bold text-white block leading-snug drop-shadow-md truncate">
                      {language === 'ar' ? img.title_ar : img.title_en}
                    </span>
                    <span className="text-[10px] text-amber-300/90 font-medium">
                      {language === 'ar' ? 'اضغط للعرض الكامل' : 'Tap to view full'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Quick Access Menu Options */}
      <ScrollReveal yOffset={20} delay={0.1}>
        <div className="rounded-2xl bg-[#0e0e0e] border border-white/10 overflow-hidden divide-y divide-white/5">
          {/* Photo Gallery shortcut */}
          <button
            id="more-gallery-btn"
            onClick={() => {
              haptic.tab();
              openGallery(0);
            }}
            className="w-full min-h-[48px] p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-150 text-left rtl:text-right focus:outline-none cursor-pointer active:scale-[0.98] active:opacity-80 touch-press"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/15">
                <Camera className="w-4 h-4 text-neutral-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">
                    {language === 'ar' ? 'معرض أجواء الكافيه الملكي' : 'Royal Ambiance Gallery'}
                  </h4>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white">
                    {galleryImages.length} {language === 'ar' ? 'صور' : 'Photos'}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">
                  {language === 'ar'
                    ? 'استعراض حقيقي وفاخر لأجواء وجلسات وديكورات الكافيه'
                    : 'Exclusive look at our classic interior decor and luxury seating'}
                </span>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-neutral-500" />
          </button>

          {/* Table Reservations shortcut */}
          <button
            id="more-table-reservations-btn"
            onClick={() => {
              haptic.tab();
              setIsReservationOpen(true);
            }}
            className="w-full min-h-[48px] p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-150 text-left rtl:text-right focus:outline-none cursor-pointer active:scale-[0.98] active:opacity-80 touch-press"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/15">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{t('table_reservation')}</h4>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white">
                    VIP
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">
                  {reservationHistory.length > 0
                    ? `${reservationHistory.length} ${language === 'ar' ? 'حجوزات مسجلة' : 'reservations recorded'}`
                    : language === 'ar'
                    ? 'حجز موعد وطاولة عبر واتساب'
                    : 'Book a luxury table via WhatsApp'}
                </span>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-neutral-500" />
          </button>

          {/* Favorites shortcut */}
          <button
            onClick={() => {
              haptic.tab();
              setActiveTab('menu');
            }}
            className="w-full min-h-[48px] p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-150 text-left rtl:text-right focus:outline-none cursor-pointer active:scale-[0.98] active:opacity-80 touch-press"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{t('favorites')}</h4>
                <span className="text-[11px] text-neutral-400">
                  {favorites.length} {language === 'ar' ? 'أصناف محفوظة' : 'saved items'}
                </span>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-neutral-500" />
          </button>

          {/* Contact Hotline */}
          <a
            href={restaurantInfo.phoneCall}
            className="w-full min-h-[48px] p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-150 text-left rtl:text-right active:scale-[0.98] active:opacity-80 touch-press"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{t('call_us')}</h4>
                <bdi dir="ltr" className="text-[11px] text-neutral-400 font-mono block text-left rtl:text-right">
                  {restaurantInfo.phoneDisplay}
                </bdi>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-neutral-500" />
          </a>

          {/* Location Google Maps */}
          <a
            href={restaurantInfo.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-150 text-left rtl:text-right active:scale-[0.98] active:opacity-80 touch-press"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{t('find_us')}</h4>
                <span className="text-[11px] text-neutral-400">
                  {language === 'ar' ? 'فتح في خرائط Google' : 'Open in Google Maps'}
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-500" />
          </a>
        </div>
      </ScrollReveal>

      {/* Social Media Links */}
      <ScrollReveal yOffset={20} delay={0.12}>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-1">
            {t('follow_us')}
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <a
              href={restaurantInfo.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] p-3 rounded-xl bg-[#0e0e0e] border border-white/10 text-center hover:border-white/30 transition-all duration-150 active:scale-95 active:opacity-80 touch-press flex flex-col justify-center items-center"
            >
              <span className="text-xs font-bold text-white block">Facebook</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
            <a
              href={restaurantInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] p-3 rounded-xl bg-[#0e0e0e] border border-white/10 text-center hover:border-white/30 transition-all duration-150 active:scale-95 active:opacity-80 touch-press flex flex-col justify-center items-center"
            >
              <span className="text-xs font-bold text-white block">Instagram</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
            <a
              href={restaurantInfo.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] p-3 rounded-xl bg-[#0e0e0e] border border-white/10 text-center hover:border-white/30 transition-all duration-150 active:scale-95 active:opacity-80 touch-press flex flex-col justify-center items-center"
            >
              <span className="text-xs font-bold text-white block">TikTok</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
          </div>
        </div>
      </ScrollReveal>

      {/* Copyright Badge */}
      <ScrollReveal yOffset={16} delay={0.14}>
        <div className="p-4 rounded-2xl bg-[#0b0b0b] border border-white/5 space-y-1.5 text-center">
          <p className="text-xs text-neutral-300 font-mono tracking-wide">
            © 2026 SolimanMedia. All Rights Reserved
          </p>
          <p className="text-[10px] text-neutral-500">
            Bokharest Black • {APP_VERSION}
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
};
