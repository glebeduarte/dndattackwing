// Formato dos dados capturados de build.dndaw.com (módulos webpack 125 e 126).

export type SlotType = 'Arcane' | 'Divine' | 'Dragon' | 'Equipment' | 'Heroic' | 'Monster' | 'Universal';
export type Alignment = 'Good' | 'Evil' | 'Neutral';
export type MoveColor = 'g' | 'w' | 'r' | null;

export interface Rule {
  func: string;
  params?: any;
}

export interface Attack {
  type: string;
  range: number;
  description: string;
  arc: string;
}

export interface MoveGrid {
  [speed: string]: MoveColor[] | number | undefined;
  reds?: number;
  reverse?: number;
  wingover?: number;
}

export interface CreatureData {
  _id: string;
  uid: number;
  name: string;
  classtype: string;
  identifiers: string[];
  level: number;
  cost: number;
  alignment: Alignment;
  element: string | null;
  element2?: string | null;
  elements?: string[] | null;
  attack: number;
  agility: number;
  health: number;
  armor: number;
  special: string | null;
  flyer: boolean;
  base: 'Small' | 'Large' | 'Huge';
  set: string;
  wave: string;
  unique: boolean;
  uniquename?: string | null;
  movement: { flight?: MoveGrid; ground?: MoveGrid };
  primary_attacks: Attack[];
  actions: string[];
  upgrades: string[];
  cost_special?: Rule[] | null;
  [k: string]: any;
}

export interface UpgradeData {
  _id: string;
  uid: number;
  name: string;
  classtype: string;
  upgrade: SlotType;
  cost: string;
  unique: boolean;
  artifact?: boolean;
  artifactSet?: string;
  level?: number;
  element?: string | null;
  text: string;
  set: string;
  wave: string;
  area?: string | null;
  arc?: string | null;
  range?: number | string | null;
  dts?: number | null;
  disables?: boolean | null;
  discards?: boolean | null;
  exhausts?: boolean | null;
  action?: boolean | null;
  attack?: boolean | null;
  penetrates?: boolean | null;
  hitlevel?: string | null;
  armorMod?: { base?: number; add?: number };
  restriction: Rule[] | null;
  cost_special: Rule[] | null;
  equip_special?: Rule[] | null;
  legion_cost_special?: Rule[] | null;
  alternateSlot?: { slot: string; restriction: Rule[] }[] | null;
  [k: string]: any;
}
