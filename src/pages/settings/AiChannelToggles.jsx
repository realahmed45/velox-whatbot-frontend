/**
 * Per-channel AI reply switches, shown in Settings → AI assistant.
 *
 *   Booking-site AI replies — aiSettings.otaAiEnabled (Airbnb, Booking.com and
 *                             Expedia guest inboxes)
 *   WhatsApp AI replies     — aiSettings.whatsappAiEnabled
 *
 * Each switch saves on its own through the dotted-key path on
 * PUT /workspaces/:id, so the rest of aiSettings is never touched. Off = guest
 * messages still land in the Inbox; nothing automated is sent on that channel.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowRight, Globe2 } from "lucide-react";
import api from "@/services/api";
import { WhatsAppMark } from "@/components/ChannelMarks";

const CHANNELS = [
  {
    field: "otaAiEnabled",
    title: "Booking-site AI replies",
    onText:
      "Answers guests inside their Airbnb, Booking.com and Expedia inboxes.",
    Icon: Globe2,
    tint: "bg-sunset-soft text-sunset-flame",
  },
  {
    field: "whatsappAiEnabled",
    title: "WhatsApp AI replies",
    onText: "Answers guests who message your WhatsApp number.",
    Icon: WhatsAppMark,
    tint: "bg-emerald-50 text-emerald-600",
  },
];

/**
 * @param {object}   props.workspace  the active workspace (aiSettings, settings)
 * @param {Function} props.onSave     refresh the workspace after a change
 * @param {Function} [props.onChanged] (field, value) — lets a parent holding a
 *                                     copy of aiSettings keep it in step, so a
 *                                     later wholesale save can't undo the switch
 * @param {boolean}  [props.masterOn] the assistant's main switch
 */
export default function AiChannelToggles({
  workspace,
  onSave,
  onChanged,
  masterOn = true,
}) {
  return (
    <div className="divide-y divide-ink-900/[0.06]">
      {CHANNELS.map((c) => (
        <AiChannelToggle
          key={c.field}
          {...c}
          workspace={workspace}
          onSave={onSave}
          onChanged={onChanged}
          masterOn={masterOn}
        />
      ))}
    </div>
  );
}

function AiChannelToggle({
  workspace,
  onSave,
  onChanged,
  masterOn,
  field,
  title,
  onText,
  Icon,
  tint,
}) {
  const stored = workspace?.aiSettings?.[field] !== false;
  const [on, setOn] = useState(stored);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOn(stored);
  }, [stored]);

  const automationOff = workspace?.settings?.automationEnabled === false;

  const toggle = async () => {
    if (!workspace?._id || saving) return;
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, {
        [`aiSettings.${field}`]: next,
      });
      // The legacy global automation switch drops guest messages entirely when
      // off and no longer has its own control — make sure it's on.
      if (next && automationOff) {
        await api.put("/instagram/settings", { automationEnabled: true });
      }
      onChanged?.(field, next);
      toast.success(next ? `${title} on` : `${title} paused`);
      onSave?.();
    } catch (err) {
      setOn(!next);
      toast.error(err.response?.data?.message || "Couldn't update AI replies");
    } finally {
      setSaving(false);
    }
  };

  const live = on && masterOn;

  return (
    <div className="group flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-ink-900/[0.05] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${tint}`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-ink-900">{title}</p>
            <p className="text-[12.5px] text-ink-500 mt-0.5">
              {!on
                ? "Paused — you reply to these guests yourself from the Inbox."
                : !masterOn
                  ? "On, but waiting — the AI assistant is switched off above."
                  : onText}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={title}
            onClick={toggle}
            disabled={saving || !workspace?._id}
            className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-60 shadow-[inset_0_1px_2px_rgba(15,23,42,0.15)] active:scale-95 ${
              live ? "bg-emerald-500" : on ? "bg-emerald-300" : "bg-ink-300"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 520, damping: 30 }}
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-[0_2px_6px_rgba(15,23,42,0.25),inset_0_1px_0_#fff] ${
                on ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
        {!on && (
          <Link
            to="/dashboard/inbox"
            className="group/link mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-sunset-flame hover:text-sunset-magenta"
          >
            Open Inbox
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-spring group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
