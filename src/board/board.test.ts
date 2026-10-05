import { describe, expect, it } from 'vitest';
import { techs, projectSpans } from '../data/board';
import { experience } from '../data/experience';
import { projects } from '../data/caseStudies';
import { buildModel, yearOf } from './model';
import { envelope, level } from './spectrum';
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

describe('spectrum', () => {
  it('reads months, and bare years as mid-year', () => {
    expect(yearOf('2021-06')).toBeCloseTo(2021 + 5 / 12);
    expect(yearOf('2018')).toBe(2018.5);
  });

  it('swells in, holds, and fades without going silent', () => {
    expect(envelope(2009, 2010, 2012)).toBe(0);
    expect(envelope(2011, 2010, 2012)).toBe(1);
    const later = envelope(2016, 2010, 2012);
    expect(later).toBeGreaterThan(0.1);
    expect(later).toBeLessThan(0.4);
  });

  it('makes React loud at Mews and quiet before it was used', () => {
    const model = realModel();
    const react = model.tracks.find((track) => track.id === 'react')!;
    expect(level(model, react, 2025)).toBeGreaterThan(2.5);
    expect(level(model, react, 2010)).toBe(0);
  });

  it('keeps side projects quieter than the job running at the same time', () => {
    const model = realModel();
    const python = model.tracks.find((track) => track.id === 'python')!;
    const typescript = model.tracks.find((t) => t.id === 'typescript')!;
    expect(level(model, python, 2026.5)).toBeLessThan(
      level(model, typescript, 2026.3),
    );
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
