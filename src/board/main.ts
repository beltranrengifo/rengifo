import { Camera } from './camera';
import { createLayout, settle } from './layout';
import { timeX, type BoardModel } from './model';
import { Poncho } from './poncho';
import {
  centroid,
  contains,
  createBody,
  DEFAULT_FIRMNESS,
  nearestParticle,
  nudge,
  shed,
  step,
  stepDrips,
  stretch,
  type Body,
  type Drip,
} from './softbody';
import type { GooRenderer } from './render';

/**
 * Board mode: boot, frame loop, input and panel. Two ways to draw the same
 * board — jelly (WebGL, physics) or still (DOM circles, for reduced motion
 * or no WebGL) — share the camera, labels, panel, ruler and Poncho.
 */

const PANEL_WIDTH = 420;
const NARROW = '(max-width: 720px)';
const CALM_FIRMNESS = 0.3;
const GRAB_FIRMNESS = 0.015;
const DRIP_STRETCH = 2.2;
const NOW = 2026.4;

const root = document.querySelector<HTMLElement>('[data-board]');
if (root) void boot(root);

async function boot(root: HTMLElement): Promise<void> {
  const q = <T extends Element>(selector: string) =>
    root.querySelector<T>(selector)!;
  const qa = <T extends Element>(selector: string) =>
    Array.from(root.querySelectorAll<T>(selector));

  const model = JSON.parse(
    q<HTMLScriptElement>('[data-board-model]').textContent ?? '{}',
  ) as BoardModel;
  const stage = q<HTMLElement>('[data-board-stage]');
  const canvas = q<HTMLCanvasElement>('[data-board-canvas]');
  const still = q<HTMLElement>('[data-board-still]');
  const panel = q<HTMLElement>('[data-board-panel]');
  const sections = qa<HTMLElement>('[data-panel]');
  const ponchoWrap = q<HTMLElement>('[data-poncho]');
  const peek = q<HTMLElement>('[data-poncho-peek]');
  const eras = qa<HTMLElement>('[data-era]');
  const ticks = qa<HTMLElement>('[data-year]');
  const labels = new Map(
    qa<HTMLButtonElement>('[data-node]').map((el) => [el.dataset.node!, el]),
  );

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webgl = !!document.createElement('canvas').getContext('webgl2');
  const jelly = webgl && !reduced;
  root.dataset.mode = jelly ? 'jelly' : 'still';

  // ── Layout ─────────────────────────────────────────────────────
  const layout = createLayout(model);
  settle(layout, jelly ? 160 : 400);
  const nodes = layout.nodes;
  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const linkPairs = model.links.map(
    (link) =>
      [index.get(link.source)!, index.get(link.target)!] as [number, number],
  );

  // ── Camera ─────────────────────────────────────────────────────
  const camera = new Camera();
  const narrow = matchMedia(NARROW);
  const fitZoom = () => Math.min(1, Math.max(0.42, stage.clientHeight / 980));
  camera.resize(stage.clientWidth, stage.clientHeight);
  camera.zoom = fitZoom();
  camera.minX = timeX(2003.6);
  camera.maxX = timeX(NOW + 0.6);
  // Start in the present, so the story is read backwards through time.
  camera.x = timeX(NOW) - (camera.w * 0.32) / camera.zoom;
  camera.y = 0;
  camera.glideTo(camera.x, camera.y, camera.zoom);

  // ── Drawing ────────────────────────────────────────────────────
  const style = getComputedStyle(root);
  const colour = (group: string) =>
    style.getPropertyValue(`--board-${group}`).trim() || '#2f5d8a';

  let bodies: Body[] = [];
  let goo: GooRenderer | null = null;
  let drips: Drip[] = [];
  let dripColours: number[] = [];
  const dots: HTMLElement[] = [];

  if (jelly) {
    bodies = nodes.map((node) => createBody(node.r, node.x, node.y));
    const { GooRenderer } = await import('./render');
    goo = new GooRenderer(canvas, {
      bodies,
      colors: nodes.map((node) => colour(node.group)),
      links: linkPairs,
      background: style.getPropertyValue('--board-bg').trim() || '#f6f5f2',
    });
  } else {
    for (const node of nodes) {
      const dot = document.createElement('div');
      dot.className = 'board-dot';
      dot.style.setProperty('--dot', colour(node.group));
      dot.style.width = dot.style.height = `${node.r * 2}px`;
      still.append(dot);
      dots.push(dot);
    }
  }

  let panelOpen = false;
  let selected = -1;

  const resize = () => {
    camera.resize(stage.clientWidth, stage.clientHeight);
    camera.inset = panelOpen && !narrow.matches ? PANEL_WIDTH : 0;
    goo?.setSize(
      stage.clientWidth,
      stage.clientHeight,
      Math.min(devicePixelRatio, 2),
    );
  };
  new ResizeObserver(resize).observe(stage);

  /** Where a node is drawn right now: its jelly, or its layout position. */
  const position = (i: number): [number, number] =>
    jelly ? centroid(bodies[i]!) : [nodes[i]!.x, nodes[i]!.y];

  const hit = (wx: number, wy: number): number => {
    // Smallest first, so a technology on top of a role wins.
    let best = -1;
    let bestR = Infinity;
    nodes.forEach((node, i) => {
      const inside = jelly
        ? contains(bodies[i]!, wx, wy)
        : Math.hypot(node.x - wx, node.y - wy) < node.r;
      if (inside && node.r < bestR) {
        best = i;
        bestR = node.r;
      }
    });
    return best;
  };

  // ── Highlight ──────────────────────────────────────────────────
  let highlighted = -1;
  const highlight = (i: number) => {
    if (i === highlighted) return;
    highlighted = i;
    const related = new Set<number>();
    const mask =
      i < 0
        ? null
        : linkPairs.map(([a, b]) => {
            const on = a === i || b === i;
            if (on) related.add(a).add(b);
            return on ? 1 : 0.05;
          });
    goo?.setHighlight(mask);
    nodes.forEach((node, k) => {
      const dim = i >= 0 && k !== i && !related.has(k);
      labels.get(node.id)?.classList.toggle('is-dim', dim);
      dots[k]?.classList.toggle('is-dim', dim);
    });
  };

  // ── Poncho ─────────────────────────────────────────────────────
  const poncho = new Poncho(
    ponchoWrap.querySelector<HTMLElement>('.cat-stage')!,
  );
  const perch = index.get('mews_squad') ?? nodes.length - 1;
  let peeked = false;

  // ── Panel ──────────────────────────────────────────────────────
  const open = (id: string, focus = true) => {
    const i = index.get(id);
    if (i === undefined) return;
    if (selected >= 0 && bodies[selected]) {
      bodies[selected]!.firmness = DEFAULT_FIRMNESS;
    }
    selected = i;
    if (bodies[i]) bodies[i]!.firmness = CALM_FIRMNESS;
    for (const section of sections)
      section.hidden = section.dataset.panel !== id;
    panel.hidden = false;
    panelOpen = true;
    root.dataset.panel = 'open';
    camera.inset = narrow.matches ? 0 : PANEL_WIDTH;
    const [x, y] = position(i);
    camera.glideTo(x, narrow.matches ? y + (camera.h * 0.22) / camera.zoom : y);
    highlight(i);
    const url = new URL(location.href);
    url.searchParams.set('node', id);
    history.replaceState(null, '', url);
    if (focus) panel.querySelector<HTMLElement>('[data-board-close]')?.focus();
    poncho.notify('open', performance.now());
  };

  const close = () => {
    if (!panelOpen) return;
    panelOpen = false;
    panel.hidden = true;
    delete root.dataset.panel;
    camera.inset = 0;
    if (selected >= 0 && bodies[selected]) {
      bodies[selected]!.firmness = DEFAULT_FIRMNESS;
    }
    const node = nodes[selected];
    selected = -1;
    highlight(-1);
    const url = new URL(location.href);
    url.searchParams.delete('node');
    history.replaceState(null, '', url);
    if (node) labels.get(node.id)?.focus({ preventScroll: true });
  };

  panel.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-board-close]')) close();
    const goto = target.closest<HTMLElement>('[data-goto]');
    if (goto) open(goto.dataset.goto!);
  });

  // On narrow screens the panel is a sheet: drag it down to close.
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
    if (sheetStart < 0) return;
    panel.style.translate = `0 ${Math.max(0, event.clientY - sheetStart)}px`;
  });
  panel.addEventListener('pointerup', (event) => {
    if (sheetStart < 0) return;
    const pulled = event.clientY - sheetStart;
    sheetStart = -1;
    panel.style.translate = '';
    if (pulled > 90) close();
  });

  // Labels are the keyboard's way in: Tab reaches them, arrows walk time.
  const order = [...labels.values()];
  for (const [id, button] of labels) {
    button.addEventListener('click', () => open(id));
    button.addEventListener('focus', () => {
      const i = index.get(id)!;
      const [x, y] = position(i);
      if (!panelOpen) camera.glideTo(x, y);
      highlight(i);
    });
  }

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    const current = order.indexOf(document.activeElement as HTMLButtonElement);
    if (
      current >= 0 &&
      (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
    ) {
      event.preventDefault();
      const next = order[current + (event.key === 'ArrowRight' ? 1 : -1)];
      next?.focus({ preventScroll: true });
    }
    if (event.key === '+' || event.key === '=')
      camera.zoomAt(camera.w / 2, camera.h / 2, 1.2);
    if (event.key === '-') camera.zoomAt(camera.w / 2, camera.h / 2, 1 / 1.2);
  });

  // ── Ruler ──────────────────────────────────────────────────────
  for (const tick of ticks) {
    tick.addEventListener('click', () => {
      camera.glideTo(timeX(Number(tick.dataset.year) + 0.5), 0);
      poncho.notify('interact', performance.now());
    });
  }

  // ── Pointer: pan, grab, pinch, click ───────────────────────────
  const pointers = new Map<number, { x: number; y: number }>();
  let grabbed = -1;
  let downAt = { x: 0, y: 0, t: 0 };
  let moved = 0;
  let pinch = 0;
  let trail: { x: number; y: number; t: number }[] = [];

  const local = (event: PointerEvent | WheelEvent) => {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  stage.addEventListener('pointerdown', (event) => {
    const p = local(event);
    pointers.set(event.pointerId, p);
    stage.setPointerCapture(event.pointerId);
    poncho.notify('interact', performance.now());
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [typeof p, typeof p];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
      return;
    }
    downAt = { ...p, t: performance.now() };
    moved = 0;
    trail = [downAt];
    const [wx, wy] = camera.toWorld(p.x, p.y);
    const i = hit(wx, wy);
    if (jelly && i >= 0) {
      grabbed = i;
      const body = bodies[i]!;
      body.grabbed = nearestParticle(body, wx, wy);
      body.grabX = wx;
      body.grabY = wy;
      body.firmness = GRAB_FIRMNESS;
      nodes[i]!.fx = nodes[i]!.x;
      nodes[i]!.fy = nodes[i]!.y;
      root.dataset.grabbing = '';
    }
  });

  stage.addEventListener('pointermove', (event) => {
    const p = local(event);
    const last = pointers.get(event.pointerId);
    if (!last) {
      // Hovering: light up what is under the pointer.
      if (!panelOpen) {
        const [wx, wy] = camera.toWorld(p.x, p.y);
        const i = hit(wx, wy);
        highlight(i);
        stage.style.cursor = i >= 0 ? (jelly ? 'grab' : 'pointer') : '';
      }
      return;
    }
    pointers.set(event.pointerId, p);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [typeof p, typeof p];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0)
        camera.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, distance / pinch);
      pinch = distance;
      return;
    }
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    moved += Math.abs(dx) + Math.abs(dy);
    trail.push({ ...p, t: performance.now() });
    if (trail.length > 6) trail.shift();
    if (grabbed >= 0) {
      const [wx, wy] = camera.toWorld(p.x, p.y);
      bodies[grabbed]!.grabX = wx;
      bodies[grabbed]!.grabY = wy;
    } else {
      camera.panBy(dx, dy);
    }
  });

  const release = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) return;
    if (pointers.size > 0) return;
    pinch = 0;
    const now = performance.now();
    const p = local(event);
    if (grabbed >= 0) {
      const body = bodies[grabbed]!;
      body.grabbed = -1;
      body.firmness = grabbed === selected ? CALM_FIRMNESS : DEFAULT_FIRMNESS;
      nodes[grabbed]!.fx = null;
      nodes[grabbed]!.fy = null;
      layout.sim.alpha(0.25);
      const first = trail[0]!;
      const dt = Math.max(16, now - first.t) / 1000;
      const vx = (p.x - first.x) / dt / camera.zoom;
      const vy = (p.y - first.y) / dt / camera.zoom;
      nudge(body, vx * 0.004, vy * 0.004);
      if (Math.hypot(vx, vy) > 1600) poncho.notify('fling', now);
      delete root.dataset.grabbing;
    }
    const wasClick = moved < 6 && now - downAt.t < 450;
    const i = (() => {
      const [wx, wy] = camera.toWorld(p.x, p.y);
      return hit(wx, wy);
    })();
    grabbed = -1;
    if (wasClick) {
      if (i >= 0) open(nodes[i]!.id);
      else close();
    }
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('pointerleave', () => {
    if (!pointers.size && !panelOpen) highlight(-1);
  });

  stage.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const p = local(event);
      if (event.ctrlKey || event.metaKey) {
        camera.zoomAt(p.x, p.y, Math.exp(-event.deltaY * 0.0022));
      } else {
        // Both wheel axes travel through time.
        camera.panBy(-(event.deltaX + event.deltaY), 0);
      }
      poncho.notify('interact', performance.now());
    },
    { passive: false },
  );

  // Label widths never change, so measure each once.
  const widths = new Map<string, number>();
  const labelWidth = (id: string) => {
    let width = widths.get(id);
    if (width === undefined) {
      width = labels.get(id)?.offsetWidth ?? 0;
      widths.set(id, width);
    }
    return width;
  };

  // ── Frame ──────────────────────────────────────────────────────
  const place = (el: HTMLElement, x: number, y: number, extra = '') => {
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)${extra}`;
  };

  let last = performance.now();
  let lastDrip = 0;

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    camera.update(dt);

    if (jelly) {
      if (grabbed >= 0) {
        const [cx, cy] = centroid(bodies[grabbed]!);
        nodes[grabbed]!.fx = cx;
        nodes[grabbed]!.fy = cy;
      }
      layout.sim.tick();

      const [left, top] = camera.toWorld(-200, -200);
      const [right, bottom] = camera.toWorld(camera.w + 200, camera.h + 200);
      bodies.forEach((body, i) => {
        const node = nodes[i]!;
        body.anchorX = node.x;
        body.anchorY = node.y;
        const visible =
          node.x + node.r > left &&
          node.x - node.r < right &&
          node.y + node.r > top &&
          node.y - node.r < bottom;
        if (visible || body.grabbed >= 0) step(body);
      });

      if (
        grabbed >= 0 &&
        stretch(bodies[grabbed]!) > DRIP_STRETCH &&
        now - lastDrip > 240
      ) {
        lastDrip = now;
        drips.push(shed(bodies[grabbed]!));
        dripColours.push(grabbed);
        poncho.notify('drip', now);
      }
      const alive = stepDrips(drips, dt, bodies);
      dripColours = dripColours.filter((_, k) => alive.includes(drips[k]!));
      drips = alive;
      goo!.render(camera, drips, dripColours);
    } else {
      nodes.forEach((node, i) => {
        const [sx, sy] = camera.toScreen(node.x, node.y);
        place(
          dots[i]!,
          sx - node.r,
          sy - node.r,
          ` scale(${camera.zoom.toFixed(3)})`,
        );
      });
    }

    root.dataset.zoom = camera.zoom < 0.5 ? 'far' : 'near';

    nodes.forEach((node, i) => {
      const label = labels.get(node.id);
      if (!label) return;
      const [x, y] = position(i);
      const [sx, sy] = camera.toScreen(x, y);
      // A label sits on its blob while it fits, and below it once it doesn't.
      const fits = labelWidth(node.id) < node.r * camera.zoom * 1.8;
      const outside = node.kind === 'tech' || !fits;
      label.classList.toggle('is-outside', outside);
      place(label, sx, sy + (outside ? node.r * camera.zoom + 10 : 0));
    });

    for (const era of eras) {
      const [sx] = camera.toScreen(timeX(Number(era.dataset.start)), 0);
      const [ex] = camera.toScreen(timeX(Number(era.dataset.end)), 0);
      era.style.width = `${Math.max(0, ex - sx)}px`;
      place(era, sx, 0);
    }
    for (const tick of ticks) {
      const [sx] = camera.toScreen(timeX(Number(tick.dataset.year)), 0);
      place(tick, sx, 0);
    }

    // Poncho sits on top of the latest role.
    const perchNode = nodes[perch]!;
    const [px, py] = position(perch);
    const [sx, sy] = camera.toScreen(px, py - perchNode.r * 0.92);
    const scale = Math.min(1.1, Math.max(0.45, camera.zoom));
    place(ponchoWrap, sx, sy, ` scale(${scale.toFixed(3)})`);
    poncho.tick(now);

    // …and the first time the view reaches 2004, an old friend peeks out.
    const [viewLeft] = camera.toWorld(0, 0);
    if (!peeked && viewLeft < timeX(2006)) {
      peeked = true;
      peek.dataset.peek = '';
      setTimeout(() => delete peek.dataset.peek, 4200);
    }
    const [kx, ky] = camera.toScreen(timeX(2004.35), 0);
    place(peek, kx, ky + camera.h * 0.28);

    requestAnimationFrame(frame);
  };

  resize();
  requestAnimationFrame(frame);
  root.dataset.ready = '';

  const initial = new URL(location.href).searchParams.get('node');
  if (initial && index.has(initial)) open(initial, false);
}
