"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pause, Play, Pencil, Trash2 } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Badge, Button, Modal, StatCard, ProgressBar, Banner } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Campaign, CampaignStats } from "@/types";

// Demo data — replace with campaigns.get() + campaigns.stats()
const DEMO: Campaign = {
  id: "c1", name: "Spring Promo", status: "active", advertiser_category: "tech",
  creative: { headline: "Try Ambient — ads that fit the conversation", body: "Reach engaged users in AI chat — no interruptions.", cta_text: "Learn More", destination_url: "https://brand.com/landing" },
  targeting: { topics: ["Technology", "Software & SaaS"], keywords: ["AI tools", "chatbot", "productivity"], excluded_topics: [] },
  budget: { total_usd: 5000, cpm_usd: 12, daily_cap_usd: 200 },
  flight: { start_date: "2026-09-01", end_date: "2026-09-30" },
  created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
};
const DEMO_STATS: CampaignStats = { campaign_id: "c1", impressions: 175000, clicks: 3675, ctr: 0.021, spend_usd: 2100 };

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const campaign = DEMO; // replace: await campaigns.get(token, id)
  const stats = DEMO_STATS;

  const [status, setStatus] = useState(campaign.status);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const spendPercent = Math.round((stats.spend_usd / campaign.budget.total_usd) * 100);

  async function togglePause() {
    setStatus((s) => (s === "active" ? "paused" : "active"));
    // In production: campaigns.update(token, id, { status: next })
  }

  async function handleDelete() {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 700));
    router.push("/advertiser/campaigns");
  }

  const isPendingReview = status === "pending_review";
  const isRejected = status === "rejected";

  return (
    <PortalLayout portalType="advertiser" >
      <div className="space-y-8 max-w-[860px]">
        {/* Breadcrumb */}
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          <a href="/advertiser/campaigns" className="hover:underline">Campaigns</a> / {campaign.name}
        </p>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">{campaign.name}</h1>
            <Badge variant={status as import("@/components/ui/Badge").BadgeVariant} />
          </div>
          <div className="flex items-center gap-2">
            {(status === "active" || status === "paused") && (
              <Button variant="secondary" size="sm" onClick={togglePause}>
                {status === "active" ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => router.push(`/advertiser/campaigns/${id}/edit`)}>
              <Pencil size={14} /> Edit campaign
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>

        {/* Pending review notice */}
        {isPendingReview && (
          <Banner variant="warning"
            message="Pending compliance review — typically reviewed within 1 business day. You will receive an email when your campaign is activated or if changes are needed." />
        )}

        {/* Rejection reason */}
        {isRejected && campaign.rejection_reason && (
          <Banner variant="error"
            message={`Campaign rejected: ${campaign.rejection_reason} Please edit your campaign and resubmit.`}
            action={{ label: "Edit campaign", onClick: () => router.push(`/advertiser/campaigns/${id}/edit`) }} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Impressions" value={formatNumber(stats.impressions)} />
          <StatCard label="Clicks" value={formatNumber(stats.clicks)} />
          <StatCard label="CTR" value={formatPercent(stats.ctr)} />
          <StatCard label="Spend" value={formatCurrency(stats.spend_usd)} />
        </div>

        {/* Spend progress */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6">
          <div className="flex justify-between text-[13px] mb-3">
            <span className="text-[var(--color-text-secondary)]">Budget</span>
            <span className="font-semibold">{formatCurrency(stats.spend_usd)} of {formatCurrency(campaign.budget.total_usd)}</span>
          </div>
          <ProgressBar value={spendPercent} label={`${spendPercent}% spent`} />
          <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] mt-2">
            <span>{campaign.flight.start_date}</span>
            <span>{campaign.flight.end_date}</span>
          </div>
        </div>

        {/* Creative preview */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Creative preview</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-ad)]">
            <div className="px-3 pt-2 pb-1"><span className="text-[11px] font-semibold text-[var(--color-disclosure-text)]">◈ Sponsored</span></div>
            <div className="border-t border-[var(--color-border-subtle)]" />
            <div className="px-4 py-3 space-y-1">
              <p className="text-[15px] font-semibold">{campaign.creative.headline}</p>
              <p className="text-[13px]">{campaign.creative.body}</p>
              <div className="pt-1"><span className="inline-block bg-[var(--color-cta-primary)] text-white text-[13px] font-semibold px-4 py-2 rounded-[var(--radius-md)]">{campaign.creative.cta_text}</span></div>
            </div>
          </div>
          <div className="text-[12px] text-[var(--color-text-secondary)] space-y-1">
            <p>Targeting: {campaign.targeting.topics.join(", ")} · {campaign.targeting.keywords.join(", ")}</p>
            <p>CPM: {formatCurrency(campaign.budget.cpm_usd)} · Daily cap: {campaign.budget.daily_cap_usd ? formatCurrency(campaign.budget.daily_cap_usd) : "None"}</p>
          </div>
          <a href="/advertiser/reporting" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">View full report →</a>
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}
        title="Delete campaign"
        confirmLabel="Delete campaign" onConfirm={handleDelete}
        confirmVariant="danger" confirmLoading={deleting}>
        <p>Are you sure you want to delete <strong>{campaign.name}</strong>? This cannot be undone.</p>
      </Modal>
    </PortalLayout>
  );
}
