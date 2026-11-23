/**
 * The system map's behaviour (see SystemMap.astro): wires drawn from where
 * the parts really sit, a part's panel, a hover preview, walkthroughs that
 * light a whole path at once (strongest where it starts, each step's number
 * on its parts), and the «no internet» view (or whatever the map's toggle
 * names). Without it, the parts and their texts still read.
 */

interface WireData {
  from: string;
  to: string;
  kind: string;
  label: string;
}
interface MapData {
  edges: WireData[];
  hosts: Record<string, { zones: string[]; nodes: string[] }>;
  zoneOf: Record<string, string>;
  /** Each walkthrough's steps: the parts each one lights, in order. */
  walks: Record<string, string[][]>;
  offline: { keep: string[]; lose: string[] } | null;
  bundles: { from: string; zone: string; trunk?: string }[];
}
interface Box {
  l: number;
  r: number;
  t: number;
  b: number;
}
interface Point {
  x: number;
  y: number;
}
/** A label's spot, and which way its text runs from there. */
interface Spot extends Point {
  anchor: 'start' | 'middle' | 'end';
}
interface Wire extends WireData {
  g: SVGGElement;
  base: SVGPathElement;
  pulse: SVGPathElement;
  text: SVGTextElement;
  /** Where its label may sit: halfway, or just clear of either end. */
  spots: { mid: Spot; nearFrom: Spot; nearTo: Spot };
}

const SVG = 'http://www.w3.org/2000/svg';
/** How much a path's last step fades next to its first. */
const FADE = 0.55;
const WIDE = 1280; // side panel beside the map
const STACKED = 840; // zones stacked, parts two by two
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

const smooth = (): ScrollBehavior =>
  reducedMotion.matches ? 'auto' : 'smooth';

document
  .querySelectorAll<HTMLElement>('[data-smap]')
  .forEach((root) => init(root));

