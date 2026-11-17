import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { initSocket } from "@/services/socket";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CommandPalette from "@/components/layout/CommandPalette";
import HelpWidget from "@/components/layout/HelpWidget";
import OfflineBanner from "@/components/layout/OfflineBanner";
import ShortcutsHelp from "@/components/layout/ShortcutsHelp";
import { useNavItems } from "@/components/layout/navConfig";
import ErrorBoundary from "@/components/ErrorBoundary";
import TrainingReminder from "@/components/TrainingReminder";
import {
  useNotificationsLive,
  useNotificationStore,
  selectUnreadMessages,
} from "@/components/notifications";

const ROUTE_TITLES = {
  "/dashboard": "Today",
  "/dashboard/bookings": "Bookings",
  "/dashboard/calendar": "Calendar",
  "/dashboard/guests": "Guests",
  "/dashboard/train": "Train your AI",
  "/dashboard/test-ai": "Test your AI",
  "/dashboard/website": "Your website",
  "/dashboard/consultant": "Consultant",
  "/dashboard/inbox": "Messages",
  "/dashboard/contacts": "Contacts",
  "/dashboard/automation": "Automations",
  "/dashboard/flow-builder": "Flow editor",
  "/dashboard/broadcasts": "Broadcasts",
  "/dashboard/analytics": "Analytics",
  "/dashboard/ai-bot": "AI Bot",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Billing",
  "/dashboard/pricing": "Pricing",
  "/dashboard/guide": "Guide",
  "/dashboard/drip": "Drip Campaigns",
  "/dashboard/integrations": "Integrations",
  "/dashboard/apps": "Apps",
  "/dashboard/team": "Team",
  "/dashboard/onboarding": "Get Started",
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const navItems = useNavItems();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const unreadMessages = useNotificationStore(selectUnreadMessages);
  const badges = useMemo(() => ({ messages: unreadMessages }), [unreadMessages]);

  useEffect(() => {
    if (!activeWorkspace) return;
    fetchWorkspace(activeWorkspace);
    initSocket();
  }, [activeWorkspace]);

  // Notifications: first page, live socket events, toasts, resync.
  useNotificationsLive(activeWorkspace);

  // Document title per route, prefixed with the unread count: "(3) Today · Botlify"
  useEffect(() => {
    const title =
      ROUTE_TITLES[location.pathname] ||
      (location.pathname.startsWith("/dashboard/flow-builder") ? "Flow editor" : "Dashboard");
    const prefix = unreadCount > 0 ? `(${unreadCount > 99 ? "99+" : unreadCount}) ` : "";
    document.title = `${prefix}${title} · Botlify`;
  }, [location.pathname, unreadCount]);

  // Keyboard: ⌘K palette, ? help, g+letter navigation
  useEffect(() => {
    let pendingG = false;
    let gTimer = null;
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const inField = tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (inField) return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }
      if (e.key === "g" && !pendingG) {
        pendingG = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => (pendingG = false), 800);
        return;
      }
      if (pendingG) {
        pendingG = false;
        const map = {
          t: "/dashboard",
          d: "/dashboard",
          b: "/dashboard/bookings",
          i: "/dashboard/inbox",
          m: "/dashboard/inbox",
          c: "/dashboard/calendar",
          g: "/dashboard/guests",
          s: "/dashboard/settings",
        };
        const dest = map[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          navigate(dest);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(gTimer);
    };
  }, [navigate]);

  return (
    <div className="relative isolate flex h-screen flex-col overflow-hidden bg-[var(--canvas)]">
      {/* Static canvas: a faint warm glow under the top bar + dot texture. Painted once. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(255,90,31,0.07),transparent_70%)]" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.28]" />
      </div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:bg-[#0A0A0A] focus:px-3 focus:py-1.5 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Header
        items={navItems}
        badges={badges}
        onSearchClick={() => setPaletteOpen(true)}
        onShortcuts={() => setHelpOpen(true)}
      />

      <main id="main-content" className="flex-1 overflow-auto pb-24 lg:pb-0" tabIndex={-1}>
        <TrainingReminder />
        <ErrorBoundary>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.07 } }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      <MobileBottomNav items={navItems} badges={badges} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <HelpWidget />
      <OfflineBanner />
    </div>
  );
}
