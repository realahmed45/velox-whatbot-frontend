import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Keyboard,
  ExternalLink,
  Zap,
} from "lucide-react";
import Drawer from "@/components/ui/Drawer";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], label: "Open command palette" },
  { keys: ["Esc"], label: "Close dialogs" },
];

const LINKS = [
  {
    icon: BookOpen,
    label: "Documentation",
    hint: "Guides, tutorials, FAQs",
    href: "https://docs.botlify.app",
  },
  {
    icon: Zap,
    label: "What's new",
    hint: "Product changelog",
    href: "https://botlify.app/changelog",
  },
  {
    icon: MessageSquare,
    label: "Contact support",
    hint: "Email our team",
    href: "mailto:support@botlify.app",
  },
];

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex fixed bottom-5 right-5 z-40 w-11 h-11 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow hover:scale-105 transition"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Help & resources">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
              Resources
            </p>
            <div className="space-y-2">
              {LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-ink-100 hover:border-brand-200 hover:bg-brand-50/40 transition group"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <l.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">{l.label}</p>
                    <p className="text-xs text-ink-500">{l.hint}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-300 group-hover:text-brand-600 transition" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5" /> Keyboard shortcuts
            </p>
            <div className="space-y-1.5">
              {SHORTCUTS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-ink-50"
                >
                  <span className="text-sm text-ink-700">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-ink-200 rounded text-ink-700"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
