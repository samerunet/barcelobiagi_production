'use client';

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { mapApiProduct } from '@/lib/productMapper';
import { Product } from '@/types';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { ChevronLeft, Heart, Truck, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { resolveImageUrl } from '../lib/images';

export function ProductDetail() {
  const params = useParams();
  const idParam =
    params && typeof params === 'object'
      ? (params as Record<string, string | string[]>).id
      : undefined;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [related, setRelated] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setLoadError(null);
      if (!id) return;
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          console.error('Failed to load product', res.status);
          setLoadError(`Status ${res.status}`);
          return;
        }
        const data = await res.json();
        setProduct(mapApiProduct(data));

        const relRes = await fetch(`/api/products?category=${data.category?.slug ?? data.categoryId ?? ''}&take=4`);
        if (relRes.ok) {
          const relData = await relRes.json();
          setRelated(relData.map(mapApiProduct).filter((p: Product) => p.id !== data.id));
        }
      } catch (error) {
        console.error('Failed to load product', error);
        setLoadError('network');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">{t('Товар не найден', 'Product not found')}</h2>
          {loadError && <p className="text-sm text-text-light mb-4">({loadError})</p>}
          <Button onClick={() => navigate('/')}>
            {t('Вернуться на главную', 'Return to home')}
          </Button>
        </div>
      </div>
    );
  }

  const name = language === 'ru' ? product.name_ru : product.name_en;
  const description = language === 'ru' ? product.description_ru : product.description_en;
  const material = language === 'ru' ? product.material_ru : product.material_en;
  const color = language === 'ru' ? product.color_ru : product.color_en;
  const sizes =
    (product.sizes && product.sizes.length > 0
      ? product.sizes
      : (product.variants ?? []).map((variant) => ({
          size: variant.label,
          stock: variant.stock ?? 0,
        }))) ?? [];

  const isOutOfStock = product.stock_total === 0;
  const isLowStock = product.stock_total > 0 && product.stock_total <= product.stock_low_threshold;
  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error(t('Пожалуйста, выберите размер', 'Please select a size'));
      return;
    }
    addToCart(product, selectedSize, quantity);
    toast.success(t('Товар добавлен в корзину', 'Product added to cart'));
  };

  // 360° Viewer handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const diff = e.clientX - startX;
    const sensitivity = 10; // pixels needed to advance one frame
    
    if (Math.abs(diff) > sensitivity) {
      const direction = diff > 0 ? 1 : -1;
      const newIndex = (selectedImage + direction + product.images.length) % product.images.length;
      setSelectedImage(newIndex);
      setStartX(e.clientX);
      setCurrentRotation(prev => prev + (360 / product.images.length) * direction);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const diff = e.touches[0].clientX - startX;
    const sensitivity = 10;
    
    if (Math.abs(diff) > sensitivity) {
      const direction = diff > 0 ? 1 : -1;
      const newIndex = (selectedImage + direction + product.images.length) % product.images.length;
      setSelectedImage(newIndex);
      setStartX(e.touches[0].clientX);
      setCurrentRotation(prev => prev + (360 / product.images.length) * direction);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Get related products
  // API NOTE: Related products from API
  const relatedProducts = related.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm hover:gap-3 transition-all text-text-dark"
          >
            <ChevronLeft size={16} />
            {t('Назад', 'Back')}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          {/* Left: product info */}
          <div className="lg:w-1/2 space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-text-light uppercase tracking-wide">Barcelo Biagi</p>
              <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
              <p className="text-sm text-text-light capitalize">{product.category}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">{product.price.toLocaleString('ru-RU')} ₽</span>
              {product.old_price && (
                <span className="text-text-light line-through">
                  {product.old_price.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>

            {/* Size selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{t('Выберите размер', 'Select size')}</h4>
                <button className="text-xs underline hover:no-underline">
                  {t('Таблица размеров', 'Size guide')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    disabled={size.stock === 0}
                    className={`h-10 min-w-[52px] px-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedSize === size.size
                        ? 'bg-black text-white border-black'
                        : size.stock > 0
                        ? 'border-border hover:border-black bg-white'
                        : 'border-border text-text-light cursor-not-allowed opacity-40 bg-white'
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('Количество', 'Quantity')}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 border border-border rounded-lg flex items-center justify-center text-xl hover:border-black"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 border border-border rounded-lg flex items-center justify-center text-xl hover:border-black"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Button fullWidth onClick={handleAddToCart} disabled={isOutOfStock}>
                {t('Добавить в корзину', 'Add to cart')}
              </Button>
              <button
                onClick={() => setIsFavorite((prev) => !prev)}
                className="w-full border border-border py-3 text-sm font-medium hover:bg-surface-light transition-colors flex items-center justify-center gap-2 rounded-lg"
              >
                <Heart size={18} className={isFavorite ? 'text-error fill-error' : ''} />
                {isFavorite ? t('В избранном', 'In favorites') : t('В избранное', 'Add to favorites')}
              </button>
            </div>

            <div className="border-t border-border pt-6 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-900">{t('Описание', 'Description')}</p>
                <p className="text-text-dark leading-relaxed">{description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-light">{t('Материал', 'Material')}</p>
                  <p className="text-text-dark">{material || '—'}</p>
                </div>
                <div>
                  <p className="text-text-light">{t('Цвет', 'Color')}</p>
                  <p className="text-text-dark">{color || '—'}</p>
                </div>
                <div>
                  <p className="text-text-light">{t('Артикул', 'SKU')}</p>
                  <p className="text-text-dark">{product.sku}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Truck size={20} className="text-text-light flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{t('Доставка', 'Delivery')}</p>
                  <p className="text-text-dark">{t('Бесплатная доставка по Иваново 1-2 дня', 'Free delivery in Ivanovo 1-2 days')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-text-light">
                <Star size={16} className="text-warning" />
                <span>4.5</span>
                <span className="text-xs">(23 {t('отзыва', 'reviews')})</span>
              </div>
            </div>
          </div>

          {/* Right: gallery */}
          <div className="lg:w-1/2 space-y-4">
            <div className="relative aspect-square bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
              <ImageWithFallback
                src={resolveImageUrl(product.images[selectedImage])}
                alt={name}
                className="w-full h-full object-contain bg-white"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border transition-all ${
                      selectedImage === index ? 'border-black shadow-sm' : 'border-border hover:border-text-medium'
                    }`}
                  >
                    <ImageWithFallback
                      src={resolveImageUrl(image)}
                      alt={`${name} ${index}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
            {/* 
              DEV NOTE: 360° Shoe Viewer
              
              Implement a 360-degree product viewer on production site:
              - Load 24-36 high-quality images of the shoe from different angles (0°, 15°, 30°, etc.)
              - Store image URLs in API field: images_360[] or separate CDN folder per product
              - When user drags left/right (or swipes on mobile), cycle through frames
              - Consider using libraries like:
                * react-360-view
                * threesixty-js
                * sirv-spin
              - Lazy load images for performance
              
              API Endpoint: GET /api/products/{id}/images360
              Response: { images_360: ["url1.jpg", "url2.jpg", ...] }
            */}
            
            {/* Main Image - 360° Viewer Frame */}
            <div 
              className="relative aspect-square max-w-xl bg-white border border-border rounded-2xl overflow-hidden select-none mx-auto"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div className="w-full h-full p-4">
                <ImageWithFallback
                  src={resolveImageUrl(product.images[selectedImage])}
                  alt={name}
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
              </div>
              
              {/* 360° Overlay Control - Bottom Right */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                {/* Rotate Icon Circle */}
                <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="animate-spin-slow"
                    style={{ animationDuration: '8s' }}
                  >
                    <path
                      d="M8 2V4M8 12V14M14 8H12M4 8H2M12.5 3.5L11 5M5 11L3.5 12.5M12.5 12.5L11 11M5 5L3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 8L8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.5 7.5L11 8L9.5 8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                
                {/* 360° Text */}
                <span className="text-xs font-medium text-black whitespace-nowrap">
                  {t('Поверните 360°', 'Rotate 360°')}
                </span>
              </div>
              
              {/* Drag hint on first load */}
              {!isDragging && selectedImage === 0 && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-white rounded-lg px-6 py-3 shadow-xl">
                    <p className="text-sm font-medium">
                      {t('← Перетащите для поворота →', '← Drag to rotate →')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Fake 360° Frames Strip */}
            {product.images.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs text-text-light flex items-center gap-2">
                  <RefreshCw size={12} />
                  {t('Все ракурсы', 'All angles')}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border transition-all ${
                        selectedImage === index
                          ? 'border-black'
                          : 'border-border hover:border-text-medium'
                      }`}
                    >
                      <ImageWithFallback 
                        src={resolveImageUrl(image)} 
                        alt={`${name} ${index}`}
                        className="w-full h-full object-contain bg-white" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-1/2 lg:sticky lg:top-24 lg:self-start">
            {/* Brand */}
            <p className="text-text-light text-xs uppercase tracking-wide mb-2">Barcelo Biagi</p>

            {/* Title */}
            <h1 className="mb-4">{name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-medium">{product.price.toLocaleString('ru-RU')} ₽</span>
              {product.old_price && (
                <>
                  <span className="text-text-light line-through">
                    {product.old_price.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="bg-error text-white text-xs px-2 py-1 font-medium">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {isOutOfStock && (
              <div className="bg-surface-light px-4 py-3 mb-6">
                <p className="text-sm text-text-dark">{t('Нет в наличии', 'Out of stock')}</p>
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div className="bg-warning/10 px-4 py-3 mb-6">
                <p className="text-sm text-warning">{t('Осталось мало', 'Low stock')}</p>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">{t('Выберите размер', 'Select size')}</h4>
                <button className="text-xs underline hover:no-underline">
                  {t('Таблица размеров', 'Size guide')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    disabled={size.stock === 0}
                    className={
                      selectedSize === size.size
                        ? 'h-11 min-w-[60px] px-3 py-2 rounded-lg border text-sm font-medium transition-all bg-black text-white border-black shadow-sm'
                        : size.stock > 0
                        ? 'h-11 min-w-[60px] px-3 py-2 rounded-lg border text-sm font-medium transition-all border-border hover:border-black bg-white'
                        : 'h-11 min-w-[60px] px-3 py-2 rounded-lg border text-sm font-medium transition-all border-border text-text-light cursor-not-allowed opacity-40 bg-white'
                    }
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-8">
              <Button
                fullWidth
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {t('Добавить в корзину', 'Add to cart')}
              </Button>
              <button
                className="w-full border border-border py-3 text-sm font-medium hover:bg-surface-light transition-colors flex items-center justify-center gap-2"
                onClick={() => setIsFavorite((prev) => !prev)}
              >
                <Heart size={18} className={isFavorite ? 'text-error fill-error' : ''} />
                {isFavorite ? t('В избранном', 'In favorites') : t('В избранное', 'Add to favorites')}
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-border pt-8 space-y-6 text-sm mt-8">
              <div>
                <p className="text-text-light mb-2">{t('Описание', 'Description')}</p>
                <p className="text-text-dark leading-relaxed">{description}</p>
              </div>
              <div>
                <p className="text-text-light mb-1">{t('Материал', 'Material')}</p>
                <p className="text-text-dark">{material}</p>
              </div>
              <div>
                <p className="text-text-light mb-1">{t('Цвет', 'Color')}</p>
                <p className="text-text-dark">{color}</p>
              </div>
              <div>
                <p className="text-text-light mb-1">{t('Артикул', 'SKU')}</p>
                <p className="text-text-dark">{product.sku}</p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t border-border mt-6 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck size={20} className="text-text-light flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-text-dark font-medium mb-1">
                    {t('Бесплатная доставка', 'Free shipping')}
                  </p>
                  <p className="text-text-light">
                    {t('По Иванову 1-2 дня', 'In Ivanovo 1-2 days')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-12">
            <h2 className="mb-8">
              {t('С этим товаром покупают', 'You may also like')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onClick={() => {
                    navigate(`/product/${relatedProduct.id}`);
                    window.scrollTo(0, 0);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
