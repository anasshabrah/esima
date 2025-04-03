// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only apply this logic on admin routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    let token: string | undefined;

    // Attempt to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // If no token in header, try to get it from cookies
    if (!token) {
      token = request.cookies.get('authToken')?.value;
    }

    // If token is still not found, redirect to sign-in page
    if (!token) {
      return NextResponse.redirect(
        new URL(`/signin?callbackUrl=${encodeURIComponent(path)}`, request.url)
      );
    }
    
    // Token exists; actual verification happens in API routes
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
