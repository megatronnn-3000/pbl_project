import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { clamp, cn } from "../../lib/utils";
import { EASE_OUT_EXPO } from "../ui/Reveal";

export function ScoreRing({
  value,
  size = 56,
  stroke = 3,
  label,
  className,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduced = useReducedMotionPref();
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const target = circumference * (1 - clamp(value / 100));

  return (
    <div
      ref={ref}
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-ember)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? target : circumference }}
          animate={{ strokeDashoffset: inView || reduced ? target : circumference }}
          transition={reduced ? { duration: 0 } : { duration: 1.4, ease: EASE_OUT_EXPO }}
        />
      </svg>
      <div className="relative" aria-hidden={label ? true : undefined}>
        {children}
      </div>
    </div>
  );
}

export function Meter({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const pct = clamp(value / max);
  return (
    <div ref={ref} className={cn("h-1 w-full overflow-hidden rounded-full bg-white/[0.07]", className)}>
      <motion.div
        className="h-full w-full origin-left rounded-full bg-ember"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? pct : 0 }}
        transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
      />
    </div>
  );
}
