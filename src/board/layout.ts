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
import { timeX, type BoardModel, type BoardNode } from './model';

/**
 * Where each node lives: time decides x, a lane decides y, and a little
 * physics decides the rest. The simulation never fully cools, so the field
 * keeps drifting — but every node stays tied to its date.
 */

export interface LayoutNode extends BoardNode, SimulationNodeDatum {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
}

export type LayoutLink = SimulationLinkDatum<LayoutNode>;

export interface Layout {
  sim: Simulation<LayoutNode, LayoutLink>;
  nodes: LayoutNode[];
  links: LayoutLink[];
}

const LANE: Record<string, number> = {
  role: -300,
  project: 320,
  backend: -110,
  frontend: 10,
  infra: 120,
  craft: 200,
};

/** A faint random push, so the field breathes without wandering off. */
function drift(strength: number, random: () => number) {
  let nodes: LayoutNode[] = [];
  const force = (alpha: number) => {
    for (const node of nodes) {
      node.vx = (node.vx ?? 0) + (random() - 0.5) * strength * (0.4 + alpha);
      node.vy = (node.vy ?? 0) + (random() - 0.5) * strength * (0.4 + alpha);
    }
  };
  force.initialize = (all: LayoutNode[]) => (nodes = all);
  return force;
}

export function createLayout(
  model: BoardModel,
  random: () => number = Math.random,
): Layout {
  const homes = new Map<string, number>();
  for (const node of model.nodes) {
    if (node.kind !== 'tech') {
      homes.set(node.id, timeX((node.start + node.end) / 2));
    }
  }

  const nodes: LayoutNode[] = model.nodes.map((node) => {
    let homeX = homes.get(node.id);
    if (homeX === undefined) {
      // A technology sits among the places it was used.
      const users = model.links
        .filter((link) => link.source === node.id)
        .map((link) => homes.get(link.target) ?? 0);
      homeX = users.reduce((sum, x) => sum + x, 0) / Math.max(users.length, 1);
    }
    const homeY = LANE[node.group] ?? 0;
    return {
      ...node,
      homeX,
      homeY,
      x: homeX + (random() - 0.5) * 60,
      y: homeY + (random() - 0.5) * 60,
    };
  });

  const links: LayoutLink[] = model.links.map((link) => ({ ...link }));

  const sim = forceSimulation<LayoutNode, LayoutLink>(nodes)
    .force(
      'time',
      forceX<LayoutNode>((node) => node.homeX).strength((node) =>
        node.kind === 'tech' ? 0.05 : 0.45,
      ),
    )
    .force(
      'lane',
      forceY<LayoutNode>((node) => node.homeY).strength((node) =>
        node.kind === 'tech' ? 0.06 : 0.2,
      ),
    )
    .force(
      'link',
      forceLink<LayoutNode, LayoutLink>(links)
        .id((node) => node.id)
        .distance(160)
        .strength(0.03),
    )
    .force(
      'collide',
      forceCollide<LayoutNode>((node) => node.r + 22).strength(0.85),
    )
    .force('drift', drift(0.35, random))
    .alphaTarget(0.02)
    .stop();

  return { sim, nodes, links };
}

/** Run the simulation forward without a clock — for first paint and tests. */
export function settle(layout: Layout, ticks = 300): void {
  layout.sim.tick(ticks);
}
