import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  rows,
  onRowClick,
  emptyMessage = "No data available.",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-default)]", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr
            style={{ backgroundColor: "var(--color-surface-page)" }}
          >
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className={cn(
                  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]",
                  "border-b border-[var(--color-border-default)]",
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-[13px] text-[var(--color-text-secondary)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "min-h-[48px] border-b border-[var(--color-border-subtle)] last:border-b-0",
                  "bg-[var(--color-surface-card)]",
                  "hover:bg-[var(--color-surface-hover)] transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 text-[13px] text-[var(--color-text-primary)]",
                      col.align === "right" ? "text-right tabular-nums" : col.align === "center" ? "text-center" : "text-left"
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
