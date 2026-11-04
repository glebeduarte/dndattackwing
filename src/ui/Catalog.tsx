import { memo, useMemo } from 'react';
import { ENUM_ELEMENTS, ENUM_UPGRADES, Upgrade } from '../engine/engine';
import type { CreatureData, UpgradeData } from '../engine/types';
import { ALL_SETS, catalog, useStore, type SortKey } from '../store';
import { GameIcon, SLOT_LABEL } from './bits';

export type Tab = 'creatures' | 'upgrades';
export interface Filters {
  q: string;
  set: string;
  element: string;
  maxCost: string;
  slot: string;
  equippable: boolean;
}
export type Selection = { kind: 'creature'; uid: number } | { kind: 'upgrade'; uid: number } | null;

const hay = new Map<object, string>();
function haystack(d: CreatureData | UpgradeData) {
  let h = hay.get(d);
  if (!h) {
    h = [d.name, d.classtype, d.set, d.wave, (d as any).text, (d as any).special, ...((d as any).identifiers ?? []), (d as any).upgrade]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    hay.set(d, h);
  }
  return h;
}

function sortBy<T extends { uid: number; name: string; cost: any }>(list: T[], key: SortKey) {
  const out = [...list];
  if (key === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
  else if (key === 'cost') out.sort((a, b) => (a.cost === '*' ? 99 : Number(a.cost)) - (b.cost === '*' ? 99 : Number(b.cost)) || a.uid - b.uid);
  else out.sort((a, b) => a.uid - b.uid);
  return out;
}

export function useFiltered(tab: Tab, f: Filters) {
  const { settings, legion, version } = useStore();
  return useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const max = f.maxCost.trim() === '' ? null : Number(f.maxCost);
    const base = tab === 'creatures' ? catalog.creatures : catalog.upgrades;
    const list = (base as (CreatureData | UpgradeData)[]).filter((d) => {
      if (settings.sets[d.set] === false) return false;
      if (f.set && d.set !== f.set) return false;
      if (q && !haystack(d).includes(q)) return false;
      if (f.element) {
        const els = [d.element, (d as any).element2, ...((d as any).elements ?? [])];
        if (!els.includes(f.element)) return false;
      }
      if (max !== null && !Number.isNaN(max)) {
        if (d.cost === '*' || Number(d.cost) > max) return false;
      }
      if (tab === 'upgrades') {
        const u = d as UpgradeData;
        if (f.slot && u.upgrade !== f.slot) return false;
        if (f.equippable) {
          const probe = new Upgrade(u);
          if (!legion.creatures.some((c) => legion.canCreatureEquipUpgrade(c, probe))) return false;
        }
      }
      return true;
    });
    return sortBy(list as any[], tab === 'creatures' ? settings.creatureSort : settings.upgradeSort) as (CreatureData | UpgradeData)[];
    // version muda a cada alteração da legião, o que muda o filtro de equipáveis
  }, [tab, f, settings, legion, version]);
}

interface CatalogProps {
  tab: Tab;
  setTab(t: Tab): void;
  filters: Filters;
  setFilters(f: Filters): void;
  selection: Selection;
  onPreview(s: Selection, open?: boolean): void;
}

