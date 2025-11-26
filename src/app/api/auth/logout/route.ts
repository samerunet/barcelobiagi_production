import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin_email', '', { maxAge: 0, path: '/' });
  res.cookies.set('customer_session', '', { maxAge: 0, path: '/' });
  res.cookies.set('customer_email', '', { maxAge: 0, path: '/' });
  res.cookies.set('customer_id', '', { maxAge: 0, path: '/' });
  return res;
}
