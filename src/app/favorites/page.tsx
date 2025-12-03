'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';
import { ProductCard } from '@/components/ProductCard';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark">Избранное</h1>
          <p className="text-sm text-text-light">Ваши сохраненные товары</p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="text-sm text-error hover:text-error/80"
          >
            Очистить
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="border border-border rounded-xl p-8 text-center text-text-light">
          Нет избранных товаров.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => router.push(`/product/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
