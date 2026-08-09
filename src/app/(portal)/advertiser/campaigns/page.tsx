"use client";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Badge, DataTable, Banner } from "@/components/ui";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Campaign } from "@/types";
import type { Column } from "@/components/ui/DataTable";
import { useSearchParams } from "next/navigation";

const DEMO: Campaign[] = [
  { id: "c1", name: "Spring Promo", status: "active", advertiser_category: "tech",
    creative: { headline: "Try Ambient", body: "", cta_text: "Learn More", destination_url: "https://brand.com" },
    targeting: { topics: [], keywords: [], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 12, daily_cap_usd: 200 },
    flight: { start_date: "2026-09-01", end_date: "2026-09-30" },
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
  { id: "c2", name: "Brand Awareness", status: "paused", advertiser_category: "retail",
    creative: { headline: "Brand", body: "", cta_text: "See more", destination_url: "https://brand.com" },
    targeting: { topics: [], keywords: [], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 10 },
    flight: { start_date: "2026-09-01", end_date: "2026-10-15" },
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
  { id: "c3", name: "Johnson Law — Summer", status: "pending_review", advertiser_category: "legal_services",
    creative: { headline: "Johnson & Associates", body: "Attorney advertising. Results may vary.", cta_text: "Consult now", destination_url: "https://johnsonlaw.com" },
    targeting: { topics: ["Other"], keywords: ["legal advice"], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 15 },
    flight: { start_date: "2026-09-01", end_date: "2026-11-30" },
    legal_self_certification: true,
    created_at: "2026-08-09T00:00:00Z", updated_at: "2026-08-09T00:00:00Z" },
];

const columns: Column<Campaign & { spend_str: string; ctr_str: string }>[] = [
  { key: "name", header: "Campaign name",
    render: (r) => <Link href={`/advertiser/campaigns/${r.id}`} className="text-[var(--color-brand-accent)] font-medium hover:underline">{r.name}</Link> },
  { key: "status", header: "Status", render: (r) => <Badge variant={r.status as import("@/components/ui/Badge").BadgeVariant} /> },
  { key: "spend_str", header: "Spend", align: "right" },
  { key: "ctr_str", header: "CTR", align: "right" },
  { key: "flight", header: "End date", render: (r) => r.flight.end_date, align: "right" },
];

function CampaignsContent() {
  const params = useSearchParams();
  const created = params.get("created");

  const rows = DEMO.map((c) => ({ ...c, spend_str: formatCurrency(2100), ctr_str: formatPercent(0.021) }));

  return (
    <div className="space-y-6">
      {created && (
        <Banner variant="success" message="Campaign submitted successfully. You will receive an email once it is reviewed and activated." />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Campaigns</h1>
        <Link href="/advertiser/campaigns/new">
          <Button size="sm"><Plus size={14} /> New campaign</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        emptyMessage="You haven't created any campaigns yet. Create your first campaign →"
      />
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <PortalLayout portalType="advertiser" userName="Alex">
      <Suspense fallback={<div className="text-[13px] text-[var(--color-text-secondary)]">Loading…</div>}>
        <CampaignsContent />
      </Suspense>
    </PortalLayout>
  );
}
