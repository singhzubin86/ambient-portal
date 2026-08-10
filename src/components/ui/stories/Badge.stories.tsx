import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["active", "paused", "ended", "scheduled", "rejected", "degraded", "no-signal", "pending"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Active: Story = { args: { variant: "active" } };
export const Paused: Story = { args: { variant: "paused" } };
export const Ended: Story = { args: { variant: "ended" } };
export const Scheduled: Story = { args: { variant: "scheduled" } };
export const Rejected: Story = { args: { variant: "rejected" } };
export const Degraded: Story = { args: { variant: "degraded" } };
export const NoSignal: Story = { args: { variant: "no-signal" } };
export const PendingReview: Story = { args: { variant: "pending" } };

export const AllBadges: Story = {
  name: "All variants",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(["active","paused","ended","scheduled","rejected","degraded","no-signal","pending"] as const).map((v) => (
        <Badge key={v} variant={v} />
      ))}
    </div>
  ),
};
