'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

type BadgeType = 'new' | 'sale' | 'low-stock' | 'out-of-stock';

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

export function Badge({ type, className = '' }: BadgeProps) {
  const { t } = useLanguage();

  const getBadgeConfig = () => {
    switch (type) {
      case 'new':
        return {
          text: t('NEW', 'NEW'),
          bgColor: 'bg-text-dark',
          textColor: 'text-white',
        };
      case 'sale':
        return {
          text: t('SALE', 'SALE'),
          bgColor: 'bg-error',
          textColor: 'text-white',
        };
      case 'low-stock':
        return {
          text: t('МАЛО', 'LOW STOCK'),
          bgColor: 'bg-warning',
          textColor: 'text-white',
        };
      case 'out-of-stock':
        return {
          text: t('НЕТ В НАЛИЧИИ', 'OUT OF STOCK'),
          bgColor: 'bg-text-light',
          textColor: 'text-white',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs ${config.bgColor} ${config.textColor} font-medium uppercase ${className}`}
    >
      {config.text}
    </span>
  );
}
