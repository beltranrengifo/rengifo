/**
 * Poncho on the board: a small SVG cat that walks the floor of the chart and
 * keeps up with the camera, the way a companion would in a game. Drawn in
 * the colours of the CSS cat in the classic footer, but built from parts so
 * each one can move: four legs on a gait, a tail that sways, a head that
 * turns to look, eyes that blink.
 *
 * States: walking or trotting to catch up, sitting when the view rests,
 * asleep after a long quiet spell, and a hop with a "miau" when clicked or
 * when Poncho decides something deserves it.
 */

const NS = 'http://www.w3.org/2000/svg';

const FUR = '#d2b389';
const FUR_DARK = '#b99a70';
const BELLY = '#ecdcc0';
const PAW = '#efe9df';
const NOSE = '#c18d7f';
const EYE = '#f2a300';

const WALK_SPEED = 260; // world px per second
const TROT_SPEED = 620;
const SLEEP_AFTER = 28_000;

type State = 'walk' | 'sit' | 'sleep';

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

interface Leg {
  g: SVGGElement;
  hip: number;
  phase: number;
  back: boolean;
}

export class Companion {
  readonly root: SVGGElement;
  /** World position of the paws, and which way he faces. */
  x: number;
  readonly floor: number;
  private facing = 1;
  private state: State = 'sit';
  private lastActivity = 0;
  private gait = 0;
  private hopUntil = 0;
  private blinkAt = 0;
  private look: { x: number; y: number } | null = null;

  private readonly flip: SVGGElement;
  private readonly body: SVGGElement;
  private readonly head: SVGGElement;
  private readonly eyelids: SVGEllipseElement[] = [];
  private readonly pupils: SVGEllipseElement[] = [];
  private readonly tail: SVGPathElement;
  private readonly legs: Leg[] = [];
  private readonly haunch: SVGEllipseElement;
  private readonly bubble: SVGGElement;
  private readonly zzz: SVGTextElement;

  constructor(parent: SVGGElement, x: number, floor: number, label: string) {
    this.x = x;
    this.floor = floor;
    this.root = el(
      'g',
      { class: 'poncho', role: 'img', 'aria-label': label },
      parent,
    );
    const shadow = el(
      'ellipse',
      { cx: 0, cy: 0, rx: 30, ry: 4, class: 'poncho-shadow' },
      this.root,
    );
    shadow.setAttribute('fill', 'rgba(22,24,26,0.12)');
    this.flip = el('g', {}, this.root);

    // Far legs first, so the body covers their tops.
    const leg = (hip: number, far: boolean, phase: number) => {
      const g = el('g', { transform: `translate(${hip} -24)` }, this.flip);
      el(
        'rect',
        {
          x: -3.5,
          y: 0,
          width: 7,
          height: 22,
          rx: 3.5,
          fill: far ? FUR_DARK : FUR,
        },
        g,
      );
      el('ellipse', { cx: 0.5, cy: 22, rx: 5, ry: 3, fill: PAW }, g);
      this.legs.push({ g, hip, phase, back: hip < 0 });
    };
    leg(-20, true, Math.PI);
    leg(16, true, 0);

    this.tail = el(
      'path',
      {
        fill: 'none',
        stroke: FUR,
        'stroke-width': 7,
        'stroke-linecap': 'round',
      },
      this.flip,
    );

    this.body = el('g', {}, this.flip);
    el('ellipse', { cx: 0, cy: -32, rx: 32, ry: 16, fill: FUR }, this.body);
    el('ellipse', { cx: 3, cy: -25, rx: 20, ry: 7, fill: BELLY }, this.body);
    this.haunch = el(
      'ellipse',
      { cx: -18, cy: -26, rx: 14, ry: 13, fill: FUR, opacity: 0 },
      this.body,
    );

    leg(-14, false, 0);
    leg(22, false, Math.PI);

    this.head = el('g', {}, this.flip);
    const ear = (points: string) => {
      el('polygon', { points, fill: FUR }, this.head);
    };
    ear('-11,-8 -8,-25 1,-12');
    ear('3,-12 11,-25 13,-6');
    el(
      'polygon',
      { points: '-8,-11 -6.5,-20 -2,-12', fill: NOSE, opacity: 0.6 },
      this.head,
    );
    el(
      'polygon',
      { points: '5,-12 10,-20 11,-9', fill: NOSE, opacity: 0.6 },
      this.head,
    );
    el('circle', { cx: 0, cy: 0, r: 15, fill: FUR }, this.head);
    el('ellipse', { cx: 6, cy: 6, rx: 8, ry: 6, fill: BELLY }, this.head);
    for (const ex of [-4, 7]) {
      el('ellipse', { cx: ex, cy: -2, rx: 3, ry: 3.6, fill: EYE }, this.head);
      this.pupils.push(
        el(
          'ellipse',
          { cx: ex, cy: -2, rx: 1.1, ry: 3, fill: '#16181a' },
          this.head,
        ),
      );
      this.eyelids.push(
        el('ellipse', { cx: ex, cy: -2, rx: 3.4, ry: 0, fill: FUR }, this.head),
      );
    }
    el('polygon', { points: '11,3 15,3 13,6', fill: NOSE }, this.head);
    for (const [y1, y2] of [
      [4, 2],
      [6, 7],
    ] as const) {
      el(
        'line',
        {
          x1: 15,
          y1,
          x2: 26,
          y2,
          stroke: '#16181a',
          'stroke-opacity': 0.35,
          'stroke-width': 0.6,
        },
        this.head,
      );
    }

    this.bubble = el('g', { opacity: 0 }, this.root);
    el(
      'rect',
      {
        x: -6,
        y: -104,
        width: 50,
        height: 22,
        rx: 11,
        fill: '#fbfaf8',
        stroke: '#16181a',
        'stroke-opacity': 0.25,
      },
      this.bubble,
    );
    const meow = el(
      'text',
      { x: 19, y: -89, 'text-anchor': 'middle', class: 'poncho-meow' },
      this.bubble,
    );
    meow.textContent = 'miau';

    this.zzz = el(
      'text',
      { x: 20, y: -60, class: 'poncho-zzz', opacity: 0 },
      this.root,
    );
    this.zzz.textContent = 'z z z';

    this.root.addEventListener('click', (event) => {
      event.stopPropagation();
      this.hop(performance.now());
    });
  }

