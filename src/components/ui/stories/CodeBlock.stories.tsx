import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "../CodeBlock";

const meta: Meta<typeof CodeBlock> = {
  title: "UI/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="w-[560px]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const SDKInstall: Story = {
  args: {
    language: "bash",
    code: `npm install @ambient/sdk`,
  },
};
export const SDKInit: Story = {
  args: {
    language: "typescript",
    code: `import { Ambient } from '@ambient/sdk';
const ambient = new Ambient('YOUR_API_KEY');

const ad = await ambient.getAd({
  context: ['AI tools', 'productivity'],
});`,
  },
};
