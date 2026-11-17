import { Activity, ArrowRight, BadgeCheck, List, Waypoints, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { LogoMark } from "../components/brand/Logo";
import { ScoreRing } from "../components/charts/ScoreRing";
import { Sparkline } from "../components/charts/Sparkline";
import { FilterMenu, type FilterOption } from "../components/product/FilterMenu";
import { WarmthMap } from "../components/product/WarmthMap";
import { Button } from "../components/ui/Button";
import { Eyebrow, Monogram } from "../components/ui/primitives";
import { Segmented } from "../components/ui/Segmented";
import { viewer } from "../data/investors";
import { startups } from "../data/startups";
import type { Startup } from "../data/types";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

type FilterKey = "track" | "stage" | "industry" | "university" | "traction" | "warmth";
type Filters = Record<FilterKey, string[]>;

const EMPTY: Filters = { track: [], stage: [], industry: [], university: [], traction: [], warmth: ["0"] };

const TRACTION: (FilterOption & { test: (s: Startup) => boolean })[] = [
  { value: "revenue", label: "MRR above ₹2L", test: (s) => s.telemetry.mrr >= 200_000 },
  { value: "growth", label: "WAU growth above 30%", test: (s) => s.telemetry.wauGrowth >= 30 },
  { value: "shipping", label: "Ships every week", test: (s) => s.telemetry.deployments >= 12 },
];

const countBy = (test: (s: Startup) => boolean) => startups.filter(test).length;
const unique = (values: (string | undefined)[]) => [...new Set(values.filter((v): v is string => Boolean(v)))];

const OPTIONS: Record<FilterKey, FilterOption[]> = {
  track: [
    { value: "ecell", label: "E-Cell Vetted", count: countBy((s) => s.track === "ecell") },
    { value: "builder", label: "Open Builder", count: countBy((s) => s.track === "builder") },
  ],
  stage: unique(startups.map((s) => s.stage)).map((stage) => ({ value: stage, label: stage, count: countBy((s) => s.stage === stage) })),
  industry: unique(startups.map((s) => s.industry)).map((industry) => ({ value: industry, label: industry, count: countBy((s) => s.industry === industry) })),
  university: unique(startups.map((s) => s.institution)).map((u) => ({ value: u, label: u, count: countBy((s) => s.institution === u) })),
  traction: TRACTION.map(({ value, label, test }) => ({ value, label, count: countBy(test) })),
  warmth: [
    { value: "0", label: "Any warmth" },
    { value: "50", label: "50% or warmer", count: countBy((s) => s.warmth >= 50) },
    { value: "70", label: "70% or warmer", count: countBy((s) => s.warmth >= 70) },
    { value: "85", label: "85% or warmer", count: countBy((s) => s.warmth >= 85) },
  ],
};

const LABELS: Record<FilterKey, string> = {
  track: "Track",
  stage: "Stage",
  industry: "Industry",
  university: "University",
  traction: "Traction",
  warmth: "Warmth",
};

function applyFilters(list: Startup[], f: Filters) {
  return list.filter(
    (s) =>
      (!f.track.length || f.track.includes(s.track)) &&
      (!f.stage.length || f.stage.includes(s.stage)) &&
      (!f.industry.length || f.industry.includes(s.industry)) &&
      (!f.university.length || (s.institution !== undefined && f.university.includes(s.institution))) &&
      f.traction.every((key) => TRACTION.find((t) => t.value === key)?.test(s) ?? true) &&
      s.warmth >= Number(f.warmth[0] ?? 0),
  );
}

export default function Explore() {
  useDocumentTitle("Explore high-signal startups — Ignite");
  const [view, setView] = useState<"discover" | "map">("discover");
  const [sort, setSort] = useState<"warmth" | "signal">("warmth");
  const [filters, setFilters] = useState<Filters>(EMPTY);

  const results = useMemo(
    () => applyFilters(startups, filters).sort((a, b) => (sort === "warmth" ? b.warmth - a.warmth : b.signal - a.signal)),
    [filters, sort],
  );

  const activeChips = (Object.keys(filters) as FilterKey[]).flatMap((key): { key: FilterKey; value: string; label: string }[] =>
    key === "warmth"
      ? filters.warmth[0] !== "0"
        ? [{ key, value: filters.warmth[0], label: `≥ ${filters.warmth[0]}% warm` }]
        : []
      : filters[key].map((value) => ({ key, value, label: OPTIONS[key].find((o) => o.value === value)?.label ?? value })),
  );

  const removeChip = (key: FilterKey, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: key === "warmth" ? ["0"] : prev[key].filter((v) => v !== value) }));

  return (
    <div className="container-page pb-28 pt-12 lg:pt-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow live>Explore high-signal startups</Eyebrow>
          <h1 className="mt-6 text-headline font-medium text-fg">
            312 verified. <span className="text-subtle">{results.length === 1 ? "1 worth a look." : `${results.length} worth a look.`}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Every startup here has cleared institutional verification or live telemetry — ranked for {viewer.firm}'s thesis.
          </p>
        </div>
        <Segmented
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: "discover", label: "Discover", icon: <List className="size-3.5" aria-hidden /> },
            { value: "map", label: "Map", icon: <Waypoints className="size-3.5" aria-hidden /> },
          ]}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2 border-y border-line py-3">
        {(Object.keys(OPTIONS) as FilterKey[]).map((key) => (
          <FilterMenu
            key={key}
            label={LABELS[key]}
            options={OPTIONS[key]}
            selected={filters[key]}
            single={key === "warmth"}
            isActive={key === "warmth" ? filters.warmth[0] !== "0" : undefined}
            onChange={(next) => setFilters((prev) => ({ ...prev, [key]: next }))}
          />
        ))}
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden font-mono text-nano uppercase tracking-[0.14em] text-subtle sm:inline">Sort</span>
          <Segmented
            label="Sort by"
            value={sort}
            onChange={setSort}
            options={[
              { value: "warmth", label: "Warmth" },
              { value: "signal", label: "Signal" },
            ]}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {activeChips.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.key}-${chip.value}`}
                  type="button"
                  onClick={() => removeChip(chip.key, chip.value)}
                  aria-label={`Remove filter ${chip.label}`}
                  className="flex h-7 items-center gap-1.5 rounded-full bg-white/[0.05] pl-3 pr-2 text-xs text-muted transition-colors hover:bg-white/[0.08] hover:text-fg"
                >
                  {chip.label}
                  <X className="size-3" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={() => setFilters(EMPTY)} className="px-2 text-xs text-subtle underline-offset-4 hover:text-fg hover:underline">
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        {results.length === 0 ? (
          <div className="grid place-items-center py-28 text-center">
            <LogoMark className="size-9 text-faint" />
            <p className="mt-7 text-lg text-fg">No signal matches these filters.</p>
            <p className="mt-2 text-sm text-subtle">Widen the warmth range or drop a traction requirement.</p>
            <Button className="mt-7" variant="secondary" onClick={() => setFilters(EMPTY)}>
              Reset filters
            </Button>
          </div>
        ) : view === "discover" ? (
          <DiscoverList results={results} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel px-3 py-10 sm:px-8">
            <WarmthMap startups={results} />
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-nano uppercase tracking-[0.14em] text-subtle">
              <li>Closer to centre = warmer</li>
              <li>Larger node = higher signal</li>
              <li>Ringed = E-Cell verified</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DiscoverList({ results }: { results: Startup[] }) {
  return (
    <div>
      <div className="hidden grid-cols-[4.5rem_minmax(0,2.3fr)_minmax(0,1.25fr)_minmax(0,1.3fr)_3.5rem_1.25rem] gap-x-5 px-4 pb-3 font-mono text-nano uppercase tracking-[0.14em] text-subtle lg:grid">
        <span>Warmth</span>
        <span>Startup</span>
        <span>Verification</span>
        <span>Traction</span>
        <span>Signal</span>
        <span className="sr-only">Open</span>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((startup, i) => (
            <motion.li
              key={startup.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
            >
              <DiscoverRow startup={startup} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function DiscoverRow({ startup }: { startup: Startup }) {
  const verified = startup.track === "ecell";
  return (
    <Link
      to={`/startup/${startup.id}`}
      className="group grid grid-cols-[3.75rem_minmax(0,1fr)_1.25rem] items-center gap-x-4 gap-y-3 px-2 py-5 transition-colors duration-300 hover:bg-white/[0.02] focus-visible:outline-offset-[-2px] sm:px-4 lg:grid-cols-[4.5rem_minmax(0,2.3fr)_minmax(0,1.25fr)_minmax(0,1.3fr)_3.5rem_1.25rem] lg:gap-x-5"
    >
      <div>
        <p className="text-[1.65rem] font-medium leading-none tracking-[-0.04em] text-fg lg:text-[1.9rem]">
          {startup.warmth}
          <span className="text-[0.55em] text-subtle">%</span>
        </p>
        <p className="mt-2 font-mono text-nano uppercase tracking-[0.14em] text-ember">Warm</p>
      </div>

      <div className="flex min-w-0 items-center gap-3.5">
        <Monogram letter={startup.monogram} className="hidden sm:grid" />
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-fg">{startup.name}</p>
          <p className="truncate text-sm text-muted">{startup.tagline}</p>
          <p className="mt-0.5 truncate text-xs text-subtle">
            {startup.industry} · {startup.stage} · {startup.city}
          </p>
        </div>
      </div>

      <div className="hidden min-w-0 lg:block">
        <p className="flex items-center gap-1.5 text-sm text-fg">
          {verified ? <BadgeCheck className="size-3.5 text-ember" aria-hidden /> : <Activity className="size-3.5 text-ember" aria-hidden />}
          {verified ? "E-Cell Verified" : "Open Builder"}
        </p>
        <p className="mt-0.5 truncate text-xs text-subtle">{verified ? `${startup.ecell?.name} · rank #${startup.ecell?.rank}` : "Telemetry verified at source"}</p>
      </div>

      <div className="hidden min-w-0 items-center gap-4 lg:flex">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg">{startup.highlight.value}</p>
          <p className="truncate text-xs text-subtle">{startup.highlight.label}</p>
        </div>
        <Sparkline values={startup.telemetry.wauSeries} width={64} height={24} className="shrink-0 text-subtle" />
      </div>

      <div className="hidden lg:block">
        <ScoreRing value={startup.signal} size={40} stroke={2.5} label={`Signal score ${startup.signal}`}>
          <span className="text-[13px] font-medium tabular-nums text-fg">{startup.signal}</span>
        </ScoreRing>
      </div>

      <ArrowRight className="size-4 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />

      <div className="col-span-3 flex flex-wrap gap-x-4 gap-y-1 pl-[4.75rem] text-xs text-subtle sm:pl-[8.25rem] lg:hidden">
        <span className="flex items-center gap-1 text-muted">
          {verified ? <BadgeCheck className="size-3 text-ember" aria-hidden /> : <Activity className="size-3 text-ember" aria-hidden />}
          {verified ? "E-Cell Verified" : "Open Builder"}
        </span>
        <span>
          <span className="text-fg">{startup.highlight.value}</span> {startup.highlight.label.split(",")[0]}
        </span>
        <span>Signal {startup.signal}</span>
      </div>
    </Link>
  );
}
