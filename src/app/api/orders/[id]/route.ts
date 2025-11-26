import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeliveryStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const updateOrderSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  deliveryStatus: z.nativeEnum(DeliveryStatus).optional(),
  managerId: z.string().nullable().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const order = await prisma.order.findUnique({
    where: { id: context.params.id },
    include: {
      items: { include: { product: true, variant: true } },
      customer: true,
      manager: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const body = await request.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid order payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: parsed.data.paymentStatus ?? existing.paymentStatus,
      deliveryStatus: parsed.data.deliveryStatus ?? existing.deliveryStatus,
      managerId: parsed.data.managerId ?? existing.managerId,
    },
    include: {
      items: { include: { product: true, variant: true } },
      customer: true,
      manager: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = context.params;
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
