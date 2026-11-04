// Filtro por texto do catálogo.
// Palavras soltas procuram no nome, tipo, texto e identificadores. Campos usam "campo:valor" ou comparação:
//   nivel>=8  custo<20  ataque=5  voa  unica  -unica  alinhamento:mau  base:grande
//   slot:arcano  acao:dodge  tipo:dragon  elemento:fogo  colecao:starter  artefato
// Um "-" na frente nega o termo. Aspas juntam palavras: "red dragon".

import type { CreatureData, UpgradeData } from '../engine/types';

type Card = CreatureData | UpgradeData;
const isCreature = (d: Card): d is CreatureData => Array.isArray((d as CreatureData).upgrades);

const norm = (s: unknown) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/* Sinônimos em português para valores dos dados. */
const VALUE_ALIASES: Record<string, string> = {
  bom: 'good', mau: 'evil', mal: 'evil', neutro: 'neutral',
  pequena: 'small', pequeno: 'small', grande: 'large', enorme: 'huge',
  arcano: 'arcane', divino: 'divine', dragao: 'dragon', equipamento: 'equipment', heroico: 'heroic', monstro: 'monster',
  fogo: 'fire', frio: 'cold', gelo: 'cold', acido: 'acid', raio: 'lightning', trovao: 'thunder', veneno: 'poison', doenca: 'disease',
  positiva: 'positive', negativa: 'negative',
  esquiva: 'dodge', alvo: 'target', investida: 'charge', concentrar: 'concentrate', finta: 'feint',
  linha: 'line', cone: 'cone', estouro: 'burst',
  frontal: 'forward', traseiro: 'rear',
};
const val = (v: string) => VALUE_ALIASES[norm(v)] ?? norm(v);

/* Campos numéricos: nome do campo (e sinônimos) → leitura na carta. */
const NUMERIC: Record<string, (d: Card) => number | null> = {
  custo: (d) => (d.cost === '*' ? null : Number(d.cost)),
  nivel: (d) => (typeof (d as any).level === 'number' ? (d as any).level : null),
  ataque: (d) => (isCreature(d) ? d.attack : null),
  agilidade: (d) => (isCreature(d) ? d.agility : null),
  vida: (d) => (isCreature(d) ? d.health : null),
  armadura: (d) => (isCreature(d) ? d.armor : null),
  slots: (d) => (isCreature(d) ? d.upgrades.length : null),
  alcance: (d) => {
    if (isCreature(d)) return Math.max(0, ...d.primary_attacks.map((a) => a.range));
    const r = Number((d as UpgradeData).range);
    return Number.isNaN(r) ? null : r;
  },
  marcadores: (d) => (isCreature(d) ? null : ((d as UpgradeData).dts ?? null)),
};
const NUM_ALIASES: Record<string, string> = {
  cost: 'custo', pts: 'custo', pontos: 'custo', level: 'nivel', lvl: 'nivel', nv: 'nivel',
  atk: 'ataque', attack: 'ataque', pwv: 'ataque', agi: 'agilidade', agility: 'agilidade',
  hp: 'vida', health: 'vida', arm: 'armadura', armor: 'armadura', range: 'alcance', dt: 'marcadores', dts: 'marcadores',
};

/* Campos de texto: campo:valor. */
const TEXT: Record<string, (d: Card, v: string) => boolean> = {
  alinhamento: (d, v) => isCreature(d) && norm(d.alignment) === v,
  base: (d, v) => isCreature(d) && norm(d.base) === v,
  slot: (d, v) => (isCreature(d) ? d.upgrades.some((s) => norm(s) === v) : norm((d as UpgradeData).upgrade) === v),
  acao: (d, v) => isCreature(d) && d.actions.some((a) => norm(a) === v),
  tipo: (d, v) => norm(d.classtype).includes(v) || (isCreature(d) && d.identifiers.some((i) => norm(i).includes(v))),
  elemento: (d, v) => [d.element, (d as any).element2, ...((d as any).elements ?? [])].some((e) => norm(e) === v),
  colecao: (d, v) => norm(d.set).includes(v),
  onda: (d, v) => norm(d.wave).includes(v),
  area: (d, v) => !isCreature(d) && norm((d as UpgradeData).area).includes(v),
  arco: (d, v) =>
    isCreature(d) ? d.primary_attacks.some((a) => norm(a.arc) === v) : norm((d as UpgradeData).arc).includes(v),
  nome: (d, v) => norm(d.name).includes(v),
  texto: (d, v) => norm((d as any).text ?? (d as any).special).includes(v),
};
const TEXT_ALIASES: Record<string, string> = {
  align: 'alinhamento', al: 'alinhamento', alignment: 'alinhamento', acoes: 'acao', action: 'acao',
  classe: 'tipo', type: 'tipo', id: 'tipo', element: 'elemento', el: 'elemento', set: 'colecao', wave: 'onda', name: 'nome', text: 'texto',
};