  /** Something happened: wake up, and maybe say so. */
  poke(now: number, hop = false): void {
    this.lastActivity = now;
    if (this.state === 'sleep') {
      this.setState('sit');
      this.hop(now);
    } else if (hop) {
      this.hop(now);
    }
  }

  /** A world point to look at, or null to look ahead. */
  lookAt(point: { x: number; y: number } | null): void {
    this.look = point;
  }

  private hop(now: number): void {
    this.hopUntil = now + 650;
    this.lastActivity = now;
  }

  private setState(state: State): void {
    this.state = state;
  }

  /**
   * Advance one frame. `target` is where he wants to be: the middle of the
   * view, a little behind it.
   */
  update(now: number, dt: number, target: number): void {
    if (this.lastActivity === 0) this.lastActivity = now;
    const gap = target - this.x;
    const far = Math.abs(gap);

    if (far > 40) {
      this.setState('walk');
      this.facing = Math.sign(gap);
      const speed = far > 600 ? TROT_SPEED : WALK_SPEED;
      const stepX = Math.min(far, speed * dt) * this.facing;
      this.x += stepX;
      this.gait += (Math.abs(stepX) / 22) * (speed === TROT_SPEED ? 1.15 : 1);
      this.lastActivity = now;
    } else if (this.state === 'walk') {
      this.setState('sit');
    } else if (this.state === 'sit' && now - this.lastActivity > SLEEP_AFTER) {
      this.setState('sleep');
    }

    // When something is being looked at, face it.
    if (this.state !== 'walk' && this.look) {
      this.facing = this.look.x >= this.x ? 1 : -1;
    }

    this.draw(now);
  }

