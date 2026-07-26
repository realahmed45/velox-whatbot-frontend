/**
 * Botlify — lightweight client error reporting.
 *
 * Posts errors to Sentry's HTTP store endpoint if VITE_SENTRY_DSN is set — no
 * @sentry/react SDK, so no bundle bloat. No-op (console only) when unset.
 */
const DSN = (import.meta.env.VITE_SENTRY_DSN || "").trim();

let endpoint = null;
let authQuery = null;
if (DSN) {
  try {
    const u = new URL(DSN);
    const projectId = u.pathname.replace(/^\//, "");
    endpoint = `${u.protocol}//${u.host}/api/${projectId}/store/`;
    authQuery =
      `?sentry_version=7&sentry_client=botlify-web/1.0` +
      `&sentry_key=${u.username}`;
  } catch {
    endpoint = null;
  }
}

export function reportError(error, context = {}) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error("[reportError]", error, context);
  }
  if (!endpoint) return;
  try {
    const payload = {
      event_id: crypto.randomUUID().replace(/-/g, ""),
      timestamp: new Date().toISOString(),
      platform: "javascript",
      level: "error",
      environment: import.meta.env.MODE,
      extra: { ...context, url: window.location.href },
      exception: {
        values: [
          {
            type: error?.name || "Error",
            value: error?.message || String(error),
            stacktrace: error?.stack
              ? {
                  frames: String(error.stack)
                    .split("\n")
                    .slice(1, 30)
                    .map((l) => ({ function: l.trim() })),
                }
              : undefined,
          },
        ],
      },
    };
    fetch(endpoint + authQuery, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never let reporting throw */
  }
}

// Global handlers for errors that escape React's boundary.
export function installGlobalErrorHandlers() {
  if (installGlobalErrorHandlers._done) return;
  installGlobalErrorHandlers._done = true;
  window.addEventListener("error", (e) => {
    reportError(e.error || new Error(e.message), { kind: "window.error" });
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    reportError(reason instanceof Error ? reason : new Error(String(reason)), {
      kind: "unhandledrejection",
    });
  });
}
