/**
 * Poncho on the board: an exotic shorthair — round flat face, tiny low
 * ears, big round eyes, a compact plush body on short legs and a short
 * thick tail — who walks the floor of the chart and keeps up with the
 * camera, the way a companion would in a game.
 *
 * The body is drawn side-on and the face turned to the viewer, which is how
 * a flat-faced cat reads best. Three poses (walking, sitting, asleep) are
 * whole drawings swapped in and out; within each, legs, tail, head and eyes
 * move on their own.
 */

const NS = 'http://www.w3.org/2000/svg';

const FUR = '#d6b68a';
const SHADE = '#c3a073';
const STRIPE = '#b8925f';
const CREAM = '#efe1c6';
const PINK = '#d39a8c';
const EYE = '#e9a23b';
const INK = '#2a2420';

const WALK_SPEED = 240; // world px per second
const TROT_SPEED = 600;
const SLEEP_AFTER = 15_000;

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
  x: number;
  phase: number;
}

export class Companion {
  readonly root: SVGGElement;
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
  private readonly stand: SVGGElement;
  private readonly sit: SVGGElement;
  private readonly sleep: SVGGElement;
  private readonly standTail: SVGPathElement;
  private readonly sitTail: SVGPathElement;
  private readonly legs: Leg[] = [];
  private readonly head: SVGGElement;
  private readonly lids: SVGPathElement[] = [];
  private readonly pupils: SVGCircleElement[] = [];
  private readonly shines: SVGCircleElement[] = [];
  private readonly sleepFace: SVGGElement;
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
    el(
      'ellipse',
      { cx: 0, cy: 0, rx: 30, ry: 3.5, fill: 'rgba(22,24,26,0.1)' },
      this.root,
    );
    this.flip = el('g', {}, this.root);

    // ── Standing / walking ─────────────────────────────────────
    this.stand = el('g', {}, this.flip);
    this.standTail = el(
      'path',
      {
        fill: 'none',
        stroke: SHADE,
        'stroke-width': 10,
        'stroke-linecap': 'round',
      },
      this.stand,
    );
    const leg = (x: number, phase: number, far: boolean) => {
      const g = el('g', {}, this.stand);
      el(
        'path',
        {
          d: 'M-5 0 L-5 11 Q-5 15 0 15 Q5 15 5 11 L5 0 Z',
          fill: far ? SHADE : FUR,
        },
        g,
      );
      el('ellipse', { cx: 0.5, cy: 14.5, rx: 5.5, ry: 2.6, fill: CREAM }, g);
      this.legs.push({ g, x, phase });
    };
    leg(-17, Math.PI, true);
    leg(13, 0, true);
    // The loaf: a compact, plush body.
    el(
      'path',
      {
        d: 'M-31 -17 C-34 -34 -18 -42 0 -42 C19 -42 32 -34 31 -19 C30 -9 20 -7 1 -7 C-18 -7 -29 -7 -31 -17 Z',
        fill: FUR,
      },
      this.stand,
    );
    el(
      'path',
      {
        d: 'M-24 -12 C-14 -8 12 -8 24 -13 C20 -8 8 -6 0 -6 C-10 -6 -20 -7 -24 -12 Z',
        fill: CREAM,
      },
      this.stand,
    );
    for (const sx of [-14, -4, 6]) {
      el(
        'path',
        {
          d: `M${sx} -41 q3 6 0 11`,
          fill: 'none',
          stroke: STRIPE,
          'stroke-width': 2.4,
          'stroke-linecap': 'round',
          opacity: 0.45,
        },
        this.stand,
      );
    }
    leg(-11, 0, false);
    leg(19, Math.PI, false);

