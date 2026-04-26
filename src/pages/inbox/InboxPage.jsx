import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useInboxStore } from "@/store/inboxStore";
import { getSocket, initSocket } from "@/services/socket";
import toast from "react-hot-toast";
import {
  Send,
  Bot,
  UserCheck,
  CheckCheck,
  Search,
  Tag as TagIcon,
  Pause,
  Play,
  X,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { clsx } from "clsx";
dayjs.extend(relativeTime);

const STATUS_META = {
  bot_active: { label: "Bot", cls: "bg-emerald-100 text-emerald-700" },
  open: { label: "Open", cls: "bg-brand-100 text-brand-700" },
  awaiting_human: { label: "Waiting", cls: "bg-amber-100 text-amber-700" },
  human_active: { label: "Agent", cls: "bg-sky-100 text-sky-700" },
  resolved: { label: "Resolved", cls: "bg-ink-100 text-ink-500" },
  closed: { label: "Closed", cls: "bg-ink-100 text-ink-500" },
};

export default function InboxPage() {
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
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find((c) => c._id === activeConversationId);
  const activeMessages = messages[activeConversationId] || [];

  useEffect(() => {
    loadConversations();
    const socket = initSocket();
    socket.on("message:new", ({ conversation, message }) => {
      addOrUpdateConversation(conversation);
      if (conversation._id === activeConversationId)
        appendMessage(conversation._id, message);
    });
    socket.on("conversation:updated", (conv) => addOrUpdateConversation(conv));
    return () => {
      socket.off("message:new");
      socket.off("conversation:updated");
    };
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeConversationId) loadMessages(activeConversationId);
  }, [activeConversationId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/inbox");
      setConversations(data.conversations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (id) => {
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
      toast.success("You took over this conversation");
      loadConversations();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const resolve = async () => {
    try {
      await api.post(`/inbox/${activeConversationId}/resolve`);
      toast.success("Conversation resolved");
      loadConversations();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const toggleBot = async () => {
    if (!activeConv) return;
    const next = !activeConv.botEnabled;
    try {
      const { data } = await api.patch(`/inbox/${activeConversationId}/bot`, {
        enabled: next,
      });
      addOrUpdateConversation(data.conversation);
      toast.success(
        next
          ? "Bot resumed — it will auto-reply"
          : "Bot paused — only agents reply now",
      );
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const addTag = async () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || !activeConv) return;
    const tags = Array.from(new Set([...(activeConv.tags || []), t]));
    try {
      const { data } = await api.patch(`/inbox/${activeConversationId}/tags`, {
        tags,
      });
      addOrUpdateConversation(data.conversation);
      setTagInput("");
    } catch (e) {
      toast.error("Failed to add tag");
    }
  };

  const removeTag = async (tag) => {
    if (!activeConv) return;
    const tags = (activeConv.tags || []).filter((t) => t !== tag);
    try {
      const { data } = await api.patch(`/inbox/${activeConversationId}/tags`, {
        tags,
      });
      addOrUpdateConversation(data.conversation);
    } catch (e) {
      toast.error("Failed to remove tag");
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
      toast.error(e.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter((c) => {
    const status = filter === "all" || c.status === filter;
    const text =
      !search ||
      c.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact?.username?.toLowerCase().includes(search.toLowerCase());
    return status && text;
  });

  return (
    <div className="flex h-full bg-ink-50">
      {/* Conversation list */}
      <div
        className={clsx(
          "flex-shrink-0 border-r border-ink-100 bg-white flex flex-col",
          "w-full md:w-72",
          activeConversationId && "hidden md:flex",
        )}
      >
        <div className="p-3 border-b border-ink-100 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
            <input
              className="input pl-8 text-xs"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
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
                  "flex-shrink-0 px-2 py-1 rounded text-[11px] font-medium border transition",
                  filter === f
                    ? "bg-brand-50 border-brand-300 text-brand-700"
                    : "border-ink-200 text-ink-500 hover:bg-ink-50",
                )}
              >
                {f === "all" ? "All" : STATUS_META[f]?.label || f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-8 h-8 text-ink-300 mx-auto mb-2" />
              <p className="text-xs text-ink-400">No conversations yet</p>
              <p className="text-[11px] text-ink-400 mt-1">
                They'll show here when someone DMs you.
              </p>
            </div>
          )}
          {filtered.map((conv) => {
            const meta = STATUS_META[conv.status] || STATUS_META.open;
            return (
              <button
                key={conv._id}
                onClick={() => setActiveConversation(conv._id)}
                className={clsx(
                  "w-full text-left p-3 border-b border-ink-50 hover:bg-ink-50 transition",
                  activeConversationId === conv._id &&
                    "bg-brand-50 border-l-2 border-l-brand-500",
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white">
                    {(conv.contact?.name ||
                      conv.contact?.username ||
                      "?")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-ink-800 truncate">
                        {conv.contact?.name ||
                          conv.contact?.username ||
                          "Unknown"}
                      </p>
                      <span className="text-[10px] text-ink-400 flex-shrink-0 ml-1">
                        {dayjs(conv.updatedAt).fromNow(true)}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-400 truncate mt-0.5">
                      {conv.lastMessage?.text || "…"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`chip text-[10px] ${meta.cls}`}>
                        {meta.label}
                      </span>
                      {conv.botEnabled === false && (
                        <span className="chip text-[10px] bg-red-100 text-red-600">
                          <Pause className="w-2.5 h-2.5" /> Bot off
                        </span>
                      )}
                      {(conv.tags || []).slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="chip text-[10px] bg-ink-100 text-ink-600"
                        >
                          #{t}
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

      {/* Chat panel */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="bg-white border-b border-ink-100 px-4 py-3">
            <button
              onClick={() => setActiveConversation(null)}
              className="md:hidden mb-2 text-xs text-brand-600 font-medium flex items-center gap-1"
              aria-label="Back to conversations"
            >
              ← Back
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-gradient rounded-full flex items-center justify-center text-xs font-semibold text-white">
                  {(activeConv.contact?.name ||
                    activeConv.contact?.username ||
                    "?")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-ink-900">
                    {activeConv.contact?.name ||
                      activeConv.contact?.username ||
                      "Unknown"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`chip text-[10px] ${(STATUS_META[activeConv.status] || STATUS_META.open).cls}`}
                    >
                      {
                        (STATUS_META[activeConv.status] || STATUS_META.open)
                          .label
                      }
                    </span>
                    {activeConv.contact?.username && (
                      <span className="text-[10px] text-ink-400">
                        @{activeConv.contact.username}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBot}
                  className={clsx(
                    "btn text-xs gap-1",
                    activeConv.botEnabled === false
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
                  )}
                >
                  {activeConv.botEnabled === false ? (
                    <Play className="w-3 h-3" />
                  ) : (
                    <Pause className="w-3 h-3" />
                  )}
                  {activeConv.botEnabled === false ? "Resume bot" : "Pause bot"}
                </button>
                {activeConv.status !== "human_active" && (
                  <button
                    onClick={takeover}
                    className="btn-secondary text-xs gap-1"
                  >
                    <UserCheck className="w-3 h-3" /> Take over
                  </button>
                )}
                {activeConv.status !== "resolved" &&
                  activeConv.status !== "closed" && (
                    <button
                      onClick={resolve}
                      className="btn-ghost text-xs gap-1 bg-ink-100"
                    >
                      <CheckCheck className="w-3 h-3" /> Resolve
                    </button>
                  )}
              </div>
            </div>

            {/* Tags row */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              <TagIcon className="w-3 h-3 text-ink-400" />
              {(activeConv.tags || []).map((t) => (
                <span
                  key={t}
                  className="chip bg-brand-50 text-brand-700 text-[10px]"
                >
                  #{t}
                  <button
                    onClick={() => removeTag(t)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                className="input text-[11px] h-6 py-0 px-2 w-28 inline-block"
                placeholder="add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              {tagInput && (
                <button onClick={addTag} className="btn-ghost p-1">
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50">
            {activeMessages.map((msg) => (
              <MessageBubble key={msg._id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply box */}
          <div className="bg-white border-t border-ink-100 p-3">
            {activeConv.botEnabled === false && (
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
                Bot is paused for this conversation. Automated replies won't be
                sent until you resume.
              </div>
            )}
            {aiSuggestions.length > 0 && (
              <div className="mb-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-accent-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Suggestions
                  </span>
                  <button
                    onClick={() => setAiSuggestions([])}
                    className="text-[11px] text-ink-400 hover:text-ink-600"
                  >
                    clear
                  </button>
                </div>
                {aiSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setReplyText(s);
                      setAiSuggestions([]);
                    }}
                    className="w-full text-left text-xs p-2 rounded border border-accent-200 bg-accent-50/40 hover:bg-accent-50 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const { data } = await api.post("/ai/suggest-replies", {
                      conversationId: activeConversationId,
                    });
                    const sugs = (data.suggestions || []).map((s) =>
                      typeof s === "string" ? s : s.text || "",
                    );
                    setAiSuggestions(sugs.filter(Boolean));
                    if (!sugs.length) toast("No suggestions", { icon: "🤔" });
                  } catch (err) {
                    toast.error("AI failed");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                title="AI suggest replies"
                className="p-2 rounded-lg border border-accent-200 text-accent-600 hover:bg-accent-50 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <textarea
                className="input resize-none flex-1 text-sm"
                rows={2}
                placeholder="Type a message…"
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
                className="btn-primary px-3 py-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient mx-auto mb-3 flex items-center justify-center shadow-glow">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-ink-700 font-medium">Pick a conversation</p>
            <p className="text-ink-400 text-sm mt-1">
              Or wait for a new DM to come in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isOutbound = msg.direction === "outbound";
  const isBot = msg.sentBy === "bot" || msg.metadata?.triggerType;
  if (msg.isInternalNote) {
    return (
      <div className="flex justify-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-1.5 max-w-[70%] text-center">
          📝 {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={clsx(
          "max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm",
          isOutbound
            ? "bg-brand-gradient text-white rounded-br-sm"
            : "bg-white text-ink-800 border border-ink-100 rounded-bl-sm shadow-sm",
        )}
      >
        {msg.type === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt=""
            className="rounded-lg max-w-full mb-1"
          />
        )}
        <p className="leading-relaxed whitespace-pre-wrap">
          {msg.text || msg.caption || ""}
        </p>
        <div
          className={clsx(
            "flex items-center gap-1 text-[10px] mt-1",
            isOutbound ? "text-white/70" : "text-ink-400",
          )}
        >
          {isBot && isOutbound && <Bot className="w-2.5 h-2.5" />}
          <span>{dayjs(msg.createdAt).format("h:mm A")}</span>
        </div>
      </div>
    </div>
  );
}
