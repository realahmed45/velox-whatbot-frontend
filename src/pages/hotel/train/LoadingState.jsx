/** Shimmer skeleton for the Train your AI page while /training loads. */
import { panel } from "./ui";

const bar = "rounded bg-neutral-100 animate-pulse";

export default function LoadingState() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className={`${panel} flex h-[76px] items-center gap-4 px-5`}>
        <div className="flex-1 space-y-2.5">
          <div className={`${bar} h-4 w-72 max-w-full`} />
          <div className={`${bar} h-1.5 w-96 max-w-full rounded-full`} />
        </div>
      </div>
      <div className={`${bar} h-12 w-72 max-w-full rounded-2xl`} />
      <div className={`${panel} mx-auto max-w-2xl space-y-4 p-8`}>
        <div className={`${bar} h-3.5 w-40`} />
        <div className={`${bar} h-1.5 w-full rounded-full`} />
        <div className={`${bar} mt-6 h-6 w-3/4`} />
        <div className={`${bar} h-32 w-full rounded-xl`} />
      </div>
    </div>
  );
}
