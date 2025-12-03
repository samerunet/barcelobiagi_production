import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productInputSchema } from '../validation';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      tags: true,
      category: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

async function resolveCategoryId(categoryId: string | null | undefined) {
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

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const body = await request.json();
  console.info('[products:PUT] incoming body', { id, body });
  const parsed = productInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    console.error('[products:PUT] validation failed', parsed.error.flatten());
    return NextResponse.json(
      { error: 'Invalid product payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const resolvedCategoryId = await resolveCategoryId(data.categoryId ?? existing.categoryId);
    if (!resolvedCategoryId) {
      return NextResponse.json(
        { error: 'Категория не найдена. Выберите существующую категорию.' },
        { status: 400 }
      );
    }

    console.info('[products:PUT] updating product (no transaction)', { id, data, resolvedCategoryId });

    const product = await prisma.product.update({
      where: { id },
      data: {
        sku: data.sku ?? existing.sku,
        nameEn: data.nameEn ?? existing.nameEn,
        nameRu: data.nameRu ?? existing.nameRu,
        descriptionEn: data.descriptionEn ?? existing.descriptionEn,
        descriptionRu: data.descriptionRu ?? existing.descriptionRu,
        categoryId: resolvedCategoryId,
        status: data.status ?? existing.status,
        featured: data.featured ?? existing.featured,
        price: data.price ?? existing.price,
        oldPrice: data.oldPrice ?? existing.oldPrice,
        stockTotal: data.stockTotal ?? existing.stockTotal,
        stockLowThreshold: data.stockLowThreshold ?? existing.stockLowThreshold,
        tags: data.tags
          ? {
              set: [],
              connectOrCreate: data.tags.map((slug) => ({
                where: { slug },
                create: { slug, labelEn: slug, labelRu: slug },
              })),
            }
          : undefined,
      },
    });

    if (data.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: data.images.map((image, index) => ({
          productId: id,
          imageKey: image.imageKey,
          isMain: image.isMain ?? index === 0,
          sortOrder: image.sortOrder ?? index,
          // If you add url column via migration, also store utfsUrlFromKey(image.imageKey)
        })),
      });
    }

    if (data.variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      for (const variant of data.variants) {
        await prisma.productVariant.create({
          data: {
            productId: id,
            label: variant.label,
            sku: variant.sku,
            stock: variant.stock ?? 0,
            price: variant.price ?? product.price,
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        tags: true,
        category: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Failed to update product', err);
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
    console.error('Product update failed', err);
    return NextResponse.json(
      { error: 'Не удалось обновить товар', code: err?.code, message: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = context.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete product', err);
    return NextResponse.json({ error: 'Не удалось удалить товар' }, { status: 500 });
  }
}
