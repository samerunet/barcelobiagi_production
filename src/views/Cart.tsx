'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getPrimaryImage } from '../lib/images';

export function Cart() {
  const { items, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping: number = 0; // Free shipping or calculated
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag size={64} className="mx-auto text-text-light mb-6" />
          <h2 className="mb-4">{t('Ваша корзина пуста', 'Your cart is empty')}</h2>
          <p className="text-text-light mb-8">
            {t(
              'Добавьте товары в корзину, чтобы продолжить покупки',
              'Add items to your cart to continue shopping'
            )}
          </p>
          <Button onClick={() => navigate('/')}>
            {t('Продолжить покупки', 'Continue shopping')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8">{t('Корзина', 'Shopping Cart')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* API NOTE: Cart items stored locally or synced via /api/cart endpoints (placeholder) */}
            {items.map(item => {
              const name = language === 'ru' ? item.product.name_ru : item.product.name_en;
              const itemTotal = item.product.price * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="bg-white p-6 border border-border flex flex-col sm:flex-row gap-6"
                >
                  {/* Image */}
                  <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-surface-light overflow-hidden">
                  <ImageWithFallback
                    src={getPrimaryImage(item.product)}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="mb-1 truncate">{name}</h4>
                        <p className="text-text-light">
                          {t('Артикул', 'SKU')}: {item.product.sku}
                        </p>
                        <p className="text-text-light">
                          {t('Размер', 'Size')}: {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="p-2 text-error hover:bg-error/10 rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <span className="text-text-light">{t('Количество', 'Quantity')}:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            className="p-2 border border-border hover:bg-surface-light transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            className="p-2 border border-border hover:bg-surface-light transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-primary-dark">
                          {itemTotal.toLocaleString('ru-RU')} ₽
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-text-light">
                            {item.product.price.toLocaleString('ru-RU')} ₽ × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-border sticky top-24">
              <h3 className="mb-6">{t('Итого', 'Order Summary')}</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-text-light">{t('Промежуточный итог', 'Subtotal')}:</span>
                  <span className="text-text-dark">{subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-light">{t('Доставка', 'Shipping')}:</span>
                  <span className="text-text-dark">
                    {shipping === 0 ? t('Бесплатно', 'Free') : `${shipping.toLocaleString('ru-RU')} ₽`}
                  </span>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-baseline">
                    <span>{t('Всего', 'Total')}:</span>
                    <span className="text-primary-dark">{total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="primary" onClick={() => navigate('/checkout')} className="w-full">
                  {t('Оформить заказ', 'Checkout')}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/')} className="w-full">
                  {t('Продолжить покупки', 'Continue shopping')}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <p className="text-text-light">
                  {t('Бесплатная доставка по Иванову', 'Free shipping in Ivanovo')}
                </p>
                <p className="text-text-light">
                  {t('Возврат в течение 14 дней', '14-day return policy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
