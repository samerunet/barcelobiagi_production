import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';
import { productInputSchema } from './validation';
import { utfsUrlFromKey } from '@/lib/productMapper';

async function ensureCategory(categoryId: string | undefined | null) {
  if (!categoryId) return null;
  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (existing) return existing.id;
  if (categoryId === 'default') {
    const created = await prisma.category.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        slug: 'default',
        nameEn: 'General',
        nameRu: 'Общая',
        descriptionEn: 'Default category',
        descriptionRu: 'Категория по умолчанию',
        sortOrder: 0,
        isActive: true,
        showOnHome: true,
      },
    });
    return created.id;
  }
  return null;
}

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
  console.info('[products:POST] incoming body', body);
  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    console.error('[products:POST] validation failed', parsed.error.flatten());
    return NextResponse.json(
      { error: 'Invalid product payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const resolvedCategoryId = await ensureCategory(data.categoryId);
    if (!resolvedCategoryId) {
      return NextResponse.json(
        { error: 'Категория не найдена. Выберите существующую категорию.' },
        { status: 400 }
      );
    }

    console.info('[products:POST] creating product with', data);
    const created = await prisma.product.create({
      data: {
        sku: data.sku,
        nameEn: data.nameEn,
        nameRu: data.nameRu,
        descriptionEn: data.descriptionEn,
        descriptionRu: data.descriptionRu,
        categoryId: resolvedCategoryId,
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
                // If you add url column via migration, also store utfsUrlFromKey(image.imageKey)
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
  } catch (err: any) {
    console.error('Failed to create product', err);
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { error: 'SKU уже существует. Используйте уникальный артикул.' },
        { status: 409 }
      );
    }
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Категория не найдена. Выберите существующую категорию.' },
        { status: 400 }
      );
    }
    console.error('Product create failed', err);
    return NextResponse.json(
      { error: 'Не удалось создать товар', code: err?.code, message: err?.message },
      { status: 500 }
    );
  }
}
