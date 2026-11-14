/**
 * TestChat — asks the REAL reply logic (POST /training/test) as if a guest
 * wrote in. Nothing is sent to anyone.
 *
 * Request:  { message, history: [{ role, content }] }   (errors excluded)
 * Response: { reply, fromTraining, escalate }
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, GraduationCap, Loader2, Send, Sparkles, Users } from "lucide-react";
import api from "@/services/api";
import { PulseDot } from "@/components/fx";
import { SUGGESTED_TESTS, errMsg, hop, spring } from "./shared";

export default function TestChat({ messages, setMessages, onTeach, className = "" }) {
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const ask = async (raw) => {
    const message = String(raw ?? text).trim();
    if (!message || thinking) return;
    const history = messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: message }]);
    setText("");
    setThinking(true);
    try {
      const { data } = await api.post("/training/test", { message, history });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply || "(The AI chose not to reply to this one.)",
          fromTraining: !!data.fromTraining,
          escalate: !!data.escalate,
          question: message,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: errMsg(e, "The AI couldn't answer just now. Try again."),
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`card overflow-hidden flex flex-col ${className}`}>
      <div className="group px-4 sm:px-5 py-3.5 border-b border-ink-900/[0.06] bg-white/80 flex items-center gap-3">
        <div className={`relative grid h-10 w-10 place-items-center rounded-xl bg-sunset text-white shadow-[0_8px_18px_-8px_rgba(255,61,119,0.6)] ${hop}`}>
          <Bot className="w-5 h-5" strokeWidth={1.8} />
          <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-white p-[2px]">
            <PulseDot color="bg-emerald-500" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-ink-900">Your AI concierge</p>
          <p className="text-xs text-ink-400">Test mode · replies stay on this screen</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="btn-ghost px-2.5 py-1.5 text-xs text-ink-500">
            Start over
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 bg-gradient-to-b from-ink-900/[0.015] to-ink-900/[0.035]"
      >
        {messages.length === 0 && (
          <div className="text-center pt-6 sm:pt-12 max-w-lg mx-auto">
            <div className="relative mx-auto grid h-14 w-14 place-items-center">
              <span aria-hidden className="absolute inset-0 rounded-full bg-sunset opacity-25 blur-2xl" />
              <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-sunset-soft text-sunset-flame">
                <Sparkles className="w-6 h-6" strokeWidth={1.8} />
              </span>
            </div>
            <p className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900 mt-4">
              Ask anything a guest might ask
            </p>
            <p className="text-sm text-ink-500 mt-1">Tap a question to start, or type your own below.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTED_TESTS.map((q, i) => (
                <motion.button
                  key={q}
                  onClick={() => ask(q)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ ...spring, delay: i * 0.04 }}
                  className="min-h-[38px] text-sm font-medium text-ink-700 bg-white/80 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff] hover:bg-white hover:text-ink-900 hover:ring-sunset-flame/35 rounded-full px-3.5 py-1.5 transition-[color,background-color,box-shadow]"
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
            style={{ originX: m.role === "user" ? 1 : 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%] sm:max-w-[75%]">
              <div
                className={`rounded-2xl px-4 py-2.5 text-[15px] whitespace-pre-line leading-relaxed ${
                  m.role === "user"
                    ? "bg-sunset text-white rounded-br-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-10px_rgba(255,61,119,0.55)]"
                    : m.error
                      ? "bg-rose-50 text-rose-800 ring-1 ring-rose-500/15 rounded-bl-md"
                      : "bg-white/90 text-ink-800 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff,0_4px_14px_-10px_rgba(15,23,42,0.3)] rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
              {m.role === "assistant" && !m.error && (
                <div className="mt-1.5 ml-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {m.fromTraining ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <GraduationCap className="w-3.5 h-3.5" />
                      From your training
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500">
                      <Sparkles className="w-3.5 h-3.5" />
                      Written by the AI from your hotel's info
                    </span>
                  )}
                  {m.escalate && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                      <Users className="w-3.5 h-3.5" />
                      Would alert your team
                    </span>
                  )}
                  {!m.fromTraining && m.question && onTeach && (
                    <button
                      onClick={() => onTeach(m.question)}
                      className="text-[11px] font-semibold text-sunset-flame hover:text-sunset-magenta underline-offset-2 hover:underline transition-colors"
                    >
                      Teach it the exact answer
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white/90 ring-1 ring-ink-900/[0.07] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-sunset"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="p-3 sm:p-4 border-t border-ink-900/[0.06] bg-white/80 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message as a guest…"
          className="input flex-1 min-h-[44px]"
          maxLength={2000}
          aria-label="Test question"
        />
        <button
          type="submit"
          disabled={!text.trim() || thinking}
          className="btn-primary group h-11 w-11 shrink-0 !p-0 justify-center disabled:opacity-50"
          aria-label="Send"
        >
          {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-12" />}
        </button>
      </form>
    </div>
  );
}
