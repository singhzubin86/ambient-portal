interface ScoreCardProps {
  label: string;
  value: string;
  /** 0–100 */
  score: number;
  note: string;
}

function scoreColor(score: number) {
  if (score >= 75) return { text: "#059669", bar: "#10B981" };
  if (score >= 50) return { text: "#D97706", bar: "#F59E0B" };
  return { text: "#DC2626", bar: "#EF4444" };
}

export function ScoreCard({ label, value, score, note }: ScoreCardProps) {
  const { text, bar } = scoreColor(score);
  return (
    <div
      className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">
        {label}
      </div>
      <div className="text-[30px] font-bold leading-none mb-1.5" style={{ color: text, letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div
        className="h-[5px] rounded-full mb-2 overflow-hidden"
        style={{ background: "var(--color-border-subtle)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(score, 100)}%`, background: bar }}
        />
      </div>
      <div className="text-[11px] text-[var(--color-text-secondary)] leading-snug">{note}</div>
    </div>
  );
}
