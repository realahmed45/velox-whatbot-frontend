import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Search, Sparkles, ArrowRight } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { SlidingTabs, Spotlight } from "@/components/fx";

/**
 * StarterGallery — pick a ready-made flow and install it as an editable draft.
 * Shown as a modal from the builder and the Custom Flows page.
 */
export default function StarterGallery({ open, onClose, onInstalled }) {
  const [starters, setStarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    api
      .get("/flows/starters")
      .then(({ data }) => alive && setStarters(data.starters || []))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open]);

  const categories = useMemo(
    () => ["All", ...new Set(starters.map((s) => s.category).filter(Boolean))],
    [starters],
  );

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return starters.filter((s) => {
      const okCat = cat === "All" || s.category === cat;
      const okTerm =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term);
      return okCat && okTerm;
    });
  }, [starters, q, cat]);

  const install = async (s) => {
    setInstalling(s.key);
    try {
      const { data } = await api.post("/flows/from-starter", {
        starterKey: s.key,
      });
      toast.success(`"${s.name}" added — edit it, then hit Activate`);
      onInstalled?.(data.flow);
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.message || "Couldn't add that flow");
    } finally {
      setInstalling(null);
    }
  };

  // Lock page scroll + close on Escape while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Portal to <body> so the sidebar/canvas stacking context can never clip or
  // bleed through the overlay. AnimatePresence lets it pop in and out.
  return createPortal(
    <AnimatePresence>
    {open && (
    <motion.div
      key="starter-gallery"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-night-950/40 backdrop-blur-md"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="glass-strong w-full max-w-5xl max-h-[88vh] rounded-3xl flex flex-col overflow-hidden"
      >
        {/* header */}
        <div className="px-4 sm:px-5 py-4 border-b border-ink-900/[0.06] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-sunset text-white grid place-items-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.7)]">
              <Sparkles className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">
                Start from a{" "}
                <span className="font-serif italic font-normal">template</span>
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                Pick a proven flow, then edit the wording to match your business.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 grid place-items-center rounded-xl text-ink-400 hover:text-ink-700 hover:bg-ink-900/[0.05] hover:rotate-90 active:scale-90 transition-all duration-300 ease-spring shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* filters */}
        <div className="px-4 sm:px-5 py-3 border-b border-ink-900/[0.06] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates…"
              className="input w-full !pl-9"
            />
          </div>
          <div className="max-w-full overflow-x-auto no-scrollbar">
            <SlidingTabs
              size="sm"
              className="whitespace-nowrap"
              value={cat}
              onChange={setCat}
              items={categories.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </div>

        {/* grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
              <span className="sr-only">Loading templates…</span>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-2xl bg-white/60 ring-1 ring-ink-900/[0.06] p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-10 w-10 rounded-xl bg-ink-900/[0.06] animate-pulse" />
                    <div className="h-4 w-14 rounded-full bg-ink-900/[0.06] animate-pulse" />
                  </div>
                  <div className="h-3.5 w-2/3 rounded-md bg-ink-900/[0.06] animate-pulse" />
                  <div className="h-3 w-full rounded-md bg-ink-900/[0.06] animate-pulse" />
                  <div className="h-3 w-4/5 rounded-md bg-ink-900/[0.06] animate-pulse" />
                </div>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <p className="text-center py-16 text-sm text-ink-500">
              No templates match “{q}”.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shown.map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 12) * 0.035, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                <Spotlight
                  as="button"
                  onClick={() => install(s)}
                  disabled={!!installing}
                  className="card-hover group w-full h-full text-left p-4 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-10 h-10 rounded-xl bg-sunset-soft grid place-items-center text-2xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">{s.icon}</span>
                    <span className="badge-gray text-[10px] uppercase tracking-wide tabular-nums">
                      {s.steps} steps
                    </span>
                  </div>
                  <p className="font-display font-semibold tracking-[-0.01em] text-[15px] text-ink-900 mt-3">
                    {s.name}
                  </p>
                  <p className="text-[13px] text-ink-500 mt-1 leading-relaxed flex-1">
                    {s.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sunset-flame">
                    {installing === s.key ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…
                      </>
                    ) : (
                      <>
                        Use this <ArrowRight className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </Spotlight>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>,
    document.body,
  );
}
