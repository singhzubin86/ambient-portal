"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

// ---------------------------------------------------------------
// Types — mirror the Core API ad response shape
// ---------------------------------------------------------------
export interface AdObject {
  ad_id: string;
  /** Non-nullable. "Sponsored" or "Ad". Absent/null = malformed → suppress. */
  disclosure_label: string | null | undefined;
  /** "prepend" = label above content; "surround" = label wraps entire unit */
  disclosure_placement: "prepend" | "surround";
  headline: string;
  body: string;
  cta_text: string;
  cta_url: string;
  click_token: string;
  advertiser_name?: string;
  /** Optional product/brand image. Rendered at 16:9 above the disclosure label.
   *  Any source aspect ratio is clipped to fit — never distorted. */
  image_url?: string | null;
}

interface AdUnitProps {
  /** Pass null while loading; pass false to indicate no fill; pass AdObject when ready */
  ad: AdObject | null | false;
  /** Called when the user clicks the CTA — fires the click tracking token */
  onClickTracked?: (token: string) => void;
  /** Visual treatment publisher has chosen — default: bold */
  disclosureTreatment?: "bold" | "background" | "border";
  className?: string;
}

// ---------------------------------------------------------------
// Tooltip component (inline, accessible)
// ---------------------------------------------------------------
function ContextualTooltip({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Why am I seeing this ad?"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="ml-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-help"
      >
        <Info size={12} aria-hidden="true" />
      </button>
      {visible && (
        <span
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10",
            "bg-[var(--color-brand-primary)] text-white text-[11px] rounded-[var(--radius-md)]",
            "px-3 py-1.5 whitespace-nowrap shadow-lg pointer-events-none"
          )}
        >
          {children}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-brand-primary)]" />
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------
// Disclosure header — renders from field, never hardcoded
// ---------------------------------------------------------------
function DisclosureHeader({
  label,
  treatment,
  onDismiss,
  dismissed,
}: {
  label: string;
  treatment: "bold" | "background" | "border";
  onDismiss: () => void;
  dismissed: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 pt-1 pb-1 min-h-[24px]",
        treatment === "background" && "bg-[#E0E0FF] rounded-t-[var(--radius-lg)]",
        treatment === "border" && "border-b border-[var(--color-border-default)]"
      )}
    >
      <span
        className={cn(
          "text-[11px] text-[var(--color-disclosure-text)] leading-tight flex items-center gap-0.5",
          // Bold treatment is the reference implementation default
          (treatment === "bold" || treatment === "background" || treatment === "border") && "font-semibold"
        )}
      >
        ◈ {label}
        <ContextualTooltip>Contextually matched — no personal data used</ContextualTooltip>
      </span>
      {/* Dismiss control: label stays visible; creative collapses */}
      {!dismissed && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss this ad"
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded cursor-pointer",
            "text-[var(--color-text-secondary)] hover:bg-black/10 transition-colors",
            "min-w-[44px] min-h-[44px]" // WCAG touch target
          )}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Main AdUnit component
