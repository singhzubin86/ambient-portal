"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Megaphone, BarChart2, Settings, Zap, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const advertiserNav: NavItem[] = [
  { label: "Dashboard",  href: "/advertiser/dashboard",  icon: LayoutDashboard },
  { label: "Campaigns",  href: "/advertiser/campaigns",  icon: Megaphone },
  { label: "Reporting",  href: "/advertiser/reporting",  icon: BarChart2 },
  { label: "Settings",   href: "/advertiser/settings",   icon: Settings },
];

const publisherNav: NavItem[] = [
  { label: "Dashboard",   href: "/publisher/dashboard",   icon: LayoutDashboard },
  { label: "Integration", href: "/publisher/integration", icon: Zap },
  { label: "Reporting",   href: "/publisher/reporting",   icon: BarChart2 },
  { label: "Settings",    href: "/publisher/settings",    icon: Settings },
];

interface SidebarProps {
  portalType: "advertiser" | "publisher";
}

export function Sidebar({ portalType }: SidebarProps) {
  const pathname = usePathname();
  const items = portalType === "advertiser" ? advertiserNav : publisherNav;

  return (
    <aside
      aria-label={`${portalType} navigation`}
      className="w-56 shrink-0 flex flex-col pt-4 pb-6"
      style={{ backgroundColor: "var(--color-surface-sidebar)" }}
    >
      <nav>
        <ul role="list" className="space-y-0.5 px-3">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 h-10 px-3 rounded-[var(--radius-md)] text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[var(--color-brand-accent)] text-white font-semibold"
                      : "hover:bg-[var(--color-surface-sidebar-hover)]"
                  )}
                  style={
                    active
                      ? undefined
                      : { color: "var(--color-text-sidebar)" }
                  }
                >
                  <Icon size={16} aria-hidden="true" className={active ? "text-white" : ""} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
