'use client';

import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { CookieBanner } from '@/components/CookieBanner';
import { CookieSettingsModal, CookieSettings } from '@/components/CookieSettingsModal';
import { Toaster } from '@/components/ui/sonner';
import { FavoritesProvider } from '@/context/FavoritesContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [cookieModalOpen, setCookieModalOpen] = React.useState(false);

  const handleAcceptAll = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    localStorage.setItem('cookieSettings', JSON.stringify(allEnabled));
    localStorage.setItem('cookieConsent', 'all');
  };

  const handleRejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    localStorage.setItem('cookieSettings', JSON.stringify(essentialOnly));
    localStorage.setItem('cookieConsent', 'essential');
  };

  const handleSaveCookieSettings = (settings: CookieSettings) => {
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    localStorage.setItem('cookieConsent', 'custom');
  };

  return (
    <LanguageProvider>
      <CartProvider>
        <FavoritesProvider>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <CookieBanner
            onAcceptAll={handleAcceptAll}
            onRejectOptional={handleRejectOptional}
            onOpenSettings={() => setCookieModalOpen(true)}
          />
          <CookieSettingsModal
            isOpen={cookieModalOpen}
            onClose={() => setCookieModalOpen(false)}
            onSave={handleSaveCookieSettings}
          />
          <Toaster position="bottom-right" />
        </FavoritesProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
