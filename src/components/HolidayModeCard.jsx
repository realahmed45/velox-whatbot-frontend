/**
 * HolidayModeCard — the "Holiday / away mode" master switch. Shared between
 * Settings → Automations and Smart Automations. When ON, every incoming
 * message gets one calm "a manager will get back to you" reply and the AI bot
 * + all other automations pause. Saves workspace.holidayMode.
 */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LifeBuoy } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_MSG =
  "Hi {name}! 🙏 Thanks for your message. Our team is away right now, but a manager will personally get back to you within a day. We appreciate your patience!";

export default function HolidayModeCard({ workspace, onSave }) {
  const { activeWorkspace } = useAuthStore();
  const [enabled, setEnabled] = useState(
    workspace?.holidayMode?.enabled ?? false,
  );
  const [message, setMessage] = useState(
    workspace?.holidayMode?.message || DEFAULT_MSG,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workspace?.holidayMode) {
      setEnabled(workspace.holidayMode.enabled ?? false);
      setMessage(workspace.holidayMode.message || DEFAULT_MSG);
    }
  }, [workspace?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = async (nextEnabled) => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, {
        holidayMode: {
          enabled: nextEnabled,
          message: message?.trim() || DEFAULT_MSG,
        },
      });
      toast.success(
        nextEnabled ? "Holiday mode ON 🌙" : "Holiday mode off — back to normal",
      );
      onSave?.();
    } catch {
      toast.error("Failed to save");
      setEnabled(!nextEnabled); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    persist(next);
  };

  return (
    <div
      className={`card p-6 mb-5 border-2 transition-colors ${
        enabled ? "border-brand-300 bg-brand-50/40" : "border-ink-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              enabled ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-500"
            }`}
          >
            <LifeBuoy className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-ink-900">Holiday / away mode</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Flip this on when your team is on holiday, closed, or something's
              wrong. Every message gets one calm "a manager will get back to
              you" reply — the AI bot and all other automations pause until you
              turn it off.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
            enabled ? "bg-brand-600" : "bg-ink-300"
          }`}
          aria-label="Toggle holiday mode"
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="mt-4">
        <label className="label text-xs">Away message</label>
        <textarea
          rows={3}
          className="input text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={DEFAULT_MSG}
          maxLength={600}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-ink-400">
            Use <code className="text-brand-600">{"{name}"}</code> to insert the
            customer's name.
          </p>
          <button
            onClick={() => persist(enabled)}
            disabled={saving}
            className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-3 py-1.5 transition"
          >
            {saving ? "Saving…" : "Save message"}
          </button>
        </div>
      </div>

      {enabled && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-brand-700 bg-brand-100/60 rounded-lg px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600" />
          </span>
          Holiday mode is live — automations are paused.
        </div>
      )}
    </div>
  );
}
