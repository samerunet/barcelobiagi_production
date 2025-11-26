'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X } from 'lucide-react';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CookieSettings) => void;
}

export interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export function CookieSettingsModal({ isOpen, onClose, onSave }: CookieSettingsModalProps) {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  const toggleSetting = (key: keyof CookieSettings) => {
    if (key === 'essential') return; // Essential cannot be disabled
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAcceptAll = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setSettings(allEnabled);
    onSave(allEnabled);
    onClose();
  };

  const handleRejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setSettings(essentialOnly);
    onSave(essentialOnly);
    onClose();
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  const categories = [
    {
      key: 'essential' as const,
      name_ru: 'Обязательные',
      name_en: 'Essential',
      desc_ru: 'Нужны для работы сайта и корзины.',
      desc_en: 'Required to make the site and cart work.',
      disabled: true,
    },
    {
      key: 'analytics' as const,
      name_ru: 'Аналитика',
      name_en: 'Analytics',
      desc_ru: 'Помогают понять, как посетители используют наш сайт.',
      desc_en: 'Help us understand how visitors use our site.',
      disabled: false,
    },
    {
      key: 'marketing' as const,
      name_ru: 'Маркетинг',
      name_en: 'Marketing',
      desc_ru: 'Используются для показа релевантной рекламы.',
      desc_en: 'Used to show you relevant advertising.',
      disabled: false,
    },
    {
      key: 'functional' as const,
      name_ru: 'Функциональные',
      name_en: 'Functional',
      desc_ru: 'Обеспечивают дополнительные функции сайта.',
      desc_en: 'Provide additional site functionality.',
      disabled: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-charcoal text-white px-8 py-6 flex items-center justify-between">
          <h2 className="text-white">
            {language === 'ru' ? 'Настройки cookie' : 'Cookie settings'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[60vh]">
          <p className="text-text-medium mb-6">
            {language === 'ru'
              ? 'Управляйте настройками cookie для улучшения вашего опыта на сайте.'
              : 'Manage your cookie preferences to enhance your experience on our site.'}
          </p>

          <div className="space-y-6">
            {categories.map((category) => (
              <div
                key={category.key}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  settings[category.key]
                    ? 'border-accent-brown bg-accent-brown-light/20'
                    : 'border-border bg-surface-light'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="mb-1 text-charcoal">
                      {language === 'ru' ? category.name_ru : category.name_en}
                    </h4>
                    <p className="text-sm text-text-medium">
                      {language === 'ru' ? category.desc_ru : category.desc_en}
                    </p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleSetting(category.key)}
                    disabled={category.disabled}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-brown focus:ring-offset-2 ${
                      settings[category.key]
                        ? 'bg-accent-brown'
                        : 'bg-gray-300'
                    } ${category.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        settings[category.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-surface-light border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleAcceptAll}
              className="text-accent-brown hover:text-accent-brown-dark text-sm font-medium"
            >
              {language === 'ru' ? 'Принять все' : 'Accept all'}
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-charcoal hover:bg-gray-200 rounded-xl transition-all text-sm font-medium"
              >
                {language === 'ru' ? 'Отменить' : 'Cancel'}
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-6 py-2.5 bg-white border border-border hover:bg-surface-light text-charcoal rounded-xl transition-all text-sm font-medium"
              >
                {language === 'ru' ? 'Отклонить необязательные' : 'Reject non-essential'}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-accent-brown hover:bg-accent-brown-dark text-white rounded-xl transition-all text-sm font-medium shadow-md"
              >
                {language === 'ru' ? 'Сохранить настройки' : 'Save preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
