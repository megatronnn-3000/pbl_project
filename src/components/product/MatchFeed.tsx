import { Activity, ArrowRight, BadgeCheck, Bookmark, Check, Handshake } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { viewer } from "../../data/investors";
import type { Startup } from "../../data/types";
import { useFinePointer } from "../../hooks/useMediaQuery";
import { formatUSD } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Meter, ScoreRing } from "../charts/ScoreRing";
import { Sparkline } from "../charts/Sparkline";
import { Button } from "../ui/Button";
import { Monogram } from "../ui/primitives";

export function MatchList({
  startups,
  selectedId,
  onSelect,
  saved,
  onToggleSave,
  selectOnHover = false,
  className,
}: {
  startups: Startup[];
  selectedId: string;
  onSelect: (id: string) => void;
  saved: Set<string>;
  onToggleSave: (id: string) => void;
  selectOnHover?: boolean;
  className?: string;
}) {
  const finePointer = useFinePointer();
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {startups.map((startup) => (
        <MatchRow
          key={startup.id}
          startup={startup}
          selected={startup.id === selectedId}
          saved={saved.has(startup.id)}
          onSelect={() => onSelect(startup.id)}
          onHover={selectOnHover && finePointer ? () => onSelect(startup.id) : undefined}
          onToggleSave={() => onToggleSave(startup.id)}
        />
      ))}
    </ul>
  );
}

