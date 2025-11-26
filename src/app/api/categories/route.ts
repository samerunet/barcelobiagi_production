import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(categories);
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
