import type { SystemMap } from './types';
import { tablux } from './tablux';

/** Every map a page can carry, by the id a case study names. */
export const systemMaps = { tablux } satisfies Record<string, SystemMap>;

export type SystemMapId = keyof typeof systemMaps;
