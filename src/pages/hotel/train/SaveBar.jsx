/** Sticky "unsaved changes" bar shared by the contacts and rules sections. */
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { btnPrimary } from "./ui";

export default function SaveBar({ dirty, saving, error, onSave, onDiscard, label }) {
  return (
    <AnimatePresence>
      {(dirty || error) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="sticky bottom-16 z-20 mt-5 pb-4 lg:bottom-0"
        >
          <div className="flex flex-col gap-3 rounded-2xl bg-[#0A0A0A] px-4 py-3 shadow-[0_18px_40px_-16px_rgba(10,10,10,0.55)] sm:flex-row sm:items-center">
            <p className={`flex flex-1 items-start gap-2 text-[14px] ${error ? "text-rose-300" : "text-white/75"}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${error ? "bg-rose-400" : "bg-[#FF5A1F]"}`} />
              <span>{error || "Unsaved changes. Your AI keeps using the old version until you save."}</span>
            </p>
            <div className="flex items-center justify-end gap-2">
              {dirty && (
                <button
                  onClick={onDiscard}
                  disabled={saving}
                  className="min-h-[40px] rounded-xl px-3 text-[14px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Discard
                </button>
              )}
              <button onClick={onSave} disabled={saving || !dirty} className={`${btnPrimary} min-h-[40px] shadow-none hover:shadow-none`}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {label}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
