'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ShippingInfo, PaymentInfo } from '../types';
import { Check } from 'lucide-react';
import { YandexDeliveryWidget } from '@/components/YandexDeliveryWidget';

export function Checkout() {
  const { items, getSubtotal, clearCart } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pickupPoint, setPickupPoint] = useState<any | null>(null);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    phone: '',
    email: '',
    city: 'Иваново',
    address: '',
    postal_code: '',
    delivery_method: 'courier',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card',
  });

  const subtotal = getSubtotal();
  const shipping: number = shippingInfo.delivery_method === 'courier' ? 0 : 0; // Both free in this case
  const total = subtotal + shipping;

  if (items.length === 0 && step < 4) {
    navigate('/cart');
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    // API NOTE: POST /api/orders (placeholder)
    // Send order data to kassa.primarket.ru API
    // Request body would include: items, shippingInfo, paymentInfo, total
    // Response should include order number/ID

    // Simulate API call
    const mockOrderNumber = `BB-${Date.now().toString().slice(-6)}`;
    setOrderNumber(mockOrderNumber);
    clearCart();
  };

  // Success screen
  if (orderNumber) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white p-12 border border-border">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-white" />
            </div>

            <h1 className="mb-4">{t('Спасибо за заказ!', 'Thank you for your order!')}</h1>

            <p className="text-text-light mb-8">
              {t(
                `Заказ №${orderNumber} оформлен. Мы отправили подтверждение на ${shippingInfo.email}.`,
                `Order #${orderNumber} has been placed. We sent a confirmation to ${shippingInfo.email}.`
              )}
            </p>

            <div className="bg-surface-light p-6 mb-8 text-left">
              <h4 className="mb-4">{t('Детали заказа', 'Order details')}</h4>
              <div className="space-y-2">
                <p className="text-text-dark">
                  <span className="text-text-light">{t('Номер заказа', 'Order number')}:</span> {orderNumber}
                </p>
                <p className="text-text-dark">
                  <span className="text-text-light">{t('Сумма', 'Total')}:</span> {total.toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-text-dark">
                  <span className="text-text-light">{t('Доставка', 'Delivery')}:</span>{' '}
                  {shippingInfo.delivery_method === 'courier'
                    ? t('Курьер', 'Courier')
                    : t('Самовывоз из ТРЦ «Серебряный город»', 'Pickup from Serebryany Gorod mall')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="primary" onClick={() => navigate('/')} className="w-full">
                {t('Продолжить покупки', 'Continue shopping')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="mb-8">{t('Оформление заказа', 'Checkout')}</h1>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    step >= s ? 'bg-accent-brown text-white' : 'bg-surface-light text-text-light border-2 border-border'
                  }`}
                >
                  {s}
                </div>
                <span className={step >= s ? 'text-text-dark' : 'text-text-light'}>
                  {s === 1 && t('Доставка', 'Shipping')}
                  {s === 2 && t('Оплата', 'Payment')}
                  {s === 3 && t('Подтверждение', 'Review')}
                </span>
              </div>
              {s < 3 && <div className="w-12 h-0.5 bg-border" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white p-8 border border-border">
                <h2 className="mb-6">{t('Информация о доставке', 'Shipping Information')}</h2>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-text-dark mb-2">
                      {t('Имя и фамилия', 'Full name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.name}
                      onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-dark mb-2">
                        {t('Телефон', 'Phone')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                      />
                    </div>

                    <div>
                      <label className="block text-text-dark mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={e => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-dark mb-2">{t('Город', 'City')} *</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                    />
                  </div>

                  <div>
                    <label className="block text-text-dark mb-2">{t('Способ доставки', 'Delivery method')} *</label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border border-border cursor-pointer hover:border-accent-brown transition-colors">
                      <input
                        type="radio"
                        name="delivery"
                        value="courier"
                          checked={shippingInfo.delivery_method === 'courier'}
                          onChange={e =>
                            setShippingInfo({
                              ...shippingInfo,
                              delivery_method: e.target.value as 'courier',
                            })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-text-dark">
                            {t('Доставка курьером по Иванову', 'Courier delivery in Ivanovo')}
                          </p>
                          <p className="text-text-light">
                            {t('Бесплатно, 1-2 дня', 'Free, 1-2 days')}
                          </p>
                        </div>
                      </label>

                    <label className="flex items-start gap-3 p-4 border border-border cursor-pointer hover:border-accent-brown transition-colors">
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={shippingInfo.delivery_method === 'pickup'}
                          onChange={e =>
                            setShippingInfo({
                              ...shippingInfo,
                              delivery_method: e.target.value as 'pickup',
                            })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-text-dark">
                            {t('Самовывоз из ТРЦ «Серебряный город»', 'Pickup from Serebryany Gorod mall')}
                          </p>
                          <p className="text-text-light">
                            {t('Бесплатно, сегодня', 'Free, today')}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {shippingInfo.delivery_method === 'courier' && (
                    <>
                      <div>
                        <label className="block text-text-dark mb-2">
                          {t('Адрес доставки', 'Delivery address')} *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.address}
                          onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                          className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                        />
                      </div>

                      <div>
                        <label className="block text-text-dark mb-2">
                          {t('Индекс', 'Postal code')}
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.postal_code}
                          onChange={e => setShippingInfo({ ...shippingInfo, postal_code: e.target.value })}
                          className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                        />
                      </div>
                    </>
                  )}

                  {shippingInfo.delivery_method === 'pickup' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-text-dark mb-2">
                          {t('Выберите пункт выдачи', 'Choose pickup point')}
                        </h4>
                        <YandexDeliveryWidget
                          city={shippingInfo.city}
                          stationId="YOUR_STATION_GUID_HERE"
                          weightGrams={3000}
                          onPointSelect={(point) => setPickupPoint(point)}
                        />
                      </div>
                      {pickupPoint && (
                        <div className="p-4 border border-accent-brown bg-surface-light rounded">
                          <p className="text-sm font-medium text-text-dark mb-1">
                            {t('Вы выбрали пункт выдачи', 'Selected pickup point')}
                          </p>
                          <p className="text-sm text-text-dark">{pickupPoint.address?.full_address}</p>
                          {pickupPoint.id && (
                            <p className="text-xs text-text-light mt-1">ID: {pickupPoint.id}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full">
                    {t('Продолжить', 'Continue')}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white p-8 border border-border">
                <h2 className="mb-6">{t('Способ оплаты', 'Payment Method')}</h2>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border border-border cursor-pointer hover:border-accent-brown transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentInfo.method === 'card'}
                        onChange={e => setPaymentInfo({ method: e.target.value as 'card' })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-text-dark">{t('Банковская карта', 'Credit/Debit Card')}</p>
                        <p className="text-text-light">{t('Visa, MasterCard, Мир', 'Visa, MasterCard, Mir')}</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-border cursor-pointer hover:border-accent-brown transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="cash_on_delivery"
                        checked={paymentInfo.method === 'cash_on_delivery'}
                        onChange={e => setPaymentInfo({ method: e.target.value as 'cash_on_delivery' })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-text-dark">{t('Оплата при получении', 'Cash on delivery')}</p>
                        <p className="text-text-light">{t('Наличными или картой курьеру', 'Cash or card to courier')}</p>
                      </div>
                    </label>
                  </div>

                  {paymentInfo.method === 'card' && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div>
                        <label className="block text-text-dark mb-2">
                          {t('Номер карты', 'Card number')}
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-text-dark mb-2">
                            {t('Срок действия', 'Expiry date')}
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                          />
                        </div>

                        <div>
                          <label className="block text-text-dark mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 border border-border focus:outline-none focus:border-accent-brown"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                      {t('Назад', 'Back')}
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {t('Продолжить', 'Continue')}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="bg-white p-8 border border-border">
                <h2 className="mb-6">{t('Проверьте заказ', 'Review Your Order')}</h2>

                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="mb-4">{t('Товары', 'Items')}</h4>
                    <div className="space-y-3">
                      {items.map(item => {
                        const name = language === 'ru' ? item.product.name_ru : item.product.name_en;
                        return (
                          <div
                            key={`${item.product.id}-${item.size}`}
                            className="flex justify-between items-center py-2 border-b border-border"
                          >
                            <div>
                              <p className="text-text-dark">{name}</p>
                              <p className="text-text-light">
                                {t('Размер', 'Size')}: {item.size}, {t('Кол-во', 'Qty')}: {item.quantity}
                              </p>
                            </div>
                            <p className="text-text-dark">
                              {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h4 className="mb-4">{t('Доставка', 'Shipping')}</h4>
                    <div className="bg-surface-light p-4">
                      <p className="text-text-dark mb-1">{shippingInfo.name}</p>
                      <p className="text-text-light">{shippingInfo.phone}</p>
                      <p className="text-text-light">{shippingInfo.email}</p>
                      {shippingInfo.delivery_method === 'courier' ? (
                        <p className="text-text-light mt-2">
                          {shippingInfo.address}, {shippingInfo.city}
                          {shippingInfo.postal_code && `, ${shippingInfo.postal_code}`}
                        </p>
                      ) : (
                        <p className="text-text-light mt-2">
                          {t('Самовывоз из ТРЦ «Серебряный город»', 'Pickup from Serebryany Gorod mall')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h4 className="mb-4">{t('Оплата', 'Payment')}</h4>
                    <div className="bg-surface-light p-4">
                      <p className="text-text-dark">
                        {paymentInfo.method === 'card'
                          ? t('Банковская карта', 'Credit/Debit Card')
                          : t('Оплата при получении', 'Cash on delivery')}
                      </p>
                    </div>
                  </div>

                  {/* Terms Agreement Checkbox */}
                  <div className="border-t border-border pt-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-accent-brown"
                      />
                      <span className="text-sm text-text-medium">
                        {language === 'ru' ? (
                          <>
                            Я принимаю{' '}
                            <Link to="/terms" className="text-accent-brown hover:text-accent-brown-dark underline">
                              Условия использования
                            </Link>
                            {' '}и{' '}
                            <Link to="/privacy" className="text-accent-brown hover:text-accent-brown-dark underline">
                              Политику конфиденциальности
                            </Link>
                          </>
                        ) : (
                          <>
                            I agree to the{' '}
                            <Link to="/terms" className="text-accent-brown hover:text-accent-brown-dark underline">
                              Terms of Use
                            </Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-accent-brown hover:text-accent-brown-dark underline">
                              Privacy Policy
                            </Link>
                          </>
                        )}
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                      {t('Назад', 'Back')}
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handlePlaceOrder} 
                      className="flex-1"
                      disabled={!agreedToTerms}
                    >
                      {t('Подтвердить заказ', 'Place order')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-border sticky top-24">
              <h3 className="mb-6">{t('Ваш заказ', 'Your Order')}</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-text-light">{t('Товары', 'Items')} ({items.length}):</span>
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
                    <span>{t('Итого', 'Total')}:</span>
                    <span className="text-primary-dark">{total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
