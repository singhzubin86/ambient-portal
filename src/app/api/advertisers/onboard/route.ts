/**
 * POST /api/advertisers/onboard — same-origin proxy to POST /v1/portal/advertisers/me/onboard
 *
 * Creates/upserts the advertiser record (company profile).
 * Returns { advertiser_id, status: "active" }.
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PORTAL_COOKIE_NAME = "ambient_portal_session";
const API_COOKIE_NAME = "__Host-amb-portal";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "No session" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const apiRes = await fetch(`${API_URL}/v1/portal/advertisers/me/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${API_COOKIE_NAME}=${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Advertiser onboard failed" },
      { status: 500 }
    );
  }
}
