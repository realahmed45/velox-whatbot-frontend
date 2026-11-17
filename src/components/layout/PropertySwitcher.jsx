/**
 * PropertySwitcher — which hotel the dashboard is showing.
 *
 * Deliberately INVISIBLE for the common case. A workspace with one property
 * renders nothing at all: single-property hoteliers are the majority and must
 * never pay a complexity tax for a feature built for groups. It only appears
 * once a second property exists.
 *
 * variant="chip"  → compact pill in the top bar (default)
 * variant="block" → full-width card (mobile "More" sheet)
 * `collapsed` (legacy) renders an icon-only button that opens Property & Rooms.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Hotel, Plus } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { usePropertyStore } from "@/store/propertyStore";

export default function PropertySwitcher({ collapsed, onNavigate, variant = "chip", className }) {
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

  // Close on outside click / Escape.
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
    chosen && properties.some((p) => String(p._id) === String(chosen)) ? chosen : properties[0]?._id;
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
      <div className={className} ref={wrapRef}>
        <button
          type="button"
          onClick={() => navigate("/dashboard/property")}
          title={active?.name || "Properties"}
          className="grid h-9 w-9 place-items-center rounded-full text-neutral-600 ring-1 ring-black/[0.08] transition hover:bg-neutral-50 hover:text-neutral-950 active:scale-95"
        >
          <Hotel className="h-4 w-4" strokeWidth={1.9} />
        </button>
      </div>
    );
  }

  const block = variant === "block";

  return (
    <div className={clsx("relative", className)} ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={active?.name}
        className={clsx(
          "group flex items-center text-left ring-1 transition active:scale-[0.98]",
          block ? "w-full gap-3 rounded-2xl bg-white px-3 py-2.5" : "h-9 max-w-[190px] gap-2 rounded-full pl-1 pr-2.5",
          open ? "bg-neutral-100 ring-black/[0.12]" : "bg-white ring-black/[0.08] hover:bg-neutral-50 hover:ring-black/[0.14]",
        )}
      >
        <span
          className={clsx(
            "grid shrink-0 place-items-center bg-[#FFF1EA] text-[#FF5A1F] transition-transform duration-300 ease-spring group-hover:-rotate-6",
            block ? "h-9 w-9 rounded-xl" : "h-7 w-7 rounded-full",
          )}
        >
          <Hotel className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <span className={clsx("min-w-0 flex-1", !block && "hidden xl:block")}>
          {block && (
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Property</span>
          )}
          <span className={clsx("block truncate font-semibold text-neutral-900", block ? "text-[14px]" : "text-[13px]")}>
            {active?.name || "Choose a property"}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            "h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-300 ease-spring",
            open && "rotate-180 text-neutral-700",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 520, damping: 36 }}
            style={{ transformOrigin: block ? "top center" : "top right" }}
            className={clsx(
              "popover absolute top-full z-50 mt-2.5 overflow-hidden py-1.5",
              block ? "left-0 right-0" : "right-0 w-72",
            )}
          >
            <p className="px-3 pb-1 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Properties</p>
            <div className="max-h-64 overflow-y-auto px-1.5">
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
                      "relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors",
                      isActive ? "bg-[#FFF1EA] text-neutral-950" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{p.name}</span>
                      {(p.city || p.country) && (
                        <span className="block truncate text-[11.5px] text-neutral-500">
                          {[p.city, p.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                    {isActive && <Check className="h-4 w-4 shrink-0 text-[#FF5A1F]" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>

            <div className="mx-1.5 mt-1.5 border-t border-black/[0.06] pt-1.5">
              <button
                type="button"
                onClick={addAnother}
                className="group/add flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <Plus className="h-4 w-4 shrink-0 text-[#FF5A1F] transition-transform duration-300 ease-spring group-hover/add:rotate-90" />
                <span className="text-[13px] font-semibold">Add another property</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
