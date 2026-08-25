"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Input, Select, Banner } from "@/components/ui";
import { portalAdvertisers, ApiError } from "@/lib/api/client";
import type { AdvertiserIndustry, AdvertiserBudgetBracket } from "@/types";

const INDUSTRY_OPTIONS: { value: AdvertiserIndustry; label: string }[] = [
  { value: "tech",       label: "Technology / SaaS" },
  { value: "retail",     label: "Retail & E-commerce" },
  { value: "cpg",        label: "CPG / Consumer Goods" },
  { value: "finance",    label: "Finance" },
  { value: "education",  label: "Education" },
  { value: "health",     label: "Health & Wellness" },
  { value: "other",      label: "Other" },
];

const BUDGET_OPTIONS: { value: AdvertiserBudgetBracket; label: string }[] = [
  { value: "lt_5k",   label: "Under $5,000 / month" },
  { value: "5k_25k",  label: "$5,000 – $25,000 / month" },
  { value: "gt_25k",  label: "Over $25,000 / month" },
];

interface FormState {
  company_website: string;
  industry: AdvertiserIndustry | "";
  monthly_budget_bracket: AdvertiserBudgetBracket | "";
  billing_contact_name: string;
  billing_email: string;
  company_address: string;
}

const INITIAL: FormState = {
  company_website: "",
  industry: "",
  monthly_budget_bracket: "",
  billing_contact_name: "",
  billing_email: "",
  company_address: "",
};

export default function AdvertiserOnboardPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.company_website.startsWith("https://") && !form.company_website.startsWith("http://"))
      e.company_website = "Enter a valid URL (https://...)";
    if (!form.industry) e.industry = "Select your industry";
    if (!form.monthly_budget_bracket) e.monthly_budget_bracket = "Select a budget range";
    if (!form.billing_contact_name.trim()) e.billing_contact_name = "Required";
    if (!form.billing_email.includes("@")) e.billing_email = "Enter a valid email";
    if (!form.company_address.trim()) e.company_address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await portalAdvertisers.onboard({
        company_website: form.company_website,
        industry: form.industry as AdvertiserIndustry,
        monthly_budget_bracket: form.monthly_budget_bracket as AdvertiserBudgetBracket,
        billing_contact_name: form.billing_contact_name,
        billing_email: form.billing_email,
        company_address: form.company_address,
      });
      router.push("/advertiser/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors as Record<string, string>);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout portalType="advertiser">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-tight">
            Set up your advertiser account
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            Tell us about your company so we can configure your account and billing.
          </p>
        </div>

        {serverError && (
          <Banner variant="error" message={serverError} />
        )}

        <div
          className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6 space-y-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Input
            label="Company website"
            placeholder="https://yourcompany.com"
            value={form.company_website}
            onChange={(e) => set("company_website", e.target.value)}
            error={errors.company_website}
          />

          <Select
            label="Industry"
            value={form.industry}
            onChange={(e) => set("industry", e.target.value as AdvertiserIndustry)}
            error={errors.industry}
          >
            <option value="">Select industry…</option>
            {INDUSTRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>

          <Select
            label="Monthly advertising budget"
            value={form.monthly_budget_bracket}
            onChange={(e) => set("monthly_budget_bracket", e.target.value as AdvertiserBudgetBracket)}
            error={errors.monthly_budget_bracket}
          >
            <option value="">Select budget range…</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>

          <div className="border-t border-[var(--color-border-subtle)] pt-4 space-y-4">
            <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Billing contact
            </p>
            <Input
              label="Contact name"
              placeholder="Jane Smith"
              value={form.billing_contact_name}
              onChange={(e) => set("billing_contact_name", e.target.value)}
              error={errors.billing_contact_name}
            />
            <Input
              label="Billing email"
              type="email"
              placeholder="billing@yourcompany.com"
              value={form.billing_email}
              onChange={(e) => set("billing_email", e.target.value)}
              error={errors.billing_email}
            />
            <Input
              label="Company address"
              placeholder="123 Main St, San Francisco, CA 94102"
              value={form.company_address}
              onChange={(e) => set("company_address", e.target.value)}
              error={errors.company_address}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : "Complete setup →"}
          </Button>
        </div>

        <p className="text-[11px] text-[var(--color-text-secondary)] text-center">
          By continuing you agree to Ambient&apos;s advertiser terms and billing policy.
          Campaigns will be reviewed for policy compliance before going live.
        </p>
      </div>
    </PortalLayout>
  );
}
