import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PRINT_SLOT_ABBR, type Creature, type Legion, type Upgrade } from '../engine/engine';
import { ALIGN_LABEL, ARC_LABEL, BASE_LABEL, CardText, GameIcon, ManeuverDial, SLOT_LABEL } from './bits';
import { useStore } from '../store';

type Mode = 'simples' | 'completa';
interface Player {
  name: string;
  email: string;
  date: string;
  event: string;
  mode: Mode;
}

const KEY = 'aw:player';
const readPlayer = (): Player => {
  try {
    return { name: '', email: '', event: '', mode: 'simples', ...JSON.parse(localStorage.getItem(KEY) || '{}'), date: new Date().toLocaleDateString('sv-SE') };
  } catch {
    return { name: '', email: '', event: '', mode: 'simples', date: new Date().toLocaleDateString('sv-SE') };
  }
};

export function PrintDialog({ onClose }: { onClose(): void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [p, setP] = useState<Player>(readPlayer);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const set = (k: keyof Player) => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: e.target.value });

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="print-title">
      <form
        className="dialog-body"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            localStorage.setItem(KEY, JSON.stringify({ name: p.name, email: p.email, event: p.event, mode: p.mode }));
          } catch {
            /* sem armazenamento */
          }
          (window as any).__awPlayer = p;
          window.dispatchEvent(new Event('aw-player'));
          ref.current?.close();
          setTimeout(() => window.print(), 60);
        }}
      >
        <header className="dialog-head">
          <h2 id="print-title">Folha de legião</h2>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => ref.current?.close()}>×</button>
        </header>
        <div className="print-modes" role="radiogroup" aria-label="Versão">
          {([
            ['simples', 'Simplificada', 'Uma página com criaturas, melhorias e custos, para entregar no torneio.'],
            ['completa', 'Completa', 'A lista e, depois, cada carta com atributos, ataques, ações, textos e cartão de manobras, para consultar na mesa.'],
          ] as [Mode, string, string][]).map(([v, l, d]) => (
            <label key={v} className={p.mode === v ? 'style-card is-on' : 'style-card'}>
              <input type="radio" name="print-mode" value={v} checked={p.mode === v} onChange={() => setP({ ...p, mode: v })} />
              <strong>{l}</strong>
              <span>{d}</span>
            </label>
          ))}
        </div>
        <p className="muted">Os dados do jogador saem no topo da folha.</p>
        <div className="settings-grid">
          <label className="field"><span>Jogador</span><input value={p.name} onChange={set('name')} autoComplete="name" /></label>
          <label className="field"><span>E-mail</span><input type="email" value={p.email} onChange={set('email')} autoComplete="email" /></label>
          <label className="field"><span>Data</span><input type="date" value={p.date} onChange={set('date')} /></label>
          <label className="field"><span>Evento</span><input value={p.event} onChange={set('event')} /></label>
        </div>
        <footer className="dialog-foot">
          <button type="button" className="btn btn-secondary" onClick={() => ref.current?.close()}>Cancelar</button>
          <button className="btn btn-primary">Imprimir</button>
        </footer>
      </form>
    </dialog>
  );
}

/* A folha em si: só aparece na impressão. */
export function PrintSheet() {
  const { legion, name } = useStore();
  const [p, setP] = useState<Player>(readPlayer);
  useEffect(() => {
    const on = () => setP((window as any).__awPlayer ?? readPlayer());
    window.addEventListener('aw-player', on);
    return () => window.removeEventListener('aw-player', on);
  }, []);
  const arts = legion.legionArtifacts();

  // Vai direto no body: a moldura do app inteira é escondida na impressão.
  return createPortal(
    <div className="print-sheet" aria-hidden>
      <header>
        <h1>{name}</h1>
        <p>D&D Attack Wing · folha de legião</p>
        <dl>
          <div><dt>Jogador</dt><dd>{p.name || ' '}</dd></div>
          <div><dt>E-mail</dt><dd>{p.email || ' '}</dd></div>
          <div><dt>Data</dt><dd>{p.date || ' '}</dd></div>
          <div><dt>Evento</dt><dd>{p.event || ' '}</dd></div>
        </dl>
      </header>
      <table>
        <thead>
          <tr><th>#</th><th>Carta</th><th>Slot</th><th className="num">Base</th><th className="num">Custo</th></tr>
        </thead>
        <tbody>
          {legion.creatures.map((c, i) => (
            <PrintCreature key={c.key} i={i} c={c} />
          ))}
        </tbody>
        <tfoot>
          {arts.length > 0 && (
            <tr><td /><td colSpan={3}>Artefatos: {arts.map((a) => a.name).join(', ')}</td><td /></tr>
          )}
          <tr><td /><td colSpan={3}><strong>Total da legião</strong> · {legion.totalCards()} cartas</td><td className="num"><strong>{legion.totalCost()}</strong></td></tr>
        </tfoot>
      </table>
      {p.mode === 'completa' && <FullReference legion={legion} />}
    </div>,
    document.body,
  );
}

function PrintCreature({ c, i }: { c: import('../engine/engine').Creature; i: number }) {
  const { legion } = useStore();
  return (
    <>
      <tr className="pc">
        <td>{i + 1}</td>
        <td><strong>{c.name}</strong>{c.originalAlignment ? ' (Evil)' : ''}</td>
        <td />
        <td className="num">{c.cost}</td>
        <td className="num"><strong>{c.totalCost(legion)}</strong></td>
      </tr>
      {c.equippedUpgrades().map((u) => (
        <tr key={u.key} className="pu">
          <td />
          <td>{u.name}</td>
          <td>{PRINT_SLOT_ABBR[c.upgrades[c.equipped.indexOf(u)]] ?? '*'}</td>
          <td />
          <td className="num">{u.costForCreature(c, legion)}</td>
        </tr>
      ))}
    </>
  );
}

