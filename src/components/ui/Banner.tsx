import { AlertTriangle, Info, CheckCircle, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant = "info" | "warning" | "error" | "success";

const bannerConfig: Record<
  BannerVariant,
  { bg: string; border: string; text: string; icon: LucideIcon }
> = {
  info:    { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-800",  icon: Info },
  warning: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-800", icon: AlertTriangle },
  error:   { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-800",   icon: XCircle },
  success: { bg: "bg-green-50",  border: "border-green-200", text: "text-green-800", icon: CheckCircle },
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
        config.bg,
        config.border,
        config.text,
        className
      )}
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
