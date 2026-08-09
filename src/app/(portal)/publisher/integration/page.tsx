"use client";
import { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Button, Modal, Banner, CodeBlock } from "@/components/ui";
import { maskApiKey } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

const FULL_KEY = "amb_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0";
const MASKED_KEY = maskApiKey(FULL_KEY);

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
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 900)); // replace: publishers.regenerateKey()
    setNewKey("amb_live_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0");
    setRegenerating(false);
    setRegenOpen(false);
  }

  const displayKey = newKey ? newKey : MASKED_KEY;

  async function handleCopy() {
    await navigator.clipboard.writeText(newKey ?? FULL_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <PortalLayout portalType="publisher" userName="Sam">
      <div className="max-w-[680px] space-y-8">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Integration</h1>

        {/* API Key */}
        <section aria-labelledby="api-key-heading" className="space-y-3">
          <h2 id="api-key-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)]">API key</h2>
          <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)]">
            <code className="flex-1 font-mono text-[13px] text-[var(--color-text-primary)]">{displayKey}</code>
            <button onClick={handleCopy} aria-label="Copy API key"
              className="flex items-center gap-1.5 text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent-hover)] cursor-pointer text-[12px] font-semibold shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={() => setRegenOpen(true)}
              className="flex items-center gap-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer text-[12px] font-semibold ml-1 shrink-0">
              <RefreshCw size={14} /> Regenerate key
            </button>
          </div>
          {newKey && (
            <Banner variant="warning" message="New key shown once. Copy it now — this is the only time it will be displayed in full." />
          )}
          {!newKey && (
            <p className="text-[12px] text-[var(--color-text-secondary)]">⚠ Regenerating invalidates your current key immediately.</p>
          )}
        </section>

        {/* Integration guide */}
        <section aria-labelledby="guide-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="guide-heading" className="text-[15px] font-semibold text-[var(--color-text-primary)]">Integration guide</h2>
            <a href="https://docs.ambient.example" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[13px] text-[var(--color-brand-accent)] hover:underline">
              Docs <ExternalLink size={12} />
            </a>
          </div>
          <CodeBlock code={SDK_SNIPPET} language="javascript" />
        </section>

        {/* Status */}
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-semibold text-[var(--color-status-active)]">● Live</span>
          <Button variant="secondary" size="sm">Test integration</Button>
        </div>

        <a href="https://docs.ambient.example" target="_blank" rel="noopener noreferrer"
          className="text-[13px] text-[var(--color-brand-accent)] hover:underline flex items-center gap-1">
          View full docs <ExternalLink size={12} />
        </a>
      </div>

      <Modal open={regenOpen} onClose={() => setRegenOpen(false)}
        title="Regenerate API key?"
        confirmLabel="Yes, regenerate" onConfirm={handleRegenerate}
        confirmVariant="danger" confirmLoading={regenerating}>
        <p className="text-[13px]">
          This will invalidate your current key <strong>immediately</strong>. Any integrations using it will stop serving ads until updated with the new key. Continue?
        </p>
      </Modal>
    </PortalLayout>
  );
}
