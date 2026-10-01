import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Small, static sitemap — the site has a handful of routes (spec Part 36
 * / blueprint §15: "sitemap will be simple/static rather than requiring
 * a sitemap-generation pipeline"). Update this list if new public routes
 * are added (e.g. a future dedicated /gallery route).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/restaurant`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
