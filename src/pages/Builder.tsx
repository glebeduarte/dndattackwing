import { download, legionText, parseLegionText, pickFile } from '../legionFile';
import { loadLegionFromCode } from '../engine/engine';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { catalog, useStore } from '../store';
import { Catalog, useFiltered, type Filters, type Selection, type Tab } from '../ui/Catalog';
import { CreatureCard, UpgradeCard } from '../ui/Cards';
import { CostLine } from '../ui/CostLine';
import { PrintDialog, PrintSheet } from '../ui/Print';
import { Roster } from '../ui/Roster';
import { Shell } from '../ui/Shell';
import type { Creature } from '../engine/engine';


type Pane = 'catalog' | 'roster' | 'card';

export function Builder() {
  const { legion, name, setName, code, saveCurrent, reset, notify, settings, version, replace } = useStore();
  const loc = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(loc.pathname === '/upgrades' ? 'upgrades' : 'creatures');
  const [filters, setFilters] = useState<Filters>({ q: '', set: '', element: '', maxCost: '', slot: '', equippable: settings.equippableOnly });
  const [selection, setSelection] = useState<Selection>(null);
  const [pane, setPane] = useState<Pane>(() => (legion.creatures.length ? 'roster' : 'catalog'));
  const [printing, setPrinting] = useState(false);
  const list = useFiltered(tab, filters);

  useEffect(() => {
    if (loc.pathname === '/creatures' || loc.pathname === '/upgrades') navigate('/construtor', { replace: true });
  }, [loc.pathname, navigate]);

  const changeTab = (t: Tab) => {
    setTab(t);
    if (t === 'creatures') setFilters((f) => ({ ...f, slot: '' }));
    else setFilters((f) => ({ ...f, equippable: f.equippable || settings.equippableOnly }));
  };

  const onSlotClick = (slot: string, c: Creature) => {
    setTab('upgrades');
    setFilters((f) => ({ ...f, q: '', slot: slot === 'Universal' ? '' : slot, equippable: true, forKey: c.key }));
    setPane('catalog');
  };
  // sai do modo "preencher slot" quando a criatura sai da legião ou o slot é preenchido
  const focusC = filters.forKey != null ? legion.creatures.find((c) => c.key === filters.forKey) : undefined;
  useEffect(() => {
    if (filters.forKey == null) return;
    if (!focusC || !focusC.upgrades.some((s, i) => !focusC.equipped[i] && (!filters.slot || s === filters.slot))) setFilters((f) => ({ ...f, forKey: null, slot: '', equippable: settings.equippableOnly }));
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <button className="btn btn-secondary" title="Abrir uma legião de um arquivo .txt" onClick={async () => {
              const t = await pickFile(); if (t == null) return;
              const [first] = parseLegionText(t);
              if (!first) return notify('error', 'Nenhuma legião encontrada no arquivo.');
              replace(loadLegionFromCode(first.code, catalog).legion, first.name);
              notify('ok', `${first.name} aberta do arquivo.`);
            }}>Abrir arquivo</button>
            <button className="btn btn-secondary" title="Baixar a legião num arquivo .txt" onClick={() => (legion.creatures.length ? download(`${name.replace(/[^\w\- ]+/g, '').trim() || 'legiao'}.txt`, legionText(name, legion) + '\n') : notify('info', 'Adicione criaturas antes de salvar o arquivo.'))}>Salvar arquivo</button>
            <button className="btn btn-primary" onClick={saveCurrent}>Salvar legião</button>
          </div>
        </div>

        <Steps onGo={(t) => { changeTab(t); setPane('catalog'); }} />
        <CostLine />

        <div className="workspace">
          <div className="ws-catalog">
            <Catalog tab={tab} setTab={changeTab} filters={filters} setFilters={setFilters} selection={preview} onPreview={(s, open) => { setSelection(s); if (open && window.matchMedia('(max-width: 900px)').matches) setPane('card'); }} />
          </div>
          <div className="ws-roster">
            <Roster focus={focusC && filters.slot ? { key: focusC.key, slot: filters.slot } : null} onSlotClick={onSlotClick} onPreview={(s) => { setSelection(s); setPane('card'); }} />
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

/* Passo a passo: o que já está feito e o que falta para fechar a legião. */
function Steps({ onGo }: { onGo(t: Tab): void }) {
  const { legion, settings, savedId, version } = useStore();
  void version;
  const n = legion.creatures.length;
  const empty = legion.creatures.reduce((s, c) => s + c.equipped.filter((e) => !e).length, 0);
  const slots = legion.creatures.reduce((s, c) => s + c.equipped.length, 0);
  const total = legion.totalCost();
  const target = settings.target;
  const over = target != null && total > target;
  const steps = [
    { done: n > 0, title: 'Escolha as criaturas', text: n ? `${n} na legião` : 'Toque em + numa criatura do catálogo', go: () => onGo('creatures') },
    { done: n > 0 && empty === 0, title: 'Preencha os slots', text: !n ? 'Cada criatura traz seus slots' : empty ? `${empty} de ${slots} slots livres: toque em um na legião` : 'Todos os slots ocupados', go: () => onGo('upgrades') },
    { done: n > 0 && !over && !!savedId, title: 'Confira e salve', text: over ? `${total - target!} pts acima do limite de ${target}` : target != null ? `${total} de ${target} pts${savedId ? ' · salva' : ''}` : `${total} pts`, warn: over },
  ];
  const cur = steps.findIndex((s) => !s.done);
  return (
    <ol className="steps" aria-label="Etapas da legião">
      {steps.map((s, i) => (
        <li key={s.title} className={`${s.done ? 'is-done' : ''}${i === cur ? ' is-current' : ''}${s.warn ? ' is-warn' : ''}`}>
          <button type="button" onClick={s.go} disabled={!s.go}>
            <span className="steps-n num">{s.done ? '✓' : i + 1}</span>
            <span className="steps-t"><b>{s.title}</b><small>{s.text}</small></span>
          </button>
        </li>
      ))}
    </ol>
  );
}
