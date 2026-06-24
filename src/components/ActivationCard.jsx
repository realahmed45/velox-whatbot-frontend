/**
 * Activation Checklist — "Get Started" card shown on Overview page.
 *
 * Tracks 4 onboarding tasks every new workspace should complete in week 1:
 *   1. Welcome message set
 *   2. At least 3 keyword auto-replies
 *   3. Contacts imported (or skipped)
 *   4. Test message sent
 *
 * Auto-hides when all 4 are done OR user clicks "Dismiss".
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, X, Sparkles } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import toast from "react-hot-toast";

export default function ActivationCard() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const navigate = useNavigate();
  const [dismissing, setDismissing] = useState(false);

  const a = workspace?.activation || {};
  const steps = useMemo(
    () => [
      {
        key: "welcomeSet",
        label: "Set a welcome message",
        desc: "First-time visitors get an instant reply.",
        action: () => navigate("/dashboard/automation?tab=welcome"),
        done: !!a.welcomeSet,
      },
      {
        key: "keywordsSet",
        label: "Add 3 keyword auto-replies",
        desc: "When a customer types a keyword, auto-reply.",
        action: () => navigate("/dashboard/automation?tab=dm_kw"),
        done: !!a.keywordsSet,
      },
      {
        key: "contactsImported",
        label: "Import contacts (or skip)",
        desc: "Bring your existing customer list.",
        action: () => navigate("/dashboard/contacts?import=1"),
        done: !!a.contactsImported,
      },
      {
        key: "testSent",
        label: "Preview a reply",
        desc: "Confirm your automation is working as expected.",
        action: () => navigate("/dashboard/ai-bot?test=1"),
        done: !!a.testSent,
      },
    ],
    [a, navigate],
  );

  const allDone = steps.every((s) => s.done);
  if (a.dismissed || allDone || !workspace) return null;

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  const dismiss = async () => {
    setDismissing(true);
    try {
      await api.patch(`/workspaces/${activeWorkspace}/activation`, {
        dismissed: true,
      });
      await fetchWorkspace(activeWorkspace);
    } catch {
      toast.error("Could not dismiss");
    } finally {
      setDismissing(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-50/80 via-white/70 to-amber-50/80 backdrop-blur-xl border border-white/60 shadow-glass">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-900">
                Get started — {pct}% complete
              </h2>
              <p className="text-xs text-ink-500">
                Finish these steps to launch your Instagram automation.
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            disabled={dismissing}
            className="text-ink-400 hover:text-ink-700 transition disabled:opacity-50"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="space-y-2">
          {steps.map((s) => (
            <li
              key={s.key}
              className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                s.done
                  ? "bg-emerald-50/50 border-emerald-100"
                  : "bg-white border-ink-100 hover:border-brand-200 hover:shadow-sm cursor-pointer"
              }`}
              onClick={!s.done ? s.action : undefined}
            >
              <div
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  s.done
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-ink-200 text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    s.done ? "text-emerald-700 line-through" : "text-ink-900"
                  }`}
                >
                  {s.label}
                </p>
                <p className="text-xs text-ink-500 truncate">{s.desc}</p>
              </div>
              {!s.done && (
                <ArrowRight className="w-4 h-4 text-ink-400 shrink-0" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
