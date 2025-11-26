import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tagSchema = z.object({
  slug: z.string().optional(),
  labelRu: z.string().optional(),
  labelEn: z.string().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const tag = await prisma.productTag.findUnique({
    where: { id: context.params.id },
  });

  if (!tag) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
  }

  return NextResponse.json(tag);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const body = await request.json();
  const parsed = tagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid tag payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.productTag.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
  }

  const updated = await prisma.productTag.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = context.params;
  const existing = await prisma.productTag.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
  }

  await prisma.productTag.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
