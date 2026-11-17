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
import { ArrowRight, GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";
import TestChat from "./train/TestChat";
import { TRAIN_PATH } from "./train/shared";
import { btnSecondary, pageTitle, panel } from "./train/ui";

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
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 font-geist text-[#0A0A0A] sm:px-6 sm:pt-8 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <h1 className={pageTitle}>
            Test your AI<span className="text-[#FF5A1F]">.</span>
          </h1>
          <p className="mt-1 max-w-xl text-[15px] text-neutral-500">
            Write like a guest and see exactly how your AI would reply.
          </p>
        </div>
        <Link to={TRAIN_PATH} className={`${btnSecondary} self-start shrink-0 sm:self-auto`}>
          <GraduationCap className="h-4 w-4 text-[#FF5A1F]" />
          Train your AI
        </Link>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <TestChat
          messages={messages}
          setMessages={setMessages}
          onTeach={teach}
          className="h-[calc(100vh-220px)] min-h-[520px]"
        />

        <aside className="space-y-3 lg:sticky lg:top-4">
          <div className={`${panel} flex items-start gap-3 p-4`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#0A0A0A]">Nothing is sent to guests</p>
              <p className="mt-0.5 text-[13px] text-neutral-500">
                A private sandbox. Your team isn't alerted and no guest sees these messages.
              </p>
            </div>
          </div>

          <div className={`${panel} p-4`}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-neutral-400">Reading the replies</p>
            <ul className="mt-3 space-y-3 text-[13px] text-neutral-600">
              <li className="flex items-start gap-2.5">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <span className="font-semibold text-emerald-700">From your training</span> — the AI used an answer
                  you wrote.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                <span>
                  <span className="font-semibold text-[#0A0A0A]">Written by the AI</span> — no exact answer yet, so it
                  used your hotel's info. Teach it one to be sure.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <span className="font-semibold text-amber-700">Would alert your team</span> — in real life someone
                  from your team would be asked to step in.
                </span>
              </li>
            </ul>
          </div>

          <Link
            to={TRAIN_PATH}
            className="group flex items-center gap-3 rounded-2xl bg-[#0A0A0A] p-4 text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FF5A1F] text-[#0A0A0A]">
              <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">Answer missing or wrong?</span>
              <span className="mt-0.5 block text-[13px] text-white/60">Fix it in Train your AI.</span>
            </span>
            <ArrowRight className="h-4 w-4 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
