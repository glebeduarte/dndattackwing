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

export interface ArcAnswer { range: Dist | 0; arc: 'F' | 'B' } // range 0 = fora do arco

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
