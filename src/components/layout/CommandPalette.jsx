import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Settings as SettingsIcon,
  CreditCard,
  Hotel,
  Share2,
  Sparkles,
  TrendingUp,
  Plus,
  X,
  Search,
  CornerDownLeft,
} from "lucide-react";

/**
 * Global command palette (⌘K / Ctrl+K).
 */
// The five screens, plus deep links into the Settings tabs that used to be
// destinations of their own.
const ENTRIES = [
  { label: "Today", icon: LayoutDashboard, to: "/dashboard", group: "Go to" },
  {
    label: "Bookings",
    icon: BedDouble,
    to: "/dashboard/bookings",
    group: "Go to",
  },
  {
    label: "Calendar",
    icon: CalendarDays,
    to: "/dashboard/calendar",
    group: "Go to",
  },
  { label: "Guests", icon: Users, to: "/dashboard/guests", group: "Go to" },
  {
    label: "Settings",
    icon: SettingsIcon,
    to: "/dashboard/settings",
    group: "Go to",
  },

  {
    label: "Property & Rooms",
    icon: Hotel,
    to: "/dashboard/settings?tab=property",
    group: "Settings",
  },
  {
    label: "Channels",
    icon: Share2,
    to: "/dashboard/settings?tab=channels",
    group: "Settings",
  },
  {
    label: "AI Assistant",
    icon: Sparkles,
    to: "/dashboard/settings?tab=assistant",
    group: "Settings",
  },
  {
    label: "Extras",
    icon: Plus,
    to: "/dashboard/settings?tab=extras",
    group: "Settings",
  },
  {
    label: "Pricing",
    icon: TrendingUp,
    to: "/dashboard/settings?tab=pricing",
    group: "Settings",
  },
  {
    label: "Plan & Billing",
    icon: CreditCard,
    to: "/dashboard/settings?tab=billing",
    group: "Settings",
  },
  {
    label: "Team",
    icon: Users,
    to: "/dashboard/settings?tab=team",
    group: "Settings",
  },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();

  const go = (to) => {
    onClose();
    navigate(to);
  };

  const groups = ENTRIES.reduce((acc, e) => {
    acc[e.group] = acc[e.group] || [];
    acc[e.group].push(e);
    return acc;
  }, {});

  const kbd =
    "rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink-500 shadow-[inset_0_-1px_0_rgba(15,23,42,0.08)] ring-1 ring-ink-900/[0.08]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk"
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-night-950/40 backdrop-blur-md" />
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="glass-strong relative w-full max-w-xl overflow-hidden rounded-3xl"
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-sunset opacity-70" />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-20 h-40 w-40 rounded-full bg-sunset opacity-[0.12] blur-3xl"
            />
            <Command label="Command palette" className="relative w-full">
              <div className="flex items-center gap-2 border-b border-ink-900/[0.06] px-4">
                <Search className="h-4 w-4 shrink-0 text-sunset-flame" strokeWidth={2} />
                <Command.Input
                  autoFocus
                  placeholder="Type to search or jump to a page…"
                  className="flex-1 bg-transparent py-4 text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
                />
                <button
                  onClick={onClose}
                  className="group grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-700 active:scale-90"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
                </button>
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-ink-400">No results.</Command.Empty>
                {Object.entries(groups).map(([group, items]) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-ink-400"
                  >
                    {items.map(({ label, icon: Icon, to }) => (
                      <Command.Item
                        key={to}
                        value={label}
                        onSelect={() => go(to)}
                        className="group/item relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors aria-selected:bg-white aria-selected:text-ink-900 aria-selected:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_6px_16px_-8px_rgba(255,61,119,0.35),inset_0_1px_0_#fff]"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-900/[0.04] text-ink-500 transition-all duration-500 ease-spring group-aria-selected/item:-translate-y-0.5 group-aria-selected/item:rotate-[-8deg] group-aria-selected/item:bg-sunset-soft group-aria-selected/item:text-sunset-flame">
                          <Icon className="h-4 w-4" strokeWidth={1.8} />
                        </span>
                        <span className="flex-1">{label}</span>
                        <CornerDownLeft className="h-3.5 w-3.5 text-ink-300 opacity-0 transition-opacity group-aria-selected/item:opacity-100" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="flex items-center justify-between border-t border-ink-900/[0.06] bg-white/40 px-4 py-2.5 text-[11px] text-ink-400">
                <span>
                  Tip: Press <kbd className={kbd}>↑↓</kbd> to navigate, <kbd className={kbd}>Enter</kbd> to select
                </span>
                <kbd className={kbd}>Esc</kbd>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
