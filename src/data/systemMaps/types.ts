/**
 * An explorable map of how a system fits together: zones (where things
 * run), nodes (the parts), edges (how they talk) and walkthroughs (a path
 * lit all at once, strongest where it starts). One data file per map; SystemMap.astro draws any of
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
  | 'chip'
  | 'tunnel'
  | 'bell'
  | 'pulse'
  | 'stack'
  | 'globe'
  | 'laptop'
  | 'antenna'
  | 'route'
  | 'panel'
  | 'vector'
  | 'box'
  | 'bucket'
  | 'snapshot'
  | 'board'
  | 'nas'
  | 'cloud'
  | 'voice';

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
  | 'server'
  | 'laptop'
  | 'esp32'
  | 'pi'
  | 'nas';

export type EdgeKind =
  | 'https' // over the internet
  | 'tailscale' // the private network between home and server
  | 'lan' // the home's local network
  | 'local' // inside one machine
  | 'audio' // sound out of a speaker
  | 'training' // done once, to make a model
  | 'backup'; // a copy, kept somewhere else

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
  /**
   * A passage between two zones rather than a place: drawn as a gateway on
   * a wide map, as a band of its own when the zones stack.
   */
  tunnel?: true;
  /** Someone else's machines rather than mine: drawn dashed. */
  outside?: true;
  /** Its title at the right end of its top edge, clear of wires on the left. */
  titleEnd?: true;
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
  /** A project of its own on this site: its panel links to its page. */
  caseStudy?: string;
  /**
   * A layer the rest of its zone runs on (an operating system): drawn as a
   * band across the bottom of the zone, or its first row on a phone.
   */
  layer?: true;
  /**
   * One of many alike (an instance per app): drawn as a stack, two more
   * cards peeking out behind it, never named or counted.
   */
  many?: true;
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

/**
 * What still stands when something goes: by default the internet (the
 * map's «no internet» view), or whatever its own label names.
 */
export interface OfflineView {
  /** The toggle's words, when it is not «no internet». */
  label?: Text;
  /** The toggle's icon, struck through when on; a wifi sign by default. */
  glyph?: GlyphId;
  note: Text;
  /** The parts that keep working, lit. */
  keep: string[];
  /** The zones out of reach, marked as such. */
  lose: string[];
}

/**
 * Wires from one part to every part of a zone, drawn as one trunk that fans
 * out by the zone, instead of a sheaf of separate curves.
 */
export interface Bundle {
  from: string;
  zone: string;
  /** The zone whose left side carries the trunk; the bundle's own by default. */
  trunk?: string;
}

export interface SystemMap {
  id: string;
  /** What a screen reader hears for the whole map. */
  label: Text;
  /** A line under the map's heading: what it shows and how to use it. */
  intro: Text;
  /** The map's own units: every box and position is measured in them. */
  size: { w: number; h: number };
  zones: MapZone[];
  nodes: MapNode[];
  edges: MapEdge[];
  walkthroughs: Walkthrough[];
  offline?: OfflineView;
  bundles?: Bundle[];
}
