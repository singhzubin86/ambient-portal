import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, StatCardSkeleton, TableSkeleton } from "../Skeleton";

const meta: Meta = {
  title: "UI/Skeleton",
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const InlineBlock: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};
export const StatCard: Story = {
  name: "StatCard skeleton",
  render: () => (
    <div className="w-[200px] bg-[var(--color-surface-page)] p-4">
      <StatCardSkeleton />
    </div>
  ),
};
export const Table: Story = {
  name: "Table skeleton (3 rows × 4 cols)",
  render: () => (
    <div className="w-[640px] bg-[var(--color-surface-page)] p-6">
      <TableSkeleton rows={3} cols={4} />
    </div>
  ),
};
