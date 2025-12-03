'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Product } from '../types';
import { hasTag } from '../lib/products';
import { mapApiProducts } from '@/lib/productMapper';

export function Category() {
  const params = useParams();
  const categoryParam =
    params && typeof params === 'object'
      ? (params as Record<string, string | string[]>).category
      : undefined;
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const searchParams = useSearchParams();
  const searchQuery = (searchParams?.get('search') ?? '').trim();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showInStock, setShowInStock] = useState(false);

  const [baseProducts, setBaseProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.set('category', category);
        if (category === 'new') params.set('tag', 'new');
        if (category === 'sale') params.set('tag', 'sale');
        if (searchQuery) params.set('search', searchQuery);
        const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBaseProducts(mapApiProducts(data));
        } else {
          setBaseProducts([]);
        }
      } catch (error) {
        console.error('Failed to load products', error);
        setBaseProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, searchQuery]);

  const getSizes = (product: Product) =>
    product.sizes?.length
      ? product.sizes
      : (product.variants ?? []).map((variant) => ({
          size: variant.label,
          stock: variant.stock ?? 0,
        }));

  const filteredProducts = useMemo(() => {
    let filtered = [...baseProducts];

    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p =>
        getSizes(p).some(s => selectedSizes.includes(s.size) && s.stock > 0)
      );
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        selectedColors.includes(
          language === 'ru' ? p.color_ru ?? '' : p.color_en ?? ''
        )
      );
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (showInStock) {
      filtered = filtered.filter(p => p.stock_total > 0);
    }

    switch (sortBy) {
      case 'newest':
        filtered = filtered.filter((p) => hasTag(p, 'new'));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [baseProducts, selectedSizes, selectedColors, priceRange, sortBy, showInStock, language]);

  const categoryInfo = {
    men: {
      title_ru: 'Мужская обувь',
      title_en: 'Men\'s Footwear',
    },
    women: {
      title_ru: 'Женская обувь',
      title_en: 'Women\'s Footwear',
    },
    premium: {
      title_ru: 'Премиум коллекция',
      title_en: 'Premium Collection',
    },
    new: {
      title_ru: 'Новинки',
      title_en: 'New Arrivals',
    },
    sale: {
      title_ru: 'Акции',
      title_en: 'Sale',
    },
    accessories: {
      title_ru: 'Аксессуары',
      title_en: 'Accessories',
    },
  };

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.men;
  const effectiveCategory =
    category === 'all'
      ? { title_ru: 'Каталог', title_en: 'Catalog' }
      : currentCategory;

  const availableSizes = Array.from(
    new Set(baseProducts.flatMap(p => getSizes(p).map(s => s.size)))
  ).sort();

  const availableColors = Array.from(
    new Set(
      baseProducts
        .map(p => (language === 'ru' ? p.color_ru : p.color_en))
        .filter((c): c is string => Boolean(c))
    )
  );

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Sizes */}
      <div>
        <h4 className="mb-3 text-sm font-medium">{t('Размер', 'Size')}</h4>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map(size => (
            <button
              key={size}
              onClick={() =>
                setSelectedSizes(prev =>
                  prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                )
              }
              className={`px-3 py-2 text-sm border transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-border hover:border-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="border-t border-border pt-6">
        <h4 className="mb-3 text-sm font-medium">{t('Цвет', 'Color')}</h4>
        <div className="space-y-2">
          {availableColors.map(color => (
            <label key={color} className="flex items-center gap-3 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() =>
                  setSelectedColors(prev =>
                    prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                  )
                }
                className="w-4 h-4 accent-black"
              />
              <span>{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="border-t border-border pt-6">
        <h4 className="mb-3 text-sm font-medium">{t('Цена', 'Price')}</h4>
        <input
          type="range"
          min="0"
          max="50000"
          step="1000"
          value={priceRange[1]}
          onChange={e => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full accent-black"
        />
        <p className="text-sm text-text-light mt-2">
          {t('До', 'Up to')} {priceRange[1].toLocaleString('ru-RU')} ₽
        </p>
      </div>

      {/* In Stock */}
      <div className="border-t border-border pt-6">
        <label className="flex items-center gap-3 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={showInStock}
            onChange={e => setShowInStock(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          <span>{t('Только в наличии', 'In stock only')}</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-2">
            {language === 'ru' ? currentCategory.title_ru : currentCategory.title_en}
          </h1>
          <p className="text-text-light text-sm">
            {t('Найдено товаров', 'Products found')}: {filteredProducts.length}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium">{t('Фильтры', 'Filters')}</h3>
              </div>
              <FilterSection />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border hover:border-black transition-colors text-sm"
              >
                <SlidersHorizontal size={16} />
                {t('Фильтры', 'Filters')}
              </button>

              <div className="hidden lg:block text-sm text-text-light">
                {filteredProducts.length} {t('товаров', 'items')}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 border border-border focus:outline-none focus:border-black text-sm bg-white cursor-pointer"
              >
                <option value="default">{t('По умолчанию', 'Default')}</option>
                <option value="newest">{t('Новинки', 'Newest')}</option>
                <option value="price-asc">{t('Цена: по возрастанию', 'Price: Low to High')}</option>
                <option value="price-desc">{t('Цена: по убыванию', 'Price: High to Low')}</option>
              </select>
            </div>

            {/* Product Grid */}
            {/* API NOTE: Grid from GET /api/products?category=...&filters... */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-border border-t-black rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-text-light mb-4">
                  {t('Товары не найдены', 'No products found')}
                </p>
                <button
                  onClick={() => {
                    setSelectedSizes([]);
                    setSelectedColors([]);
                    setPriceRange([0, 50000]);
                    setShowInStock(false);
                  }}
                  className="text-sm underline hover:no-underline"
                >
                  {t('Сбросить фильтры', 'Reset filters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-full sm:w-80 bg-white z-50 lg:hidden overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-medium">{t('Фильтры', 'Filters')}</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <FilterSection />
              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-text-medium transition-colors"
                >
                  {t('Показать результаты', 'Show results')} ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
