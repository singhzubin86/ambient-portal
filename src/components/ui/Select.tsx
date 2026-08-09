import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full h-10 px-3 rounded-[var(--radius-sm)] border text-[13px] appearance-none",
            "bg-[var(--color-surface-input)] text-[var(--color-text-primary)]",
            "border-[var(--color-border-default)]",
            "focus:border-[var(--color-border-focus)] focus:outline-none",
            "disabled:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed",
            error && "border-[var(--color-border-error)]",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p role="alert" className="text-[12px] text-[var(--color-status-error)]">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-[12px] text-[var(--color-text-secondary)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
