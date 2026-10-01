"use client";

import { Phone, MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp/message-builder";
import { useSettings } from "@/lib/firebase/settings-context";

/**
 * Reads from the live SettingsProvider context (settings/main in
 * Firestore, falling back to config/site.ts while loading/offline) — so
 * changing the phone/WhatsApp number in /admin/settings updates every
 * instance of these buttons across the site automatically.
 */

interface ContactButtonProps extends Omit<ButtonProps, "asChild"> {
  label?: string;
}

export function WhatsAppButton({ label = "WhatsApp Us", ...props }: ContactButtonProps) {
  const settings = useSettings();
  const href = buildGeneralWhatsAppUrl(settings.whatsappNumber);
  return (
    <Button asChild {...props}>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        <MessageCircle className="size-4" aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}

export function CallButton({ label = "Call Now", ...props }: ContactButtonProps) {
  const settings = useSettings();
  const href = `tel:${settings.phone}`;
  return (
    <Button asChild {...props}>
      <a href={href} aria-label={label}>
        <Phone className="size-4" aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}
