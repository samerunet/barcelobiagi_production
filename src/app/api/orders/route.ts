import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeliveryStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
});

const orderSchema = z.object({
  customerId: z.string(),
  managerId: z.string().nullable().optional(),
  currency: z.string().default('RUB').optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  deliveryStatus: z.nativeEnum(DeliveryStatus).optional(),
  items: z.array(orderItemSchema).min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | null;
  const deliveryStatus = searchParams.get('deliveryStatus') as DeliveryStatus | null;
  const customerId = searchParams.get('customerId');
  const managerId = searchParams.get('managerId');

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: paymentStatus ?? undefined,
      deliveryStatus: deliveryStatus ?? undefined,
      customerId: customerId ?? undefined,
      managerId: managerId ?? undefined,
    },
    include: {
      items: { include: { product: true, variant: true } },
      customer: true,
      manager: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid order payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Preload products to compute totals and validate availability
  const productIds = Array.from(new Set(data.items.map((item) => item.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products not found' }, { status: 404 });
  }

  let totalAmount = 0;
  const orderItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const variant = product.variants.find((v) => v.id === item.variantId);
    const unitPrice = variant?.price ?? product.price;
    totalAmount += Number(unitPrice) * item.quantity;

    return {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
    };
  });

  const created = await prisma.order.create({
    data: {
      orderNumber: `BB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: data.customerId,
      managerId: data.managerId ?? null,
      paymentStatus: data.paymentStatus ?? PaymentStatus.PENDING,
      deliveryStatus: data.deliveryStatus ?? DeliveryStatus.PENDING,
      currency: data.currency ?? 'RUB',
      totalAmount,
      items: { create: orderItems },
    },
    include: {
      items: { include: { product: true, variant: true } },
      customer: true,
      manager: true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
