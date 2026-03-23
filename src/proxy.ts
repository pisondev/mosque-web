import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Ubah nama fungsi dari 'middleware' menjadi 'proxy'
export function proxy(request: NextRequest) {
  const token = request.cookies.get('mosque_session')?.value;
  const isAuthPage = request.nextUrl.pathname === '/';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  if (!token && isDashboardPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};