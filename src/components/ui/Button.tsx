import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand-accent)] text-white hover:bg-[var(--color-brand-accent-hover)] active:bg-[#3730A3]",
  secondary:
    "border border-[var(--color-brand-accent)] text-[var(--color-brand-accent)] hover:bg-[var(--color-surface-hover)]",
  ghost:
    "text-[var(--color-brand-accent)] hover:bg-[var(--color-surface-hover)]",
  danger:
    "bg-[var(--color-status-error)] text-white hover:bg-red-600 active:bg-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] font-semibold",
  md: "h-10 px-4 text-[14px] font-semibold",
  lg: "h-12 px-5 text-[15px] font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] transition-colors cursor-pointer",
          "min-h-[44px]", // WCAG touch target
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {loading ? "Loading…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";
