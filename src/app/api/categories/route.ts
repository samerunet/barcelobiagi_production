import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const BASE_CATEGORIES = [
  { slug: 'men', nameEn: 'Men', nameRu: 'Мужчинам', sortOrder: 1 },
  { slug: 'women', nameEn: 'Women', nameRu: 'Женщинам', sortOrder: 2 },
  { slug: 'premium', nameEn: 'Premium', nameRu: 'Премиум', sortOrder: 3 },
  { slug: 'new', nameEn: 'New Arrivals', nameRu: 'Новинки', sortOrder: 4 },
  { slug: 'sale', nameEn: 'Sale', nameRu: 'Акции', sortOrder: 5 },
  { slug: 'accessories', nameEn: 'Accessories', nameRu: 'Аксессуары', sortOrder: 6 },
];

const categorySchema = z.object({
  slug: z.string(),
  nameRu: z.string(),
  nameEn: z.string(),
  descriptionRu: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
});

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Ensure baseline categories always exist
    await Promise.all(
      BASE_CATEGORIES.map((base) =>
        prisma.category.upsert({
          where: { slug: base.slug },
          update: {
            nameEn: base.nameEn,
            nameRu: base.nameRu,
            sortOrder: base.sortOrder,
            isActive: true,
            showOnHome: true,
          },
          create: {
            slug: base.slug,
            nameEn: base.nameEn,
            nameRu: base.nameRu,
            sortOrder: base.sortOrder,
            isActive: true,
            showOnHome: true,
          },
        })
      )
    );

    // Ensure a fallback default exists
    await prisma.category.upsert({
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

    // Re-read to include any new upserts
    categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (err: any) {
    console.error('Categories fetch failed', err);
    return NextResponse.json(
      { error: 'Не удалось загрузить категории', code: err?.code, message: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid category payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const created = await prisma.category.create({
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      nameRu: data.nameRu,
      descriptionEn: data.descriptionEn,
      descriptionRu: data.descriptionRu,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      showOnHome: data.showOnHome ?? true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
