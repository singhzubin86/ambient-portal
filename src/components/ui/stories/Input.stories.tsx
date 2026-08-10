import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: "Campaign name", placeholder: "e.g. Spring Promo 2026" },
};
export const WithHelperText: Story = {
  args: {
    label: "Headline",
    placeholder: "Max 60 characters",
    helperText: "Write a clear, direct headline. No click-bait.",
    charCount: { current: 12, max: 60 },
  },
};
export const ErrorState: Story = {
  args: {
    label: "Destination URL",
    placeholder: "https://",
    error: "Must be a valid HTTPS URL.",
    defaultValue: "not-a-url",
  },
};
export const Disabled: Story = {
  args: { label: "API key", defaultValue: "amb_live_xxxx...3f9a", disabled: true },
};
export const CharCountWarning: Story = {
  args: {
    label: "Body copy",
    placeholder: "Up to 120 characters",
    charCount: { current: 100, max: 120 },
  },
};
export const CharCountExceeded: Story = {
  args: {
    label: "Body copy",
    placeholder: "Up to 120 characters",
    charCount: { current: 125, max: 120 },
  },
};
