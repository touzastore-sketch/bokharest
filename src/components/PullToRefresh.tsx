import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  pullThreshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  isRefreshing: externalIsRefreshing,
  children,
  pullThreshold = 72,
  maxPullDistance = 110,
  disabled = false,
}) => {
  const { language, t } = useApp();
  const [pullDistance, setPullDistance] = useState(0);
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isRefreshing = externalIsRefreshing !== undefined ? externalIsRefreshing : internalRefreshing;

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasHapticFiredRef = useRef(false);

  const progress = Math.min(1, Math.max(0, pullDistance / pullThreshold));

  const triggerRefresh = useCallback(async () => {
    setInternalRefreshing(true);
    setPullDistance(pullThreshold);

    try {
      await onRefresh();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPullDistance(0);
        setInternalRefreshing(false);
      }, 700);
    } catch {
      setPullDistance(0);
      setInternalRefreshing(false);
    }
  }, [onRefresh, pullThreshold]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 1) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
      hasHapticFiredRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    if (diff > 0 && scrollTop <= 1) {
      // Natural logarithmic damping curve for luxury fluid feel
      const dampened = Math.min(maxPullDistance, diff * 0.42);
      setPullDistance(dampened);
      setIsDragging(true);

      // Trigger micro-haptic when threshold reached
      if (dampened >= pullThreshold && !hasHapticFiredRef.current) {
        hasHapticFiredRef.current = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(14);
          } catch {
            // Ignore in iframes without permission
          }
        }
      } else if (dampened < pullThreshold) {
        hasHapticFiredRef.current = false;
      }
    } else {
      setPullDistance(0);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    setIsDragging(false);

    if (pullDistance >= pullThreshold && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // Mouse / Desktop drag handlers for simulator and desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshing || e.button !== 0) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 2) {
      startYRef.current = e.clientY;
      isPullingRef.current = true;
      hasHapticFiredRef.current = false;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPullingRef.current || disabled || isRefreshing) return;
      const currentY = e.clientY;
      const diff = currentY - startYRef.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      if (diff > 0 && scrollTop <= 2) {
        const dampened = Math.min(maxPullDistance, diff * 0.42);
        setPullDistance(dampened);
        setIsDragging(true);
      } else {
        setPullDistance(0);
        setIsDragging(false);
      }
    };

    const handleMouseUp = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      setIsDragging(false);

      if (pullDistance >= pullThreshold && !isRefreshing) {
        triggerRefresh();
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [disabled, isRefreshing, pullDistance, pullThreshold, maxPullDistance, triggerRefresh]);

  // Circumference for SVG progress circle
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const currentDisplayHeight = isRefreshing || showSuccess ? 60 : pullDistance;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className="relative w-full"
    >
      {/* Pull indicator layer */}
      <motion.div
        animate={{
          height: currentDisplayHeight,
          opacity: currentDisplayHeight > 4 ? 1 : 0,
        }}
        transition={{
          type: isDragging ? 'tween' : 'spring',
          stiffness: 380,
          damping: 32,
          duration: isDragging ? 0 : 0.25,
        }}
        className="overflow-hidden flex flex-col items-center justify-center pointer-events-none select-none"
        style={{
          height: currentDisplayHeight,
        }}
        aria-live="polite"
      >
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-neutral-950/90 border border-white/20 backdrop-blur-xl shadow-2xl">
          {/* Circular gauge or animated icon */}
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            {showSuccess ? (
              <motion.div
                initial={{ scale: 0.5, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </motion.div>
            ) : isRefreshing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
                className="text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    className="stroke-white/15"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    className="stroke-white transition-all duration-75"
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
                  style={{
                    transform: `rotate(${progress * 180}deg) scale(${progress >= 1 ? 1.15 : 0.85 + progress * 0.15})`,
                  }}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 transition-colors ${
                      progress >= 1 ? 'text-white' : 'text-neutral-400'
                    }`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Dynamic Status Text */}
          <div className="text-[12px] font-medium tracking-wide">
            {showSuccess ? (
              <span className="text-white font-bold">{t('menu_refreshed')}</span>
            ) : isRefreshing ? (
              <span className="text-neutral-200">{t('refreshing_menu')}</span>
            ) : progress >= 1 ? (
              <span className="text-white font-bold animate-pulse">{t('release_to_refresh')}</span>
            ) : (
              <span className="text-neutral-400">{t('pull_to_refresh')}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content wrapper with smooth elastic translation */}
      <motion.div
        animate={{
          y: isRefreshing || showSuccess ? 8 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 34,
        }}
        className={`transition-opacity duration-300 ${
          isRefreshing ? 'opacity-90' : 'opacity-100'
        }`}
      >
        {children}
      </motion.div>
    </div>
  );
};
