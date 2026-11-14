import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Wrench } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import { Magnetic, Reveal } from "@/components/fx";

// Dark liquid-glass field — `.input` is the light variant.
const FIELD =
  "block w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 bg-white/[0.06] ring-1 ring-white/10 outline-none transition-[box-shadow,background-color] duration-300 hover:ring-white/20 focus:bg-white/[0.09] focus:ring-2 focus:ring-sunset-flame/60 focus:shadow-[0_0_0_4px_rgba(255,106,43,0.12),0_8px_24px_-12px_rgba(255,61,119,0.5)]";
const LABEL = "block text-[13px] font-medium text-white/70 mb-1.5";

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
    <div className="card-dark p-6 sm:p-8">
      <Reveal>
        <h2 className="font-display text-3xl sm:text-[34px] font-semibold tracking-[-0.03em] text-white leading-tight">
          Welcome{" "}
          <span className="font-serif italic font-normal text-sunset">back</span>
        </h2>
        <p className="text-white/60 text-sm mt-2 mb-7">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-sunset-gold font-semibold underline-offset-4 hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Reveal delay={0.06}>
          <div className="mb-2 rounded-xl overflow-hidden ring-1 ring-white/10 transition-transform duration-500 ease-spring hover:-translate-y-0.5">
            <GoogleSignInButton />
          </div>
        </Reveal>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-[0.14em]">
            <span className="px-3 text-white/40 bg-night-950/60 backdrop-blur rounded-full">
              Or continue with email
            </span>
          </div>
        </div>
        <Reveal delay={0.1}>
          <label className={LABEL}>Email address</label>
          <div className="relative group">
            <Mail
              strokeWidth={1.8}
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors group-focus-within:text-sunset-gold"
            />
            <input
              className={`${FIELD} pl-9`}
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <label className={LABEL}>Password</label>
          <div className="relative group">
            <Lock
              strokeWidth={1.8}
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors group-focus-within:text-sunset-gold"
            />
            <input
              className={`${FIELD} pl-9 pr-11`}
              type={show ? "text" : "password"}
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-lg text-white/45 hover:text-white hover:bg-white/10 active:scale-90 transition duration-300 ease-spring"
              onClick={() => setShow(!show)}
            >
              {show ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-right mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs text-white/55 hover:text-sunset-gold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </Reveal>
        {turnstileEnabled && (
          <TurnstileWidget onToken={setCaptcha} className="pt-1" />
        )}
        <Reveal delay={0.18}>
          <Magnetic strength={0.12} className="w-full">
            <button
              type="submit"
              className="btn-primary w-full group h-11"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && (
                <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
              )}
            </button>
          </Magnetic>
        </Reveal>
      </form>

      {import.meta.env.DEV && (
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            devLogin();
            toast.success("Dev session — UI only (no backend)");
            navigate("/dashboard");
          }}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-sunset-gold/40 text-sunset-gold text-sm font-semibold hover:bg-white/[0.05] transition-colors"
        >
          <Wrench className="w-4 h-4" /> Enter as Dev (UI only · local)
        </motion.button>
      )}
    </div>
  );
}
