type AccentColor = "indigo" | "green" | "amber" | "blue";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: "up" | "down" | "neutral";
  sub?: string;
  accent: AccentColor;
}

const ACCENT_COLORS: Record<AccentColor, string> = {
  indigo: "#4F46E5",
  green:  "#10B981",
  amber:  "#F59E0B",
  blue:   "#3B82F6",
};

export function KpiCard({ label, value, delta, deltaDir = "neutral", sub, accent }: KpiCardProps) {
  const accentHex = ACCENT_COLORS[accent];
  const deltaColor =
    deltaDir === "up"   ? "#059669" :
    deltaDir === "down" ? "#DC2626" :
    "var(--color-text-secondary)";

  return (
    <div
      className="relative bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] px-5 pt-4 pb-4 overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--radius-xl)]" style={{ background: accentHex }} />
      <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)] mb-2">
        {label}
      </div>
      <div className="text-[28px] font-bold leading-none text-[var(--color-text-primary)]" style={{ letterSpacing: "-0.5px" }}>
        {value}
      </div>
      {(delta || sub) && (
        <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-[var(--color-text-secondary)]">
          {delta && (
            <span className="text-[11px] font-semibold" style={{ color: deltaColor }}>
              {deltaDir === "up" ? "↑" : deltaDir === "down" ? "↓" : ""} {delta}
            </span>
          )}
          {sub && <span>{sub}</span>}
        </div>
      )}
    </div>
  );
}
