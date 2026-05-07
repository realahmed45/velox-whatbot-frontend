/**
 * Instagram Inbox — DM-style two-pane layout.
 *
 * Story-ring avatars, @username display, rose/fuchsia palette, IG-flavour
 * status pills ("Auto-DM", "You", "Resolved"). Calls /inbox?channel=instagram
 * so conversations from WhatsApp don't bleed in.
 */
import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useInboxStore } from "@/store/inboxStore";
import { initSocket } from "@/services/socket";
import toast from "react-hot-toast";
import {
  Send,
  Bot,
  UserCheck,
  CheckCheck,
  Search,
  Pause,
  Play,
  X,
  Heart,
  Plus,
  Sparkles,
  Instagram,
  Tag as TagIcon,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { clsx } from "clsx";
dayjs.extend(relativeTime);

const STATUS = {
  bot_active: { label: "Auto-DM", cls: "bg-rose-100 text-rose-700" },
  open: { label: "Open", cls: "bg-fuchsia-100 text-fuchsia-700" },
  awaiting_human: { label: "Needs you", cls: "bg-amber-100 text-amber-700" },
  human_active: { label: "You", cls: "bg-violet-100 text-violet-700" },
  resolved: { label: "Done", cls: "bg-ink-100 text-ink-500" },
  closed: { label: "Closed", cls: "bg-ink-100 text-ink-500" },
};

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
    <div className="flex h-full bg-gradient-to-br from-rose-50/30 to-fuchsia-50/20">
      {/* List pane */}
      <div
        className={clsx(
          "flex-shrink-0 border-r border-rose-100 bg-white flex flex-col",
          "w-full md:w-80",
          activeConversationId && "hidden md:flex",
        )}
      >
        {/* IG header */}
        <div className="px-4 py-3 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-fuchsia-50">
          <div className="flex items-center gap-2 mb-2.5">
            <Instagram className="w-4 h-4 text-rose-600" />
            <h2 className="font-black text-ink-900 text-sm">DMs</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-rose-600">
              {conversations.length} active
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />
            <input
              className="input !pl-8 !text-xs !border-rose-200 focus:!border-rose-400"
              placeholder="Search @username or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto">
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
                  "flex-shrink-0 px-2 py-1 text-[10px] font-bold transition border",
                  filter === f
                    ? "bg-rose-500 text-white border-rose-500"
                    : "border-rose-200 text-rose-700 hover:bg-rose-50",
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
              <Heart className="w-8 h-8 text-rose-300 mx-auto mb-2" />
              <p className="text-xs text-ink-500 font-bold">No DMs yet</p>
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
                  "w-full text-left p-3 border-b border-rose-50 hover:bg-rose-50/50 transition",
                  activeConversationId === conv._id &&
                    "bg-rose-50 border-l-2 border-l-rose-500",
                )}
              >
                <div className="flex items-start gap-2.5">
                  {/* Story ring */}
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[1.5px]">
                      <div className="w-full h-full bg-white p-[1.5px]">
                        <div className="w-full h-full bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center text-[11px] font-bold text-white">
                          {initial}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-ink-900 truncate">
                        {conv.contact?.name ||
                          conv.contact?.username ||
                          "Unknown"}
                      </p>
                      <span className="text-[10px] text-ink-400 flex-shrink-0">
                        {dayjs(conv.updatedAt).fromNow(true)}
                      </span>
                    </div>
                    {conv.contact?.username && (
                      <p className="text-[10px] text-rose-600 font-medium">
                        @{conv.contact.username}
                      </p>
                    )}
                    <p className="text-[11px] text-ink-500 truncate mt-0.5">
                      {conv.lastMessage?.text || "…"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      {conv.botEnabled === false && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700">
                          <Pause className="w-2.5 h-2.5 inline" /> off
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
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="bg-white border-b border-rose-100 px-4 py-3">
            <button
              onClick={() => setActiveConversation(null)}
              className="md:hidden mb-2 text-xs text-rose-600 font-bold flex items-center gap-1"
            >
              ← All DMs
            </button>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
                    <div className="w-full h-full bg-white p-[2px]">
                      <div className="w-full h-full bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white">
                        {(active.contact?.name ||
                          active.contact?.username ||
                          "?")[0]?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-sm text-ink-900">
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
                        className="text-[11px] text-rose-600 font-medium hover:underline"
                      >
                        @{active.contact.username}
                      </a>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 ${(STATUS[active.status] || STATUS.open).cls}`}
                    >
                      {(STATUS[active.status] || STATUS.open).label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleBot}
                  className={clsx(
                    "text-[11px] font-bold px-2.5 py-1.5 border flex items-center gap-1",
                    active.botEnabled === false
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200",
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
                    className="text-[11px] font-bold px-2.5 py-1.5 bg-rose-500 text-white flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" /> Take over
                  </button>
                )}
                {active.status !== "resolved" && active.status !== "closed" && (
                  <button
                    onClick={resolve}
                    className="text-[11px] font-bold px-2.5 py-1.5 bg-ink-100 text-ink-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Done
                  </button>
                )}
              </div>
            </div>

            {/* Tag row */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
              <TagIcon className="w-3 h-3 text-rose-400" />
              {(active.tags || []).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 inline-flex items-center gap-0.5"
                >
                  #{t}
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-900"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                className="input text-[11px] !h-6 !py-0 !px-2 w-24"
                placeholder="add tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gradient-to-b from-rose-50/40 to-white">
            {activeMsgs.map((m) => (
              <Bubble key={m._id} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {/* Reply box */}
          <div className="bg-white border-t border-rose-100 p-3">
            {active.botEnabled === false && (
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 mb-2">
                Auto-DM is paused — only your manual replies go out.
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                className="input resize-none flex-1 text-sm !border-rose-200 focus:!border-rose-400"
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
                className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white p-2.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center bg-gradient-to-br from-rose-50/30 to-fuchsia-50/30">
          <div>
            <div className="relative w-16 h-16 mx-auto mb-3">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[3px]">
                <div className="w-full h-full bg-white p-[3px]">
                  <div className="w-full h-full bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-ink-700 font-bold">Select a DM</p>
            <p className="text-ink-400 text-sm mt-1">
              Or wait for a new message to slide in.
            </p>
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
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 max-w-[70%] text-center">
          📝 {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={clsx(
          "max-w-[70%] px-3.5 py-2.5 text-sm",
          out
            ? "bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white rounded-[18px] rounded-br-[4px]"
            : "bg-white text-ink-800 border border-rose-100 rounded-[18px] rounded-bl-[4px]",
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