function init(root: HTMLElement) {
  const data = JSON.parse(
    root.querySelector('[data-smap-data]')!.textContent ?? '{}',
  ) as MapData;
  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const $$ = <T extends Element>(sel: string) => [
    ...root.querySelectorAll<T>(sel),
  ];

  const canvas = $<HTMLElement>('[data-smap-canvas]')!;
  const svg = $<SVGSVGElement>('[data-smap-wires]')!;
  const labels = $<SVGSVGElement>('[data-smap-labels]')!;
  const panel = $<HTMLElement>('[data-smap-panel]')!;
  const handle = $<HTMLButtonElement>('[data-smap-handle]')!;
  const more = $<HTMLButtonElement>('[data-smap-more]')!;
  const offlineButton = $<HTMLButtonElement>('[data-smap-offline]');
  const offlineNote = $<HTMLElement>('[data-smap-offline-note]');
  const bar = $<HTMLElement>('.smap-bar')!;

  const nodes = new Map(
    $$<HTMLButtonElement>('[data-node]').map((el) => [el.dataset.node!, el]),
  );
  const zones = new Map(
    $$<HTMLElement>('[data-zone]').map((el) => [el.dataset.zone!, el]),
  );
  const sections = new Map(
    [...panel.querySelectorAll<HTMLElement>('[data-panel]')].map((el) => [
      el.dataset.panel!,
      el,
    ]),
  );
  const badges = new Map(
    [...nodes].map(([id, el]) => [
      id,
      el.querySelector<HTMLElement>('.smap-badge'),
    ]),
  );
  const walkButtons = $$<HTMLButtonElement>('[data-walk]');
  const walkSections = new Map(
    [...panel.querySelectorAll<HTMLElement>('[data-panel-walk]')].map((el) => [
      el.dataset.panelWalk!,
      el,
    ]),
  );
  const isWide = () => window.innerWidth >= WIDE;
  const isStacked = () => window.innerWidth < STACKED;

  // ── Wires ──────────────────────────────────────────────────
  const wires: Wire[] = data.edges.map((edge) => {
    const g = document.createElementNS(SVG, 'g');
    g.setAttribute('class', 'smap-wire');
    const base = document.createElementNS(SVG, 'path');
    base.setAttribute('class', `base k-${edge.kind}`);
    const pulse = document.createElementNS(SVG, 'path');
    pulse.setAttribute('class', 'pulse');
    const text = document.createElementNS(SVG, 'text');
    text.textContent = edge.label;
    g.append(base, pulse);
    svg.append(g);
    labels.append(text);
    const nowhere: Spot = { x: 0, y: 0, anchor: 'middle' };
    const spots = { mid: nowhere, nearFrom: nowhere, nearTo: nowhere };
    return { ...edge, g, base, pulse, text, spots };
  });

  const boxOf = (el: Element, origin: DOMRect): Box => {
    const r = el.getBoundingClientRect();
    return {
      l: r.left - origin.left,
      r: r.right - origin.left,
      t: r.top - origin.top,
      b: r.bottom - origin.top,
    };
  };
  const centreOf = (b: Box): Point => ({
    x: (b.l + b.r) / 2,
    y: (b.t + b.b) / 2,
  });
  const f = (n: number) => n.toFixed(1);

  /** A point along a polyline, by the share of its length. */
  const along = (points: Point[]) => {
    const lengths = points
      .slice(1)
      .map((p, i) => Math.hypot(p.x - points[i]!.x, p.y - points[i]!.y));
    const total = lengths.reduce((a, b) => a + b, 0) || 1;
    return (t: number): Point => {
      let left = t * total;
      for (let i = 0; i < lengths.length; i++) {
        const len = lengths[i]!;
        if (left <= len || i === lengths.length - 1) {
          const k = len ? Math.min(1, left / len) : 0;
          const a = points[i]!;
          const b = points[i + 1]!;
          return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
        }
        left -= len;
      }
      return points[points.length - 1]!;
    };
  };

  // A soft S between two parts, leaving and arriving sideways; parts
  // stacked in one column bow out to the side instead, wide enough to clear
  // the parts between them, so the wire never runs behind one.
  const curve = (a: Point, b: Point, width: number, between: Box[] = []) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    let c1: Point;
    let c2: Point;
    if (Math.abs(dx) < 28) {
      const side = a.x > width / 2 ? -1 : 1;
      let bow = Math.min(150, Math.abs(dy) * 0.42 + 16);
      // Where the bow passes a card it is 3t(1−t) of its full width out.
      const yAt = (t: number) => {
        const u = 1 - t;
        return (
          a.y + dy * (3 * u * u * t * 0.2 + 3 * u * t * t * 0.8 + t * t * t)
        );
      };
      for (const card of between) {
        const need =
          side > 0
            ? card.r + 10 - Math.max(a.x, b.x)
            : Math.min(a.x, b.x) - (card.l - 10);
        if (need <= 0) continue;
        // The card's whole height must be cleared: the least reach counts.
        let reach = Infinity;
        for (let t = 0.02; t < 1; t += 0.02) {
          const y = yAt(t);
          if (y > card.t - 6 && y < card.b + 6)
            reach = Math.min(reach, 3 * t * (1 - t));
        }
        if (reach < Infinity) bow = Math.max(bow, need / reach);
      }
      // Never so wide it reaches the next column.
      bow = side * Math.min(bow, 150);
      c1 = { x: a.x + bow, y: a.y + dy * 0.2 };
      c2 = { x: b.x + bow, y: b.y - dy * 0.2 };
    } else if (Math.abs(dx) >= 60 || Math.abs(dx) >= Math.abs(dy) * 0.6) {
      const mx = (a.x + b.x) / 2;
      c1 = { x: mx, y: a.y };
      c2 = { x: mx, y: b.y };
    } else {
      const my = (a.y + b.y) / 2;
      c1 = { x: a.x, y: my };
      c2 = { x: b.x, y: my };
    }
    const at = (t: number): Point => {
      const u = 1 - t;
      const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      return {
        x: k[0]! * a.x + k[1]! * c1.x + k[2]! * c2.x + k[3]! * b.x,
        y: k[0]! * a.y + k[1]! * c1.y + k[2]! * c2.y + k[3]! * b.y,
      };
    };
    return {
      d: `M${f(a.x)} ${f(a.y)}C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}`,
      at,
    };
  };

  // A bundled wire: straight out to a trunk, along the trunk, then into its
  // part. The bundle's wires share every pixel up to where they fan out, so
  // they read as one.
  const trunk = (a: Point, b: Point, x: number) => {
    const r = Math.min(8, Math.abs(b.y - a.y) / 2);
    const s = Math.sign(b.y - a.y) || 1;
    const out = Math.sign(x - a.x) || 1; // which way the hub leaves
    const into = Math.sign(b.x - x) || 1; // which way the part is entered
    const d = r
      ? `M${f(a.x)} ${f(a.y)}H${f(x - out * r)}Q${f(x)} ${f(a.y)} ${f(x)} ${f(a.y + s * r)}V${f(b.y - s * r)}Q${f(x)} ${f(b.y)} ${f(x + into * r)} ${f(b.y)}H${f(b.x)}`
      : `M${f(a.x)} ${f(a.y)}H${f(b.x)}`;
    return { d, at: along([a, { x, y: a.y }, { x, y: b.y }, b]) };
  };

  // The first point along the wire that is clear of a part's card, with
  // its text running away from the card, so the card never hides it.
  const clearOf = (at: (t: number) => Point, card: Box, fromEnd: boolean) => {
    const box = {
      l: card.l - 8,
      r: card.r + 8,
      t: card.t - 12,
      b: card.b + 12,
    };
    for (let i = 0; i <= 25; i++) {
      const p = at(fromEnd ? i / 50 : 1 - i / 50);
      if (p.x < box.l) return { ...p, anchor: 'end' } as Spot;
      if (p.x > box.r) return { ...p, anchor: 'start' } as Spot;
      if (p.y < box.t || p.y > box.b) return { ...p, anchor: 'middle' } as Spot;
    }
    return { ...at(0.5), anchor: 'middle' } as Spot;
  };

  /** Every card's box on the canvas, for labels to keep clear of. */
  let cards: Box[] = [];

  const layout = () => {
    const origin = canvas.getBoundingClientRect();
    for (const layer of [svg, labels])
      layer.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
    const boxes = new Map(
      [...nodes].map(([id, el]) => [id, boxOf(el, origin)]),
    );
    // A stack's cards behind, for the labels to keep clear of too.
    const stacks = [...nodes]
      .filter(([, el]) => el.classList.contains('smap-stacked'))
      .map(([id]) => {
        const b = boxes.get(id)!;
        return { ...b, r: b.r + 10, b: b.b + 10 };
      });
    // Zone titles too: a label over one would hide it.
    const titles = $$<HTMLElement>('.smap-zone-label')
      .filter((el) => el.offsetParent)
      .map((el) => boxOf(el, origin));
    cards = [...boxes.values(), ...stacks, ...titles];
    const bundled = (w: Wire) =>
      isStacked()
        ? undefined
        : data.bundles.find(
            (b) =>
              (b.from === w.from && data.zoneOf[w.to] === b.zone) ||
              (b.from === w.to && data.zoneOf[w.from] === b.zone),
          );

    wires.forEach((wire) => {
      const a = boxes.get(wire.from);
      const b = boxes.get(wire.to);
      if (!a || !b) return;
      const bundle = bundled(wire);
      const zone = bundle ? zones.get(bundle.trunk ?? bundle.zone) : undefined;
      let path: { d: string; at: (t: number) => Point };
      if (bundle && zone) {
        const x = boxOf(zone, origin).l - 10;
        const fromHub = bundle.from === wire.from;
        const hub = centreOf(fromHub ? a : b);
        const leaf = centreOf(fromHub ? b : a);
        const p = trunk(hub, leaf, x);
        path = fromHub ? p : { d: p.d, at: (t) => p.at(1 - t) };
      } else {
        // The cards in the same column, between the two ends.
        const top = Math.min(a.t, b.t);
        const bottom = Math.max(a.b, b.b);
        const left = Math.min(a.l, b.l);
        const right = Math.max(a.r, b.r);
        const between = [...boxes]
          .filter(([id, box]) => {
            const x = (box.l + box.r) / 2;
            return (
              id !== wire.from &&
              id !== wire.to &&
              box.t < bottom &&
              box.b > top &&
              x > left &&
              x < right
            );
          })
          .map(([, box]) => box);
        path = curve(centreOf(a), centreOf(b), origin.width, between);
      }
      wire.base.setAttribute('d', path.d);
      wire.pulse.setAttribute('d', path.d);
      wire.spots = {
        mid: { ...path.at(0.5), anchor: 'middle' },
        nearFrom: clearOf(path.at, a, true),
        nearTo: clearOf(path.at, b, false),
      };
    });
    placeLabels();
  };

  // ── State ──────────────────────────────────────────────────
  let selected: string | null = null;
  let preview: string | null = null;
  /** The path on show, and the one step brought forward, if any. */
  let walk: { id: string; step: number | null } | null = null;
  let offline = false;
  let returnFocus: HTMLElement | null = null;

  // A chosen (or hovered) part's labels sit by its neighbours, where they
  // fan out. Each tries a few spots and takes the first that covers no card
  // and no other label; one that finds none stays hidden: the panel lists
  // every wire.
  const placeLabels = () => {
    wires.forEach((w) => w.text.classList.remove('is-shown'));
    const focus = selected ?? preview;
    if (!focus || getComputedStyle(labels).display === 'none') return;
    const taken: Box[] = [];
    const hits = (b: Box) =>
      [...cards, ...taken].some(
        (o) => b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t,
      );
    for (const w of wires) {
      if (w.from !== focus && w.to !== focus) continue;
      const near = focus === w.from ? w.spots.nearTo : w.spots.nearFrom;
      const far = focus === w.from ? w.spots.nearFrom : w.spots.nearTo;
      const mid = w.spots.mid;
      const tries: Spot[] = [
        near,
        { ...near, y: near.y - 13 },
        { ...near, y: near.y + 13 },
        mid,
        { ...mid, y: mid.y - 13 },
        { ...mid, y: mid.y + 13 },
        far,
      ];
      for (const spot of tries) {
        w.text.setAttribute('x', f(spot.x));
        w.text.setAttribute('y', f(spot.y));
        w.text.setAttribute('text-anchor', spot.anchor);
        let box: DOMRect;
        try {
          box = w.text.getBBox();
        } catch {
          return;
        }
        const b = {
          l: box.x - 3,
          r: box.x + box.width + 3,
          t: box.y - 2,
          b: box.y + box.height + 2,
        };
        if (!hits(b)) {
          taken.push(b);
          w.text.classList.add('is-shown');
          break;
        }
      }
    }
  };

  new ResizeObserver(() => {
    layout();
    measureSheet();
  }).observe(canvas);
  document.fonts?.ready.then(layout);
  layout();

  const neighbours = (id: string) =>
    new Set(
      wires.flatMap((w) =>
        w.from === id ? [w.to] : w.to === id ? [w.from] : [],
      ),
    );

  /**
   * Paint the map for whatever is in front: a chosen part, a hovered one,
   * a walkthrough's step, the «no internet» view, or nothing.
   */
  const paint = () => {
    const active = new Set<string>();
    const related = new Set<string>();
    const visited = new Set<string>();
    const down = new Set<string>();
    const lit = new Map<Wire, boolean>(); // wire → flows backwards
    const trail = new Set<Wire>();
    const litZones = new Set<string>();
    const downZones = new Set<string>();
    // A path's parts and wires, each with its strength: 1 at the start.
    const path = new Map<string, number>();
    const pathWires = new Map<Wire, number>();
    const numbers = new Map<string, number>();
    const focus = selected ?? preview;

    if (focus) {
      active.add(focus);
      neighbours(focus).forEach((n) => related.add(n));
      const host = data.hosts[focus];
      host?.nodes.forEach((n) => related.add(n));
      host?.zones.forEach((z) => litZones.add(z));
      wires.forEach((w) => {
        if (w.from === focus || w.to === focus) lit.set(w, false);
      });
    } else if (walk) {
      // The whole path at once. Each part and wire belongs to the first
      // step it shows up in, numbered so, and fades a little with each step
      // after the first: the order reads without waiting for it.
      const steps = data.walks[walk.id]!;
      const strength = (i: number) =>
        steps.length > 1 ? 1 - (FADE * i) / (steps.length - 1) : 1;
      const flow = new Map<Wire, boolean>();
      steps.forEach((order, i) => {
        order.forEach((n) => numbers.has(n) || numbers.set(n, i));
        wires.forEach((w) => {
          const a = order.indexOf(w.from);
          const b = order.indexOf(w.to);
          if (a < 0 || b < 0 || flow.has(w)) return;
          flow.set(w, a > b);
          pathWires.set(w, strength(i));
        });
      });
      if (walk.step === null) {
        numbers.forEach((i, n) => path.set(n, strength(i)));
        flow.forEach((rev, w) => lit.set(w, rev));
      } else {
        // One step brought forward; the rest of the path stays in sight.
        const order = steps[walk.step]!;
        order.forEach((n) => active.add(n));
        numbers.forEach((_, n) => active.has(n) || visited.add(n));
        flow.forEach((_, w) => {
          const a = order.indexOf(w.from);
          const b = order.indexOf(w.to);
          if (a >= 0 && b >= 0) lit.set(w, a > b);
          else trail.add(w);
        });
        pathWires.clear();
      }
    } else if (offline && data.offline) {
      const keep = new Set(data.offline.keep);
      keep.forEach((n) => related.add(n));
      data.offline.lose.forEach((z) => downZones.add(z));
      nodes.forEach((_, id) => {
        if (downZones.has(data.zoneOf[id]!)) down.add(id);
      });
      wires.forEach((w) => {
        if (keep.has(w.from) && keep.has(w.to)) lit.set(w, false);
      });
    }

    root.toggleAttribute(
      'data-focus',
      active.size + related.size + down.size + path.size > 0,
    );
    root.toggleAttribute('data-preview', !selected && !!preview);
    nodes.forEach((el, id) => {
      el.classList.toggle('is-active', active.has(id));
      el.classList.toggle('is-related', related.has(id) && !active.has(id));
      el.classList.toggle('is-visited', visited.has(id));
      el.classList.toggle('is-down', down.has(id));
      el.classList.toggle('is-path', path.has(id));
      if (path.has(id)) el.style.setProperty('--s', String(path.get(id)));
      else el.style.removeProperty('--s');
      const badge = badges.get(id);
      if (badge) {
        const n = numbers.get(id);
        badge.textContent = n === undefined ? '' : String(n + 1);
      }
      el.setAttribute('aria-expanded', String(id === selected));
    });
    zones.forEach((el, id) => {
      el.classList.toggle('is-active', litZones.has(id));
      el.classList.toggle('is-down', downZones.has(id));
    });
    wires.forEach((w) => {
      w.g.classList.toggle('is-lit', lit.has(w));
      w.g.classList.toggle('is-rev', lit.get(w) === true);
      w.g.classList.toggle('is-visited', trail.has(w) && !lit.has(w));
      w.g.classList.toggle('is-path', pathWires.has(w));
      if (pathWires.has(w))
        w.g.style.setProperty('--s', String(pathWires.get(w)));
      else w.g.style.removeProperty('--s');
      // Lit wires on top of the faded ones.
      if (lit.has(w)) svg.append(w.g);
    });
    placeLabels();
  };

  // ── Hover: a preview of a part, on screens with a mouse ─────
  nodes.forEach((el, id) => {
    el.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse' || !canHover.matches) return;
      if (selected || walk) return;
      preview = id;
      paint();
    });
    el.addEventListener('pointerleave', () => {
      if (preview !== id) return;
      preview = null;
      paint();
    });
  });

  // ── The panel ──────────────────────────────────────────────
  const measureSheet = () => {
    if (!panel.hasAttribute('data-open') || isWide() || walk) {
      panel.removeAttribute('data-more');
      return;
    }
    const section = sections.get(selected ?? '');
    const content = section ? section.offsetTop + section.offsetHeight : 0;
    panel.toggleAttribute('data-more', content > panel.clientHeight + 4);
  };

  const expand = (on: boolean) => {
    panel.toggleAttribute('data-expanded', on);
    handle.setAttribute(
      'aria-label',
      on ? handle.dataset.less! : handle.dataset.more!,
    );
    if (!on) panel.scrollTop = 0;
  };

  const select = (id: string, from?: HTMLElement) => {
    if (!sections.has(id)) return;
    if (walk) endWalk(false);
    preview = null;
    if (!selected) returnFocus = from ?? nodes.get(id) ?? null;
    selected = id;
    sections.forEach((el, key) => (el.hidden = key !== id));
    panel.inert = false;
    panel.toggleAttribute('data-open', true);
    expand(false);
    paint();
    measureSheet();
    sections.get(id)!.querySelector<HTMLElement>('h3')?.focus({
      preventScroll: true,
    });
    if (isWide()) {
      // The panel flows with the page: bring its top back if it is above.
      const top = panel.getBoundingClientRect().top;
      if (top < 0) window.scrollBy({ top: top - 96, behavior: smooth() });
    } else {
      keepInSight(nodes.get(id));
    }
  };

  // As a sheet the panel covers the lower part of the screen: lift the
  // chosen part above it, so its wires stay in sight.
  const keepInSight = (node?: HTMLElement) => {
    if (!node) return;
    const r = node.getBoundingClientRect();
    const room = window.innerHeight - panel.getBoundingClientRect().height;
    if (r.top > 72 && r.bottom < room - 12) return;
    window.scrollBy({
      top: r.top - Math.max(84, (room - r.height) / 2),
      behavior: smooth(),
    });
  };

  const close = () => {
    if (!selected) return;
    const back = nodes.get(selected) ?? returnFocus;
    selected = null;
    panel.removeAttribute('data-open');
    panel.removeAttribute('data-more');
    expand(false);
    panel.inert = true;
    paint();
    back?.focus({ preventScroll: true });
    returnFocus = null;
  };

  nodes.forEach((el, id) =>
    el.addEventListener('click', () =>
      selected === id ? close() : select(id, el),
    ),
  );
  panel.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-smap-goto]',
    );
    if (target) select(target.dataset.smapGoto!);
  });
  $('[data-smap-close]')!.addEventListener('click', () =>
    walk ? endWalk(true) : close(),
  );
  more.addEventListener('click', () => expand(true));

  // The sheet's handle: a tap grows or shrinks it, a drag up grows it, a
  // drag down shrinks it, or closes it once small.
  let dragFrom: number | null = null;
  let dragged = false;
  handle.addEventListener('pointerdown', (event) => {
    dragFrom = event.clientY;
    dragged = false;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', (event) => {
    if (dragFrom !== null && Math.abs(event.clientY - dragFrom) > 8)
      dragged = true;
  });
  handle.addEventListener('pointerup', (event) => {
    if (dragFrom === null) return;
    const dy = event.clientY - dragFrom;
    dragFrom = null;
    if (walk) {
      // A path's sheet never scrolls: it folds down to its title instead.
      const folded = panel.hasAttribute('data-folded');
      if (!dragged) fold(!folded);
      else if (dy < -30) fold(false);
      else if (dy > 40) {
        if (folded) endWalk(true);
        else fold(true);
      }
      return;
    }
    const expanded = panel.hasAttribute('data-expanded');
    if (!dragged) expand(!expanded);
    else if (dy < -30) expand(true);
    else if (dy > 40) {
      if (expanded) expand(false);
      else close();
    }
  });
  handle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (walk) fold(!panel.hasAttribute('data-folded'));
      else expand(!panel.hasAttribute('data-expanded'));
    }
  });

  // A click on the empty map lets go of whatever was chosen.
  canvas.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('[data-node]')) return;
    if (selected) close();
    else if (walk && walk.step !== null) bringForward(null);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (selected) {
      event.preventDefault();
      close();
    } else if (walk) {
      event.preventDefault();
      endWalk(true);
    } else if (offline) {
      event.preventDefault();
      setOffline(false);
      offlineButton?.focus({ preventScroll: true });
    }
  });

  // ── «No internet» ──────────────────────────────────────────
  const setOffline = (on: boolean) => {
    offline = on;
    offlineButton?.setAttribute('aria-pressed', String(on));
    if (offlineNote) offlineNote.hidden = !on;
    paint();
    // Bring the toggle, its note and as much of the map as fits into view,
    // below the header.
    if (on && offlineNote) {
      const head = headOf();
      const top = bar.getBoundingClientRect().top;
      const bottom = canvas.getBoundingClientRect().bottom;
      if (top < head - 4 || bottom > window.innerHeight)
        window.scrollBy({ top: top - head, behavior: smooth() });
    }
  };
  offlineButton?.addEventListener('click', () => {
    if (selected) close();
    if (walk) endWalk(false);
    setOffline(!offline);
  });

  // ── Walkthroughs ───────────────────────────────────────────
  // A path lights whole, at once; its steps are listed in the panel (beside
  // the map, or as a sheet), and choosing one brings it forward.
  const fold = (on: boolean) => {
    panel.toggleAttribute('data-folded', on);
    handle.setAttribute(
      'aria-label',
      on ? handle.dataset.more! : handle.dataset.less!,
    );
  };

  /** Just below the site's sticky header, wherever it sits now. */
  const headOf = () => {
    const header = document.querySelector('[data-header]');
    const bottom = header ? header.getBoundingClientRect().bottom : 0;
    return Math.max(0, bottom) + 12;
  };

  /** Where a sheet's top sits once it is in place, or the window's floor. */
  const floorOf = () =>
    window.innerHeight -
    (isWide() || !panel.hasAttribute('data-open')
      ? 8
      : panel.offsetHeight + 12);

  // A path must stay in sight, and so must the bar it was chosen from. On
  // wider screens the bar and the map come into view below the header (the
  // bar first, when both don't fit); stacked on a phone, the path's first
  // parts are brought above the sheet.
  const frameMap = () => {
    const first = data.walks[walk!.id]![0]!;
    if (isStacked()) return followParts(first);
    const head = headOf();
    const floor = floorOf();
    const top = bar.getBoundingClientRect().top;
    const bottom = canvas.getBoundingClientRect().bottom;
    if (top < head - 4 || bottom > floor + 4) {
      const room = floor - head;
      const span = bottom - top;
      const offset = span <= room ? (room - span) / 2 : 0;
      window.scrollTo({
        top: window.scrollY + top - head - offset,
        behavior: smooth(),
      });
    }
  };

  const followParts = (ids: string[], head = headOf()) => {
    const floor = floorOf();
    const rects = ids
      .map((id) => nodes.get(id)?.getBoundingClientRect())
      .filter((r): r is DOMRect => !!r);
    if (!rects.length) return;
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    if (top >= head && bottom <= floor) return;
    // As many of the parts as fit between the header and the floor. When
    // they don't all fit, the first one (where the step starts) always does,
    // with the rest running away from it.
    const room = floor - head;
    const span = bottom - top;
    const lead = rects[0]!;
    const shift =
      span <= room
        ? top - head - (room - span) / 2
        : lead.top <= top + 1
          ? top - head - 8
          : lead.bottom - floor + 8;
    window.scrollBy({ top: shift, behavior: smooth() });
  };

  const bringForward = (step: number | null) => {
    if (!walk) return;
    walk.step = step;
    walkSections
      .get(walk.id)
      ?.querySelectorAll<HTMLElement>('[data-smap-step]')
      .forEach((b, i) => b.setAttribute('aria-pressed', String(i === step)));
    paint();
  };

  const startWalk = (id: string) => {
    if (selected) close();
    if (offline) setOffline(false);
    preview = null;
    walk = { id, step: null };
    sections.forEach((el) => (el.hidden = true));
    walkSections.forEach((el, key) => (el.hidden = key !== id));
    panel.inert = false;
    panel.toggleAttribute('data-open', true);
    panel.toggleAttribute('data-walk', true);
    panel.removeAttribute('data-more');
    expand(false);
    fold(false);
    walkButtons.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.walk === id)),
    );
    bringForward(null);
    frameMap();
  };

  const endWalk = (restoreFocus: boolean) => {
    if (!walk) return;
    const id = walk.id;
    walk = null;
    panel.removeAttribute('data-open');
    panel.removeAttribute('data-walk');
    fold(false);
    panel.inert = true;
    walkSections.forEach((el) => (el.hidden = true));
    walkButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    paint();
    if (restoreFocus)
      walkButtons
        .find((b) => b.dataset.walk === id)
        ?.focus({ preventScroll: true });
  };

  walkButtons.forEach((button) =>
    button.addEventListener('click', () =>
      walk?.id === button.dataset.walk
        ? endWalk(false)
        : startWalk(button.dataset.walk!),
    ),
  );
  walkSections.forEach((el) =>
    el.addEventListener('click', (event) => {
      const b = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-smap-step]',
      );
      if (!b || !walk) return;
      const i = Number(b.dataset.smapStep);
      bringForward(walk.step === i ? null : i);
      if (isWide()) return;
      // As a sheet: fold it down to the chosen step, so the step's parts
      // have the screen, and bring them into view. Letting go of the step
      // opens the whole list again.
      fold(walk.step !== null);
      if (walk.step !== null) followParts(data.walks[walk.id]![walk.step]!);
    }),
  );
}
