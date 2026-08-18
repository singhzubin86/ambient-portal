"use client";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { portalAuth, ApiError, PortalRole } from "@/lib/api/client";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    full_name: "", email: "", company_name: "",
    password: "", confirm_password: "", role: "" as PortalRole | "",
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required.";
    if (!form.email.includes("@")) e.email = "Enter a valid work email address.";
    const consumerDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
    const domain = form.email.split("@")[1]?.toLowerCase();
    if (domain && consumerDomains.includes(domain)) e.email = "Please use a work email address.";
    if (!form.company_name.trim()) e.company_name = "Company name is required.";
    if (form.password.length < 12) e.password = "Password must be at least 12 characters.";
    if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match.";
    if (!form.role) e.role = "Please select a role.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      await portalAuth.signup({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        company_name: form.company_name.trim(),
        password: form.password,
        role: form.role as PortalRole,
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(err.errors).map(([k, v]) => [k, String(v)])
            )
          );
        } else if (err.status === 409) {
          setErrors({ email: "An account with this email already exists." });
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await portalAuth.resendVerification(form.email);
    } finally {
      setResending(false);
      setResent(true);
    }
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-[40px] mb-2">📬</div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Check your email</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          We sent a verification link to<br />
          <strong className="text-[var(--color-text-primary)]">{form.email}</strong>
        </p>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          {resent ? (
            <span className="text-[12px] text-[var(--color-status-active)] font-semibold">Email resent ✓</span>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleResend} loading={resending}>
              Resend email
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => { setSubmitted(false); setResent(false); }}>
            Change email
          </Button>
        </div>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Already verified?{" "}
          <a href="/login" className="text-[var(--color-brand-accent)] font-semibold hover:underline">Log in</a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-8 shadow-sm">
        <div className="mb-6 text-right text-[12px] text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <a href="/login" className="text-[var(--color-brand-accent)] font-semibold hover:underline">Log in</a>
        </div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)] mb-1">Create your Ambient account</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">Advertising where attention actually is.</p>

        {serverError && (
          <div role="alert" className="mb-4 px-3 py-2 rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-status-error)_10%,transparent)] border border-[var(--color-status-error)] text-[12px] text-[var(--color-status-error)]">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Full name" placeholder="Alex Johnson" value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            error={errors.full_name} autoComplete="name" required />
          <Input label="Work email" type="email" placeholder="alex@company.com" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email} autoComplete="email" required />
          <Input label="Company name" placeholder="Acme Corp" value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            error={errors.company_name} autoComplete="organization" required />
          <Input label="Password" type="password" placeholder="12+ characters" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password} autoComplete="new-password" required />
          <Input label="Confirm password" type="password" value={form.confirm_password}
            onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
            error={errors.confirm_password} autoComplete="new-password" required />
          <fieldset>
            <legend className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">I am a…</legend>
            <div className="flex gap-4">
              {(["publisher", "advertiser", "both"] as PortalRole[]).map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer text-[13px]">
                  <input type="radio" name="role" value={r} checked={form.role === r}
                    onChange={() => setForm((f) => ({ ...f, role: r }))}
                    className="accent-[var(--color-brand-accent)] w-4 h-4" />
                  <span className="capitalize">{r === "both" ? "Both" : r}</span>
                </label>
              ))}
            </div>
            {errors.role && <p role="alert" className="text-[12px] text-[var(--color-status-error)] mt-1">{errors.role}</p>}
          </fieldset>
          <Button type="submit" variant="primary" className="w-full mt-2" loading={loading}>
            Create account →
          </Button>
          <p className="text-[11px] text-[var(--color-text-secondary)] text-center">
            By creating an account you agree to our{" "}
            <a href="/terms" className="underline">Terms of Service</a> and{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
