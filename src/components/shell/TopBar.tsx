"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ExternalLink, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  portalType: "advertiser" | "publisher";
  userName: string;
  hasBothRoles: boolean;
  onSwitchPortal?: (type: "advertiser" | "publisher") => void;
  onLogout?: () => void;
}

const dropdownContent =
  "min-w-[144px] bg-[var(--color-surface-card)] border border-[var(--color-border-default)] " +
  "rounded-[var(--radius-md)] p-1 z-30";

const dropdownItem =
  "flex items-center gap-2 px-3 py-2 text-[13px] rounded-[var(--radius-sm)] " +
  "cursor-pointer select-none outline-none " +
  "hover:bg-[var(--color-surface-hover)] focus:bg-[var(--color-surface-hover)] " +
  "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none";

export function TopBar({
  portalType,
  userName,
  hasBothRoles,
  onSwitchPortal,
  onLogout,
}: TopBarProps) {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 bg-[var(--color-surface-card)] z-20 relative"
      style={{ boxShadow: "var(--shadow-topbar)" }}
      role="banner"
    >
      {/* Logo + portal switcher */}
      <div className="flex items-center gap-4">
        <a href="/" aria-label="Ambient home" className="flex items-center gap-2">
          <span
            className="text-[17px] font-bold tracking-tight select-none"
            style={{ color: "var(--color-brand-primary)" }}
          >
            ◈ Ambient
          </span>
        </a>

        {hasBothRoles ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-[13px] font-semibold",
                  "border border-[var(--color-border-default)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer",
                  "text-[var(--color-text-primary)]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                )}
              >
                {portalType === "advertiser" ? "Advertiser" : "Publisher"}
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={4}
                align="start"
                className={dropdownContent}
                style={{ boxShadow: "var(--shadow-dropdown)" }}
              >
                {(["advertiser", "publisher"] as const).map((t) => (
                  <DropdownMenu.Item
                    key={t}
                    className={cn(
                      dropdownItem,
                      portalType === t
                        ? "font-semibold text-[var(--color-brand-accent)]"
                        : "text-[var(--color-text-primary)]"
                    )}
                    onSelect={() => onSwitchPortal?.(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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

        {/* Account dropdown — Radix DropdownMenu for keyboard/ARIA */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-[13px] font-semibold",
                "border border-[var(--color-border-default)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer",
                "text-[var(--color-text-primary)]",
                "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
              )}
            >
              {userName}
              <ChevronDown size={14} aria-hidden="true" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={4}
              align="end"
              className={dropdownContent}
              style={{ boxShadow: "var(--shadow-dropdown)", minWidth: "176px" }}
            >
              <DropdownMenu.Item asChild>
                <a
                  href={`/${portalType}/settings`}
                  className={cn(dropdownItem, "text-[var(--color-text-primary)]")}
                >
                  <Settings size={14} aria-hidden="true" /> Settings
                </a>
              </DropdownMenu.Item>
              <DropdownMenu.Separator
                className="my-1"
                style={{ height: "1px", backgroundColor: "var(--color-border-subtle)" }}
              />
              <DropdownMenu.Item
                className={cn(dropdownItem)}
                style={{ color: "var(--color-status-error)" }}
                onSelect={() => onLogout?.()}
              >
                <LogOut size={14} aria-hidden="true" /> Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </nav>
    </header>
  );
}
