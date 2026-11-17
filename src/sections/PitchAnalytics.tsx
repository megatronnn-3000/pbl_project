import { ArrowUpRight } from "lucide-react";
import { PitchViewer } from "../components/product/PitchViewer";
import { WindowChrome } from "../components/product/WindowChrome";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";
import { getDeck } from "../data/pitch";
import { featuredStartup } from "../data/startups";

const deck = getDeck(featuredStartup);

export function PitchAnalytics() {
  return (
    <section id="pitch" aria-labelledby="pitch-title" className="relative scroll-mt-16 py-28 sm:py-36 lg:py-44">
      <div className="container-page">
        <SectionIntro
          id="pitch-title"
          align="center"
          eyebrow="Pitch intelligence"
          title={
            <>
              Know exactly where <span className="text-subtle">the room leaned in.</span>
            </>
          }
          description="Slide-level dwell time, retention and threaded questions — measured across every investor who opens the deck."
        />
        <Reveal className="mt-14 lg:mt-20">
          <div className="window overflow-hidden">
            <WindowChrome path={`ignite.app/pitch/${featuredStartup.id} · deck v${deck.version}`} />
            <div className="p-4 sm:p-6">
              <PitchViewer startup={featuredStartup} deck={deck} initialSlide="economics" />
            </div>
          </div>
        </Reveal>
        <div className="mt-8 flex justify-center">
          <Button to={`/pitch/${featuredStartup.id}`} variant="ghost" icon={<ArrowUpRight className="size-4" />}>
            Open full deck analytics
          </Button>
        </div>
      </div>
    </section>
  );
}
