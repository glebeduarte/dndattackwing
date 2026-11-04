// IA adversária: decide manobras, ações e ataques a partir das respostas do jogador sobre a mesa.
// Não vê o tabuleiro: cada decisão usa a direção e a distância do inimigo mais próximo.

import type { CreatureData, MoveGrid } from './types';

export type Dir = 'F' | 'FL' | 'FR' | 'L' | 'R' | 'B';
export type Dist = 1 | 2 | 3 | 4;
export type Edge = 'none' | 'F' | 'L' | 'R';
export interface Situation { dir: Dir; dist: Dist; edge: Edge }

export type MoveColor = 'g' | 'w' | 'r';
export interface Maneuver { speed: number; col: number; color: MoveColor; grid: 'flight' | 'ground' }

export type AtkFace = 'hit' | 'crit' | 'eye' | 'blank';
export type DefFace = 'dodge' | 'eye' | 'blank';
export type Rng = () => number;

export interface Tokens { dodge?: boolean; target?: boolean; concentrate?: boolean; exhausted?: boolean }

export interface Unit {
  id: string;
  side: 'ai' | 'me';
  uid: number;
  name: string;
  level: number;
  attack: number;
  agility: number;
  health: number;
  armor: number;
  flyer: boolean;
  movement: CreatureData['movement'];
  attacks: CreatureData['primary_attacks'];
  actions: string[];
  upgrades: string[];
  dmg: number;
  crit: number;
  alive: boolean;
  air: boolean;
  tokens: Tokens;
  plan?: Maneuver;
  sit?: Situation;
  element?: string | null;
  specials?: Special[];
  base?: string;
}

const COL_NAME = ['Curva à esquerda', 'Inclinação à esquerda', 'Reta', 'Inclinação à direita', 'Curva à direita', 'Manobra especial'];
export const COLOR_NAME: Record<MoveColor, string> = { g: 'fácil (verde)', w: 'normal (branca)', r: 'difícil (vermelha)' };

export function maneuverLabel(m: Maneuver) {
  if (m.speed === 0) return 'Parada no lugar';
  if (m.speed === -1) return 'Ré 1';
  return `${COL_NAME[m.col]} ${m.speed}`;
}

export const MOVE_GLYPH = ['↰', '↖', '↑', '↗', '↱', '⤺'];
export const maneuverGlyph = (m: Maneuver) => (m.speed === 0 ? '●' : m.speed === -1 ? '↓' : MOVE_GLYPH[m.col]);

export function gridFor(u: Pick<Unit, 'movement' | 'flyer' | 'air'>): { grid: MoveGrid | undefined; kind: 'flight' | 'ground' } {
  const m = u.movement as { flight?: MoveGrid; ground?: MoveGrid } | undefined;
  if (u.flyer && u.air && m?.flight) return { grid: m.flight, kind: 'flight' };
  if (m?.ground) return { grid: m.ground, kind: 'ground' };
  return { grid: m?.flight, kind: 'flight' };
}

export function availableManeuvers(u: Pick<Unit, 'movement' | 'flyer' | 'air'>): Maneuver[] {
  const { grid, kind } = gridFor(u);
  if (!grid) return [];
  const out: Maneuver[] = [];
  for (const key of Object.keys(grid)) {
    const row = grid[key];
    if (!Array.isArray(row)) continue;
    const speed = Number(key);
    row.forEach((c, col) => { if (c) out.push({ speed, col, color: c as MoveColor, grid: kind }); });
  }
  return out;
}

const TARGET_COL: Record<Dir, number> = { F: 2, FL: 1, FR: 3, L: 0, R: 4, B: 5 };

