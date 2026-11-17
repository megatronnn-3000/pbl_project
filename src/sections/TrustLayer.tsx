import { BadgeCheck, Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { motion, useSpring } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";
import { Meter } from "../components/charts/ScoreRing";
import { Chip } from "../components/ui/primitives";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";
import { featuredStartup, institutions, startups } from "../data/startups";
import { useFinePointer, useReducedMotionPref } from "../hooks/useMediaQuery";

const LAYERS = [
  ["Identity", "Founders and investors verify identity and domain before anything is visible."],
  ["Institution", "E-Cells sign cohort membership, grants and pitch results with keys they control."],
  ["Telemetry", "Traction arrives from the source systems — never typed into a form."],
  ["Community", "Endorsements carry the endorser's own reputation, so they can't be farmed."],
];

const ECELL_FEATURES = [
  ["Cohort dashboard", "Milestones, grants and fundraising velocity for every startup you incubate."],
  ["Signed credentials", "Issue badges any investor can verify in one click."],
  ["Pitch sprints", "Run multi-campus demo days with deck analytics built in."],
];

const leaderboard = startups
  .filter((s) => s.track === "ecell")
  .sort((a, b) => b.signal - a.signal)
  .slice(0, 4);

export function TrustLayer() {
  return (
    <section id="trust" aria-labelledby="trust-title" className="relative scroll-mt-16 border-t border-line py-28 sm:py-36 lg:py-44">
      <div className="container-page">
        <div className="grid gap-16 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-20 xl:gap-28">
          <div>
            <SectionIntro
              id="trust-title"
              eyebrow="Trust infrastructure"
              title={
                <>
                  Every signal <span className="text-subtle">has a source.</span>
                </>
              }
              description="Ignite never asks anyone to take a claim on faith. Four verification layers sit underneath every score you see."
            />
            <ol className="mt-12 border-t border-line">
              {LAYERS.map(([title, detail], i) => (
                <Reveal key={title} delay={i * 0.06}>
                  <li className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-5 sm:grid-cols-[3rem_11rem_1fr]">
                    <span className="font-mono text-xs text-ember">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-[15px] font-medium text-fg">{title}</p>
                    <p className="col-start-2 mt-1 text-sm leading-relaxed text-subtle sm:col-start-3 sm:mt-0">{detail}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal delay={0.1} className="lg:pt-24">
            <CredentialCard />
          </Reveal>
        </div>

        <div className="mt-28 grid gap-12 lg:mt-36 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <Chip tone="ember">For E-Cells &amp; incubators</Chip>
            <h3 className="mt-6 text-title font-medium text-fg">Run your cohort on Ignite.</h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Stop tracking founders in spreadsheets. Prove placement outcomes with the same verified data investors use.
            </p>
            <dl className="mt-8 space-y-5">
              {ECELL_FEATURES.map(([title, detail]) => (
                <div key={title} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-ember" aria-hidden />
                  <div>
                    <dt className="text-sm font-medium text-fg">{title}</dt>
                    <dd className="mt-0.5 text-sm text-subtle">{detail}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="panel p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="eyebrow text-subtle">Cross-campus leaderboard</p>
                <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">By signal score</p>
              </div>
              <ol className="mt-4 divide-y divide-line">
                {leaderboard.map((s, i) => (
                  <li key={s.id} className="grid grid-cols-[2rem_minmax(0,1fr)_7rem] items-center gap-3 py-3.5">
                    <span className="font-mono text-xs tabular-nums text-subtle">#{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm text-fg">
                        {s.name} <BadgeCheck className="size-3.5 text-ember" aria-label="E-Cell verified" />
                      </p>
                      <p className="truncate text-xs text-subtle">
                        {s.ecell?.name} · {s.industry}
                      </p>
                    </div>
                    <div>
                      <p className="text-right text-sm tabular-nums text-fg">{s.signal}</p>
                      <Meter value={s.signal} className="mt-1.5" />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mask-fade-x relative mt-24 overflow-hidden" aria-label="Partner E-Cells (fictional)">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {institutions.map((name) => (
                <li key={name} className="flex items-center whitespace-nowrap font-mono text-micro uppercase tracking-[0.16em] text-subtle">
                  <span className="px-7">{name}</span>
                  <span aria-hidden className="size-1 rounded-full bg-faint" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function CredentialCard() {
  const ref = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const reduced = useReducedMotionPref();
  const rotateX = useSpring(0, { stiffness: 140, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 140, damping: 18 });
  const [status, setStatus] = useState<"idle" | "checking" | "valid">("idle");
  const startup = featuredStartup;

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!finePointer || reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
    rotateX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 9);
  };

  const verify = () => {
    setStatus("checking");
    window.setTimeout(() => setStatus("valid"), reduced ? 0 : 1100);
  };

  return (
    <div className="[perspective:1400px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={() => {
          rotateX.set(0);
          rotateY.set(0);
        }}
        style={{ rotateX, rotateY }}
        className="relative overflow-hidden rounded-[1.6rem] border border-line-strong bg-[linear-gradient(160deg,#17171b_0%,#0d0d0f_65%)] p-7 shadow-[0_60px_120px_-50px_rgb(0_0_0/0.95),inset_0_1px_0_rgb(255_255_255/0.06)] sm:p-9"
      >
        <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -right-36 -top-36 size-[28rem] text-white/[0.045]">
          {Array.from({ length: 48 }, (_, i) => {
            const angle = (i / 48) * Math.PI * 2;
            return (
              <circle key={i} cx={200 + Math.cos(angle) * 70} cy={200 + Math.sin(angle) * 70} r={128} fill="none" stroke="currentColor" strokeWidth="0.6" />
            );
          })}
        </svg>

        <div className="relative flex items-center justify-between gap-3">
          <p className="eyebrow text-subtle">Verifiable credential</p>
          <p className="flex items-center gap-1.5 font-mono text-nano uppercase tracking-[0.14em] text-ember-bright">
            <span className="size-1.5 rounded-full bg-ember" /> Valid
          </p>
        </div>

        <p className="relative mt-12 text-xs text-subtle">Issued to</p>
        <p className="relative mt-1 text-4xl font-semibold tracking-[0.02em] text-fg">{startup.name}</p>
        <p className="relative mt-1 text-sm text-muted">{startup.tagline}</p>

        <dl className="relative mt-9 divide-y divide-line border-y border-line text-sm">
          {[
            ["Issuer", `${startup.ecell?.name} · ${startup.institution}`],
            ["Program", `Incubation · ${startup.ecell?.cohort}`],
            ["Claims", "Incubated · Top 3 pitch · Seed grant"],
            ["Cohort rank", `#${String(startup.ecell?.rank).padStart(2, "0")} of ${startup.ecell?.cohortSize}`],
            ["Issued", "Jan 12, 2026"],
          ].map(([term, value]) => (
            <div key={term} className="flex items-baseline justify-between gap-6 py-2.5">
              <dt className="shrink-0 text-subtle">{term}</dt>
              <dd className="truncate text-right text-fg">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="relative mt-7 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">Signature · ed25519</p>
            <p className="mt-1 truncate font-mono text-xs text-muted">9f2c41d87be03a6c…5d10a41e</p>
          </div>
          <button
            type="button"
            onClick={verify}
            disabled={status === "checking"}
            aria-live="polite"
            className="flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] text-fg ring-1 ring-inset ring-line-strong transition-colors hover:bg-white/5 disabled:opacity-70"
          >
            {status === "idle" && (
              <>
                <ShieldCheck className="size-3.5 text-ember" aria-hidden /> Verify signature
              </>
            )}
            {status === "checking" && (
              <>
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> Checking issuer key…
              </>
            )}
            {status === "valid" && (
              <>
                <Check className="size-3.5 text-ember" aria-hidden /> Valid · checked just now
              </>
            )}
          </button>
        </div>
      </motion.div>
      <p className="mt-4 text-center text-xs text-subtle">Demo credential for a fictional startup and institution.</p>
    </div>
  );
}
