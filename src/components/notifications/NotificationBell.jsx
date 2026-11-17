import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { clsx } from "clsx";
import { useNotificationStore } from "./notificationStore";
import NotificationPanel from "./NotificationPanel";

/**
 * Bell button + dropdown panel. The badge pops and the bell rings once on
 * every live arrival (keyed off the store's `pulse`). On phones the panel
 * becomes a full-width sheet under the top bar.
 */
export default function NotificationBell({ className }) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pulse = useNotificationStore((s) => s.pulse);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <div className={clsx("relative", className)} ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Notifications"
        className={clsx(
          "relative grid h-9 w-9 place-items-center rounded-full transition-[background-color,color,transform] duration-200 active:scale-90",
          open ? "bg-[#0A0A0A] text-white" : "text-neutral-600 hover:bg-black/[0.05] hover:text-neutral-950",
        )}
      >
        <Bell key={`bell-${pulse}`} className={clsx("h-[18px] w-[18px]", pulse > 0 && "animate-bell-ring")} strokeWidth={2} />
        {unreadCount > 0 && (
          <span
            key={`badge-${pulse}`}
            className="animate-badge-pop absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF5A1F] px-1 text-[10px] font-bold leading-none text-white tabular-nums ring-2 ring-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 520, damping: 36 }}
            style={{ transformOrigin: "top right" }}
            className="popover fixed inset-x-2 top-[calc(var(--topbar-h)+6px)] z-50 overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[400px]"
          >
            <NotificationPanel onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
