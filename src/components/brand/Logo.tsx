import { motion } from "motion/react";
import { cn } from "../../lib/utils";

const GRID = [5, 12, 19];

/**
 * A 3×3 field of nodes that brightens toward one ember node —
 * noise resolving into signal.
 */
export function LogoMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0", className)}>
      {GRID.map((cy, row) =>
        GRID.map((cx, col) => {
          const isSignal = row === 0 && col === 2;
          if (isSignal) return null;
          const strength = (col + (2 - row)) / 4;
          const opacity = 0.16 + strength * 0.6;
          if (!animated) {
            return <circle key={`${row}-${col}`} cx={cx} cy={cy} r={1.9} fill="currentColor" opacity={opacity} />;
          }
          return (
            <motion.circle
              key={`${row}-${col}`}
              cx={cx}
              cy={cy}
              r={1.9}
              fill="currentColor"
              initial={{ opacity: 0.12 }}
              animate={{ opacity: [0.12, opacity + 0.25, opacity] }}
              transition={{ duration: 1.6, delay: strength * 0.5, repeat: Infinity, repeatDelay: 1.8, ease: "easeOut" }}
            />
          );
        }),
      )}
      <circle cx={19} cy={5} r={2.7} fill="var(--color-ember)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-fg", className)}>
      <LogoMark className="size-[22px]" />
      <span className="text-[14px] font-semibold tracking-[0.22em]">IGNITE</span>
    </span>
  );
}
