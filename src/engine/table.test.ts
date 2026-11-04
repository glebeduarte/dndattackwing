import { describe, expect, it } from 'vitest';
import creatures from '../data/creatures.json';
import type { Unit } from './opponent';
import { applyManeuver, band, baseDistance, inArc, moveOnTable, offBoard, planOnTable, sizeOf } from './table';

const mk = (uid: number, side: 'ai' | 'me', id: string): Unit => {
  const c = (creatures as any[]).find((x) => x.uid === uid);
  return { id, side, uid, name: c.name, level: c.level, attack: c.attack, agility: c.agility, health: c.health, armor: c.armor, flyer: c.flyer, movement: c.movement, attacks: c.primary_attacks, actions: c.actions, upgrades: [], dmg: 0, crit: 0, alive: true, air: c.flyer, tokens: {}, base: c.base };
};
const r = () => 0.5;

describe('mesa', () => {
  it('reta 2 avança 8 cm mais a base', () => {
    const q = applyManeuver({ x: 450, y: 450, a: 0 }, { speed: 2, col: 2 }, 41).pose;
    expect(Math.round(450 - q.y)).toBe(80 + 41);
    expect(q.a).toBe(0);
  });
  it('curva à direita termina virada para o leste', () => {
    expect(applyManeuver({ x: 450, y: 450, a: 0 }, { speed: 1, col: 4 }, 41).pose.a).toBe(90);
  });
  it('mede alcance entre bordas e arco', () => {
    const d = baseDistance({ x: 100, y: 100, a: 0 }, 41, { x: 100, y: 241, a: 0 }, 41);
    expect(Math.round(d)).toBe(100);
    expect(band(d)).toBe(2);
    expect(inArc({ x: 100, y: 300, a: 0 }, { x: 100, y: 100, a: 0 }, 41, 'F')).toBe(true);
  });
  it('a IA vira para o inimigo e não sai da mesa', () => {
    const ai = mk(101, 'ai', 'a'), me = mk(105, 'me', 'b');
    const poses = { a: { x: 450, y: 300, a: 180 }, b: { x: 200, y: 330, a: 90 } };
    const m = planOnTable(ai, [ai, me], poses, r)!;
    expect(m.col === 3 || m.col === 4 || m.col === 5).toBe(true); // virada para o sul, o inimigo a oeste fica à direita dela
    const edge = { a: { x: 450, y: 170, a: 0 }, b: { x: 450, y: 800, a: 0 } };
    const m2 = planOnTable(ai, [ai, me], edge, r)!;
    expect(offBoard(moveOnTable(ai, m2, edge, [ai, me]).pose, sizeOf(ai))).toBe(false);
  });
});
