/**
 * Fruit for the roles on the board — for fun, nothing more. Each role gets
 * one, picked from its id so it stays the same on every visit. Drawn as flat
 * shapes with an ink hairline, in muted colours that sit with the chart.
 * Every shape is defined for a radius of 1 and scaled to the node.
 */

const NS = 'http://www.w3.org/2000/svg';

function el<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number>,
  parent: Element,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  parent.append(node);
  return node;
}

const LEAF = '#7f9a5a';
const STEM = '#6b5a45';

type Draw = (g: SVGGElement) => void;

const body = (g: SVGGElement, d: string, fill: string) =>
  el('path', { d, fill, class: 'fruit-body' }, g);
const leaf = (g: SVGGElement, x: number, y: number, angle: number) =>
  el(
    'path',
    {
      d: 'M0 0 Q0.18 -0.2 0.42 -0.02 Q0.18 0.12 0 0 Z',
      fill: LEAF,
      class: 'fruit-detail',
      transform: `translate(${x} ${y}) rotate(${angle})`,
    },
    g,
  );
const stem = (g: SVGGElement, d: string) =>
  el(
    'path',
    {
      d,
      fill: 'none',
      stroke: STEM,
      'stroke-width': 0.07,
      'stroke-linecap': 'round',
      class: 'fruit-stem',
    },
    g,
  );
const blush = (
  g: SVGGElement,
  cx: number,
  cy: number,
  r: number,
  colour: string,
) =>
  el(
    'circle',
    { cx, cy, r, fill: colour, opacity: 0.35, class: 'fruit-detail' },
    g,
  );

const FRUITS: Record<string, Draw> = {
  pear: (g) => {
    body(
      g,
      'M0 -0.95 C0.22 -0.95 0.3 -0.6 0.36 -0.35 C0.75 -0.15 0.95 0.25 0.85 0.6 C0.72 0.98 -0.72 0.98 -0.85 0.6 C-0.95 0.25 -0.75 -0.15 -0.36 -0.35 C-0.3 -0.6 -0.22 -0.95 0 -0.95 Z',
      '#cfc46f',
    );
    blush(g, 0.35, 0.45, 0.32, '#d9875f');
    stem(g, 'M0 -0.92 Q0.04 -1.12 0.14 -1.2');
    leaf(g, 0.08, -1.08, -20);
  },
  apple: (g) => {
    body(
      g,
      'M0 -0.62 C0.25 -0.9 0.95 -0.85 0.95 -0.15 C0.95 0.55 0.5 0.98 0.22 0.92 C0.1 0.9 -0.1 0.9 -0.22 0.92 C-0.5 0.98 -0.95 0.55 -0.95 -0.15 C-0.95 -0.85 -0.25 -0.9 0 -0.62 Z',
      '#c65a4c',
    );
    blush(g, -0.4, -0.3, 0.25, '#f0c16a');
    stem(g, 'M0 -0.6 Q0.02 -0.85 0.12 -0.98');
    leaf(g, 0.08, -0.85, -35);
  },
  peach: (g) => {
    body(
      g,
      'M0 -0.95 C0.6 -0.95 0.98 -0.55 0.98 0 C0.98 0.6 0.55 0.98 0 0.98 C-0.55 0.98 -0.98 0.6 -0.98 0 C-0.98 -0.55 -0.6 -0.95 0 -0.95 Z',
      '#eba876',
    );
    blush(g, 0.3, 0.1, 0.55, '#d8664f');
    el(
      'path',
      {
        d: 'M0.05 -0.9 C-0.2 -0.4 -0.2 0.4 0.05 0.95',
        fill: 'none',
        stroke: '#c9603f',
        'stroke-width': 0.05,
        opacity: 0.6,
        class: 'fruit-detail',
      },
      g,
    );
    leaf(g, 0.05, -0.92, -40);
  },
  lemon: (g) => {
    body(
      g,
      'M-1 0 C-0.85 -0.12 -0.75 -0.7 0 -0.72 C0.75 -0.7 0.85 -0.12 1 0 C0.85 0.12 0.75 0.7 0 0.72 C-0.75 0.7 -0.85 0.12 -1 0 Z',
      '#e7cf5c',
    );
    blush(g, -0.25, -0.3, 0.2, '#fff3b0');
    leaf(g, 0.55, -0.5, -60);
  },
  orange: (g) => {
    body(
      g,
      'M0 -0.95 C0.55 -0.95 0.95 -0.55 0.95 0 C0.95 0.55 0.55 0.95 0 0.95 C-0.55 0.95 -0.95 0.55 -0.95 0 C-0.95 -0.55 -0.55 -0.95 0 -0.95 Z',
      '#e59a47',
    );
    for (const [x, y] of [
      [-0.35, -0.2],
      [0.2, 0.35],
      [0.4, -0.35],
      [-0.15, 0.5],
      [-0.5, 0.25],
    ]) {
      el(
        'circle',
        {
          cx: x,
          cy: y,
          r: 0.03,
          fill: '#b96f24',
          opacity: 0.6,
          class: 'fruit-detail',
        },
        g,
      );
    }
    leaf(g, 0, -0.92, -25);
  },
  plum: (g) => {
    body(
      g,
      'M0.05 -0.9 C0.6 -0.9 0.9 -0.4 0.9 0.1 C0.9 0.62 0.45 0.95 -0.05 0.95 C-0.6 0.95 -0.9 0.5 -0.9 0 C-0.9 -0.55 -0.5 -0.9 0.05 -0.9 Z',
      '#7b5a86',
    );
    blush(g, -0.35, -0.35, 0.25, '#b49ac0');
    el(
      'path',
      {
        d: 'M0.05 -0.88 C0.3 -0.3 0.3 0.4 0.05 0.92',
        fill: 'none',
        stroke: '#4f3757',
        'stroke-width': 0.05,
        opacity: 0.6,
        class: 'fruit-detail',
      },
      g,
    );
    stem(g, 'M0.05 -0.88 Q0.08 -1.05 0.02 -1.15');
  },
  fig: (g) => {
    body(
      g,
      'M0 -0.98 C0.2 -0.98 0.25 -0.6 0.45 -0.4 C0.85 -0.05 0.9 0.55 0.6 0.82 C0.3 1.05 -0.3 1.05 -0.6 0.82 C-0.9 0.55 -0.85 -0.05 -0.45 -0.4 C-0.25 -0.6 -0.2 -0.98 0 -0.98 Z',
      '#8a6175',
    );
    blush(g, 0.25, 0.4, 0.3, '#b98599');
    stem(g, 'M0 -0.96 L0.02 -1.12');
  },
  apricot: (g) => {
    body(
      g,
      'M0 -0.88 C0.58 -0.9 0.95 -0.5 0.95 0.05 C0.95 0.6 0.5 0.95 0 0.95 C-0.5 0.95 -0.95 0.6 -0.95 0.05 C-0.95 -0.5 -0.58 -0.9 0 -0.88 Z',
      '#f0b25e',
    );
    blush(g, -0.3, 0.2, 0.42, '#e07b4a');
    stem(g, 'M0 -0.86 Q0.03 -1 0.1 -1.06');
  },
};

