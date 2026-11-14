/**
 * HolidayModeCard — the "Away mode" master switch, on Settings → General.
 * When ON, every guest message gets one calm "a manager will get back to you"
 * reply and the AI concierge pauses on every channel. Saves
 * workspace.holidayMode.
 */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LifeBuoy } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { PulseDot } from "@/components/fx";

const DEFAULT_MSG =
  "Hi {name}! 🙏 Thanks for your message. Our front desk is away right now, but a manager will personally get back to you within a day. We appreciate your patience!";

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
        nextEnabled ? "Away mode ON 🌙" : "Away mode off — back to normal",
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
      className={`card group mb-5 overflow-hidden p-6 transition-shadow duration-500 ${
        enabled ? "shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.3),0_18px_40px_-18px_rgba(255,61,119,0.45)]" : ""
      }`}
    >
      {enabled && (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-sunset-soft opacity-80" />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
              enabled
                ? "bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.7)]"
                : "bg-ink-900/[0.05] text-ink-500"
            }`}
          >
            <LifeBuoy className={`h-5 w-5 ${enabled ? "animate-spin-slow" : ""}`} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="font-display font-semibold tracking-[-0.02em] text-ink-900">Away mode</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Flip this on when the property is closed, fully booked or
              something's wrong. Every guest message gets one calm "a manager
              will get back to you" reply, and your AI concierge stops
              answering on every channel until you turn it off.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-[background,box-shadow] duration-300 disabled:opacity-60 ${
            enabled
              ? "bg-sunset shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_6px_16px_-6px_rgba(255,61,119,0.6)]"
              : "bg-ink-900/[0.14] shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]"
          }`}
          aria-label="Toggle away mode"
        >
          <span
            className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,0.25)] transition-all duration-500 ease-spring ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="relative mt-4">
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
            Use <code className="rounded bg-sunset-soft px-1 font-mono text-sunset-flame">{"{name}"}</code> to insert the
            guest's name.
          </p>
          <button
            onClick={() => persist(enabled)}
            disabled={saving}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            {saving ? "Saving…" : "Save message"}
          </button>
        </div>
      </div>

      {enabled && (
        <div className="relative mt-3 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-[#E2541C] ring-1 ring-inset ring-sunset-flame/20 animate-pop-in">
          <PulseDot color="bg-sunset-flame" />
          Away mode is live — your AI concierge is paused.
        </div>
      )}
    </div>
  );
}
