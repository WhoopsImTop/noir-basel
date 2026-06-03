/**
 * Nuxt generate legt /404 und /200 als Routen an, die Dateien heissen aber 404.html / 200.html.
 * Workbox precacht sonst URLs, die auf Apache 404 zurückgeben → bad-precaching-response.
 */
const BROKEN_PRECACHE_URLS = new Set(["404", "/404", "200", "/200"]);

type ManifestEntry = { url: string; revision?: string | null };

export function filterBrokenPrecacheUrls(manifestEntries: ManifestEntry[]) {
  const manifest = manifestEntries.filter((entry) => !BROKEN_PRECACHE_URLS.has(entry.url));

  return { manifest, warnings: [] as string[] };
}
