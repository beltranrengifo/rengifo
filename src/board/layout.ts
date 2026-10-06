import {
  forceCollide,
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { START_YEAR, type BoardModel } from './model';

/**
 * Where everything sits: time decides x, a lane decides y, and a light
 * simulation settles the rest — technologies drift towards the work that
 * used them most. It never fully cools, so the page breathes, but every
 * node stays tied to its date.
 */

export const YEAR_PX = 260;
/** Vertical step between rows of roles that share years. */
const ROLE_ROW = 170;

/**
 * Three bands, top to bottom: roles, technologies, projects. Roles that
 * share years stack upwards from their lane; technologies may wander only
 * inside their band, so they never reach a role's or a project's label.
 */
export const LANE = { role: -160, tech: 60, project: 300 } as const;
export const TECH_BAND = [-40, 180] as const;

/**
 * Technologies used lightly — one or two light uses in all — stay out of
 * the first view and appear on a closer look (see main.ts).
 */
export const isMinor = (weight: number): boolean => weight <= 2;

export const timeX = (year: number): number => (year - START_YEAR) * YEAR_PX;

export interface Node extends SimulationNodeDatum {
  id: string;
  kind: 'role' | 'project' | 'tech';
  /** A technology's layer; roles and projects use their kind. */
  layer: string;
  /** Index into model.clips or model.tracks. */
  index: number;
  r: number;
  /** Characters in the label, so wider labels get more room. */
  labelLength: number;
  homeX: number;
  homeY: number;
  /** A technology's total use, summed over the work that used it. */
  weight?: number;
  x: number;
  y: number;
}

export interface Link extends SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
  weight: number;
}

export interface Layout {
  sim: Simulation<Node, Link>;
  nodes: Node[];
  links: Link[];
}

/** Keeps technologies inside their band: a wall, not a pull. */
function band(top: number, bottom: number) {
  let nodes: Node[] = [];
  const force = () => {
    for (const node of nodes) {
      if (node.kind !== 'tech') continue;
      const next = node.y + (node.vy ?? 0);
      if (next < top) node.vy = top - node.y;
      else if (next > bottom) node.vy = bottom - node.y;
    }
  };
  force.initialize = (all: Node[]) => (nodes = all);
  return force;
}

/**
 * Technology labels are wide and short, which a circle fits badly: two can
 * sit far enough apart as circles and still print over each other. This
 * treats each as its dot plus label, and nudges overlapping pairs apart,
 * mostly up and down, where the band has room.
 */
function labels(strength: number) {
  let techs: Node[] = [];
  const box = (node: Node) => ({
    left: node.x - node.r - 4,
    right: node.x + node.r * 1.5 + 10 + node.labelLength * 6.6,
  });
  const force = (alpha: number) => {
    for (let i = 0; i < techs.length; i++) {
      const a = techs[i]!;
      const boxA = box(a);
      for (let j = i + 1; j < techs.length; j++) {
        const b = techs[j]!;
        const boxB = box(b);
        const overlapX =
          Math.min(boxA.right, boxB.right) - Math.max(boxA.left, boxB.left);
        const dy = b.y - a.y;
        const overlapY = 22 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        const push = overlapY * strength * alpha * 10;
        const dir = dy === 0 ? (i % 2 ? 1 : -1) : Math.sign(dy);
        a.vy = (a.vy ?? 0) - push * dir;
        b.vy = (b.vy ?? 0) + push * dir;
        // A little sideways too, so a full column can still resolve.
        const side = Math.sign(b.x - a.x) || 1;
        a.vx = (a.vx ?? 0) - push * 0.2 * side;
        b.vx = (b.vx ?? 0) + push * 0.2 * side;
      }
    }
  };
  force.initialize = (all: Node[]) =>
    (techs = all.filter((node) => node.kind === 'tech'));
  return force;
}

/** A faint random push, so the field breathes without wandering off. */
function drift(strength: number, random: () => number) {
  let nodes: Node[] = [];
  const force = () => {
    for (const node of nodes) {
      // Only technologies drift; roles and projects sit on their track.
      if (node.kind !== 'tech') continue;
      node.vx = (node.vx ?? 0) + (random() - 0.5) * strength;
      node.vy = (node.vy ?? 0) + (random() - 0.5) * strength;
    }
  };
  force.initialize = (all: Node[]) => (nodes = all);
  return force;
}

