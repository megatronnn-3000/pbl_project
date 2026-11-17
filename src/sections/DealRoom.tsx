import { ArrowUpRight } from "lucide-react";
import { DealRoomPanel } from "../components/product/DealRoomPanel";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/primitives";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";

export function DealRoom() {
  return (
    <section id="deal-room" aria-labelledby="deal-room-title" className="relative scroll-mt-16 py-28 sm:py-36 lg:py-44">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionIntro
            id="deal-room-title"
            eyebrow="Deal rooms"
            title={
              <>
                From match <span className="text-subtle">to signed SAFE.</span>
              </>
            }
            description="NDA-gated documents, live cap-table modelling and threaded diligence — one secure room per deal, shared by everyone at the table."
          />
          <Reveal delay={0.12} className="lg:pb-2">
            <ul className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end" aria-label="Deal room capabilities">
              {["NDA-gated access", "Per-viewer watermarks", "Live SAFE modelling", "Threaded Q&A"].map((item) => (
                <li key={item}>
                  <Chip>{item}</Chip>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal className="mt-14 lg:mt-20">
          <DealRoomPanel initialTab="cap" />
        </Reveal>
        <div className="mt-8 flex justify-center">
          <Button to="/deal-room" variant="ghost" icon={<ArrowUpRight className="size-4" />}>
            Open the deal room
          </Button>
        </div>
      </div>
    </section>
  );
}
