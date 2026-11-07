import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect all /admin routes except /admin/login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const sessionCookie = req.cookies.get('star_admin_session');
    if (!sessionCookie || sessionCookie.value !== 'authenticated_token_active') {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
