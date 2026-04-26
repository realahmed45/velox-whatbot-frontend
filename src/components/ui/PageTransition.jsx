import { motion } from "framer-motion";

/**
 * Wraps page content with a subtle fade+slide animation on mount.
 * Use sparingly — only on top-level route pages for best effect.
 */
export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
