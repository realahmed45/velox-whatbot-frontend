import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { initSocket } from "@/services/socket";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CommandPalette from "@/components/layout/CommandPalette";
import HelpWidget from "@/components/layout/HelpWidget";
import OfflineBanner from "@/components/layout/OfflineBanner";
import ShortcutsHelp from "@/components/layout/ShortcutsHelp";
import ErrorBoundary from "@/components/ErrorBoundary";
import TrainingReminder from "@/components/TrainingReminder";
import { Aurora } from "@/components/fx";

const ROUTE_TITLES = {
  "/dashboard": "Today",
  "/dashboard/bookings": "Bookings",
  "/dashboard/calendar": "Calendar",
  "/dashboard/guests": "Guests",
  "/dashboard/train": "Train your AI",
  "/dashboard/inbox": "Inbox",
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
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    fetchWorkspace(activeWorkspace);
    initSocket();
  }, [activeWorkspace]);

  // Document title per route
  useEffect(() => {
    const title =
      ROUTE_TITLES[location.pathname] ||
      (location.pathname.startsWith("/dashboard/flow-builder")
        ? "Flow editor"
        : "Dashboard");
    document.title = `${title} · Botlify`;
  }, [location.pathname]);

  // Keyboard: ⌘K palette, ? help, g+letter navigation
  useEffect(() => {
    let pendingG = false;
    let gTimer = null;
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const inField =
        tag === "input" || tag === "textarea" || e.target?.isContentEditable;
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
      if (e.key === "g") {
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
    <div className="relative isolate flex h-screen overflow-hidden bg-[var(--canvas)]">
      {/* The canvas: warm paper + a slow sunset aurora that the glass floats on. */}
      <Aurora fixed className="opacity-70" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-dot-grid opacity-[0.35]" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-600 focus:text-white focus:px-3 focus:py-1.5 focus:rounded-lg focus:text-sm"
      >
        Skip to content
      </a>

      <div className="hidden lg:block">
        <Sidebar onNavigate={() => {}} />
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-night-950/50 backdrop-blur-md z-40 animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 shadow-2xl animate-[slideInLeft_0.45s_cubic-bezier(0.16,1,0.3,1)]">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          onSearchClick={() => setPaletteOpen(true)}
        />
        <main
          id="main-content"
          className="flex-1 overflow-auto pb-16 lg:pb-0"
          tabIndex={-1}
        >
          <TrainingReminder />
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      <MobileBottomNav onMore={() => setMobileSidebarOpen(true)} />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <HelpWidget />
      <OfflineBanner />
    </div>
  );
}
