/**
 * 404 Not Found page (used as catch-all).
 * Shown for both authenticated and unauthenticated users.
 */
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Aurora, Magnetic } from "@/components/fx";

export default function NotFoundPage() {
  const reduce = useReducedMotion();
  const digits = ["4", "0", "4"];

  return (
    <div className="grain relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night-950 px-4 py-16 text-white sm:px-6">
      <Aurora variant="dark" />
      <div aria-hidden className="bg-dot-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />

      <div className="relative w-full max-w-xl text-center">
        {/* Giant 404 — each digit drops in with a spring, then floats. */}
        <div
          aria-hidden
          className="relative mb-2 flex select-none items-center justify-center font-display font-semibold leading-[0.85] tracking-[-0.07em]"
        >
          <div className="absolute inset-x-6 top-1/2 -z-10 h-1/2 -translate-y-1/2 rounded-full bg-sunset opacity-30 blur-3xl" />
          {digits.map((d, i) => (
            <motion.span
              key={i}
              className="text-sunset inline-block text-[34vw] sm:text-[11rem] md:text-[13rem]"
              initial={reduce ? false : { opacity: 0, y: 60, rotate: i === 1 ? 0 : i === 0 ? -12 : 12, filter: "blur(12px)" }}
              animate={
                reduce
                  ? undefined
                  : {
                      opacity: 1,
                      y: [0, -10, 0],
                      rotate: 0,
                      filter: "blur(0px)",
                    }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      opacity: { duration: 0.6, delay: i * 0.1 },
                      filter: { duration: 0.6, delay: i * 0.1 },
                      rotate: { type: "spring", stiffness: 260, damping: 14, delay: i * 0.1 },
                      y: { duration: 4 + i * 0.6, delay: 0.8 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
                    }
              }
            >
              {d}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Page <span className="font-serif font-normal italic">not found</span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] text-white/60">
            The page you're looking for doesn't exist or may have moved.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => window.history.back()}
              className="btn-glass-dark group w-full min-h-[44px] sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-x-1" strokeWidth={1.8} />
              Go back
            </button>
            <Magnetic strength={0.3} className="w-full sm:w-auto">
              <Link to="/" className="btn-primary group w-full min-h-[44px] px-6 sm:w-auto">
                <Home
                  className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-10deg]"
                  strokeWidth={1.8}
                />
                Home
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
