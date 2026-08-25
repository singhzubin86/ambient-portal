"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Badge, DataTable, Banner, Skeleton } from "@/components/ui";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { portalAdvertiserCampaigns, ApiError } from "@/lib/api/client";
import type { AdvertiserCampaign } from "@/types";
import type { Column } from "@/components/ui/DataTable";

type CampaignRow = AdvertiserCampaign & { spend_str: string; ctr_str: string };

const columns: Column<CampaignRow>[] = [
  {
    key: "name",
    header: "Campaign name",
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
  { key: "spend_str", header: "Spend",    align: "right" },
  { key: "ctr_str",   header: "CTR",      align: "right" },
  { key: "end_date",  header: "End date", align: "right" },
];

function CampaignsContent() {
  const params = useSearchParams();
  const created = params.get("created");

  const [campaigns, setCampaigns] = useState<AdvertiserCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portalAdvertiserCampaigns
      .list()
      .then((res) => setCampaigns(res.campaigns))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setCampaigns([]);
        } else {
          setError("Failed to load campaigns. Please refresh.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const rows: CampaignRow[] = campaigns.map((c) => ({
    ...c,
    spend_str: formatCurrency(c.spend_usd),
    ctr_str: formatPercent(c.ctr),
  }));

  return (
    <div className="space-y-6">
      {created && (
        <Banner variant="success" message="Campaign created and is now live — it may take up to 30 seconds to appear in the ad system." />
      )}
      {error && <Banner variant="error" message={error} />}

      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Campaigns</h1>
        <Link href="/advertiser/campaigns/new">
          <Button size="sm">
            <Plus size={14} /> New campaign
          </Button>
        </Link>
      </div>

      {loading ? (
        <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage="No campaigns yet. Create your first campaign to start serving ads."
        />
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <PortalLayout portalType="advertiser">
      <Suspense
        fallback={<Skeleton className="h-48 rounded-[var(--radius-lg)]" />}
      >
        <CampaignsContent />
      </Suspense>
    </PortalLayout>
  );
}
