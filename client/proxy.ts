import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('ela_refresh_token');

  // Redirect legacy invite/accept paths to new login page
  if (request.nextUrl.pathname.startsWith('/invite/accept')) {
    const inviteToken = request.nextUrl.searchParams.get('token');
    if (inviteToken) {
      return NextResponse.redirect(new URL(`/login?inviteToken=${inviteToken}`, request.url));
    }
  }

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register');
  const isPublicRoute = request.nextUrl.pathname.startsWith('/auth/callback');

  if (isAuthRoute) {
    const inviteToken = request.nextUrl.searchParams.get('inviteToken');
    // If they have a token, only redirect if they don't have a pending invite
    if (token && !inviteToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isPublicRoute) {
      return NextResponse.next();
  }

  if (!token) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }
    
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
