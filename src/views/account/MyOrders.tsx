'use client';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  items: OrderItem[];
};

export function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      navigate('/login');
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/orders?customerId=${customerId}`);
        if (!res.ok) {
          setError('Не удалось загрузить заказы');
          setOrders([]);
          return;
        }
        const data = await res.json();
        const mapped = (data ?? []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: Number(o.totalAmount ?? 0),
          paymentStatus: o.paymentStatus ?? 'pending',
          deliveryStatus: o.deliveryStatus ?? 'pending',
          createdAt: o.createdAt,
          items: (o.items ?? []).map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: Number(i.unitPrice ?? 0),
            name: i.product?.nameRu ?? i.product?.nameEn,
          })),
        }));
        setOrders(mapped);
      } catch (err) {
        console.error('Failed to load orders', err);
        setError('Не удалось загрузить заказы');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои заказы</h1>
            <p className="text-sm text-gray-600">История ваших покупок</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('customerToken');
              localStorage.removeItem('customerId');
              localStorage.removeItem('customerEmail');
              localStorage.removeItem('customerName');
              navigate('/');
            }}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Выйти
          </button>
        </div>

        {loading && <p className="text-sm text-gray-600">Загрузка...</p>}
        {error && <p className="text-sm text-error mb-4">{error}</p>}

        {!loading && !orders.length && (
          <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-600">
            Заказов пока нет. <Link to="/" className="text-primary">Перейти к покупкам</Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">№ {order.orderNumber}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Оплата: <span className="font-medium">{order.paymentStatus}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Доставка: <span className="font-medium">{order.deliveryStatus}</span>
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    {order.total.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-sm">
                    <div className="text-gray-800">
                      {item.name || 'Товар'} × {item.quantity}
                    </div>
                    <div className="text-gray-900 font-medium">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
