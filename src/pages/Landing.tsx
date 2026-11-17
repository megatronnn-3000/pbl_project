import { useEffect } from "react";
import { useLocation } from "react-router";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { scrollToHash } from "../lib/scroll";
import { Copilot } from "../sections/Copilot";
import { DealRoom } from "../sections/DealRoom";
import { FinalCta } from "../sections/FinalCta";
import { InvestorFeed } from "../sections/InvestorFeed";
import { PitchAnalytics } from "../sections/PitchAnalytics";
import { SignalStory } from "../sections/SignalStory";
import { Stats } from "../sections/Stats";
import { TrackComparison } from "../sections/TrackComparison";
import { TractionEngine } from "../sections/TractionEngine";
import { TrustLayer } from "../sections/TrustLayer";
import { WarmthExplainer } from "../sections/WarmthExplainer";

export default function Landing() {
  useDocumentTitle("Ignite — Where Signal Meets Capital");
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = requestAnimationFrame(() => scrollToHash(location.hash, "auto"));
    return () => cancelAnimationFrame(id);
  }, [location.hash]);

  return (
    <div className="overflow-x-clip">
      <Navbar />
      <main id="main">
        <SignalStory />
        <TrackComparison />
        <TractionEngine />
        <WarmthExplainer />
        <InvestorFeed />
        <PitchAnalytics />
        <Copilot />
        <DealRoom />
        <TrustLayer />
        <Stats />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
