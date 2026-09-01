/**
 * POST /api/auth/login — server-side login proxy
 *
 * The session cookie must be set on the portal domain (ambient-portal.fly.dev),
 * not the API domain (ambient-api.fly.dev). Browsers block SameSite=Lax cookies
 * set by a cross-origin server from being sent back to a different origin.
 *
 * Flow:
 *  1. Browser POSTs credentials here (same-origin to portal)
 *  2. This route forwards to ambient-api for validation + JWT issuance
 *  3. We set the HttpOnly cookie on the portal domain
 *  4. Browser sends the cookie to portal middleware → auth works
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const COOKIE_NAME = "ambient_portal_session";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days — must match JWT_TTL_SECONDS in ambient-api/src/lib/portal-auth.ts

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiRes = await fetch(`${API_URL}/v1/portal/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }

    // Strip the token from the response sent to the browser
    const { token, ...user } = data as { token: string; [key: string]: unknown };
    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json(user, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",  // safe: same-origin now (portal -> portal)
      maxAge: COOKIE_TTL_SECONDS,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Login failed" },
      { status: 500 }
    );
  }
}
