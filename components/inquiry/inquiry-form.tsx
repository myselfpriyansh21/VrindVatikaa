"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2, UtensilsCrossed, Music4, Palette, Layers } from "lucide-react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { inquirySchema, type InquiryFormValues } from "@/lib/validation/inquiry.schema";
import { eventTypes } from "@/config/site";
import { useSettings } from "@/lib/firebase/settings-context";
import { buildInquiryWhatsAppUrl } from "@/lib/whatsapp/message-builder";

type InquiryFormInput = z.input<typeof inquirySchema>;

// Subtle filled-underline field style — a bottom border and quiet fill
// rather than a fully-boxed input, per the "reduce heavy bordered boxes"
// direction.
const fieldClasses =
  "w-full border-0 border-b border-vrind-white-border bg-transparent px-0.5 py-3 text-base text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-12 transition-colors";

const labelClasses = "mb-1.5 block text-xs font-medium tracking-wide text-vrind-text-muted uppercase";

const serviceFields: {
  name: keyof InquiryFormValues;
  label: string;
  icon: typeof UtensilsCrossed;
}[] = [
  { name: "cateringRequired", label: "Catering", icon: UtensilsCrossed },
  { name: "djRequired", label: "DJ", icon: Music4 },
  { name: "decorationRequired", label: "Decoration", icon: Palette },
  { name: "customStageRequired", label: "Custom Stage", icon: Layers },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">
      {children}
    </p>
  );
}

export function InquiryForm({ onSuccess }: { onSuccess?: () => void }) {
  const settings = useSettings();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryFormInput, unknown, InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      cateringRequired: false,
      djRequired: false,
      decorationRequired: false,
      customStageRequired: false,
      message: "",
      companyWebsite: "",
    },
  });

  async function onSubmit(values: InquiryFormValues) {
    // values arrives here already coerced/validated to InquiryFormValues
    // (the resolver's output type) despite the input-typed useForm above.
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(
          data.error ??
            "We couldn't send your inquiry. Please try again or contact us directly."
        );
        return;
      }

      const { inquiryId } = await res.json();
      const whatsappUrl = buildInquiryWhatsAppUrl(
        settings.whatsappNumber,
        values,
        inquiryId
      );
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      setSubmitted(true);
      reset();
      onSuccess?.();
    } catch {
      toast.error(
        "Network error — your inquiry was not sent. Please check your connection and try again."
      );
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <CheckCircle2 className="size-11 text-vrind-gold" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="font-heading text-xl text-vrind-text-primary">
          Your inquiry has been received.
        </h3>
        <p className="max-w-sm text-sm text-vrind-text-secondary">
          We&apos;ll confirm availability and share pricing shortly. We&apos;ve also
          opened WhatsApp so you can send us your details directly.
        </p>
        <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)}>
          Submit another inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10" noValidate>
      {/* Honeypot — visually hidden, never seen by real visitors */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] size-px opacity-0"
        aria-hidden="true"
        {...register("companyWebsite")}
      />

      {/* SECTION 1 — Your Details */}
      <div>
        <SectionHeading>Your Details</SectionHeading>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="name">Full Name</label>
            <input id="name" className={fieldClasses} placeholder="Your name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-vrind-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClasses} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              className={fieldClasses}
              placeholder="10-digit mobile number"
              {...register("phone")}
            />
            {errors.phone && <p className="mt-1 text-xs text-vrind-error">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 2 — Event Details */}
      <div>
        <SectionHeading>Event Details</SectionHeading>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="eventType">Event Type</label>
            <select id="eventType" className={fieldClasses} defaultValue="" {...register("eventType")}>
              <option value="" disabled>Select event type</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.eventType && (
              <p className="mt-1 text-xs text-vrind-error">{errors.eventType.message}</p>
            )}
          </div>
          <div>
            <label className={labelClasses} htmlFor="guestCount">Approximate Guest Count</label>
            <input
              id="guestCount"
              type="number"
              inputMode="numeric"
              min={1}
              className={fieldClasses}
              placeholder="e.g. 150"
              {...register("guestCount")}
            />
            {errors.guestCount && (
              <p className="mt-1 text-xs text-vrind-error">{errors.guestCount.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor="eventDate">Event Date</label>
            <input
              id="eventDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className={`${fieldClasses} sm:max-w-[240px]`}
              {...register("eventDate")}
            />
            {errors.eventDate && (
              <p className="mt-1 text-xs text-vrind-error">{errors.eventDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 — Services */}
      <div>
        <SectionHeading>Services</SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {serviceFields.map((field) => (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: { value, onChange } }) => (
                <button
                  type="button"
                  onClick={() => onChange(!value)}
                  aria-pressed={!!value}
                  className={`flex min-h-20 flex-col items-center justify-center gap-2 border transition-colors ${
                    value
                      ? "border-vrind-gold bg-vrind-gold/[0.06] text-vrind-gold"
                      : "border-vrind-white-border text-vrind-text-secondary hover:border-vrind-text-muted"
                  }`}
                >
                  <field.icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-xs font-medium">{field.label}</span>
                </button>
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="message">Additional Message</label>
        <textarea
          id="message"
          rows={3}
          className={fieldClasses}
          placeholder="Tell us more about your event..."
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-vrind-error">{errors.message.message}</p>
        )}
      </div>

      <div>
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending...
            </>
          ) : (
            "Request Availability & Quote"
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-vrind-text-muted">
          This sends an availability &amp; quotation request — we&apos;ll confirm
          details with you personally. This is not an instant booking.
        </p>
      </div>
    </form>
  );
}
