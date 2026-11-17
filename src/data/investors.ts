import type { Investor, InvestorMatch } from "./types";

/** The signed-in demo persona for investor-facing views. */
export const viewer = {
  name: "Rhea Kapoor",
  firstName: "Rhea",
  initials: "RK",
  firm: "Halcyon Ventures",
  role: "Partner",
  checkRange: "$250K–$1M",
  thesis: ["AI infrastructure", "Developer tools", "Usage-based B2B", "Pre-Seed to Seed", "India-first, global market"],
};

export const investors: Investor[] = [
  {
    id: "arjun",
    name: "Arjun Ventures",
    monogram: "AV",
    kind: "Micro VC",
    partner: "Dev Malhotra",
    thesis: "Developer infrastructure and AI tooling built in India for global engineering teams.",
    focus: ["Developer infrastructure", "AI tooling", "Open source"],
    checkMin: 250_000,
    checkMax: 750_000,
    city: "Bengaluru",
    portfolio: 31,
  },
  {
    id: "northstar",
    name: "Northstar Capital",
    monogram: "NC",
    kind: "Venture fund",
    partner: "Anika Sen",
    thesis: "Pre-seed developer infrastructure with bottoms-up adoption.",
    focus: ["Developer infrastructure", "Security", "Data tooling"],
    checkMin: 500_000,
    checkMax: 1_000_000,
    city: "Mumbai",
    portfolio: 44,
  },
  {
    id: "kestrel",
    name: "Kestrel Partners",
    monogram: "KP",
    kind: "Venture fund",
    partner: "Omar Farooq",
    thesis: "Usage-based B2B infrastructure with technical founders.",
    focus: ["B2B infrastructure", "Usage-based SaaS"],
    checkMin: 300_000,
    checkMax: 1_000_000,
    city: "Delhi NCR",
    portfolio: 27,
  },
  {
    id: "banyan",
    name: "Banyan Angels Collective",
    monogram: "BA",
    kind: "Angel syndicate",
    partner: "Sana Qureshi",
    thesis: "Operator angels backing first-time technical founders from campus ecosystems.",
    focus: ["Campus founders", "AI applications", "Developer tools"],
    checkMin: 100_000,
    checkMax: 400_000,
    city: "Pune",
    portfolio: 58,
  },
  {
    id: "meridian",
    name: "Meridian Seed",
    monogram: "MS",
    kind: "Seed fund",
    partner: "Vivek Iyer",
    thesis: "Climate, agriculture and rural financial infrastructure.",
    focus: ["Climate", "Agritech", "Rural fintech"],
    checkMin: 1_000_000,
    checkMax: 2_000_000,
    city: "Hyderabad",
    portfolio: 22,
  },
  {
    id: "tidewater",
    name: "Tidewater Capital",
    monogram: "TC",
    kind: "Venture fund",
    partner: "Leah D'Souza",
    thesis: "Financial infrastructure and regulated software.",
    focus: ["Fintech infrastructure", "RegTech"],
    checkMin: 750_000,
    checkMax: 2_500_000,
    city: "Mumbai",
    portfolio: 36,
  },
];

export const investorById = (id: string) => investors.find((i) => i.id === id);

/** Copilot results for NOVA's founder searching dev-infra pre-seed investors. */
export const copilotInvestorMatches: InvestorMatch[] = [
  { investorId: "arjun", warmth: 92, overlap: 94, reason: "Strong thesis overlap", path: "via Vikram Menon", sharedNodes: 2 },
  { investorId: "northstar", warmth: 88, overlap: 90, reason: "Developer infrastructure", path: "1 warm introduction", sharedNodes: 1 },
  { investorId: "kestrel", warmth: 83, overlap: 85, reason: "Usage-based B2B", path: "2 shared events", sharedNodes: 2 },
  { investorId: "banyan", warmth: 79, overlap: 81, reason: "Backs campus founders", path: "E-Cell KIT alumni", sharedNodes: 3 },
];
