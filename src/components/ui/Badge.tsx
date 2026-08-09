import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "active"
  | "paused"
  | "ended"
  | "scheduled"
  | "rejected"
  | "degraded"
  | "no-signal"
  | "pending";

const badgeConfig: Record<
  BadgeVariant,
  { dot: string; bg: string; text: string; label: string; icon: string }
> = {
  active:    { dot: "bg-[#10B981]", bg: "bg-[#D1FAE5]", text: "text-[#065F46]", label: "Active",     icon: "●" },
  paused:    { dot: "bg-[#F59E0B]", bg: "bg-[#FEF3C7]", text: "text-[#92400E]", label: "Paused",     icon: "⏸" },
  ended:     { dot: "bg-[#9CA3AF]", bg: "bg-[#F3F4F6]", text: "text-[#374151]", label: "Ended",      icon: "○" },
  scheduled: { dot: "bg-[#3B82F6]", bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]", label: "Scheduled",  icon: "◷" },
  rejected:  { dot: "bg-[#EF4444]", bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", label: "Rejected",   icon: "⊗" },
  degraded:  { dot: "bg-[#F59E0B]", bg: "bg-[#FEF3C7]", text: "text-[#92400E]", label: "Degraded",   icon: "◑" },
  "no-signal": { dot: "bg-[#EF4444]", bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", label: "No signal", icon: "○" },
  pending:   { dot: "bg-[#9CA3AF]", bg: "bg-[#F3F4F6]", text: "text-[#374151]", label: "Pending review", icon: "◷" },
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
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full shrink-0", config.dot)} aria-hidden="true" />
      {displayLabel}
    </span>
  );
}
