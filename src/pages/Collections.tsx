import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CreatureData, UpgradeData } from '../engine/types';
import { catalog, useStore } from '../store';
import { Shell } from '../ui/Shell';
import { GameIcon, SLOT_LABEL } from '../ui/bits';

/* Organizador das coleções: cada produto (caixa básica e expansões) agrupado pela onda em que saiu,
   com as miniaturas e todas as cartas que vêm na caixa, para consultar e separar as cartas físicas. */

type Group = { id: string; title: string; note: string; order: number };

function normWave(w: string | null | undefined): string {
  const s = String(w ?? '').trim();
  if (s === 'Wave 0' || s === 'Starter') return 'Starter';
  if (/^op\s*\d+/i.test(s)) return `OP ${s.replace(/\D/g, '')}`;
  if (/^Premium/.test(s)) return 'Premium';
  return s;
}

function groupOf(wave: string): Group {
  if (wave === 'Starter') return { id: 'starter', title: 'Caixa básica', note: 'Starter Set, 2014', order: 0 };
  const n = Number(wave.replace(/\D/g, ''));
  if (wave.startsWith('Wave')) return { id: `w${n}`, title: `Onda ${n}`, note: 'Expansões vendidas no varejo', order: n };
  if (wave.startsWith('Booster')) return { id: 'booster', title: 'Booster de personagens', note: 'Heróis humanoides com cartas avulsas', order: 50 };
  if (wave === 'Premium') return { id: 'premium', title: 'Miniaturas premium', note: 'Peças grandes vendidas à parte', order: 60 };
  if (wave === 'Grand Prize') return { id: 'grand', title: 'Prêmio do Organized Play', note: 'Prêmio principal de torneio', order: 99 };
  return { id: 'op', title: 'Organized Play (torneios)', note: 'Kits mensais de loja, com prêmio de participação', order: 90 };
}

interface Box {
  set: string;
  wave: string;
  creatures: CreatureData[];
  upgrades: UpgradeData[];
}

const KEY = 'aw:sorted';
const loadSorted = (): Record<string, boolean> => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; } };

function buildBoxes(): Box[] {
  const map = new Map<string, Box>();
  const waveCount = new Map<string, Map<string, number>>();
  const add = (set: string, wave: string) => {
    const m = waveCount.get(set) ?? new Map();
    m.set(wave, (m.get(wave) ?? 0) + 1);
    waveCount.set(set, m);
  };
  for (const c of catalog.creatures) add(c.set, normWave(c.wave));
  for (const u of catalog.upgrades) add(u.set, normWave(u.wave));
  // "OP Participation" muda de mês para mês: separa pela onda de OP
  const key = (set: string, wave: string) => (set === 'OP Participation' ? `${set}|${wave}` : set);
  const waveOf = (set: string, wave: string) => {
    if (set === 'OP Participation') return wave;
    const m = waveCount.get(set)!;
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };
  const get = (set: string, wave: string) => {
    const k = key(set, wave);
    if (!map.has(k)) map.set(k, { set: set === 'OP Participation' ? `Kit de participação ${wave}` : set, wave: waveOf(set, wave), creatures: [], upgrades: [] });
    return map.get(k)!;
  };
  for (const c of catalog.creatures) get(c.set, normWave(c.wave)).creatures.push(c);
  for (const u of catalog.upgrades) get(u.set, normWave(u.wave)).upgrades.push(u);
  return [...map.values()];
}

const SET_PT: Record<string, string> = { Starter: 'Caixa básica' };

