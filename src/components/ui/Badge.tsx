import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "active"
  | "paused"
  | "ended"
  | "scheduled"
  | "rejected"
  | "degraded"
  | "no-signal"
  | "pending"
  | "pending_review";

/*
 * All color values use CSS custom property references so every decision
 * traces to a named design-system token. No raw hex in this file.
 *
 * Dot colors use bg-[var(--token)] Tailwind JIT syntax.
 * Background + text use inline styles for variant-specific token combos.
 */
interface BadgeConfig {
  dotToken: string;
  bgToken: string;
  textToken: string;
  label: string;
}

const badgeConfig: Record<BadgeVariant, BadgeConfig> = {
  active:     { dotToken: "--color-status-active",   bgToken: "--color-status-active-bg",   textToken: "--color-status-active-text",   label: "Active" },
  paused:     { dotToken: "--color-status-warning",  bgToken: "--color-status-warning-bg",  textToken: "--color-status-warning-text",  label: "Paused" },
  ended:      { dotToken: "--color-status-neutral",  bgToken: "--color-border-subtle",      textToken: "--color-text-primary",         label: "Ended" },
  scheduled:  { dotToken: "--color-status-info",     bgToken: "--color-status-info-bg",     textToken: "--color-status-info-text",     label: "Scheduled" },
  rejected:   { dotToken: "--color-status-error",    bgToken: "--color-status-error-bg",    textToken: "--color-status-error-text",    label: "Rejected" },
  degraded:   { dotToken: "--color-status-warning",  bgToken: "--color-status-warning-bg",  textToken: "--color-status-warning-text",  label: "Degraded" },
  "no-signal":{ dotToken: "--color-status-error",    bgToken: "--color-status-error-bg",    textToken: "--color-status-error-text",    label: "No signal" },
  pending:         { dotToken: "--color-status-neutral",  bgToken: "--color-border-subtle",      textToken: "--color-text-primary",         label: "Pending review" },
  pending_review:  { dotToken: "--color-status-neutral",  bgToken: "--color-border-subtle",      textToken: "--color-text-primary",         label: "Pending review" },
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className }: BadgeProps) {
  const config = badgeConfig[variant];
  const displayLabel = label ?? config.label;

  return (
    <span
      role="status"
      aria-label={`Status: ${displayLabel}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold",
        className
      )}
      style={{
        backgroundColor: `var(${config.bgToken})`,
        color: `var(${config.textToken})`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        aria-hidden="true"
        style={{ backgroundColor: `var(${config.dotToken})` }}
      />
      {displayLabel}
    </span>
  );
}
