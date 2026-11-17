import { Activity, BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { Track } from "../../data/types";
import { cn } from "../../lib/utils";

export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-1.5 shrink-0", className)}>
      <span className="absolute inset-0 animate-ping-soft rounded-full bg-ember" />
      <span className="relative size-1.5 rounded-full bg-ember" />
    </span>
  );
}

export function Eyebrow({
  index,
  children,
  live = false,
  className,
}: {
  index?: string;
  children: ReactNode;
  live?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-subtle", className)}>
      {live && <LiveDot />}
      {index && (
        <>
          <span className="text-ember">{index}</span>
          <span aria-hidden className="h-px w-6 bg-line-strong" />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}

export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span
      title="Fictional companies, people, institutions and metrics, for demonstration only"
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border border-line px-2 font-mono text-nano uppercase tracking-[0.12em] text-subtle",
        className,
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-subtle" />
      {label}
    </span>
  );
}

export function Chip({
  children,
  icon,
  tone = "default",
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "ember" | "quiet";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs",
        tone === "default" && "border border-line text-muted",
        tone === "quiet" && "bg-white/[0.04] text-muted",
        tone === "ember" && "border border-ember/25 bg-ember/[0.07] text-ember-bright",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function TrackBadge({ track, className }: { track: Track; className?: string }) {
  return track === "ecell" ? (
    <Chip tone="ember" icon={<BadgeCheck className="size-3.5" aria-hidden />} className={className}>
      E-Cell Verified
    </Chip>
  ) : (
    <Chip icon={<Activity className="size-3.5 text-ember" aria-hidden />} className={className}>
      Open Builder
    </Chip>
  );
}

export function Monogram({
  letter,
  size = "md",
  className,
}: {
  letter: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[28%] bg-gradient-to-b from-white/[0.09] to-white/[0.02] font-semibold text-fg ring-1 ring-inset ring-white/10",
        size === "sm" && "size-8 text-[13px]",
        size === "md" && "size-10 text-[15px]",
        size === "lg" && "size-12 text-lg",
        size === "xl" && "size-16 text-2xl",
        className,
      )}
    >
      {letter}
      <span className="absolute right-[18%] top-[18%] size-[9%] min-h-1 min-w-1 rounded-full bg-ember" />
    </span>
  );
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-raised text-[11px] font-medium tracking-wide text-muted ring-1 ring-inset ring-white/10",
        className,
      )}
    >
      {initials}
    </span>
  );
}

/** Label + value pair used across dense product surfaces. */
export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="eyebrow text-subtle">{label}</p>
      <p className="mt-2.5 text-2xl font-medium tracking-tight text-fg">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-subtle">{sub}</p>}
    </div>
  );
}
