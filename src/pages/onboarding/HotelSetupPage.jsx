/**
 * Name your hotel — the only mandatory onboarding step.
 *
 * Creates the workspace (if needed) and the property, optionally credits a
 * consultant referral, then drops the owner straight into the dashboard.
 * There is no vertical/business-type picker any more: the backend defaults
 * every workspace to "hospitality".
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Hotel, Loader2, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function HotelSetupPage() {
  const navigate = useNavigate();
  const { activeWorkspace, setActiveWorkspace, user } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [ensuring, setEnsuring] = useState(!activeWorkspace);
  const [checking, setChecking] = useState(true);

  // Optional consultant referral code — validated live, credited on save.
  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null); // null|"checking"|"valid"|"invalid"
  const [refName, setRefName] = useState("");

  // A workspace is created deliberately here (not at signup).
  useEffect(() => {
    let alive = true;
    if (activeWorkspace) {
      setEnsuring(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.post("/workspaces/ensure", {
          name: user?.name ? `${user.name}'s Hotel` : undefined,
        });
        if (!alive) return;
        setActiveWorkspace(data.workspace._id);
        fetchWorkspace(data.workspace._id);
      } catch (e) {
        if (alive)
          toast.error(
            e?.response?.data?.message || "Couldn't set up your workspace",
          );
      } finally {
        if (alive) setEnsuring(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  // Already has a property? Then this step is done — go straight in.
  useEffect(() => {
    let alive = true;
    if (ensuring || !activeWorkspace) return;
    (async () => {
      try {
        const { data } = await api.get("/hotel/properties");
        if (!alive) return;
        if ((data.properties || []).length > 0) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch {
        /* fall through to the form */
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensuring, activeWorkspace]);

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

  const submit = async (e) => {
    e.preventDefault();
    const hotelName = name.trim();
    if (!hotelName) {
      toast.error("What's your hotel called?");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await api.post("/hotel/properties", {
        name: hotelName,
        city: city.trim(),
      });

      // Best-effort — a referral problem must never block setup.
      if (refCode.trim() && refState === "valid") {
        try {
          await api.post("/consultants/attribute", { code: refCode.trim() });
          toast.success(`Referral credited to ${refName || "your consultant"}`);
        } catch {
          /* ignore */
        }
      }

      await fetchWorkspace(activeWorkspace, { force: true });
      toast.success("You're all set!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't save your hotel — try again",
      );
      setSaving(false);
    }
  };

  if (ensuring || checking) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Hotel className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-ink-900">
            What's your hotel called?
          </h1>
          <p className="text-sm text-ink-500 mt-1.5">
            That's all we need. You can add rooms and channels in a minute.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-2xl border border-ink-100 shadow-lg p-6 sm:p-7 space-y-4"
        >
          <div>
            <label className="label" htmlFor="hotelName">
              Hotel name
            </label>
            <input
              id="hotelName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sunset Beach Resort"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="hotelCity">
              City <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <input
              id="hotelCity"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Canggu, Bali"
              className="input"
            />
          </div>

          {/* Optional consultant referral */}
          <div>
            <label className="label" htmlFor="refCode">
              Referral code{" "}
              <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              <input
                id="refCode"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                placeholder="Have a consultant's code?"
                className="input pl-9"
              />
              {refState === "checking" && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 animate-spin" />
              )}
              {refState === "valid" && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
            </div>
            {refState === "valid" && (
              <p className="text-xs text-emerald-600 mt-1">
                Referred by {refName || "a Botlify consultant"}
              </p>
            )}
            {refState === "invalid" && (
              <p className="text-xs text-ink-400 mt-1">
                We don't recognise that code — you can leave it blank.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn-primary w-full"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
