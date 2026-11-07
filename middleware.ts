import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith('/admin') && path !== '/admin/login') {
    const sessionCookie = req.cookies.get('star_admin_session');
    if (!sessionCookie || sessionCookie.value !== 'authenticated_token_active') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
