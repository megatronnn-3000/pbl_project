import { Link } from "react-router";
import { Logo } from "../brand/Logo";
import { LiveDot } from "../ui/primitives";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Explore startups", to: "/explore" },
      { label: "Investor dashboard", to: "/investor" },
      { label: "Ignite Copilot", to: "/copilot" },
      { label: "Deal rooms", to: "/deal-room" },
      { label: "Pitch analytics", to: "/pitch/nova" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "For founders", to: "/#tracks" },
      { label: "For investors", to: "/#investors" },
      { label: "For E-Cells", to: "/#trust" },
      { label: "How it works", to: "/#story" },
    ],
  },
  {
    title: "Profiles",
    links: [
      { label: "NOVA", to: "/startup/nova" },
      { label: "Forge AI", to: "/startup/forge-ai" },
      { label: "Orbit", to: "/startup/orbit" },
      { label: "Layer", to: "/startup/layer" },
    ],
  },
];

export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="border-t border-line">
      {!compact && (
        <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:py-20">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
              The signal layer for early-stage venture. Verified founders, live proof and quantified warmth — resolved
              into matches worth your time.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="eyebrow text-subtle">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="link-underline text-sm text-muted transition-colors hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Project Ignite · A concept product. Every startup, investor, institution and metric shown is fictional.</p>
          <p className="flex items-center gap-2 font-mono uppercase tracking-[0.12em]">
            <LiveDot />
            All signals nominal
          </p>
        </div>
      </div>
    </footer>
  );
}
