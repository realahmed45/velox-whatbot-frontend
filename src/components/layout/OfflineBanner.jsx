import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { PulseDot } from "@/components/fx";

export default function OfflineBanner() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -16, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: -16, scale: 0.9, x: "-50%" }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="fixed left-1/2 top-3 z-[100] flex items-center gap-2 whitespace-nowrap rounded-full bg-night-900/90 py-1.5 pl-1.5 pr-3.5 text-xs font-medium text-white shadow-[0_12px_30px_-10px_rgba(225,29,72,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-rose-400/30 backdrop-blur-xl"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/20 text-rose-300">
            <WifiOff className="h-3.5 w-3.5" />
          </span>
          You're offline. Reconnecting…
          <PulseDot color="bg-rose-400" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
