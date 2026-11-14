/**
 * Guest inbox — every channel Botlify answers on, in one two-pane screen.
 *
 * Conversations are split by platform first: a row of channel tabs (All ·
 * Airbnb · Booking.com · Expedia · WhatsApp) sits above the list — OTA inbox
 * conversations first, since that's where most guests write. Each tab carries
 * its brand mark and a count/unread badge from the server's `byChannel`
 * totals. Picking a tab refetches with `?channel=`; "All" omits it. Any other
 * channel the workspace has connected is appended after the core four.
 *
 * Responsive: list-only on mobile, swaps to the chat when a conversation opens.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BotlifyMark from "@/components/BotlifyMark";
import {
  CHANNEL_ORDER,
  CORE_CHANNELS,
  channelMeta,
} from "@/components/ChannelMarks";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useInboxStore } from "@/store/inboxStore";
import { initSocket } from "@/services/socket";
import toast from "react-hot-toast";
import {
  Send,
  UserCheck,
  CheckCheck,
  Search,
  Pause,
  Play,
  X,
  Plus,
  Sparkles,
  MessagesSquare,
  Inbox as InboxIcon,
  ArrowLeft,
  Tag as TagIcon,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic, PulseDot, Reveal, SlidingTabs } from "@/components/fx";
dayjs.extend(relativeTime);

const STATUS = {
  bot_active: {
    label: "AI handled",
    cls: "bg-sunset-soft text-sunset-flame ring-1 ring-inset ring-sunset-flame/20",
  },
  open: {
    label: "Open",
    cls: "bg-ink-900/[0.05] text-ink-600 ring-1 ring-inset ring-ink-900/10",
  },
  awaiting_human: {
    label: "Needs you",
    cls: "bg-amber-400/15 text-amber-800 ring-1 ring-inset ring-amber-500/25",
  },
  human_active: {
    label: "You",
    cls: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20",
  },
  resolved: {
    label: "Resolved",
    cls: "bg-ink-900/[0.04] text-ink-500 ring-1 ring-inset ring-ink-900/[0.08]",
  },
  closed: {
    label: "Closed",
    cls: "bg-ink-900/[0.04] text-ink-500 ring-1 ring-inset ring-ink-900/[0.08]",
  },
};

const spring = { type: "spring", stiffness: 420, damping: 32 };

/**
 * Status filters. `query` is what goes to the server as `status=` — the
 * Conversation enum is exact-match, so each filter maps to one value (or null
 * for "All"). "human_active" chats surface under "Needs you" client-side too,
 * since a hotelier thinks of both as "on my plate", but the server call stays
 * a single exact value as the API requires.
 */
const FILTERS = [
  { id: "all", label: "All", query: null },
  { id: "awaiting_human", label: "Needs you", query: "awaiting_human" },
  { id: "bot_active", label: "AI handled", query: "bot_active" },
  { id: "resolved", label: "Resolved", query: "resolved" },
];

function Avatar({ initial, avatar, size = "w-10 h-10", text = "text-sm" }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        className={clsx(
          size,
          "rounded-full object-cover ring-2 ring-white shadow-[0_2px_6px_-2px_rgba(15,23,42,0.2)] flex-shrink-0",
        )}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <div
      className={clsx(
        size,
        text,
        "rounded-full bg-sunset flex items-center justify-center font-display font-semibold text-white ring-2 ring-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_14px_-8px_rgba(255,61,119,0.6)] flex-shrink-0",
      )}
    >
      {initial}
    </div>
  );
}

/**
 * Avatar + the platform the guest wrote from, as a small brand mark pinned to
 * the corner. This is what makes the channel obvious while browsing "All".
 */
function ChannelAvatar({
  initial,
  avatar,
  channelType,
  size = "w-10 h-10",
  text = "text-sm",
  badge = "w-4 h-4",
  mark = "w-2.5 h-2.5",
}) {
  const meta = channelMeta(channelType);
  const Mark = meta.Mark;
  return (
    <div className="relative flex-shrink-0">
      <Avatar initial={initial} avatar={avatar} size={size} text={text} />
      <span
        title={meta.name}
        className={clsx(
          badge,
          meta.tint,
          "absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white flex items-center justify-center shadow-sm transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:rotate-[-10deg]",
        )}
      >
        <Mark className={mark} />
      </span>
    </div>
  );
}

