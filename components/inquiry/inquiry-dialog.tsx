"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { InquiryForm } from "./inquiry-form";

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * On mobile this behaves like a bottom sheet; on desktop, a centered
 * modal wide enough for the two-column field layout in InquiryForm.
 */
export function InquiryDialog({ open, onOpenChange }: InquiryDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-90 bg-black/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed z-90 flex flex-col bg-vrind-black
                     inset-x-0 bottom-0 max-h-[94vh] rounded-t-xl pb-safe
                     sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88vh] sm:w-full sm:max-w-xl
                     sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-vrind-white-border/60"
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
            <div>
              <Dialog.Title className="font-heading text-2xl text-vrind-text-primary">
                Check Availability
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 max-w-sm text-sm text-vrind-text-secondary">
                Tell us a little about your event and we&apos;ll get back to you
                with availability and a quote.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="flex size-10 shrink-0 items-center justify-center text-vrind-text-muted hover:text-vrind-gold"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-6 pb-8 sm:px-8">
            <InquiryForm onSuccess={() => {}} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