// ---------------------------------------------------------------
export function AdUnit({
  ad,
  onClickTracked,
  disclosureTreatment = "bold",
  className,
}: AdUnitProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showCreative, setShowCreative] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset dismiss state when a new ad arrives
  useEffect(() => {
    if (ad) {
      setDismissed(false);
      setShowCreative(true);
    }
  }, [ad]);

  // ---- LOADING STATE ----
  // Container + disclosure zone mount immediately; skeleton fills content area.
  // This ensures label-first rule: "Sponsored" is visible before any ad copy resolves.
  if (ad === null) {
    return (
      <div
        className={cn(
          "rounded-[var(--radius-lg)] border border-[var(--color-border-default)]",
          "bg-[var(--color-surface-ad)] overflow-hidden",
          className
        )}
        aria-busy="true"
        aria-label="Ad loading"
      >
        {/* Zone A: disclosure header as soon as container mounts */}
        <div className="flex items-center px-2 pt-1 pb-1 min-h-[24px]">
          <span className="text-[11px] font-semibold text-[var(--color-disclosure-text)] flex items-center gap-0.5">
            ◈ <Skeleton className="h-3 w-16 inline-block ml-1" />
          </span>
        </div>
        <div className="border-t border-[var(--color-border-subtle)]" />
        {/* Zone B+C: skeleton */}
        <div className="px-4 py-3 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-8 w-24 mt-2" />
        </div>
      </div>
    );
  }

  // ---- NO FILL ----
  if (ad === false) return null;

  // ---- FAIL CLOSED: disclosure_label absent or null → suppress entire unit ----
  if (!ad.disclosure_label) return null;

  // ---- DISMISSED STATE: label stays visible, creative collapsed ----
  if (dismissed) {
    return (
      <div
        className={cn(
          "rounded-[var(--radius-lg)] border border-[var(--color-border-default)]",
          "bg-[var(--color-surface-ad)] px-2 py-1",
          className
        )}
        aria-label="Ad dismissed"
      >
        <span className="text-[11px] font-semibold text-[var(--color-disclosure-text)]">
          ◈ {ad.disclosure_label}
        </span>
        <span className="text-[11px] text-[var(--color-text-secondary)] ml-2">
          Ad dismissed.
        </span>
      </div>
    );
  }

  const handleDismiss = () => {
    // Show label briefly before full collapse so it never disappears simultaneously with creative
    setShowCreative(false);
    setTimeout(() => setDismissed(true), 400);
  };

  const handleCtaClick = () => {
    onClickTracked?.(ad.click_token);
    window.open(ad.cta_url, "_blank", "noopener,noreferrer");
  };

  // ---- FULL AD UNIT ----
  const content = (
    <>
      {/* Product image — above disclosure label, clipped to 16:9, never distorted */}
      {ad.image_url && (
        <div className="w-full aspect-video overflow-hidden bg-[var(--color-surface-hover)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image_url}
            alt={ad.headline}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Zone A — Disclosure header. Always first visible text. Always from API field. */}
      <DisclosureHeader
        label={ad.disclosure_label}
        treatment={disclosureTreatment}
        onDismiss={handleDismiss}
        dismissed={dismissed}
      />
      <div className="border-t border-[var(--color-border-subtle)]" aria-hidden="true" />

      {/* Zone B+C — Creative (collapses on dismiss before label disappears) */}
      <div
        className={cn(
          "px-4 py-3 transition-all duration-300",
          !showCreative && "opacity-0 max-h-0 overflow-hidden py-0"
        )}
      >
        {/* Zone B */}
        {ad.advertiser_name && (
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-1">
            {ad.advertiser_name}
          </p>
        )}
        {/* Headline: heading-sm weight, but never h1–h3 to avoid dominating conversation */}
        <p className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-snug mb-1">
          {ad.headline}
        </p>
        {/* Body: plain text only, no markdown */}
        <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed mb-3 whitespace-pre-wrap">
          {ad.body}
        </p>

        {/* Zone C — CTA */}
        <button
          type="button"
          onClick={handleCtaClick}
          className={cn(
            "inline-flex items-center justify-center rounded-[var(--radius-md)]",
            "bg-[var(--color-cta-primary)] text-white text-[13px] font-semibold",
            "px-5 py-2.5 hover:bg-[var(--color-cta-primary-hover)] transition-colors",
            "min-w-[44px] min-h-[44px]" // WCAG 2.5.5 touch target
          )}
        >
          {ad.cta_text}
        </button>
      </div>
    </>
  );

  // disclosure_placement: "surround" wraps the entire unit with an explicit border
  return (
    <div
      ref={containerRef}
      role="complementary"
      aria-label="Sponsored content"
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border-default)]",
        "bg-[var(--color-surface-ad)] overflow-hidden",
        ad.disclosure_placement === "surround" && "ring-2 ring-[var(--color-brand-accent)] ring-opacity-30",
        className
      )}
    >
      {content}
    </div>
  );
}