export function Catalog({ tab, setTab, filters, setFilters, selection, onPreview }: CatalogProps) {
  const list = useFiltered(tab, filters);
  const { legion, version, settings, setSettings } = useStore();
  const patch = (p: Partial<Filters>) => setFilters({ ...filters, ...p });
  const sets = ALL_SETS;
  const hasFilters = !!(filters.q || filters.set || filters.element || filters.maxCost || filters.slot || filters.equippable);

  return (
    <section className="panel catalog" aria-label="Catálogo de cartas">
      <div className="tabs" role="tablist" aria-label="Tipo de carta">
        <button role="tab" aria-selected={tab === 'creatures'} className={tab === 'creatures' ? 'tab is-active' : 'tab'} onClick={() => setTab('creatures')}>
          Criaturas <span className="num tab-count">{catalog.creatures.length}</span>
        </button>
        <button role="tab" aria-selected={tab === 'upgrades'} className={tab === 'upgrades' ? 'tab is-active' : 'tab'} onClick={() => setTab('upgrades')}>
          Upgrades <span className="num tab-count">{catalog.upgrades.length}</span>
        </button>
      </div>

      <div className="filters">
        <label className="field field-search">
          <span className="sr-only">Buscar no texto das cartas</span>
          <input type="search" placeholder="Buscar nome, tipo, texto" value={filters.q} onChange={(e) => patch({ q: e.target.value })} />
        </label>
        <div className="filter-grid">
          <label className="field">
            <span>Coleção</span>
            <select value={filters.set} onChange={(e) => patch({ set: e.target.value })}>
              <option value="">Todas</option>
              {sets.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Elemento</span>
            <select value={filters.element} onChange={(e) => patch({ element: e.target.value })}>
              <option value="">Todos</option>
              {ENUM_ELEMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {tab === 'upgrades' && (
            <label className="field">
              <span>Slot</span>
              <select value={filters.slot} onChange={(e) => patch({ slot: e.target.value })}>
                <option value="">Todos</option>
                {ENUM_UPGRADES.map((s) => <option key={s} value={s}>{SLOT_LABEL[s]}</option>)}
              </select>
            </label>
          )}
          <label className="field">
            <span>Ordem</span>
            <select
              value={tab === 'creatures' ? settings.creatureSort : settings.upgradeSort}
              onChange={(e) => setSettings(tab === 'creatures' ? { creatureSort: e.target.value as SortKey } : { upgradeSort: e.target.value as SortKey })}
            >
              <option value="uid">Lançamento</option>
              <option value="name">Alfabética</option>
              <option value="cost">Custo</option>
            </select>
          </label>
          <label className="field field-num">
            <span>Custo até</span>
            <input type="number" inputMode="numeric" min={0} max={200} value={filters.maxCost} onChange={(e) => patch({ maxCost: e.target.value })} />
          </label>
          {tab === 'upgrades' && (
            <label className="check grid-check">
              <input type="checkbox" checked={filters.equippable} onChange={(e) => patch({ equippable: e.target.checked })} />
              <span>Só o que cabe</span>
            </label>
          )}
        </div>
      </div>

      <div className="list-meta">
        <span className="num">{list.length}</span> {tab === 'creatures' ? 'criaturas' : 'upgrades'}
        {hasFilters && (
          <button className="text-btn" onClick={() => setFilters({ q: '', set: '', element: '', maxCost: '', slot: '', equippable: false })}>
            Limpar filtros
          </button>
        )}
      </div>

      <ul className="card-list" role="list">
        {list.length === 0 && (
          <li className="empty-row">
            {filters.equippable && !legion.creatures.length ? 'Adicione uma criatura para ver o que cabe nela.' : 'Nenhuma carta com esses filtros.'}
          </li>
        )}
        {tab === 'creatures'
          ? (list as CreatureData[]).map((d) => (
              <CreatureRow key={d._id} d={d} active={selection?.kind === 'creature' && selection.uid === d.uid} onPreview={onPreview} />
            ))
          : (list as UpgradeData[]).map((d) => (
              <UpgradeRow key={d._id} d={d} v={version} active={selection?.kind === 'upgrade' && selection.uid === d.uid} onPreview={onPreview} />
            ))}
      </ul>
    </section>
  );
}

const CreatureRow = memo(function CreatureRow({ d, active, onPreview }: { d: CreatureData; active: boolean; onPreview(s: Selection, open?: boolean): void }) {
  const { mutate } = useStore();
  const add = () => mutate((l) => l.addCreature(d), `${d.name} entrou na legião.`);
  return (
    <li
      className={active ? 'row is-active' : 'row'}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-aw-creature', String(d.uid));
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onMouseEnter={() => onPreview({ kind: 'creature', uid: d.uid })}
    >
      <button className="row-main" onClick={() => onPreview({ kind: 'creature', uid: d.uid }, true)} onFocus={() => onPreview({ kind: 'creature', uid: d.uid })}>
        <span className="row-name">{d.name}{d.unique && <span className="unique-mark" title="Única"> ◆</span>}</span>
        <span className="row-sub">{d.classtype} · nível {d.level}</span>
      </button>
      <span className="row-cost num">{d.cost}</span>
      <button className="btn btn-add" onClick={add} aria-label={`Adicionar ${d.name} à legião`} title="Adicionar à legião">+</button>
    </li>
  );
});

const UpgradeRow = memo(function UpgradeRow({ d, active, onPreview }: { d: UpgradeData; v: number; active: boolean; onPreview(s: Selection, open?: boolean): void }) {
  const { legion, mutate } = useStore();
  const probe = new Upgrade(d);
  const targets = legion.creatures.map((c, i) => ({ c, i })).filter(({ c }) => legion.canCreatureEquipUpgrade(c, probe));
  return (
    <li
      className={active ? 'row is-active' : 'row'}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-aw-upgrade', String(d.uid));
        e.dataTransfer.setData(`application/x-aw-slot-${d.upgrade.toLowerCase()}`, '1');
        e.dataTransfer.effectAllowed = 'copy';
        window.dispatchEvent(new CustomEvent('aw-drag', { detail: d.uid }));
      }}
      onDragEnd={() => window.dispatchEvent(new CustomEvent('aw-drag', { detail: null }))}
      onMouseEnter={() => onPreview({ kind: 'upgrade', uid: d.uid })}
    >
      <GameIcon type={d.upgrade} size={20} title={SLOT_LABEL[d.upgrade]} />
      <button className="row-main" onClick={() => onPreview({ kind: 'upgrade', uid: d.uid }, true)} onFocus={() => onPreview({ kind: 'upgrade', uid: d.uid })}>
        <span className="row-name">{d.name}{d.unique && <span className="unique-mark" title="Única"> ◆</span>}</span>
        <span className="row-sub">{d.classtype}</span>
      </button>
      <span className="row-cost num">{d.cost}</span>
      {targets.length > 0 && (
        <span className="row-targets">
          {targets.slice(0, 6).map(({ c, i }) => (
            <button
              key={c.key}
              className="btn btn-target num"
              title={`Equipar em #${i + 1} ${c.name} por ${probe.costForCreature(c, legion)} pts`}
              aria-label={`Equipar em ${c.name}`}
              onClick={() => mutate((l) => l.equip(c, d), `${d.name} equipado em ${c.name}.`)}
            >
              {i + 1}
            </button>
          ))}
        </span>
      )}
    </li>
  );
});
