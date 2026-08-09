"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { StatCard, StatCardSkeleton, Badge, DataTable, Button, Banner } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Campaign, CampaignStats } from "@/types";
import type { Column } from "@/components/ui/DataTable";

// Demo data — replaced by API call when Core endpoints are live
const DEMO_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Spring Promo", status: "active", advertiser_category: "tech",
    creative: { headline: "Try Ambient", body: "Reach engaged users in AI chat.", cta_text: "Learn More", destination_url: "https://brand.com" },
    targeting: { topics: ["Technology"], keywords: ["AI tools"], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 12, daily_cap_usd: 200 },
    flight: { start_date: "2026-09-01", end_date: "2026-09-30" },
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
  { id: "c2", name: "Brand Awareness", status: "active", advertiser_category: "retail",
    creative: { headline: "Brand Awareness", body: "Awareness body copy.", cta_text: "Learn More", destination_url: "https://brand.com" },
    targeting: { topics: ["Retail"], keywords: [], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 10 },
    flight: { start_date: "2026-09-01", end_date: "2026-10-15" },
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
  { id: "c3", name: "Q2 Test", status: "ended", advertiser_category: "cpg",
    creative: { headline: "Q2 Test", body: "Test body.", cta_text: "See more", destination_url: "https://brand.com" },
    targeting: { topics: [], keywords: [], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 8 },
    flight: { start_date: "2026-05-01", end_date: "2026-07-30" },
    created_at: "2026-05-01T00:00:00Z", updated_at: "2026-07-30T00:00:00Z" },
];
const DEMO_STATS: Record<string, CampaignStats> = {
  c1: { campaign_id: "c1", impressions: 175000, clicks: 3675, ctr: 0.021, spend_usd: 2100 },
  c2: { campaign_id: "c2", impressions: 175000, clicks: 1575, ctr: 0.009, spend_usd: 2130 },
  c3: { campaign_id: "c3", impressions: 612000, clicks: 5508, ctr: 0.009, spend_usd: 4890 },
};

const columns: Column<Campaign & { spend: string; ctr_str: string; end: string }>[] = [
  { key: "name", header: "Campaign name",
    render: (r) => <Link href={`/advertiser/campaigns/${r.id}`} className="text-[var(--color-brand-accent)] font-medium hover:underline">{r.name}</Link> },
  { key: "status", header: "Status",
    render: (r) => <Badge variant={r.status as import("@/components/ui/Badge").BadgeVariant} /> },
  { key: "spend", header: "Spend", align: "right" },
  { key: "ctr_str", header: "CTR", align: "right" },
  { key: "end", header: "End date", align: "right" },
];

export default function AdvertiserDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const totalSpend = Object.values(DEMO_STATS).reduce((s, x) => s + x.spend_usd, 0);
  const activeCampaigns = DEMO_CAMPAIGNS.filter((c) => c.status === "active");
  const avgCtr = activeCampaigns.length
    ? activeCampaigns.reduce((s, c) => s + DEMO_STATS[c.id].ctr, 0) / activeCampaigns.length
    : 0;

  const tableRows = DEMO_CAMPAIGNS.map((c) => ({
    ...c,
    spend: formatCurrency(DEMO_STATS[c.id]?.spend_usd ?? 0),
    ctr_str: formatPercent(DEMO_STATS[c.id]?.ctr ?? 0),
    end: c.flight.end_date,
  }));

  return (
    <PortalLayout portalType="advertiser" userName="Alex">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Good morning, Alex.</h1>
          <Link href="/advertiser/campaigns/new">
            <Button size="sm"><Plus size={14} aria-hidden="true" /> New campaign</Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <StatCard label="Active campaigns" value={String(activeCampaigns.length)} />
              <StatCard label="Total spend (30d)" value={formatCurrency(totalSpend)} />
              <StatCard label="Avg CTR (30d)" value={formatPercent(avgCtr)} />
            </>
          )}
        </div>

        {/* Recent campaigns */}
        <section aria-labelledby="recent-campaigns-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="recent-campaigns-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)]">
              Recent campaigns
            </h2>
            <Link href="/advertiser/campaigns" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">
              View all campaigns →
            </Link>
          </div>
          <DataTable
            columns={columns}
            rows={tableRows}
            emptyMessage="You haven't created any campaigns yet."
          />
        </section>
      </div>
    </PortalLayout>
  );
}
