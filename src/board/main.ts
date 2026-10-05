import { END_YEAR, START_YEAR, type BoardModel } from './model';
import { Poncho } from './poncho';
import { level } from './spectrum';
import type { Landscape } from './scene';

/**
 * Board mode: boot, camera, input, overlays and panel. The landscape is
 * WebGL; everything you read — clip names, ridge labels, eras, the ruler,
 * the panel, Poncho — is HTML laid over it. Without WebGL, or with reduced
 * motion, the same data is drawn flat as SVG.
 */

const NARROW = '(max-width: 720px)';
// Mirrors scene.ts, which loads lazily with Three.js.
const YEAR_UNITS = 12;
const HEIGHT = 3.6;
const ROW_GAP = 3.4;
const LANE = { role: 5, project: 8.4 } as const;

const worldX = (year: number) => (year - START_YEAR) * YEAR_UNITS;
const rowZ = (row: number) => -row * ROW_GAP;

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
  const hover = q<HTMLElement>('[data-board-hover]');
  const eras = qa<HTMLElement>('[data-era]');
  const ticks = qa<HTMLElement>('[data-year]');
  const clipButtons = qa<HTMLButtonElement>('[data-clip]');
  const rowLabels = qa<HTMLButtonElement>('[data-row]');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webgl = !!document.createElement('canvas').getContext('webgl2');
  const live = webgl && !reduced;
  root.dataset.mode = live ? 'live' : 'still';

  const narrow = matchMedia(NARROW);
  const poncho = new Poncho(
    ponchoWrap.querySelector<HTMLElement>('.cat-stage')!,
  );

  // Which ridges each clip uses.
  const rowsOfClip = model.clips.map(
    (_, clip) =>
      new Set(
        model.tracks.flatMap((track, row) =>
          track.uses.some((use) => use.clip === clip) ? [row] : [],
        ),
      ),
  );

  // Set up by the live landscape; the panel uses it to glide there.
  let focusClip: (clip: number) => void = () => {};

  // ── Panel ──────────────────────────────────────────────────────
  let panelOpen = false;
  let lastFocus: HTMLElement | null = null;

  const open = (id: string) => {
    const section = sections.find((s) => s.dataset.panel === id);
    if (!section) return;
    for (const s of sections) s.hidden = s !== section;
    if (!panelOpen) lastFocus = document.activeElement as HTMLElement | null;
    panel.hidden = false;
    panelOpen = true;
    root.dataset.panel = 'open';
    const url = new URL(location.href);
    url.searchParams.set('node', id);
    history.replaceState(null, '', url);
    panel.querySelector<HTMLElement>('[data-board-close]')?.focus();
    poncho.notify('open', performance.now());
  };

  const close = () => {
    if (!panelOpen) return;
    panelOpen = false;
    panel.hidden = true;
    delete root.dataset.panel;
    const url = new URL(location.href);
    url.searchParams.delete('node');
    history.replaceState(null, '', url);
    lastFocus?.focus({ preventScroll: true });
  };

  panel.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-board-close]')) close();
    const goto = target.closest<HTMLElement>('[data-goto]');
    if (goto) {
      const clip = model.clips.findIndex((c) => c.id === goto.dataset.goto);
      if (clip >= 0) focusClip(clip);
      open(goto.dataset.goto!);
    }
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

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  clipButtons.forEach((button) =>
    button.addEventListener('click', () => open(button.dataset.clip!)),
  );
  rowLabels.forEach((label) =>
    label.addEventListener('click', () =>
      open(`tech:${model.tracks[Number(label.dataset.row)]!.id}`),
    ),
  );

  if (!live) {
    drawStill();
    return;
  }

  // ── Landscape ──────────────────────────────────────────────────
  const style = getComputedStyle(root);
  const css = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  const { Landscape } = await import('./scene');
  const land: Landscape = new Landscape(canvas, model, {
    background: css('--board-bg', '#f6f5f2'),
    ink: css('--board-ink', '#16181a'),
    accent: css('--board-role', '#2f5d8a'),
    project: css('--board-project', '#b8654a'),
  });

  // The camera travels along time: `t` is the year at the centre of view,
  // `dist` how far back it stands. Each eases towards its target.
  const MIN_T = START_YEAR + 3.6;
  const MAX_T = END_YEAR - 3.4;
  // Start in the present; the story reads backwards from here.
  let t = MAX_T;
  let tt = MAX_T;
  let dist = 1;
  let td = 1;
  let px = 0;
  let py = 0;
  let tpx = 0;
  let tpy = 0;

  const resize = () =>
    land.setSize(
      stage.clientWidth,
      stage.clientHeight,
      Math.min(devicePixelRatio, 2),
    );
  new ResizeObserver(resize).observe(stage);
  resize();

  const clampT = (value: number) => Math.min(MAX_T, Math.max(MIN_T, value));
  const visibleYears = () => 8 * dist;

  const placeCamera = () => {
    // With the panel open, look a little to the right of the focus.
    const shift = panelOpen && !narrow.matches ? 1.4 * dist : 0;
    const x = worldX(t + shift);
    land.camera.position.set(x + px * 3, 78 * dist + py * 3, 86 * dist);
    land.camera.lookAt(x + px * 1.5, -7, -40);
  };

  focusClip = (clip: number) => {
    const c = model.clips[clip]!;
    tt = clampT((c.start + c.end) / 2);
  };

  // ── Highlight ──────────────────────────────────────────────────
  let focusRows: Set<number> | null = null;
  let focusTime = 0;

  const highlight = (rows: Set<number> | null, time: number, clip = -1) => {
    focusRows = rows;
    focusTime = time;
    land.highlight(rows, clip);
    clipButtons.forEach((button, i) =>
      button.classList.toggle('is-dim', clip >= 0 && i !== clip),
    );
  };

  // ── Input ──────────────────────────────────────────────────────
  const pointers = new Map<number, { x: number; y: number }>();
  let down = { x: 0, y: 0, at: 0 };
  let moved = 0;
  let pinch = 0;

  const local = (event: PointerEvent | WheelEvent) => {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const ndc = (p: { x: number; y: number }) =>
    [
      (p.x / stage.clientWidth) * 2 - 1,
      -(p.y / stage.clientHeight) * 2 + 1,
    ] as const;

  const hoverAt = (p: { x: number; y: number }) => {
    const hit = land.pick(...ndc(p));
    if (!hit) {
      hover.hidden = true;
      stage.style.cursor = '';
      if (!panelOpen) highlight(null, 0);
      return;
    }
    const year = hit.x / YEAR_UNITS + START_YEAR;
    stage.style.cursor = 'pointer';
    if ('clip' in hit) {
      hover.hidden = true;
      highlight(rowsOfClip[hit.clip]!, year, hit.clip);
      return;
    }
    highlight(new Set([hit.row]), year);
    hover.textContent = model.tracks[hit.row]!.label;
    hover.hidden = false;
    hover.style.transform = `translate3d(${p.x + 14}px, ${p.y - 28}px, 0)`;
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
    down = { ...p, at: performance.now() };
    moved = 0;
  });

  stage.addEventListener('pointermove', (event) => {
    const p = local(event);
    tpx = (p.x / stage.clientWidth) * 2 - 1;
    tpy = (p.y / stage.clientHeight) * 2 - 1;
    const last = pointers.get(event.pointerId);
    if (!last) {
      hoverAt(p);
      return;
    }
    pointers.set(event.pointerId, p);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [typeof p, typeof p];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0) td = Math.min(1.6, Math.max(0.6, td * (pinch / d)));
      pinch = d;
      return;
    }
    const dx = p.x - last.x;
    moved += Math.abs(dx) + Math.abs(p.y - last.y);
    tt = clampT(tt - (dx / stage.clientWidth) * visibleYears());
    t = tt;
  });

  const release = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId) || pointers.size > 0) return;
    pinch = 0;
    if (moved > 6 || performance.now() - down.at > 450) return;
    const hit = land.pick(...ndc(local(event)));
    if (!hit) close();
    else if ('clip' in hit) open(model.clips[hit.clip]!.id);
    else open(`tech:${model.tracks[hit.row]!.id}`);
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('pointerleave', () => {
    tpx = 0;
    tpy = 0;
    hover.hidden = true;
    if (!pointers.size && !panelOpen) highlight(null, 0);
  });

  stage.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        td = Math.min(1.6, Math.max(0.6, td * Math.exp(event.deltaY * 0.004)));
      } else {
        const delta = event.deltaX + event.deltaY;
        tt = clampT(tt + delta * 0.0045 * dist);
        if (Math.abs(delta) > 160) poncho.notify('fling', performance.now());
      }
      poncho.notify('interact', performance.now());
    },
    { passive: false },
  );

  // Keyboard: clips are the way in; arrows walk them, or travel in time.
  clipButtons.forEach((button, i) => {
    button.addEventListener('focus', () => {
      const clip = model.clips[i]!;
      focusClip(i);
      highlight(rowsOfClip[i]!, (clip.start + clip.end) / 2, i);
    });
  });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    if (panel.contains(document.activeElement)) return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const current = clipButtons.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    if (current >= 0) {
      clipButtons[current + step]?.focus({ preventScroll: true });
    } else {
      tt = clampT(tt + step * 0.75);
    }
  });

  for (const tick of ticks) {
    tick.addEventListener('click', () => {
      tt = clampT(Number(tick.dataset.year) + 0.5);
    });
  }

  // ── Frame ──────────────────────────────────────────────────────
  const place = (el: HTMLElement, x: number, y: number, extra = '') => {
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)${extra}`;
  };

  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const k = 1 - Math.pow(0.002, dt);
    t += (tt - t) * k;
    dist += (td - dist) * k;
    px += (tpx - px) * k * 0.5;
    py += (tpy - py) * k * 0.5;
    placeCamera();
    land.render();

    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const project = (x: number, y: number, z: number) =>
      land.project(x, y, z, w, h);

    model.clips.forEach((clip, i) => {
      const [sx, sy, front] = project(
        worldX(clip.start) + 0.25,
        0,
        LANE[clip.kind] + (clip.kind === 'role' ? 1.2 : 0.85),
      );
      const [ex] = project(worldX(clip.end) - 0.25, 0, LANE[clip.kind]);
      const button = clipButtons[i]!;
      button.hidden = !front || sx > w + 40 || ex - sx < 14;
      // A clip's name never runs past the clip.
      button.style.maxWidth = `${Math.max(0, ex - sx - 4).toFixed(0)}px`;
      place(button, sx, sy);
    });

    rowLabels.forEach((label, row) => {
      const on = focusRows?.has(row) ?? false;
      label.classList.toggle('is-on', on);
      if (!on) return;
      const track = model.tracks[row]!;
      const year = Math.min(END_YEAR, Math.max(START_YEAR, focusTime));
      const [sx, sy] = project(
        worldX(year),
        level(model, track, year) * HEIGHT + 0.5,
        rowZ(row),
      );
      place(label, sx, sy);
    });

    for (const era of eras) {
      // Eras are written along the far edge, behind the last ridge.
      const [sx, sy, front] = project(
        worldX(Number(era.dataset.start)) + 0.4,
        0,
        rowZ(model.tracks.length) - 3,
      );
      era.hidden = !front;
      place(era, sx, sy);
    }

    for (const tick of ticks) {
      const [sx] = project(
        worldX(Number(tick.dataset.year)),
        0,
        LANE.project + 5,
      );
      place(tick, sx, 0);
    }

    // Poncho sits on the floor at the edge of the present.
    const [cx, cy] = project(worldX(END_YEAR - 0.3), 0, 2.2);
    const scale = Math.min(1.3, Math.max(0.45, 1.05 / dist));
    place(ponchoWrap, cx, cy, ` scale(${scale.toFixed(3)})`);
    poncho.tick(now);

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  root.dataset.ready = '';

  const initial = new URL(location.href).searchParams.get('node');
  if (initial) {
    const clip = model.clips.findIndex((c) => c.id === initial);
    if (clip >= 0) {
      focusClip(clip);
      t = tt;
    }
    open(initial);
  }

  // ── Still ──────────────────────────────────────────────────────
  function drawStill(): void {
    const PX_PER_YEAR = 90;
    const ROW = 15;
    const AMP = 11;
    const years = END_YEAR - START_YEAR;
    const width = Math.round(years * PX_PER_YEAR);
    const rows = model.tracks.length;
    const top = 120;
    const height = top + rows * ROW + 150;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.classList.add('board-still-svg');
    // Back rows first, so the front ones cover them.
    for (let row = rows - 1; row >= 0; row--) {
      const track = model.tracks[row]!;
      const base = top + (rows - 1 - row) * ROW + 40;
      let d = `M0 ${base}`;
      for (let x = 0; x <= width; x += 3) {
        const y =
          base - level(model, track, START_YEAR + x / PX_PER_YEAR) * AMP;
        d += ` L${x} ${y.toFixed(1)}`;
      }
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', `${d} L${width} ${base} Z`);
      path.classList.add('board-still-ridge');
      svg.append(path);
    }
    still.append(svg);
    model.clips.forEach((clip, i) => {
      const button = clipButtons[i]!;
      const x = (clip.start - START_YEAR) * PX_PER_YEAR;
      const y = height - (clip.kind === 'role' ? 100 : 56);
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      still.append(button);
    });
    const placeTicks = () => {
      for (const tick of ticks) {
        const x =
          (Number(tick.dataset.year) - START_YEAR) * PX_PER_YEAR -
          still.scrollLeft;
        tick.style.transform = `translate3d(${x}px, 0, 0)`;
      }
    };
    still.addEventListener('scroll', placeTicks);
    placeTicks();
    root.dataset.ready = '';
    const initial = new URL(location.href).searchParams.get('node');
    if (initial) open(initial);
  }
}
