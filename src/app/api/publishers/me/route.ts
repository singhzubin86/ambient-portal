/**
 * GET  /api/publishers/me — same-origin proxy to GET  /v1/portal/publishers/me
 * PUT  /api/publishers/me — same-origin proxy to PUT  /v1/portal/publishers/me
 *
 * Reads the portal session cookie, forwards the JWT to the API as the
 * expected __Host-amb-portal cookie, and returns/updates the publisher record.
 * Browser cannot send the portal cookie cross-origin to ambient-api.fly.dev
 * directly — all publisher API calls must go through this proxy.
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
    const apiRes = await fetch(`${API_URL}/v1/portal/publishers/me`, {
      headers: { Cookie: `${API_COOKIE_NAME}=${token}` },
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to fetch publisher record" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "No session" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  try {
    const apiRes = await fetch(`${API_URL}/v1/portal/publishers/me`, {
      method: "PUT",
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
      { error: "INTERNAL_ERROR", message: "Failed to update publisher record" },
      { status: 500 }
    );
  }
}