export default function GuestInboxPage() {
  const { activeWorkspace } = useAuthStore();
  const {
    conversations,
    activeConversationId,
    messages,
    setConversations,
    setActiveConversation,
    addOrUpdateConversation,
    setMessages,
    appendMessage,
  } = useInboxStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [channel, setChannel] = useState("all");
  const [byChannel, setByChannel] = useState({});
  // Channels beyond the core four (OTA inboxes + WhatsApp) that this
  // workspace has connected — appended after the core tabs.
  const [extraConnected, setExtraConnected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const endRef = useRef(null);

  // Kept in refs so the socket handlers (bound once) always read the current
  // channel/conversation instead of a stale closure value.
  const channelRef = useRef(channel);
  channelRef.current = channel;
  const activeIdRef = useRef(activeConversationId);
  activeIdRef.current = activeConversationId;

  const active = conversations.find((c) => c._id === activeConversationId);
  const activeMsgs = messages[activeConversationId] || [];
  const activeMeta = channelMeta(active?.channelType);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (channelRef.current !== "all") params.set("channel", channelRef.current);
      const statusQuery = FILTERS.find((f) => f.id === filter)?.query;
      if (statusQuery) params.set("status", statusQuery);
      if (search.trim()) params.set("search", search.trim());
      const qs = params.toString();
      const { data } = await api.get(`/inbox${qs ? `?${qs}` : ""}`);
      setConversations(data.conversations || []);
      setByChannel(data.byChannel || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, setConversations]);

  // The core four tabs (Airbnb, Booking.com, Expedia, WhatsApp) always show.
  // Any other channel the hotel has connected directly is appended. Fetched
  // once per workspace — not on every incoming message.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/channels/status");
        if (cancelled) return;
        setExtraConnected(
          CHANNEL_ORDER.filter(
            (k) =>
              !CORE_CHANNELS.includes(k) && data?.[k]?.status === "connected",
          ),
        );
      } catch {
        // Non-fatal: the core tabs still show.
        if (!cancelled) setExtraConnected([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspace]);

  const connected = useMemo(
    () => [...CORE_CHANNELS, ...extraConnected],
    [extraConnected],
  );

  // Refetch whenever the channel tab, status filter or search text changes.
  // Search is debounced so typing doesn't hammer the endpoint.
  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, channel, search]);

  useEffect(() => {
    const sock = initSocket();
    sock.on("message:new", ({ conversation, message }) => {
      // Only fold in conversations that belong to the tab being viewed.
      const ch = channelRef.current;
      if (ch !== "all" && conversation.channelType !== ch) return;
      addOrUpdateConversation(conversation);
      if (conversation._id === activeIdRef.current)
        appendMessage(conversation._id, message);
    });
    sock.on("conversation:updated", (c) => {
      const ch = channelRef.current;
      if (ch !== "all" && c.channelType !== ch) return;
      addOrUpdateConversation(c);
    });
    return () => {
      sock.off("message:new");
      sock.off("conversation:updated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeConversationId) loadMsgs(activeConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [activeMsgs],
  );

  const loadMsgs = async (id) => {
    try {
      const { data } = await api.get(`/inbox/${id}/messages`);
      setMessages(id, data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Switching channel closes whatever chat was open — it may not be in the new
  // list at all.
  const pickChannel = (key) => {
    if (key === channel) return;
    setActiveConversation(null);
    setChannel(key);
  };

  const takeover = async () => {
    try {
      await api.post(`/inbox/${activeConversationId}/takeover`);
      toast.success("You're handling this chat now");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };
  const resolve = async () => {
    try {
      await api.post(`/inbox/${activeConversationId}/resolve`);
      toast.success("Marked as resolved");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };
  const toggleBot = async () => {
    if (!active) return;
    const next = !active.botEnabled;
    try {
      const { data } = await api.patch(`/inbox/${activeConversationId}/bot`, {
        enabled: next,
      });
      addOrUpdateConversation(data.conversation);
      toast.success(next ? "AI replies resumed" : "AI paused for this chat");
    } catch (e) {
      toast.error("Failed");
    }
  };
  const sendReply = async () => {
    if (!replyText.trim() || !activeConversationId) return;
    setSending(true);
    try {
      const { data } = await api.post(`/inbox/${activeConversationId}/send`, {
        text: replyText,
      });
      appendMessage(activeConversationId, data.message);
      setReplyText("");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSending(false);
    }
  };
  const addTag = async () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || !active) return;
    const tags = Array.from(new Set([...(active.tags || []), t]));
    try {
      const { data } = await api.patch(`/inbox/${activeConversationId}/tags`, {
        tags,
      });
      addOrUpdateConversation(data.conversation);
      setTagInput("");
    } catch {
      toast.error("Failed to tag");
    }
  };
  const removeTag = async (tag) => {
    if (!active) return;
    const tags = (active.tags || []).filter((t) => t !== tag);
    try {
      const { data } = await api.patch(`/inbox/${activeConversationId}/tags`, {
        tags,
      });
      addOrUpdateConversation(data.conversation);
    } catch {
      toast.error("Failed");
    }
  };

  // Server already applied channel + status + search; this is a safety net for
  // rows that arrive over the socket between fetches.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (channel !== "all" && c.channelType !== channel) return false;
      if (filter === "awaiting_human") {
        if (c.status !== "awaiting_human" && c.status !== "human_active")
          return false;
      } else if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.contact?.name?.toLowerCase().includes(q) ||
        c.contact?.username?.toLowerCase().includes(q) ||
        c.contact?.phone?.toLowerCase().includes(q) ||
        c.lastMessage?.text?.toLowerCase().includes(q)
      );
    });
  }, [conversations, channel, filter, search]);

  // OTA inboxes + WhatsApp are always there to switch between.
  const showTabs = connected.length >= 2;
  const tabs = useMemo(
    () =>
      showTabs
        ? [
            { key: "all", label: "All" },
            ...connected.map((k) => ({ key: k, ...channelMeta(k) })),
          ]
        : [],
    [showTabs, connected],
  );

  const allTotal = useMemo(
    () =>
      Object.values(byChannel).reduce((n, v) => n + (v?.total || 0), 0),
    [byChannel],
  );
  const allUnread = useMemo(
    () => Object.values(byChannel).reduce((n, v) => n + (v?.unread || 0), 0),
    [byChannel],
  );

  const emptyLabel =
    channel === "all"
      ? "No guest messages yet"
      : `No ${channelMeta(channel).shortName} messages yet`;

  return (
    // h-full + overflow-hidden pins the whole inbox to the viewport height so
    // each pane scrolls on its own — the list stays put while the chat scrolls.
    <div className="relative flex h-full min-h-0 overflow-hidden">
      {/* List pane */}
      <div
        className={clsx(
          "relative flex-shrink-0 border-r border-white/70 bg-white/85 shadow-[1px_0_0_rgba(15,23,42,0.05)] flex flex-col h-full min-h-0",
          "w-full md:w-[21rem] lg:w-[23rem]",
          activeConversationId && "hidden md:flex",
        )}
      >
        {/* ── Glass header ── */}
        <div className="relative px-4 pb-3.5 pt-4">
          <div className="relative mb-3.5 flex items-center gap-2.5">
            <span className="group grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_22px_-10px_rgba(255,61,119,0.6)]">
              <MessagesSquare className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-[17px] font-semibold leading-none tracking-[-0.02em] text-ink-900">
                Guest{" "}
                <span className="font-serif font-normal italic">messages</span>
              </h2>
              <p className="mt-1 text-[11px] tabular-nums text-ink-500">
                {conversations.length} conversation
                {conversations.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-500/20">
              <PulseDot color="bg-emerald-500" className="!h-1.5 !w-1.5 [&>span]:!h-1.5 [&>span]:!w-1.5" />
              Live
            </span>
          </div>
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition-all duration-500 ease-spring group-focus-within:rotate-[-12deg] group-focus-within:scale-110 group-focus-within:text-sunset-flame" />
            <input
              className="input rounded-2xl py-2.5 pl-10 text-sm"
              placeholder="Search guests by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Channel tabs — the primary split ── */}
        {showTabs && (
          <div className="no-scrollbar flex gap-1 overflow-x-auto border-t border-ink-900/[0.05] px-3 pb-1.5 pt-2">
            {tabs.map((t) => {
              const isAll = t.key === "all";
              const stats = isAll
                ? { total: allTotal, unread: allUnread }
                : byChannel[t.key] || { total: 0, unread: 0 };
              const on = channel === t.key;
              const Mark = t.Mark;
              return (
                <motion.button
                  key={t.key}
                  type="button"
                  onClick={() => pickChannel(t.key)}
                  title={isAll ? "All channels" : t.name}
                  whileTap={{ scale: 0.94 }}
                  className={clsx(
                    "group relative isolate inline-flex min-h-[34px] flex-shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-300",
                    on ? "text-white" : "text-ink-500 hover:bg-white/70 hover:text-ink-900",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="inbox-channel-pill"
                      transition={spring}
                      className="absolute inset-0 -z-10 rounded-xl bg-ink-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_6px_16px_-8px_rgba(15,23,42,0.6)]"
                    />
                  )}
                  {Mark ? (
                    <Mark
                      className={clsx(
                        "h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]",
                        on ? "text-white" : "text-ink-400",
                      )}
                    />
                  ) : (
                    <InboxIcon
                      className={clsx(
                        "h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]",
                        on ? "text-white" : "text-ink-400",
                      )}
                    />
                  )}
                  <span>{isAll ? "All" : t.shortName}</span>
                  {stats.total > 0 && (
                    <span
                      className={clsx(
                        "min-w-[1.15rem] rounded-full px-1 py-px text-center text-[10px] font-semibold tabular-nums",
                        stats.unread > 0
                          ? "bg-sunset text-white shadow-[0_2px_6px_-2px_rgba(255,61,119,0.6)]"
                          : on
                            ? "bg-white/15 text-white/80"
                            : "bg-ink-900/[0.06] text-ink-500",
                      )}
                    >
                      {stats.unread > 0 ? stats.unread : stats.total}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Status filter chips */}
        <div className="no-scrollbar overflow-x-auto border-b border-ink-900/[0.06] px-3 pb-2.5 pt-1.5">
          <SlidingTabs
            size="sm"
            items={FILTERS.map((f) => ({ value: f.id, label: f.label }))}
            value={filter}
            onChange={setFilter}
            className="flex-nowrap whitespace-nowrap"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {loading && filtered.length === 0 && (
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl px-3 py-3">
                  <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-ink-900/[0.06]" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-ink-900/[0.06]" />
                    <div className="h-2.5 w-4/5 animate-pulse rounded bg-ink-900/[0.05]" />
                    <div className="h-4 w-16 animate-pulse rounded-full bg-ink-900/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="px-4 py-12 text-center">
              <div className="relative mx-auto mb-4 h-14 w-14">
                <div className="absolute inset-0 rounded-2xl bg-sunset opacity-20 blur-2xl" />
                <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/90 text-sunset-flame ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff,0_10px_24px_-14px_rgba(255,106,43,0.5)]">
                  <InboxIcon className="h-6 w-6" strokeWidth={1.8} />
                </div>
              </div>
              <p className="font-display text-sm font-semibold text-ink-800">{emptyLabel}</p>
              <p className="mt-1 text-[12px] text-ink-500">
                {search || filter !== "all"
                  ? "Nothing matches that filter — try clearing it."
                  : "When guests message you, they'll appear here."}
              </p>
            </div>
          )}
          {filtered.map((conv, idx) => {
            const meta = STATUS[conv.status] || STATUS.open;
            const c = conv.contact || {};
            const displayName =
              c.name || c.username || conv.participantName || "Guest";
            const handle = c.username || c.phone || "";
            const initial = displayName[0]?.toUpperCase() || "?";
            const preview =
              conv.lastMessage?.text || conv.lastMessagePreview || "";
            const isActive = activeConversationId === conv._id;
            return (
              <motion.button
                key={conv._id}
                layout="position"
                onClick={() => setActiveConversation(conv._id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx, 10) * 0.025, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "group relative isolate mb-0.5 w-full rounded-2xl px-3 py-3 text-left transition-colors duration-300",
                  !isActive && "hover:bg-white/70",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="inbox-active-row"
                    transition={spring}
                    className="absolute inset-0 -z-10 rounded-2xl bg-white shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.18),0_10px_26px_-14px_rgba(255,61,119,0.45)]"
                  >
                    <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-sunset" />
                  </motion.span>
                )}
                <div className="flex items-start gap-3">
                  <ChannelAvatar
                    initial={initial}
                    avatar={c.avatar}
                    channelType={conv.channelType}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="truncate text-[13px] font-semibold text-ink-900">
                        {displayName}
                      </p>
                      <span className="flex-shrink-0 whitespace-nowrap text-[10px] tabular-nums text-ink-400">
                        {dayjs(conv.lastMessageAt || conv.updatedAt).fromNow(
                          true,
                        )}
                      </span>
                    </div>
                    {handle && (
                      <p className="truncate text-[11px] font-medium leading-tight text-sunset-flame">
                        {c.username ? `@${c.username}` : handle}
                      </p>
                    )}
                    <p className="mt-1 truncate text-[12px] text-ink-500">
                      {preview || (
                        <span className="italic text-ink-300">
                          No messages yet
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      {conv.botEnabled === false && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-500/25">
                          <Pause className="h-2.5 w-2.5" /> AI off
                        </span>
                      )}
                      {(c.tags || []).slice(0, 1).map((t) => (
                        <span
                          key={t}
                          className="max-w-[80px] truncate rounded-full bg-ink-900/[0.05] px-2 py-0.5 text-[10px] font-medium text-ink-500"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Chat pane */}
      {active ? (
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
          {/* Chat header — light glass */}
          <div className="relative z-10 border-b border-white/70 bg-white/90 px-3 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.05)] sm:px-5">
            <button
              onClick={() => setActiveConversation(null)}
              className="group mb-2 inline-flex min-h-[32px] items-center gap-1 rounded-lg pr-2 text-xs font-semibold text-sunset-flame md:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-x-1" /> All messages
            </button>
            <div className="relative flex flex-wrap items-center justify-between gap-2">
              <div className="group flex min-w-0 items-center gap-3">
                <ChannelAvatar
                  initial={(
                    active.contact?.name ||
                    active.contact?.username ||
                    active.participantName ||
                    "G"
                  )[0]?.toUpperCase()}
                  avatar={active.contact?.avatar}
                  channelType={active.channelType}
                  size="w-11 h-11"
                  text="text-sm"
                  badge="w-[18px] h-[18px]"
                  mark="w-3 h-3"
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                    {active.contact?.name ||
                      active.contact?.username ||
                      active.participantName ||
                      "Guest"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-500">
                      <activeMeta.Mark className="h-3 w-3" />
                      {activeMeta.shortName}
                    </span>
                    {(active.contact?.username || active.contact?.phone) && (
                      <span className="truncate text-[11px] font-medium text-ink-400">
                        {active.contact.username
                          ? `@${active.contact.username}`
                          : active.contact.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink-600">
                      <PulseDot
                        color={clsx(
                          active.status === "human_active"
                            ? "bg-emerald-500"
                            : active.status === "awaiting_human"
                              ? "bg-amber-500"
                              : "bg-sunset-flame",
                        )}
                        className="!h-1.5 !w-1.5 [&>span]:!h-1.5 [&>span]:!w-1.5"
                      />
                      {(STATUS[active.status] || STATUS.open).label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <motion.button
                  onClick={toggleBot}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  className={clsx(
                    "group flex min-h-[34px] items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold ring-1 ring-inset transition-colors duration-300",
                    active.botEnabled === false
                      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 hover:bg-emerald-500/15"
                      : "bg-white/80 text-ink-700 ring-ink-900/10 shadow-[inset_0_1px_0_#fff] hover:bg-white",
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {active.botEnabled === false ? (
                      <motion.span
                        key="resume"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.18 }}
                        className="inline-flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" /> Resume AI
                      </motion.span>
                    ) : (
                      <motion.span
                        key="pause"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.18 }}
                        className="inline-flex items-center gap-1"
                      >
                        <Pause className="h-3 w-3" /> Pause AI
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                {active.status !== "human_active" && (
                  <button
                    onClick={takeover}
                    className="btn-primary group min-h-[34px] gap-1 rounded-xl px-3 py-1.5 text-[11px]"
                  >
                    <UserCheck className="h-3 w-3 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" /> Take over
                  </button>
                )}
                {active.status !== "resolved" && active.status !== "closed" && (
                  <motion.button
                    onClick={resolve}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="group flex min-h-[34px] items-center gap-1 rounded-xl bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-ink-700 ring-1 ring-inset ring-ink-900/10 shadow-[inset_0_1px_0_#fff] transition-colors duration-300 hover:bg-white hover:text-emerald-700"
                  >
                    <CheckCheck className="h-3 w-3 transition-transform duration-500 ease-spring group-hover:scale-125" /> Resolve
                  </motion.button>
                )}
              </div>
            </div>

            {/* Tag row */}
            <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
              <TagIcon className="h-3 w-3 text-ink-400" />
              <AnimatePresence initial={false}>
                {(active.tags || []).map((t) => (
                  <motion.span
                    key={t}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="inline-flex items-center gap-0.5 rounded-full bg-sunset-soft px-2 py-0.5 text-[10px] font-semibold text-sunset-flame ring-1 ring-inset ring-sunset-flame/20"
                  >
                    #{t}
                    <button
                      onClick={() => removeTag(t)}
                      className="rounded-full p-0.5 transition-all duration-300 ease-spring hover:rotate-90 hover:bg-white/70 hover:text-ink-900"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <div className="group relative">
                <Plus className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-400 transition-transform duration-500 ease-spring group-focus-within:rotate-90 group-focus-within:text-sunset-flame" />
                <input
                  className="h-6 w-28 rounded-full bg-white/70 pl-6 pr-2 text-[11px] text-ink-800 outline-none ring-1 ring-inset ring-ink-900/10 transition-all duration-300 placeholder:text-ink-400 focus:w-36 focus:bg-white focus:ring-sunset-flame/40"
                  placeholder="add tag…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-5 sm:px-5">
            <AnimatePresence initial={false}>
              {activeMsgs.map((m) => (
                <Bubble key={m._id} msg={m} />
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Reply box */}
          <div className="border-t border-white/70 bg-white/90 p-3 shadow-[0_-1px_0_rgba(15,23,42,0.05)]">
            <AnimatePresence initial={false}>
              {active.botEnabled === false && (
                <motion.div
                  key="paused"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={spring}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 rounded-xl bg-amber-400/15 px-2.5 py-1.5 text-[11px] text-amber-800 ring-1 ring-inset ring-amber-500/25">
                    <Pause className="h-3 w-3 flex-shrink-0" />
                    The AI is paused — only your manual replies go out.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-end gap-2 rounded-2xl bg-white/85 p-1.5 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff,0_8px_24px_-16px_rgba(15,23,42,0.25)] transition-all duration-300 focus-within:ring-2 focus-within:ring-sunset-flame/40 focus-within:shadow-[inset_0_1px_0_#fff,0_0_0_4px_rgba(255,106,43,0.08),0_12px_28px_-16px_rgba(255,61,119,0.4)]">
              <textarea
                className="max-h-32 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-400"
                rows={1}
                placeholder={`Reply on ${activeMeta.shortName}…`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
              />
              <Magnetic strength={0.25}>
                <motion.button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  whileTap={{ scale: 0.88 }}
                  animate={{ scale: replyText.trim() ? 1 : 0.94 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  aria-label="Send"
                  className="group relative grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_20px_-8px_rgba(255,61,119,0.6)] transition-opacity disabled:opacity-40 disabled:shadow-none"
                >
                  {sending ? (
                    <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Send
                      className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:rotate-[-12deg]"
                      strokeWidth={1.8}
                    />
                  )}
                </motion.button>
              </Magnetic>
            </div>
            <p className="mt-1.5 hidden px-1 text-[10px] text-ink-400 sm:block">
              Enter to send · Shift+Enter for a new line
            </p>
          </div>
        </div>
      ) : (
        <div className="relative hidden flex-1 items-center justify-center overflow-hidden text-center md:flex">
          {/* soft sunset glow */}
          <div className="pointer-events-none absolute -right-10 -top-20 h-80 w-80 rounded-full bg-sunset-magenta/15 blur-[120px]" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-sunset-gold/20 blur-[120px]" />
          <Reveal className="relative max-w-sm px-6">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 rounded-3xl bg-sunset opacity-30 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/90 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff,0_12px_30px_-14px_rgba(15,23,42,0.25)]">
                <BotlifyMark size={56} className="drop-shadow" />
              </div>
            </div>
            <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900">
              Every guest,{" "}
              <span className="font-serif font-normal italic">every channel</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Pick a conversation on the left to reply, take over from the AI,
              tag, and resolve — new messages slide in live.
            </p>
            {connected.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                {connected.map((k, i) => {
                  const m = channelMeta(k);
                  return (
                    <motion.span
                      key={k}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.1 + i * 0.05 }}
                      whileHover={{ y: -2 }}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm",
                        m.tint,
                      )}
                    >
                      <m.Mark className="h-3 w-3" />
                      {m.shortName}
                    </motion.span>
                  );
                })}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {["AI answers guests", "Take over any chat", "Booking context"].map(
                (f) => (
                  <span
                    key={f}
                    className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-medium text-ink-600 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]"
                  >
                    {f}
                  </span>
                ),
              )}
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}

function Bubble({ msg }) {
  const out = msg.direction === "outbound";
  const isBot = msg.sentBy === "bot" || msg.metadata?.triggerType;
  if (msg.isInternalNote) {
    return (
      <motion.div
        layout="position"
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        className="flex justify-center"
      >
        <div className="max-w-[80%] rounded-2xl bg-amber-50/90 px-3 py-1.5 text-center text-xs text-amber-800 ring-1 ring-inset ring-amber-300/50 shadow-[inset_0_1px_0_#fff]">
          📝 {msg.text}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      style={{ transformOrigin: out ? "100% 100%" : "0% 100%" }}
      className={`flex ${out ? "justify-end" : "justify-start"}`}
    >
      <div
        className={clsx(
          "relative max-w-[82%] overflow-hidden px-3.5 py-2.5 text-sm sm:max-w-[70%]",
          out
            ? "rounded-2xl rounded-br-md bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.06),0_10px_24px_-12px_rgba(255,61,119,0.55)]"
            : "rounded-2xl rounded-bl-md bg-white text-ink-800 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff,0_4px_14px_-8px_rgba(15,23,42,0.18)]",
        )}
      >
        {out && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
          />
        )}
        {msg.type === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt=""
            className="relative mb-1 max-w-full rounded-[14px]"
          />
        )}
        <p className="relative whitespace-pre-wrap leading-relaxed">
          {msg.text || msg.caption || ""}
        </p>
        <div
          className={clsx(
            "relative mt-1 flex items-center gap-1 text-[10px] tabular-nums",
            out ? "text-white/75" : "text-ink-400",
          )}
        >
          {isBot && out && (
            <span className="inline-flex items-center gap-0.5 font-semibold">
              <Sparkles className="h-2.5 w-2.5" /> AI ·
            </span>
          )}
          <span>{dayjs(msg.createdAt).format("h:mm A")}</span>
        </div>
      </div>
    </motion.div>
  );
}
