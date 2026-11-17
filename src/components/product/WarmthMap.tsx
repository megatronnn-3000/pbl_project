import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { viewer } from "../../data/investors";
import { startups as allStartups } from "../../data/startups";
import type { Startup } from "../../data/types";
import { useMediaQuery, useReducedMotionPref } from "../../hooks/useMediaQuery";

/** Radial warmth graph: you at the centre, warmer startups closer, larger nodes carry more signal. */
export function WarmthMap({ startups }: { startups: Startup[] }) {
  const wide = useMediaQuery("(min-width: 768px)");
  const reduced = useReducedMotionPref();
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);

  const d = wide ? { w: 920, h: 600, k: 5.2, base: 36, xf: 1.38, yf: 0.86 } : { w: 400, h: 440, k: 2.6, base: 22, xf: 1, yf: 1.06 };
  const cx = d.w / 2;
  const cy = d.h / 2;
  const radius = (warmth: number) => (100 - warmth) * d.k + d.base;

  const nodes = startups.map((s) => {
    const i = allStartups.findIndex((x) => x.id === s.id);
    const angle = (i / allStartups.length) * Math.PI * 2 - Math.PI / 2 + 0.4;
    const r = radius(s.warmth);
    return { s, x: cx + Math.cos(angle) * r * d.xf, y: cy + Math.sin(angle) * r * d.yf, size: 5 + ((s.signal - 60) / 35) * 7 };
  });
  const activeNode = nodes.find((n) => n.s.id === active);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${d.w} ${d.h}`} className="h-auto w-full overflow-visible" role="group" aria-label={`Warmth map of ${startups.length} startups around ${viewer.firm}`}>
        {[85, 70, 55].map((w) => (
          <g key={w}>
            <ellipse cx={cx} cy={cy} rx={radius(w) * d.xf} ry={radius(w) * d.yf} fill="none" stroke="rgb(255 255 255 / 0.06)" />
            <text x={cx} y={cy - radius(w) * d.yf - 7} textAnchor="middle" className="fill-subtle font-mono text-[10px] tracking-[0.12em]">
              {w}%
            </text>
          </g>
        ))}

        <AnimatePresence>
          {nodes.map(({ s, x, y }) => {
            const strength = (s.warmth - 40) / 50;
            const mx = (cx + x) / 2 + (y - cy) * 0.12;
            const my = (cy + y) / 2 - (x - cx) * 0.12;
            return (
              <motion.path
                key={`edge-${s.id}`}
                d={`M${cx},${cy} Q${mx},${my} ${x},${y}`}
                fill="none"
                stroke={`rgb(255 106 42 / ${active === s.id ? 0.95 : 0.12 + strength * 0.45})`}
                strokeWidth={active === s.id ? 1.8 : 0.8 + strength}
                initial={{ opacity: 0 }}
                animate={{ opacity: active && active !== s.id ? 0.35 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            );
          })}
        </AnimatePresence>

        <g>
          {!reduced && (
            <motion.circle
              cx={cx}
              cy={cy}
              fill="none"
              stroke="var(--color-ember)"
              initial={{ r: 16, opacity: 0.5 }}
              animate={{ r: 34, opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <circle cx={cx} cy={cy} r={16} fill="var(--color-canvas)" stroke="var(--color-ember)" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={4.5} fill="var(--color-ember)" />
          <text x={cx} y={cy + 36} textAnchor="middle" className="fill-fg text-[12px] font-medium">
            You
          </text>
          <text x={cx} y={cy + 51} textAnchor="middle" className="fill-subtle text-[11px]">
            {viewer.firm}
          </text>
        </g>

        <AnimatePresence>
          {nodes.map(({ s, x, y, size }) => {
            const isActive = active === s.id;
            const strength = (s.warmth - 40) / 50;
            const labelRight = x >= cx;
            const open = () => navigate(`/startup/${s.id}`);
            return (
              <motion.g
                key={s.id}
                role="link"
                tabIndex={0}
                aria-label={`${s.name}, ${s.warmth}% warm, signal score ${s.signal}. Open profile.`}
                onClick={open}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open();
                  }
                }}
                onPointerEnter={() => setActive(s.id)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(s.id)}
                onBlur={() => setActive(null)}
                className="cursor-pointer outline-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: active && !isActive ? 0.45 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <circle cx={x} cy={y} r={size + 14} fill="transparent" />
                {isActive && <circle cx={x} cy={y} r={size + 6} fill="none" stroke="var(--color-ember)" strokeWidth={1} />}
                {s.track === "ecell" && <circle cx={x} cy={y} r={size + 3} fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth={1} />}
                <circle cx={x} cy={y} r={size} fill={`rgb(255 106 42 / ${0.35 + 0.65 * strength})`} stroke="var(--color-canvas)" strokeWidth={2} />
                {wide ? (
                  <>
                    <text x={labelRight ? x + size + 10 : x - size - 10} y={y - 1} textAnchor={labelRight ? "start" : "end"} className="fill-fg text-[13px] font-medium">
                      {s.name}
                    </text>
                    <text x={labelRight ? x + size + 10 : x - size - 10} y={y + 14} textAnchor={labelRight ? "start" : "end"} className="fill-subtle font-mono text-[10px]">
                      {s.warmth}% · signal {s.signal}
                    </text>
                  </>
                ) : (
                  <text x={x} y={y + size + 15} textAnchor="middle" className="fill-fg text-[12px] font-medium">
                    {s.name} <tspan className="fill-subtle font-mono text-[10px]">{s.warmth}%</tspan>
                  </text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      <AnimatePresence>
        {activeNode && wide && (
          <motion.div
            key={activeNode.s.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute z-10 w-64 rounded-xl border border-line-strong bg-overlay/95 p-4 shadow-2xl backdrop-blur-xl"
            style={{
              left: `${(activeNode.x / d.w) * 100}%`,
              top: `${(activeNode.y / d.h) * 100}%`,
              transform: `translate(${activeNode.x > cx ? "calc(-100% - 20px)" : "20px"}, -50%)`,
            }}
          >
            <p className="text-sm font-medium text-fg">{activeNode.s.name}</p>
            <p className="mt-0.5 text-xs text-subtle">{activeNode.s.tagline}</p>
            <div className="mt-3 flex items-baseline gap-4 border-t border-line pt-3">
              <p className="text-2xl font-medium tracking-tight text-fg">
                {activeNode.s.warmth}%<span className="ml-1.5 font-mono text-nano uppercase tracking-[0.14em] text-ember">warm</span>
              </p>
              <p className="text-xs text-subtle">Signal {activeNode.s.signal}</p>
            </div>
            <p className="mt-2 text-xs text-muted">
              via {activeNode.s.warmthFactors[0].nodes[0]} · {activeNode.s.highlight.value} {activeNode.s.highlight.label.split(",")[0]}
            </p>
            <p className="mt-3 flex items-center gap-1.5 font-mono text-nano uppercase tracking-[0.14em] text-subtle">
              Open profile <ArrowRight className="size-3" aria-hidden />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
