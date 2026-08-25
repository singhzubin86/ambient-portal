"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Badge, DataTable, Button } from "@/components/ui";
import { KpiCard } from "@/components/charts/KpiCard";
import { Skeleton } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { portalAdvertisers, portalAdvertiserReporting, portalAdvertiserCampaigns, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/useAuth";
import type { AdvertiserStats, AdvertiserCampaign } from "@/types";
import type { Column } from "@/components/ui/DataTable";

// ── Campaign table row ────────────────────────────────────────────────────────

interface CampaignRow {
  campaign_id: string;
  name: string;
  status: AdvertiserCampaign["status"];
  spend_str: string;
  ctr_str: string;
  end_date: string;
}

const columns: Column<CampaignRow>[] = [
  {
    key: "name",
    header: "Campaign",
    render: (r) => (
      <Link
        href={`/advertiser/campaigns/${r.campaign_id}`}
        className="text-[var(--color-brand-accent)] font-medium hover:underline"
      >
        {r.name}
      </Link>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <Badge variant={r.status as import("@/components/ui/Badge").BadgeVariant} />,
  },
  { key: "spend_str", header: "Spend", align: "right" },
  { key: "ctr_str",   header: "CTR",   align: "right" },
  { key: "end_date",  header: "End date", align: "right" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const [needsOnboard, setNeedsOnboard] = useState(false);
  const [stats, setStats] = useState<AdvertiserStats | null>(null);
  const [campaigns, setCampaigns] = useState<AdvertiserCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check advertiser record first — if 404, redirect to onboarding
    portalAdvertisers
      .me()
      .then(() => {
        // Advertiser record exists — load stats + campaigns in parallel
        return Promise.all([
          portalAdvertiserReporting.stats(),
          portalAdvertiserCampaigns.list(),
        ]);
      })
      .then(([statsRes, campaignsRes]) => {
        setStats(statsRes);
        // Sort by impressions desc, take first 5 for the dashboard table
        const sorted = [...campaignsRes.campaigns].sort(
          (a, b) => b.impressions - a.impressions
        );
        setCampaigns(sorted.slice(0, 5));
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setNeedsOnboard(true);
        }
        // On other errors: stay on dashboard, data will show empty
      })
      .finally(() => setLoading(false));
  }, []);

  // Redirect to onboard on next render if record missing
  // (using router here causes a flash; banner + CTA is cleaner)

  const tableRows: CampaignRow[] = campaigns.map((c) => ({
    campaign_id: c.campaign_id,
    name: c.name,
    status: c.status,
    spend_str: formatCurrency(c.spend_usd),
    ctr_str: formatPercent(c.ctr),
    end_date: c.end_date,
  }));

  return (
    <PortalLayout portalType="advertiser">
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight">
              Good morning, {user?.full_name?.split(" ")[0] ?? "there"}.
            </h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
              Here&rsquo;s how your campaigns are performing this month.
            </p>
          </div>
          <Link href="/advertiser/campaigns/new">
            <Button size="sm">
              <Plus size={14} aria-hidden="true" /> New campaign
            </Button>
          </Link>
        </div>

        {/* Onboarding prompt — shown if no advertiser record yet */}
        {needsOnboard && (
          <div
            className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] px-5 py-4 flex items-center justify-between"
            style={{ boxShadow: "var(--shadow-card)", borderLeft: "4px solid var(--color-brand-accent)" }}
          >
            <div>
              <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                Complete your advertiser setup
              </div>
              <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                Add your company details and billing contact to start running campaigns.
              </div>
            </div>
            <Link
              href="/advertiser/onboard"
              className="text-[12px] font-semibold text-[var(--color-brand-accent)] hover:underline"
            >
              Complete setup →
            </Link>
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          {loading ? (
            <>
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
            </>
          ) : (
            <>
              <KpiCard
                label="Active campaigns"
                value={String(stats?.summary.active_campaigns ?? 0)}
                sub="currently running"
                accent="indigo"
              />
              <KpiCard
                label="Total spend (30d)"
                value={formatCurrency(stats?.summary.total_spend_usd ?? 0)}
                sub="from impressions served"
                accent="green"
              />
              <KpiCard
                label="Avg CTR (30d)"
                value={
                  stats?.summary.overall_ctr != null
                    ? formatPercent(stats.summary.overall_ctr)
                    : "—"
                }
                sub="clicks / impressions"
                accent="amber"
              />
              <KpiCard
                label="Total impressions"
                value={formatNumber(stats?.summary.total_impressions ?? 0)}
                sub="last 30 days"
                accent="blue"
              />
            </>
          )}
        </div>

        {/* Campaigns table */}
        <section aria-labelledby="campaigns-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="campaigns-heading"
              className="text-[15px] font-semibold text-[var(--color-text-primary)]"
            >
              Active campaigns
            </h2>
            <Link
              href="/advertiser/campaigns"
              className="text-[13px] text-[var(--color-brand-accent)] hover:underline"
            >
              View all →
            </Link>
          </div>
          {loading ? (
            <Skeleton className="h-40 rounded-[var(--radius-lg)]" />
          ) : (
            <DataTable
              columns={columns}
              rows={tableRows}
              emptyMessage="No campaigns yet. Create your first campaign to get started."
            />
          )}
        </section>

        <div className="flex gap-4">
          <Link href="/advertiser/reporting" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">
            View full report →
          </Link>
          <Link href="/advertiser/campaigns/new" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">
            Create campaign →
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
