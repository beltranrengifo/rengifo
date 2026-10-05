import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { END_YEAR, START_YEAR, type BoardModel } from './model';
import { sample } from './spectrum';

/**
 * The landscape: one ridge per technology, front to back, drawn as an
 * engraved line over a fill in the page colour so nearer ridges hide the
 * ones behind — a spectrogram you can fly over. Roles and projects are clips
 * on two lanes in front, like regions in an audio editor.
 */

export const YEAR_UNITS = 12;
const ROW_GAP = 3.4;
export const HEIGHT = 3.6;
const SAMPLES_PER_YEAR = 40;
const LANE_ROLE = 5;
const LANE_PROJECT = 8.4;
const LANE_DEPTH = 1.1;

export const worldX = (year: number): number =>
  (year - START_YEAR) * YEAR_UNITS;
export const rowZ = (row: number): number => -row * ROW_GAP;
export const laneZ = (kind: 'role' | 'project'): number =>
  kind === 'role' ? LANE_ROLE : LANE_PROJECT;

/** A small deterministic texture, so silence still has grain. */
function grain(i: number, row: number): number {
  const s = Math.sin(i * 12.9898 + row * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

export interface SceneColours {
  background: string;
  ink: string;
  accent: string;
  project: string;
}

export class Landscape {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.PerspectiveCamera(28, 1, 1, 500);
  private readonly scene = new THREE.Scene();
  private readonly lines: Line2[] = [];
  private readonly fills: THREE.Mesh[] = [];
  private readonly clipMeshes: THREE.Mesh[] = [];
  private readonly materials: LineMaterial[] = [];
  private readonly raycaster = new THREE.Raycaster();
  private readonly ink: THREE.Color;
  private readonly accent: THREE.Color;
  private readonly faded: THREE.Color;
  private readonly projectColour: THREE.Color;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly model: BoardModel,
    colours: SceneColours,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const background = new THREE.Color(colours.background);
    this.renderer.setClearColor(background, 1);
    this.scene.fog = new THREE.Fog(background, 110, 240);

    this.ink = new THREE.Color(colours.ink);
    this.accent = new THREE.Color(colours.accent);
    this.faded = this.ink.clone().lerp(background, 0.78);
    this.projectColour = new THREE.Color(colours.project);

    const years = END_YEAR - START_YEAR;
    const steps = Math.round(years * SAMPLES_PER_YEAR);
    const levels = sample(model, START_YEAR, END_YEAR, steps);

    levels.forEach((values, row) => {
      const z = rowZ(row);
      const points: number[] = [];
      const fill: number[] = [];
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * years * YEAR_UNITS;
        const v = values[i]!;
        // Louder passages get a little more texture, like a real signal.
        const texture = (grain(i, row) - 0.5) * (0.06 + v * 0.09);
        const y = Math.max(0, v * HEIGHT + texture);
        points.push(x, y, z);
        fill.push(x, y, z, x, -0.02, z);
      }

      const geometry = new LineGeometry();
      geometry.setPositions(points);
      const material = new LineMaterial({
        color: this.ink.getHex(),
        linewidth: 1.25,
        worldUnits: false,
        transparent: true,
        opacity: 0.92,
        fog: true,
      } as ConstructorParameters<typeof LineMaterial>[0]);
      const line = new Line2(geometry, material);
      line.computeLineDistances();
      line.renderOrder = 2;
      this.lines.push(line);
      this.materials.push(material);
      this.scene.add(line);

      // The fill: a strip from the ridge down to the floor, in the page
      // colour, so the ridge in front hides the ones behind.
      const strip = new THREE.BufferGeometry();
      strip.setAttribute('position', new THREE.Float32BufferAttribute(fill, 3));
      const index: number[] = [];
      for (let i = 0; i < steps; i++) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      strip.setIndex(index);
      const mesh = new THREE.Mesh(
        strip,
        new THREE.MeshBasicMaterial({
          color: background,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        }),
      );
      mesh.userData.row = row;
      mesh.renderOrder = 1;
      this.fills.push(mesh);
      this.scene.add(mesh);
    });

    // Clips: flat regions on two lanes in front of the ridges.
    model.clips.forEach((clip, i) => {
      const width = (clip.end - clip.start) * YEAR_UNITS;
      const geometry = new THREE.PlaneGeometry(
        Math.max(width - 0.25, 0.4),
        clip.kind === 'role' ? LANE_DEPTH : LANE_DEPTH * 0.7,
      );
      geometry.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: clip.kind === 'role' ? this.accent : this.projectColour,
          transparent: true,
          opacity: clip.kind === 'role' ? 0.82 : 0.6,
        }),
      );
      mesh.position.set(worldX(clip.start) + width / 2, 0.01, laneZ(clip.kind));
      mesh.userData.clip = i;
      this.clipMeshes.push(mesh);
      this.scene.add(mesh);
    });

    // A hairline floor edge in front of the ridges.
    const edge = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 2.2),
      new THREE.Vector3(years * YEAR_UNITS, 0, 2.2),
    ]);
    this.scene.add(
      new THREE.Line(
        edge,
        new THREE.LineBasicMaterial({ color: this.faded, fog: true }),
      ),
    );
  }

  setSize(w: number, h: number, dpr: number): void {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const material of this.materials) material.resolution.set(w, h);
  }

  /**
   * Light some ridges and fade the rest. `rows` null means no focus: every
   * ridge in ink.
   */
  highlight(rows: Set<number> | null, clip = -1): void {
    this.materials.forEach((material, row) => {
      const on = rows?.has(row);
      material.color.copy(
        rows === null ? this.ink : on ? this.accent : this.faded,
      );
      material.linewidth = on ? 2.4 : 1.25;
      material.opacity = rows === null || on ? 0.95 : 0.7;
    });
    this.clipMeshes.forEach((mesh, i) => {
      const material = mesh.material as THREE.MeshBasicMaterial;
      const base = this.model.clips[i]!.kind === 'role' ? 0.82 : 0.6;
      material.opacity = clip < 0 || clip === i ? base : base * 0.35;
    });
  }

  /** What is under a point in normalised device coordinates. */
  pick(
    ndcX: number,
    ndcY: number,
  ): { row: number; x: number } | { clip: number; x: number } | null {
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const hit = this.raycaster.intersectObjects(
      [...this.clipMeshes, ...this.fills],
      false,
    )[0];
    if (!hit) return null;
    const { userData } = hit.object;
    if (userData.clip !== undefined) {
      return { clip: userData.clip as number, x: hit.point.x };
    }
    return { row: userData.row as number, x: hit.point.x };
  }

  /** Screen position of a world point, in CSS pixels. */
  project(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
  ): [number, number, boolean] {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h, v.z < 1];
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
