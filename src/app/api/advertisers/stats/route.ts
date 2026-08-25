/**
 * GET /api/advertisers/stats — same-origin proxy to GET /v1/portal/advertisers/me/stats
 *
 * Forwards start_date / end_date query params.
 * Returns dashboard summary: active_campaigns, impressions, clicks, CTR, spend.
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PORTAL_COOKIE_NAME = "ambient_portal_session";
const API_COOKIE_NAME = "__Host-amb-portal";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const upstream = `${API_URL}/v1/portal/advertisers/me/stats${qs ? `?${qs}` : ""}`;

  try {
    const apiRes = await fetch(upstream, {
      headers: { Cookie: `${API_COOKIE_NAME}=${token}` },
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
