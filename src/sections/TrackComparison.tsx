import { BadgeCheck, Check, Fingerprint, GitCommitHorizontal, Handshake, IndianRupee, Server, Users } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useState, type ReactNode } from "react";
import { Meter } from "../components/charts/ScoreRing";
import { Sparkline } from "../components/charts/Sparkline";
import { Counter } from "../components/ui/Counter";
import { EASE_OUT_EXPO, Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";
import { startupById } from "../data/startups";
import { useSpotlight } from "../hooks/useSpotlight";
import { formatINR, formatInt } from "../lib/format";
import { cn } from "../lib/utils";

type Focus = "a" | "b" | null;

const nova = startupById("nova")!;
const forge = startupById("forge-ai")!;

const pipeline = [
  { icon: GitCommitHorizontal, label: "GitHub commits", unit: "Last 12 months", value: forge.telemetry.commits, format: formatInt, series: forge.telemetry.commitSeries },
  { icon: Server, label: "Deployments", unit: "This month", value: forge.telemetry.deployments, format: formatInt, series: forge.telemetry.deploySeries },
  { icon: Users, label: "Active users", unit: "Weekly", value: forge.telemetry.wau, format: formatInt, series: forge.telemetry.wauSeries },
  { icon: IndianRupee, label: "Revenue", unit: "MRR, privacy-shielded", value: forge.telemetry.mrr, format: formatINR, series: forge.telemetry.mrrSeries },
  { icon: Handshake, label: "Community endorsements", unit: "Verified developers", value: 118, format: (v: number) => `+${formatInt(v)}`, series: [8, 14, 22, 31, 40, 52, 61, 73, 84, 96, 108, 118] },
];

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
};

export function TrackComparison() {
  const [focus, setFocus] = useState<Focus>(null);

  return (
    <section id="tracks" aria-labelledby="tracks-title" className="relative scroll-mt-16 py-28 sm:py-36 lg:py-44">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <SectionIntro
            id="tracks-title"
            eyebrow="Dual-track signal"
            title={
              <>
                Two ways in. <span className="text-subtle">One standard of proof.</span>
              </>
            }
          />
          <Reveal delay={0.15}>
            <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg lg:justify-self-end lg:pb-2">
              Campus founders carry institutional trust. Independent builders carry live telemetry. Ignite scores both on one
              scale and routes the best of each to the same investors.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-16 grid lg:mt-24 lg:grid-cols-2">
          <div aria-hidden className="absolute inset-y-12 left-1/2 hidden w-px bg-line lg:block" />

          <Column id="a" focus={focus} setFocus={setFocus}>
            <TrackHeader
              track="Track A"
              kicker="Institutional signal"
              title="E-Cell Vetted"
              description="For university founders. Trust issued by the E-Cells that incubated, judged and mentored them."
            />
            <motion.ol
              className="relative mt-10"
              variants={list}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            >
              <motion.span
                aria-hidden
                className="absolute bottom-10 left-[11px] top-6 w-px origin-top bg-gradient-to-b from-ember/70 via-ember/25 to-transparent"
                variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.6, ease: EASE_OUT_EXPO, delay: 0.25 } } }}
              />
              {nova.credentials.map((credential) => (
                <motion.li key={credential.label} variants={item} className="relative flex gap-4 py-3">
                  <span className="relative z-10 mt-px grid size-[23px] shrink-0 place-items-center rounded-full bg-canvas ring-1 ring-ember/45">
                    <Check className="size-3 text-ember" strokeWidth={2.75} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 border-b border-line pb-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="text-[15px] font-medium text-fg">{credential.label}</p>
                      <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">
                        {credential.issuer} · {credential.date}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-subtle">{credential.detail}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
            <Reveal delay={0.2} className="mt-8 flex items-center gap-3.5 rounded-xl border border-line bg-white/[0.02] px-4 py-3.5">
              <Fingerprint className="size-5 shrink-0 text-ember" aria-hidden />
              <div className="min-w-0">
                <p className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">Signed by {nova.ecell?.name} · {nova.ecell?.cohort}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted">ed25519 · 9f2c 41d8 7be0 … a41e</p>
              </div>
              <BadgeCheck className="ml-auto size-4 shrink-0 text-ember" aria-label="Signature valid" />
            </Reveal>
          </Column>

          <Column id="b" focus={focus} setFocus={setFocus} className="border-t border-line lg:border-t-0">
            <TrackHeader
              track="Track B"
              kicker="Proof of traction"
              title="Open Builder"
              description="For independent builders. No gatekeepers — the work speaks for itself through live telemetry."
            />
            <motion.ol
              className="mt-10"
              variants={list}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            >
              {pipeline.map((step, i) => (
                <motion.li key={step.label} variants={item}>
                  <div className="flex items-center gap-4 py-1.5">
                    <span className="grid size-[23px] shrink-0 place-items-center rounded-md bg-white/[0.04] ring-1 ring-inset ring-white/10">
                      <step.icon className="size-3.5 text-muted" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] text-fg">{step.label}</p>
                      <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">{step.unit}</p>
                    </div>
                    <Sparkline values={step.series} width={64} height={22} className="hidden text-subtle sm:block" />
                    <Counter
                      value={step.value}
                      format={step.format}
                      className="w-[4.75rem] text-right text-lg font-medium tracking-tight text-fg tabular-nums"
                    />
                  </div>
                  {i < pipeline.length - 1 && (
                    <div aria-hidden className="relative ml-[11px] h-6 w-px overflow-hidden bg-line-strong">
                      <span
                        className="absolute inset-0 animate-flow bg-gradient-to-b from-transparent via-ember to-transparent"
                        style={{ animationDelay: `${i * 0.4}s` }}
                      />
                    </div>
                  )}
                </motion.li>
              ))}
            </motion.ol>
            <Reveal delay={0.2} className="mt-8 rounded-xl border border-line bg-white/[0.02] px-4 py-3.5">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">Algorithmic trust score · {forge.name}</p>
                <p className="text-sm font-medium tabular-nums text-fg">
                  {forge.scores.trust}
                  <span className="text-subtle">/100</span>
                </p>
              </div>
              <Meter value={forge.scores.trust} className="mt-3" />
            </Reveal>
          </Column>
        </div>

        <Convergence focus={focus} />
      </div>
    </section>
  );
}

