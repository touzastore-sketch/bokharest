import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeState, setFadeState] = useState<'entering' | 'visible' | 'exiting'>('entering');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    const timer1 = setTimeout(() => {
      setFadeState('visible');
    }, 60);

    const timer2 = setTimeout(() => {
      setFadeState('exiting');
    }, 1900);

    const timer3 = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-between py-12 px-6 cursor-pointer transition-all duration-700 select-none overflow-hidden ${
        fadeState === 'exiting' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(0,0,0,1)_70%)] pointer-events-none" />

      {/* Top spacer */}
      <div className="w-full h-8" />

      {/* Main Logo & Identity Center */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-sm w-full mx-auto">
        <BrandLogo variant="splash" />

        {/* Slender Luxury Progress Bar */}
        <div className="w-36 h-[2px] bg-white/15 overflow-hidden mt-8 rounded-full relative">
          <div
            className="h-full bg-gradient-to-r from-white/60 via-white to-white/90 rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text / Skip hint */}
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-medium mt-4">
          Loading Experience
        </p>
      </div>

      {/* Bottom subtle copyright / dismiss cue */}
      <div className="relative z-10 text-center">
        <span className="text-[10px] tracking-[0.2em] text-neutral-600 uppercase">
          Exclusive Luxury Dining
        </span>
      </div>
    </div>
  );
};