/** Fruit for the projects, so none looks like one of the jobs. */
const PROJECT_FRUITS: Record<string, Draw> = {
  pomegranate: (g) => {
    el(
      'path',
      {
        d: 'M-0.28 -0.82 L-0.2 -1.12 L-0.06 -0.92 L0 -1.16 L0.06 -0.92 L0.2 -1.12 L0.28 -0.82 Z',
        fill: '#8a3532',
        class: 'fruit-body',
      },
      g,
    );
    body(
      g,
      'M0 -0.88 C0.58 -0.88 0.95 -0.5 0.95 0.04 C0.95 0.6 0.52 0.95 0 0.95 C-0.52 0.95 -0.95 0.6 -0.95 0.04 C-0.95 -0.5 -0.58 -0.88 0 -0.88 Z',
      '#b04a45',
    );
    blush(g, -0.35, -0.3, 0.24, '#f0b3a2');
  },
  kiwi: (g) => {
    body(
      g,
      'M0 -0.8 C0.62 -0.8 1 -0.45 1 0 C1 0.45 0.62 0.8 0 0.8 C-0.62 0.8 -1 0.45 -1 0 C-1 -0.45 -0.62 -0.8 0 -0.8 Z',
      '#9a7b55',
    );
    for (const [x, y] of [
      [-0.5, -0.2],
      [-0.1, 0.3],
      [0.35, -0.25],
      [0.55, 0.25],
      [0, -0.45],
    ] as const) {
      blush(g, x, y, 0.06, '#5e4a32');
    }
  },
  mango: (g) => {
    body(
      g,
      'M-0.9 0.1 C-0.95 -0.6 -0.2 -1 0.4 -0.85 C0.95 -0.7 1 0 0.75 0.5 C0.45 0.95 -0.3 1 -0.65 0.75 C-0.85 0.6 -0.88 0.35 -0.9 0.1 Z',
      '#e3a645',
    );
    blush(g, 0.3, -0.4, 0.4, '#d9604a');
    stem(g, 'M0.35 -0.86 Q0.4 -1.02 0.5 -1.08');
    leaf(g, 0.45, -1.02, -15);
  },
  banana: (g) => {
    body(
      g,
      'M-1 -0.5 C-0.78 0.55 0.45 0.88 1 0.05 L0.88 -0.12 C0.32 0.32 -0.48 0.1 -0.78 -0.65 Z',
      '#e8cf62',
    );
    stem(g, 'M-0.9 -0.58 L-1.02 -0.78');
  },
  watermelon: (g) => {
    body(g, 'M-1 -0.25 A1 1 0 0 0 1 -0.25 Z', '#7f9a5a');
    el(
      'path',
      { d: 'M-0.84 -0.25 A0.84 0.84 0 0 0 0.84 -0.25 Z', fill: '#d8615c' },
      g,
    );
    for (const [x, y] of [
      [-0.4, 0.05],
      [0, 0.2],
      [0.4, 0.05],
      [-0.15, 0.4],
      [0.2, 0.42],
    ] as const) {
      blush(g, x, y, 0.05, '#2e2a26');
    }
  },
};

