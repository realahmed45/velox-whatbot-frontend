import { Plus, GitBranch } from "lucide-react";
import { clsx } from "clsx";

export default function FlowListSidebar({
  flows,
  currentFlowId,
  onSelect,
  onNew,
}) {
  return (
    <div className="w-14 md:w-56 flex-shrink-0 bg-white/55 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/70 shadow-[1px_0_0_rgba(15,23,42,0.05)] flex flex-col">
      <div className="h-12 flex items-center justify-center md:justify-between px-2 md:px-3 border-b border-ink-900/[0.06]">
        <span className="hidden md:inline font-display font-semibold tracking-[-0.01em] text-sm text-ink-800">Flows</span>
        <button
          onClick={onNew}
          className="group w-9 h-9 grid place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-8px_rgba(255,61,119,0.7)] hover:-translate-y-0.5 active:scale-90 transition-all duration-300 ease-spring"
          title="New flow"
          aria-label="New flow"
        >
          <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-1.5 md:px-2 space-y-0.5">
        {flows.length === 0 && (
          <p className="hidden md:block text-xs text-ink-400 text-center py-6">No flows yet</p>
        )}
        {flows.map((flow) => (
          <button
            key={flow._id}
            onClick={() => onSelect(flow._id)}
            title={flow.name}
            className={clsx(
              "group w-full text-left flex items-start justify-center md:justify-start gap-2 px-2 py-2 rounded-xl transition-all duration-300 ease-spring text-sm active:scale-[0.97]",
              currentFlowId === flow._id
                ? "bg-white text-ink-900 ring-1 ring-sunset-flame/25 shadow-[inset_0_1px_0_#fff,0_6px_16px_-10px_rgba(255,106,43,0.5)]"
                : "text-ink-600 hover:bg-white/70 hover:text-ink-900",
            )}
          >
            <GitBranch
              className={clsx(
                "w-4 h-4 md:w-3.5 md:h-3.5 mt-0.5 flex-shrink-0 transition-transform duration-500 ease-spring group-hover:rotate-[-12deg]",
                currentFlowId === flow._id && "text-sunset-flame",
              )}
            />
            <div className="hidden md:block min-w-0">
              <p className="font-medium truncate text-xs">{flow.name}</p>
              <p
                className={clsx(
                  "text-xs mt-0.5 inline-flex items-center gap-1.5",
                  flow.status === "active" ? "text-emerald-600" : "text-ink-400",
                )}
              >
                <span
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    flow.status === "active" ? "bg-emerald-500" : "bg-ink-300",
                  )}
                />
                {flow.status}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
