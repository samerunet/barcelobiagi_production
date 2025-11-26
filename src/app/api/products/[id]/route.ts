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

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = productInputSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid product payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        sku: data.sku ?? existing.sku,
        nameEn: data.nameEn ?? existing.nameEn,
        nameRu: data.nameRu ?? existing.nameRu,
        descriptionEn: data.descriptionEn ?? existing.descriptionEn,
        descriptionRu: data.descriptionRu ?? existing.descriptionRu,
        categoryId: data.categoryId ?? existing.categoryId,
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
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: data.images.map((image, index) => ({
          productId: id,
          imageKey: image.imageKey,
          isMain: image.isMain ?? index === 0,
          sortOrder: image.sortOrder ?? index,
        })),
      });
    }

    if (data.variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await Promise.all(
        data.variants.map((variant) =>
          tx.productVariant.create({
            data: {
              productId: id,
              label: variant.label,
              sku: variant.sku,
              stock: variant.stock ?? 0,
              price: variant.price ?? product.price,
            },
          })
        )
      );
    }

    return tx.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        tags: true,
        category: true,
      },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = context.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
