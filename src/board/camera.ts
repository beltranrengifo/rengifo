/**
 * Pan and zoom. (x, y) is the world point at the centre of the viewport;
 * world y grows downwards, like the screen. Moves ease towards a target so
 * jumps (the ruler, opening a node) glide instead of cut.
 */
export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  w = 1;
  h = 1;
  /** Space on the right taken by the panel, in screen pixels. */
  inset = 0;

  private tx = 0;
  private ty = 0;
  private tz = 1;

  /** World x the view may not leave, so time never scrolls into the void. */
  minX = -Infinity;
  maxX = Infinity;

  static readonly MIN_ZOOM = 0.22;
  static readonly MAX_ZOOM = 2.4;

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
  }

  toScreen(wx: number, wy: number): [number, number] {
    return [
      (wx - this.x) * this.zoom + this.w / 2,
      (wy - this.y) * this.zoom + this.h / 2,
    ];
  }

  toWorld(sx: number, sy: number): [number, number] {
    return [
      (sx - this.w / 2) / this.zoom + this.x,
      (sy - this.h / 2) / this.zoom + this.y,
    ];
  }

  /** Move by a screen-space delta, immediately (dragging). */
  panBy(dx: number, dy: number): void {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
    this.snap();
  }

  /** Zoom by a factor, keeping the world point under (sx, sy) in place. */
  zoomAt(sx: number, sy: number, factor: number): void {
    const [wx, wy] = this.toWorld(sx, sy);
    this.zoom = Math.min(
      Camera.MAX_ZOOM,
      Math.max(Camera.MIN_ZOOM, this.zoom * factor),
    );
    this.x = wx - (sx - this.w / 2) / this.zoom;
    this.y = wy - (sy - this.h / 2) / this.zoom;
    this.snap();
  }

  /** Glide so (wx, wy) sits in the middle of the space left free. */
  glideTo(wx: number, wy: number, zoom = this.zoom): void {
    this.tz = Math.min(Camera.MAX_ZOOM, Math.max(Camera.MIN_ZOOM, zoom));
    this.tx = wx + this.inset / 2 / this.tz;
    this.ty = wy;
  }

  /** Keep the edges of the view, not just its centre, inside the bounds. */
  private clampX(x: number, zoom: number): number {
    const half = this.w / 2 / zoom;
    const lo = this.minX + half;
    const hi = this.maxX - half + this.inset / zoom;
    return lo > hi
      ? (this.minX + this.maxX) / 2
      : Math.min(hi, Math.max(lo, x));
  }

  private clamp(): void {
    this.x = this.clampX(this.x, this.zoom);
    this.tx = this.clampX(this.tx, this.tz);
    this.y = Math.min(900, Math.max(-900, this.y));
    this.ty = Math.min(900, Math.max(-900, this.ty));
  }

  /** Ease towards the target; returns whether anything moved. */
  update(dt: number): boolean {
    this.clamp();
    const k = 1 - Math.pow(0.0015, dt);
    const before = this.x + this.y + this.zoom;
    this.x += (this.tx - this.x) * k;
    this.y += (this.ty - this.y) * k;
    this.zoom += (this.tz - this.zoom) * k;
    return Math.abs(this.x + this.y + this.zoom - before) > 1e-4;
  }

  /** Make the current view the target, ending any glide. */
  private snap(): void {
    this.tx = this.x;
    this.ty = this.y;
    this.tz = this.zoom;
  }
}
