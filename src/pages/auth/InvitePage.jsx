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
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Aurora } from "@/components/fx";
import BotlifyMark from "@/components/BotlifyMark";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import PasswordStrength from "@/components/auth/PasswordStrength";
import TurnstileWidget, {
  turnstileEnabled,
} from "@/components/auth/TurnstileWidget";
import { checkPassword } from "@/utils/passwordPolicy";
import toast from "react-hot-toast";

// Dark liquid-glass field — `.input` is the light variant.
const FIELD =
  "block w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 bg-white/[0.06] ring-1 ring-white/10 outline-none transition-[box-shadow,background-color] duration-300 hover:ring-white/20 focus:bg-white/[0.09] focus:ring-2 focus:ring-sunset-flame/60 focus:shadow-[0_0_0_4px_rgba(255,106,43,0.12),0_8px_24px_-12px_rgba(255,61,119,0.5)]";
const LABEL = "block text-[13px] font-medium text-white/70 mb-1.5";

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
  const { token: authToken, user, login, setActiveWorkspace } = useAuthStore();

  // After joining, point the app at the owner's workspace and clear any cached
  // (personal) workspace so the dashboard loads the owner's fresh on reload.
  const switchIntoWorkspace = (joinedId) => {
    try {
      setActiveWorkspace(joinedId || workspaceId);
      localStorage.removeItem("botlify-workspace");
    } catch {
      /* ignore */
    }
  };

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
      switchIntoWorkspace(data.workspaceId);
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
      switchIntoWorkspace(data.workspaceId);
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
      const { data: joinData } = await api.post(
        "/workspaces/accept-invite",
        { token: inviteToken, workspaceId },
      );
      switchIntoWorkspace(joinData.workspaceId);
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
    <div className="relative isolate min-h-screen flex flex-col items-center justify-center bg-night-950 text-white p-4 overflow-hidden grain">
      <Aurora variant="dark" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-dot-grid-dark opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <Link
        to="/"
        className="mb-6 inline-flex items-center transition-transform duration-500 ease-spring hover:-translate-y-0.5"
      >
        <BotlifyMark size={44} />
      </Link>

      <motion.div
        layout
        initial={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="card-dark w-full max-w-sm p-6 sm:p-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {phase === "loading" && (
              <div className="text-center py-4">
                <Loader2 className="w-7 h-7 text-sunset-gold animate-spin mx-auto mb-3" />
                <p className="text-sm text-white/60">Checking your invite…</p>
              </div>
            )}

            {phase === "accepting" && (
              <div className="text-center py-2">
                <div className="relative w-14 h-14 mx-auto mb-4">
                  <div aria-hidden className="absolute -inset-3 rounded-full bg-sunset opacity-30 blur-2xl" />
                  <div className="relative w-14 h-14 rounded-2xl bg-sunset grid place-items-center">
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  </div>
                </div>
                <p className="font-display font-semibold text-white">Joining the team…</p>
              </div>
            )}

            {phase === "success" && (
              <div className="text-center py-2">
                <motion.div
                  initial={{ scale: 0.4, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 14 }}
                  className="relative w-14 h-14 mx-auto mb-4"
                >
                  <div aria-hidden className="absolute -inset-3 rounded-full bg-emerald-400 opacity-30 blur-2xl" />
                  <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-400/40 grid place-items-center">
                    <Check className="w-7 h-7 text-emerald-300" />
                  </div>
                </motion.div>
                <p className="font-display font-semibold tracking-[-0.02em] text-white text-xl">
                  You're <span className="font-serif italic font-normal">in!</span> 🎉
                </p>
                <p className="text-sm text-white/60 mt-1.5">{message}</p>
                <p className="text-xs text-white/40 mt-3">
                  Taking you to the dashboard…
                </p>
              </div>
            )}

            {phase === "error" && (
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 ring-1 ring-rose-400/30 grid place-items-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-rose-300" />
                </div>
                <p className="font-display font-semibold tracking-[-0.02em] text-white text-xl">
                  Invite problem
                </p>
                <p className="text-sm text-white/60 mt-1.5">{message}</p>
                <Link
                  to="/dashboard"
                  className="btn-glass-dark mt-5 group"
                >
                  <Users className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" />{" "}
                  Go to dashboard
                </Link>
              </div>
            )}

            {phase === "join" && info && (
              <div>
                <div className="text-center mb-6">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div aria-hidden className="absolute -inset-3 rounded-full bg-sunset opacity-30 blur-2xl" />
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-12 h-12 rounded-2xl bg-sunset text-white grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                    >
                      <Users className="w-6 h-6" strokeWidth={1.8} />
                    </motion.div>
                  </div>
                  <h1 className="font-display font-semibold tracking-[-0.03em] text-white text-2xl leading-tight">
                    Join{" "}
                    <span className="font-serif italic font-normal">
                      {info.workspaceName}
                    </span>
                  </h1>
                  <p className="text-sm text-white/60 mt-1.5">
                    {info.ownerName ? `${info.ownerName} invited ` : "You were invited "}
                    <span className="font-semibold text-white break-all">{info.email}</span>{" "}
                    as a team member.
                  </p>
                </div>

                {/* Signed in as a DIFFERENT account */}
                {authToken &&
                  user?.email &&
                  user.email.toLowerCase() !== info.email.toLowerCase() && (
                    <div className="mb-4 rounded-xl bg-amber-400/10 ring-1 ring-amber-300/25 p-3 text-xs text-amber-100">
                      You're signed in as{" "}
                      <span className="font-semibold">{user.email}</span>. To accept,
                      continue as the invited email below.
                    </div>
                  )}

                {/* Existing account → just sign in */}
                {info.hasAccount ? (
                  <div className="space-y-3">
                    <p className="text-sm text-white/65 text-center">
                      You already have a Botlify account. Sign in to accept.
                    </p>
                    <button onClick={goSignIn} className="btn-primary w-full h-11 group">
                      <span className="truncate">Sign in as {info.email}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex justify-center rounded-xl overflow-hidden ring-1 ring-white/10 transition-transform duration-500 ease-spring hover:-translate-y-0.5">
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
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-3 text-[11px] uppercase tracking-[0.14em] text-white/40 bg-night-950/60 backdrop-blur rounded-full">
                          or create a password
                        </span>
                      </div>
                    </div>

                    {/* Email (locked to the invited address) */}
                    <div>
                      <label className={LABEL}>Email</label>
                      <div className="relative">
                        <Mail strokeWidth={1.8} className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                        <input
                          readOnly
                          value={info.email}
                          className="w-full rounded-xl bg-white/[0.03] ring-1 ring-white/10 pl-9 pr-3 py-2.5 text-sm text-white/50 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={LABEL}>Your name</label>
                      <input
                        className={FIELD}
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className={LABEL}>Create a password</label>
                      <div className="relative group">
                        <Lock
                          strokeWidth={1.8}
                          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors group-focus-within:text-sunset-gold pointer-events-none"
                        />
                        <input
                          type={showPw ? "text" : "password"}
                          autoComplete="new-password"
                          className={`${FIELD} pl-9 pr-11`}
                          placeholder="At least 8 characters"
                          value={form.password}
                          onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          aria-label={showPw ? "Hide password" : "Show password"}
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-lg text-white/45 hover:text-white hover:bg-white/10 active:scale-90 transition duration-300 ease-spring"
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
                      className="btn-primary w-full h-11 group"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Joining…
                        </>
                      ) : (
                        <>
                          Create account & join
                          <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-white/45">
                      Already have an account?{" "}
                      <button
                        onClick={goSignIn}
                        className="font-semibold text-sunset-gold hover:underline underline-offset-4"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
