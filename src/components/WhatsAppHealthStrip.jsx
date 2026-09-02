/**
 * WhatsAppHealthStrip — a compact status line for a connected WhatsApp number,
 * plus the one recovery that matters.
 *
 *   GET  /channels/whatsapp/health → { health: { displayNumber, displayName,
 *          qualityRating, messagingTier, status, healthStatus } }
 *   POST /channels/whatsapp/pin { pin }
 *
 * Why the PIN form exists: the connect flows register the number with a default
 * two-step PIN. If the hotel had already set their own, Meta rejects it with
 * error 133005 — the channel still reads "connected" while every single send
 * fails. Re-registering with their real 6-digit PIN fixes it, and it's the most
 * common post-connect failure there is.
 */
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

/* A number is fine unless the provider says otherwise. "unknown" means we
   couldn't reach Meta — that's not the hotel's problem, so stay quiet. */
function readHealth(h) {
  if (!h) return { tone: "unknown", label: "Checking…" };
  const status = String(h.status || "").toLowerCase();
  const quality = String(h.qualityRating || "").toLowerCase();
  const healthStatus = String(h.healthStatus || "").toLowerCase();

  if (status === "unknown" || h.error) {
    return { tone: "unknown", label: "Status unavailable" };
  }
  const bad =
    quality === "red" ||
    healthStatus === "blocked" ||
    healthStatus === "limited" ||
    ["flagged", "restricted", "banned", "disabled", "pending"].includes(status);
  if (bad) {
    // A PIN only fixes a PIN problem. Telling a banned or rate-limited hotel to
    // enter one sends them looking for a code that cannot help — so name the
    // cause and let the caller pick the right remedy.
    const cause = ["banned", "disabled", "restricted", "flagged"].includes(
      status,
    )
      ? "account"
      : quality === "red" || quality === "yellow"
        ? "quality"
        : healthStatus === "blocked" || healthStatus === "limited"
          ? "blocked"
          : status === "pending"
            ? "pending"
            : "unknown";
    return {
      tone: "bad",
      cause,
      label:
        quality === "red"
          ? "Quality rating is low"
          : healthStatus === "blocked"
            ? "Blocked by WhatsApp"
            : status === "pending"
              ? "Waiting on WhatsApp"
              : cause === "account"
                ? "WhatsApp restricted this number"
                : "Needs attention",
    };
  }
  if (quality === "yellow") {
    return { tone: "warn", label: "Quality rating slipping" };
  }
  return { tone: "ok", label: "Delivering normally" };
}

export default function WhatsAppHealthStrip({ webhookError = false }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [pinError, setPinError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/channels/whatsapp/health");
      setHealth(data?.health || null);
    } catch {
      // 404 (not connected) or a transient failure — the card already says
      // "Connected", so don't shout about a diagnostics call.
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitPin = async (e) => {
    e?.preventDefault?.();
    if (saving) return;
    if (!/^[0-9]{6}$/.test(pin)) {
      setPinError("Enter the 6-digit PIN.");
      return;
    }
    setSaving(true);
    setPinError(null);
    try {
      await api.post("/channels/whatsapp/pin", { pin });
      toast.success("WhatsApp PIN accepted — sending is restored");
      setShowPin(false);
      setPin("");
      load();
    } catch (err) {
      setPinError(
        err?.response?.data?.message ||
          "That PIN wasn't accepted. Check WhatsApp → Settings → Two-step verification.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking number health…
      </p>
    );
  }
  if (!health) return null;

  const { tone, label, cause } = readHealth(health);
  // Only a PIN problem is self-serviceable. Everything else needs a different
  // message — offering the PIN form for a ban is worse than saying nothing.
  const pinFixable = webhookError || cause === "unknown" || cause === "blocked";
  const needsFix = tone === "bad" || webhookError;

  const dot =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : tone === "bad"
          ? "bg-rose-500"
          : "bg-ink-300";

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
        <span className="font-semibold text-ink-700">{label}</span>
        {health.displayNumber && (
          <>
            <span className="text-ink-300">·</span>
            <span className="text-ink-500 font-mono">
              {health.displayNumber}
            </span>
          </>
        )}
        {health.messagingTier && (
          <>
            <span className="text-ink-300">·</span>
            <span className="text-ink-500">{health.messagingTier}</span>
          </>
        )}
      </div>
      {health.displayName && (
        <p className="text-xs text-ink-400 mt-0.5 truncate">
          {health.displayName}
        </p>
      )}

      {needsFix && !showPin && (
        <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-900">
                {cause === "account"
                  ? "WhatsApp has restricted this number"
                  : cause === "quality"
                    ? "Your quality rating is dropping"
                    : cause === "pending"
                      ? "WhatsApp is still reviewing this number"
                      : "Messages may not be going out"}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                {cause === "account"
                  ? "This is a decision on WhatsApp's side, so we can't undo it from here. Open WhatsApp Manager to see the reason and request a review. Your OTA bookings and calendar are unaffected."
                  : cause === "quality"
                    ? "Guests are blocking or reporting messages. Reply faster, message only guests who wrote first, and the rating recovers on its own."
                    : cause === "pending"
                      ? "Nothing to do — this usually clears by itself. Your OTA bookings and calendar keep working meanwhile."
                      : "This usually means your number already had a two-step PIN. Enter it once and sending is restored."}
              </p>
              {pinFixable && (
                <button
                  type="button"
                  onClick={() => setShowPin(true)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 underline underline-offset-2"
                >
                  <KeyRound className="w-3 h-3" />
                  Enter my WhatsApp PIN
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPin && (
        <form
          onSubmit={submitPin}
          className="mt-2.5 rounded-xl border border-ink-100 bg-ink-50 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-ink-900">
              Two-step verification PIN
            </p>
            <button
              type="button"
              onClick={() => {
                setShowPin(false);
                setPinError(null);
              }}
              className="text-ink-400 hover:text-ink-600"
              aria-label="Close PIN form"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">
            The 6-digit code you set in WhatsApp → Settings → Account →
            Two-step verification.
          </p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                setPinError(null);
              }}
              placeholder="000000"
              aria-label="Six digit WhatsApp PIN"
              className="flex-1 min-w-0 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-mono tracking-widest text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
            <button
              type="submit"
              disabled={saving || pin.length !== 6}
              className="inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-lg px-3 py-2 transition disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Save
            </button>
          </div>
          {pinError && (
            <p className="text-[11px] text-rose-600 mt-1.5">{pinError}</p>
          )}
        </form>
      )}
    </div>
  );
}
