"use client";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Input, Button } from "@/components/ui";
export default function AdvertiserSettingsPage() {
  return (
    <PortalLayout portalType="advertiser" >
      <div className="max-w-[480px] space-y-6">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Settings</h1>
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4">
          <h2 className="text-[15px] font-semibold">Account</h2>
          <Input label="Full name" defaultValue="Alex Johnson" />
          <Input label="Work email" type="email" defaultValue="alex@brand.com" />
          <Input label="Company name" defaultValue="Brand Co" />
        </div>
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4">
          <h2 className="text-[15px] font-semibold">Billing contact</h2>
          <Input label="Billing contact name" defaultValue="Alex Johnson" />
          <Input label="Billing email" type="email" defaultValue="billing@brand.com" />
          <Input label="Company address" defaultValue="123 Main St, New York, NY 10001" />
        </div>
        <Button>Save changes</Button>
      </div>
    </PortalLayout>
  );
}
