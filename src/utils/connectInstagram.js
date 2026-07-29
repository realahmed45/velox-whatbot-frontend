import api from "@/services/api";

/**
 * Start the Instagram connect flow reliably.
 *
 * The hosted provider (Zernio) doesn't always redirect the browser back to us
 * after the user finishes authorizing — which left users stranded on the
 * provider page having to navigate back manually. To make completion detection
 * provider-independent, we open the auth flow in a popup and poll our own
 * `/instagram/connection` endpoint. The moment the workspace flips to
 * "connected" (via our server-side callback or the provider webhook), we close
 * the popup and resolve — no dependency on the provider bouncing us back.
 *
 * Falls back to a full-page redirect if the popup is blocked.
 *
 * @param {object} opts
 * @param {function} [opts.onStatus]  called with 'connecting' | 'connected' | 'timeout' | 'cancelled' | 'error'
 * @returns {Promise<{connected: boolean, reason?: string}>}
 */
export async function connectInstagram({ onStatus } = {}) {
  let url;
  try {
    const { data } = await api.get("/instagram/connect/oauth-url");
    url = data.url;
  } catch {
    onStatus?.("error");
    return { connected: false, reason: "url_failed" };
  }
  if (!url) {
    onStatus?.("error");
    return { connected: false, reason: "no_url" };
  }

  // Open a centered popup. If blocked, fall back to a top-level redirect.
  const w = 480;
  const h = 720;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  const popup = window.open(
    url,
    "botlify_ig_oauth",
    `width=${w},height=${h},left=${left},top=${top}`,
  );

  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    // Popup blocked — fall back to the classic full-page redirect.
    window.location.href = url;
    return { connected: false, reason: "redirected" };
  }

  onStatus?.("connecting");

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const TIMEOUT_MS = 3 * 60 * 1000; // give up after 3 minutes
    const POLL_MS = 2500;
    let done = false;

    const finish = (result) => {
      if (done) return;
      done = true;
      clearInterval(timer);
      try {
        if (popup && !popup.closed) popup.close();
      } catch {
        /* cross-origin close may throw — ignore */
      }
      resolve(result);
    };

    const timer = setInterval(async () => {
      // Timed out
      if (Date.now() - startedAt > TIMEOUT_MS) {
        onStatus?.("timeout");
        finish({ connected: false, reason: "timeout" });
        return;
      }

      // Poll our own backend for the connection status.
      try {
        const { data } = await api.get("/instagram/connection");
        if (data?.status === "connected") {
          onStatus?.("connected");
          finish({ connected: true });
          return;
        }
      } catch {
        /* transient error — keep polling */
      }

      // User closed the popup without finishing — stop waiting once we've
      // confirmed (via a follow-up poll) that it's still not connected.
      if (popup.closed) {
        try {
          const { data } = await api.get("/instagram/connection");
          if (data?.status === "connected") {
            onStatus?.("connected");
            finish({ connected: true });
            return;
          }
        } catch {
          /* ignore */
        }
        onStatus?.("cancelled");
        finish({ connected: false, reason: "cancelled" });
      }
    }, POLL_MS);
  });
}
