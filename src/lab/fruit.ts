import * as THREE from 'three';

/**
 * SPIKE — throwaway. Can fruit stand in for jobs on the board, and is it
 * fun to touch? A few fruits modelled in code, real light and soft shadows,
 * and a small hand-written physics: gravity, a floor, bumps between fruits,
 * rolling, and a squash when they land. Pick one up, throw it.
 */

const canvas = document.querySelector<HTMLCanvasElement>('[data-lab]')!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#f6f5f2');
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 5.5, 13);
camera.lookAt(0, 1.1, 0);

scene.add(new THREE.HemisphereLight('#fff8ee', '#d8d2c6', 1.1));
const sun = new THREE.DirectionalLight('#fff4e2', 2.4);
sun.position.set(-4, 9, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -9;
sun.shadow.camera.right = 9;
sun.shadow.camera.top = 9;
sun.shadow.camera.bottom = -9;
sun.shadow.radius = 6;
sun.shadow.bias = -0.0004;
scene.add(sun);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.ShadowMaterial({ opacity: 0.16 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// ── Modelling ──────────────────────────────────────────────────

/** A smooth solid of revolution from (radius, height) points. */
function lathe(points: [number, number][], segments = 64): THREE.LatheGeometry {
  const curve = new THREE.SplineCurve(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
  );
  const geometry = new THREE.LatheGeometry(curve.getPoints(60), segments);
  geometry.computeVertexNormals();
  return geometry;
}

/** Paint a vertical gradient (and an optional blush) into vertex colours. */
function paint(
  geometry: THREE.BufferGeometry,
  bottom: string,
  top: string,
  blush?: { colour: string; side: THREE.Vector3; amount: number },
): void {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const position = geometry.getAttribute('position');
  const colours = new Float32Array(position.count * 3);
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  const c = new THREE.Color();
  const p = new THREE.Vector3();
  const blushColour = blush ? new THREE.Color(blush.colour) : null;
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    const k = (p.y - box.min.y) / (box.max.y - box.min.y || 1);
    c.copy(a).lerp(b, k);
    if (blush && blushColour) {
      const facing = Math.max(0, p.clone().normalize().dot(blush.side));
      c.lerp(blushColour, Math.pow(facing, 1.6) * blush.amount);
    }
    colours.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
}

function stem(length: number, tilt: number): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(0.035, 0.05, length, 8);
  geometry.translate(0, length / 2, 0);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: '#5a4026', roughness: 0.8 }),
  );
  mesh.rotation.z = tilt;
  mesh.castShadow = true;
  return mesh;
}

function leaf(): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.22, 0.25, 0, 0.62);
  shape.quadraticCurveTo(-0.22, 0.25, 0, 0);
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape, 12),
    new THREE.MeshStandardMaterial({
      color: '#6f8f45',
      roughness: 0.55,
      side: THREE.DoubleSide,
    }),
  );
  mesh.rotation.set(0.4, 0.3, -1.1);
  mesh.castShadow = true;
  return mesh;
}

interface FruitSpec {
  name: string;
  radius: number;
  build: () => THREE.Group;
}

