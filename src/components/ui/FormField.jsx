import { clsx } from "clsx";

/**
 * Labelled form field wrapper.
 *
 *  <FormField label="Email" error={err} hint="We never spam you">
 *    <input className="input" ... />
 *  </FormField>
 */
export default function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}) {
  return (
    <div className={clsx("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-ink-700"
        >
          {label}
          {required && <span className="text-accent-600 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-accent-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}
