import { Outlet } from "react-router-dom";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";
import SupportChat from "@/components/SupportChat";
import { Aurora } from "@/components/fx";

/**
 * Public marketing shell — warm, light canvas with a static sunset aurora
 * fixed behind everything.
 */
export default function MarketingLayout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[#FBFAF8] text-ink-950">
      <Aurora fixed />
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SupportChat />
    </div>
  );
}
