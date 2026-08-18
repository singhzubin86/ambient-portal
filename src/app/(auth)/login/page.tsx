"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Input, Banner } from "@/components/ui";
import { portalAuth, ApiError } from "@/lib/api/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "";
  const justVerified = searchParams.get("verified") === "true";
  const sessionExpired = searchParams.get("expired") === "true";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill email from URL if passed (e.g. after verify redirect)
    const emailParam = searchParams.get("email");
    if (emailParam) setForm((f) => ({ ...f, email: emailParam }));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!form.email || !form.password) {
      setFieldErrors({
        ...((!form.email) ? { email: "Email is required." } : {}),
        ...((!form.password) ? { password: "Password is required." } : {}),
      });
      return;
    }
    setLoading(true);
    try {
      const user = await portalAuth.login({ email: form.email.trim().toLowerCase(), password: form.password });
      // Redirect based on role
      const destination =
        nextPath && nextPath.startsWith("/") ? nextPath :
        user.role === "advertiser" ? "/advertiser/dashboard" :
        "/publisher/dashboard";
      window.location.href = destination;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Incorrect email or password.");
        } else if (err.status === 403 && err.code === "email_not_verified") {
          setError("Please verify your email before logging in. Check your inbox for the verification link.");
        } else if (err.status === 403 && err.code === "ACCOUNT_SUSPENDED") {
          setError("This account has been suspended. Contact support.");
        } else if (err.status === 429) {
          setError("Too many login attempts — please wait 15 minutes and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-8 shadow-sm">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)] mb-1">◈ Ambient</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">Sign in to your account</p>

        {justVerified && (
          <div className="mb-4">
            <Banner variant="success" message="Email verified — you can now log in." />
          </div>
        )}
        {sessionExpired && (
          <div className="mb-4">
            <Banner variant="warning" message="Your session expired. Please sign in again." />
          </div>
        )}

        {error && (
          <div role="alert" className="mb-4 px-3 py-2 rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-status-error)_10%,transparent)] border border-[var(--color-status-error)] text-[12px] text-[var(--color-status-error)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Email" type="email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={fieldErrors.email}
            autoComplete="email" required />
          <Input label="Password" type="password" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="current-password" required error={fieldErrors.password} />
          <Button type="submit" className="w-full" loading={loading}>Sign in →</Button>
        </form>
        <p className="text-[12px] text-center mt-4 text-[var(--color-text-secondary)]">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-[var(--color-brand-accent)] font-semibold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm">
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-8 shadow-sm animate-pulse h-64" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
