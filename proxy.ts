import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Login sahifasiga kirgan, lekin session bor → dashboard ga
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Himoyalangan sahifa, session yo'q → login ga
  const protectedPaths = [
    '/dashboard',
    '/sotuv',
    '/buyurtmalar',
    '/tovarlar',
    '/ombor',
    '/mijozlar',
    '/nasiya',
    '/tamirotchilar',
    '/xaridlar',
    '/xarajatlar',
    '/sheriklar',
    '/sherikdan-olish',
    '/agentlar',
    '/hisobotlar',
    '/xabar',
    '/sozlamalar',
  ];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sotuv/:path*',
    '/buyurtmalar/:path*',
    '/tovarlar/:path*',
    '/ombor/:path*',
    '/mijozlar/:path*',
    '/nasiya/:path*',
    '/tamirotchilar/:path*',
    '/xaridlar/:path*',
    '/xarajatlar/:path*',
    '/sheriklar/:path*',
    '/sherikdan-olish/:path*',
    '/agentlar/:path*',
    '/hisobotlar/:path*',
    '/xabar/:path*',
    '/sozlamalar/:path*',
    '/login',
  ],
};
