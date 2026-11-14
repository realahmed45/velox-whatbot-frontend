import { Outlet } from "react-router-dom";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";
import SupportChat from "@/components/SupportChat";
import { Aurora } from "@/components/fx";

/**
 * Public marketing shell — the dark, cinematic canvas: night base, a slow
 * sunset aurora fixed behind everything, and a film-grain veil.
 */
export default function MarketingLayout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-night-950 text-white">
      <Aurora variant="dark" fixed className="opacity-70" />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 -z-10" />
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SupportChat />
    </div>
  );
}
