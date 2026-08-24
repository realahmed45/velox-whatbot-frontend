/**
 * WizardShell — the chrome every setup step sits in: a numbered progress rail
 * (the thing every channel manager has), a title block, the step body, and a
 * sticky footer with Back / Skip / Continue.
 */
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { STEPS, TOTAL_STEPS } from "./wizardState";

export function ProgressRail({ step }) {
  return (
    <div className="w-full">
      {/* Mobile: a compact bar + label. Desktop: the full numbered rail. */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-ink-700">
            {STEPS[step]?.label}
          </p>
          <p className="text-xs font-semibold text-ink-400">
            Step {step + 1} of {TOTAL_STEPS}
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden sm:flex items-center gap-1">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                    done && "bg-emerald-500 text-white",
                    active && "bg-brand-500 text-white shadow-glow",
                    !done && !active && "bg-ink-100 text-ink-400",
                  )}
                >
                  {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={clsx(
                    "text-xs font-bold whitespace-nowrap",
                    active ? "text-ink-900" : done ? "text-ink-600" : "text-ink-400",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={clsx(
                    "flex-1 h-px mx-3 transition-colors",
                    done ? "bg-emerald-300" : "bg-ink-200",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function WizardShell({
  step,
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  children,
  onBack,
  onSkip,
  skipLabel = "Skip for now",
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  busy = false,
  hideFooter = false,
  wide = false,
}) {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className={clsx("mx-auto", wide ? "max-w-4xl" : "max-w-2xl")}>
        <ProgressRail step={step} />

        <div className="mt-8 sm:mt-10 text-center">
          {Icon && (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg mx-auto mb-4">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          {eyebrow && (
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-600 mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-500 mt-2 max-w-lg mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-6 sm:mt-8">{children}</div>

        {!hideFooter && (
          <div className="mt-7 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 sm:flex-1">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800 transition disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={busy}
                  className="text-xs font-medium text-ink-400 hover:text-ink-600 underline underline-offset-2 transition disabled:opacity-50"
                >
                  {skipLabel}
                </button>
              )}
            </div>
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled || busy}
                className="btn-primary w-full sm:w-auto sm:min-w-[11rem]"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {nextLabel}
                {!busy && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
