import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { BellRing, CheckCheck, Loader2, Volume2, VolumeX, X, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { useNotificationStore } from "./notificationStore";
import { NotificationIcon, channelName, groupByDay, relativeTime } from "./notificationMeta";
import { openLink } from "./useNotificationsLive";

/**
 * The list inside the bell dropdown: All / Unread filter, Today / Earlier
 * groups, unread dots, hover-to-delete, mark-all-read, sound toggle,
 * infinite "load more" and an empty state.
 */
export default function NotificationPanel({ onClose }) {
  const navigate = useNavigate();
  const items = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const hasMore = useNotificationStore((s) => s.hasMore);
  const loading = useNotificationStore((s) => s.loading);
  const loadingMore = useNotificationStore((s) => s.loadingMore);
  const loaded = useNotificationStore((s) => s.loaded);
  const error = useNotificationStore((s) => s.error);
  const filter = useNotificationStore((s) => s.filter);
  const soundOn = useNotificationStore((s) => s.soundOn);
  const { fetch, loadMore, setFilter, markRead, markAllRead, remove, setSound } = useNotificationStore.getState();

  // Re-render relative times once a minute while open.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Refresh on open if what we have is stale.
  useEffect(() => {
    const st = useNotificationStore.getState();
    if (!st.loaded || Date.now() - st.loadedAt > 60000) st.fetch({ silent: st.loaded });
  }, []);

  // Infinite scroll: load the next page when the sentinel comes into view.
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && useNotificationStore.getState().loadMore(),
      { root: scrollRef.current, rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, items.length]);

  const groups = useMemo(() => groupByDay(items, now), [items, now]);

  const open = (n) => {
    markRead(n._id);
    if (n.link) {
      onClose?.();
      openLink(navigate, n.link);
    }
  };

  const onMarkAll = async () => {
    try {
      await markAllRead();
    } catch {
      toast.error("Couldn't mark all as read");
    }
  };

  return (
    <div className="flex max-h-[calc(100dvh-170px)] flex-col sm:max-h-[min(640px,calc(100dvh-96px))]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pb-2.5 pt-3.5">
        <div className="flex items-center gap-2">
          <h2 className="font-geist text-[15px] font-semibold tracking-[-0.02em] text-neutral-950">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#FF5A1F] px-1.5 py-0.5 text-[10.5px] font-bold leading-none text-white tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <IconBtn
            label={soundOn ? "Sound on — click to mute" : "Sound off — click to enable"}
            onClick={() => setSound(!soundOn)}
            active={soundOn}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </IconBtn>
          <IconBtn label="Mark all as read" onClick={onMarkAll} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Close" onClick={onClose} className="sm:hidden">
            <X className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 pb-2">
        <div className="relative inline-flex rounded-full bg-neutral-100 p-0.5" role="tablist">
          {[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
          ].map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.value)}
                className={clsx(
                  "relative rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
                  active ? "text-white" : "text-neutral-500 hover:text-neutral-900",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="notif-filter-pill"
                    className="absolute inset-0 rounded-full bg-[#0A0A0A]"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div ref={scrollRef} className="min-h-[120px] flex-1 overflow-y-auto overscroll-contain border-t border-black/[0.06]">
        {loading && items.length === 0 ? (
          <ListSkeleton />
        ) : error && items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <p className="text-sm font-medium text-neutral-800">Couldn't load notifications</p>
            <button onClick={() => fetch()} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#FF5A1F] hover:text-[#E84A12]">
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        ) : loaded && items.length === 0 ? (
          <Empty unreadOnly={filter === "unread"} />
        ) : (
          <>
            {groups.map(([label, list]) => (
              <section key={label}>
                <p className="sticky top-0 z-[1] bg-white/95 px-4 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  {label}
                </p>
                <ul className="px-2 pb-1">
                  <AnimatePresence initial={false}>
                    {list.map((n) => (
                      <Row key={n._id} n={n} now={now} onOpen={() => open(n)} onDelete={() => remove(n._id)} onRead={() => markRead(n._id)} />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
            <div ref={sentinelRef} className="h-px" />
            {hasMore && (
              <div className="flex justify-center px-4 pb-3 pt-1">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-neutral-600 ring-1 ring-black/[0.08] transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-60"
                >
                  {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ n, now, onOpen, onDelete, onRead }) {
  const unread = !n.readAt;
  const ch = channelName(n.channel);
  const high = n.priority === "high";
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="group relative"
    >
      <button
        type="button"
        onClick={onOpen}
        className={clsx(
          "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 pr-9 text-left transition-colors",
          unread ? "bg-[#FFF1EA]/60 hover:bg-[#FFF1EA]" : "hover:bg-neutral-50",
        )}
      >
        <NotificationIcon notification={n} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span
              className={clsx(
                "min-w-0 flex-1 truncate text-[13.5px]",
                unread ? "font-semibold text-neutral-950" : "font-medium text-neutral-700",
              )}
            >
              {n.title}
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-neutral-400">{relativeTime(n.createdAt, now)}</span>
          </span>
          {n.body && (
            <span className={clsx("mt-0.5 line-clamp-2 block text-[12.5px] leading-snug", unread ? "text-neutral-600" : "text-neutral-500")}>
              {n.body}
            </span>
          )}
          {(ch || high) && (
            <span className="mt-1 flex items-center gap-1.5">
              {high && (
                <span className="rounded-full bg-[#0A0A0A] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">
                  Urgent
                </span>
              )}
              {ch && <span className="text-[11px] text-neutral-400">{ch}</span>}
            </span>
          )}
        </span>
      </button>
      {unread && (
        <button
          type="button"
          onClick={onRead}
          title="Mark as read"
          aria-label="Mark as read"
          className="absolute right-3 top-[38px] grid h-5 w-5 place-items-center"
        >
          <span className="h-2 w-2 rounded-full bg-[#FF5A1F] shadow-[0_0_0_3px_rgba(255,90,31,0.18)]" />
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        title="Remove"
        aria-label="Remove notification"
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-neutral-400 opacity-0 transition hover:bg-neutral-200/70 hover:text-neutral-800 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.li>
  );
}

function IconBtn({ label, onClick, children, disabled, active, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-lg transition active:scale-90 disabled:opacity-35 disabled:pointer-events-none",
        active ? "text-[#FF5A1F] hover:bg-[#FFF1EA]" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Empty({ unreadOnly }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="relative mb-4">
        <div aria-hidden className="absolute -inset-4 rounded-full bg-[#FF5A1F]/15 blur-xl" />
        <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#FF5A1F] shadow-[0_0_0_1px_rgba(255,90,31,0.18),0_10px_24px_-10px_rgba(255,90,31,0.5)]">
          <BellRing className="h-6 w-6" strokeWidth={1.8} />
        </div>
      </div>
      <p className="font-geist text-[15px] font-semibold text-neutral-950">
        {unreadOnly ? "No unread notifications" : "You're all caught up"}
      </p>
      <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-neutral-500">
        New guest messages, bookings and channel updates will show up here the moment they happen.
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl p-2.5">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-neutral-100" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-2.5 w-full animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
