import { useEffect, useRef, useState } from "react";
import {
  useSearchParams,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { Mail, Loader, RotateCw } from "lucide-react";
import { AUTH_DOT, AUTH_ICON, AUTH_SUB, AUTH_TITLE } from "@/layouts/AuthLayout";
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
    <div className="text-center">
      <div className={`${AUTH_ICON} mx-auto`}>
        {submitting ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Mail className="h-5 w-5" strokeWidth={1.8} />
        )}
      </div>
      <h1 className={AUTH_TITLE}>
        Verify your email<span className={AUTH_DOT}>.</span>
      </h1>
      <p className={AUTH_SUB}>
        We sent a 4-digit code to{" "}
        <strong className="break-all font-semibold text-[#0A0A0A]">{email}</strong>.
      </p>

      <div
        className="mb-8 mt-8 flex justify-center gap-2.5 sm:gap-3"
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            maxLength={1}
            value={d}
            disabled={submitting}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-16 w-14 rounded-2xl border-2 bg-white text-center text-[28px] font-semibold tabular-nums text-[#0A0A0A] outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-[#FF5A1F] focus:ring-4 focus:ring-[#FF5A1F]/20 disabled:opacity-50 sm:h-[72px] sm:w-16 ${
              d ? "border-[#0A0A0A] bg-[#FFF1EA]" : "border-neutral-300 hover:border-neutral-400"
            }`}
          />
        ))}
      </div>

      <p className="text-[13px] text-neutral-600">
        Didn't get it?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resendIn > 0}
          className="inline-flex items-center gap-1 font-semibold text-[#0A0A0A] tabular-nums underline decoration-[#FF5A1F] decoration-2 underline-offset-4 hover:text-[#E84A12] disabled:text-neutral-400 disabled:no-underline"
        >
          <RotateCw className="h-3 w-3" />
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
        <span className="mx-2 text-neutral-300">·</span>
        <Link to="/login" className="font-medium text-neutral-700 hover:text-[#0A0A0A]">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
