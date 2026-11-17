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
import { Magnetic, Spotlight } from "@/components/fx";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], label: "Open command palette" },
  { keys: ["?"], label: "All keyboard shortcuts" },
  { keys: ["g", "i"], label: "Go to Messages" },
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
    href: "mailto:contactus@botlify.site",
  },
];

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 hidden lg:block">
        <Magnetic strength={0.35}>
          <button
            onClick={() => setOpen(true)}
            className="group relative grid h-12 w-12 place-items-center rounded-full bg-[#0A0A0A] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_28px_-10px_rgba(10,10,10,0.6)] ring-1 ring-white/10 transition-[transform,background-color] duration-300 ease-spring hover:scale-110 hover:bg-[#FF5A1F] active:scale-95"
            aria-label="Help"
          >
                        <HelpCircle
              className="relative h-5 w-5 transition-transform duration-500 ease-spring group-hover:rotate-[-14deg] group-hover:scale-110"
              strokeWidth={2}
            />
          </button>
        </Magnetic>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="Help & resources">
        <div className="space-y-6">
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">Resources</p>
            <div className="space-y-2">
              {LINKS.map((l) => (
                <Spotlight
                  as="a"
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="card-hover group flex items-center gap-3 rounded-2xl p-3"
                >
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                    <l.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{l.label}</p>
                    <p className="text-xs text-ink-500">{l.hint}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-ink-300 transition-all duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF5A1F]" />
                </Spotlight>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
              <Keyboard className="h-3.5 w-3.5" /> Keyboard shortcuts
            </p>
            <div className="card divide-y divide-ink-900/[0.06] overflow-hidden">
              {SHORTCUTS.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-sm text-ink-700">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="min-w-[22px] rounded-md bg-white px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold text-ink-600 shadow-[inset_0_-1px_0_rgba(15,23,42,0.1)] ring-1 ring-ink-900/[0.08]"
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
