import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a large number with commas */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Format a ratio as a percentage string */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format a date to YYYY-MM-DD */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

/** Mask an API key: show first 12 and last 4 chars */
export function maskApiKey(key: string): string {
  if (key.length <= 16) return key;
  const prefix = key.slice(0, 12);
  const suffix = key.slice(-4);
  return `${prefix}...${suffix}`;
}

/** Estimate impressions from budget and CPM */
export function estimateImpressions(budgetUsd: number, cpmUsd: number): number {
  if (cpmUsd <= 0) return 0;
  return Math.floor((budgetUsd / cpmUsd) * 1000);
}
