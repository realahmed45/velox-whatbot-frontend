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
import { PulseDot } from "@/components/fx";
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
                  <span className="shrink-0 text-sunset-flame">
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
        className={`group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-500 ease-spring hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-flame focus-visible:ring-offset-2 ${
          open
            ? "bg-white !text-ink-800 shadow-[0_14px_34px_-10px_rgba(15,23,42,0.35),inset_0_1px_0_#fff] ring-1 ring-ink-900/10"
            : "bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_34px_-10px_rgba(255,61,119,0.7),0_4px_12px_-2px_rgba(124,92,255,0.4)]"
        }`}
      >
        {open ? (
          <X className="h-6 w-6 transition-transform duration-500 ease-spring group-hover:rotate-90" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-110" strokeWidth={1.9} />
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sunset-gold opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-sunset-gold ring-2 ring-white" />
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
          className="glass-strong fixed z-[59] flex flex-col overflow-hidden animate-pop-in origin-bottom-right
                     inset-x-0 bottom-0 top-auto h-[85vh] rounded-t-3xl
                     sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[24rem] sm:h-[min(34rem,calc(100vh-8rem))] sm:rounded-3xl"
        >
          {/* Header */}
          <div className="relative flex shrink-0 items-center gap-3 overflow-hidden border-b border-ink-900/[0.06] bg-white px-4 py-3.5 text-ink-950">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-sunset-soft opacity-60" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-sunset opacity-60" />
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_4px_10px_-4px_rgba(255,61,119,0.35)]">
              <BotlifyMark size={22} />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="font-display text-sm font-semibold leading-tight tracking-[-0.01em]">Botlify assistant</p>
              <p className="text-[11px] text-ink-500 leading-tight inline-flex items-center gap-1.5">
                <PulseDot color="bg-emerald-500" className="scale-75" />
                Answers instantly · no waiting
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close assistant"
              className="group/x relative -mr-1 grid h-9 w-9 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-900/[0.05] hover:text-ink-900 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-flame"
            >
              <X className="h-5 w-5 transition-transform duration-500 ease-spring group-hover/x:rotate-90" />
            </button>
          </div>

          {/* Thread */}
          <div
            className="flex-1 space-y-3 overflow-y-auto bg-[#FBFAF8] px-3.5 py-4"
            aria-live="polite"
          >
            {messages.map((m) =>
              m.from === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] animate-pop-in origin-bottom-right rounded-2xl rounded-br-md bg-sunset px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-10px_rgba(255,61,119,0.6)]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_4px_10px_-4px_rgba(255,61,119,0.35)]">
                    <BotlifyMark size={17} />
                  </span>
                  <div className="min-w-0 max-w-[88%] space-y-2">
                    <div className="animate-pop-in origin-bottom-left rounded-2xl rounded-bl-md bg-white/90 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-700 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_6px_16px_-10px_rgba(15,23,42,0.2)]">
                      <AnswerBody text={m.text} />
                    </div>

                    {m.showContact && (
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#E2541C] transition hover:text-sunset-magenta"
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
                            className="rounded-full bg-white/80 px-3 py-1.5 text-left text-[12px] font-semibold text-ink-700 shadow-[inset_0_1px_0_#fff] ring-1 ring-sunset-flame/20 transition duration-300 ease-spring hover:-translate-y-0.5 hover:bg-white hover:text-[#E2541C] hover:ring-sunset-flame/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-flame"
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
            className="shrink-0 border-t border-ink-900/[0.06] bg-white/60 px-3 py-3"
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
                placeholder="Ask about pricing, OTAs, WhatsApp…"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full border border-ink-900/10 bg-white/80 px-4 py-2.5 text-[13px] text-ink-800 transition placeholder:text-ink-400 focus:border-sunset-flame/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sunset-flame/10"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send question"
                className="group/send grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-8px_rgba(255,61,119,0.7)] transition duration-300 ease-spring hover:scale-110 active:scale-90 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-flame focus-visible:ring-offset-2"
              >
                <Send className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/send:-translate-y-0.5 group-hover/send:translate-x-0.5" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[10.5px] text-ink-400 leading-snug">
              <Sparkles className="-mt-0.5 mr-0.5 inline h-3 w-3 text-sunset-flame" />
              Answers come from our {BOTLIFY_FAQ.length}-topic help library. For
              anything else, email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-ink-500 underline decoration-ink-200 underline-offset-2 hover:text-[#E2541C]"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              or visit{" "}
              <Link
                to="/contact"
                onClick={close}
                className="font-semibold text-ink-500 underline decoration-ink-200 underline-offset-2 hover:text-[#E2541C]"
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
