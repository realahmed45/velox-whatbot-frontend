/**
 * Dashboard navigation model — shared by the desktop top bar, the mobile
 * bottom dock and its "More" sheet. Same permission rules as the old
 * sidebar: `usePermissions().canItem` + optional workspace feature flags, and
 * the Consultant tab only for users with a consultant profile.
 */
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings as SettingsIcon,
  Globe,
  BedDouble,
  CalendarDays,
  HandCoins,
  MessageSquare,
  GraduationCap,
  FlaskConical,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { usePermissions } from "@/hooks/usePermissions";
import api from "@/services/api";

// `priority`: lower = stays in the bar longer when space is tight.
export const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Today", end: true, priority: 0, key: "today" },
  { to: "/dashboard/bookings", icon: BedDouble, label: "Bookings", priority: 2, key: "bookings" },
  { to: "/dashboard/inbox", icon: MessageSquare, label: "Messages", perm: "inbox", priority: 1, key: "messages" },
  { to: "/dashboard/calendar", icon: CalendarDays, label: "Calendar", priority: 3, key: "calendar" },
  { to: "/dashboard/guests", icon: Users, label: "Guests", priority: 5, key: "guests" },
  { to: "/dashboard/train", icon: GraduationCap, label: "Train AI", priority: 6, key: "train" },
  { to: "/dashboard/test-ai", icon: FlaskConical, label: "Test AI", priority: 7, key: "test" },
  { to: "/dashboard/website", icon: Globe, label: "Website", priority: 8, key: "website" },
  { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings", perm: "settings", priority: 4, key: "settings" },
];

export const CONSULTANT_ITEM = {
  to: "/dashboard/consultant",
  icon: HandCoins,
  label: "Consultant",
  priority: 9,
  key: "consultant",
};

/** Visible nav items for the current user. Call once (DashboardLayout). */
export function useNavItems() {
  const user = useAuthStore((s) => s.user);
  const workspace = useWorkspaceStore((s) => s.workspace);
  const { canItem, ready } = usePermissions();
  const features = workspace?.features || {};

  const [isConsultant, setIsConsultant] = useState(false);
  useEffect(() => {
    let alive = true;
    api
      .get("/consultants/me")
      .then(() => alive && setIsConsultant(true))
      .catch(() => alive && setIsConsultant(false));
    return () => {
      alive = false;
    };
  }, [user?._id, user?.id]);

  return useMemo(() => {
    const hasFeature = (item) => !item.feature || features[item.feature] === true;
    // Until the workspace (owner/members) has loaded we can't know the role.
    // Show permissioned tabs optimistically rather than flashing them away —
    // the route guard still blocks anyone who truly lacks access.
    const allowed = (item) => (!ready ? true : canItem(item));
    const items = NAV_ITEMS.filter((i) => allowed(i) && hasFeature(i));
    return isConsultant ? [...items, CONSULTANT_ITEM] : items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canItem, ready, workspace, isConsultant]);
}

/**
 * Active-route test (ported from the old sidebar NavItem): exact match for
 * `end` items, prefix match otherwise, and `?tab=` deep links only light up
 * Settings.
 */
export function isItemActive(item, location) {
  const { to, end } = item;
  const [pathAndSearch, hash] = to.split("#");
  const [pathname] = pathAndSearch.split("?");
  const search = pathAndSearch.includes("?") ? pathAndSearch.split("?")[1] : null;
  if (end) return location.pathname === pathname && !location.search && !location.hash;
  if (hash) return location.pathname === pathname && location.hash === `#${hash}`;
  return (
    (location.pathname === pathname || location.pathname.startsWith(pathname + "/")) &&
    (search
      ? location.search.includes(search)
      : !/[?&]tab=/.test(location.search) || pathname.endsWith("settings"))
  );
}

export function planLabel(id) {
  const map = {
    free: "Trial",
    trial: "Trial",
    hotel_free: "Launch (Free)",
    hotel_pro: "Botlify for Hotels",
    ig_starter: "Basic Plan",
    ig_pro: "Pro Plan",
    starter: "Basic Plan",
    growth: "Basic Plan",
    scale: "Pro Plan",
  };
  return map[id] || id;
}

/** Plan + monthly message usage, as the old sidebar computed it. */
export function usePlanUsage() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  return useMemo(() => {
    const isLifetime = workspace?.subscription?.lifetime === true;
    const plan = isLifetime ? "ig_pro" : workspace?.subscription?.plan || "free";
    const used = workspace?.usage?.messagesThisMonth || 0;
    const rawLimit = workspace?.usage?.messagesLimit;
    const unlimited = isLifetime || rawLimit === -1 || rawLimit == null;
    const limit = unlimited ? Infinity : rawLimit;
    const pct = unlimited || !(limit > 0) ? 0 : Math.min(100, Math.round((used / limit) * 100));
    const isPremium = isLifetime || ["ig_pro", "scale", "hotel_pro"].includes(plan);
    return { isLifetime, plan, used, limit, pct, unlimited, isPremium };
  }, [workspace]);
}
