/**
 * The system map's behaviour (see SystemMap.astro): wires drawn from where
 * the parts really sit, a part's panel, a hover preview, walkthroughs that
 * light a path one step at a time, and the «no internet» view. Without it,
 * the parts and their texts still read.
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
  walks: Record<string, { nodes: string[]; caption: string }[]>;
  offline: { keep: string[]; lose: string[] } | null;
  bundles: { from: string; zone: string }[];
  stepOf: string;
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
const STEP_MS = 3600;
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
  const player = $<HTMLElement>('[data-smap-player]')!;
  const dots = $<HTMLElement>('[data-smap-dots]')!;
  const stepN = $<HTMLElement>('[data-smap-step-n]')!;
  const caption = $<HTMLElement>('[data-smap-caption]')!;
  const intro = $<HTMLElement>('[data-smap-intro]');
  const offlineButton = $<HTMLButtonElement>('[data-smap-offline]');
  const offlineNote = $<HTMLElement>('[data-smap-offline-note]');
  const prevs = $$<HTMLButtonElement>('[data-smap-prev]');
  const nexts = $$<HTMLButtonElement>('[data-smap-next]');
  const plays = $$<HTMLButtonElement>('[data-smap-play]');
  const ends = $$<HTMLButtonElement>('[data-smap-end]');

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
  const walkButtons = $$<HTMLButtonElement>('[data-walk]');
  const stepLists = new Map(
    $$<HTMLElement>('[data-smap-steps]').map((el) => [
      el.dataset.smapSteps!,
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
  // stacked in one column bow out to the side instead, so the wire does not
  // run behind the parts between them.
  const curve = (a: Point, b: Point, width: number) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    let c1: Point;
    let c2: Point;
    if (Math.abs(dx) < 28) {
      const side = a.x > width / 2 ? -1 : 1;
      const bow = side * Math.min(150, Math.abs(dy) * 0.42 + 16);
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

  // A bundled wire: straight out to a trunk just before the zone, along the
  // trunk, then into its part. The bundle's wires share every pixel up to
  // where they fan out, so they read as one.
  const trunk = (a: Point, b: Point, x: number) => {
    const r = Math.min(8, Math.abs(b.y - a.y) / 2);
    const s = Math.sign(b.y - a.y) || 1;
    const d = r
      ? `M${f(a.x)} ${f(a.y)}H${f(x - r)}Q${f(x)} ${f(a.y)} ${f(x)} ${f(a.y + s * r)}V${f(b.y - s * r)}Q${f(x)} ${f(b.y)} ${f(x + r)} ${f(b.y)}H${f(b.x)}`
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
    cards = [...boxes.values()];
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
      const zone = bundle ? zones.get(bundle.zone) : undefined;
      let path: { d: string; at: (t: number) => Point };
      if (bundle && zone) {
        const x = boxOf(zone, origin).l - 9;
        const fromHub = bundle.from === wire.from;
        const hub = centreOf(fromHub ? a : b);
        const leaf = centreOf(fromHub ? b : a);
        const p = trunk(hub, leaf, x);
        path = fromHub ? p : { d: p.d, at: (t) => p.at(1 - t) };
      } else {
        path = curve(centreOf(a), centreOf(b), origin.width);
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
  let walk: { id: string; step: number; playing: boolean } | null = null;
  let offline = false;
  let timer = 0;
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
      const steps = data.walks[walk.id]!;
      const order = steps[walk.step]!.nodes;
      order.forEach((n) => active.add(n));
      wires.forEach((w) => {
        const i = order.indexOf(w.from);
        const j = order.indexOf(w.to);
        if (i >= 0 && j >= 0) lit.set(w, i > j);
      });
      steps.slice(0, walk.step).forEach((step) => {
        step.nodes.forEach((n) => active.has(n) || visited.add(n));
        wires.forEach((w) => {
          if (step.nodes.includes(w.from) && step.nodes.includes(w.to))
            trail.add(w);
        });
      });
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
      active.size + related.size + down.size > 0,
    );
    root.toggleAttribute('data-preview', !selected && !!preview);
    nodes.forEach((el, id) => {
      el.classList.toggle('is-active', active.has(id));
      el.classList.toggle('is-related', related.has(id) && !active.has(id));
      el.classList.toggle('is-visited', visited.has(id));
      el.classList.toggle('is-down', down.has(id));
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
    if (!panel.hasAttribute('data-open') || isWide()) {
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
  $('[data-smap-close]')!.addEventListener('click', () => close());
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
      expand(!panel.hasAttribute('data-expanded'));
    }
  });

  // A click on the empty map lets go of whatever was chosen.
  canvas.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('[data-node]')) return;
    if (selected) close();
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
    // Bring the note and as much of the map as fits into view.
    if (on && offlineNote) {
      const top = offlineNote.getBoundingClientRect().top;
      const bottom = canvas.getBoundingClientRect().bottom;
      if (top < 72 || bottom > window.innerHeight)
        window.scrollBy({ top: top - 80, behavior: smooth() });
    }
  };
  offlineButton?.addEventListener('click', () => {
    if (selected) close();
    if (walk) endWalk(false);
    setOffline(!offline);
  });

  // ── Walkthroughs ───────────────────────────────────────────
  const schedule = () => {
    window.clearTimeout(timer);
    if (!walk?.playing) return;
    timer = window.setTimeout(() => {
      if (!walk) return;
      const steps = data.walks[walk.id]!;
      if (walk.step < steps.length - 1) {
        go(walk.step + 1);
      } else {
        walk.playing = false;
        showWalk();
      }
    }, STEP_MS);
  };

  const showWalk = () => {
    if (!walk) return;
    const steps = data.walks[walk.id]!;
    const step = steps[walk.step]!;
    player.hidden = false;
    stepN.textContent = data.stepOf
      .replace('{n}', String(walk.step + 1))
      .replace('{total}', String(steps.length));
    caption.textContent = step.caption;
    dots.replaceChildren(
      ...steps.map((_, i) => {
        const li = document.createElement('li');
        if (i < walk!.step) li.className = 'is-done';
        if (i === walk!.step) li.className = 'is-now';
        return li;
      }),
    );
    prevs.forEach((b) => (b.disabled = walk!.step === 0));
    nexts.forEach((b) => (b.disabled = walk!.step === steps.length - 1));
    const paused = !walk.playing;
    plays.forEach((b) => {
      b.toggleAttribute('data-paused', paused);
      b.hidden = reducedMotion.matches;
      const label = paused ? b.dataset.play! : b.dataset.pause!;
      b.setAttribute('aria-label', label);
      b.title = label;
    });
    walkButtons.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.walk === walk!.id)),
    );
    if (intro) intro.hidden = true;
    stepLists.forEach((el, id) => {
      el.hidden = id !== walk!.id;
      el.querySelectorAll<HTMLElement>('[data-smap-goto-step]').forEach(
        (b, i) => {
          b.classList.toggle('is-now', i === walk!.step);
          b.classList.toggle('is-done', i < walk!.step);
          if (i === walk!.step) b.setAttribute('aria-current', 'step');
          else b.removeAttribute('aria-current');
        },
      );
    });
    paint();
    schedule();
  };

  const go = (step: number) => {
    if (!walk) return;
    const steps = data.walks[walk.id]!;
    walk.step = Math.max(0, Math.min(steps.length - 1, step));
    showWalk();
    if (isStacked()) followStep();
    else frameMap();
  };

  // A path must stay in sight. On wider screens the whole map (and the
  // player below it, when there is one) comes into view; stacked on a
  // phone, the step's parts are brought above the player.
  const frameMap = () => {
    if (isStacked()) return;
    // Wide: the header is all that sits on top. In between, the slim header
    // and the player held at the bottom.
    const top = isWide() ? 84 : 46;
    const floor =
      window.innerHeight -
      (isWide() ? 8 : player.getBoundingClientRect().height + 16);
    const r = canvas.getBoundingClientRect();
    if (r.top >= top - 4 && r.bottom <= floor + 4) return;
    const room = floor - top;
    const offset = r.height < room ? (room - r.height) / 2 : 0;
    window.scrollBy({ top: r.top - top - offset, behavior: smooth() });
  };

  const followStep = () => {
    if (!walk || !isStacked()) return;
    const parts = data.walks[walk.id]![walk.step]!.nodes.map((id) =>
      nodes.get(id),
    ).filter((el): el is HTMLButtonElement => !!el);
    if (!parts.length) return;
    const rects = parts.map((el) => el.getBoundingClientRect());
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const floor = player.getBoundingClientRect().top - 12;
    if (top >= 72 && bottom <= floor) return;
    // As many of the step's parts as fit between the header and the player.
    const room = floor - 72;
    const span = bottom - top;
    const shift = span <= room ? top - 72 - (room - span) / 2 : top - 80;
    window.scrollBy({ top: shift, behavior: smooth() });
  };

  const startWalk = (id: string) => {
    if (selected) close();
    if (offline) setOffline(false);
    preview = null;
    walk = { id, step: 0, playing: !reducedMotion.matches };
    showWalk();
    if (isStacked()) followStep();
    else frameMap();
  };

  const endWalk = (restoreFocus: boolean) => {
    if (!walk) return;
    const id = walk.id;
    window.clearTimeout(timer);
    walk = null;
    player.hidden = true;
    walkButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    stepLists.forEach((el) => (el.hidden = true));
    if (intro) intro.hidden = false;
    paint();
    if (restoreFocus)
      walkButtons
        .find((b) => b.dataset.walk === id)
        ?.focus({
          preventScroll: true,
        });
  };

  walkButtons.forEach((button) =>
    button.addEventListener('click', () =>
      walk?.id === button.dataset.walk
        ? endWalk(false)
        : startWalk(button.dataset.walk!),
    ),
  );
  prevs.forEach((b) =>
    b.addEventListener('click', () => {
      if (!walk) return;
      walk.playing = false;
      go(walk.step - 1);
    }),
  );
  nexts.forEach((b) =>
    b.addEventListener('click', () => {
      if (!walk) return;
      walk.playing = false;
      go(walk.step + 1);
    }),
  );
  plays.forEach((b) =>
    b.addEventListener('click', () => {
      if (!walk) return;
      const steps = data.walks[walk.id]!;
      walk.playing = !walk.playing;
      // Playing from the last step starts the path again.
      if (walk.playing && walk.step === steps.length - 1) walk.step = 0;
      showWalk();
    }),
  );
  ends.forEach((b) => b.addEventListener('click', () => endWalk(true)));
  stepLists.forEach((el) =>
    el.addEventListener('click', (event) => {
      const b = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-smap-goto-step]',
      );
      if (!b || !walk) return;
      walk.playing = false;
      go(Number(b.dataset.smapGotoStep));
    }),
  );
  reducedMotion.addEventListener('change', () => {
    if (walk && reducedMotion.matches) walk.playing = false;
    showWalk();
  });
}
