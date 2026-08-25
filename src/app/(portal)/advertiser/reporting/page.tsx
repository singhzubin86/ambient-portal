"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { StatCard, StatCardSkeleton, DataTable, Button, Select, Banner, Skeleton } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { portalAdvertiserReporting, portalAdvertiserCampaigns, ApiError } from "@/lib/api/client";
import type { AdvertiserReportRow, AdvertiserReportResponse, AdvertiserCampaign } from "@/types";
import type { Column } from "@/components/ui/DataTable";

// ── Date range helpers ────────────────────────────────────────────────────────

type DateRange = "7d" | "30d" | "90d";

function rangeToParams(range: DateRange): { start_date: string; end_date: string } {
  const end = new Date();
  const start = new Date();
  if (range === "7d")  start.setDate(end.getDate() - 7);
  else if (range === "30d") start.setDate(end.getDate() - 30);
  else start.setDate(end.getDate() - 90);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start_date: fmt(start), end_date: fmt(end) };
}

// ── Table columns ─────────────────────────────────────────────────────────────

type ReportRow = AdvertiserReportRow & {
  campaign_name_str: string;
  impressions_str: string;
  clicks_str: string;
  ctr_str: string;
  spend_str: string;
};

const columns: Column<ReportRow>[] = [
  { key: "date",              header: "Date" },
  { key: "campaign_name_str", header: "Campaign" },
  { key: "impressions_str",   header: "Impressions", align: "right" },
  { key: "clicks_str",        header: "Clicks",      align: "right" },
  { key: "ctr_str",           header: "CTR",         align: "right" },
  { key: "spend_str",         header: "Spend",       align: "right" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdvertiserReportingPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [campaignFilter, setCampaignFilter] = useState<string>("");
  const [campaigns, setCampaigns] = useState<AdvertiserCampaign[]>([]);
  const [data, setData] = useState<AdvertiserReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load campaign list for the filter dropdown (once)
  useEffect(() => {
    portalAdvertiserCampaigns
      .list()
      .then((res) => setCampaigns(res.campaigns))
      .catch(() => {}); // non-critical
  }, []);

  const load = useCallback(
    async (r: DateRange, campaignId: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          ...rangeToParams(r),
          ...(campaignId ? { campaign_id: campaignId } : {}),
        };
        const result = await portalAdvertiserReporting.reports(params);
        setData(result);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setData({ summary: { total_impressions: 0, total_clicks: 0, overall_ctr: 0, total_spend_usd: 0 }, rows: [] });
        } else {
          setError(err instanceof Error ? err.message : "Failed to load reporting data.");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(range, campaignFilter);
  }, [load, range, campaignFilter]);

  const handleExport = () => {
    const params = {
      ...rangeToParams(range),
      ...(campaignFilter ? { campaign_id: campaignFilter } : {}),
    };
    portalAdvertiserReporting.exportCsv(params);
  };

  const tableRows: ReportRow[] = (data?.rows ?? []).map((r) => ({
    ...r,
    campaign_name_str: r.campaign_name,
    impressions_str: formatNumber(r.impressions),
    clicks_str: formatNumber(r.clicks),
    ctr_str: formatPercent(r.ctr),
    spend_str: formatCurrency(r.spend_usd),
  }));

  return (
    <PortalLayout portalType="advertiser">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Reporting</h1>
          <div className="flex items-center gap-3">

            {/* Campaign filter */}
            <Select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              aria-label="Campaign filter"
            >
              <option value="">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.campaign_id} value={c.campaign_id}>{c.name}</option>
              ))}
            </Select>

            {/* Date range */}
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value as DateRange)}
              aria-label="Date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </Select>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => load(range, campaignFilter)}
              aria-label="Refresh"
            >
              <RefreshCw size={14} aria-hidden="true" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              disabled={!data || loading}
            >
              <Download size={14} aria-hidden="true" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Banner variant="error" message={error} action={{ label: "Retry", onClick: () => load(range, campaignFilter) }} />
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <StatCard label="Impressions" value={formatNumber(data?.summary.total_impressions ?? 0)} />
              <StatCard label="Clicks"      value={formatNumber(data?.summary.total_clicks ?? 0)} />
              <StatCard label="CTR"         value={formatPercent(data?.summary.overall_ctr ?? 0)} />
              <StatCard label="Spend"       value={formatCurrency(data?.summary.total_spend_usd ?? 0)} />
            </>
          )}
        </div>

        {/* Daily rows table */}
        <section aria-labelledby="daily-heading">
          <h2
            id="daily-heading"
            className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-4"
          >
            Daily breakdown
          </h2>
          {loading ? (
            <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
          ) : (
            <DataTable
              columns={columns}
              rows={tableRows}
              emptyMessage="No data yet. Data appears once your campaign is live and serving impressions."
            />
          )}
        </section>

        {/* Footer */}
        {tableRows.length > 0 && (
          <Button variant="secondary" onClick={handleExport}>
            <Download size={14} aria-hidden="true" /> Export all data as CSV
          </Button>
        )}

        <p className="text-[11px] text-[var(--color-text-secondary)]">
          &#9432; Data sourced from auditable log store aggregates — reproducible from raw log files.
        </p>
      </div>
    </PortalLayout>
  );
}
