import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { useAuthStore, REQUIRE_EMAIL_VERIFICATION } from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building2,
} from "lucide-react";
import { Magnetic, Reveal } from "@/components/fx";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
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

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next"); // e.g. a team-invite link to return to
  const invitedEmail = searchParams.get("email") || "";
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: invitedEmail,
    password: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const { login, logout } = useAuthStore();
  const navigate = useNavigate();
  const refCode = searchParams.get("ref");
  const channelHint = searchParams.get("channel"); // legacy marketing hint (unused)
  const planHint = searchParams.get("plan"); // wa_starter | ig_starter | bundle_pro | bundle_business

  const handleSubmit = async (e) => {
    e.preventDefault();
    const s = checkPassword(form.password, {
      email: form.email,
      name: form.name,
    });
    if (!s.ok) {
      toast.error(s.message || "Choose a stronger password");
      return;
    }
    if (turnstileEnabled && !captcha) {
      toast.error("Please complete the human check");
      return;
    }
    setLoading(true);
    try {
      // Clear any stale session so a leftover token can't hijack the redirect
      // (GuestRoute would otherwise bounce a logged-in user into the dashboard).
      logout();
      const { data } = await api.post("/auth/register", {
        name: form.name,
        businessName: form.businessName,
        email: form.email,
        password: form.password,
        ref: refCode || undefined,
        "cf-turnstile-token": captcha,
      });
      login(data.user, data.token, data.refreshToken);
      toast.success(
        REQUIRE_EMAIL_VERIFICATION
          ? "Account created — check your email for a code."
          : "Account created — let's set up your hotel.",
      );

      // If they picked a plan on /pricing before signup, activate it now
      if (planHint) {
        try {
          await api.post("/billing/select-plan", {
            plan: planHint,
            billingCycle: "monthly",
          });
        } catch {
          /* non-fatal — they can pick from billing later */
        }
      }

      // Email/password signups verify a 4-digit code before onboarding.
      // Carry `next` (e.g. a team-invite link) through so the invitee lands
      // back on the invite page once verified.
      // (Only when REQUIRE_EMAIL_VERIFICATION is on — otherwise straight on to
      // plan selection + onboarding, exactly where a verified user would land.)
      if (REQUIRE_EMAIL_VERIFICATION) {
        navigate("/verify-email", { state: { email: form.email, next } });
      } else {
        navigate(next || "/onboarding/pricing", { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <Reveal>
        <h2 className="font-display text-3xl sm:text-[34px] font-semibold tracking-[-0.03em] text-ink-950 leading-tight">
          Create your{" "}
          <span className="font-serif italic font-normal text-sunset">account</span>
        </h2>
        <p className="text-ink-600 text-sm mt-2 mb-7">
          Already have an account?{" "}
          <Link
            to={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="text-sunset-flame font-semibold underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Reveal>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Reveal delay={0.05}>
          <div className="mb-2 rounded-xl overflow-hidden ring-1 ring-ink-900/[0.08] transition-transform duration-500 ease-spring hover:-translate-y-0.5">
            <GoogleSignInButton label="Sign up with Google" />
          </div>
        </Reveal>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-ink-900/10 to-transparent"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-[0.14em]">
            <span className="px-3 text-ink-400 bg-white rounded-full">
              Or sign up with email
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal delay={0.08}>
            <label className={LABEL}>Full name</label>
            <div className="relative group">
              <User strokeWidth={1.8} className={ICON} />
              <input
                className={`${FIELD} pl-9`}
                placeholder="Ahmad Ali"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </Reveal>
          <Reveal delay={0.11}>
            <label className={LABEL}>Business name</label>
            <div className="relative group">
              <Building2 strokeWidth={1.8} className={ICON} />
              <input
                className={`${FIELD} pl-9`}
                placeholder="e.g. Linen Studio"
                required
                value={form.businessName}
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
              />
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.14}>
          <label className={LABEL}>Email address</label>
          <div className="relative group">
            <Mail strokeWidth={1.8} className={ICON} />
            <input
              className={`${FIELD} pl-9 ${invitedEmail ? "!bg-ink-900/[0.04] text-ink-500 cursor-not-allowed" : ""}`}
              type="email"
              placeholder="you@example.com"
              required
              readOnly={!!invitedEmail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </Reveal>
        <Reveal delay={0.17}>
          <label className={LABEL}>Password</label>
          <div className="relative group">
            <Lock strokeWidth={1.8} className={ICON} />
            <input
              className={`${FIELD} pl-9 pr-11`}
              type={show ? "text" : "password"}
              placeholder="Min 8 characters"
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
          <PasswordStrength
            password={form.password}
            email={form.email}
            name={form.name}
          />
        </Reveal>
        {turnstileEnabled && (
          <TurnstileWidget onToken={setCaptcha} className="pt-1" />
        )}
        <Reveal delay={0.2}>
          <Magnetic strength={0.12} className="w-full">
            <button
              type="submit"
              className="btn-primary w-full group h-11"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && (
                <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
              )}
            </button>
          </Magnetic>
        </Reveal>
      </form>
    </div>
  );
}
