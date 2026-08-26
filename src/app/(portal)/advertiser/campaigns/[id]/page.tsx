"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Badge, Button, StatCard, ProgressBar, Banner, Skeleton } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { portalAdvertiserCampaigns, ApiError } from "@/lib/api/client";
import type { AdvertiserCampaign } from "@/types";

function CampaignDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";
  const justUpdated = searchParams.get("updated") === "1";

  const [campaign, setCampaign] = useState<AdvertiserCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    portalAdvertiserCampaigns
      .get(id)
      .then(setCampaign)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setError("Campaign not found.");
        } else {
          setError("Failed to load campaign. Please refresh.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function togglePause() {
    if (!campaign) return;
    setToggling(true);
    setActionError(null);
    try {
      const res =
        campaign.status === "active"
          ? await portalAdvertiserCampaigns.pause(id)
          : await portalAdvertiserCampaigns.resume(id);
      setCampaign((prev) => prev ? { ...prev, status: res.status as AdvertiserCampaign["status"] } : prev);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed — please try again.");
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <PortalLayout portalType="advertiser">
        <div className="space-y-6 max-w-[860px]">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-28 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
        </div>
      </PortalLayout>
    );
  }

  if (error || !campaign) {
    return (
      <PortalLayout portalType="advertiser">
        <Banner variant="error" message={error ?? "Campaign not found."} />
      </PortalLayout>
    );
  }

  const spendPercent = campaign.total_budget_usd > 0
    ? Math.min(100, Math.round((campaign.spend_usd / campaign.total_budget_usd) * 100))
    : 0;

  return (
    <PortalLayout portalType="advertiser">
      <div className="space-y-8 max-w-[860px]">
        {/* Breadcrumb */}
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          <a href="/advertiser/campaigns" className="hover:underline">Campaigns</a>{" / "}
          {campaign.name}
        </p>

        {/* Created success banner */}
        {justCreated && (
          <Banner variant="success" message="Campaign is live — it may take up to 30 seconds to appear in the ad system." />
        )}

        {/* Updated success banner */}
        {justUpdated && (
          <Banner variant="success" message="Campaign updated successfully." />
        )}

        {/* Action error */}
        {actionError && (
          <Banner variant="error" message={actionError} />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">
              {campaign.name}
            </h1>
            <Badge variant={campaign.status as import("@/components/ui/Badge").BadgeVariant} />
          </div>
          <div className="flex items-center gap-2">
            {(campaign.status === "active" || campaign.status === "paused") && (
              <Button
                variant="secondary"
                size="sm"
                onClick={togglePause}
                loading={toggling}
              >
                {campaign.status === "active"
                  ? <><Pause size={14} /> Pause</>
                  : <><Play size={14} /> Resume</>}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/advertiser/campaigns/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/advertiser/reporting")}
            >
              View report
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Impressions" value={formatNumber(campaign.impressions)} />
          <StatCard label="Clicks"      value={formatNumber(campaign.clicks)} />
          <StatCard label="CTR"         value={formatPercent(campaign.ctr)} />
          <StatCard label="Spend"       value={formatCurrency(campaign.spend_usd)} />
        </div>

        {/* Budget progress */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6">
          <div className="flex justify-between text-[13px] mb-3">
            <span className="text-[var(--color-text-secondary)]">Budget</span>
            <span className="font-semibold">
              {formatCurrency(campaign.spend_usd)} of {formatCurrency(campaign.total_budget_usd)}
            </span>
          </div>
          <ProgressBar value={spendPercent} label={`${spendPercent}% spent`} />
          <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] mt-2">
            <span>{campaign.start_date}</span>
            <span>{campaign.end_date}</span>
          </div>
          {campaign.daily_cap_usd && (
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Daily cap: {formatCurrency(campaign.daily_cap_usd)}
            </p>
          )}
        </div>

        {/* Creative preview */}
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Creative preview</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-ad)]">
            <div className="px-3 pt-2 pb-1">
              <span className="text-[11px] font-semibold text-[var(--color-disclosure-text)]">◈ Sponsored</span>
            </div>
            <div className="border-t border-[var(--color-border-subtle)]" />
            <div className="px-4 py-3 space-y-1">
              <p className="text-[15px] font-semibold">{campaign.headline}</p>
              <p className="text-[13px]">{campaign.body}</p>
              <div className="pt-1">
                <span className="inline-block bg-[var(--color-cta-primary)] text-white text-[13px] font-semibold px-4 py-2 rounded-[var(--radius-md)]">
                  {campaign.cta_text}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[12px] text-[var(--color-text-secondary)] space-y-1">
            {campaign.topics.length > 0 && (
              <p>Topics: {campaign.topics.join(", ")}</p>
            )}
            {campaign.keywords.length > 0 && (
              <p>Keywords: {campaign.keywords.join(", ")}</p>
            )}
            <p>
              CPM bid: {formatCurrency(campaign.cpm_usd)}
              {campaign.daily_cap_usd ? ` · Daily cap: ${formatCurrency(campaign.daily_cap_usd)}` : ""}
            </p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

export default function CampaignDetailPage() {
  return (
    <Suspense fallback={<PortalLayout portalType="advertiser"><Skeleton className="h-48 rounded-[var(--radius-lg)]" /></PortalLayout>}>
      <CampaignDetailContent />
    </Suspense>
  );
}
