import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PRINT_SLOT_ABBR } from '../engine/engine';
import { useStore } from '../store';

interface Player {
  name: string;
  email: string;
  date: string;
  event: string;
}

const KEY = 'aw:player';
const readPlayer = (): Player => {
  try {
    return { name: '', email: '', event: '', ...JSON.parse(localStorage.getItem(KEY) || '{}'), date: new Date().toLocaleDateString('sv-SE') };
  } catch {
    return { name: '', email: '', event: '', date: new Date().toLocaleDateString('sv-SE') };
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
            localStorage.setItem(KEY, JSON.stringify({ name: p.name, email: p.email, event: p.event }));
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
        <p className="muted">Os dados do jogador saem no topo da folha, para entregar ao organizador do torneio.</p>
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
