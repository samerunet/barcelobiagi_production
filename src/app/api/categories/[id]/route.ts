import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
  slug: z.string().optional(),
  nameRu: z.string().optional(),
  nameEn: z.string().optional(),
  descriptionRu: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const category = await prisma.category.findUnique({
    where: { id: context.params.id },
    include: { products: true },
  });

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid category payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = context.params;
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
