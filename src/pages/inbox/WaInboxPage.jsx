/**
 * WhatsApp Inbox — business chat layout with delivery/read receipts and
 * response-time SLA badges. WA green bubbles, teal sidebar accents,
 * compliance-aware (24h window indicator). Calls /inbox?channel=whatsapp.
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
  Check,
  Search,
  Pause,
  Play,
  X,
  Phone,
  Tag as TagIcon,
  ShieldCheck,
  Clock,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { clsx } from "clsx";
dayjs.extend(relativeTime);

const STATUS = {
  bot_active: { label: "Auto", cls: "bg-teal-100 text-teal-800" },
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-800" },
  awaiting_human: {
    label: "Action needed",
    cls: "bg-amber-100 text-amber-800",
  },
  human_active: { label: "Agent", cls: "bg-sky-100 text-sky-800" },
  resolved: { label: "Resolved", cls: "bg-ink-100 text-ink-500" },
  closed: { label: "Closed", cls: "bg-ink-100 text-ink-500" },
};

const fmtPhone = (p) => {
  if (!p) return "";
  const s = p.replace(/\D/g, "");
  if (s.length > 10)
    return `+${s.slice(0, s.length - 10)} ${s.slice(-10, -7)} ${s.slice(-7, -4)} ${s.slice(-4)}`;
  return p;
};

export default function WaInboxPage() {
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

  // 24-hour customer service window (WA policy)
  const lastInbound = [...activeMsgs]
    .reverse()
    .find((m) => m.direction === "inbound");
  const hoursSinceInbound = lastInbound
    ? dayjs().diff(dayjs(lastInbound.createdAt), "hour", true)
    : null;
  const insideWindow = hoursSinceInbound !== null && hoursSinceInbound <= 24;

  useEffect(() => {
    load();
    const sock = initSocket();
    sock.on("message:new", ({ conversation, message }) => {
      if (conversation.channelType !== "whatsapp") return;
      addOrUpdateConversation(conversation);
      if (conversation._id === activeConversationId)
        appendMessage(conversation._id, message);
    });
    sock.on("conversation:updated", (c) => {
      if (c.channelType === "whatsapp") addOrUpdateConversation(c);
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
      const { data } = await api.get("/inbox?channel=whatsapp");
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
      toast.success("Agent assigned");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };
  const resolve = async () => {
    try {
      await api.post(`/inbox/${activeConversationId}/resolve`);
      toast.success("Conversation resolved");
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
      toast.success(next ? "Automation resumed" : "Automation paused");
    } catch {
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
      toast.error("Failed");
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
    const ok1 = filter === "all" || c.status === filter;
    const ok2 =
      !search ||
      c.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact?.phone?.includes(search);
    return ok1 && ok2;
  });

  return (
    <div className="flex h-full bg-[#f0f2f5]">
      {/* List pane */}
      <div
        className={clsx(
          "flex-shrink-0 border-r border-teal-100 bg-white flex flex-col",
          "w-full md:w-80",
          activeConversationId && "hidden md:flex",
        )}
      >
        <div className="px-4 py-3 border-b border-teal-100 bg-teal-600 text-white">
          <div className="flex items-center gap-2 mb-2.5">
            <MessageSquare className="w-4 h-4" />
            <h2 className="font-bold text-sm">WhatsApp inbox</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider font-bold opacity-80">
              {conversations.length} chats
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-200" />
            <input
              className="input !pl-8 !text-xs !bg-teal-700/40 !border-teal-500 !text-white placeholder:text-teal-200 focus:!border-teal-300"
              placeholder="Search name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-1 px-3 py-2 border-b border-teal-100 bg-teal-50/40 overflow-x-auto">
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
                  ? "bg-teal-600 text-white border-teal-600"
                  : "border-teal-200 text-teal-700 hover:bg-teal-50",
              )}
            >
              {f === "all" ? "All" : STATUS[f]?.label || f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center py-12 px-4">
              <Phone className="w-8 h-8 text-teal-300 mx-auto mb-2" />
              <p className="text-xs text-ink-500 font-bold">No chats yet</p>
            </div>
          )}
          {filtered.map((conv) => {
            const meta = STATUS[conv.status] || STATUS.open;
            const initial = (conv.contact?.name ||
              conv.contact?.phone ||
              "?")[0]?.toUpperCase();
            const unread = conv.unreadCount || 0;
            return (
              <button
                key={conv._id}
                onClick={() => setActiveConversation(conv._id)}
                className={clsx(
                  "w-full text-left p-3 border-b border-teal-50 hover:bg-teal-50/50 transition",
                  activeConversationId === conv._id &&
                    "bg-teal-50 border-l-2 border-l-teal-600",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 flex-shrink-0 bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-ink-900 truncate">
                        {conv.contact?.name ||
                          fmtPhone(conv.contact?.phone) ||
                          "Unknown"}
                      </p>
                      <span className="text-[10px] text-ink-400 flex-shrink-0">
                        {dayjs(conv.updatedAt).format("HH:mm")}
                      </span>
                    </div>
                    {conv.contact?.phone && (
                      <p className="text-[10px] text-teal-700 font-mono">
                        {fmtPhone(conv.contact.phone)}
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
                      {unread > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500 text-white">
                          {unread}
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
          <div className="bg-white border-b border-teal-100 px-4 py-3">
            <button
              onClick={() => setActiveConversation(null)}
              className="md:hidden mb-2 text-xs text-teal-700 font-bold flex items-center gap-1"
            >
              ← All chats
            </button>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                  {(active.contact?.name ||
                    active.contact?.phone ||
                    "?")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-ink-900">
                    {active.contact?.name ||
                      fmtPhone(active.contact?.phone) ||
                      "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {active.contact?.phone && (
                      <span className="text-[11px] text-teal-700 font-mono">
                        {fmtPhone(active.contact.phone)}
                      </span>
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
                      <Play className="w-3 h-3" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3" /> Pause
                    </>
                  )}
                </button>
                {active.status !== "human_active" && (
                  <button
                    onClick={takeover}
                    className="text-[11px] font-bold px-2.5 py-1.5 bg-teal-600 text-white flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" /> Assign me
                  </button>
                )}
                {active.status !== "resolved" && active.status !== "closed" && (
                  <button
                    onClick={resolve}
                    className="text-[11px] font-bold px-2.5 py-1.5 bg-ink-100 text-ink-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Resolve
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
              <TagIcon className="w-3 h-3 text-teal-500" />
              {(active.tags || []).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 inline-flex items-center gap-0.5"
                >
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-teal-900"
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

          {/* 24h window banner */}
          {hoursSinceInbound !== null && (
            <div
              className={clsx(
                "px-4 py-1.5 text-[11px] font-bold flex items-center gap-1.5 border-b",
                insideWindow
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200",
              )}
            >
              {insideWindow ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Inside 24-hour service
                  window — free-form replies allowed (
                  {Math.floor(24 - hoursSinceInbound)}h left)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" /> Outside 24-hour window —
                  only approved templates can be sent.
                </>
              )}
            </div>
          )}

          {/* Messages — WA-style green-on-cream */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-1.5"
            style={{
              backgroundColor: "#efeae2",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          >
            {activeMsgs.map((m) => (
              <Bubble key={m._id} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {/* Reply box */}
          <div className="bg-[#f0f2f5] border-t border-teal-100 p-3">
            <div className="flex items-end gap-2">
              <textarea
                className="input resize-none flex-1 text-sm !border-teal-200 focus:!border-teal-500"
                rows={2}
                placeholder="Type a message"
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
                className="bg-teal-600 hover:bg-teal-700 text-white p-2.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center bg-[#f0f2f5]">
          <div>
            <div className="w-16 h-16 mx-auto mb-3 bg-teal-600 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <p className="text-ink-700 font-bold">Select a conversation</p>
            <p className="text-ink-400 text-sm mt-1">
              Pick a chat on the left to view the thread.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ msg }) {
  const out = msg.direction === "outbound";
  if (msg.isInternalNote) {
    return (
      <div className="flex justify-center">
        <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs px-3 py-1.5 max-w-[70%] text-center">
          📝 {msg.text}
        </div>
      </div>
    );
  }
  const status = msg.status;
  return (
    <div className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <div
        className={clsx(
          "max-w-[70%] px-2.5 py-1.5 text-sm shadow-sm relative",
          out ? "bg-[#d9fdd3] text-ink-900" : "bg-white text-ink-900",
        )}
        style={{ borderRadius: out ? "8px 0 8px 8px" : "0 8px 8px 8px" }}
      >
        {msg.type === "image" && msg.mediaUrl && (
          <img src={msg.mediaUrl} alt="" className="rounded max-w-full mb-1" />
        )}
        <p className="leading-relaxed whitespace-pre-wrap pr-12">
          {msg.text || msg.caption || ""}
        </p>
        <div className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] text-ink-500">
          <span>{dayjs(msg.createdAt).format("HH:mm")}</span>
          {out && (
            <>
              {status === "read" ? (
                <CheckCheck className="w-3 h-3 text-sky-500" />
              ) : status === "delivered" ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
