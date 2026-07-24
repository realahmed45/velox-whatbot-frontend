import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Check, XCircle, Users, UserCog } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

/**
 * Team-invite landing page. The emailed link is
 *   /invite?token=<raw>&workspace=<id>
 * If the user is signed in, we call accept-invite. If not, we bounce them to
 * login/register with a redirect back here so they can accept after signing in.
 */
export default function InvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token: authToken, user, logout } = useAuthStore();

  const inviteToken = params.get("token");
  const workspaceId = params.get("workspace");
  const invitedEmail = params.get("email") || "";

  const [status, setStatus] = useState("working"); // working | success | mismatch | error
  const [message, setMessage] = useState("");

  // Build the return-to-invite redirect once so login/register bring the user
  // back here after they authenticate as the right account.
  const backToInvite = `/invite?token=${inviteToken}&workspace=${workspaceId}${
    invitedEmail ? `&email=${encodeURIComponent(invitedEmail)}` : ""
  }`;

  // Log out the current (wrong) account and go authenticate as the invited one,
  // with the email prefilled and a redirect back to this invite.
  const switchAccount = (dest) => {
    logout();
    const next = encodeURIComponent(backToInvite);
    const emailParam = invitedEmail
      ? `&email=${encodeURIComponent(invitedEmail)}`
      : "";
    navigate(`${dest}?next=${next}${emailParam}`, { replace: true });
  };

  useEffect(() => {
    if (!inviteToken || !workspaceId) {
      setStatus("error");
      setMessage("This invite link is incomplete or invalid.");
      return;
    }

    // Not signed in → send to REGISTER (invitees usually need an account),
    // pre-filling the email and returning here after they sign up/in. The
    // register page has a "sign in instead" link for people who already have
    // an account.
    if (!authToken) {
      const next = encodeURIComponent(backToInvite);
      const emailParam = invitedEmail
        ? `&email=${encodeURIComponent(invitedEmail)}`
        : "";
      navigate(`/register?next=${next}${emailParam}`, { replace: true });
      return;
    }

    // Signed in as the wrong account? Don't even hit the API — show a clear
    // "switch account" screen. (The backend enforces this too.)
    if (
      invitedEmail &&
      user?.email &&
      user.email.toLowerCase() !== invitedEmail.toLowerCase()
    ) {
      setStatus("mismatch");
      return;
    }

    (async () => {
      try {
        const { data } = await api.post("/workspaces/accept-invite", {
          token: inviteToken,
          workspaceId,
        });
        setStatus("success");
        setMessage(data.message || "You've joined the team!");
        // Full reload so the joined workspace shows up everywhere cleanly.
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1600);
      } catch (err) {
        // A 403 from the email guard → offer the switch-account flow.
        if (err.response?.status === 403) {
          setStatus("mismatch");
          setMessage(err.response?.data?.message || "");
          return;
        }
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "We couldn't accept this invite. It may have expired.",
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, inviteToken, workspaceId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white shadow-xl p-8 text-center">
        {status === "working" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
            </div>
            <p className="font-bold text-ink-900">Joining the team…</p>
            <p className="text-sm text-ink-500 mt-1">One moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-black text-ink-900 text-lg">You're in! 🎉</p>
            <p className="text-sm text-ink-500 mt-1.5">{message}</p>
            <p className="text-xs text-ink-400 mt-3">Taking you to the dashboard…</p>
          </>
        )}

        {status === "mismatch" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <UserCog className="w-7 h-7 text-amber-500" />
            </div>
            <p className="font-black text-ink-900 text-lg">Wrong account</p>
            <p className="text-sm text-ink-500 mt-1.5">
              This invite is for{" "}
              <span className="font-semibold text-ink-800">
                {invitedEmail || "another email"}
              </span>
              {user?.email && (
                <>
                  , but you're signed in as{" "}
                  <span className="font-semibold text-ink-800">
                    {user.email}
                  </span>
                </>
              )}
              . Continue with the invited account to join.
            </p>
            <div className="mt-5 space-y-2">
              <button
                onClick={() => switchAccount("/login")}
                className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2.5 transition"
              >
                Sign in as {invitedEmail || "the invited email"}
              </button>
              <button
                onClick={() => switchAccount("/register")}
                className="w-full rounded-xl border border-ink-200 text-ink-700 font-bold text-sm px-4 py-2.5 hover:bg-ink-50 transition"
              >
                Create this account
              </button>
              <Link
                to="/dashboard"
                className="block text-xs font-semibold text-ink-400 hover:text-ink-600 pt-1"
              >
                Stay signed in as {user?.email || "current account"}
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
