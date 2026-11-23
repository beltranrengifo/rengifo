import type { SystemMap } from './types';
import { tablux } from './tablux';
import { infrastructure } from './infrastructure';
import { ensayadero } from './ensayadero';

/** Every map a page can carry, by the id a case study names. */
export const systemMaps = {
  tablux,
  infrastructure,
  ensayadero,
} satisfies Record<string, SystemMap>;

export type SystemMapId = keyof typeof systemMaps;
