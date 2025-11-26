import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ScrollToTop } from './components/ScrollToTop';
import { CookieBanner } from './components/CookieBanner';
import { CookieSettingsModal, CookieSettings } from './components/CookieSettingsModal';
import { Toaster } from './components/ui/sonner';
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboardPage } from './pages/admin/AdminDashboard';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminAddProduct } from './pages/admin/AdminAddProduct';
import { AdminEditProduct } from './pages/admin/AdminEditProduct';
import { AdminDashboard } from './components/AdminDashboard';

function PlaceholderPage({ title, titleEn }: { title: string; titleEn: string }) {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-surface-light py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-6">{language === 'ru' ? title : titleEn}</h1>
        <p className="text-text-light">
          {language === 'ru' 
            ? 'Эта страница находится в разработке.' 
            : 'This page is under development.'}
        </p>
      </div>
    </div>
  );
}

function App() {
  const [cookieModalOpen, setCookieModalOpen] = React.useState(false);

  const handleAcceptAll = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    localStorage.setItem('cookieSettings', JSON.stringify(allEnabled));
  };

  const handleRejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    localStorage.setItem('cookieSettings', JSON.stringify(essentialOnly));
  };

  const handleSaveCookieSettings = (settings: CookieSettings) => {
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    localStorage.setItem('cookieConsent', 'custom');
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* New Unified Admin Dashboard - Liquid Glass Design */}
                <Route path="/admin/*" element={<AdminDashboard />} />
                
                {/* Placeholder routes for footer links */}
                <Route path="/stores" element={<PlaceholderPage title="Магазины" titleEn="Stores" />} />
                <Route path="/about" element={<PlaceholderPage title="О франшизе" titleEn="About Franchise" />} />
                <Route path="/shipping" element={<PlaceholderPage title="Доставка" titleEn="Shipping" />} />
              </Routes>
            </main>
            <Footer />
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
          </div>
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;