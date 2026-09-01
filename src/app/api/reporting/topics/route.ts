/**
 * GET /api/reporting/topics — same-origin proxy to
 * GET /v1/portal/publishers/me/stats/topics
 *
 * Returns keyword-level impression + spend breakdown from the WAL buffer.
 * Note: response covers only the live WAL buffer (not full 30d); full window
 * available after R2 read path is implemented in v1.1.
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

  const upstream = `${API_URL}/v1/portal/publishers/me/stats/topics`;

  try {
    const apiRes = await fetch(upstream, {
      headers: { Cookie: `${API_COOKIE_NAME}=${token}` },
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch topic stats" },
      { status: 500 }
    );
  }
}
