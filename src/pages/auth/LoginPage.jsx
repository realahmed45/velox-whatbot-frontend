import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Wrench } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import {
  AUTH_BTN,
  AUTH_EYE,
  AUTH_FIELD,
  AUTH_LABEL,
  AUTH_LINK,
  AUTH_SUB,
  AUTH_TITLE,
  AUTH_DOT,
  AuthDivider,
} from "@/layouts/AuthLayout";


export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  // Team-invite links prefill the invited email so it lines up with the invite.
  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const { login, devLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (turnstileEnabled && !captcha) {
      toast.error("Please complete the human check");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        ...form,
        "cf-turnstile-token": captcha,
      });
      login(data.user, data.token, data.refreshToken);
      toast.success("Welcome back!");
      // Honor a post-login redirect (e.g. a team-invite link).
      if (next) {
        navigate(next, { replace: true });
        return;
      }
      // One identity, many accounts → always land on the account picker, which
      // fetches the full list and lets them choose which account to enter (or
      // routes straight through / to onboarding when there's only one / none).
      navigate("/accounts", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={AUTH_TITLE}>
        Welcome back<span className={AUTH_DOT}>.</span>
      </h1>
      <p className={AUTH_SUB}>
        Sign in to your hotel's inbox and calendar.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="overflow-hidden rounded-xl">
          <GoogleSignInButton />
        </div>
        <AuthDivider>or continue with email</AuthDivider>
        <div>
          <label htmlFor="login-email" className={AUTH_LABEL}>
            Email
          </label>
          <input
            id="login-email"
            className={AUTH_FIELD}
            type="email"
            autoComplete="email"
            placeholder="you@hotel.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className={`${AUTH_LABEL} !mb-0`}>
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-[#0A0A0A] hover:underline hover:decoration-[#FF5A1F] hover:decoration-2"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              className={`${AUTH_FIELD} pr-11`}
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
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
        </div>
        {turnstileEnabled && <TurnstileWidget onToken={setCaptcha} />}
        <button type="submit" className={AUTH_BTN} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
          {!loading && (
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
        </button>
      </form>

      {import.meta.env.DEV && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            devLogin();
            toast.success("Dev session — UI only (no backend)");
            navigate("/dashboard");
          }}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-[13px] font-medium text-neutral-600 transition-colors hover:border-[#0A0A0A] hover:bg-[#FFF1EA] hover:text-[#0A0A0A]"
        >
          <Wrench className="h-4 w-4" /> Enter as Dev (UI only · local)
        </motion.button>
      )}

      <p className="mt-8 text-center text-[14px] text-neutral-600">
        New to Botlify?{" "}
        <Link to="/register" className={AUTH_LINK}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
