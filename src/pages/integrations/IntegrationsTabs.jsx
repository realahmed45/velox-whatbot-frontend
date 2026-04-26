import { NavLink } from "react-router-dom";
import { Plug, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";

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
    <div className="border-b border-ink-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 flex gap-2">
        {TABS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition",
                isActive
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-800",
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
