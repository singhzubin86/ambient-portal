import type { Meta, StoryObj } from "@storybook/react";
import { Banner } from "../Banner";

const meta: Meta<typeof Banner> = {
  title: "UI/Banner",
  component: Banner,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="w-[560px]"><Story /></div>],
  argTypes: {
    variant: { control: "select", options: ["info", "warning", "error", "success"] },
  },
};
export default meta;
type Story = StoryObj<typeof Banner>;

export const Info: Story = {
  args: { variant: "info", message: "Your campaign is under review and will go live within 24 hours." },
};
export const Warning: Story = {
  args: {
    variant: "warning",
    message: "Your integration hasn't sent any events.",
    action: { label: "View guide", onClick: () => {} },
  },
};
export const Error: Story = {
  args: {
    variant: "error",
    message: "Failed to load reporting data. Please try again.",
    action: { label: "Retry", onClick: () => {} },
  },
};
export const Success: Story = {
  args: {
    variant: "success",
    message: "Campaign submitted successfully. You'll receive an email once it's reviewed.",
  },
};