    // ── Sitting ────────────────────────────────────────────────
    this.sit = el('g', {}, this.flip);
    this.sitTail = el(
      'path',
      {
        fill: 'none',
        stroke: SHADE,
        'stroke-width': 10,
        'stroke-linecap': 'round',
      },
      this.sit,
    );
    el(
      'path',
      { d: 'M-20 -2 C-30 -18 -24 -46 0 -48 C22 -48 28 -22 20 -2 Z', fill: FUR },
      this.sit,
    );
    el(
      'path',
      { d: 'M-8 -4 C-12 -18 -6 -32 6 -34 C14 -24 14 -12 10 -4 Z', fill: CREAM },
      this.sit,
    );
    for (const px of [-4, 9]) {
      el(
        'ellipse',
        { cx: px, cy: -2, rx: 6.5, ry: 3.4, fill: CREAM },
        this.sit,
      );
    }

    // ── Asleep: curled up, tail round the front ────────────────
    this.sleep = el('g', {}, this.flip);
    el(
      'path',
      { d: 'M-28 -1 C-34 -14 -22 -28 0 -28 C22 -28 34 -16 30 -2 Z', fill: FUR },
      this.sleep,
    );
    el(
      'path',
      {
        d: 'M-28 -2 C-40 -4 -34 -14 -20 -8',
        fill: 'none',
        stroke: SHADE,
        'stroke-width': 10,
        'stroke-linecap': 'round',
      },
      this.sleep,
    );

    // ── Head: face to the viewer ───────────────────────────────
    this.head = el('g', {}, this.flip);
    // Tiny ears, low and wide apart.
    for (const side of [-1, 1]) {
      el(
        'path',
        {
          d: `M${side * 9} -13 Q${side * 16} -24 ${side * 19} -8 Z`,
          fill: FUR,
        },
        this.head,
      );
      el(
        'path',
        {
          d: `M${side * 11} -12 Q${side * 15.5} -19 ${side * 17} -9 Z`,
          fill: PINK,
          opacity: 0.7,
        },
        this.head,
      );
    }
    // A round, full face with plush cheeks.
    el('ellipse', { cx: 0, cy: 0, rx: 19, ry: 16, fill: FUR }, this.head);
    for (const side of [-1, 1]) {
      el('circle', { cx: side * 12, cy: 6, r: 8, fill: FUR }, this.head);
    }
    // Tabby marks on the forehead.
    for (const mx of [-4, 0, 4]) {
      el(
        'path',
        {
          d: `M${mx} -14 l0 5`,
          stroke: STRIPE,
          'stroke-width': 1.6,
          'stroke-linecap': 'round',
          opacity: 0.5,
        },
        this.head,
      );
    }
    el('ellipse', { cx: 0, cy: 8, rx: 9, ry: 6.5, fill: CREAM }, this.head);
    // Big round eyes.
    for (const side of [-1, 1]) {
      const cx = side * 7.5;
      el('circle', { cx, cy: -1, r: 5.4, fill: EYE }, this.head);
      this.pupils.push(
        el('circle', { cx, cy: -1, r: 3.3, fill: INK }, this.head),
      );
      this.shines.push(
        el(
          'circle',
          { cx: cx + 1.4, cy: -2.6, r: 1.2, fill: '#fff' },
          this.head,
        ),
      );
      this.lids.push(el('path', { fill: FUR }, this.head));
    }
    // The flat little nose and mouth.
    el('path', { d: 'M-2.4 4.6 L2.4 4.6 L0 7.2 Z', fill: PINK }, this.head);
    el(
      'path',
      {
        d: 'M0 7.2 v1.6 M0 8.8 q-2.4 2 -4.2 0.4 M0 8.8 q2.4 2 4.2 0.4',
        fill: 'none',
        stroke: INK,
        'stroke-width': 0.8,
        'stroke-linecap': 'round',
        opacity: 0.6,
      },
      this.head,
    );
    for (const side of [-1, 1]) {
      for (const dy of [-1, 1.5]) {
        el(
          'path',
          {
            d: `M${side * 9} ${8 + dy} l${side * 12} ${dy * 1.4}`,
            stroke: INK,
            'stroke-width': 0.5,
            opacity: 0.35,
          },
          this.head,
        );
      }
    }
    // Asleep: closed eyes as two soft arcs.
    this.sleepFace = el('g', { opacity: 0 }, this.head);
    for (const side of [-1, 1]) {
      el(
        'path',
        {
          d: `M${side * 7.5 - 4} -1 q4 3 8 0`,
          fill: 'none',
          stroke: INK,
          'stroke-width': 1.2,
          'stroke-linecap': 'round',
        },
        this.sleepFace,
      );
    }

