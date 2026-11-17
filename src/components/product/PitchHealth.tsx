import { Check, LoaderCircle, ScanSearch, TriangleAlert, Wand2 } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { pitchHealth } from "../../data/copilot";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { cn } from "../../lib/utils";
import { ScoreRing } from "../charts/ScoreRing";
import { Button } from "../ui/Button";

export function PitchHealth({ deckLabel = "NOVA · deck v3", className }: { deckLabel?: string; className?: string }) {
  const reduced = useReducedMotionPref();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [scanned, setScanned] = useState(0);
  const [fixed, setFixed] = useState(false);
  const total = pitchHealth.length;
  const done = scanned >= total || reduced;
  const flags = pitchHealth.filter((item) => item.status === "flag").length;
  const score = fixed ? 94 : 78;

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => {
      setScanned((s) => {
        if (s + 1 >= total) window.clearInterval(id);
        return s + 1;
      });
    }, 520);
    return () => window.clearInterval(id);
  }, [inView, reduced, total]);

  const rescan = () => {
    setFixed(false);
    setScanned(0);
    if (reduced) return;
    const id = window.setInterval(() => {
      setScanned((s) => {
        if (s + 1 >= total) window.clearInterval(id);
        return s + 1;
      });
    }, 420);
  };

  return (
    <div ref={ref} className={cn("window flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="eyebrow flex items-center gap-2 text-fg">
          <ScanSearch className="size-3.5 text-ember" aria-hidden /> Pitch health
        </p>
        <span className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">{deckLabel}</span>
      </div>

      <div className="flex items-center gap-4 px-5 py-5">
        <ScoreRing value={done ? score : 0} size={60} stroke={3} label={done ? `Pitch health ${score} of 100` : "Scanning"}>
          <span className="text-lg font-medium tracking-tight text-fg">{done ? score : "–"}</span>
        </ScoreRing>
        <div className="min-w-0" aria-live="polite">
          <p className="text-[15px] font-medium text-fg">{!done ? "Scanning deck…" : fixed ? "Ready to publish" : "Ready with fixes"}</p>
          <p className="mt-0.5 text-xs text-subtle">
            {!done ? `${Math.min(scanned, total)} of ${total} checks` : fixed ? "Both flags resolved in draft v4" : `${flags} flags before investors see it`}
          </p>
        </div>
      </div>

      <ul className="flex-1 border-t border-line">
        {pitchHealth.map((item, i) => {
          const state = reduced || i < scanned ? "done" : i === scanned ? "scanning" : "pending";
          const flagged = item.status === "flag" && !fixed;
          return (
            <li
              key={item.label}
              className={cn(
                "relative flex items-start gap-3 border-b border-line px-5 py-3.5 transition-colors duration-500 last:border-b-0",
                state === "scanning" && "bg-white/[0.03]",
              )}
            >
              {state === "scanning" && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-ember" />}
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center">
                {state === "pending" && <span className="size-1.5 rounded-full bg-faint" />}
                {state === "scanning" && <LoaderCircle className="size-4 animate-spin text-muted" aria-hidden />}
                {state === "done" &&
                  (flagged ? (
                    <TriangleAlert className="size-4 text-ember" aria-label="Flag" />
                  ) : (
                    <Check className="size-4 text-muted" aria-label="Pass" />
                  ))}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm transition-colors", state === "pending" ? "text-subtle" : "text-fg")}>{item.label}</p>
                <AnimatePresence initial={false}>
                  {state === "done" && flagged && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden text-xs leading-relaxed text-muted"
                    >
                      <span className="block pt-1">{item.note}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {state === "done" && (
                <span className={cn("font-mono text-nano uppercase tracking-[0.14em]", flagged ? "text-ember" : "text-subtle")}>
                  {flagged ? "Fix" : "Pass"}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
        {fixed ? (
          <p role="status" className="flex items-center gap-2 text-xs text-muted">
            <Check className="size-3.5 text-ember" aria-hidden /> Bottom-up TAM and channel CAC drafted into v4
          </p>
        ) : (
          <p className="text-xs text-subtle">Scans for missing metrics before publishing.</p>
        )}
        {fixed ? (
          <Button size="sm" variant="ghost" onClick={rescan}>
            Scan again
          </Button>
        ) : (
          <Button size="sm" variant="secondary" disabled={!done} onClick={() => setFixed(true)} icon={<Wand2 className="size-3.5" />}>
            Draft fixes
          </Button>
        )}
      </div>
    </div>
  );
}
