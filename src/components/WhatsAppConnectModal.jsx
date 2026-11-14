/**
 * WhatsAppConnectModal — connect the hotel's WhatsApp number through AiSensy.
 *
 *   POST /channels/whatsapp/aisensy/key { projectId, apiKey }
 *        → { success, webhookUrl } | 400/409 { message }
 *
 * After a successful connect we show the returned webhookUrl: the hotel has to
 * add it in AiSensy → Developer Hub → Webhooks before guest messages reach
 * Botlify. Owner only — staff see a short note instead of the form.
 *
 * onClose(result) keeps the contract the callers rely on:
 *   result = { connected: true, phoneNumber?, webhookUrl? } once connected
 *   (however the modal is closed), undefined on cancel.
 * The caller toasts and refreshes channel status.
 *
 * Presentation: full-width bottom sheet on mobile, centred glass card on
 * desktop, night-950/40 backdrop.
 */
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import api from "@/services/api";
import { WhatsAppMark } from "@/components/ChannelMarks";
import { usePermissions } from "@/hooks/usePermissions";
import { WebhookUrlBox } from "@/components/WhatsAppHealthStrip";

export default function WhatsAppConnectModal({ onClose }) {
  const { isOwner } = usePermissions();
  const [projectId, setProjectId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Set once connected — the modal then shows the webhook step.
  const [result, setResult] = useState(null);

  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const resultRef = useRef(null);
  resultRef.current = result;

  // Whatever closes the modal, a finished connect is reported as connected.
  const close = () => onClose?.(resultRef.current || undefined);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e?.preventDefault?.();
    const pid = projectId.trim();
    const key = apiKey.trim();
    if (!pid || !key || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.post("/channels/whatsapp/aisensy/key", {
        projectId: pid,
        apiKey: key,
      });
      if (data && data.success === false) {
        throw Object.assign(new Error("rejected"), { response: { data } });
      }
      setResult({
        connected: true,
        phoneNumber: data?.phoneNumber || null,
        webhookUrl: data?.webhookUrl || null,
      });
      setApiKey("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Those details weren't accepted. Check the Project ID and API password in AiSensy and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

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
              {result ? "WhatsApp is connected" : "Connect WhatsApp"}
            </h2>
            <p className="text-sm text-ink-500">
              {result
                ? "One last step so guest messages reach Botlify."
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
                Only the property owner can connect WhatsApp. Ask them to open
                Settings → Channels.
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

        {/* Connect form */}
        {!result && isOwner && (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-xs text-ink-500 leading-relaxed rounded-xl bg-ink-900/[0.03] p-3 ring-1 ring-inset ring-ink-900/[0.06]">
              AiSensy dashboard → Developer Hub → Project API Keys. Webhooks
              need AiSensy's Premium plan.
            </p>
            <div>
              <label htmlFor="wa-aisensy-project" className="label">
                AiSensy Project ID
              </label>
              <input
                id="wa-aisensy-project"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. 64f0c2a1b3…"
                className="input w-full font-mono"
              />
            </div>
            <div>
              <label htmlFor="wa-aisensy-key" className="label">
                Project API password
              </label>
              <input
                id="wa-aisensy-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste the API password"
                className="input w-full font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !projectId.trim() || !apiKey.trim()}
              className="btn-primary w-full min-h-[44px] justify-center text-sm disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Connecting…" : "Connect WhatsApp"}
            </button>
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="-mt-2 w-full text-sm font-semibold text-ink-500 hover:text-ink-700 py-2 disabled:opacity-60"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Webhook step */}
        {result && (
          <div>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50/80 px-3 py-2.5 text-[13px] text-emerald-800 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                AiSensy accepted your details
                {result.phoneNumber ? ` — ${result.phoneNumber}` : ""}.
              </span>
            </div>
            {result.webhookUrl ? (
              <WebhookUrlBox url={result.webhookUrl} />
            ) : (
              <p className="text-xs text-ink-500 leading-relaxed">
                Your webhook URL will appear on the WhatsApp card in Settings →
                Channels. Add it in AiSensy → Developer Hub → Webhooks.
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
