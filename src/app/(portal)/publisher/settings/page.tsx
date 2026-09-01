"use client";
import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Input, Button, Banner, Skeleton } from "@/components/ui";
import { portalAuth, portalPublishers, ApiError } from "@/lib/api/client";

interface Fields {
  // Account (from /api/auth/me) — read-only
  full_name: string;
  email: string;
  company_name: string;
  // Publisher profile (from /api/publishers/me) — editable
  // Note: publishers.name == publishers.app_name (same value); contact_email == login email.
  // There are no separate payout_contact_name / payout_email columns yet — those come later
  // with billing/Stripe work. Only app_name and app_url are editable here.
  app_name: string;
  app_url: string;
}

const EMPTY: Fields = {
  full_name: "", email: "", company_name: "",
  app_name: "", app_url: "",
};

export default function PublisherSettingsPage() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      portalAuth.me(),
      portalPublishers.me().catch((err: unknown) => {
        // 404 = not onboarded yet — leave publisher fields blank, still show form
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }),
    ])
      .then(([me, pub]) => {
        setFields({
          full_name:    me.full_name ?? "",
          email:        me.email ?? "",
          company_name: me.company_name ?? "",
          app_name:     pub?.app_name ?? "",
          app_url:      pub?.app_url ?? "",
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

    // Client-side validation
    const fe: Record<string, string> = {};
    if (fields.app_url && !fields.app_url.startsWith("http")) {
      fe.app_url = "Must be a valid URL (https://...)";
    }
    if (Object.keys(fe).length) { setFieldErrors(fe); return; }

    setSaving(true);
    try {
      await portalPublishers.update({
        app_name: fields.app_name || undefined,
        app_url:  fields.app_url || undefined,
      });
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
    <PortalLayout portalType="publisher">
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

            {/* App details — editable */}
            <div
              className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">App details</h2>
              <Input
                label="App name"
                value={fields.app_name}
                onChange={(e) => set("app_name", e.target.value)}
                error={fieldErrors.app_name}
                placeholder="My AI App"
              />
              <Input
                label="App URL"
                value={fields.app_url}
                onChange={(e) => set("app_url", e.target.value)}
                error={fieldErrors.app_url}
                placeholder="https://myapp.com"
              />
            </div>

            {/* Payout contact section deferred: payout_contact_name / payout_email columns
                do not exist in the DB yet. Will be added with billing/Stripe work. */}

            <Button onClick={handleSave} loading={saving}>
              Save changes
            </Button>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
