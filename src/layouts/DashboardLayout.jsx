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

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/inbox": "Inbox",
  "/dashboard/contacts": "Contacts",
  "/dashboard/automation": "Automation",
  "/dashboard/flow-builder": "Flow Builder",
  "/dashboard/broadcasts": "Broadcasts",
  "/dashboard/scheduled-posts": "Scheduled Posts",
  "/dashboard/drip-campaigns": "Drip Campaigns",
  "/dashboard/giveaways": "Giveaways",
  "/dashboard/competitors": "Competitors",
  "/dashboard/integrations": "Integrations",
  "/dashboard/apps": "Apps",
  "/dashboard/referral": "Referrals",
  "/dashboard/team": "Team",
  "/dashboard/hashtags": "Hashtags",
  "/dashboard/link-in-bio": "Link in Bio",
  "/dashboard/analytics": "Analytics",
  "/dashboard/ai-bot": "AI Bot",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Billing",
  "/dashboard/pricing": "Pricing",
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
        ? "Flow Builder"
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
          i: "/dashboard/inbox",
          d: "/dashboard",
          a: "/dashboard/analytics",
          f: "/dashboard/flow-builder",
          c: "/dashboard/contacts",
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
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-600 focus:text-white focus:px-3 focus:py-1.5 focus:rounded-lg focus:text-sm"
      >
        Skip to content
      </a>

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-60 z-50 shadow-xl">
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
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
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
