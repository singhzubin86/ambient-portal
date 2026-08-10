"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: "primary" | "danger";
  confirmLoading?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  confirmVariant = "primary",
  confirmLoading = false,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/40"
          aria-hidden="true"
        />
        {/* Panel */}
        <Dialog.Content
          className={cn(
            "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-[480px] mx-4 bg-[var(--color-surface-card)]",
            "rounded-[var(--radius-xl)] shadow-xl",
            "focus:outline-none",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-default)]">
            <Dialog.Title className="text-[18px] font-semibold text-[var(--color-text-primary)]">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close dialog"
                className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-6 py-5 text-[13px] text-[var(--color-text-primary)]">
            {children}
          </div>

          {/* Footer */}
          {(confirmLabel || onConfirm) && (
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-default)]">
              <Dialog.Close asChild>
                <Button variant="ghost">Cancel</Button>
              </Dialog.Close>
              {onConfirm && confirmLabel && (
                <Button
                  variant={confirmVariant}
                  onClick={onConfirm}
                  loading={confirmLoading}
                >
                  {confirmLabel}
                </Button>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
