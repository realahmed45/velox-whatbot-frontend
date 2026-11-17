import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";

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
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-700">
          {label}
          {required && <span className="ml-0.5 text-[#FF5A1F]">*</span>}
        </label>
      )}
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4, x: 0 }}
            animate={{ opacity: 1, y: 0, x: [0, -4, 4, -2, 0] }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="text-xs font-medium text-rose-600"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-ink-400"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
