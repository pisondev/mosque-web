import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WAJIB bernama 'middleware' agar terdeteksi oleh Next.js
export function middleware(request: NextRequest) {
  const token = request.cookies.get('mosque_session')?.value;
  const isAuthPage = request.nextUrl.pathname === '/';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  if (!token && isDashboardPage) {
    // Gunakan nextUrl.clone() agar protocol & host-nya akurat
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (token && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};