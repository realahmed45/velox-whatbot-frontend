import toast from "react-hot-toast";
import { X, ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";
import { NotificationIcon, channelName, typeMeta } from "./notificationMeta";

/**
 * Live toast for an incoming notification. High-priority ones get the black
 * "needs attention" treatment with an orange edge; everything else is a calm
 * white card. Enter/exit animate opacity + transform only.
 */
export function NotificationToast({ t, notification, onOpen }) {
  const high = notification.priority === "high";
  const meta = typeMeta(notification.type);
  const ch = channelName(notification.channel);

  return (
    <div
      className={clsx(
        "pointer-events-auto relative w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl transition-all duration-300 ease-out-expo",
        t.visible ? "translate-y-0 opacity-100 sm:translate-x-0" : "-translate-y-2 opacity-0 sm:translate-x-4 sm:translate-y-0",
        high
          ? "bg-[#0A0A0A] text-white shadow-[0_24px_48px_-16px_rgba(10,10,10,0.55),0_0_0_1px_rgba(255,90,31,0.45)]"
          : "bg-white text-neutral-900 shadow-[0_0_0_1px_rgba(10,10,10,0.08),0_20px_44px_-18px_rgba(10,10,10,0.3)]",
      )}
      role="status"
      aria-live={high ? "assertive" : "polite"}
    >
      <span aria-hidden className={clsx("absolute inset-y-0 left-0 w-1", high ? "bg-[#FF5A1F]" : "bg-[#FF5A1F]/70")} />
      <button
        type="button"
        onClick={() => {
          toast.dismiss(t.id);
          onOpen?.();
        }}
        className="group flex w-full items-start gap-3 py-3.5 pl-4 pr-10 text-left"
      >
        <NotificationIcon notification={notification} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span
              className={clsx(
                "text-[10.5px] font-semibold uppercase tracking-[0.12em]",
                high ? "text-[#FF8A5B]" : "text-[#FF5A1F]",
              )}
            >
              {high ? "Needs attention" : meta.label}
            </span>
            {ch && <span className={clsx("text-[11px]", high ? "text-white/45" : "text-neutral-400")}>· {ch}</span>}
          </span>
          <span className={clsx("mt-0.5 block truncate text-[14px] font-semibold font-geist", high ? "text-white" : "text-neutral-950")}>
            {notification.title}
          </span>
          {notification.body && (
            <span className={clsx("mt-0.5 line-clamp-2 block text-[13px] leading-snug", high ? "text-white/65" : "text-neutral-500")}>
              {notification.body}
            </span>
          )}
          {notification.link && (
            <span
              className={clsx(
                "mt-2 inline-flex items-center gap-1 text-[12px] font-semibold transition-transform duration-300 ease-spring group-hover:translate-x-0.5",
                high ? "text-[#FF8A5B]" : "text-[#FF5A1F]",
              )}
            >
              Open <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        className={clsx(
          "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg transition active:scale-90",
          high ? "text-white/40 hover:bg-white/10 hover:text-white" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800",
        )}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function showNotificationToast(notification, onOpen) {
  const high = notification.priority === "high";
  toast.custom((t) => <NotificationToast t={t} notification={notification} onOpen={onOpen} />, {
    id: `notif-${notification._id}`,
    position: "top-right",
    duration: high ? 9000 : 5000,
  });
}
