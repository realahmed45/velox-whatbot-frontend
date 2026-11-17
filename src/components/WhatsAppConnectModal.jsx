/**
 * WhatsAppConnectModal — link the hotel's own WhatsApp number through
 * WasenderAPI, by scanning a QR code with the hotel's phone.
 *
 *   POST   /channels/whatsapp/wasender/start { phoneNumber }
 *          → { success, status, qr }            (qr = data: URL, null if already connected)
 *          → 503 { message, pasteKey: true }   (one-click not enabled → paste mode)
 *          → 400 { message }                   (bad number)
 *   GET    /channels/whatsapp/wasender/qr → { status, qr }   polled every 3s
 *   POST   /channels/whatsapp/wasender/key { apiKey, webhookSecret }
 *          → { success, webhookUrl }            (paste mode: own WasenderAPI session)
 *
 * Steps: phone number → QR (live status, "Get a new code" when it expires) →
 * connected (toast + close). A link switches to paste mode for hotels that
 * already run a session in their own WasenderAPI dashboard; that path ends on
 * the webhook URL they must add there. Owner only — staff see a short note.
 *
 * onClose(result) contract for callers:
 *   result = { connected: true, phoneNumber?, webhookUrl? } once connected
 *   (however the modal is closed), undefined on cancel. The modal shows the
 *   success toast itself; callers only refresh their status.
 *
 * Presentation: full-width bottom sheet on mobile, centred glass card on
 * desktop, night-950/40 backdrop.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { WhatsAppMark } from "@/components/ChannelMarks";
import { PulseDot } from "@/components/fx";
import { usePermissions } from "@/hooks/usePermissions";
import { WebhookUrlBox } from "@/components/WhatsAppHealthStrip";

const POLL_MS = 3000;
const CONNECTED_TOAST = "WhatsApp connected — your AI is answering";

/* "+62 812-3456-789" → "+628123456789"; null when it can't be a real number. */
function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

/* A QR that can no longer be scanned — offer a new one instead of polling. */
function isDead(status, qr) {
  const s = String(status || "").toLowerCase();
  if (s === "expired" || s === "logged_out") return true;
  return s === "disconnected" && !qr;
}

function statusLine(status) {
  switch (String(status || "").toLowerCase()) {
    case "need_scan":
      return "Waiting for you to scan…";
    case "connecting":
      return "Linking your phone…";
    case "connected":
      return "Connected";
    default:
      return "Waiting for WhatsApp…";
  }
}

