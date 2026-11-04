import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Creature, Upgrade } from '../engine/engine';
import { catalog, useStore } from '../store';
import { ALIGN_LABEL, GameIcon, SLOT_LABEL } from './bits';
import type { Selection } from './Catalog';

/* Uid do upgrade sendo arrastado no catálogo, para marcar quem pode recebê-lo. */
function useDragging() {
  const [uid, setUid] = useState<number | null>(null);
  useEffect(() => {
    const on = (e: Event) => setUid((e as CustomEvent).detail ?? null);
    window.addEventListener('aw-drag', on);
    return () => window.removeEventListener('aw-drag', on);
  }, []);
  return uid;
}

interface RosterProps {
  onSlotClick(slot: string): void;
  onPreview(s: Selection): void;
}

export function Roster({ onSlotClick, onPreview }: RosterProps) {
  const { legion, mutate } = useStore();
  const dragging = useDragging();
  const [over, setOver] = useState(false);
  const probe = dragging !== null ? new Upgrade(catalog.upgradeByUid.get(dragging)!) : null;

  const dropCreature = (e: React.DragEvent) => {
    const uid = e.dataTransfer.getData('application/x-aw-creature');
    setOver(false);
    if (!uid) return;
    e.preventDefault();
    const d = catalog.creatureByUid.get(Number(uid));
    if (d) mutate((l) => l.addCreature(d), `${d.name} entrou na legião.`);
  };

  return (
    <section
      className={`roster${over ? ' is-over' : ''}`}
      aria-label="Criaturas da legião"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/x-aw-creature')) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
      }}
      onDrop={dropCreature}
    >
      {legion.creatures.length === 0 ? (
        <div className="roster-empty">
          <h2>A legião está vazia</h2>
          <p>Escolha criaturas no catálogo com o botão + ou arraste uma delas para cá. Depois troque para Upgrades e equipe cada criatura pelos números ao lado de cada carta, ou arrastando a carta até ela.</p>
          <StarterList />
        </div>
      ) : (
        legion.creatures.map((c, i) => (
          <RosterCard
            key={c.key}
            c={c}
            n={i + 1}
            dragState={probe ? (legion.canCreatureEquipUpgrade(c, probe) ? 'yes' : 'no') : null}
            onSlotClick={onSlotClick}
            onPreview={onPreview}
          />
        ))
      )}
    </section>
  );
}

