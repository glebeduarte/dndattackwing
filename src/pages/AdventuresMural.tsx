import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADVENTURES, CAMPAIGNS, CHAPTER_HOOKS, STAGES, coverFor, type Adventure } from '../data/adventures';

const art = (a: Adventure) => a.hero ?? coverFor(a.chapter);
const pts = (a: Adventure) => a.sides.map((s) => s.points).join(' x ');
const hook = (a: Adventure) => (a.chapter != null ? CHAPTER_HOOKS[String(a.chapter)] : undefined) ?? a.theme ?? a.synopsis[0];

/* Destaque com as aventuras que têm arte própria, trocando sozinho. */
export function AdvFeature({ onOpen }: { onOpen(a: Adventure): void }) {
  const feats = ADVENTURES.filter((a) => a.hero);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || feats.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % feats.length), 6000);
    return () => window.clearInterval(t);
  }, [auto, feats.length]);
  if (!feats.length) return null;
  const a = feats[i];
  return (
    <header className="mv-feat">
      {feats.map((f, j) => <img key={f.slug} src={f.hero} alt="" aria-hidden className={j === i ? 'is-on' : ''} style={f.heroPosition ? { objectPosition: f.heroPosition } : undefined} />)}
      <div className="mv-feat-copy">
        <p className="mv-k">{a.campaign ? 'Capítulo de campanha' : 'Aventura do portal'} · {pts(a)} pontos</p>
        <h1>{a.title}</h1>
        <p className="mv-t">{a.theme ?? a.synopsis[0]}</p>
        <button className="btn btn-primary" onClick={() => onOpen(a)}>Ver a aventura</button>
      </div>
      {feats.length > 1 && (
        <div className="mv-thumbs" role="group" aria-label="Aventuras em destaque">
          {feats.map((f, j) => (
            <button key={f.slug} className={j === i ? 'is-on' : ''} aria-label={f.title} aria-pressed={j === i} onClick={() => { setI(j); setAuto(false); }}>
              <img src={f.hero} alt="" />
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function Poster({ a, code, onOpen }: { a: Adventure; code?: string; onOpen(a: Adventure): void }) {
  const im = art(a);
  return (
    <button className={`mv-poster${im ? '' : ' no-img'}`} onClick={() => onOpen(a)}>
      {im && <img src={im} alt="" loading="lazy" />}
      {code && <span className="mv-n">{code}</span>}
      <span className="mv-pts">{pts(a)}</span>
      <span className="mv-c">
        <b>{a.title}</b>
        <small>{a.original}</small>
        <span className="mv-h">{hook(a)}</span>
      </span>
    </button>
  );
}

export function AdvMural({ onOpen }: { onOpen(a: Adventure): void }) {
  const [tab, setTab] = useState('todas');
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const match = (a: Adventure) => !term || [a.title, a.original, a.theme ?? '', ...a.synopsis, ...a.sides.map((s) => s.name)].join(' ').toLowerCase().includes(term);
  const portal = ADVENTURES.filter((a) => !a.campaign && match(a));
  const tabs: [string, string][] = [['todas', 'Todas'], ...CAMPAIGNS.map((c) => [c.slug, c.title] as [string, string]), ['portal', 'Aventuras do portal']];

  const camps = useMemo(() => CAMPAIGNS.filter((c) => tab === 'todas' || tab === c.slug).map((c) => {
    const ch = ADVENTURES.filter((a) => a.campaign === c.slug);
    const stages = (STAGES[c.slug] ?? []).map((s) => ({ ...s, list: s.codes.map((code) => ch.find((a) => String(a.chapter) === code)).filter((a): a is Adventure => !!a && match(a)) })).filter((s) => s.list.length);
    return { c, total: ch.length, stages };
  }).filter((x) => x.stages.length), [tab, term]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="mv-bar">
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'is-on' : ''} aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar aventura, criatura ou lugar" aria-label="Buscar aventura" />
      </div>
      {camps.map(({ c, total, stages }) => (
        <section key={c.slug} className="mv-camp" aria-labelledby={`c-${c.slug}`}>
          <div className="mv-camp-head">
            <div><h2 id={`c-${c.slug}`}>{c.title}</h2><p>{c.summary}</p></div>
            <span className="mv-prog">{total} capítulos com guia</span>
          </div>
          {stages.map((s, i) => (
            <div key={s.id} className="mv-stage">
              <h3>{s.title} <span>{s.wave} · {s.list.length} capítulo(s)</span></h3>
              <p>{s.summary}</p>
              <div className={`mv-wall${i === 0 && s.list.length >= 4 ? ' is-first' : ''}`}>
                {s.list.map((a) => <Poster key={a.slug} a={a} code={String(a.chapter)} onOpen={onOpen} />)}
              </div>
            </div>
          ))}
        </section>
      ))}
      {(tab === 'todas' || tab === 'portal') && portal.length > 0 && (
        <section className="mv-camp" aria-labelledby="c-portal">
          <div className="mv-camp-head">
            <div><h2 id="c-portal">Aventuras do portal</h2><p>Cenários criados aqui, com mapa, terrenos para imprimir e legião sugerida para cada lado. Jogam sozinhos ou entre os capítulos de uma campanha.</p></div>
            <span className="mv-prog">{portal.length} aventuras</span>
          </div>
          <div className="mv-stage"><div className={`mv-wall${portal.length >= 4 ? ' is-first' : ''}`}>{portal.map((a) => <Poster key={a.slug} a={a} onOpen={onOpen} />)}</div></div>
        </section>
      )}
      {!camps.length && !(portal.length && (tab === 'todas' || tab === 'portal')) && <p className="mv-empty">Nenhuma aventura com esse termo.</p>}
    </>
  );
}

/* Painel lateral com o resumo da aventura, sem sair da página. */
export function AdvDrawer({ a, onClose, onOpen }: { a: Adventure | null; onClose(): void; onOpen(a: Adventure): void }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!a) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [a, onClose]);
  const camp = a ? CAMPAIGNS.find((c) => c.slug === a.campaign) : undefined;
  const sib = a ? ADVENTURES.filter((x) => (a.campaign ? x.campaign === a.campaign : !x.campaign)) : [];
  const i = a ? sib.indexOf(a) : -1;
  const h = a?.chapter != null ? CHAPTER_HOOKS[String(a.chapter)] : undefined;
  return (
    <>
      <div className={`mv-shade${a ? ' is-on' : ''}`} onClick={onClose} />
      <aside className={`mv-drawer${a ? ' is-on' : ''}`} aria-hidden={!a} aria-label="Resumo da aventura">
        {a && (
          <>
            <figure>
              <img src={art(a) ?? '/home/keyart.webp'} alt="" style={a.hero && a.heroPosition ? { objectPosition: a.heroPosition } : undefined} />
              <button className="mv-x" onClick={onClose} aria-label="Fechar">×</button>
            </figure>
            <div className="mv-dbody">
              <p className="mv-dk">{camp ? `${camp.title} · capítulo ${a.chapter}` : 'Aventura do portal'}</p>
              <h2>{a.title}</h2>
              <p className="mv-do">{a.original}</p>
              <p>{a.synopsis[0]}</p>
              <div className="mv-sides">
                {a.sides.map((s) => <div key={s.id} style={{ borderColor: s.color }}><b>{s.name}</b><span>{s.points} pontos</span></div>)}
              </div>
              <div className="mv-tags">
                <span>{a.players} jogadores</span>
                <span>{a.specialRules.length} regras especiais</span>
                {a.outcomes.length > 0 && <span>{a.outcomes.length} finais</span>}
                {a.tokenSheet && <span>Terrenos para imprimir</span>}
                {a.sides.some((s) => s.suggested) && <span>Legião sugerida</span>}
              </div>
              {h && <p className="mv-hook"><b>O que este capítulo revela:</b> {h}</p>}
              <div className="mv-acts">
                <button className="btn btn-primary" onClick={() => navigate(`/aventuras/${a.slug}`)}>Abrir a aventura</button>
                {a.tokenSheet && <a className="btn btn-secondary" href={a.tokenSheet} download>Baixar os terrenos</a>}
              </div>
              <div className="mv-nav">
                <button disabled={i <= 0} onClick={() => sib[i - 1] && onOpen(sib[i - 1])}>{i > 0 ? `← ${sib[i - 1].title}` : ''}</button>
                <button disabled={i >= sib.length - 1} onClick={() => sib[i + 1] && onOpen(sib[i + 1])}>{i < sib.length - 1 ? `${sib[i + 1].title} →` : ''}</button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