/** Escolhe a manobra que mais aproxima o arco frontal do inimigo, sem sair da mesa. */
export function chooseManeuver(u: Unit, s: Situation, rng: Rng): Maneuver | null {
  const all = availableManeuvers(u);
  if (!all.length) return null;
  const hasSpecial = all.some((m) => m.col === 5);
  let want = TARGET_COL[s.dir];
  if (want === 5 && !hasSpecial) want = rng() < 0.5 ? 0 : 4;
  const maxSpeed = Math.max(...all.map((m) => m.speed));
  let pref: number;
  if (s.dir === 'F') pref = s.dist === 1 ? 1 : s.dist === 2 ? 2 : s.dist === 3 ? 3 : maxSpeed;
  else pref = s.dist <= 2 ? 1 : 2;

  let best: Maneuver | null = null;
  let bestScore = -Infinity;
  for (const m of all) {
    if (u.tokens.exhausted && m.color === 'r') continue;
    let score = 0;
    const col = m.speed <= 0 ? 2 : m.col;
    score -= Math.abs(col - want) * 3;
    if (want === 5 && m.col === 5) score += 2;
    score -= Math.abs(Math.max(m.speed, 0) - pref) * 1.5;
    if (s.dir === 'F' && s.dist === 1 && m.speed === 0) score += 1.5;
    if (m.speed === -1) score -= 3;
    score += m.color === 'g' ? (u.tokens.exhausted ? 3 : 1) : m.color === 'r' ? -2 : 0;
    if (s.edge === 'F' && (col === 2 || col === 1 || col === 3) && m.speed >= 2) score -= 6;
    if (s.edge === 'L' && (m.col === 0 || m.col === 1) && m.speed > 0) score -= 5;
    if (s.edge === 'R' && (m.col === 3 || m.col === 4) && m.speed > 0) score -= 5;
    score += rng() * 1.2;
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

export const ACTION_NAME: Record<string, string> = { Dodge: 'Esquiva', Target: 'Adquirir alvo', Concentrate: 'Concentração', Charge: 'Investida', Feint: 'Finta' };

/** Ação depois de mover. Com inimigo à frente, prepara o ataque; sem inimigo, se protege. */
export function chooseAction(u: Unit, enemyAhead: boolean): string | null {
  if (u.tokens.exhausted) return null;
  const has = (a: string) => u.actions.includes(a);
  if (enemyAhead) {
    const wants = (u.specials ?? []).filter((x) => x.kind === 'attack' && !x.spent && x.ready <= 0).map((x) => x.needs);
    if (wants.includes('concentrate') && has('Concentrate') && !wants.includes('target')) return 'Concentrate';
    if (has('Target')) return 'Target';
    if (has('Concentrate')) return 'Concentrate';
    if (has('Dodge')) return 'Dodge';
  } else {
    if (has('Dodge')) return 'Dodge';
    if (has('Concentrate')) return 'Concentrate';
  }
  return null;
}

export function applyAction(u: Unit, action: string | null) {
  if (action === 'Dodge') u.tokens.dodge = true;
  if (action === 'Target') u.tokens.target = true;
  if (action === 'Concentrate') u.tokens.concentrate = true;
}

const ATK: AtkFace[] = ['hit', 'hit', 'hit', 'crit', 'eye', 'eye', 'blank', 'blank'];
const DEF: DefFace[] = ['dodge', 'dodge', 'dodge', 'eye', 'eye', 'blank', 'blank', 'blank'];
export const rollAttack = (n: number, rng: Rng) => Array.from({ length: Math.max(0, n) }, () => ATK[Math.floor(rng() * 8)]);
export const rollDefense = (n: number, rng: Rng) => Array.from({ length: Math.max(0, n) }, () => DEF[Math.floor(rng() * 8)]);

/** Ataque da IA: rola, usa Alvo para rolar de novo e Concentração para converter olhos. */
export function aiAttackRoll(dice: number, tokens: Tokens, rng: Rng) {
  const first = rollAttack(dice, rng);
  let final = [...first];
  const notes: string[] = [];
  if (tokens.target) {
    final = final.map((f) => (f === 'blank' || (f === 'eye' && !tokens.concentrate) ? rollAttack(1, rng)[0] : f));
    notes.push('Gastou Alvo para rolar de novo os brancos' + (tokens.concentrate ? '' : ' e os olhos') + '.');
  }
  if (tokens.concentrate && final.includes('eye')) {
    final = final.map((f) => (f === 'eye' ? 'hit' : f));
    notes.push('Gastou Concentração para transformar os olhos em acertos.');
  }
  return { first, final, notes, usedTarget: !!tokens.target, usedConcentrate: !!tokens.concentrate && first.concat(final).includes('eye') };
}

/** Defesa da IA: rola Agilidade (+1 a Alcance 4), soma Esquiva e converte olhos com Concentração. */
export function aiDefenseRoll(agility: number, range: Dist, tokens: Tokens, rng: Rng) {
  const roll = rollDefense(agility + (range === 4 ? 1 : 0), rng);
  let dodges = roll.filter((f) => f === 'dodge').length;
  const notes: string[] = [];
  if (tokens.concentrate) {
    const eyes = roll.filter((f) => f === 'eye').length;
    if (eyes) { dodges += eyes; notes.push(`Gastou Concentração: ${eyes} olho(s) viraram esquiva.`); }
  }
  if (tokens.dodge) { dodges += 1; notes.push('Gastou a ficha de Esquiva: +1 esquiva.'); }
  return { roll, dodges, notes };
}

/** Esquivas cancelam acertos e depois críticos; a Armadura ignora acertos normais. */
export function resolveDamage(hits: number, crits: number, dodges: number, armor: number) {
  let h = hits, c = crits, d = dodges;
  const ch = Math.min(h, d); h -= ch; d -= ch;
  const cc = Math.min(c, d); c -= cc;
  const blocked = Math.min(h, armor); h -= blocked;
  return { normal: h, crit: c, cancelled: ch + cc, blocked };
}

export interface ArcAnswer { range: Dist | 0; arc: 'F' | 'B' | 'S' } // range 0 = fora do arco

/** Escolhe alvo e arma: inimigo mais ferido ao alcance, depois o mais perto. */
export function chooseTarget(u: Unit, enemies: Unit[], answers: Record<string, ArcAnswer>) {
  let best: { target: Unit; weapon: Unit['attacks'][number]; range: Dist } | null = null;
  let bestScore = -Infinity;
  for (const e of enemies) {
    const a = answers[e.id];
    if (!a || !a.range) continue;
    for (const w of u.attacks) {
      const arcOk = (w.arc === 'Rear' ? 'B' : 'F') === a.arc;
      if (!arcOk || w.range < a.range) continue;
      if (w.type === 'Melee' && e.air !== u.air) continue;
      const left = e.health - e.dmg - e.crit;
      const score = -left * 2 - a.range + (w.arc === 'Forward' ? 0.5 : 0);
      if (score > bestScore) { bestScore = score; best = { target: e, weapon: w, range: a.range as Dist }; }
    }
  }
  return best;
}

/** Ordem de ativação (menor nível primeiro) ou de combate (maior primeiro); empate: quem tem a iniciativa. */
export function turnOrder(units: Unit[], phase: 'ativacao' | 'combate', initiative: 'me' | 'ai') {
  return units
    .filter((u) => u.alive)
    .sort((a, b) => {
      if (a.level !== b.level) return phase === 'ativacao' ? a.level - b.level : b.level - a.level;
      if (a.side !== b.side) return a.side === initiative ? -1 : 1;
      return 0;
    });
}

/* ---------- ataques e ações de melhoria ---------- */

export interface Special {
  uid: number;
  name: string;
  kind: 'attack' | 'heal';
  dice: number | 'pwv' | null; // null = efeito sem rolagem de dano
  fixed: number; // dano fixo sem rolagem
  minRange: number;
  range: number;
  arc: 'F' | 'B' | '360';
  area: 'Line' | 'Cone' | 'Burst' | null;
  penetrates: boolean;
  needs: 'target' | 'concentrate' | null;
  dts: number;
  disables: boolean;
  discards: boolean;
  element: string | null;
  heal: number;
  text: string;
  ready: number; // rodadas até poder usar de novo
  spent: boolean;
}

interface UpgradeLike { uid: number; name: string; text?: string | null; attack?: unknown; action?: unknown; range?: unknown; area?: unknown; arc?: unknown; penetrates?: unknown; dts?: unknown; element?: unknown; upgrade?: string }

export function parseSpecial(u: UpgradeLike): Special | null {
  const t = (u.text ?? '').replace(/\s+/g, ' ');
  if (/Formation/.test(u.name) || /Soldiers? in your/.test(t)) return null;
  const isAttack = u.attack === true && /\*Attack:\*/.test(t);
  const heal = /remove up to (\d+) face down Damage Cards?/i.exec(t);
  if (!isAttack && !(heal && /\*Action:\*/.test(t))) return null;
  const rr = /Range (\d)\s*-\s*(\d)/.exec(t);
  const r1 = /Range (\d)/.exec(t);
  const arcRaw = String(u.arc ?? '').toLowerCase();
  const areaRaw = String(u.area ?? '').toLowerCase();
  const area = areaRaw === 'line' ? 'Line' : areaRaw === 'cone' ? 'Cone' : areaRaw === 'burst' ? 'Burst' : null;
  const nd = /\*?(\d+) Dice[\w\s]*Attack/i.exec(t);
  const fx = /inflict (\d+) normal damage/i.exec(t);
  const dts = Number(u.dts) || Number(/place (\d) \[DT\]/i.exec(t)?.[1] ?? 0);
  const el = String(u.element ?? '');
  return {
    uid: u.uid, name: u.name, kind: isAttack ? 'attack' : 'heal',
    dice: nd ? Number(nd[1]) : /Primary Weapon/.test(t) ? 'pwv' : null,
    fixed: fx ? Number(fx[1]) : 0,
    minRange: rr ? Number(rr[1]) : 1,
    range: rr ? Number(rr[2]) : r1 ? Number(r1[1]) : Number(u.range) || 1,
    arc: arcRaw.includes('rear') ? 'B' : arcRaw === '360' || /every direction|any direction/.test(t) ? '360' : 'F',
    area,
    penetrates: u.penetrates === true || /penetrates Armor/i.test(t),
    needs: /spend your Target Token/i.test(t) ? 'target' : /spend your Concentrate Token/i.test(t) ? 'concentrate' : null,
    dts,
    disables: /Disable this Upgrade/i.test(t),
    discards: /Discard this Upgrade/i.test(t),
    element: el && el !== 'None' && el !== 'null' ? el : null,
    heal: heal ? Number(heal[1]) : 0,
    text: u.text ?? '',
    ready: 0,
    spent: false,
  };
}

export const specialReady = (u: Unit, s: Special) =>
  !s.spent && s.ready <= 0 && (s.needs !== 'target' || !!u.tokens.target) && (s.needs !== 'concentrate' || !!u.tokens.concentrate);

/** Paga o custo do ataque: fichas de duração, desativar ou descartar, e a ficha exigida. */
export function paySpecial(u: Unit, s: Special) {
  if (s.discards) s.spent = true;
  else if (s.dts) s.ready = s.dts;
  else if (s.disables) s.ready = 2;
  if (s.needs === 'target') u.tokens.target = false;
  if (s.needs === 'concentrate') u.tokens.concentrate = false;
}

/** No fim da rodada sai uma ficha de duração de cada melhoria. */
export function tickSpecials(u: Unit) {
  for (const s of u.specials ?? []) if (s.ready > 0) s.ready -= 1;
}

const P_HIT = 3 / 8, P_CRIT = 1 / 8, P_DODGE = 3 / 8;
/** Dano esperado de um ataque com n dados contra um alvo. */
export function expectedDamage(n: number, target: Unit, penetrates: boolean, resist: boolean) {
  const hits = n * P_HIT, crits = n * P_CRIT;
  const dodges = target.agility * P_DODGE + (target.tokens.dodge ? 1 : 0) + (resist ? 1 : 0);
  const afterH = Math.max(0, hits - dodges);
  const afterC = Math.max(0, crits - Math.max(0, dodges - hits));
  const armor = penetrates ? 0 : target.armor;
  return Math.max(0, afterH - armor) + afterC;
}

export interface AttackPlan {
  label: string;
  special?: Special;
  dice: number;
  fixed: number;
  penetrates: boolean;
  element: string | null;
  area: Special['area'];
  targets: Unit[];
  range: Dist;
  level?: 'air' | 'ground';
  score: number;
  effectOnly: boolean;
}

const arcMatch = (want: 'F' | 'B' | '360', a: ArcAnswer) => want === '360' || want === a.arc;

/** Compara armas primárias e ataques de melhoria e devolve o plano com mais dano esperado. */
export function planAttack(u: Unit, enemies: Unit[], answers: Record<string, ArcAnswer>): AttackPlan | null {
  const plans: AttackPlan[] = [];
  const inReach = (e: Unit, min: number, max: number, arc: 'F' | 'B' | '360') => {
    const a = answers[e.id];
    return a && a.range && a.range >= min && a.range <= max && arcMatch(arc, a) ? (a.range as Dist) : null;
  };
  for (const w of u.attacks) {
    for (const e of enemies) {
      const r = inReach(e, 1, w.range, w.arc === 'Rear' ? 'B' : 'F');
      if (!r || (w.type === 'Melee' && e.air !== u.air)) continue;
      const exp = expectedDamage(u.attack, e, false, false);
      const kill = exp >= e.health - e.dmg - e.crit ? 1.5 : 0;
      plans.push({ label: w.description, dice: u.attack, fixed: 0, penetrates: false, element: null, area: null, targets: [e], range: r, score: exp + kill + (r === 4 ? -0.2 : 0), effectOnly: false });
    }
  }
  for (const s of u.specials ?? []) {
    if (s.kind !== 'attack' || !specialReady(u, s)) continue;
    const dice = s.dice === 'pwv' ? u.attack : s.dice ?? 0;
    const effectOnly = !dice && !s.fixed;
    const hit = enemies.filter((e) => inReach(e, s.minRange, s.range, s.arc));
    if (!hit.length) continue;
    const value = (e: Unit) => (s.fixed ? s.fixed : effectOnly ? 0.9 : expectedDamage(dice, e, s.penetrates, !!s.element && e.element === s.element));
    // custo de usar: carta descartada vale mais guardar para um bom momento
    const cost = s.discards ? 1 : s.disables || s.dts ? 0.3 : 0;
    if (s.area) {
      const air = hit.filter((e) => e.air), ground = hit.filter((e) => !e.air);
      const sum = (l: Unit[]) => l.reduce((t, e) => t + value(e), 0);
      const pick = sum(air) >= sum(ground) ? { level: 'air' as const, list: air } : { level: 'ground' as const, list: ground };
      if (!pick.list.length) continue;
      const r = Math.min(...pick.list.map((e) => answers[e.id].range as number)) as Dist;
      plans.push({ label: s.name, special: s, dice, fixed: s.fixed, penetrates: s.penetrates, element: s.element, area: s.area, targets: pick.list, range: r, level: pick.level, score: sum(pick.list) - cost + 0.2, effectOnly });
    } else {
      for (const e of hit) {
        plans.push({ label: s.name, special: s, dice, fixed: s.fixed, penetrates: s.penetrates, element: s.element, area: null, targets: [e], range: answers[e.id].range as Dist, score: value(e) - cost, effectOnly });
      }
    }
  }
  if (!plans.length) return null;
  plans.sort((a, b) => b.score - a.score);
  return plans[0];
}

/** Melhoria de cura que a IA pode usar como ação, se valer a pena. */
export function healOption(u: Unit) {
  const s = (u.specials ?? []).find((x) => x.kind === 'heal' && specialReady(u, x));
  if (!s || u.dmg < Math.min(2, s.heal)) return null;
  return s;
}
