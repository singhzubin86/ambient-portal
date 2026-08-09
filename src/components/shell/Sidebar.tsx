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
      className="w-56 shrink-0 bg-[var(--color-surface-sidebar)] flex flex-col pt-4 pb-6 border-r border-transparent"
    >
      <nav>
        <ul role="list" className="space-y-0.5 px-2">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 h-10 px-4 rounded-[var(--radius-md)] text-[13px] transition-colors",
                    active
                      ? "border-l-[3px] border-[var(--color-brand-accent)] text-[var(--color-brand-accent)] bg-[var(--color-surface-card)] font-semibold pl-[13px]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
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
