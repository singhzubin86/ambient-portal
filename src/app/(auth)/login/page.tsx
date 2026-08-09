"use client";
import { useState } from "react";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      window.location.href = "/advertiser/dashboard";
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-8 shadow-sm">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)] mb-1">◈ Ambient</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Email" type="email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="email" required />
          <Input label="Password" type="password" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="current-password" required error={error} />
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
