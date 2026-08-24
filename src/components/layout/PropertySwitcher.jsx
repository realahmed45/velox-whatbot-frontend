/**
 * PropertySwitcher — which hotel the dashboard is showing.
 *
 * Deliberately INVISIBLE for the common case. A workspace with one property
 * renders nothing at all: single-property hoteliers are the majority and must
 * never pay a complexity tax for a feature built for groups. It only appears
 * once a second property exists.
 *
 * Lives in the sidebar under the logo, on the dark surface, so it reads as
 * "which account am I in" rather than as a filter control.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Hotel, Plus } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { usePropertyStore } from "@/store/propertyStore";

export default function PropertySwitcher({ collapsed, onNavigate }) {
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const properties = usePropertyStore((s) => s.properties);
  const fetchProperties = usePropertyStore((s) => s.fetchProperties);
  const select = usePropertyStore((s) => s.select);
  const selectedByWorkspace = usePropertyStore((s) => s.selectedByWorkspace);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (activeWorkspace) fetchProperties(activeWorkspace);
  }, [activeWorkspace, fetchProperties]);

  // Close on outside click / Escape — the sidebar has no overlay of its own.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // One property (or none) → the switcher doesn't exist.
  if (properties.length < 2) return null;

  const chosen = activeWorkspace ? selectedByWorkspace[activeWorkspace] : null;
  const activeId =
    chosen && properties.some((p) => String(p._id) === String(chosen))
      ? chosen
      : properties[0]?._id;
  const active = properties.find((p) => String(p._id) === String(activeId));

  const pick = (id) => {
    select(activeWorkspace, id);
    setOpen(false);
  };

  const addAnother = () => {
    setOpen(false);
    onNavigate?.();
    // PropertyPage owns property creation; `?new=1` opens it straight into the
    // create form (and surfaces the plan-limit 403 there).
    navigate("/dashboard/property?new=1");
  };

  if (collapsed) {
    return (
      <div className="px-3 pt-3" ref={wrapRef}>
        <button
          type="button"
          onClick={() => navigate("/dashboard/property")}
          title={active?.name || "Properties"}
          className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.1] transition flex items-center justify-center"
        >
          <Hotel className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 pt-3 relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full flex items-center gap-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] px-3 py-2.5 hover:bg-white/[0.1] transition text-left"
      >
        <span className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
          <Hotel className="w-3.5 h-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
            Property
          </span>
          <span className="block text-[13px] font-bold text-white truncate">
            {active?.name || "Choose a property"}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-gray-500 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-3 right-3 top-full mt-1.5 z-30 rounded-xl bg-[#1F2937] border border-white/[0.1] shadow-2xl overflow-hidden py-1"
        >
          <div className="max-h-64 overflow-y-auto sidebar-scroll">
            {properties.map((p) => {
              const isActive = String(p._id) === String(activeId);
              return (
                <button
                  key={p._id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => pick(p._id)}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition",
                    isActive
                      ? "bg-brand-500/15 text-white"
                      : "text-gray-300 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold truncate">
                      {p.name}
                    </span>
                    {(p.city || p.country) && (
                      <span className="block text-[11px] text-gray-500 truncate">
                        {[p.city, p.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <Check
                      className="w-4 h-4 text-brand-400 shrink-0"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/[0.08] mt-1 pt-1">
            <button
              type="button"
              onClick={addAnother}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-gray-300 hover:bg-white/[0.06] hover:text-white transition"
            >
              <Plus className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="text-[13px] font-semibold">
                Add another property
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
