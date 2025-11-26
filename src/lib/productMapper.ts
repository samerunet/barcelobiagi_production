import { Product, ProductImage } from '@/types';

const utfsUrlFromKey = (key?: string) => (key ? `https://utfs.io/f/${key}` : '');

export function mapApiProduct(api: any): Product {
  const images: Array<string | ProductImage> =
    api?.images?.length
      ? api.images.map((img: any) => ({
          id: img.id,
          imageKey: img.imageKey,
          url: img.url ?? utfsUrlFromKey(img.imageKey),
          isMain: img.isMain,
          sortOrder: img.sortOrder,
        }))
      : [];

  return {
    id: api.id,
    sku: api.sku,
    name_ru: api.nameRu,
    name_en: api.nameEn,
    description_ru: api.descriptionRu ?? '',
    description_en: api.descriptionEn ?? '',
    price: Number(api.price ?? 0),
    old_price: api.oldPrice != null ? Number(api.oldPrice) : null,
    currency: api.currency ?? 'RUB',
    images,
    category: api.category?.slug ?? api.categoryId ?? 'unknown',
    categoryId: api.categoryId,
    status: api.status,
    featured: api.featured,
    tags: api.tags ?? [],
    stock_total: api.stockTotal ?? 0,
    stock_low_threshold: api.stockLowThreshold ?? 3,
    sizes: undefined,
    variants: api.variants?.map((v: any) => ({
      id: v.id,
      label: v.label,
      sku: v.sku ?? undefined,
      stock: v.stock ?? 0,
      price: v.price != null ? Number(v.price) : undefined,
    })),
    material_ru: api.materialRu,
    material_en: api.materialEn,
    color_ru: api.colorRu,
    color_en: api.colorEn,
  };
}

export function mapApiProducts(list: any[]): Product[] {
  return (list ?? []).map(mapApiProduct);
}
