import { NextRequest, NextResponse } from 'next/server';

const PB_COOKIE = 'pb_auth';

function isTokenValid(raw: string): boolean {
  try {
    const { token } = JSON.parse(decodeURIComponent(raw));
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const raw = request.cookies.get(PB_COOKIE)?.value;

  if (raw && isTokenValid(raw)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/swipe/:path*', '/discover/:path*', '/feed/:path*', '/profile/:path*'],
};
