/** Shimmer skeleton for the Train your AI page while /training loads. */
export default function LoadingState() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="card h-[68px] px-5 flex items-center gap-4">
        <div className="h-11 w-11 shrink-0 rounded-full bg-ink-900/[0.06] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-64 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
          <div className="h-3 w-80 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
        </div>
      </div>
      <div className="h-11 w-80 max-w-full rounded-2xl bg-ink-900/[0.06] animate-pulse" />
      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <div className="hidden lg:block card h-96 animate-pulse" />
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-20 p-4 space-y-2.5">
              <div className="h-3.5 w-1/2 rounded bg-ink-900/[0.06] animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-ink-900/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
