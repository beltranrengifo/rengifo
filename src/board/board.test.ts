import { describe, expect, it } from 'vitest';
import { techs, projectSpans } from '../data/board';
import { experience } from '../data/experience';
import { projects } from '../data/caseStudies';
import { buildModel, yearOf } from './model';
import { createLayout, settle, timeX, YEAR_PX } from './layout';
import { Poncho } from './poncho';

/** A deterministic random, so the cat's dice do not flake. */
function seeded(seed = 1): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const roleId = (key: string) => key.replace(/^exp_|_title$/g, '');

function realModel() {
  return buildModel({
    clips: [
      ...experience.flatMap((entry) =>
        entry.roles.map((role) => ({
          id: roleId(role.titleKey),
          kind: 'role' as const,
          label: role.titleKey,
          span: role.dates ?? entry.period,
        })),
      ),
      ...projects.map((project) => ({
        id: project.slug,
        kind: 'project' as const,
        label: project.name,
        span: projectSpans[project.slug]!,
      })),
    ],
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

  it('only uses technologies in roles and projects that exist', () => {
    expect(() => realModel()).not.toThrow();
  });

  it('gives paid work at least as many technologies as any side project', () => {
    const model = realModel();
    const count = (id: string) =>
      model.tracks.filter((track) =>
        track.uses.some((use) => model.clips[use.clip]!.id === id),
      ).length;
    const mews = count('mews_squad');
    for (const project of projects) {
      expect(mews, project.slug).toBeGreaterThanOrEqual(count(project.slug));
    }
  });
});

describe('model', () => {
  it('reads months, and bare years as mid-year', () => {
    expect(yearOf('2021-06')).toBeCloseTo(2021 + 5 / 12);
    expect(yearOf('2018')).toBe(2018.5);
  });
});

describe('layout', () => {
  it('keeps every role and project near its date', () => {
    const layout = createLayout(realModel(), seeded(7));
    settle(layout, 400);
    for (const node of layout.nodes) {
      if (node.kind === 'tech') continue;
      expect(Math.abs(node.x - node.homeX), node.id).toBeLessThan(
        YEAR_PX * 0.6,
      );
    }
  });

  it('places a technology among the work that used it most', () => {
    const layout = createLayout(realModel(), seeded(3));
    const java = layout.nodes.find((node) => node.id === 'tech:java')!;
    // Indra and Liferay: between 2018 and 2023.
    expect(java.homeX).toBeGreaterThan(timeX(2018));
    expect(java.homeX).toBeLessThan(timeX(2023));
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
    expect(el.dataset.mood).not.toBe('stretch');
  });
});
