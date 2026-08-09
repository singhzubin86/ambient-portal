import { cn } from "@/lib/utils";

interface WizardProgressProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <nav aria-label="Campaign creation steps">
      <ol className="flex items-center gap-0">
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={step} className="flex items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-colors",
                    completed || active
                      ? "bg-[var(--color-brand-accent)] border-[var(--color-brand-accent)]"
                      : "bg-white border-[var(--color-border-default)]"
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] mt-1 font-semibold whitespace-nowrap",
                    active
                      ? "text-[var(--color-text-primary)]"
                      : completed
                      ? "text-[var(--color-brand-accent)]"
                      : "text-[var(--color-text-secondary)]"
                  )}
                >
                  {step}
                </span>
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-16 mx-1 mb-4",
                    completed
                      ? "bg-[var(--color-brand-accent)]"
                      : "border-t-2 border-dashed border-[var(--color-border-default)]"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
