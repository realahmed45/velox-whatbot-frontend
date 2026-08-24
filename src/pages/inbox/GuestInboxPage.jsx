/**
 * Guest inbox — every channel Botlify answers on, in one two-pane screen.
 *
 * Conversations are split by platform first: a row of channel tabs (All ·
 * WhatsApp · Instagram · Messenger · Telegram) sits above the list, each
 * carrying its brand mark and a count/unread badge from the server's
 * `byChannel` totals. Picking a tab refetches with `?channel=`; "All" omits it.
 * Tabs only render for channels the workspace has actually connected, and are
 * hidden entirely when fewer than two are live — a single-channel hotel gets
 * the plain list it had before.
 *
 * Responsive: list-only on mobile, swaps to the chat when a conversation opens.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BotlifyMark from "@/components/BotlifyMark";
import { CHANNEL_ORDER, channelMeta } from "@/components/ChannelMarks";
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
dayjs.extend(relativeTime);

const STATUS = {
  bot_active: {
    label: "AI handled",
    cls: "bg-brand-100 text-brand-700 ring-1 ring-brand-200/60",
  },
  open: { label: "Open", cls: "bg-ink-100 text-ink-600 ring-1 ring-ink-200/60" },
  awaiting_human: {
    label: "Needs you",
    cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200/60",
  },
  human_active: {
    label: "You",
    cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/60",
  },
  resolved: {
    label: "Resolved",
    cls: "bg-ink-100 text-ink-500 ring-1 ring-ink-200/60",
  },
  closed: {
    label: "Closed",
    cls: "bg-ink-100 text-ink-500 ring-1 ring-ink-200/60",
  },
};

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
          "rounded-full object-cover ring-1 ring-ink-200 flex-shrink-0",
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
        "rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white flex-shrink-0",
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
          "absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white flex items-center justify-center shadow-sm",
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
  const [connected, setConnected] = useState([]);
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

  // Which channels this hotel has actually connected — tabs for anything else
  // would just be dead ends.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/channels/status");
        if (cancelled) return;
        setConnected(
          CHANNEL_ORDER.filter((k) => data?.[k]?.status === "connected"),
        );
      } catch {
        // Non-fatal: without the status map we simply show no channel tabs.
        if (!cancelled) setConnected([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspace]);

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

  // Tabs only earn their space when there's more than one channel to switch
  // between.
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
    <div className="flex h-full min-h-0 overflow-hidden bg-ink-50">
      {/* List pane */}
      <div
        className={clsx(
          "flex-shrink-0 border-r border-ink-100 bg-white flex flex-col h-full min-h-0",
          "w-full md:w-[21rem] lg:w-[23rem]",
          activeConversationId && "hidden md:flex",
        )}
      >
        {/* ── Dark gradient header (matches the rest of the dashboard) ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-ink-900 to-ink-800 text-white px-4 pt-4 pb-3.5">
          <div className="pointer-events-none absolute -top-16 right-4 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative flex items-center gap-2.5 mb-3.5">
            <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <MessagesSquare className="w-5 h-5 text-brand-300" />
            </span>
            <div>
              <h2 className="font-black text-[17px] leading-none tracking-tight">
                Guest messages
              </h2>
              <p className="text-[11px] text-white/50 mt-1">
                {conversations.length} conversation
                {conversations.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              className="w-full rounded-xl bg-white/10 border border-white/15 pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/40 focus:bg-white/15 focus:border-white/30 outline-none transition"
              placeholder="Search guests by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Channel tabs — the primary split ── */}
        {showTabs && (
          <div className="flex gap-1 px-2 pt-2 pb-1.5 border-b border-ink-100 overflow-x-auto no-scrollbar">
            {tabs.map((t) => {
              const isAll = t.key === "all";
              const stats = isAll
                ? { total: allTotal, unread: allUnread }
                : byChannel[t.key] || { total: 0, unread: 0 };
              const on = channel === t.key;
              const Mark = t.Mark;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => pickChannel(t.key)}
                  title={isAll ? "All channels" : t.name}
                  className={clsx(
                    "relative flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                    on
                      ? "bg-ink-900 text-white border-ink-900 shadow-sm"
                      : "bg-white border-ink-200 text-ink-500 hover:border-brand-300 hover:text-brand-600",
                  )}
                >
                  {Mark ? (
                    <Mark
                      className={clsx(
                        "w-3.5 h-3.5",
                        on ? "text-white" : "text-ink-400",
                      )}
                    />
                  ) : (
                    <InboxIcon
                      className={clsx(
                        "w-3.5 h-3.5",
                        on ? "text-white" : "text-ink-400",
                      )}
                    />
                  )}
                  <span>{isAll ? "All" : t.shortName}</span>
                  {stats.total > 0 && (
                    <span
                      className={clsx(
                        "min-w-[1.15rem] text-center px-1 py-px rounded-full text-[10px] font-bold",
                        stats.unread > 0
                          ? "bg-brand-500 text-white"
                          : on
                            ? "bg-white/15 text-white/80"
                            : "bg-ink-100 text-ink-500",
                      )}
                    >
                      {stats.unread > 0 ? stats.unread : stats.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Status filter chips */}
        <div className="flex gap-1.5 px-3 py-2.5 border-b border-ink-100 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={clsx(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border",
                filter === f.id
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/25"
                  : "border-ink-200 text-ink-500 hover:border-brand-300 hover:text-brand-600",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading && filtered.length === 0 && (
            <div className="flex justify-center py-12">
              <span className="block w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 ring-1 ring-brand-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <InboxIcon className="w-6 h-6 text-brand-500" />
              </div>
              <p className="text-xs text-ink-700 font-bold">{emptyLabel}</p>
              <p className="text-[11px] text-ink-400 mt-1">
                {search || filter !== "all"
                  ? "Nothing matches that filter — try clearing it."
                  : "When guests message you, they'll appear here."}
              </p>
            </div>
          )}
          {filtered.map((conv) => {
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
              <button
                key={conv._id}
                onClick={() => setActiveConversation(conv._id)}
                className={clsx(
                  "w-full text-left px-3 py-3 border-b border-ink-50 border-l-[3px] border-l-transparent transition-colors",
                  isActive
                    ? "bg-brand-50 border-l-brand-500"
                    : "hover:bg-ink-50/70",
                )}
              >
                <div className="flex items-start gap-3">
                  <ChannelAvatar
                    initial={initial}
                    avatar={c.avatar}
                    channelType={conv.channelType}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-[13px] font-bold text-ink-900 truncate">
                        {displayName}
                      </p>
                      <span className="text-[10px] text-ink-400 flex-shrink-0 whitespace-nowrap">
                        {dayjs(conv.lastMessageAt || conv.updatedAt).fromNow(
                          true,
                        )}
                      </span>
                    </div>
                    {handle && (
                      <p className="text-[11px] text-brand-600 font-semibold truncate leading-tight">
                        {c.username ? `@${c.username}` : handle}
                      </p>
                    )}
                    <p className="text-[12px] text-ink-500 truncate mt-1">
                      {preview || (
                        <span className="italic text-ink-300">
                          No messages yet
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      {conv.botEnabled === false && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200/60 inline-flex items-center gap-0.5">
                          <Pause className="w-2.5 h-2.5" /> AI off
                        </span>
                      )}
                      {(c.tags || []).slice(0, 1).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-ink-100 text-ink-500 truncate max-w-[80px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat pane */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full bg-ink-50">
          {/* Chat header — dark, on-brand */}
          <div className="relative overflow-hidden bg-gradient-to-r from-ink-900 to-ink-800 text-white px-3 sm:px-5 py-3.5">
            <div className="pointer-events-none absolute -top-16 right-10 w-56 h-56 rounded-full bg-brand-500/15 blur-3xl" />
            <button
              onClick={() => setActiveConversation(null)}
              className="md:hidden mb-2 text-xs text-brand-300 font-bold inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All messages
            </button>
            <div className="relative flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
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
                  <p className="font-bold text-[15px] truncate">
                    {active.contact?.name ||
                      active.contact?.username ||
                      active.participantName ||
                      "Guest"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/60">
                      <activeMeta.Mark className="w-3 h-3" />
                      {activeMeta.shortName}
                    </span>
                    {(active.contact?.username || active.contact?.phone) && (
                      <span className="text-[11px] text-white/50 font-medium truncate">
                        {active.contact.username
                          ? `@${active.contact.username}`
                          : active.contact.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/70">
                      <span
                        className={clsx(
                          "w-1.5 h-1.5 rounded-full",
                          active.status === "human_active"
                            ? "bg-emerald-400"
                            : active.status === "awaiting_human"
                              ? "bg-amber-400"
                              : "bg-brand-400",
                        )}
                      />
                      {(STATUS[active.status] || STATUS.open).label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={toggleBot}
                  className={clsx(
                    "text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all",
                    active.botEnabled === false
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30"
                      : "bg-white/10 text-white/80 border border-white/15 hover:bg-white/20",
                  )}
                >
                  {active.botEnabled === false ? (
                    <>
                      <Play className="w-3 h-3" /> Resume AI
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3" /> Pause AI
                    </>
                  )}
                </button>
                {active.status !== "human_active" && (
                  <button
                    onClick={takeover}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1 transition-all"
                  >
                    <UserCheck className="w-3 h-3" /> Take over
                  </button>
                )}
                {active.status !== "resolved" && active.status !== "closed" && (
                  <button
                    onClick={resolve}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white/10 text-white/80 border border-white/15 hover:bg-white/20 flex items-center gap-1 transition-all"
                  >
                    <CheckCheck className="w-3 h-3" /> Resolve
                  </button>
                )}
              </div>
            </div>

            {/* Tag row */}
            <div className="relative flex items-center flex-wrap gap-1.5 mt-3">
              <TagIcon className="w-3 h-3 text-white/40" />
              {(active.tags || []).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold rounded-full bg-white/10 text-white/80 border border-white/15 px-2 py-0.5 inline-flex items-center gap-0.5"
                >
                  #{t}
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <div className="relative">
                <Plus className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                <input
                  className="text-[11px] h-6 pl-6 pr-2 w-28 rounded-full bg-white/10 border border-white/15 text-white placeholder-white/40 focus:bg-white/15 outline-none"
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
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-3 bg-ink-50">
            {activeMsgs.map((m) => (
              <Bubble key={m._id} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {/* Reply box */}
          <div className="bg-white border-t border-ink-100 p-3">
            {active.botEnabled === false && (
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 mb-2 flex items-center gap-1.5">
                <Pause className="w-3 h-3 flex-shrink-0" />
                The AI is paused — only your manual replies go out.
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-ink-50/50 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition p-1.5">
              <textarea
                className="resize-none flex-1 text-sm bg-transparent outline-none px-2.5 py-2 max-h-32"
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
              <button
                onClick={sendReply}
                disabled={sending || !replyText.trim()}
                className="bg-brand-500 hover:bg-brand-600 text-white p-2.5 rounded-xl shadow-sm shadow-brand-500/30 disabled:opacity-40 disabled:shadow-none transition-all flex-shrink-0 active:scale-95"
              >
                {sending ? (
                  <span className="block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-ink-400 mt-1.5 px-1">
              Enter to send · Shift+Enter for a new line
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-ink-50 via-white to-brand-50/40">
          {/* soft brand glow */}
          <div className="pointer-events-none absolute -top-20 -right-10 w-80 h-80 rounded-full bg-brand-200/30 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-amber-100/40 blur-[120px]" />
          <div className="relative max-w-sm px-6">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-3xl bg-brand-500/20 blur-xl" />
              <div className="relative w-24 h-24 rounded-3xl bg-white ring-1 ring-brand-100 shadow-xl shadow-brand-500/10 flex items-center justify-center animate-float">
                <BotlifyMark size={56} className="drop-shadow" />
              </div>
            </div>
            <p className="text-ink-900 font-black text-xl tracking-tight">
              Every guest, every channel
            </p>
            <p className="text-ink-500 text-sm mt-2 leading-relaxed">
              Pick a conversation on the left to reply, take over from the AI,
              tag, and resolve — new messages slide in live.
            </p>
            {connected.length > 0 && (
              <div className="mt-5 flex items-center justify-center gap-1.5 flex-wrap">
                {connected.map((k) => {
                  const m = channelMeta(k);
                  return (
                    <span
                      key={k}
                      className={clsx(
                        "inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-1 shadow-sm",
                        m.tint,
                      )}
                    >
                      <m.Mark className="w-3 h-3" />
                      {m.shortName}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              {["AI answers guests", "Take over any chat", "Booking context"].map(
                (f) => (
                  <span
                    key={f}
                    className="text-[11px] font-semibold text-ink-600 bg-white border border-ink-100 rounded-full px-3 py-1 shadow-sm"
                  >
                    {f}
                  </span>
                ),
              )}
            </div>
          </div>
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
      <div className="flex justify-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-2xl max-w-[80%] text-center shadow-sm">
          📝 {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={clsx(
          "max-w-[80%] sm:max-w-[70%] px-3.5 py-2.5 text-sm",
          out
            ? "bg-brand-500 text-white rounded-2xl rounded-br-md shadow-md shadow-brand-500/20"
            : "bg-white text-ink-800 border border-ink-100 rounded-2xl rounded-bl-md shadow-sm",
        )}
      >
        {msg.type === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt=""
            className="rounded-[14px] max-w-full mb-1"
          />
        )}
        <p className="leading-relaxed whitespace-pre-wrap">
          {msg.text || msg.caption || ""}
        </p>
        <div
          className={clsx(
            "flex items-center gap-1 text-[10px] mt-1",
            out ? "text-white/70" : "text-ink-400",
          )}
        >
          {isBot && out && (
            <span className="inline-flex items-center gap-0.5 font-semibold">
              <Sparkles className="w-2.5 h-2.5" /> AI ·
            </span>
          )}
          <span>{dayjs(msg.createdAt).format("h:mm A")}</span>
        </div>
      </div>
    </div>
  );
}
