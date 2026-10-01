"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getVirtualTourConfig,
  saveVirtualTourConfig,
  defaultVirtualTour,
} from "@/lib/firebase/virtual-tour-client";
import { toYouTubeEmbedUrl, isHttpsUrl } from "@/lib/virtual-tour";
import type { VirtualTourConfig } from "@/types/venue";

const fieldClasses =
  "w-full rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11";

export default function VirtualTourAdminPage() {
  const [config, setConfig] = useState<VirtualTourConfig>(defaultVirtualTour);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVirtualTourConfig()
      .then(setConfig)
      .catch(() => setError("Could not load virtual tour settings. Check Firebase configuration."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (config.active) {
      if (config.type === "youtube" && !toYouTubeEmbedUrl(config.url)) {
        toast.error("That doesn't look like a valid YouTube link.");
        return;
      }
      if (config.type === "video" && !isHttpsUrl(config.url)) {
        toast.error("Video URL must start with https://");
        return;
      }
      if (config.type === "none") {
        toast.error("Choose YouTube or Video before activating.");
        return;
      }
    }
    setSaving(true);
    try {
      await saveVirtualTourConfig(config);
      toast.success("Virtual tour settings saved.");
    } catch {
      toast.error("Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader2 className="size-5 animate-spin text-vrind-text-muted" />;

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl text-vrind-text-primary">Virtual Tour</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        When active, a tour section appears on the homepage. When inactive, nothing about it is shown to visitors.
      </p>

      {error ? (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">{error}</p>
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          <label className="flex min-h-11 items-center gap-3 text-sm text-vrind-text-primary">
            <input
              type="checkbox"
              checked={config.active}
              onChange={(e) => setConfig({ ...config, active: e.target.checked })}
              className="size-4"
            />
            Show virtual tour on the website
          </label>

          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-vrind-text-muted uppercase">Type</label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value as VirtualTourConfig["type"] })}
              className={fieldClasses}
            >
              <option value="none">Not set</option>
              <option value="youtube">YouTube link</option>
              <option value="video">Direct video file URL</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-vrind-text-muted uppercase">
              {config.type === "video" ? "Video URL (https)" : "YouTube URL"}
            </label>
            <input
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              placeholder="https://..."
              className={fieldClasses}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex min-h-12 w-fit items-center gap-2 bg-vrind-gold px-6 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </button>
        </div>
      )}
    </div>
  );
}
