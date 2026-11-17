import { Check, Copy, FileText, ScanSearch, Sparkles, Users, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Meter } from "../components/charts/ScoreRing";
import { CopilotConsole } from "../components/product/CopilotConsole";
import { PitchHealth } from "../components/product/PitchHealth";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/primitives";
import { Segmented } from "../components/ui/Segmented";
import { generatedUpdate, updateLog } from "../data/copilot";
import { featuredStartup } from "../data/startups";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useReducedMotionPref } from "../hooks/useMediaQuery";
import { formatINR, formatInt } from "../lib/format";

type Mode = "match" | "scan" | "update";

export default function CopilotPage() {
  useDocumentTitle("Copilot — Ignite");
  const [params] = useSearchParams();
  const query = params.get("q") ?? undefined;
  const [mode, setMode] = useState<Mode>("match");

  return (
    <div className="container-page pb-28 pt-12 lg:pt-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Ignite Copilot</Eyebrow>
          <h1 className="mt-6 text-headline font-medium text-fg">
            Ask for signal, <span className="text-subtle">not lists.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Copilot reads theses, relationships and live telemetry — then shows its working.
          </p>
        </div>
        <Segmented
          label="Copilot mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "match", label: "Match", icon: <Users className="size-3.5" aria-hidden /> },
            { value: "scan", label: "Scan", icon: <ScanSearch className="size-3.5" aria-hidden /> },
            { value: "update", label: "Update", icon: <FileText className="size-3.5" aria-hidden /> },
          ]}
        />
      </div>

      <div className="mt-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {mode === "match" && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <CopilotConsole key={query ?? "auto"} initialQuery={query} autoRun={!query} />
                <HowRanked />
              </div>
            )}
            {mode === "scan" && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <PitchHealth />
                <ScanExplainer />
              </div>
            )}
            {mode === "update" && <UpdateGenerator />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function HowRanked() {
  const weights: [string, number][] = [
    ["Shared contacts", 35],
    ["Thesis intersection", 30],
    ["Alma mater & community", 20],
    ["Shared events", 15],
  ];
  return (
    <aside className="panel p-6" aria-labelledby="how-ranked">
      <h2 id="how-ranked" className="eyebrow text-subtle">
        How Copilot ranks
      </h2>
      <ul className="mt-6 space-y-5">
        {weights.map(([label, weight]) => (
          <li key={label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-fg">{label}</span>
              <span className="font-mono text-xs tabular-nums text-subtle">{weight}%</span>
            </div>
            <Meter value={weight} max={35} className="mt-2" />
          </li>
        ))}
      </ul>
      <dl className="mt-8 space-y-3 border-t border-line pt-5 text-sm">
        {[
          ["Verified founder profiles", "312"],
          ["Investor mandates indexed", "410"],
          ["Index refreshed", "14 min ago"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-subtle">{label}</dt>
            <dd className="tabular-nums text-fg">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-xs text-subtle">Weights are illustrative for this demo.</p>
    </aside>
  );
}

function ScanExplainer() {
  const checks: [string, string][] = [
    ["Problem clarity", "One sentence, stated before the solution."],
    ["Product differentiation", "A named alternative, and why you win against it."],
    ["CAC / LTV", "Blended metrics hide paid-channel risk — split them."],
    ["Market sizing", "A bottom-up build, not a percentage of a big number."],
    ["Traction", "Verified sources outrank screenshots every time."],
  ];
  return (
    <aside className="panel p-6" aria-labelledby="scan-explainer">
      <h2 id="scan-explainer" className="eyebrow text-subtle">
        What the scanner checks
      </h2>
      <dl className="mt-4 divide-y divide-line">
        {checks.map(([label, detail]) => (
          <div key={label} className="py-4">
            <dt className="text-sm text-fg">{label}</dt>
            <dd className="mt-1 text-sm text-subtle">{detail}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function UpdateGenerator() {
  const reduced = useReducedMotionPref();
  const logId = useId();
  const [log, setLog] = useState(updateLog.join("\n"));
  const [state, setState] = useState<"idle" | "writing" | "done">("idle");
  const [revealed, setRevealed] = useState(0);
  const [copied, setCopied] = useState(false);
  const timers = useRef<number[]>([]);
  const t = featuredStartup.telemetry;
  const logLines = log
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const sectionCount = generatedUpdate.sections.length + 1;

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const generate = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setCopied(false);
    setState("writing");
    setRevealed(0);
    const beat = reduced ? 0 : 650;
    for (let i = 1; i <= sectionCount; i++) timers.current.push(window.setTimeout(() => setRevealed(i), beat * i));
    timers.current.push(window.setTimeout(() => setState("done"), beat * sectionCount + 100));
  };

  const copy = async () => {
    const text = [
      generatedUpdate.subject,
      ...generatedUpdate.sections.map((s) => `${s.heading}\n${s.body}`),
      `From the team\n${logLines.map((l) => `• ${l}`).join("\n")}`,
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      timers.current.push(window.setTimeout(() => setCopied(false), 2200));
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <div className="panel flex flex-col p-6">
        <label htmlFor={logId} className="eyebrow text-subtle">
          This month's founder log
        </label>
        <textarea
          id={logId}
          rows={7}
          value={log}
          onChange={(event) => setLog(event.target.value)}
          className="mt-4 w-full resize-none rounded-xl border border-line bg-white/[0.02] p-4 text-sm leading-relaxed text-fg placeholder:text-subtle focus:border-line-strong focus:outline-none"
          placeholder="One line per update"
        />
        <p className="eyebrow mt-7 text-subtle">Connected metrics · {featuredStartup.name}</p>
        <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
          {[
            ["Weekly active users", `${formatInt(t.wau)} · +${t.wauGrowth}%`],
            ["MRR", `${formatINR(t.mrr)} · +${t.mrrGrowth}% MoM`],
            ["Deployments", `${t.deployments} this month`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-subtle">{label}</dt>
              <dd className="tabular-nums text-fg">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-7">
          <Button onClick={generate} disabled={state === "writing" || logLines.length === 0} icon={<Wand2 className="size-4" />}>
            {state === "idle" ? "Draft investor update" : "Redraft"}
          </Button>
        </div>
      </div>

      <div className="window flex min-h-[32rem] flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <p className="eyebrow flex items-center gap-2 text-fg">
            <Sparkles className="size-3.5 text-ember" aria-hidden /> Draft
          </p>
          <p className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">To: 14 investors on the cap table &amp; pipeline</p>
        </div>
        <div aria-live="polite" className="flex-1 px-6 py-6 sm:px-8">
          {state === "idle" ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <FileText className="mx-auto size-6 text-faint" aria-hidden />
                <p className="mt-4 text-sm text-muted">Your update appears here, formatted for investors.</p>
                <p className="mt-1 text-xs text-subtle">Metrics are pulled from verified telemetry — never retyped.</p>
              </div>
            </div>
          ) : (
            <article>
              <p className="text-xs text-subtle">Subject</p>
              <h2 className="mt-1 text-xl font-medium tracking-tight text-fg">{generatedUpdate.subject}</h2>
              <div className="mt-6 space-y-6">
                {generatedUpdate.sections.map(
                  (section, i) =>
                    revealed > i && (
                      <motion.section key={section.heading} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                        <h3 className="eyebrow text-subtle">{section.heading}</h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-muted">{section.body}</p>
                      </motion.section>
                    ),
                )}
                {revealed >= sectionCount && (
                  <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                    <h3 className="eyebrow text-subtle">From the team</h3>
                    <ul className="mt-2 space-y-1.5">
                      {logLines.map((line) => (
                        <li key={line} className="flex gap-2.5 text-[15px] leading-relaxed text-muted">
                          <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-ember" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                )}
                {state === "writing" && <p className="text-xs text-subtle">Writing…</p>}
              </div>
            </article>
          )}
        </div>
        {state === "done" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
            <p className="text-xs text-subtle">Review before sending — nothing leaves Ignite in this demo.</p>
            <Button size="sm" variant="secondary" onClick={copy} icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}>
              {copied ? "Copied" : "Copy text"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
