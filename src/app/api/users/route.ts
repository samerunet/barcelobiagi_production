import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  passwordHash: z.string(),
});

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = userSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid user payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      role: parsed.data.role ?? UserRole.MANAGER,
      isActive: parsed.data.isActive ?? true,
      passwordHash: parsed.data.passwordHash,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
