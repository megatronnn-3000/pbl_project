import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { PitchViewer } from "../components/product/PitchViewer";
import { Button } from "../components/ui/Button";
import { Avatar, DemoBadge, Eyebrow, Monogram } from "../components/ui/primitives";
import { getDeck } from "../data/pitch";
import { startupById } from "../data/startups";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatClock } from "../lib/format";

const VIEWERS: [string, number, number, string][] = [
  ["Northstar Capital", 1284, 6, "2 hr ago"],
  ["Arjun Ventures", 1102, 6, "1 day ago"],
  ["Halcyon Ventures", 968, 5, "1 day ago"],
  ["Banyan Angels", 611, 4, "3 days ago"],
  ["Kestrel Partners", 214, 2, "4 days ago"],
];

export default function PitchPage() {
  const { id } = useParams();
  const startup = startupById(id);
  useDocumentTitle(startup ? `${startup.name} deck analytics — Ignite` : "Deck not found — Ignite");

  if (!startup) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="eyebrow text-ember">No signal</p>
          <h1 className="mt-6 text-title font-medium text-fg">We couldn't find that deck.</h1>
          <Button to="/explore" variant="secondary" className="mt-8" icon={<ArrowLeft className="size-4" />}>
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const deck = getDeck(startup);
  const maxTime = Math.max(...VIEWERS.map((v) => v[1]));

  return (
    <div className="container-page pb-28 pt-8 lg:pt-10">
      <Link to={`/startup/${startup.id}`} className="inline-flex items-center gap-2 text-sm text-subtle transition-colors hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> {startup.name}
      </Link>

      <header className="mt-8 flex flex-col gap-8 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-5">
          <Monogram letter={startup.monogram} size="xl" />
          <div>
            <Eyebrow>Pitch analytics · deck v{deck.version}</Eyebrow>
            <h1 className="mt-4 text-title font-medium text-fg">
              {startup.name} — {startup.stage} deck
            </h1>
            <p className="mt-2 text-sm text-subtle">Shared with {deck.viewers} investors · last opened 2 hr ago</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-10">
          <dl className="grid grid-cols-4 gap-6 sm:gap-10">
            {[
              ["Viewers", String(deck.viewers)],
              ["Finished", String(deck.completed)],
              ["Avg time", formatClock(deck.avgSeconds)],
              ["Questions", String(deck.questions.length)],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="eyebrow order-1 text-subtle">{label}</dt>
                <dd className="order-2 mt-2 text-2xl font-medium tracking-tight text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <DemoBadge />
        </div>
      </header>

      <div className="mt-10">
        <PitchViewer startup={startup} deck={deck} initialSlide="team" globalKeys />
        <p className="mt-6 hidden text-xs text-subtle md:block">Tip: use the ← and → keys to move between slides.</p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="questions-title" className="panel p-6">
          <h2 id="questions-title" className="eyebrow text-subtle">
            All questions
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {deck.questions.map((q) => (
              <li key={q.text} className="flex gap-3 py-4">
                <Avatar initials={q.initials} />
                <div className="min-w-0">
                  <p className="text-xs text-subtle">
                    <span className="text-fg">{q.author}</span> · {q.org} · on {deck.slides.find((s) => s.key === q.slide)?.label} · {q.time}
                  </p>
                  <p className="mt-1 text-[15px] leading-snug text-fg">“{q.text}”</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="attention-title" className="panel p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="attention-title" className="eyebrow text-subtle">
              Attention by investor
            </h2>
            <p className="font-mono text-nano uppercase tracking-[0.12em] text-subtle">Total time · slides reached</p>
          </div>
          <ul className="mt-4 space-y-4">
            {VIEWERS.map(([org, seconds, slides, last]) => (
              <li key={org} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_3.25rem] items-center gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm text-fg">{org}</p>
                  <p className="text-xs text-subtle">{last}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-ember" style={{ width: `${(seconds / maxTime) * 100}%`, opacity: 0.3 + 0.7 * (seconds / maxTime) }} />
                </div>
                <p className="text-right font-mono text-xs tabular-nums text-fg">
                  {formatClock(seconds)}
                  <span className="block text-subtle">
                    {slides}/{deck.slides.length}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
