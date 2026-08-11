"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Badge, DataTable, Button } from "@/components/ui";
import { KpiCard } from "@/components/charts/KpiCard";
import { ScoreCard } from "@/components/charts/ScoreCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Campaign } from "@/types";
import type { Column } from "@/components/ui/DataTable";

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Spring Promo",     status: "active", advertiser_category: "tech",
    creative: { headline: "Try Ambient", body: "", cta_text: "Learn More", destination_url: "https://brand.com" },
    targeting: { topics: ["Technology"], keywords: ["AI tools"], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 12, daily_cap_usd: 200 },
    flight: { start_date: "2026-09-01", end_date: "2026-09-30" },
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
  { id: "c2", name: "Brand Awareness",  status: "active", advertiser_category: "retail",
    creative: { headline: "Brand Awareness", body: "", cta_text: "Learn More", destination_url: "https://brand.com" },
    targeting: { topics: ["Retail"], keywords: [], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 10 },
    flight: { start_date: "2026-09-01", end_date: "2026-10-15" },
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
  { id: "c3", name: "Tech Retarget",    status: "paused", advertiser_category: "tech",
    creative: { headline: "Tech Retarget", body: "", cta_text: "See more", destination_url: "https://brand.com" },
    targeting: { topics: ["Technology"], keywords: [], excluded_topics: [] },
    budget: { total_usd: 3000, cpm_usd: 11 },
    flight: { start_date: "2026-08-15", end_date: "2026-11-01" },
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z" },
  { id: "c4", name: "Q2 Test",          status: "ended", advertiser_category: "cpg",
    creative: { headline: "Q2 Test", body: "", cta_text: "See more", destination_url: "https://brand.com" },
    targeting: { topics: [], keywords: [], excluded_topics: [] },
    budget: { total_usd: 5000, cpm_usd: 8 },
    flight: { start_date: "2026-05-01", end_date: "2026-07-30" },
    created_at: "2026-05-01T00:00:00Z", updated_at: "2026-07-30T00:00:00Z" },
];

const DEMO_STATS: Record<string, { impressions: number; clicks: number; ctr: number; spend_usd: number; pacing: number }> = {
  c1: { impressions: 175000, clicks: 3675,  ctr: 0.021,  spend_usd: 2100, pacing: 78 },
  c2: { impressions: 175000, clicks: 1575,  ctr: 0.009,  spend_usd: 2130, pacing: 43 },
  c3: { impressions: 80000,  clicks: 1440,  ctr: 0.018,  spend_usd: 890,  pacing: 31 },
  c4: { impressions: 612000, clicks: 5508,  ctr: 0.004,  spend_usd: 4890, pacing: 100 },
};

// Radar data — 6 campaign health dimensions, each 0–100
const RADAR_DATA = [
  { metric: "CTR",          score: 70, target: 90 },
  { metric: "Spend pace",   score: 83, target: 90 },
  { metric: "Impressions",  score: 75, target: 85 },
  { metric: "Budget util.", score: 61, target: 80 },
  { metric: "Flight cov.",  score: 90, target: 90 },
  { metric: "Avg CPM",      score: 65, target: 80 },
];

// Donut — spend by status
const STATUS_SPEND = [
  { name: "Active",  value: 4230, color: "#4F46E5" },
  { name: "Paused",  value: 890,  color: "#F59E0B" },
  { name: "Ended",   value: 4890, color: "#E5E7EB" },
];

// Bar — CTR by campaign
const CTR_BAR_DATA = [
  { name: "Spring Promo",   ctr: 2.1,  fill: "#10B981" },
  { name: "Brand Awareness",ctr: 0.9,  fill: "#F59E0B" },
  { name: "Tech Retarget",  ctr: 1.8,  fill: "#10B981" },
  { name: "Q2 Test",        ctr: 0.4,  fill: "#9CA3AF" },
];

// Scorecard
const SCORECARDS = [
  { label: "Avg CTR",          value: "1.5%",  score: 62, note: "Above 1.2% benchmark · trending up" },
  { label: "Budget utilisation",value: "61%",  score: 61, note: "2 campaigns underpacing vs flight" },
  { label: "Avg CPM",          value: "$9.47", score: 76, note: "Within target range $8–12 CPM" },
  { label: "Impression share", value: "42%",   score: 42, note: "Below 60% target · increase bids" },
  { label: "Flight coverage",  value: "90%",   score: 90, note: "Active campaigns well-distributed" },
  { label: "Spend pace",       value: "83%",   score: 83, note: "Slightly under daily cap targets" },
  { label: "Topic targeting",  value: "87%",   score: 87, note: "High topic match rate across placements" },
  { label: "Creative diversity",value: "38%",  score: 38, note: "Only 1 creative variant per campaign" },
];

// Table
type Row = Campaign & { spend: string; ctr_str: string; end: string; pacing: number };
const columns: Column<Row>[] = [
  { key: "name", header: "Campaign",
    render: (r) => <Link href={`/advertiser/campaigns/${r.id}`} className="text-[var(--color-brand-accent)] font-medium hover:underline">{r.name}</Link> },
  { key: "status", header: "Status",
    render: (r) => <Badge variant={r.status as import("@/components/ui/Badge").BadgeVariant} /> },
  { key: "spend",   header: "Spend",         align: "right" },
  { key: "ctr_str", header: "CTR",           align: "right" },
  { key: "pacing",  header: "Budget pacing", align: "right",
    render: (r) => (
      <div className="flex items-center justify-end gap-2">
        <span className="text-[11px] text-[var(--color-text-secondary)]">{r.pacing}%</span>
        <div className="w-16 h-[5px] rounded-full overflow-hidden" style={{ background: "var(--color-border-subtle)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${r.pacing}%`, background: r.pacing >= 70 ? "#10B981" : "#F59E0B" }}
          />
        </div>
      </div>
    )},
  { key: "end", header: "End date", align: "right" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdvertiserDashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const totalSpend = Object.values(DEMO_STATS).reduce((s, x) => s + x.spend_usd, 0);
  const activeCampaigns = DEMO_CAMPAIGNS.filter((c) => c.status === "active");
  const totalImpressions = Object.values(DEMO_STATS).reduce((s, x) => s + x.impressions, 0);
  const avgCtr = activeCampaigns.length
    ? activeCampaigns.reduce((s, c) => s + DEMO_STATS[c.id].ctr, 0) / activeCampaigns.length
    : 0;

  const tableRows: Row[] = DEMO_CAMPAIGNS.map((c) => ({
    ...c,
    spend:   formatCurrency(DEMO_STATS[c.id]?.spend_usd ?? 0),
    ctr_str: formatPercent(DEMO_STATS[c.id]?.ctr ?? 0),
    end:     c.flight.end_date,
    pacing:  DEMO_STATS[c.id]?.pacing ?? 0,
  }));

  const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)] mb-3";

  return (
    <PortalLayout portalType="advertiser" userName="Alex">
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight">
              Good morning, Alex.
            </h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
              Here's how your campaigns are performing this month.
            </p>
          </div>
          <Link href="/advertiser/campaigns/new">
            <Button size="sm"><Plus size={14} aria-hidden="true" /> New campaign</Button>
          </Link>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Active campaigns"   value={String(activeCampaigns.length)} delta="1" deltaDir="up"   sub="vs last month"    accent="indigo" />
          <KpiCard label="Total spend (30d)"  value={formatCurrency(totalSpend)}     delta="12%" deltaDir="up" sub="vs prior period"  accent="green"  />
          <KpiCard label="Avg CTR (30d)"      value={formatPercent(avgCtr)}          delta="0.2pp" deltaDir="down" sub="vs prior period" accent="amber" />
          <KpiCard label="Total impressions"  value={formatNumber(totalImpressions)} delta="8%"  deltaDir="up"  sub="vs prior period"  accent="blue"   />
        </div>

        {/* Campaign health charts */}
        <section aria-labelledby="health-heading">
          <div className={sectionLabel} id="health-heading">Campaign health</div>
          <div className="grid grid-cols-3 gap-4">

            {/* Radar */}
            <ChartCard title="Portfolio health radar" subtitle="Across all active campaigns">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={RADAR_DATA} outerRadius={80}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#6B7280" }} />
                  <Radar name="Target"  dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.05} strokeDasharray="4 3" strokeWidth={1.5} />
                  <Radar name="Current" dataKey="score"  stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#4F46E5" }} />
                  <Legend
                    formatter={(v) => <span style={{ fontSize: 11, color: "#6B7280" }}>{v}</span>}
                    iconSize={10}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Donut */}
            <ChartCard title="Spend by campaign status" subtitle="30-day budget allocation">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={STATUS_SPEND}
                    cx="50%" cy="45%"
                    innerRadius={55} outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                    label={false}
                  >
                    {STATUS_SPEND.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v))}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E5E7EB" }}
                  />
                  <Legend
                    formatter={(v) => <span style={{ fontSize: 11, color: "#6B7280" }}>{v}</span>}
                    iconSize={8}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Horizontal bar — CTR */}
            <ChartCard title="CTR by campaign" subtitle="vs 1.2% benchmark">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={CTR_BAR_DATA}
                  layout="vertical"
                  margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
                >
                  <CartesianGrid horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" domain={[0, 3]} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v, name) => [`${Number(v)}%`, "CTR"]}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E5E7EB" }}
                  />
                  <Bar dataKey="ctr" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {CTR_BAR_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                  {/* Benchmark reference line via foreignObject workaround: use ReferenceLine */}
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)] mt-1 pt-2 border-t border-[var(--color-border-subtle)]">
                <div className="w-4 h-[2px] rounded bg-[var(--color-brand-accent)]" />
                Benchmark: 1.2% avg CTR
              </div>
            </ChartCard>
          </div>
        </section>

        {/* Scorecard */}
        <section aria-labelledby="scorecard-heading">
          <div className={sectionLabel} id="scorecard-heading">Campaign scorecard</div>
          <div className="grid grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-[var(--radius-xl)] bg-[var(--color-surface-hover)] animate-pulse" />
                ))
              : SCORECARDS.map((s) => (
                  <ScoreCard key={s.label} label={s.label} value={s.value} score={s.score} note={s.note} />
                ))}
          </div>
        </section>

        {/* Campaigns table */}
        <section aria-labelledby="campaigns-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="campaigns-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)]">
              Active campaigns
            </h2>
            <Link href="/advertiser/campaigns" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">
              View all →
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
