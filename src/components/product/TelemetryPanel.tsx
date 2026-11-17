import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import type { Startup } from "../../data/types";
import { useInterval } from "../../hooks/useInterval";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { formatINR, formatInt, formatSigned } from "../../lib/format";
import { cn } from "../../lib/utils";
import { AreaChart } from "../charts/AreaChart";
import { ContributionGrid, LevelLegend } from "../charts/ContributionGrid";
import { ScoreRing } from "../charts/ScoreRing";
import { Sparkline } from "../charts/Sparkline";
import { Counter } from "../ui/Counter";
import { DemoBadge, LiveDot, Monogram, TrackBadge } from "../ui/primitives";

interface FeedEvent {
  id: number;
  source: string;
  text: string;
  at: number;
  commits?: number;
  deploys?: number;
}

const PR_TITLES = ["GPU autoscaling for batch jobs", "Cold-start cache for agents", "Per-team usage alerts", "Streaming logs in the CLI", "Faster model registry sync"];

const TEMPLATES: ((n: number) => Omit<FeedEvent, "id" | "at">)[] = [
  (n) => ({ source: "GitHub", text: `PR #${313 + n} merged · ${PR_TITLES[n % PR_TITLES.length]}`, commits: 2 }),
  (n) => ({ source: "Deploys", text: `Deploy #${48 + n} promoted to production`, deploys: 1 }),
  (n) => ({ source: "Analytics", text: `${3 + (n % 4)} new teams active this hour` }),
  (n) => ({ source: "GitHub", text: `${2 + (n % 3)} commits pushed to main`, commits: 3 }),
  () => ({ source: "Billing", text: "Workspace upgraded to Team plan" }),
];

const SOURCES = [
  { name: "GitHub", detail: "Commits, pull requests, contributors" },
  { name: "Deploy hooks", detail: "Production deployments" },
  { name: "Product analytics", detail: "Weekly active users" },
  { name: "Billing", detail: "MRR, privacy-shielded" },
];

const WEEK_END = new Date(2026, 8, 7);
const weekLabels = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const date = new Date(WEEK_END);
    date.setDate(date.getDate() - (count - 1 - i) * 7);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

const compact = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : String(Math.round(v)));

let eventId = 0;

function seedEvents(startup: Startup, now: number): FeedEvent[] {
  const m = 60_000;
  return [
    { id: eventId++, source: "Deploys", text: `Deploy #${startup.telemetry.deployments} promoted to production`, at: now - 2 * m },
    { id: eventId++, source: "GitHub", text: `PR #312 merged · ${PR_TITLES[1]}`, at: now - 6 * m },
    { id: eventId++, source: "Analytics", text: `WAU crossed ${formatInt(Math.floor(startup.telemetry.wau / 100) * 100)}`, at: now - 11 * m },
    { id: eventId++, source: "Billing", text: "2 workspaces upgraded to Team plan", at: now - 18 * m },
    { id: eventId++, source: "Community", text: "Endorsed by a verified maintainer", at: now - 26 * m },
  ];
}

