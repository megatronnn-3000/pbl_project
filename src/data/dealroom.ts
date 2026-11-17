export const deal = {
  startupId: "nova",
  title: "NOVA × Halcyon Ventures",
  round: "Pre-Seed",
  instrument: "Post-money SAFE",
  target: 750_000,
  cap: 8_000_000,
  committed: 465_000,
  closeDate: "Oct 18, 2026",
};

export type NdaStatus = "Owner" | "Signed" | "Pending";

export const participants: { name: string; initials: string; org: string; role: string; nda: NdaStatus; commitment?: number }[] = [
  { name: "Aarav Shah", initials: "AS", org: "NOVA", role: "Founder", nda: "Owner" },
  { name: "Rhea Kapoor", initials: "RK", org: "Halcyon Ventures", role: "Lead investor", nda: "Signed", commitment: 300_000 },
  { name: "Dev Malhotra", initials: "DM", org: "Arjun Ventures", role: "Co-investor", nda: "Signed", commitment: 125_000 },
  { name: "Sana Qureshi", initials: "SQ", org: "Banyan Angels", role: "Syndicate", nda: "Pending", commitment: 40_000 },
];

export type AccessTier = "Teaser" | "Full" | "Legal";

export const dataRoomFiles: { name: string; kind: string; tier: AccessTier; size: string; views: number; updated: string }[] = [
  { name: "NOVA — Pre-Seed deck v3", kind: "PDF", tier: "Teaser", size: "4.2 MB", views: 18, updated: "2 days ago" },
  { name: "One-pager & traction summary", kind: "PDF", tier: "Teaser", size: "680 KB", views: 23, updated: "2 days ago" },
  { name: "Financial model FY26–FY28", kind: "XLSX", tier: "Full", size: "1.1 MB", views: 6, updated: "Yesterday" },
  { name: "Cap table — September 2026", kind: "CSV", tier: "Full", size: "24 KB", views: 5, updated: "Yesterday" },
  { name: "Technical architecture", kind: "PDF", tier: "Full", size: "3.4 MB", views: 4, updated: "5 days ago" },
  { name: "Customer references (3)", kind: "PDF", tier: "Full", size: "910 KB", views: 3, updated: "Today" },
  { name: "Mutual NDA — executed", kind: "PDF", tier: "Legal", size: "210 KB", views: 4, updated: "Today" },
];

/** Pre-round fully diluted holdings. */
export const capTableHolders = [
  { key: "founders", label: "Founders", shares: 7_200_000 },
  { key: "esop", label: "Option pool", shares: 1_000_000 },
  { key: "angels", label: "Early angels", shares: 600_000 },
] as const;

export const qaThreads = [
  { question: "Can you explain the margin expansion on slide 5?", author: "Anika Sen · Northstar Capital", status: "Answered", replies: 3, time: "2h" },
  { question: "What does GPU spend look like at 10× current usage?", author: "Rhea Kapoor · Halcyon Ventures", status: "Open", replies: 1, time: "5h" },
  { question: "Is the KIT Innovation Fund grant tied to any IP assignment?", author: "Dev Malhotra · Arjun Ventures", status: "Answered", replies: 2, time: "1d" },
];

export const activity = [
  { who: "Rhea Kapoor", what: "modelled a $300K SAFE at an $8M cap", time: "12 min ago" },
  { who: "Aarav Shah", what: "uploaded Customer references (3)", time: "1 hr ago" },
  { who: "Dev Malhotra", what: "signed the mutual NDA", time: "3 hr ago" },
  { who: "Anika Sen", what: "spent 03:52 on Unit Economics", time: "5 hr ago" },
  { who: "Sana Qureshi", what: "was invited to the room", time: "Yesterday" },
];
