import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  Workflow,
  Inbox,
  Users,
  Send,
  Sparkles,
  BarChart2,
  Settings as SettingsIcon,
  CreditCard,
  Plus,
  X,
} from "lucide-react";

/**
 * Global command palette (⌘K / Ctrl+K).
 */
const ENTRIES = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
    group: "Go to",
  },
  { label: "Inbox", icon: Inbox, to: "/dashboard/inbox", group: "Go to" },
  { label: "Contacts", icon: Users, to: "/dashboard/contacts", group: "Go to" },
  {
    label: "Automation",
    icon: Zap,
    to: "/dashboard/automation",
    group: "Go to",
  },
  {
    label: "Flow Builder",
    icon: Workflow,
    to: "/dashboard/flow-builder",
    group: "Go to",
  },
  {
    label: "Broadcasts",
    icon: Send,
    to: "/dashboard/broadcasts",
    group: "Go to",
  },
  { label: "AI Bot", icon: Sparkles, to: "/dashboard/ai-bot", group: "Go to" },
  {
    label: "Analytics",
    icon: BarChart2,
    to: "/dashboard/analytics",
    group: "Go to",
  },
  {
    label: "Settings",
    icon: SettingsIcon,
    to: "/dashboard/settings",
    group: "Go to",
  },
  {
    label: "Plan & Billing",
    icon: CreditCard,
    to: "/dashboard/billing",
    group: "Go to",
  },

  {
    label: "New broadcast",
    icon: Plus,
    to: "/dashboard/broadcasts?new=1",
    group: "Quick actions",
  },
  {
    label: "Create flow",
    icon: Plus,
    to: "/dashboard/flow-builder?new=1",
    group: "Quick actions",
  },
  {
    label: "Connect Instagram",
    icon: Plus,
    to: "/dashboard/onboarding/instagram",
    group: "Quick actions",
  },
  {
    label: "Connect WhatsApp",
    icon: Plus,
    to: "/dashboard/onboarding/whatsapp",
    group: "Quick actions",
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
