import { ArrowUpRight, Bookmark, Clock, FolderLock, Handshake, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { MatchDetail, MatchList } from "../components/product/MatchFeed";
import { WindowChrome } from "../components/product/WindowChrome";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";
import { viewer } from "../data/investors";
import { startups } from "../data/startups";
import { useReducedMotionPref } from "../hooks/useMediaQuery";
import { cn } from "../lib/utils";

const feed = startups.slice(0, 4);

const SIDEBAR = [
  { icon: Sparkles, label: "Recommended", count: 24, active: true },
  { icon: Bookmark, label: "Saved", count: 6 },
  { icon: Clock, label: "Recently viewed", count: 11 },
  { icon: Handshake, label: "Warm intros", count: 3 },
  { icon: FolderLock, label: "Deal rooms", count: 2 },
];

export function InvestorFeed() {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  const [selectedId, setSelectedId] = useState(feed[0].id);
  const [saved, setSaved] = useState<Set<string>>(() => new Set(["orbit"]));
  const selected = feed.find((s) => s.id === selectedId) ?? feed[0];

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "start 30%"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.35, 1]);

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section id="investors" aria-labelledby="investors-title" className="relative scroll-mt-16 py-28 sm:py-36 lg:py-44">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionIntro
            id="investors-title"
            eyebrow="For investors"
            title={
              <>
                Your deal flow, <span className="text-subtle">pre-filtered.</span>
              </>
            }
            description="Warmth and proof lead every row. Descriptions come second — the way a partner actually triages a Monday morning."
          />
          <Reveal delay={0.15} className="lg:pb-2">
            <Button to="/investor" variant="secondary" icon={<ArrowUpRight className="size-4" />}>
              Open the dashboard
            </Button>
          </Reveal>
        </div>

        <div ref={frameRef} className="mt-14 [perspective:1800px] lg:mt-20">
          <motion.div style={reduced ? undefined : { rotateX, scale, opacity }} className="window origin-top overflow-hidden">
            <WindowChrome path="ignite.app/investor/recommended" />
            <div className="grid lg:grid-cols-[13.5rem_minmax(0,1fr)] xl:grid-cols-[13.5rem_minmax(0,1fr)_21rem]">
              <aside aria-label="Dashboard sections" className="hidden border-r border-line p-4 lg:block">
                <div className="flex items-center gap-2.5 px-2 py-1.5">
                  <span className="grid size-7 place-items-center rounded-full bg-raised text-[10px] font-medium text-fg ring-1 ring-inset ring-line-strong">
                    {viewer.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-fg">{viewer.name}</p>
                    <p className="truncate text-[11px] text-subtle">{viewer.firm}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-0.5">
                  {SIDEBAR.map((item) => (
                    <li
                      key={item.label}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px]",
                        item.active ? "bg-white/[0.05] text-fg" : "text-subtle",
                      )}
                    >
                      <item.icon className={cn("size-3.5", item.active ? "text-ember" : "")} aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      <span className="font-mono text-nano tabular-nums">{item.count}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-line px-2 pt-5">
                  <p className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">Thesis · parsed</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {viewer.thesis.slice(0, 3).map((t) => (
                      <li key={t} className="rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-muted">
                        {t}
                      </li>
                    ))}
                    <li className="rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-muted">{viewer.checkRange}</li>
                  </ul>
                </div>
              </aside>

              <div className="min-w-0">
                <div className="flex flex-wrap items-end justify-between gap-4 px-4 pb-4 pt-6 sm:px-5">
                  <div>
                    <p className="eyebrow text-subtle">Matches for you</p>
                    <p className="mt-2 text-xl font-medium tracking-tight text-fg">
                      24 high-signal matches <span className="text-subtle">this week</span>
                    </p>
                  </div>
                  <p className="font-mono text-nano uppercase tracking-[0.14em] text-subtle">Sorted by warmth · updated 4 min ago</p>
                </div>
                <div className="hidden grid-cols-[5rem_minmax(0,1fr)_9.5rem_4.5rem_4.5rem] gap-x-4 border-y border-line px-5 py-2 font-mono text-nano uppercase tracking-[0.14em] text-subtle md:grid">
                  <span>Warmth</span>
                  <span>Startup</span>
                  <span>Signal</span>
                  <span>WAU</span>
                  <span className="sr-only">Actions</span>
                </div>
                <MatchList
                  startups={feed}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  saved={saved}
                  onToggleSave={toggleSave}
                  selectOnHover
                  className="border-t border-line md:border-t-0"
                />
                <div className="border-t border-line p-5 xl:hidden">
                  <MatchDetail startup={selected} />
                </div>
              </div>

              <aside aria-label="Match details" className="hidden border-l border-line p-6 xl:block">
                <MatchDetail startup={selected} />
              </aside>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
