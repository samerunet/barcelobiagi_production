import { Product, ProductImage } from '@/types';

export function resolveImageUrl(image?: string | ProductImage): string {
  if (!image) return '';
  return typeof image === 'string' ? image : image.url ?? '';
}

export function getPrimaryImage(product?: Product): string {
  if (!product?.images?.length) return '';

  const main =
    (product.images.find(
      (img) => typeof img !== 'string' && img?.isMain
    ) as ProductImage | undefined) ?? product.images[0];

  return resolveImageUrl(main);
}
