import { describe, expect, it } from 'vitest';
import { techs, projectSpans } from '../data/board';
import { experience } from '../data/experience';
import { projects } from '../data/caseStudies';
import { buildModel, timeX, yearOf, YEAR_PX } from './model';
import { createLayout, settle } from './layout';
import { area, centroid, createBody, shed, step, stepDrips } from './softbody';
import { Poncho } from './poncho';

/** A deterministic random, so physics tests do not flake. */
function seeded(seed = 1): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const roleIds = experience.flatMap((entry) =>
  entry.roles.map((role) => role.titleKey.replace(/^exp_|_title$/g, '')),
);

function realModel() {
  return buildModel({
    roles: experience.flatMap((entry) =>
      entry.roles.map((role) => ({
        id: role.titleKey.replace(/^exp_|_title$/g, ''),
        label: role.titleKey,
        span: role.dates ?? entry.period,
      })),
    ),
    projects: projects.map((project) => ({
      id: project.slug,
      label: project.name,
      span: projectSpans[project.slug]!,
    })),
    techs: techs.map((tech) => ({
      ...tech,
      label: typeof tech.label === 'string' ? tech.label : tech.label.en,
    })),
  });
}

describe('board data', () => {
  it('dates every visible project', () => {
    for (const project of projects) {
      expect(projectSpans[project.slug], project.slug).toBeDefined();
    }
  });

  it('only links technologies to roles and projects that exist', () => {
    const known = new Set([...roleIds, ...projects.map((p) => p.slug)]);
    for (const tech of techs) {
      expect(tech.usedIn.length, tech.id).toBeGreaterThan(0);
      for (const id of tech.usedIn)
        expect(known.has(id), `${tech.id} → ${id}`).toBe(true);
    }
  });

  it('builds a node per role, project and technology', () => {
    const model = realModel();
    expect(model.nodes).toHaveLength(
      roleIds.length + projects.length + techs.length,
    );
  });
});

describe('model', () => {
  it('reads months, and bare years as mid-year', () => {
    expect(yearOf('2021-06')).toBeCloseTo(2021 + 5 / 12);
    expect(yearOf('2018')).toBe(2018.5);
  });

  it('maps time to world x', () => {
    expect(timeX(2005)).toBe(YEAR_PX);
  });
});

describe('layout', () => {
  it('keeps every role and project near its date', () => {
    const layout = createLayout(realModel(), seeded(7));
    settle(layout, 400);
    for (const node of layout.nodes) {
      if (node.kind === 'tech') continue;
      expect(Math.abs(node.x - node.homeX), node.id).toBeLessThan(
        YEAR_PX * 0.75,
      );
    }
  });
});

describe('soft body', () => {
  it('recovers its area and its place after a hard squeeze', () => {
    const body = createBody(50, 0, 0);
    const rest = body.restArea;
    // Squash it flat against the floor, then let go.
    for (let i = 0; i < body.n; i++) body.py[i] = body.py[i]! * 0.2;
    for (let frame = 0; frame < 90; frame++) step(body);
    expect(Math.abs(area(body) - rest) / rest).toBeLessThan(0.05);
    const [cx, cy] = centroid(body);
    expect(Math.hypot(cx, cy)).toBeLessThan(3);
  });

  it('stretches towards the pointer while held', () => {
    const body = createBody(50, 0, 0);
    body.grabbed = 0;
    body.grabX = 180;
    body.grabY = 0;
    for (let frame = 0; frame < 30; frame++) step(body);
    expect(body.px[0]).toBe(180);
    expect(Math.abs(area(body) - body.restArea) / body.restArea).toBeLessThan(
      0.15,
    );
  });

  it('drips fall and are absorbed by a body below', () => {
    const random = seeded(3);
    const top = createBody(40, 0, 0);
    const floor = createBody(80, 0, 220);
    let drips = [shed(top, random)];
    let absorbed = false;
    for (let frame = 0; frame < 120 && drips.length; frame++) {
      drips = stepDrips(drips, 1 / 60, [floor]);
      if (drips.some((drip) => drip.absorbing)) absorbed = true;
    }
    expect(absorbed).toBe(true);
  });
});

describe('Poncho', () => {
  function fake() {
    const el = { dataset: {} as Record<string, string> };
    return el as unknown as HTMLElement;
  }

  it('falls asleep when left alone, and wakes on the next touch', () => {
    const el = fake();
    const cat = new Poncho(el, seeded(1));
    cat.tick(0);
    cat.tick(40_000);
    expect(el.dataset.mood).toBe('sleep');
    cat.notify('interact', 40_100);
    expect(el.dataset.mood).toBe('stretch');
  });

  it('does not react to every fling', () => {
    const el = fake();
    const cat = new Poncho(el, () => 0);
    cat.notify('fling', 1000);
    expect(el.dataset.mood).toBe('stretch');
    cat.tick(4000);
    cat.notify('fling', 4100);
    // Still cooling down from the first one.
    expect(el.dataset.mood).not.toBe('stretch');
  });
});
