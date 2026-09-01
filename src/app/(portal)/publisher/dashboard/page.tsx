"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { KpiCard } from "@/components/charts/KpiCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { Skeleton } from "@/components/ui";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { portalReporting, portalPublishers, ApiError } from "@/lib/api/client";
import type { StatRow, TopicStatRow } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/useAuth";
import type { IntegrationStatus } from "@/types";

const TOPIC_BAR_COLOR = "#4F46E5";

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
  const [kpi, setKpi] = useState<{
    impressions: number;
    clicks: number;
    fill_rate: number;
    earnings_usd: number;
  } | null>(null);
  const [trendRows, setTrendRows] = useState<StatRow[]>([]);
  const [kpiLoading, setKpiLoading] = useState(true);

  // Topic panels state
  // null = loading, [] = no data / pre-feature records, TopicStatRow[] = live data
  const [topicRows, setTopicRows] = useState<TopicStatRow[] | null>(null);
  // true when publisher has aggregate impressions but zero topic rows (pre-feature WAL records)
  const [hasImpressionsButNoTopics, setHasImpressionsButNoTopics] = useState(false);

  useEffect(() => {
    // Fetch publisher record → integration status, 30d stats, and topic stats in parallel
    portalPublishers.me()
      .then(() => {
        return Promise.all([
          portalReporting.integrationStatus(),
          portalReporting.stats(),
          portalReporting.topicStats(),
        ]);
      })
      .then(([statusRes, statsRes, topicsRes]) => {
        setIntegrationStatus(statusRes.integration_status as IntegrationStatus);
        const totalImpressions = statsRes.summary.total_impressions;
        setKpi({
          impressions: totalImpressions,
          clicks: statsRes.summary.total_clicks,
          fill_rate: 0,
          earnings_usd: statsRes.summary.total_spend_usd,
        });
        setTrendRows(statsRes.rows ?? []);

        const rows = topicsRes.rows ?? [];
        setTopicRows(rows);
        // If publisher has impressions but no topic rows → pre-feature WAL records
        if (rows.length === 0 && totalImpressions > 0) {
          setHasImpressionsButNoTopics(true);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setHasPublisher(false);
          setIntegrationStatus("not_integrated");
        }
        setTopicRows([]); // don't leave panels in perpetual skeleton on error
      })
      .finally(() => setKpiLoading(false));
  }, []);

  const statusCfg = STATUS_CONFIG[integrationStatus] ?? STATUS_CONFIG["not_integrated"];
  const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)] mb-3";

  // Derived trend stats from real rows
  const trendData = trendRows.map((r) => ({
    day: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    earnings: r.spend_usd,
  }));
  const trendTotal = trendData.reduce((s, d) => s + d.earnings, 0);
  const trendAvg   = trendData.length > 0 ? trendTotal / trendData.length : 0;
  const trendBest  = trendData.length > 0 ? Math.max(...trendData.map((d) => d.earnings)) : 0;

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

        {/* KPI strip — real data from portalReporting.stats() */}
        <div className="grid grid-cols-4 gap-4">
          {kpiLoading ? (
            <>
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
            </>
          ) : (
            <>
              <KpiCard
                label="Est. earnings (30d)"
                value={formatCurrency(kpi?.earnings_usd ?? 0)}
                sub="from impressions served"
                accent="green"
              />
              <KpiCard
                label="Impressions served"
                value={formatNumber(kpi?.impressions ?? 0)}
                sub="last 30 days"
                accent="indigo"
              />
              <KpiCard
                label="Clicks"
                value={formatNumber(kpi?.clicks ?? 0)}
                sub="last 30 days"
                accent="blue"
              />
              <KpiCard
                label="Avg CTR"
                value={
                  kpi && kpi.impressions > 0
                    ? formatPercent(kpi.clicks / kpi.impressions)
                    : "—"
                }
                sub="clicks / impressions"
                accent="amber"
              />
            </>
          )}
        </div>

        {/* Funnel + charts */}
        <section aria-labelledby="funnel-heading">
          <div className={sectionLabel} id="funnel-heading">Engagement funnel &amp; revenue breakdown</div>
          <div className="grid grid-cols-3 gap-4">

            {/* Funnel — derived from real impressions / clicks / earnings */}
            <ChartCard title="Request-to-click funnel" subtitle="Where volume drops off">
              {kpiLoading ? (
                <Skeleton className="h-40 rounded-[var(--radius-md)]" />
              ) : (
                <div className="flex flex-col gap-1 mt-2">
                  {[
                    { stage: "Impressions", value: kpi?.impressions ?? 0, color: "#6366F1" },
                    { stage: "Clicks",      value: kpi?.clicks ?? 0,      color: "#818CF8" },
                  ].map((step, i) => (
                    <div key={step.stage}>
                      <div
                        className="flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-md)]"
                        style={{
                          background: step.color,
                          width: i === 0 ? "100%" : "60%",
                          marginLeft: i === 0 ? 0 : "20%",
                        }}
                      >
                        <span className="text-[12px] font-semibold text-white">{step.stage}</span>
                        <span className="text-[13px] font-bold text-white">{formatNumber(step.value)}</span>
                      </div>
                      {i === 0 && (
                        <div className="flex items-center justify-center gap-2 py-1.5 text-[11px] text-[var(--color-text-secondary)]">
                          <div className="w-px h-3 bg-[var(--color-border-default)]" />
                          <span>
                            CTR {kpi && kpi.impressions > 0 ? formatPercent(kpi.clicks / kpi.impressions) : "—"}
                          </span>
                          <div className="w-px h-3 bg-[var(--color-border-default)]" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-md)] mt-1"
                    style={{ background: "#10B981", width: "40%", marginLeft: "30%" }}>
                    <span className="text-[12px] font-semibold text-white">Est. earnings</span>
                    <span className="text-[13px] font-bold text-white">{formatCurrency(kpi?.earnings_usd ?? 0)}</span>
                  </div>
                </div>
              )}
            </ChartCard>

            {/* Earnings by topic — horizontal bar chart */}
            <ChartCard title="Earnings by topic" subtitle="Where your revenue comes from">
              {topicRows === null ? (
                <Skeleton className="h-[180px] rounded-[var(--radius-md)]" />
              ) : topicRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] gap-2 text-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="16" r="14" stroke="#E5E7EB" strokeWidth="2" />
                    <path d="M16 10v6M16 20h.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {hasImpressionsButNoTopics ? (
                    <>
                      <p className="text-[12px] text-[var(--color-text-secondary)]">No topic data yet</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary,#9CA3AF)]">
                        Keyword data is collected from new impressions
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] text-[var(--color-text-secondary)]">
                        Per-topic breakdown coming soon
                      </p>
                      <p className="text-[11px] text-[var(--color-text-tertiary,#9CA3AF)]">
                        Available once keyword-level WAL reporting is live
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      layout="vertical"
                      data={topicRows.slice(0, 8)}
                      margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke="#F3F4F6" />
                      <XAxis
                        type="number"
                        dataKey="spend_usd"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="keyword"
                        tick={{ fontSize: 10, fill: "#6B7280" }}
                        tickLine={false}
                        axisLine={false}
                        width={64}
                      />
                      <Tooltip
                        formatter={(v) => [formatCurrency(Number(v)), "Est. earnings"]}
                        contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E5E7EB" }}
                      />
                      <Bar dataKey="spend_usd" radius={[0, 4, 4, 0]} maxBarSize={14}>
                        {topicRows.slice(0, 8).map((_, i) => (
                          <Cell
                            key={i}
                            fill={TOPIC_BAR_COLOR}
                            fillOpacity={1 - i * 0.08}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-[var(--color-text-tertiary,#9CA3AF)] mt-1">
                    &#9432; Topic earnings overlap — a single impression may count toward multiple topics.
                  </p>
                </>
              )}
            </ChartCard>

            {/* Top earning topics — ranked table */}
            <ChartCard title="Top earning topics" subtitle="Est. earnings by topic (30d)">
              {topicRows === null ? (
                <Skeleton className="h-[180px] rounded-[var(--radius-md)]" />
              ) : topicRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] gap-2 text-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="16" r="14" stroke="#E5E7EB" strokeWidth="2" />
                    <path d="M16 10v6M16 20h.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {hasImpressionsButNoTopics ? (
                    <>
                      <p className="text-[12px] text-[var(--color-text-secondary)]">No topic data yet</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary,#9CA3AF)]">
                        Keyword data is collected from new impressions
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] text-[var(--color-text-secondary)]">
                        Per-topic breakdown coming soon
                      </p>
                      <p className="text-[11px] text-[var(--color-text-tertiary,#9CA3AF)]">
                        Available once keyword-level WAL reporting is live
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-1 overflow-hidden">
                  <table className="w-full text-left border-collapse" aria-label="Top earning topics">
                    <thead>
                      <tr className="border-b border-[var(--color-border-subtle)]">
                        <th className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] pb-1.5 w-6">#</th>
                        <th className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] pb-1.5">Topic</th>
                        <th className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] pb-1.5 text-right">Impressions</th>
                        <th className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] pb-1.5 text-right">Est. earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topicRows.slice(0, 10).map((row, i) => (
                        <tr key={row.keyword} className="border-b border-[var(--color-border-subtle)] last:border-0">
                          <td className="py-1.5 text-[11px] text-[var(--color-text-tertiary,#9CA3AF)] w-6">{i + 1}</td>
                          <td className="py-1.5 text-[12px] font-medium text-[var(--color-text-primary)]">{row.keyword}</td>
                          <td className="py-1.5 text-[12px] text-[var(--color-text-secondary)] text-right tabular-nums">{formatNumber(row.impressions)}</td>
                          <td className="py-1.5 text-[12px] font-semibold text-[var(--color-text-primary)] text-right tabular-nums">{formatCurrency(row.spend_usd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  Est. earnings per day &middot; 75% of CPM after Ambient&apos;s 25% platform fee
                </div>
              </div>
              <div className="flex gap-6 text-right">
                {[
                  { label: "30d total", value: formatCurrency(trendTotal) },
                  { label: "Daily avg",  value: formatCurrency(trendAvg) },
                  { label: "Best day",   value: formatCurrency(trendBest) },
                ].map((k) => (
                  <div key={k.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)]">{k.label}</div>
                    <div className="text-[20px] font-bold text-[var(--color-text-primary)] tracking-tight">{k.value}</div>
                  </div>
                ))}
              </div>
            </div>
            {kpiLoading ? (
              <Skeleton className="h-[140px] rounded-[var(--radius-md)]" />
            ) : trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[140px] gap-2 text-center">
                <p className="text-[12px] text-[var(--color-text-secondary)]">No earnings data yet for this period</p>
                <p className="text-[11px] text-[var(--color-text-tertiary,#9CA3AF)]">Data will appear here once impressions are served</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={trendData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false}
                    interval={Math.max(0, Math.floor(trendData.length / 6) - 1)} />
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
            )}
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
              &#9432; Estimated earnings are calculated at 75% of CPM after Ambient&apos;s 25% platform fee. Final amounts appear on your monthly invoice.
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
