import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useScroll } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { buildNetwork, MATCHES } from "../components/graph/network";
import { createStoryEngine } from "../components/graph/storyEngine";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/primitives";
import { EASE_OUT_EXPO, MaskedHeadline } from "../components/ui/Reveal";
import { useFinePointer, useMediaQuery, useReducedMotionPref } from "../hooks/useMediaQuery";
import { scrollToHash } from "../lib/scroll";

const STEPS = ["Trust", "Proof", "Warmth", "Match"];

interface ChapterContent {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  plain: string;
  body: string;
  metrics?: [string, string][];
}

const CHAPTERS: ChapterContent[] = [
  {
    eyebrow: "The problem",
    title: (
      <>
        The problem isn't lack of capital. <span className="text-subtle">It's lack of signal.</span>
      </>
    ),
    plain: "The problem isn't lack of capital. It's lack of signal.",
    body: "Thousands of cold decks arrive as static, self-reported PDFs. Founders outside elite networks stay invisible, and investors drown in noise.",
    metrics: [
      ["4,812", "cold pitches this month"],
      ["2.1%", "ever get a reply"],
    ],
  },
  {
    index: "01",
    eyebrow: "Trust",
    title: "Verification clears the noise.",
    plain: "Verification clears the noise.",
    body: "E-Cells cryptographically vouch for their cohorts. Independent builders connect the tools they already ship with. Claims nobody can verify simply fall away.",
    metrics: [["312", "verified profiles remain"]],
  },
  {
    index: "02",
    eyebrow: "Proof",
    title: "Proof replaces promises.",
    plain: "Proof replaces promises.",
    body: "Commits, deployments, active users and revenue stream in live — momentum you can inspect, not a slide you're asked to believe.",
    metrics: [["48", "with live traction"]],
  },
  {
    index: "03",
    eyebrow: "Warmth",
    title: "Relationships, quantified.",
    plain: "Relationships, quantified.",
    body: "Shared mentors, alma maters, events and thesis overlap become one 0–100% warmth score for every founder–investor pair.",
    metrics: [["12", "warm paths to you"]],
  },
];

