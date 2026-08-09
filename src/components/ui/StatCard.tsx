import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-6",
        "bg-[var(--color-surface-card)]",
        className
      )}
    >
      <p
        className="text-[28px] font-bold leading-tight text-[var(--color-text-primary)]"
        aria-label={`${value} ${label}`}
      >
        {value}
      </p>
      <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mt-1">
        {label}
      </p>
    </div>
  );
}
