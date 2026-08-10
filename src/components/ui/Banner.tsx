import { AlertTriangle, Info, CheckCircle, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant = "info" | "warning" | "error" | "success";

/*
 * Banner colors use inline styles referencing CSS custom properties so they
 * are guaranteed to trace back to design-system tokens — no raw Tailwind color
 * names that could drift from the token layer.
 */
const bannerConfig: Record<
  BannerVariant,
  { bg: string; border: string; text: string; icon: LucideIcon }
> = {
  info: {
    bg:     "rgba(59,130,246,0.08)",   /* --color-status-info tint */
    border: "rgba(59,130,246,0.30)",
    text:   "#1E40AF",
    icon: Info,
  },
  warning: {
    bg:     "rgba(245,158,11,0.08)",   /* --color-status-warning tint */
    border: "rgba(245,158,11,0.30)",
    text:   "#92400E",
    icon: AlertTriangle,
  },
  error: {
    bg:     "rgba(239,68,68,0.08)",    /* --color-status-error tint */
    border: "rgba(239,68,68,0.30)",
    text:   "#991B1B",
    icon: XCircle,
  },
  success: {
    bg:     "rgba(16,185,129,0.08)",   /* --color-status-active tint */
    border: "rgba(16,185,129,0.30)",
    text:   "#065F46",
    icon: CheckCircle,
  },
};

interface BannerProps {
  variant: BannerVariant;
  message: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function Banner({ variant, message, action, className }: BannerProps) {
  const config = bannerConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border text-[13px] font-medium w-full",
        className
      )}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
    >
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="underline font-semibold hover:no-underline shrink-0 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
