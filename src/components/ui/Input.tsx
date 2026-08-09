import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charCount?: { current: number; max: number };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, charCount, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const remaining = charCount ? charCount.max - charCount.current : null;
    const charCountColor =
      remaining !== null
        ? remaining < 0
          ? "text-[var(--color-status-error)]"
          : remaining < charCount!.max * 0.2
          ? "text-[var(--color-status-warning)]"
          : "text-[var(--color-text-secondary)]"
        : "";

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 px-3 rounded-[var(--radius-sm)] border text-[13px]",
              "bg-[var(--color-surface-input)] text-[var(--color-text-primary)]",
              "placeholder:text-[var(--color-text-secondary)]",
              "border-[var(--color-border-default)]",
              "focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-0",
              "disabled:bg-[var(--color-surface-hover)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed",
              error && "border-[var(--color-border-error)]",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
        </div>
        <div className="flex justify-between items-start">
          {error ? (
            <p
              id={`${inputId}-error`}
              role="alert"
              className="text-[12px] text-[var(--color-status-error)] flex items-center gap-1"
            >
              {error}
            </p>
          ) : helperText ? (
            <p id={`${inputId}-helper`} className="text-[12px] text-[var(--color-text-secondary)]">
              {helperText}
            </p>
          ) : (
            <span />
          )}
          {charCount && (
            <span className={cn("text-[12px] ml-2 shrink-0", charCountColor)}>
              {charCount.current}/{charCount.max}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";
