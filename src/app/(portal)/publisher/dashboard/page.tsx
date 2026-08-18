"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { KpiCard } from "@/components/charts/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { portalReporting, portalPublishers, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/useAuth";
import type { IntegrationStatus } from "@/types";

// ── Demo data ─────────────────────────────────────────────────────────────────
// KPI strip still demo — will be replaced with real reporting API data post-auth MVP
const DEMO_STATS = { impressions: 48200, clicks: 867, fill_rate: 0.71, earnings_usd: 57.84 };

// Funnel data
const FUNNEL_DATA = [
  { stage: "Ad requests",  value: 67900, pct: 100, color: "#4F46E5" },
  { stage: "Impressions",  value: 48200, pct: 71,  color: "#6366F1" },
  { stage: "Clicks",       value: 867,   pct: 1.8, color: "#818CF8" },
];

// Earnings by topic
const TOPIC_PIE = [
  { name: "Technology", value: 24.29, color: "#4F46E5" },
  { name: "Finance",    value: 16.20, color: "#10B981" },
  { name: "Health",     value: 10.41, color: "#F59E0B" },
  { name: "Other",      value:  6.94, color: "#E5E7EB" },
];

// Top topics bar
const TOPIC_BARS = [
  { topic: "Technology", earnings: 24.29, fill_rate: 84 },
  { topic: "Finance",    earnings: 16.20, fill_rate: 76 },
  { topic: "Health",     earnings: 10.41, fill_rate: 61 },
  { topic: "Travel",     earnings: 5.20,  fill_rate: 52 },
  { topic: "Lifestyle",  earnings: 1.74,  fill_rate: 38 },
];

// 30-day trend
const TREND_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Aug ${i + 1}`,
  earnings: +(0.8 + Math.sin(i * 0.4) * 0.6 + (i / 30) * 1.5 + Math.random() * 0.4).toFixed(2),
}));

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; border: string; bg: string; text: string; dot: string }> = {
  live:           { label: "Live",           border: "#10B981", bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  degraded:       { label: "Degraded",       border: "#F59E0B", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  no_signal:      { label: "No signal",      border: "#EF4444", bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  not_integrated: { label: "Not integrated", border: "#9CA3AF", bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function PublisherDashboard() {
  const { user } = useAuth();
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>("not_integrated");
  const [hasPublisher, setHasPublisher] = useState(true);

  useEffect(() => {
    // Check if publisher has completed onboarding + get real integration status
    portalPublishers.me()
      .then(() => {
        return portalReporting.integrationStatus();
      })
      .then((res) => {
        setIntegrationStatus(res.integration_status as IntegrationStatus);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          // Publisher hasn't onboarded yet
          setHasPublisher(false);
          setIntegrationStatus("not_integrated");
        }
        // On network errors just keep "not_integrated" — don't block the dashboard
      });
  }, []);

  const statusCfg = STATUS_CONFIG[integrationStatus] ?? STATUS_CONFIG["not_integrated"];
  const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)] mb-3";

  const trendTotal = TREND_DATA.reduce((s, d) => s + d.earnings, 0);
  const trendAvg = trendTotal / TREND_DATA.length;
  const trendBest = Math.max(...TREND_DATA.map((d) => d.earnings));

  return (
    <PortalLayout portalType="publisher" >
      <div className="space-y-8">

        {/* Page header */}
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight">
            Good morning, {user?.full_name?.split(" ")[0] ?? "there"}.
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            Your AI assistant is live and earning.
          </p>
        </div>

        {/* Integration health — elevated, always at top */}
        {!hasPublisher ? (
          <div
            className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] px-5 py-4 flex items-center justify-between"
            style={{ boxShadow: "var(--shadow-card)", borderLeft: "4px solid var(--color-brand-accent)" }}
          >
            <div>
              <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">Complete your setup</div>
              <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                Finish onboarding to start serving ads and earning.
              </div>
            </div>
            <Link href="/publisher/onboarding" className="text-[12px] font-semibold text-[var(--color-brand-accent)] hover:underline">
              Complete setup →
            </Link>
          </div>
        ) : (
          <div
            className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] px-5 py-4 flex items-center justify-between"
            style={{ boxShadow: "var(--shadow-card)", borderLeft: `4px solid ${statusCfg.border}` }}
            role="status"
            aria-label="Integration status"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center flex-shrink-0"
                style={{ background: statusCfg.bg }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  {integrationStatus === "live" ? (
                    <path d="M5 10l4 4 6-7" stroke={statusCfg.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M10 6v4M10 14h.01" stroke={statusCfg.border} strokeWidth="2" strokeLinecap="round"/>
                  )}
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">Integration status</div>
                <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                  {integrationStatus === "live"
                    ? "SDK sending events"
                    : integrationStatus === "no_signal"
                    ? "No signal in the last 48h — check your integration"
                    : "No events received yet — install the SDK to get started"}
                </div>
              </div>
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: statusCfg.bg, color: statusCfg.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                {statusCfg.label}
              </span>
            </div>
            <div className="pl-4 border-l border-[var(--color-border-default)]">
              <Link href="/publisher/integration" className="text-[12px] text-[var(--color-brand-accent)] hover:underline">
                View integration guide →
              </Link>
            </div>
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Est. earnings (30d)"  value={formatCurrency(DEMO_STATS.earnings_usd)}   delta="14%"  deltaDir="up"   sub="vs prior period" accent="green"  />
          <KpiCard label="Impressions served"   value={formatNumber(DEMO_STATS.impressions)}       delta="9%"   deltaDir="up"   sub="vs prior period" accent="indigo" />
          <KpiCard label="Fill rate"            value={formatPercent(DEMO_STATS.fill_rate)}        delta="3pp"  deltaDir="down" sub="vs prior period" accent="amber"  />
          <KpiCard label="Clicks"               value={formatNumber(DEMO_STATS.clicks)}            delta="6%"   deltaDir="up"   sub="vs prior period" accent="blue"   />
        </div>

        {/* Funnel + charts */}
        <section aria-labelledby="funnel-heading">
          <div className={sectionLabel} id="funnel-heading">Engagement funnel &amp; revenue breakdown</div>
          <div className="grid grid-cols-3 gap-4">

            {/* Funnel */}
            <ChartCard title="Request-to-click funnel" subtitle="Where volume drops off">
              <div className="flex flex-col gap-1 mt-2">
                {FUNNEL_DATA.map((step, i) => (
                  <div key={step.stage}>
                    <div
                      className="flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-md)]"
                      style={{
                        background: step.color,
                        width: i === 0 ? "100%" : i === 1 ? "85%" : "55%",
                        marginLeft: i === 0 ? 0 : i === 1 ? "0%" : "7.5%",
                      }}
                    >
                      <span className="text-[12px] font-semibold text-white">{step.stage}</span>
                      <span className="text-[13px] font-bold text-white">{formatNumber(step.value)}</span>
                    </div>
                    {i < FUNNEL_DATA.length - 1 && (
                      <div className="flex items-center justify-center gap-2 py-1.5 text-[11px] text-[var(--color-text-secondary)]">
                        <div className="w-px h-3 bg-[var(--color-border-default)]" />
                        <span>↓ {i === 0 ? `Fill rate ${formatPercent(DEMO_STATS.fill_rate)}` : `CTR ${formatPercent(DEMO_STATS.clicks / DEMO_STATS.impressions)}`}</span>
                        <div className="w-px h-3 bg-[var(--color-border-default)]" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-md)] mt-1"
                  style={{ background: "#10B981", width: "38%", marginLeft: "15%" }}>
                  <span className="text-[12px] font-semibold text-white">Est. earnings</span>
                  <span className="text-[13px] font-bold text-white">{formatCurrency(DEMO_STATS.earnings_usd)}</span>
                </div>
              </div>
            </ChartCard>

            {/* Earnings by topic donut */}
            <ChartCard title="Earnings by topic" subtitle="Where your revenue comes from">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={TOPIC_PIE}
                    cx="50%" cy="42%"
                    innerRadius={52} outerRadius={75}
                    dataKey="value"
                    paddingAngle={2}
                    label={false}
                  >
                    {TOPIC_PIE.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), "Earnings"]}
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

            {/* Top topics bar */}
            <ChartCard title="Top earning topics" subtitle="Est. earnings &amp; fill rate by topic (30d)">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={TOPIC_BARS}
                  layout="vertical"
                  margin={{ left: 4, right: 16, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="topic" width={72} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v, name) => String(name) === "earnings" ? [formatCurrency(Number(v)), "Earnings"] : [`${Number(v)}%`, "Fill rate"]}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E5E7EB" }}
                  />
                  <Bar dataKey="earnings" fill="#4F46E5" radius={[0, 4, 4, 0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        {/* Earnings trend */}
        <section aria-labelledby="trend-heading">
          <div className={sectionLabel} id="trend-heading">30-day earnings trend</div>
          <div
            className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">Daily earnings</div>
                <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                  Est. earnings per day · 75% of CPM after Ambient's 25% platform fee
                </div>
              </div>
              <div className="flex gap-6 text-right">
                {[
                  { label: "30d total", value: formatCurrency(trendTotal), delta: "↑ 14%", deltaColor: "#059669" },
                  { label: "Daily avg",  value: formatCurrency(trendAvg),   delta: "↑ 8%",  deltaColor: "#059669" },
                  { label: "Best day",   value: formatCurrency(trendBest),  delta: "Aug 24", deltaColor: "#9CA3AF" },
                ].map((k) => (
                  <div key={k.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)]">{k.label}</div>
                    <div className="text-[20px] font-bold text-[var(--color-text-primary)] tracking-tight">{k.value}</div>
                    <div className="text-[11px] font-semibold mt-0.5" style={{ color: k.deltaColor }}>{k.delta}</div>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={TREND_DATA} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false}
                  interval={5} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${v}`} width={32} />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), "Earnings"]}
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E5E7EB" }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#4F46E5" strokeWidth={2.5}
                  fill="url(#earningsGrad)" dot={false} activeDot={{ r: 4, fill: "#4F46E5" }} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
              ⓘ Estimated earnings are calculated at 75% of CPM after Ambient&apos;s 25% platform fee. Final amounts appear on your monthly invoice.
            </p>
          </div>
        </section>

        <div className="flex gap-4">
          <Link href="/publisher/reporting"   className="text-[13px] text-[var(--color-brand-accent)] hover:underline">View full report →</Link>
          <Link href="/publisher/integration" className="text-[13px] text-[var(--color-brand-accent)] hover:underline">Integration settings →</Link>
        </div>
      </div>
    </PortalLayout>
  );
}
