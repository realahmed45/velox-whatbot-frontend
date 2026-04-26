import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

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

  if (online) return null;
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
      <WifiOff className="w-3.5 h-3.5" />
      You're offline. Reconnecting…
    </div>
  );
}
