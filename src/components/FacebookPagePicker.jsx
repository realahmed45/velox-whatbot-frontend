/**
 * FacebookPagePicker — headless Messenger connect.
 *
 * The provider used to show its own branded "Select a Facebook Page" screen,
 * which read as leaving Botlify. Now the callback hands us a short-lived
 * tempToken and the hotel picks their Page right here.
 *
 *   GET  /channels/messenger/pages?tempToken=  → { success, pages: [{id,name,picture}] }
 *   POST /channels/messenger/pages            → { success, username, webhookError }
 *
 * Presented with the same treatment as the Telegram pairing modal on
 * ChannelsPage: full-width bottom sheet on mobile, centred card on desktop.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Loader2, RefreshCw } from "lucide-react";
import api from "@/services/api";

function MessengerMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.44 6.53 3.78 8.62c.2.18.32.42.32.69l.07 2.14c.02.68.72 1.13 1.35.86l2.39-1.05c.2-.09.43-.11.65-.05c1.09.3 2.25.46 3.44.46c6.76 0 12-4.95 12-11.64S18.76 0 12 0m7.2 8.93l-3.52 5.6c-.56.89-1.76 1.11-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.79 2.87c-.5.38-1.16-.22-.82-.75l3.52-5.6c.56-.89 1.76-1.11 2.6-.48l2.8 2.1c.26.19.61.19.87 0l3.79-2.87c.5-.38 1.16.22.82.75"
      />
    </svg>
  );
}

/* Page avatar — the provider omits `picture` for Pages without a photo, so
   fall back to the initial letter the same way the header/contacts do. */
function PageAvatar({ page }) {
  const [broken, setBroken] = useState(false);
  const initial = (page.name || "?").slice(0, 1).toUpperCase();
  if (page.picture && !broken) {
    return (
      <img
        src={page.picture}
        alt=""
        onError={() => setBroken(true)}
        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-ink-50"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center flex-shrink-0">
      {initial}
    </div>
  );
}

export default function FacebookPagePicker({
  tempToken,
  userProfile,
  onDone,
  onCancel,
}) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  // 409 "already connected" is a dead end for that Page but not for the flow —
  // keep it on screen (a toast would vanish) until they pick a different one.
  const [takenError, setTakenError] = useState(null);

  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await api.get("/channels/messenger/pages", {
        params: { tempToken },
      });
      const list = Array.isArray(data?.pages) ? data.pages : [];
      setPages(list);
      // One Page is the common case for a hotel — preselect so the primary
      // button is one tap away.
      if (list.length === 1) setSelected(list[0].id);
    } catch (e) {
      setLoadError(
        e?.response?.data?.message ||
          "Couldn't load your Facebook Pages. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [tempToken]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  /* Escape closes; focus moves into the dialog and returns on unmount. */
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const els = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (els?.[0] || dialogRef.current)?.focus?.();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setTakenError(null);
    try {
      const { data } = await api.post("/channels/messenger/pages", {
        pageId: selected,
        tempToken,
        ...(userProfile ? { userProfile } : {}),
      });
      onDone?.({
        username: data?.username,
        webhookError: data?.webhookError || null,
      });
    } catch (e) {
      const status = e?.response?.status;
      const message =
        e?.response?.data?.message ||
        "Could not finish connecting that Page. Try again.";
      if (status === 409) {
        setTakenError(message);
      } else {
        setLoadError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fb-pick-title"
      onClick={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl outline-none max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <MessengerMark className="w-6 h-6" />
          </div>
          <div>
            <h2 id="fb-pick-title" className="text-lg font-black text-ink-900">
              Choose your Facebook Page
            </h2>
            <p className="text-sm text-ink-500">
              Your AI will answer messages sent to this Page.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="font-bold text-ink-900">Something went wrong</p>
            <p className="text-sm text-ink-500 mt-1">{loadError}</p>
            <button
              type="button"
              onClick={fetchPages}
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => onCancel?.()}
              className="mt-2 w-full border border-ink-200 text-ink-700 font-bold text-sm rounded-xl px-4 py-2.5 hover:bg-ink-50"
            >
              Cancel
            </button>
          </div>
        ) : pages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="font-bold text-ink-900">No Pages found</p>
            <p className="text-sm text-ink-500 mt-1">
              That Facebook account doesn't manage any Pages. Create a Page for
              your hotel, then connect again.
            </p>
            <button
              type="button"
              onClick={() => onCancel?.()}
              className="mt-5 w-full border border-ink-200 text-ink-700 font-bold text-sm rounded-xl px-4 py-2.5 hover:bg-ink-50"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {takenError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 mb-3 flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    {takenError}
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Choose a different Page below, or disconnect it from the
                    other account first.
                  </p>
                </div>
              </div>
            )}

            <div
              role="radiogroup"
              aria-label="Your Facebook Pages"
              className="space-y-2 overflow-y-auto -mx-1 px-1"
            >
              {pages.map((page) => {
                const active = selected === page.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setSelected(page.id);
                      setTakenError(null);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                        : "border-ink-100 hover:border-ink-200 hover:bg-ink-50"
                    }`}
                  >
                    <PageAvatar page={page} />
                    <span className="flex-1 min-w-0">
                      <span className="block font-bold text-ink-900 text-sm truncate">
                        {page.name}
                      </span>
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                        active
                          ? "bg-brand-500 border-brand-500 text-white"
                          : "border-ink-200"
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={!selected || saving}
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Connect this Page
            </button>
            <button
              type="button"
              onClick={() => onCancel?.()}
              disabled={saving}
              className="mt-2 w-full border border-ink-200 text-ink-700 font-bold text-sm rounded-xl px-4 py-2.5 hover:bg-ink-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
