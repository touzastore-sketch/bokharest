import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AdvertisementItem, AdvertisementHotspot } from '../types';
import {
  INITIAL_ADVERTISEMENTS,
  ADVERTISEMENT_CONFIG,
  buildAdWhatsAppUrl,
  getActiveAdvertisements,
} from '../data/ads';
import { ChevronRight, ChevronLeft, MessageSquare, ExternalLink } from 'lucide-react';
import { getOptimizedImageUrl } from '../services/cloudinaryService';
import { haptic } from '../utils/haptics';

interface AdvertisementSliderProps {
  advertisements?: AdvertisementItem[];
  className?: string;
  autoPlayIntervalMs?: number;
}

export const AdvertisementSlider: React.FC<AdvertisementSliderProps> = ({
  advertisements: propsAds,
  className = '',
  autoPlayIntervalMs = ADVERTISEMENT_CONFIG.autoPlayIntervalMs,
}) => {
  const { language, restaurantInfo, setActiveTab, setIsReservationOpen, setIsCartOpen, advertisements: contextAds, theme } = useApp();
  const isLight = theme === 'light';

  const advertisements = propsAds || (contextAds && contextAds.length > 0 ? contextAds : INITIAL_ADVERTISEMENTS);

  // Filter active advertisements using decoupled utility
  const activeAds = getActiveAdvertisements(advertisements);
  const totalSlides = activeAds.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Safe navigation helpers
  const goToNext = useCallback(() => {
    if (totalSlides <= 1) return;
    haptic.tab();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    haptic.tab();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToIndex = (index: number) => {
    if (index === currentIndex || totalSlides <= 1) return;
    haptic.tab();
    setCurrentIndex(index);
  };

  // Autoplay management
  useEffect(() => {
    if (totalSlides <= 1 || isPaused || isSwiping) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, isSwiping, autoPlayIntervalMs]);

  // Unified WhatsApp opener using decoupled builder
  const openWhatsApp = (customMessage?: { ar: string; en: string }, customLink?: string) => {
    haptic.order();

    const url = buildAdWhatsAppUrl({
      rawPhoneNumber: restaurantInfo.whatsappRaw,
      language: language as 'ar' | 'en',
      customMessage,
      customLink,
    });

    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = url;
    }
  };

  // Action dispatcher for advertisement clicks and hotspots
  const handleAction = (
    action?: string,
    link?: string,
    whatsappMessage?: { ar: string; en: string },
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }

    // If a direct URL/link is provided, navigate directly to it
    if (link && (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('wa.me'))) {
      const targetUrl = link.startsWith('wa.me') ? `https://${link}` : link;
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = targetUrl;
      }
      return;
    }

    if (!action || action === 'none') return;

    if (action === 'whatsapp') {
      openWhatsApp(whatsappMessage, link);
    } else if (action === 'external_url' && link) {
      try {
        window.open(link, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = link;
      }
    } else if (action === 'internal_page' && link) {
      haptic.tab();
      if (link === 'reservation' || link === 'table') {
        setIsReservationOpen(true);
      } else if (link === 'cart') {
        setIsCartOpen(true);
      } else if (link === 'menu' || link === 'home' || link === 'gallery' || link === 'orders' || link === 'more') {
        setActiveTab(link as any);
      }
    } else if (action === 'menu') {
      haptic.tab();
      setActiveTab('menu');
    } else if (action === 'reservation') {
      haptic.tab();
      setIsReservationOpen(true);
    } else if (action === 'cart') {
      haptic.tab();
      setIsCartOpen(true);
    }
  };

  // Touch / Swipe Navigation Handlers (Mobile & Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalSlides <= 1) return;
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || touchStartX === null) return;
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping || touchStartX === null || touchCurrentX === null) {
      setIsSwiping(false);
      setTouchStartX(null);
      setTouchCurrentX(null);
      setIsPaused(false);
      return;
    }

    const diff = touchStartX - touchCurrentX;
    const threshold = ADVERTISEMENT_CONFIG.dragThresholdPx || 40;

    // In RTL (Arabic), swiping left goes to prev, swiping right goes to next
    const isRTL = language === 'ar';

    if (Math.abs(diff) >= threshold) {
      if (diff > 0) {
        // Swiped towards left
        if (isRTL) goToPrev();
        else goToNext();
      } else {
        // Swiped towards right
        if (isRTL) goToNext();
        else goToPrev();
      }
    }

    setIsSwiping(false);
    setTouchStartX(null);
    setTouchCurrentX(null);
    setIsPaused(false);
  };

  // Mouse Drag / Pointer Handlers for desktop swipe capability
  const handleMouseDown = (e: React.MouseEvent) => {
    if (totalSlides <= 1) return;
    setIsPaused(true);
    setIsMouseDown(true);
    setMouseStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown || mouseStartX === null) {
      setIsMouseDown(false);
      setMouseStartX(null);
      setIsPaused(false);
      return;
    }

    const diff = mouseStartX - e.clientX;
    const threshold = ADVERTISEMENT_CONFIG.dragThresholdPx || 40;
    const isRTL = language === 'ar';

    if (Math.abs(diff) >= threshold) {
      if (diff > 0) {
        if (isRTL) goToPrev();
        else goToNext();
      } else {
        if (isRTL) goToNext();
        else goToPrev();
      }
    }

    setIsMouseDown(false);
    setMouseStartX(null);
    setIsPaused(false);
  };

  if (totalSlides === 0) return null;

  const currentAd = activeAds[currentIndex];
  // Arrow directions matching reading orientation (RTL vs LTR)
  const PrevIcon = language === 'ar' ? ChevronRight : ChevronLeft;
  const NextIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <section 
      aria-label={language === 'ar' ? 'العروض والإعلانات الحصرية' : 'Featured Advertisements'}
      className={`relative w-full px-4 select-none ${className}`}
    >
      <div 
        ref={containerRef}
        className={`relative group rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isLight
            ? 'border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
            : 'border border-white/20 bg-gradient-to-b from-[#141414] to-[#0a0a0a]'
        }`}
        onMouseEnter={() => ADVERTISEMENT_CONFIG.pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => {
          if (ADVERTISEMENT_CONFIG.pauseOnHover) setIsPaused(false);
          setIsMouseDown(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Aspect Ratio Preserver Container: Exactly 3168/1344 (approx 2.357:1) */}
        <div 
          className="relative w-full overflow-hidden"
          style={{ 
            aspectRatio: '3168 / 1344',
            maxHeight: '480px'
          }}
        >
          {/* Slides Track */}
          <div 
            className="flex w-full h-full transition-transform ease-out will-change-transform"
            style={{
              transform: `translateX(${language === 'ar' ? currentIndex * 100 : -currentIndex * 100}%)`,
              transitionDuration: `${ADVERTISEMENT_CONFIG.transitionDurationMs}ms`,
            }}
          >
            {activeAds.map((ad, idx) => {
              const hasHotspots = ad.hotspots && ad.hotspots.length > 0;
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={ad.id || `ad-${idx}`}
                  className="relative w-full h-full shrink-0 flex items-center justify-center bg-black overflow-hidden"
                  onClick={() => {
                    // If no specific hotspots, clicking whole slide triggers ad action or link
                    if (!hasHotspots) {
                      handleAction(ad.actionType || ad.action, ad.link, ad.whatsappMessage);
                    }
                  }}
                  style={{
                    cursor: !hasHotspots && (ad.link || (ad.action && ad.action !== 'none') || (ad.actionType && ad.actionType !== 'none')) ? 'pointer' : 'default'
                  }}
                >
                  {/* High Quality Ad Image */}
                  <img
                    src={getOptimizedImageUrl(ad.image)}
                    alt={language === 'ar' ? ad.title_ar || 'إعلان بوخارست بلاك' : ad.title_en || 'Bokharest Black Advertisement'}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (ad.fallbackImage) {
                        (e.currentTarget as HTMLImageElement).src = getOptimizedImageUrl(ad.fallbackImage);
                      }
                    }}
                    className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700"
                  />

                  {/* Hotspots Overlay (e.g. Embedded "BOOK" Button on the Banner) */}
                  {hasHotspots &&
                    ad.hotspots!.map((hotspot: AdvertisementHotspot) => (
                      <button
                        key={hotspot.id}
                        type="button"
                        id={`ad-hotspot-${hotspot.id}`}
                        aria-label={
                          hotspot.label
                            ? `${hotspot.label} - ${language === 'ar' ? 'حجز عبر واتساب' : 'Book via WhatsApp'}`
                            : language === 'ar' ? 'حجز عبر واتساب' : 'Book via WhatsApp'
                        }
                        onClick={(e) => {
                          handleAction(hotspot.action, hotspot.link, hotspot.whatsappMessage, e);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${hotspot.xPercent}%`,
                          top: `${hotspot.yPercent}%`,
                          width: `${hotspot.widthPercent}%`,
                          height: `${hotspot.heightPercent}%`,
                        }}
                        className="group/hotspot rounded-full cursor-pointer z-20 transition-all duration-200 outline-none focus:ring-2 focus:ring-white/80 active:scale-95 hover:bg-white/10"
                      >
                        {/* Subtle interactive shine effect over the button area */}
                        <div className="w-full h-full rounded-full border border-white/0 group-hover/hotspot:border-white/40 group-hover/hotspot:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center" />
                      </button>
                    ))}

                  {/* Subtle vignette border */}
                  <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-2xl sm:rounded-3xl" />
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows (Shown when more than 1 ad exists) */}
          {totalSlides > 1 && (
            <>
              {/* Previous Button */}
              <button
                type="button"
                id="ad-slider-prev-btn"
                aria-label={language === 'ar' ? 'الإعلان السابق' : 'Previous advertisement'}
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className={`absolute top-1/2 -translate-y-1/2 start-2.5 sm:start-4 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 opacity-80 hover:opacity-100 shadow-md focus:outline-none cursor-pointer ${
                  isLight
                    ? 'bg-white/95 hover:bg-black text-black hover:text-white border border-neutral-300'
                    : 'bg-black/60 hover:bg-black/90 text-white border border-white/25 shadow-xl'
                }`}
              >
                <PrevIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                id="ad-slider-next-btn"
                aria-label={language === 'ar' ? 'الإعلان التالي' : 'Next advertisement'}
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className={`absolute top-1/2 -translate-y-1/2 end-2.5 sm:end-4 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 opacity-80 hover:opacity-100 shadow-md focus:outline-none cursor-pointer ${
                  isLight
                    ? 'bg-white/95 hover:bg-black text-black hover:text-white border border-neutral-300'
                    : 'bg-black/60 hover:bg-black/90 text-white border border-white/25 shadow-xl'
                }`}
              >
                <NextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* Bottom Indicators Container (Dots & Direct Counter) */}
          {totalSlides > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 inset-x-0 z-30 flex items-center justify-center gap-1.5 pointer-events-none">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md pointer-events-auto shadow-md ${
                isLight
                  ? 'bg-white/95 border border-neutral-300 text-black'
                  : 'bg-black/65 border border-white/15'
              }`}>
                {activeAds.map((_, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      aria-label={`${language === 'ar' ? 'إعلان رقم' : 'Slide'} ${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToIndex(idx);
                      }}
                      className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none ${
                        isActive
                          ? isLight
                            ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-black shadow-sm'
                            : 'w-5 sm:w-6 h-1.5 sm:h-2 bg-white shadow-sm shadow-white'
                          : isLight
                          ? 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-neutral-300 hover:bg-neutral-500'
                          : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/35 hover:bg-white/70'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
