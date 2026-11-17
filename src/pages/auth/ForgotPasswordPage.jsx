import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, MailCheck } from "lucide-react";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { checkPassword } from "@/utils/passwordPolicy";

import {
  AUTH_BTN,
  AUTH_EYE,
  AUTH_FIELD,
  AUTH_LABEL,
  AUTH_SUB,
  AUTH_TITLE,
  AUTH_DOT,
  AUTH_ICON,
} from "@/layouts/AuthLayout";

/**
 * Forgot-password — 4-digit code flow (same UX as signup verification).
 *  Step 1: enter email → we email a 4-digit code.
 *  Step 2: enter the code + a new password → done, back to login.
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = code + new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");

  const sendCode = async (e) => {
    e?.preventDefault();
    if (turnstileEnabled && !captcha) {
      return toast.error("Please complete the human check");
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email,
        "cf-turnstile-token": captcha,
      });
      toast.success("If that email exists, a 4-digit code is on its way.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(code.trim())) {
      return toast.error("Enter the 4-digit code from your email");
    }
    const s = checkPassword(password, { email });
    if (!s.ok) return toast.error(s.message || "Choose a stronger password");
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        code: code.trim(),
        password,
      });
      toast.success("Password reset! Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        to="/login"
        className="group mb-8 inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-600 transition-colors hover:text-[#0A0A0A]"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to sign in
      </Link>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={AUTH_ICON}>
              <KeyRound className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
            <h1 className={AUTH_TITLE}>
              Reset your password<span className={AUTH_DOT}>.</span>
            </h1>
            <p className={AUTH_SUB}>
              Enter your email and we'll send you a 4-digit reset code.
            </p>
            <form onSubmit={sendCode} className="mt-8 space-y-5">
              <div>
                <label htmlFor="fp-email" className={AUTH_LABEL}>
                  Email
                </label>
                <input
                  id="fp-email"
                  className={AUTH_FIELD}
                  type="email"
                  autoComplete="email"
                  placeholder="you@hotel.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {turnstileEnabled && <TurnstileWidget onToken={setCaptcha} />}
              <button type="submit" className={AUTH_BTN} disabled={loading}>
                {loading ? "Sending…" : "Send reset code"}
                {!loading && (
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={AUTH_ICON}>
              <MailCheck className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
            <h1 className={AUTH_TITLE}>
              Check your email<span className={AUTH_DOT}>.</span>
            </h1>
            <p className={AUTH_SUB}>
              We emailed a 4-digit code to{" "}
              <span className="break-all font-semibold text-[#0A0A0A]">{email}</span>.
              Enter it and choose a new password.
            </p>
            <form onSubmit={resetPassword} className="mt-8 space-y-5">
              <div>
                <label htmlFor="fp-code" className={AUTH_LABEL}>
                  4-digit code
                </label>
                <input
                  id="fp-code"
                  className={`${AUTH_FIELD} text-center font-mono text-lg font-semibold tracking-[0.5em] tabular-nums`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  placeholder="0000"
                  required
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
              </div>
              <div>
                <label htmlFor="fp-password" className={AUTH_LABEL}>
                  New password
                </label>
                <div className="relative">
                  <input
                    id="fp-password"
                    className={`${AUTH_FIELD} pr-11`}
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className={AUTH_EYE}
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} email={email} />
              </div>
              <div>
                <label htmlFor="fp-confirm" className={AUTH_LABEL}>
                  Confirm new password
                </label>
                <input
                  id="fp-confirm"
                  className={AUTH_FIELD}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <AnimatePresence>
                  {confirm && confirm !== password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-[12px] text-rose-600"
                    >
                      Passwords don't match.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <button type="submit" className={AUTH_BTN} disabled={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </button>
              <button
                type="button"
                onClick={sendCode}
                className="min-h-[40px] w-full text-[13px] font-medium text-neutral-600 transition-colors hover:text-[#0A0A0A]"
              >
                Didn't get it? Resend code
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
