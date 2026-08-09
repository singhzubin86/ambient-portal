/**
 * Reporting API client — wired to live Core endpoint.
 *
 * GET /v1/reporting/summary
 *   ?start_date=YYYY-MM-DD
 *   &end_date=YYYY-MM-DD
 *   &campaign_id=<id>   (optional — omit for all campaigns owned by JWT holder)
 *   &format=json|csv
 *
 * Auth: Authorization: Bearer <advertiser-jwt>
 * Source: log store aggregates — NOT Redis counters.
 * Server enforces advertiser scope — no client-side filtering needed.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

export type DateRange = "7d" | "30d" | "90d" | "all";

export interface ReportingRow {
  date: string;           // YYYY-MM-DD
  campaign_id: string;
  publisher_id: string;
  impressions: number;
  clicks: number;
  ctr: number;            // 0–1
  spend_cents: number;    // integer cents — divide by 100 for USD
}

export interface ReportingSummaryResponse {
  total_impressions: number;
  total_clicks: number;
  overall_ctr: number;    // 0–1
  total_spend_cents: number;
  rows: ReportingRow[];
}

// ---------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------

function rangeToDateParams(range: DateRange): { start_date: string; end_date: string } {
  const end = new Date();
  const start = new Date();

  if (range === "7d")  start.setDate(end.getDate() - 7);
  else if (range === "30d") start.setDate(end.getDate() - 30);
  else if (range === "90d") start.setDate(end.getDate() - 90);
  else {
    // "all" — use a far-past start date
    start.setFullYear(2000, 0, 1);
  }

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start_date: fmt(start), end_date: fmt(end) };
}

// ---------------------------------------------------------------
// Core fetch
// ---------------------------------------------------------------

async function apiFetch(url: string, token: string): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Reporting API ${res.status}: ${body || res.statusText}`);
  }

  return res;
}

// ---------------------------------------------------------------
// Public API
// ---------------------------------------------------------------

/**
 * Fetch reporting summary.
 * Pass campaignId to scope to one campaign; omit for all campaigns.
 */
export async function fetchReportingSummary(
  token: string,
  range: DateRange = "30d",
  campaignId?: string
): Promise<ReportingSummaryResponse> {
  const { start_date, end_date } = rangeToDateParams(range);
  const params = new URLSearchParams({ start_date, end_date, format: "json" });
  if (campaignId) params.set("campaign_id", campaignId);

  const res = await apiFetch(`${BASE_URL}/v1/reporting/summary?${params}`, token);
  return res.json() as Promise<ReportingSummaryResponse>;
}

/**
 * Trigger CSV export.
 * Same endpoint with format=csv — server returns Content-Disposition attachment.
 */
export async function exportReportingCsv(
  token: string,
  range: DateRange = "30d",
  campaignId?: string
): Promise<Blob> {
  const { start_date, end_date } = rangeToDateParams(range);
  const params = new URLSearchParams({ start_date, end_date, format: "csv" });
  if (campaignId) params.set("campaign_id", campaignId);

  const res = await apiFetch(`${BASE_URL}/v1/reporting/summary?${params}`, token);
  return res.blob();
}

/**
 * Utility: trigger browser download of a CSV blob.
 * Filename: ambient-report-YYYY-MM-DD.csv
 */
export function downloadCsv(blob: Blob, label = "report"): void {
  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ambient-${label}-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Group rows by campaign_id — useful for per-campaign breakdown table.
 */
export function groupByCampaign(
  rows: ReportingRow[]
): Map<string, ReportingRow[]> {
  const map = new Map<string, ReportingRow[]>();
  for (const row of rows) {
    const existing = map.get(row.campaign_id) ?? [];
    existing.push(row);
    map.set(row.campaign_id, existing);
  }
  return map;
}

/**
 * Aggregate a set of rows into totals.
 */
export function aggregateRows(rows: ReportingRow[]): {
  impressions: number;
  clicks: number;
  ctr: number;
  spend_usd: number;
} {
  const totals = rows.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      spend_cents: acc.spend_cents + r.spend_cents,
    }),
    { impressions: 0, clicks: 0, spend_cents: 0 }
  );
  return {
    impressions: totals.impressions,
    clicks: totals.clicks,
    ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    spend_usd: totals.spend_cents / 100,
  };
}

// Legacy fan-out exports removed — single endpoint handles all cases.
// DateRange type preserved for backward compatibility with existing page imports.
