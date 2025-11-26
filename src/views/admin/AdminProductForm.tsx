'use client';

import React, { useEffect, useState, useId } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { uploadFiles } from '@/lib/uploadthing';

type Category = { id: string; nameRu: string; nameEn: string };

export function AdminProductForm() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const isEdit = Boolean(id);
  const formIdPrefix = useId();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    sku: '',
    nameRu: '',
    nameEn: '',
    descriptionRu: '',
    descriptionEn: '',
    categoryId: '',
    price: '',
    oldPrice: '',
    stockTotal: '',
    stockLowThreshold: '',
    featured: false,
    status: 'ACTIVE',
    imageKey: '',
    imageUrl: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          // Preselect first category to avoid empty categoryId
          if (data.length && !form.categoryId) {
            setForm((prev) => ({ ...prev, categoryId: data[0].id }));
          }
        } else {
          console.error('Failed to load categories', res.status);
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
            stockLowThreshold: String(data.stockLowThreshold ?? ''),
            featured: Boolean(data.featured),
            status: data.status ?? 'ACTIVE',
            imageKey: data.images?.[0]?.imageKey ?? '',
            imageUrl:
              data.images?.[0]?.url ??
              (data.images?.[0]?.imageKey ? `https://utfs.io/f/${data.images[0].imageKey}` : ''),
            oldPrice: data.oldPrice != null ? String(data.oldPrice) : '',
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
    setSuccess('');
    setLoading(true);
    console.info('Submitting product payload…', form);
    try {
      const price = Number.parseFloat(form.price);
      const stockTotal = Number.parseInt(form.stockTotal, 10);
      const oldPrice = form.oldPrice ? Number.parseFloat(form.oldPrice) : null;
      const stockLowThreshold = form.stockLowThreshold
        ? Number.parseInt(form.stockLowThreshold, 10)
        : undefined;

      const payload: any = {
        sku: form.sku,
        nameRu: form.nameRu,
        nameEn: form.nameEn,
        descriptionRu: form.descriptionRu || undefined,
        descriptionEn: form.descriptionEn || undefined,
        categoryId: form.categoryId,
        price,
        oldPrice: oldPrice ?? undefined,
        stockTotal,
        stockLowThreshold,
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
      if (form.oldPrice && Number.isNaN(oldPrice)) {
        setError('Проверьте старую цену');
        setLoading(false);
        return;
      }
      if (form.stockLowThreshold && Number.isNaN(stockLowThreshold)) {
        setError('Проверьте порог остатка');
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
        const message = data?.error || `Не удалось сохранить товар (status ${res.status})`;
        setError(message);
        console.error('Save product failed', { status: res.status, body: data, payload });
        return;
      }
      const json = await res.json().catch(() => ({}));
      console.info('Product saved', json);
      router.refresh();
      setSuccess('Товар сохранен.');
    } catch (err) {
      setError('Ошибка сохранения товара');
      console.error('Save product error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h1>
        {error && <p className="text-sm text-error mb-4">{error}</p>}
        {success && <p className="text-sm text-success mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${formIdPrefix}-sku`} className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input
                id={`${formIdPrefix}-sku`}
                name="sku"
                className="input"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor={`${formIdPrefix}-category`} className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
              <select
                id={`${formIdPrefix}-category`}
                name="categoryId"
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
              <label htmlFor={`${formIdPrefix}-nameRu`} className="block text-sm font-medium text-gray-700 mb-2">Название (RU)</label>
              <input
                id={`${formIdPrefix}-nameRu`}
                name="nameRu"
                className="input"
                value={form.nameRu}
                onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor={`${formIdPrefix}-nameEn`} className="block text-sm font-medium text-gray-700 mb-2">Название (EN)</label>
              <input
                id={`${formIdPrefix}-nameEn`}
                name="nameEn"
                className="input"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${formIdPrefix}-price`} className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
              <input
                id={`${formIdPrefix}-price`}
                name="price"
                type="number"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor={`${formIdPrefix}-oldPrice`} className="block text-sm font-medium text-gray-700 mb-2">Старая цена (опционально)</label>
              <input
                id={`${formIdPrefix}-oldPrice`}
                name="oldPrice"
                type="number"
                className="input"
                value={form.oldPrice}
                onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                placeholder="Если была скидка"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${formIdPrefix}-stockTotal`} className="block text-sm font-medium text-gray-700 mb-2">Склад</label>
              <input
                id={`${formIdPrefix}-stockTotal`}
                name="stockTotal"
                type="number"
                className="input"
                value={form.stockTotal}
                onChange={(e) => setForm({ ...form, stockTotal: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor={`${formIdPrefix}-lowStock`} className="block text-sm font-medium text-gray-700 mb-2">Порог низкого запаса</label>
              <input
                id={`${formIdPrefix}-lowStock`}
                name="stockLowThreshold"
                type="number"
                className="input"
                value={form.stockLowThreshold}
                onChange={(e) => setForm({ ...form, stockLowThreshold: e.target.value })}
                placeholder="По умолчанию 3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${formIdPrefix}-status`} className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                id={`${formIdPrefix}-status`}
                name="status"
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
                id={`${formIdPrefix}-featured`}
                name="featured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <label htmlFor={`${formIdPrefix}-featured`} className="text-sm text-gray-700 cursor-pointer">Featured</label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${formIdPrefix}-descriptionRu`} className="block text-sm font-medium text-gray-700 mb-2">Описание (RU)</label>
              <textarea
                id={`${formIdPrefix}-descriptionRu`}
                name="descriptionRu"
                className="input"
                value={form.descriptionRu}
                onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor={`${formIdPrefix}-descriptionEn`} className="block text-sm font-medium text-gray-700 mb-2">Описание (EN)</label>
              <textarea
                id={`${formIdPrefix}-descriptionEn`}
                name="descriptionEn"
                className="input"
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${formIdPrefix}-imageKey`} className="block text-sm font-medium text-gray-700 mb-2">Главное изображение (UploadThing)</label>
            <div className="space-y-3">
              <input
                id={`${formIdPrefix}-imageKey`}
                name="imageKey"
                className="input"
                value={form.imageKey}
                onChange={(e) => setForm({ ...form, imageKey: e.target.value })}
                placeholder="utfs key from UploadThing"
              />

              <div className="flex items-center gap-3">
                <input
                  id={`${formIdPrefix}-imageFile`}
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files?.length) return;
                    setUploadingImage(true);
                    setError('');
                    try {
                      const uploads = await uploadFiles('productImageUploader', {
                        files: [files[0]],
                      });
                      const first = uploads?.[0];
                      const fileKey =
                        (first as any)?.serverData?.fileKey || (first as { key?: string })?.key;
                      const fileUrl =
                        (first as any)?.serverData?.fileUrl ||
                        (first as { url?: string; ufsUrl?: string })?.ufsUrl ||
                        (first as { url?: string })?.url ||
                        (fileKey ? `https://utfs.io/f/${fileKey}` : '');

                      if (!fileKey) {
                        setError('UploadThing не вернул ключ файла');
                        return;
                      }

                      setForm((prev) => ({
                        ...prev,
                        imageKey: fileKey,
                        imageUrl: fileUrl,
                      }));
                    } catch (uploadErr) {
                      console.error('UploadThing error', uploadErr);
                      setError('Не удалось загрузить изображение через UploadThing');
                    } finally {
                      setUploadingImage(false);
                      e.target.value = '';
                    }
                  }}
                  className="block w-full text-sm text-gray-600"
                  disabled={uploadingImage}
                />
                {uploadingImage && <span className="text-sm text-gray-500">Загрузка...</span>}
              </div>

              {form.imageUrl && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
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
