import { Check, ChevronLeft, ChevronRight, Mic, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type KeyboardEvent } from "react";
import type { Deck, DeckQuestion, SlideKey } from "../../data/pitch";
import type { Startup } from "../../data/types";
import { formatClock } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Avatar, LiveDot } from "../ui/primitives";
import { SlideCanvas } from "./Slides";

const pad = (n: number) => String(n).padStart(2, "0");

export function PitchViewer({
  startup,
  deck,
  initialSlide = "team",
  globalKeys = false,
  className,
}: {
  startup: Startup;
  deck: Deck;
  initialSlide?: SlideKey;
  /** Listen for arrow keys on the whole page (full-screen viewer). */
  globalKeys?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState<SlideKey>(initialSlide);
  const [hovered, setHovered] = useState<SlideKey | null>(null);
  const count = deck.slides.length;
  const index = Math.max(0, deck.slides.findIndex((s) => s.key === active));
  const slide = deck.slides[index];
  const maxDwell = Math.max(...deck.slides.map((s) => s.dwell));
  const highlighted = hovered ?? active;
  const slideQuestions = deck.questions.filter((q) => q.slide === active);
  const featuredQuestion = slideQuestions[0] ?? deck.questions[0];

  const go = (direction: 1 | -1) => setActive(deck.slides[(index + direction + count) % count].key);

  useEffect(() => {
    if (!globalKeys) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea")) return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onStageKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (globalKeys) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const heat = (dwell: number) => 0.14 + 0.86 * (dwell / maxDwell);
  const isHigh = (dwell: number) => dwell >= maxDwell * 0.85;

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[8.5rem_minmax(0,1fr)_19rem] xl:grid-cols-[9.5rem_minmax(0,1fr)_20rem]", className)}>
      {/* Thumbnails */}
      <ol aria-label="Slides" className="no-scrollbar order-2 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 lg:order-none lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {deck.slides.map((s, i) => {
          const isActive = s.key === active;
          return (
            <li key={s.key} className="w-32 shrink-0 lg:w-auto">
              <button
                type="button"
                onClick={() => setActive(s.key)}
                onPointerEnter={() => setHovered(s.key)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.key)}
                onBlur={() => setHovered(null)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Slide ${i + 1}, ${s.label}. Average dwell ${formatClock(s.dwell)}.`}
                className={cn(
                  "relative block w-full overflow-hidden rounded-lg ring-1 transition-[box-shadow,opacity] duration-300",
                  isActive ? "ring-ember/80" : s.key === highlighted ? "ring-white/30" : "ring-line hover:ring-white/20",
                )}
              >
                <div aria-hidden className="pointer-events-none">
                  <SlideCanvas slide={s} index={i} startup={startup} deck={deck} />
                </div>
                <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: `rgb(255 106 42 / ${heat(s.dwell)})` }} />
                <span aria-hidden className="absolute bottom-1 right-1.5 rounded bg-black/60 px-1 font-mono text-[9px] tabular-nums text-muted">
                  {formatClock(s.dwell)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Stage */}
      <div className="order-1 min-w-0 lg:order-none">
        <div
          tabIndex={0}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${count}: ${slide.label}. Use arrow keys to change slides.`}
          onKeyDown={onStageKey}
          className="relative overflow-hidden rounded-xl ring-1 ring-line-strong"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <SlideCanvas slide={slide} index={index} startup={startup} deck={deck} />
            </motion.div>
          </AnimatePresence>

          {slideQuestions.map((q) => (
            <div key={q.text} className="group absolute" style={{ left: `${q.pin.x}%`, top: `${q.pin.y}%` }}>
              <button type="button" aria-label={`Investor question from ${q.org}: ${q.text}`} className="relative grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center">
                <span className="absolute inset-0.5 animate-ping-soft rounded-full bg-ember/50" />
                <span className="size-3 rounded-full bg-ember ring-2 ring-[#111113]" />
              </button>
              <div className="pointer-events-none absolute right-0 top-4 hidden w-56 rounded-lg border border-line-strong bg-overlay/95 p-3 opacity-0 shadow-2xl backdrop-blur transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 sm:block">
                <p className="text-[11px] text-subtle">
                  {q.author} · {q.org}
                </p>
                <p className="mt-1 text-sm leading-snug text-fg">{q.text}</p>
              </div>
            </div>
          ))}

        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="grid size-8 place-items-center rounded-full text-muted ring-1 ring-inset ring-line transition-colors hover:text-fg hover:ring-line-strong"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="grid size-8 place-items-center rounded-full text-muted ring-1 ring-inset ring-line transition-colors hover:text-fg hover:ring-line-strong"
            >
              <ChevronRight className="size-4" />
            </button>
            <span className="ml-2 font-mono text-xs tabular-nums text-subtle">
              {pad(index + 1)} / {pad(count)}
            </span>
          </div>
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-subtle">
            {isHigh(slide.dwell) && (
              <span className="rounded-full border border-ember/30 bg-ember/[0.07] px-2 py-0.5 font-mono text-nano uppercase tracking-[0.14em] text-ember-bright">
                High interest
              </span>
            )}
            <span>
              {slide.label} · avg <span className="tabular-nums text-fg">{formatClock(slide.dwell)}</span> · {slide.retention}% reached
            </span>
          </p>
        </div>

        <QuestionCard
          key={featuredQuestion.text}
          question={featuredQuestion}
          slideLabel={deck.slides.find((s) => s.key === featuredQuestion.slide)?.label ?? ""}
          onJump={() => setActive(featuredQuestion.slide)}
          isOnSlide={featuredQuestion.slide === active}
        />
      </div>

      {/* Analytics */}
      <div className="order-3 min-w-0 lg:order-none">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow text-subtle">Investor engagement</p>
          <span className="flex items-center gap-1.5 font-mono text-nano uppercase tracking-[0.12em] text-muted">
            <LiveDot /> 2 viewing
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-4">
          {[
            ["Viewers", String(deck.viewers)],
            ["Finished", String(deck.completed)],
            ["Avg time", formatClock(deck.avgSeconds)],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <dt className="order-2 mt-1 text-[11px] text-subtle">{label}</dt>
              <dd className="order-1 text-lg font-medium tracking-tight text-fg">{value}</dd>
            </div>
          ))}
        </dl>

        <ul aria-label="Average dwell time per slide" className="mt-2">
          {deck.slides.map((s) => {
            const isHl = s.key === highlighted;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setActive(s.key)}
                  onPointerEnter={() => setHovered(s.key)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(s.key)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "grid w-full grid-cols-[6.25rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 gap-y-1 rounded-md px-2 py-2.5 text-left transition-colors duration-300",
                    isHl ? "bg-white/[0.045]" : "hover:bg-white/[0.02]",
                  )}
                >
                  <span className={cn("truncate text-[13px] transition-colors", s.key === active ? "text-fg" : "text-muted")}>{s.label}</span>
                  <span className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: `rgb(255 106 42 / ${heat(s.dwell)})` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(s.dwell / maxDwell) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                  <span className="text-right font-mono text-xs tabular-nums text-fg">{formatClock(s.dwell)}</span>
                  {isHigh(s.dwell) && (
                    <span className="col-start-2 font-mono text-nano uppercase tracking-[0.14em] text-ember">High interest</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <Retention deck={deck} highlighted={highlighted} />

        <p className="mt-5 flex gap-2.5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ember" aria-hidden />
          {deck.insight}
        </p>
      </div>
    </div>
  );
}

function Retention({ deck, highlighted }: { deck: Deck; highlighted: SlideKey }) {
  const w = 280;
  const h = 64;
  const padX = 6;
  const padY = 8;
  const n = deck.slides.length;
  const x = (i: number) => padX + (i / (n - 1)) * (w - padX * 2);
  const y = (v: number) => padY + (1 - (v - 40) / 60) * (h - padY * 2);
  const last = deck.slides[n - 1];
  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow text-subtle">Retention</p>
        <p className="text-xs text-subtle">
          <span className="text-fg">{last.retention}%</span> reach {last.label}
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-auto w-full" role="img" aria-label={`Retention falls from 100% on the first slide to ${last.retention}% on the last`}>
        <line x1={padX} x2={w - padX} y1={y(40)} y2={y(40)} stroke="rgb(255 255 255 / 0.06)" />
        <polyline
          points={deck.slides.map((s, i) => `${x(i)},${y(s.retention)}`).join(" ")}
          fill="none"
          stroke="rgb(255 255 255 / 0.55)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {deck.slides.map((s, i) => (
          <circle
            key={s.key}
            cx={x(i)}
            cy={y(s.retention)}
            r={s.key === highlighted ? 4 : 2.5}
            fill={s.key === highlighted ? "var(--color-ember)" : "var(--color-fg)"}
            stroke="var(--color-canvas)"
            strokeWidth={2}
            style={{ transition: "r 0.25s" }}
          />
        ))}
      </svg>
    </div>
  );
}

