import { motion } from "motion/react";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { cn } from "../../lib/utils";

/** Decorative trend next to a stated value; the value itself is always in text. */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  className,
  emphasizeLast = true,
  area = false,
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  emphasizeLast?: boolean;
  area?: boolean;
}) {
  const reduced = useReducedMotionPref();
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join("");
  const last = values.length - 1;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className={cn("overflow-visible", className)}>
      {area && <path d={`${d}L${x(last)},${height}L${x(0)},${height}Z`} fill="currentColor" opacity={0.07} />}
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      {emphasizeLast && (
        <circle cx={x(last)} cy={y(values[last])} r={2.75} fill="var(--color-ember)" stroke="var(--color-canvas)" strokeWidth={1.5} />
      )}
    </svg>
  );
}
