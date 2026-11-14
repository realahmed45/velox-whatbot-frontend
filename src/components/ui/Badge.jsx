import { clsx } from "clsx";

/**
 * Colored pill badge — soft fill + inset hairline ring.
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
    neutral: "bg-ink-100/80 text-ink-600 ring-ink-500/10",
    brand: "bg-sunset-soft text-[#E2541C] ring-sunset-flame/20",
    accent: "bg-amber-50 text-amber-700 ring-amber-600/20",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
    danger: "bg-rose-50 text-rose-700 ring-rose-600/15",
    outline: "bg-white/70 text-ink-700 ring-ink-900/10 backdrop-blur",
  };
  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset",
        variants[variant] || variants.neutral,
        sizes[size],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
      {children}
    </span>
  );
}
