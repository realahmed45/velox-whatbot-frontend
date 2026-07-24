import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Loader2,
  Check,
  XCircle,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import PasswordStrength from "@/components/auth/PasswordStrength";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import { checkPassword } from "@/utils/passwordPolicy";
import toast from "react-hot-toast";

/**
 * Team-invite landing page. Emailed link:
 *   /invite?token=<raw>&workspace=<id>&email=<invited email>
 *
 * Low-friction flow:
 *  - Fetch invite info (workspace name + invited email) with no auth needed.
 *  - Already signed in as the invited email → accept silently, go to dashboard.
 *  - Signed in as a DIFFERENT account → offer to continue-as or switch.
 *  - Not signed in → a clean "Join {workspace}" card: create account (email
 *    locked) or Google, and they join in one step. Existing account → sign in.
 */
export default function InvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token: authToken, user, login } = useAuthStore();

  const inviteToken = params.get("token");
  const workspaceId = params.get("workspace");

  const [phase, setPhase] = useState("loading"); // loading | join | accepting | success | error
  const [info, setInfo] = useState(null); // { workspaceName, email, hasAccount, expired }
  const [message, setMessage] = useState("");

  // Signup form (only used when creating a new account).
  const [form, setForm] = useState({ name: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState("");

  const backToInvite = useMemo(
    () =>
      `/invite?token=${inviteToken}&workspace=${workspaceId}${
        info?.email ? `&email=${encodeURIComponent(info.email)}` : ""
      }`,
    [inviteToken, workspaceId, info?.email],
  );

  // Accept for an already-signed-in, matching account.
  const acceptAsCurrent = async () => {
    setPhase("accepting");
    try {
      const { data } = await api.post("/workspaces/accept-invite", {
        token: inviteToken,
        workspaceId,
      });
      setPhase("success");
      setMessage(data.message || "You've joined the team!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1400);
    } catch (err) {
      setPhase("error");
      setMessage(
        err.response?.data?.message ||
          "We couldn't accept this invite. It may have expired.",
      );
    }
  };

  // Load invite info once.
  useEffect(() => {
    if (!inviteToken || !workspaceId) {
      setPhase("error");
      setMessage("This invite link is incomplete or invalid.");
      return;
    }
    (async () => {
      try {
        const { data } = await api.get("/workspaces/invite-info", {
          params: { token: inviteToken, workspace: workspaceId },
        });
        setInfo(data);
        if (data.expired) {
          setPhase("error");
          setMessage("This invite has expired. Ask the owner to resend it.");
          return;
        }
        // Signed in AND the email matches → accept immediately.
        if (
          authToken &&
          user?.email &&
          user.email.toLowerCase() === data.email.toLowerCase()
        ) {
          acceptAsCurrent();
          return;
        }
        setPhase("join");
      } catch (err) {
        setPhase("error");
        setMessage(
          err.response?.data?.message || "This invite is invalid or expired.",
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken, workspaceId]);

  // Create the account + join in one call.
  const createAndJoin = async () => {
    if (!form.name.trim()) return toast.error("Enter your name");
    const s = checkPassword(form.password, {
      email: info?.email,
      name: form.name,
    });
    if (!s.ok) return toast.error(s.message || "Choose a stronger password");
    if (turnstileEnabled && !captcha)
      return toast.error("Please complete the human check");

    setSubmitting(true);
    try {
      const { data } = await api.post("/workspaces/invite-signup", {
        token: inviteToken,
        workspaceId,
        name: form.name,
        password: form.password,
        "cf-turnstile-token": captcha,
      });
      login(data.user, data.token, data.refreshToken);
      setPhase("success");
      setMessage(data.message || "You've joined the team!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1400);
    } catch (err) {
      // Account already exists → route them to sign in.
      if (err.response?.status === 409) {
        toast(err.response.data.message);
        goSignIn();
      } else {
        toast.error(err.response?.data?.message || "Couldn't create account");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Google: sign in/up, then accept the invite for the matching email.
  const handleGoogle = async (credentialResponse) => {
    setSubmitting(true);
    try {
      const credential = credentialResponse?.credential;
      if (!credential) throw new Error("No Google credential");
      const { data } = await api.post("/auth/google", { credential });
      // Guard: Google email must match the invited email.
      if (data.user?.email?.toLowerCase() !== info.email.toLowerCase()) {
        toast.error(
          `This invite is for ${info.email}. Use that Google account.`,
        );
        setSubmitting(false);
        return;
      }
      login(data.user, data.token, data.refreshToken);
      await api.post("/workspaces/accept-invite", {
        token: inviteToken,
        workspaceId,
      });
      setPhase("success");
      setMessage(`Welcome to ${info.workspaceName}!`);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1400);
    } catch (err) {
      toast.error(err.response?.data?.message || "Google sign-in failed");
      setSubmitting(false);
    }
  };

  const goSignIn = () => {
    const next = encodeURIComponent(backToInvite);
    navigate(
      `/login?next=${next}${
        info?.email ? `&email=${encodeURIComponent(info.email)}` : ""
      }`,
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white shadow-xl p-8">
        {phase === "loading" && (
          <div className="text-center">
            <Loader2 className="w-7 h-7 text-brand-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-ink-500">Checking your invite…</p>
          </div>
        )}

        {phase === "accepting" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
            </div>
            <p className="font-bold text-ink-900">Joining the team…</p>
          </div>
        )}

        {phase === "success" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-black text-ink-900 text-lg">You're in! 🎉</p>
            <p className="text-sm text-ink-500 mt-1.5">{message}</p>
            <p className="text-xs text-ink-400 mt-3">
              Taking you to the dashboard…
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="font-black text-ink-900 text-lg">Invite problem</p>
            <p className="text-sm text-ink-500 mt-1.5">{message}</p>
            <Link
              to="/dashboard"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline"
            >
              <Users className="w-4 h-4" /> Go to dashboard
            </Link>
          </div>
        )}

        {phase === "join" && info && (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="font-black text-ink-900 text-lg leading-tight">
                Join {info.workspaceName}
              </h1>
              <p className="text-sm text-ink-500 mt-1">
                {info.ownerName ? `${info.ownerName} invited ` : "You were invited "}
                <span className="font-semibold text-ink-700">{info.email}</span>{" "}
                as a team member.
              </p>
            </div>

            {/* Signed in as a DIFFERENT account */}
            {authToken &&
              user?.email &&
              user.email.toLowerCase() !== info.email.toLowerCase() && (
                <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  You're signed in as{" "}
                  <span className="font-semibold">{user.email}</span>. To accept,
                  continue as the invited email below.
                </div>
              )}

            {/* Existing account → just sign in */}
            {info.hasAccount ? (
              <div className="space-y-3">
                <p className="text-sm text-ink-600 text-center">
                  You already have a Botlify account. Sign in to accept.
                </p>
                <button
                  onClick={goSignIn}
                  className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2.5 transition"
                >
                  Sign in as {info.email}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogle}
                    onError={() => toast.error("Google sign-in was cancelled")}
                    text="signup_with"
                    size="large"
                    width="100%"
                  />
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ink-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-[11px] text-ink-400">
                      or create a password
                    </span>
                  </div>
                </div>

                {/* Email (locked to the invited address) */}
                <div>
                  <label className="text-xs font-bold text-ink-700">Email</label>
                  <div className="relative mt-1.5">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      readOnly
                      value={info.email}
                      className="w-full rounded-xl border border-ink-200 bg-ink-50 pl-9 pr-3 py-2.5 text-sm text-ink-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink-700">
                    Your name
                  </label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink-700">
                    Create a password
                  </label>
                  <div className="relative mt-1.5">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-ink-200 pl-9 pr-10 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    >
                      {showPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrength
                    password={form.password}
                    email={info.email}
                    name={form.name}
                  />
                </div>

                {turnstileEnabled && (
                  <TurnstileWidget onToken={setCaptcha} className="pt-1" />
                )}

                <button
                  onClick={createAndJoin}
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2.5 disabled:opacity-50 transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Joining…
                    </>
                  ) : (
                    <>Create account & join</>
                  )}
                </button>

                <p className="text-center text-xs text-ink-400">
                  Already have an account?{" "}
                  <button
                    onClick={goSignIn}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
