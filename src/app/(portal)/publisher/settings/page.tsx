"use client";
import { PortalLayout } from "@/components/shell/PortalLayout";
import { Input, Button } from "@/components/ui";
export default function PublisherSettingsPage() {
  return (
    <PortalLayout portalType="publisher" userName="Sam">
      <div className="max-w-[480px] space-y-6">
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Settings</h1>
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4">
          <h2 className="text-[15px] font-semibold">Account</h2>
          <Input label="Full name" defaultValue="Sam Publisher" />
          <Input label="Work email" type="email" defaultValue="sam@myapp.com" />
          <Input label="Company name" defaultValue="My App Co" />
        </div>
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 space-y-4">
          <h2 className="text-[15px] font-semibold">Payout contact</h2>
          <Input label="Payout contact name" defaultValue="Sam Publisher" />
          <Input label="Payout email" type="email" defaultValue="billing@myapp.com" />
        </div>
        <Button>Save changes</Button>
      </div>
    </PortalLayout>
  );
}
