import { ArrowRight, Check, Circle, CornerDownLeft, LoaderCircle, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { copilotSteps, defaultQuery, querySuggestions } from "../../data/copilot";
import { copilotInvestorMatches, investorById } from "../../data/investors";
import type { InvestorMatch } from "../../data/types";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { formatUSD } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

type Phase = "idle" | "typing" | "thinking" | "results";

const RESULT_SETS: Record<"default" | "climate" | "campus", { count: number; matches: InvestorMatch[] }> = {
  default: { count: 12, matches: copilotInvestorMatches },
  climate: {
    count: 7,
    matches: [
      { investorId: "meridian", warmth: 91, overlap: 95, reason: "Climate & agritech thesis", path: "via DTU network", sharedNodes: 3 },
      { investorId: "banyan", warmth: 74, overlap: 70, reason: "Backs campus founders", path: "1 warm introduction", sharedNodes: 1 },
      { investorId: "kestrel", warmth: 66, overlap: 61, reason: "Infra for regulated markets", path: "1 shared event", sharedNodes: 1 },
      { investorId: "tidewater", warmth: 58, overlap: 55, reason: "Rural fintech adjacency", path: "2 shared contacts", sharedNodes: 2 },
    ],
  },
  campus: {
    count: 9,
    matches: [
      { investorId: "banyan", warmth: 94, overlap: 96, reason: "Backs first-time campus founders", path: "E-Cell KIT alumni", sharedNodes: 3 },
      { investorId: "arjun", warmth: 88, overlap: 90, reason: "AI tooling built in India", path: "via Vikram Menon", sharedNodes: 2 },
      { investorId: "northstar", warmth: 81, overlap: 84, reason: "Bottoms-up developer adoption", path: "1 warm introduction", sharedNodes: 1 },
      { investorId: "kestrel", warmth: 72, overlap: 75, reason: "Technical founders", path: "2 shared events", sharedNodes: 2 },
    ],
  },
};

const pickResults = (query: string) =>
  /climate|agri|energy/i.test(query) ? RESULT_SETS.climate : /campus|e-cell|\bkit\b|first-time|angel/i.test(query) ? RESULT_SETS.campus : RESULT_SETS.default;

function parseEntities(query: string): [string, string][] {
  const out: [string, string][] = [];
  const sector = /climate|agri|energy/i.test(query)
    ? "Climate"
    : /developer|dev infra|infrastructure/i.test(query)
      ? "Developer infrastructure"
      : /\bai\b/i.test(query)
        ? "AI tooling"
        : /fintech/i.test(query)
          ? "Fintech"
          : null;
  if (sector) out.push(["Sector", sector]);
  const stage = /pre-?seed/i.test(query) ? "Pre-Seed" : /\bseed\b/i.test(query) ? "Seed" : null;
  if (stage) out.push(["Stage", stage]);
  const check = query.match(/\$\s?(\d+(?:\.\d+)?)\s?([km])\+?(?:\s?[–-]\s?\$?\s?(\d+(?:\.\d+)?)\s?([km]))?/i);
  if (check) {
    out.push(["Check", check[3] ? `$${check[1]}${check[2].toUpperCase()}–$${check[3]}${check[4].toUpperCase()}` : `$${check[1]}${check[2].toUpperCase()}+`]);
  }
  if (/campus|e-cell|\bkit\b|first-time/i.test(query)) out.push(["Network", "Campus founders"]);
  return out;
}

export function CopilotConsole({
  autoRun = false,
  initialQuery,
  className,
}: {
  autoRun?: boolean;
  initialQuery?: string;
  className?: string;
}) {
  const reduced = useReducedMotionPref();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -25% 0px" });
  const inputId = useId();
  const [query, setQuery] = useState(autoRun ? "" : initialQuery ?? defaultQuery);
  const [submitted, setSubmitted] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);

  const run = useCallback(
    (text: string) => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
      setSubmitted(text);
      setPhase("thinking");
      setStep(0);
      const beat = reduced ? 0 : 620;
      copilotSteps.forEach((_, i) => timers.current.push(window.setTimeout(() => setStep(i + 1), beat * (i + 1))));
      timers.current.push(window.setTimeout(() => setPhase("results"), beat * (copilotSteps.length + 0.6)));
    },
    [reduced],
  );

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  useEffect(() => {
    if (!autoRun || !inView) return;
    if (reduced) {
      setQuery(defaultQuery);
      run(defaultQuery);
      return;
    }
    setPhase("typing");
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setQuery(defaultQuery.slice(0, i));
      if (i >= defaultQuery.length) {
        window.clearInterval(id);
        run(defaultQuery);
      }
    }, 26);
    return () => window.clearInterval(id);
  }, [autoRun, inView, reduced, run]);

  useEffect(() => {
    // Deep links like /copilot?q=… run once on arrival.
    if (!autoRun && initialQuery) run(initialQuery);
  }, []);

  const busy = phase === "typing" || phase === "thinking";
  const entities = parseEntities(submitted);
  const results = pickResults(submitted);

  return (
    <div ref={ref} className={cn("window flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="eyebrow flex items-center gap-2 text-fg">
          <Sparkles className="size-3.5 text-ember" aria-hidden /> Ignite Copilot
        </p>
        <span className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">Investor matchmaking</span>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (query.trim() && !busy) run(query.trim());
        }}
        className="px-5 pt-5"
      >
        <label htmlFor={inputId} className="sr-only">
          Describe the investors you are looking for
        </label>
        <textarea
          id={inputId}
          rows={3}
          value={query}
          readOnly={phase === "typing"}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (query.trim() && !busy) run(query.trim());
            }
          }}
          placeholder="Describe the investors you're looking for…"
          className="w-full resize-none bg-transparent text-lg leading-relaxed tracking-[-0.01em] text-fg placeholder:text-subtle focus:outline-none sm:text-xl"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3.5">
          <div className="flex min-h-6 flex-wrap gap-1.5">
            <AnimatePresence>
              {phase !== "idle" &&
                phase !== "typing" &&
                entities.map(([key, value], i) => (
                  <motion.span
                    key={`${submitted}-${key}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="inline-flex h-6 items-center gap-1.5 rounded-md bg-white/[0.05] px-2 text-xs text-muted"
                  >
                    <span className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">{key}</span>
                    {value}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>
          <Button type="submit" size="sm" disabled={busy || !query.trim()} icon={<CornerDownLeft className="size-3.5" />}>
            Search
          </Button>
        </div>
      </form>

      <div aria-live="polite" className="min-h-[21.5rem] flex-1 border-t border-line px-5 py-5">
        {(phase === "idle" || phase === "typing") && (
          <div>
            <p className="eyebrow text-subtle">Try</p>
            <ul className="mt-3 space-y-1">
              {querySuggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setQuery(suggestion);
                      run(suggestion);
                    }}
                    className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-white/[0.03] hover:text-fg disabled:opacity-50"
                  >
                    {suggestion}
                    <ArrowRight className="size-3.5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-muted" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {phase === "thinking" && (
          <ol className="space-y-3.5 pt-1">
            {copilotSteps.map((label, i) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                {step > i ? (
                  <Check className="size-4 text-ember" aria-hidden />
                ) : step === i ? (
                  <LoaderCircle className="size-4 animate-spin text-muted" aria-hidden />
                ) : (
                  <Circle className="size-4 text-faint" aria-hidden />
                )}
                <span className={step >= i ? "text-fg" : "text-subtle"}>{label}</span>
              </li>
            ))}
          </ol>
        )}

        {phase === "results" && (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow text-fg">
                <span className="text-ember">{results.count}</span> high-signal matches
              </p>
              <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">Ranked by warmth</p>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {results.matches.map((match, i) => {
                const investor = investorById(match.investorId)!;
                return (
                  <motion.li
                    key={`${submitted}-${match.investorId}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 py-3.5"
                  >
                    <span className="text-xl font-medium tabular-nums tracking-tight text-fg">
                      {match.warmth}
                      <span className="text-xs text-subtle">%</span>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-fg">{investor.name}</p>
                      <p className="truncate text-xs text-subtle">
                        {match.reason} · {match.sharedNodes} shared node{match.sharedNodes === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-muted">
                        {formatUSD(investor.checkMin)}–{formatUSD(investor.checkMax)}
                      </p>
                      <p className="text-xs text-subtle">{match.path}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
