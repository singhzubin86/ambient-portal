import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "../Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Shell/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="flex h-screen"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Advertiser: Story = { args: { portalType: "advertiser" } };
export const Publisher: Story = { args: { portalType: "publisher" } };
