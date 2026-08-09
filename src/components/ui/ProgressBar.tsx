import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-[12px] text-[var(--color-text-secondary)]">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 rounded-full bg-[var(--color-border-default)] overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-[var(--color-brand-accent)] transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
