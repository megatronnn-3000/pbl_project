import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useOutlet } from "react-router";
import { viewer } from "../../data/investors";
import { cn } from "../../lib/utils";
import { Logo, LogoMark } from "../brand/Logo";
import { DemoBadge } from "../ui/primitives";
import { CommandPalette } from "./CommandPalette";
import { Footer } from "./Footer";

const appNav = [
  { to: "/explore", label: "Explore" },
  { to: "/investor", label: "Dashboard" },
  { to: "/copilot", label: "Copilot" },
  { to: "/deal-room", label: "Deal Room" },
];

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

export function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <LogoMark animated className="size-8 text-fg" />
        <span className="eyebrow text-subtle">Resolving signal</span>
      </div>
    </div>
  );
}

function NavItems({ layoutId }: { layoutId: string }) {
  return (
    <>
      {appNav.map((item) => (
        <li key={item.to} className="shrink-0">
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex h-11 items-center px-3 text-[13.5px] transition-colors duration-300 md:h-14",
                isActive ? "text-fg" : "text-subtle hover:text-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-x-3 -bottom-px h-px bg-ember"
                    transition={{ type: "spring", stiffness: 400, damping: 36 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </>
  );
}

export function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="container-page flex h-14 items-center gap-5">
          <Link to="/" aria-label="Ignite home" className="shrink-0 rounded-md">
            <Logo />
          </Link>
          <span aria-hidden className="hidden h-5 w-px bg-line-strong md:block" />
          <nav aria-label="Product" className="hidden md:block">
            <ul className="flex items-center">
              <NavItems layoutId="app-nav-desktop" />
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden h-9 w-64 items-center gap-2.5 rounded-full border border-line bg-white/[0.02] px-3.5 text-left text-[13px] text-subtle transition-colors duration-300 hover:border-line-strong hover:text-muted lg:flex"
            >
              <Search className="size-3.5" aria-hidden />
              <span className="flex-1">Search or ask Copilot</span>
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-nano">{isMac ? "⌘K" : "Ctrl K"}</kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search or ask Copilot"
              className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-fg lg:hidden"
            >
              <Search className="size-4" />
            </button>
            <DemoBadge className="hidden sm:inline-flex" />
            <Link
              to="/investor"
              aria-label={`${viewer.name}, ${viewer.firm}`}
              title={`${viewer.name} · ${viewer.firm}`}
              className="ml-1 grid size-8 place-items-center rounded-full bg-raised text-[11px] font-medium text-fg ring-1 ring-inset ring-line-strong transition-shadow hover:ring-white/25"
            >
              {viewer.initials}
            </Link>
          </div>
        </div>
        <nav aria-label="Product" className="border-t border-line md:hidden">
          <ul className="container-page no-scrollbar flex overflow-x-auto">
            <NavItems layoutId="app-nav-mobile" />
          </ul>
        </nav>
      </header>

      <main id="main" className="flex-1">
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer compact />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
