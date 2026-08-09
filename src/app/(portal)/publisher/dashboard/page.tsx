"use client";
import Link from "next/link";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { StatCard, Banner } from "@/components/ui";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";
import type { IntegrationStatus } from "@/types";

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; color: string; icon: string }> = {
  live:           { label: "Live — receiving events",  color: "text-[var(--color-status-active)]",  icon: "●" },
  degraded:       { label: "Degraded — volume drop",   color: "text-[var(--color-status-warning)]", icon: "◑" },
  no_signal:      { label: "No signal",                color: "text-[var(--color-status-error)]",   icon: "○" },
  not_integrated: { label: "Not yet integrated",       color: "text-[var(--color-text-secondary)]", icon: "◷" },
};

const DEMO_STATUS: IntegrationStatus = "live";
const DEMO_LAST_CALL = "2m ago";
const DEMO_STATS = { impressions: 48200, clicks: 867, ctr: 0.018, estimated_earnings_usd: 57.84 };

export default function PublisherDashboard() {
  const statusCfg = STATUS_CONFIG[DEMO_STATUS];
  const showNoEventsBanner = DEMO_STATUS === "not_integrated";

  return (
    <PortalLayout portalType="publisher" userName="Sam">
      <div className="space-y-8">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">My AI Assistant</h1>

        {showNoEventsBanner && (
          <Banner variant="warning"
            message="Your integration hasn't sent any events. Need help?"
            action={{ label: "View guide", onClick: () => window.location.href = "/publisher/integration" }} />
        )}

        {/* Integration status */}
        <section aria-labelledby="integration-status-heading">
          <h2 id="integration-status-heading" className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
            Integration status
          </h2>
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] px-5 py-4 flex items-center justify-between">
            <span className={`text-[14px] font-semibold ${statusCfg.color}`}>
              {statusCfg.icon} {statusCfg.label}
            </span>
            {DEMO_STATUS === "live" && (
              <span className="text-[12px] text-[var(--color-text-secondary)]">Last call: {DEMO_LAST_CALL}</span>
            )}
          </div>
        </section>

        {/* Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
            Last 30 days
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Impressions served" value={formatNumber(DEMO_STATS.impressions)} />
            <StatCard label="Clicks" value={formatNumber(DEMO_STATS.clicks)} />
            <StatCard label="Est. earnings" value={formatCurrency(DEMO_STATS.estimated_earnings_usd)} />
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-3">
            ⓘ Estimated earnings are calculated at 75% of CPM after Ambient's 25% platform fee. Final amounts appear on your monthly invoice.
          </p>
        </section>

        <div className="flex gap-4">
          <Link href="/publisher/reporting" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">View full report →</Link>
          <Link href="/publisher/integration" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">Integration settings →</Link>
        </div>
      </div>
    </PortalLayout>
  );
}
