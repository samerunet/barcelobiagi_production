'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CustomerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, scope: 'customer' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Неверный email или пароль');
        return;
      }
      const data = await res.json();
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerId', data.customer?.id);
      localStorage.setItem('customerEmail', data.customer?.email);
      localStorage.setItem(
        'customerName',
        `${data.customer?.firstName ?? ''} ${data.customer?.lastName ?? ''}`.trim()
      );
      navigate('/account/orders');
    } catch (err) {
      setError('Ошибка входа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Вход</h1>
          <p className="text-sm text-gray-600">Войдите, чтобы увидеть историю заказов</p>
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <button
            onClick={() => navigate('/register')}
            className="text-primary hover:text-primary-dark"
          >
            Регистрация
          </button>
          <button
            onClick={() => navigate('/reset-password')}
            className="text-primary hover:text-primary-dark"
          >
            Забыли пароль?
          </button>
        </div>
      </div>
    </div>
  );
}
