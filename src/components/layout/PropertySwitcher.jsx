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
import { AnimatePresence, motion } from "framer-motion";
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
          className="group flex h-10 w-full items-center justify-center rounded-xl bg-white/[0.06] text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.08] transition hover:bg-white/[0.1] hover:text-white active:scale-95"
        >
          <Hotel className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative px-3 pt-3" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={clsx(
          "group flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 transition active:scale-[0.98]",
          open ? "bg-white/[0.1] ring-white/[0.14]" : "bg-white/[0.05] ring-white/[0.08] hover:bg-white/[0.09]",
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_rgba(255,61,119,0.7)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
          <Hotel className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Property</span>
          <span className="block truncate text-[13px] font-semibold text-white">
            {active?.name || "Choose a property"}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 shrink-0 text-white/40 transition-transform duration-500 ease-spring",
            open && "rotate-180 text-white/80",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: "top center" }}
            className="glass-darker absolute left-3 right-3 top-full z-30 mt-2 overflow-hidden rounded-2xl py-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="sidebar-scroll max-h-64 overflow-y-auto px-1.5">
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
                      "group/opt relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition",
                      isActive ? "bg-white/[0.08] text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    {isActive && (
                      <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-sunset" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{p.name}</span>
                      {(p.city || p.country) && (
                        <span className="block truncate text-[11px] text-white/40">
                          {[p.city, p.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                    {isActive && <Check className="h-4 w-4 shrink-0 text-sunset-gold" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>

            <div className="mx-1.5 mt-1.5 border-t border-white/[0.08] pt-1.5">
              <button
                type="button"
                onClick={addAnother}
                className="group/add flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-white/65 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Plus className="h-4 w-4 shrink-0 text-sunset-gold transition-transform duration-500 ease-spring group-hover/add:rotate-90" />
                <span className="text-[13px] font-semibold">Add another property</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