const SPECS: FruitSpec[] = [
  {
    name: 'Mews · pera',
    radius: 0.95,
    build: () => {
      const g = lathe([
        [0.0, 0.0],
        [0.62, 0.08],
        [0.95, 0.55],
        [0.88, 1.05],
        [0.55, 1.5],
        [0.42, 1.95],
        [0.3, 2.25],
        [0.0, 2.35],
      ]);
      paint(g, '#b9b23e', '#d8c25a', {
        colour: '#c7743f',
        side: new THREE.Vector3(1, 0.2, 0.4).normalize(),
        amount: 0.35,
      });
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        g,
        new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: 0.45,
          clearcoat: 0.3,
          clearcoatRoughness: 0.5,
        }),
      );
      body.castShadow = true;
      group.add(body);
      const s = stem(0.4, 0.25);
      s.position.y = 2.3;
      group.add(s);
      const l = leaf();
      l.position.set(0.05, 2.45, 0);
      group.add(l);
      group.position.y = -1.0;
      return wrap(group);
    },
  },
  {
    name: 'Liferay · melocotón',
    radius: 0.9,
    build: () => {
      const g = new THREE.SphereGeometry(0.9, 64, 48);
      // The crease: a soft groove down one side, and a slight squash.
      const position = g.getAttribute('position');
      const v = new THREE.Vector3();
      for (let i = 0; i < position.count; i++) {
        v.fromBufferAttribute(position, i);
        const groove = Math.exp(-Math.pow(v.x / 0.16, 2)) * (v.z > 0 ? 1 : 0);
        v.multiplyScalar(1 - groove * 0.07);
        v.y *= 0.94;
        position.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      paint(g, '#e8a457', '#f2c27a', {
        colour: '#c9473c',
        side: new THREE.Vector3(0.6, 0.5, 0.6).normalize(),
        amount: 0.75,
      });
      const body = new THREE.Mesh(
        g,
        new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: 0.75,
          sheen: 1,
          sheenRoughness: 0.6,
          sheenColor: new THREE.Color('#ffe0c8'),
        }),
      );
      body.castShadow = true;
      const group = new THREE.Group();
      group.add(body);
      const s = stem(0.15, 0.1);
      s.position.y = 0.82;
      group.add(s);
      return wrap(group);
    },
  },
  {
    name: 'Docline · manzana',
    radius: 0.85,
    build: () => {
      const g = lathe([
        [0.0, 0.12],
        [0.35, 0.02],
        [0.8, 0.35],
        [0.9, 0.85],
        [0.75, 1.4],
        [0.3, 1.5],
        [0.0, 1.32],
      ]);
      paint(g, '#a8262a', '#c93b2e', {
        colour: '#e9c25a',
        side: new THREE.Vector3(-0.7, 0.3, 0.5).normalize(),
        amount: 0.45,
      });
      const body = new THREE.Mesh(
        g,
        new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: 0.3,
          clearcoat: 0.8,
          clearcoatRoughness: 0.25,
        }),
      );
      body.castShadow = true;
      const group = new THREE.Group();
      group.add(body);
      const s = stem(0.35, -0.2);
      s.position.y = 1.3;
      group.add(s);
      const l = leaf();
      l.position.set(0.05, 1.5, 0);
      group.add(l);
      group.position.y = -0.78;
      return wrap(group);
    },
  },
  {
    name: 'Indra · limón',
    radius: 0.75,
    build: () => {
      const g = lathe([
        [0.0, -1.2],
        [0.12, -1.08],
        [0.55, -0.7],
        [0.72, 0.0],
        [0.55, 0.7],
        [0.12, 1.08],
        [0.0, 1.2],
      ]);
      paint(g, '#e8c62c', '#f0d43e');
      const body = new THREE.Mesh(
        g,
        new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: 0.55,
          clearcoat: 0.4,
          clearcoatRoughness: 0.6,
        }),
      );
      body.rotation.z = Math.PI / 2;
      body.castShadow = true;
      const group = new THREE.Group();
      group.add(body);
      return wrap(group);
    },
  },
];

/** An outer group, so physics can rotate the whole fruit about its centre. */
function wrap(inner: THREE.Group): THREE.Group {
  const outer = new THREE.Group();
  outer.add(inner);
  scene.add(outer);
  return outer;
}

// ── Physics ────────────────────────────────────────────────────

interface Body {
  mesh: THREE.Group;
  r: number;
  p: THREE.Vector3;
  v: THREE.Vector3;
  w: THREE.Vector3; // angular velocity
  squash: number;
  held: boolean;
}

const GRAVITY = -22;
const BOUNCE = 0.42;
const FRICTION = 0.985;
const WALL = 7;

const bodies: Body[] = SPECS.map((spec, i) => {
  const mesh = spec.build();
  const p = new THREE.Vector3((i - 1.5) * 2.6, 3 + i * 1.2, 0);
  return {
    mesh,
    r: spec.radius,
    p,
    v: new THREE.Vector3(0, 0, 0),
    w: new THREE.Vector3(),
    squash: 0,
    held: false,
  };
});

const up = new THREE.Vector3(0, 1, 0);
const tmp = new THREE.Vector3();
const q = new THREE.Quaternion();