/* Palavras-chave sem valor. */
const FLAGS: Record<string, (d: Card) => boolean> = {
  voa: (d) => isCreature(d) && d.flyer,
  terrestre: (d) => isCreature(d) && !d.flyer,
  unica: (d) => !!d.unique,
  artefato: (d) => !isCreature(d) && !!(d as UpgradeData).artifact,
  ataque: (d) => !isCreature(d) && (d as UpgradeData).attack === true,
  acao: (d) => !isCreature(d) && (d as UpgradeData).action === true,
  penetra: (d) => !isCreature(d) && (d as UpgradeData).penetrates === true,
  tropa: (d) => isCreature(d) && d.identifiers.some((i) => /troop|band|warband|squadron/i.test(i) || /troop/i.test(d.classtype)),
  variavel: (d) => d.cost === '*',
};
const FLAG_ALIASES: Record<string, string> = { unico: 'unica', unique: 'unica', flyer: 'voa', voador: 'voa', chao: 'terrestre', solo: 'terrestre', artifact: 'artefato', troop: 'tropa' };

export interface Term {
  raw: string;
  neg: boolean;
  test: (d: Card) => boolean;
  known: boolean; // false = virou busca de texto livre
}

function tokenize(q: string): string[] {
  const out: string[] = [];
  const re = /-?"[^"]*"|\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(q))) out.push(m[0]);
  return out;
}

export function parseQuery(q: string, haystack: (d: Card) => string): Term[] {
  return tokenize(q).map((raw) => {
    let t = raw;
    let neg = false;
    if (t.startsWith('-') && t.length > 1) {
      neg = true;
      t = t.slice(1);
    }
    const phrase = /^"(.*)"$/.exec(t);
    if (phrase) {
      const p = norm(phrase[1]);
      return { raw, neg, known: true, test: (d) => norm(haystack(d)).includes(p) };
    }
    const cmp = /^([a-zà-ú]+)\s*(>=|<=|=|>|<|:)\s*(.+)$/i.exec(t);
    if (cmp) {
      const field = norm(cmp[1]);
      const op = cmp[2];
      const value = cmp[3];
      const numKey = NUMERIC[field] ? field : NUM_ALIASES[field];
      if (numKey && /^-?\d+(\.\d+)?$/.test(value)) {
        const n = Number(value);
        const get = NUMERIC[numKey];
        const ok = (x: number) =>
          op === '>' ? x > n : op === '<' ? x < n : op === '>=' ? x >= n : op === '<=' ? x <= n : x === n;
        return { raw, neg, known: true, test: (d) => { const x = get(d); return x !== null && ok(x); } };
      }
      const textKey = TEXT[field] ? field : TEXT_ALIASES[field];
      if (textKey && op === ':') {
        const v = val(value);
        return { raw, neg, known: true, test: (d) => TEXT[textKey](d, v) };
      }
    }
    const flagKey = FLAGS[norm(t)] ? norm(t) : FLAG_ALIASES[norm(t)];
    if (flagKey) return { raw, neg, known: true, test: FLAGS[flagKey] };
    const w = norm(t);
    return { raw, neg, known: false, test: (d) => norm(haystack(d)).includes(w) };
  });
}

export function matches(d: Card, terms: Term[]) {
  return terms.every((t) => (t.neg ? !t.test(d) : t.test(d)));
}

export const QUERY_EXAMPLES: { creatures: [string, string][]; upgrades: [string, string][] } = {
  creatures: [
    ['nivel>=8 voa', 'voadores de nível 8 ou mais'],
    ['custo<=20 alinhamento:bom', 'baratas e de alinhamento Bom'],
    ['tipo:dragon -unica', 'dragões genéricos'],
    ['slot:arcano acao:dodge', 'com slot Arcano e Esquiva'],
    ['ataque>=5 armadura>=2', 'fortes no ataque e na armadura'],
    ['tropa', 'tropas'],
  ],
  upgrades: [
    ['slot:dragao ataque', 'ataques de dragão'],
    ['elemento:fogo', 'do elemento Fogo'],
    ['custo<=3 -unica', 'baratos e não únicos'],
    ['nivel<=3 slot:arcano', 'magias de nível baixo'],
    ['artefato', 'artefatos'],
    ['alcance>=3 penetra', 'longo alcance que penetra armadura'],
  ],
};
