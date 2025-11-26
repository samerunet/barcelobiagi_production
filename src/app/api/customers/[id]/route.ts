import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  marketingConsent: z.boolean().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const customer = await prisma.customer.findUnique({
    where: { id: context.params.id },
    include: { orders: true },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const body = await request.json();
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid customer payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = context.params;
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
