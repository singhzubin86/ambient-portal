"use client";
import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Input, Button, Banner, Skeleton } from "@/components/ui";
import { portalAuth, portalAdvertisers, ApiError } from "@/lib/api/client";

interface Fields {
  // Account (from /api/auth/me)
  full_name: string;
  email: string;
  company_name: string;
  // Advertiser profile (from /api/advertisers/me)
  company_website: string;
  billing_contact_name: string;
  billing_email: string;
  company_address: string;
}

const EMPTY: Fields = {
  full_name: "", email: "", company_name: "",
  company_website: "", billing_contact_name: "", billing_email: "", company_address: "",
};

export default function AdvertiserSettingsPage() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      portalAuth.me(),
      portalAdvertisers.me().catch((err: unknown) => {
        // 404 = not onboarded yet — leave advertiser fields blank, still show form
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }),
    ])
      .then(([me, adv]) => {
        setFields({
          full_name:            me.full_name ?? "",
          email:                me.email ?? "",
          company_name:         me.company_name ?? "",
          company_website:      adv?.company_website ?? "",
          billing_contact_name: adv?.billing_contact_name ?? "",
          billing_email:        adv?.billing_email ?? "",
          company_address:      adv?.company_address ?? "",
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load account details.");
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Fields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setFieldErrors({});
    setError(null);
    setSuccess(false);

    // Validate required advertiser fields before hitting the API
    const fe: Record<string, string> = {};
    if (fields.company_website && !fields.company_website.startsWith("http")) {
      fe.company_website = "Must be a valid URL (https://...)";
    }
    if (fields.billing_email && !fields.billing_email.includes("@")) {
      fe.billing_email = "Must be a valid email";
    }
    if (Object.keys(fe).length) { setFieldErrors(fe); return; }

    setSaving(true);
    try {
      // portalAdvertisers.onboard is an upsert — safe to call on update
      if (fields.company_website || fields.billing_contact_name || fields.billing_email || fields.company_address) {
        await portalAdvertisers.onboard({
          company_website:      fields.company_website,
          industry:             "other", // preserved from existing record via upsert
          monthly_budget_bracket: "lt_5k", // preserved from existing record via upsert
          billing_contact_name: fields.billing_contact_name,
          billing_email:        fields.billing_email,
          company_address:      fields.company_address,
        });
      }
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setError(err instanceof Error ? err.message : "Save failed — please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout portalType="advertiser">
      <div className="max-w-[480px] space-y-6">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Settings</h1>

        {success && (
          <Banner variant="success" message="Changes saved." />
        )}
        {error && (
          <Banner variant="error" message={error} />
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] rounded-[var(--radius-lg)]" />
            <Skeleton className="h-[200px] rounded-[var(--radius-lg)]" />
          </div>
        ) : (
          <>
            {/* Account section — identity fields from auth/me (read-only) */}
            <div
              className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Account</h2>
              <Input
                label="Full name"
                value={fields.full_name}
                readOnly
                helperText="Contact support to update your name."
              />
              <Input
                label="Work email"
                type="email"
                value={fields.email}
                readOnly
                helperText="Contact support to update your email."
              />
              <Input
                label="Company name"
                value={fields.company_name}
                readOnly
                helperText="Contact support to update your company name."
              />
            </div>

            {/* Billing contact — editable via advertiser upsert */}
            <div
              className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Billing contact</h2>
              <Input
                label="Company website"
                value={fields.company_website}
                onChange={(e) => set("company_website", e.target.value)}
                error={fieldErrors.company_website}
                placeholder="https://yourcompany.com"
              />
              <Input
                label="Billing contact name"
                value={fields.billing_contact_name}
                onChange={(e) => set("billing_contact_name", e.target.value)}
                error={fieldErrors.billing_contact_name}
                placeholder="Jane Smith"
              />
              <Input
                label="Billing email"
                type="email"
                value={fields.billing_email}
                onChange={(e) => set("billing_email", e.target.value)}
                error={fieldErrors.billing_email}
                placeholder="billing@yourcompany.com"
              />
              <Input
                label="Company address"
                value={fields.company_address}
                onChange={(e) => set("company_address", e.target.value)}
                error={fieldErrors.company_address}
                placeholder="123 Main St, San Francisco, CA 94102"
              />
            </div>

            <Button onClick={handleSave} loading={saving}>
              Save changes
            </Button>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
