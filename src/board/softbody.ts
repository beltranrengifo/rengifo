/**
 * Jelly. Each node is a ring of particles held together by three
 * position-based constraints, solved in substeps:
 *
 * - edges keep neighbouring particles at their rest distance;
 * - area keeps the ring from deflating when squeezed;
 * - shape matching pulls the ring back to its rest shape, rotated to fit and
 *   centred on an anchor (the node's place in the layout). That pull is what
 *   makes it wobble home.
 *
 * Pure and cheap — typed arrays, no per-step garbage beyond a tuple — so it
 * can run for every node each frame.
 */

export interface Body {
  n: number;
  r: number;
  px: Float32Array;
  py: Float32Array;
  ox: Float32Array;
  oy: Float32Array;
  /** Rest offsets from the centre. */
  rx: Float32Array;
  ry: Float32Array;
  restArea: number;
  restEdge: number;
  anchorX: number;
  anchorY: number;
  /** Shape-matching pull per substep, 0–1. Higher is firmer. */
  firmness: number;
  /** Index of the particle held by the pointer, or -1. */
  grabbed: number;
  grabX: number;
  grabY: number;
  /** Scratch space for the area gradient. */
  gx: Float32Array;
  gy: Float32Array;
}

export const DEFAULT_FIRMNESS = 0.05;
const DAMPING = 0.986;
const EDGE_STIFFNESS = 0.6;
const AREA_STIFFNESS = 0.8;

export function createBody(r: number, x: number, y: number, n = 16): Body {
  const rx = new Float32Array(n);
  const ry = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    rx[i] = Math.cos(a) * r;
    ry[i] = Math.sin(a) * r;
  }
  const px = new Float32Array(n);
  const py = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    px[i] = x + rx[i]!;
    py[i] = y + ry[i]!;
  }
  const body: Body = {
    n,
    r,
    px,
    py,
    ox: px.slice(),
    oy: py.slice(),
    rx,
    ry,
    restArea: 0,
    restEdge: 2 * r * Math.sin(Math.PI / n),
    anchorX: x,
    anchorY: y,
    firmness: DEFAULT_FIRMNESS,
    grabbed: -1,
    grabX: x,
    grabY: y,
    gx: new Float32Array(n),
    gy: new Float32Array(n),
  };
  body.restArea = area(body);
  return body;
}

/** Signed polygon area (positive for the ring's winding). */
export function area(b: Body): number {
  let sum = 0;
  for (let i = 0; i < b.n; i++) {
    const j = (i + 1) % b.n;
    sum += b.px[i]! * b.py[j]! - b.px[j]! * b.py[i]!;
  }
  return sum / 2;
}

export function centroid(b: Body): [number, number] {
  let x = 0;
  let y = 0;
  for (let i = 0; i < b.n; i++) {
    x += b.px[i]!;
    y += b.py[i]!;
  }
  return [x / b.n, y / b.n];
}

/** How far the grabbed particle has been pulled, in radii. */
export function stretch(b: Body): number {
  if (b.grabbed < 0) return 0;
  const [cx, cy] = centroid(b);
  const dx = b.px[b.grabbed]! - cx;
  const dy = b.py[b.grabbed]! - cy;
  return Math.hypot(dx, dy) / b.r;
}

