/** Sticky "unsaved changes" bar shared by the contacts and rules sections. */
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { PulseDot } from "@/components/fx";
import { spring } from "./shared";

export default function SaveBar({ dirty, saving, error, onSave, onDiscard, label }) {
  return (
    <AnimatePresence>
      {(dirty || error) && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={spring}
          className="sticky bottom-16 lg:bottom-0 z-20 mt-5 pb-4"
        >
          <div className="card-dark relative overflow-hidden !bg-night-950/90 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_60px_-20px_rgba(255,61,119,0.45)]">
            <div aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-sunset opacity-25 blur-3xl" />
            <p className={`relative flex items-start gap-2 text-sm flex-1 ${error ? "text-rose-200" : "text-white/70"}`}>
              <PulseDot color={error ? "bg-rose-400" : "bg-amber-400"} className="mt-1.5 shrink-0" />
              <span>{error || "You have unsaved changes. Your AI keeps using the old version until you save."}</span>
            </p>
            <div className="relative flex items-center gap-2 justify-end">
              {dirty && (
                <button
                  onClick={onDiscard}
                  disabled={saving}
                  className="btn-glass-dark min-h-[40px] px-3 py-2 text-sm"
                >
                  Discard
                </button>
              )}
              <button onClick={onSave} disabled={saving || !dirty} className="btn-primary group min-h-[40px]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:scale-125" />}
                {label}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
