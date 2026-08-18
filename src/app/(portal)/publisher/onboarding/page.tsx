"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Input, Select, Banner } from "@/components/ui";
import { Copy, Check, Key } from "lucide-react";
import {
  portalPublishers,
  OnboardPayload,
  AppCategory,
  MauRange,
  IntegrationType,
  ApiError,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/useAuth";

type Step = "setup" | "key";

export default function PublisherOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("setup");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [appName, setAppName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    app_name: "", app_url: "", app_category: "" as AppCategory | "",
    mau_range: "" as MauRange | "", integration_type: "" as IntegrationType | "",
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.app_name.trim()) e.app_name = "App name is required.";
    if (!form.app_url.startsWith("https://")) e.app_url = "Enter a valid https:// URL.";
    if (!form.app_category) e.app_category = "Select a category.";
    if (!form.mau_range) e.mau_range = "Select an MAU range.";
    if (!form.integration_type) e.integration_type = "Select an integration type.";
    return e;
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const payload: OnboardPayload = {
        app_name: form.app_name.trim(),
        app_url: form.app_url.trim(),
        app_category: form.app_category as AppCategory,
        mau_range: form.mau_range as MauRange,
        integration_type: form.integration_type as IntegrationType,
      };
      const result = await portalPublishers.create(payload);
      setApiKey(result.api_key ?? "");
      setAppName(result.app_name);
      setStep("key");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(err.errors).map(([k, v]) => [k, String(v)])
            )
          );
        } else if (err.status === 409) {
          // Already onboarded — go straight to dashboard
          router.push("/publisher/dashboard");
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

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayName = user?.full_name?.split(" ")[0] ?? "there";

  if (step === "key") {
    return (
      <PortalLayout portalType="publisher" userName={displayName}>
        <div className="max-w-[560px] space-y-6">
          <div className="flex items-center justify-between text-[12px] text-[var(--color-text-secondary)]">
            <span>Publisher setup</span><span>2 / 2</span>
          </div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Your integration is ready</h1>
          <div className="space-y-2">
            <p className="text-[13px] text-[var(--color-status-active)] font-semibold">✓ Account created</p>
            <p className="text-[13px] text-[var(--color-status-active)] font-semibold">✓ App registered: {appName}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide flex items-center gap-1.5">
              <Key size={12} />Your API key
            </p>
            <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] font-mono text-[13px] break-all">
              <span className="flex-1 text-[var(--color-text-primary)] select-all">{apiKey}</span>
              <button onClick={handleCopy} aria-label="Copy API key"
                className="flex items-center gap-1.5 text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent-hover)] cursor-pointer text-[12px] font-semibold shrink-0">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy key"}
              </button>
            </div>
            <Banner variant="warning" message="This key is shown once. Copy it now and store it securely. If you lose it, you can regenerate it from the Integration page." />
          </div>

          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">Next step: Integrate the SDK</p>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/publisher/integration")}>View integration guide →</Button>
            <Button variant="secondary" onClick={() => router.push("/publisher/dashboard")}>Go to dashboard</Button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout portalType="publisher" userName={displayName}>
      <div className="max-w-[560px] space-y-6">
        <div className="flex items-center justify-between text-[12px] text-[var(--color-text-secondary)]">
          <span>Publisher setup</span><span>1 / 2</span>
        </div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Tell us about your app</h1>

        {serverError && (
          <div role="alert" className="px-3 py-2 rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-status-error)_10%,transparent)] border border-[var(--color-status-error)] text-[12px] text-[var(--color-status-error)]">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSetup} noValidate className="space-y-4">
          <Input label="App name" placeholder="My AI Assistant" value={form.app_name}
            onChange={(e) => setForm((f) => ({ ...f, app_name: e.target.value }))} error={errors.app_name} required />
          <Input label="App URL or store link" type="url" placeholder="https://myapp.com" value={form.app_url}
            onChange={(e) => setForm((f) => ({ ...f, app_url: e.target.value }))} error={errors.app_url} required />

          <Select label="App category" value={form.app_category}
            onChange={(e) => setForm((f) => ({ ...f, app_category: e.target.value as AppCategory }))} error={errors.app_category} required>
            <option value="">Select category…</option>
            <option value="custom_gpt">Custom GPT</option>
            <option value="standalone_chatbot">Standalone chatbot</option>
            <option value="voice_ai">Voice AI</option>
            <option value="rag_app">RAG app</option>
            <option value="other">Other</option>
          </Select>

          <Select label="Estimated monthly active users" value={form.mau_range}
            onChange={(e) => setForm((f) => ({ ...f, mau_range: e.target.value as MauRange }))} error={errors.mau_range} required>
            <option value="">Select range…</option>
            <option value="lt1k">Less than 1K</option>
            <option value="1k_10k">1K – 10K</option>
            <option value="10k_100k">10K – 100K</option>
            <option value="100k_plus">100K+</option>
          </Select>

          <fieldset>
            <legend className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Integration type</legend>
            <div className="space-y-2">
              {[
                { value: "standalone_web_chatbot", label: "Standalone web chatbot (SDK)" },
                { value: "other", label: "Other / not sure" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-[13px]">
                  <input type="radio" name="integration_type" value={opt.value}
                    checked={form.integration_type === opt.value}
                    onChange={() => setForm((f) => ({ ...f, integration_type: opt.value as IntegrationType }))}
                    className="accent-[var(--color-brand-accent)] w-4 h-4" />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.integration_type && <p role="alert" className="text-[12px] text-[var(--color-status-error)] mt-1">{errors.integration_type}</p>}
          </fieldset>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Back</Button>
            <Button type="submit" loading={loading}>Continue →</Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
