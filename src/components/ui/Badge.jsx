import { clsx } from "clsx";

/**
 * Colored pill badge.
 *  <Badge variant="success">Live</Badge>
 */
export default function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className,
  icon: Icon,
}) {
  const variants = {
    neutral: "bg-ink-100 text-ink-700",
    brand: "bg-brand-100 text-brand-700",
    accent: "bg-accent-100 text-accent-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    outline: "border border-ink-200 text-ink-700 bg-white",
  };
  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-semibold rounded-full",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
