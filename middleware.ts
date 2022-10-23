// middleware.ts
export {default} from 'next-auth/middleware';

// See https://nextjs.org/docs/advanced-features/middleware
export const config = {
  matcher: [
    '/experiment/:path*',
    '/experiments',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - static (static files)
     * - favicon.svg (favicon file)
     */
    /* '/((?!api|static|favicon.svg).*)', */
  ],
};
