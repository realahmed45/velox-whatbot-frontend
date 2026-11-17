import { clsx } from "clsx";

/**
 * Shimmer skeleton placeholder. Use instead of spinners for
 * content-shaped loading states. A soft neutral block with a light sweep.
 */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx(
        "relative isolate overflow-hidden rounded-md bg-black/[0.055]",
        "after:absolute after:inset-0 after:bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.7)_50%,rgba(255,90,31,0.06)_55%,transparent_70%)] after:bg-[length:200%_100%] after:animate-shimmer after:content-['']",
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
        <Skeleton key={i} className={clsx("h-3 rounded-md", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx("surface space-y-4 p-5", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3 rounded-md" />
          <Skeleton className="h-2 w-1/2 rounded-md" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
