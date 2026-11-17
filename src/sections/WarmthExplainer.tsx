import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Counter } from "../components/ui/Counter";
import { EASE_OUT_EXPO, Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";
import { viewer } from "../data/investors";
import { featuredStartup } from "../data/startups";
import type { WarmthKey } from "../data/types";
import { useReducedMotionPref } from "../hooks/useMediaQuery";
import { cn } from "../lib/utils";

const startup = featuredStartup;
const factors = startup.warmthFactors;
/** One hue, stepped by lightness — the factor list below doubles as the legend. */
const SHADES = [1, 0.72, 0.5, 0.34];

const FOUNDER = { x: 70, y: 220 };
const INVESTOR = { x: 570, y: 220 };
const LANE_Y: Record<WarmthKey, number> = { contacts: 62, alma: 167, events: 273, thesis: 378 };

const lanePath = (y: number) =>
  `M ${FOUNDER.x + 30} ${FOUNDER.y} C ${FOUNDER.x + 120} ${FOUNDER.y}, ${FOUNDER.x + 110} ${y}, 236 ${y} L 404 ${y} C ${INVESTOR.x - 110} ${y}, ${INVESTOR.x - 120} ${INVESTOR.y}, ${INVESTOR.x - 30} ${INVESTOR.y}`;

export function WarmthExplainer() {
  const [enabled, setEnabled] = useState<Set<WarmthKey>>(() => new Set(factors.map((f) => f.key)));
  const [hovered, setHovered] = useState<WarmthKey | null>(null);
  const score = factors.reduce((sum, f) => sum + (enabled.has(f.key) ? f.points : 0), 0);

  const toggle = (key: WarmthKey) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section
      id="warmth"
      aria-labelledby="warmth-title"
      className="relative scroll-mt-16 border-y border-line bg-[linear-gradient(180deg,rgb(255_255_255/0.014),transparent_60%)] py-28 sm:py-36 lg:py-44"
    >
      <div className="container-page">
        <SectionIntro
          id="warmth-title"
          align="center"
          eyebrow="The Warmth Graph"
          title={
            <>
              Cold isn't binary. <span className="text-subtle">Neither is warm.</span>
            </>
          }
          description="Ignite scores every founder–investor pair from the four relationships that actually predict a reply — and always shows its working."
        />

        <div className="mt-16 grid items-center gap-14 lg:mt-24 lg:grid-cols-[minmax(0,23rem)_1fr] lg:gap-16 xl:gap-24">
          <Reveal>
            <p className="eyebrow text-subtle">
              {startup.name} × {viewer.firm}
            </p>
            <p className="mt-5 flex items-baseline gap-3">
              <Counter
                value={score}
                format={(v) => `${Math.round(v)}%`}
                className="text-[clamp(4rem,3rem+4vw,6.5rem)] font-medium leading-none tracking-[-0.055em] text-fg"
              />
              <span className="eyebrow text-ember">Warm</span>
            </p>

            <div className="mt-7 flex h-2 w-full overflow-hidden rounded-full bg-white/[0.06]" role="img" aria-label={`Warmth ${score} out of 100`}>
              {factors.map((factor, i) => {
                const on = enabled.has(factor.key);
                return (
                  <motion.div
                    key={factor.key}
                    className="h-full"
                    style={{ backgroundColor: `rgb(255 106 42 / ${SHADES[i]})` }}
                    initial={false}
                    animate={{ width: on ? `${factor.points}%` : "0%", marginRight: on ? 2 : 0 }}
                    transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                  />
                );
              })}
            </div>

            <ul className="mt-8 divide-y divide-line border-y border-line">
              {factors.map((factor, i) => {
                const on = enabled.has(factor.key);
                return (
                  <li key={factor.key}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(factor.key)}
                      onPointerEnter={() => setHovered(factor.key)}
                      onPointerLeave={() => setHovered(null)}
                      onFocus={() => setHovered(factor.key)}
                      onBlur={() => setHovered(null)}
                      className="group flex w-full items-start gap-4 py-4 text-left"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] ring-1 ring-inset transition-colors duration-300",
                          on ? "ring-transparent" : "ring-line-strong group-hover:ring-white/30",
                        )}
                        style={on ? { backgroundColor: `rgb(255 106 42 / ${SHADES[i]})` } : undefined}
                      >
                        {on && <Check className="size-3 text-ember-ink" strokeWidth={3} aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={cn("text-[15px] font-medium transition-colors", on ? "text-fg" : "text-subtle")}>{factor.label}</span>
                          <span className={cn("font-mono text-xs tabular-nums transition-colors", on ? "text-fg" : "text-subtle")}>
                            +{factor.points}
                            <span className="text-subtle">/{factor.max}</span>
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-sm text-subtle">
                          {factor.detail} · {factor.nodes.join(", ")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-xs text-subtle">Toggle a relationship to see how the score responds.</p>
          </Reveal>

          <Reveal delay={0.1} className="hidden sm:block">
            <WarmthDiagram enabled={enabled} hovered={hovered} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function WarmthDiagram({ enabled, hovered }: { enabled: Set<WarmthKey>; hovered: WarmthKey | null }) {
  const reduced = useReducedMotionPref();

  return (
    <svg viewBox="0 0 640 440" className="h-auto w-full overflow-visible" role="img" aria-label="Relationship paths between NOVA and Halcyon Ventures">
      {factors.map((factor, i) => {
        const y = LANE_Y[factor.key];
        const on = enabled.has(factor.key);
        const focus = hovered === factor.key;
        const d = lanePath(y);
        const glyph = on ? "var(--color-fg)" : "var(--color-faint)";
        return (
          <g key={factor.key} style={{ opacity: hovered && !focus ? 0.45 : 1, transition: "opacity 0.4s" }}>
            <motion.path
              d={d}
              fill="none"
              stroke={on ? `rgb(255 106 42 / ${focus ? 1 : 0.3 + SHADES[i] * 0.45})` : "rgb(255 255 255 / 0.09)"}
              strokeWidth={on ? 1 + (factor.points / factor.max) * 1.1 : 1}
              strokeLinecap="round"
              style={{ transition: "stroke 0.45s, stroke-width 0.45s" }}
              initial={reduced ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.2 + i * 0.12, ease: EASE_OUT_EXPO }}
            />
            {on && !reduced && (
              <circle r={2.4} fill="var(--color-ember-bright)">
                <animateMotion dur={`${3.4 - i * 0.25}s`} begin={`${i * 0.6}s`} repeatCount="indefinite" path={d} />
              </circle>
            )}
            <text x={320} y={y - 16} textAnchor="middle" className="fill-subtle font-mono text-[10px] uppercase tracking-[0.14em]">
              {factor.label}
            </text>

            {factor.key === "contacts" &&
              factor.nodes.map((name, k) => (
                <g key={name}>
                  <circle cx={264 + k * 112} cy={y} r={5} fill={glyph} style={{ transition: "fill 0.4s" }} />
                  <text x={264 + k * 112} y={y + 22} textAnchor="middle" className="fill-muted text-[11px]">
                    {name}
                  </text>
                </g>
              ))}
            {factor.key === "alma" && (
              <g>
                <path d={`M320 ${y - 7} L327 ${y} L320 ${y + 7} L313 ${y} Z`} fill="var(--color-canvas)" stroke={glyph} strokeWidth={1.4} />
                <text x={320} y={y + 24} textAnchor="middle" className="fill-muted text-[11px]">
                  {factor.detail}
                </text>
              </g>
            )}
            {factor.key === "events" &&
              factor.nodes.map((name, k) => (
                <path
                  key={name}
                  d={`M${274 + k * 46 - 5} ${y} h10 M${274 + k * 46} ${y - 5} v10`}
                  stroke={glyph}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
              ))}
            {factor.key === "events" && (
              <text x={320} y={y + 24} textAnchor="middle" className="fill-muted text-[11px]">
                {factor.nodes.join(" · ")}
              </text>
            )}
            {factor.key === "thesis" && (
              <g>
                <circle cx={308} cy={y} r={13} fill="var(--color-canvas)" stroke={glyph} strokeWidth={1.2} />
                <circle cx={332} cy={y} r={13} fill="none" stroke={glyph} strokeWidth={1.2} />
                <text x={320} y={y + 32} textAnchor="middle" className="fill-muted text-[11px]">
                  {factor.detail}
                </text>
              </g>
            )}
          </g>
        );
      })}

      <g>
        <circle cx={FOUNDER.x} cy={FOUNDER.y} r={30} fill="var(--color-raised)" stroke="rgb(255 255 255 / 0.14)" />
        <text x={FOUNDER.x} y={FOUNDER.y + 6} textAnchor="middle" className="fill-fg text-[17px] font-semibold">
          {startup.monogram}
        </text>
        <text x={FOUNDER.x} y={FOUNDER.y + 56} textAnchor="middle" className="fill-fg text-[13px] font-medium">
          {startup.name}
        </text>
        <text x={FOUNDER.x} y={FOUNDER.y + 73} textAnchor="middle" className="fill-subtle text-[11px]">
          {startup.team[0].name}
        </text>
      </g>
      <g>
        <circle cx={INVESTOR.x} cy={INVESTOR.y} r={30} fill="var(--color-canvas)" stroke="var(--color-ember)" strokeWidth={1.5} />
        <circle cx={INVESTOR.x} cy={INVESTOR.y} r={5} fill="var(--color-ember)" />
        <text x={INVESTOR.x} y={INVESTOR.y + 56} textAnchor="middle" className="fill-fg text-[13px] font-medium">
          {viewer.firm}
        </text>
        <text x={INVESTOR.x} y={INVESTOR.y + 73} textAnchor="middle" className="fill-subtle text-[11px]">
          {viewer.name} · You
        </text>
      </g>
    </svg>
  );
}
