import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowUpRight } from "lucide-react";
import { Spotlight } from "@/components/fx";

/**
 * Big clickable action card used in the dashboard "Quick Actions" grid
 * and on the onboarding completion screen.
 *
 * Liquid glass + cursor spotlight; the icon tile hops and a corner arrow
 * slides in on hover so the whole card reads as "go".
 */
export default function ActionCard({
  icon: Icon,
  title,
  description,
  to,
  onClick,
  accent = "brand",
  className,
}) {
  const iconBgMap = {
    brand: "bg-sunset-soft text-sunset-flame",
    accent: "bg-amber-500/10 text-amber-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
  };

  const Wrapper = to ? Link : "button";
  const props = to ? { to } : { type: "button", onClick };

  return (
    <Spotlight
      as={Wrapper}
      {...props}
      className={clsx(
        "card-hover group block w-full overflow-hidden p-5 text-left active:scale-[0.98]",
        className,
      )}
    >
      <ArrowUpRight
        aria-hidden
        className="absolute right-4 top-4 h-4 w-4 text-ink-300 opacity-0 transition-all duration-500 ease-spring -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-sunset-flame group-hover:opacity-100"
      />
      <div
        className={clsx(
          "mb-3.5 grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset ring-ink-900/[0.04] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] group-hover:scale-105",
          iconBgMap[accent] || iconBgMap.brand,
        )}
      >
        {Icon && <Icon className="h-5 w-5" strokeWidth={1.8} />}
      </div>
      <h3 className="mb-1 font-display font-semibold tracking-[-0.02em] text-ink-900">{title}</h3>
      {description && <p className="text-sm leading-snug text-ink-500">{description}</p>}
    </Spotlight>
  );
}