export function CollectionsPage() {
  const { settings, setSettings } = useStore();
  const boxes = useMemo(buildBoxes, []);
  const [q, setQ] = useState('');
  const [only, setOnly] = useState<'todas' | 'minhas'>('todas');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [sorted, setSorted] = useState<Record<string, boolean>>(loadSorted);
  useEffect(() => { document.title = 'Coleções · Attack Wing'; }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(sorted)); } catch { /* */ } }, [sorted]);

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const g = new Map<string, { group: Group; boxes: Box[] }>();
    for (const b of boxes) {
      const baseSet = b.set.startsWith('Kit de participação') ? 'OP Participation' : b.set;
      if (only === 'minhas' && settings.sets[baseSet] === false) continue;
      if (term) {
        const hay = [b.set, ...b.creatures.map((c) => c.name), ...b.upgrades.map((u) => u.name)].join(' ').toLowerCase();
        if (!hay.includes(term)) continue;
      }
      const gr = groupOf(b.wave);
      if (!g.has(gr.id)) g.set(gr.id, { group: gr, boxes: [] });
      g.get(gr.id)!.boxes.push(b);
    }
    for (const v of g.values()) v.boxes.sort((a, b) => a.wave.localeCompare(b.wave, 'en', { numeric: true }) || b.creatures.length - a.creatures.length || a.set.localeCompare(b.set));
    return [...g.values()].sort((a, b) => a.group.order - b.group.order);
  }, [boxes, q, only, settings.sets]);

  const totalCards = boxes.reduce((t, b) => t + b.creatures.length + b.upgrades.length, 0);
  const sortedCount = Object.values(sorted).filter(Boolean).length;
  const toggle = (id: string) => setSorted((s) => ({ ...s, [id]: !s[id] }));
  const boxKey = (b: Box) => b.set;

  return (
    <Shell>
      <div className="col-page">
        <header className="col-head">
          <div>
            <h1>Coleções</h1>
            <p>A caixa básica e todas as expansões, agrupadas pela onda em que saíram. Cada caixa lista as miniaturas e as cartas que vêm nela. Marque as cartas já separadas para organizar a sua coleção física.</p>
          </div>
          <div className="col-stats">
            <span className="num">{boxes.length}</span> produtos
            <span className="num">{totalCards}</span> cartas
            <span className="num">{sortedCount}</span> separadas
          </div>
        </header>

        <div className="col-tools no-print">
          <input type="search" className="col-search" placeholder="Buscar caixa, criatura ou carta" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
          <div className="col-seg" role="group" aria-label="Quais coleções">
            <button className={only === 'todas' ? 'is-on' : ''} onClick={() => setOnly('todas')}>Todas</button>
            <button className={only === 'minhas' ? 'is-on' : ''} onClick={() => setOnly('minhas')}>Só as que tenho</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(Object.fromEntries(boxes.map((b) => [boxKey(b), true])))}>Abrir todas</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen({})}>Fechar todas</button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Imprimir lista</button>
        </div>

        <nav className="col-jump no-print" aria-label="Ir para a onda">
          {groups.map(({ group }) => <a key={group.id} href={`#g-${group.id}`}>{group.title}</a>)}
        </nav>

        {groups.map(({ group, boxes: list }) => (
          <section key={group.id} id={`g-${group.id}`} className="col-group">
            <h2>{group.title} <small>{group.note} · {list.length} produto(s)</small></h2>
            <div className="col-boxes">
              {list.map((b) => {
                const k = boxKey(b);
                const ids = [...b.creatures.map((c) => `c${c.uid}`), ...b.upgrades.map((u) => `u${u.uid}`)];
                const done = ids.filter((id) => sorted[id]).length;
                const isOpen = !!open[k] || !!q.trim();
                const baseSet = b.set.startsWith('Kit de participação') ? 'OP Participation' : b.set;
                const owned = settings.sets[baseSet] !== false;
                const minis = b.creatures.filter((c) => c.unique || b.creatures.length <= 2);
                return (
                  <article key={k} className={`col-box${done === ids.length && ids.length ? ' is-done' : ''}`}>
                    <header className="col-box-head" onClick={() => setOpen((o) => ({ ...o, [k]: !isOpen }))}>
                      <div>
                        <h3>{SET_PT[b.set] ?? b.set}</h3>
                        <p className="muted">
                          {b.wave.replace('Wave', 'Onda').replace('Starter', 'Caixa básica')} · {b.creatures.length} carta(s) de criatura · {b.upgrades.length} melhoria(s)
                        </p>
                        {b.creatures.length > 0 && <p className="col-minis">Miniaturas: {[...new Set((minis.length ? minis : b.creatures).map((c) => c.name.replace(/\s+\d+$/, '')))].join(', ')}</p>}
                      </div>
                      <div className="col-box-side">
                        <div className="col-progress" aria-label={`${done} de ${ids.length} separadas`}><span style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} /></div>
                        <span className="num muted">{done}/{ids.length}</span>
                        <span className="col-caret" aria-hidden>{isOpen ? '▾' : '▸'}</span>
                      </div>
                    </header>
                    {isOpen && (
                      <div className="col-box-body">
                        <div className="col-row-tools no-print">
                          <label className="check"><input type="checkbox" checked={owned} onChange={(e) => setSettings({ sets: { ...settings.sets, [baseSet]: e.target.checked } })} /> <span>Tenho esta coleção</span></label>
                          <button className="text-btn" onClick={() => setSorted((s) => ({ ...s, ...Object.fromEntries(ids.map((id) => [id, true])) }))}>Marcar todas como separadas</button>
                          <button className="text-btn" onClick={() => setSorted((s) => ({ ...s, ...Object.fromEntries(ids.map((id) => [id, false])) }))}>Desmarcar</button>
                        </div>
                        {b.creatures.length > 0 && (
                          <>
                            <h4>Criaturas</h4>
                            <ul className="col-cards">
                              {[...b.creatures].sort((x, y) => x.uid - y.uid).map((c) => (
                                <li key={c.uid} className={sorted[`c${c.uid}`] ? 'is-sorted' : ''}>
                                  <input type="checkbox" checked={!!sorted[`c${c.uid}`]} onChange={() => toggle(`c${c.uid}`)} aria-label={`${c.name} separada`} />
                                  <GameIcon type={c.alignment} color size={20} />
                                  <Link to={`/card/creature/${c.uid}`} className="col-name">{c.name}</Link>
                                  <span className="col-type">{c.classtype}{c.unique ? ' · única' : ''}</span>
                                  <span className="col-meta num">Nv {c.level} · {c.cost} pts · base {c.base === 'Large' ? 'grande' : c.base === 'Huge' ? 'enorme' : 'pequena'}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {b.upgrades.length > 0 && (
                          <>
                            <h4>Melhorias</h4>
                            <ul className="col-cards">
                              {[...b.upgrades].sort((x, y) => x.uid - y.uid).map((u) => (
                                <li key={u.uid} className={sorted[`u${u.uid}`] ? 'is-sorted' : ''}>
                                  <input type="checkbox" checked={!!sorted[`u${u.uid}`]} onChange={() => toggle(`u${u.uid}`)} aria-label={`${u.name} separada`} />
                                  <GameIcon type={u.upgrade} size={20} title={SLOT_LABEL[u.upgrade]} />
                                  <Link to={`/card/upgrade/${u.uid}`} className="col-name">{u.name}</Link>
                                  <span className="col-type">{SLOT_LABEL[u.upgrade] ?? u.upgrade}{u.unique ? ' · única' : ''}{u.artifact ? ' · artefato' : ''}</span>
                                  <span className="col-meta num">{u.cost} pts</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Shell>
  );
}
