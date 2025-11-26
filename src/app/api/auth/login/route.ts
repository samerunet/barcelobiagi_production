import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  scope: z.enum(['admin', 'customer']).default('admin'),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid login payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password, scope } = parsed.data;

  if (scope === 'admin') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || ![UserRole.ADMIN, UserRole.OWNER].includes(user.role)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    const res = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.cookies.set('admin_session', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    res.cookies.set('admin_email', user.email, { maxAge: 60 * 60 * 24, path: '/' });
    return res;
  }

  // Customer login
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.passwordHash) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = crypto.randomUUID();

  const res = NextResponse.json({
    token,
    customer: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    },
  });
  res.cookies.set('customer_session', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: '/',
  });
  res.cookies.set('customer_email', customer.email, { maxAge: 60 * 60 * 24, path: '/' });
  res.cookies.set('customer_id', customer.id, { maxAge: 60 * 60 * 24, path: '/' });
  return res;
}
