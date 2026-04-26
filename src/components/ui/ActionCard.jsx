import { Link } from "react-router-dom";
import { clsx } from "clsx";

/**
 * Big clickable action card used in the dashboard "Quick Actions" grid
 * and on the onboarding completion screen.
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
  const accentMap = {
    brand: "group-hover:border-brand-400",
    accent: "group-hover:border-accent-400",
    emerald: "group-hover:border-emerald-400",
    amber: "group-hover:border-amber-400",
  };

  const iconBgMap = {
    brand: "bg-brand-100 text-brand-600",
    accent: "bg-accent-100 text-accent-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
  };

  const Wrapper = to ? Link : "button";
  const props = to ? { to } : { type: "button", onClick };

  return (
    <Wrapper
      {...props}
      className={clsx(
        "group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg",
        accentMap[accent],
        className,
      )}
    >
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          iconBgMap[accent],
        )}
      >
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <h3 className="font-semibold text-ink-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 leading-snug">{description}</p>
      )}
    </Wrapper>
  );
}
