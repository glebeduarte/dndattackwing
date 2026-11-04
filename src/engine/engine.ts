// Motor de regras do Legion Builder, portado da especificação docs/captura/02-motor-de-regras.md.
// As classes são mutáveis, como no original; a camada de estado (store.ts) avisa a interface após cada mudança.

import type { Alignment, CreatureData, Rule, UpgradeData } from './types';

export const ENUM_ALIGNMENTS = ['Good', 'Evil', 'Neutral'] as const;
export const ENUM_ELEMENTS = ['Acid', 'Cold', 'Disease', 'Fire', 'Lightning', 'Negative', 'Poison', 'Positive', 'Thunder'] as const;
export const ENUM_ACTIONS = ['Charge', 'Concentrate', 'Dodge', 'Feint', 'Target'] as const;
export const ENUM_UPGRADES = ['Arcane', 'Divine', 'Dragon', 'Equipment', 'Heroic', 'Monster', 'Universal'] as const;
export const PRINT_SLOT_ABBR: Record<string, string> = {
  Dragon: 'Dr', Monster: 'M', Heroic: 'H', Equipment: 'E', Arcane: 'A', Divine: 'Di', Universal: '*',
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const contains = (hay: string | null | undefined, needle: string) => !!hay && hay.indexOf(needle) > -1;
const toInt = (v: unknown) => {
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
};
const inRange = (v: number, p: { min?: number | string; max?: number | string }) =>
  (p.min === undefined || p.min === null || v >= Number(p.min)) &&
  (p.max === undefined || p.max === null || v <= Number(p.max));

/* ------------------------------------------------------------------ */
/* Filtros de upgrade usados por comandos instalados na criatura       */
/* ------------------------------------------------------------------ */

type UpgradeFilter = (u: Upgrade, params: any) => boolean;

export const UPGRADE_FILTERS: Record<string, UpgradeFilter> = {
  upgrade_attribute: (u, p) => !!p && (u as any)[p.attribute] === p.required,
  upgrade_class: (u, p) => !!p && contains(u.classtype, p.required),
  dragon_special_or_combat: (u) =>
    u.upgrade === 'Dragon' && (contains(u.classtype, 'Special') || contains(u.classtype, 'Combat')),
};

/* ------------------------------------------------------------------ */
/* Restrições                                                          */
/* ------------------------------------------------------------------ */

type RestrictionFn = (u: Upgrade, c: Creature, params: any) => boolean;

function gear(u: Upgrade, c: Creature) {
  return [u, ...c.equippedUpgrades().filter((e) => e !== u)];
}

export const RESTRICTIONS: Record<string, RestrictionFn> = {
  identifier(u, c, p) {
    if (!p) return true;
    if (c.hasPrimaryIdentifier(p.required)) return true;
    if (c.hasAlternateIdentifier(p.required, u, p)) {
      c.upgrade_uses_alt_id[u.uid] = true;
      return true;
    }
    return false;
  },
  class_type: (_u, c, p) => !p || contains(c.classtype, p.required),
  creature_name: (_u, c, p) => !p || c.name === p.required,
  creature_armor: (_u, c, p) => !p || inRange(c.armor, p),
  creature_level: (_u, c, p) => !p || inRange(c.level, p),
  creature_min_max(_u, c, p) {
    if (!p) return true;
    const v = parseInt(String((c as any)[p.attribute]), 10);
    return Number.isNaN(v) ? true : inRange(v, p);
  },
  alignment: (_u, c, p) => !p || c.alignment === p.required,
  unique: (_u, c, p) => !p || c.unique === p.required,
  base(_u, c, p) {
    if (!p) return true;
    if (!p.required) return false;
    return c.base === p.required || (p.required === 'Large' && c.base === 'Huge');
  },
  flyer: (_u, c, p) => !p || c.flyer === p.required,
  upgrade_bar: (_u, c, p) => !p || c.upgrades.includes(p.required),
  action_bar: (_u, c, p) => !p || c.actions.includes(p.required),
  upgrade_equipped(u, c, p) {
    if (!p) return true;
    const dep = c.equippedUpgrades().find((e) => e !== u && contains(e.classtype, p.required));
    if (!dep) return false;
    c.upgrade_equip_depends_on[u.uid] = dep.uid;
    return true;
  },
  no_weapon: (u, c) => !u.isWeapon() && !c.equippedUpgrades().some((e) => e !== u && e.isWeapon()),
  not(u, c, p) {
    if (!p || !RESTRICTIONS[p.func]) return false;
    return !RESTRICTIONS[p.func](u, c, p.params);
  },
  or(u, c, p) {
    if (!Array.isArray(p) || p.length === 0) return true;
    return p.some((r: Rule) => !!RESTRICTIONS[r.func] && RESTRICTIONS[r.func](u, c, r.params));
  },
  restrict_creature(u, c, p) {
    if (!p || !RESTRICTIONS[p.restrict]) return true;
    const ok = RESTRICTIONS[p.restrict](u, c, p);
    if (ok) u.post_equip_func = { func: p.restrict, params: p };
    return ok;
  },
  // Sub-regras chamadas por restrict_creature e guardadas em equip_restrict.
  two_hands: (u, c) =>
    gear(u, c).reduce((n, e) => n + (e.isTwoHandedWeapon() ? 2 : e.isWeapon() || e.isShield() ? 1 : 0), 0) <= 2,
  one_armor: (u, c) => gear(u, c).filter((e) => e.isArmor()).length <= 1,
  one_weapon: (u, c) => gear(u, c).filter((e) => e.isWeapon() || e.isShield()).length <= 1,
  one_weapon_shield: (u, c) => gear(u, c).filter((e) => e.isWeapon()).length <= 1,
  shield: (u, c) => gear(u, c).filter((e) => e.isShield() || e.isTwoHandedWeapon()).length <= 1,
  forbid_name: (u, c, p) => !p || gear(u, c).filter((e) => e.name === p.name).length === 0,
  forbid_class: (u, c, p) => !p || gear(u, c).filter((e) => contains(e.classtype, p.class)).length <= 1,
};

export function processRestrictions(u: Upgrade, list: Rule[] | null | undefined, c: Creature): boolean {
  if (!c) return false;
  if (!list || list.length === 0) return true;
  return list.every((r) => !RESTRICTIONS[r.func] || RESTRICTIONS[r.func](u, c, r.params));
}

/* ------------------------------------------------------------------ */
/* Custos                                                              */
/* ------------------------------------------------------------------ */

type UpgradeCostFn = (u: Upgrade, c: Creature, p: any) => number;

export const UPGRADE_COST_SPECIAL: Record<string, UpgradeCostFn> = {
  pwv: (_u, c, p) => c.attack + toInt(p?.add),
  dragon_element: (_u, c, p) => (!p ? 0 : c.isElement(p.required) ? 0 : toInt(p.penalty)),
  identifier: (u, c, p) =>
    !p ? 0 : c.hasPrimaryIdentifier(p.required) || c.hasAlternateIdentifier(p.required, u, p) ? 0 : toInt(p.penalty),
  class_type: (_u, c, p) => (!p ? 0 : contains(c.classtype, p.required) ? 0 : toInt(p.penalty)),
  red_maneuvers: (_u, c, p) => (c.movement?.flight ? toInt(c.movement.flight.reds) : 0) + toInt(p?.basecost),
  base_armor: (_u, c, p) => (!p ? 0 : c.baseArmorWithUpgrades() * (p.multiplier ?? 1)),
  base_attribute: (_u, c, p) => (!p ? 0 : toInt((c as any)[p.attribute]) + toInt(p.add)),
};

type CreatureCostFn = (c: Creature, u: Upgrade, p: any) => number;

export const CREATURE_COST_SPECIAL: Record<string, CreatureCostFn> = {
  slot_master(_c, u, p) {
    if (!p) return 0;
    if (p.exclude !== undefined && p.exclude === u.uid) return 0;
    if (p.class && !contains(u.classtype, p.class)) return 0;
    return p.type === u.upgrade && p.modifier ? toInt(p.modifier) : 0;
  },
  name_master: (_c, u, p) => (p && p.name === u.name ? toInt(p.modifier) : 0),
  wealth_of_ancients_discount(c, u, p) {
    if (!p || !u.artifact) return 0;
    if ((c.wealthOfAncients === null) && p.type === u.upgrade) return toInt(p.modifier);
    if (c.wealthOfAncients === u.uid) return toInt(p.modifier);
    return 0;
  },
};

/* ------------------------------------------------------------------ */
/* Comandos de equipar (EquipCommand)                                  */
/* ------------------------------------------------------------------ */

export interface Ctx {
  creature: Creature;
  upgrade: Upgrade;
  legion: Legion;
}

export interface Command {
  name: string;
  uid?: number;
  params: any;
  error: string | null;
  active: boolean;
  remove?: boolean;
  data: Record<string, any>;
  test?(ctx: Ctx, undoing: boolean): boolean;
  filter?(ctx: Ctx): boolean;
  execute(ctx: Ctx): boolean;
  undo?(ctx: Ctx): boolean;
}

type CommandFactory = (cmd: Command) => Partial<Command>;

function baseCommand(name: string, params: any, uid?: number): Command {
  return { name, uid, params, error: null, active: false, data: {}, execute: () => true };
}

const upgradeFilter = (cmd: Command): ((ctx: Ctx) => boolean) => (ctx) => {
  const f = UPGRADE_FILTERS[cmd.params?.func];
  return f ? f(ctx.upgrade, cmd.params) : true;
};

export const COMMANDS: Record<string, CommandFactory> = {
  add_upgrade: (cmd) => ({
    test(ctx, undoing) {
      const num = cmd.params.num ?? 1;
      if (undoing && ctx.creature.numberOpenUpgradeSlotsOfType(cmd.params.type, true) < num) {
        cmd.error = `Libere ${num > 1 ? `${num} slots` : 'o slot'} ${cmd.params.type} antes de remover este upgrade.`;
        return false;
      }
      return true;
    },
    execute(ctx) {
      for (let i = 0; i < (cmd.params.num ?? 1); i++) ctx.creature.addUpgradeSlotOfType(cmd.params.type);
      return true;
    },
    undo(ctx) {
      for (let i = 0; i < (cmd.params.num ?? 1); i++) ctx.creature.removeUpgradeSlotOfType(cmd.params.type);
      return true;
    },
  }),
  add_alternate_element: (cmd) => ({
    execute(ctx) {
      ctx.creature.alternateElements.push(cmd.params.element);
      return true;
    },
    undo(ctx) {
      const i = ctx.creature.alternateElements.indexOf(cmd.params.element);
      if (i > -1) ctx.creature.alternateElements.splice(i, 1);
      return true;
    },
  }),
  add_cost_special: (cmd) => ({
    execute(ctx) {
      ctx.creature.cost_special.push(clone(cmd.params));
      return true;
    },
    undo(ctx) {
      const key = JSON.stringify(cmd.params);
      const i = ctx.creature.cost_special.findIndex((r) => JSON.stringify(r) === key);
      if (i > -1) ctx.creature.cost_special.splice(i, 1);
      return true;
    },
  }),
  add_legion_token: (cmd) => ({
    test(ctx, undoing) {
      const t = cmd.params.token;
      if (undoing && (ctx.legion.tokens[t] ?? 0) < 1) {
        cmd.error = `É preciso ter um marcador ${t} livre para remover este upgrade.`;
        return false;
      }
      return true;
    },
    execute(ctx) {
      ctx.legion.tokens[cmd.params.token] = (ctx.legion.tokens[cmd.params.token] ?? 0) + 1;
      return true;
    },
    undo(ctx) {
      ctx.legion.tokens[cmd.params.token] -= 1;
      return true;
    },
  }),
  add_creature_pre_equip_command: (cmd) => ({
    test(ctx, undoing) {
      if (!undoing) return true;
      const child = ctx.creature.pre_equip_commands.find((c) => c.uid === ctx.upgrade.uid && c.name === cmd.params.func);
      if (child?.test && !child.test(ctx, true)) {
        cmd.error = child.error;
        return false;
      }
      return true;
    },
    execute(ctx) {
      const child = makeCommand(cmd.params.func, cmd.params.params ?? {}, ctx.upgrade.uid);
      child.data.creatureCommand = true;
      ctx.creature.pre_equip_commands.push(child);
      if (child.data.install) child.data.install(ctx);
      return true;
    },
    undo(ctx) {
      const list = ctx.creature.pre_equip_commands;
      const i = list.findIndex((c) => c.uid === ctx.upgrade.uid && c.name === cmd.params.func);
      if (i > -1) {
        const child = list[i];
        if (child.data.uninstall) child.data.uninstall(ctx);
        list.splice(i, 1);
      }
      return true;
    },
  }),
  add_alt_identifiers: (cmd) => ({
    execute(ctx) {
      ctx.creature.altIdentifiers = { identities: cmd.params.identities ?? [], func: cmd.params.func, source: ctx.upgrade.uid };
      const check = makeCommand('check_alt_identifiers', {}, ctx.upgrade.uid);
      ctx.creature.pre_equip_commands.push(check);
      return true;
    },
    undo(ctx) {
      ctx.creature.altIdentifiers = null;
      ctx.creature.pre_equip_commands = ctx.creature.pre_equip_commands.filter(
        (c) => !(c.name === 'check_alt_identifiers' && c.uid === ctx.upgrade.uid),
      );
      return true;
    },
  }),

  // Comandos que vivem na criatura (instalados por add_creature_pre_equip_command).
  add_alternate_slot: (cmd) => ({ filter: upgradeFilter(cmd), execute: () => true }),
  add_own_slot: (cmd) => ({
    filter: upgradeFilter(cmd),
    execute(ctx) {
      // Só cria um slot quando o upgrade não cabe em nenhum slot livre do seu tipo.
      if (ctx.creature.openUpgradeSlotOfType(ctx.upgrade.upgrade) !== null) return true;
      ctx.creature.addUpgradeSlotOfType(ctx.upgrade.upgrade);
      ctx.upgrade.own_slot_from = cmd.uid ?? null;
      ctx.upgrade.post_unequip_commands.push(makeCommand('remove_own_slot', { type: ctx.upgrade.upgrade }));
      return true;
    },
    undo(ctx) {
      // Ao desequipar, quem remove o slot é o remove_own_slot pós-desequipar; aqui só se desfaz um equipar que falhou.
      if (ctx.upgrade.own_slot_from !== cmd.uid || ctx.creature.equipped.includes(ctx.upgrade)) return true;
      ctx.creature.removeUpgradeSlotOfType(ctx.upgrade.upgrade);
      ctx.upgrade.own_slot_from = null;
      ctx.upgrade.post_unequip_commands = ctx.upgrade.post_unequip_commands.filter((c) => c.name !== 'remove_own_slot');
      return true;
    },
  }),
  remove_own_slot: (cmd) => ({
    execute(ctx) {
      if (!ctx.creature.removeUpgradeSlotOfType(cmd.params.type)) {
        cmd.error = `É preciso um slot ${cmd.params.type} livre para remover.`;
        return false;
      }
      cmd.remove = true;
      return true;
    },
  }),
  add_wealth_of_ancients: (cmd) => ({
    data: {
      install(ctx: Ctx) {
        ctx.creature.wealthOfAncients = null;
        ctx.legion.extraArtifacts += 1;
      },
      uninstall(ctx: Ctx) {
        ctx.creature.wealthOfAncients = undefined;
        ctx.legion.extraArtifacts -= 1;
      },
    },
    test(ctx, undoing) {
      if (undoing && ctx.upgrade.uid === cmd.uid && ctx.legion.legionArtifacts().length > 1) {
        cmd.error = 'Não é possível remover com mais de um artefato na legião.';
        return false;
      }
      return true;
    },
    execute(ctx) {
      const u = ctx.upgrade;
      if (u.artifact && u.upgrade === 'Dragon' && ctx.creature.wealthOfAncients === null) {
        ctx.creature.wealthOfAncients = u.uid;
        cmd.data.claimedBy = u.uid;
      }
      return true;
    },
    undo(ctx) {
      if (cmd.data.claimedBy === ctx.upgrade.uid) {
        ctx.creature.wealthOfAncients = null;
        cmd.data.claimedBy = undefined;
      }
      return true;
    },
  }),
  check_alt_identifiers: (cmd) => ({
    execute(ctx) {
      if (ctx.creature.upgrade_uses_alt_id[ctx.upgrade.uid] && cmd.uid !== undefined) {
        ctx.creature.upgrade_equip_depends_on[ctx.upgrade.uid] = cmd.uid;
      }
      return true;
    },
  }),
};

export function makeCommand(name: string, params: any, uid?: number): Command {
  const cmd = baseCommand(name, params, uid);
  const factory = COMMANDS[name];
  if (!factory) {
    cmd.execute = () => {
      cmd.error = `Comando ${name} desconhecido.`;
      return false;
    };
    return cmd;
  }
  const impl = factory(cmd);
  const data = impl.data;
  delete impl.data;
  Object.assign(cmd, impl);
  if (data) Object.assign(cmd.data, data);
  return cmd;
}

/** Processa comandos de forma transacional. Retorna null em caso de sucesso ou a mensagem de erro. */
export function processCommands(cmds: Command[], ctx: Ctx, undoing = false): string | null {
  const done: Command[] = [];
  for (const cmd of cmds) {
    cmd.error = null;
    let ok = !cmd.test || cmd.test(ctx, undoing);
    if (ok) {
      if (undoing) ok = !cmd.undo || cmd.undo(ctx);
      else ok = cmd.filter && !cmd.filter(ctx) ? true : cmd.execute(ctx);
    }
    if (!ok) {
      for (const d of done.reverse()) {
        if (undoing) d.execute(ctx);
        else if (d.undo) d.undo(ctx);
      }
      return cmd.error || 'Erro desconhecido';
    }
    done.push(cmd);
  }
  for (const cmd of cmds) cmd.active = !undoing;
  for (let i = cmds.length - 1; i >= 0; i--) if (cmds[i].remove) cmds.splice(i, 1);
  return null;
}

/* ------------------------------------------------------------------ */
/* Upgrade                                                             */
/* ------------------------------------------------------------------ */

let instanceSeq = 0;

export class Upgrade {
  readonly data: UpgradeData;
  readonly key = ++instanceSeq;
  uid: number;
  name: string;
  classtype: string;
  upgrade: string;
  cost: string;
  unique: boolean;
  artifact: boolean;
  artifactSet?: string;
  restriction: Rule[];
  cost_special: Rule[];
  legion_cost_special: Rule[];
  post_equip_func: { func: string; params: any } | null = null;
  post_unequip_commands: Command[] = [];
  own_slot_from: number | null = null;
  dependsOn: Upgrade[] = [];
  dependedOnBy: Upgrade[] = [];
  private _pre?: Command[];

  constructor(data: UpgradeData) {
    this.data = clone(data);
    this.uid = data.uid;
    this.name = data.name;
    this.classtype = data.classtype ?? '';
    this.upgrade = data.upgrade;
    this.cost = String(data.cost);
    this.unique = !!data.unique;
    this.artifact = !!data.artifact;
    this.artifactSet = data.artifactSet ?? undefined;
    this.restriction = clone(data.restriction ?? []);
    this.cost_special = clone(data.cost_special ?? []);
    this.legion_cost_special = clone(data.legion_cost_special ?? []);
  }

  get element() {
    return this.data.element ?? null;
  }

  baseCost() {
    return this.cost === '*' ? 0 : toInt(this.cost);
  }

  isArmor() {
    return contains(this.classtype, 'Armor');
  }
  isWeapon() {
    return contains(this.classtype, 'Weapon') && !contains(this.classtype, 'Breath Weapon');
  }
  isTwoHandedWeapon() {
    return contains(this.classtype, 'Two-Handed Weapon');
  }
  isShield() {
    return contains(this.classtype, 'Shield');
  }
  isArtifactSet(set: string) {
    return !!this.artifactSet && this.artifactSet === set;
  }

  preEquipCommands(): Command[] {
    if (!this._pre) this._pre = (this.data.equip_special ?? []).map((r) => makeCommand(r.func, r.params ?? {}, this.uid));
    return this._pre;
  }

  hasAlternateSlot(c: Creature): string | null {
    for (const alt of this.data.alternateSlot ?? []) {
      if (processRestrictions(this, alt.restriction, c)) return alt.slot;
    }
    return null;
  }

  creatureCanEquip(c: Creature): boolean {
    if (!processRestrictions(this, this.restriction, c)) return false;
    for (const [uid, r] of Object.entries(c.equip_restrict)) {
      if (Number(uid) === this.uid) continue;
      if (r && RESTRICTIONS[r.func] && !RESTRICTIONS[r.func](this, c, r.params ?? {})) return false;
    }
    return true;
  }

  legionCostModifier(legion: Legion | null): number {
    if (!legion) return 0;
    let mod = 0;
    for (const r of this.legion_cost_special) {
      if (r.func === 'number_of_artifacts') {
        const needle = r.params?.name_contains ?? '';
        const others = legion.legionArtifacts().filter((a) => a !== this && contains(a.name, needle)).length;
        mod += others + 1;
      }
    }
    return mod;
  }

  /** Custo deste upgrade na criatura informada, já com modificadores de criatura e legião. */
  costForCreature(c: Creature, legion: Legion | null): number {
    let total = this.baseCost();
    for (const r of this.cost_special) {
      const f = UPGRADE_COST_SPECIAL[r.func];
      if (f) total += f(this, c, r.params);
    }
    total += c.costModifier(this);
    total += this.legionCostModifier(legion);
    return total;
  }

  isDependedOn() {
    return this.dependedOnBy.length > 0;
  }
}

/* ------------------------------------------------------------------ */
/* Creature                                                            */
/* ------------------------------------------------------------------ */

export class Creature {
  readonly data: CreatureData;
  readonly key = ++instanceSeq;
  uid: number;
  name: string;
  classtype: string;
  identifiers: string[];
  level: number;
  cost: number;
  alignment: Alignment;
  originalAlignment: Alignment | null = null;
  element: string | null;
  attack: number;
  agility: number;
  health: number;
  armor: number;
  flyer: boolean;
  base: string;
  unique: boolean;
  movement: CreatureData['movement'];
  actions: string[];
  upgrades: string[];
  equipped: (Upgrade | null)[];
  cost_special: Rule[];
  alternateElements: string[] = [];
  altIdentifiers: { identities: string[]; func?: string; source: number } | null = null;
  equip_restrict: Record<number, { func: string; params: any }> = {};
  pre_equip_commands: Command[] = [];
  upgrade_uses_alt_id: Record<number, boolean> = {};
  upgrade_equip_depends_on: Record<number, number> = {};
  wealthOfAncients: number | null | undefined = undefined;

  constructor(data: CreatureData) {
    this.data = clone(data);
    this.uid = data.uid;
    this.name = data.name;
    this.classtype = data.classtype ?? '';
    this.identifiers = [...(data.identifiers ?? [])];
    this.level = data.level;
    this.cost = data.cost;
    this.alignment = data.alignment;
    this.element = data.element;
    this.attack = data.attack;
    this.agility = data.agility;
    this.health = data.health;
    this.armor = data.armor;
    this.flyer = !!data.flyer;
    this.base = data.base;
    this.unique = !!data.unique;
    this.movement = clone(data.movement ?? {});
    this.actions = [...(data.actions ?? [])];
    this.upgrades = [...(data.upgrades ?? [])];
    this.equipped = this.upgrades.map(() => null);
    this.cost_special = clone(data.cost_special ?? []);
  }

  get uniqueName() {
    return this.data.uniquename || this.name;
  }

  elementsList(): string[] {
    const list = [this.element, this.data.element2, ...(this.data.elements ?? []), ...this.alternateElements];
    return [...new Set(list.filter((e): e is string => !!e))];
  }

  isElement(el: string) {
    return this.elementsList().includes(el);
  }

  hasPrimaryIdentifier(id: string) {
    return this.identifiers.includes(id);
  }

  hasAlternateIdentifier(id: string, u: Upgrade, params: any) {
    const alt = this.altIdentifiers;
    if (!alt || !alt.identities.includes(id)) return false;
    const f = alt.func ? UPGRADE_FILTERS[alt.func] : undefined;
    return !f || f(u, params);
  }

  equippedUpgrades(): Upgrade[] {
    return this.equipped.filter((e): e is Upgrade => !!e);
  }

  slotMatches(i: number, type: string | null) {
    if (type === null) return false;
    return type === '*' || type === 'Universal' || this.upgrades[i] === type;
  }

  openUpgradeSlotOfType(type: string | null): number | null {
    for (let i = 0; i < this.upgrades.length; i++) if (!this.equipped[i] && this.slotMatches(i, type)) return i;
    return null;
  }

  numberOpenUpgradeSlotsOfType(type: string, strict = false) {
    let n = 0;
    for (let i = 0; i < this.upgrades.length; i++) {
      if (this.equipped[i]) continue;
      if (strict ? this.upgrades[i] === type : this.slotMatches(i, type)) n++;
    }
    return n;
  }

  addUpgradeSlotOfType(type: string) {
    this.upgrades.push(type);
    this.equipped.push(null);
  }

  removeUpgradeSlotOfType(type: string): boolean {
    for (let i = this.upgrades.length - 1; i >= 0; i--) {
      if (this.upgrades[i] === type && !this.equipped[i]) {
        this.upgrades.splice(i, 1);
        this.equipped.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  slotContainingUpgrade(u: Upgrade): number {
    return this.equipped.findIndex((e) => !!e && (e === u || e.name === u.name));
  }

  alternateSlotCommandFor(u: Upgrade): Command | null {
    const ctx = { creature: this, upgrade: u } as unknown as Ctx;
    return this.pre_equip_commands.find((c) => c.name === 'add_alternate_slot' && (!c.filter || c.filter(ctx))) ?? null;
  }

  upgradeAddsOwnSlot(u: Upgrade): Command | null {
    const ctx = { creature: this, upgrade: u } as unknown as Ctx;
    return this.pre_equip_commands.find((c) => c.name === 'add_own_slot' && (!c.filter || c.filter(ctx))) ?? null;
  }

  canEquipUpgrade(u: Upgrade): boolean {
    if (!u) return false;
    if (this.slotContainingUpgrade(u) > -1) return false;
    const fits =
      this.openUpgradeSlotOfType(u.upgrade) !== null ||
      this.openUpgradeSlotOfType(u.hasAlternateSlot(this)) !== null ||
      this.openUpgradeSlotOfType(this.alternateSlotCommandFor(u)?.params?.slot ?? null) !== null ||
      !!this.upgradeAddsOwnSlot(u);
    return fits && u.creatureCanEquip(this);
  }

  costModifier(u: Upgrade): number {
    let mod = 0;
    for (const r of this.cost_special) {
      const f = CREATURE_COST_SPECIAL[r.func];
      if (f) mod += f(this, u, r.params);
    }
    return mod;
  }

  baseArmorWithUpgrades(): number {
    let armor = this.armor;
    for (const u of this.equippedUpgrades()) if (u.data.armorMod?.base !== undefined) armor = u.data.armorMod.base;
    for (const u of this.equippedUpgrades()) if (u.data.armorMod?.add !== undefined) armor += u.data.armorMod.add;
    return armor;
  }

  hasArtifactEquipped() {
    return this.equippedUpgrades().some((u) => u.artifact);
  }

  upgradesCost(legion: Legion | null) {
    return this.equippedUpgrades().reduce((s, u) => s + u.costForCreature(this, legion), 0);
  }

  totalCost(legion: Legion | null) {
    return this.cost + this.upgradesCost(legion);
  }

  /** Equipa um upgrade novo. Retorna null em caso de sucesso, ou a mensagem de erro. */
  equipUpgrade(u: Upgrade, legion: Legion): string | null {
    if (!this.canEquipUpgrade(u)) return `${u.name} não pode ser equipado em ${this.name}.`;
    const ctx: Ctx = { creature: this, upgrade: u, legion };

    let err = processCommands(u.preEquipCommands(), ctx, false);
    if (err) return err;
    err = processCommands(this.pre_equip_commands, ctx, false);
    if (err) {
      processCommands(u.preEquipCommands(), ctx, true);
      return err;
    }

    let slot = this.openUpgradeSlotOfType(u.upgrade);
    let depUid: number | undefined;
    if (slot === null) slot = this.openUpgradeSlotOfType(u.hasAlternateSlot(this));
    if (slot === null) {
      const alt = this.alternateSlotCommandFor(u);
      if (alt) {
        slot = this.openUpgradeSlotOfType(alt.params.slot);
        depUid = alt.uid;
      }
    }
    if (slot === null) {
      processCommands(this.pre_equip_commands, ctx, true);
      processCommands(u.preEquipCommands(), ctx, true);
      return `Não há slot livre para ${u.name}.`;
    }
    if (u.own_slot_from !== null) depUid = u.own_slot_from;

    this.equipped[slot] = u;
    const deps = [this.upgrade_equip_depends_on[u.uid], depUid].filter((d): d is number => d !== undefined);
    for (const d of deps) {
      const src = this.equippedUpgrades().find((e) => e.uid === d && e !== u);
      if (src && !u.dependsOn.includes(src)) {
        u.dependsOn.push(src);
        src.dependedOnBy.push(u);
      }
    }
    if (u.post_equip_func) this.equip_restrict[u.uid] = u.post_equip_func;
    return null;
  }

  unequipUpgrade(u: Upgrade, legion: Legion): string | null {
    const slot = this.equipped.indexOf(u);
    if (slot < 0) return `Não foi possível remover ${u.name}.`;
    if (u.isDependedOn()) return `${u.name} não pode ser removido por causa de ${u.dependedOnBy.map((d) => d.name).join(', ')}.`;
    const ctx: Ctx = { creature: this, upgrade: u, legion };

    let err = processCommands(u.preEquipCommands(), ctx, true);
    if (err) return err;
    err = processCommands(this.pre_equip_commands, ctx, true);
    if (err) {
      processCommands(u.preEquipCommands(), ctx, false);
      return err;
    }

    for (const src of u.dependsOn) src.dependedOnBy = src.dependedOnBy.filter((d) => d !== u);
    u.dependsOn = [];
    delete this.equip_restrict[u.uid];
    delete this.upgrade_equip_depends_on[u.uid];
    delete this.upgrade_uses_alt_id[u.uid];
    this.equipped[slot] = null;
    processCommands(u.post_unequip_commands, ctx, false);
    return null;
  }

  validateUpgrades(): boolean {
    return this.equippedUpgrades().every((u) => u.creatureCanEquip(this));
  }
}

/* ------------------------------------------------------------------ */
/* Legion                                                              */
/* ------------------------------------------------------------------ */

export interface Catalog {
  creatures: CreatureData[];
  upgrades: UpgradeData[];
  creatureByUid: Map<number, CreatureData>;
  upgradeByUid: Map<number, UpgradeData>;
}

export function buildCatalog(creatures: CreatureData[], upgrades: UpgradeData[]): Catalog {
  return {
    creatures,
    upgrades,
    creatureByUid: new Map(creatures.map((c) => [c.uid, c])),
    upgradeByUid: new Map(upgrades.map((u) => [u.uid, u])),
  };
}

export class Legion {
  creatures: Creature[] = [];
  tokens: Record<string, number> = { Evil: 0, WealthOfTheAncients: 0 };
  extraArtifacts = 0;

  legionArtifacts(): Upgrade[] {
    return this.creatures.flatMap((c) => c.equippedUpgrades().filter((u) => u.artifact));
  }

  containsUpgrade(u: Upgrade) {
    return this.creatures.some((c) => c.equippedUpgrades().some((e) => e.name === u.name));
  }

  totalCost() {
    return this.creatures.reduce((s, c) => s + c.totalCost(this), 0);
  }

  totalCards() {
    return this.creatures.reduce((s, c) => s + 1 + c.equippedUpgrades().length, 0);
  }

  addCreature(data: CreatureData): string | null {
    if (data.unique) {
      const key = data.uniquename || data.name;
      if (this.creatures.some((c) => c.unique && (c.name === data.name || c.uniqueName === key))) {
        return `${data.name} já está na sua legião.`;
      }
    }
    this.creatures.push(new Creature(data));
    return null;
  }

  removeCreature(c: Creature): string | null {
    if (c.originalAlignment) return 'Restaure o alinhamento antes de remover esta criatura.';
    // Remove primeiro quem depende de alguém, do último slot para o primeiro.
    let guard = 0;
    while (c.equippedUpgrades().length && guard++ < 50) {
      const next = [...c.equippedUpgrades()].reverse().find((u) => !u.isDependedOn());
      if (!next) break;
      const err = c.unequipUpgrade(next, this);
      if (err) return err;
    }
    if (c.equippedUpgrades().length) return `Não foi possível remover os upgrades de ${c.name}.`;
    this.creatures = this.creatures.filter((x) => x !== c);
    return null;
  }

  canCreatureEquipUpgrade(c: Creature, u: Upgrade): boolean {
    if (!u || !c) return false;
    if (u.unique && this.containsUpgrade(u)) return false;
    if (u.artifact && this.legionArtifacts().length > 0) {
      const max = 1 + this.extraArtifacts;
      const arts = this.legionArtifacts();
      if (!u.artifactSet && (!this.extraArtifacts || arts.length >= max)) return false;
      if (c.hasArtifactEquipped()) return false;
      for (const a of arts) {
        if ((!a.artifactSet || !u.isArtifactSet(a.artifactSet)) && (!this.extraArtifacts || arts.length >= max)) return false;
      }
    }
    return c.canEquipUpgrade(u);
  }

  /** Motivo, em palavras, pelo qual um upgrade não entra numa criatura. */
  whyNot(c: Creature, u: Upgrade): string | null {
    if (u.unique && this.containsUpgrade(u)) return 'Único: já está na legião';
    if (c.slotContainingUpgrade(u) > -1) return 'Já equipado nesta criatura';
    if (u.artifact && this.legionArtifacts().length > 0 && !this.canCreatureEquipUpgrade(c, u)) {
      return c.hasArtifactEquipped() ? 'Um artefato por criatura' : 'Limite de artefatos da legião';
    }
    const fits =
      c.openUpgradeSlotOfType(u.upgrade) !== null ||
      c.openUpgradeSlotOfType(u.hasAlternateSlot(c)) !== null ||
      c.openUpgradeSlotOfType(c.alternateSlotCommandFor(u)?.params?.slot ?? null) !== null ||
      !!c.upgradeAddsOwnSlot(u);
    if (!fits) return c.upgrades.some((s) => s === u.upgrade) || u.upgrade === 'Universal' ? 'Sem slot livre' : `Sem slot ${u.upgrade}`;
    if (!u.creatureCanEquip(c)) return 'Restrição da carta';
    return null;
  }

  equip(c: Creature, data: UpgradeData): string | null {
    const u = new Upgrade(data);
    if (u.unique && this.containsUpgrade(u)) return `Você já equipou ${u.name}.`;
    if (!this.canCreatureEquipUpgrade(c, u)) return this.whyNot(c, u) ?? `${u.name} não pode ser equipado em ${c.name}.`;
    return c.equipUpgrade(u, this);
  }

  makeEvil(c: Creature): string | null {
    if ((this.tokens.Evil ?? 0) < 1 || c.alignment === 'Evil') return null;
    const original = c.alignment;
    c.originalAlignment = original;
    c.alignment = 'Evil';
    if (!c.validateUpgrades()) {
      c.alignment = original;
      c.originalAlignment = null;
      return 'Um upgrade impede a mudança de alinhamento.';
    }
    this.tokens.Evil -= 1;
    return null;
  }

  restoreAlignment(c: Creature): string | null {
    if (!c.originalAlignment) return null;
    const current = c.alignment;
    c.alignment = c.originalAlignment;
    if (!c.validateUpgrades()) {
      c.alignment = current;
      return 'Um upgrade impede a mudança de alinhamento.';
    }
    c.originalAlignment = null;
    this.tokens.Evil += 1;
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Código de compartilhamento (compatível com /link/:code do original) */
/* ------------------------------------------------------------------ */

export function encodeLegion(legion: Legion): string {
  const parts = legion.creatures.map((c) => {
    const slots = c.equipped.map((u) => (u ? String(u.uid) : '0'));
    let s = [String(c.uid), ...slots].join(':');
    if (c.originalAlignment) s += `|a:${c.originalAlignment}:${c.alignment}`;
    return s;
  });
  const b64 = btoa(parts.join(','));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeLegionCode(code: string): string {
  let s = decodeURIComponent(code).trim().replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

export interface LoadResult {
  legion: Legion;
  problems: string[];
}

export function loadLegionFromCode(code: string, catalog: Catalog): LoadResult {
  const legion = new Legion();
  const problems: string[] = [];
  let text = '';
  try {
    text = decodeLegionCode(code);
  } catch {
    return { legion, problems: ['Código de legião inválido.'] };
  }
  if (!text) return { legion, problems };
  const alignments: string[] = [];
  const pending: { creature: Creature; uids: number[] }[] = [];

  for (const part of text.split(',')) {
    const [main, extra] = part.split('|');
    const [cuid, ...slots] = main.split(':');
    const data = catalog.creatureByUid.get(Number(cuid));
    if (!data) {
      problems.push(`Criatura ${cuid} não encontrada.`);
      continue;
    }
    const err = legion.addCreature(data);
    if (err) {
      problems.push(err);
      continue;
    }
    const creature = legion.creatures[legion.creatures.length - 1];
    if (extra && extra.startsWith('a:')) {
      const [, orig, now] = extra.split(':');
      creature.originalAlignment = orig as Alignment;
      creature.alignment = now as Alignment;
      alignments.push(now);
    }
    pending.push({ creature, uids: slots.filter((s) => s && s !== '0').map(Number) });
  }

  // Equipa em passadas, para que upgrades que dependem de outros (slots extras) encontrem espaço.
  for (const p of pending) {
    let queue = [...p.uids];
    for (let pass = 0; pass < 4 && queue.length; pass++) {
      const left: number[] = [];
      for (const uid of queue) {
        const data = catalog.upgradeByUid.get(uid);
        if (!data) {
          problems.push(`Upgrade ${uid} não encontrado.`);
          continue;
        }
        if (legion.equip(p.creature, data)) left.push(uid);
      }
      queue = left;
    }
    for (const uid of queue) problems.push(`${catalog.upgradeByUid.get(uid)?.name ?? uid} não coube em ${p.creature.name}.`);
  }
  for (const a of alignments) legion.tokens[a] = (legion.tokens[a] ?? 0) - 1;
  return { legion, problems };
}
