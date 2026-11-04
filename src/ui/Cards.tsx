import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCardImage, type CardKind } from '../cardImages';
import { useCardLang } from '../i18n/cards';
import { Upgrade } from '../engine/engine';
import type { CreatureData, UpgradeData } from '../engine/types';
import { useStore } from '../store';
import { ALIGN_LABEL, ARC_LABEL, BASE_LABEL, CardText, GameIcon, ManeuverDial, SLOT_LABEL } from './bits';

/* Cartas desenhadas como as originais do Attack Wing: selo de custo, coluna de atributos e slots,
   faixa com o nome, texto sobre o pergaminho e os ataques em escudos no canto. */

function CostSeal({ value, unique }: { value: number | string; unique?: boolean }) {
  return (
    <span className={`seal${unique ? ' is-unique' : ''}`} title={unique ? 'Custo, carta única' : 'Custo'}>
      <span className="seal-label">Custo</span>
      <span className="seal-value">{value}</span>
    </span>
  );
}

function LevelBadge({ value, plus }: { value: number; plus?: boolean }) {
  return (
    <span className="lvl" title="Nível">
      <span className="lvl-label">Nv</span>
      <span className="lvl-value">{value}{plus ? '+' : ''}</span>
    </span>
  );
}

/* Alterna o texto das cartas entre o original em inglês e a tradução. A escolha vale para todas as cartas. */
export function LangToggle() {
  const { lang, setLang } = useCardLang();
  return (
    <div className="card-lang" role="group" aria-label="Idioma do texto das cartas">
      <button className={lang === 'en' ? 'is-on' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>Inglês</button>
      <button className={lang === 'pt' ? 'is-on' : ''} aria-pressed={lang === 'pt'} onClick={() => setLang('pt')}>Português</button>
    </div>
  );
}

/* Mostra a foto da carta original quando existe, com opção de ver a ficha do sistema. */
function CardFace({ kind, uid, name, text, children }: { kind: CardKind; uid: number; name: string; text?: string | null; children: ReactNode }) {
  const url = useCardImage(kind, uid);
  const [view, setView] = useState<'original' | 'sistema'>('original');
  const { lang, creatureText, upgradeText } = useCardLang();
  if (!url) {
    return (
      <>
        <div className="card-bar"><LangToggle /></div>
        {children}
        <Link className="card-photo-link" to={`/leitor?tipo=${kind}&uid=${uid}`}>Adicionar foto da carta original</Link>
      </>
    );
  }
  const translated = kind === 'creature' ? creatureText(uid, text) : upgradeText(uid, text);
  return (
    <>
      <div className="card-bar">
        <div className="card-view" role="tablist" aria-label="Versão da carta">
          <button role="tab" aria-selected={view === 'original'} className={view === 'original' ? 'is-on' : ''} onClick={() => setView('original')}>Carta original</button>
          <button role="tab" aria-selected={view === 'sistema'} className={view === 'sistema' ? 'is-on' : ''} onClick={() => setView('sistema')}>Ficha do sistema</button>
        </div>
        <LangToggle />
      </div>
      {view === 'original' ? (
        <>
          <figure className="card-photo">
            <img src={url} alt={`Carta original de ${name}`} />
          </figure>
          {lang === 'pt' && translated && translated !== text && (
            <div className="card-photo-tr">
              <p className="card-photo-tr-title">Texto da carta em português</p>
              <CardText text={translated} iconSize={15} />
            </div>
          )}
        </>
      ) : (
        children
      )}
    </>
  );
}

const STAT_DEFS = [
  ['pwv', 'attack', 'Arma primária'],
  ['agility', 'agility', 'Agilidade'],
  ['health', 'health', 'Vida'],
  ['armor', 'armor', 'Armadura'],
] as const;

export function CreatureCard({ data, full = false }: { data: CreatureData; full?: boolean }) {
  const t = useCardLang();
  const elements = [data.element, ...(data.elements ?? [])].filter(Boolean) as string[];
  return (
    <div className={`card-wrap${full ? ' is-full' : ''}`}>
      <CardFace kind="creature" uid={data.uid} name={data.name} text={data.special}>
      <article className="gcard gcard-creature" aria-label={`Carta ${data.name}`}>
        <div className="gc-rail">
          <CostSeal value={data.cost} unique={data.unique} />
          <div className="gc-slots" aria-label="Slots de upgrade">
            {data.upgrades.map((s, i) => (
              <GameIcon key={i} type={s} size={26} title={SLOT_LABEL[s] ?? s} />
            ))}
          </div>
          <dl className="gc-stats">
            {STAT_DEFS.map(([icon, key, label]) => (
              <div className={`gc-stat gc-stat-${icon}`} key={icon} title={label}>
                <dt><GameIcon type={icon} color size={24} title={label} /></dt>
                <dd>{(data as any)[key]}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="gc-main">
          <div className="gc-top">
            <div className="gc-medals">
              <GameIcon type={data.alignment} color size={30} title={ALIGN_LABEL[data.alignment]} />
              {elements.map((e) => <GameIcon key={e} type={e} color size={30} />)}
            </div>
            <LevelBadge value={data.level} />
          </div>

          <div className="gc-banner">
            <h2 className="gc-name">{data.name}</h2>
            <p className="gc-class">{t.classtype(data.classtype)}</p>
          </div>

          <div className="gc-body">
            <div className="gc-text">
              {data.special ? <CardText text={t.creatureText(data.uid, data.special)} iconSize={16} /> : <p className="gc-none">Sem habilidade especial.</p>}
              <div className="gc-actions" aria-label="Barra de ações">
                {data.actions.map((a) => <GameIcon key={a} type={a} size={24} />)}
              </div>
            </div>
            <div className="gc-attacks">
              {data.primary_attacks.map((a, i) => (
                <div className="gc-attack" key={i} title={`${a.description}: arco ${ARC_LABEL[a.arc] ?? a.arc}, alcance ${a.range}`}>
                  <span className="gc-shield">{a.range}</span>
                  <span className="gc-atk-name">{a.description}</span>
                  <span className="gc-atk-type">{a.type === 'Melee' ? 'Corpo a corpo' : 'Distância'}{a.arc === 'Rear' ? ' · trás' : ''}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="gc-foot">
            {BASE_LABEL[data.base] ?? data.base} · {data.flyer ? 'voa' : 'terrestre'}{data.unique ? ' · única' : ''} · {data.set}
          </p>
        </div>
      </article>
      </CardFace>

      <div className="dials">
        <ManeuverDial grid={data.movement?.flight} label="Voo" />
        <ManeuverDial grid={data.movement?.ground} label="Solo" />
      </div>
      {!full && <Link className="text-link" to={`/card/creature/${data.uid}`}>Abrir página da carta</Link>}
    </div>
  );
}

const yes = (v: unknown) => v === true;

export function UpgradeCard({ data, full = false }: { data: UpgradeData; full?: boolean }) {
  const t = useCardLang();
  const area = data.area && data.area !== 'false' ? data.area : null;
  const hasRange = data.range !== null && data.range !== undefined && data.range !== '';
  const flags = [
    yes(data.action) && 'Ação',
    yes(data.attack) && 'Ataque',
    yes(data.penetrates) && 'Penetra armadura',
    yes(data.exhausts) && 'Exaure',
    yes(data.discards) && 'Descarta',
    yes(data.disables) && 'Desativa',
  ].filter(Boolean) as string[];

  return (
    <div className={`card-wrap${full ? ' is-full' : ''}`}>
      <CardFace kind="upgrade" uid={data.uid} name={data.name} text={data.text}>
      <article className={`gcard gcard-upgrade slot-${data.upgrade.toLowerCase()}`} aria-label={`Carta ${data.name}`}>
        <div className="gu-art">
          <CostSeal value={data.cost} unique={data.unique} />
          {data.level ? <LevelBadge value={data.level} plus /> : null}
          <span className="gu-emblem"><GameIcon type={data.upgrade} size={72} title={SLOT_LABEL[data.upgrade]} /></span>
          {data.element && <span className="gu-element"><GameIcon type={data.element} color size={30} /></span>}
          {(hasRange || area) && (
            <span className="gu-scroll" title={[area, hasRange && `alcance ${data.range}`].filter(Boolean).join(', ')}>
              {hasRange && <span className="gu-range">{data.range}</span>}
              <span className="gu-scroll-label">{area ?? (data.arc ? ARC_LABEL[data.arc] ?? data.arc : 'Alcance')}</span>
            </span>
          )}
        </div>
        <div className="gc-banner">
          <h2 className="gc-name">{data.name}</h2>
          <p className="gc-class">{t.classtype(data.classtype)}</p>
        </div>
        <div className="gu-body">
          <CardText text={t.upgradeText(data.uid, data.text)} iconSize={16} />
        </div>
        <p className="gc-foot">
          {SLOT_LABEL[data.upgrade] ?? data.upgrade}
          {data.artifact ? ` · artefato${data.artifactSet ? ` ${data.artifactSet}` : ''}` : ''}
          {flags.length ? ` · ${flags.join(', ')}` : ''}
          {data.dts ? ` · ${data.dts} marcadores` : ''} · {data.set}
        </p>
      </article>
      </CardFace>
      {!full && <LegionFit data={data} />}
      {!full && <Link className="text-link" to={`/card/upgrade/${data.uid}`}>Abrir página da carta</Link>}
    </div>
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
              <span className="fit-name"><span className="num muted">{i + 1}</span> {c.name}</span>
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
