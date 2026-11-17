import { Check, Circle, Eye, FileText, Lock, Send, ShieldCheck, Signature } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { activity, capTableHolders, dataRoomFiles, deal, participants, qaThreads } from "../../data/dealroom";
import { startupById } from "../../data/startups";
import { formatInt, formatUSD } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Meter } from "../charts/ScoreRing";
import { Button } from "../ui/Button";
import { Avatar, Chip, LiveDot, Monogram } from "../ui/primitives";
import { Segmented } from "../ui/Segmented";
import { WindowChrome } from "./WindowChrome";

type Tab = "overview" | "data" | "cap" | "safe" | "qa" | "activity";

const TABS: [Tab, string][] = [
  ["overview", "Overview"],
  ["data", "Data Room"],
  ["cap", "Cap Table"],
  ["safe", "SAFE"],
  ["qa", "Q&A"],
  ["activity", "Activity"],
];

const PRE_TOTAL = capTableHolders.reduce((sum, h) => sum + h.shares, 0);
const FOUNDER_SHARES = capTableHolders[0].shares;
const POOL_TARGET = 0.15;

/** Opaque steps so the 2px gaps read cleanly; the new money is the one accent. */
const SEGMENT = {
  founders: { color: "#d4d4d8", ink: "#0a0a0b" },
  esop: { color: "#8b8b92", ink: "#0a0a0b" },
  angels: { color: "#4a4a51", ink: "#ededef" },
  safe: { color: "#ff6a2a", ink: "#160902" },
} as const;

/** Post-money SAFE: the investor owns invest / cap of the post-round company. */
export function modelRound(invest: number, cap: number, topUp: boolean) {
  const f = capTableHolders[0].shares / PRE_TOTAL;
  const e = capTableHolders[1].shares / PRE_TOTAL;
  const a = capTableHolders[2].shares / PRE_TOTAL;
  const safe = invest / cap;
  let founders = f * (1 - safe);
  let pool = e * (1 - safe);
  let angels = a * (1 - safe);
  if (topUp && pool < POOL_TARGET) {
    pool = POOL_TARGET;
    const remaining = 1 - safe - pool;
    founders = (f / (f + a)) * remaining;
    angels = (a / (f + a)) * remaining;
  }
  const postTotal = FOUNDER_SHARES / founders;
  return {
    pre: { founders: f, esop: e, angels: a },
    post: { founders, esop: pool, angels, safe },
    postTotal,
    safeShares: safe * postTotal,
    poolShares: pool * postTotal,
    price: cap / postTotal,
    dilution: (f - founders) * 100,
  };
}

