import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const ConfirmationDialog: Story = {
  name: "Confirmation (danger)",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button variant="danger" onClick={() => setOpen(true)}>Regenerate API key</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Regenerate API key?"
          confirmLabel="Yes, regenerate"
          confirmVariant="danger"
          onConfirm={() => setOpen(false)}
        >
          <p className="text-[13px] text-[var(--color-text-primary)]">
            This will invalidate your current key immediately. Any integrations using it will
            stop serving ads. Continue?
          </p>
        </Modal>
      </div>
    );
  },
};

export const InfoDialog: Story = {
  name: "Confirmation (primary)",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Pause campaign</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Pause campaign?"
          confirmLabel="Yes, pause"
          confirmVariant="primary"
          onConfirm={() => setOpen(false)}
        >
          <p className="text-[13px] text-[var(--color-text-primary)]">
            Pausing will stop impression delivery immediately. Your budget and targeting are saved.
            You can resume at any time.
          </p>
        </Modal>
      </div>
    );
  },
};
