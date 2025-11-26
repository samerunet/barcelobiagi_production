import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const requestResetSchema = z.object({
  email: z.string().email(),
  scope: z.enum(['admin', 'customer']).default('customer'),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestResetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, scope } = parsed.data;
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  if (scope === 'admin') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });
  } else {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });
  }

  // NOTE: In production, send token via email. For now, return it for testing.
  return NextResponse.json({ resetToken: token, expiresAt: expires.toISOString() });
}
