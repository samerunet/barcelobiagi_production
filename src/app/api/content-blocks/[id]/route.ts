import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contentBlockSchema = z.object({
  key: z.string().optional(),
  titleRu: z.string().nullable().optional(),
  titleEn: z.string().nullable().optional(),
  bodyRu: z.string().nullable().optional(),
  bodyEn: z.string().nullable().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const block = await prisma.contentBlock.findUnique({
    where: { id: context.params.id },
  });

  if (!block) {
    return NextResponse.json({ error: 'Content block not found' }, { status: 404 });
  }

  return NextResponse.json(block);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const body = await request.json();
  const parsed = contentBlockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid content block payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.contentBlock.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Content block not found' }, { status: 404 });
  }

  const updated = await prisma.contentBlock.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = context.params;
  const existing = await prisma.contentBlock.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Content block not found' }, { status: 404 });
  }

  await prisma.contentBlock.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
