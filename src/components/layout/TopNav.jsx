/**
 * TopNav — the horizontal tab bar in the dashboard header.
 *
 * - A black pill slides between tabs on a spring (framer layoutId), so
 *   switching pages feels like one continuous object moving, not a repaint.
 * - Never scrolls: every tab is measured once in a hidden row; when the bar
 *   is too narrow the least-used tabs fold into a "More" menu. The active tab
 *   is always kept in the bar.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";
import { isItemActive } from "./navConfig";

const SPRING = { type: "spring", stiffness: 520, damping: 40, mass: 0.8 };
const GAP = 2; // px, matches gap-0.5

export default function TopNav({ items, badges = {} }) {
  const location = useLocation();
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const [visibleKeys, setVisibleKeys] = useState(() => items.map((i) => i.key));

  const activeKey = useMemo(() => items.find((i) => isItemActive(i, location))?.key, [items, location]);

  const recompute = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const available = container.clientWidth;
    const nodes = Array.from(measure.querySelectorAll("[data-measure-key]"));
    const widths = {};
    nodes.forEach((n) => (widths[n.dataset.measureKey] = n.offsetWidth));
    const moreW = measure.querySelector("[data-measure-more]")?.offsetWidth || 88;

    const total = (keys) => keys.reduce((s, k) => s + (widths[k] || 0), 0) + Math.max(0, keys.length - 1) * GAP;

    let keep = items.map((i) => i.key);
    if (total(keep) <= available) {
      setVisibleKeys((prev) => (sameKeys(prev, keep) ? prev : keep));
      return;
    }
    // Drop least important first; never the active tab.
    const dropOrder = [...items].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)).map((i) => i.key);
    for (const k of dropOrder) {
      if (total(keep) + GAP + moreW <= available) break;
      if (k === activeKey) continue;
      keep = keep.filter((x) => x !== k);
    }
    setVisibleKeys((prev) => (sameKeys(prev, keep) ? prev : keep));
  }, [items, activeKey]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute, badges]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(el);
    // Web fonts change label widths once they land.
    document.fonts?.ready?.then(() => recompute()).catch(() => {});
    return () => ro.disconnect();
  }, [recompute]);

  const visible = items.filter((i) => visibleKeys.includes(i.key));
  const overflow = items.filter((i) => !visibleKeys.includes(i.key));

  return (
    <div ref={containerRef} className="relative flex min-w-0 flex-1 items-center">
      <nav aria-label="Primary" className="flex min-w-0 items-center gap-0.5">
        {visible.map((item) => (
          <Tab key={item.key} item={item} active={item.key === activeKey} badge={badges[item.key] || 0} />
        ))}
        {overflow.length > 0 && <MoreMenu items={overflow} activeKey={activeKey} badges={badges} />}
      </nav>

      {/* Hidden measuring row — same markup, never visible or focusable. */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex h-0 items-center gap-0.5 overflow-hidden whitespace-nowrap"
      >
        {items.map((item) => (
          <span key={item.key} data-measure-key={item.key} className={tabClass(false)}>
            <item.icon className="h-[17px] w-[17px]" />
            <span>{item.label}</span>
            {badges[item.key] > 0 && <Badge n={badges[item.key]} />}
          </span>
        ))}
        <span data-measure-more className={tabClass(false)}>
          <span>More</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

function sameKeys(a, b) {
  return a.length === b.length && a.every((k, i) => k === b[i]);
}

const tabClass = (active) =>
  clsx(
    "group relative flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[13.5px] font-medium outline-none transition-colors duration-200",
    active ? "text-white" : "text-neutral-600 hover:text-neutral-950",
  );

function Badge({ n, active }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-bold leading-none tabular-nums",
        active ? "bg-[#FF5A1F] text-white" : "bg-[#FF5A1F] text-white",
      )}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

function Tab({ item, active, badge }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} end={item.end} className={clsx(tabClass(active), "active:scale-[0.96]")} aria-current={active ? "page" : undefined}>
      {active ? (
        <motion.span
          layoutId="topnav-active-pill"
          className="absolute inset-0 rounded-full bg-[#0A0A0A] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_6px_16px_-8px_rgba(10,10,10,0.55)]"
          transition={SPRING}
        >
          <span className="absolute inset-x-3 -bottom-[7px] mx-auto h-[3px] w-5 rounded-full bg-[#FF5A1F]" />
        </motion.span>
      ) : (
        <span className="absolute inset-0 rounded-full bg-black/[0.05] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}
      <Icon
        className={clsx(
          "relative h-[17px] w-[17px] transition-transform duration-300 ease-spring",
          active ? "text-[#FF5A1F]" : "group-hover:-translate-y-px",
        )}
        strokeWidth={active ? 2.2 : 1.9}
      />
      <span className="relative">{item.label}</span>
      {badge > 0 && (
        <span className="relative">
          <Badge n={badge} active={active} />
        </span>
      )}
    </NavLink>
  );
}

function MoreMenu({ items, activeKey, badges }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeInside = items.some((i) => i.key === activeKey);
  const badgeSum = items.reduce((s, i) => s + (badges[i.key] || 0), 0);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={clsx(tabClass(activeInside), "active:scale-[0.96]", open && !activeInside && "text-neutral-950")}
      >
        {activeInside ? (
          <motion.span layoutId="topnav-active-pill" className="absolute inset-0 rounded-full bg-[#0A0A0A]" transition={SPRING} />
        ) : (
          <span
            className={clsx(
              "absolute inset-0 rounded-full bg-black/[0.05] transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          />
        )}
        <span className="relative">More</span>
        {badgeSum > 0 && <span className="relative h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />}
        <ChevronDown className={clsx("relative h-3.5 w-3.5 transition-transform duration-300 ease-spring", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 520, damping: 36 }}
            style={{ transformOrigin: "top left" }}
            className="popover absolute left-0 top-[calc(100%+10px)] z-50 w-56 p-1.5"
          >
            {items.map((item) => {
              const active = item.key === activeKey;
              return (
                <button
                  key={item.key}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(item.to);
                  }}
                  className={clsx(
                    "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors",
                    active ? "bg-[#FFF1EA] text-neutral-950" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                  )}
                >
                  <span
                    className={clsx(
                      "grid h-8 w-8 place-items-center rounded-lg transition-transform duration-300 ease-spring group-hover:-translate-y-px",
                      active ? "bg-[#FF5A1F] text-white" : "bg-neutral-100 text-neutral-600",
                    )}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {badges[item.key] > 0 && <Badge n={badges[item.key]} />}
                  {active && <Check className="h-4 w-4 text-[#FF5A1F]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
