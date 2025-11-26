'use client';

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag,
  Settings,
  LogOut,
  BarChart3,
  Users
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const stats = [
    {
      label: 'Всего товаров',
      value: '127',
      change: '+12',
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Мало на складе',
      value: '8',
      change: '-3',
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Активных товаров',
      value: '115',
      change: '+5',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Заказов сегодня',
      value: '23',
      change: '+8',
      icon: ShoppingBag,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const quickActions = [
    {
      label: 'Управление товарами',
      description: 'Добавить, изменить или удалить товары',
      icon: Package,
      path: '/admin/inventory',
      color: 'primary',
    },
    {
      label: 'Заказы',
      description: 'Просмотр и управление заказами',
      icon: ShoppingBag,
      path: '/admin/orders',
      color: 'accent',
    },
    {
      label: 'Аналитика',
      description: 'Продажи и статистика',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'success',
    },
    {
      label: 'Пользователи',
      description: 'Управление аккаунтами',
      icon: Users,
      path: '/admin/users',
      color: 'warning',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Админ-панель</h1>
              <p className="text-sm text-gray-500">BARCELO BIAGI - Иваново</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-error hover:bg-error/10 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-xs font-medium ${
                  stat.change.startsWith('+') ? 'text-success' : 'text-error'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="mb-4">Быстрые действия</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex p-2 rounded-lg mb-3 ${
                  action.color === 'primary' ? 'bg-primary/10 text-primary' :
                  action.color === 'accent' ? 'bg-accent/10 text-accent' :
                  action.color === 'success' ? 'bg-success/10 text-success' :
                  'bg-warning/10 text-warning'
                }`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <h4 className="mb-1 text-sm">{action.label}</h4>
                <p className="text-xs text-gray-500">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="mb-4">Последние события</h3>
          <div className="space-y-3">
            {[
              { action: 'Новый заказ', details: '#BB-123456 на сумму 15 990 ₽', time: '5 мин назад' },
              { action: 'Товар обновлен', details: 'Ботинки Chelsea Black - изменена цена', time: '23 мин назад' },
              { action: 'Низкий остаток', details: 'Туфли Oxford Brown - осталось 2 шт', time: '1 час назад' },
              { action: 'Заказ отправлен', details: '#BB-123440 - доставка курьером', time: '2 часа назад' },
            ].map((event, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.action}</p>
                  <p className="text-xs text-gray-500">{event.details}</p>
                </div>
                <span className="text-xs text-gray-400">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
