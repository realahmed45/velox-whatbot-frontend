/**
 * TestChat — asks the REAL reply logic (POST /training/test) as if a guest
 * wrote in. Nothing is sent to anyone.
 *
 * Request:  { message, history: [{ role, content }] }   (errors excluded)
 * Response: { reply, fromTraining, escalate }
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Bot, GraduationCap, Loader2, RotateCcw, Sparkles, Users } from "lucide-react";
import api from "@/services/api";
import { SUGGESTED_TESTS, errMsg } from "./shared";
import { btnGhost, panel } from "./ui";

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

  const used = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const moreIdeas = SUGGESTED_TESTS.filter((q) => !used.has(q)).slice(0, 3);

  return (
    <div className={`${panel} flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F]">
          <Bot className="h-5 w-5" strokeWidth={1.9} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#0A0A0A]">Your AI concierge</p>
          <p className="text-[12px] text-neutral-400">Test mode · replies stay on this screen</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className={btnGhost}>
            <RotateCcw className="h-3.5 w-3.5" />
            Start over
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-neutral-50/60 px-4 py-6 sm:px-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg pt-4 text-center sm:pt-10">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FF5A1F] text-[#0A0A0A] shadow-[0_3px_0_0_#0A0A0A]">
              <Sparkles className="h-6 w-6" strokeWidth={1.9} />
            </span>
            <p className="mt-5 text-[19px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
              Ask anything a guest might ask
            </p>
            <p className="mt-1 text-[14px] text-neutral-500">Tap a question to start, or type your own below.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTED_TESTS.map((q, i) => (
                <motion.button
                  key={q}
                  onClick={() => ask(q)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="min-h-[40px] rounded-full border border-neutral-200 bg-white px-4 py-2 text-[14px] font-medium text-neutral-700 transition-colors hover:border-[#FF5A1F] hover:text-[#0A0A0A] active:scale-[0.97]"
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%] sm:max-w-[72%]">
              <div
                className={`whitespace-pre-line rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-md bg-[#0A0A0A] text-white"
                    : m.error
                      ? "rounded-bl-md border border-rose-200 bg-rose-50 text-rose-800"
                      : "rounded-bl-md border border-neutral-200 bg-white text-[#0A0A0A]"
                }`}
              >
                {m.content}
              </div>
              {m.role === "assistant" && !m.error && (
                <div className="ml-1 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {m.fromTraining ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700">
                      <GraduationCap className="h-3.5 w-3.5" />
                      From your training
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-500">
                      <Sparkles className="h-3.5 w-3.5" />
                      Written by the AI from your hotel's info
                    </span>
                  )}
                  {m.escalate && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-700">
                      <Users className="h-3.5 w-3.5" />
                      Would alert your team
                    </span>
                  )}
                  {!m.fromTraining && m.question && onTeach && (
                    <button
                      onClick={() => onTeach(m.question)}
                      className="text-[12px] font-semibold text-[#FF5A1F] underline-offset-2 transition-colors hover:text-[#E84A12] hover:underline"
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
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-3.5">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 bg-white p-3 sm:p-4">
        {messages.length > 0 && moreIdeas.length > 0 && !thinking && (
          <div className="no-scrollbar -mx-1 mb-2.5 flex gap-1.5 overflow-x-auto px-1">
            {moreIdeas.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="min-h-[34px] shrink-0 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 text-[13px] text-neutral-600 transition-colors hover:border-[#FF5A1F] hover:text-[#0A0A0A]"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-1.5 pl-4 transition-[border-color,box-shadow] focus-within:border-[#FF5A1F] focus-within:ring-4 focus-within:ring-[#FF5A1F]/15"
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message as a guest…"
            className="min-h-[40px] flex-1 bg-transparent text-[15px] text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
            maxLength={2000}
            aria-label="Test question"
          />
          <button
            type="submit"
            disabled={!text.trim() || thinking}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FF5A1F] text-[#0A0A0A] transition-[transform,background-color,opacity] hover:bg-[#FF6B33] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.4} />}
          </button>
        </form>
      </div>
    </div>
  );
}
