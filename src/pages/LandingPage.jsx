/**
 * Botlify — public homepage (Nov 2026 redesign).
 *
 * Orange #FF5A1F, black #0A0A0A, white. Sections alternate black / white with
 * orange bands for rhythm:
 *   Hero (black) → channel marquee (orange) → how it works (white) →
 *   replaces the human work (black) → features (white) → pricing (black) →
 *   FAQ (white) → final CTA (orange) → footer (black).
 *
 * Performance: only opacity/transform animate; one CSS-transform marquee;
 * the hero inbox pauses while off-screen; no blur filters.
 */
import { useEffect } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";
import SupportChat from "@/components/SupportChat";
import Hero from "@/pages/landing/Hero";
import { ChannelMarquee, Features, HowItWorks, Replaces } from "@/pages/landing/Sections";
import { FAQ, FinalCTA, Pricing } from "@/pages/landing/Closing";

export default function LandingPage() {
  useEffect(() => {
    document.title = "Botlify — The AI channel manager for hotels";
  }, []);
  return (
    <div className="min-h-screen overflow-x-clip bg-white font-geist text-[#0A0A0A] antialiased selection:bg-[#FF5A1F] selection:text-[#0A0A0A]">
      <PublicHeader tone="dark" />
      <main>
        <Hero />
        <ChannelMarquee />
        <HowItWorks />
        <Replaces />
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <SupportChat />
    </div>
  );
}