function MatchRow({
  startup,
  selected,
  saved,
  onSelect,
  onHover,
  onToggleSave,
}: {
  startup: Startup;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onHover?: () => void;
  onToggleSave: () => void;
}) {
  return (
    <li
      onPointerEnter={onHover}
      className={cn(
        "group relative grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors duration-300 sm:px-5 md:grid-cols-[5rem_minmax(0,1fr)_9.5rem_4.5rem_auto] md:py-5",
        selected ? "bg-white/[0.035]" : "hover:bg-white/[0.02]",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-3 left-0 w-0.5 rounded-full bg-ember transition-opacity duration-300", selected ? "opacity-100" : "opacity-0")}
      />
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${startup.name}, ${startup.warmth}% warm. Show why it matches.`}
        className="absolute inset-0 z-0 focus-visible:outline-offset-[-2px]"
      />

      <div className="pointer-events-none relative">
        <p className="text-[1.6rem] font-medium leading-none tracking-[-0.04em] text-fg md:text-[1.85rem]">
          {startup.warmth}
          <span className="text-[0.55em] text-subtle">%</span>
        </p>
        <p className="mt-2 font-mono text-nano uppercase tracking-[0.14em] text-ember">Warm</p>
      </div>

      <div className="pointer-events-none relative flex min-w-0 items-center gap-3">
        <Monogram letter={startup.monogram} className="hidden sm:grid" />
        <div className="min-w-0">
          <p className="flex items-center gap-2">
            <span className="truncate text-[15px] font-medium text-fg">{startup.name}</span>
            {startup.track === "ecell" ? (
              <BadgeCheck className="size-3.5 shrink-0 text-ember" aria-label="E-Cell verified" />
            ) : (
              <Activity className="size-3.5 shrink-0 text-muted" aria-label="Open builder, telemetry verified" />
            )}
          </p>
          <p className="mt-0.5 truncate text-xs text-subtle">
            {startup.industry} · {startup.stage} · {startup.city}
          </p>
        </div>
      </div>

      <div className="pointer-events-none relative hidden min-w-0 md:block">
        <p className="truncate text-sm text-fg">
          <span className="font-medium">{startup.highlight.value}</span>{" "}
          <span className="text-muted">{startup.highlight.label.split(",")[0]}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-subtle">
          {startup.sharedConnections} shared connection{startup.sharedConnections === 1 ? "" : "s"}
        </p>
      </div>

      <Sparkline values={startup.telemetry.wauSeries} width={68} height={26} className="pointer-events-none relative hidden text-subtle md:block" />

      <div className="relative z-10 flex items-center">
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${startup.name} from saved` : `Save ${startup.name}`}
          className="grid size-9 place-items-center rounded-full text-subtle transition-colors hover:bg-white/5 hover:text-fg"
        >
          <Bookmark className={cn("size-4 transition-colors", saved && "fill-ember text-ember")} />
        </button>
        <Link
          to={`/startup/${startup.id}`}
          aria-label={`Open ${startup.name} profile`}
          className="grid size-9 place-items-center rounded-full text-subtle transition-colors hover:bg-white/5 hover:text-fg"
        >
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <p className="pointer-events-none relative col-span-3 pl-[5.25rem] text-xs text-subtle sm:pl-[5.5rem] md:hidden">
        <span className="text-fg">{startup.highlight.value}</span> {startup.highlight.label.split(",")[0]} · {startup.sharedConnections} shared
      </p>
    </li>
  );
}

export function MatchDetail({
  startup,
  showProfileLink = true,
  className,
}: {
  startup: Startup;
  showProfileLink?: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={startup.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={className}
      >
        <MatchDetailBody startup={startup} showProfileLink={showProfileLink} />
      </motion.div>
    </AnimatePresence>
  );
}

function MatchDetailBody({ startup, showProfileLink }: { startup: Startup; showProfileLink: boolean }) {
  const [requested, setRequested] = useState(false);
  const contact = startup.warmthFactors[0].nodes[0];

  return (
    <div>
      <p className="eyebrow text-subtle">Why {startup.name} matches you</p>

      <div className="mt-5 flex items-center gap-4">
        <ScoreRing value={startup.signal} size={58} stroke={3} label={`Ignite signal score ${startup.signal} of 100`}>
          <span className="text-lg font-medium tracking-tight text-fg">{startup.signal}</span>
        </ScoreRing>
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg">Ignite signal score</p>
          <p className="mt-0.5 text-xs text-subtle">
            Trust {startup.scores.trust} · Traction {startup.scores.traction} · Velocity {startup.scores.velocity}
          </p>
        </div>
      </div>

      <p className="eyebrow mt-7 text-subtle">Warm path · {startup.warmth}%</p>
      <ol className="relative mt-4 space-y-3.5 pl-5">
        <span aria-hidden className="absolute bottom-2 left-[3px] top-2 w-px bg-gradient-to-b from-ember via-ember/40 to-line-strong" />
        {[
          { name: `You · ${viewer.firm}`, role: viewer.role, ember: true },
          { name: contact, role: startup.warmthFactors[0].detail.replace(/^\d+ /, "") },
          { name: startup.team[0].name, role: `${startup.team[0].role}, ${startup.name}` },
        ].map((step) => (
          <li key={step.name} className="relative">
            <span
              aria-hidden
              className={cn("absolute -left-5 top-1.5 size-[7px] rounded-full ring-2 ring-surface", step.ember ? "bg-ember" : "bg-fg/70")}
            />
            <p className="text-sm text-fg">{step.name}</p>
            <p className="text-xs text-subtle">{step.role}</p>
          </li>
        ))}
      </ol>

      <ul className="mt-7 space-y-2.5">
        {startup.matchReasons.map((reason) => (
          <li key={reason} className="flex gap-2.5 text-sm leading-snug text-muted">
            <Check className="mt-0.5 size-3.5 shrink-0 text-ember" aria-hidden />
            {reason}
          </li>
        ))}
      </ul>

      <div className="mt-7 rounded-xl border border-line p-4">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-fg">Raising {formatUSD(startup.raising.amount)}</span>
          <span className="truncate text-xs text-subtle">{startup.raising.instrument}</span>
        </div>
        <Meter value={startup.raising.committed} className="mt-3" />
        <p className="mt-2 text-xs text-subtle">
          {startup.raising.committed}% committed · {formatUSD(startup.raising.cap)} cap
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {requested ? (
          <p role="status" className="flex h-8 items-center gap-2 rounded-full bg-ember/10 px-3.5 text-[13px] text-ember-bright ring-1 ring-inset ring-ember/25">
            <Check className="size-3.5" aria-hidden /> Intro requested via {contact.split(" ")[0]}
          </p>
        ) : (
          <Button size="sm" onClick={() => setRequested(true)} icon={<Handshake className="size-3.5" />}>
            Request warm intro
          </Button>
        )}
        {showProfileLink ? (
          <Button size="sm" variant="secondary" to={`/startup/${startup.id}`}>
            Full profile
          </Button>
        ) : (
          <Button size="sm" variant="secondary" to={`/pitch/${startup.id}`}>
            Pitch deck
          </Button>
        )}
      </div>
    </div>
  );
}
