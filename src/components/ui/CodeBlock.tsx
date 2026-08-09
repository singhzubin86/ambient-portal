"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative rounded-[var(--radius-lg)] overflow-hidden",
        "bg-[var(--color-brand-primary)]",
        className
      )}
    >
      {language && (
        <div className="px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] border-b border-white/10">
          {language}
        </div>
      )}
      <pre className="p-6 overflow-x-auto text-[13px] font-mono text-[#E5E7EB] leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        aria-label="Copy code to clipboard"
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[#9CA3AF] hover:bg-white/10 cursor-pointer transition-colors"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
