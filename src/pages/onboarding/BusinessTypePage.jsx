/**
 * Business Type — the one-time vertical setup step. After Instagram is
 * connected we read the user's site/profile, guess their business category,
 * let them confirm or change it, then apply the tailored pack (persona,
 * messages, FAQs, automations, features) in one shot.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Wand2,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function BusinessTypePage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [verticals, setVerticals] = useState([]);
  const [detecting, setDetecting] = useState(true);
  const [detected, setDetected] = useState(null); // { category, confidence, reasoning }
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);

  // Optional consultant referral code — validated live, attributed on apply.
  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null); // null | "checking" | "valid" | "invalid"
  const [refName, setRefName] = useState("");

  useEffect(() => {
    const code = refCode.trim();
    if (!code) {
      setRefState(null);
      setRefName("");
      return;
    }
    setRefState("checking");
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/consultants/validate/${encodeURIComponent(code)}`,
        );
        if (data?.valid) {
          setRefState("valid");
          setRefName(data.consultantName || "");
        } else {
          setRefState("invalid");
          setRefName("");
        }
      } catch {
        setRefState("invalid");
        setRefName("");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [refCode]);

  // Load the category grid + run auto-detection in parallel.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/verticals");
        if (alive) setVerticals(data.verticals || []);
      } catch {
        /* grid still usable once detection resolves */
      }
    })();

    if (!activeWorkspace) return;
    (async () => {
      try {
        const { data } = await api.post(
          `/workspaces/${activeWorkspace}/vertical/detect`,
        );
        if (!alive) return;
        setDetected(data);
        setSelected(data.category);
      } catch {
        if (alive) setSelected("general");
      } finally {
        if (alive) setDetecting(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeWorkspace]);

  const apply = async () => {
    if (!selected || applying) return;
    setApplying(true);
    try {
      await api.post(`/workspaces/${activeWorkspace}/vertical/apply`, {
        category: selected,
      });
      // Attribute the consultant referral (best-effort — never blocks setup).
      if (refCode.trim() && refState === "valid") {
        try {
          await api.post("/consultants/attribute", { code: refCode.trim() });
          toast.success(`Referral credited to ${refName || "your consultant"}`);
        } catch {
          /* attribution failures shouldn't stop onboarding */
        }
      }
      await fetchWorkspace(activeWorkspace, { force: true });
      toast.success("Your Botlify is tailored to your business! 🎉");
      navigate("/dashboard?connected=true", { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't finish setup");
      setApplying(false);
    }
  };

  const chosen = verticals.find((v) => v.key === selected);
  const confident = detected && detected.confidence >= 55;

  return (
    <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Wand2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-ink-900">
            What kind of business are you?
          </h1>
          <p className="text-sm text-ink-500 mt-1.5 max-w-md mx-auto">
            We'll tailor your bot, messages and automations to fit — you can
            change anything later.
          </p>
        </div>

        {/* Detection banner */}
        {detecting ? (
          <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-brand-500 animate-spin shrink-0" />
            <p className="text-sm text-ink-600">
              Reading your page to find the best match…
            </p>
          </div>
        ) : (
          detected &&
          confident &&
          chosen && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm text-ink-700">
                <span className="font-semibold text-ink-900">
                  Looks like you run a {chosen.emoji} {chosen.label}.
                </span>{" "}
                {detected.reasoning}
                <span className="block text-xs text-ink-500 mt-0.5">
                  Not right? Just pick the correct one below.
                </span>
              </div>
            </div>
          )
        )}

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {verticals.map((v) => {
            const isSel = selected === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setSelected(v.key)}
                className={`relative text-left rounded-2xl border p-4 transition ${
                  isSel
                    ? "border-brand-500 bg-brand-50/70 ring-2 ring-brand-100 shadow-sm"
                    : "border-ink-100 bg-white hover:border-ink-200 hover:shadow-sm"
                }`}
              >
                {isSel && (
                  <CheckCircle2 className="w-5 h-5 text-brand-500 absolute top-3 right-3" />
                )}
                <div className="text-2xl mb-2">{v.emoji}</div>
                <p className="text-sm font-bold text-ink-900 leading-tight">
                  {v.label}
                </p>
                <p className="text-[11px] text-ink-500 mt-1 leading-snug">
                  {v.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Referral code (optional) */}
        <div className="mt-5 rounded-2xl border border-ink-100 bg-white p-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 mb-1.5">
            <Ticket className="w-3.5 h-3.5 text-brand-500" />
            Referral code (optional)
          </label>
          <input
            value={refCode}
            onChange={(e) => setRefCode(e.target.value.toUpperCase())}
            placeholder="Got a code from a Botlify consultant?"
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none font-mono tracking-wider"
          />
          {refState === "checking" && (
            <p className="mt-1.5 text-[11px] text-ink-400 inline-flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Checking code…
            </p>
          )}
          {refState === "valid" && (
            <p className="mt-1.5 text-[11px] text-emerald-600 inline-flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Valid — referred by{" "}
              {refName || "a Botlify consultant"}
            </p>
          )}
          {refState === "invalid" && (
            <p className="mt-1.5 text-[11px] text-rose-500">
              This code doesn't look right — double-check with your consultant.
            </p>
          )}
        </div>

        {/* Apply */}
        <button
          onClick={apply}
          disabled={!selected || applying}
          className="mt-6 w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {applying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Setting up your
              Botlify…
            </>
          ) : (
            <>
              Set up my Botlify <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-ink-400 mt-3">
          This customizes your AI persona, welcome messages, FAQs and
          automations for your industry.
        </p>
      </div>
    </div>
  );
}
