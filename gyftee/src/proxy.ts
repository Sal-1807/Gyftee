import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/swipe', '/discover', '/feed', '/profile', '/onboarding'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  if (!isProtected) return NextResponse.next();

  const pbAuth = request.cookies.get('pb_auth');
  let isAuthenticated = false;

  if (pbAuth?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(pbAuth.value));
      isAuthenticated = !!parsed?.token;
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/swipe/:path*', '/discover/:path*', '/feed/:path*', '/profile/:path*', '/onboarding'],
};
