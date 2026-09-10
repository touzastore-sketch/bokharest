import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/HomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { MoreScreen } from './components/MoreScreen';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { Reservations } from './components/Reservations';
import { GalleryModal } from './components/GalleryModal';
import { FloatingCartBar } from './components/FloatingCartBar';

const AppContent: React.FC = () => {
  const {
    language,
    activeTab,
    selectedItemForDetail,
    setSelectedItemForDetail,
    isCartOpen,
    setIsCartOpen,
    isReservationOpen,
    setIsReservationOpen,
    isGalleryOpen,
    setIsGalleryOpen,
  } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  // Android back button / history handling
  useEffect(() => {
    const handlePopState = () => {
      if (isGalleryOpen) {
        setIsGalleryOpen(false);
      } else if (selectedItemForDetail) {
        setSelectedItemForDetail(null);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (isReservationOpen) {
        setIsReservationOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedItemForDetail, isCartOpen, isReservationOpen, isGalleryOpen, setSelectedItemForDetail, setIsCartOpen, setIsReservationOpen, setIsGalleryOpen]);

  return (
    <div 
      id="app-root"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-neutral-800 selection:text-white relative overflow-x-hidden"
    >
      {/* 15. Splash Screen (Loading Screen) with the Official Brand Logo */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Luxury Brand Logo Background for the Entire App (from top to bottom) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none"
      >
        {/* Soft luxury ambient backdrop radial lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.85)_80%)] pointer-events-none" />

        {/* Central Prominent Brand Watermark Emblem */}
        <div 
          className="w-[90vw] max-w-[620px] aspect-square opacity-[0.11] select-none pointer-events-none flex items-center justify-center"
        >
          <img
            src="/logo.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co/zW3dhGmG/image.png';
            }}
            alt=""
            className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] pointer-events-none"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Main Top Header */}
      <Header />

      {/* Main Screen Views */}
      <main className="flex-1 w-full max-w-4xl mx-auto overflow-x-hidden relative z-10">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'menu' && <MenuScreen />}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'more' && <MoreScreen />}
      </main>

      {/* Item Detail Modal (Section 7) */}
      <ItemDetailModal />

      {/* Shopping Cart Drawer / Order System (Section 8 & 9 & 25) */}
      <CartDrawer />

      {/* Table Reservations Modal / WhatsApp Booking System */}
      <Reservations isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} isModal={true} />

      {/* Fullscreen Interactive Luxury Gallery Lightbox */}
      <GalleryModal />

      {/* Floating Quick Order Cart Pill (appears when items are added) */}
      <FloatingCartBar />

      {/* 4. Main Bottom Navigation Bar */}
      <BottomNavigation />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
