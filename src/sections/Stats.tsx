import { Counter } from "../components/ui/Counter";
import { Reveal } from "../components/ui/Reveal";
import { cn } from "../lib/utils";

const STATS: { value: number; format: (v: number) => string; label: string }[] = [
  { value: 3.4, format: (v) => `${v.toFixed(1)}×`, label: "higher reply rate on warm-scored introductions" },
  { value: 312, format: (v) => String(Math.round(v)), label: "verified startups in the pilot graph" },
  { value: 38, format: (v) => String(Math.round(v)), label: "partner E-Cells across 14 cities" },
  { value: 11, format: (v) => `${Math.round(v)} days`, label: "median time from match to first meeting" },
];

export function Stats() {
  return (
    <section aria-labelledby="stats-title" className="border-y border-line">
      <div className="container-page">
        <div className="flex items-baseline justify-between gap-4 border-b border-line py-5">
          <h2 id="stats-title" className="eyebrow text-subtle">
            Signal, measured
          </h2>
          <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">Simulated pilot data</p>
        </div>
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.06}
              className={cn(
                "flex flex-col py-12 lg:py-16",
                i % 2 === 1 && "border-l border-line pl-6 sm:pl-8",
                i >= 2 && "border-t border-line lg:border-t-0",
                i === 2 && "lg:border-l lg:pl-10",
                i === 1 && "lg:pl-10",
                i === 3 && "lg:pl-10",
              )}
            >
              <dt className="order-2 mt-4 max-w-[15rem] text-sm leading-relaxed text-muted">{stat.label}</dt>
              <dd className="order-1 text-[clamp(2.6rem,1.8rem+3vw,4.75rem)] font-medium leading-none tracking-[-0.05em] text-fg">
                <Counter value={stat.value} format={stat.format} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
