import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { loadLegionFromCode, type Legion } from '../engine/engine';
import { generateLegions } from '../engine/generator';
import {
  ACTION_NAME, COLOR_NAME, aiAttackRoll, aiDefenseRoll, applyAction, chooseAction, chooseManeuver, healOption, parseSpecial, paySpecial, planAttack, tickSpecials,
  maneuverLabel, resolveDamage, turnOrder,
  type ArcAnswer, type AttackPlan, type AtkFace, type Special, type DefFace, type Dir, type Dist, type Edge, type Unit,
} from '../engine/opponent';
import { catalog, useStore } from '../store';
import { getLoadedTranslations, loadTranslations, type Translations } from '../i18n/cards';
import { Shell } from '../ui/Shell';
import { TableBoard } from '../ui/TableBoard';
import { CreatureCard, UpgradeCard } from '../ui/Cards';
import { arcsFromTable, deploy, loadTable, moveOnTable, offBoard, planOnTable, saveTable, situationFromTable, sizeOf, type Pose } from '../engine/table';

/* ---------- estado da partida ---------- */

type Phase = 'situacao' | 'planejamento' | 'ativacao' | 'combate' | 'fim' | 'acabou';
interface Match {
  round: number;
  phase: Phase;
  step: number;
  units: Unit[];
  initiative: 'me' | 'ai';
  log: string[];
  feed?: string[];
}

const KEY = 'aw:match';
const load = (): Match | null => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const save = (m: Match | null) => { try { if (m) localStorage.setItem(KEY, JSON.stringify(m)); else localStorage.removeItem(KEY); } catch { /* sem armazenamento */ } };

export function unitsFrom(legion: Legion, side: 'ai' | 'me'): Unit[] {
  return legion.creatures.map((c, i) => ({
    id: `${side}${i}`, side, uid: c.uid, name: c.name, level: c.level, attack: c.attack, agility: c.agility,
    health: c.health, armor: c.armor, flyer: c.flyer, movement: c.movement, attacks: c.data.primary_attacks,
    actions: c.actions, upgrades: c.equipped.filter(Boolean).map((u) => u!.name), upgradeUids: c.equipped.filter(Boolean).map((u) => u!.uid),
    dmg: 0, crit: 0, alive: true, air: c.flyer, tokens: {},
    element: c.element,
    base: c.base,
    specials: c.equipped.filter(Boolean).map((x) => parseSpecial(x!.data as never)).filter(Boolean) as NonNullable<ReturnType<typeof parseSpecial>>[],
  }));
}

const left = (u: Unit) => Math.max(0, u.health - u.dmg - u.crit);

/* ---------- peças de interface ---------- */

function Tile({ on, onClick, children, sub, tone }: { on?: boolean; onClick(): void; children: ReactNode; sub?: string; tone?: string }) {
  return (
    <button type="button" className={`ai-tile${on ? ' is-on' : ''}${tone ? ` tone-${tone}` : ''}`} aria-pressed={on} onClick={onClick}>
      <span className="ai-tile-main">{children}</span>
      {sub && <span className="ai-tile-sub">{sub}</span>}
    </button>
  );
}

function Stepper({ label, value, set, icon }: { label: string; value: number; set(n: number): void; icon?: string }) {
  return (
    <div className="ai-step">
      <span className="ai-step-label">{icon && <img src={`/icons/${icon}.png`} alt="" width={22} height={22} />} {label}</span>
      <div className="ai-step-ctl">
        <button type="button" onClick={() => set(Math.max(0, value - 1))} aria-label={`Menos ${label}`}>−</button>
        <span className="num">{value}</span>
        <button type="button" onClick={() => set(value + 1)} aria-label={`Mais ${label}`}>+</button>
      </div>
    </div>
  );
}

const FACE_ICON: Record<string, string | null> = { hit: 'hit', crit: 'critical', eye: 'concentrate', blank: null, dodge: 'dodge' };
function Dice({ faces, kind }: { faces: (AtkFace | DefFace)[]; kind: 'atk' | 'def' }) {
  return (
    <div className="ai-dice">
      {faces.length === 0 && <span className="muted">nenhum dado</span>}
      {faces.map((f, i) => (
        <span key={i} className={`ai-die ai-die-${kind}`}>{FACE_ICON[f] ? <img src={`/icons/${FACE_ICON[f]}.png`} alt={f} width={22} height={22} /> : null}</span>
      ))}
    </div>
  );
}

const DIRS: { d: Dir; g: string; t: string; pos: string }[] = [
  { d: 'FL', g: '↖', t: 'Frente esquerda', pos: 'a' }, { d: 'F', g: '↑', t: 'Frente', pos: 'b' }, { d: 'FR', g: '↗', t: 'Frente direita', pos: 'c' },
  { d: 'L', g: '←', t: 'Esquerda', pos: 'd' }, { d: 'R', g: '→', t: 'Direita', pos: 'f' }, { d: 'B', g: '↓', t: 'Atrás', pos: 'h' },
];
const DISTS: { d: Dist; t: string }[] = [{ d: 1, t: 'Alcance 1' }, { d: 2, t: 'Alcance 2' }, { d: 3, t: 'Alcance 3' }, { d: 4, t: '4 ou mais' }];
const EDGES: { e: Edge; g: string; t: string }[] = [{ e: 'none', g: '✓', t: 'Longe das bordas' }, { e: 'F', g: '▔', t: 'Borda à frente' }, { e: 'L', g: '▏', t: 'Borda à esquerda' }, { e: 'R', g: '▕', t: 'Borda à direita' }];

function UnitChip({ u, on, onClick }: { u: Unit; on?: boolean; onClick?(): void }) {
  const pct = (left(u) / u.health) * 100;
  return (
    <div className={`ai-chip side-${u.side}${u.alive ? '' : ' is-dead'}${on ? ' is-viewed' : ''}`} role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }} title="Ver as cartas">
      <div className="ai-chip-top"><strong>{u.name}</strong><span className="num muted">Nv {u.level}</span></div>
      <div className="ai-bar"><span style={{ width: `${pct}%` }} /></div>
      <div className="ai-chip-meta">
        <span className="num">{left(u)}/{u.health} vida</span>
        {u.flyer && <span>{u.air ? 'no ar' : 'no solo'}</span>}
        {u.tokens.dodge && <img src="/icons/dodge.png" alt="Esquiva" title="Esquiva" width={16} height={16} />}
        {u.tokens.target && <img src="/icons/target.png" alt="Alvo" title="Alvo" width={16} height={16} />}
        {u.tokens.concentrate && <img src="/icons/concentrate.png" alt="Concentração" title="Concentração" width={16} height={16} />}
        {u.tokens.exhausted && <span className="ai-tag">exausta</span>}
        {!u.alive && <span className="ai-tag">derrotada</span>}
      </div>
      {u.side === 'ai' && u.alive && (u.specials ?? []).length > 0 && (
        <ul className="ai-specials">
          {u.specials!.map((s) => <li key={s.uid} className={s.spent ? 'is-spent' : s.ready > 0 ? 'is-wait' : ''}>{s.name}{s.spent ? ' · usada' : s.ready > 0 ? ` · ${s.ready} rodada(s)` : ''}</li>)}
        </ul>
      )}
    </div>
  );
}

