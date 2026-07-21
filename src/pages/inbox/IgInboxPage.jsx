/**
 * Instagram Inbox — DM-style two-pane layout, Botlify orange/white theme.
 * Responsive: list-only on mobile, swaps to the chat when a DM is opened.
 * Calls /inbox?channel=instagram so WhatsApp conversations don't bleed in.
 */
import { useEffect, useRef, useState } from "react";
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
  Instagram,
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
    label: "Auto-DM",
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
    label: "Done",
    cls: "bg-ink-100 text-ink-500 ring-1 ring-ink-200/60",
  },
  closed: {
    label: "Closed",
    cls: "bg-ink-100 text-ink-500 ring-1 ring-ink-200/60",
  },
};

function Avatar({ initial, size = "w-9 h-9", text = "text-[11px]" }) {
  return (
    <div
      className={clsx(
        size,
        text,
        "rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-white shadow-md shadow-brand-500/20 ring-1 ring-white/30 flex-shrink-0",
      )}
    >
      {initial}
    </div>
  );
}

export default function IgInboxPage() {
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
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const endRef = useRef(null);

  const active = conversations.find((c) => c._id === activeConversationId);
  const activeMsgs = messages[activeConversationId] || [];

  useEffect(() => {
    load();
    const sock = initSocket();
    sock.on("message:new", ({ conversation, message }) => {
      if (conversation.channelType !== "instagram") return;
      addOrUpdateConversation(conversation);
      if (conversation._id === activeConversationId)
        appendMessage(conversation._id, message);
    });
    sock.on("conversation:updated", (c) => {
      if (c.channelType === "instagram") addOrUpdateConversation(c);
    });
    return () => {
      sock.off("message:new");
      sock.off("conversation:updated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeConversationId) loadMsgs(activeConversationId);
  }, [activeConversationId]);
  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [activeMsgs],
  );

  const load = async () => {
    try {
      const { data } = await api.get("/inbox?channel=instagram");
      setConversations(data.conversations || []);
    } catch (e) {
      console.error(e);
    }
  };
  const loadMsgs = async (id) => {
    try {
      const { data } = await api.get(`/inbox/${id}/messages`);
      setMessages(id, data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const takeover = async () => {
    try {
      await api.post(`/inbox/${activeConversationId}/takeover`);
      toast.success("You're handling this DM now");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };
  const resolve = async () => {
    try {
      await api.post(`/inbox/${activeConversationId}/resolve`);
      toast.success("Marked as done");
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
      toast.success(next ? "Auto-DM resumed" : "Auto-DM paused for this chat");
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

  const filtered = conversations.filter((c) => {
    const okStatus = filter === "all" || c.status === filter;
    const okText =
      !search ||
      c.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact?.username?.toLowerCase().includes(search.toLowerCase());
    return okStatus && okText;
  });

  return (
    <div className="flex h-full bg-gradient-to-b from-ink-50 to-ink-100/40">
      {/* List pane */}
      <div
        className={clsx(
          "flex-shrink-0 border-r border-ink-100 bg-white flex flex-col",
          "w-full md:w-80 lg:w-[22rem]",
          activeConversationId && "hidden md:flex",
        )}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-ink-100 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm shadow-brand-500/25">
              <Instagram className="w-4 h-4 text-white" />
            </span>
            <h2 className="font-black text-ink-900 text-base tracking-tight">
              DMs
            </h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full ring-1 ring-brand-100">
              {conversations.length} active
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              className="input !pl-9 !text-sm"
              placeholder="Search @username or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-0.5">
            {[
              "all",
              "bot_active",
              "awaiting_human",
              "human_active",
              "resolved",
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all border",
                  filter === f
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/30"
                    : "border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50",
                )}
              >
                {f === "all" ? "All" : STATUS[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 ring-1 ring-brand-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <InboxIcon className="w-6 h-6 text-brand-500" />
              </div>
              <p className="text-xs text-ink-700 font-bold">No DMs yet</p>
              <p className="text-[11px] text-ink-400 mt-1">
                When followers slide in, they'll appear here.
              </p>
            </div>
          )}
          {filtered.map((conv) => {
            const meta = STATUS[conv.status] || STATUS.open;
            const initial = (conv.contact?.name ||
              conv.contact?.username ||
              "?")[0]?.toUpperCase();
            return (
              <button
                key={conv._id}
                onClick={() => setActiveConversation(conv._id)}
                className={clsx(
                  "w-full text-left p-3 border-b border-ink-50 border-l-2 border-l-transparent hover:bg-ink-50/70 transition-colors",
                  activeConversationId === conv._id &&
                    "bg-brand-50/80 border-l-brand-500 hover:bg-brand-50",
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar initial={initial} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[13px] font-bold text-ink-900 truncate">
                        {conv.contact?.name ||
                          conv.contact?.username ||
                          "Unknown"}
                      </p>
                      <span className="text-[10px] text-ink-400 flex-shrink-0">
                        {dayjs(conv.updatedAt).fromNow(true)}
                      </span>
                    </div>
                    {conv.contact?.username && (
                      <p className="text-[10px] text-brand-600 font-medium">
                        @{conv.contact.username}
                      </p>
                    )}
                    <p className="text-[11px] text-ink-500 truncate mt-0.5">
                      {conv.lastMessage?.text || "…"}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      {conv.botEnabled === false && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200/60 inline-flex items-center gap-0.5">
                          <Pause className="w-2.5 h-2.5" /> off
                        </span>
                      )}
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="bg-white/90 backdrop-blur-xl border-b border-ink-100 px-3 sm:px-4 py-3 shadow-sm shadow-ink-100/40">
            <button
              onClick={() => setActiveConversation(null)}
              className="md:hidden mb-2 text-xs text-brand-600 font-bold inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All DMs
            </button>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  initial={(active.contact?.name ||
                    active.contact?.username ||
                    "?")[0]?.toUpperCase()}
                  size="w-10 h-10"
                  text="text-xs"
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-ink-900 truncate">
                    {active.contact?.name ||
                      active.contact?.username ||
                      "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {active.contact?.username && (
                      <a
                        href={`https://instagram.com/${active.contact.username}`}
                        target="_blank"
                        rel="noopener"
                        className="text-[11px] text-brand-600 font-medium hover:underline truncate"
                      >
                        @{active.contact.username}
                      </a>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${(STATUS[active.status] || STATUS.open).cls}`}
                    >
                      {(STATUS[active.status] || STATUS.open).label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={toggleBot}
                  className={clsx(
                    "text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all",
                    active.botEnabled === false
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
                  )}
                >
                  {active.botEnabled === false ? (
                    <>
                      <Play className="w-3 h-3" /> Resume bot
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3" /> Pause bot
                    </>
                  )}
                </button>
                {active.status !== "human_active" && (
                  <button
                    onClick={takeover}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1 transition-all shadow-sm shadow-brand-500/30"
                  >
                    <UserCheck className="w-3 h-3" /> Take over
                  </button>
                )}
                {active.status !== "resolved" && active.status !== "closed" && (
                  <button
                    onClick={resolve}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-ink-100 text-ink-700 hover:bg-ink-200 flex items-center gap-1 transition-all"
                  >
                    <CheckCheck className="w-3 h-3" /> Done
                  </button>
                )}
              </div>
            </div>

            {/* Tag row */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
              <TagIcon className="w-3 h-3 text-ink-400" />
              {(active.tags || []).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold rounded-full bg-brand-100 text-brand-700 ring-1 ring-brand-200/60 px-2 py-0.5 inline-flex items-center gap-0.5"
                >
                  #{t}
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-brand-900"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <div className="relative">
                <Plus className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-400" />
                <input
                  className="input text-[11px] !h-6 !py-0 !pl-6 !pr-2 w-28 rounded-full"
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gradient-to-b from-ink-50/60 to-ink-100/30">
            {activeMsgs.map((m) => (
              <Bubble key={m._id} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {/* Reply box */}
          <div className="bg-white/90 backdrop-blur-xl border-t border-ink-100 p-3">
            {active.botEnabled === false && (
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 mb-2 flex items-center gap-1.5">
                <Pause className="w-3 h-3 flex-shrink-0" />
                Auto-DM is paused — only your manual replies go out.
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                className="input resize-none flex-1 text-sm !rounded-2xl focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                rows={2}
                placeholder="Send a DM…"
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
                className="bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-2xl shadow-md shadow-brand-500/30 disabled:opacity-50 disabled:shadow-none transition-all flex-shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
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
                <img
                  src="/logo.png"
                  alt=""
                  className="w-14 object-contain drop-shadow"
                />
              </div>
            </div>
            <p className="text-ink-900 font-black text-xl tracking-tight">
              Your conversations, one place
            </p>
            <p className="text-ink-500 text-sm mt-2 leading-relaxed">
              Pick a DM on the left to reply, take over from the bot, tag, and
              resolve — new messages slide in live.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
              {["Auto-DM replies", "Live takeover", "Tags & resolve"].map(
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
          {isBot && out && <Sparkles className="w-2.5 h-2.5" />}
          <span>{dayjs(msg.createdAt).format("h:mm A")}</span>
        </div>
      </div>
    </div>
  );
}