export function SignalStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const youLabelRef = useRef<HTMLDivElement>(null);
  const youAnchorRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ReturnType<typeof createStoryEngine> | null>(null);

  const desktop = useMediaQuery("(min-width: 1024px)");
  const reduced = useReducedMotionPref();
  const finePointer = useFinePointer();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [activeId, setActiveId] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const announceNext = useRef(false);

  const model = useMemo(() => buildNetwork(desktop ? "dense" : "light"), [desktop]);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = stickyRef.current;
    if (!canvas || !container) return;
    const engine = createStoryEngine({
      canvas,
      container,
      model,
      reduced,
      desktop,
      finePointer,
      getProgress: () => scrollYProgress.get(),
      elements: {
        tooltip: tooltipRef.current,
        captions: captionRefs.current,
        labels: labelRefs.current,
        youLabel: youLabelRef.current,
        rows: rowRefs.current,
        youAnchor: youAnchorRef.current,
        hud: hudRef.current,
        progressFill: progressFillRef.current,
        steps: stepRefs.current,
        counter: counterRef.current,
        hint: hintRef.current,
      },
      onActiveChange: (id) => {
        if (id !== null) setActiveId(id);
      },
      onNavigate: (id) => navigateRef.current(`/startup/${id}`),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [model, reduced, desktop, finePointer, scrollYProgress]);

  const active = activeId !== null ? model.nodes[activeId] : null;
  const detail = activeId !== null ? model.details.get(activeId) : undefined;
  const counterpart = detail ? model.nodes[detail.counterpart] : null;

  useEffect(() => {
    if (!announceNext.current || !active || !detail || !counterpart) return;
    announceNext.current = false;
    setAnnouncement(`${active.label} and ${counterpart.label}: ${detail.warmth}% warm, ${detail.mentors} shared mentors, ${detail.events} shared events, ${detail.thesis}% thesis overlap.`);
  }, [active, detail, counterpart]);

  const cycle = (direction: 1 | -1) => {
    announceNext.current = true;
    engineRef.current?.cycle(direction);
  };

  const seeHowItWorks = () => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const distance = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * (1.05 / 5.6), behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section ref={sectionRef} id="story" aria-label="How Ignite turns noise into matches" className="relative h-[520vh] lg:h-[600vh]">
      <ol className="sr-only">
        {CHAPTERS.map((chapter) => (
          <li key={chapter.plain}>
            {chapter.plain} {chapter.body}
          </li>
        ))}
        <li>Four matches worth your week. Signal, proof and warmth resolve into a short list, and one click opens a secure deal room.</li>
      </ol>

      <div ref={stickyRef} className="sticky top-0 h-svh w-full overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-[20%] top-[-10%] size-[80vmax] rounded-full bg-[radial-gradient(closest-side,rgb(255_106_42/0.065),transparent)] lg:-right-[8%] lg:top-[5%]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas to-transparent" />
        </div>

        <canvas
          ref={canvasRef}
          role="img"
          aria-label="The Ignite warmth graph: founders, investors, E-Cells, mentors and events connected by the relationships between them."
          className="absolute inset-0 size-full"
        />

        {/* Warmth card */}
        <div
          ref={tooltipRef}
          aria-hidden
          style={{ opacity: 0, visibility: "hidden" }}
          className="pointer-events-none absolute left-0 top-0 z-20 w-56 rounded-2xl border border-line-strong bg-overlay/85 p-4 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl lg:w-64"
        >
          {active && detail && counterpart && (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">
                  {active.kind === "founder" ? "Founder" : "Investor"}
                </span>
                {(active.verified || active.kind === "investor") && (
                  <span className="flex items-center gap-1 font-mono text-nano uppercase tracking-[0.12em] text-ember-bright">
                    <BadgeCheck className="size-3" /> Verified
                  </span>
                )}
              </div>
              <p className="mt-2 text-[15px] font-medium leading-tight text-fg">{active.label}</p>
              <p className="mt-0.5 text-xs text-subtle">{active.meta}</p>
              <div className="my-3.5 h-px bg-line" />
              <div className="flex items-baseline gap-2">
                <span className="text-[2rem] font-medium leading-none tracking-[-0.04em] text-fg">{detail.warmth}%</span>
                <span className="font-mono text-micro uppercase tracking-[0.14em] text-ember">Warm</span>
              </div>
              <p className="mt-1.5 truncate text-xs text-muted">
                <span className="text-subtle">with</span> {counterpart.label}
              </p>
              <div className="mt-3 hidden h-1 overflow-hidden rounded-full bg-white/[0.07] lg:block">
                <div className="h-full rounded-full bg-ember" style={{ width: `${detail.warmth}%` }} />
              </div>
              <dl className="mt-3.5 space-y-1.5 text-xs">
                {[
                  ["Shared mentors", String(detail.mentors)],
                  ["Network", detail.network],
                  ["Shared events", String(detail.events)],
                  ["Thesis overlap", `${detail.thesis}%`],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    className={i === 1 || i === 2 ? "hidden items-center justify-between gap-3 lg:flex" : "flex items-center justify-between gap-3"}
                  >
                    <dt className="text-subtle">{label}</dt>
                    <dd className="truncate text-right tabular-nums text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        {/* Labels that ride the four matches through proof and warmth */}
        {MATCHES.map((match, i) => (
          <div
            key={match.name}
            ref={(node) => {
              labelRefs.current[i] = node;
            }}
            aria-hidden
            style={{ opacity: 0, visibility: "hidden" }}
            className="pointer-events-none absolute left-0 top-0 z-10 grid grid-cols-[auto_auto] items-center gap-x-2 whitespace-nowrap rounded-md bg-canvas/70 px-1.5 py-0.5 backdrop-blur-sm lg:flex lg:gap-2"
          >
            <span className="text-[13px] font-medium text-fg">{match.name}</span>
            <span
              data-warm
              style={{ opacity: 0, visibility: "hidden" }}
              className="justify-self-start rounded-full border border-ember/30 bg-ember/10 px-1.5 font-mono text-nano leading-4 text-ember-bright lg:order-3"
            >
              {match.warmth}%
            </span>
            <span className="col-span-2 font-mono text-nano uppercase tracking-[0.1em] text-muted lg:order-2">{match.proof}</span>
          </div>
        ))}
        <div
          ref={youLabelRef}
          aria-hidden
          style={{ opacity: 0, visibility: "hidden" }}
          className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded-full border border-line-strong bg-canvas/80 px-2.5 py-1 font-mono text-nano uppercase tracking-[0.12em] text-fg backdrop-blur"
        >
          <span className="lg:hidden">You</span>
          <span className="hidden lg:inline">You · Halcyon Ventures</span>
        </div>

        {/* Resolved match list */}
        <div ref={youAnchorRef} aria-hidden className="absolute left-7 top-[calc(7rem+7rem)] size-px lg:left-[53%] lg:top-1/2" />
        <div className="absolute left-14 right-4 top-28 z-10 sm:left-20 sm:right-10 lg:left-[60%] lg:right-auto lg:top-1/2 lg:w-[min(30rem,34vw)] lg:-translate-y-1/2">
          <p className="sr-only">Top matches</p>
          {MATCHES.map((match, i) => (
            <Link
              key={match.name}
              to={`/startup/${match.startupId}`}
              ref={(node) => {
                rowRefs.current[i] = node;
              }}
              style={{ opacity: 0, visibility: "hidden" }}
              className="group flex h-14 items-center gap-3 border-b border-line pl-8 pr-1 transition-colors hover:border-line-strong lg:h-[4.5rem] lg:gap-5"
            >
              <span className="w-11 text-lg font-medium tabular-nums tracking-tight text-fg lg:w-14 lg:text-2xl">{match.warmth}%</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg lg:text-[15px]">{match.name}</span>
                <span className="block truncate text-xs text-subtle">{match.meta}</span>
              </span>
              <span className="hidden font-mono text-micro text-muted sm:block">{match.proof}</span>
              <ArrowRight className="size-3.5 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />
            </Link>
          ))}
        </div>

        {/* Copy */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="container-page grid h-full items-end pb-[max(1.75rem,4svh)] pt-24 lg:items-center lg:pb-0 lg:pt-16">
            <div className="grid lg:max-w-[42rem]">
              <div
                ref={(node) => {
                  captionRefs.current[0] = node;
                }}
                className="self-end [grid-area:1/1] lg:self-center"
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.05 }}>
                  <Eyebrow live>The signal layer for early-stage venture</Eyebrow>
                </motion.div>
                <MaskedHeadline
                  as="h1"
                  immediate
                  delay={0.12}
                  lines={[
                    ["Where", "signal"],
                    [
                      "meets",
                      <>
                        capital<span className="text-ember">.</span>
                      </>,
                    ],
                  ]}
                  className="mt-6 text-display font-medium text-fg lg:mt-8"
                />
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.55, ease: EASE_OUT_EXPO }}
                  className="mt-5 max-w-md text-[15px] leading-relaxed text-muted sm:text-lg lg:mt-7"
                >
                  <span className="lg:hidden">Verified founders, live traction and quantified warmth — resolved into deal flow worth your time.</span>
                  <span className="hidden lg:inline">
                    Ignite fuses E-Cell verification, live proof-of-traction and a quantified warmth graph into one feed — so
                    investors meet the founders worth meeting, and founders are seen for what they've actually built.
                  </span>
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.7, ease: EASE_OUT_EXPO }}
                  className="pointer-events-auto mt-7 flex flex-wrap items-center gap-2.5 lg:mt-10 lg:gap-3"
                >
                  <Button to="/explore" size="lg" magnetic icon={<ArrowRight className="size-4" />}>
                    Explore Ignite
                  </Button>
                  <Button variant="secondary" size="lg" magnetic onClick={seeHowItWorks}>
                    See how it works
                  </Button>
                </motion.div>
              </div>

              {CHAPTERS.map((chapter, i) => (
                <div
                  key={chapter.plain}
                  ref={(node) => {
                    captionRefs.current[i + 1] = node;
                  }}
                  aria-hidden
                  style={{ opacity: 0, visibility: "hidden" }}
                  className="self-end [grid-area:1/1] lg:self-center"
                >
                  <Chapter {...chapter} />
                </div>
              ))}

              <div
                ref={(node) => {
                  captionRefs.current[5] = node;
                }}
                style={{ opacity: 0, visibility: "hidden" }}
                className="self-end [grid-area:1/1] lg:self-center"
              >
                <Chapter
                  index="04"
                  eyebrow="Match"
                  title="Four matches worth your week."
                  plain="Four matches worth your week."
                  body="Signal, proof and warmth resolve into a short list. From here, one click opens a secure deal room."
                />
                <div className="pointer-events-auto mt-7 flex flex-wrap gap-2.5 lg:mt-10">
                  <Button
                    href="#deal-room"
                    icon={<ArrowRight className="size-4" />}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToHash("#deal-room");
                    }}
                  >
                    Enter the deal room
                  </Button>
                  <Button to="/explore" variant="secondary">
                    All matches
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress through the narrative */}
        <div
          ref={hudRef}
          style={{ opacity: 0, visibility: "hidden" }}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[4.5rem] z-10 lg:bottom-8 lg:top-auto"
        >
          <div className="container-page flex items-center justify-between gap-6">
            <div className="w-full max-w-[22rem] lg:max-w-[26rem]">
              <ol className="flex justify-between font-mono text-nano uppercase tracking-[0.14em] lg:text-micro">
                {STEPS.map((step, i) => (
                  <li
                    key={step}
                    ref={(node) => {
                      stepRefs.current[i] = node;
                    }}
                    data-state="idle"
                    className="group flex items-center gap-1.5 text-faint transition-colors duration-500 data-[state=active]:text-fg data-[state=done]:text-subtle"
                  >
                    <span className="size-1 rounded-full bg-current transition-colors duration-500 group-data-[state=active]:bg-ember" />
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-2.5 h-px bg-line">
                <div ref={progressFillRef} className="h-px origin-left scale-x-0 bg-ember" />
              </div>
            </div>
            <p className="hidden shrink-0 text-right font-mono text-micro uppercase tracking-[0.14em] text-subtle sm:block">
              <span ref={counterRef} className="text-fg tabular-nums">
                4,812
              </span>{" "}
              profiles in view
            </p>
          </div>
        </div>

        {/* Hero hint + legend */}
        <div
          ref={hintRef}
          style={{ opacity: 0, visibility: "hidden" }}
          className="absolute right-4 top-[4.75rem] z-10 flex items-center gap-2 lg:bottom-8 lg:right-[max(3rem,calc((100vw-82rem)/2+3rem))] lg:top-auto lg:gap-6"
        >
          <ul aria-hidden className="hidden items-center gap-4 font-mono text-nano uppercase tracking-[0.14em] text-subtle xl:flex">
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-fg/80" /> Founder
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-fg/80" /> Investor
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rotate-45 border border-fg/80" /> E-Cell
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-fg/60" /> Mentor
            </li>
          </ul>
          <span aria-hidden className="hidden h-3 w-px bg-line-strong xl:block" />
          <span className="hidden font-mono text-nano uppercase tracking-[0.14em] text-subtle sm:inline">
            {finePointer ? "Hover a node" : "Tap a node"}
          </span>
          <div className="flex items-center rounded-full border border-line bg-canvas/60 backdrop-blur">
            <button
              type="button"
              onClick={() => cycle(-1)}
              aria-label="Previous featured connection"
              className="grid size-8 place-items-center rounded-full text-subtle transition-colors hover:text-fg"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => cycle(1)}
              aria-label="Next featured connection"
              className="grid size-8 place-items-center rounded-full text-subtle transition-colors hover:text-fg"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </section>
  );
}

function Chapter({ index, eyebrow, title, body, metrics }: ChapterContent) {
  return (
    <div className="lg:max-w-[35rem]">
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-[clamp(2.1rem,1.2rem+3vw,3.9rem)] font-medium leading-[1] tracking-[-0.045em] text-fg lg:mt-7">
        {title}
      </h2>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:text-base lg:mt-6 lg:text-lg">{body}</p>
      {metrics && (
        <dl className="mt-6 flex gap-10 lg:mt-10">
          {metrics.map(([value, label]) => (
            <div key={label} className="flex flex-col">
              <dt className="order-2 mt-1 text-xs text-subtle">{label}</dt>
              <dd className="order-1 text-2xl font-medium tracking-tight text-fg lg:text-[2rem]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
