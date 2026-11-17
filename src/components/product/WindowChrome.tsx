import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { DemoBadge } from "../ui/primitives";

/** Minimal app-window frame for product glimpses on the landing page. */
export function WindowChrome({ path, right, className }: { path: string; right?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-11 items-center gap-4 border-b border-line px-4", className)}>
      <div aria-hidden className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 rounded-full bg-white/[0.09]" />
        ))}
      </div>
      <div className="mx-auto flex h-6 min-w-0 items-center gap-2 rounded-md bg-white/[0.04] px-3 font-mono text-[11px] text-subtle">
        <Lock className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{path}</span>
      </div>
      <div className="hidden items-center gap-2 sm:flex">{right ?? <DemoBadge />}</div>
    </div>
  );
}