export function createLayout(
  model: BoardModel,
  random: () => number = Math.random,
): Layout {
  const clipNodes: Node[] = model.clips.map((clip, index) => {
    const years = clip.end - clip.start;
    const homeX = timeX((clip.start + clip.end) / 2);
    const homeY = clip.kind === 'role' ? LANE.role : LANE.project;
    return {
      id: clip.id,
      kind: clip.kind,
      layer: clip.kind,
      index,
      r: clip.kind === 'role' ? Math.min(64, 22 + 14 * Math.sqrt(years)) : 28,
      labelLength: clip.label.length,
      homeX,
      homeY,
      x: homeX + (random() - 0.5) * 30,
      y: homeY + (random() - 0.5) * 30,
    };
  });

  // Roles that overlap in time would write their names over each other.
  // Give each one the first row where its label clears the previous one;
  // extra rows step up, away from the technologies.
  const rowEnds: number[] = [];
  clipNodes
    .filter((node) => node.kind === 'role')
    .sort((a, b) => a.homeX - b.homeX)
    .forEach((node) => {
      const half = Math.max(node.r, Math.min(node.labelLength * 3.4, 110)) + 18;
      let row = rowEnds.findIndex((end) => node.homeX - half > end);
      if (row < 0) row = rowEnds.length;
      rowEnds[row] = node.homeX + half;
      node.homeY = LANE.role - row * ROLE_ROW;
      node.y = node.homeY;
    });

  // Technologies used by a single long role would all land on its middle;
  // spread them along its years instead, in the order they are listed.
  const soloOf = model.tracks.map((track) =>
    track.uses.length === 1 ? track.uses[0]!.clip : -1,
  );
  const spread = new Map<number, number>();
  model.clips.forEach((clip, c) => {
    const solos = soloOf.flatMap((owner, t) => (owner === c ? [t] : []));
    if (clip.end - clip.start < 2 || solos.length < 2) return;
    solos.forEach((t, k) => {
      const at =
        clip.start + ((k + 0.5) / solos.length) * (clip.end - clip.start);
      spread.set(t, timeX(at));
    });
  });

  const techNodes: Node[] = model.tracks.map((track, index) => {
    // A technology sits where it was used most, weighted.
    let sum = 0;
    let total = 0;
    for (const use of track.uses) {
      const clip = model.clips[use.clip]!;
      const w = use.weight * (clip.kind === 'project' ? 0.5 : 1);
      sum += clipNodes[use.clip]!.homeX * w;
      total += w;
    }
    const homeX = spread.get(index) ?? sum / total;
    const weight = track.uses.reduce((s, use) => s + use.weight, 0);
    return {
      weight,
      id: `tech:${track.id}`,
      kind: 'tech',
      layer: track.layer,
      index,
      r: Math.min(9, 3 + Math.sqrt(weight) * 1.2),
      labelLength: track.label.length,
      homeX,
      homeY: LANE.tech,
      x: homeX + (random() - 0.5) * 60,
      y: LANE.tech + (random() - 0.5) * (TECH_BAND[1] - TECH_BAND[0]),
    };
  });

  const nodes = [...clipNodes, ...techNodes];
  const links: Link[] = model.tracks.flatMap((track, t) =>
    track.uses.map((use) => ({
      source: techNodes[t]!,
      target: clipNodes[use.clip]!,
      weight: use.weight,
    })),
  );

  const sim = forceSimulation<Node, Link>(nodes)
    .force(
      'time',
      forceX<Node>((node) => node.homeX).strength((node) =>
        node.kind === 'tech' ? 0.035 : 0.6,
      ),
    )
    .force(
      'lane',
      forceY<Node>((node) => node.homeY).strength((node) =>
        // Projects hold their line too, so neighbours spread sideways
        // instead of stacking under the floor.
        node.kind === 'tech' ? 0.02 : 0.8,
      ),
    )
    .force(
      'link',
      forceLink<Node, Link>(links)
        .distance(150)
        .strength((link) => 0.008 * link.weight),
    )
    .force(
      'collide',
      // Roles and projects keep room for the labels written under them.
      forceCollide<Node>((node) =>
        node.kind === 'tech'
          ? node.r + 18 + node.labelLength * 3.4
          : node.kind === 'role'
            ? node.r + 58
            : node.r + 62,
      ).strength(0.9),
    )
    .force('labels', labels(0.5))
    .force('band', band(TECH_BAND[0], TECH_BAND[1]))
    .force('drift', drift(0.06, random))
    .alphaTarget(0.015)
    .velocityDecay(0.5)
    .stop();

  return { sim, nodes, links };
}

/** Run the simulation forward without a clock — for first paint and tests. */
export function settle(layout: Layout, ticks = 300): void {
  layout.sim.tick(ticks);
}
