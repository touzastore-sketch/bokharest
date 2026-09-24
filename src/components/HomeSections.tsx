import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ExternalLink, Navigation, Phone, MessageSquare, Clock, Calendar, Users, Sparkles } from 'lucide-react';

// Table Reservation VIP Banner Section
export const TableReservationSection: React.FC = () => {
  const { language, t, setIsReservationOpen, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <section className="py-6 px-4 select-none">
      <div className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden text-center sm:text-left rtl:sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-200 ${
        isLight
          ? 'bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 border border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
          : 'bg-gradient-to-r from-[#121212] via-[#1a1a1a] to-[#0d0d0d] border border-white/20 shadow-2xl'
      }`}>
        {/* Subtle decorative glow */}
        <div className={`absolute top-0 right-1/4 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
          isLight ? 'bg-amber-400/10' : 'bg-white/5'
        }`} />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center justify-center sm:justify-start rtl:sm:justify-end gap-2 mb-1">
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-white'}`} />
            <span className={`text-[10px] font-extrabold tracking-[0.25em] uppercase ${
              isLight ? 'text-amber-700' : 'text-neutral-300'
            }`}>
              {language === 'ar' ? 'حجوزات طاولات VIP' : 'VIP Table Reservations'}
            </span>
          </div>

          <h3 className={`font-serif-luxury text-xl sm:text-2xl font-black mt-1 ${
            isLight ? 'text-neutral-950' : 'text-white'
          }`}>
            {language === 'ar' ? 'احجز طاولتك الفاخرة مسبقاً' : 'Reserve Your Luxury Table'}
          </h3>

          <p className={`text-xs mt-2 leading-relaxed font-medium ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}>
            {language === 'ar'
              ? 'سواء كان عشاءً رومانسياً، احتفالاً خاصاً أو لقاء عمل راقٍ، اختر التاريخ والوقت وسنجهز لك أرقى الأجواء عبر واتساب فوراً.'
              : 'Whether an intimate dinner, business gathering, or celebration, secure your table with tailored seating directly via WhatsApp.'}
          </p>

          <div className={`flex flex-wrap items-center justify-center sm:justify-start rtl:sm:justify-end gap-3 mt-4 text-[11px] font-semibold ${
            isLight ? 'text-neutral-700' : 'text-neutral-300'
          }`}>
            <span className="flex items-center gap-1">
              <Calendar className={`w-3 h-3 ${isLight ? 'text-neutral-900' : 'text-white'}`} />
              {language === 'ar' ? 'تأكيد فوري' : 'Instant Confirmation'}
            </span>
            <span className={`w-1 h-1 rounded-full ${isLight ? 'bg-neutral-300' : 'bg-neutral-600'}`} />
            <span className="flex items-center gap-1">
              <Users className={`w-3 h-3 ${isLight ? 'text-neutral-900' : 'text-white'}`} />
              {language === 'ar' ? 'تجهيزات خاصة' : 'VIP Arrangements'}
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full sm:w-auto shrink-0">
          <button
            id="home-banner-book-table-btn"
            onClick={() => setIsReservationOpen(true)}
            className={`w-full sm:w-auto min-h-[48px] min-w-[48px] py-3.5 px-7 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 active:opacity-80 transition-all duration-150 flex items-center justify-center gap-2.5 shadow-md focus:outline-none cursor-pointer touch-press ${
              isLight
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-white text-black hover:bg-neutral-200 shadow-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('book_table')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

// Order Now CTA Banner Section
export const OrderBannerSection: React.FC = () => {
  const { language, t, setActiveTab, setIsCartOpen, restaurantInfo, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <section className="py-6 px-4 select-none">
      <div className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden text-center sm:text-left rtl:sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-200 ${
        isLight
          ? 'bg-white border border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
          : 'bg-gradient-to-br from-[#181818] via-[#0d0d0d] to-black border border-white/20 shadow-2xl'
      }`}>
        {/* Subtle geometric lines */}
        <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full border pointer-events-none ${
          isLight ? 'border-neutral-100' : 'border-white/5'
        }`} />
        <div className={`absolute -left-12 -bottom-12 w-48 h-48 rounded-full border pointer-events-none ${
          isLight ? 'border-neutral-100' : 'border-white/5'
        }`} />

        <div className="relative z-10 max-w-md">
          <span className={`text-[10px] font-extrabold tracking-[0.25em] uppercase ${
            isLight ? 'text-amber-600' : 'text-neutral-400'
          }`}>
            {language === 'ar' ? 'طلب فوري ومباشر' : 'Instant Direct Ordering'}
          </span>
          <h3 className={`font-serif-luxury text-xl sm:text-2xl font-black mt-1 ${
            isLight ? 'text-neutral-950' : 'text-white'
          }`}>
            {language === 'ar' ? 'جاهز لتجربة استثنائية؟' : 'Ready for an Exquisite Feast?'}
          </h3>
          <p className={`text-xs mt-2 leading-relaxed font-medium ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}>
            {language === 'ar'
              ? 'اختر أطباقك المفضلة وسنقوم بإعداد وتوصيل طلبك بأعلى معايير الجودة والسرعة عبر واتساب مباشرة.'
              : 'Pick your favorites and send your order directly to our team via WhatsApp for priority service.'}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => {
              setActiveTab('menu');
              setIsCartOpen(true);
            }}
            className={`min-h-[48px] min-w-[48px] py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-sm active:scale-95 active:opacity-80 cursor-pointer touch-press ${
              isLight
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('order_now')}</span>
          </button>
          
          <a
            href={restaurantInfo.phoneCall}
            dir="ltr"
            className={`min-h-[48px] min-w-[48px] py-3.5 px-5 rounded-2xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-2 font-mono active:scale-95 active:opacity-80 touch-press ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
            }`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <bdi dir="ltr" className="font-mono tracking-wider font-bold">
              {restaurantInfo.phoneDisplay}
            </bdi>
          </a>
        </div>
      </div>
    </section>
  );
};

// About Bokharest Black Section
export const AboutSection: React.FC = () => {
  const { language, t, restaurantInfo, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <section className="py-8 px-4 select-none">
      <div className="max-w-2xl mx-auto text-center">
        <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-4 ${
          isLight ? 'border-neutral-300 bg-white text-black shadow-sm' : 'border-white/20 bg-white/5 text-white'
        }`}>
          <span className="font-serif-luxury text-lg font-bold">B</span>
        </div>

        <span className={`text-[10px] font-extrabold tracking-[0.3em] uppercase ${
          isLight ? 'text-amber-600' : 'text-neutral-400'
        }`}>
          Heritage & Elegance
        </span>
        
        <h2 className={`font-serif-luxury text-2xl font-black tracking-wide mt-1 mb-4 ${
          isLight ? 'text-neutral-950' : 'text-white'
        }`}>
          {t('about_title')}
        </h2>

        <p className={`font-serif-luxury italic text-base sm:text-lg leading-relaxed ${
          isLight ? 'text-neutral-700' : 'text-neutral-200'
        }`}>
          "{language === 'ar' ? restaurantInfo.about_ar : restaurantInfo.about_en}"
        </p>

        <div className={`flex items-center justify-center gap-6 mt-6 pt-6 border-t text-xs font-semibold ${
          isLight ? 'border-neutral-200 text-neutral-600' : 'border-white/10 text-neutral-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`} />
            <span>{language === 'ar' ? restaurantInfo.openingHours_ar : restaurantInfo.openingHours_en}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Location Section
export const LocationSection: React.FC = () => {
  const { language, t, restaurantInfo, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <section className="py-6 px-4 select-none">
      <div className="mb-4 text-center sm:text-left rtl:sm:text-right">
        <span className={`text-[10px] font-extrabold tracking-[0.3em] uppercase ${
          isLight ? 'text-amber-600' : 'text-neutral-400'
        }`}>
          Visit Our Branches
        </span>
        <h2 className={`font-serif-luxury text-xl sm:text-2xl font-black tracking-wide mt-0.5 ${
          isLight ? 'text-neutral-950' : 'text-white'
        }`}>
          {t('find_us')}
        </h2>
      </div>

      <div className={`rounded-3xl overflow-hidden transition-all duration-200 ${
        isLight
          ? 'bg-white border border-neutral-200 shadow-[0_4px_24px_rgba(0,0,0,0.05)]'
          : 'bg-[#0d0d0d] border border-white/15 shadow-2xl'
      }`}>
        {/* Map Preview Graphic */}
        <div className={`relative h-44 sm:h-52 flex flex-col items-center justify-center p-4 text-center overflow-hidden ${
          isLight ? 'bg-neutral-100' : 'bg-neutral-950'
        }`}>
          {/* Subtle Map grid texture */}
          <div 
            className={`absolute inset-0 opacity-20 pointer-events-none ${
              isLight
                ? 'bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[length:24px_24px]'
                : 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:24px_24px]'
            }`}
          />

          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-md mb-3 animate-bounce ${
            isLight ? 'bg-black text-white' : 'bg-white text-black'
          }`}>
            <MapPin className="w-6 h-6 stroke-[2.2]" />
          </div>

          <h4 className={`relative z-10 font-bold text-base ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            Bokharest Black Restaurant & Cafe
          </h4>
          <p className={`relative z-10 text-xs mt-1 max-w-sm font-medium ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}>
            {language === 'ar' ? restaurantInfo.address_ar : restaurantInfo.address_en}
          </p>
        </div>

        {/* Buttons */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row gap-3 ${
          isLight ? 'bg-white border-neutral-200' : 'bg-[#121212] border-white/10'
        }`}>
          <a
            href={restaurantInfo.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 active:opacity-80 touch-press cursor-pointer ${
              isLight
                ? 'bg-black text-white hover:bg-neutral-800 shadow-sm'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t('open_maps')}</span>
          </a>

          <a
            href={restaurantInfo.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 active:opacity-80 touch-press cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{t('get_directions')}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

// Social Media Section
export const SocialMediaSection: React.FC = () => {
  const { t, restaurantInfo, theme } = useApp();
  const isLight = theme === 'light';

  const socialChannels = [
    {
      name: 'Facebook',
      url: restaurantInfo.facebookUrl,
      handle: '@bokharestblackeg',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: restaurantInfo.instagramUrl,
      handle: '@bokharestblackeg',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      url: restaurantInfo.tiktokUrl,
      handle: '@bokharestblackeg',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-6 px-4 select-none">
      <div className="mb-4 text-center sm:text-left rtl:sm:text-right">
        <span className={`text-[10px] font-extrabold tracking-[0.3em] uppercase ${
          isLight ? 'text-amber-600' : 'text-neutral-400'
        }`}>
          Social Connection
        </span>
        <h2 className={`font-serif-luxury text-xl sm:text-2xl font-black tracking-wide mt-0.5 ${
          isLight ? 'text-neutral-950' : 'text-white'
        }`}>
          {t('follow_us')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {socialChannels.map((channel) => (
          <a
            key={channel.name}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`min-h-[48px] p-4 rounded-2xl flex items-center justify-between transition-all duration-150 group focus:outline-none active:scale-95 active:opacity-80 touch-press cursor-pointer ${
              isLight
                ? 'bg-white border border-neutral-200 hover:border-black shadow-sm'
                : 'bg-[#0d0d0d] border border-white/15 hover:border-white/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isLight
                  ? 'bg-neutral-100 text-black group-hover:bg-black group-hover:text-white'
                  : 'bg-white/5 border border-white/10 text-white group-hover:bg-white group-hover:text-black'
              }`}>
                {channel.icon}
              </div>
              <div>
                <h4 className={`font-extrabold text-sm ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  {channel.name}
                </h4>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {channel.handle}
                </span>
              </div>
            </div>

            <ExternalLink className={`w-4 h-4 transition-colors ${
              isLight ? 'text-neutral-400 group-hover:text-black' : 'text-neutral-500 group-hover:text-white'
            }`} />
          </a>
        ))}
      </div>
    </section>
  );
};

// Footer
export const Footer: React.FC = () => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  return (
    <footer className={`py-10 px-4 text-center border-t select-none pb-24 ${
      isLight ? 'border-neutral-200 bg-white text-neutral-900' : 'border-white/10 text-white'
    }`}>
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Monogram emblem */}
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center mb-3 ${
          isLight ? 'border-neutral-300 bg-neutral-100 text-black' : 'border-white/20 bg-black text-white'
        }`}>
          <span className="font-serif-luxury text-xs font-bold">B</span>
        </div>

        <p className={`font-serif-luxury tracking-[0.2em] text-xs font-extrabold uppercase ${
          isLight ? 'text-neutral-950' : 'text-white'
        }`}>
          Bokharest Black
        </p>
        <p className={`text-[10px] tracking-wider mt-0.5 font-arabic-luxury font-semibold ${
          isLight ? 'text-neutral-600' : 'text-neutral-400'
        }`}>
          بوخارست بلاك — مطعم وكافيه
        </p>

        <p className="text-[11px] text-neutral-500 mt-4 font-mono tracking-wide">
          © 2026 SolimanMedia. All Rights Reserved
        </p>
      </div>
    </footer>
  );
};
