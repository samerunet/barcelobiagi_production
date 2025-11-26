'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CustomerReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scope: 'customer' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Не удалось отправить запрос');
        return;
      }
      const data = await res.json();
      setMessage('Ссылка для сброса отправлена. Для теста токен: ' + data.resetToken);
      setStep('reset');
    } catch (err) {
      setError('Ошибка запроса. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword, scope: 'customer' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Не удалось сбросить пароль');
        return;
      }
      setMessage('Пароль обновлен. Теперь можете войти.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError('Ошибка сброса. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'request' ? 'Сброс пароля' : 'Введите код и новый пароль'}
          </h1>
          <p className="text-sm text-gray-600">
            {step === 'request'
              ? 'Укажите email, чтобы получить ссылку для сброса'
              : 'Используйте токен из письма (для теста отображается здесь)'}
          </p>
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
            {message}
          </div>
        )}
        {step === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4">
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
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить ссылку'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Обновляем...' : 'Обновить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
