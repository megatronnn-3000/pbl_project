export type Track = "ecell" | "builder";
export type Stage = "Pre-Seed" | "Seed";

export interface ScoreBreakdown {
  trust: number;
  traction: number;
  velocity: number;
  warmth: number;
}

export interface Telemetry {
  commits: number;
  commitsThisWeek: number;
  pullRequests: number;
  deployments: number;
  contributors: number;
  wau: number;
  wauGrowth: number;
  mrr: number;
  mrrGrowth: number;
  velocity: number;
  /** 12 weekly points, oldest first */
  wauSeries: number[];
  commitSeries: number[];
  deploySeries: number[];
  /** 12 monthly points in ₹ */
  mrrSeries: number[];
  /** 26 weeks × 7 days of commit intensity, 0–4 */
  contributions: number[];
}

export interface Credential {
  label: string;
  detail: string;
  issuer: string;
  date: string;
}

export interface TeamMember {
  name: string;
  initials: string;
  role: string;
  background: string;
  signal: string;
}

export interface Endorsement {
  author: string;
  role: string;
  quote: string;
  kind: "Director" | "Mentor" | "Customer" | "Community";
}

export type WarmthKey = "contacts" | "alma" | "events" | "thesis";

export interface WarmthFactor {
  key: WarmthKey;
  label: string;
  detail: string;
  nodes: string[];
  points: number;
  max: number;
}

export interface Startup {
  id: string;
  name: string;
  monogram: string;
  tagline: string;
  summary: string;
  track: Track;
  stage: Stage;
  industry: string;
  city: string;
  founded: number;
  institution?: string;
  ecell?: { name: string; cohort: string; rank: number; cohortSize: number };
  scores: ScoreBreakdown;
  signal: number;
  warmth: number;
  highlight: { value: string; label: string };
  sharedConnections: number;
  raising: { amount: number; instrument: string; cap: number; committed: number };
  telemetry: Telemetry;
  credentials: Credential[];
  warmthFactors: WarmthFactor[];
  team: TeamMember[];
  endorsements: Endorsement[];
  matchReasons: string[];
}

export interface Investor {
  id: string;
  name: string;
  monogram: string;
  kind: string;
  partner: string;
  thesis: string;
  focus: string[];
  checkMin: number;
  checkMax: number;
  city: string;
  portfolio: number;
}

export interface InvestorMatch {
  investorId: string;
  warmth: number;
  overlap: number;
  reason: string;
  path: string;
  sharedNodes: number;
}