/* Versão completa: cada criatura com tudo o que está na carta, seguida das suas melhorias. */
function FullReference({ legion }: { legion: Legion }) {
  return (
    <section className="ps-full">
      <h2 className="ps-full-title">Referência das cartas</h2>
      {legion.creatures.map((c, i) => (
        <PrintCreatureFull key={c.key} c={c} n={i + 1} legion={legion} />
      ))}
    </section>
  );
}

function PrintCreatureFull({ c, n, legion }: { c: Creature; n: number; legion: Legion }) {
  const d = c.data;
  const elements = c.elementsList();
  return (
    <article className="ps-creature">
      <header className="ps-c-head">
        <span className="ps-n">{n}</span>
        <div>
          <h3>{c.name}{c.unique ? ' ◆' : ''}</h3>
          <p>{c.classtype} · {d.set}, {d.wave}</p>
        </div>
        <div className="ps-c-cost">
          <strong>{c.totalCost(legion)}</strong>
          <span>{c.cost} + {c.upgradesCost(legion)} pts</span>
        </div>
      </header>

      <div className="ps-c-body">
        <div className="ps-c-main">
          <p className="ps-facts">
            <span>Nível <b>{c.level}</b></span>
            <span><GameIcon type={c.alignment} color size={14} /> {ALIGN_LABEL[c.alignment]}{c.originalAlignment ? ` (era ${ALIGN_LABEL[c.originalAlignment]})` : ''}</span>
            {elements.map((e) => <span key={e}><GameIcon type={e} color size={14} /> {e}</span>)}
            <span>Base {BASE_LABEL[c.base] ?? c.base}, {c.flyer ? 'voa' : 'terrestre'}</span>
          </p>
          <p className="ps-stats">
            <span><GameIcon type="pwv" color size={16} /> Ataque <b>{c.attack}</b></span>
            <span><GameIcon type="agility" color size={16} /> Agilidade <b>{c.agility}</b></span>
            <span><GameIcon type="health" color size={16} /> Vida <b>{c.health}</b></span>
            <span><GameIcon type="armor" color size={16} /> Armadura <b>{c.baseArmorWithUpgrades()}</b>{c.baseArmorWithUpgrades() !== c.armor ? ` (base ${c.armor})` : ''}</span>
          </p>
          <p className="ps-line ps-attacks">
            <b>Ataques:</b>{' '}
            {d.primary_attacks.map((a, k) => (
              <span key={k}>{k > 0 ? '; ' : ''}{a.description}, {a.type === 'Melee' ? 'corpo a corpo' : 'à distância'}, arco {ARC_LABEL[a.arc] ?? a.arc}, alcance {a.range}</span>
            ))}
          </p>
          <p className="ps-line ps-icons">
            <b>Ações:</b> {c.actions.map((a) => <span key={a}><GameIcon type={a} size={14} /> {a}</span>)}
          </p>
          <p className="ps-line ps-icons">
            <b>Slots:</b> {c.upgrades.map((s, k) => <span key={k}><GameIcon type={s} size={14} /> {SLOT_LABEL[s] ?? s}</span>)}
          </p>
          {d.special && <div className="ps-text"><CardText text={d.special} iconSize={13} /></div>}
        </div>
        <div className="ps-dials">
          <ManeuverDial grid={c.movement?.flight} label="Voo" />
          <ManeuverDial grid={c.movement?.ground} label="Solo" />
        </div>
      </div>

      {c.equippedUpgrades().length > 0 && (
        <div className="ps-ups">
          {c.equippedUpgrades().map((u) => (
            <PrintUpgradeFull key={u.key} u={u} c={c} legion={legion} />
          ))}
        </div>
      )}
    </article>
  );
}

function PrintUpgradeFull({ u, c, legion }: { u: Upgrade; c: Creature; legion: Legion }) {
  const d = u.data;
  const slot = c.upgrades[c.equipped.indexOf(u)];
  const facts = [
    d.level ? `nível ${d.level}+` : null,
    d.element ? d.element : null,
    d.range !== null && d.range !== undefined && d.range !== '' ? `alcance ${d.range}` : null,
    d.arc ? `arco ${ARC_LABEL[d.arc] ?? d.arc}` : null,
    d.area && d.area !== 'false' ? `área ${d.area}` : null,
    d.dts ? `${d.dts} marcadores` : null,
    d.artifact ? `artefato${d.artifactSet ? ` ${d.artifactSet}` : ''}` : null,
    d.unique ? 'única' : null,
  ].filter(Boolean);
  return (
    <div className="ps-up">
      <div className="ps-up-head">
        <GameIcon type={slot} size={18} title={SLOT_LABEL[slot] ?? slot} />
        <h4>{u.name}</h4>
        <span className="ps-up-class">{u.classtype}</span>
        <strong className="ps-up-cost">{u.costForCreature(c, legion)}</strong>
      </div>
      {facts.length > 0 && <p className="ps-up-facts">{facts.join(' · ')}</p>}
      <div className="ps-text"><CardText text={d.text} iconSize={13} /></div>
    </div>
  );
}
