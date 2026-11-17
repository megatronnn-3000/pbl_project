import { ArrowLeft, ArrowUpRight, BadgeCheck, Bookmark, Check, Handshake, Presentation, Quote } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { Meter, ScoreRing } from "../components/charts/ScoreRing";
import { MatchDetail } from "../components/product/MatchFeed";
import { SlideCanvas } from "../components/product/Slides";
import { TelemetryPanel } from "../components/product/TelemetryPanel";
import { Button } from "../components/ui/Button";
import { Avatar, Chip, DemoBadge, Monogram, TrackBadge } from "../components/ui/primitives";
import { Reveal } from "../components/ui/Reveal";
import { getDeck } from "../data/pitch";
import { startupById, startups } from "../data/startups";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatClock } from "../lib/format";
import { cn } from "../lib/utils";

export default function StartupProfile() {
  const { id } = useParams();
  const startup = startupById(id);
  const [saved, setSaved] = useState(false);
  const [requested, setRequested] = useState(false);
  useDocumentTitle(startup ? `${startup.name} — ${startup.tagline.replace(/\.$/, "")} · Ignite` : "Startup not found — Ignite");

  if (!startup) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="eyebrow text-ember">No signal</p>
          <h1 className="mt-6 text-title font-medium text-fg">We couldn't find that startup.</h1>
          <Button to="/explore" variant="secondary" className="mt-8" icon={<ArrowLeft className="size-4" />}>
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const deck = getDeck(startup);
  const rank = [...startups].sort((a, b) => b.signal - a.signal).findIndex((s) => s.id === startup.id) + 1;
  const contact = startup.warmthFactors[0].nodes[0];

  return (
    <div className="container-page pb-28 pt-8 lg:pt-10">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-subtle transition-colors hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Explore
      </Link>

      <header className="mt-8 flex flex-col gap-8 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-5 sm:items-center">
          <Monogram letter={startup.monogram} size="xl" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] font-semibold leading-none tracking-[-0.02em] text-fg">{startup.name}</h1>
              <TrackBadge track={startup.track} />
            </div>
            <p className="mt-3 text-lg text-muted">{startup.tagline}</p>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-subtle">
              <span>{startup.stage}</span>
              <span aria-hidden>·</span>
              <span>{startup.industry}</span>
              <span aria-hidden>·</span>
              <span>{startup.city}</span>
              <span aria-hidden>·</span>
              <span>Founded {startup.founded}</span>
              {startup.institution && (
                <>
                  <span aria-hidden>·</span>
                  <span>{startup.institution}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save startup"}
            className="grid size-10 place-items-center rounded-full text-muted ring-1 ring-inset ring-line transition-colors hover:text-fg hover:ring-line-strong"
          >
            <Bookmark className={cn("size-4", saved && "fill-ember text-ember")} />
          </button>
          <Button to={`/pitch/${startup.id}`} variant="secondary" icon={<Presentation className="size-4" />}>
            Pitch deck
          </Button>
          {requested ? (
            <p role="status" className="flex h-10 items-center gap-2 rounded-full bg-ember/10 px-4 text-sm text-ember-bright ring-1 ring-inset ring-ember/25">
              <Check className="size-4" aria-hidden /> Intro requested via {contact.split(" ")[0]}
            </p>
          ) : (
            <Button onClick={() => setRequested(true)} icon={<Handshake className="size-4" />}>
              Request warm intro
            </Button>
          )}
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:gap-16">
        <div className="min-w-0 space-y-16">
          <Reveal>
            <section aria-labelledby="signal-score" className="panel grid gap-8 p-6 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-12">
              <div className="flex items-center gap-6">
                <ScoreRing value={startup.signal} size={128} stroke={4} label={`Ignite signal score ${startup.signal} of 100`}>
                  <span className="text-5xl font-medium tracking-[-0.05em] text-fg">{startup.signal}</span>
                </ScoreRing>
                <div>
                  <h2 id="signal-score" className="eyebrow text-subtle">
                    Ignite signal score
                  </h2>
                  <p className="mt-2 max-w-[12rem] text-sm leading-relaxed text-muted">
                    #{rank} of {startups.length} in your feed · recalculated 6 min ago
                  </p>
                </div>
              </div>
              <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {(
                  [
                    ["Trust", startup.scores.trust, startup.track === "ecell" ? "E-Cell credentials and identity" : "Telemetry and community vouching"],
                    ["Traction", startup.scores.traction, "Verified usage and revenue"],
                    ["Velocity", startup.scores.velocity, "Commits, pull requests, deploys"],
                    ["Warmth", startup.scores.warmth, "Your relationship to the team"],
                  ] as const
                ).map(([label, value, detail]) => (
                  <div key={label}>
                    <div className="flex items-baseline justify-between">
                      <dt className="text-sm text-fg">{label}</dt>
                      <dd className="text-sm tabular-nums text-fg">{value}</dd>
                    </div>
                    <Meter value={value} className="mt-2" />
                    <p className="mt-2 text-xs text-subtle">{detail}</p>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>

          <Block title="About">
            <p className="max-w-2xl text-lg leading-relaxed text-muted">{startup.summary}</p>
          </Block>

          <Block title="Live telemetry" aside={<DemoBadge label="Simulated" />}>
            <TelemetryPanel startup={startup} header={false} />
          </Block>

          <Block title={startup.track === "ecell" ? "Institutional signal" : "Proof of traction"}>
            <ol className="divide-y divide-line border-y border-line">
              {startup.credentials.map((credential) => (
                <li key={credential.label} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 py-4 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto] sm:items-center">
                  <Check className="mt-0.5 size-4 text-ember sm:mt-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[15px] text-fg">{credential.label}</p>
                    <p className="text-sm text-subtle">{credential.detail}</p>
                  </div>
                  <p className="col-start-2 font-mono text-nano uppercase tracking-[0.12em] text-subtle sm:col-start-3">
                    {credential.issuer} · {credential.date}
                  </p>
                </li>
              ))}
            </ol>
          </Block>

          <Block title="Team">
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {startup.team.map((member) => (
                <li key={member.name} className="panel p-5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={member.initials} className="size-10 text-xs" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-fg">{member.name}</p>
                      <p className="text-xs text-subtle">{member.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{member.background}</p>
                  <Chip className="mt-4" icon={<BadgeCheck className="size-3 text-ember" aria-hidden />}>
                    {member.signal}
                  </Chip>
                </li>
              ))}
            </ul>
          </Block>

          <Block
            title="Pitch deck"
            aside={
              <Link to={`/pitch/${startup.id}`} className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
                Deck analytics <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            }
          >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {deck.slides.map((slide, i) => (
                <li key={slide.key}>
                  <Link to={`/pitch/${startup.id}`} className="group block">
                    <div className="overflow-hidden rounded-lg ring-1 ring-line transition-shadow group-hover:ring-white/25">
                      <div aria-hidden>
                        <SlideCanvas slide={slide} index={i} startup={startup} deck={deck} />
                      </div>
                    </div>
                    <p className="mt-2 flex justify-between text-xs">
                      <span className="text-muted">{slide.label}</span>
                      <span className="font-mono tabular-nums text-subtle">{formatClock(slide.dwell)}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-subtle">
              {deck.viewers} investor views · {deck.completed} finished · average {formatClock(deck.avgSeconds)}
            </p>
          </Block>

          <Block title="Endorsements">
            <ul className="grid gap-4 md:grid-cols-2">
              {startup.endorsements.map((endorsement) => (
                <li key={endorsement.author} className="panel flex flex-col p-6">
                  <Quote className="size-4 text-ember" aria-hidden />
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-fg">“{endorsement.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fg">{endorsement.author}</p>
                      <p className="truncate text-xs text-subtle">{endorsement.role}</p>
                    </div>
                    <Chip icon={<BadgeCheck className="size-3 text-ember" aria-hidden />}>{endorsement.kind}</Chip>
                  </div>
                </li>
              ))}
            </ul>
          </Block>
        </div>

        <aside aria-label={`Why ${startup.name} matches you`} className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-6">
            <MatchDetail startup={startup} showProfileLink={false} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Block({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  const id = `block-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <Reveal>
      <section aria-labelledby={id}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id={id} className="eyebrow text-subtle">
            {title}
          </h2>
          {aside}
        </div>
        {children}
      </section>
    </Reveal>
  );
}
