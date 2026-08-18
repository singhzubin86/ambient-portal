"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { StatCard, DataTable, Button, Select, Skeleton } from "@/components/ui";
import { formatNumber, formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { portalReporting, StatsResponse, ApiError } from "@/lib/api/client";
import type { Column } from "@/components/ui/DataTable";

type ReportRowDisplay = {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend_usd: number;
  earn_str: string;
};

const columns: Column<ReportRowDisplay>[] = [
  { key: "date", header: "Date" },
  { key: "impressions", header: "Impressions", align: "right", render: (r) => formatNumber(r.impressions) },
  { key: "clicks", header: "Clicks", align: "right", render: (r) => formatNumber(r.clicks) },
  { key: "ctr", header: "CTR", align: "right", render: (r) => formatPercent(r.ctr) },
  { key: "earn_str", header: "Est. earnings", align: "right" },
];

function rangeToDateParams(range: string): { start_date?: string; end_date?: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  if (range === "7d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    return { start_date: fmt(start), end_date: fmt(today) };
  }
  if (range === "30d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    return { start_date: fmt(start), end_date: fmt(today) };
  }
  // "all" — wide window
  return { start_date: "2024-01-01", end_date: fmt(today) };
}

function exportCsv(data: StatsResponse | null) {
  if (!data) return;
  const headers = ["date", "impressions", "clicks", "ctr", "estimated_earnings_usd"];
  const lines = [
    headers.join(","),
    ...data.rows.map((r) =>
      [r.date, r.impressions, r.clicks, (r.ctr * 100).toFixed(4) + "%", r.spend_usd.toFixed(4)].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ambient-publisher-report-${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PublisherReportingPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = rangeToDateParams(range);
      const result = await portalReporting.stats(params);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Complete your onboarding to start seeing data here.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load reporting data.");
      }
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const rows: ReportRowDisplay[] = (data?.rows ?? [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => ({ ...r, earn_str: formatCurrency(r.spend_usd) }));

  const summary = data?.summary;

  return (
    <PortalLayout portalType="publisher">
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Reporting</h1>
          <div className="flex items-center gap-3">
            <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </Select>
            <Button variant="secondary" size="sm" onClick={fetchStats} aria-label="Refresh">
              <RefreshCw size={14} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportCsv(data)} disabled={!data || rows.length === 0}>
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <div role="alert" className="px-4 py-3 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-status-error)_8%,transparent)] border border-[var(--color-status-error)] text-[13px] text-[var(--color-status-error)]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <>
              <Skeleton className="h-22 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-22 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-22 rounded-[var(--radius-lg)]" />
            </>
          ) : (
            <>
              <StatCard label="Impressions" value={formatNumber(summary?.total_impressions ?? 0)} />
              <StatCard label="Clicks" value={formatNumber(summary?.total_clicks ?? 0)} />
              <StatCard label="Est. earnings" value={formatCurrency(summary?.total_spend_usd ?? 0)} />
            </>
          )}
        </div>

        {loading ? (
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            emptyMessage="No impressions yet. Complete your integration to start serving ads."
          />
        )}

        {rows.length > 0 && (
          <Button variant="secondary" onClick={() => exportCsv(data)}>
            <Download size={14} /> Export CSV
          </Button>
        )}
      </div>
    </PortalLayout>
  );
}
