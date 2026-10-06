/**
 * The board's data, flattened for the client: clips (roles and projects on
 * the timeline) and tracks (technologies, with how much each clip used
 * them). Pure — built once on the server and handed over as JSON.
 */

export const START_YEAR = 2002;
export const END_YEAR = 2026.75;

export interface Clip {
  id: string;
  kind: 'role' | 'project';
  label: string;
  /** Fractional years. */
  start: number;
  end: number;
}

export interface Track {
  id: string;
  label: string;
  layer: string;
  /** Clip index → weight (1–3). */
  uses: { clip: number; weight: number }[];
}

export interface BoardModel {
  clips: Clip[];
  tracks: Track[];
}

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

export function buildModel(input: {
  clips: {
    id: string;
    kind: 'role' | 'project';
    label: string;
    span: [string, string];
  }[];
  techs: {
    id: string;
    label: string;
    layer: string;
    uses: Record<string, number>;
  }[];
}): BoardModel {
  const clips: Clip[] = input.clips.map(({ span, ...clip }) => {
    const start = yearOf(span[0]);
    return {
      ...clip,
      start,
      end: Math.max(yearOf(span[1]), start + 1 / 12),
    };
  });
  const index = new Map(clips.map((clip, i) => [clip.id, i]));

  const tracks: Track[] = input.techs.map((tech) => {
    const uses = Object.entries(tech.uses).map(([id, weight]) => {
      const clip = index.get(id);
      if (clip === undefined) {
        throw new Error(`${tech.id} is used in unknown clip ${id}`);
      }
      return { clip, weight };
    });
    if (uses.length === 0) throw new Error(`${tech.id} is used nowhere`);
    return { id: tech.id, label: tech.label, layer: tech.layer, uses };
  });

  return { clips, tracks };
}
