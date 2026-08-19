/**
 * POST /api/auth/logout — server-side logout proxy
 *
 * Reads the session token from the portal cookie, forwards it to the API
 * (as the expected __Host-amb-portal cookie) to invalidate the JWT server-side,
 * then clears the cookie on the portal domain.
 *
 * Even if the API call fails, we clear the local cookie so the user is
 * effectively logged out from the portal's perspective.
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PORTAL_COOKIE_NAME = "ambient_portal_session";
const API_COOKIE_NAME = "__Host-amb-portal";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value;

  // Best-effort: tell the API to invalidate the session
  if (token) {
    try {
      await fetch(`${API_URL}/v1/portal/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `${API_COOKIE_NAME}=${token}`,
        },
      });
    } catch {
      // Swallow — we clear the cookie regardless
    }
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(PORTAL_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
