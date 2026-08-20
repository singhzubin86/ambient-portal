"use client";
import { useState, useEffect } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Modal, Banner, CodeBlock, Skeleton } from "@/components/ui";
import { Copy, Check } from "lucide-react";
import { portalPublishers, ApiError } from "@/lib/api/client";

const SDK_SNIPPET = `# Install
npm install @ambient/sdk

# Initialize
import { Ambient } from '@ambient/sdk'
const ambient = new Ambient('YOUR_API_KEY')

# Request an ad
const ad = await ambient.getAd({
  context: ['AI tools', 'productivity']
})`;

export default function PublisherIntegrationPage() {
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Loaded from API on mount — shows masked key by default
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(true);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Set when regen succeeds — the full key shown once
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    portalPublishers.me()
      .then((pub) => {
        // api_key_masked comes from GET /v1/publishers/me
        setMaskedKey(pub.api_key_masked ?? `amb_live_...${pub.api_key_prefix?.slice(-4) ?? "xxxx"}`);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setKeyError("No publisher record found. Complete onboarding first.");
        } else {
          setKeyError("Failed to load API key. Refresh to try again.");
        }
      })
      .finally(() => setKeyLoading(false));
  }, []);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const result = await portalPublishers.regenerateKey();
      setNewKey(result.api_key);
      setMaskedKey(null); // clear masked — full key is now displayed
      setRegenOpen(false);
    } catch (err) {
      setKeyError(
        err instanceof ApiError ? err.message : "Key regeneration failed. Try again."
      );
      setRegenOpen(false);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleCopy() {
    const keyToCopy = newKey ?? maskedKey ?? "";
    if (!keyToCopy || keyToCopy.includes("...")) return; // don't copy a masked key
    await navigator.clipboard.writeText(keyToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayKey = newKey ?? maskedKey ?? "";
  const isFullKey = Boolean(newKey);

  return (
    <PortalLayout portalType="publisher">
      <div className="max-w-[680px] space-y-8">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Integration</h1>

        {/* API Key */}
        <section aria-labelledby="api-key-heading" className="space-y-3">
          <h2 id="api-key-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)]">API key</h2>

          {keyError && (
            <div role="alert" className="px-3 py-2 rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-status-error)_10%,transparent)] border border-[var(--color-status-error)] text-[12px] text-[var(--color-status-error)]">
              {keyError}
            </div>
          )}

          {keyLoading ? (
            <Skeleton className="h-12 rounded-[var(--radius-md)]" />
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] font-mono text-[13px] break-all">
              <code className="flex-1 text-[var(--color-text-primary)] select-all">{displayKey}</code>
              {isFullKey && (
                <button
                  onClick={handleCopy}
                  aria-label="Copy API key"
                  className="flex items-center gap-1.5 text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent-hover)] cursor-pointer text-[12px] font-semibold shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
              <button
                onClick={() => setRegenOpen(true)}
                className="flex items-center gap-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer text-[12px] font-semibold ml-1 shrink-0"
              >
                <RefreshCw size={14} /> Regenerate key
              </button>
            </div>
          )}

          {isFullKey && (
            <Banner variant="warning" message="New key shown once. Copy it now — this is the only time it will be displayed in full." />
          )}
          {!isFullKey && !keyLoading && !keyError && (
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              ⚠ Regenerating invalidates your current key immediately.
            </p>
          )}
        </section>

        {/* Integration guide */}
        <section aria-labelledby="guide-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="guide-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)]">Integration guide</h2>
            <a
              href="https://docs.ambient.example"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[13px] text-[var(--color-brand-accent)] hover:underline"
            >
              Docs <ExternalLink size={12} />
            </a>
          </div>
          <CodeBlock code={SDK_SNIPPET} language="javascript" />
        </section>

        <a
          href="https://docs.ambient.example"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-[var(--color-brand-accent)] hover:underline flex items-center gap-1"
        >
          View full docs <ExternalLink size={12} />
        </a>
      </div>

      <Modal
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        title="Regenerate API key?"
        confirmLabel="Yes, regenerate"
        onConfirm={handleRegenerate}
        confirmVariant="danger"
        confirmLoading={regenerating}
      >
        <p className="text-[13px]">
          This will invalidate your current key <strong>immediately</strong>. Any integrations using it will stop serving ads until updated with the new key. Continue?
        </p>
      </Modal>
    </PortalLayout>
  );
}
