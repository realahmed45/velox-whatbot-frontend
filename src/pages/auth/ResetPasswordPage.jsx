import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck, Link2Off } from "lucide-react";
import PasswordStrength from "@/components/auth/PasswordStrength";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import { checkPassword } from "@/utils/passwordPolicy";

import {
  AUTH_BTN,
  AUTH_EYE,
  AUTH_FIELD,
  AUTH_LABEL,
  AUTH_SUB,
  AUTH_TITLE,
} from "@/layouts/AuthLayout";

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
      <div>
        <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600">
          <Link2Off className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
        <h1 className={AUTH_TITLE}>This link has expired</h1>
        <p className={AUTH_SUB}>
          This password reset link is missing or invalid. Please request a new
          one.
        </p>
        <button
          onClick={() => navigate("/forgot-password")}
          className={`${AUTH_BTN} mt-8`}
        >
          Request new link
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg border border-ink-200 bg-white text-ink-900 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>
      <h1 className={AUTH_TITLE}>Set a new password</h1>
      <p className={AUTH_SUB}>Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="rp-password" className={AUTH_LABEL}>
            New password
          </label>
          <div className="relative">
            <input
              id="rp-password"
              className={`${AUTH_FIELD} pr-11`}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              className={AUTH_EYE}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </div>
        <div>
          <label htmlFor="rp-confirm" className={AUTH_LABEL}>
            Confirm password
          </label>
          <input
            id="rp-confirm"
            className={AUTH_FIELD}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your new password"
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
                className="mt-1.5 text-[12px] text-rose-600"
              >
                Passwords don't match.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {turnstileEnabled && <TurnstileWidget onToken={setCaptcha} />}
        <button type="submit" className={AUTH_BTN} disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
