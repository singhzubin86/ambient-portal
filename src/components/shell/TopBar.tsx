"use client";
import { useState } from "react";
import { ChevronDown, ExternalLink, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  portalType: "advertiser" | "publisher";
  userName: string;
  hasBothRoles: boolean;
  onSwitchPortal?: (type: "advertiser" | "publisher") => void;
  onLogout?: () => void;
}

export function TopBar({
  portalType,
  userName,
  hasBothRoles,
  onSwitchPortal,
  onLogout,
}: TopBarProps) {
  const [portalOpen, setPortalOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b border-[var(--color-border-default)] bg-[var(--color-surface-card)] z-20 relative"
      role="banner"
    >
      {/* Logo + portal switcher */}
      <div className="flex items-center gap-4">
        <a href="/" aria-label="Ambient home" className="flex items-center gap-2 text-[var(--color-brand-primary)]">
          <span className="text-[18px] font-bold tracking-tight">◈ Ambient</span>
        </a>

        {hasBothRoles ? (
          <div className="relative">
            <button
              onClick={() => setPortalOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={portalOpen}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-[13px] font-semibold",
                "border border-[var(--color-border-default)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer",
                "text-[var(--color-text-primary)]"
              )}
            >
              {portalType === "advertiser" ? "Advertiser" : "Publisher"}
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            {portalOpen && (
              <ul
                role="listbox"
                className="absolute top-full left-0 mt-1 w-36 bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-md z-30"
              >
                {(["advertiser", "publisher"] as const).map((t) => (
                  <li key={t}>
                    <button
                      role="option"
                      aria-selected={portalType === t}
                      onClick={() => { onSwitchPortal?.(t); setPortalOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-[13px] capitalize hover:bg-[var(--color-surface-hover)] cursor-pointer",
                        portalType === t && "font-semibold text-[var(--color-brand-accent)]"
                      )}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <span className="text-[13px] font-semibold text-[var(--color-text-secondary)] capitalize">
            {portalType}
          </span>
        )}
      </div>

      {/* Right nav */}
      <nav className="flex items-center gap-2" aria-label="Top navigation">
        <a
          href="https://docs.ambient.example"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 h-8 px-3 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Docs <ExternalLink size={12} aria-hidden="true" />
        </a>
        <a
          href="mailto:support@ambient.example"
          className="h-8 px-3 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center"
        >
          Support
        </a>

        {/* Account dropdown */}
        <div className="relative">
          <button
            onClick={() => setAccountOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-[13px] font-semibold",
              "border border-[var(--color-border-default)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer",
              "text-[var(--color-text-primary)]"
            )}
          >
            {userName}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {accountOpen && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-1 w-44 bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-md z-30"
            >
              <a
                href={`/${portalType}/settings`}
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[var(--color-surface-hover)] cursor-pointer"
                onClick={() => setAccountOpen(false)}
              >
                <Settings size={14} aria-hidden="true" /> Settings
              </a>
              <div className="border-t border-[var(--color-border-subtle)] my-1" />
              <button
                role="menuitem"
                onClick={() => { onLogout?.(); setAccountOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[var(--color-status-error)] hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={14} aria-hidden="true" /> Log out
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
