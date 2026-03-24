import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WAJIB bernama 'proxy' untuk Next.js 16+ agar tidak memory leak
export function proxy(request: NextRequest) {
  const token = request.cookies.get('mosque_session')?.value;
  const isAuthPage = request.nextUrl.pathname === '/';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // PENGAMAN DOCKER: Ambil domain asli dari Nginx, bukan dari internal Docker
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const safeBaseUrl = `${protocol}://${host}`;

  if (!token && isDashboardPage) {
    return NextResponse.redirect(new URL('/', safeBaseUrl));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', safeBaseUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};