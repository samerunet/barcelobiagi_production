import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';
import { productInputSchema } from './validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const status = searchParams.get('status') as ProductStatus | null;
  const featured = searchParams.get('featured');
  const search = searchParams.get('search');
  const take = Number(searchParams.get('take') ?? '0');
  const skip = Number(searchParams.get('skip') ?? '0');

  const where: Record<string, unknown> = {};

  if (category) {
    where.category = { slug: category };
  }
  if (tag) {
    where.tags = { some: { slug: tag } };
  }
  if (status && Object.values(ProductStatus).includes(status)) {
    where.status = status;
  }
  if (featured) {
    where.featured = featured === 'true';
  }
  if (search) {
    where.OR = [
      { nameEn: { contains: search, mode: 'insensitive' } },
      { nameRu: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      variants: true,
      tags: true,
      category: true,
    },
    orderBy: { createdAt: 'desc' },
    take: take > 0 ? take : undefined,
    skip: skip > 0 ? skip : undefined,
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid product payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const created = await prisma.product.create({
    data: {
      sku: data.sku,
      nameEn: data.nameEn,
      nameRu: data.nameRu,
      descriptionEn: data.descriptionEn,
      descriptionRu: data.descriptionRu,
      categoryId: data.categoryId,
      status: data.status ?? ProductStatus.ACTIVE,
      featured: data.featured ?? false,
      price: data.price,
      oldPrice: data.oldPrice ?? null,
      stockTotal: data.stockTotal,
      stockLowThreshold: data.stockLowThreshold ?? 3,
      tags: data.tags
        ? {
            connectOrCreate: data.tags.map((slug) => ({
              where: { slug },
              create: { slug, labelEn: slug, labelRu: slug },
            })),
          }
        : undefined,
      images: data.images
        ? {
            create: data.images.map((image, index) => ({
              imageKey: image.imageKey,
              isMain: image.isMain ?? index === 0,
              sortOrder: image.sortOrder ?? index,
            })),
          }
        : undefined,
      variants: data.variants
        ? {
            create: data.variants.map((variant) => ({
              label: variant.label,
              sku: variant.sku,
              stock: variant.stock ?? 0,
              price: variant.price ?? data.price,
            })),
          }
        : undefined,
    },
    include: {
      images: true,
      variants: true,
      tags: true,
      category: true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
