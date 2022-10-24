import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
// export {default} from 'next-auth/middleware';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('next-auth.session-token');
  if (!sessionCookie) {
    // UNAUTHENTICATED
    const url = request.nextUrl.clone();
    url.pathname = '/api/auth/signin';
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.rewrite(url);
  }
}

// Paths were middleware is activated
export const config = {matcher: ['/experiment/:path*', '/experiments', '/^((?!favicon.svg).)*$']};
