import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", size: "md", children: "Create campaign" },
};
export const Secondary: Story = {
  args: { variant: "secondary", size: "md", children: "Export CSV" },
};
export const Ghost: Story = {
  args: { variant: "ghost", size: "md", children: "View all →" },
};
export const Danger: Story = {
  args: { variant: "danger", size: "md", children: "Delete campaign" },
};
export const Loading: Story = {
  args: { variant: "primary", size: "md", loading: true, children: "Saving" },
};
export const Disabled: Story = {
  args: { variant: "primary", size: "md", disabled: true, children: "Unavailable" },
};
export const Small: Story = {
  args: { variant: "primary", size: "sm", children: "New campaign" },
};
export const Large: Story = {
  args: { variant: "primary", size: "lg", children: "Get started" },
};
