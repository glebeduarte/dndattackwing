import { describe, expect, it } from 'vitest';
import creatures from '../data/creatures.json';
import { chooseManeuver, chooseTarget, resolveDamage, turnOrder, type Unit } from './opponent';

const mk = (uid: number, side: 'ai' | 'me', id: string): Unit => {
  const c = (creatures as any[]).find((x) => x.uid === uid);
  return { id, side, uid, name: c.name, level: c.level, attack: c.attack, agility: c.agility, health: c.health, armor: c.armor, flyer: c.flyer, movement: c.movement, attacks: c.primary_attacks, actions: c.actions, upgrades: [], dmg: 0, crit: 0, alive: true, air: c.flyer, tokens: {} };
};
const fixed = () => 0.5;

describe('IA adversária', () => {
  it('vira para o lado do inimigo', () => {
    const b = mk(101, 'ai', 'a');
    expect(chooseManeuver(b, { dir: 'L', dist: 3, edge: 'none' }, fixed)!.col).toBeLessThanOrEqual(1);
    expect(chooseManeuver(b, { dir: 'R', dist: 3, edge: 'none' }, fixed)!.col).toBeGreaterThanOrEqual(3);
    expect(chooseManeuver(b, { dir: 'F', dist: 4, edge: 'none' }, fixed)!.col).toBe(2);
  });
  it('evita sair pela borda à frente', () => {
    const m = chooseManeuver(mk(101, 'ai', 'a'), { dir: 'F', dist: 4, edge: 'F' }, fixed)!;
    expect(m.col === 2 && m.speed >= 2).toBe(false);
  });
  it('não faz manobra vermelha exausta', () => {
    const u = mk(101, 'ai', 'a'); u.tokens.exhausted = true;
    for (const dir of ['F', 'L', 'R', 'B', 'FL', 'FR'] as const) expect(chooseManeuver(u, { dir, dist: 2, edge: 'none' }, fixed)!.color).not.toBe('r');
  });
  it('esquivas cancelam acertos antes de críticos e a armadura para acertos', () => {
    expect(resolveDamage(3, 1, 1, 1)).toMatchObject({ normal: 1, crit: 1, blocked: 1 });
    expect(resolveDamage(1, 2, 2, 3)).toMatchObject({ normal: 0, crit: 1 });
  });
  it('escolhe o alvo mais ferido ao alcance', () => {
    const ai = mk(101, 'ai', 'a');
    const e1 = mk(103, 'me', 'e1'); const e2 = mk(105, 'me', 'e2'); e2.dmg = 4;
    const pick = chooseTarget(ai, [e1, e2], { e1: { range: 1, arc: 'F' }, e2: { range: 2, arc: 'F' } });
    expect(pick?.target.id).toBe('e2');
    expect(chooseTarget(ai, [e1], { e1: { range: 4, arc: 'F' } })).toBeNull();
  });
  it('ordem por nível com desempate pela iniciativa', () => {
    const a = mk(101, 'ai', 'a'); const b = mk(101, 'me', 'b');
    expect(turnOrder([a, b], 'ativacao', 'me')[0].id).toBe('b');
    expect(turnOrder([a, b], 'combate', 'ai')[0].id).toBe('a');
  });
});

import upgrades from '../data/upgrades.json';
import { parseSpecial, planAttack } from './opponent';
const up = (uid: number) => (upgrades as any[]).find((x) => x.uid === uid);
describe('ataques de melhoria', () => {
  it('lê o Fire Breath como cone com a arma primária', () => {
    const s = parseSpecial(up(108))!;
    expect(s).toMatchObject({ kind: 'attack', dice: 'pwv', area: 'Cone', range: 3, arc: 'F', dts: 3 });
  });
  it('lê o Magic Missile como dano fixo que exige Alvo', () => {
    expect(parseSpecial(up(119))).toMatchObject({ fixed: 1, needs: 'target', arc: '360' });
  });
  it('usa o sopro quando ele pega duas criaturas', () => {
    const ai = mk(101, 'ai', 'a'); ai.specials = [parseSpecial(up(108))!];
    const e1 = mk(103, 'me', 'e1'), e2 = mk(105, 'me', 'e2');
    const plan = planAttack(ai, [e1, e2], { e1: { range: 2, arc: 'F' }, e2: { range: 3, arc: 'F' } })!;
    expect(plan.label).toBe('Fire Breath');
    expect(plan.targets).toHaveLength(2);
  });
  it('o sopro em recarga não é usado', () => {
    const ai = mk(101, 'ai', 'a'); const s = parseSpecial(up(108))!; s.ready = 2; ai.specials = [s];
    const plan = planAttack(ai, [mk(103, 'me', 'e1')], { e1: { range: 2, arc: 'F' } })!;
    expect(plan.label).not.toBe('Fire Breath');
  });
});
