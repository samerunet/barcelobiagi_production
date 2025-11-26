'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';
import { getPrimaryImage } from '../lib/images';

export function CartDrawer() {
  const { items, cartOpen, setCartOpen, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const subtotal = getSubtotal();

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[440px] bg-white z-50 shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3>{t('Корзина', 'Shopping Cart')}</h3>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-light mb-4">
                {t('Ваша корзина пуста', 'Your cart is empty')}
              </p>
              <Button onClick={() => setCartOpen(false)}>
                {t('Продолжить покупки', 'Continue shopping')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* API NOTE: Cart items can be stored locally or synced with backend via /api/cart endpoints */}
              {items.map((item) => {
                const name = language === 'ru' ? item.product.name_ru : item.product.name_en;
                return (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-4 border-b border-border pb-4">
                    {/* Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-surface-light overflow-hidden">
                      <ImageWithFallback
                        src={getPrimaryImage(item.product)}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate mb-1">{name}</h4>
                      <p className="text-text-light mb-2">
                        {t('Размер', 'Size')}: {item.size}
                      </p>
                      <p className="text-primary-dark">
                        {item.product.price.toLocaleString('ru-RU')} ₽
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="p-1 border border-border hover:bg-surface-light rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="p-1 border border-border hover:bg-surface-light rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="ml-auto p-1 text-error hover:bg-error/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-light">{t('Промежуточный итог', 'Subtotal')}:</span>
              <span className="text-primary-dark">{subtotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            <Button variant="primary" onClick={handleCheckout} className="w-full">
              {t('Перейти к оформлению', 'Go to checkout')}
            </Button>
            <button
              onClick={() => setCartOpen(false)}
              className="w-full text-center text-text-dark hover:text-accent-brown transition-colors"
            >
              {t('Продолжить покупки', 'Continue shopping')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