export function contains(b: Body, x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = b.n - 1; i < b.n; j = i++) {
    const xi = b.px[i]!;
    const yi = b.py[i]!;
    const xj = b.px[j]!;
    const yj = b.py[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function nearestParticle(b: Body, x: number, y: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < b.n; i++) {
    const d = (b.px[i]! - x) ** 2 + (b.py[i]! - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/** Push every particle by (dx, dy) — a poke from outside. */
export function nudge(b: Body, dx: number, dy: number): void {
  for (let i = 0; i < b.n; i++) {
    b.ox[i] = b.ox[i]! - dx;
    b.oy[i] = b.oy[i]! - dy;
  }
}

function pin(b: Body): void {
  if (b.grabbed < 0) return;
  b.px[b.grabbed] = b.grabX;
  b.py[b.grabbed] = b.grabY;
}

function solveEdges(b: Body): void {
  for (let i = 0; i < b.n; i++) {
    const j = (i + 1) % b.n;
    const dx = b.px[j]! - b.px[i]!;
    const dy = b.py[j]! - b.py[i]!;
    const d = Math.hypot(dx, dy) || 1e-6;
    const c = ((d - b.restEdge) / d) * 0.5 * EDGE_STIFFNESS;
    b.px[i] = b.px[i]! + dx * c;
    b.py[i] = b.py[i]! + dy * c;
    b.px[j] = b.px[j]! - dx * c;
    b.py[j] = b.py[j]! - dy * c;
  }
}

function solveArea(b: Body): void {
  const error = area(b) - b.restArea;
  const n = b.n;
  let sum = 0;
  // Gradient of the area with respect to each particle.
  for (let i = 0; i < n; i++) {
    const prev = (i - 1 + n) % n;
    const next = (i + 1) % n;
    const gx = (b.py[next]! - b.py[prev]!) / 2;
    const gy = (b.px[prev]! - b.px[next]!) / 2;
    b.gx[i] = gx;
    b.gy[i] = gy;
    sum += gx * gx + gy * gy;
  }
  if (sum < 1e-9) return;
  const lambda = (-error / sum) * AREA_STIFFNESS;
  for (let i = 0; i < n; i++) {
    b.px[i] = b.px[i]! + lambda * b.gx[i]!;
    b.py[i] = b.py[i]! + lambda * b.gy[i]!;
  }
}

function solveShape(b: Body): void {
  const [cx, cy] = centroid(b);
  // Best-fit rotation of the rest shape onto the current one.
  let dot = 0;
  let cross = 0;
  for (let i = 0; i < b.n; i++) {
    const qx = b.px[i]! - cx;
    const qy = b.py[i]! - cy;
    dot += b.rx[i]! * qx + b.ry[i]! * qy;
    cross += b.rx[i]! * qy - b.ry[i]! * qx;
  }
  const angle = Math.atan2(cross, dot);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const k = b.firmness;
  for (let i = 0; i < b.n; i++) {
    const gx = b.anchorX + b.rx[i]! * cos - b.ry[i]! * sin;
    const gy = b.anchorY + b.rx[i]! * sin + b.ry[i]! * cos;
    b.px[i] = b.px[i]! + (gx - b.px[i]!) * k;
    b.py[i] = b.py[i]! + (gy - b.py[i]!) * k;
  }
}

export function step(b: Body, substeps = 4): void {
  for (let s = 0; s < substeps; s++) {
    for (let i = 0; i < b.n; i++) {
      const vx = (b.px[i]! - b.ox[i]!) * DAMPING;
      const vy = (b.py[i]! - b.oy[i]!) * DAMPING;
      b.ox[i] = b.px[i]!;
      b.oy[i] = b.py[i]!;
      b.px[i] = b.px[i]! + vx;
      b.py[i] = b.py[i]! + vy;
    }
    pin(b);
    solveShape(b);
    solveEdges(b);
    solveArea(b);
    pin(b);
  }
}

// ── Drips ───────────────────────────────────────────────────────

export interface Drip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Seconds left. */
  life: number;
  absorbing: boolean;
}

const GRAVITY = 1400;

/** A drop shed from the particle furthest below the body's centre. */
export function shed(b: Body, random: () => number = Math.random): Drip {
  let lowest = 0;
  for (let i = 1; i < b.n; i++) {
    if (b.py[i]! > b.py[lowest]!) lowest = i;
  }
  return {
    x: b.px[lowest]!,
    y: b.py[lowest]! + 2,
    vx: (random() - 0.5) * 60,
    vy: 40 + random() * 80,
    r: Math.max(5, b.r * (0.16 + random() * 0.1)),
    life: 2.6,
    absorbing: false,
  };
}

/**
 * Drops fall, shrink, and are absorbed by the first body they land in.
 * Returns the drops still alive.
 */
export function stepDrips(drips: Drip[], dt: number, bodies: Body[]): Drip[] {
  const alive: Drip[] = [];
  for (const drip of drips) {
    drip.life -= dt;
    if (drip.absorbing) {
      drip.r *= Math.pow(0.02, dt);
    } else {
      drip.vy += GRAVITY * dt;
      drip.x += drip.vx * dt;
      drip.y += drip.vy * dt;
      drip.r *= Math.pow(0.7, dt);
      for (const body of bodies) {
        if (body.grabbed < 0 && contains(body, drip.x, drip.y)) {
          drip.absorbing = true;
          nudge(body, 0, Math.min(6, drip.r * 0.5));
          break;
        }
      }
    }
    if (drip.life > 0 && drip.r > 0.8) alive.push(drip);
  }
  return alive;
}
