import { clamp, lerp, smoothstep } from "../../lib/utils";
import { MATCHES, STAGE_COUNTS, type GraphNode, type NetworkModel, type NodeKind } from "./network";

/*
 * Canvas renderer for the landing narrative.
 * Stage clock: 0 hero · 1 noise · 2 trust · 3 proof · 4 warmth · 5 match.
 * Everything per-frame (node positions, overlay transforms) bypasses React.
 */

const TAU = Math.PI * 2;

const BASE_ALPHA: Record<NodeKind, number> = { founder: 0.8, investor: 0.92, ecell: 0.82, mentor: 0.62, event: 0.56, noise: 0.22 };
const BASE_RADIUS: Record<NodeKind, number> = { founder: 2.3, investor: 3.6, ecell: 3.4, mentor: 1.9, event: 2.3, noise: 1.05 };

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Point {
  x: number;
  y: number;
}
interface NodeState {
  x: number;
  y: number;
  a: number;
  r: number;
  e: number;
}

export interface StoryElements {
  tooltip: HTMLElement | null;
  captions: (HTMLElement | null)[];
  labels: (HTMLElement | null)[];
  youLabel: HTMLElement | null;
  rows: (HTMLElement | null)[];
  youAnchor: HTMLElement | null;
  hud: HTMLElement | null;
  progressFill: HTMLElement | null;
  steps: (HTMLElement | null)[];
  counter: HTMLElement | null;
  hint: HTMLElement | null;
}

export interface StoryEngineOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  model: NetworkModel;
  getProgress: () => number;
  reduced: boolean;
  desktop: boolean;
  finePointer: boolean;
  elements: StoryElements;
  onActiveChange: (nodeId: number | null) => void;
  onNavigate: (startupId: string) => void;
}

/** Scroll progress → stage clock, holding on every whole stage so each beat can be read. */
export function stageClock(progress: number, reduced: boolean) {
  const raw = clamp(progress) * 5.6;
  const segment = Math.min(Math.floor(raw), 5);
  if (segment >= 5) return 5;
  const frac = raw - segment;
  if (reduced) return segment + (frac > 0.55 ? 1 : 0);
  return segment + smoothstep(0.28, 0.82, frac);
}

const plateau = (t: number, k: number) => smoothstep(k - 0.5, k - 0.1, t) * (1 - smoothstep(k + 0.1, k + 0.5, t));

function mix(e: number) {
  const r = Math.round(237 + (255 - 237) * e);
  const g = Math.round(237 + (106 - 237) * e);
  const b = Math.round(239 + (42 - 239) * e);
  return `${r},${g},${b}`;
}

function quad(ax: number, ay: number, cx: number, cy: number, bx: number, by: number, u: number): Point {
  const v = 1 - u;
  return { x: v * v * ax + 2 * v * u * cx + u * u * bx, y: v * v * ay + 2 * v * u * cy + u * u * by };
}

function cubic(ax: number, ay: number, c1x: number, c1y: number, c2x: number, c2y: number, bx: number, by: number, u: number): Point {
  const v = 1 - u;
  return {
    x: v * v * v * ax + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * bx,
    y: v * v * v * ay + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * by,
  };
}

