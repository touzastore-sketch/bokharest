import React from 'react';
import { HeroSection } from './HeroSection';
import { AdvertisementSlider } from './AdvertisementSlider';
import { PopularCategories } from './PopularCategories';
import { GallerySection } from './GallerySection';
import { TableReservationSection, OrderBannerSection, AboutSection, LocationSection, SocialMediaSection, Footer } from './HomeSections';
import { ScrollReveal } from './ScrollReveal';

export const HomeScreen: React.FC = () => {
  return (
    <div className="min-h-screen pb-28 select-none">
      {/* 1 & 2 & 3: Hero section with logo, tagline, CTA, and subtle parallax */}
      <HeroSection />

      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        {/* Dynamic Multi-Ad Carousel / Slider */}
        <ScrollReveal yOffset={20} delay={0.04}>
          <AdvertisementSlider />
        </ScrollReveal>

        {/* Table Reservation VIP Banner */}
        <ScrollReveal yOffset={24} delay={0.05}>
          <TableReservationSection />
        </ScrollReveal>

        {/* 5. Popular Categories */}
        <ScrollReveal yOffset={28} delay={0.08}>
          <PopularCategories />
        </ScrollReveal>

        {/* 6. Order Now CTA */}
        <ScrollReveal yOffset={24} delay={0.05}>
          <OrderBannerSection />
        </ScrollReveal>

        {/* Luxury Real Cafe & Dishes Gallery */}
        <ScrollReveal yOffset={28} delay={0.06}>
          <GallerySection />
        </ScrollReveal>

        {/* 7. About Bokharest Black */}
        <ScrollReveal yOffset={26} delay={0.05}>
          <AboutSection />
        </ScrollReveal>

        {/* 8. Location */}
        <ScrollReveal yOffset={26} delay={0.05}>
          <LocationSection />
        </ScrollReveal>

        {/* 9. Social Media */}
        <ScrollReveal yOffset={22} delay={0.05}>
          <SocialMediaSection />
        </ScrollReveal>

        {/* 10. Footer */}
        <ScrollReveal yOffset={18} delay={0.05}>
          <Footer />
        </ScrollReveal>
      </div>
    </div>
  );
};
