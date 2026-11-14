/**
 * Business Type — the one-time vertical setup step. After Instagram is
 * connected we read the user's site/profile, guess their business category,
 * let them confirm or change it, then apply the tailored pack (persona,
 * messages, FAQs, automations, features) in one shot.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Wand2,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/fx";

// Dark liquid-glass field — `.input` is the light variant.
const FIELD =
  "block w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 bg-white/[0.06] ring-1 ring-white/10 outline-none transition-[box-shadow,background-color] duration-300 hover:ring-white/20 focus:bg-white/[0.09] focus:ring-2 focus:ring-sunset-flame/60 focus:shadow-[0_0_0_4px_rgba(255,106,43,0.12),0_8px_24px_-12px_rgba(255,61,119,0.5)]";

export default function BusinessTypePage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [verticals, setVerticals] = useState([]);
  const [detecting, setDetecting] = useState(true);
  const [detected, setDetected] = useState(null); // { category, confidence, reasoning }
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);

  // Optional consultant referral code — validated live, attributed on apply.
  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null); // null | "checking" | "valid" | "invalid"
  const [refName, setRefName] = useState("");

  useEffect(() => {
    const code = refCode.trim();
    if (!code) {
      setRefState(null);
      setRefName("");
      return;
    }
    setRefState("checking");
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/consultants/validate/${encodeURIComponent(code)}`,
        );
        if (data?.valid) {
          setRefState("valid");
          setRefName(data.consultantName || "");
        } else {
          setRefState("invalid");
          setRefName("");
        }
      } catch {
        setRefState("invalid");
        setRefName("");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [refCode]);

  // Load the category grid + run auto-detection in parallel.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/verticals");
        if (alive) setVerticals(data.verticals || []);
      } catch {
        /* grid still usable once detection resolves */
      }
    })();

    if (!activeWorkspace) return;
    (async () => {
      try {
        const { data } = await api.post(
          `/workspaces/${activeWorkspace}/vertical/detect`,
        );
        if (!alive) return;
        setDetected(data);
        setSelected(data.category);
      } catch {
        if (alive) setSelected("general");
      } finally {
        if (alive) setDetecting(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeWorkspace]);

  const apply = async () => {
    if (!selected || applying) return;
    setApplying(true);
    try {
      await api.post(`/workspaces/${activeWorkspace}/vertical/apply`, {
        category: selected,
      });
      // Attribute the consultant referral (best-effort — never blocks setup).
      if (refCode.trim() && refState === "valid") {
        try {
          await api.post("/consultants/attribute", { code: refCode.trim() });
          toast.success(`Referral credited to ${refName || "your consultant"}`);
        } catch {
          /* attribution failures shouldn't stop onboarding */
        }
      }
      await fetchWorkspace(activeWorkspace, { force: true });
      toast.success("Your Botlify is tailored to your business! 🎉");
      navigate("/dashboard?connected=true", { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't finish setup");
      setApplying(false);
    }
  };

  const chosen = verticals.find((v) => v.key === selected);
  const confident = detected && detected.confidence >= 55;

  return (
    <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12 text-white">
      <div className="w-full max-w-2xl">
        <Reveal className="text-center mb-7">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-30 blur-2xl" />
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [0, -6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-14 h-14 rounded-2xl bg-sunset grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_36px_-12px_rgba(255,61,119,0.8)]"
            >
              <Wand2 className="w-7 h-7 text-white" strokeWidth={1.8} />
            </motion.div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
            What kind of business are{" "}
            <span className="font-serif italic font-normal text-sunset">you?</span>
          </h1>
          <p className="text-sm text-white/60 mt-2 max-w-md mx-auto">
            We'll tailor your bot, messages and automations to fit — you can
            change anything later.
          </p>
        </Reveal>

        {/* Detection banner */}
        <AnimatePresence mode="wait">
          {detecting ? (
            <motion.div
              key="detecting"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              className="mb-5 card-dark p-4 flex items-center gap-3 overflow-hidden"
            >
              <Loader2 className="w-5 h-5 text-sunset-gold animate-spin shrink-0" />
              <p className="text-sm text-white/70">
                Reading your page to find the best match…
              </p>
            </motion.div>
          ) : (
            detected &&
            confident &&
            chosen && (
              <motion.div
                key="detected"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                className="mb-5 rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/25 backdrop-blur-xl p-4 flex items-start gap-3"
              >
                <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div className="text-sm text-white/75">
                  <span className="font-semibold text-white">
                    Looks like you run a {chosen.emoji} {chosen.label}.
                  </span>{" "}
                  {detected.reasoning}
                  <span className="block text-xs text-white/50 mt-0.5">
                    Not right? Just pick the correct one below.
                  </span>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {verticals.map((v, i) => {
            const isSel = selected === v.key;
            return (
              <motion.button
                key={v.key}
                onClick={() => setSelected(v.key)}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: Math.min(i * 0.04, 0.4),
                  type: "spring",
                  stiffness: 320,
                  damping: 28,
                }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                className={`group relative text-left rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl transition-[background-color,box-shadow] duration-500 ${
                  isSel
                    ? "bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_0_1.5px_rgba(255,106,43,0.7),0_18px_40px_-16px_rgba(255,61,119,0.6)]"
                    : "bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.16)]"
                }`}
              >
                <AnimatePresence>
                  {isSel && (
                    <motion.span
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 45 }}
                      transition={{ type: "spring", stiffness: 520, damping: 18 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-sunset-gold" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="text-2xl mb-2 inline-block transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                  {v.emoji}
                </div>
                <p className="text-sm font-semibold font-display text-white leading-tight pr-5">
                  {v.label}
                </p>
                <p className="text-[11px] text-white/50 mt-1 leading-snug">
                  {v.tagline}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Referral code (optional) */}
        <Reveal delay={0.1}>
          <div className="mt-5 card-dark p-4">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/70 mb-1.5">
              <Ticket className="w-3.5 h-3.5 text-sunset-gold" />
              Referral code (optional)
            </label>
            <input
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder="Got a code from a Botlify consultant?"
              className={`${FIELD} font-mono tracking-wider`}
            />
            {refState === "checking" && (
              <p className="mt-1.5 text-[11px] text-white/45 inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking code…
              </p>
            )}
            {refState === "valid" && (
              <p className="mt-1.5 text-[11px] text-emerald-300 inline-flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Valid — referred by{" "}
                {refName || "a Botlify consultant"}
              </p>
            )}
            {refState === "invalid" && (
              <p className="mt-1.5 text-[11px] text-rose-300">
                This code doesn't look right — double-check with your consultant.
              </p>
            )}
          </div>
        </Reveal>

        {/* Apply */}
        <motion.button
          onClick={apply}
          disabled={!selected || applying}
          whileTap={{ scale: 0.97 }}
          className="btn-primary group mt-6 w-full h-12 text-sm"
        >
          {applying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Setting up your
              Botlify…
            </>
          ) : (
            <>
              Set up my Botlify{" "}
              <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
            </>
          )}
        </motion.button>
        <p className="text-center text-[11px] text-white/45 mt-3">
          This customizes your AI persona, welcome messages, FAQs and
          automations for your industry.
        </p>
      </div>
    </div>
  );
}
