import { clsx } from "clsx";

/**
 * Colored pill badge — soft fill + inset hairline ring.
 *  <Badge variant="success">Live</Badge>
 * Variants: neutral | brand | accent | success | warning | danger | outline | ink
 */
export default function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className,
  icon: Icon,
}) {
  const variants = {
    neutral: "bg-neutral-100 text-neutral-600 ring-black/[0.06]",
    brand: "bg-[#FFF1EA] text-[#D9430F] ring-[#FF5A1F]/20",
    accent: "bg-amber-50 text-amber-700 ring-amber-600/20",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
    danger: "bg-rose-50 text-rose-700 ring-rose-600/15",
    outline: "bg-white text-neutral-700 ring-black/10",
    ink: "bg-[#0A0A0A] text-white ring-black",
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
        sizes[size] || sizes.sm,
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
      {children}
    </span>
  );
}
