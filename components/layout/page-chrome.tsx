"use client";

import { useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { InquiryDialog } from "@/components/inquiry/inquiry-dialog";

/**
 * Reusable "header + bottom bar + inquiry dialog" client shell for any
 * public page that isn't the homepage (which uses HomeExperience
 * directly). Keeps the page itself a Server Component for metadata
 * purposes while sharing one inquiry-dialog open/close state across the
 * header CTA and the mobile bottom bar.
 */
export function PageChrome({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SiteHeader onCheckAvailability={() => setOpen(true)} />
      {children}
      <MobileBottomBar onCheckAvailability={() => setOpen(true)} />
      <InquiryDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