export function createStoryEngine(options: StoryEngineOptions) {
  const { canvas, container, model, reduced, desktop, finePointer, elements: el } = options;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {}, cycle() {} };

  const nodes = model.nodes;
  const you = nodes[model.you];
  const viaSet = new Set(model.warmPaths.map((p) => p.via));

  let W = 0;
  let H = 0;
  let dpr = 1;
  let field: Rect = { x: 0, y: 0, w: 1, h: 1 };
  let wide: Rect = { x: 0, y: 0, w: 1, h: 1 };
  let youWarm: Point = { x: 0, y: 0 };
  let youMatch: Point = { x: 0, y: 0 };
  let anchors: Point[] = [];
  let fade: CanvasGradient | null = null;
  let fadeRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
  let hitMinX = 0;
  let hitMaxY = Infinity;
  let tipW = 256;
  let tipH = 230;
  let youLabelW = 140;
  let labelWidths: number[] = [];
  let labelHeights: number[] = [];
  let warmEls: (HTMLElement | null)[] = [];
  const labelSlots = [0, 0, 0, 0];

  const start = performance.now();
  const pointer = { x: 0, y: 0, inside: false };
  let clock = 0;
  let hovered = -1;
  let pinned = -1;
  let featuredIndex = 0;
  let lastCycle = start;
  let pauseUntil = 0;
  let lastActive = -2;
  let switchAt = start;
  let focusAmt = 0;
  let lastStep = -2;
  let lastCount = -1;
  let raf = 0;
  let running = false;
  let visible = true;

  const styleCache = new WeakMap<HTMLElement, Record<string, string>>();
  const setStyle = (node: HTMLElement | null | undefined, prop: string, value: string) => {
    if (!node) return;
    let record = styleCache.get(node);
    if (!record) {
      record = {};
      styleCache.set(node, record);
    }
    if (record[prop] === value) return;
    record[prop] = value;
    node.style.setProperty(prop, value);
  };
  const setOpacity = (node: HTMLElement | null | undefined, alpha: number) => {
    const v = alpha < 0.005 ? 0 : alpha > 0.995 ? 1 : Math.round(alpha * 100) / 100;
    setStyle(node, "opacity", String(v));
    setStyle(node, "visibility", v === 0 ? "hidden" : "visible");
  };

  function measure() {
    const rect = container.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));

    if (desktop) {
      field = { x: W * 0.47, y: H * 0.15, w: W * 0.48, h: H * 0.72 };
      wide = { x: W * 0.03, y: H * 0.1, w: W * 0.94, h: H * 0.82 };
      fadeRect = { x: 0, y: 0, w: W * 0.52, h: H };
      fade = ctx!.createLinearGradient(0, 0, fadeRect.w, 0);
      fade.addColorStop(0, "rgba(0,0,0,0.95)");
      fade.addColorStop(0.62, "rgba(0,0,0,0.72)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      hitMinX = W * 0.45;
      hitMaxY = H;
    } else {
      const top = 84;
      // Copy is bottom-anchored on small screens; the graph gets everything above it.
      const heroCopy = el.captions[0];
      const copyTop = heroCopy ? heroCopy.getBoundingClientRect().top - rect.top : H * 0.55;
      const bottom = Math.max(top + 170, copyTop - 28);
      field = { x: W * 0.06, y: top, w: W * 0.88, h: bottom - top };
      wide = { x: W * 0.03, y: top - 8, w: W * 0.94, h: H * 0.86 - top };
      fadeRect = { x: 0, y: bottom - 60, w: W, h: H - bottom + 60 };
      fade = ctx!.createLinearGradient(0, fadeRect.y, 0, bottom + 36);
      fade.addColorStop(0, "rgba(0,0,0,0)");
      fade.addColorStop(1, "rgba(0,0,0,0.96)");
      hitMinX = 0;
      hitMaxY = bottom;
    }
    youWarm = { x: field.x + field.w * (desktop ? 0.06 : 0.08), y: field.y + field.h * 0.5 };

    anchors = el.rows.map((row) => {
      if (!row) return { x: W * 0.7, y: H * 0.5 };
      const r = row.getBoundingClientRect();
      return { x: r.left - rect.left + 14, y: r.top - rect.top + r.height / 2 };
    });
    if (el.youAnchor) {
      const r = el.youAnchor.getBoundingClientRect();
      youMatch = { x: r.left - rect.left + r.width / 2, y: r.top - rect.top + r.height / 2 };
    } else {
      youMatch = youWarm;
    }
    if (el.tooltip) {
      tipW = el.tooltip.offsetWidth || tipW;
      tipH = el.tooltip.offsetHeight || tipH;
    }
    youLabelW = el.youLabel?.offsetWidth || youLabelW;
    labelWidths = el.labels.map((label) => label?.offsetWidth ?? 140);
    labelHeights = el.labels.map((label) => label?.offsetHeight ?? 22);
    warmEls = el.labels.map((label) => label?.querySelector<HTMLElement>("[data-warm]") ?? null);
  }

  function state(n: GraphNode, stage: number): NodeState {
    const hx = field.x + n.u * field.w;
    const hy = field.y + n.v * field.h;
    const depthA = 0.5 + 0.5 * n.z;
    const depthR = 0.72 + 0.56 * n.z;
    const baseR = BASE_RADIUS[n.kind] * depthR;
    const noise = n.kind === "noise";

    switch (stage) {
      case 0:
        return { x: hx, y: hy, a: BASE_ALPHA[n.kind] * depthA, r: baseR, e: 0 };
      case 1:
        return {
          x: wide.x + n.nu * wide.w,
          y: wide.y + n.nv * wide.h,
          a: (noise ? 0.44 : 0.52) * depthA,
          r: noise ? 1.25 : 1.75 * depthR,
          e: 0,
        };
      case 2:
        if (n.kind === "founder" && n.verified) return { x: hx, y: hy, a: 0.95, r: 2.7, e: 1 };
        if (n.kind === "ecell") return { x: hx, y: hy, a: 0.85, r: 3.6, e: 0 };
        return { x: hx, y: hy, a: noise ? 0 : 0.06, r: baseR * 0.8, e: 0 };
      case 3:
        if (n.proof) return { x: hx, y: hy, a: 1, r: n.matchIndex >= 0 ? 4.4 : 3.5, e: 1 };
        if (n.kind === "founder" && n.verified) return { x: hx, y: hy, a: 0.22, r: 2, e: 0.7 };
        if (n.kind === "ecell") return { x: hx, y: hy, a: 0.2, r: 3, e: 0 };
        return { x: hx, y: hy, a: noise ? 0 : 0.035, r: baseR * 0.7, e: 0 };
      case 4:
        if (n.isYou) return { x: youWarm.x, y: youWarm.y, a: 1, r: 6, e: 1 };
        if (n.proof) return { x: hx, y: hy, a: n.matchIndex >= 0 ? 1 : 0.42, r: n.matchIndex >= 0 ? 4.8 : 3.1, e: 1 };
        if (viaSet.has(n.id)) return { x: hx, y: hy, a: 0.8, r: n.kind === "ecell" ? 3.4 : 2.6, e: 0 };
        return { x: hx, y: hy, a: noise ? 0 : 0.03, r: baseR * 0.6, e: 0 };
      default:
        if (n.isYou) return { x: youMatch.x, y: youMatch.y, a: 1, r: 6.5, e: 1 };
        if (n.matchIndex >= 0) {
          const p = anchors[n.matchIndex] ?? { x: hx, y: hy };
          return { x: p.x, y: p.y, a: 1, r: 4.6, e: 1 };
        }
        return { x: hx, y: hy, a: 0, r: baseR * 0.5, e: 0 };
    }
  }

  const heroActive = () => clock < 0.22;

  function pick(x: number, y: number, radius: number) {
    let best = -1;
    let bestD = radius * radius;
    for (const n of nodes) {
      if (n.kind !== "founder" && n.kind !== "investor") continue;
      if (n.alpha < 0.15 || n.px < hitMinX || n.py > hitMaxY) continue;
      const d = (n.px - x) ** 2 + (n.py - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = n.id;
      }
    }
    return best;
  }

  function activeNode(now: number) {
    if (!heroActive()) return -1;
    if (hovered >= 0) return hovered;
    if (pinned >= 0) return pinned;
    if (!reduced && now < pauseUntil) return -1;
    if (!reduced && now - lastCycle > 4600) {
      featuredIndex = (featuredIndex + 1) % model.featured.length;
      lastCycle = now;
    }
    return reduced || now - start > 2400 ? model.featured[featuredIndex] : -1;
  }

  function drawNode(kind: NodeKind, x: number, y: number, r: number, color: string) {
    const c = ctx!;
    c.beginPath();
    switch (kind) {
      case "investor":
        c.arc(x, y, r, 0, TAU);
        c.strokeStyle = color;
        c.lineWidth = 1.2;
        c.stroke();
        c.beginPath();
        c.arc(x, y, Math.max(0.8, r * 0.3), 0, TAU);
        c.fillStyle = color;
        c.fill();
        return;
      case "ecell":
        c.moveTo(x, y - r);
        c.lineTo(x + r, y);
        c.lineTo(x, y + r);
        c.lineTo(x - r, y);
        c.closePath();
        c.strokeStyle = color;
        c.lineWidth = 1.2;
        c.stroke();
        return;
      case "event":
        c.moveTo(x - r, y);
        c.lineTo(x + r, y);
        c.moveTo(x, y - r);
        c.lineTo(x, y + r);
        c.strokeStyle = color;
        c.lineWidth = 1.1;
        c.stroke();
        return;
      default:
        c.arc(x, y, r, 0, TAU);
        c.fillStyle = color;
        c.fill();
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const c = ctx!;
    const time = (now - start) / 1000;
    const t = stageClock(options.getProgress(), reduced);
    clock = t;
    const s = Math.min(Math.floor(t), 4);
    const f = t - s;
    const heroWeight = 1 - smoothstep(0.05, 0.3, t);

    const active = activeNode(now);
    if (active !== lastActive) {
      lastActive = active;
      switchAt = now;
      options.onActiveChange(active >= 0 ? active : null);
    }
    focusAmt += ((active >= 0 ? heroWeight : 0) - focusAmt) * (reduced ? 1 : 0.1);
    const detail = active >= 0 ? model.details.get(active) : undefined;

    // Node positions
    const introT = reduced ? 99 : time;
    const drift = reduced ? 0 : t < 1.5 ? 1 : 0.35;
    const interactive = !reduced && finePointer && pointer.inside && t < 1.6;
    for (const n of nodes) {
      const a = state(n, s);
      const b = state(n, s + 1);
      let x = lerp(a.x, b.x, f);
      let y = lerp(a.y, b.y, f);
      if (drift) {
        x += Math.sin(time * n.speed + n.phase) * n.amp * drift;
        y += Math.cos(time * n.speed * 0.8 + n.phase * 1.7) * n.amp * drift;
      }
      if (interactive) {
        x -= (pointer.x - W / 2) * n.z * 0.014;
        y -= (pointer.y - H / 2) * n.z * 0.014;
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d > 26 && d < 120) {
          const k = 1 - (d - 26) / 94;
          n.ox += ((dx / d) * k * k * 16 - n.ox) * 0.08;
          n.oy += ((dy / d) * k * k * 16 - n.oy) * 0.08;
        } else {
          n.ox *= 0.92;
          n.oy *= 0.92;
        }
      } else {
        n.ox *= 0.9;
        n.oy *= 0.9;
      }
      n.px = x + n.ox;
      n.py = y + n.oy;
      n.alpha = lerp(a.a, b.a, f) * smoothstep(n.introDelay, n.introDelay + 0.9, introT);
      n.radius = lerp(a.r, b.r, f);
      n.ember = lerp(a.e, b.e, f);
    }

    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.lineCap = "round";

    // 1 · Constellation edges
    const edgeAlpha = (s === 0 ? lerp(0.1, 0, f) : 0) * smoothstep(0.8, 2.2, introT) * (1 - 0.55 * focusAmt);
    if (edgeAlpha > 0.004) {
      c.beginPath();
      for (const [ai, bi] of model.edges) {
        c.moveTo(nodes[ai].px, nodes[ai].py);
        c.lineTo(nodes[bi].px, nodes[bi].py);
      }
      c.strokeStyle = `rgba(237,237,239,${edgeAlpha})`;
      c.lineWidth = 1;
      c.stroke();
    }

    // 2 · E-Cell verification links
    const verifyAlpha = plateau(t, 2) * 0.32;
    if (verifyAlpha > 0.004) {
      c.beginPath();
      for (const [ei, fi] of model.verifyEdges) {
        c.moveTo(nodes[ei].px, nodes[ei].py);
        c.lineTo(nodes[fi].px, nodes[fi].py);
      }
      c.strokeStyle = `rgba(255,106,42,${verifyAlpha})`;
      c.lineWidth = 1;
      c.stroke();
    }

    // 3 · Warm paths from you, through shared nodes
    const warmAlpha = smoothstep(3.4, 3.95, t) * (1 - smoothstep(4.15, 4.6, t));
    if (warmAlpha > 0.004) {
      model.warmPaths.forEach((p, i) => {
        const F = nodes[p.to];
        const V = nodes[p.via];
        const cx = 2 * V.px - (you.px + F.px) / 2;
        const cy = 2 * V.py - (you.py + F.py) / 2;
        const strength = p.warmth / 100;
        c.beginPath();
        c.moveTo(you.px, you.py);
        c.quadraticCurveTo(cx, cy, F.px, F.py);
        c.strokeStyle = `rgba(255,106,42,${warmAlpha * (0.14 + 0.62 * strength * strength)})`;
        c.lineWidth = 0.8 + strength;
        c.stroke();
        if (!reduced) {
          const q = quad(you.px, you.py, cx, cy, F.px, F.py, (time * 0.26 + i * 0.137) % 1);
          c.beginPath();
          c.arc(q.x, q.y, 1.7, 0, TAU);
          c.fillStyle = `rgba(255,139,85,${warmAlpha * strength})`;
          c.fill();
        }
      });
    }

    // 4 · Resolved matches
    const matchAlpha = smoothstep(4.35, 4.95, t);
    if (matchAlpha > 0.004) {
      model.matches.forEach((id, i) => {
        const F = nodes[id];
        const strength = MATCHES[i].warmth / 100;
        const dx = (F.px - you.px) * 0.55;
        c.beginPath();
        c.moveTo(you.px, you.py);
        c.bezierCurveTo(you.px + dx, you.py, F.px - dx, F.py, F.px, F.py);
        c.strokeStyle = `rgba(255,106,42,${matchAlpha * (0.22 + 0.72 * strength * strength)})`;
        c.lineWidth = 0.8 + strength * 1.4;
        c.stroke();
        if (!reduced) {
          const q = cubic(you.px, you.py, you.px + dx, you.py, F.px - dx, F.py, F.px, F.py, (time * 0.32 + i * 0.21) % 1);
          c.beginPath();
          c.arc(q.x, q.y, 1.8, 0, TAU);
          c.fillStyle = `rgba(255,139,85,${matchAlpha})`;
          c.fill();
        }
      });
    }

    // 5 · The active warmth relationship in the hero
    if (detail && focusAmt > 0.01) {
      const A = nodes[active];
      const C = nodes[detail.counterpart];
      const V = nodes[detail.via];
      const cx = 2 * V.px - (A.px + C.px) / 2;
      const cy = 2 * V.py - (A.py + C.py) / 2;
      const progress = reduced ? 1 : smoothstep(0, 0.8, (now - switchAt) / 1000);
      const steps = 40;
      c.beginPath();
      for (let k = 0; k <= Math.round(steps * progress); k++) {
        const q = quad(A.px, A.py, cx, cy, C.px, C.py, k / steps);
        if (k === 0) c.moveTo(q.x, q.y);
        else c.lineTo(q.x, q.y);
      }
      c.setLineDash([3, 5]);
      c.lineDashOffset = reduced ? 0 : -time * 14;
      c.strokeStyle = `rgba(255,106,42,${0.9 * focusAmt})`;
      c.lineWidth = 1.4;
      c.stroke();
      c.setLineDash([]);
    }

    // 6 · Nodes
    const hl1 = detail ? detail.counterpart : -1;
    const hl2 = detail ? detail.via : -1;
    for (const n of nodes) {
      const isHighlighted = active >= 0 && (n.id === active || n.id === hl1 || n.id === hl2);
      let alpha = n.alpha;
      if (focusAmt > 0.01) alpha = isHighlighted ? Math.max(alpha, focusAmt) : alpha * (1 - 0.6 * focusAmt);
      if (alpha < 0.01) continue;
      const isPerson = n.kind === "founder" || n.kind === "investor";
      const e = isHighlighted && isPerson ? Math.max(n.ember, focusAmt) : n.ember;
      const r = n.radius * (isHighlighted ? 1 + 0.4 * focusAmt : 1);
      drawNode(n.kind, n.px, n.py, r, `rgba(${mix(e)},${alpha})`);

      if (e > 0.6 && r > 3 && alpha > 0.4) {
        c.beginPath();
        c.arc(n.px, n.py, r * 3.2, 0, TAU);
        c.fillStyle = `rgba(255,106,42,${0.07 * alpha * e})`;
        c.fill();
      }
      if (n.isYou && t > 3.2) {
        const pulse = reduced ? 0.5 : (time * 0.6) % 1;
        c.beginPath();
        c.arc(n.px, n.py, r + 4 + pulse * 16, 0, TAU);
        c.strokeStyle = `rgba(255,106,42,${smoothstep(3.2, 3.8, t) * 0.5 * (1 - pulse)})`;
        c.lineWidth = 1;
        c.stroke();
      }
    }

    if (detail && focusAmt > 0.01) {
      for (const id of [active, detail.counterpart]) {
        const n = nodes[id];
        c.beginPath();
        c.arc(n.px, n.py, n.radius + 7, 0, TAU);
        c.strokeStyle = `rgba(255,106,42,${0.45 * focusAmt})`;
        c.lineWidth = 1;
        c.stroke();
      }
    }

    // 7 · Keep copy legible: erase the graph beneath it
    if (fade) {
      c.globalCompositeOperation = "destination-out";
      c.fillStyle = fade;
      c.fillRect(fadeRect.x, fadeRect.y, fadeRect.w, fadeRect.h);
      c.globalCompositeOperation = "source-over";
    }

    updateOverlays(t, now, active, detail ? detail.counterpart : -1);
  }

  function updateOverlays(t: number, now: number, active: number, counterpart: number) {
    el.captions.forEach((caption, k) => {
      const alpha = k === 0 ? 1 - smoothstep(0.08, 0.45, t) : k === 5 ? smoothstep(4.5, 4.92, t) : plateau(t, k);
      setOpacity(caption, alpha);
      if (!reduced) {
        const offset = (1 - alpha) * (t > k ? -16 : 16);
        setStyle(caption, "transform", `translate3d(0,${offset.toFixed(1)}px,0)`);
      }
    });

    setOpacity(el.hint, (1 - smoothstep(0.02, 0.22, t)) * (reduced ? 1 : smoothstep(1.6, 2.6, (now - start) / 1000)));
    setOpacity(el.hud, smoothstep(0.55, 0.95, t));
    setStyle(el.progressFill, "transform", `scaleX(${clamp((t - 1) / 4).toFixed(3)})`);

    const step = t < 1.5 ? -1 : Math.min(3, Math.round(t) - 2);
    if (step !== lastStep) {
      lastStep = step;
      el.steps.forEach((node, i) => node?.setAttribute("data-state", i < step ? "done" : i === step ? "active" : "idle"));
    }
    const s = Math.min(Math.floor(t), 4);
    const count = Math.round(lerp(STAGE_COUNTS[s], STAGE_COUNTS[s + 1], t - s));
    if (count !== lastCount && el.counter) {
      lastCount = count;
      el.counter.textContent = count.toLocaleString("en-US");
    }

    if (el.tooltip) {
      const alpha = active >= 0 ? focusAmt * (reduced ? 1 : smoothstep(0.1, 0.45, (now - switchAt) / 1000)) : 0;
      setOpacity(el.tooltip, alpha);
      if (active >= 0) {
        const n = nodes[active];
        const partner = counterpart >= 0 ? nodes[counterpart] : null;
        let tx: number;
        let ty: number;
        if (desktop) {
          // Open away from the counterpart so the relationship path stays visible.
          const right = n.px + 24;
          const left = n.px - 24 - tipW;
          const preferLeft = partner ? partner.px > n.px : false;
          tx = preferLeft ? (left >= hitMinX - 60 ? left : right) : right + tipW <= W - 16 ? right : left;
          tx = clamp(tx, 16, W - tipW - 16);
          ty = clamp(n.py - tipH / 2, 84, H - tipH - 16);
        } else {
          tx = clamp(n.px - tipW / 2, 12, W - tipW - 12);
          const above = n.py - 20 - tipH;
          const preferAbove = partner ? partner.py > n.py : true;
          ty = preferAbove && above >= 72 ? above : n.py + 20;
        }
        setStyle(el.tooltip, "transform", `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`);
      }
    }

    const labelAlpha = smoothstep(2.45, 2.95, t) * (1 - smoothstep(4.15, 4.55, t));
    const warmAlpha = smoothstep(3.45, 3.95, t);
    // Place each label on the first side that fits and clears the labels already placed.
    const placed: Rect[] = [];
    model.matches.forEach((id, i) => {
      const label = el.labels[i];
      if (!label) return;
      setOpacity(label, labelAlpha);
      if (labelAlpha <= 0.005) return;
      const n = nodes[id];
      const width = labelWidths[i] ?? 140;
      const height = labelHeights[i] ?? 22;
      const centered = clamp(n.px - width / 2, 6, W - width - 6);
      const candidates: Point[] = [
        { x: n.px + 14, y: n.py - height / 2 },
        { x: n.px - 14 - width, y: n.py - height / 2 },
        { x: centered, y: n.py + 12 },
        { x: centered, y: n.py - 12 - height },
        { x: centered, y: n.py + 16 + height },
        { x: centered, y: n.py - 16 - height * 2 },
      ];
      const minY = desktop ? 70 : 100;
      const fits = (p: Point) =>
        p.x >= 6 &&
        p.x + width <= W - 6 &&
        p.y >= minY &&
        !placed.some((r) => p.x < r.x + r.w + 6 && p.x + width + 6 > r.x && p.y < r.y + r.h + 4 && p.y + height + 4 > r.y);
      if (!fits(candidates[labelSlots[i]])) {
        const next = candidates.findIndex(fits);
        labelSlots[i] = next >= 0 ? next : 0;
      }
      const p = candidates[labelSlots[i]];
      placed.push({ x: p.x, y: p.y, w: width, h: height });
      setStyle(label, "transform", `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`);
      setOpacity(warmEls[i], warmAlpha);
    });

    const youAlpha = smoothstep(3.35, 3.85, t);
    setOpacity(el.youLabel, youAlpha);
    if (youAlpha > 0.005) {
      const left = you.px - 16 - youLabelW;
      const x = left >= 8 ? left : clamp(you.px - youLabelW / 2, 6, W - youLabelW - 6);
      const y = left >= 8 ? you.py - 12 : you.py + 14;
      setStyle(el.youLabel, "transform", `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`);
    }

    el.rows.forEach((row, i) => setOpacity(row, smoothstep(4.45 + i * 0.07, 4.85 + i * 0.07, t)));
  }

  // Interaction
  const localPoint = (event: PointerEvent | MouseEvent) => {
    const rect = container.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const onPointerMove = (event: PointerEvent) => {
    const p = localPoint(event);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
    if (event.pointerType !== "mouse") return;
    const id = heroActive() ? pick(p.x, p.y, 24) : -1;
    if (id !== hovered) {
      if (hovered >= 0 && id < 0) pauseUntil = performance.now() + 3500;
      hovered = id;
      if (id >= 0) pinned = -1;
    }
    canvas.style.cursor = id >= 0 && nodes[id].startupId ? "pointer" : "default";
  };
  const onPointerLeave = () => {
    pointer.inside = false;
    if (hovered >= 0) pauseUntil = performance.now() + 3500;
    hovered = -1;
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || !heroActive()) return;
    const p = localPoint(event);
    pinned = pick(p.x, p.y, 34);
    pauseUntil = performance.now() + 8000;
    lastCycle = performance.now();
  };
  const onClick = () => {
    if (!heroActive()) return;
    const id = hovered >= 0 ? hovered : pinned;
    const startupId = id >= 0 ? nodes[id].startupId : undefined;
    if (startupId) options.onNavigate(startupId);
  };

  function startLoop() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stopLoop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  measure();
  const resizeObserver = new ResizeObserver(() => measure());
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) startLoop();
      else stopLoop();
    },
    { rootMargin: "120px" },
  );
  intersectionObserver.observe(container);
  const onVisibility = () => (document.hidden ? stopLoop() : visible && startLoop());
  document.addEventListener("visibilitychange", onVisibility);
  document.fonts?.ready.then(() => measure()).catch(() => undefined);

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("click", onClick);

  return {
    destroy() {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("click", onClick);
    },
    /** Keyboard access to the featured relationships. */
    cycle(direction: 1 | -1) {
      featuredIndex = (featuredIndex + direction + model.featured.length) % model.featured.length;
      pinned = model.featured[featuredIndex];
      hovered = -1;
      pauseUntil = performance.now() + 10000;
      lastCycle = performance.now();
    },
  };
}
