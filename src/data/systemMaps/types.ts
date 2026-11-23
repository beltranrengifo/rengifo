/**
 * An explorable map of how a system fits together: zones (where things
 * run), nodes (the parts), edges (how they talk) and walkthroughs (a path
 * lit step by step). One data file per map; SystemMap.astro draws any of
 * them.
 */

export interface Text {
  en: string;
  es: string;
}

/** The small line icons on the map itself (see systemMap/art.ts). */
export type GlyphId =
  | 'screen'
  | 'window'
  | 'mic'
  | 'speaker'
  | 'bridge'
  | 'plug'
  | 'bulb'
  | 'blind'
  | 'projector'
  | 'cast'
  | 'tablet'
  | 'phone'
  | 'server'
  | 'db'
  | 'wave'
  | 'tools'
  | 'bubble'
  | 'text'
  | 'calendar'
  | 'note'
  | 'weather'
  | 'branch'
  | 'terminal'
  | 'key'
  | 'chip';

/** The larger line drawings of physical things, shown in the panel. */
export type DrawingId =
  | 'wall'
  | 'tablet'
  | 'phone'
  | 'mic'
  | 'speaker'
  | 'plug'
  | 'blind'
  | 'bulb'
  | 'projector'
  | 'cast'
  | 'server';

export type EdgeKind =
  | 'https' // over the internet
  | 'tailscale' // the private network between home and server
  | 'lan' // the home's local network
  | 'local' // inside one machine
  | 'audio' // sound out of a speaker
  | 'training'; // done once, to make a model

/** A box in the map's own units (see SystemMap.size). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapZone {
  id: string;
  label: Text;
  box: Box;
  /** A zone drawn inside another one (the wall, inside the house). */
  parent?: string;
  /** A node that stands for the zone itself, drawn as its title. */
  host?: string;
}

export interface MapNode {
  id: string;
  zone: string;
  label: Text;
  /** A few words under the label: the technology, or the role. */
  sub?: Text;
  glyph: GlyphId;
  /** Physical things carry a line drawing in their panel. */
  drawing?: DrawingId;
  /** What it is, what it does, why it is there. */
  body: Text;
  tags: (string | Text)[];
  /** Its centre, in the map's units. A zone's host needs none. */
  at?: { x: number; y: number };
}

export interface MapEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  label: Text;
}

export interface WalkStep {
  /**
   * The nodes this step lights, in the order things happen; every edge
   * between two of them lights too, flowing that way.
   */
  nodes: string[];
  caption: Text;
}

export interface Walkthrough {
  id: string;
  title: Text;
  steps: WalkStep[];
}

export interface SystemMap {
  id: string;
  /** What a screen reader hears for the whole map. */
  label: Text;
  /** The map's own units: every box and position is measured in them. */
  size: { w: number; h: number };
  zones: MapZone[];
  nodes: MapNode[];
  edges: MapEdge[];
  walkthroughs: Walkthrough[];
}
