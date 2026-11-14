import { useEffect, useRef, useState } from "react";
import {
  useSearchParams,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Loader, RotateCw } from "lucide-react";
import { Reveal } from "@/components/fx";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const CODE_LENGTH = 4;

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  // Email comes from the register redirect (state) or a ?email= fallback.
  const email = location.state?.email || params.get("email") || "";
  // `next` (e.g. a team-invite link) carried through register → verify.
  const next = location.state?.next || params.get("next") || "";

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const inputsRef = useRef([]);

  // If we have no email to verify against, there's nothing to do here.
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
    else inputsRef.current[0]?.focus();
  }, [email, navigate]);

  // Resend cooldown ticker.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const setDigit = (i, val) => {
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean.slice(-1);
      return next;
    });
    if (clean && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputsRef.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  };

  const submit = async (code) => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/verify-email", { email, code });
      if (data.user) setUser(data.user);
      toast.success("Email verified!");
      // Team invitees go back to their invite link to finish joining. Everyone
      // else must pick a plan (card required, 3-day trial) BEFORE using the app
      // — Botlify has no free tier.
      navigate(next || "/onboarding/pricing", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code. Try again.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit once all digits are filled.
  useEffect(() => {
    const code = digits.join("");
    if (code.length === CODE_LENGTH && !submitting) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const resend = async () => {
    if (resendIn > 0) return;
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success("A new code is on its way.");
      setResendIn(30);
    } catch {
      toast.error("Could not resend right now. Try again shortly.");
    }
  };

  return (
    <div className="card-dark p-6 sm:p-8 text-center">
      <Reveal>
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div
            aria-hidden
            className="absolute -inset-3 rounded-full bg-sunset opacity-30 blur-2xl"
          />
          <motion.div
            animate={submitting ? { scale: [1, 1.06, 1] } : { y: [0, -4, 0] }}
            transition={{
              duration: submitting ? 1 : 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-16 h-16 rounded-2xl bg-sunset text-white grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_36px_-12px_rgba(255,61,119,0.8)]"
          >
            {submitting ? (
              <Loader className="w-7 h-7 animate-spin" />
            ) : (
              <Mail className="w-7 h-7" strokeWidth={1.8} />
            )}
          </motion.div>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white mb-2">
          Verify your <span className="font-serif italic font-normal">email</span>
        </h2>
        <p className="text-white/60 text-sm mb-7">
          We sent a 4-digit code to{" "}
          <strong className="text-white font-semibold break-all">{email}</strong>.
        </p>
      </Reveal>

      <div
        className="flex justify-center gap-2.5 sm:gap-3 mb-7"
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={submitting}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              scale: d ? [1, 1.08, 1] : 1,
            }}
            transition={{
              delay: 0.08 + i * 0.06,
              type: "spring",
              stiffness: 420,
              damping: 26,
            }}
            className={`w-14 h-16 text-center text-2xl font-bold font-display tabular-nums text-white rounded-xl outline-none transition-[box-shadow,background-color] duration-300 disabled:opacity-50 focus:ring-2 focus:ring-sunset-flame/70 focus:bg-white/[0.1] focus:shadow-[0_0_0_5px_rgba(255,106,43,0.14),0_10px_28px_-12px_rgba(255,61,119,0.7)] ${
              d
                ? "bg-white/[0.1] ring-1 ring-sunset-gold/50"
                : "bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/20"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-white/45">
        Didn't get it?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resendIn > 0}
          className="inline-flex items-center gap-1 text-sunset-gold font-semibold hover:underline underline-offset-4 disabled:text-white/40 disabled:no-underline tabular-nums"
        >
          <RotateCw
            className={`w-3 h-3 ${resendIn > 0 ? "" : "transition-transform duration-500 ease-spring hover:rotate-180"}`}
          />
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
        {" · "}
        <Link
          to="/login"
          className="text-white/70 hover:text-white hover:underline underline-offset-4"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
