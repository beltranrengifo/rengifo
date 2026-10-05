/**
 * The board's graph: nodes placed in time and the links between them. Pure —
 * built once on the server and handed to the client as JSON.
 */

export type Kind = 'role' | 'project' | 'tech';

export interface BoardNode {
  id: string;
  kind: Kind;
  label: string;
  /** Colour group: 'role', 'project', or a technology's layer. */
  group: string;
  /** Fractional years. */
  start: number;
  end: number;
  /** Rest radius in world pixels. */
  r: number;
}

export interface BoardLink {
  source: string;
  target: string;
}

export interface BoardModel {
  nodes: BoardNode[];
  links: BoardLink[];
}

export const START_YEAR = 2004;
export const YEAR_PX = 420;

/** World x of a fractional year. */
export const timeX = (year: number): number => (year - START_YEAR) * YEAR_PX;

/**
 * 'YYYY-MM' → the start of that month; a bare 'YYYY' → the middle of the
 * year, since its month is not known.
 */
export function yearOf(value: string): number {
  const [year, month] = value.split('-').map(Number);
  if (year === undefined || Number.isNaN(year)) {
    throw new Error(`Not a date: ${value}`);
  }
  return month === undefined ? year + 0.5 : year + (month - 1) / 12;
}

interface Dated {
  id: string;
  label: string;
  span: [string, string];
}

interface TechInput {
  id: string;
  label: string;
  layer: string;
  usedIn: string[];
}

export function buildModel(input: {
  roles: Dated[];
  projects: Dated[];
  techs: TechInput[];
}): BoardModel {
  const dated = (
    kind: 'role' | 'project',
    item: Dated,
    radius: (years: number) => number,
  ): BoardNode => {
    const start = yearOf(item.span[0]);
    const end = Math.max(yearOf(item.span[1]), start + 1 / 12);
    return {
      id: item.id,
      kind,
      label: item.label,
      group: kind,
      start,
      end,
      r: radius(end - start),
    };
  };

  const nodes: BoardNode[] = [
    ...input.roles.map((role) =>
      dated('role', role, (years) => Math.min(92, 34 + 16 * Math.sqrt(years))),
    ),
    ...input.projects.map((project) => dated('project', project, () => 40)),
  ];
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const links: BoardLink[] = [];
  for (const tech of input.techs) {
    const users = tech.usedIn.map((id) => {
      const user = byId.get(id);
      if (!user) throw new Error(`${tech.id} is used in unknown node ${id}`);
      return user;
    });
    if (users.length === 0) throw new Error(`${tech.id} is used nowhere`);
    nodes.push({
      id: `tech:${tech.id}`,
      kind: 'tech',
      label: tech.label,
      group: tech.layer,
      start: Math.min(...users.map((user) => user.start)),
      end: Math.max(...users.map((user) => user.end)),
      r: Math.min(30, 15 + 2.5 * users.length),
    });
    for (const user of users) {
      links.push({ source: `tech:${tech.id}`, target: user.id });
    }
  }

  return { nodes, links };
}
