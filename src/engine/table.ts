// Geometria da mesa: medidas em milímetros, ângulo em graus (0 = virada para o norte, sentido horário).
// As medidas das bases, dos gabaritos e da régua são aproximações das peças do jogo e ficam todas aqui.

import type { Dir, Dist, Edge, Maneuver, Unit } from './opponent';

export const BOARD = 900; // 90 x 90 cm
export const RANGE_BAND = 75; // cada trecho da régua, cerca de 7,5 cm
export const SPEED_LEN = 40; // gabarito de reta por velocidade
export const TEMPLATE_W = 20;
export const ARC_HALF = 45; // arco frontal de 90°
export const BASE_MM: Record<string, number> = { Small: 41, Large: 76, Huge: 115 };
export const baseSize = (base?: string) => BASE_MM[base ?? 'Small'] ?? 41;

export interface Pose { x: number; y: number; a: number }
export interface Pt { x: number; y: number }

const rad = (d: number) => (d * Math.PI) / 180;
export const fwd = (a: number): Pt => ({ x: Math.sin(rad(a)), y: -Math.cos(rad(a)) });
export const right = (a: number): Pt => ({ x: Math.cos(rad(a)), y: Math.sin(rad(a)) });
const add = (p: Pt, v: Pt, k = 1): Pt => ({ x: p.x + v.x * k, y: p.y + v.y * k });
const norm = (a: number) => ((a % 360) + 540) % 360 - 180;

export function corners(p: Pose, s: number): Pt[] {
  const f = fwd(p.a), r = right(p.a), h = s / 2;
  return [add(add(p, f, h), r, -h), add(add(p, f, h), r, h), add(add(p, f, -h), r, h), add(add(p, f, -h), r, -h)];
}

function rotateAround(p: Pt, o: Pt, deg: number): Pt {
  const t = rad(deg), dx = p.x - o.x, dy = p.y - o.y;
  return { x: o.x + dx * Math.cos(t) - dy * Math.sin(t), y: o.y + dx * Math.sin(t) + dy * Math.cos(t) };
}

/** Executa a manobra como na mesa: gabarito na frente da base, a traseira encaixa na outra ponta. */
export function applyManeuver(p: Pose, m: Pick<Maneuver, 'speed' | 'col'>, s: number): { pose: Pose; path: Pt[] } {
  const f = fwd(p.a);
  const front = add(p, f, s / 2);
  if (m.speed === 0) return { pose: { ...p }, path: [] };
  if (m.speed === -1) {
    const rear = add(p, f, -s / 2);
    const end = add(rear, f, -SPEED_LEN);
    return { pose: { ...add(end, f, -s / 2), a: p.a }, path: [rear, end] };
  }
  const col = m.col;
  if (col === 2 || col === 5) {
    const len = m.speed * SPEED_LEN;
    const end = add(front, f, len);
    const c = add(end, f, s / 2);
    const a = col === 5 ? p.a + 180 : p.a;
    // na volta a criatura gira 180° no fim e fica com a frente encostada no gabarito
    const pose = col === 5 ? { ...add(end, f, s / 2), a: norm(a) } : { ...c, a: p.a };
    return { pose, path: [front, end] };
  }
  const side = col < 2 ? -1 : 1;
  const turn = col === 0 || col === 4;
  const R = turn ? 35 + 27.5 * (m.speed - 1) : 80 + 50 * (m.speed - 1);
  const ang = (turn ? 90 : 45) * side;
  const o = add(front, right(p.a), side * R);
  const path: Pt[] = [];
  for (let i = 0; i <= 16; i++) path.push(rotateAround(front, o, (ang * i) / 16));
  const end = path[path.length - 1];
  const a = norm(p.a + ang);
  return { pose: { ...add(end, fwd(a), s / 2), a }, path };
}

function segDist(a: Pt, b: Pt, c: Pt, d: Pt) {
  const pd = (p: Pt, q: Pt, r: Pt) => {
    const vx = r.x - q.x, vy = r.y - q.y, L = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - q.x) * vx + (p.y - q.y) * vy) / L));
    return Math.hypot(p.x - (q.x + vx * t), p.y - (q.y + vy * t));
  };
  return Math.min(pd(a, c, d), pd(b, c, d), pd(c, a, b), pd(d, a, b));
}
function inside(p: Pt, poly: Pt[]) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const c = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (c !== 0) { if (s === 0) s = Math.sign(c); else if (Math.sign(c) !== s) return false; }
  }
  return true;
}

