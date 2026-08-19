/**
 * POST /api/publishers/onboard — same-origin proxy to POST /v1/publishers
 *
 * Creates the publisher record and provisions the API key.
 * Returns the full API key exactly once (the onboarding flow must display it).
 * The publisher is identified by their session cookie.
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
    const apiRes = await fetch(`${API_URL}/v1/publishers`, {
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
      { error: "INTERNAL_ERROR", message: "Publisher creation failed" },
      { status: 500 }
    );
  }
}
