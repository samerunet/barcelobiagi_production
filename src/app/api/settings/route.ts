import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.array(
  z.object({
    key: z.string(),
    value: z.string(),
    group: z.string().nullable().optional(),
  })
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group');

  const settings = await prisma.setting.findMany({
    where: group ? { group } : undefined,
  });

  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid settings payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const results = await prisma.$transaction(
    parsed.data.map((setting) =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, group: setting.group ?? null },
        create: {
          key: setting.key,
          value: setting.value,
          group: setting.group ?? null,
        },
      })
    )
  );

  return NextResponse.json(results);
}
