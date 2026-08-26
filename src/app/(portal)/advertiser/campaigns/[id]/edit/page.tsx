"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Input, Banner, Skeleton } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { portalAdvertiserCampaigns, ApiError } from "@/lib/api/client";
import type { AdvertiserCampaign } from "@/types";

interface EditForm {
  name: string;
  headline: string;
  body: string;
  cta_text: string;
  destination_url: string;
  image_url: string;
  keyword_input: string;
  keywords: string[];
  end_date: string;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)]">
        <span className="text-[13px] text-[var(--color-text-primary)] font-medium">{value}</span>
        <span className="ml-auto text-[11px] font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded px-1.5 py-0.5">
          Locked
        </span>
      </div>
      <p className="text-[11px] text-[var(--color-text-secondary)]">
        This field cannot be changed after campaign creation.
      </p>
    </div>
  );
}

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<AdvertiserCampaign | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    portalAdvertiserCampaigns
      .get(id)
      .then((c) => {
        setCampaign(c);
        setForm({
          name: c.name,
          headline: c.headline,
          body: c.body,
          cta_text: c.cta_text ?? "",
          destination_url: c.destination_url,
          image_url: c.image_url ?? "",
          keyword_input: "",
          keywords: c.keywords ?? [],
          end_date: c.end_date,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setLoadError("Campaign not found.");
        } else {
          setLoadError("Failed to load campaign. Please refresh.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof EditForm>(key: K, value: EditForm[K]) =>
    setForm((f) => f ? { ...f, [key]: value } : f);

  function validate(): Record<string, string> {
    if (!form || !campaign) return {};
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Campaign name is required.";
    if (!form.headline.trim()) e.headline = "Headline is required.";
    if (form.headline.length > 60) e.headline = "Headline must be 60 characters or fewer.";
    if (!form.body.trim()) e.body = "Body copy is required.";
    if (form.body.length > 150) e.body = "Body copy must be 150 characters or fewer.";
    if (!form.cta_text.trim()) e.cta_text = "CTA label is required.";
    if (form.cta_text.length > 28) e.cta_text = "CTA label must be 28 characters or fewer.";
    if (!form.destination_url.startsWith("https://"))
      e.destination_url = "Destination URL must start with https://.";
    if (form.image_url && !form.image_url.startsWith("https://"))
      e.image_url = "Image URL must start with https://.";
    if (form.image_url && form.image_url.length > 2048)
      e.image_url = "Image URL must be 2048 characters or fewer.";
    if (!form.end_date) e.end_date = "End date is required.";
    if (form.end_date && form.end_date < campaign.end_date)
      e.end_date = `End date cannot be moved earlier than the current end date (${campaign.end_date}).`;
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!form || !campaign) return;

    setSubmitting(true);
    setErrors({});
    try {
      await portalAdvertiserCampaigns.update(id, {
        name: form.name,
        headline: form.headline,
        body: form.body,
        cta_text: form.cta_text || undefined,
        destination_url: form.destination_url,
        image_url: form.image_url || undefined,
        keywords: form.keywords.length > 0 ? form.keywords : undefined,
        end_date: form.end_date,
      });
      router.push(`/advertiser/campaigns/${id}?updated=1`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors as Record<string, string>);
      } else {
        setErrors({ _server: err instanceof Error ? err.message : "Save failed. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <PortalLayout portalType="advertiser">
        <div className="max-w-[640px] space-y-6">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-24 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </PortalLayout>
    );
  }

  if (loadError || !form || !campaign) {
    return (
      <PortalLayout portalType="advertiser">
        <Banner variant="error" message={loadError ?? "Campaign not found."} />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout portalType="advertiser">
      <div className="max-w-[640px]">
        {/* Breadcrumb */}
        <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">
          <a href="/advertiser/campaigns" className="hover:underline">Campaigns</a>
          {" / "}
          <a href={`/advertiser/campaigns/${id}`} className="hover:underline">{campaign.name}</a>
          {" / "}
          <span className="text-[var(--color-text-primary)]">Edit</span>
        </p>

        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)] mb-2">
          Edit campaign
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-8">
          Some fields are locked after campaign creation. You can update creative, targeting keywords, end date, and image.
        </p>

        {errors._server && (
          <div className="mb-6">
            <Banner variant="error" message={errors._server} />
          </div>
        )}

        <div className="space-y-8">
          {/* ── Locked fields (read-only display) ── */}
          <section className="space-y-4">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-[var(--color-border-subtle)] pb-2">
              Campaign settings — locked
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <ReadOnlyField label="Total budget" value={formatCurrency(campaign.total_budget_usd)} />
              <ReadOnlyField label="CPM bid"       value={formatCurrency(campaign.cpm_usd)} />
            </div>
            <ReadOnlyField label="Start date" value={campaign.start_date} />
          </section>

          {/* ── Editable: Campaign identity ── */}
          <section className="space-y-4">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-[var(--color-border-subtle)] pb-2">
              Campaign name
            </h2>
            <Input
              label="Campaign name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              required
            />
          </section>

          {/* ── Editable: Creative ── */}
          <section className="space-y-4">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-[var(--color-border-subtle)] pb-2">
              Ad creative
            </h2>

            <Input
              label="Headline"
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              error={errors.headline}
              charCount={{ current: form.headline.length, max: 60 }}
              maxLength={60}
              required
            />

            <div>
              <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                Body copy
              </label>
              <div className="mt-1">
                <textarea
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  rows={3}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[13px] bg-[var(--color-surface-input)] resize-vertical min-h-[80px] focus:border-[var(--color-border-focus)] focus:outline-none"
                  aria-invalid={!!errors.body}
                />
                <div className="flex justify-between">
                  {errors.body
                    ? <p role="alert" className="text-[12px] text-[var(--color-status-error)]">{errors.body}</p>
                    : <span />}
                  <span className={`text-[12px] ${form.body.length > 120 ? "text-[var(--color-status-warning)]" : "text-[var(--color-text-secondary)]"} ${form.body.length > 150 ? "text-[var(--color-status-error)]" : ""}`}>
                    {form.body.length}/150
                  </span>
                </div>
              </div>
            </div>

            <Input
              label="CTA button label"
              value={form.cta_text}
              onChange={(e) => set("cta_text", e.target.value)}
              error={errors.cta_text}
              charCount={{ current: form.cta_text.length, max: 28 }}
              maxLength={28}
              required
            />

            <Input
              label="Destination URL"
              type="url"
              value={form.destination_url}
              onChange={(e) => set("destination_url", e.target.value)}
              error={errors.destination_url}
              required
            />

            <Input
              label="Product image URL (optional)"
              type="url"
              placeholder="https://example.com/product-image.jpg"
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              error={errors.image_url}
              helperText="Displayed as the hero image in the ad card. Recommended: 16:9, min 300×200px."
              maxLength={2048}
            />

            {/* Live creative preview */}
            {(form.headline || form.body) && (
              <div>
                <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Preview</p>
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-ad)] overflow-hidden">
                  {form.image_url && (
                    <div className="w-full aspect-video bg-[var(--color-surface-hover)] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image_url}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="flex items-center px-3 pt-2 pb-1">
                    <span className="text-[11px] font-semibold text-[var(--color-disclosure-text)]">◈ Sponsored</span>
                  </div>
                  <div className="border-t border-[var(--color-border-subtle)]" />
                  <div className="px-4 py-3 space-y-1">
                    {form.headline && <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{form.headline}</p>}
                    {form.body && <p className="text-[13px] text-[var(--color-text-primary)]">{form.body}</p>}
                    {form.cta_text && (
                      <div className="pt-1">
                        <span className="inline-block bg-[var(--color-cta-primary)] text-white text-[13px] font-semibold px-4 py-2 rounded-[var(--radius-md)]">
                          {form.cta_text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Editable: Keywords ── */}
          <section className="space-y-4">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-[var(--color-border-subtle)] pb-2">
              Keywords
            </h2>
            <div>
              <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-2">
                Keywords (optional — up to 20)
              </label>
              <div className="flex gap-2">
                <input
                  value={form.keyword_input}
                  onChange={(e) => set("keyword_input", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form.keyword_input.trim() && form.keywords.length < 20) {
                      e.preventDefault();
                      set("keywords", [...form.keywords, form.keyword_input.trim()]);
                      set("keyword_input", "");
                    }
                  }}
                  placeholder="Add keyword…"
                  className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[13px] focus:border-[var(--color-border-focus)] focus:outline-none"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (form.keyword_input.trim() && form.keywords.length < 20) {
                      set("keywords", [...form.keywords, form.keyword_input.trim()]);
                      set("keyword_input", "");
                    }
                  }}
                >
                  + Add
                </Button>
              </div>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.keywords.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-surface-hover)] text-[12px] font-medium text-[var(--color-text-primary)]"
                    >
                      {k}
                      <button
                        type="button"
                        onClick={() => set("keywords", form.keywords.filter((x) => x !== k))}
                        aria-label={`Remove keyword ${k}`}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-status-error)] ml-0.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Editable: Schedule ── */}
          <section className="space-y-4">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide border-b border-[var(--color-border-subtle)] pb-2">
              Schedule
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <ReadOnlyField label="Start date" value={campaign.start_date} />
              <Input
                label="End date"
                type="date"
                value={form.end_date}
                min={campaign.end_date}
                onChange={(e) => set("end_date", e.target.value)}
                error={errors.end_date}
                helperText={`Current end date: ${campaign.end_date}. Can only be extended.`}
                required
              />
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between mt-10 pt-6 border-t border-[var(--color-border-subtle)]">
          <Button variant="ghost" onClick={() => router.push(`/advertiser/campaigns/${id}`)}>
            ← Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Save changes
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
}
