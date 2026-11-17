import { motion } from "motion/react";
import { useState } from "react";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { cn } from "../../lib/utils";

/** Sequential single-hue ramp: empty → ember. */
export const LEVEL_FILL = [
  "rgb(255 255 255 / 0.05)",
  "rgb(255 106 42 / 0.22)",
  "rgb(255 106 42 / 0.42)",
  "rgb(255 106 42 / 0.68)",
  "rgb(255 106 42 / 1)",
];

const CELL = 10;
const GAP = 3;
const TODAY = new Date(2026, 8, 10);

export function ContributionGrid({ values, className }: { values: number[]; className?: string }) {
  const reduced = useReducedMotionPref();
  const [hover, setHover] = useState<number | null>(null);
  const weeks = Math.ceil(values.length / 7);
  const vbW = weeks * (CELL + GAP) - GAP;
  const vbH = 7 * (CELL + GAP) - GAP;
  const total = values.reduce((sum, level, i) => sum + commitsFor(level, i), 0);

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Commit activity across ${weeks} weeks, about ${total} commits`}
        onPointerLeave={() => setHover(null)}
      >
        {Array.from({ length: weeks }, (_, col) => (
          <motion.g
            key={col}
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: col * 0.025 }}
          >
            {values.slice(col * 7, col * 7 + 7).map((level, row) => {
              const i = col * 7 + row;
              return (
                <rect
                  key={i}
                  x={col * (CELL + GAP)}
                  y={row * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={LEVEL_FILL[level]}
                  stroke={hover === i ? "rgb(255 255 255 / 0.7)" : "none"}
                  strokeWidth={1}
                  onPointerEnter={() => setHover(i)}
                />
              );
            })}
          </motion.g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line-strong bg-overlay/95 px-2 py-1 text-xs text-fg shadow-xl"
          style={{
            left: `${((Math.floor(hover / 7) * (CELL + GAP) + CELL / 2) / vbW) * 100}%`,
            top: `calc(${(((hover % 7) * (CELL + GAP)) / vbH) * 100}% - 6px)`,
          }}
        >
          <span className="tabular-nums">{commitsFor(values[hover], hover)}</span>
          <span className="text-subtle"> commits · {dateFor(hover, values.length)}</span>
        </div>
      )}
    </div>
  );
}

export function LevelLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 font-mono text-nano uppercase tracking-[0.12em] text-subtle", className)}>
      <span>Less</span>
      {LEVEL_FILL.map((fill) => (
        <span key={fill} className="size-2.5 rounded-[2px]" style={{ background: fill }} />
      ))}
      <span>More</span>
    </div>
  );
}

function commitsFor(level: number, index: number) {
  return level === 0 ? 0 : level * 3 + ((index * 7) % 3);
}

function dateFor(index: number, length: number) {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - (length - 1 - index));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
