import type { Meta, StoryObj } from "@storybook/react";
import { WizardProgress } from "../WizardProgress";

const meta: Meta<typeof WizardProgress> = {
  title: "UI/WizardProgress",
  component: WizardProgress,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="w-[560px] p-8 bg-[var(--color-surface-page)]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof WizardProgress>;

const steps = ["Creative", "Targeting", "Budget", "Review"];

export const Step1: Story = { args: { steps, currentStep: 0 } };
export const Step2: Story = { args: { steps, currentStep: 1 } };
export const Step3: Story = { args: { steps, currentStep: 2 } };
export const Step4Review: Story = { name: "Step 4 — Review", args: { steps, currentStep: 3 } };
