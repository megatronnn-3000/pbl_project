export const defaultQuery =
  "Find investors interested in developer infrastructure with pre-seed checks between $250K–$1M.";

export const querySuggestions = [
  "Angels who back first-time campus founders in AI tooling",
  "Seed funds with climate theses and $1M+ checks",
  "Investors warm to NOVA through the KIT network",
];

export const copilotSteps = ["Parsing thesis", "Scanning 312 verified profiles", "Ranking by warmth and overlap"];

export type HealthStatus = "pass" | "flag";

export const pitchHealth: { label: string; status: HealthStatus; note: string }[] = [
  { label: "Problem clarity", status: "pass", note: "Stated in one sentence on slide 1." },
  { label: "Product differentiation", status: "pass", note: "Clear contrast with enterprise platforms." },
  { label: "CAC / LTV", status: "flag", note: "CAC is blended. Split paid and organic channels." },
  { label: "Market sizing", status: "flag", note: "TAM is top-down only. Add a bottom-up build." },
  { label: "Traction", status: "pass", note: "Verified WAU and MRR from connected sources." },
];

export const updateLog = [
  "Crossed 3,000 WAU (+38% in 30 days)",
  "Shipped GPU autoscaling to all paying teams",
  "Signed 2 new design partners (fintech, healthtech)",
  "Hiring: senior infra engineer",
];

export const generatedUpdate = {
  subject: "NOVA — September update",
  sections: [
    {
      heading: "Highlights",
      body: "Weekly active users crossed 3,120, up 38% over 30 days. MRR reached ₹4.2L (+22% month on month) with gross margin now at 74%.",
    },
    {
      heading: "Product",
      body: "GPU autoscaling is live for every paying team, cutting median inference cost by 31%. Deploys per team rose from 3.1 to 4.4 a week.",
    },
    {
      heading: "Asks",
      body: "Introductions to platform leads at 20–100 person fintechs, and senior infra engineers who want to build from zero.",
    },
  ],
};
