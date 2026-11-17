import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { TelemetryPanel } from "../components/product/TelemetryPanel";
import { Chip } from "../components/ui/primitives";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";
import { featuredStartup } from "../data/startups";
import { useReducedMotionPref } from "../hooks/useMediaQuery";

const SIGNALS = ["Commit velocity", "Deploy frequency", "Weekly actives", "Revenue growth", "Community karma"];

export function TractionEngine() {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  const { scrollYProgress } = useScroll({ target: panelRef, offset: ["start end", "start 35%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);

  return (
    <section id="proof" aria-labelledby="proof-title" className="relative scroll-mt-16 py-28 sm:py-36 lg:py-44">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SectionIntro
            id="proof-title"
            eyebrow="Proof-of-Traction Engine"
            title={
              <>
                Proof, <span className="text-subtle">not promises.</span>
              </>
            }
            description="Ignite replaces static PDFs with live telemetry from the tools builders already use — engineering velocity, product usage and revenue, verified at the source."
          />
          <Reveal delay={0.15}>
            <ul className="flex flex-wrap gap-2 lg:justify-end lg:pb-2" aria-label="Signals measured">
              {SIGNALS.map((signal) => (
                <li key={signal}>
                  <Chip>{signal}</Chip>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div ref={panelRef} className="relative mt-14 lg:mt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_42/0.09),transparent)]"
          />
          <motion.div style={reduced ? undefined : { scale, y }} className="relative origin-top">
            <TelemetryPanel startup={featuredStartup} />
          </motion.div>
        </div>
        <p className="mt-5 text-xs text-subtle">
          Simulated telemetry for a fictional company. Integrations shown are illustrative.
        </p>
      </div>
    </section>
  );
}
