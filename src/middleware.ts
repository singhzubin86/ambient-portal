/**
 * Next.js Edge Middleware — Portal Auth Guard
 *
 * Cookie name must match what Core sets: ambient_portal_session
 * (see portal-auth.ts getPortalCookieName()).
 *
 * Protected prefixes: /publisher, /advertiser
 * Auth pages: /login, /signup — redirect to dashboard if already authed
 * Public: /verify-email, /terms, /privacy, static assets, _next
 *
 * NOTE: We only check cookie presence here (edge can't verify JWT).
 * The actual JWT validation happens server-side in each page/api route
 * via GET /v1/portal/auth/me. A missing or expired cookie redirects
 * to /login; a valid cookie that's been revoked will fail on /me and
 * the page-level code must handle that 401.
 */

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ambient_portal_session";

// Routes that require an authenticated session
const PROTECTED_PREFIXES = ["/publisher", "/advertiser"];

// Auth pages — redirect logged-in users away from them
const AUTH_PAGES = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get(COOKIE_NAME);
  const hasSession = Boolean(sessionCookie?.value);

  // Logged-in users hitting auth pages → send to their dashboard
  if (hasSession && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/publisher/dashboard", req.url));
  }

  // Unauthenticated users hitting protected routes → send to login
  if (!hasSession && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static file extensions.
     * This lets the middleware run on pages and API routes
     * without blocking images, fonts, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)).*)",
  ],
};
