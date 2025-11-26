'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShoppingBag, TrendingUp, Users, CreditCard, ArrowUpRight } from 'lucide-react';

export function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [o, c, p] = await Promise.all([
          fetch('/api/orders').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/customers').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/products').then((r) => (r.ok ? r.json() : [])),
        ]);
        setOrders(o ?? []);
        setCustomers(c ?? []);
        setProducts(p ?? []);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0);
    const paidOrders = orders.filter((o) => (o.paymentStatus || '').toLowerCase() === 'paid');
    const avgCheck = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;
    const featured = products.filter((p) => p.featured).length;
    return [
      { label: 'Выручка', value: `₽${revenue.toLocaleString('ru-RU')}`, hint: null, icon: TrendingUp },
      { label: 'Заказы', value: orders.length, hint: null, icon: ShoppingBag },
      { label: 'Клиенты', value: customers.length, hint: null, icon: Users },
      {
        label: 'Средний чек',
        value: `₽${avgCheck.toLocaleString('ru-RU')}`,
        hint: featured ? `${featured} featured` : null,
        icon: CreditCard,
      },
    ];
  }, [orders, customers, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>
            <p className="text-sm text-gray-600">Краткая статистика магазина</p>
          </div>
          <button
            onClick={() => location.reload()}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="text-sm text-error">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{s.label}</p>
                <s.icon className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-900">{s.value}</p>
              {s.hint ? (
                <div className="flex items-center gap-1 text-sm text-success mt-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{s.hint}</span>
                </div>
              ) : (
                <div className="h-5" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Последние заказы</h2>
          {loading ? (
            <p className="text-sm text-gray-600">Загрузка...</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 8).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">№ {o.orderNumber}</p>
                    <p className="text-gray-500">
                      {new Date(o.createdAt ?? o.date ?? Date.now()).toLocaleDateString('ru-RU')} ·{' '}
                      {o.customer?.email ?? o.customerId ?? 'Гость'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {Number(o.totalAmount ?? 0).toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-xs text-gray-500">{o.paymentStatus ?? '—'}</p>
                  </div>
                </div>
              ))}
              {!orders.length && <p className="text-sm text-gray-600">Нет заказов</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
