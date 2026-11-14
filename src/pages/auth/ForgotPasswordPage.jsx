import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  KeyRound,
} from "lucide-react";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { checkPassword } from "@/utils/passwordPolicy";

// Shared light form-field classes from index.css.
const FIELD =
  "input";
const LABEL = "label";
const ICON =
  "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-sunset-flame pointer-events-none";

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
    <div className="card p-6 sm:p-8 overflow-hidden">
      <Link
        to="/login"
        className="group inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-950 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-x-1" />{" "}
        Back to login
      </Link>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="h-11 w-11 rounded-xl grid place-items-center bg-sunset text-white mb-4 shadow-[0_10px_30px_-10px_rgba(255,61,119,0.7)]">
              <KeyRound className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-950 mb-1">
              Forgot{" "}
              <span className="font-serif italic font-normal">password</span>
            </h2>
            <p className="text-ink-600 text-sm mb-6">
              Enter your email and we'll send you a 4-digit reset code.
            </p>
            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className={LABEL}>Email address</label>
                <div className="relative group">
                  <Mail strokeWidth={1.8} className={ICON} />
                  <input
                    className={`${FIELD} pl-9`}
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {turnstileEnabled && (
                <TurnstileWidget onToken={setCaptcha} className="pt-1" />
              )}
              <button
                type="submit"
                className="btn-primary w-full h-11 group"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send reset code"}
                {!loading && (
                  <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-950 mb-1">
              Enter the{" "}
              <span className="font-serif italic font-normal">code</span>
            </h2>
            <p className="text-ink-600 text-sm mb-6">
              We emailed a 4-digit code to{" "}
              <span className="font-semibold text-ink-950 break-all">{email}</span>.
              Enter it and choose a new password.
            </p>
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className={LABEL}>4-digit code</label>
                <input
                  className={`${FIELD} tracking-[0.5em] text-center text-lg font-bold font-mono tabular-nums`}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  required
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
              </div>
              <div>
                <label className={LABEL}>New password</label>
                <div className="relative group">
                  <Lock strokeWidth={1.8} className={ICON} />
                  <input
                    className={`${FIELD} pl-9 pr-11`}
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-lg text-ink-500 hover:text-ink-950 hover:bg-ink-900/[0.06] active:scale-90 transition duration-300 ease-spring"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <PasswordStrength password={password} email={email} />
              </div>
              <div>
                <label className={LABEL}>Confirm new password</label>
                <input
                  className={FIELD}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
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
                      className="text-[11px] text-rose-600 mt-1"
                    >
                      Passwords don't match.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="submit"
                className="btn-primary w-full h-11"
                disabled={loading}
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
              <button
                type="button"
                onClick={sendCode}
                className="w-full min-h-[40px] text-xs text-ink-600 hover:text-sunset-flame transition-colors"
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
