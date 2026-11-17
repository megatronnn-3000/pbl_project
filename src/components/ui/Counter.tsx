import { animate, useInView, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { formatInt } from "../../lib/format";
import { EASE_OUT_EXPO } from "./Reveal";

/**
 * Counts up when scrolled into view, then tweens between later values.
 * Writes to the DOM directly so ticking numbers never re-render React.
 */
export function Counter({
  value,
  format = formatInt,
  duration = 1.6,
  className,
}: {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotionPref();
  const motionValue = useMotionValue(0);
  const started = useRef(false);
  const formatRef = useRef(format);
  formatRef.current = format;

  useMotionValueEvent(motionValue, "change", (latest) => {
    if (ref.current) ref.current.textContent = formatRef.current(latest);
  });

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      motionValue.jump(value);
      if (ref.current) ref.current.textContent = formatRef.current(value);
      started.current = true;
      return;
    }
    const controls = animate(motionValue, value, {
      duration: started.current ? 0.7 : duration,
      ease: EASE_OUT_EXPO,
    });
    started.current = true;
    return () => controls.stop();
  }, [value, inView, reduced, duration, motionValue]);

  return (
    <span ref={ref} className={className}>
      {format(reduced ? value : 0)}
    </span>
  );
}