  private draw(now: number): void {
    const t = now / 1000;
    const sitting = this.state === 'sit';
    const sleeping = this.state === 'sleep';
    const walking = this.state === 'walk';

    // A hop: a little parabola.
    let lift = 0;
    if (now < this.hopUntil) {
      const p = 1 - (this.hopUntil - now) / 650;
      lift = Math.sin(p * Math.PI) * 26;
    }
    this.root.setAttribute(
      'transform',
      `translate(${this.x.toFixed(1)} ${(this.floor - lift).toFixed(1)})`,
    );
    this.flip.setAttribute('transform', `scale(${this.facing} 1)`);
    this.bubble.setAttribute('opacity', now < this.hopUntil + 500 ? '1' : '0');

    // Body: level when walking (with a bob), tilted up when sitting, low
    // and flat when asleep.
    const bob = walking ? Math.abs(Math.sin(this.gait)) * 2.2 : 0;
    const breathe =
      Math.sin(t * (sleeping ? 1.4 : 2.2)) * (sleeping ? 1.2 : 0.6);
    let bodyTransform = `translate(0 ${(-bob + breathe * 0.4).toFixed(2)})`;
    if (sitting)
      bodyTransform = `rotate(-32 -18 -18) translate(0 ${(breathe * 0.4).toFixed(2)})`;
    if (sleeping) bodyTransform = `translate(0 14) scale(1 0.82)`;
    this.body.setAttribute('transform', bodyTransform);
    this.haunch.setAttribute('opacity', sitting ? '1' : '0');

    // Legs: a walk cycle; tucked when sitting (back) or asleep (all).
    this.legs.forEach((leg) => {
      const { back, hip } = leg;
      let angle = 0;
      let lower = 0;
      let opacity = 1;
      if (walking) angle = Math.sin(this.gait + leg.phase) * 28;
      if (sitting && back) opacity = 0;
      // Sitting, the front legs come down straight from the chest.
      let reach = 1;
      let shift = 0;
      if (sitting && !back) {
        angle = -4;
        lower = 26;
        reach = 2.15;
        shift = -2;
      }
      if (sleeping) opacity = 0;
      leg.g.setAttribute(
        'transform',
        `translate(${hip + shift} ${-24 - lower}) rotate(${angle.toFixed(1)}) scale(1 ${reach})`,
      );
      leg.g.setAttribute('opacity', String(opacity));
    });

    // Head: forward when walking, up when sitting, down on the paws asleep;
    // turned towards whatever is being looked at.
    let headX = 34;
    let headY = -44 - bob;
    let headTilt = 0;
    if (sitting) {
      headX = 18;
      headY = -70 + breathe * 0.5;
      if (this.look) {
        const dy = this.look.y - (this.floor - 70);
        headTilt = Math.max(-18, Math.min(18, dy * 0.04));
      }
    }
    if (sleeping) {
      headX = 30;
      headY = -20;
      headTilt = 14;
    }
    this.head.setAttribute(
      'transform',
      `translate(${headX} ${headY.toFixed(1)}) rotate(${headTilt.toFixed(1)})`,
    );

    // Eyes: blink now and then; shut when asleep.
    if (now > this.blinkAt + 160)
      this.blinkAt = now + 2200 + Math.random() * 3800;
    const blinking = now > this.blinkAt && now < this.blinkAt + 160;
    const lid = sleeping || blinking ? 3.8 : 0;
    for (const e of this.eyelids) e.setAttribute('ry', String(lid));
    for (const p of this.pupils) p.setAttribute('rx', sleeping ? '0' : '1.1');

    // Tail: sways; quick when walking, lazy when sitting, still asleep.
    const sway = walking
      ? Math.sin(this.gait * 0.5) * 10
      : Math.sin(t * 1.6) * 7;
    const tail = sleeping
      ? 'M-30 -14 C-46 -8 -40 2 -10 2'
      : sitting
        ? `M-30 -16 C-50 -6 ${(-38 + sway).toFixed(1)} 2 0 0`
        : `M-30 -36 C-48 -44 ${(-50 + sway).toFixed(1)} -66 ${(-40 + sway).toFixed(1)} -74`;
    this.tail.setAttribute('d', tail);

    this.zzz.setAttribute(
      'opacity',
      sleeping ? String(0.35 + Math.sin(t * 1.4) * 0.25) : '0',
    );
    this.zzz.setAttribute(
      'transform',
      `translate(0 ${(-((t * 6) % 10)).toFixed(1)})`,
    );
  }
}
