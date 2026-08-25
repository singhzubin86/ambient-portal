"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Input, Select, Banner, WizardProgress } from "@/components/ui";
import { estimateImpressions, formatNumber, formatCurrency } from "@/lib/utils";
import { portalAdvertiserCampaigns, ApiError } from "@/lib/api/client";
import { BLOCKED_CATEGORIES, CONDITIONAL_CATEGORIES, LEGAL_SERVICES_CATEGORY } from "@/types";
import type { AdvertiserCategory } from "@/types";

const STEPS = ["Creative", "Targeting", "Budget", "Review"];

const ALL_TOPICS = [
  "Technology", "Software & SaaS", "Finance", "Health", "Travel",
  "E-commerce", "Education", "Entertainment", "Food & Beverage",
  "Productivity", "Marketing", "Other",
];

const ADVERTISER_CATEGORIES: { value: AdvertiserCategory; label: string; blocked?: boolean; conditional?: boolean }[] = [
  { value: "tech",          label: "Technology" },
  { value: "retail",        label: "Retail" },
  { value: "cpg",           label: "CPG / Consumer Goods" },
  { value: "travel",        label: "Travel" },
  { value: "education",     label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "productivity",  label: "Productivity" },
  { value: "marketing",     label: "Marketing" },
  { value: "finance",       label: "Finance", conditional: true },
  { value: "legal_services",label: "Legal Services", conditional: true },
  { value: "healthcare",    label: "Healthcare", conditional: true },
  { value: "other",         label: "Other" },
  // Blocked — shown with note, cannot proceed
  { value: "pharma_rx" as AdvertiserCategory,  label: "Pharma / Prescription (not accepted)", blocked: true },
  { value: "gambling" as AdvertiserCategory,   label: "Gambling (not accepted)", blocked: true },
  { value: "cannabis" as AdvertiserCategory,   label: "Cannabis (not accepted)", blocked: true },
  { value: "political" as AdvertiserCategory,  label: "Political advertising (not accepted)", blocked: true },
  { value: "adult" as AdvertiserCategory,      label: "Adult content (not accepted)", blocked: true },
  { value: "securities" as AdvertiserCategory, label: "Securities / Crypto (not accepted)", blocked: true },
];

interface FormState {
  // Step 1 — Creative
  campaign_name: string;
  headline: string;
  body: string;
  cta_text: string;
  destination_url: string;
  advertiser_category: AdvertiserCategory | "";
  // Step 2 — Targeting
  topics: string[];
  keywords: string[];
  keyword_input: string;
  excluded_topics: string[];
  // Step 3 — Budget
  total_budget: string;
  cpm: string;
  daily_cap: string;
  start_date: string;
  end_date: string;
  // Step 4 — Review
  legal_self_certification: boolean;
}

