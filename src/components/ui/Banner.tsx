import { AlertTriangle, Info, CheckCircle, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant = "info" | "warning" | "error" | "success";

/*
 * All color values reference CSS custom properties defined in globals.css.
 * No raw hex values appear in this file — every decision traces to a named
 * design-system token.
 */
const bannerConfig: Record<
  BannerVariant,
  { bg: string; border: string; text: string; icon: LucideIcon }
> = {
  info: {
    bg:     "var(--color-status-info-bg)",
    border: "var(--color-status-info-border)",
    text:   "var(--color-status-info-text)",
    icon: Info,
  },
  warning: {
    bg:     "var(--color-status-warning-bg)",
    border: "var(--color-status-warning-border)",
    text:   "var(--color-status-warning-text)",
    icon: AlertTriangle,
  },
  error: {
    bg:     "var(--color-status-error-bg)",
    border: "var(--color-status-error-border)",
    text:   "var(--color-status-error-text)",
    icon: XCircle,
  },
  success: {
    bg:     "var(--color-status-active-bg)",
    border: "var(--color-status-active-border)",
    text:   "var(--color-status-active-text)",
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
