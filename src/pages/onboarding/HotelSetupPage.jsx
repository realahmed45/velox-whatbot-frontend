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
import {
  ArrowRight,
  CheckCircle2,
  Hotel,
  Loader2,
  MapPin,
  Ticket,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic, Reveal } from "@/components/fx";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

// Dark liquid-glass field — `.input` is the light variant.
const FIELD =
  "block w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 bg-white/[0.06] ring-1 ring-white/10 outline-none transition-[box-shadow,background-color] duration-300 hover:ring-white/20 focus:bg-white/[0.09] focus:ring-2 focus:ring-sunset-flame/60 focus:shadow-[0_0_0_4px_rgba(255,106,43,0.12),0_8px_24px_-12px_rgba(255,61,119,0.5)]";
const LABEL = "block text-[13px] font-medium text-white/70 mb-1.5";
const ICON =
  "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors group-focus-within:text-sunset-gold pointer-events-none";

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
      <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md" aria-busy="true">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white/[0.06] animate-pulse" />
          <div className="mx-auto mb-2 h-7 w-64 max-w-full rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="mx-auto mb-6 h-4 w-72 max-w-full rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="h-80 rounded-2xl bg-white/[0.05] ring-1 ring-white/[0.06] animate-pulse" />
          <span className="sr-only">
            <Loader2 className="w-7 h-7 animate-spin" />
            Loading
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12 text-white">
      <div className="w-full max-w-md">
        <Reveal className="text-center mb-7">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-30 blur-2xl" />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-14 h-14 rounded-2xl bg-sunset grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_36px_-12px_rgba(255,61,119,0.8)]"
            >
              <Hotel className="w-7 h-7 text-white" strokeWidth={1.8} />
            </motion.div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
            What's your hotel{" "}
            <span className="font-serif italic font-normal text-sunset">called?</span>
          </h1>
          <p className="text-sm text-white/60 mt-2">
            That's all we need. You can add rooms and channels in a minute.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <form onSubmit={submit} className="card-dark p-6 sm:p-7 space-y-4">
            <div>
              <label className={LABEL} htmlFor="hotelName">
                Hotel name
              </label>
              <input
                id="hotelName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sunset Beach Resort"
                className={FIELD}
                autoFocus
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="hotelCity">
                City <span className="font-normal text-white/40">(optional)</span>
              </label>
              <div className="relative group">
                <MapPin strokeWidth={1.8} className={ICON} />
                <input
                  id="hotelCity"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Canggu, Bali"
                  className={`${FIELD} pl-9`}
                />
              </div>
            </div>

            {/* Optional consultant referral */}
            <div>
              <label className={LABEL} htmlFor="refCode">
                Referral code{" "}
                <span className="font-normal text-white/40">(optional)</span>
              </label>
              <div className="relative group">
                <Ticket strokeWidth={1.8} className={ICON} />
                <input
                  id="refCode"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="Have a consultant's code?"
                  className={`${FIELD} pl-9 pr-9`}
                />
                <AnimatePresence mode="wait">
                  {refState === "checking" && (
                    <motion.span
                      key="checking"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                    </motion.span>
                  )}
                  {refState === "valid" && (
                    <motion.span
                      key="valid"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {refState === "valid" && (
                <p className="text-xs text-emerald-300 mt-1.5">
                  Referred by {refName || "a Botlify consultant"}
                </p>
              )}
              {refState === "invalid" && (
                <p className="text-xs text-white/45 mt-1.5">
                  We don't recognise that code — you can leave it blank.
                </p>
              )}
            </div>

            <Magnetic strength={0.12} className="w-full">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="btn-primary w-full h-11 group"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue
                {!saving && (
                  <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                )}
              </button>
            </Magnetic>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
