import { startups } from "../../data/startups";
import { createRng } from "../../lib/utils";

export type NodeKind = "founder" | "investor" | "ecell" | "mentor" | "event" | "noise";

export interface GraphNode {
  id: number;
  kind: NodeKind;
  label: string;
  meta: string;
  /** home position inside the constellation, unit space */
  u: number;
  v: number;
  /** scattered position used for the "noise" beat, unit space of the whole canvas */
  nu: number;
  nv: number;
  /** depth 0 (far) → 1 (near) */
  z: number;
  phase: number;
  speed: number;
  amp: number;
  introDelay: number;
  verified: boolean;
  proof: boolean;
  isYou: boolean;
  matchIndex: number;
  startupId?: string;
  // Runtime values written by the renderer each frame.
  px: number;
  py: number;
  ox: number;
  oy: number;
  alpha: number;
  radius: number;
  ember: number;
}

export interface WarmthDetail {
  warmth: number;
  counterpart: number;
  via: number;
  mentors: number;
  network: string;
  events: number;
  thesis: number;
}

export interface NetworkModel {
  nodes: GraphNode[];
  edges: [number, number][];
  verifyEdges: [number, number][];
  warmPaths: { via: number; to: number; warmth: number }[];
  details: Map<number, WarmthDetail>;
  you: number;
  matches: number[];
  /** nodes the hero cycles through when nobody is hovering */
  featured: number[];
}

const shortProof = (id: string) => {
  const s = startups.find((x) => x.id === id)!;
  return { name: s.name, startupId: s.id, meta: `${s.industry} · ${s.stage}`, warmth: s.warmth, proof: `${s.highlight.value} ${s.highlight.label.split(",")[0]}` };
};

/** The short list the story resolves into — sourced from the same data as the product. */
export const MATCHES = ["nova", "forge-ai", "orbit", "layer"].map(shortProof);

export const STAGE_COUNTS = [4812, 4812, 312, 48, 12, 4];

const FOUNDER_NAMES = [
  "Kestrel", "Lumen", "Tessera", "Quill", "Fathom", "Relay", "Sable", "Halo", "Vector", "Pilot", "Loom", "Drift",
  "Ridge", "Crest", "Delta", "Echo", "Frame", "Harbor", "Indigo", "Juno", "Kite", "Lattice", "Nimbus", "Onyx",
  "Prism", "Quanta", "Rivet", "Sprout", "Tandem", "Umbra", "Verve", "Wisp", "Yonder", "Zephyr", "Basalt", "Cobalt",
  "Dune", "Flint", "Garnet", "Helix", "Iris", "Jasper", "Koda", "Lyra", "Mantra", "Nectar", "Opal", "Pebble",
  "Quartz", "Rune", "Tide", "Uplink", "Vanta", "Willow", "Aster", "Bramble", "Cirrus", "Dahlia", "Fable", "Grove",
  "Hollow", "Ivory", "Jetty", "Kiln Labs",
];
const SECTORS = ["AI Infrastructure", "Developer Tools", "Climate", "Fintech", "Healthtech", "Edtech", "Robotics", "Commerce", "Agritech", "Security"];
const INVESTOR_NAMES = [
  "Juniper Fund", "Saffron Angels", "Cobalt Partners", "Vela Capital", "Harbor Seed", "Tamarind Ventures", "Lighthouse Angels",
  "Summit Syndicate", "Aurora Capital", "Kestrel Partners", "Banyan Angels", "Tidewater Capital", "Northstar Capital",
  "Monsoon Syndicate", "Granite Seed", "Palisade Fund",
];
const ECELLS = ["E-Cell KIT", "E-Cell DTU", "E-Cell SIT", "E-Cell ASE", "E-Cell KID", "E-Cell NCS", "E-Cell SVIT"];
const MENTORS = ["Vikram Menon", "Ananya Rao", "Rohan Bhatt", "Farah Siddiqui", "Meghna Iyer", "Karthik Reddy", "Neha Kulkarni", "Imran Qureshi", "Pooja Desai", "Dhruv Menon", "Anil Varma", "Ritu Agarwal"];
const EVENTS = ["HackBLR 2026", "KIT Demo Day", "Infra Summit", "FOSS Meetup Pune", "Climate Week", "React India", "Fintech Fest", "D2C Summit", "Skills Summit"];
const NETWORKS = ["KIT Bengaluru alumni", "DTU Hyderabad alumni", "Pune builder network", "SIT Ahmedabad alumni", "Chennai OSS guild", "Mumbai operator circle"];

