import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { useAuthStore, REQUIRE_EMAIL_VERIFICATION } from "@/store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
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
  AUTH_LINK,
  AUTH_SUB,
  AUTH_TITLE,
  AUTH_DOT,
  AuthDivider,
} from "@/layouts/AuthLayout";

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
    <div>
      <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF1EA] py-1 pl-1 pr-3 text-[12.5px] font-semibold text-[#0A0A0A]">
        <span className="rounded-full bg-[#FF5A1F] px-2 py-0.5 text-[11px] font-bold">3-day</span>
        Free trial · 0% OTA commission
      </p>
      <h1 className={AUTH_TITLE}>
        Create your account<span className={AUTH_DOT}>.</span>
      </h1>
      <p className={AUTH_SUB}>
        Connect your channels and let the AI answer your guests. Setup takes
        about 10 minutes.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="overflow-hidden rounded-xl">
          <GoogleSignInButton label="Sign up with Google" />
        </div>
        <AuthDivider>or sign up with email</AuthDivider>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          <div>
            <label htmlFor="reg-name" className={AUTH_LABEL}>
              Full name
            </label>
            <input
              id="reg-name"
              className={AUTH_FIELD}
              autoComplete="name"
              placeholder="Ahmad Ali"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="reg-business" className={AUTH_LABEL}>
              Hotel name
            </label>
            <input
              id="reg-business"
              className={AUTH_FIELD}
              autoComplete="organization"
              placeholder="e.g. Linen Studio"
              required
              value={form.businessName}
              onChange={(e) =>
                setForm({ ...form, businessName: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className={AUTH_LABEL}>
            Work email
          </label>
          <input
            id="reg-email"
            className={`${AUTH_FIELD} ${invitedEmail ? "cursor-not-allowed !bg-neutral-100 !text-neutral-600" : ""}`}
            type="email"
            autoComplete="email"
            placeholder="you@hotel.com"
            required
            readOnly={!!invitedEmail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {invitedEmail && (
            <p className="mt-1.5 text-[12px] text-neutral-600">
              This is the email your team invite was sent to.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="reg-password" className={AUTH_LABEL}>
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
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
          <PasswordStrength
            password={form.password}
            email={form.email}
            name={form.name}
          />
        </div>
        {turnstileEnabled && <TurnstileWidget onToken={setCaptcha} />}
        <button type="submit" className={AUTH_BTN} disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
          {!loading && (
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
        </button>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[12.5px] font-medium text-neutral-600">
          {["0% OTA commission", "Setup in ~10 minutes", "Cancel anytime"].map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#0A0A0A]">
                <Check className="h-2.5 w-2.5 text-[#FF5A1F]" strokeWidth={3.5} />
              </span>{" "}
              {t}
            </li>
          ))}
        </ul>
      </form>

      <p className="mt-8 text-center text-[14px] text-neutral-600">
        Already have an account?{" "}
        <Link
          to={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className={AUTH_LINK}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
