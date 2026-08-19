/**
 * GET /api/auth/me — server-side session proxy
 *
 * Reads the ambient_portal_session cookie (set on the portal domain by
 * /api/auth/login), then forwards the JWT to the API as the expected
 * cookie name (__Host-amb-portal) so the API middleware can validate it.
 *
 * Why: the session cookie is on ambient-portal.fly.dev. The browser can't
 * send it to ambient-api.fly.dev (different domain), so all /me calls must
 * go through this same-origin proxy instead of directly to the API.
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
// Name we store on the portal domain
const PORTAL_COOKIE_NAME = "ambient_portal_session";
// Name the API middleware expects
const API_COOKIE_NAME = "__Host-amb-portal";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "No session" },
      { status: 401 }
    );
  }

  try {
    const apiRes = await fetch(`${API_URL}/v1/portal/auth/me`, {
      headers: {
        // Forward the JWT as the cookie name the API expects
        Cookie: `${API_COOKIE_NAME}=${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Session check failed" },
      { status: 500 }
    );
  }
}