export function DealRoomPanel({
  initialTab = "cap",
  chrome = true,
  header = true,
  className,
}: {
  initialTab?: Tab;
  /** Show the browser-style frame used for landing-page glimpses. */
  chrome?: boolean;
  /** Show the deal summary row; pages that render their own header turn this off. */
  header?: boolean;
  className?: string;
}) {
  const uid = useId();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [invest, setInvest] = useState(deal.target);
  const [cap, setCap] = useState(deal.cap);
  const [topUp, setTopUp] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const model = useMemo(() => modelRound(invest, cap, topUp), [invest, cap, topUp]);
  const startup = startupById(deal.startupId)!;
  const signed = participants.filter((p) => p.nda !== "Pending").length;

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex(([key]) => key === tab);
    let next = i;
    if (event.key === "ArrowRight") next = (i + 1) % TABS.length;
    if (event.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    if (next !== i) {
      event.preventDefault();
      setTab(TABS[next][0]);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <div className={cn("window overflow-hidden", className)}>
      {chrome && <WindowChrome path="ignite.app/deal-room/nova-halcyon" />}

      {header && (
      <div className="flex flex-col gap-5 border-b border-line px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Monogram letter={startup.monogram} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3 className="text-lg font-semibold tracking-[0.01em] text-fg">{deal.title}</h3>
              <Chip tone="ember" icon={<ShieldCheck className="size-3.5" aria-hidden />}>
                Secure room
              </Chip>
            </div>
            <p className="mt-1 text-sm text-subtle">
              {deal.round} · {deal.instrument} · Target close {deal.closeDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-full min-w-44 sm:w-52">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-subtle">Committed</span>
              <span className="tabular-nums text-fg">
                {formatUSD(deal.committed)} <span className="text-subtle">/ {formatUSD(deal.target)}</span>
              </span>
            </div>
            <Meter value={(deal.committed / deal.target) * 100} className="mt-2" />
          </div>
          <div className="flex shrink-0 -space-x-2" aria-label={`${participants.length} participants`}>
            {participants.map((p) => (
              <Avatar key={p.initials} initials={p.initials} className="ring-2 ring-[#0f0f11]" />
            ))}
          </div>
        </div>
      </div>
      )}

      <div role="tablist" aria-label="Deal room sections" onKeyDown={onTabKey} className="no-scrollbar flex overflow-x-auto border-b border-line px-2 sm:px-4">
        {TABS.map(([key, label], i) => {
          const selected = key === tab;
          return (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${key}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(key)}
              className={cn(
                "relative h-11 shrink-0 px-3 text-[13px] transition-colors duration-300",
                selected ? "text-fg" : "text-subtle hover:text-muted",
              )}
            >
              {label}
              {selected && (
                <motion.span layoutId={`${uid}-indicator`} className="absolute inset-x-3 -bottom-px h-px bg-ember" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`} className="min-h-[28rem] p-5 sm:p-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "overview" && <Overview />}
            {tab === "data" && <DataRoom />}
            {tab === "cap" && (
              <CapTable model={model} invest={invest} cap={cap} topUp={topUp} setInvest={setInvest} setCap={setCap} setTopUp={setTopUp} />
            )}
            {tab === "safe" && <SafeTerms model={model} invest={invest} cap={cap} />}
            {tab === "qa" && <QandA />}
            {tab === "activity" && <Activity />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-5 py-3 font-mono text-nano uppercase tracking-[0.12em] text-subtle sm:px-7">
        <span className="flex items-center gap-1.5">
          <Lock className="size-3" aria-hidden /> Encrypted at rest
        </span>
        <span>Watermarked per viewer</span>
        <span>
          NDA {signed} of {participants.length} signed
        </span>
        <span className="flex items-center gap-1.5 sm:ml-auto">
          <LiveDot /> 2 in room now
        </span>
      </div>
    </div>
  );
}

type RoundModel = ReturnType<typeof modelRound>;

function CapTable({
  model,
  invest,
  cap,
  topUp,
  setInvest,
  setCap,
  setTopUp,
}: {
  model: RoundModel;
  invest: number;
  cap: number;
  topUp: boolean;
  setInvest: (v: number) => void;
  setCap: (v: number) => void;
  setTopUp: (v: boolean) => void;
}) {
  const rows = [
    { key: "founders", label: "Founders", shares: FOUNDER_SHARES, pre: model.pre.founders, post: model.post.founders },
    { key: "esop", label: "Option pool", shares: model.poolShares, pre: model.pre.esop, post: model.post.esop },
    { key: "angels", label: "Early angels", shares: capTableHolders[2].shares, pre: model.pre.angels, post: model.post.angels },
    { key: "safe", label: "New SAFE", shares: model.safeShares, pre: 0, post: model.post.safe },
  ] as const;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
      <div className="min-w-0">
        <OwnershipBar label="Today" segments={rows.filter((r) => r.pre > 0).map((r) => ({ key: r.key, pct: r.pre * 100 }))} />
        <OwnershipBar
          className="mt-6"
          label="After this round"
          segments={rows.map((r) => ({ key: r.key, pct: r.post * 100 }))}
        />
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legend">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center gap-2 text-xs text-muted">
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: SEGMENT[r.key].color }} />
              {r.label}
            </li>
          ))}
        </ul>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-sm">
            <caption className="sr-only">Fully diluted cap table before and after the round</caption>
            <thead>
              <tr className="border-b border-line text-left font-mono text-nano uppercase tracking-[0.12em] text-subtle">
                <th scope="col" className="py-2.5 font-normal">Holder</th>
                <th scope="col" className="py-2.5 text-right font-normal">Shares</th>
                <th scope="col" className="py-2.5 text-right font-normal">Today</th>
                <th scope="col" className="py-2.5 text-right font-normal">Post</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {rows.map((r) => (
                <tr key={r.key}>
                  <th scope="row" className="py-3 text-left font-normal text-fg">
                    <span className="flex items-center gap-2.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: SEGMENT[r.key].color }} />
                      {r.label}
                    </span>
                  </th>
                  <td className="py-3 text-right text-muted">{formatInt(r.shares)}</td>
                  <td className="py-3 text-right text-muted">{r.pre ? `${(r.pre * 100).toFixed(1)}%` : "—"}</td>
                  <td className="py-3 text-right text-fg">{(r.post * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white/[0.02] p-5 sm:p-6">
        <p className="eyebrow text-subtle">Model the SAFE</p>
        <div className="mt-5 space-y-6">
          <RangeField label="Investment" value={invest} min={250_000} max={1_500_000} step={25_000} format={(v) => formatUSD(v, 2)} onChange={setInvest} />
          <RangeField label="Post-money valuation cap" value={cap} min={4_000_000} max={16_000_000} step={250_000} format={(v) => formatUSD(v, 2)} onChange={setCap} />
          <button type="button" role="switch" aria-checked={topUp} onClick={() => setTopUp(!topUp)} className="flex w-full items-center justify-between gap-3 text-left">
            <span className="text-xs text-subtle">Expand option pool to 15% post-round</span>
            <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300", topUp ? "bg-ember" : "bg-white/10")}>
              <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform duration-300", topUp ? "translate-x-[18px]" : "translate-x-0.5")} />
            </span>
          </button>
        </div>
        <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-5">
          <div>
            <dt className="text-xs text-subtle">Investor ownership</dt>
            <dd className="mt-1 text-2xl font-medium tracking-tight text-fg">{(model.post.safe * 100).toFixed(2)}%</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Founder dilution</dt>
            <dd className="mt-1 text-2xl font-medium tracking-tight text-fg">−{model.dilution.toFixed(1)} pts</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Price per share</dt>
            <dd className="mt-1 text-sm tabular-nums text-muted">${model.price.toFixed(3)}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Post-round shares</dt>
            <dd className="mt-1 text-sm tabular-nums text-muted">{formatInt(model.postTotal)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function OwnershipBar({ label, segments, className }: { label: string; segments: { key: keyof typeof SEGMENT; pct: number }[]; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-subtle">{label}</p>
      <div
        className="mt-2 flex h-10 w-full overflow-hidden rounded-md"
        role="img"
        aria-label={`${label}: ${segments.map((s) => `${s.key} ${s.pct.toFixed(1)}%`).join(", ")}`}
      >
        {segments.map((segment, i) => (
          <motion.div
            key={segment.key}
            initial={false}
            animate={{ width: `${segment.pct}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full min-w-0"
            style={{ backgroundColor: SEGMENT[segment.key].color, marginRight: i < segments.length - 1 ? 2 : 0 }}
          >
            {segment.pct >= 8 && (
              <span className="absolute inset-0 flex items-center px-2.5 text-[11px] font-medium tabular-nums" style={{ color: SEGMENT[segment.key].ink }}>
                {segment.pct.toFixed(1)}%
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs text-subtle">
          {label}
        </label>
        <output htmlFor={id} className="text-sm font-medium tabular-nums text-fg">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={format(value)}
        className="range mt-2"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

function SafeTerms({ model, invest, cap }: { model: RoundModel; invest: number; cap: number }) {
  const [signed, setSigned] = useState(false);
  const seedRaise = 3_000_000;
  const seedPre = 20_000_000;
  const afterSeed = model.post.safe * (seedPre / (seedPre + seedRaise));

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <dl className="divide-y divide-line border-y border-line">
        {[
          ["Instrument", "Post-money SAFE"],
          ["Investment", formatUSD(invest, 2)],
          ["Valuation cap", formatUSD(cap, 2)],
          ["Discount", "None"],
          ["Most-favoured nation", "No"],
          ["Pro-rata side letter", "Yes · Halcyon Ventures"],
        ].map(([term, value]) => (
          <div key={term} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sm text-subtle">{term}</dt>
            <dd className="text-right text-sm tabular-nums text-fg">{value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="eyebrow text-subtle">Conversion preview</p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          If NOVA raises a <span className="text-fg">{formatUSD(seedRaise)}</span> Seed at a <span className="text-fg">{formatUSD(seedPre)}</span> pre-money
          valuation, this SAFE converts to:
        </p>
        <p className="mt-5 text-[2.75rem] font-medium leading-none tracking-[-0.045em] text-fg">{(afterSeed * 100).toFixed(2)}%</p>
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div className="h-full rounded-full bg-ember" initial={false} animate={{ width: `${Math.min(100, afterSeed * 400)}%` }} />
        </div>
        <p className="mt-2 text-xs text-subtle">Scale: 0–25% ownership · before any new option pool</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {signed ? (
            <p role="status" className="flex h-10 items-center gap-2 rounded-full bg-ember/10 px-4 text-sm text-ember-bright ring-1 ring-inset ring-ember/25">
              <Check className="size-4" aria-hidden /> Signed · countersignature requested
            </p>
          ) : (
            <Button onClick={() => setSigned(true)} icon={<Signature className="size-4" />}>
              Sign SAFE
            </Button>
          )}
          <span className="text-xs text-subtle">Demo signature — no document is created.</span>
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const steps = [
    { label: "Mutual NDA executed", detail: "3 of 4 participants", done: true },
    { label: "Deck and data room shared", detail: "7 documents, 2 access tiers", done: true },
    { label: "Partner meeting", detail: "Sep 14 · 45 min · Bengaluru", done: false },
    { label: "SAFE countersignature", detail: "Awaiting founder", done: false },
  ];
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div>
        <p className="eyebrow text-subtle">Participants</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {participants.map((p) => (
            <li key={p.name} className="flex items-center gap-3 py-3">
              <Avatar initials={p.initials} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg">{p.name}</p>
                <p className="truncate text-xs text-subtle">
                  {p.role} · {p.org}
                </p>
              </div>
              {p.commitment && <span className="text-sm tabular-nums text-muted">{formatUSD(p.commitment)}</span>}
              <span
                className={cn(
                  "w-24 shrink-0 whitespace-nowrap text-right font-mono text-nano uppercase tracking-[0.12em]",
                  p.nda === "Pending" ? "text-ember" : "text-subtle",
                )}
              >
                {p.nda === "Owner" ? "Owner" : `NDA ${p.nda.toLowerCase()}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow text-subtle">Next steps</p>
        <ol className="mt-4 space-y-4">
          {steps.map((step) => (
            <li key={step.label} className="flex gap-3">
              {step.done ? <Check className="mt-0.5 size-4 shrink-0 text-ember" aria-label="Done" /> : <Circle className="mt-0.5 size-4 shrink-0 text-faint" aria-label="Upcoming" />}
              <div>
                <p className={cn("text-sm", step.done ? "text-muted line-through decoration-faint" : "text-fg")}>{step.label}</p>
                <p className="text-xs text-subtle">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function DataRoom() {
  const [viewer, setViewer] = useState<"rhea" | "sana">("rhea");
  const hasFull = viewer === "rhea";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-md text-sm text-muted">Teaser files are open to every participant. The full room unlocks per person once their NDA is signed.</p>
        <Segmented
          label="Preview access as"
          value={viewer}
          onChange={setViewer}
          options={[
            { value: "rhea", label: "Rhea · NDA signed" },
            { value: "sana", label: "Sana · pending" },
          ]}
        />
      </div>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {dataRoomFiles.map((file) => {
          const locked = file.tier !== "Teaser" && !hasFull;
          return (
            <li key={file.name} className={cn("flex items-center gap-3 py-3 transition-opacity duration-300", locked && "opacity-60")}>
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.04] ring-1 ring-inset ring-white/5">
                {locked ? <Lock className="size-3.5 text-subtle" aria-hidden /> : <FileText className="size-3.5 text-muted" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg">{file.name}</p>
                <p className="text-xs text-subtle">
                  {file.kind} · {file.size} · {file.updated}
                </p>
              </div>
              <span className="hidden font-mono text-nano uppercase tracking-[0.12em] text-subtle sm:block">{file.tier}</span>
              <span className="flex w-24 items-center justify-end gap-1.5 text-xs text-subtle">
                {locked ? (
                  "NDA required"
                ) : (
                  <>
                    <Eye className="size-3.5" aria-hidden />
                    <span className="tabular-nums">{file.views}</span>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function QandA() {
  const [threads, setThreads] = useState(qaThreads);
  const [draft, setDraft] = useState("");
  const inputId = useId();
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setThreads((prev) => [{ question: draft.trim(), author: "Rhea Kapoor · Halcyon Ventures", status: "Open", replies: 0, time: "now" }, ...prev]);
          setDraft("");
        }}
        className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] p-1.5 pl-4"
      >
        <label htmlFor={inputId} className="sr-only">
          Ask the founders a question
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask the founders — threads stay inside this room"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-subtle focus:outline-none"
        />
        <Button type="submit" size="sm" disabled={!draft.trim()} icon={<Send className="size-3.5" />}>
          Ask
        </Button>
      </form>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        <AnimatePresence initial={false}>
          {threads.map((thread) => (
            <motion.li
              key={thread.question}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-fg">{thread.question}</p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {thread.author} · {thread.replies} {thread.replies === 1 ? "reply" : "replies"} · {thread.time}
                  </p>
                </div>
                <span className={cn("font-mono text-nano uppercase tracking-[0.12em]", thread.status === "Open" ? "text-ember" : "text-subtle")}>
                  {thread.status}
                </span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function Activity() {
  return (
    <ol className="relative space-y-5 pl-6">
      <span aria-hidden className="absolute bottom-2 left-[3px] top-2 w-px bg-line-strong" />
      {activity.map((item, i) => (
        <li key={item.what} className="relative">
          <span aria-hidden className={cn("absolute -left-6 top-1.5 size-[7px] rounded-full ring-4 ring-[#0e0e10]", i === 0 ? "bg-ember" : "bg-fg/50")} />
          <p className="text-sm text-muted">
            <span className="text-fg">{item.who}</span> {item.what}
          </p>
          <p className="text-xs text-subtle">{item.time}</p>
        </li>
      ))}
    </ol>
  );
}
