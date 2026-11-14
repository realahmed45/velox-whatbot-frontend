/**
 * Test your AI — a roomy sandbox chat. The hotelier types like a guest and
 * sees exactly what the real reply logic would answer (POST /training/test).
 * Nothing is sent to guests.
 *
 * When an answer didn't come from the training, "Teach it the exact answer"
 * jumps to Train your AI with the question pre-filled (?teach=…).
 * The conversation is kept for the browser session so it survives that trip.
 */
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FlaskConical, GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Reveal } from "@/components/fx";
import TestChat from "./train/TestChat";
import { TRAIN_PATH, hop } from "./train/shared";

const CHAT_KEY = "botlify.testAi.chat";

function loadChat() {
  try {
    const raw = window.sessionStorage.getItem(CHAT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default function TestAiPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(loadChat);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* storage unavailable — the chat just won't survive a reload */
    }
  }, [messages]);

  const teach = useCallback(
    (question) => navigate(`${TRAIN_PATH}?tab=questions&teach=${encodeURIComponent(question)}`),
    [navigate],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8">
      <Reveal as="header" className="group flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[0_10px_24px_-10px_rgba(255,61,119,0.6)] ${hop}`}>
            <FlaskConical className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
              Test your <span className="font-serif italic font-normal">AI</span>
            </h1>
            <p className="text-sm text-ink-500 mt-0.5 max-w-2xl">
              Write like a guest and see exactly how your AI would reply.
            </p>
          </div>
        </div>
        <Link to={TRAIN_PATH} className="btn-secondary group/l min-h-[42px] self-start shrink-0">
          <GraduationCap className="w-4 h-4 text-sunset-flame" />
          Train your AI
        </Link>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
        <TestChat
          messages={messages}
          setMessages={setMessages}
          onTeach={teach}
          className="h-[calc(100vh-230px)] min-h-[520px]"
        />

        <aside className="space-y-4 lg:sticky lg:top-4">
          <div className="card p-4 flex items-start gap-3 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(16,185,129,0.2)]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/15">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="font-display font-semibold text-ink-900 text-sm">Nothing is sent to guests</p>
              <p className="text-xs text-ink-500 mt-0.5">
                This is a private sandbox. Your team isn't alerted and no guest sees these messages.
              </p>
            </div>
          </div>

          <div className="card p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Reading the replies</p>
            <ul className="mt-3 space-y-3 text-xs text-ink-600">
              <li className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  <span className="font-semibold text-emerald-700">From your training</span> — the AI used
                  an answer you wrote.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-ink-500" />
                <span>
                  <span className="font-semibold text-ink-800">Written by the AI</span> — no exact answer
                  yet, so it used your hotel's info. Teach it one to be sure.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <span className="font-semibold text-amber-700">Would alert your team</span> — in real life
                  someone from your team would be asked to step in.
                </span>
              </li>
            </ul>
          </div>

          <Link
            to={TRAIN_PATH}
            className="card group p-4 flex items-center gap-3 transition-shadow duration-300 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.2),0_12px_30px_-18px_rgba(255,61,119,0.35)]"
          >
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sunset-soft text-sunset-flame ${hop}`}>
              <GraduationCap className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display font-semibold text-ink-900 text-sm">Answer missing or wrong?</span>
              <span className="block text-xs text-ink-500 mt-0.5">Fix it in Train your AI.</span>
            </span>
            <ArrowRight className="w-4 h-4 text-ink-400 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
