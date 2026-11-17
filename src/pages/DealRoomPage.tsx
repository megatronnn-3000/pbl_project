import { Link } from "react-router";
import { DealRoomPanel } from "../components/product/DealRoomPanel";
import { Avatar, Eyebrow } from "../components/ui/primitives";
import { deal, participants } from "../data/dealroom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatUSD } from "../lib/format";
import { Meter } from "../components/charts/ScoreRing";

export default function DealRoomPage() {
  useDocumentTitle(`${deal.title} — Deal room · Ignite`);
  const committedPct = Math.round((deal.committed / deal.target) * 100);

  return (
    <div className="container-page pb-28 pt-10 lg:pt-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-subtle">
          <li>
            <Link to="/investor" className="transition-colors hover:text-fg">
              Deal rooms
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="truncate text-muted">
            {deal.title}
          </li>
        </ol>
      </nav>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow live>Room open · 2 participants online</Eyebrow>
          <h1 className="mt-6 text-headline font-medium text-fg">{deal.title}</h1>
          <p className="mt-4 text-base text-muted">
            {deal.round} · {deal.instrument} · Target close {deal.closeDate}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-[auto_14rem] sm:items-end sm:gap-10">
          <div className="flex -space-x-2" aria-label={`${participants.length} participants`}>
            {participants.map((p) => (
              <Avatar key={p.initials} initials={p.initials} className="size-9 ring-2 ring-canvas" />
            ))}
          </div>
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-subtle">Committed</span>
              <span className="tabular-nums text-fg">
                {formatUSD(deal.committed)} <span className="text-subtle">/ {formatUSD(deal.target)}</span>
              </span>
            </div>
            <Meter value={committedPct} className="mt-2.5" />
            <p className="mt-2 text-xs text-subtle">
              {committedPct}% committed · {formatUSD(deal.cap)} post-money cap
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <DealRoomPanel initialTab="overview" chrome={false} header={false} />
      </div>
    </div>
  );
}