    this.bubble = el('g', { opacity: 0 }, this.root);
    el(
      'rect',
      {
        x: -2,
        y: -96,
        width: 48,
        height: 22,
        rx: 11,
        fill: '#fbfaf8',
        stroke: INK,
        'stroke-opacity': 0.2,
      },
      this.bubble,
    );
    const meow = el(
      'text',
      { x: 22, y: -81, 'text-anchor': 'middle', class: 'poncho-meow' },
      this.bubble,
    );
    meow.textContent = 'miau';

    this.zzz = el(
      'text',
      { x: 14, y: -46, class: 'poncho-zzz', opacity: 0 },
      this.root,
    );
    this.zzz.textContent = 'z z z';

    this.root.addEventListener('click', (event) => {
      event.stopPropagation();
      this.poke(performance.now(), true);
    });
  }

  /** Something happened: wake up, and maybe say so. */
  poke(now: number, hop = false): void {
    this.lastActivity = now;
    if (this.state === 'sleep') {
      this.state = 'sit';
      this.hopUntil = now + 650;
    } else if (hop) {
      this.hopUntil = now + 650;
    }
  }

  /** A world point to look at, or null to look at the viewer. */
  lookAt(point: { x: number; y: number } | null): void {
    this.look = point;
  }

  /** Advance one frame towards `target`, a world x on the floor. */
  update(now: number, dt: number, target: number): void {
    if (this.lastActivity === 0) this.lastActivity = now;
    const gap = target - this.x;
    const far = Math.abs(gap);

    if (far > 40) {
      this.state = 'walk';
      this.facing = Math.sign(gap);
      const trotting = far > 600;
      const step = Math.min(far, (trotting ? TROT_SPEED : WALK_SPEED) * dt);
      this.x += step * this.facing;
      this.gait += (step / 16) * (trotting ? 1.2 : 1);
      this.lastActivity = now;
    } else if (this.state === 'walk') {
      this.state = 'sit';
    } else if (this.state === 'sit' && now - this.lastActivity > SLEEP_AFTER) {
      this.state = 'sleep';
    }

    this.draw(now);
  }

  private draw(now: number): void {
    const t = now / 1000;
    const walking = this.state === 'walk';
    const sitting = this.state === 'sit';
    const sleeping = this.state === 'sleep';

    let lift = 0;
    if (now < this.hopUntil) {
      const p = 1 - (this.hopUntil - now) / 650;
      lift = Math.sin(p * Math.PI) * 24;
    }
    this.root.setAttribute(
      'transform',
      `translate(${this.x.toFixed(1)} ${(this.floor - lift).toFixed(1)})`,
    );
    this.flip.setAttribute('transform', `scale(${this.facing} 1)`);
    this.bubble.setAttribute('opacity', now < this.hopUntil + 450 ? '1' : '0');

    this.stand.setAttribute('display', walking ? 'inline' : 'none');
    this.sit.setAttribute('display', sitting ? 'inline' : 'none');
    this.sleep.setAttribute('display', sleeping ? 'inline' : 'none');

    const breathe = Math.sin(t * (sleeping ? 1.3 : 2)) * (sleeping ? 1 : 0.5);
    const bob = walking ? Math.abs(Math.sin(this.gait)) * 1.8 : 0;

    if (walking) {
      this.stand.setAttribute('transform', `translate(0 ${(-bob).toFixed(2)})`);
      for (const leg of this.legs) {
        const swing = Math.sin(this.gait + leg.phase) * 22;
        leg.g.setAttribute(
          'transform',
          `translate(${leg.x} ${(-12 + bob).toFixed(2)}) rotate(${swing.toFixed(1)})`,
        );
      }
      const wag = Math.sin(this.gait * 0.5) * 5;
      this.standTail.setAttribute(
        'd',
        `M-28 -30 C-38 -36 ${(-42 + wag).toFixed(1)} -46 ${(-40 + wag).toFixed(1)} -52`,
      );
    }
    if (sitting) {
      const sway = Math.sin(t * 1.5) * 5;
      this.sitTail.setAttribute(
        'd',
        `M-16 -4 C-30 0 ${(-26 + sway).toFixed(1)} 4 ${(4 + sway).toFixed(1)} 2`,
      );
      this.sit.setAttribute(
        'transform',
        `translate(0 ${(breathe * 0.3).toFixed(2)})`,
      );
    }
    if (sleeping) {
      this.sleep.setAttribute(
        'transform',
        `scale(1 ${(1 + breathe * 0.02).toFixed(3)})`,
      );
    }

    // The head rides on whichever pose is showing. The face always turns
    // to the viewer, so it is un-flipped inside the flipped body.
    let hx = 24;
    let hy = -40 - bob;
    let tilt = Math.sin(this.gait) * 2;
    if (sitting) {
      hx = 2;
      hy = -56 + breathe * 0.4;
      tilt = this.look
        ? Math.max(-10, Math.min(10, (this.look.x - this.x) * 0.01))
        : 0;
    }
    if (sleeping) {
      hx = 20;
      hy = -14;
      tilt = 12;
    }
    this.head.setAttribute(
      'transform',
      `translate(${hx} ${hy.toFixed(1)}) scale(${this.facing} 1) rotate(${(tilt * this.facing).toFixed(1)})`,
    );

    // Pupils follow what he is looking at; otherwise they look at you.
    let ox = 0;
    let oy = 0;
    if (this.look && !sleeping) {
      const dx = this.look.x - this.x;
      const dy = this.look.y - (this.floor + hy);
      const d = Math.hypot(dx, dy) || 1;
      ox = (dx / d) * 1.6;
      oy = (dy / d) * 1.4;
    }
    this.pupils.forEach((p, i) => {
      const cx = (i === 0 ? -7.5 : 7.5) + ox;
      p.setAttribute('cx', cx.toFixed(2));
      p.setAttribute('cy', (-1 + oy).toFixed(2));
      this.shines[i]!.setAttribute('cx', (cx + 1.4).toFixed(2));
      this.shines[i]!.setAttribute('cy', (-2.6 + oy).toFixed(2));
    });

    // Blink now and then: the lid comes down over the eye.
    if (now > this.blinkAt + 170) {
      this.blinkAt = now + 2400 + Math.random() * 3600;
    }
    const close = now > this.blinkAt && now < this.blinkAt + 170 ? 1 : 0;
    this.lids.forEach((lid, i) => {
      const cx = i === 0 ? -7.5 : 7.5;
      const y = -6.6 + close * 5.8;
      lid.setAttribute(
        'd',
        `M${cx - 6} -6.8 L${cx + 6} -6.8 L${cx + 6} ${y.toFixed(2)} Q${cx} ${(y + close * 2).toFixed(2)} ${cx - 6} ${y.toFixed(2)} Z`,
      );
      lid.setAttribute('display', sleeping ? 'none' : 'inline');
    });
    for (const p of [...this.pupils, ...this.shines]) {
      p.setAttribute('display', sleeping ? 'none' : 'inline');
    }
    this.sleepFace.setAttribute('opacity', sleeping ? '1' : '0');

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
