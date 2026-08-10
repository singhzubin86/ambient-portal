import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "../Select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Select>;

export const DateRange: Story = {
  render: () => (
    <Select label="Date range" defaultValue="30d">
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="all">All time</option>
    </Select>
  ),
};
export const WithError: Story = {
  render: () => (
    <Select label="Advertiser category" error="Please select a category.">
      <option value="">Select…</option>
      <option value="tech">Technology</option>
      <option value="retail">Retail</option>
    </Select>
  ),
};
