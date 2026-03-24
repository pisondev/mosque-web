import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('mosque_session')?.value;
  const isAuthPage = request.nextUrl.pathname === '/';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // 🔥 JURUS PAKSA: Tulis mati URL aslinya agar Next.js tidak menebak-nebak ID Docker lagi!
  const safeBaseUrl = 'https://etakmirweb.tierratie.com';

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