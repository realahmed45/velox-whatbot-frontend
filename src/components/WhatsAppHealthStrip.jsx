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
 *
 * AiSensy numbers (provider === "aisensy") don't go through that flow, so they
 * get a simple strip instead: the connected number, when the last guest
 * message arrived (lastWebhookAt from GET /channels/status) and the webhook URL
 * the hotel must add in AiSensy (whatsapp.webhookUrl). No PIN UI.
 */
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
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

/* "just now", "5 min ago", "3 h ago", "2 days ago" — or a date past a week. */
function timeAgo(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return null;
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d <= 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(t).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

/**
 * The AiSensy webhook URL in a copy box, with the one instruction that goes
 * with it. Shared with WhatsAppConnectModal's success step.
 */
export function WebhookUrlBox({ url, compact = false }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Webhook URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the URL is on screen to select */
    }
  };
  return (
    <div
      className={`rounded-xl bg-white/70 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <p className={`${compact ? "text-[11px]" : "text-xs"} text-ink-600 leading-relaxed`}>
        In AiSensy → Developer Hub → Webhooks, add this URL and enable incoming
        messages. Guest messages will then reach Botlify.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-ink-900/[0.04] px-2.5 py-1.5 font-mono text-[11.5px] text-ink-800 select-all">
          {url}
        </code>
        <button
          type="button"
          onClick={copy}
          className="btn-secondary shrink-0 px-2.5 py-1.5 text-xs"
          aria-label="Copy webhook URL"
        >
          {copied ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/** AiSensy: connected number, last message received, webhook URL. */
function AiSensyStrip({ phoneNumber, lastWebhookAt, webhookUrl, webhookError }) {
  const last = timeAgo(lastWebhookAt);
  const waiting = !last;
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            waiting || webhookError ? "bg-amber-500" : "bg-emerald-500"
          }`}
        />
        <span className="font-semibold text-ink-700">
          {waiting ? "Waiting for the first message" : "Receiving messages"}
        </span>
        {phoneNumber && (
          <>
            <span className="text-ink-300">·</span>
            <span className="text-ink-500 font-mono">{phoneNumber}</span>
          </>
        )}
      </div>
      <p className="text-xs text-ink-400 mt-0.5">
        {waiting
          ? "Check the webhook is added in AiSensy."
          : `Last guest message received ${last}`}
      </p>
      {webhookUrl && (
        <div className="mt-2.5">
          <WebhookUrlBox url={webhookUrl} compact />
        </div>
      )}
    </div>
  );
}

export default function WhatsAppHealthStrip({
  webhookError = false,
  provider,
  phoneNumber,
  lastWebhookAt,
  webhookUrl,
}) {
  if (provider === "aisensy") {
    return (
      <AiSensyStrip
        phoneNumber={phoneNumber}
        lastWebhookAt={lastWebhookAt}
        webhookUrl={webhookUrl}
        webhookError={webhookError}
      />
    );
  }
  return <ZernioHealthStrip webhookError={webhookError} />;
}

/** Legacy (Zernio-connected) numbers: Meta health + the two-step PIN fix. */
function ZernioHealthStrip({ webhookError = false }) {
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
        <Loader2 className="h-3 w-3 animate-spin text-sunset-flame" />
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
        <div className="mt-2.5 rounded-xl bg-amber-50/90 p-3 ring-1 ring-inset ring-amber-600/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] animate-pop-in">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-900">
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
          className="mt-2.5 rounded-2xl bg-white/60 p-3 ring-1 ring-inset ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] animate-pop-in"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-ink-900">
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
              className="input min-w-0 flex-1 px-3 py-2 font-mono tracking-widest"
            />
            <button
              type="submit"
              disabled={saving || pin.length !== 6}
              className="btn-primary px-3 py-2 text-xs disabled:opacity-60"
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
