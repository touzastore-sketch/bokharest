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
    theme,
  } = useApp();

  const isLight = theme === 'light';

  const Chevron = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-md sm:max-w-xl mx-auto select-none space-y-6">
      {/* Title */}
      <ScrollReveal yOffset={16}>
        <div>
          <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${
            isLight ? 'text-neutral-500' : 'text-neutral-400'
          }`}>
            Settings & Information
          </span>
          <h1 className={`font-serif-luxury text-2xl font-black tracking-wide mt-0.5 ${
            isLight ? 'text-neutral-950' : 'text-white'
          }`}>
            {t('more')}
          </h1>
        </div>
      </ScrollReveal>

      {/* Brand Identity Header Card */}
      <ScrollReveal yOffset={24} delay={0.05}>
        <div className={`p-6 rounded-3xl border text-center flex flex-col items-center shadow-sm ${
          isLight
            ? 'bg-white border-neutral-200 shadow-neutral-900/5'
            : 'bg-[#0e0e0e] border-white/15 shadow-xl'
        }`}>
          <div className={`w-24 h-24 rounded-full border flex items-center justify-center mb-3 overflow-hidden shadow-2xl p-0.5 ${
            isLight ? 'border-neutral-200 bg-black' : 'border-white/30 bg-black'
          }`}>
            <BrandLogo variant="icon" className="w-full h-full" imgClassName="w-full h-full object-cover rounded-full" />
          </div>
          <h2 className={`font-serif-luxury text-xl font-bold tracking-wide ${
            isLight ? 'text-neutral-950' : 'text-white'
          }`}>
            Bokharest Black | بوخارست بلاك
          </h2>
          <p className={`font-serif-luxury italic text-xs mt-1 ${
            isLight ? 'text-neutral-600' : 'text-neutral-300'
          }`}>
            "{language === 'ar' ? restaurantInfo.tagline_ar : restaurantInfo.tagline_en}"
          </p>
          <p className={`text-xs mt-3 max-w-sm leading-relaxed ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}>
            {language === 'ar' ? restaurantInfo.about_ar : restaurantInfo.about_en}
          </p>
        </div>
      </ScrollReveal>

      {/* Language Switcher & Direction Setting */}
      <ScrollReveal yOffset={20} delay={0.08}>
        <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${
          isLight
            ? 'bg-white border-neutral-200 shadow-neutral-900/5'
            : 'bg-[#0e0e0e] border-white/15 shadow-xl'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-neutral-100 border-neutral-200 text-neutral-900' : 'bg-white/5 border-white/10 text-white'
              }`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                  {language === 'ar' ? 'لغة التطبيق واتجاه الواجهة' : 'Language & Display Direction'}
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {language === 'ar'
                    ? 'تعديل اتجاه التطبيق بين RTL للعربية و LTR للإنجليزية'
                    : 'Toggle layout direction between RTL (Arabic) and LTR (English)'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] shrink-0 ${
              isLight ? 'bg-neutral-100 border-neutral-200 text-neutral-700' : 'bg-white/5 border-white/10 text-neutral-300'
            }`}>
              <span className={isLight ? 'text-neutral-500' : 'text-neutral-500'}>dir:</span>
              <span className={`font-bold uppercase ${isLight ? 'text-neutral-950' : 'text-white'}`}>{language === 'ar' ? 'rtl' : 'ltr'}</span>
            </div>
          </div>

          {/* Segmented Controls for Language & Direction */}
          <div 
            role="radiogroup" 
            aria-label={language === 'ar' ? 'اختيار لغة واتجاه التطبيق' : 'Select app language and layout direction'}
            className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-black/60 border-white/10'
            }`}
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
                  ? isLight
                    ? 'bg-neutral-950 text-white font-bold shadow-md'
                    : 'bg-white text-black font-bold shadow-lg shadow-white/10'
                  : isLight
                  ? 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold leading-tight">العربية</span>
                <span className={`text-[10px] leading-tight ${
                  language === 'ar'
                    ? isLight ? 'text-neutral-300 font-semibold' : 'text-neutral-700 font-semibold'
                    : isLight ? 'text-neutral-500' : 'text-neutral-500'
                }`}>
                  RTL • اليمين لليسار
                </span>
              </div>
              {language === 'ar' && (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
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
                  ? isLight
                    ? 'bg-neutral-950 text-white font-bold shadow-md'
                    : 'bg-white text-black font-bold shadow-lg shadow-white/10'
                  : isLight
                  ? 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">English</span>
                <span className={`text-[10px] leading-tight ${
                  language === 'en'
                    ? isLight ? 'text-neutral-300 font-semibold' : 'text-neutral-700 font-semibold'
                    : isLight ? 'text-neutral-500' : 'text-neutral-500'
                }`}>
                  LTR • Left to Right
                </span>
              </div>
              {language === 'en' && (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-white text-black' : 'bg-black text-white'
                }`}>
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
            className={`w-full min-h-[44px] py-2.5 px-3 rounded-xl text-[11px] font-medium transition-all duration-150 flex items-center justify-center gap-2 border focus:outline-none cursor-pointer active:scale-95 active:opacity-80 touch-press ${
              isLight
                ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border-white/5'
            }`}
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`} />
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
          <div className={`p-5 rounded-3xl border shadow-sm space-y-3.5 ${
            isLight
              ? 'bg-white border-neutral-200 shadow-neutral-900/5'
              : 'bg-[#0e0e0e] border-white/15 shadow-xl'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                    {language === 'ar' ? 'استعراض أجواء بوخارست الحقيقية' : 'Authentic Bokharest Ambiance'}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {language === 'ar'
                      ? 'جولة بصرية في رقي الديكور الكلاسيكي، الإضاءة الساحرة، وجلسات الـ VIP'
                      : 'A visual tour of classic luxury decor, warm lighting, and VIP lounges'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-600 shrink-0">
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
                  className={`relative shrink-0 w-44 sm:w-52 aspect-[4/3] rounded-2xl overflow-hidden border group cursor-pointer active:scale-95 transition-all shadow-md ${
                    isLight ? 'border-neutral-200' : 'border-white/15'
                  }`}
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
                    <span className="text-[10px] text-amber-300 font-medium">
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
        <div className={`rounded-2xl border overflow-hidden divide-y ${
          isLight
            ? 'bg-white border-neutral-200 divide-neutral-100 shadow-sm'
            : 'bg-[#0e0e0e] border-white/10 divide-white/5'
        }`}>
          {/* Photo Gallery shortcut */}
          <button
            id="more-gallery-btn"
            onClick={() => {
              haptic.tab();
              openGallery(0);
            }}
            className={`w-full min-h-[48px] p-4 flex items-center justify-between transition-all duration-150 text-left rtl:text-right focus:outline-none cursor-pointer active:scale-[0.98] active:opacity-80 touch-press ${
              isLight ? 'hover:bg-neutral-50' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-white/10 text-white border-white/15'
              }`}>
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                    {language === 'ar' ? 'معرض أجواء الكافيه الملكي' : 'Royal Ambiance Gallery'}
                  </h4>
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-neutral-100 text-neutral-800' : 'bg-white/15 text-white'
                  }`}>
                    {galleryImages.length} {language === 'ar' ? 'صور' : 'Photos'}
                  </span>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {language === 'ar'
                    ? 'استعراض حقيقي وفاخر لأجواء وجلسات وديكورات الكافيه'
                    : 'Exclusive look at our classic interior decor and luxury seating'}
                </span>
              </div>
            </div>
            <Chevron className={`w-4 h-4 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`} />
          </button>

          {/* Table Reservations shortcut */}
          <button
            id="more-table-reservations-btn"
            onClick={() => {
              haptic.tab();
              setIsReservationOpen(true);
            }}
            className={`w-full min-h-[48px] p-4 flex items-center justify-between transition-all duration-150 text-left rtl:text-right focus:outline-none cursor-pointer active:scale-[0.98] active:opacity-80 touch-press ${
              isLight ? 'hover:bg-neutral-50' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-white/10 text-white border-white/15'
              }`}>
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>{t('table_reservation')}</h4>
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-neutral-950 text-white' : 'bg-white/15 text-white'
                  }`}>
                    VIP
                  </span>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {reservationHistory.length > 0
                    ? `${reservationHistory.length} ${language === 'ar' ? 'حجوزات مسجلة' : 'reservations recorded'}`
                    : language === 'ar'
                    ? 'حجز موعد وطاولة عبر واتساب'
                    : 'Book a luxury table via WhatsApp'}
                </span>
              </div>
            </div>
            <Chevron className={`w-4 h-4 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`} />
          </button>

          {/* Favorites shortcut */}
          <button
            onClick={() => {
              haptic.tab();
              setActiveTab('menu');
            }}
            className={`w-full min-h-[48px] p-4 flex items-center justify-between transition-all duration-150 text-left rtl:text-right focus:outline-none cursor-pointer active:scale-[0.98] active:opacity-80 touch-press ${
              isLight ? 'hover:bg-neutral-50' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-rose-50 text-rose-500' : 'bg-white/5 text-white'
              }`}>
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`font-bold text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>{t('favorites')}</h4>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {favorites.length} {language === 'ar' ? 'أصناف محفوظة' : 'saved items'}
                </span>
              </div>
            </div>
            <Chevron className={`w-4 h-4 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`} />
          </button>

          {/* Contact Hotline */}
          <a
            href={restaurantInfo.phoneCall}
            className={`w-full min-h-[48px] p-4 flex items-center justify-between transition-all duration-150 text-left rtl:text-right active:scale-[0.98] active:opacity-80 touch-press ${
              isLight ? 'hover:bg-neutral-50' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-neutral-100 text-neutral-800' : 'bg-white/5 text-white'
              }`}>
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`font-bold text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>{t('call_us')}</h4>
                <bdi dir="ltr" className={`text-[11px] font-mono block text-left rtl:text-right ${
                  isLight ? 'text-neutral-600' : 'text-neutral-400'
                }`}>
                  {restaurantInfo.phoneDisplay}
                </bdi>
              </div>
            </div>
            <Chevron className={`w-4 h-4 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`} />
          </a>

          {/* Location Google Maps */}
          <a
            href={restaurantInfo.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full min-h-[48px] p-4 flex items-center justify-between transition-all duration-150 text-left rtl:text-right active:scale-[0.98] active:opacity-80 touch-press ${
              isLight ? 'hover:bg-neutral-50' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-neutral-100 text-neutral-800' : 'bg-white/5 text-white'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`font-bold text-sm ${isLight ? 'text-neutral-950' : 'text-white'}`}>{t('find_us')}</h4>
                <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {language === 'ar' ? 'فتح في خرائط Google' : 'Open in Google Maps'}
                </span>
              </div>
            </div>
            <ExternalLink className={`w-4 h-4 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`} />
          </a>
        </div>
      </ScrollReveal>

      {/* Social Media Links */}
      <ScrollReveal yOffset={20} delay={0.12}>
        <div className="space-y-2">
          <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}>
            {t('follow_us')}
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <a
              href={restaurantInfo.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-h-[48px] p-3 rounded-xl border text-center transition-all duration-150 active:scale-95 active:opacity-80 touch-press flex flex-col justify-center items-center ${
                isLight
                  ? 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm'
                  : 'bg-[#0e0e0e] border-white/10 hover:border-white/30'
              }`}
            >
              <span className={`text-xs font-bold block ${isLight ? 'text-neutral-950' : 'text-white'}`}>Facebook</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
            <a
              href={restaurantInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-h-[48px] p-3 rounded-xl border text-center transition-all duration-150 active:scale-95 active:opacity-80 touch-press flex flex-col justify-center items-center ${
                isLight
                  ? 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm'
                  : 'bg-[#0e0e0e] border-white/10 hover:border-white/30'
              }`}
            >
              <span className={`text-xs font-bold block ${isLight ? 'text-neutral-950' : 'text-white'}`}>Instagram</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
            <a
              href={restaurantInfo.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-h-[48px] p-3 rounded-xl border text-center transition-all duration-150 active:scale-95 active:opacity-80 touch-press flex flex-col justify-center items-center ${
                isLight
                  ? 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm'
                  : 'bg-[#0e0e0e] border-white/10 hover:border-white/30'
              }`}
            >
              <span className={`text-xs font-bold block ${isLight ? 'text-neutral-950' : 'text-white'}`}>TikTok</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
          </div>
        </div>
      </ScrollReveal>

      {/* Copyright Badge */}
      <ScrollReveal yOffset={16} delay={0.14}>
        <div className={`p-4 rounded-2xl border space-y-1.5 text-center ${
          isLight ? 'bg-white border-neutral-200' : 'bg-[#0b0b0b] border-white/5'
        }`}>
          <p className={`text-xs font-mono tracking-wide ${
            isLight ? 'text-neutral-700' : 'text-neutral-300'
          }`}>
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
