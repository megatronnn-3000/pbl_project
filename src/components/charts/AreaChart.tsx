import { motion } from "motion/react";
import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import { useReducedMotionPref } from "../../hooks/useMediaQuery";
import { clamp, cn } from "../../lib/utils";

const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceCeil(value: number) {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / exp;
  return (NICE_STEPS.find((s) => f <= s) ?? 10) * exp;
}

/** Single-series area chart: 2px line, 10% wash, hairline grid, crosshair on hover and keyboard. */
export function AreaChart({
  values,
  labels,
  format,
  tickFormat = format,
  height = 200,
  title,
  className,
}: {
  values: number[];
  labels: string[];
  format: (v: number) => string;
  tickFormat?: (v: number) => string;
  height?: number;
  title: string;
  className?: string;
}) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotionPref();
  const gradientId = useId().replace(/:/g, "");

  const pad = { top: 22, right: 6, bottom: 26, left: 6 };
  const w = Math.max(width, 1);
  const innerW = w - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = niceCeil(Math.max(...values) * 1.04);
  const last = values.length - 1;
  const x = (i: number) => pad.left + (i / last) * innerW;
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(last).toFixed(1)},${pad.top + innerH}L${x(0).toFixed(1)},${pad.top + innerH}Z`;
  const ticks = [0, max / 2, max];
  const labelIndexes = [0, Math.round(last / 2), last];

  const onPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActive(Math.round(clamp((event.clientX - rect.left - pad.left) / innerW) * last));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive((a) => Math.min(last, (a ?? -1) + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive((a) => Math.max(0, (a ?? last + 1) - 1));
    } else if (event.key === "Escape") {
      setActive(null);
    }
  };

  const focus = active;

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label={`${title}. Use the arrow keys to read values.`}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
      className={cn("relative select-none rounded-md", className)}
      style={{ height }}
    >
      {width > 0 && (
        <svg width={w} height={height} className="block overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-ember)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-ember)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={w - pad.right} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.06)" />
              <text x={pad.left} y={y(t) - 7} className="fill-subtle font-mono text-[10px] tabular-nums">
                {tickFormat(t)}
              </text>
            </g>
          ))}
          <motion.path
            d={area}
            fill={`url(#${gradientId})`}
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="var(--color-ember)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
          {labelIndexes.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
              className="fill-subtle font-mono text-[10px]"
            >
              {labels[i]}
            </text>
          ))}
          {focus !== null && (
            <line x1={x(focus)} x2={x(focus)} y1={pad.top} y2={pad.top + innerH} stroke="rgb(255 255 255 / 0.2)" />
          )}
          <circle
            cx={x(focus ?? last)}
            cy={y(values[focus ?? last])}
            r={4}
            fill="var(--color-ember)"
            stroke="var(--color-canvas)"
            strokeWidth={2}
          />
          <rect
            x={0}
            y={0}
            width={w}
            height={height}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      )}
      {focus !== null && width > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line-strong bg-overlay/95 px-2.5 py-1.5 shadow-2xl backdrop-blur"
          style={{ left: clamp(x(focus), 48, w - 48), top: y(values[focus]) - 12 }}
        >
          <p className="whitespace-nowrap font-mono text-nano uppercase tracking-[0.12em] text-subtle">{labels[focus]}</p>
          <p className="whitespace-nowrap text-sm font-medium tabular-nums text-fg">{format(values[focus])}</p>
        </div>
      )}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {values.map((v, i) => (
            <tr key={labels[i]}>
              <th scope="row">{labels[i]}</th>
              <td>{format(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