const DENSITY = {
  dense: { founder: 64, investor: 16, ecell: 7, mentor: 12, event: 9, noise: 72 },
  light: { founder: 34, investor: 9, ecell: 4, mentor: 7, event: 5, noise: 34 },
} as const;

const TAU = Math.PI * 2;

export function buildNetwork(density: keyof typeof DENSITY): NetworkModel {
  const rng = createRng(density === "dense" ? 7 : 19);
  const counts = DENSITY[density];
  const nodes: GraphNode[] = [];
  const placed: { u: number; v: number }[] = [];

  const bestCandidate = () => {
    let best = { u: 0.5, v: 0.5 };
    let bestDistance = -1;
    for (let c = 0; c < 12; c++) {
      const angle = rng() * TAU;
      const radius = Math.pow(rng(), 0.6) * 0.5;
      const u = 0.5 + Math.cos(angle) * radius;
      const v = 0.5 + Math.sin(angle) * radius;
      let nearest = Infinity;
      for (const p of placed) {
        const d = (p.u - u) ** 2 + (p.v - v) ** 2;
        if (d < nearest) nearest = d;
      }
      if (nearest > bestDistance) {
        bestDistance = nearest;
        best = { u, v };
      }
    }
    placed.push(best);
    return best;
  };

  const add = (kind: NodeKind, label: string, meta: string) => {
    const { u, v } =
      kind === "noise" ? { u: -0.1 + rng() * 1.2, v: -0.08 + rng() * 1.16 } : bestCandidate();
    const distance = Math.hypot(u - 0.5, v - 0.5);
    nodes.push({
      id: nodes.length,
      kind,
      label,
      meta,
      u,
      v,
      nu: 0.02 + rng() * 0.96,
      nv: 0.02 + rng() * 0.96,
      z: rng(),
      phase: rng() * TAU,
      speed: 0.25 + rng() * 0.45,
      amp: kind === "noise" ? 5 + rng() * 5 : 2 + rng() * 3.5,
      introDelay: 0.15 + distance * 1.5 + rng() * 0.25,
      verified: false,
      proof: false,
      isYou: false,
      matchIndex: -1,
      px: 0,
      py: 0,
      ox: 0,
      oy: 0,
      alpha: 0,
      radius: 0,
      ember: 0,
    });
  };

  for (let i = 0; i < counts.ecell; i++) add("ecell", ECELLS[i % ECELLS.length], "Institutional verifier");
  for (let i = 0; i < counts.investor; i++) add("investor", INVESTOR_NAMES[i % INVESTOR_NAMES.length], rng() > 0.5 ? "Pre-Seed · $250K–$1M" : "Seed · $500K–$2M");
  for (let i = 0; i < counts.mentor; i++) add("mentor", MENTORS[i % MENTORS.length], "Mentor");
  for (let i = 0; i < counts.event; i++) add("event", EVENTS[i % EVENTS.length], "Event");
  for (let i = 0; i < counts.founder; i++) {
    add("founder", FOUNDER_NAMES[i % FOUNDER_NAMES.length], `${SECTORS[Math.floor(rng() * SECTORS.length)]} · ${rng() > 0.35 ? "Pre-Seed" : "Seed"}`);
    nodes[nodes.length - 1].verified = rng() < 0.4;
  }
  for (let i = 0; i < counts.noise; i++) add("noise", "", "");

  const ofKind = (kind: NodeKind) => nodes.filter((n) => n.kind === kind);
  const nearest = (u: number, v: number, pool: GraphNode[], exclude = new Set<number>()) => {
    let best = pool[0];
    let bestD = Infinity;
    for (const n of pool) {
      if (exclude.has(n.id)) continue;
      const d = (n.u - u) ** 2 + (n.v - v) ** 2;
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    return best;
  };

  const founders = ofKind("founder");
  const investors = ofKind("investor");
  const intermediates = nodes.filter((n) => n.kind === "mentor" || n.kind === "ecell" || n.kind === "event");

  // "You" sits on the constellation's left flank so warm paths sweep across it.
  const you = nearest(0.14, 0.5, investors);
  you.isYou = true;
  you.label = "Halcyon Ventures";
  you.meta = "You · Pre-Seed to Seed";

  // The four matches, spread across the cloud.
  const used = new Set<number>();
  const targets = [
    [0.7, 0.24],
    [0.86, 0.52],
    [0.6, 0.76],
    [0.46, 0.4],
  ];
  const matches = targets.map(([u, v], i) => {
    const n = nearest(u, v, founders, used);
    used.add(n.id);
    Object.assign(n, { verified: true, proof: true, matchIndex: i, label: MATCHES[i].name, meta: MATCHES[i].meta, startupId: MATCHES[i].startupId });
    return n.id;
  });

  const others = founders.filter((f) => f.verified && !used.has(f.id));
  others.slice(0, density === "dense" ? 6 : 3).forEach((f) => (f.proof = true));

  const featuredInvestor = nearest(0.6, 0.5, investors, new Set([you.id]));
  featuredInvestor.label = "Arjun Ventures";
  featuredInvestor.meta = "Micro VC · $250K–$750K";
  const meridian = nearest(0.35, 0.8, investors, new Set([you.id, featuredInvestor.id]));
  meridian.label = "Meridian Seed";
  meridian.meta = "Seed · $1M–$2M";

  // Constellation edges: each node to its two nearest non-noise neighbours.
  const edgeKeys = new Set<string>();
  const edges: [number, number][] = [];
  const structural = nodes.filter((n) => n.kind !== "noise");
  for (const a of structural) {
    const ranked = structural
      .filter((b) => b.id !== a.id)
      .map((b) => ({ b, d: Math.hypot(a.u - b.u, a.v - b.v) }))
      .sort((x, y) => x.d - y.d)
      .slice(0, 2);
    for (const { b, d } of ranked) {
      if (d > 0.2) continue;
      const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push([a.id, b.id]);
    }
  }

  const ecells = ofKind("ecell");
  const verifyEdges: [number, number][] = founders
    .filter((f) => f.verified)
    .map((f) => [nearest(f.u, f.v, ecells).id, f.id]);

  const warmPaths = founders
    .filter((f) => f.proof)
    .map((f) => ({
      via: nearest((you.u + f.u) / 2, (you.v + f.v) / 2, intermediates).id,
      to: f.id,
      warmth: f.matchIndex >= 0 ? MATCHES[f.matchIndex].warmth : 38 + Math.round(rng() * 26),
    }));

  // Warmth details for every founder and investor, with three hand-written showcase pairs.
  const details = new Map<number, WarmthDetail>();
  for (const n of [...founders, ...investors]) {
    const pool = n.kind === "founder" ? investors : founders.filter((f) => f.verified);
    const counterpart = nearest(n.u + (rng() - 0.5) * 0.3, n.v + (rng() - 0.5) * 0.3, pool, new Set([n.id]));
    details.set(n.id, {
      warmth: 46 + Math.round(rng() * 38),
      counterpart: counterpart.id,
      via: nearest((n.u + counterpart.u) / 2, (n.v + counterpart.v) / 2, intermediates).id,
      mentors: Math.floor(rng() * 3),
      network: NETWORKS[Math.floor(rng() * NETWORKS.length)],
      events: Math.floor(rng() * 4),
      thesis: 55 + Math.round(rng() * 38),
    });
  }

  const nova = nodes[matches[0]];
  const forge = nodes[matches[1]];
  const orbit = nodes[matches[2]];
  const via = (a: GraphNode, b: GraphNode) => nearest((a.u + b.u) / 2, (a.v + b.v) / 2, intermediates).id;
  details.set(nova.id, { warmth: 87, counterpart: you.id, via: via(nova, you), mentors: 2, network: "KIT Bengaluru alumni", events: 3, thesis: 92 });
  details.set(featuredInvestor.id, { warmth: 84, counterpart: forge.id, via: via(featuredInvestor, forge), mentors: 1, network: "Pune builder network", events: 2, thesis: 94 });
  details.set(orbit.id, { warmth: 79, counterpart: meridian.id, via: via(orbit, meridian), mentors: 3, network: "DTU Hyderabad alumni", events: 1, thesis: 90 });

  return {
    nodes,
    edges,
    verifyEdges,
    warmPaths,
    details,
    you: you.id,
    matches,
    featured: [nova.id, featuredInvestor.id, orbit.id],
  };
}
