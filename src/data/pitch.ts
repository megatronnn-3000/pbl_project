import { formatINR, formatUSD } from "../lib/format";
import { createRng, hashString } from "../lib/utils";
import type { Startup } from "./types";

export type SlideKey = "team" | "market" | "product" | "traction" | "economics" | "ask";

export interface DeckSlide {
  key: SlideKey;
  label: string;
  headline: string;
  /** average seconds per investor */
  dwell: number;
  /** % of viewers who reached this slide */
  retention: number;
  questions: number;
}

export interface DeckQuestion {
  slide: SlideKey;
  author: string;
  org: string;
  initials: string;
  text: string;
  time: string;
  /** pin position on the slide, in % */
  pin: { x: number; y: number };
}

export interface Deck {
  startupId: string;
  version: number;
  viewers: number;
  completed: number;
  avgSeconds: number;
  slides: DeckSlide[];
  questions: DeckQuestion[];
  insight: string;
  market: { tam: string; sam: string; som: string };
  economics: { marginFrom: number; marginTo: number; cac: string; ltv: string; ratio: string; payback: string };
  command: string;
  useOfFunds: { label: string; pct: number }[];
}

const novaDeck: Deck = {
  startupId: "nova",
  version: 3,
  viewers: 18,
  completed: 11,
  avgSeconds: 848,
  slides: [
    { key: "team", label: "Team", headline: "Infra engineers who have scaled systems to 40M users.", dwell: 5, retention: 100, questions: 0 },
    { key: "market", label: "Market", headline: "38M developers work in teams too small for enterprise AI infra.", dwell: 102, retention: 97, questions: 1 },
    { key: "product", label: "Product", headline: "One command from notebook to production.", dwell: 138, retention: 94, questions: 0 },
    { key: "traction", label: "Traction", headline: "Weekly active users up 38% in 30 days.", dwell: 251, retention: 89, questions: 1 },
    { key: "economics", label: "Unit Economics", headline: "Gross margin expands as inference costs fall.", dwell: 232, retention: 83, questions: 2 },
    { key: "ask", label: "The Ask", headline: "Raising $750K on a post-money SAFE.", dwell: 71, retention: 61, questions: 0 },
  ],
  questions: [
    {
      slide: "economics",
      author: "Anika Sen",
      org: "Northstar Capital",
      initials: "AS",
      text: "Can you explain the margin expansion here?",
      time: "2h ago",
      pin: { x: 71, y: 38 },
    },
    {
      slide: "traction",
      author: "Dev Malhotra",
      org: "Arjun Ventures",
      initials: "DM",
      text: "Is WAU counted per seat or per workspace?",
      time: "1d ago",
      pin: { x: 78, y: 30 },
    },
    {
      slide: "market",
      author: "Sana Qureshi",
      org: "Banyan Angels",
      initials: "SQ",
      text: "How does SAM change if you include Southeast Asia?",
      time: "3d ago",
      pin: { x: 64, y: 58 },
    },
  ],
  insight: "Investors spend 5 seconds on Team. Moving it after Traction lifts completion in similar decks.",
  market: { tam: "$14B", sam: "$3.1B", som: "$210M" },
  economics: { marginFrom: 61, marginTo: 74, cac: "₹18K", ltv: "₹2.1L", ratio: "11.6×", payback: "4.2 mo" },
  command: "nova deploy ./agent --gpu auto",
  useOfFunds: [
    { label: "Engineering", pct: 55 },
    { label: "Go-to-market", pct: 30 },
    { label: "Infrastructure", pct: 15 },
  ],
};

/** Every startup gets a deck; NOVA's is hand-tuned, the rest derive plausibly from their profile. */
export function getDeck(startup: Startup): Deck {
  if (startup.id === novaDeck.startupId) return novaDeck;
  const rng = createRng(hashString(startup.id));
  const jitter = (base: number, spread: number) => Math.round(base + (rng() - 0.5) * spread);
  const t = startup.telemetry;
  return {
    ...novaDeck,
    startupId: startup.id,
    version: 1 + Math.floor(rng() * 3),
    viewers: jitter(12, 10),
    completed: jitter(7, 6),
    avgSeconds: jitter(720, 240),
    slides: [
      { key: "team", label: "Team", headline: `${startup.team[0].name.split(" ")[0]} and team: ${startup.team[0].background.toLowerCase()}`, dwell: jitter(24, 30), retention: 100, questions: 0 },
      { key: "market", label: "Market", headline: `Why ${startup.industry.toLowerCase()} is ready now.`, dwell: jitter(96, 50), retention: 95, questions: 1 },
      { key: "product", label: "Product", headline: startup.tagline, dwell: jitter(120, 60), retention: 91, questions: 0 },
      { key: "traction", label: "Traction", headline: `${startup.highlight.value} ${startup.highlight.label}.`, dwell: jitter(210, 80), retention: 86, questions: 1 },
      { key: "economics", label: "Unit Economics", headline: "Margins improve with scale.", dwell: jitter(180, 80), retention: 79, questions: 1 },
      { key: "ask", label: "The Ask", headline: `Raising ${formatUSD(startup.raising.amount)} — ${startup.raising.instrument.toLowerCase()}.`, dwell: jitter(70, 30), retention: 64, questions: 0 },
    ],
    questions: novaDeck.questions.slice(0, 2),
    insight: "Traction and Unit Economics hold attention longest. Lead your follow-up email with them.",
    market: { tam: `$${jitter(9, 8)}B`, sam: `$${(1 + rng() * 3).toFixed(1)}B`, som: `$${jitter(160, 80)}M` },
    economics: { marginFrom: jitter(52, 10), marginTo: jitter(70, 8), cac: formatINR(jitter(22_000, 8000)), ltv: formatINR(jitter(180_000, 60_000)), ratio: `${(6 + rng() * 6).toFixed(1)}×`, payback: `${(3 + rng() * 4).toFixed(1)} mo` },
    command: `${startup.name.toLowerCase().replace(/\s+/g, "-")} init --team`,
    useOfFunds: novaDeck.useOfFunds,
    // Kept roughly consistent with telemetry so the traction slide reads true.
    ...(t.wauGrowth > 40 ? { insight: "Traction holds attention 3× longer than Market. Consider opening with it." } : {}),
  };
}
