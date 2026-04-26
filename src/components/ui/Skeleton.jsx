import { clsx } from "clsx";

/**
 * Shimmer skeleton placeholder. Use instead of spinners for
 * content-shaped loading states.
 */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-md bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={clsx("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx("card p-5 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
