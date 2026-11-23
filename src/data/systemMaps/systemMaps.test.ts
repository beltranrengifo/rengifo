import { describe, expect, it } from 'vitest';
import { systemMaps } from './index';
import { drawings, glyphs } from '../../components/systemMap/art';
import type { SystemMap, Text } from './types';
import { projects } from '../caseStudies';

const filled = (text: Text | undefined) =>
  !!text && text.en.trim() !== '' && text.es.trim() !== '';

describe.each(Object.entries(systemMaps) as [string, SystemMap][])(
  'system map %s',
  (key, map) => {
    const nodeIds = new Set(map.nodes.map((n) => n.id));
    const zoneIds = new Set(map.zones.map((z) => z.id));
    const hosts = new Set(map.zones.flatMap((z) => z.host ?? []));

    it('is filed under its own id', () => {
      expect(map.id).toBe(key);
    });

    it('has unique ids', () => {
      expect(nodeIds.size).toBe(map.nodes.length);
      expect(zoneIds.size).toBe(map.zones.length);
    });

    it('places every zone and part somewhere real', () => {
      for (const zone of map.zones) {
        if (zone.parent) expect(zoneIds, zone.id).toContain(zone.parent);
        if (zone.host) expect(nodeIds, zone.id).toContain(zone.host);
      }
      for (const node of map.nodes) {
        expect(zoneIds, node.id).toContain(node.zone);
        // A zone's host is drawn as its title; every other part needs a spot.
        if (!hosts.has(node.id)) expect(node.at, node.id).toBeDefined();
      }
    });

    it('keeps every part inside its zone', () => {
      const zoneOf = new Map(map.zones.map((z) => [z.id, z]));
      for (const node of map.nodes) {
        if (!node.at) continue;
        const { box } = zoneOf.get(node.zone)!;
        expect(node.at.x, node.id).toBeGreaterThan(box.x);
        expect(node.at.x, node.id).toBeLessThan(box.x + box.w);
        expect(node.at.y, node.id).toBeGreaterThan(box.y);
        expect(node.at.y, node.id).toBeLessThan(box.y + box.h);
      }
    });

    it('says everything in English and Spanish', () => {
      expect(filled(map.label)).toBe(true);
      expect(filled(map.intro)).toBe(true);
      for (const zone of map.zones)
        expect(filled(zone.label), zone.id).toBe(true);
      for (const node of map.nodes) {
        expect(filled(node.label), node.id).toBe(true);
        expect(filled(node.body), node.id).toBe(true);
        if (node.sub) expect(filled(node.sub), node.id).toBe(true);
        for (const tag of node.tags)
          if (typeof tag !== 'string') expect(filled(tag), node.id).toBe(true);
      }
      for (const edge of map.edges)
        expect(filled(edge.label), `${edge.from}→${edge.to}`).toBe(true);
      for (const walk of map.walkthroughs) {
        expect(filled(walk.title), walk.id).toBe(true);
        for (const step of walk.steps)
          expect(filled(step.caption), walk.id).toBe(true);
      }
    });

    it('draws every part with art that exists', () => {
      for (const node of map.nodes) {
        expect(glyphs[node.glyph], node.id).toBeDefined();
        if (node.drawing) expect(drawings[node.drawing], node.id).toBeDefined();
      }
    });

    it('wires only parts that exist, once each', () => {
      const seen = new Set<string>();
      for (const edge of map.edges) {
        expect(nodeIds, edge.from).toContain(edge.from);
        expect(nodeIds, edge.to).toContain(edge.to);
        expect(edge.from).not.toBe(edge.to);
        const pair = [edge.from, edge.to].sort().join('|');
        expect(seen, pair).not.toContain(pair);
        seen.add(pair);
      }
    });

    it('bundles only wires that exist', () => {
      for (const bundle of map.bundles ?? []) {
        const zoneOf = new Map(map.nodes.map((n) => [n.id, n.zone]));
        const some = map.edges.some(
          (e) =>
            (e.from === bundle.from && zoneOf.get(e.to) === bundle.zone) ||
            (e.to === bundle.from && zoneOf.get(e.from) === bundle.zone),
        );
        expect(some, `${bundle.from} → ${bundle.zone}`).toBe(true);
      }
    });

    it('walks only through parts that exist, along real wires', () => {
      for (const walk of map.walkthroughs) {
        expect(walk.steps.length, walk.id).toBeGreaterThan(0);
        for (const step of walk.steps) {
          expect(step.nodes.length, walk.id).toBeGreaterThan(0);
          for (const id of step.nodes) expect(nodeIds, walk.id).toContain(id);

          // A step's parts hang together: each one is wired to another.
          if (step.nodes.length > 1)
            for (const id of step.nodes) {
              const wired = map.edges.some(
                (e) =>
                  (e.from === id && step.nodes.includes(e.to)) ||
                  (e.to === id && step.nodes.includes(e.from)),
              );
              expect(wired, `${walk.id}: ${id}`).toBe(true);
            }
        }
      }
    });

    it('names only real parts, zones and pages in its extras', () => {
      if (map.offline) {
        expect(filled(map.offline.note)).toBe(true);
        if (map.offline.label) expect(filled(map.offline.label)).toBe(true);
        if (map.offline.glyph) expect(glyphs[map.offline.glyph]).toBeDefined();
        for (const id of map.offline.keep) expect(nodeIds, id).toContain(id);
        for (const id of map.offline.lose) expect(zoneIds, id).toContain(id);
      }
      for (const bundle of map.bundles ?? []) {
        expect(nodeIds).toContain(bundle.from);
        expect(zoneIds).toContain(bundle.zone);
        if (bundle.trunk) expect(zoneIds).toContain(bundle.trunk);
      }
      const pages = new Set(
        projects.filter((p) => p.page !== false).map((p) => p.slug),
      );
      for (const node of map.nodes)
        if (node.caseStudy) expect(pages, node.id).toContain(node.caseStudy);
    });

    it('keeps the house private', () => {
      const text = JSON.stringify(map).toLowerCase();
      for (const secret of [
        'perico',
        'primo',
        'hetzner',
        '192.168',
        '100.',
        '€',
        'rengifo.dev',
        '.ts.net',
        'tailf6f411',
        'falkenstein',
        'cax31',
        'pi3',
        'b2-backups',
        'database-backup',
        ':5432',
        ':3001',
        ':8000',
      ])
        expect(text, secret).not.toContain(secret);
    });

    it('grows only parts drawn as many', () => {
      const many = new Set(map.nodes.filter((n) => n.many).map((n) => n.id));
      for (const walk of map.walkthroughs)
        for (const step of walk.steps)
          for (const id of step.grows ?? []) {
            expect(many, `${walk.id}: ${id}`).toContain(id);
            expect(step.nodes, `${walk.id}: ${id}`).toContain(id);
          }
    });
  },
);

// The infrastructure map stands for every app at once: none is ever named,
// so it holds however many there are.
describe('the infrastructure map', () => {
  const text = JSON.stringify(systemMaps.infrastructure).toLowerCase();

  it.each([
    'Radio Perico',
    'Ensayadero',
    'PaellaLab',
    'Paella Lab',
    'Tartaytantas',
    'La Casa Estudio',
    'Assisted Review',
    'Gorraplanistas',
    'Tablux',
    'Ca Na Llum',
    'bandlab',
    'meteo',
  ])('never names %s', (name) => {
    expect(text).not.toContain(name.toLowerCase());
  });

  it('shows the instances and the frontends as many, unnamed', () => {
    const many = systemMaps.infrastructure.nodes.filter((n) => n.many);
    expect(many.map((n) => n.id).sort()).toEqual(['frontends', 'supabase']);
  });
});
