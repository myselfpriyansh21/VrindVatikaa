"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/lib/firebase/settings-context";

const STORAGE_KEY = "vv_splash_seen_v1";
const VISIBLE_DURATION_MS = 2200; // approx 2-2.5s visible per spec Part 7 (final)

/**
 * Splash/landing intro (Spec Part 7 — FINAL DECISION):
 *   - Appears ONCE PER VISITOR via localStorage (not sessionStorage —
 *     this was explicitly finalized over the session-based option raised
 *     during requirements gathering).
 *   - The homepage underneath is already mounted/rendering the entire
 *     time — this component is purely a full-screen overlay that fades
 *     out, so it never adds to actual page load time.
 *   - No heavy video; pure CSS/Framer Motion.
 */
export function SplashIntro() {
  const settings = useSettings();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const alreadySeen = window.localStorage.getItem(STORAGE_KEY);
      if (!alreadySeen) {
        setVisible(true);
        const timer = setTimeout(() => {
          setVisible(false);
          window.localStorage.setItem(STORAGE_KEY, "1");
        }, VISIBLE_DURATION_MS);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable (privacy mode etc.) — fail open, no splash.
    }
  }, []);

  // Avoid rendering anything until we know client-side whether to show it,
  // to prevent a hydration flash.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-vrind-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          role="presentation"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 1.35] }}
            transition={{ duration: 1.9, times: [0, 0.32, 0.68, 1], ease: "easeInOut" }}
            className="flex flex-col items-center gap-5 px-6 text-center"
          >
            <div className="relative h-32 w-auto sm:h-40" style={{ filter: "drop-shadow(0 0 28px var(--vrind-gold-glow))" }}>
              <Image
                src={settings.logoUrl}
                alt={settings.businessName}
                width={900}
                height={613}
                priority
                className="h-full w-auto object-contain"
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.9, times: [0, 0.32, 0.68, 1], ease: "easeInOut" }}
              className="text-xs tracking-[0.25em] text-vrind-text-muted uppercase"
            >
              Telibagh, Lucknow
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