const INITIAL: FormState = {
  campaign_name: "", headline: "", body: "", cta_text: "", destination_url: "",
  advertiser_category: "",
  topics: [], keywords: [], keyword_input: "", excluded_topics: [],
  total_budget: "5000", cpm: "12.00", daily_cap: "",
  start_date: "", end_date: "",
  legal_self_certification: false,
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isBlocked = form.advertiser_category
    ? BLOCKED_CATEGORIES.has(form.advertiser_category as any)
    : false;
  const isConditional = form.advertiser_category
    ? CONDITIONAL_CATEGORIES.has(form.advertiser_category as AdvertiserCategory)
    : false;
  const isLegal = form.advertiser_category === LEGAL_SERVICES_CATEGORY;

  // ── Validation per step ──
  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.campaign_name.trim()) e.campaign_name = "Campaign name is required.";
      if (!form.advertiser_category) e.advertiser_category = "Please select a category.";
      if (isBlocked) e.advertiser_category = "This category is not accepted on Ambient.";
      if (!form.headline.trim()) e.headline = "Headline is required.";
      if (form.headline.length > 60) e.headline = "Headline must be 60 characters or fewer.";
      if (!form.body.trim()) e.body = "Body copy is required.";
      if (form.body.length > 120) e.body = "Body copy must be 120 characters or fewer.";
      if (!form.cta_text.trim()) e.cta_text = "CTA label is required.";
      if (form.cta_text.length > 28) e.cta_text = "CTA label must be 28 characters or fewer.";
      if (!form.destination_url.startsWith("https://")) e.destination_url = "Destination URL must start with https://.";
    }
    if (s === 1) {
      if (form.topics.length === 0) e.topics = "Select at least one topic.";
    }
    if (s === 2) {
      const budget = parseFloat(form.total_budget);
      if (isNaN(budget) || budget < 5000) e.total_budget = "Minimum budget is $5,000.";
      const cpm = parseFloat(form.cpm);
      if (isNaN(cpm) || cpm <= 0) e.cpm = "Enter a valid CPM.";
      if (!form.start_date) e.start_date = "Start date is required.";
      if (!form.end_date) e.end_date = "End date is required.";
      if (form.start_date && form.end_date && form.end_date <= form.start_date)
        e.end_date = "End date must be after start date.";
    }
    if (s === 3 && isLegal) {
      if (!form.legal_self_certification)
        e.legal_self_certification = "You must certify compliance before submitting.";
    }
    return e;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  }

  function handleBack() { setErrors({}); setStep((s) => s - 1); window.scrollTo(0, 0); }

  async function handleSubmit() {
    const errs = validateStep(3);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const result = await portalAdvertiserCampaigns.create({
        name: form.campaign_name,
        headline: form.headline,
        body: form.body,
        cta_text: form.cta_text || undefined,
        destination_url: form.destination_url,
        keywords: form.keywords.length > 0 ? form.keywords : undefined,
        topics: form.topics.length > 0 ? form.topics : undefined,
        total_budget_usd: parseFloat(form.total_budget),
        cpm_usd: parseFloat(form.cpm),
        daily_cap_usd: form.daily_cap ? parseFloat(form.daily_cap) : undefined,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      router.push(`/advertiser/campaigns/${result.campaign_id}?created=1`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        // Surface per-field errors — navigate to relevant step
        setErrors(err.errors as Record<string, string>);
        // Heuristic: go to step where first error field lives
        const firstField = Object.keys(err.errors)[0] ?? "";
        if (["headline", "body", "cta_text", "destination_url", "campaign_name"].includes(firstField)) setStep(0);
        else if (["keywords", "topics"].includes(firstField)) setStep(1);
        else if (["total_budget_usd", "cpm_usd", "daily_cap_usd", "start_date", "end_date"].includes(firstField)) setStep(2);
      } else {
        setErrors({ _server: err instanceof Error ? err.message : "Submission failed. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const budget = parseFloat(form.total_budget) || 0;
  const cpm = parseFloat(form.cpm) || 0;
  const estimatedImpressions = estimateImpressions(budget, cpm);

  return (
    <PortalLayout portalType="advertiser" >
      <div className="max-w-[640px]">
        {/* Breadcrumb */}
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">
          <a href="/advertiser/campaigns" className="hover:underline">Campaigns</a>
          {" / "}
          <span className="text-[var(--color-text-primary)]">New campaign</span>
        </p>

        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)] mb-6">Create a new campaign</h1>

        <div className="mb-8">
          <WizardProgress steps={STEPS} currentStep={step} />
        </div>

        {/* ── Step 0: Creative ── */}
        {step === 0 && (
          <div className="space-y-5">
            <Input label="Campaign name" placeholder="My Campaign" value={form.campaign_name}
              onChange={(e) => set("campaign_name", e.target.value)} error={errors.campaign_name} required />

            <Select label="Advertiser category" value={form.advertiser_category}
              onChange={(e) => set("advertiser_category", e.target.value as AdvertiserCategory)}
              error={errors.advertiser_category} required>
              <option value="">Select category…</option>
              {ADVERTISER_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} disabled={c.blocked}>{c.label}</option>
              ))}
            </Select>

            {isBlocked && (
              <Banner variant="error"
                message="This advertiser category is not accepted on Ambient. Please select a different category or contact support." />
            )}
            {isConditional && !isBlocked && (
              <Banner variant="warning"
                message={`${isLegal ? "Legal services" : "This category"} campaigns require manual compliance review before activation. Your campaign will enter a "Pending Review" state after submission — typically reviewed within 1 business day.`} />
            )}

            <div className="pt-2 border-t border-[var(--color-border-subtle)]">
              <p className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-4">Ad creative</p>

              <div className="space-y-4">
                <Input label="Headline" placeholder="Try Ambient — ads that fit the conversation"
                  value={form.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  error={errors.headline}
                  charCount={{ current: form.headline.length, max: 60 }}
                  maxLength={60} required />

                <div>
                  <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Body copy
                  </label>
                  <div className="mt-1">
                    <textarea
                      value={form.body}
                      onChange={(e) => set("body", e.target.value)}
                      placeholder="Reach engaged users in AI chat — no interruptions."
                      rows={3}
                      maxLength={120}
                      className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[13px] bg-[var(--color-surface-input)] resize-vertical min-h-[80px] focus:border-[var(--color-border-focus)] focus:outline-none"
                      aria-invalid={!!errors.body}
                    />
                    <div className="flex justify-between">
                      {errors.body
                        ? <p role="alert" className="text-[12px] text-[var(--color-status-error)]">{errors.body}</p>
                        : <span />}
                      <span className={`text-[12px] ${form.body.length > 96 ? "text-[var(--color-status-warning)]" : "text-[var(--color-text-secondary)]"} ${form.body.length > 120 ? "text-[var(--color-status-error)]" : ""}`}>
                        {form.body.length}/120
                      </span>
                    </div>
                  </div>
                </div>

                <Input label="CTA button label" placeholder="Learn More"
                  value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)}
                  error={errors.cta_text}
                  charCount={{ current: form.cta_text.length, max: 28 }} maxLength={28} required />

                <Input label="Destination URL" type="url" placeholder="https://brand.com/landing"
                  value={form.destination_url} onChange={(e) => set("destination_url", e.target.value)}
                  error={errors.destination_url} required />
              </div>
            </div>

            {/* Live preview */}
            {(form.headline || form.body) && (
              <div>
                <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Preview</p>
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-ad)]">
                  <div className="flex items-center px-3 pt-2 pb-1">
                    <span className="text-[11px] font-semibold text-[var(--color-disclosure-text)]">◈ Sponsored</span>
                  </div>
                  <div className="border-t border-[var(--color-border-subtle)]" />
                  <div className="px-4 py-3 space-y-1">
                    {form.headline && <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{form.headline}</p>}
                    {form.body && <p className="text-[13px] text-[var(--color-text-primary)]">{form.body}</p>}
                    {form.cta_text && (
                      <div className="pt-1">
                        <span className="inline-block bg-[var(--color-cta-primary)] text-white text-[13px] font-semibold px-4 py-2 rounded-[var(--radius-md)]">{form.cta_text}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">⚠ Preview shown for reference. Actual rendering varies by publisher.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Targeting ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-1">
                Your ad appears when conversations match these topics and keywords.
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                No user data is used — all targeting is contextual only.
              </p>
            </div>

            <fieldset>
              <legend className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                Topics (select all that apply)
              </legend>
              <div className="flex flex-wrap gap-2">
                {ALL_TOPICS.map((t) => {
                  const active = form.topics.includes(t);
                  return (
                    <button key={t} type="button"
                      onClick={() => set("topics", active ? form.topics.filter((x) => x !== t) : [...form.topics, t])}
                      aria-pressed={active}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors cursor-pointer ${
                        active
                          ? "bg-[var(--color-brand-accent)] text-white border-[var(--color-brand-accent)]"
                          : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]"
                      }`}
                    >{t}</button>
                  );
                })}
              </div>
              {errors.topics && <p role="alert" className="text-[12px] text-[var(--color-status-error)] mt-2">{errors.topics}</p>}
            </fieldset>

            <div>
              <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-2">
                Keywords (optional — up to 20)
              </label>
              <div className="flex gap-2">
                <input value={form.keyword_input}
                  onChange={(e) => set("keyword_input", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form.keyword_input.trim() && form.keywords.length < 20) {
                      e.preventDefault();
                      set("keywords", [...form.keywords, form.keyword_input.trim()]);
                      set("keyword_input", "");
                    }
                  }}
                  placeholder="Add keyword…"
                  className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[13px] focus:border-[var(--color-border-focus)] focus:outline-none" />
                <Button variant="secondary" size="sm"
                  onClick={() => {
                    if (form.keyword_input.trim() && form.keywords.length < 20) {
                      set("keywords", [...form.keywords, form.keyword_input.trim()]);
                      set("keyword_input", "");
                    }
                  }}>+ Add</Button>
              </div>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.keywords.map((k) => (
                    <span key={k} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-surface-hover)] text-[12px] font-medium text-[var(--color-text-primary)]">
                      {k}
                      <button type="button" onClick={() => set("keywords", form.keywords.filter((x) => x !== k))}
                        aria-label={`Remove keyword ${k}`}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-status-error)] ml-0.5 cursor-pointer">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Banner variant="info"
              message="Contextual targeting only. Ambient does not use behavioral data, user profiles, or cross-site tracking." />
          </div>
        )}

        {/* ── Step 2: Budget & Schedule ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Total campaign budget (USD)" type="number" min={5000} step={100}
                value={form.total_budget} onChange={(e) => set("total_budget", e.target.value)}
                error={errors.total_budget} helperText="Minimum: $5,000" required />
              <Input label="CPM bid (USD)" type="number" min={1} step={0.5}
                value={form.cpm} onChange={(e) => set("cpm", e.target.value)}
                error={errors.cpm} helperText="Suggested: $8–$20" required />
            </div>

            {budget > 0 && cpm > 0 && (
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Estimated reach: <strong className="text-[var(--color-text-primary)]">{formatNumber(estimatedImpressions)} impressions</strong>
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Start date" type="date" value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)} error={errors.start_date} required />
              <Input label="End date" type="date" value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)} error={errors.end_date} required />
            </div>

            <Input label="Daily budget cap (optional, USD)" type="number" min={0} step={50}
              value={form.daily_cap} onChange={(e) => set("daily_cap", e.target.value)}
              helperText="Prevents your full budget from spending in a single day." />

            <Banner variant="info"
              message="No payment method required at this step. Ambient invoices monthly for beta campaigns. A team member will contact you to confirm." />
          </div>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">Review your campaign</h2>

            {isConditional && (
              <Banner variant="warning"
                message={`This campaign will enter "Pending compliance review" after submission — typically reviewed within 1 business day.`} />
            )}

            {errors._server && (
              <Banner variant="error" message={errors._server} />
            )}

            {/* Creative summary */}
            <div className="border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Creative</p>
                <button type="button" onClick={() => { setStep(0); setErrors({}); }}
                  className="text-[13px] text-[var(--color-brand-accent)] hover:underline cursor-pointer flex items-center gap-1">
                  ✎ Edit
                </button>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-ad)]">
                <div className="px-3 pt-2 pb-1"><span className="text-[11px] font-semibold text-[var(--color-disclosure-text)]">◈ Sponsored</span></div>
                <div className="border-t border-[var(--color-border-subtle)]" />
                <div className="px-4 py-3 space-y-1">
                  <p className="text-[15px] font-semibold">{form.headline}</p>
                  <p className="text-[13px]">{form.body}</p>
                  <div className="pt-1"><span className="inline-block bg-[var(--color-cta-primary)] text-white text-[13px] font-semibold px-4 py-2 rounded-[var(--radius-md)]">{form.cta_text}</span></div>
                </div>
              </div>
              <p className="text-[12px] text-[var(--color-text-secondary)]">Category: {form.advertiser_category}</p>
            </div>

            {/* Targeting summary */}
            <div className="border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Targeting</p>
                <button type="button" onClick={() => { setStep(1); setErrors({}); }}
                  className="text-[13px] text-[var(--color-brand-accent)] hover:underline cursor-pointer">✎ Edit</button>
              </div>
              <p className="text-[13px] text-[var(--color-text-primary)]">Topics: {form.topics.join(", ") || "—"}</p>
              {form.keywords.length > 0 && (
                <p className="text-[13px] text-[var(--color-text-secondary)]">Keywords: {form.keywords.join(", ")}</p>
              )}
            </div>

            {/* Budget summary */}
            <div className="border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-5 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Budget & Schedule</p>
                <button type="button" onClick={() => { setStep(2); setErrors({}); }}
                  className="text-[13px] text-[var(--color-brand-accent)] hover:underline cursor-pointer">✎ Edit</button>
              </div>
              <p className="text-[13px]">Budget: <strong>{formatCurrency(budget)}</strong> · CPM: <strong>{formatCurrency(cpm)}</strong></p>
              {form.daily_cap && <p className="text-[13px] text-[var(--color-text-secondary)]">Daily cap: {formatCurrency(parseFloat(form.daily_cap))}</p>}
              <p className="text-[13px] text-[var(--color-text-secondary)]">Flight: {form.start_date} → {form.end_date}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">Estimated impressions: ~{formatNumber(estimatedImpressions)}</p>
            </div>

            {/* Legal self-certification — required for legal_services category */}
            {isLegal && (
              <div className="border border-[var(--color-status-warning)] rounded-[var(--radius-lg)] p-5 bg-amber-50">
                <p className="text-[13px] font-semibold text-amber-800 mb-3">Legal services certification required</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox"
                    checked={form.legal_self_certification}
                    onChange={(e) => set("legal_self_certification", e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[var(--color-brand-accent)] shrink-0"
                    aria-describedby="legal-cert-desc"
                    required />
                  <span id="legal-cert-desc" className="text-[13px] text-amber-900">
                    I certify this creative complies with applicable state bar advertising rules.
                  </span>
                </label>
                {errors.legal_self_certification && (
                  <p role="alert" className="text-[12px] text-[var(--color-status-error)] mt-2">{errors.legal_self_certification}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
          {step > 0
            ? <Button variant="ghost" onClick={handleBack}>← Back</Button>
            : <Button variant="ghost" onClick={() => router.push("/advertiser/campaigns")}>Cancel</Button>
          }
          {step < 3
            ? <Button onClick={handleNext} disabled={isBlocked}>Next: {STEPS[step + 1]} →</Button>
            : <Button onClick={handleSubmit} loading={submitting}>
                {isConditional ? "Submit for review" : "Submit campaign"}
              </Button>
          }
        </div>
      </div>
    </PortalLayout>
  );
}
