"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { StatCard, StatCardSkeleton, DataTable, Button, Select, Banner } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import {
  fetchReportingSummary,
  exportReportingCsv,
  downloadCsv,
  groupByCampaign,
  aggregateRows,
  type ReportingSummaryResponse,
  type DateRange,
} from "@/lib/api/reporting";
import type { Column } from "@/components/ui/DataTable";

// ---------------------------------------------------------------
// Auth token helper — replace with real session context when wired
// ---------------------------------------------------------------
function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(
      localStorage.getItem("ambient_token") ??
      sessionStorage.getItem("ambient_token") ??
      null
    );
  }, []);
  return token;
}

// ---------------------------------------------------------------
// Per-campaign summary row for the breakdown table
// ---------------------------------------------------------------
interface CampaignBreakdownRow {
  campaign_id: string;
  impressions_str: string;
  clicks_str: string;
  ctr_str: string;
  spend_str: string;
}

const columns: Column<CampaignBreakdownRow>[] = [
  { key: "campaign_id", header: "Campaign ID" },
  { key: "impressions_str", header: "Impressions", align: "right" },
  { key: "clicks_str", header: "Clicks", align: "right" },
  { key: "ctr_str", header: "CTR", align: "right" },
  { key: "spend_str", header: "Spend", align: "right" },
];

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
export default function AdvertiserReportingPage() {
  const token = useAuthToken();
  const [range, setRange] = useState<DateRange>("30d");
  const [data, setData] = useState<ReportingSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(
    async (r: DateRange) => {
      setLoading(true);
      setError(null);
      try {
        if (!token) {
          setData(null);
          setLoading(false);
          return;
        }
        // Single call — no campaign_id filter → server returns all campaigns for JWT holder
        const result = await fetchReportingSummary(token, r);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load reporting data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    load(range);
  }, [load, range]);

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    try {
      // format=csv — same endpoint, server returns attachment blob
      const blob = await exportReportingCsv(token, range);
      downloadCsv(blob, "report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Build per-campaign breakdown from grouped rows
  const breakdownRows: CampaignBreakdownRow[] = (() => {
    if (!data?.rows?.length) return [];
    const grouped = groupByCampaign(data.rows);
    return Array.from(grouped.entries()).map(([campaign_id, rows]) => {
      const totals = aggregateRows(rows);
      return {
        campaign_id,
        impressions_str: formatNumber(totals.impressions),
        clicks_str: formatNumber(totals.clicks),
        ctr_str: formatPercent(totals.ctr),
        spend_str: formatCurrency(totals.spend_usd),
      };
    });
  })();

  // Top-level totals come directly from the API response
  const totalSpendUsd = (data?.total_spend_cents ?? 0) / 100;

  return (
    <PortalLayout portalType="advertiser" userName="Alex">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Reporting</h1>
          <div className="flex items-center gap-3">
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value as DateRange)}
              aria-label="Date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => load(range)}
              aria-label="Refresh reporting data"
            >
              <RefreshCw size={14} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              loading={exporting}
              disabled={!data || loading}
            >
              <Download size={14} aria-hidden="true" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Banner
            variant="error"
            message={error}
            action={{ label: "Retry", onClick: () => load(range) }}
          />
        )}

        {/* No auth token — dev mode */}
        {!token && !loading && !error && (
          <Banner
            variant="info"
            message="Sign in to view reporting data."
          />
        )}

        {/* Stat cards — driven by top-level totals from API */}
        <div className="grid grid-cols-4 gap-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <StatCard label="Impressions" value={formatNumber(data?.total_impressions ?? 0)} />
              <StatCard label="Clicks"      value={formatNumber(data?.total_clicks ?? 0)} />
              <StatCard label="CTR"         value={formatPercent(data?.overall_ctr ?? 0)} />
              <StatCard label="Spend"       value={formatCurrency(totalSpendUsd)} />
            </>
          )}
        </div>

        {/* Chart slot — wires once Core confirms time-series shape in rows */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 h-48 flex items-center justify-center">
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            Impressions over time — Recharts chart wires once daily time-series shape confirmed with Core
          </span>
        </div>

        {/* Per-campaign breakdown */}
        <section aria-labelledby="by-campaign-heading">
          <h2 id="by-campaign-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-4">
            By campaign
          </h2>
          <DataTable
            columns={columns}
            rows={breakdownRows}
            emptyMessage={
              loading
                ? "Loading…"
                : "No data yet. Data appears once your campaign is live and serving impressions."
            }
          />
        </section>

        {/* Footer export */}
        {breakdownRows.length > 0 && (
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            <Download size={14} aria-hidden="true" /> Export all data as CSV
          </Button>
        )}

        {/* Provenance note */}
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          ⓘ Data sourced from auditable log store aggregates — reproducible from raw log files.
        </p>

      </div>
    </PortalLayout>
  );
}
