/**
 * GET /api/advertisers/me — same-origin proxy to GET /v1/portal/advertisers/me
 *
 * Returns the advertiser record for the authenticated user.
 * 404 if no advertiser record exists yet (show onboarding).
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PORTAL_COOKIE_NAME = "ambient_portal_session";
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
    const apiRes = await fetch(`${API_URL}/v1/portal/advertisers/me`, {
      headers: { Cookie: `${API_COOKIE_NAME}=${token}` },
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch advertiser" },
      { status: 500 }
    );
  }
}
