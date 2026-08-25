/**
 * GET /api/advertisers/reports — same-origin proxy to GET /v1/portal/advertisers/me/reports
 *
 * Forwards start_date, end_date, campaign_id, format query params.
 * When format=csv, pipes the binary response through (Content-Disposition preserved).
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
  const upstream = `${API_URL}/v1/portal/advertisers/me/reports${qs ? `?${qs}` : ""}`;

  try {
    const apiRes = await fetch(upstream, {
      headers: { Cookie: `${API_COOKIE_NAME}=${token}` },
    });

    // CSV pass-through — preserve Content-Disposition for file download
    if (searchParams.get("format") === "csv") {
      const csvText = await apiRes.text();
      return new NextResponse(csvText, {
        status: apiRes.status,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition":
            apiRes.headers.get("Content-Disposition") ??
            `attachment; filename="ambient-advertiser-report.csv"`,
        },
      });
    }

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
