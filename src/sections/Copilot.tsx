import { ArrowUpRight } from "lucide-react";
import { CopilotConsole } from "../components/product/CopilotConsole";
import { PitchHealth } from "../components/product/PitchHealth";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";

const CAPABILITIES = [
  ["Thesis parsing", "Reads mandates and portfolio history, not keywords."],
  ["Warm-path ranking", "Orders matches by who can actually introduce you."],
  ["Red-flag scanner", "Catches missing metrics before an investor does."],
  ["Update drafts", "Turns founder logs into a monthly investor update."],
];

export function Copilot() {
  return (
    <section id="copilot" aria-labelledby="copilot-title" className="relative scroll-mt-16 overflow-hidden py-28 sm:py-36 lg:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[42rem] w-[70rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_42/0.07),transparent)]"
      />
      <div className="container-page relative">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SectionIntro
            id="copilot-title"
            eyebrow="Ignite Copilot"
            title={
              <>
                An analyst that <span className="text-subtle">never sleeps.</span>
              </>
            }
            description="Embedded where decisions get made — not bolted on as a chatbot."
          />
          <Reveal delay={0.12}>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:pb-2">
              {CAPABILITIES.map(([title, detail], i) => (
                <div key={title} className="border-t border-line pt-4">
                  <dt className="flex items-baseline gap-2.5 text-sm font-medium text-fg">
                    <span className="font-mono text-nano text-ember">{String(i + 1).padStart(2, "0")}</span>
                    {title}
                  </dt>
                  <dd className="mt-1 pl-[1.6rem] text-sm leading-relaxed text-subtle">{detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <CopilotConsole autoRun className="h-full" />
          </Reveal>
          <Reveal delay={0.1}>
            <PitchHealth className="h-full" />
          </Reveal>
        </div>
        <div className="mt-8 flex justify-center">
          <Button to="/copilot" variant="ghost" icon={<ArrowUpRight className="size-4" />}>
            Open Copilot
          </Button>
        </div>
      </div>
    </section>
  );
}
