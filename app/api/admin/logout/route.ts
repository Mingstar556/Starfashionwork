import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'star_admin_session',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
