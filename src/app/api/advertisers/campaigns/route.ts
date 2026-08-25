/**
 * GET  /api/advertisers/campaigns — proxy to GET /v1/portal/advertisers/me/campaigns
 * POST /api/advertisers/campaigns — proxy to POST /v1/portal/advertisers/me/campaigns
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PORTAL_COOKIE_NAME = "ambient_portal_session";
const API_COOKIE_NAME = "__Host-amb-portal";

function getToken(req: NextRequest) {
  return req.cookies.get(PORTAL_COOKIE_NAME)?.value ?? null;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const apiRes = await fetch(`${API_URL}/v1/portal/advertisers/me/campaigns`, {
      headers: { Cookie: `${API_COOKIE_NAME}=${token}` },
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const body = await req.json();
    const apiRes = await fetch(`${API_URL}/v1/portal/advertisers/me/campaigns`, {
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
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
