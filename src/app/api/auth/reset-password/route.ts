import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  newPassword: z.string().min(6),
  scope: z.enum(['admin', 'customer']).default('customer'),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, token, newPassword, scope } = parsed.data;
  const now = new Date();

  if (scope === 'admin') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      !user.passwordResetToken ||
      user.passwordResetToken !== token ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < now
    ) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ success: true });
  }

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (
    !customer ||
    !customer.passwordResetToken ||
    customer.passwordResetToken !== token ||
    !customer.passwordResetExpires ||
    customer.passwordResetExpires < now
  ) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return NextResponse.json({ success: true });
}
