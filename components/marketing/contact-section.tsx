"use client";

import { MapPin, Phone, Mail } from "lucide-react";
import { useSettings } from "@/lib/firebase/settings-context";
import { WhatsAppButton, CallButton } from "@/components/shared/contact-actions";

export function ContactSection() {
  const settings = useSettings();

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
      <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
        Visit
      </p>
      <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">
        Find us in Telibagh
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-lg border border-vrind-white-border bg-vrind-surface p-6">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-vrind-gold" aria-hidden="true" />
            <address className="not-italic text-sm text-vrind-text-secondary">
              {settings.address}
            </address>
          </div>
          <div className="flex gap-3">
            <Phone className="size-5 shrink-0 text-vrind-gold" aria-hidden="true" />
            <span className="text-sm text-vrind-text-secondary">
              {settings.phone}
              {settings.secondaryPhone && (
                <span className="block text-vrind-text-muted">{settings.secondaryPhone}</span>
              )}
            </span>
          </div>
          <div className="flex gap-3">
            <Mail className="size-5 shrink-0 text-vrind-gold" aria-hidden="true" />
            <span className="text-sm text-vrind-text-secondary">{settings.email}</span>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <CallButton variant="secondary" className="w-full sm:w-auto" />
            <WhatsAppButton variant="primary" className="w-full sm:w-auto" />
          </div>
        </div>

        {settings.mapsEmbedUrl ? (
          <iframe
            src={settings.mapsEmbedUrl}
            className="min-h-64 w-full rounded-lg border border-vrind-white-border"
            loading="lazy"
            title="Vrind Vatikaa location"
          />
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-lg border border-vrind-white-border bg-vrind-black-secondary text-sm text-vrind-text-muted">
            Map will appear here once the location link is configured in Business Settings.
          </div>
        )}
      </div>
    </section>
  );
}
