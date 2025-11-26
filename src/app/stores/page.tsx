'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function StoresPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-surface-light py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-6">{language === 'ru' ? 'Магазины' : 'Stores'}</h1>
        <p className="text-text-light">
          {language === 'ru'
            ? 'Эта страница находится в разработке.'
            : 'This page is under development.'}
        </p>
      </div>
    </div>
  );
}
