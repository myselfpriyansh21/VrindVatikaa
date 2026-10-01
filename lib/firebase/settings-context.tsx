"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSettings } from "@/lib/firebase/settings-client";
import { fallbackBusinessSettings, type BusinessSettings } from "@/config/site";

/**
 * Provides the live Business Settings document (settings/main) to every
 * client component in the app, fetched once at the root and shared via
 * context — rather than each component (header, footer, hero, contact
 * buttons, ...) independently importing the static fallback.
 *
 * While the fetch is in flight (or if it fails, e.g. Firebase not
 * configured in this environment), consumers get `fallbackBusinessSettings`
 * so nothing ever renders blank — the real value swaps in silently once
 * loaded. This is what makes /admin/settings changes actually propagate
 * across the public site.
 */
const SettingsContext = createContext<BusinessSettings>(fallbackBusinessSettings);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(fallbackBusinessSettings);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {
        // Firebase not configured / offline — keep the fallback silently.
      });
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings(): BusinessSettings {
  return useContext(SettingsContext);
}
