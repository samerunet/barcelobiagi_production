'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface CookieBannerProps {
  onAcceptAll: () => void;
  onRejectOptional: () => void;
  onOpenSettings: () => void;
}

export function CookieBanner({ onAcceptAll, onRejectOptional, onOpenSettings }: CookieBannerProps) {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setVisible(false);
    onAcceptAll();
  };

  const handleRejectOptional = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setVisible(false);
    onRejectOptional();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-black rounded-t-3xl mx-4 mb-4 shadow-2xl border-t border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">
                {language === 'ru' ? 'Мы используем файлы cookie' : 'We use cookies'}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-3">
                {language === 'ru' 
                  ? 'Мы используем обязательные cookie для работы сайта и дополнительные cookie для аналитики и маркетинга. Вы можете изменить свои настройки в любой момент.'
                  : 'We use essential cookies to make our site work and optional cookies for analytics and marketing. You can change your choices at any time.'}
              </p>
              <Link 
                to="/privacy"
                className="text-accent-camel hover:text-accent-brown text-sm font-medium underline"
              >
                {language === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
              </Link>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
              <button
                onClick={onOpenSettings}
                className="px-4 py-2 text-white/70 hover:text-white text-sm transition-colors"
              >
                {language === 'ru' ? 'Настройки cookie' : 'Cookie settings'}
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-sm font-medium border border-white/20"
              >
                {language === 'ru' ? 'Отклонить необязательные' : 'Reject non-essential'}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2.5 bg-accent-brown hover:bg-accent-brown-dark text-white rounded-xl transition-all text-sm font-medium shadow-lg"
              >
                {language === 'ru' ? 'Принять все' : 'Accept all'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
