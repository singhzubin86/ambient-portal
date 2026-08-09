import { type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

interface PortalLayoutProps {
  portalType: "advertiser" | "publisher";
  userName: string;
  hasBothRoles?: boolean;
  children: ReactNode;
}

export function PortalLayout({
  portalType,
  userName,
  hasBothRoles = false,
  children,
}: PortalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-page)]">
      <TopBar
        portalType={portalType}
        userName={userName}
        hasBothRoles={hasBothRoles}
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
