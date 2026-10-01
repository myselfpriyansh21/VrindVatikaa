import { toYouTubeEmbedUrl, isHttpsUrl } from "@/lib/virtual-tour";

/**
 * Reserved homepage slot (spec Part 27). Renders NOTHING when the tour is
 * inactive or its URL is invalid — no placeholder, no "coming soon" — so
 * the site never looks unfinished. URLs are validated again here (not
 * only in the admin form) since this is what actually reaches visitors.
 */
export function VirtualTourSlot({ tour }: { tour: { type: "youtube" | "video"; url: string } | null }) {
  if (!tour) return null;

  const embedUrl = tour.type === "youtube" ? toYouTubeEmbedUrl(tour.url) : null;
  const videoOk = tour.type === "video" && isHttpsUrl(tour.url);
  if (!embedUrl && !videoOk) return null;

  return (
    <section id="tour" className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
      <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">Virtual Tour</p>
      <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">Walk through the venue</h2>
      <div className="mt-8 aspect-video w-full overflow-hidden bg-vrind-surface">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Vrind Vatikaa virtual tour"
            className="size-full"
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={tour.url} controls preload="metadata" className="size-full" />
        )}
      </div>
    </section>
  );
}
