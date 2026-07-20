import { useEffect, useRef, useState } from "react";
import {
  useSearchParams,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { Mail, Loader } from "lucide-react";
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
      navigate("/onboarding/instagram", { replace: true });
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
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
        {submitting ? (
          <Loader className="w-8 h-8 text-brand-600 animate-spin" />
        ) : (
          <Mail className="w-8 h-8 text-brand-600" />
        )}
      </div>
      <h2 className="text-2xl font-bold text-ink-900 mb-2">Verify your email</h2>
      <p className="text-ink-500 text-sm mb-6">
        We sent a 4-digit code to{" "}
        <strong className="text-ink-700">{email}</strong>.
      </p>

      <div
        className="flex justify-center gap-3 mb-6"
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={submitting}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-14 h-16 text-center text-2xl font-bold rounded-xl border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition disabled:opacity-50"
          />
        ))}
      </div>

      <p className="text-xs text-ink-400">
        Didn't get it?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resendIn > 0}
          className="text-brand-600 font-semibold hover:underline disabled:text-ink-400 disabled:no-underline"
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
        {" · "}
        <Link to="/login" className="text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
