import { useEffect, useRef, useState } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile ("are you human?") widget.
 *
 * Renders nothing when VITE_TURNSTILE_SITE_KEY is not set, so auth pages keep
 * working before the keys are configured. When set, it loads the Turnstile
 * script once, renders the widget, and calls onToken(token) with the solved
 * token (send it to the backend as `cf-turnstile-token`).
 */
export default function TurnstileWidget({ onToken, className = "" }) {
  const ref = useRef(null);
  const widgetId = useRef(null);
  const [ready, setReady] = useState(!!window.turnstile);

  // Load the script once.
  useEffect(() => {
    if (!SITE_KEY) return;
    if (window.turnstile) {
      setReady(true);
      return;
    }
    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const iv = setInterval(() => {
      if (window.turnstile) {
        setReady(true);
        clearInterval(iv);
      }
    }, 200);
    return () => clearInterval(iv);
  }, []);

  // Render the widget when the script is ready.
  useEffect(() => {
    if (!SITE_KEY || !ready || !ref.current || widgetId.current) return;
    try {
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken?.(token),
        "error-callback": () => onToken?.(""),
        "expired-callback": () => onToken?.(""),
        theme: "auto",
      });
    } catch {
      /* ignore double-render in strict mode */
    }
    return () => {
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* noop */
        }
        widgetId.current = null;
      }
    };
  }, [ready, onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className={`flex justify-center ${className}`} />;
}

// Convenience: is Turnstile even enabled on this build?
export const turnstileEnabled = !!SITE_KEY;
