import { ProductStatus } from '@prisma/client';
import { z } from 'zod';

export const productInputSchema = z.object({
  sku: z.string(),
  nameRu: z.string(),
  nameEn: z.string(),
  descriptionRu: z.string().optional(),
  descriptionEn: z.string().optional(),
  categoryId: z.string(),
  status: z.nativeEnum(ProductStatus).optional(),
  featured: z.boolean().optional(),
  price: z.number(),
  oldPrice: z.number().nullable().optional(),
  stockTotal: z.number().int().nonnegative(),
  stockLowThreshold: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        imageKey: z.string(),
        isMain: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        label: z.string(),
        sku: z.string().optional(),
        stock: z.number().int().nonnegative().optional(),
        price: z.number().optional(),
      })
    )
    .optional(),
});
