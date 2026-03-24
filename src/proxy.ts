import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('mosque_session')?.value;
  const { pathname } = request.nextUrl;
  
  // Cek apakah kita sedang berjalan di mode lokal (laptop) atau VPS
  const isDev = process.env.NODE_ENV === 'development';

  // Tentukan base URL secara dinamis
  const baseUrl = isDev 
    ? 'http://localhost:3000' 
    : 'https://etakmirweb.tierratie.com';

  // 1. Logika Proteksi Halaman
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', baseUrl));
  }

  // 2. Injeksi Header KHUSUS PRODUCTION (VPS/Docker)
  // Di mode lokal, kita biarkan header apa adanya agar Server Actions Next.js tidak error
  if (!isDev) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-forwarded-host', 'etakmirweb.tierratie.com');
    requestHeaders.set('x-forwarded-proto', 'https');
    requestHeaders.set('host', 'etakmirweb.tierratie.com');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Jika di lokal, teruskan request tanpa modifikasi header
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};