import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { checkPassword } from "@/utils/passwordPolicy";

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
        className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold text-ink-900 mb-1">
            Forgot password
          </h2>
          <p className="text-ink-500 text-sm mb-6">
            Enter your email and we'll send you a 4-digit reset code.
          </p>
          <form onSubmit={sendCode} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {turnstileEnabled && (
              <TurnstileWidget onToken={setCaptcha} className="pt-1" />
            )}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-ink-900 mb-1">
            Enter the code
          </h2>
          <p className="text-ink-500 text-sm mb-6">
            We emailed a 4-digit code to{" "}
            <span className="font-semibold text-ink-700">{email}</span>. Enter it
            and choose a new password.
          </p>
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="label">4-digit code</label>
              <input
                className="input tracking-[0.5em] text-center text-lg font-bold"
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
              <label className="label">New password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  className="input pl-9 pr-10"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
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
              <label className="label">Confirm new password</label>
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm && confirm !== password && (
                <p className="text-[11px] text-red-500 mt-1">
                  Passwords don't match.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
            <button
              type="button"
              onClick={sendCode}
              className="w-full text-xs text-ink-500 hover:text-brand-600"
            >
              Didn't get it? Resend code
            </button>
          </form>
        </>
      )}
    </div>
  );
}
