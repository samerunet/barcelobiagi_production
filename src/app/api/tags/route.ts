import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const tagSchema = z.object({
  slug: z.string(),
  labelRu: z.string(),
  labelEn: z.string(),
});

export async function GET() {
  const tags = await prisma.productTag.findMany({
    orderBy: { labelEn: 'asc' },
  });
  return NextResponse.json(tags);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = tagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid tag payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.productTag.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