/** Menor distância entre as bordas das duas bases, como a régua mede. */
export function baseDistance(p: Pose, ps: number, q: Pose, qs: number) {
  const A = corners(p, ps), B = corners(q, qs);
  if (A.some((x) => inside(x, B)) || B.some((x) => inside(x, A))) return 0;
  let d = Infinity;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) d = Math.min(d, segDist(A[i], A[(i + 1) % 4], B[j], B[(j + 1) % 4]));
  return d;
}

export const band = (mm: number): Dist | 0 => (mm <= RANGE_BAND ? 1 : mm <= RANGE_BAND * 2 ? 2 : mm <= RANGE_BAND * 3 ? 3 : mm <= RANGE_BAND * 4 ? 4 : 0);

const bearing = (p: Pose, t: Pt) => norm((Math.atan2(t.x - p.x, -(t.y - p.y)) * 180) / Math.PI - p.a);

/** O alvo está no arco se algum canto ou o centro da base dele estiver dentro dos 90° do arco. */
export function inArc(p: Pose, q: Pose, qs: number, arc: 'F' | 'B') {
  const pts = [...corners(q, qs), q];
  return pts.some((t) => {
    const b = bearing(p, t);
    return arc === 'F' ? Math.abs(b) <= ARC_HALF : Math.abs(b) >= 180 - ARC_HALF;
  });
}

export function relDir(p: Pose, t: Pt): Dir {
  const b = bearing(p, t), ab = Math.abs(b);
  if (ab <= 22.5) return 'F';
  if (ab <= 67.5) return b < 0 ? 'FL' : 'FR';
  if (ab <= 135) return b < 0 ? 'L' : 'R';
  return 'B';
}

export function nearEdge(p: Pose, s: number): Edge {
  const out = (q: Pt) => q.x < 0 || q.y < 0 || q.x > BOARD || q.y > BOARD;
  const reach = s / 2 + RANGE_BAND * 2;
  if (out(add(p, fwd(p.a), reach))) return 'F';
  if (out(add(p, right(p.a), -reach))) return 'L';
  if (out(add(p, right(p.a), reach))) return 'R';
  return 'none';
}

/* ---------- estado da mesa, guardado no navegador ---------- */

export interface TableState { poses: Record<string, Pose> }
const KEY = 'aw:table';
export function loadTable(): TableState {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : { poses: {} }; } catch { return { poses: {} }; }
}
export function saveTable(t: TableState) {
  try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* sem armazenamento */ }
}

export type UnitWithBase = Unit & { base?: string };
export const sizeOf = (u: UnitWithBase) => baseSize(u.base);

/** Posições iniciais: cada legião enfileirada na própria borda (a IA ao norte). */
export function deploy(units: UnitWithBase[]): Record<string, Pose> {
  const out: Record<string, Pose> = {};
  for (const side of ['ai', 'me'] as const) {
    const list = units.filter((u) => u.side === side && u.alive);
    const gap = BOARD / (list.length + 1);
    list.forEach((u, i) => {
      const s = sizeOf(u);
      out[u.id] = side === 'ai' ? { x: gap * (i + 1), y: s / 2 + 20, a: 180 } : { x: gap * (i + 1), y: BOARD - s / 2 - 20, a: 0 };
    });
  }
  return out;
}

/** Leitura automática para a IA: inimigo mais próximo, distância e borda. */
export function situationFromTable(u: UnitWithBase, enemies: UnitWithBase[], poses: Record<string, Pose>) {
  const p = poses[u.id];
  if (!p) return null;
  let best: { e: UnitWithBase; d: number } | null = null;
  for (const e of enemies) {
    const q = poses[e.id];
    if (!q) continue;
    const d = baseDistance(p, sizeOf(u), q, sizeOf(e));
    if (!best || d < best.d) best = { e, d };
  }
  if (!best) return null;
  const b = band(best.d);
  return { dir: relDir(p, poses[best.e.id]), dist: (b || 4) as Dist, edge: nearEdge(p, sizeOf(u)) };
}

/** Respostas de arco e alcance para o combate da IA. */
export function arcsFromTable(u: UnitWithBase, enemies: UnitWithBase[], poses: Record<string, Pose>) {
  const p = poses[u.id];
  const out: Record<string, { range: Dist | 0; arc: 'F' | 'B' | 'S' }> = {};
  if (!p) return out;
  for (const e of enemies) {
    const q = poses[e.id];
    if (!q) continue;
    const r = band(baseDistance(p, sizeOf(u), q, sizeOf(e)));
    out[e.id] = { range: r, arc: inArc(p, q, sizeOf(e), 'F') ? 'F' : inArc(p, q, sizeOf(e), 'B') ? 'B' : 'S' };
  }
  return out;
}
