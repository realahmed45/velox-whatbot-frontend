import { lazy } from "react";

/**
 * React.lazy that survives deploys.
 *
 * After a new deploy, an already-open tab still references the OLD hashed JS
 * chunks (index-ABC.js). Those files no longer exist on the CDN, so the dynamic
 * import() 404s and the app crashes with "Something broke". This wrapper catches
 * that specific failure and reloads the page ONCE — which fetches the fresh
 * index.html + new chunk names — instead of showing an error screen.
 *
 * We guard the reload with sessionStorage so a genuinely broken chunk (not a
 * stale-deploy 404) can't loop forever.
 */
const RELOAD_KEY = "botlify_chunk_reload";

export default function lazyWithRetry(importer) {
  return lazy(async () => {
    try {
      const mod = await importer();
      // Success — clear any prior reload marker.
      sessionStorage.removeItem(RELOAD_KEY);
      return mod;
    } catch (err) {
      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
      const isChunkError =
        /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
          err?.message || "",
        );
      if (isChunkError && !alreadyReloaded) {
        // Stale deploy — reload once to pick up the new build.
        sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
        // Return a never-resolving module so React doesn't render an error in
        // the split second before the reload takes effect.
        return new Promise(() => {});
      }
      throw err;
    }
  });
}
