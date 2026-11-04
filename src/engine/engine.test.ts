import { describe, expect, it } from 'vitest';
import creatures from '../data/creatures.json';
import upgrades from '../data/upgrades.json';
import { buildCatalog, Legion, Upgrade, encodeLegion, loadLegionFromCode } from './engine';
import type { CreatureData, UpgradeData } from './types';

const catalog = buildCatalog(creatures as unknown as CreatureData[], upgrades as unknown as UpgradeData[]);
const C = (name: string) => catalog.creatures.find((c) => c.name === name)!;
const U = (name: string) => catalog.upgrades.find((u) => u.name === name)!;

function legionWith(name: string) {
  const l = new Legion();
  expect(l.addCreature(C(name))).toBeNull();
  return { l, c: l.creatures[0] };
}

describe('custos', () => {
  it('Acid Breath em Balagos custa 10 (PWV 5 + 5 por não ser Acid)', () => {
    const { l, c } = legionWith('Balagos');
    expect(new Upgrade(U('Acid Breath')).costForCreature(c, l)).toBe(10);
    expect(new Upgrade(U('Fire Breath')).costForCreature(c, l)).toBe(5);
  });

  it('o custo total da legião soma criatura e upgrades', () => {
    const { l, c } = legionWith('Balagos');
    expect(l.equip(c, U('Fire Breath'))).toBeNull();
    expect(l.totalCost()).toBe(42 + 5);
    expect(l.totalCards()).toBe(2);
  });
});

describe('legalidade', () => {
  it('upgrade único só entra uma vez na legião', () => {
    const l = new Legion();
    l.addCreature(C('Red Dragon'));
    l.addCreature(C('Red Dragon'));
    const unique = catalog.upgrades.find((u) => u.unique && u.upgrade === 'Dragon' && !u.restriction?.length && !u.artifact)!;
    expect(l.equip(l.creatures[0], unique)).toBeNull();
    expect(l.equip(l.creatures[1], unique)).not.toBeNull();
  });

  it('criatura única não repete', () => {
    const l = new Legion();
    expect(l.addCreature(C('Balagos'))).toBeNull();
    expect(l.addCreature(C('Balagos'))).not.toBeNull();
  });

  it('não equipa o mesmo upgrade duas vezes na mesma criatura', () => {
    const { l, c } = legionWith('Red Dragon');
    expect(l.equip(c, U('Fire Breath'))).toBeNull();
    expect(l.equip(c, U('Fire Breath'))).not.toBeNull();
  });
});

describe('comandos', () => {
  it('Pearl of Power cria dois slots Arcane e só sai com eles vazios', () => {
    const target = catalog.creatures.find((c) => {
      const l = new Legion();
      l.addCreature(c);
      return l.canCreatureEquipUpgrade(l.creatures[0], new Upgrade(U('Pearl of Power')));
    })!;
    const { l, c } = legionWith(target.name);
    const before = c.upgrades.length;
    expect(l.equip(c, U('Pearl of Power'))).toBeNull();
    expect(c.upgrades.length).toBe(before + 2);
    const pearl = c.equippedUpgrades().find((u) => u.name === 'Pearl of Power')!;
    expect(c.unequipUpgrade(pearl, l)).toBeNull();
    expect(c.upgrades.length).toBe(before);
  });

  it('Corruption dá um marcador Evil que muda o alinhamento de uma criatura', () => {
    const l = new Legion();
    const good = catalog.creatures.find((c) => c.alignment === 'Good' && !c.unique)!;
    l.addCreature(good);
    const host = l.creatures[0];
    const corruption = new Upgrade(U('Corruption'));
    const holder = catalog.creatures.find((c) => {
      const t = new Legion();
      t.addCreature(c);
      return t.canCreatureEquipUpgrade(t.creatures[0], corruption);
    })!;
    l.addCreature(holder);
    expect(l.equip(l.creatures[1], U('Corruption'))).toBeNull();
    expect(l.tokens.Evil).toBe(1);
    expect(l.makeEvil(host)).toBeNull();
    expect(host.alignment).toBe('Evil');
    expect(l.tokens.Evil).toBe(0);
    expect(l.removeCreature(host)).not.toBeNull();
    expect(l.restoreAlignment(host)).toBeNull();
    expect(l.removeCreature(host)).toBeNull();
  });
});

describe('link', () => {
  it('lê o código no formato do site original', () => {
    const { legion, problems } = loadLegionFromCode('MTAxOjEwNzowOjA6MA==', catalog);
    expect(problems).toEqual([]);
    expect(legion.creatures[0].name).toBe('Balagos');
    expect(legion.creatures[0].equipped[0]?.name).toBe('Acid Breath');
    expect(legion.totalCost()).toBe(52);
  });

  it('ida e volta preserva a legião', () => {
    const { l, c } = legionWith('Balagos');
    l.equip(c, U('Acid Breath'));
    const again = loadLegionFromCode(encodeLegion(l), catalog);
    expect(again.legion.totalCost()).toBe(l.totalCost());
  });
});

describe('varredura completa', () => {
  it('equipa e remove todo upgrade legal em toda criatura sem erro e sem perder slots', () => {
    let equipped = 0;
    for (const cd of catalog.creatures) {
      for (const ud of catalog.upgrades) {
        const l = new Legion();
        l.addCreature(cd);
        const c = l.creatures[0];
        const slots = c.upgrades.length;
        if (!l.canCreatureEquipUpgrade(c, new Upgrade(ud))) continue;
        const err = l.equip(c, ud);
        expect(err, `${ud.name} em ${cd.name}`).toBeNull();
        equipped++;
        expect(l.removeCreature(c), `remover ${cd.name} com ${ud.name}`).toBeNull();
        expect(c.upgrades.length, `slots de ${cd.name} após ${ud.name}`).toBe(slots);
      }
    }
    expect(equipped).toBeGreaterThan(5000);
  });
});
