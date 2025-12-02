'use client';

import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Badge } from './Badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart } from 'lucide-react';
import { getPrimaryImage } from '../lib/images';
import { hasTag } from '../lib/products';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { language } = useLanguage();

  const name = language === 'ru' ? product.name_ru : product.name_en;
  const isOutOfStock = product.stock_total === 0;
  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : 0;

  return (
    <div
      className={`group bg-white cursor-pointer rounded-2xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 ${isOutOfStock ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white mb-3 rounded-2xl border border-gray-100">
        <ImageWithFallback
          src={getPrimaryImage(product)}
          alt={name}
          className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-light"
        >
          <Heart size={16} className="text-text-dark" />
        </button>

        {/* Badges - Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasTag(product, 'new') && <Badge type="new" />}
          {hasDiscount && (
            <span className="bg-error text-white text-xs px-2 py-1 font-medium">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Badge type="out-of-stock" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-1">
        {/* Brand/Category - subtle */}
        <p className="text-text-light text-xs mb-1 uppercase tracking-wide">
          Barcelo Biagi
        </p>

        {/* Product Name */}
        <h4 className="text-text-dark text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {name}
        </h4>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-text-dark font-medium">
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          {product.old_price && (
            <span className="text-text-light text-xs line-through">
              {product.old_price.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
