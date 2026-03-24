import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WAJIB: Gunakan export default atau named export 'proxy' sesuai standar Next.js 16
export default function proxy(request: NextRequest) {
  const token = request.cookies.get('mosque_session')?.value;
  const { pathname } = request.nextUrl;
  
  // Kunci base URL secara statis agar aman
  const safeBaseUrl = 'https://etakmirweb.tierratie.com';

  // 1. Logika Proteksi Halaman (Cegah Infinite Loop)
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', safeBaseUrl));
  }

  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', safeBaseUrl));
  }

  // 2. Injeksi Header: Paksa Next.js mengenali domain aslinya ke dalam sistem internalnya
  // Ini adalah obat utama agar tidak bocor ke URL Docker ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-forwarded-host', 'etakmirweb.tierratie.com');
  requestHeaders.set('x-forwarded-proto', 'https');
  requestHeaders.set('host', 'etakmirweb.tierratie.com');

  // Meneruskan request dengan header yang sudah dimanipulasi
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Batasi eksekusi proxy hanya pada halaman yang membutuhkan pengecekan
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};