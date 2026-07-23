import { useEffect, useMemo, useState } from "react";
import { X, Loader2, Search, Sparkles, ArrowRight } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="px-5 py-4 border-b border-ink-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-black text-ink-900">Start from a template</h2>
              <p className="text-xs text-ink-500 mt-0.5">
                Pick a proven flow, then edit the wording to match your business.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* filters */}
        <div className="px-5 py-3 border-b border-ink-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates…"
              className="w-full rounded-xl border border-ink-200 pl-9 pr-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  cat === c
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-ink-600 border-ink-200 hover:border-brand-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-ink-400 gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading templates…
            </div>
          ) : shown.length === 0 ? (
            <p className="text-center py-16 text-sm text-ink-500">
              No templates match “{q}”.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shown.map((s) => (
                <button
                  key={s.key}
                  onClick={() => install(s)}
                  disabled={!!installing}
                  className="group text-left rounded-2xl border border-ink-100 bg-white p-4 hover:border-brand-300 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400 bg-ink-50 rounded-full px-2 py-0.5">
                      {s.steps} steps
                    </span>
                  </div>
                  <p className="font-bold text-sm text-ink-900 mt-2.5">
                    {s.name}
                  </p>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed flex-1">
                    {s.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:gap-1.5 transition-all">
                    {installing === s.key ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…
                      </>
                    ) : (
                      <>
                        Use this <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
