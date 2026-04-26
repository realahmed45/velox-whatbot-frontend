import { clsx } from "clsx";

/**
 * Reusable empty-state card shown when a list has no items yet.
 * Every list page should use this instead of ad-hoc empty markup.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) {
  return (
    <div
      className={clsx(
        "card flex flex-col items-center justify-center text-center py-14 px-6",
        className,
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-gradient/10 bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-brand-600" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-ink-800 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-ink-500 max-w-md mb-5">{description}</p>
      )}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {action}
        {secondaryAction}
      </div>
    </div>
  );
}
