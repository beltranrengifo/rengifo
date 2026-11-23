/**
 * The system map's behaviour (see SystemMap.astro): wires drawn from where
 * the parts really sit, a part's panel, and walkthroughs that light a path
 * one step at a time. Without it, the parts and their texts still read.
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
  walks: Record<string, { nodes: string[]; caption: string }[]>;
  stepOf: string;
}
interface Wire extends WireData {
  g: SVGGElement;
  base: SVGPathElement;
  pulse: SVGPathElement;
  text: SVGTextElement;
  /** Where its label sits: halfway, or just clear of either end. */
  spots: { mid: Spot; nearFrom: Spot; nearTo: Spot };
}
interface Point {
  x: number;
  y: number;
}
/** A label's spot, and which way its text runs from there. */
interface Spot extends Point {
  anchor: 'start' | 'middle' | 'end';
}

const SVG = 'http://www.w3.org/2000/svg';
const STEP_MS = 3600;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document
  .querySelectorAll<HTMLElement>('[data-smap]')
  .forEach((root) => init(root));

function init(root: HTMLElement) {
  const data = JSON.parse(
    root.querySelector('[data-smap-data]')!.textContent ?? '{}',
  ) as MapData;
  const canvas = root.querySelector<HTMLElement>('[data-smap-canvas]')!;
  const svg = root.querySelector<SVGSVGElement>('[data-smap-wires]')!;
  const labels = root.querySelector<SVGSVGElement>('[data-smap-labels]')!;
  const panel = root.querySelector<HTMLElement>('[data-smap-panel]')!;
  const player = root.querySelector<HTMLElement>('[data-smap-player]')!;
  const dots = root.querySelector<HTMLElement>('[data-smap-dots]')!;
  const stepN = root.querySelector<HTMLElement>('[data-smap-step-n]')!;
  const caption = root.querySelector<HTMLElement>('[data-smap-caption]')!;
  const prev = root.querySelector<HTMLButtonElement>('[data-smap-prev]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-smap-next]')!;
  const play = root.querySelector<HTMLButtonElement>('[data-smap-play]')!;
  const intro = root.querySelector<HTMLElement>('[data-smap-intro]');

  const nodes = new Map(
    [...root.querySelectorAll<HTMLButtonElement>('[data-node]')].map((el) => [
      el.dataset.node!,
      el,
    ]),
  );
  const zones = new Map(
    [...root.querySelectorAll<HTMLElement>('[data-zone]')].map((el) => [
      el.dataset.zone!,
      el,
    ]),
  );
  const sections = new Map(
    [...panel.querySelectorAll<HTMLElement>('[data-panel]')].map((el) => [
      el.dataset.panel!,
      el,
    ]),
  );
  const walkButtons = [
    ...root.querySelectorAll<HTMLButtonElement>('[data-walk]'),
  ];
  const stepLists = new Map(
    [...root.querySelectorAll<HTMLElement>('[data-smap-steps]')].map((el) => [
      el.dataset.smapSteps!,
      el,
    ]),
  );

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

  const centre = (el: HTMLElement, origin: DOMRect): Point => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left - origin.left + r.width / 2,
      y: r.top - origin.top + r.height / 2,
    };
  };

  // A soft S between two parts; parts stacked in one column bow out to the
  // side, so the wire does not run behind the parts between them.
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
    } else if (Math.abs(dx) >= Math.abs(dy) * 0.6) {
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
      return {
        x:
          u * u * u * a.x +
          3 * u * u * t * c1.x +
          3 * u * t * t * c2.x +
          t * t * t * b.x,
        y:
          u * u * u * a.y +
          3 * u * u * t * c1.y +
          3 * u * t * t * c2.y +
          t * t * t * b.y,
      };
    };
    const f = (n: number) => n.toFixed(1);
    return {
      d: `M${f(a.x)} ${f(a.y)}C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}`,
      at,
    };
  };

  // The first point along the wire that is clear of a part's card, with
  // its text running away from the card, so the card never hides it.
  const clearOf = (
    at: (t: number) => Point,
    rect: DOMRect,
    origin: DOMRect,
    fromEnd: boolean,
  ): Spot => {
    const box = {
      l: rect.left - origin.left - 8,
      r: rect.right - origin.left + 8,
      t: rect.top - origin.top - 12,
      b: rect.bottom - origin.top + 12,
    };
    for (let i = 0; i <= 25; i++) {
      const p = at(fromEnd ? i / 50 : 1 - i / 50);
      if (p.x < box.l) return { ...p, anchor: 'end' };
      if (p.x > box.r) return { ...p, anchor: 'start' };
      if (p.y < box.t || p.y > box.b) return { ...p, anchor: 'middle' };
    }
    return { ...at(0.5), anchor: 'middle' };
  };

  const layout = () => {
    const origin = canvas.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
    labels.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
    wires.forEach((wire) => {
      const a = nodes.get(wire.from);
      const b = nodes.get(wire.to);
      if (!a || !b) return;
      const { d, at } = curve(
        centre(a, origin),
        centre(b, origin),
        origin.width,
      );
      wire.base.setAttribute('d', d);
      wire.pulse.setAttribute('d', d);
      wire.spots = {
        mid: { ...at(0.5), anchor: 'middle' },
        nearFrom: clearOf(at, a.getBoundingClientRect(), origin, true),
        nearTo: clearOf(at, b.getBoundingClientRect(), origin, false),
      };
    });
    placeLabels();
  };

  // A chosen part's labels sit by its neighbours, where they fan out and
  // do not pile up; a step's labels sit halfway.
  const placeLabels = () => {
    wires.forEach((wire) => {
      const spot =
        selected === wire.from
          ? wire.spots.nearTo
          : selected === wire.to
            ? wire.spots.nearFrom
            : wire.spots.mid;
      wire.text.setAttribute('x', spot.x.toFixed(1));
      wire.text.setAttribute('y', spot.y.toFixed(1));
      wire.text.setAttribute('text-anchor', spot.anchor);
    });
  };

  // ── State ──────────────────────────────────────────────────
  let selected: string | null = null;
  let walk: { id: string; step: number; playing: boolean } | null = null;
  let timer = 0;
  let returnFocus: HTMLElement | null = null;

  new ResizeObserver(layout).observe(canvas);
  document.fonts?.ready.then(layout);
  layout();

  const neighbours = (id: string) =>
    new Set(
      wires.flatMap((w) =>
        w.from === id ? [w.to] : w.to === id ? [w.from] : [],
      ),
    );

  /** Paint the map for whatever is chosen: a part, a step, or nothing. */
  const paint = () => {
    const active = new Set<string>();
    const related = new Set<string>();
    const visited = new Set<string>();
    const lit = new Map<Wire, boolean>(); // wire → flows backwards
    const trail = new Set<Wire>();
    const litZones = new Set<string>();

    if (selected) {
      active.add(selected);
      neighbours(selected).forEach((n) => related.add(n));
      const host = data.hosts[selected];
      host?.nodes.forEach((n) => related.add(n));
      host?.zones.forEach((z) => litZones.add(z));
      wires.forEach((w) => {
        if (w.from === selected || w.to === selected) lit.set(w, false);
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
    }

    root.toggleAttribute('data-focus', active.size > 0);
    placeLabels();
    nodes.forEach((el, id) => {
      el.classList.toggle('is-active', active.has(id));
      el.classList.toggle('is-related', related.has(id) && !active.has(id));
      el.classList.toggle('is-visited', visited.has(id));
      el.setAttribute('aria-expanded', String(id === selected));
    });
    zones.forEach((el, id) =>
      el.classList.toggle('is-active', litZones.has(id)),
    );
    wires.forEach((w) => {
      w.g.classList.toggle('is-lit', lit.has(w));
      w.g.classList.toggle('is-rev', lit.get(w) === true);
      w.g.classList.toggle('is-visited', trail.has(w) && !lit.has(w));
      // Labels only for a chosen part: a step has its caption instead.
      w.text.classList.toggle('is-lit', !!selected && lit.has(w));
      // Lit wires on top, so their labels are not crossed by the rest.
      if (lit.has(w)) svg.append(w.g);
    });
  };

  // ── The panel ──────────────────────────────────────────────
  const select = (id: string, from?: HTMLElement) => {
    if (!sections.has(id)) return;
    if (walk) endWalk(false);
    if (!selected) returnFocus = from ?? nodes.get(id) ?? null;
    selected = id;
    sections.forEach((el, key) => (el.hidden = key !== id));
    panel.inert = false;
    panel.toggleAttribute('data-open', true);
    panel.scrollTop = 0;
    paint();
    sections.get(id)!.querySelector<HTMLElement>('h3')?.focus({
      preventScroll: true,
    });
    keepInSight(nodes.get(id));
  };

  // As a sheet the panel covers the lower part of the screen: lift the
  // chosen part above it, so its wires stay in sight.
  const keepInSight = (node?: HTMLElement) => {
    if (!node || window.innerWidth >= 1280) return;
    const r = node.getBoundingClientRect();
    const room = window.innerHeight - panel.getBoundingClientRect().height;
    if (r.top > 72 && r.bottom < room - 12) return;
    window.scrollBy({
      top: r.top - Math.max(84, (room - r.height) / 2),
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  };

  const close = () => {
    if (!selected) return;
    const back = nodes.get(selected) ?? returnFocus;
    selected = null;
    panel.removeAttribute('data-open');
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
  root
    .querySelector('[data-smap-close]')!
    .addEventListener('click', () => close());

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
    }
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
    prev.disabled = walk.step === 0;
    next.disabled = walk.step === steps.length - 1;
    const paused = !walk.playing;
    play.toggleAttribute('data-paused', paused);
    play.hidden = reducedMotion.matches;
    const label = paused ? play.dataset.play! : play.dataset.pause!;
    play.setAttribute('aria-label', label);
    play.title = label;
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
    bringIntoView();
  };

  // On a phone the path can lead off screen: bring its first part back.
  const bringIntoView = () => {
    if (!walk || window.innerWidth >= 760) return;
    const first = nodes.get(data.walks[walk.id]![walk.step]!.nodes[0]!);
    if (!first) return;
    const r = first.getBoundingClientRect();
    const playerTop = player.getBoundingClientRect().top;
    if (r.top < 70 || r.bottom > playerTop - 10) {
      first.scrollIntoView({
        block: 'center',
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    }
  };

  const startWalk = (id: string) => {
    if (selected) close();
    walk = { id, step: 0, playing: !reducedMotion.matches };
    showWalk();
    bringIntoView();
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
  prev.addEventListener('click', () => {
    if (!walk) return;
    walk.playing = false;
    go(walk.step - 1);
  });
  next.addEventListener('click', () => {
    if (!walk) return;
    walk.playing = false;
    go(walk.step + 1);
  });
  play.addEventListener('click', () => {
    if (!walk) return;
    const steps = data.walks[walk.id]!;
    walk.playing = !walk.playing;
    // Playing from the last step starts the path again.
    if (walk.playing && walk.step === steps.length - 1) walk.step = 0;
    showWalk();
  });
  root
    .querySelector('[data-smap-end]')!
    .addEventListener('click', () => endWalk(true));
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
