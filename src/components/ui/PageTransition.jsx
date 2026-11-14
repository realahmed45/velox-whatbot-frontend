import { motion, useReducedMotion } from "framer-motion";

/**
 * Wraps page content with a soft blur-up reveal on mount.
 * Use sparingly — only on top-level route pages for best effect.
 */
export default function PageTransition({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
