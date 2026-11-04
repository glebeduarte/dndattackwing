import { useEffect, useRef } from 'react';
import { ALL_SETS, catalog, useStore, type SortKey } from '../store';

const SORTS: [SortKey, string][] = [
  ['uid', 'Ordem de lançamento'],
  ['name', 'Alfabética'],
  ['cost', 'Custo'],
];

export function SettingsDialog({ onClose }: { onClose(): void }) {
  const { settings, setSettings } = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const counts = new Map<string, number>();
  for (const c of [...catalog.creatures, ...catalog.upgrades]) counts.set(c.set, (counts.get(c.set) ?? 0) + 1);
  const owned = ALL_SETS.filter((s) => settings.sets[s] !== false).length;

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="settings-title">
      <form method="dialog" className="dialog-body">
        <header className="dialog-head">
          <h2 id="settings-title">Coleções e ordem</h2>
          <button className="icon-btn" aria-label="Fechar" value="close">×</button>
        </header>

        <div className="settings-grid">
          <label className="field">
            <span>Ordem das criaturas</span>
            <select value={settings.creatureSort} onChange={(e) => setSettings({ creatureSort: e.target.value as SortKey })}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Ordem dos upgrades</span>
            <select value={settings.upgradeSort} onChange={(e) => setSettings({ upgradeSort: e.target.value as SortKey })}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={settings.equippableOnly} onChange={(e) => setSettings({ equippableOnly: e.target.checked })} />
          <span>Abrir os upgrades mostrando só o que cabe na legião</span>
        </label>

        <section className="sets">
          <div className="sets-head">
            <h3>Coleções que você tem <span className="num muted">{owned} de {ALL_SETS.length}</span></h3>
            <div>
              <button type="button" className="text-btn" onClick={() => setSettings({ sets: Object.fromEntries(ALL_SETS.map((s) => [s, true])) })}>Marcar todas</button>
              <button type="button" className="text-btn" onClick={() => setSettings({ sets: Object.fromEntries(ALL_SETS.map((s) => [s, false])) })}>Limpar</button>
            </div>
          </div>
          <p className="muted">O catálogo mostra só as cartas das coleções marcadas.</p>
          <ul className="sets-list">
            {ALL_SETS.map((s) => (
              <li key={s}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={settings.sets[s] !== false}
                    onChange={(e) => setSettings({ sets: { ...settings.sets, [s]: e.target.checked } })}
                  />
                  <span>{s} <span className="num muted">{counts.get(s)}</span></span>
                </label>
              </li>
            ))}
          </ul>
        </section>
        <footer className="dialog-foot">
          <button className="btn btn-primary" value="close">Pronto</button>
        </footer>
      </form>
    </dialog>
  );
}
