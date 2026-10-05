import * as THREE from 'three';
import type { Camera } from './camera';
import type { Body, Drip } from './softbody';

/**
 * The goo. Bodies and drops are drawn as flat shapes into a half-resolution
 * target, blurred, and composited with an alpha threshold: shapes close
 * enough to blur into each other melt into one. The composite reads the
 * blurred alpha as a height field for a soft highlight, and brightens the
 * rim where the jelly is thin.
 */

const FULLSCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BLUR_FRAG = /* glsl */ `
  uniform sampler2D tMap;
  uniform vec2 step;
  varying vec2 vUv;
  void main() {
    vec4 sum = texture2D(tMap, vUv) * 0.2270270270;
    sum += texture2D(tMap, vUv + step * 1.3846153846) * 0.3162162162;
    sum += texture2D(tMap, vUv - step * 1.3846153846) * 0.3162162162;
    sum += texture2D(tMap, vUv + step * 3.2307692308) * 0.0702702703;
    sum += texture2D(tMap, vUv - step * 3.2307692308) * 0.0702702703;
    gl_FragColor = sum;
  }
`;

const COMPOSITE_FRAG = /* glsl */ `
  uniform sampler2D tMap;
  uniform vec2 texel;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(tMap, vUv);
    float a = c.a;
    float edge = smoothstep(0.36, 0.5, a);
    if (edge <= 0.0) discard;
    // Jelly, not paint: lift the colour towards the light.
    vec3 base = mix(c.rgb / max(a, 1e-3), vec3(1.0), 0.22);

    // The blurred alpha as a height field: its slope is the surface normal.
    float ax = texture2D(tMap, vUv + vec2(texel.x, 0.0)).a
             - texture2D(tMap, vUv - vec2(texel.x, 0.0)).a;
    float ay = texture2D(tMap, vUv + vec2(0.0, texel.y)).a
             - texture2D(tMap, vUv - vec2(0.0, texel.y)).a;
    vec3 n = normalize(vec3(-ax, -ay, 0.22));
    vec3 l = normalize(vec3(-0.45, 0.55, 0.7));
    float diffuse = 0.8 + 0.2 * dot(n, l);
    float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);
    float rim = 1.0 - smoothstep(0.42, 0.85, a);

    vec3 col = base * diffuse;
    col = mix(col, vec3(1.0), rim * 0.32) + spec * 0.4;
    float alpha = edge * mix(0.62, 0.84, smoothstep(0.5, 0.95, a));
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

export interface GooInput {
  bodies: Body[];
  colors: string[];
  /** Pairs of body indices. */
  links: [number, number][];
  /** Page background, for fading dimmed links into it. */
  background: string;
}

const MAX_DRIPS = 96;
const RESOLUTION = 0.5;

export class GooRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly world = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  private readonly screen = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly blobs = new THREE.Scene();
  private readonly lines = new THREE.Scene();
  private readonly quad: THREE.Mesh;
  private readonly quadScene = new THREE.Scene();
  private readonly blur: THREE.ShaderMaterial;
  private readonly composite: THREE.ShaderMaterial;
  private readonly meshes: THREE.Mesh[] = [];
  private readonly drops: THREE.InstancedMesh;
  private readonly linkGeometry: THREE.BufferGeometry;
  private readonly linkColors: Float32Array;
  private readonly baseColors: THREE.Color[];
  private readonly background: THREE.Color;
  private targetA: THREE.WebGLRenderTarget;
  private targetB: THREE.WebGLRenderTarget;
  private readonly matrix = new THREE.Matrix4();
  private readonly tint = new THREE.Color();

  constructor(
    canvas: HTMLCanvasElement,
    private readonly input: GooInput,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;

    this.baseColors = input.colors.map((c) => new THREE.Color(c));
    this.background = new THREE.Color(input.background);

    input.bodies.forEach((body, i) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array((body.n + 1) * 3), 3),
      );
      const index: number[] = [];
      for (let k = 0; k < body.n; k++) {
        index.push(0, k + 1, ((k + 1) % body.n) + 1);
      }
      geometry.setIndex(index);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: this.baseColors[i],
          side: THREE.DoubleSide,
        }),
      );
      mesh.frustumCulled = false;
      this.meshes.push(mesh);
      this.blobs.add(mesh);
    });

    this.drops = new THREE.InstancedMesh(
      new THREE.CircleGeometry(1, 18),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
      MAX_DRIPS,
    );
    this.drops.frustumCulled = false;
    this.drops.count = 0;
    this.blobs.add(this.drops);

    this.linkGeometry = new THREE.BufferGeometry();
    this.linkGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(input.links.length * 6), 3),
    );
    this.linkColors = new Float32Array(input.links.length * 6);
    this.linkGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(this.linkColors, 3),
    );
    const segments = new THREE.LineSegments(
      this.linkGeometry,
      new THREE.LineBasicMaterial({ vertexColors: true }),
    );
    segments.frustumCulled = false;
    this.lines.add(segments);
    this.setHighlight(null);

    this.targetA = this.makeTarget(1, 1);
    this.targetB = this.makeTarget(1, 1);

    this.blur = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: BLUR_FRAG,
      uniforms: {
        tMap: { value: null },
        step: { value: new THREE.Vector2() },
      },
      depthTest: false,
      depthWrite: false,
    });
    this.composite = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        tMap: { value: null },
        texel: { value: new THREE.Vector2() },
      },
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blur);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  private makeTarget(w: number, h: number): THREE.WebGLRenderTarget {
    return new THREE.WebGLRenderTarget(w, h, {
      depthBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
  }

  setSize(w: number, h: number, dpr: number): void {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    const tw = Math.max(1, Math.round(w * dpr * RESOLUTION));
    const th = Math.max(1, Math.round(h * dpr * RESOLUTION));
    this.targetA.setSize(tw, th);
    this.targetB.setSize(tw, th);
    (this.composite.uniforms.texel!.value as THREE.Vector2).set(1 / tw, 1 / th);
  }

  /** Per link: 1 to light it, anything lower to fade it; null for all on. */
  setHighlight(mask: number[] | null): void {
    this.input.links.forEach(([source, target], i) => {
      const weight = mask ? (mask[i] ?? 0) : 0.55;
      for (const [end, node] of [
        [0, source],
        [1, target],
      ] as const) {
        this.tint
          .copy(this.background)
          .lerp(this.baseColors[node]!, 0.15 + weight * 0.75);
        this.linkColors.set(
          [this.tint.r, this.tint.g, this.tint.b],
          i * 6 + end * 3,
        );
      }
    });
    this.linkGeometry.getAttribute('color').needsUpdate = true;
  }

  render(camera: Camera, drips: Drip[], dripColors: number[]): void {
    const { bodies, links } = this.input;
    const halfW = camera.w / 2 / camera.zoom;
    const halfH = camera.h / 2 / camera.zoom;
    // World y grows downwards, so top is the smaller y.
    this.world.left = camera.x - halfW;
    this.world.right = camera.x + halfW;
    this.world.top = camera.y - halfH;
    this.world.bottom = camera.y + halfH;
    this.world.updateProjectionMatrix();

    bodies.forEach((body, i) => {
      const position = this.meshes[i]!.geometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      const array = position.array as Float32Array;
      let cx = 0;
      let cy = 0;
      for (let k = 0; k < body.n; k++) {
        cx += body.px[k]!;
        cy += body.py[k]!;
        array[(k + 1) * 3] = body.px[k]!;
        array[(k + 1) * 3 + 1] = body.py[k]!;
      }
      array[0] = cx / body.n;
      array[1] = cy / body.n;
      position.needsUpdate = true;
    });

    const count = Math.min(drips.length, MAX_DRIPS);
    for (let i = 0; i < count; i++) {
      const drip = drips[i]!;
      this.matrix.makeScale(drip.r, drip.r, 1).setPosition(drip.x, drip.y, 0);
      this.drops.setMatrixAt(i, this.matrix);
      this.drops.setColorAt(i, this.baseColors[dripColors[i] ?? 0]!);
    }
    this.drops.count = count;
    this.drops.instanceMatrix.needsUpdate = true;
    if (this.drops.instanceColor) this.drops.instanceColor.needsUpdate = true;

    const linkPositions = this.linkGeometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute;
    const lp = linkPositions.array as Float32Array;
    links.forEach(([source, target], i) => {
      const a = this.meshes[source]!.geometry.getAttribute('position')
        .array as Float32Array;
      const b = this.meshes[target]!.geometry.getAttribute('position')
        .array as Float32Array;
      lp[i * 6] = a[0]!;
      lp[i * 6 + 1] = a[1]!;
      lp[i * 6 + 3] = b[0]!;
      lp[i * 6 + 4] = b[1]!;
    });
    linkPositions.needsUpdate = true;

    const r = this.renderer;
    // 1. Shapes, flat, at half resolution.
    r.setRenderTarget(this.targetA);
    r.clear();
    r.render(this.blobs, this.world);

    // 2. Blur, horizontally then vertically; wider when zoomed in, so the
    //    goo keeps the same viscosity on screen.
    const radius = Math.min(3.2, Math.max(1.1, 1.7 * camera.zoom));
    const step = this.blur.uniforms.step!.value as THREE.Vector2;
    this.quad.material = this.blur;
    this.blur.uniforms.tMap!.value = this.targetA.texture;
    step.set(radius / this.targetA.width, 0);
    r.setRenderTarget(this.targetB);
    r.clear();
    r.render(this.quadScene, this.screen);
    this.blur.uniforms.tMap!.value = this.targetB.texture;
    step.set(0, radius / this.targetA.height);
    r.setRenderTarget(this.targetA);
    r.clear();
    r.render(this.quadScene, this.screen);

    // 3. Links underneath, then the jelly on top.
    r.setRenderTarget(null);
    r.clear();
    r.render(this.lines, this.world);
    this.quad.material = this.composite;
    this.composite.uniforms.tMap!.value = this.targetA.texture;
    r.render(this.quadScene, this.screen);
  }

  dispose(): void {
    this.targetA.dispose();
    this.targetB.dispose();
    this.renderer.dispose();
  }
}
