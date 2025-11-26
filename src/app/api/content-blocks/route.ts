import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contentBlockSchema = z.object({
  key: z.string(),
  titleRu: z.string().nullable().optional(),
  titleEn: z.string().nullable().optional(),
  bodyRu: z.string().nullable().optional(),
  bodyEn: z.string().nullable().optional(),
});

export async function GET() {
  const blocks = await prisma.contentBlock.findMany({
    orderBy: { key: 'asc' },
  });
  return NextResponse.json(blocks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contentBlockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid content block payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.contentBlock.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
