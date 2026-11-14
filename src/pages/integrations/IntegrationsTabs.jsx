import { NavLink } from "react-router-dom";
import { Plug, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

/**
 * Shared tab bar rendered at the top of the Integrations hub pages
 * (Webhooks + Apps). Gives users a single "Integrations" destination.
 */
const TABS = [
  { to: "/dashboard/integrations", icon: Plug, label: "Webhooks", end: true },
  { to: "/dashboard/apps", icon: ShoppingBag, label: "Apps" },
];

export default function IntegrationsTabs() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto">
        <nav className="relative inline-flex items-center gap-1 rounded-2xl p-1 bg-ink-900/[0.04] ring-1 ring-ink-900/[0.06]">
          {TABS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  "group relative z-10 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-ink-900"
                    : "text-ink-500 hover:text-ink-800",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="integrations-tab-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(15,23,42,0.12),inset_0_1px_0_#fff]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={clsx(
                      "w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]",
                      isActive && "text-sunset-flame",
                    )}
                    strokeWidth={1.8}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