function Column({
  id,
  focus,
  setFocus,
  className,
  children,
}: {
  id: "a" | "b";
  focus: Focus;
  setFocus: (focus: Focus) => void;
  className?: string;
  children: ReactNode;
}) {
  const spotlight = useSpotlight<HTMLDivElement>();
  const dimmed = focus !== null && focus !== id;
  return (
    <div
      ref={spotlight.ref}
      onPointerMove={spotlight.onPointerMove}
      onPointerEnter={(event) => event.pointerType === "mouse" && setFocus(id)}
      onPointerLeave={() => setFocus(null)}
      className={cn(
        "spotlight relative rounded-3xl py-12 transition-opacity duration-500 lg:px-10 lg:py-12 xl:px-14",
        dimmed && "lg:opacity-40",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TrackHeader({ track, kicker, title, description }: { track: string; kicker: string; title: string; description: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-nano uppercase tracking-[0.14em] text-muted">{track}</span>
        <span className="eyebrow text-ember">{kicker}</span>
      </div>
      <h3 className="mt-6 text-title font-medium text-fg">{title}</h3>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">{description}</p>
    </Reveal>
  );
}

function Convergence({ focus }: { focus: Focus }) {
  const stroke = (side: "a" | "b") => (focus === side ? "var(--color-ember)" : "rgb(255 255 255 / 0.14)");
  return (
    <div aria-hidden className="relative">
      <svg className="hidden h-32 w-full lg:block" viewBox="0 0 1000 128" preserveAspectRatio="none">
        {(["a", "b"] as const).map((side) => (
          <motion.path
            key={side}
            d={side === "a" ? "M250 0 C250 72 500 52 500 124" : "M750 0 C750 72 500 52 500 124"}
            fill="none"
            stroke={stroke(side)}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            style={{ transition: "stroke 0.5s" }}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE_OUT_EXPO }}
          />
        ))}
      </svg>
      <div className="mx-auto h-14 w-px bg-gradient-to-b from-line-strong to-ember/60 lg:hidden" />
      <div className="flex flex-col items-center">
        <span className="relative grid size-3 place-items-center">
          <span className="absolute inset-0 animate-ping-soft rounded-full bg-ember/60" />
          <span className="size-2 rounded-full bg-ember" />
        </span>
        <p className="eyebrow mt-4 text-muted">Investor matchmaking &amp; deal room</p>
      </div>
    </div>
  );
}
