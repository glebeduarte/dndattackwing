import { Link } from 'react-router-dom';
import { Upgrade } from '../engine/engine';
import type { CreatureData, UpgradeData } from '../engine/types';
import { useStore } from '../store';
import { ALIGN_LABEL, ARC_LABEL, BASE_LABEL, CardText, CostBadge, GameIcon, ManeuverDial, SLOT_LABEL, StatRow } from './bits';

export function CreatureCard({ data, full = false }: { data: CreatureData; full?: boolean }) {
  const elements = [data.element, ...(data.elements ?? [])].filter(Boolean) as string[];
  return (
    <article className="card card-creature" aria-label={data.name}>
      <header className="card-head">
        <div>
          {!full && <h2 className="card-name">{data.name}</h2>}
          <p className="card-class">{data.classtype}</p>
        </div>
        <CostBadge value={data.cost} unique={data.unique} />
      </header>

      <div className="card-tags">
        <span className="tag-level" title="Nível">Nível <span className="num">{data.level}</span></span>
        <span className="tag-icon"><GameIcon type={data.alignment} color size={22} title={ALIGN_LABEL[data.alignment]} />{ALIGN_LABEL[data.alignment]}</span>
        {elements.map((e) => (
          <span className="tag-icon" key={e}><GameIcon type={e} color size={22} />{e}</span>
        ))}
        {data.unique && <span className="tag-plain">Única</span>}
      </div>

      <StatRow attack={data.attack} agility={data.agility} health={data.health} armor={data.armor} size={26} />

      <dl className="kv">
        <div><dt>Slots</dt><dd className="icon-row">{data.upgrades.map((s, i) => <GameIcon key={i} type={s} size={24} title={SLOT_LABEL[s] ?? s} />)}</dd></div>
        <div><dt>Ações</dt><dd className="icon-row">{data.actions.map((a) => <GameIcon key={a} type={a} size={24} />)}</dd></div>
        {data.primary_attacks.map((a, i) => (
          <div key={i}>
            <dt>{a.type === 'Melee' ? 'Corpo a corpo' : 'À distância'}</dt>
            <dd>{a.description} <span className="muted">· arco {ARC_LABEL[a.arc] ?? a.arc}, alcance {a.range}</span></dd>
          </div>
        ))}
        <div><dt>Base</dt><dd>{BASE_LABEL[data.base] ?? data.base}{data.flyer ? ' · voa' : ' · terrestre'}</dd></div>
        <div><dt>Coleção</dt><dd>{data.set} <span className="muted">· {data.wave}</span></dd></div>
      </dl>

      {data.special && <CardText text={data.special} />}

      <div className="dials">
        <ManeuverDial grid={data.movement?.flight} label="Voo" />
        <ManeuverDial grid={data.movement?.ground} label="Solo" />
      </div>

      {!full && (
        <Link className="text-link" to={`/card/creature/${data.uid}`}>Abrir página da carta</Link>
      )}
    </article>
  );
}

const yes = (v: unknown) => v === true;

export function UpgradeCard({ data, full = false }: { data: UpgradeData; full?: boolean }) {
  const facts: [string, string][] = [];
  if (data.range !== null && data.range !== undefined && data.range !== '') facts.push(['Alcance', String(data.range)]);
  if (data.arc) facts.push(['Arco', ARC_LABEL[data.arc] ?? data.arc]);
  if (data.area && data.area !== 'false') facts.push(['Área', data.area]);
  if (data.dts) facts.push(['Marcadores de dano', String(data.dts)]);
  const flags = [
    yes(data.action) && 'Ação',
    yes(data.attack) && 'Ataque',
    yes(data.penetrates) && 'Penetra armadura',
    yes(data.exhausts) && 'Exaure',
    yes(data.discards) && 'Descarta',
    yes(data.disables) && 'Desativa',
  ].filter(Boolean) as string[];
  return (
    <article className="card card-upgrade" aria-label={data.name}>
      <header className="card-head">
        <div>
          {!full && <h2 className="card-name">{data.name}</h2>}
          <p className="card-class">{data.classtype}</p>
        </div>
        <CostBadge value={data.cost} unique={data.unique} />
      </header>
      <div className="card-tags">
        <span className="tag-icon"><GameIcon type={data.upgrade} size={22} />{SLOT_LABEL[data.upgrade] ?? data.upgrade}</span>
        {data.level ? <span className="tag-level">Nível <span className="num">{data.level}+</span></span> : null}
        {data.element && <span className="tag-icon"><GameIcon type={data.element} color size={22} />{data.element}</span>}
        {data.unique && <span className="tag-plain">Única</span>}
        {data.artifact && <span className="tag-plain">Artefato{data.artifactSet ? ` ${data.artifactSet}` : ''}</span>}
      </div>
      <CardText text={data.text} />
      {(facts.length > 0 || flags.length > 0) && (
        <dl className="kv">
          {facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
          {flags.length > 0 && <div><dt>Efeitos</dt><dd>{flags.join(' · ')}</dd></div>}
        </dl>
      )}
      <dl className="kv">
        <div><dt>Coleção</dt><dd>{data.set} <span className="muted">· {data.wave}</span></dd></div>
      </dl>
      {!full && <LegionFit data={data} />}
      {!full && <Link className="text-link" to={`/card/upgrade/${data.uid}`}>Abrir página da carta</Link>}
    </article>
  );
}

/* Para cada criatura da legião: o custo deste upgrade nela, ou o motivo de não caber. */
function LegionFit({ data }: { data: UpgradeData }) {
  const { legion, mutate } = useStore();
  if (!legion.creatures.length) return null;
  return (
    <section className="fit" aria-label="Na sua legião">
      <h3 className="fit-title">Na sua legião</h3>
      <ul>
        {legion.creatures.map((c, i) => {
          const probe = new Upgrade(data);
          const ok = legion.canCreatureEquipUpgrade(c, probe);
          const why = ok ? null : legion.whyNot(c, probe);
          return (
            <li key={c.key} className={ok ? 'fit-ok' : 'fit-no'}>
              <span className="fit-name"><span className="num muted">#{i + 1}</span> {c.name}</span>
              {ok ? (
                <>
                  <span className="num fit-cost">{probe.costForCreature(c, legion)} pts</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => mutate((l) => l.equip(c, data), `${data.name} equipado em ${c.name}.`)}>
                    Equipar
                  </button>
                </>
              ) : (
                <span className="fit-why">{why}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
