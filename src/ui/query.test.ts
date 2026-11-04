import { expect, it } from 'vitest';
import creatures from '../data/creatures.json';
import upgrades from '../data/upgrades.json';
import { matches, parseQuery } from './query';

const C = creatures as any[];
const U = upgrades as any[];
const hay = (d: any) => [d.name, d.classtype, d.text, d.special, ...(d.identifiers ?? [])].join(' ');
const run = (list: any[], q: string) => list.filter((d) => matches(d, parseQuery(q, hay)));

it('filtra criaturas por campos, números e palavras', () => {
  const r = run(C, 'nivel>=8 voa alinhamento:mau');
  expect(r.length).toBeGreaterThan(0);
  for (const c of r) {
    expect(c.level).toBeGreaterThanOrEqual(8);
    expect(c.flyer).toBe(true);
    expect(c.alignment).toBe('Evil');
  }
  expect(run(C, 'tipo:dragon -unica').every((c) => !c.unique)).toBe(true);
  expect(run(C, 'slot:arcano').every((c) => c.upgrades.includes('Arcane'))).toBe(true);
  expect(run(C, 'balagos').map((c) => c.name)).toContain('Balagos');
  expect(run(C, '"red dragon"').length).toBeGreaterThan(0);
});

it('filtra upgrades', () => {
  const r = run(U, 'slot:dragao custo<=4 elemento:fogo');
  expect(r.length).toBeGreaterThan(0);
  for (const u of r) {
    expect(u.upgrade).toBe('Dragon');
    expect(u.element).toBe('Fire');
    expect(Number(u.cost)).toBeLessThanOrEqual(4);
  }
  expect(run(U, 'artefato').every((u) => u.artifact)).toBe(true);
});
