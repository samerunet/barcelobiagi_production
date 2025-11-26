import { Product } from '@/types';

export function hasTag(product: Product, tag: string) {
  return (
    product.tags?.some((t) =>
      typeof t === 'string' ? t === tag : t.slug === tag
    ) ?? false
  );
}
