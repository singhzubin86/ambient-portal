import { type ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className = "" }: ChartCardProps) {
  return (
    <div
      className={`bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-5 ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-1 text-[14px] font-semibold text-[var(--color-text-primary)]">{title}</div>
      {subtitle && (
        <div className="mb-4 text-[12px] text-[var(--color-text-secondary)]">{subtitle}</div>
      )}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}
