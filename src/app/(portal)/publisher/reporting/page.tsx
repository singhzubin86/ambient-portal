"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { StatCard, DataTable, Button, Select } from "@/components/ui";
import { formatNumber, formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import type { ReportRow } from "@/types";
import type { Column } from "@/components/ui/DataTable";

const DEMO_ROWS: ReportRow[] = [
  { date: "2026-08-08", impressions: 1820, clicks: 33, ctr: 0.018, spend_usd: 2.18 },
  { date: "2026-08-07", impressions: 1940, clicks: 35, ctr: 0.018, spend_usd: 2.33 },
  { date: "2026-08-06", impressions: 1650, clicks: 30, ctr: 0.018, spend_usd: 1.98 },
];

const columns: Column<ReportRow & { earn_str: string }>[] = [
  { key: "date", header: "Date" },
  { key: "impressions", header: "Impressions", align: "right", render: (r) => formatNumber(r.impressions) },
  { key: "clicks", header: "Clicks", align: "right", render: (r) => formatNumber(r.clicks) },
  { key: "ctr", header: "CTR", align: "right", render: (r) => formatPercent(r.ctr) },
  { key: "earn_str", header: "Est. earnings", align: "right" },
];

function exportCsv(rows: ReportRow[]) {
  const headers = ["date", "impressions", "clicks", "ctr", "estimated_earnings_usd"];
  const lines = [headers.join(","), ...rows.map((r) =>
    [r.date, r.impressions, r.clicks, (r.ctr * 100).toFixed(2) + "%", r.spend_usd.toFixed(2)].join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `ambient-publisher-report-${formatDate(new Date())}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function PublisherReportingPage() {
  const [range, setRange] = useState("30d");
  const totals = DEMO_ROWS.reduce((acc, r) => ({
    impressions: acc.impressions + r.impressions,
    clicks: acc.clicks + r.clicks,
    earnings: acc.earnings + r.spend_usd,
  }), { impressions: 0, clicks: 0, earnings: 0 });

  const rows = DEMO_ROWS.map((r) => ({ ...r, earn_str: formatCurrency(r.spend_usd) }));

  return (
    <PortalLayout portalType="publisher" userName="Sam">
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Reporting</h1>
          <div className="flex items-center gap-3">
            <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </Select>
            <Button variant="secondary" size="sm" onClick={() => exportCsv(DEMO_ROWS)}>
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Impressions" value={formatNumber(totals.impressions)} />
          <StatCard label="Clicks" value={formatNumber(totals.clicks)} />
          <StatCard label="Est. earnings" value={formatCurrency(totals.earnings)} />
        </div>

        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 h-40 flex items-center justify-center">
          <span className="text-[13px] text-[var(--color-text-secondary)]">Impressions over time — chart renders once reporting API is connected</span>
        </div>

        <DataTable columns={columns} rows={rows}
          emptyMessage="No impressions yet. Complete your integration to start serving ads." />
        <Button variant="secondary" onClick={() => exportCsv(DEMO_ROWS)}>
          <Download size={14} /> Export CSV
        </Button>
      </div>
    </PortalLayout>
  );
}
