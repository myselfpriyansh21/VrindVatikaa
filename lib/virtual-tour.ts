/**
 * Helpers for the virtual tour feature (spec Part 27) — shared by the
 * admin form (validation feedback) and the public slot (rendering).
 * Only https URLs are ever accepted; YouTube links are normalized to the
 * privacy-friendly youtube-nocookie embed form.
 */
export function toYouTubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else if (url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2];
      else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2];
    }

    if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
}

export function isHttpsUrl(input: string): boolean {
  try {
    return new URL(input.trim()).protocol === "https:";
  } catch {
    return false;
  }
}