function QuestionCard({
  question,
  slideLabel,
  onJump,
  isOnSlide,
}: {
  question: DeckQuestion;
  slideLabel: string;
  onJump: () => void;
  isOnSlide: boolean;
}) {
  const [state, setState] = useState<"idle" | "recording" | "sent">("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (state !== "recording") return;
    const tick = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    const done = window.setTimeout(() => setState("sent"), 3200);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [state]);

  return (
    <div className="mt-5 flex items-start gap-3.5 rounded-xl border border-line bg-white/[0.02] p-4">
      <Avatar initials={question.initials} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-subtle">
          <span className="text-fg">{question.author}</span> · {question.org} · on{" "}
          {isOnSlide ? (
            <span className="text-muted">{slideLabel}</span>
          ) : (
            <button type="button" onClick={onJump} className="text-muted underline decoration-line-strong underline-offset-2 hover:text-fg">
              {slideLabel}
            </button>
          )}{" "}
          · {question.time}
        </p>
        <p className="mt-1.5 text-[15px] leading-snug text-fg">“{question.text}”</p>
        <div className="mt-3.5 flex min-h-8 items-center gap-3">
          {state === "idle" && (
            <Button size="sm" variant="secondary" icon={<Mic className="size-3.5" />} onClick={() => setState("recording")}>
              Reply with voice note
            </Button>
          )}
          {state === "recording" && (
            <div role="status" className="flex items-center gap-3 text-xs text-muted">
              <span className="flex h-5 items-center gap-[3px]" aria-hidden>
                {Array.from({ length: 14 }, (_, i) => (
                  <motion.span
                    key={i}
                    className="w-[2px] rounded-full bg-ember"
                    animate={{ height: [4, 6 + ((i * 7) % 12), 4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </span>
              Recording · 0:{String(seconds).padStart(2, "0")}
            </div>
          )}
          {state === "sent" && (
            <p role="status" className="flex items-center gap-2 text-xs text-muted">
              <Check className="size-3.5 text-ember" aria-hidden /> Voice note pinned to {slideLabel} · 0:42
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
