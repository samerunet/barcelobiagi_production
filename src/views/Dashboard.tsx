'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { User, Package, MapPin, Settings, ChevronRight, Calendar, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  // Mock data - in production, fetch from API: GET /api/user/profile
  const userProfile = {
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    phone: '+7 (999) 123-45-67',
  };

  // Mock orders - API: GET /api/orders
  const orders = [
    {
      id: 'ORD-2025-001',
      date: '2025-01-15',
      status_ru: 'Доставлен',
      status_en: 'Delivered',
      total: 18990,
      items: 2,
    },
    {
      id: 'ORD-2025-002',
      date: '2025-01-10',
      status_ru: 'В пути',
      status_en: 'In Transit',
      total: 16990,
      items: 1,
    },
    {
      id: 'ORD-2024-153',
      date: '2024-12-28',
      status_ru: 'Доставлен',
      status_en: 'Delivered',
      total: 34990,
      items: 1,
    },
  ];

  // Mock addresses - API: GET /api/user/addresses
  const addresses = [
    {
      id: '1',
      title_ru: 'Дом',
      title_en: 'Home',
      address_ru: 'г. Иваново, ул. Ленина, д. 15, кв. 42',
      address_en: 'Ivanovo, Lenin St., 15, apt. 42',
      isDefault: true,
    },
    {
      id: '2',
      title_ru: 'Работа',
      title_en: 'Office',
      address_ru: 'г. Иваново, пр. Шереметевский, д. 85, офис 301',
      address_en: 'Ivanovo, Sheremetevsky Ave., 85, office 301',
      isDefault: false,
    },
  ];

  const tabs = [
    { id: 'profile', label_ru: 'Профиль', label_en: 'Profile', icon: User },
    { id: 'orders', label_ru: 'Заказы', label_en: 'Orders', icon: Package },
    { id: 'addresses', label_ru: 'Адреса', label_en: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-surface-light">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1>{t('Личный кабинет', 'My Account')}</h1>
          <p className="text-text-medium mt-2">
            {t('Управление профилем и заказами', 'Manage your profile and orders')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent-brown text-white'
                      : 'text-charcoal hover:bg-surface-light'
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="font-medium">
                    {language === 'ru' ? tab.label_ru : tab.label_en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-md p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2>{t('Информация профиля', 'Profile Information')}</h2>
                  <button className="text-accent-brown hover:text-accent-brown-dark font-medium flex items-center gap-1">
                    <Settings size={18} />
                    {t('Настройки', 'Settings')}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-medium mb-2">
                      {t('Имя', 'Name')}
                    </label>
                    <input
                      type="text"
                      defaultValue={userProfile.name}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brown"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-medium mb-2">
                      {t('Email', 'Email')}
                    </label>
                    <input
                      type="email"
                      defaultValue={userProfile.email}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brown"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-medium mb-2">
                      {t('Телефон', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      defaultValue={userProfile.phone}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brown"
                    />
                  </div>

                  <div className="pt-4">
                    <button className="px-8 py-3 bg-accent-brown hover:bg-accent-brown-dark text-white rounded-xl transition-all shadow-md hover:shadow-lg">
                      {t('Сохранить изменения', 'Save Changes')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-md p-8">
                <h2 className="mb-8">{t('Мои заказы', 'My Orders')}</h2>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/order/${order.id}`}
                      className="block p-6 border border-border rounded-xl hover:border-accent-brown hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-charcoal">{order.id}</span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              order.status_en === 'Delivered'
                                ? 'bg-success/10 text-success'
                                : 'bg-accent-brown/10 text-accent-brown'
                            }`}>
                              {language === 'ru' ? order.status_ru : order.status_en}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-text-medium">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(order.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package size={14} />
                              {order.items} {t('товар(а)', 'item(s)')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-text-medium mb-1">{t('Итого', 'Total')}</p>
                            <p className="text-lg font-semibold text-charcoal">
                              {order.total.toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                          <ChevronRight size={20} className="text-text-light group-hover:text-accent-brown" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-text-light mb-4" />
                    <p className="text-text-medium mb-6">
                      {t('У вас пока нет заказов', 'You have no orders yet')}
                    </p>
                    <Link
                      to="/"
                      className="inline-block px-8 py-3 bg-accent-brown hover:bg-accent-brown-dark text-white rounded-xl transition-all"
                    >
                      {t('Начать покупки', 'Start Shopping')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-md p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2>{t('Мои адреса', 'My Addresses')}</h2>
                  <button className="px-6 py-2 bg-accent-brown hover:bg-accent-brown-dark text-white rounded-xl transition-all">
                    {t('+ Добавить адрес', '+ Add Address')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-6 border-2 rounded-xl transition-all ${
                        address.isDefault
                          ? 'border-accent-brown bg-accent-brown-light/30'
                          : 'border-border hover:border-accent-brown'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-accent-brown" />
                          <h4>{language === 'ru' ? address.title_ru : address.title_en}</h4>
                        </div>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-accent-brown text-white text-xs font-medium rounded-full">
                            {t('По умолчанию', 'Default')}
                          </span>
                        )}
                      </div>
                      <p className="text-text-medium mb-4">
                        {language === 'ru' ? address.address_ru : address.address_en}
                      </p>
                      <div className="flex gap-2">
                        <button className="text-accent-brown hover:text-accent-brown-dark text-sm font-medium">
                          {t('Редактировать', 'Edit')}
                        </button>
                        <span className="text-border">•</span>
                        <button className="text-error hover:text-error/80 text-sm font-medium">
                          {t('Удалить', 'Delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