export function TelemetryPanel({ startup, className, header = true }: { startup: Startup; className?: string; header?: boolean }) {
  const t = startup.telemetry;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });
  const reduced = useReducedMotionPref();
  const [commits, setCommits] = useState(t.commits);
  const [deploys, setDeploys] = useState(t.deployments);
  const [pulses, setPulses] = useState({ commits: 0, deploys: 0 });
  const [events, setEvents] = useState(() => seedEvents(startup, Date.now()));
  const tick = useRef(0);

  useInterval(
    () => {
      const n = tick.current++;
      const next = TEMPLATES[n % TEMPLATES.length](n);
      setEvents((prev) => [{ id: eventId++, at: Date.now(), ...next }, ...prev].slice(0, 5));
      if (next.commits) {
        setCommits((c) => c + next.commits!);
        setPulses((p) => ({ ...p, commits: p.commits + 1 }));
      }
      if (next.deploys) {
        setDeploys((d) => d + next.deploys!);
        setPulses((p) => ({ ...p, deploys: p.deploys + 1 }));
      }
    },
    inView && !reduced ? 3400 : null,
  );

  const valueClass = "text-[1.7rem] font-medium leading-none tracking-[-0.035em] text-fg";

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-line-strong bg-surface shadow-[0_60px_140px_-60px_rgb(0_0_0/0.95),inset_0_1px_0_rgb(255_255_255/0.04)]",
        className,
      )}
    >
      {header && (
        <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <Monogram letter={startup.monogram} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3 className="text-lg font-semibold tracking-[0.02em] text-fg">{startup.name}</h3>
                <TrackBadge track={startup.track} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {startup.tagline} <span className="text-subtle">· {startup.stage} · {startup.city}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 font-mono text-micro uppercase tracking-[0.14em] text-fg">
              <LiveDot /> Live
            </span>
            <DemoBadge />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="GitHub" pulse={pulses.commits} sub={`commits · +${t.commitsThisWeek} this wk`} spark={t.commitSeries}>
          <Counter value={commits} className={valueClass} />
        </Tile>
        <Tile label="Deployments" pulse={pulses.deploys} sub="this month" spark={t.deploySeries}>
          <Counter value={deploys} className={valueClass} />
        </Tile>
        <Tile
          label="Contributors"
          sub={`${t.pullRequests} PRs merged · 90d`}
          aside={
            <span className="flex -space-x-1.5" aria-hidden>
              {startup.team.slice(0, 3).map((member) => (
                <span
                  key={member.initials}
                  className="grid size-6 place-items-center rounded-full bg-raised text-[9px] font-medium text-muted ring-2 ring-surface"
                >
                  {member.initials}
                </span>
              ))}
              {t.contributors > 3 && (
                <span className="grid size-6 place-items-center rounded-full bg-overlay text-[9px] text-subtle ring-2 ring-surface">
                  +{t.contributors - 3}
                </span>
              )}
            </span>
          }
        >
          <Counter value={t.contributors} className={valueClass} />
        </Tile>
        <Tile label="WAU" sub={`${formatInt(t.wau)} weekly users`} spark={t.wauSeries}>
          <Counter value={t.wauGrowth} format={(v) => formatSigned(Math.round(v))} className={valueClass} />
        </Tile>
        <Tile label="MRR" sub={`${formatSigned(t.mrrGrowth)} month on month`} spark={t.mrrSeries}>
          <Counter value={t.mrr} format={formatINR} className={valueClass} />
        </Tile>
        <Tile
          label="Velocity"
          sub="build velocity score"
          aside={<ScoreRing value={t.velocity} size={34} stroke={2.5} label={`Velocity ${t.velocity} of 100`} />}
        >
          <span className={valueClass}>
            <Counter value={t.velocity} />
            <span className="text-base text-subtle">/100</span>
          </span>
        </Tile>
      </div>

      <div className="grid border-t border-line lg:grid-cols-[1.45fr_1fr]">
        <div className="border-b border-line p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow text-subtle">Weekly active users</p>
            <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">12 weeks</p>
          </div>
          <AreaChart
            className="mt-5"
            values={t.wauSeries}
            labels={weekLabels(12)}
            format={(v) => `${formatInt(v)} users`}
            tickFormat={compact}
            height={200}
            title={`${startup.name} weekly active users, last 12 weeks`}
          />
          <div className="mt-9 flex flex-wrap items-baseline justify-between gap-3">
            <p className="eyebrow text-subtle">Commit activity · 26 weeks</p>
            <LevelLegend />
          </div>
          <ContributionGrid className="mt-4" values={t.contributions} />
        </div>

        <div className="flex flex-col p-5 sm:p-6 lg:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow text-subtle">Live activity</p>
            <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">Simulated stream</p>
          </div>
          <ActivityLog events={events} active={inView && !reduced} />
          <div className="mt-auto pt-6">
            <p className="eyebrow text-subtle">Verified sources</p>
            <ul className="mt-3 divide-y divide-line">
              {SOURCES.map((source) => (
                <li key={source.name} className="flex items-center gap-3 py-2.5">
                  <span aria-hidden className="size-1.5 rounded-full bg-ember" />
                  <span className="text-sm text-fg">{source.name}</span>
                  <span className="ml-auto truncate text-xs text-subtle">{source.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  sub,
  spark,
  aside,
  pulse = 0,
  children,
}: {
  label: string;
  sub: string;
  spark?: number[];
  aside?: ReactNode;
  pulse?: number;
  children: ReactNode;
}) {
  return (
    <div className="relative bg-surface p-5 lg:p-6">
      <motion.span
        key={pulse}
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-ember"
        initial={{ opacity: pulse ? 1 : 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      <p className="eyebrow text-subtle">{label}</p>
      <div className="mt-4 flex min-h-9 items-end justify-between gap-2">
        <div className="min-w-0">{children}</div>
        {spark && <Sparkline values={spark} width={56} height={24} className="mb-0.5 hidden shrink-0 text-subtle sm:block" />}
        {aside}
      </div>
      <p className="mt-2.5 truncate text-xs text-subtle">{sub}</p>
    </div>
  );
}

function ActivityLog({ events, active }: { events: FeedEvent[]; active: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), active ? 1000 : null);

  const ago = (at: number) => {
    const s = Math.max(0, Math.floor((Math.max(now, at) - at) / 1000));
    if (s < 5) return "now";
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m`;
  };

  return (
    <ol aria-label="Recent activity" className="mt-4 min-h-[17.5rem]">
      <AnimatePresence initial={false}>
        {events.map((event, i) => (
          <motion.li
            key={event.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 border-b border-line py-3 last:border-b-0"
          >
            <span aria-hidden className={cn("mt-[7px] size-1.5 shrink-0 rounded-full transition-colors duration-1000", i === 0 && active ? "bg-ember" : "bg-faint")} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-fg">{event.text}</p>
              <p className="mt-0.5 font-mono text-nano uppercase tracking-[0.12em] text-subtle">{event.source}</p>
            </div>
            <time className="shrink-0 font-mono text-nano tabular-nums text-subtle">{ago(event.at)}</time>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
