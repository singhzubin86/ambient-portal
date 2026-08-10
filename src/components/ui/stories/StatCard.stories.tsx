import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "../StatCard";
import { StatCardSkeleton } from "../Skeleton";

const meta: Meta<typeof StatCard> = {
  title: "UI/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="w-[200px] bg-[var(--color-surface-page)] p-4"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Impressions: Story = {
  args: { label: "Impressions", value: "175,000" },
};
export const Spend: Story = {
  args: { label: "Total spend (30d)", value: "$9,120" },
};
export const CTR: Story = {
  args: { label: "Avg CTR (30d)", value: "1.8%" },
};
export const ActiveCampaigns: Story = {
  args: { label: "Active campaigns", value: "2" },
};
export const Loading: Story = {
  name: "Skeleton (loading)",
  render: () => <div className="w-[200px]"><StatCardSkeleton /></div>,
};

export const GridLayout: Story = {
  name: "Grid — 3 across",
  render: () => (
    <div
      className="grid gap-4 bg-[var(--color-surface-page)] p-6"
      style={{ gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", width: "640px" }}
    >
      <StatCard label="Active campaigns" value="2" />
      <StatCard label="Total spend (30d)" value="$9,120" />
      <StatCard label="Avg CTR (30d)" value="1.8%" />
    </div>
  ),
};
