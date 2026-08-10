import type { Meta, StoryObj } from "@storybook/react";
import { DataTable, type Column } from "../DataTable";
import { Badge } from "../Badge";

interface Row {
  name: string;
  status: string;
  spend: string;
  ctr: string;
  end: string;
}

const columns: Column<Row>[] = [
  {
    key: "name", header: "Campaign name",
    render: (r) => (
      <span className="text-[var(--color-brand-accent)] font-medium">{r.name}</span>
    ),
  },
  {
    key: "status", header: "Status",
    render: (r) => <Badge variant={r.status as import("../Badge").BadgeVariant} />,
  },
  { key: "spend", header: "Spend", align: "right" },
  { key: "ctr", header: "CTR", align: "right" },
  { key: "end", header: "End date", align: "right" },
];

const rows: Row[] = [
  { name: "Spring Promo", status: "active", spend: "$2,100", ctr: "2.1%", end: "2026-09-30" },
  { name: "Brand Awareness", status: "paused", spend: "$2,130", ctr: "0.9%", end: "2026-10-15" },
  { name: "Q2 Test", status: "ended", spend: "$4,890", ctr: "0.9%", end: "2026-07-30" },
];

const meta: Meta<typeof DataTable> = {
  title: "UI/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="w-[760px] bg-[var(--color-surface-page)] p-6"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof DataTable>;

export const WithData: Story = {
  render: () => <DataTable columns={columns} rows={rows} />,
};
export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={[]}
      emptyMessage="You haven't created any campaigns yet."
    />
  ),
};
