/**
 * GET /api/reporting/integration-status — same-origin proxy
 * to GET /v1/portal/publishers/me/integration-status
 *
 * Returns: { publisher_id, integration_status: "live"|"no_signal"|"not_integrated", checked_at }
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
    const apiRes = await fetch(
      `${API_URL}/v1/portal/publishers/me/integration-status`,
      { headers: { Cookie: `${API_COOKIE_NAME}=${token}` } }
    );
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch integration status" },
      { status: 500 }
    );
  }
}
