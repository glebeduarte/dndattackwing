import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { catalog, useStore } from '../store';
import { Catalog, useFiltered, type Filters, type Selection, type Tab } from '../ui/Catalog';
import { CreatureCard, UpgradeCard } from '../ui/Cards';
import { CostLine } from '../ui/CostLine';
import { PrintDialog, PrintSheet } from '../ui/Print';
import { Roster } from '../ui/Roster';
import { Shell } from '../ui/Shell';

type Pane = 'catalog' | 'roster' | 'card';

export function Builder() {
  const { legion, name, setName, code, saveCurrent, reset, notify, settings, version } = useStore();
  const loc = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(loc.pathname === '/upgrades' ? 'upgrades' : 'creatures');
  const [filters, setFilters] = useState<Filters>({ q: '', set: '', element: '', maxCost: '', slot: '', equippable: settings.equippableOnly });
  const [selection, setSelection] = useState<Selection>(null);
  const [pane, setPane] = useState<Pane>(() => (legion.creatures.length ? 'roster' : 'catalog'));
  const [printing, setPrinting] = useState(false);
  const list = useFiltered(tab, filters);

  useEffect(() => {
    if (loc.pathname === '/creatures' || loc.pathname === '/upgrades') navigate('/', { replace: true });
  }, [loc.pathname, navigate]);

  const changeTab = (t: Tab) => {
    setTab(t);
    if (t === 'creatures') setFilters((f) => ({ ...f, slot: '' }));
    else setFilters((f) => ({ ...f, equippable: f.equippable || settings.equippableOnly }));
  };

  const onSlotClick = (slot: string) => {
    setTab('upgrades');
    setFilters((f) => ({ ...f, slot: slot === 'Universal' ? '' : slot, equippable: true }));
    setPane('catalog');
  };

  const preview: Selection = selection ?? (list[0] ? { kind: tab === 'creatures' ? 'creature' : 'upgrade', uid: list[0].uid } : null);
  const shareUrl = `${window.location.origin}/link/${code}`;

  const copyLink = async () => {
    if (!legion.creatures.length) return notify('info', 'Adicione criaturas antes de compartilhar.');
    try {
      await navigator.clipboard.writeText(shareUrl);
      notify('ok', 'Link da legião copiado.');
    } catch {
      window.prompt('Copie o link da legião:', shareUrl);
    }
  };

  const totalLine = (() => {
    const n = legion.creatures.length;
    if (!n) return 'Comece pelas criaturas: cada uma traz seus slots de upgrade.';
    const empty = legion.creatures.reduce((s, c) => s + c.equipped.filter((e) => !e).length, 0);
    const parts = [`${n} ${n === 1 ? 'criatura' : 'criaturas'}`];
    parts.push(empty ? `${empty} ${empty === 1 ? 'slot livre' : 'slots livres'}` : 'todos os slots ocupados');
    if (settings.target !== null) {
      const left = settings.target - legion.totalCost();
      parts.push(left >= 0 ? `${left} pts até ${settings.target}` : `${-left} pts acima de ${settings.target}`);
    }
    return parts.join(' · ');
  })();
  void version;

  return (
    <Shell
      topbar={
        <label className="top-search">
          <span className="sr-only">Buscar cartas</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input
            type="search"
            placeholder={`Buscar entre ${catalog.creatures.length + catalog.upgrades.length} cartas`}
            value={filters.q}
            onChange={(e) => {
              setFilters({ ...filters, q: e.target.value });
              setPane('catalog');
            }}
          />
        </label>
      }
    >
      <div className="builder" data-pane={pane}>
        <div className="title-row">
          <div className="title-block">
            <h1 className="legion-title">
              <input aria-label="Nome da legião" value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} />
            </h1>
            <p className="title-sub">{totalLine}</p>
          </div>
          <div className="title-actions">
            <button className="btn btn-text" onClick={() => {
              if (!legion.creatures.length || window.confirm('Começar uma legião nova? A atual continua nas salvas se você a salvou.')) reset();
            }}>Nova</button>
            <button className="btn btn-secondary" onClick={copyLink}>Copiar link</button>
            <button className="btn btn-secondary" onClick={() => (legion.creatures.length ? setPrinting(true) : notify('info', 'Não há o que imprimir ainda.'))}>Imprimir</button>
            <button className="btn btn-primary" onClick={saveCurrent}>Salvar legião</button>
          </div>
        </div>

        <CostLine />

        <div className="workspace">
          <div className="ws-catalog">
            <Catalog tab={tab} setTab={changeTab} filters={filters} setFilters={setFilters} selection={preview} onPreview={(s, open) => { setSelection(s); if (open && window.matchMedia('(max-width: 900px)').matches) setPane('card'); }} />
          </div>
          <div className="ws-roster">
            <Roster onSlotClick={onSlotClick} onPreview={(s) => { setSelection(s); setPane('card'); }} />
          </div>
          <aside className="ws-preview panel" aria-label="Carta em destaque">
            {preview?.kind === 'creature' && catalog.creatureByUid.get(preview.uid) && <CreatureCard data={catalog.creatureByUid.get(preview.uid)!} />}
            {preview?.kind === 'upgrade' && catalog.upgradeByUid.get(preview.uid) && <UpgradeCard data={catalog.upgradeByUid.get(preview.uid)!} />}
          </aside>
        </div>
      </div>

      <nav className="pane-bar" aria-label="Seções do construtor">
        {([['catalog', 'Catálogo'], ['roster', `Legião ${legion.creatures.length ? `(${legion.creatures.length})` : ''}`], ['card', 'Carta']] as [Pane, string][]).map(([p, l]) => (
          <button key={p} className={pane === p ? 'is-active' : ''} aria-pressed={pane === p} onClick={() => setPane(p)}>{l}</button>
        ))}
      </nav>

      {printing && <PrintDialog onClose={() => setPrinting(false)} />}
      <PrintSheet />
    </Shell>
  );
}
