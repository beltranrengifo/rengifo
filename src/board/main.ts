import type { ForceX, ForceY } from 'd3-force';
import { createLayout, settle, timeX, type Node } from './layout';
import { END_YEAR, START_YEAR, type BoardModel } from './model';
import { Poncho } from './poncho';

/**
 * Board mode, drawn like a printed chart: hairline circles for roles and
 * projects, small dots for technologies, fine curves between them, a year
 * grid behind. SVG, so it stays sharp at any zoom and its text is text.
 *
 * The layout breathes (a light force simulation that never fully cools)
 * unless the visitor prefers reduced motion. Nodes can be picked up,
 * thrown and left wherever they land.
 */

const NS = 'http://www.w3.org/2000/svg';
const NARROW = '(max-width: 720px)';
const PANEL_WIDTH = 420;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.8;
const TOP = -440;
const BOTTOM = 420;

interface Labels {
  labels: Record<string, { title: string; sub?: string; years?: string }>;
  eras: { label: string; start: number; end: number }[];
}

const root = document.querySelector<HTMLElement>('[data-board]');
if (root) boot(root);

function el<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number> = {},
  parent?: Element,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  parent?.append(node);
  return node;
}

function boot(root: HTMLElement): void {
  const q = <T extends Element>(selector: string) =>
    root.querySelector<T>(selector)!;
  const qa = <T extends Element>(selector: string) =>
    Array.from(root.querySelectorAll<T>(selector));

  const model = JSON.parse(
    q<HTMLScriptElement>('[data-board-model]').textContent ?? '{}',
  ) as BoardModel & Labels;
  const stage = q<HTMLElement>('[data-board-stage]');
  const svg = q<SVGSVGElement>('[data-board-svg]');
  const panel = q<HTMLElement>('[data-board-panel]');
  const sections = qa<HTMLElement>('[data-panel]');
  const ponchoWrap = q<HTMLElement>('[data-poncho]');

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia(NARROW);
  root.dataset.mode = still ? 'still' : 'live';

  const layout = createLayout(model);
  settle(layout, 400);
  const { nodes, links } = layout;

  const poncho = new Poncho(
    ponchoWrap.querySelector<HTMLElement>('.cat-stage')!,
  );

  // ── Scene ──────────────────────────────────────────────────────
  const world = el('g', { class: 'board-world' }, svg);
  const grid = el('g', { class: 'board-grid' }, world);
  const linkLayer = el('g', { class: 'board-links' }, world);
  // Durations: a hairline from each role's start to its end, at its height.
  const spanLayer = el('g', { class: 'board-spans' }, world);
  const nodeLayer = el('g', { class: 'board-nodes' }, world);

  // The year grid: a hairline per year, each one numbered at the top.
  for (let year = START_YEAR; year <= Math.floor(END_YEAR); year++) {
    const x = timeX(year);
    el(
      'line',
      { x1: x, x2: x, y1: TOP + 46, y2: BOTTOM, class: 'board-year-line' },
      grid,
    );
    const label = el(
      'text',
      { x: x + 6, y: TOP + 60, class: 'board-year' },
      grid,
    );
    label.textContent = String(year);
  }
  // Eras: a bracket over their years, named in small caps.
  for (const era of model.eras) {
    const x1 = timeX(era.start) + 4;
    const x2 = timeX(era.end) - 4;
    el(
      'path',
      {
        d: `M${x1} ${TOP + 10} V${TOP + 2} H${x2} V${TOP + 10}`,
        class: 'board-era-bracket',
      },
      grid,
    );
    const label = el(
      'text',
      { x: x1 + 8, y: TOP - 8, class: 'board-era' },
      grid,
    );
    label.textContent = era.label;
  }

  const linkEls = links.map((link) => {
    const path = el('path', { class: 'board-link' }, linkLayer);
    path.style.setProperty('--w', String(link.weight));
    return path;
  });

  const spanEls = nodes.map((node) =>
    node.kind === 'tech'
      ? null
      : el('path', { class: `board-span is-${node.kind}` }, spanLayer),
  );

  const nodeEls = nodes.map((node) => {
    const label = model.labels[node.id]!;
    const g = el(
      'g',
      {
        class: `board-node is-${node.kind} layer-${node.layer}`,
        tabindex: 0,
        role: 'button',
        'aria-label': [label.title, label.sub, label.years]
          .filter(Boolean)
          .join(', '),
      },
      nodeLayer,
    );
    el('circle', { r: node.r, class: 'board-dot' }, g);
    if (node.kind === 'tech') {
      const text = el(
        'text',
        { x: node.r + 7, y: 4, class: 'board-tech-label' },
        g,
      );
      text.textContent = label.title;
      return g;
    }
    const lines = [
      ['board-title', label.title],
      ['board-sub', label.sub],
      ['board-years-label', label.years],
    ].filter(([, text]) => text) as [string, string][];
    // Roles are written above their circle and projects below, so the
    // curves from the technologies between them never cross the words.
    const above = node.kind === 'role';
    let y = above ? -node.r - 12 - (lines.length - 1) * 15 : node.r + 22;
    for (const [className, text] of lines) {
      const line = el('text', { y, class: className }, g);
      line.textContent = text;
      y += 15;
    }
    return g;
  });

  // Who is connected to whom.
  const nodeIndex = new Map(nodes.map((node, i) => [node, i]));
  const neighbours = nodes.map(() => new Set<number>());
  for (const link of links) {
    const a = nodeIndex.get(link.source)!;
    const b = nodeIndex.get(link.target)!;
    neighbours[a]!.add(b);
    neighbours[b]!.add(a);
  }

  // Tab walks the nodes in time order: DOM order is focus order.
  nodes
    .map((node, i) => ({ i, x: node.homeX }))
    .sort((a, b) => a.x - b.x)
    .forEach(({ i }) => nodeLayer.append(nodeEls[i]!));

  // ── Camera ─────────────────────────────────────────────────────
  let panelOpen = false;
  // The space the panel takes, eased so the board slides aside with it
  // instead of jumping.
  let insetNow = 0;
  const insetTarget = () => (panelOpen && !narrow.matches ? PANEL_WIDTH : 0);
  const inset = () => insetNow;
  const viewW = () => stage.clientWidth - inset();
  const fit = () =>
    Math.min(
      1.1,
      Math.max(MIN_ZOOM, stage.clientHeight / (BOTTOM - TOP + 240)),
    );
  const clampX = (x: number, z: number) => {
    const half = viewW() / 2 / z;
    const lo = timeX(START_YEAR) - 120 + half;
    const hi = timeX(END_YEAR) + 120 - half;
    return lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, x));
  };

  let zoom = fit();
  let tz = zoom;
  // Start in the present; the story reads backwards from here.
  let cx = clampX(Infinity, zoom);
  let tcx = cx;
  // A little low, so the eras clear the bar at the top.
  let cy = -40;
  let tcy = -40;

  const toWorld = (sx: number, sy: number): [number, number] => [
    (sx - viewW() / 2) / zoom + cx,
    (sy - stage.clientHeight / 2) / zoom + cy,
  ];
  const toScreen = (wx: number, wy: number): [number, number] => [
    (wx - cx) * zoom + viewW() / 2,
    (wy - cy) * zoom + stage.clientHeight / 2,
  ];
  const glideTo = (wx: number) => {
    tcx = clampX(wx, tz);
  };
  const zoomAt = (sx: number, sy: number, factor: number) => {
    const [wx, wy] = toWorld(sx, sy);
    zoom = tz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
    cx = tcx = clampX(wx - (sx - viewW() / 2) / zoom, zoom);
    cy = tcy = wy - (sy - stage.clientHeight / 2) / zoom;
  };

  // ── Focus ──────────────────────────────────────────────────────
  let focused = -1;
  const focus = (i: number) => {
    if (i === focused) return;
    focused = i;
    svg.toggleAttribute('data-focus', i >= 0);
    nodeEls.forEach((g, k) => {
      g.classList.toggle('is-active', k === i);
      g.classList.toggle('is-related', i >= 0 && neighbours[i]!.has(k));
    });
    links.forEach((link, k) => {
      const on =
        i >= 0 &&
        (nodeIndex.get(link.source) === i || nodeIndex.get(link.target) === i);
      linkEls[k]!.classList.toggle('is-active', on);
    });
  };

  // ── Panel ──────────────────────────────────────────────────────
  let lastFocus: HTMLElement | SVGElement | null = null;
  const open = (id: string) => {
    const section = sections.find((s) => s.dataset.panel === id);
    if (!section) return;
    for (const s of sections) s.hidden = s !== section;
    if (!panelOpen) {
      lastFocus = document.activeElement as HTMLElement | SVGElement | null;
    }
    panel.toggleAttribute('data-open', true);
    panel.inert = false;
    panelOpen = true;
    root.dataset.panel = 'open';
    const i = nodes.findIndex((node) => node.id === id);
    if (i >= 0) {
      focus(i);
      glideTo(nodes[i]!.x);
    }
    const url = new URL(location.href);
    url.searchParams.set('node', id);
    history.replaceState(null, '', url);
    panel.querySelector<HTMLElement>('[data-board-close]')?.focus();
    poncho.notify('open', performance.now());
  };
  const close = () => {
    if (!panelOpen) return;
    panelOpen = false;
    panel.removeAttribute('data-open');
    panel.inert = true;
    delete root.dataset.panel;
    focus(-1);
    const url = new URL(location.href);
    url.searchParams.delete('node');
    history.replaceState(null, '', url);
    lastFocus?.focus({ preventScroll: true });
  };

  panel.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-board-close]')) close();
    const goto = target.closest<HTMLElement>('[data-goto]');
    if (goto) open(goto.dataset.goto!);
  });

  // Narrow screens: the panel is a sheet, dragged down to close.
  let sheetStart = -1;
  panel.addEventListener('pointerdown', (event) => {
    if (
      narrow.matches &&
      (event.target as HTMLElement).closest('[data-sheet-handle]')
    ) {
      sheetStart = event.clientY;
      panel.setPointerCapture(event.pointerId);
    }
  });
  panel.addEventListener('pointermove', (event) => {
    if (sheetStart >= 0) {
      panel.style.translate = `0 ${Math.max(0, event.clientY - sheetStart)}px`;
    }
  });
  panel.addEventListener('pointerup', (event) => {
    if (sheetStart < 0) return;
    const pulled = event.clientY - sheetStart;
    sheetStart = -1;
    panel.style.translate = '';
    if (pulled > 90) close();
  });

  // ── Keyboard ───────────────────────────────────────────────────
  nodeEls.forEach((g, i) => {
    g.addEventListener('focus', () => {
      focus(i);
      glideTo(nodes[i]!.x);
    });
    g.addEventListener('blur', () => {
      if (!panelOpen) focus(-1);
    });
    g.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(nodes[i]!.id);
      }
    });
  });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
    if (panel.contains(document.activeElement)) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      tcx = clampX(tcx + step * 180, tz);
    }
  });

  // d3 caches each node's target when a force is set up; ask again.
  const rehome = () => {
    layout.sim.force<ForceX<Node>>('time')?.x((node) => node.homeX);
    layout.sim.force<ForceY<Node>>('lane')?.y((node) => node.homeY);
    layout.sim.alpha(0.3);
  };

  // Reset: every node goes back to where the layout first put it.
  const homes = nodes.map((node) => [node.homeX, node.homeY] as const);
  q<HTMLButtonElement>('[data-board-reset]').addEventListener('click', () => {
    nodes.forEach((node, i) => {
      [node.homeX, node.homeY] = homes[i]!;
    });
    rehome();
    layout.sim.alpha(0.6);
    poncho.notify('interact', performance.now());
  });

  // ── Pointer ────────────────────────────────────────────────────
  const pointers = new Map<number, { x: number; y: number }>();
  let held: Node | null = null;
  let heldIndex = -1;
  let down = { x: 0, y: 0, at: 0 };
  let moved = 0;
  // Recent pointer positions, in world units, to throw a node with.
  let trail: { x: number; y: number; at: number }[] = [];
  let pinch = 0;

  const local = (event: PointerEvent | WheelEvent) => {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const nodeAt = (target: EventTarget | null) => {
    const g = (target as Element | null)?.closest?.('.board-node');
    return g ? nodeEls.indexOf(g as SVGGElement) : -1;
  };

  stage.addEventListener('pointerdown', (event) => {
    const p = local(event);
    pointers.set(event.pointerId, p);
    try {
      stage.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic or already-released pointer */
    }
    poncho.notify('interact', performance.now());
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [typeof p, typeof p];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
      return;
    }
    down = { ...p, at: performance.now() };
    moved = 0;
    heldIndex = nodeAt(event.target);
    if (heldIndex >= 0 && !still) {
      held = nodes[heldIndex]!;
      held.fx = held.x;
      held.fy = held.y;
      root.dataset.holding = '';
    }
  });

  stage.addEventListener('pointermove', (event) => {
    const p = local(event);
    const last = pointers.get(event.pointerId);
    if (!last) {
      if (!panelOpen) focus(nodeAt(event.target));
      return;
    }
    pointers.set(event.pointerId, p);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [typeof p, typeof p];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinch);
      pinch = d;
      return;
    }
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    moved += Math.abs(dx) + Math.abs(dy);
    if (held) {
      const [wx, wy] = toWorld(p.x, p.y);
      held.fx = wx;
      held.fy = wy;
      trail.push({ x: wx, y: wy, at: performance.now() });
      if (trail.length > 5) trail.shift();
      layout.sim.alpha(0.3);
    } else {
      cx = tcx = clampX(cx - dx / zoom, zoom);
      cy = tcy = Math.min(200, Math.max(-200, cy - dy / zoom));
    }
  });

  const release = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId) || pointers.size > 0) return;
    pinch = 0;
    if (held) {
      // Let go: the node stays where it was dropped — that becomes its new
      // home — and carries on a little with the speed it was thrown at.
      const first = trail[0];
      const lastPoint = trail.at(-1);
      if (first && lastPoint && lastPoint.at > first.at) {
        const seconds = (lastPoint.at - first.at) / 1000;
        held.vx = ((lastPoint.x - first.x) / seconds) * 0.012;
        held.vy = ((lastPoint.y - first.y) / seconds) * 0.012;
      }
      // Home is where the throw would come to rest, not where it left the
      // hand — so the glide ends there instead of being pulled back.
      held.homeX = (held.fx ?? held.x) + (held.vx ?? 0) * 2;
      held.homeY = (held.fy ?? held.y) + (held.vy ?? 0) * 2;
      held.fx = null;
      held.fy = null;
      held = null;
      trail = [];
      rehome();
      delete root.dataset.holding;
      if (moved > 40) poncho.notify('fling', performance.now());
    }
    const wasClick = moved < 6 && performance.now() - down.at < 450;
    const i = heldIndex;
    heldIndex = -1;
    if (!wasClick) return;
    if (i >= 0) open(nodes[i]!.id);
    else close();
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  stage.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const p = local(event);
      if (event.ctrlKey || event.metaKey) {
        zoomAt(p.x, p.y, Math.exp(-event.deltaY * 0.0025));
      } else {
        tcx = clampX(tcx + (event.deltaX + event.deltaY) / zoom, tz);
      }
      poncho.notify('interact', performance.now());
    },
    { passive: false },
  );

  // ── Frame ──────────────────────────────────────────────────────
  const f = (n: number) => n.toFixed(1);
  const curve = (sx: number, sy: number, tx: number, ty: number) => {
    const my = (sy + ty) / 2;
    return `M${f(sx)} ${f(sy)} C${f(sx)} ${f(my)} ${f(tx)} ${f(my)} ${f(tx)} ${f(ty)}`;
  };

  const draw = () => {
    world.setAttribute(
      'transform',
      `translate(${f(viewW() / 2 - cx * zoom)} ${f(stage.clientHeight / 2 - cy * zoom)}) scale(${zoom.toFixed(4)})`,
    );
    nodes.forEach((node, i) => {
      nodeEls[i]!.setAttribute(
        'transform',
        `translate(${f(node.x)} ${f(node.y)})`,
      );
    });
    nodes.forEach((node, i) => {
      const span = spanEls[i];
      if (!span) return;
      const clip = model.clips[node.index]!;
      const x1 = timeX(clip.start);
      const x2 = timeX(clip.end);
      const y = node.y;
      span.setAttribute(
        'd',
        `M${f(x1)} ${f(y - 4)} V${f(y + 4)} M${f(x1)} ${f(y)} H${f(x2)} M${f(x2)} ${f(y - 4)} V${f(y + 4)}`,
      );
      span.classList.toggle(
        'is-active',
        nodeEls[i]!.classList.contains('is-active'),
      );
    });
    links.forEach((link, i) => {
      const s = link.source;
      const t = link.target;
      // End on the rim of the role or project, not at its centre.
      linkEls[i]!.setAttribute(
        'd',
        curve(s.x, s.y, t.x, t.y + (t.y < s.y ? t.r : -t.r)),
      );
    });

    // Poncho sits on the latest role, on top of its label.
    const perch = nodes.find((node) => node.id === 'mews_squad');
    if (perch) {
      // Above the circle and its three lines of text.
      const [px, py] = toScreen(perch.x, perch.y - perch.r - 64);
      const scale = Math.min(1.1, Math.max(0.5, zoom));
      ponchoWrap.style.transform = `translate3d(${f(px)}px, ${f(py)}px, 0) scale(${scale.toFixed(3)})`;
    }
  };

  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const k = 1 - Math.pow(0.002, dt);
    cx += (tcx - cx) * k;
    cy += (tcy - cy) * k;
    zoom += (tz - zoom) * k;
    insetNow += (insetTarget() - insetNow) * (still ? 1 : k);
    if (!still) layout.sim.tick();
    draw();
    poncho.tick(now);
    requestAnimationFrame(frame);
  };
  new ResizeObserver(() => {
    tcx = clampX(tcx, tz);
    draw();
  }).observe(stage);
  draw();
  requestAnimationFrame(frame);
  root.dataset.ready = '';

  const initial = new URL(location.href).searchParams.get('node');
  if (initial) {
    open(initial);
    cx = tcx;
  }
}
