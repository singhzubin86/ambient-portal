import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "../ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "UI/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="w-[400px] p-6"><Story /></div>],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Partial: Story = { args: { value: 42, label: "42% spent" } };
export const Full: Story = { args: { value: 100, label: "Budget exhausted" } };
export const Empty: Story = { args: { value: 0, label: "0% spent" } };
