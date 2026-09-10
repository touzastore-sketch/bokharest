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
  ShieldCheck,
  Heart,
  Clock,
  Calendar,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
  ArrowLeftRight,
} from 'lucide-react';

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
              onClick={() => setLanguage('ar')}
              className={`py-3 px-3 rounded-xl flex items-center justify-between transition-all duration-200 focus:outline-none cursor-pointer ${
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
              onClick={() => setLanguage('en')}
              className={`py-3 px-3 rounded-xl flex items-center justify-between transition-all duration-200 focus:outline-none cursor-pointer ${
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
            onClick={toggleLanguage}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-2 border border-white/5 focus:outline-none cursor-pointer"
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

      {/* Quick Access Menu Options */}
      <ScrollReveal yOffset={20} delay={0.1}>
        <div className="rounded-2xl bg-[#0e0e0e] border border-white/10 overflow-hidden divide-y divide-white/5">
          {/* Photo Gallery shortcut */}
          <button
            id="more-gallery-btn"
            onClick={() => openGallery(0)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left rtl:text-right focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/15">
                <Camera className="w-4 h-4 text-neutral-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">
                    {language === 'ar' ? 'معرض الصور الملكي' : 'Royal Photo Gallery'}
                  </h4>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white">
                    9 {language === 'ar' ? 'صور' : 'Photos'}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">
                  {language === 'ar'
                    ? 'استعراض حقيقي لأجواء الكافيه والأطباق والمشروبات'
                    : 'Exclusive look at our ambiance, dining and drinks'}
                </span>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-neutral-500" />
          </button>

          {/* Table Reservations shortcut */}
          <button
            id="more-table-reservations-btn"
            onClick={() => setIsReservationOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left rtl:text-right focus:outline-none cursor-pointer"
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
              setActiveTab('menu');
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left rtl:text-right focus:outline-none cursor-pointer"
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
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left rtl:text-right"
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
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left rtl:text-right"
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
          <div className="grid grid-cols-3 gap-2">
            <a
              href={restaurantInfo.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#0e0e0e] border border-white/10 text-center hover:border-white/30 transition-colors"
            >
              <span className="text-xs font-bold text-white block">Facebook</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
            <a
              href={restaurantInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#0e0e0e] border border-white/10 text-center hover:border-white/30 transition-colors"
            >
              <span className="text-xs font-bold text-white block">Instagram</span>
              <span className="text-[10px] text-neutral-500">@bokharestblackeg</span>
            </a>
            <a
              href={restaurantInfo.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#0e0e0e] border border-white/10 text-center hover:border-white/30 transition-colors"
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
            Bokharest Black • v1.0.0
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
};