/* Desenho do gabarito: reta, inclinação, curva, especial, parada e ré. */
function MoveIcon({ m }: { m: { speed: number; col: number } }) {
  const flip = m.col >= 3 && m.col <= 4;
  const col = flip ? 4 - m.col : m.col;
  let d = 'M30 54 V10';
  let head = 'M22 18 L30 8 L38 18';
  if (m.speed === 0) return <svg className="ai-move-svg" viewBox="0 0 60 60" aria-hidden><circle cx="30" cy="30" r="10" fill="currentColor" /></svg>;
  if (m.speed === -1) { d = 'M30 8 V50'; head = 'M22 42 L30 52 L38 42'; }
  else if (col === 0) { d = 'M40 54 V34 Q40 16 22 16 H10'; head = 'M18 8 L8 16 L18 24'; }
  else if (col === 1) { d = 'M38 54 V36 L16 14'; head = 'M14 26 L14 12 L28 12'; }
  else if (col === 5) { d = 'M40 54 V22 Q40 8 28 8 Q16 8 16 22 V34'; head = 'M8 28 L16 38 L24 28'; }
  return (
    <svg className="ai-move-svg" viewBox="0 0 60 60" aria-hidden style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d={head} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- preparação ---------- */

function Setup({ onStart }: { onStart(m: Match): void }) {
  const { legion, saved, code } = useStore();
  const [mine, setMine] = useState<string>(legion.creatures.length ? 'atual' : saved[0]?.id ?? '');
  const [aiMode, setAiMode] = useState<'gerar' | string>('gerar');
  const [style, setStyle] = useState<'equilibrada' | 'elite' | 'enxame'>('equilibrada');
  const [initiative, setInitiative] = useState<'me' | 'ai'>('me');

  const myLegion = useMemo(() => {
    if (mine === 'atual') return loadLegionFromCode(code, catalog).legion;
    const s = saved.find((x) => x.id === mine);
    return s ? loadLegionFromCode(s.code, catalog).legion : null;
  }, [mine, code, saved]);
  const points = myLegion?.totalCost() || 100;

  const start = () => {
    if (!myLegion?.creatures.length) return;
    let aiLegion: Legion | null = null;
    if (aiMode === 'gerar') {
      const g = generateLegions(catalog, { points, style, alignment: 'qualquer', element: '', dragonsOnly: false, sets: null, initiative: false, seed: Date.now() % 100000 }, 40, 1);
      aiLegion = g[0]?.legion ?? null;
    } else {
      const s = saved.find((x) => x.id === aiMode);
      if (s) aiLegion = loadLegionFromCode(s.code, catalog).legion;
    }
    if (!aiLegion?.creatures.length) return;
    onStart({ round: 1, phase: 'situacao', step: 0, initiative, units: [...unitsFrom(myLegion, 'me'), ...unitsFrom(aiLegion, 'ai')], log: ['Partida iniciada.'] });
  };

  return (
    <div className="ai-setup">
      <section className="ai-card">
        <h2>1. A sua legião</h2>
        <div className="ai-tiles">
          {legion.creatures.length > 0 && <Tile on={mine === 'atual'} onClick={() => setMine('atual')} sub={`${legion.totalCost()} pontos`}>Legião aberta no construtor</Tile>}
          {saved.map((s) => <Tile key={s.id} on={mine === s.id} onClick={() => setMine(s.id)} sub={`${s.cost} pontos`}>{s.name}</Tile>)}
        </div>
        {!legion.creatures.length && !saved.length && <p className="muted">Monte uma legião no <Link to="/construtor">construtor</Link> antes de jogar.</p>}
        {myLegion && <p className="muted">{myLegion.creatures.map((c) => c.name).join(', ')}</p>}
      </section>
      <section className="ai-card">
        <h2>2. A legião da IA</h2>
        <div className="ai-tiles">
          <Tile on={aiMode === 'gerar'} onClick={() => setAiMode('gerar')} sub={`${points} pontos, como a sua`}>Gerar uma legião</Tile>
          {saved.map((s) => <Tile key={s.id} on={aiMode === s.id} onClick={() => setAiMode(s.id)} sub={`${s.cost} pontos`}>{s.name}</Tile>)}
        </div>
        {aiMode === 'gerar' && (
          <div className="ai-tiles ai-tiles-sm">
            <Tile on={style === 'elite'} onClick={() => setStyle('elite')} sub="poucas criaturas fortes">Elite</Tile>
            <Tile on={style === 'equilibrada'} onClick={() => setStyle('equilibrada')} sub="meio-termo">Equilibrada</Tile>
            <Tile on={style === 'enxame'} onClick={() => setStyle('enxame')} sub="muitas criaturas">Enxame</Tile>
          </div>
        )}
      </section>
      <section className="ai-card">
        <h2>3. Quem tem a iniciativa?</h2>
        <p className="muted">Em empate de nível, quem tem a iniciativa move e ataca primeiro.</p>
        <div className="ai-tiles ai-tiles-sm">
          <Tile on={initiative === 'me'} onClick={() => setInitiative('me')}>Eu</Tile>
          <Tile on={initiative === 'ai'} onClick={() => setInitiative('ai')}>A IA</Tile>
        </div>
      </section>
      <button className="btn btn-primary ai-go" onClick={start} disabled={!myLegion?.creatures.length}>Começar a partida</button>
    </div>
  );
}

/* ---------- fase de leitura da mesa ---------- */

function SituationStep({ m, update }: { m: Match; update(fn: (m: Match) => void): void }) {
  const ais = m.units.filter((u) => u.side === 'ai' && u.alive);
  const u = ais[m.step];
  const [dir, setDir] = useState<Dir | null>(u?.sit?.dir ?? null);
  const [dist, setDist] = useState<Dist | null>(u?.sit?.dist ?? null);
  const [edge, setEdge] = useState<Edge>(u?.sit?.edge ?? 'none');
  useEffect(() => { setDir(u?.sit?.dir ?? null); setDist(u?.sit?.dist ?? null); setEdge(u?.sit?.edge ?? 'none'); }, [u?.id]);
  if (!u) return null;
  if (hasTable()) {
    const auto = () => update((mm) => {
      const t = loadTable();
      for (const a of mm.units.filter((y) => y.side === 'ai' && y.alive)) a.plan = planOnTable(a, mm.units, t.poses, Math.random) ?? undefined;
      mm.phase = 'planejamento'; mm.step = 0;
      mm.log.push(`Rodada ${mm.round}: a IA leu a mesa e escolheu as manobras.`);
    });
    return (
      <section className="ai-card ai-ask">
        <p className="ai-kicker">Leitura da mesa · rodada {m.round}</p>
        <h2>A IA lê a mesa sozinha</h2>
        <p>Para cada criatura dela, a IA testa todas as manobras do disco sobre a mesa e escolhe a que deixa uma criatura sua no arco e ao alcance dela, longe dos seus arcos, sem bater em outras bases e sem sair da mesa.</p>
        <p className="muted">Confira se as bases na mesa estão nas posições reais antes de continuar.</p>
        <div className="ai-actions"><button className="btn btn-primary" onClick={auto}>A IA escolhe as manobras</button></div>
      </section>
    );
  }
  const confirm = () => update((mm) => {
    const x = mm.units.find((y) => y.id === u.id)!;
    x.sit = { dir: dir!, dist: dist!, edge };
    if (mm.step + 1 < ais.length) { mm.step += 1; return; }
    for (const a of mm.units.filter((y) => y.side === 'ai' && y.alive)) {
      a.plan = a.sit ? chooseManeuver(a, a.sit, Math.random) ?? undefined : undefined;
    }
    mm.phase = 'planejamento'; mm.step = 0;
    mm.log.push(`Rodada ${mm.round}: a IA escolheu as manobras.`);
  });
  return (
    <section className="ai-card ai-ask">
      <p className="ai-kicker">Leitura da mesa · {m.step + 1} de {ais.length}</p>
      <h2>Olhe para <span className="ai-name">{u.name}</span> da IA</h2>
      <h3>Para onde fica o inimigo mais próximo, do ponto de vista dela?</h3>
      <div className="ai-pad">
        {DIRS.map((d) => <button key={d.d} type="button" className={`ai-pad-btn pos-${d.pos}${dir === d.d ? ' is-on' : ''}`} onClick={() => setDir(d.d)} aria-pressed={dir === d.d}><span>{d.g}</span><small>{d.t}</small></button>)}
        <span className="ai-pad-me pos-e" aria-hidden>▲<small>{u.name}</small></span>
      </div>
      <h3>A que distância?</h3>
      <div className="ai-tiles ai-tiles-4">
        {DISTS.map((d) => <Tile key={d.d} on={dist === d.d} onClick={() => setDist(d.d)}><span className="ai-ruler">{'▮'.repeat(d.d)}</span>{d.t}</Tile>)}
      </div>
      <h3>Há uma borda da mesa perto dela (Alcance 1 ou 2)?</h3>
      <div className="ai-tiles ai-tiles-4">
        {EDGES.map((e) => <Tile key={e.e} on={edge === e.e} onClick={() => setEdge(e.e)}><span className="ai-big">{e.g}</span>{e.t}</Tile>)}
      </div>
      <div className="ai-actions">
        {hasTable() && <button className="btn btn-ghost" onClick={() => { const r = situationFromTable(u, m.units.filter((x) => x.side === 'me' && x.alive), loadTable().poses); if (r) { setDir(r.dir); setDist(r.dist); setEdge(r.edge); } }}>Ler da mesa</button>}
        <button className="btn btn-primary" disabled={!dir || !dist} onClick={confirm}>{m.step + 1 < ais.length ? 'Próxima criatura' : 'A IA escolhe as manobras'}</button>
      </div>
    </section>
  );
}

/* ---------- ativação ---------- */

/** Com a mesa ligada, a IA move as próprias criaturas e faz as ações sem esperar o jogador. */
function runAiActivations(mm: Match) {
  if (!hasTable() || mm.phase !== 'ativacao') return;
  const t = loadTable();
  mm.feed = mm.feed ?? [];
  for (;;) {
    if (mm.phase !== 'ativacao') break;
    const order = turnOrder(mm.units, 'ativacao', mm.initiative);
    const x = order[mm.step];
    if (!x || x.side !== 'ai') break;
    const enemies = mm.units.filter((y) => y.side === 'me' && y.alive);
    let line = `${x.name}: `;
    if (x.plan && t.poses[x.id]) {
      const r = moveOnTable(x, x.plan, t.poses, mm.units);
      t.poses[x.id] = r.pose;
      line += `${maneuverLabel(x.plan)} (${x.plan.color === 'g' ? 'verde' : x.plan.color === 'r' ? 'vermelha' : 'branca'})${r.bumped ? ', bateu em outra base e parou antes' : ''}`;
      if (offBoard(r.pose, sizeOf(x))) { x.alive = false; line += ', saiu da mesa e foi derrotada'; }
    } else line += 'ficou parada';
    if (x.alive) {
      const a = arcsFromTable(x, enemies, t.poses);
      const ahead = Object.values(a).some((v) => v.arc === 'F' && v.range && v.range <= 3);
      const hx = healOption(x);
      if (hx) { const n = Math.min(hx.heal, x.dmg); x.dmg -= n; paySpecial(x, x.specials!.find((q) => q.uid === hx.uid)!); line += `; ação ${hx.name}, curou ${n}`; }
      else { const act = chooseAction(x, ahead); applyAction(x, act); line += act ? `; ação ${ACTION_NAME[act]}` : '; sem ação'; }
      if (x.plan?.color === 'r') x.tokens.exhausted = true;
      else if (x.plan?.color === 'g') x.tokens.exhausted = false;
    }
    mm.feed.push(line + '.');
    mm.log.push(line + '.');
    mm.step += 1;
    if (mm.step >= order.length) { mm.phase = 'combate'; mm.step = 0; }
  }
  saveTable(t);
  setTimeout(() => window.dispatchEvent(new Event('aw-table')), 0);
}

function AiFeed({ m }: { m: Match }) {
  if (!m.feed?.length) return null;
  return (
    <div className="ai-feed">
      <p className="ai-kicker">O que a IA fez na mesa</p>
      <ul>{m.feed.map((f, i) => <li key={i}>{f}</li>)}</ul>
    </div>
  );
}

function ActivationStep({ m, update }: { m: Match; update(fn: (m: Match) => void): void }) {
  const order = turnOrder(m.units, 'ativacao', m.initiative);
  const u = order[m.step];
  const [ahead, setAhead] = useState<boolean | null>(null);
  useEffect(() => setAhead(null), [u?.id]);
  if (!u) return null;
  const next = (fn?: (x: Unit) => void) => update((mm) => {
    const x = mm.units.find((y) => y.id === u.id)!;
    fn?.(x);
    if (mm.step + 1 < order.length) mm.step += 1;
    else { mm.phase = 'combate'; mm.step = 0; }
    runAiActivations(mm);
  });
  const pos = `Ativação · ${m.step + 1} de ${order.length} · nível ${u.level}`;

  if (u.side === 'me') {
    return (
      <section className="ai-card ai-ask">
        <p className="ai-kicker">{pos}</p>
        <AiFeed m={m} />
        <h2>Sua vez: <span className="ai-name is-me">{u.name}</span></h2>
        <p>{hasTable() ? 'Revele o disco e mova a base dela na mesa abaixo: toque nela, escolha a manobra no disco e toque em Executar. Depois faça a ação.' : 'Revele o disco, faça a manobra e a ação dela.'}</p>
        {u.flyer && (
          <>
            <h3>Onde ela terminou?</h3>
            <div className="ai-tiles ai-tiles-sm">
              <Tile on={u.air} onClick={() => update((mm) => { mm.units.find((y) => y.id === u.id)!.air = true; })}><span className="ai-big">☁</span>No ar</Tile>
              <Tile on={!u.air} onClick={() => update((mm) => { mm.units.find((y) => y.id === u.id)!.air = false; })}><span className="ai-big">▁</span>No solo</Tile>
            </div>
          </>
        )}
        <h3>Qual ação ela fez?</h3>
        <div className="ai-tiles ai-tiles-sm">
          {[...u.actions.filter((a) => ['Dodge', 'Target', 'Concentrate'].includes(a)), 'none'].map((a) => {
            const on = a === 'none' ? !u.tokens.dodge && !u.tokens.target && !u.tokens.concentrate : a === 'Dodge' ? !!u.tokens.dodge : a === 'Target' ? !!u.tokens.target : !!u.tokens.concentrate;
            return (
              <Tile key={a} on={on} onClick={() => update((mm) => { const x = mm.units.find((y) => y.id === u.id)!; x.tokens = { exhausted: x.tokens.exhausted }; applyAction(x, a === 'none' ? null : a); })}>
                {a !== 'none' && <img src={`/icons/${a === 'Target' ? 'target' : a === 'Dodge' ? 'dodge' : 'concentrate'}.png`} alt="" width={26} height={26} />}
                {a === 'none' ? 'Outra ou nenhuma' : ACTION_NAME[a]}
              </Tile>
            );
          })}
        </div>
        <p className="muted">As fichas marcadas liberam as melhorias que exigem Alvo ou Concentração no combate.</p>
        <div className="ai-actions"><button className="btn btn-primary" onClick={() => next()}>Pronto, próxima</button></div>
      </section>
    );
  }

  const plan = u.plan;
  const heal = healOption(u);
  const action = ahead === null || heal ? null : chooseAction(u, ahead);
  return (
    <section className="ai-card ai-ask ai-reveal">
      <p className="ai-kicker">{pos}</p>
      <h2>A IA ativa <span className="ai-name">{u.name}</span></h2>
      {plan ? (
        <div className={`ai-move mv-${plan.color}`}>
          <MoveIcon m={plan} />
          <div>
            <strong>{maneuverLabel(plan)}</strong>
            <span>{COLOR_NAME[plan.color]} · disco {plan.grid === 'flight' ? 'de voo' : 'de solo'}</span>
          </div>
        </div>
      ) : <p>Ela fica parada nesta rodada.</p>}
      <p className="muted">Mova a miniatura da IA com o gabarito indicado.</p>
      <h3>Depois do movimento, há um inimigo no arco frontal dela, a Alcance 1 a 3?</h3>
      <div className="ai-tiles ai-tiles-sm">
        <Tile on={ahead === true} onClick={() => setAhead(true)}><span className="ai-big">✓</span>Sim</Tile>
        <Tile on={ahead === false} onClick={() => setAhead(false)}><span className="ai-big">✕</span>Não</Tile>
      </div>
      {ahead !== null && (
        <div className="ai-decision">
          {heal ? <p><strong>Ação: {heal.name}.</strong> Ela tira {Math.min(heal.heal, u.dmg)} carta(s) de dano virada(s) para baixo de si mesma.{heal.discards ? ' Descarte a carta.' : ''}</p>
            : action ? (<><img src={`/icons/${action === 'Target' ? 'target' : action === 'Dodge' ? 'dodge' : 'concentrate'}.png`} alt="" width={32} height={32} /><p><strong>Ação: {ACTION_NAME[action]}.</strong> {action === 'Target' ? 'Coloque uma ficha de Alvo ao lado dela.' : `Coloque uma ficha de ${ACTION_NAME[action]} ao lado dela.`}</p></>)
            : <p><strong>Sem ação</strong>{u.tokens.exhausted ? ': ela está exausta.' : '.'}</p>}
        </div>
      )}
      <div className="ai-actions">
        <button className="btn btn-primary" disabled={ahead === null} onClick={() => next((x) => {
          const hx = healOption(x);
          if (hx) { const n = Math.min(hx.heal, x.dmg); x.dmg -= n; paySpecial(x, x.specials!.find((q) => q.uid === hx.uid)!); }
          else applyAction(x, chooseAction(x, ahead!));
          if (x.plan?.color === 'r') x.tokens.exhausted = true;
          else if (x.plan?.color === 'g') x.tokens.exhausted = false;
        })}>Feito, próxima</button>
      </div>
    </section>
  );
}

/* ---------- combate ---------- */

interface Outcome { title: string; atk?: AtkFace[]; atkFirst?: AtkFace[]; def?: DefFace[]; notes: string[]; text: string }
interface Roll { targetId: string; first: AtkFace[]; atk: AtkFace[]; notes: string[] }
interface Pending { plan: AttackPlan; rolls: Roll[] }

function useTr() {
  const [tr, setTr] = useState<Translations | null>(getLoadedTranslations());
  useEffect(() => { if (!tr) loadTranslations().then(setTr); }, [tr]);
  return (uid: number, text: string) => tr?.u[uid] ?? text;
}

const AREA_PT: Record<string, string> = { Line: 'Linha', Cone: 'Cone', Burst: 'Estouro' };

interface Weapon {
  key: string; label: string; sub: string; dice: number; fixed: number; penetrates: boolean;
  area: Special['area']; element: string | null; range: number; special?: Special; effectOnly: boolean; blocked?: string; note?: string;
}

function weaponsOf(u: Unit): Weapon[] {
  const out: Weapon[] = u.attacks.map((a, i) => ({
    key: `p${i}`, label: a.description, dice: u.attack, fixed: 0, penetrates: false, area: null, element: null, range: a.range, effectOnly: false,
    sub: `${a.type === 'Melee' ? 'Corpo a corpo' : 'À distância'} · arco ${a.arc === 'Rear' ? 'traseiro' : 'frontal'} · alcance ${a.range} · ${u.attack} dados`,
  }));
  for (const s of u.specials ?? []) {
    if (s.kind !== 'attack') continue;
    const dice = s.dice === 'pwv' ? u.attack : s.dice ?? 0;
    const effectOnly = !dice && !s.fixed;
    const bits = [
      s.area ? AREA_PT[s.area] : s.arc === '360' ? 'qualquer direção' : s.arc === 'B' ? 'arco traseiro' : 'arco frontal',
      `alcance ${s.minRange > 1 ? `${s.minRange} a ` : ''}${s.range}`,
      s.fixed ? `${s.fixed} de dano fixo` : effectOnly ? 'efeito' : `${dice} dados`,
      s.penetrates ? 'atravessa Armadura' : '',
    ].filter(Boolean);
    out.push({
      key: `s${s.uid}`, label: s.name, sub: bits.join(' · '), dice, fixed: s.fixed, penetrates: s.penetrates, area: s.area, element: s.element,
      range: s.range, special: s, effectOnly,
      blocked: s.spent ? 'já descartada' : s.ready > 0 ? `volta em ${s.ready} rodada(s)` : undefined,
      note: s.needs === 'target' ? 'gasta a ficha de Alvo' : s.needs === 'concentrate' ? 'gasta a ficha de Concentração' : s.discards ? 'descarta a carta' : s.dts ? `${s.dts} fichas de duração` : s.disables ? 'desativa a carta' : undefined,
    });
  }
  return out;
}

function PlayerAttack({ u, enemies, pos, update, tr, onDone }: {
  m: Match; u: Unit; enemies: Unit[]; pos: string; update(fn: (m: Match) => void): void; tr(uid: number, t: string): string; onDone(o: Outcome): void;
}) {
  const weapons = weaponsOf(u);
  const [wk, setWk] = useState<string | null>(weapons.length === 1 ? weapons[0].key : null);
  const [targets, setTargets] = useState<string[]>([]);
  const [ranges, setRanges] = useState<Record<string, Dist>>({});
  const [rolls, setRolls] = useState<Record<string, { h: number; c: number }>>({});
  const w = weapons.find((x) => x.key === wk);
  const auto = hasTable() ? arcsFromTable(u, enemies, loadTable().poses) : {};
  const toggle = (id: string) => {
    const a = auto[id];
    if (a?.range) setRanges((r) => ({ ...r, [id]: a.range as Dist }));
    setTargets((t) => (w?.area ? (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]) : [id]));
  };
  const ready = !!w && targets.length > 0 && targets.every((id) => ranges[id]);
  const fire = () => {
    if (!w) return;
    const lines: string[] = [];
    const defFaces: DefFace[] = [];
    const notes: string[] = [];
    const results = targets.map((id) => {
      const t = enemies.find((e) => e.id === id)!;
      if (w.effectOnly) { lines.push(`Aplique em ${t.name} o efeito da carta.`); return { id, normal: 0, crit: 0, used: false, conc: false }; }
      if (w.fixed && !w.dice) { lines.push(`${t.name} recebe ${w.fixed} de dano normal, sem defesa.`); return { id, normal: w.fixed, crit: 0, used: false, conc: false }; }
      const d = aiDefenseRoll(t.agility, ranges[id], t.tokens, Math.random);
      const resist = !!w.element && t.element === w.element;
      defFaces.push(...d.roll);
      notes.push(...d.notes.map((n) => `${t.name}: ${n}`));
      if (resist) notes.push(`${t.name} resiste a ${w.element}: +1 esquiva.`);
      const r = rolls[id] ?? { h: 0, c: 0 };
      const res = resolveDamage(r.h, r.c, d.dodges + (resist ? 1 : 0), w.penetrates ? 0 : t.armor);
      lines.push(res.normal + res.crit === 0 ? `${t.name} não sofre dano (${d.dodges + (resist ? 1 : 0)} esquiva(s)).` : `Coloque ${res.normal} carta(s) de dano virada(s) para baixo e ${res.crit} virada(s) para cima em ${t.name}.${res.blocked ? ` A Armadura parou ${res.blocked}.` : ''}`);
      return { id, normal: res.normal, crit: res.crit, used: !!t.tokens.dodge, conc: !!t.tokens.concentrate && d.roll.includes('eye') };
    });
    update((mm) => {
      for (const r of results) {
        const x = mm.units.find((y) => y.id === r.id)!;
        x.dmg += r.normal; x.crit += r.crit;
        if (r.used) x.tokens.dodge = false;
        if (r.conc) x.tokens.concentrate = false;
        mm.log.push(`${u.name} usou ${w.label} em ${x.name}: ${r.normal} de dano e ${r.crit} crítico(s).`);
      }
      const me = mm.units.find((y) => y.id === u.id)!;
      if (w.special) {
        paySpecial(me, me.specials!.find((q) => q.uid === w.special!.uid)!);
      }
    });
    onDone({ title: `${u.name} usa ${w.label}`, def: defFaces, notes: w.special ? [tr(w.special.uid, w.special.text), ...notes] : notes, text: lines.join(' ') });
  };
  return (
    <section className="ai-card ai-ask">
      <p className="ai-kicker">{pos}</p>
      <h2>Sua vez de atacar: <span className="ai-name is-me">{u.name}</span></h2>
      <h3>Com qual ataque?</h3>
      <div className="ai-tiles ai-weapons">
        {weapons.map((x) => (
          <button key={x.key} type="button" disabled={!!x.blocked} className={`ai-tile ai-weapon${wk === x.key ? ' is-on' : ''}${x.special ? ' is-special' : ''}`} onClick={() => { setWk(x.key); setTargets([]); }}>
            <span className="ai-tile-main">{x.label}</span>
            <span className="ai-tile-sub">{x.blocked ?? x.sub}</span>
            {x.note && !x.blocked && <span className="ai-tile-note">{x.note}</span>}
          </button>
        ))}
      </div>
      {w?.special && <details className="ai-cardtext"><summary>Texto da carta</summary><p>{tr(w.special.uid, w.special.text).replace(/\*/g, '')}</p></details>}
      {w && (
        <>
          <h3>{w.area ? `Quem está dentro do gabarito (${AREA_PT[w.area]})? Toque em todas.` : 'Qual criatura da IA ela ataca?'}</h3>
          <div className="ai-tiles">
            {enemies.map((e) => {
              const a = auto[e.id];
              const hint = a ? (a.range ? `Alcance ${a.range}, ${a.arc === 'F' ? 'à frente' : a.arc === 'B' ? 'atrás' : 'ao lado'}` : 'fora de alcance') : `${left(e)} de vida`;
              return <Tile key={e.id} on={targets.includes(e.id)} onClick={() => toggle(e.id)} sub={`${hint} · Agil. ${e.agility} · Arm. ${e.armor}`}>{e.name}</Tile>;
            })}
          </div>
          {targets.map((id) => {
            const t = enemies.find((e) => e.id === id)!;
            return (
              <div key={id} className="ai-hit">
                <h3>Contra <span className="ai-name">{t.name}</span></h3>
                <div className="ai-tiles ai-tiles-4">{DISTS.map((d) => <Tile key={d.d} on={ranges[id] === d.d} onClick={() => setRanges((r) => ({ ...r, [id]: d.d }))}><span className="ai-ruler">{'▮'.repeat(d.d)}</span>Alcance {d.d}</Tile>)}</div>
                {!w.effectOnly && !(w.fixed && !w.dice) && (
                  <>
                    <p>Role <strong>{w.dice} dado(s) de ataque</strong>{w.area ? ' só contra ela' : ''}, aplique as suas fichas e informe o resultado final.</p>
                    <div className="ai-steps">
                      <Stepper label="Acertos" value={rolls[id]?.h ?? 0} set={(n) => setRolls((r) => ({ ...r, [id]: { h: n, c: r[id]?.c ?? 0 } }))} icon="hit" />
                      <Stepper label="Críticos" value={rolls[id]?.c ?? 0} set={(n) => setRolls((r) => ({ ...r, [id]: { h: r[id]?.h ?? 0, c: n } }))} icon="critical" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
      <div className="ai-actions">
        <button className="btn btn-ghost" onClick={() => onDone({ title: `${u.name} não ataca`, notes: [], text: 'Sem ataque nesta rodada.' })}>Não vai atacar</button>
        <button className="btn btn-primary" disabled={!ready} onClick={fire}>{w?.effectOnly ? 'Aplicar' : 'A IA defende'}</button>
      </div>
    </section>
  );
}

function CombatStep({ m, update }: { m: Match; update(fn: (m: Match) => void): void }) {
  const order = turnOrder(m.units, 'combate', m.initiative);
  const u = order[m.step];
  const enemies = m.units.filter((x) => x.alive && x.side !== u?.side);
  const tr = useTr();
  const [answers, setAnswers] = useState<Record<string, ArcAnswer>>({});
  const [target, setTarget] = useState<string | null>(null);
  const [range, setRange] = useState<Dist | null>(null);
  const [hits, setHits] = useState(0);
  const [crits, setCrits] = useState(0);
  const [dodges, setDodges] = useState<Record<string, number>>({});
  const [stage, setStage] = useState<'ask' | 'defend' | 'done'>('ask');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  useEffect(() => { setAnswers({}); setTarget(null); setRange(null); setHits(0); setCrits(0); setDodges({}); setStage('ask'); setOutcome(null); setPending(null); }, [u?.id, m.round]);
  if (!u) return null;

  const advance = () => update((mm) => {
    if (mm.step + 1 < order.length) mm.step += 1;
    else { mm.phase = 'fim'; mm.step = 0; }
  });
  const pos = `Combate · ${m.step + 1} de ${order.length} · nível ${u.level}`;
  const rearMax = Math.max(0, ...u.attacks.filter((a) => a.arc === 'Rear').map((a) => a.range), ...(u.specials ?? []).filter((s) => s.kind === 'attack' && s.arc !== 'F' && !s.spent).map((s) => s.range));

  if (u.side === 'ai') {
    if (stage === 'ask') {
      const decide = () => {
        const ans = hasTable() ? arcsFromTable(u, enemies, loadTable().poses) : answers;
        if (hasTable()) setAnswers(ans);
        const plan = planAttack(u, enemies, ans);
        if (!plan) {
          setOutcome({ title: `${u.name} não ataca`, notes: [], text: 'Nenhum inimigo está no arco e no alcance das armas dela.' });
          setStage('done');
          return;
        }
        const tokens = { ...u.tokens };
        if (plan.special?.needs === 'target') tokens.target = false;
        if (plan.special?.needs === 'concentrate') tokens.concentrate = false;
        let usedT = false, usedC = false;
        const rolls: Roll[] = plan.targets.map((t, i) => {
          if (!plan.dice) return { targetId: t.id, first: [], atk: [], notes: [] };
          const r = aiAttackRoll(plan.dice, i === 0 ? tokens : {}, Math.random);
          if (i === 0) { usedT = r.usedTarget; usedC = r.usedConcentrate; }
          return { targetId: t.id, first: r.first, atk: r.final, notes: r.notes };
        });
        update((mm) => {
          const x = mm.units.find((y) => y.id === u.id)!;
          if (usedT) x.tokens.target = false;
          if (usedC) x.tokens.concentrate = false;
          if (plan.special) { const sp = x.specials!.find((q) => q.uid === plan.special!.uid)!; paySpecial(x, sp); }
        });
        setPending({ plan, rolls });
        if (plan.effectOnly || (!plan.dice && plan.fixed)) {
          const lines = plan.targets.map((t) => plan.fixed ? `${t.name} recebe ${plan.fixed} de dano normal, sem defesa.` : `Aplique em ${t.name} o efeito da carta.`);
          if (plan.fixed) update((mm) => { for (const t of plan.targets) { const x = mm.units.find((y) => y.id === t.id)!; x.dmg += plan.fixed; } mm.log.push(`${u.name} usou ${plan.label}.`); });
          else update((mm) => { mm.log.push(`${u.name} usou ${plan.label} em ${plan.targets.map((t) => t.name).join(', ')}.`); });
          setOutcome({ title: `${u.name} usa ${plan.label}`, notes: [tr(plan.special!.uid, plan.special!.text)], text: lines.join(' ') });
          setStage('done');
          return;
        }
        setStage('defend');
      };
      return (
        <section className="ai-card ai-ask">
          <p className="ai-kicker">{pos}</p>
          <h2>A IA ataca com <span className="ai-name">{u.name}</span></h2>
          {(u.specials ?? []).some((s) => s.kind === 'attack') && (
            <p className="muted">Ataques de melhoria: {(u.specials ?? []).filter((s) => s.kind === 'attack').map((s) => `${s.name}${s.spent ? ' (usada)' : s.ready > 0 ? ` (volta em ${s.ready})` : ''}`).join(', ')}.</p>
          )}
          {hasTable() ? (
            <ul className="ai-readout">
              {Object.entries(arcsFromTable(u, enemies, loadTable().poses)).map(([id, a]) => {
                const e = enemies.find((x) => x.id === id)!;
                return <li key={id}><strong>{e.name}</strong>: {a.range ? `Alcance ${a.range}` : 'fora de alcance'}, {a.arc === 'F' ? 'no arco frontal' : a.arc === 'B' ? 'no arco traseiro' : 'ao lado'}</li>;
              })}
            </ul>
          ) : (<>
          <h3>Para cada criatura sua: onde ela está em relação a {u.name}?</h3>
          <div className="ai-arcs">
            {enemies.map((e) => {
              const a = answers[e.id] ?? { range: 0, arc: 'F' };
              const set = (p: Partial<ArcAnswer>) => setAnswers((s) => ({ ...s, [e.id]: { ...a, ...p } }));
              return (
                <div key={e.id} className="ai-arc-row">
                  <strong>{e.name}{e.flyer ? <small> · {e.air ? 'no ar' : 'no solo'}</small> : null}</strong>
                  <div className="ai-tiles ai-tiles-row">
                    <Tile on={!a.range} onClick={() => set({ range: 0 })} tone="mute">Fora</Tile>
                    {([1, 2, 3, 4] as Dist[]).map((d) => <Tile key={d} on={a.range === d && a.arc === 'F'} onClick={() => set({ range: d, arc: 'F' })} sub="à frente">↑ {d}</Tile>)}
                    {([1, 2, 3, 4] as Dist[]).filter((d) => d <= rearMax).map((d) => <Tile key={`b${d}`} on={a.range === d && a.arc === 'B'} onClick={() => set({ range: d, arc: 'B' })} sub="atrás ou ao lado">↓ {d}</Tile>)}
                  </div>
                </div>
              );
            })}
          </div>
          </>)}
          <div className="ai-actions">
            <button className="btn btn-primary" onClick={decide}>A IA decide e rola</button>
          </div>
        </section>
      );
    }
    if (stage === 'defend' && pending) {
      const { plan, rolls } = pending;
      const finish = () => {
        const lines: string[] = [];
        const results = rolls.map((r) => {
          const t = m.units.find((y) => y.id === r.targetId)!;
          const h = r.atk.filter((f) => f === 'hit').length, c = r.atk.filter((f) => f === 'crit').length;
          const res = resolveDamage(h, c, dodges[r.targetId] ?? 0, plan.penetrates ? 0 : t.armor);
          lines.push(res.normal + res.crit === 0 ? `${t.name} não sofre dano.` : `${t.name} recebe ${res.normal} carta(s) de dano virada(s) para baixo e ${res.crit} virada(s) para cima.${res.blocked ? ` A Armadura parou ${res.blocked}.` : ''}`);
          return { id: t.id, name: t.name, res };
        });
        update((mm) => {
          for (const x of results) {
            const t = mm.units.find((y) => y.id === x.id)!;
            t.dmg += x.res.normal; t.crit += x.res.crit;
            mm.log.push(`${u.name} usou ${plan.label} em ${x.name}: ${x.res.normal} de dano e ${x.res.crit} crítico(s).`);
          }
        });
        setOutcome({ title: `${u.name} usa ${plan.label}`, notes: plan.special ? [tr(plan.special.uid, plan.special.text)] : [], text: lines.join(' ') });
        setStage('done');
      };
      return (
        <section className="ai-card ai-ask ai-reveal">
          <p className="ai-kicker">{pos}</p>
          <h2><span className="ai-name">{u.name}</span> usa <span className="ai-name">{plan.label}</span></h2>
          {plan.area && <p className="ai-callout">Ataque em área: <strong>{AREA_PT[plan.area]}</strong>{plan.special ? ` de Alcance ${plan.special.range}` : ''}, contra criaturas <strong>{plan.level === 'air' ? 'no ar' : 'no solo'}</strong>. Posicione o gabarito e confira: cada criatura dentro dele sofre um ataque separado.</p>}
          {plan.penetrates && <p className="ai-callout">Este ataque atravessa a Armadura.</p>}
          {plan.special && <details className="ai-cardtext"><summary>Texto da carta</summary><p>{tr(plan.special.uid, plan.special.text).replace(/\*/g, '')}</p></details>}
          {rolls.map((r) => {
            const t = m.units.find((y) => y.id === r.targetId)!;
            const h = r.atk.filter((f) => f === 'hit').length, c = r.atk.filter((f) => f === 'crit').length;
            const resist = !!plan.element && t.element === plan.element;
            const range = answers[t.id]?.range as Dist;
            return (
              <div key={r.targetId} className="ai-hit">
                <h3>Contra <span className="ai-name is-me">{t.name}</span> · Alcance {range}</h3>
                {r.notes.length > 0 && <><p className="muted">Primeira rolagem</p><Dice faces={r.first} kind="atk" /></>}
                <Dice faces={r.atk} kind="atk" />
                {r.notes.map((n) => <p key={n} className="muted">{n}</p>)}
                <p><strong>{h} acerto(s) e {c} crítico(s).</strong> Role {t.agility + (range === 4 ? 1 : 0)} dado(s) de defesa{resist ? ' e some 1 esquiva pela resistência à energia' : ''}, aplique as suas fichas e informe as esquivas.</p>
                <Stepper label="Esquivas" value={dodges[r.targetId] ?? 0} set={(n) => setDodges((d) => ({ ...d, [r.targetId]: n }))} icon="dodge" />
              </div>
            );
          })}
          <div className="ai-actions"><button className="btn btn-primary" onClick={finish}>Calcular o dano</button></div>
        </section>
      );
    }
  }

  if (u.side === 'me' && stage === 'ask') {
    return <PlayerAttack m={m} u={u} enemies={enemies} pos={pos} update={update} tr={tr} onDone={(o) => { setOutcome(o); setStage('done'); }} />;
  }

  return (
    <section className="ai-card ai-ask ai-reveal">
      <p className="ai-kicker">{pos}</p>
      <h2>{outcome?.title}</h2>
      {outcome?.atk && <Dice faces={outcome.atk} kind="atk" />}
      {outcome?.def && <><p className="muted">Defesa da IA</p><Dice faces={outcome.def} kind="def" /></>}
      {outcome?.notes.map((n) => <p key={n} className="muted">{n.replace(/\*/g, '')}</p>)}
      <p className="ai-result">{outcome?.text}</p>
      <div className="ai-actions"><button className="btn btn-primary" onClick={advance}>Próximo ataque</button></div>
    </section>
  );
}

/* ---------- fase final ---------- */

function EndStep({ m, update }: { m: Match; update(fn: (m: Match) => void): void }) {
  const doomed = m.units.filter((u) => u.alive && u.dmg + u.crit >= u.health);
  const close = () => update((mm) => {
    for (const u of mm.units) {
      if (u.alive && u.dmg + u.crit >= u.health) { u.alive = false; mm.log.push(`${u.name} foi derrotada.`); }
      u.tokens = { exhausted: u.tokens.exhausted };
      tickSpecials(u);
    }
    const me = mm.units.some((u) => u.side === 'me' && u.alive);
    const ai = mm.units.some((u) => u.side === 'ai' && u.alive);
    if (!me || !ai) { mm.phase = 'acabou'; return; }
    mm.round += 1; mm.phase = 'situacao'; mm.step = 0;
  });
  return (
    <section className="ai-card ai-ask">
      <p className="ai-kicker">Fase final · rodada {m.round}</p>
      <h2>Fim da rodada</h2>
      {doomed.length ? <p>Saem da mesa: <strong>{doomed.map((u) => u.name).join(', ')}</strong>.</p> : <p>Ninguém foi derrotado nesta rodada.</p>}
      <p className="muted">Tirem as fichas de Esquiva, Alvo, Concentração e Investida que sobraram.</p>
      <div className="ai-actions"><button className="btn btn-primary" onClick={close}>Começar a próxima rodada</button></div>
    </section>
  );
}

const hasTable = () => { try { return localStorage.getItem('aw:showTable') === '1' && Object.keys(loadTable().poses).length > 0; } catch { return false; } };

function MatchTable({ m, update }: { m: Match; update(fn: (m: Match) => void): void }) {
  const [poses, setPosesState] = useState<Record<string, Pose>>(() => {
    const t = loadTable();
    const missing = m.units.some((u) => u.alive && !t.poses[u.id]);
    if (missing) { const d = deploy(m.units); t.poses = { ...d, ...t.poses }; saveTable(t); }
    return t.poses;
  });
  useEffect(() => {
    const on = () => setPosesState(loadTable().poses);
    window.addEventListener('aw-table', on);
    return () => window.removeEventListener('aw-table', on);
  }, []);
  const setPoses = (p: Record<string, Pose>) => { setPosesState(p); saveTable({ poses: p }); };
  return (
    <section className="ai-card">
      <div className="ai-table-head">
        <h2>Mesa</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => setPoses(deploy(m.units))}>Reposicionar nas áreas iniciais</button>
      </div>
      <TableBoard units={m.units} poses={poses} setPoses={setPoses} onAltitude={(id, air) => update((mm) => { mm.units.find((x) => x.id === id)!.air = air; })} />
    </section>
  );
}

function activeUnit(m: Match): Unit | undefined {
  if (m.phase === 'ativacao') return turnOrder(m.units, 'ativacao', m.initiative)[m.step];
  if (m.phase === 'combate') return turnOrder(m.units, 'combate', m.initiative)[m.step];
  if (m.phase === 'situacao') return m.units.filter((u) => u.side === 'ai' && u.alive)[m.step];
  return undefined;
}

function UnitCards({ u }: { u: Unit }) {
  const data = catalog.creatures.find((c) => c.uid === u.uid);
  const ups = (u.upgradeUids ?? []).map((id) => catalog.upgrades.find((x) => x.uid === id)).filter(Boolean);
  if (!data) return null;
  return (
    <section className="ai-card">
      <div className="ai-table-head">
        <h2>Cartas de <span className={`ai-name${u.side === 'me' ? ' is-me' : ''}`}>{u.name}</span></h2>
        <span className="muted">{u.side === 'ai' ? 'Legião da IA' : 'Sua legião'} · {left(u)}/{u.health} de vida</span>
      </div>
      <div className="ai-cards">
        <CreatureCard data={data} full />
        {ups.map((x) => <UpgradeCard key={x!.uid} data={x!} full />)}
      </div>
    </section>
  );
}

/* ---------- página ---------- */

export function CompanionPage() {
  const [m, setM] = useState<Match | null>(load);
  useEffect(() => { document.title = 'Jogar contra a IA · Attack Wing'; }, []);
  useEffect(() => save(m), [m]);
  const [history, setHistory] = useState<Match[]>([]);
  const [viewId, setViewId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState<boolean>(() => { try { return localStorage.getItem('aw:showTable') === '1'; } catch { return false; } });
  
  const update = (fn: (mm: Match) => void) => setM((cur) => {
    if (!cur) return cur;
    setHistory((h) => [...h.slice(-19), cur]);
    const next: Match = JSON.parse(JSON.stringify(cur)); fn(next); return next;
  });
  const undo = () => setHistory((h) => { if (!h.length) return h; setM(h[h.length - 1]); return h.slice(0, -1); });

  const active = m ? activeUnit(m) : undefined;
  useEffect(() => { setViewId(null); }, [active?.id]);
  const viewed = m ? m.units.find((x) => x.id === viewId) ?? active : undefined;
  const winner = m?.phase === 'acabou' ? (m.units.some((u) => u.side === 'me' && u.alive) ? 'Você venceu.' : m.units.some((u) => u.side === 'ai' && u.alive) ? 'A IA venceu.' : 'Empate: as duas legiões caíram.') : null;

  return (
    <Shell>
      <div className="ai-page">
        <header className="ai-head">
          <div>
            <h1>Jogar contra a IA</h1>
            <p>Você joga na mesa com as miniaturas e conta o que vê. A IA decide as manobras, as ações e os ataques das criaturas dela, rola os dados e calcula o dano.</p>
          </div>
          {m && (
            <div className="ai-head-btns">
              <button className={`btn ${showTable ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { const t = loadTable(); if (m.units.some((u) => u.alive && !t.poses[u.id])) saveTable({ poses: { ...deploy(m.units), ...t.poses } }); setShowTable((v) => { try { localStorage.setItem('aw:showTable', v ? '0' : '1'); } catch { /* */ } return !v; }); }}>{showTable ? 'Esconder a mesa' : 'Usar a mesa virtual'}</button>
              <button className="btn btn-ghost" disabled={!history.length} onClick={undo}>Desfazer</button>
              <button className="btn btn-ghost" onClick={() => { if (confirm('Encerrar esta partida?')) { setM(null); setHistory([]); saveTable({ poses: {} }); } }}>Nova partida</button>
            </div>
          )}
        </header>

        {!m && <Setup onStart={(mm) => { saveTable({ poses: {} }); setM(mm); }} />}

        {m && (
          <div className="ai-board">
            <aside className="ai-roster" aria-label="Criaturas em jogo">
              <p className="ai-round">Rodada <span className="num">{m.round}</span></p>
              <h3>Legião da IA</h3>
              {m.units.filter((u) => u.side === 'ai').map((u) => <UnitChip key={u.id} u={u} on={u.id === viewed?.id} onClick={() => setViewId(u.id)} />)}
              <h3>Sua legião</h3>
              {m.units.filter((u) => u.side === 'me').map((u) => <UnitChip key={u.id} u={u} on={u.id === viewed?.id} onClick={() => setViewId(u.id)} />)}
            </aside>
            <div className="ai-main">
              <ol className="ai-phases" aria-label="Fases da rodada">
                {(['situacao', 'planejamento', 'ativacao', 'combate', 'fim'] as Phase[]).map((p, i) => (
                  <li key={p} className={m.phase === p ? 'is-on' : ''}><span className="num">{i + 1}</span>{['Leitura', 'Planejamento', 'Ativação', 'Combate', 'Final'][i]}</li>
                ))}
              </ol>
              {m.phase === 'situacao' && <SituationStep m={m} update={update} />}
              {m.phase === 'planejamento' && (
                <section className="ai-card ai-ask">
                  <p className="ai-kicker">Planejamento · rodada {m.round}</p>
                  <h2>A IA já girou os discos</h2>
                  <div className="ai-sealed">
                    {m.units.filter((u) => u.side === 'ai' && u.alive).map((u) => <div key={u.id} className="ai-disc"><span>?</span><small>{u.name}</small></div>)}
                  </div>
                  <p>As manobras dela ficam escondidas até a ativação. Escolha agora as manobras das suas criaturas nos discos físicos.</p>
                  <div className="ai-actions"><button className="btn btn-primary" onClick={() => update((mm) => { mm.phase = 'ativacao'; mm.step = 0; mm.feed = []; runAiActivations(mm); })}>Meus discos estão prontos</button></div>
                </section>
              )}
              {m.phase === 'ativacao' && <ActivationStep m={m} update={update} />}
              {m.phase === 'combate' && <CombatStep m={m} update={update} />}
              {m.phase === 'fim' && <EndStep m={m} update={update} />}
              {m.phase === 'acabou' && (
                <section className="ai-card ai-ask ai-reveal">
                  <h2>{winner}</h2>
                  <p>A partida durou {m.round} rodada(s).</p>
                  <div className="ai-actions"><button className="btn btn-primary" onClick={() => setM(null)}>Jogar de novo</button></div>
                </section>
              )}
              {viewed && <UnitCards u={viewed} />}
              {showTable && <MatchTable m={m} update={update} />}
              <details className="ai-log">
                <summary>Histórico da partida</summary>
                <ol>{m.log.map((l, i) => <li key={i}>{l}</li>)}</ol>
              </details>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
