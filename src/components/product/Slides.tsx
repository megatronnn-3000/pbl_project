import type { Deck, DeckSlide } from "../../data/pitch";
import type { Startup } from "../../data/types";
import { cn } from "../../lib/utils";

/**
 * Slides are laid out in container-query units, so one component renders
 * crisply as a 150px thumbnail or a full-width stage.
 */
export function SlideCanvas({
  slide,
  index,
  startup,
  deck,
  className,
}: {
  slide: DeckSlide;
  index: number;
  startup: Startup;
  deck: Deck;
  className?: string;
}) {
  return (
    <div className={cn("@container relative aspect-video w-full overflow-hidden bg-[#111113] text-fg", className)}>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgb(255_255_255/0.05),transparent_55%)]"
      />
      <div className="relative flex h-full flex-col p-[5cqw]">
        <div className="flex items-center justify-between font-mono text-[1.35cqw] uppercase tracking-[0.18em] text-subtle">
          <span className="flex items-center gap-[0.8cqw] text-fg">
            <span className="size-[0.9cqw] rounded-full bg-ember" />
            {startup.name}
          </span>
          <span>
            {slide.label} · {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-[3.6cqw] max-w-[74%] text-[3.8cqw] font-medium leading-[1.1] tracking-[-0.03em]">{slide.headline}</p>
        <div className="mt-auto">
          <SlideBody slide={slide} startup={startup} deck={deck} />
        </div>
      </div>
    </div>
  );
}

function SlideBody({ slide, startup, deck }: { slide: DeckSlide; startup: Startup; deck: Deck }) {
  switch (slide.key) {
    case "team":
      return (
        <div className="grid grid-cols-3 gap-[3cqw]">
          {startup.team.slice(0, 3).map((member) => (
            <div key={member.name}>
              <span className="grid size-[6.5cqw] place-items-center rounded-full bg-white/[0.08] text-[1.9cqw] font-medium">
                {member.initials}
              </span>
              <p className="mt-[1.4cqw] text-[1.9cqw] font-medium">{member.name}</p>
              <p className="text-[1.45cqw] text-subtle">{member.role}</p>
              <p className="mt-[0.6cqw] text-[1.35cqw] leading-snug text-muted">{member.background}</p>
            </div>
          ))}
        </div>
      );

    case "market":
      return (
        <div className="flex items-end justify-between gap-[4cqw]">
          <div className="space-y-[1.5cqw]">
            {[
              ["TAM", deck.market.tam, "Total addressable"],
              ["SAM", deck.market.sam, "Serviceable today"],
              ["SOM", deck.market.som, "Reachable in 36 months"],
            ].map(([key, value, detail]) => (
              <div key={key} className="flex items-baseline gap-[1.6cqw]">
                <span className="w-[5cqw] font-mono text-[1.3cqw] text-subtle">{key}</span>
                <span className="w-[11cqw] text-[2.8cqw] font-medium tracking-tight">{value}</span>
                <span className="text-[1.4cqw] text-subtle">{detail}</span>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 100 100" className="w-[21cqw] shrink-0">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgb(255 255 255 / 0.16)" />
            <circle cx="50" cy="64" r="33" fill="none" stroke="rgb(255 255 255 / 0.28)" />
            <circle cx="50" cy="80" r="17" fill="rgb(255 255 255 / 0.14)" stroke="rgb(255 255 255 / 0.5)" />
          </svg>
        </div>
      );

    case "product":
      return (
        <div className="max-w-[78%] rounded-[1.2cqw] border border-white/10 bg-black/40 p-[2.4cqw] font-mono text-[1.55cqw] leading-[1.75]">
          <p>
            <span className="text-subtle">$</span> {deck.command}
          </p>
          <p className="text-muted">
            <span className="text-ember">✓</span> Built image in 18s
          </p>
          <p className="text-muted">
            <span className="text-ember">✓</span> Scheduled on 2× L4 · autoscale 0→8
          </p>
          <p className="text-muted">
            <span className="text-ember">✓</span> Live · p95 latency 212ms
          </p>
        </div>
      );

    case "traction": {
      const series = startup.telemetry.wauSeries;
      const max = Math.max(...series);
      const min = Math.min(...series) * 0.8;
      const pts = series.map((v, i) => `${(i / (series.length - 1)) * 200},${70 - ((v - min) / (max - min)) * 64}`);
      return (
        <div className="flex items-end gap-[4cqw]">
          <div className="shrink-0">
            <p className="text-[7cqw] font-medium leading-none tracking-[-0.05em]">{startup.highlight.value}</p>
            <p className="mt-[1cqw] text-[1.5cqw] text-subtle">{startup.highlight.label}</p>
          </div>
          <svg viewBox="0 0 200 72" preserveAspectRatio="none" className="h-[15cqw] min-w-0 flex-1 overflow-visible">
            <path d={`M${pts.join(" L")} L200,72 L0,72 Z`} fill="rgb(255 255 255 / 0.06)" />
            <path d={`M${pts.join(" L")}`} fill="none" stroke="rgb(255 255 255 / 0.85)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      );
    }

    case "economics":
      return (
        <div className="grid grid-cols-[1.25fr_1fr] items-end gap-[5cqw]">
          <div>
            <p className="font-mono text-[1.3cqw] uppercase tracking-[0.14em] text-subtle">Gross margin</p>
            <div className="mt-[1.6cqw] space-y-[1.3cqw]">
              {(
                [
                  ["FY25", deck.economics.marginFrom],
                  ["Now", deck.economics.marginTo],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-center gap-[1.5cqw]">
                  <span className="w-[5cqw] text-[1.4cqw] text-subtle">{label}</span>
                  <span className="relative h-[2.3cqw] flex-1">
                    <span
                      className={cn("absolute inset-y-0 left-0 rounded-[0.4cqw]", label === "Now" ? "bg-white/85" : "bg-white/30")}
                      style={{ width: `${value}%` }}
                    />
                  </span>
                  <span className="w-[6cqw] text-right text-[1.9cqw] font-medium">{value}%</span>
                </div>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-[3cqw] gap-y-[2cqw]">
            {[
              ["CAC", deck.economics.cac],
              ["LTV", deck.economics.ltv],
              ["LTV : CAC", deck.economics.ratio],
              ["Payback", deck.economics.payback],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[1.25cqw] uppercase tracking-[0.12em] text-subtle">{label}</dt>
                <dd className="mt-[0.4cqw] text-[2.6cqw] font-medium tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    default:
      return (
        <div>
          <div className="flex h-[2.6cqw] w-full gap-[0.4cqw] overflow-hidden rounded-[0.5cqw]">
            {deck.useOfFunds.map((use, i) => (
              <span key={use.label} style={{ width: `${use.pct}%`, backgroundColor: `rgb(255 255 255 / ${[0.85, 0.5, 0.24][i]})` }} />
            ))}
          </div>
          <div className="mt-[1.8cqw] flex flex-wrap gap-x-[3cqw] gap-y-[1cqw] text-[1.5cqw]">
            {deck.useOfFunds.map((use, i) => (
              <span key={use.label} className="flex items-center gap-[0.8cqw]">
                <span className="size-[1.2cqw] rounded-[0.3cqw]" style={{ backgroundColor: `rgb(255 255 255 / ${[0.85, 0.5, 0.24][i]})` }} />
                {use.label} <span className="text-subtle">{use.pct}%</span>
              </span>
            ))}
          </div>
          <p className="mt-[3cqw] text-[1.5cqw] text-muted">Milestones: 10K WAU · ₹25L MRR · Seed-ready in 18 months</p>
        </div>
      );
  }
}
