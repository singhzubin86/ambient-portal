import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded bg-[var(--color-surface-hover)]",
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-6 bg-[var(--color-surface-card)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <Skeleton className="h-8 w-28 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 3, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