function step(dt: number): void {
  for (const b of bodies) {
    if (b.held) continue;
    b.v.y += GRAVITY * dt;
    b.p.addScaledVector(b.v, dt);

    // Floor: bounce, squash, and roll without slipping.
    if (b.p.y - b.r < 0) {
      b.p.y = b.r;
      if (b.v.y < -1.5) b.squash = Math.min(0.35, -b.v.y * 0.025);
      b.v.y = -b.v.y * BOUNCE;
      if (Math.abs(b.v.y) < 0.4) b.v.y = 0;
      b.v.x *= FRICTION;
      b.v.z *= FRICTION;
      tmp.crossVectors(up, b.v).divideScalar(b.r);
      b.w.lerp(tmp, 0.3);
    }
    // Soft walls, so nothing rolls off stage.
    for (const axis of ['x', 'z'] as const) {
      const limit = axis === 'x' ? WALL : 3;
      if (Math.abs(b.p[axis]) > limit) {
        b.p[axis] = Math.sign(b.p[axis]) * limit;
        b.v[axis] *= -0.5;
      }
    }
    b.w.multiplyScalar(0.995);
    b.squash *= Math.pow(0.0005, dt);
  }

  // Fruit against fruit: push apart and trade a little speed.
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]!;
      const b = bodies[j]!;
      tmp.subVectors(b.p, a.p);
      const d = tmp.length();
      const min = a.r + b.r;
      if (d > 0 && d < min) {
        tmp.divideScalar(d);
        const push = (min - d) / 2;
        if (!a.held) a.p.addScaledVector(tmp, -push);
        if (!b.held) b.p.addScaledVector(tmp, push);
        const rel = b.v.clone().sub(a.v).dot(tmp);
        if (rel < 0) {
          const impulse = -rel * 0.7;
          if (!a.held) a.v.addScaledVector(tmp, -impulse);
          if (!b.held) b.v.addScaledVector(tmp, impulse);
          a.squash = Math.max(a.squash, 0.12);
          b.squash = Math.max(b.squash, 0.12);
        }
      }
    }
  }

  for (const b of bodies) {
    const speed = b.w.length();
    if (speed > 1e-4) {
      q.setFromAxisAngle(tmp.copy(b.w).divideScalar(speed), speed * dt);
      b.mesh.quaternion.premultiply(q);
    }
    b.mesh.position.copy(b.p);
    // Squash and stretch, preserving volume.
    const s = b.squash;
    b.mesh.scale.set(1 + s * 0.5, 1 - s, 1 + s * 0.5);
  }
}

// ── Pointer: pick up, carry, throw ─────────────────────────────

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
let held: Body | null = null;
let trail: { p: THREE.Vector3; t: number }[] = [];

function toPointer(event: PointerEvent): void {
  const rect = canvas.getBoundingClientRect();
  pointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
}

canvas.addEventListener('pointerdown', (event) => {
  toPointer(event);
  const hits = raycaster.intersectObjects(
    bodies.map((b) => b.mesh),
    true,
  );
  const hit = hits[0];
  if (!hit) return;
  held = bodies.find((b) => b.mesh === hit.object.parent?.parent) ?? null;
  if (!held) return;
  held.held = true;
  plane.constant = -held.p.z;
  canvas.setPointerCapture(event.pointerId);
  canvas.style.cursor = 'grabbing';
  trail = [];
});

canvas.addEventListener('pointermove', (event) => {
  toPointer(event);
  if (!held) {
    const over = raycaster.intersectObjects(
      bodies.map((b) => b.mesh),
      true,
    );
    canvas.style.cursor = over.length ? 'grab' : '';
    return;
  }
  const target = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(plane, target)) {
    target.y = Math.max(held.r, target.y);
    held.v.subVectors(target, held.p).multiplyScalar(30);
    held.p.lerp(target, 0.45);
    trail.push({ p: held.p.clone(), t: performance.now() });
    if (trail.length > 6) trail.shift();
    // Carried fruit tilts with the movement.
    tmp.crossVectors(up, held.v).multiplyScalar(0.02);
    held.w.lerp(tmp, 0.2);
  }
});

const release = () => {
  if (!held) return;
  const first = trail[0];
  const last = trail.at(-1);
  if (first && last && last.t > first.t) {
    held.v
      .subVectors(last.p, first.p)
      .divideScalar((last.t - first.t) / 1000)
      .clampLength(0, 18);
  }
  held.held = false;
  held = null;
  canvas.style.cursor = '';
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

// ── Labels, loop ───────────────────────────────────────────────

const labels = SPECS.map((spec) => {
  const el = document.createElement('span');
  el.className = 'lab-label';
  el.textContent = spec.name;
  document.querySelector('[data-lab-labels]')!.append(el);
  return el;
});

function resize(): void {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

let last = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  // Two substeps keep fast throws from tunnelling.
  step(dt / 2);
  step(dt / 2);
  renderer.render(scene, camera);
  bodies.forEach((b, i) => {
    const v = b.p.clone().setY(0).project(camera);
    const x = ((v.x + 1) / 2) * canvas.clientWidth;
    const y = ((1 - v.y) / 2) * canvas.clientHeight;
    labels[i]!.style.transform =
      `translate(${x.toFixed(0)}px, ${(y + 18).toFixed(0)}px)`;
  });
});
