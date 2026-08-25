/**
 * POST /api/advertisers/campaigns/[id]/pause — proxy to POST /v1/portal/advertisers/me/campaigns/:id/pause
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const PORTAL_COOKIE_NAME = "ambient_portal_session";
const API_COOKIE_NAME = "__Host-amb-portal";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const apiRes = await fetch(`${API_URL}/v1/portal/advertisers/me/campaigns/${id}/pause`, {
      method: "POST",
      headers: { Cookie: `${API_COOKIE_NAME}=${token}` },
    });
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
