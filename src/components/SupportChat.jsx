/**
 * SupportChat — floating support assistant for the public marketing pages.
 *
 * Answers questions about Botlify entirely CLIENT-SIDE from the curated
 * knowledge base in `src/data/botlifyFaq.js`. There is no support-chat API,
 * so nothing here talks to the backend.
 *
 * Behaviour:
 *   • fixed message button, bottom-right
 *   • click opens a compact panel (full-width sheet on mobile)
 *   • suggestion chips on open and after an unmatched question
 *   • Escape closes, focus moves into the input on open and back to the
 *     launcher on close
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, Mail, Sparkles } from "lucide-react";
import BotlifyMark from "@/components/BotlifyMark";
import {
  BOTLIFY_FAQ,
  SUGGESTED_TOPIC_IDS,
  SUPPORT_EMAIL,
  FALLBACK_ANSWER,
  WELCOME_MESSAGE,
  findAnswer,
  getEntry,
} from "@/data/botlifyFaq";

let msgId = 0;
const nextId = () => `m${++msgId}`;

const SUGGESTED = SUGGESTED_TOPIC_IDS.map(getEntry).filter(Boolean);

/** Render "\n\n" paragraphs and "• " bullet lines from a plain-text answer. */
function AnswerBody({ text }) {
  const blocks = String(text).split("\n\n");
  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*[•\d]/.test(l)) && lines.length > 1;
        if (isList) {
          return (
            <ul key={bi} className="space-y-1">
              {lines.map((line, li) => (
                <li key={li} className="flex gap-1.5">
                  <span className="text-brand-500 shrink-0">
                    {line.trim().startsWith("•") ? "•" : line.trim().slice(0, 2)}
                  </span>
                  <span>{line.replace(/^\s*(•|\d+\.)\s*/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={bi}>{block}</p>;
      })}
    </div>
  );
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    { id: nextId(), from: "bot", text: WELCOME_MESSAGE, chips: SUGGESTED },
  ]);

  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const endRef = useRef(null);

  // Scroll the thread to the newest message.
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // Escape closes the panel from anywhere.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  /** Push a visitor question and the matching answer into the thread. */
  const ask = useCallback((question, forcedEntry = null) => {
    const text = String(question || "").trim();
    if (!text) return;

    const entry = forcedEntry || null;
    const match = entry ? { entry, confident: true } : findAnswer(text);

    setMessages((prev) => [
      ...prev,
      { id: nextId(), from: "user", text },
      match.confident && match.entry
        ? { id: nextId(), from: "bot", text: match.entry.answer }
        : {
            id: nextId(),
            from: "bot",
            text: FALLBACK_ANSWER,
            chips: SUGGESTED,
            showContact: true,
          },
    ]);
    setInput("");
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <>
      {/* ── Launcher ───────────────────────────────────────────── */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Botlify assistant" : "Open Botlify assistant"}
        aria-expanded={open}
        aria-controls="botlify-support-chat"
        className={`fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-glow-lg transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
          open ? "bg-ink-900 hover:bg-ink-800" : "bg-brand-500 hover:bg-brand-600"
        }`}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500" />
            </span>
          </>
        )}
      </button>

      {/* ── Panel ──────────────────────────────────────────────── */}
      {open && (
        <div
          id="botlify-support-chat"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Botlify assistant"
          className="fixed z-[59] bg-white shadow-2xl border border-ink-100 flex flex-col overflow-hidden animate-slide-up
                     inset-x-0 bottom-0 top-auto h-[85vh] rounded-t-2xl
                     sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[24rem] sm:h-[min(34rem,calc(100vh-8rem))] sm:rounded-2xl"
        >
          {/* Header */}
          <div className="relative shrink-0 bg-ink-950 text-white px-4 py-3.5 flex items-center gap-3 overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full bg-brand-500/30 blur-3xl"
            />
            <div className="relative w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <BotlifyMark size={22} />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="text-sm font-black leading-tight">Botlify assistant</p>
              <p className="text-[11px] text-white/60 leading-tight inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Answers instantly · no waiting
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close assistant"
              className="relative p-1.5 -mr-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Thread */}
          <div
            className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 bg-ink-50/40"
            aria-live="polite"
          >
            {messages.map((m) =>
              m.from === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-500 text-white text-[13px] leading-relaxed px-3.5 py-2.5">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2">
                  <span className="w-7 h-7 rounded-full bg-white border border-ink-100 flex items-center justify-center shrink-0 mt-0.5">
                    <BotlifyMark size={17} />
                  </span>
                  <div className="min-w-0 max-w-[88%] space-y-2">
                    <div className="rounded-2xl rounded-bl-md bg-white border border-ink-100 text-[13px] leading-relaxed text-ink-700 px-3.5 py-2.5 shadow-card">
                      <AnswerBody text={m.text} />
                    </div>

                    {m.showContact && (
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-600 hover:text-brand-700 transition"
                      >
                        <Mail className="w-3.5 h-3.5" /> {SUPPORT_EMAIL}
                      </a>
                    )}

                    {m.chips?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {m.chips.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => ask(c.question, c)}
                            className="text-left text-[12px] font-semibold rounded-full border border-brand-200 bg-brand-50/60 text-brand-700 px-3 py-1.5 hover:bg-brand-100 hover:border-brand-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          >
                            {c.chip || c.question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="shrink-0 border-t border-ink-100 bg-white px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <label htmlFor="botlify-chat-input" className="sr-only">
                Ask a question about Botlify
              </label>
              <input
                id="botlify-chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about pricing, channels, setup…"
                autoComplete="off"
                className="flex-1 min-w-0 rounded-full border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send question"
                className="w-10 h-10 shrink-0 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[10.5px] text-ink-400 leading-snug">
              <Sparkles className="w-3 h-3 inline -mt-0.5 mr-0.5 text-brand-400" />
              Answers come from our {BOTLIFY_FAQ.length}-topic help library. For
              anything else, email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-ink-500 hover:text-brand-600 underline decoration-ink-200 underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              or visit{" "}
              <Link
                to="/contact"
                onClick={close}
                className="font-semibold text-ink-500 hover:text-brand-600 underline decoration-ink-200 underline-offset-2"
              >
                Contact
              </Link>
              .
            </p>
          </form>
        </div>
      )}
    </>
  );
}
