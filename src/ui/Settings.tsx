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
          <h2 id="settings-title">Configurações</h2>
          <button className="icon-btn" aria-label="Fechar" value="close">×</button>
        </header>

        <h3 className="settings-h">Construtor</h3>
        <div className="settings-grid">
          <label className="field">
            <span>Limite de pontos da legião</span>
            <select value={settings.target ?? 0} onChange={(e) => setSettings({ target: Number(e.target.value) || null })}>
              {[0, 50, 75, 100, 120, 150, 160, 200, 250, 300].map((v) => <option key={v} value={v}>{v ? `${v} pontos` : 'Sem limite'}</option>)}
            </select>
          </label>
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
        <h3 className="settings-h">Cartas</h3>
        <label className="field">
          <span>Texto das cartas</span>
          <select value={settings.lang ?? 'en'} onChange={(e) => setSettings({ lang: e.target.value as 'en' | 'pt' })}>
            <option value="en">Original em inglês</option>
            <option value="pt">Tradução em português</option>
          </select>
        </label>

        <h3 className="settings-h">Jogar contra a IA</h3>
        <label className="check">
          <input type="checkbox" defaultChecked={(() => { try { return localStorage.getItem('aw:showTable') === '1'; } catch { return false; } })()} onChange={(e) => { try { localStorage.setItem('aw:showTable', e.target.checked ? '1' : '0'); } catch { /* */ } }} />
          <span>Abrir as partidas com a mesa virtual ligada</span>
        </label>

        <section className="sets">
          <div className="sets-head">
            <h3 className="settings-h">Coleções que você tem <span className="num muted">{owned} de {ALL_SETS.length}</span></h3>
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
        <section className="settings-data">
          <h3 className="settings-h">Dados guardados neste navegador</h3>
          <p className="muted">Legiões salvas, partidas, fotos de cartas e marcações ficam só neste navegador. Apagar não tem volta.</p>
          <div className="settings-data-btns">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Encerrar a partida contra a IA em andamento?')) { try { localStorage.removeItem('aw:match'); localStorage.removeItem('aw:table'); } catch { /* */ } } }}>Encerrar a partida em andamento</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Desmarcar todas as cartas separadas na página Coleções?')) { try { localStorage.removeItem('aw:sorted'); } catch { /* */ } } }}>Limpar as cartas separadas</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Voltar todas as configurações ao padrão?')) { try { localStorage.removeItem('aw:settings'); } catch { /* */ } location.reload(); } }}>Voltar as configurações ao padrão</button>
          </div>
        </section>
        <footer className="dialog-foot">
          <button className="btn btn-primary" value="close">Pronto</button>
        </footer>
      </form>
    </dialog>
  );
}
