'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Category = { id: string; nameRu: string; nameEn: string };

export function AdminProductForm() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    sku: '',
    nameRu: '',
    nameEn: '',
    descriptionRu: '',
    descriptionEn: '',
    categoryId: '',
    price: '',
    stockTotal: '',
    featured: false,
    status: 'ACTIVE',
    imageKey: '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    const loadProduct = async () => {
      if (!isEdit || !id) return;
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            sku: data.sku,
            nameRu: data.nameRu,
            nameEn: data.nameEn,
            descriptionRu: data.descriptionRu ?? '',
            descriptionEn: data.descriptionEn ?? '',
            categoryId: data.categoryId,
            price: String(data.price ?? ''),
            stockTotal: String(data.stockTotal ?? ''),
            featured: Boolean(data.featured),
            status: data.status ?? 'ACTIVE',
            imageKey: data.images?.[0]?.imageKey ?? '',
          });
        }
      } catch (err) {
        console.error('Failed to load product', err);
      }
    };
    loadCategories();
    loadProduct();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        sku: form.sku,
        nameRu: form.nameRu,
        nameEn: form.nameEn,
        descriptionRu: form.descriptionRu || undefined,
        descriptionEn: form.descriptionEn || undefined,
        categoryId: form.categoryId,
        price: Number(form.price),
        stockTotal: Number(form.stockTotal),
        featured: form.featured,
        status: form.status,
      };
      if (!payload.categoryId) {
        setError('Выберите категорию');
        setLoading(false);
        return;
      }
      if (Number.isNaN(payload.price) || Number.isNaN(payload.stockTotal)) {
        setError('Проверьте цену и склад');
        setLoading(false);
        return;
      }
      if (form.imageKey) {
        payload.images = [
          {
            imageKey: form.imageKey,
            isMain: true,
            sortOrder: 0,
          },
        ];
      }
      const res = await fetch(isEdit ? `/api/products/${id}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Не удалось сохранить товар');
        return;
      }
      router.refresh();
      router.push('/admin/inventory');
    } catch (err) {
      setError('Ошибка сохранения товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h1>
        {error && <p className="text-sm text-error mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input
                className="input"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameRu}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название (RU)</label>
              <input
                className="input"
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название (EN)</label>
              <input
                className="input"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
              <input
                type="number"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Склад</label>
              <input
                type="number"
                className="input"
                value={form.stockTotal}
                onChange={(e) => setForm({ ...form, stockTotal: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="HIDDEN">HIDDEN</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Featured</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание (RU)</label>
              <textarea
                className="input"
                value={form.descriptionRu}
                onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание (EN)</label>
              <textarea
                className="input"
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Главное изображение (UploadThing key)</label>
            <input
              className="input"
              value={form.imageKey}
              onChange={(e) => setForm({ ...form, imageKey: e.target.value })}
              placeholder="utfs key from UploadThing"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}