/* Sugestões para começar: as criaturas do kit inicial. */
function StarterList() {
  const { mutate } = useStore();
  const starters = catalog.creatures.filter((c) => c.set === 'Starter').slice(0, 6);
  return (
    <ul className="starter">
      {starters.map((d) => (
        <li key={d.uid}>
          <button className="btn btn-secondary" onClick={() => mutate((l) => l.addCreature(d), `${d.name} entrou na legião.`)}>
            {d.name} <span className="num muted">{d.cost} pts</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function RosterCard({ c, n, dragState, onSlotClick, onPreview }: { c: Creature; n: number; dragState: 'yes' | 'no' | null; onSlotClick(s: string): void; onPreview(s: Selection): void }) {
  const { legion, mutate } = useStore();
  const [hot, setHot] = useState(false);
  const upgradesCost = c.upgradesCost(legion);
  const total = c.cost + upgradesCost;
  const elements = c.elementsList();
  const armor = c.baseArmorWithUpgrades();

  const onDrop = (e: React.DragEvent) => {
    const uid = e.dataTransfer.getData('application/x-aw-upgrade');
    setHot(false);
    if (!uid) return;
    e.preventDefault();
    e.stopPropagation();
    const d = catalog.upgradeByUid.get(Number(uid));
    if (d) mutate((l) => l.equip(c, d), `${d.name} equipado em ${c.name}.`);
  };

  return (
    <article
      className={`roster-card${dragState === 'yes' ? ' can-drop' : ''}${dragState === 'no' ? ' no-drop' : ''}${hot ? ' is-hot' : ''}`}
      aria-label={`${n}. ${c.name}`}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/x-aw-upgrade')) {
          e.preventDefault();
          setHot(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHot(false);
      }}
      onDrop={onDrop}
    >
      <header className="rc-head">
        <span className="rc-n num">{n}</span>
        <div className="rc-title">
          <h3>
            <button className="link-btn" onClick={() => onPreview({ kind: 'creature', uid: c.uid })}>{c.name}</button>
            {c.unique && <span className="unique-mark" title="Única"> ◆</span>}
          </h3>
          <p className="rc-class">{c.classtype}</p>
        </div>
        <div className="rc-cost">
          <span className="rc-total num">{total}</span>
          <span className="rc-split num">{c.cost} + {upgradesCost}</span>
        </div>
        <button
          className="icon-btn"
          aria-label={`Remover ${c.name} da legião`}
          title="Remover da legião"
          onClick={() => mutate((l) => l.removeCreature(c), `${c.name} saiu da legião.`)}
        >
          ×
        </button>
      </header>

      <div className="rc-body">
        <div className="rc-facts">
          <div className="rc-badges">
            <span className="tag-level">Nível <span className="num">{c.level}</span></span>
            <span className="tag-icon">
              <GameIcon type={c.alignment} color size={20} title={ALIGN_LABEL[c.alignment]} />
              {ALIGN_LABEL[c.alignment]}
              {c.originalAlignment && <span className="muted"> (era {ALIGN_LABEL[c.originalAlignment]})</span>}
            </span>
            {elements.map((e) => (
              <span className="tag-icon" key={e}><GameIcon type={e} color size={20} />{e}</span>
            ))}
          </div>
          <div className="stats stats-sm">
            {([['pwv', c.attack, 'Arma primária'], ['agility', c.agility, 'Agilidade'], ['health', c.health, 'Vida'], ['armor', armor, 'Armadura']] as const).map(([k, v, l]) => (
              <span className={`stat stat-${k}`} key={k} title={l}>
                <GameIcon type={k} color size={20} title={l} />
                <span className="num">{v}</span>
                {k === 'armor' && armor !== c.armor && <span className="stat-mod num">{armor > c.armor ? '+' : ''}{armor - c.armor}</span>}
              </span>
            ))}
          </div>
          <div className="icon-row" aria-label="Barra de ações">
            {c.actions.map((a) => <GameIcon key={a} type={a} size={20} />)}
          </div>
          <EvilToken c={c} />
        </div>

        <ol className="slots" aria-label="Slots de upgrade">
          {c.upgrades.map((slot, i) => {
            const u = c.equipped[i];
            return (
              <li key={i} className={u ? 'slot is-filled' : 'slot'}>
                <GameIcon type={slot} size={20} title={SLOT_LABEL[slot] ?? slot} />
                {u ? (
                  <>
                    <button className="slot-name link-btn" onClick={() => onPreview({ kind: 'upgrade', uid: u.uid })}>
                      {u.name}
                    </button>
                    <span className="slot-cost num">{u.costForCreature(c, legion)}</span>
                    <button
                      className="icon-btn icon-btn-sm"
                      aria-label={`Remover ${u.name}`}
                      title={u.isDependedOn() ? `Usado por ${u.dependedOnBy.map((d) => d.name).join(', ')}` : 'Remover upgrade'}
                      onClick={() => mutate(() => c.unequipUpgrade(u, legion), `${u.name} removido de ${c.name}.`)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <button className="slot-empty" onClick={() => onSlotClick(slot)} title={`Ver upgrades de ${SLOT_LABEL[slot] ?? slot}`}>
                      {SLOT_LABEL[slot] ?? slot} livre
                    </button>
                    <span className="slot-cost num muted">–</span>
                    <span className="icon-btn-sm" aria-hidden />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <footer className="rc-foot">
        <Link className="text-link" to={`/card/creature/${c.uid}`}>Página da carta</Link>
      </footer>
    </article>
  );
}

function EvilToken({ c }: { c: Creature }) {
  const { legion, mutate } = useStore();
  if (c.originalAlignment) {
    return (
      <button className="text-btn" onClick={() => mutate((l) => l.restoreAlignment(c), `${c.name} voltou a ser ${ALIGN_LABEL[c.originalAlignment!]}.`)}>
        Restaurar alinhamento
      </button>
    );
  }
  if ((legion.tokens.Evil ?? 0) > 0 && c.alignment !== 'Evil') {
    return (
      <button className="text-btn" onClick={() => mutate((l) => l.makeEvil(c), `${c.name} agora é Mau.`)}>
        <GameIcon type="evil" color size={16} /> Usar marcador Evil
      </button>
    );
  }
  return null;
}
