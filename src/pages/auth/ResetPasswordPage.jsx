import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck, Link2Off } from "lucide-react";
import { Reveal } from "@/components/fx";
import PasswordStrength from "@/components/auth/PasswordStrength";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import { checkPassword } from "@/utils/passwordPolicy";

// Shared light form-field classes from index.css.
const FIELD =
  "input";
const LABEL = "label";
const ICON =
  "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-sunset-flame pointer-events-none";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(
        "Reset link is missing or expired. Please request a new one.",
      );
      return;
    }
    const s = checkPassword(form.password);
    if (!s.ok) {
      toast.error(s.message || "Choose a stronger password");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (turnstileEnabled && !captcha) {
      toast.error("Please complete the human check");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        password: form.password,
        "cf-turnstile-token": captcha,
      });
      toast.success("Password reset! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="card p-6 sm:p-8">
        <Reveal>
          <div className="h-11 w-11 rounded-xl grid place-items-center bg-rose-50 ring-1 ring-rose-200 text-rose-600 mb-4">
            <Link2Off className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-950 mb-1">
            Link <span className="font-serif italic font-normal">expired</span>
          </h2>
          <p className="text-ink-600 text-sm mb-6">
            This password reset link is missing or invalid. Please request a new
            one.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="btn-primary w-full h-11"
          >
            Request new link
          </button>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      <Reveal>
        <div className="h-11 w-11 rounded-xl grid place-items-center bg-sunset text-white mb-4 shadow-[0_10px_30px_-10px_rgba(255,61,119,0.7)]">
          <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-950 mb-1">
          Set new <span className="font-serif italic font-normal">password</span>
        </h2>
        <p className="text-ink-600 text-sm mb-6">
          Choose a strong password for your account.
        </p>
      </Reveal>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Reveal delay={0.06}>
          <label className={LABEL}>New password</label>
          <div className="relative group">
            <Lock strokeWidth={1.8} className={ICON} />
            <input
              className={`${FIELD} pl-9 pr-11`}
              type={show ? "text" : "password"}
              placeholder="Min. 8 characters"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-lg text-ink-500 hover:text-ink-950 hover:bg-ink-900/[0.06] active:scale-90 transition duration-300 ease-spring"
              onClick={() => setShow(!show)}
            >
              {show ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </Reveal>
        <Reveal delay={0.1}>
          <label className={LABEL}>Confirm password</label>
          <input
            className={FIELD}
            type="password"
            placeholder="••••••••"
            required
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />
          <AnimatePresence>
            {form.confirmPassword && form.confirmPassword !== form.password && (
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
        </Reveal>
        {turnstileEnabled && (
          <TurnstileWidget onToken={setCaptcha} className="pt-1" />
        )}
        <Reveal delay={0.14}>
          <button
            type="submit"
            className="btn-primary w-full h-11"
            disabled={loading}
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </Reveal>
      </form>
    </div>
  );
}
