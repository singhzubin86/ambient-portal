"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { StatCard, DataTable, Button, Select } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent, formatDate } from "@/lib/utils";
import type { ReportRow } from "@/types";
import type { Column } from "@/components/ui/DataTable";

const DEMO_ROWS: ReportRow[] = [
  { date: "2026-08-08", campaign_id: "c1", campaign_name: "Spring Promo", impressions: 5820, clicks: 122, ctr: 0.021, spend_usd: 69.84 },
  { date: "2026-08-08", campaign_id: "c2", campaign_name: "Brand Awareness", impressions: 5700, clicks: 51,  ctr: 0.009, spend_usd: 57.00 },
  { date: "2026-08-07", campaign_id: "c1", campaign_name: "Spring Promo",   impressions: 6100, clicks: 128, ctr: 0.021, spend_usd: 73.20 },
  { date: "2026-08-07", campaign_id: "c2", campaign_name: "Brand Awareness", impressions: 5900, clicks: 53,  ctr: 0.009, spend_usd: 59.00 },
];

const columns: Column<ReportRow>[] = [
  { key: "date", header: "Date" },
  { key: "campaign_name", header: "Campaign" },
  { key: "impressions", header: "Impressions", align: "right", render: (r) => formatNumber(r.impressions) },
  { key: "clicks", header: "Clicks", align: "right", render: (r) => formatNumber(r.clicks) },
  { key: "ctr", header: "CTR", align: "right", render: (r) => formatPercent(r.ctr) },
  { key: "spend_usd", header: "Spend", align: "right", render: (r) => formatCurrency(r.spend_usd) },
];

function exportCsv(rows: ReportRow[]) {
  const headers = ["date", "campaign_id", "campaign_name", "impressions", "clicks", "ctr", "spend_usd"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.date, r.campaign_id ?? "", r.campaign_name ?? "",
       r.impressions, r.clicks, (r.ctr * 100).toFixed(2) + "%", r.spend_usd.toFixed(2)].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ambient-report-${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdvertiserReportingPage() {
  const [range, setRange] = useState("30d");

  const totals = DEMO_ROWS.reduce(
    (acc, r) => ({ impressions: acc.impressions + r.impressions, clicks: acc.clicks + r.clicks, spend: acc.spend + r.spend_usd }),
    { impressions: 0, clicks: 0, spend: 0 }
  );
  const totalCtr = totals.clicks / totals.impressions;

  return (
    <PortalLayout portalType="advertiser" userName="Alex">
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Reporting</h1>
          <div className="flex items-center gap-3">
            <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </Select>
            <Button variant="secondary" size="sm" onClick={() => exportCsv(DEMO_ROWS)}>
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Impressions" value={formatNumber(totals.impressions)} />
          <StatCard label="Clicks" value={formatNumber(totals.clicks)} />
          <StatCard label="CTR" value={formatPercent(totalCtr)} />
          <StatCard label="Spend" value={formatCurrency(totals.spend)} />
        </div>

        {/* Chart placeholder — Recharts/Chart.js wired up when Core reporting API is live */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 h-48 flex items-center justify-center">
          <span className="text-[13px] text-[var(--color-text-secondary)]">Impressions over time — chart renders once reporting API is connected</span>
        </div>

        <section aria-labelledby="by-campaign-heading">
          <h2 id="by-campaign-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-4">By campaign</h2>
          <DataTable
            columns={columns}
            rows={DEMO_ROWS}
            emptyMessage="No data yet. Data appears once your campaign is live and serving impressions."
          />
        </section>

        <Button variant="secondary" onClick={() => exportCsv(DEMO_ROWS)}>
          <Download size={14} /> Export all data as CSV
        </Button>
      </div>
    </PortalLayout>
  );
}
