import { useMemo, useState } from 'react';
import { ENUM_ELEMENTS, ENUM_UPGRADES, Upgrade } from '../engine/engine';
import type { CreatureData, UpgradeData } from '../engine/types';
import { ALL_SETS, catalog, useStore, type SortKey } from '../store';
import { GameIcon, SLOT_LABEL } from './bits';
import { matches, parseQuery, QUERY_EXAMPLES } from './query';
import { getLoadedTranslations, useCardLang } from '../i18n/cards';
import { translateClasstype } from '../i18n/classtypes';

export type Tab = 'creatures' | 'upgrades';
export interface Filters {
  q: string;
  set: string;
  element: string;
  maxCost: string;
  slot: string;
  equippable: boolean;
  forKey?: number | null; // criatura da legião cujo slot está sendo preenchido
  group?: string;
}
export type Selection = { kind: 'creature'; uid: number } | { kind: 'upgrade'; uid: number } | null;

// Texto de busca de cada carta; inclui a tradução quando ela já foi carregada.
let hay = new Map<object, string>();
let hayWithPt = false;
function haystack(d: CreatureData | UpgradeData) {
  const tr = getLoadedTranslations();
  if (tr && !hayWithPt) {
    hay = new Map();
    hayWithPt = true;
  }
  let h = hay.get(d);
  if (!h) {
    const isC = Array.isArray((d as any).upgrades);
    const pt = tr ? (isC ? tr.c[d.uid] : tr.u[d.uid]) : undefined;
    h = [d.name, d.classtype, tr ? translateClasstype(d.classtype) : '', pt, d.set, d.wave, (d as any).text, (d as any).special, ...((d as any).identifiers ?? []), (d as any).upgrade]
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

export const CREATURE_GROUPS: [string, string][] = [['dragao', 'Dragões'], ['tropa', 'Tropas'], ['heroi', 'Heróis e montarias'], ['monstro', 'Monstros']];
export function creatureGroup(d: CreatureData) {
  const ids = d.identifiers ?? [];
  if (ids.includes('Dragon')) return 'dragao';
  if (ids.includes('Troop')) return 'tropa';
  if (/Human|Elf|Dwarf|Drow|Genasi|Half|Rider|Pegasus|Griffon|Hippogriff|Angel|Deva/.test(d.classtype)) return 'heroi';
  return 'monstro';
}

export function useFiltered(tab: Tab, f: Filters) {
  const { settings, legion, version } = useStore();
  return useMemo(() => {
    const terms = parseQuery(f.q.trim(), haystack);
    const max = f.maxCost.trim() === '' ? null : Number(f.maxCost);
    const base = tab === 'creatures' ? catalog.creatures : catalog.upgrades;
    const list = (base as (CreatureData | UpgradeData)[]).filter((d) => {
      if (settings.sets[d.set] === false) return false;
      if (f.set && d.set !== f.set) return false;
      if (terms.length && !matches(d, terms)) return false;
      if (f.element) {
        const els = [d.element, (d as any).element2, ...((d as any).elements ?? [])];
        if (!els.includes(f.element)) return false;
      }
      if (max !== null && !Number.isNaN(max)) {
        if (d.cost === '*' || Number(d.cost) > max) return false;
      }
      if (tab === 'creatures' && f.group && creatureGroup(d as CreatureData) !== f.group) return false;
      if (tab === 'upgrades') {
        const u = d as UpgradeData;
        if (f.slot && u.upgrade !== f.slot) return false;
        if (f.forKey != null) {
          const c = legion.creatures.find((x) => x.key === f.forKey);
          if (c && !f.equippable) return true;
          if (c && !legion.canCreatureEquipUpgrade(c, new Upgrade(u))) return false;
        } else if (f.equippable) {
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
  const [help, setHelp] = useState(false);
  const patch = (p: Partial<Filters>) => setFilters({ ...filters, ...p });
  const sets = ALL_SETS;
  const hasFilters = !!(filters.q || filters.set || filters.element || filters.maxCost || filters.slot || filters.equippable || filters.group || filters.forKey != null);
  const focusC = filters.forKey != null ? legion.creatures.find((c) => c.key === filters.forKey) : undefined;
  const groups = tab === 'creatures'
    ? CREATURE_GROUPS.map(([id, label]) => ({ id, label, items: (list as CreatureData[]).filter((d) => creatureGroup(d) === id) }))
    : [...new Set((list as UpgradeData[]).map((u) => u.upgrade))].sort((a, b) => ENUM_UPGRADES.indexOf(a as never) - ENUM_UPGRADES.indexOf(b as never)).map((slot) => ({ id: slot, label: SLOT_LABEL[slot] ?? slot, items: (list as UpgradeData[]).filter((u) => u.upgrade === slot) }));

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

      {focusC && tab === 'upgrades' && (
        <div className="focus-banner">
          <p>Escolhendo <b>{SLOT_LABEL[filters.slot] ?? 'melhoria'}</b> para <b>{focusC.name}</b>. Toque em <b>Equipar</b> na carta.</p>
          <label className="check"><input type="checkbox" checked={!filters.equippable} onChange={(e) => patch({ equippable: !e.target.checked })} /> <span>Mostrar também as que não cabem, com o motivo</span></label>
          <button className="text-btn" onClick={() => patch({ forKey: null, slot: '', equippable: false })}>Ver o catálogo inteiro</button>
        </div>
      )}
      {tab === 'creatures' && (
        <div className="group-chips" role="group" aria-label="Categoria">
          <button className={!filters.group ? 'is-on' : ''} onClick={() => patch({ group: '' })}>Todas</button>
          {CREATURE_GROUPS.map(([id, label]) => <button key={id} className={filters.group === id ? 'is-on' : ''} onClick={() => patch({ group: filters.group === id ? '' : id })}>{label}</button>)}
        </div>
      )}
      {tab === 'upgrades' && !focusC && (
        <div className="group-chips" role="group" aria-label="Tipo de slot">
          <button className={!filters.slot ? 'is-on' : ''} onClick={() => patch({ slot: '' })}>Todos</button>
          {ENUM_UPGRADES.filter((s) => catalog.upgrades.some((u) => u.upgrade === s)).map((s) => (
            <button key={s} className={filters.slot === s ? 'is-on' : ''} onClick={() => patch({ slot: filters.slot === s ? '' : s })}><GameIcon type={s} size={16} /> {SLOT_LABEL[s] ?? s}</button>
          ))}
        </div>
      )}
      <div className="filters">
        <div className="qf">
          <label className="qf-input">
            <span className="sr-only">Filtrar por texto</span>
            <input
              type="search"
              placeholder={tab === 'creatures' ? 'Ex.: nivel>=8 voa' : 'Ex.: slot:dragao custo<=4'}
              value={filters.q}
              onChange={(e) => patch({ q: e.target.value })}
              spellCheck={false}
              autoCapitalize="off"
            />
          </label>
          <button type="button" className={`qf-help-btn${help ? ' is-on' : ''}`} aria-expanded={help} onClick={() => setHelp(!help)}>
            {help ? 'Fechar' : 'Mais filtros'}
          </button>
        </div>
        {help && <QueryHelp tab={tab} onPick={(ex) => patch({ q: ex })} />}
        {help && <div className="filter-grid">
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
          {tab === 'upgrades' && !focusC && (
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
          {tab === 'upgrades' && !focusC && (
            <label className="check grid-check">
              <input type="checkbox" checked={filters.equippable} onChange={(e) => patch({ equippable: e.target.checked })} />
              <span>Só o que cabe</span>
            </label>
          )}
        </div>}
      </div>

      <div className="list-meta">
        <span className="num">{list.length}</span> {tab === 'creatures' ? 'criaturas' : 'upgrades'}
        {hasFilters && (
          <button className="text-btn" onClick={() => setFilters({ q: '', set: '', element: '', maxCost: '', slot: '', equippable: false, forKey: null, group: '' })}>
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
        {groups.filter((g) => g.items.length).map((g) => (
          <li key={g.id} className="group-block">
            {groups.filter((x) => x.items.length).length > 1 && <p className="group-head">{tab === 'upgrades' && <GameIcon type={g.id} size={16} />} {g.label} <span className="num muted">{g.items.length}</span></p>}
            <ul role="list" className="group-list">
              {tab === 'creatures'
                ? (g.items as CreatureData[]).map((d) => <CreatureRow key={d._id} d={d} active={selection?.kind === 'creature' && selection.uid === d.uid} onPreview={onPreview} />)
                : (g.items as UpgradeData[]).map((d) => <UpgradeRow key={d._id} d={d} v={version} focusKey={filters.forKey ?? null} active={selection?.kind === 'upgrade' && selection.uid === d.uid} onPreview={onPreview} />)}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CreatureRow = function CreatureRow({ d, active, onPreview }: { d: CreatureData; active: boolean; onPreview(s: Selection, open?: boolean): void }) {
  const { mutate, legion, settings } = useStore();
  const t = useCardLang();
  const dup = d.unique && legion.creatures.some((c) => c.unique && (c.name === d.name || c.uniqueName === ((d as any).uniquename || d.name)));
  const over = settings.target != null && legion.totalCost() + Number(d.cost) > settings.target ? legion.totalCost() + Number(d.cost) - settings.target : 0;
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
        <span className="row-sub">{t.classtype(d.classtype)} · nível {d.level}</span>
        {dup && <span className="row-why">Já está na legião: carta única.</span>}
        {!dup && over > 0 && <span className="row-warn">Passa {over} pts do limite.</span>}
      </button>
      <span className="row-cost num">{d.cost}</span>
      <button className="btn btn-add" onClick={add} disabled={dup} aria-label={`Adicionar ${d.name} à legião`} title={dup ? 'Carta única já na legião' : 'Adicionar à legião'}>+</button>
    </li>
  );
};

const UpgradeRow = function UpgradeRow({ d, active, onPreview, focusKey }: { d: UpgradeData; v: number; active: boolean; onPreview(s: Selection, open?: boolean): void; focusKey: number | null }) {
  const { legion, mutate } = useStore();
  const t = useCardLang();
  const probe = new Upgrade(d);
  const targets = legion.creatures.map((c, i) => ({ c, i })).filter(({ c }) => legion.canCreatureEquipUpgrade(c, probe));
  const fc = focusKey != null ? legion.creatures.find((c) => c.key === focusKey) : undefined;
  const fcOk = fc ? legion.canCreatureEquipUpgrade(fc, probe) : false;
  const why = fc ? (fcOk ? null : legion.whyNot(fc, probe)) : legion.creatures.length && !targets.length ? (legion.creatures.map((c) => legion.whyNot(c, probe)).find(Boolean) ?? null) : null;
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
        <span className="row-sub">{t.classtype(d.classtype)}</span>
        {why && <span className="row-why">{fc ? `Não cabe em ${fc.name}: ` : 'Não cabe na legião: '}{why}</span>}
      </button>
      <span className="row-cost num">{fc && fcOk ? new Upgrade(d).costForCreature(fc, legion) : d.cost}</span>
      {fc ? (fcOk && <button className="btn btn-equip" onClick={() => mutate((l) => l.equip(fc, d), `${d.name} equipado em ${fc.name}.`)}>Equipar</button>) : targets.length > 0 && (
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
};

function QueryHelp({ tab, onPick }: { tab: Tab; onPick(q: string): void }) {
  return (
    <div className="qf-help">
      <p>Escreva palavras soltas para buscar no nome e no texto, ou combine filtros separados por espaço. Um <b>-</b> na frente exclui.</p>
      <dl className="qf-syntax">
        <div><dt>Números</dt><dd>custo, nivel, ataque, agilidade, vida, armadura, alcance, slots, marcadores com &gt; &lt; &gt;= &lt;= =</dd></div>
        <div><dt>Campos</dt><dd>alinhamento: base: slot: acao: tipo: elemento: colecao: onda: area: arco: nome: texto:</dd></div>
        <div><dt>Palavras</dt><dd>voa, terrestre, unica, tropa, artefato, ataque, acao, penetra, variavel</dd></div>
      </dl>
      <p className="qf-ex-title">Exemplos</p>
      <ul className="qf-examples">
        {QUERY_EXAMPLES[tab].map(([q, label]) => (
          <li key={q}>
            <button type="button" onClick={() => onPick(q)}><code>{q}</code><span>{label}</span></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
