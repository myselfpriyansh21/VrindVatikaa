"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/lib/firebase/settings-client";
import { fallbackBusinessSettings, type BusinessSettings } from "@/config/site";

const fieldClasses =
  "w-full rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11";
const labelClasses = "mb-1.5 block text-xs font-medium tracking-wide text-vrind-text-muted uppercase";

const fieldGroups: { heading: string; fields: (keyof BusinessSettings)[] }[] = [
  { heading: "Business", fields: ["businessName", "tagline", "description"] },
  { heading: "Contact", fields: ["phone", "secondaryPhone", "whatsappNumber", "email"] },
  { heading: "Location", fields: ["address", "mapsUrl", "mapsEmbedUrl"] },
  { heading: "Social", fields: ["instagram", "facebook"] },
  { heading: "Restaurant", fields: ["restaurantHours"] },
];

const labels: Partial<Record<keyof BusinessSettings, string>> = {
  businessName: "Business Name",
  tagline: "Tagline",
  description: "Description (used in SEO/social previews)",
  phone: "Primary Phone",
  secondaryPhone: "Secondary Phone",
  whatsappNumber: "WhatsApp Number (digits only, with country code)",
  email: "Email",
  address: "Address",
  mapsUrl: "Google Maps Link",
  mapsEmbedUrl: "Google Maps Embed URL",
  instagram: "Instagram Handle (without @)",
  facebook: "Facebook Page Name",
  restaurantHours: "Restaurant Hours",
};

export default function SettingsPage() {
  const [data, setData] = useState<BusinessSettings>(fallbackBusinessSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then(setData)
      .catch(() =>
        setError(
          "Could not load settings. This usually means Firebase credentials aren't configured yet in this environment."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings(data);
      toast.success("Settings saved.");
    } catch {
      toast.error("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-vrind-text-muted" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl text-vrind-text-primary">Business Settings</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        A single source of truth — changes here update contact info, WhatsApp
        links, and the footer everywhere across the site.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      )}

      {!error && (
        <div className="mt-8 flex flex-col gap-8">
          {fieldGroups.map((group) => (
            <div key={group.heading}>
              <p className="mb-3 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">
                {group.heading}
              </p>
              <div className="flex flex-col gap-4">
                {group.fields.map((field) => (
                  <div key={field}>
                    <label className={labelClasses} htmlFor={field}>
                      {labels[field] ?? field}
                    </label>
                    {field === "description" ? (
                      <textarea
                        id={field}
                        rows={2}
                        className={fieldClasses}
                        value={data[field] as string}
                        onChange={(e) => setData({ ...data, [field]: e.target.value })}
                      />
                    ) : (
                      <input
                        id={field}
                        className={fieldClasses}
                        value={
                          typeof data[field] === "string" ? (data[field] as string) : ""
                        }
                        onChange={(e) => setData({ ...data, [field]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex min-h-12 w-fit items-center gap-2 bg-vrind-gold px-6 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
