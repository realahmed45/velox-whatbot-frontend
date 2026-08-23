import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
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
  if (!open) return null;

  const go = (to) => {
    onClose();
    navigate(to);
  };

  const groups = ENTRIES.reduce((acc, e) => {
    acc[e.group] = acc[e.group] || [];
    acc[e.group].push(e);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-md bg-white shadow-2xl border border-ink-100 overflow-hidden"
      >
        <Command label="Command palette" className="w-full">
          <div className="flex items-center border-b border-ink-100 px-3">
            <Command.Input
              autoFocus
              placeholder="Type to search or jump to a page…"
              className="flex-1 py-3 bg-transparent outline-none text-sm"
            />
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-ink-400">
              No results.
            </Command.Empty>
            {Object.entries(groups).map(([group, items]) => (
              <Command.Group
                key={group}
                heading={group}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-400"
              >
                {items.map(({ label, icon: Icon, to }) => (
                  <Command.Item
                    key={to}
                    value={label}
                    onSelect={() => go(to)}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer text-ink-700 aria-selected:bg-brand-50 aria-selected:text-brand-700"
                  >
                    <Icon className="w-4 h-4 text-ink-400" />
                    {label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
          <div className="border-t border-ink-100 px-3 py-2 flex items-center justify-between text-[10px] text-ink-400">
            <span>
              Tip: Press{" "}
              <kbd className="px-1 py-0.5 bg-ink-100 rounded">↑↓</kbd> to
              navigate,{" "}
              <kbd className="px-1 py-0.5 bg-ink-100 rounded">Enter</kbd> to
              select
            </span>
            <kbd className="px-1 py-0.5 bg-ink-100 rounded">Esc</kbd>
          </div>
        </Command>
      </div>
    </div>
  );
}
