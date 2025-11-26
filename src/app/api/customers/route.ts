import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  marketingConsent: z.boolean().optional(),
});

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: { orders: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid customer payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.customer.create({
    data: {
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      firstName: parsed.data.firstName ?? null,
      lastName: parsed.data.lastName ?? null,
      marketingConsent: parsed.data.marketingConsent ?? false,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
