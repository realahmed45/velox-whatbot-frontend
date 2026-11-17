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
import { useSearchParams } from "react-router-dom";
import BotlifyMark from "@/components/BotlifyMark";
import OtaLogo from "@/components/OtaLogo";
import {
  CHANNEL_ORDER,
  CORE_CHANNELS,
  WhatsAppMark,
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
    cls: "bg-[#FFF1EA] text-[#FF5A1F] ring-1 ring-inset ring-[#FF5A1F]/20",
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
 * Trip.com sits beside the other OTA inboxes so hotels see every platform
 * they sell on. Its brand tile comes from the shared OTA artwork.
 */
function TripComMark({ className = "w-6 h-6" }) {
  const m = /w-(\d+(?:\.\d+)?)/.exec(className);
  return <OtaLogo channelKey="trip" name="Trip.com" size={m ? Number(m[1]) * 4 : 24} />;
}
const TRIP_META = {
  key: "trip_com",
  name: "Trip.com",
  shortName: "Trip.com",
  Mark: TripComMark,
  tint: "bg-blue-50 text-blue-700",
  dot: "bg-blue-500",
  solid: "bg-blue-500 text-white",
};
const metaFor = (key) => (key === "trip_com" ? TRIP_META : channelMeta(key));

// OTA keys in the shared logo set (OtaLogo) — these render as full brand tiles.
const OTA_LOGO_KEY = {
  airbnb: "airbnb",
  booking_com: "booking",
  expedia: "expedia",
  trip_com: "trip",
};

/** A platform's brand tile: real OTA logos, WhatsApp green, "All" in black. */
function PlatformLogo({ channelKey, size = 32, round = false }) {
  const radius = round ? "9999px" : Math.round(size * 0.28) + "px";
  if (OTA_LOGO_KEY[channelKey]) {
    return (
      <span
        className="inline-grid flex-shrink-0 place-items-center overflow-hidden"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <OtaLogo channelKey={OTA_LOGO_KEY[channelKey]} name={metaFor(channelKey).name} size={size} />
      </span>
    );
  }
  if (channelKey === "all") {
    return (
      <span
        className="inline-grid flex-shrink-0 place-items-center bg-[#FF5A1F] text-white"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <InboxIcon style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2} />
      </span>
    );
  }
  if (channelKey === "whatsapp") {
    return (
      <span
        className="inline-grid flex-shrink-0 place-items-center bg-[#25D366] text-white"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <WhatsAppMark className="h-[55%] w-[55%]" />
      </span>
    );
  }
  const m = metaFor(channelKey);
  return (
    <span
      className={clsx("inline-grid flex-shrink-0 place-items-center", m.tint)}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <m.Mark className="h-[55%] w-[55%]" />
    </span>
  );
}

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
        "rounded-full bg-[#FF5A1F] flex items-center justify-center font-geist font-semibold text-white ring-2 ring-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_14px_-8px_rgba(255,90,31,0.6)] flex-shrink-0",
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
  const meta = metaFor(channelType);
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
  const activeMeta = metaFor(active?.channelType);

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

  // Notification deep link: /dashboard/inbox?c=<conversationId> opens that
  // chat. If it isn't in the loaded page of conversations, fetch it so the
  // chat pane can still show.
  const [searchParams] = useSearchParams();
  const deepId = searchParams.get("c");
  const deepHandled = useRef(null);
  useEffect(() => {
    if (!deepId || loading || deepHandled.current === deepId) return;
    deepHandled.current = deepId;
    if (channelRef.current !== "all") setChannel("all");
    setActiveConversation(deepId);
    if (!conversations.some((c) => c._id === deepId)) {
      api
        .get(`/inbox/${deepId}/messages`)
        .then(({ data }) => {
          const conv = data?.conversation;
          if (!conv) return;
          addOrUpdateConversation({
            ...conv,
            contact: conv.contact || {
              name: conv.participantName || conv.participantUsername || "Guest",
              username: conv.participantUsername || "",
              tags: [],
            },
          });
        })
        .catch(() => toast.error("That conversation is no longer available"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepId, loading]);

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

  // Trip.com joins the OTA group (after Expedia) so every platform shows.
  const displayChannels = useMemo(() => {
    const arr = connected.filter((k) => k !== "trip_com");
    const at = arr.indexOf("expedia");
    arr.splice(at >= 0 ? at + 1 : arr.length, 0, "trip_com");
    return arr;
  }, [connected]);

  // OTA inboxes + WhatsApp are always there to switch between.
  const showTabs = connected.length >= 2;
  const tabs = useMemo(
    () =>
      showTabs
        ? [
            { key: "all", label: "All" },
            ...displayChannels.map((k) => ({ key: k, ...metaFor(k) })),
          ]
        : [],
    [showTabs, displayChannels],
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
      : `No ${metaFor(channel).shortName} messages yet`;

  return (
    // h-full + overflow-hidden pins the whole inbox to the viewport height so
    // each pane scrolls on its own — the list stays put while the chat scrolls.
    <div className="relative flex h-full min-h-0 overflow-hidden bg-[#FAFAF9] font-geist">
      {/* ── Platform rail (desktop) — the primary split, with logos + counts ── */}
      {showTabs && (
        <aside className="hidden h-full min-h-0 w-[15.5rem] flex-shrink-0 flex-col border-r border-black/[0.06] bg-white xl:flex">
          <div className="px-4 pb-3 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/40">
              Platforms
            </p>
          </div>
          <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-4">
            {tabs.map((t) => {
              const isAll = t.key === "all";
              const stats = isAll
                ? { total: allTotal, unread: allUnread }
                : byChannel[t.key] || { total: 0, unread: 0 };
              const on = channel === t.key;
              return (
                <motion.button
                  key={t.key}
                  type="button"
                  onClick={() => pickChannel(t.key)}
                  title={isAll ? "All channels" : t.name}
                  whileTap={{ scale: 0.97 }}
                  className={clsx(
                    "group relative isolate flex min-h-[48px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold transition-colors duration-200",
                    on ? "text-white" : "text-[#0A0A0A] hover:bg-black/[0.04]",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="inbox-rail-pill"
                      transition={spring}
                      className="absolute inset-0 -z-10 rounded-xl bg-[#0A0A0A] shadow-[0_10px_24px_-14px_rgba(10,10,10,0.7)]"
                    />
                  )}
                  <span className="transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]">
                    <PlatformLogo channelKey={t.key} size={30} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {isAll ? "All messages" : t.name}
                  </span>
                  <CountPill stats={stats} on={on} />
                </motion.button>
              );
            })}
          </nav>
          <div className="border-t border-black/[0.06] p-4">
            <div className="flex items-center gap-2 rounded-xl bg-[#FFF1EA] px-3 py-2.5 text-[12px] font-medium text-[#0A0A0A]">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-[#FF5A1F]" strokeWidth={1.8} />
              AI replies on every platform, 24/7
            </div>
          </div>
        </aside>
      )}

      {/* ── Conversation list ── */}
      <div
        className={clsx(
          "relative flex h-full min-h-0 flex-shrink-0 flex-col border-r border-black/[0.06] bg-white",
          "w-full md:w-[21rem] lg:w-[23rem]",
          activeConversationId && "hidden md:flex",
        )}
      >
        <div className="relative px-4 pb-3 pt-4">
          <div className="relative mb-3.5 flex items-center gap-2.5">
            {channel === "all" ? (
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F] shadow-[0_10px_22px_-12px_rgba(10,10,10,0.7)]">
                <MessagesSquare className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
            ) : (
              <PlatformLogo channelKey={channel} size={40} />
            )}
            <div className="min-w-0">
              <h2 className="truncate font-geist text-[18px] font-semibold leading-none tracking-[-0.03em] text-[#0A0A0A]">
                {channel === "all" ? "Guest messages" : metaFor(channel).name}
              </h2>
              <p className="mt-1 text-[11px] tabular-nums text-black/50">
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
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35 transition-all duration-500 ease-spring group-focus-within:rotate-[-12deg] group-focus-within:scale-110 group-focus-within:text-[#FF5A1F]" />
            <input
              className="input rounded-xl bg-[#F5F5F4] py-2.5 pl-10 text-sm"
              placeholder="Search guests by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Channel tabs — the primary split on smaller screens */}
        {showTabs && (
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2 pt-0.5 xl:hidden">
            {tabs.map((t) => {
              const isAll = t.key === "all";
              const stats = isAll
                ? { total: allTotal, unread: allUnread }
                : byChannel[t.key] || { total: 0, unread: 0 };
              const on = channel === t.key;
              return (
                <motion.button
                  key={t.key}
                  type="button"
                  onClick={() => pickChannel(t.key)}
                  title={isAll ? "All channels" : t.name}
                  whileTap={{ scale: 0.94 }}
                  className={clsx(
                    "group relative isolate inline-flex min-h-[38px] flex-shrink-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[12px] font-semibold ring-1 ring-inset transition-colors duration-200",
                    on
                      ? "text-white ring-transparent"
                      : "bg-white text-[#0A0A0A] ring-black/[0.08] hover:ring-black/20",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="inbox-channel-pill"
                      transition={spring}
                      className="absolute inset-0 -z-10 rounded-full bg-[#0A0A0A]"
                    />
                  )}
                  <PlatformLogo channelKey={t.key} size={26} round />
                  <span>{isAll ? "All" : t.shortName}</span>
                  <CountPill stats={stats} on={on} />
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Status filter chips */}
        <div className="no-scrollbar overflow-x-auto border-b border-black/[0.06] px-3 pb-2.5 pt-1">
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
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl px-3 py-3">
                  <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-black/[0.06]" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-black/[0.06]" />
                    <div className="h-2.5 w-4/5 animate-pulse rounded bg-black/[0.05]" />
                    <div className="h-4 w-16 animate-pulse rounded-full bg-black/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="px-4 py-14 text-center">
              <div className="relative mx-auto mb-4 h-16 w-16">
                <div className="absolute inset-0 rounded-2xl bg-[#FF5A1F] opacity-20 blur-xl" />
                <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white ring-1 ring-black/[0.06] shadow-[0_12px_28px_-16px_rgba(255,90,31,0.6)]">
                  {channel === "all" ? (
                    <InboxIcon className="h-7 w-7 text-[#FF5A1F]" strokeWidth={1.8} />
                  ) : (
                    <PlatformLogo channelKey={channel} size={36} />
                  )}
                </div>
              </div>
              <p className="font-geist text-[15px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                {emptyLabel}
              </p>
              <p className="mx-auto mt-1 max-w-[16rem] text-[12px] leading-relaxed text-black/50">
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
            const unread = Number(conv.unreadByAgentCount || 0);
            const cMeta = metaFor(conv.channelType);
            return (
              <motion.button
                key={conv._id}
                layout="position"
                onClick={() => setActiveConversation(conv._id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx, 10) * 0.025, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.985 }}
                className={clsx(
                  "group relative isolate mb-0.5 w-full rounded-2xl px-3 py-3 text-left transition-colors duration-200",
                  !isActive && "hover:bg-black/[0.03]",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="inbox-active-row"
                    transition={spring}
                    className="absolute inset-0 -z-10 rounded-2xl bg-[#FFF1EA] ring-1 ring-inset ring-[#FF5A1F]/25"
                  >
                    <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-[#FF5A1F]" />
                  </motion.span>
                )}
                <div className="flex items-start gap-3">
                  <ChannelAvatar
                    initial={initial}
                    avatar={c.avatar}
                    channelType={conv.channelType}
                    size="w-11 h-11"
                    badge="w-[18px] h-[18px]"
                    mark="w-3 h-3"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={clsx(
                          "truncate text-[14px] text-[#0A0A0A]",
                          unread > 0 ? "font-bold" : "font-semibold",
                        )}
                      >
                        {displayName}
                      </p>
                      <span
                        className={clsx(
                          "flex-shrink-0 whitespace-nowrap text-[10px] tabular-nums",
                          unread > 0 ? "font-semibold text-[#FF5A1F]" : "text-black/40",
                        )}
                      >
                        {dayjs(conv.lastMessageAt || conv.updatedAt).fromNow(
                          true,
                        )}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium leading-tight text-black/45">
                      <span className="truncate">{cMeta.shortName}</span>
                      {handle && (
                        <>
                          <span className="text-black/20">·</span>
                          <span className="truncate">
                            {c.username ? `@${c.username}` : handle}
                          </span>
                        </>
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p
                        className={clsx(
                          "min-w-0 flex-1 truncate text-[12.5px]",
                          unread > 0 ? "font-medium text-[#0A0A0A]" : "text-black/55",
                        )}
                      >
                        {preview || (
                          <span className="text-black/30">No messages yet</span>
                        )}
                      </p>
                      {unread > 0 && (
                        <span className="grid h-[18px] min-w-[18px] flex-shrink-0 place-items-center rounded-full bg-[#FF5A1F] px-1 text-[10px] font-bold tabular-nums text-white">
                          {unread}
                        </span>
                      )}
                    </div>
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
                          className="max-w-[80px] truncate rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium text-black/55"
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

      {/* ── Chat pane ── */}
      {active ? (
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#FAFAF9]">
          {/* Chat header */}
          <div className="relative z-10 border-b border-black/[0.06] bg-white px-3 py-3 sm:px-5">
            <button
              onClick={() => setActiveConversation(null)}
              className="group mb-2 inline-flex min-h-[36px] items-center gap-1 rounded-lg pr-2 text-xs font-semibold text-[#0A0A0A] md:hidden"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-x-1" /> All messages
            </button>
            <div className="relative flex flex-wrap items-center justify-between gap-3">
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
                  <p className="truncate font-geist text-[16px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                    {active.contact?.name ||
                      active.contact?.username ||
                      active.participantName ||
                      "Guest"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        activeMeta.tint,
                      )}
                    >
                      <activeMeta.Mark className="h-3 w-3" />
                      via {activeMeta.shortName}
                    </span>
                    {(active.contact?.username || active.contact?.phone) && (
                      <span className="truncate text-[11px] font-medium text-black/45">
                        {active.contact.username
                          ? `@${active.contact.username}`
                          : active.contact.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-black/60">
                      <PulseDot
                        color={clsx(
                          active.status === "human_active"
                            ? "bg-emerald-500"
                            : active.status === "awaiting_human"
                              ? "bg-amber-500"
                              : "bg-[#FF5A1F]",
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
                    "group flex min-h-[38px] items-center gap-1 rounded-xl px-3 py-1.5 text-[12px] font-semibold ring-1 ring-inset transition-colors duration-200",
                    active.botEnabled === false
                      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 hover:bg-emerald-500/15"
                      : "bg-white text-[#0A0A0A] ring-black/10 hover:ring-black/25",
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
                        <Play className="h-3.5 w-3.5" /> Resume AI
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
                        <Pause className="h-3.5 w-3.5" /> Pause AI
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                {active.status !== "human_active" && (
                  <button
                    onClick={takeover}
                    className="btn group min-h-[38px] gap-1 rounded-xl bg-[#FF5A1F] px-3 py-1.5 text-[12px] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:-translate-y-0.5 hover:bg-[#E84A12] active:scale-[0.97]"
                  >
                    <UserCheck className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" /> Take over
                  </button>
                )}
                {active.status !== "resolved" && active.status !== "closed" && (
                  <motion.button
                    onClick={resolve}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="group flex min-h-[38px] items-center gap-1 rounded-xl bg-[#0A0A0A] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-black"
                  >
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-400 transition-transform duration-500 ease-spring group-hover:scale-125" /> Resolve
                  </motion.button>
                )}
              </div>
            </div>

            {/* Tag row */}
            <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
              <TagIcon className="h-3 w-3 text-black/35" />
              <AnimatePresence initial={false}>
                {(active.tags || []).map((t) => (
                  <motion.span
                    key={t}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="inline-flex items-center gap-0.5 rounded-full bg-[#FFF1EA] px-2 py-0.5 text-[10px] font-semibold text-[#E84A12] ring-1 ring-inset ring-[#FF5A1F]/20"
                  >
                    #{t}
                    <button
                      onClick={() => removeTag(t)}
                      className="rounded-full p-0.5 transition-all duration-300 ease-spring hover:rotate-90 hover:bg-white/70 hover:text-[#0A0A0A]"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <div className="group relative">
                <Plus className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-black/35 transition-transform duration-500 ease-spring group-focus-within:rotate-90 group-focus-within:text-[#FF5A1F]" />
                <input
                  className="h-7 w-28 rounded-full bg-[#F5F5F4] pl-6 pr-2 text-[11px] text-[#0A0A0A] outline-none ring-1 ring-inset ring-black/[0.06] transition-all duration-300 placeholder:text-black/35 focus:w-36 focus:bg-white focus:ring-[#FF5A1F]/40"
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
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(rgba(10,10,10,0.05)_1px,transparent_1px)] px-3 py-5 [background-size:18px_18px] sm:px-6">
            <AnimatePresence initial={false}>
              {activeMsgs.map((m, i) => {
                const day = m.createdAt ? dayjs(m.createdAt).format("YYYY-MM-DD") : "";
                const prevDay =
                  i > 0 && activeMsgs[i - 1]?.createdAt
                    ? dayjs(activeMsgs[i - 1].createdAt).format("YYYY-MM-DD")
                    : null;
                return (
                  <div key={m._id}>
                    {day && day !== prevDay && <DayDivider date={m.createdAt} />}
                    <Bubble msg={m} />
                  </div>
                );
              })}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Reply box */}
          <div className="border-t border-black/[0.06] bg-white p-3 sm:px-5">
            <AnimatePresence initial={false}>
              {active.botEnabled === false && (
                <motion.div
                  key="paused"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={spring}
                  className="mb-2"
                >
                  <div className="flex items-center gap-1.5 rounded-xl bg-amber-400/15 px-2.5 py-1.5 text-[11px] text-amber-800 ring-1 ring-inset ring-amber-500/25">
                    <Pause className="h-3 w-3 flex-shrink-0" />
                    The AI is paused — only your manual replies go out.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-end gap-2 rounded-2xl bg-[#F5F5F4] p-1.5 ring-1 ring-black/[0.06] transition-[box-shadow,background-color] duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF5A1F]/50 focus-within:shadow-[0_0_0_4px_rgba(255,90,31,0.08)]">
              <textarea
                className="max-h-32 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-[#0A0A0A] outline-none placeholder:text-black/35"
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
                  className="group relative grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-[#FF5A1F] text-white shadow-[0_8px_20px_-8px_rgba(255,90,31,0.7)] transition-[opacity,background-color] hover:bg-[#E84A12] disabled:opacity-40 disabled:shadow-none"
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
            <p className="mt-1.5 hidden px-1 text-[10px] text-black/35 sm:block">
              Enter to send · Shift+Enter for a new line
            </p>
          </div>
        </div>
      ) : (
        <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-[#FAFAF9] text-center md:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(10,10,10,0.05)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <Reveal className="relative max-w-md px-6">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 rounded-3xl bg-[#FF5A1F] opacity-25 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-[#0A0A0A] shadow-[0_20px_40px_-20px_rgba(10,10,10,0.7)]">
                <BotlifyMark size={56} className="drop-shadow" />
              </div>
            </div>
            <p className="font-geist text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[#0A0A0A]">
              Every guest, <span className="text-[#FF5A1F]">every channel</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-black/55">
              Pick a conversation to reply, take over from the AI, tag, and
              resolve — new messages slide in live.
            </p>
            {displayChannels.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {displayChannels.map((k, i) => {
                  const m = metaFor(k);
                  const n = byChannel[k]?.total || 0;
                  return (
                    <motion.button
                      key={k}
                      type="button"
                      onClick={() => pickChannel(k)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.1 + i * 0.05 }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[12px] font-semibold text-[#0A0A0A] ring-1 ring-black/[0.07] shadow-[0_6px_16px_-12px_rgba(10,10,10,0.4)]"
                    >
                      <PlatformLogo channelKey={k} size={28} round />
                      {m.shortName}
                      <span className="tabular-nums text-black/40">{n}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {["AI answers guests", "Take over any chat", "Booking context"].map(
                (f) => (
                  <span
                    key={f}
                    className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-medium text-black/55"
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

/** Unread / total count beside a platform name. */
function CountPill({ stats, on }) {
  if (!stats || !(stats.total > 0)) return null;
  return (
    <span
      className={clsx(
        "min-w-[1.35rem] rounded-full px-1.5 py-px text-center text-[10px] font-bold tabular-nums",
        stats.unread > 0
          ? "bg-[#FF5A1F] text-white"
          : on
            ? "bg-white/15 text-white/80"
            : "bg-black/[0.06] text-black/55",
      )}
    >
      {stats.unread > 0 ? stats.unread : stats.total}
    </span>
  );
}

function DayDivider({ date }) {
  const d = dayjs(date);
  const today = dayjs();
  const label = d.isSame(today, "day")
    ? "Today"
    : d.isSame(today.subtract(1, "day"), "day")
      ? "Yesterday"
      : d.format("ddd, D MMM YYYY");
  return (
    <div className="my-2 flex items-center justify-center">
      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/45 ring-1 ring-black/[0.06]">
        {label}
      </span>
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
        <div className="max-w-[80%] rounded-2xl bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-800 ring-1 ring-inset ring-amber-300/50">
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
          "relative max-w-[85%] overflow-hidden px-3.5 py-2.5 text-sm sm:max-w-[68%]",
          out
            ? isBot
              ? "rounded-2xl rounded-br-md bg-[#FF5A1F] text-white shadow-[0_10px_24px_-14px_rgba(255,90,31,0.7)]"
              : "rounded-2xl rounded-br-md bg-[#0A0A0A] text-white shadow-[0_10px_24px_-14px_rgba(10,10,10,0.6)]"
            : "rounded-2xl rounded-bl-md bg-white text-[#0A0A0A] ring-1 ring-black/[0.06] shadow-[0_4px_14px_-10px_rgba(10,10,10,0.25)]",
        )}
      >
        {msg.type === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt=""
            className="relative mb-1 max-w-full rounded-[14px]"
          />
        )}
        <p className="relative whitespace-pre-wrap break-words leading-relaxed">
          {msg.text || msg.caption || ""}
        </p>
        <div
          className={clsx(
            "relative mt-1 flex items-center gap-1 text-[10px] tabular-nums",
            out ? "text-white/70" : "text-black/40",
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