export default function WhatsAppConnectModal({ onClose, defaultPhone = "" }) {
  const { isOwner } = usePermissions();
  // phone | qr | paste | pasted
  const [mode, setMode] = useState("phone");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [qr, setQr] = useState(null);
  const [qrStatus, setQrStatus] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null); // why we're in paste mode
  // Set once connected — reported to the caller however the modal closes.
  const [result, setResult] = useState(null);

  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const resultRef = useRef(null);
  resultRef.current = result;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const close = useCallback(
    () => onCloseRef.current?.(resultRef.current || undefined),
    [],
  );

  const finishConnected = useCallback((extra = {}) => {
    const r = { connected: true, ...extra };
    resultRef.current = r;
    setResult(r);
    toast.success(CONNECTED_TOAST);
    onCloseRef.current?.(r);
  }, []);

  /* Escape closes; focus moves into the dialog and returns on unmount. */
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const els = dialogRef.current?.querySelectorAll(
      'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    (els?.[0] || dialogRef.current)?.focus?.();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [close]);

  /* ── Step 1 → 2: ask the server for a QR code ───────────────────────── */
  const start = async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    const phoneNumber = normalizePhone(phone);
    if (!phoneNumber) {
      setError(
        "Enter the hotel's WhatsApp number with its country code, e.g. +62 812 3456 789.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post("/channels/whatsapp/wasender/start", {
        phoneNumber,
      });
      if (data && data.success === false) {
        throw Object.assign(new Error("rejected"), { response: { data } });
      }
      if (String(data?.status).toLowerCase() === "connected") {
        finishConnected({ phoneNumber });
        return;
      }
      setQr(data?.qr || null);
      setQrStatus(data?.status || "need_scan");
      setMode("qr");
    } catch (err) {
      const res = err?.response;
      if (res?.status === 503 && res?.data?.pasteKey) {
        setNotice(
          res.data.message ||
            "One-click linking isn't switched on yet — connect with your WasenderAPI key instead.",
        );
        setMode("paste");
      } else {
        setError(
          res?.data?.message ||
            "We couldn't create a QR code right now. Check the number and try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  /* ── Step 2: poll until the phone is linked or the code dies ─────────── */
  const dead = mode === "qr" && isDead(qrStatus, qr);
  useEffect(() => {
    if (mode !== "qr" || dead) return undefined;
    let stopped = false;
    const tick = async () => {
      try {
        const { data } = await api.get("/channels/whatsapp/wasender/qr");
        if (stopped) return;
        const status = data?.status || null;
        if (String(status).toLowerCase() === "connected") {
          stopped = true;
          finishConnected({ phoneNumber: normalizePhone(phone) });
          return;
        }
        setQrStatus(status);
        // The server rotates QR codes — always show the freshest one.
        if (data?.qr) setQr(data.qr);
        else if (isDead(status, null)) setQr(null);
      } catch {
        /* transient — keep polling */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [mode, dead, phone, finishConnected]);

  /* ── Paste mode: the hotel's own WasenderAPI session ─────────────────── */
  const saveKey = async (e) => {
    e?.preventDefault?.();
    const key = apiKey.trim();
    const secret = webhookSecret.trim();
    if (!key || !secret || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post("/channels/whatsapp/wasender/key", {
        apiKey: key,
        webhookSecret: secret,
      });
      if (data && data.success === false) {
        throw Object.assign(new Error("rejected"), { response: { data } });
      }
      const r = { connected: true, webhookUrl: data?.webhookUrl || null };
      resultRef.current = r;
      setResult(r);
      setApiKey("");
      setMode("pasted");
      toast.success(CONNECTED_TOAST);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "That key wasn't accepted. Copy the session's API key from your WasenderAPI dashboard and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const goPaste = () => {
    setError(null);
    setMode("paste");
  };
  const goPhone = () => {
    setError(null);
    setNotice(null);
    setMode("phone");
  };

  const title =
    mode === "pasted"
      ? "WhatsApp is connected"
      : mode === "qr"
        ? "Scan with the hotel's phone"
        : mode === "paste"
          ? "Connect with your API key"
          : "Connect WhatsApp";
  const subtitle =
    mode === "pasted"
      ? "One last step so guest messages reach Botlify."
      : mode === "qr"
        ? "Takes about 20 seconds. You keep your number and your chats."
        : mode === "paste"
          ? "For hotels that already have a session in WasenderAPI."
          : "Your AI answers guests on your WhatsApp number, day and night.";

  const safetyNote = (
    <p className="mt-4 flex gap-2 text-[11.5px] leading-relaxed text-ink-500">
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
      <span>
        Botlify only replies to guests who message you first — never bulk
        messages — to keep your number safe.
      </span>
    </p>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-night-950/40 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-connect-title"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="glass-strong w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 outline-none max-h-[92vh] overflow-y-auto animate-pop-in"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(16,185,129,0.7)]">
            <WhatsAppMark className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2
              id="wa-connect-title"
              className="text-lg font-display font-semibold tracking-[-0.02em] text-ink-900"
            >
              {isOwner || result ? title : "Connect WhatsApp"}
            </h2>
            <p className="text-sm text-ink-500">
              {isOwner || result
                ? subtitle
                : "Your AI answers guests on your WhatsApp number, day and night."}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex gap-2.5 rounded-xl bg-rose-50 p-3 ring-1 ring-inset ring-rose-600/15 animate-pop-in"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-900">{error}</p>
          </div>
        )}

        {/* Staff can't connect channels */}
        {!result && !isOwner && (
          <div>
            <div className="flex gap-2.5 rounded-xl bg-ink-900/[0.03] p-3 ring-1 ring-inset ring-ink-900/[0.06]">
              <Lock className="w-4 h-4 text-ink-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-ink-700">
                Only the owner can connect WhatsApp. Ask them to open Settings
                → Channels.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="btn-secondary mt-4 w-full min-h-[44px] justify-center text-sm"
            >
              Close
            </button>
          </div>
        )}

        {/* Step 1 — phone number */}
        {isOwner && mode === "phone" && (
          <form onSubmit={start} className="space-y-4">
            <div>
              <label htmlFor="wa-phone" className="label">
                Hotel WhatsApp number
              </label>
              <input
                id="wa-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="+62 812 3456 789"
                className="input w-full font-mono"
              />
              <p className="mt-1.5 text-xs text-ink-500">
                With country code — the number guests already message.
              </p>
            </div>
            <button
              type="submit"
              disabled={busy || !phone.trim()}
              className="btn-primary group w-full min-h-[44px] justify-center text-sm disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" />
              )}
              {busy ? "Creating your code…" : "Show QR code"}
            </button>
            <button
              type="button"
              onClick={goPaste}
              disabled={busy}
              className="w-full text-[13px] font-semibold text-ink-500 hover:text-ink-800 py-1 disabled:opacity-60"
            >
              I already have a WasenderAPI session → paste API key
            </button>
            {safetyNote}
          </form>
        )}

        {/* Step 2 — QR code */}
        {isOwner && mode === "qr" && (
          <div>
            <div className="relative mx-auto grid aspect-square w-full max-w-[264px] place-items-center overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff,0_18px_40px_-20px_rgba(15,23,42,0.35)]">
              {qr ? (
                <img
                  src={qr}
                  alt="WhatsApp QR code — scan it from Linked devices on the hotel's phone"
                  className={`h-full w-full object-contain transition-opacity duration-300 ${
                    dead ? "opacity-[0.15]" : "opacity-100"
                  }`}
                />
              ) : (
                !dead && (
                  <div className="h-full w-full rounded-xl bg-ink-900/[0.06] animate-pulse" />
                )
              )}
              {dead && (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <div>
                    <p className="font-display text-[15px] font-semibold text-ink-900">
                      This code expired
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      QR codes only last a short while.
                    </p>
                    <button
                      type="button"
                      onClick={start}
                      disabled={busy}
                      className="btn-primary mt-3 min-h-[44px] justify-center text-sm disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Get a new code
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!dead && (
              <div
                className="mt-3 flex items-center justify-center gap-2 text-sm text-ink-600"
                aria-live="polite"
              >
                <PulseDot color="bg-emerald-500" />
                {statusLine(qrStatus)}
              </div>
            )}

            <div className="mt-4 flex gap-2.5 rounded-xl bg-ink-900/[0.03] p-3 ring-1 ring-inset ring-ink-900/[0.06]">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
              <p className="text-[13px] leading-relaxed text-ink-700">
                On the hotel's phone: WhatsApp → Settings → Linked devices →
                Link a device, then scan.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={goPhone}
                disabled={busy}
                className="btn-secondary min-h-[44px] justify-center text-sm sm:flex-1 disabled:opacity-60"
              >
                <ArrowLeft className="w-4 h-4" />
                Change number
              </button>
              {!dead && (
                <button
                  type="button"
                  onClick={start}
                  disabled={busy}
                  className="btn-secondary min-h-[44px] justify-center text-sm sm:flex-1 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Get a new code
                </button>
              )}
            </div>
            {safetyNote}
          </div>
        )}

        {/* Paste mode — own WasenderAPI session */}
        {isOwner && mode === "paste" && (
          <form onSubmit={saveKey} className="space-y-4">
            {notice && (
              <p className="rounded-xl bg-sky-50/80 p-3 text-xs leading-relaxed text-sky-900 ring-1 ring-inset ring-sky-600/15">
                {notice}
              </p>
            )}
            <p className="text-xs text-ink-500 leading-relaxed rounded-xl bg-ink-900/[0.03] p-3 ring-1 ring-inset ring-ink-900/[0.06]">
              In your WasenderAPI dashboard, open the session for the hotel's
              number and copy its API key. Choose any webhook secret — you'll
              paste the same one in WasenderAPI next.
            </p>
            <div>
              <label htmlFor="wa-wasender-key" className="label">
                Session API key
              </label>
              <input
                id="wa-wasender-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste the API key"
                className="input w-full font-mono"
              />
            </div>
            <div>
              <label htmlFor="wa-wasender-secret" className="label">
                Webhook secret
              </label>
              <input
                id="wa-wasender-secret"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={webhookSecret}
                onChange={(e) => {
                  setWebhookSecret(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. a long random phrase"
                className="input w-full font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !apiKey.trim() || !webhookSecret.trim()}
              className="btn-primary w-full min-h-[44px] justify-center text-sm disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {busy ? "Connecting…" : "Connect WhatsApp"}
            </button>
            <button
              type="button"
              onClick={goPhone}
              disabled={busy}
              className="-mt-2 w-full text-sm font-semibold text-ink-500 hover:text-ink-700 py-2 disabled:opacity-60"
            >
              Back to QR code
            </button>
            {safetyNote}
          </form>
        )}

        {/* Paste mode finished — webhook step */}
        {mode === "pasted" && result && (
          <div>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50/80 px-3 py-2.5 text-[13px] text-emerald-800 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>WasenderAPI accepted your key.</span>
            </div>
            {result.webhookUrl ? (
              <WebhookUrlBox url={result.webhookUrl} />
            ) : (
              <p className="text-xs text-ink-500 leading-relaxed">
                Your webhook URL will appear on the WhatsApp card in Settings →
                Channels. Paste it in WasenderAPI → your session → Webhook.
              </p>
            )}
            <button
              type="button"
              onClick={close}
              className="btn-primary mt-5 w-full min-h-[44px] justify-center text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