export const PROJECT_KINDS = Object.keys(PROJECT_FRUITS);

/** Small fruit for the technologies, one kind per layer. */
const BERRIES: Record<string, Draw> = {
  cherry: (g) => {
    body(
      g,
      'M0 -0.7 C0.55 -1 1 -0.45 0.95 0.15 C0.9 0.75 0.4 1 0 0.95 C-0.4 1 -0.9 0.75 -0.95 0.15 C-1 -0.45 -0.55 -1 0 -0.7 Z',
      '#b5483f',
    );
    blush(g, -0.35, -0.25, 0.2, '#f2b8a8');
    stem(g, 'M0 -0.72 Q0.1 -1.3 0.55 -1.65');
  },
  blueberry: (g) => {
    body(
      g,
      'M0 -0.95 C0.55 -0.95 0.95 -0.55 0.95 0 C0.95 0.55 0.55 0.95 0 0.95 C-0.55 0.95 -0.95 0.55 -0.95 0 C-0.95 -0.55 -0.55 -0.95 0 -0.95 Z',
      '#5f7299',
    );
    el(
      'circle',
      { cx: 0, cy: -0.55, r: 0.22, fill: '#3e4c6b', class: 'fruit-detail' },
      g,
    );
  },
  grape: (g) => {
    body(
      g,
      'M0 -1 C0.5 -1 0.85 -0.55 0.85 0 C0.85 0.55 0.5 1 0 1 C-0.5 1 -0.85 0.55 -0.85 0 C-0.85 -0.55 -0.5 -1 0 -1 Z',
      '#8d73a0',
    );
    blush(g, -0.3, -0.35, 0.22, '#e3d4ee');
    stem(g, 'M0 -0.98 L0.05 -1.3');
  },
  raspberry: (g) => {
    body(
      g,
      'M0 -0.85 C0.6 -0.85 0.95 -0.4 0.9 0.15 C0.85 0.65 0.45 0.98 0 0.98 C-0.45 0.98 -0.85 0.65 -0.9 0.15 C-0.95 -0.4 -0.6 -0.85 0 -0.85 Z',
      '#c25a6c',
    );
    for (const [x, y] of [
      [-0.4, -0.2],
      [0.15, -0.35],
      [0.45, 0.15],
      [-0.15, 0.3],
      [0.1, 0.65],
    ] as const) {
      blush(g, x, y, 0.13, '#f4c0c8');
    }
  },
  strawberry: (g) => {
    body(
      g,
      'M0 1 C-0.7 0.65 -1 0 -0.85 -0.45 C-0.7 -0.85 0.7 -0.85 0.85 -0.45 C1 0 0.7 0.65 0 1 Z',
      '#c8574a',
    );
    for (const [x, y] of [
      [-0.4, -0.25],
      [0.35, -0.3],
      [0, 0.05],
      [-0.3, 0.35],
      [0.3, 0.35],
    ] as const) {
      blush(g, x, y, 0.07, '#f6e3a8');
    }
    leaf(g, 0, -0.72, -150);
    leaf(g, 0, -0.72, -30);
  },
};

const BERRY_OF_LAYER: Record<string, string> = {
  backend: 'cherry',
  frontend: 'blueberry',
  tools: 'grape',
  media: 'raspberry',
  practice: 'strawberry',
};

/** The small fruit for a technology's layer. */
export function berryFor(layer: string): string {
  return BERRY_OF_LAYER[layer] ?? 'cherry';
}

export const KINDS = Object.keys(FRUITS);

/** A stable pick: the same id always gets the same fruit. */
export function fruitFor(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return KINDS[h % KINDS.length]!;
}

/**
 * Draw a fruit of radius `r` into `parent`. Returns the group so the caller
 * can make it float.
 */
export function drawFruit(
  parent: SVGGElement,
  kind: string,
  r: number,
): SVGGElement {
  const outer = el('g', { class: `board-fruit fruit-${kind}` }, parent);
  const g = el('g', { transform: `scale(${r})` }, outer);
  (FRUITS[kind] ?? PROJECT_FRUITS[kind] ?? BERRIES[kind])!(g);
  return outer;
}
