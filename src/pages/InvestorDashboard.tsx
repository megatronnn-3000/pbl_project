import { ArrowRight, BookmarkX, FolderLock, Handshake } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Meter } from "../components/charts/ScoreRing";
import { MatchDetail, MatchList } from "../components/product/MatchFeed";
import { Counter } from "../components/ui/Counter";
import { Avatar, Chip, Monogram } from "../components/ui/primitives";
import { Reveal } from "../components/ui/Reveal";
import { viewer } from "../data/investors";
import { startupById, startups } from "../data/startups";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn } from "../lib/utils";

const INTROS = [
  { startupId: "nova", person: "Aarav Shah", initials: "AS", via: "Vikram Menon", status: "Accepted", detail: "Meeting Sep 14 · 11:00" },
  { startupId: "forge-ai", person: "Siddharth Rao", initials: "SR", via: "Rohan Bhatt", status: "Requested", detail: "Sent 2 days ago" },
  { startupId: "orbit", person: "Farah Siddiqui", initials: "FS", via: "Karthik Reddy", status: "Awaiting", detail: "Karthik is back Monday" },
];

const RECENT: [string, string][] = [
  ["layer", "12 min ago"],
  ["atlas-labs", "1 hr ago"],
  ["cinder", "3 hr ago"],
  ["kiln", "Yesterday"],
];

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default function InvestorDashboard() {
  useDocumentTitle("Dashboard — Ignite");
  const ranked = useMemo(() => [...startups].sort((a, b) => b.warmth - a.warmth), []);
  const [selectedId, setSelectedId] = useState(ranked[0].id);
  const [saved, setSaved] = useState<Set<string>>(() => new Set(["orbit", "layer"]));
  const selected = ranked.find((s) => s.id === selectedId) ?? ranked[0];

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="container-page pb-28 pt-10 lg:pt-14">
      <div className="grid gap-10 border-b border-line pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm text-muted">
            {greeting()}, {viewer.firstName}.
          </p>
          <h1 className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-3">
            <Counter value={24} className="text-[clamp(4.5rem,3rem+6vw,8rem)] font-medium leading-[0.82] tracking-[-0.06em] text-fg" />
            <span className="eyebrow pb-1.5 text-muted">
              High-signal matches
              <br />
              this week
            </span>
          </h1>
          <p className="mt-6 text-sm text-subtle">6 new since Monday · 3 above 85% warm · filtered from 312 verified startups</p>
        </div>
        <dl className="grid grid-cols-3 gap-6 sm:gap-12">
          {[
            ["Warm intros", "3", "1 accepted"],
            ["Deal rooms", "2", "$465K committed"],
            ["Decks viewed", "11", "this week"],
          ].map(([label, value, sub]) => (
            <div key={label} className="flex flex-col">
              <dt className="eyebrow order-1 text-subtle">{label}</dt>
              <dd className="order-2 mt-3 text-3xl font-medium tracking-tight text-fg">{value}</dd>
              <dd className="order-3 mt-1 text-xs text-subtle">{sub}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="recommended-title" className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="recommended-title" className="eyebrow text-subtle">
              Recommended for {viewer.firm}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {viewer.thesis.slice(0, 3).map((t) => (
                <Chip key={t} tone="quiet">
                  {t}
                </Chip>
              ))}
              <Link to="/copilot" className="ml-1 text-xs text-subtle underline-offset-4 hover:text-fg hover:underline">
                Edit thesis
              </Link>
            </div>
          </div>
          <div className="panel mt-4 overflow-hidden">
            <div className="hidden grid-cols-[5rem_minmax(0,1fr)_9.5rem_4.5rem_4.5rem] gap-x-4 border-b border-line px-5 py-2.5 font-mono text-nano uppercase tracking-[0.14em] text-subtle md:grid">
              <span>Warmth</span>
              <span>Startup</span>
              <span>Signal</span>
              <span>WAU</span>
              <span className="sr-only">Actions</span>
            </div>
            <MatchList startups={ranked} selectedId={selectedId} onSelect={setSelectedId} saved={saved} onToggleSave={toggleSave} />
          </div>
        </div>
        <aside aria-label="Selected match" className="xl:sticky xl:top-24 xl:self-start">
          <div className="panel p-6">
            <MatchDetail startup={selected} />
          </div>
        </aside>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Warm introductions" count={INTROS.length} icon={<Handshake className="size-3.5" aria-hidden />}>
          <ul className="divide-y divide-line">
            {INTROS.map((intro) => {
              const s = startupById(intro.startupId)!;
              return (
                <li key={intro.person} className="flex items-start gap-3 py-3.5">
                  <Avatar initials={intro.initials} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-fg">
                      {intro.person} <span className="text-subtle">· {s.name}</span>
                    </p>
                    <p className="truncate text-xs text-subtle">
                      via {intro.via} · {intro.detail}
                    </p>
                  </div>
                  <span className={cn("font-mono text-nano uppercase tracking-[0.12em]", intro.status === "Accepted" ? "text-ember" : "text-subtle")}>
                    {intro.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Deal rooms" count={2} icon={<FolderLock className="size-3.5" aria-hidden />}>
          <ul className="divide-y divide-line">
            <li>
              <Link to="/deal-room" className="group block py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm text-fg">NOVA × Halcyon Ventures</p>
                  <ArrowRight className="size-3.5 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />
                </div>
                <p className="text-xs text-subtle">Pre-Seed · Post-money SAFE</p>
                <Meter value={62} className="mt-3" />
                <p className="mt-1.5 text-xs text-subtle">$465K of $750K committed</p>
              </Link>
            </li>
            <li className="py-3.5">
              <p className="truncate text-sm text-muted">Forge AI × Halcyon Ventures</p>
              <p className="text-xs text-subtle">Pre-Seed · SAFE</p>
              <Meter value={40} className="mt-3 opacity-50" />
              <p className="mt-1.5 text-xs text-subtle">Invite pending · opens when the founder accepts</p>
            </li>
          </ul>
        </Card>

        <Card title="Saved" count={saved.size} icon={<BookmarkX className="size-3.5" aria-hidden />}>
          {saved.size === 0 ? (
            <p className="py-8 text-center text-sm text-subtle">Bookmark a match to keep it here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {[...saved].map((id) => {
                const s = startupById(id)!;
                return (
                  <li key={id} className="flex items-center gap-3 py-3">
                    <Monogram letter={s.monogram} size="sm" />
                    <Link to={`/startup/${s.id}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fg hover:underline">{s.name}</p>
                      <p className="truncate text-xs text-subtle">
                        {s.warmth}% warm · {s.highlight.value} {s.highlight.label.split(",")[0]}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSave(id)}
                      className="rounded-full px-2 py-1 text-xs text-subtle transition-colors hover:bg-white/5 hover:text-fg"
                      aria-label={`Remove ${s.name} from saved`}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Reveal className="mt-6">
        <section aria-labelledby="recent-title" className="panel p-6">
          <h2 id="recent-title" className="eyebrow text-subtle">
            Recently viewed
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RECENT.map(([id, time]) => {
              const s = startupById(id)!;
              return (
                <li key={id}>
                  <Link
                    to={`/startup/${s.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-line-strong hover:bg-white/[0.02]"
                  >
                    <Monogram letter={s.monogram} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fg">{s.name}</p>
                      <p className="truncate text-xs text-subtle">
                        {s.warmth}% warm · {time}
                      </p>
                    </div>
                    <ArrowRight className="size-3.5 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>
    </div>
  );
}

function Card({ title, count, icon, children }: { title: string; count: number; icon: ReactNode; children: ReactNode }) {
  return (
    <Reveal>
      <section className="panel h-full p-6">
        <h2 className="eyebrow flex items-center gap-2 text-subtle">
          <span className="text-ember">{icon}</span>
          {title}
          <span className="ml-auto tabular-nums text-muted">{count}</span>
        </h2>
        <div className="mt-3">{children}</div>
      </section>
    </Reveal>
  );
}
