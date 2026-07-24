import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Check, XCircle, Users } from "lucide-react";
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
  const { token: authToken } = useAuthStore();

  const inviteToken = params.get("token");
  const workspaceId = params.get("workspace");

  const [status, setStatus] = useState("working"); // working | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!inviteToken || !workspaceId) {
      setStatus("error");
      setMessage("This invite link is incomplete or invalid.");
      return;
    }

    // Not signed in → send to login, then come back to this exact URL.
    if (!authToken) {
      const next = encodeURIComponent(
        `/invite?token=${inviteToken}&workspace=${workspaceId}`,
      );
      navigate(`/login?next=${next}`, { replace: true });
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
