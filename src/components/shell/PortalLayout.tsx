"use client";
import { type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth/useAuth";
import { portalAuth } from "@/lib/api/client";

interface PortalLayoutProps {
  portalType: "advertiser" | "publisher";
  /** Fallback display name — overridden by session if available */
  userName?: string;
  children: ReactNode;
}

export function PortalLayout({
  portalType,
  userName: userNameProp,
  children,
}: PortalLayoutProps) {
  const { user } = useAuth();

  // Use session first name; fall back to prop; fall back to "Account"
  const firstName = user?.full_name?.split(" ")[0]
    ?? userNameProp
    ?? "Account";

  // hasBothRoles only when role === "both"
  const hasBothRoles = user?.role === "both";

  async function handleLogout() {
    try {
      await portalAuth.logout();
    } finally {
      window.location.href = "/login";
    }
  }

  function handleSwitchPortal(type: "advertiser" | "publisher") {
    window.location.href = `/${type}/dashboard`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-page)]">
      <TopBar
        portalType={portalType}
        userName={firstName}
        hasBothRoles={hasBothRoles}
        onLogout={handleLogout}
        onSwitchPortal={handleSwitchPortal}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar portalType={portalType} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-8"
          tabIndex={-1}
        >
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
