import { describe, expect, it } from 'vitest';
import creatures from '../data/creatures.json';
import upgrades from '../data/upgrades.json';
import { buildCatalog, encodeLegion, loadLegionFromCode } from './engine';
import { generateLegions, type Style } from './generator';
import type { CreatureData, UpgradeData } from './types';

const catalog = buildCatalog(creatures as unknown as CreatureData[], upgrades as unknown as UpgradeData[]);
const base = { alignment: 'qualquer' as const, element: '', dragonsOnly: false, sets: null, initiative: false };

describe('gerador', () => {
  for (const style of ['elite', 'equilibrada', 'enxame'] as Style[]) {
    for (const points of [60, 120, 200]) {
      it(`${style} em ${points} pts gera legiões legais e reproduzíveis`, () => {
        const t = Date.now();
        const out = generateLegions(catalog, { ...base, style, points, seed: 7 });
        const ms = Date.now() - t;
        expect(out.length).toBeGreaterThan(0);
        for (const g of out) {
          expect(g.total).toBeLessThanOrEqual(points);
          const again = loadLegionFromCode(encodeLegion(g.legion), catalog);
          expect(again.problems, encodeLegion(g.legion)).toEqual([]);
          expect(again.legion.totalCost()).toBe(g.total);
        }
        expect(out[0].total).toBeGreaterThanOrEqual(points - 8);
        const again = generateLegions(catalog, { ...base, style, points, seed: 7 });
        expect(encodeLegion(again[0].legion)).toBe(encodeLegion(out[0].legion));
        console.log(style, points, ms + 'ms', out.map((g) => `${g.total}: ${g.legion.creatures.map((c) => c.name + '(' + c.equippedUpgrades().length + ')').join(', ')}`).join(' | '));
      }, 30000);
    }
  }
  it('respeita alinhamento e só dragões', () => {
    const out = generateLegions(catalog, { ...base, style: 'equilibrada', points: 200, seed: 3, alignment: 'Good', dragonsOnly: true });
    for (const g of out) for (const c of g.legion.creatures) {
      expect(c.alignment).toBe('Good');
      expect(c.identifiers).toContain('Dragon');
    }
  });
});

describe('perfil', () => {
  it('a história puxa as criaturas citadas', () => {
    const out = generateLegions(catalog, { points: 120, style: 'equilibrada', alignment: 'qualquer', element: '', dragonsOnly: false, sets: null, initiative: false, seed: 7, profile: { story: 'mortos-vivos e espectros', focus: [] } }, 40, 1);
    const names = out[0].legion.creatures.map((c) => c.classtype).join(' ');
    expect(/Undead|Wraith|Dracolich/.test(names)).toBe(true);
  });
  it('foco em tropas traz tropas', () => {
    const out = generateLegions(catalog, { points: 120, style: 'equilibrada', alignment: 'qualquer', element: '', dragonsOnly: false, sets: null, initiative: false, seed: 3, profile: { focus: ['tropa'] } }, 40, 1);
    expect(out[0].legion.creatures.filter((c) => c.identifiers.includes('Troop')).length).toBeGreaterThan(0);
  });
});
