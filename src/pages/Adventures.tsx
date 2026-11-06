import { useEffect, useState } from 'react';
import { PrintSheet } from '../ui/Print';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CAMPAIGNS, CAMPAIGN_RULES, coverFor, adventureBySlug, campaignBySlug, campaignChapters, standaloneAdventures, type Adventure, type MapSpec } from '../data/adventures';
import { Legion, loadLegionFromCode } from '../engine/engine';
import { catalog, useStore } from '../store';
import { Shell } from '../ui/Shell';
import { CampaignTrail } from './CampaignTrail';

const MANUAL = '/manual/attack-wing-livro-de-regras.pdf';

/* Mapa da área de jogo, desenhado a partir dos dados da aventura (90 x 90 cm). */
function AdventureMap({ map, sides }: { map: MapSpec; sides: Adventure['sides'] }) {
  const color = (id: string) => sides.find((s) => s.id === id)?.color ?? '#555';
  const wall = map.walls?.[0];
  const except = wall?.except ? map.areas.find((a) => a.side === wall.except) : undefined;
  return (
    <figure className="adv-map">
      <svg viewBox="-8 -8 106 106" role="img" aria-label="Mapa da área de jogo">
        <defs>
          <radialGradient id="portal"><stop offset="0" stopColor="#ffb347" /><stop offset="0.55" stopColor="#c0282d" /><stop offset="1" stopColor="#3a0d0d" /></radialGradient>
          <linearGradient id="river" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7fb6d8" /><stop offset="0.5" stopColor="#3a7cb0" /><stop offset="1" stopColor="#7fb6d8" /></linearGradient>
          <linearGradient id="lava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9a2e" /><stop offset="0.5" stopColor="#e2461d" /><stop offset="1" stopColor="#ff9a2e" /></linearGradient>
        </defs>
        <rect x="0" y="0" width="90" height="90" fill="#efe7da" />
        {wall?.edge === 'all' && (
          <path
            d={except ? `M ${except.x} 90 L 0 90 L 0 0 L 90 0 L 90 ${except.y}` : 'M0 0 H90 V90 H0 Z'}
            fill="none" stroke={wall.color} strokeWidth="1.6"
          />
        )}
        {wall?.edge === 'W' && <line x1="0" y1="0" x2="0" y2="90" stroke={wall.color} strokeWidth="2.2" />}
        {wall?.edge === 'N' && <line x1="0" y1="0" x2="90" y2="0" stroke={wall.color} strokeWidth="2.2" />}
        {wall?.edge === 'S' && <line x1="0" y1="90" x2="90" y2="90" stroke={wall.color} strokeWidth="2.2" />}
        {map.areas.map((a) => (
          <g key={a.side}>
            <rect x={a.x} y={a.y} width={a.w} height={a.h} fill={color(a.side)} opacity="0.9" />
          </g>
        ))}
        {map.terrain?.map((t, i) => t.kind === 'portal' ? (
          <g key={`t${i}`}><circle cx={t.x + t.w / 2} cy={t.y + t.h / 2} r={t.w / 2} fill="url(#portal)" stroke="#5a0f0f" strokeWidth="0.6" /><text x={t.x + t.w / 2} y={t.y + t.h / 2 + 1} textAnchor="middle" fontSize="2.6" fontWeight="700" fill="#fff">Tiamat</text></g>
        ) : t.kind === 'mask' ? (
          <g key={`t${i}`}>
            <path d={`M${t.x} ${t.y - 2.6} l2.25 1.3 v2.6 l-2.25 1.3 l-2.25 -1.3 v-2.6 Z`} fill={({ N: '#1d1815', A: '#2f5fb0', V: '#c0282d', B: '#e8e8ea', Ve: '#3f8a4a' } as Record<string, string>)[t.label] ?? '#888'} stroke="#000" strokeWidth="0.4" />
          </g>
        ) : t.kind === 'road' ? (
          <rect key={`t${i}`} x={t.x} y={t.y} width={t.w} height={t.h} fill="#d9c9a8" />
        ) : t.kind === 'river' ? (
          <rect key={`t${i}`} x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#river)" />
        ) : t.kind === 'wagon' ? (
          <g key={`t${i}`}><rect x={t.x} y={t.y} width={t.w} height={t.h} rx="0.6" fill="#7a5532" stroke="#3b2814" strokeWidth="0.4" /><text x={t.x + t.w / 2} y={t.y + t.h / 2 + 1.1} textAnchor="middle" fontSize="2.8" fontWeight="700" fill="#fff">{t.label}</text></g>
        ) : t.kind === 'grove' ? (
          <circle key={`t${i}`} cx={t.x + t.w / 2} cy={t.y + t.h / 2} r={t.w / 2} fill="#3f7a44" opacity="0.75" stroke="#24502a" strokeWidth="0.4" />
        ) : t.kind === 'ruin' ? (
          <rect key={`t${i}`} x={t.x} y={t.y} width={t.w} height={t.h} fill="#8a8178" stroke="#4a4540" strokeWidth="0.4" strokeDasharray="1 0.6" />
        ) : t.kind === 'lava' ? (
          <rect key={`t${i}`} x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#lava)" />
        ) : t.kind === 'bridge' ? (
          <rect key={`t${i}`} x={t.x} y={t.y - 0.6} width={t.w} height={t.h + 1.2} fill="#2b2622" stroke="#5d554c" strokeWidth="0.4" />
        ) : t.kind === 'pillar' ? (
          <circle key={`t${i}`} cx={t.x + t.w / 2} cy={t.y + t.h / 2} r={t.w / 2} fill="#4a4540" stroke="#2b2622" strokeWidth="0.5" />
        ) : (
          <circle key={`t${i}`} cx={t.x + t.w / 2} cy={t.y + t.h / 2} r={t.w / 2} fill="#8c8580" opacity="0.45" stroke="#6c645b" strokeDasharray="1.2 1" strokeWidth="0.4" />
        ))}
        {map.tokens.map((t, i) => map.terrain ? (
          <g key={i}>
            <path d={`M${t.x} ${t.y - 2.6} l2.25 1.3 v2.6 l-2.25 1.3 l-2.25 -1.3 v-2.6 Z`} fill="#b9a57b" stroke="#5d554c" strokeWidth="0.4" />
            {t.label && <text x={t.x} y={t.y + 1.1} textAnchor="middle" fontSize="2.8" fontWeight="700" fill="#1d1815">{t.label}</text>}
          </g>
        ) : (
          <circle key={i} cx={t.x} cy={t.y} r="2.2" fill="#9a8f80" />
        ))}
        {map.center && <path d="M45 42.5 L47.5 45 L45 47.5 L42.5 45 Z" fill="#c0282d" />}
        <text x="45" y="-3" textAnchor="middle" fontSize="3.6" fill="#5d554c">N</text>
        <text x="45" y="97" textAnchor="middle" fontSize="3.6" fill="#5d554c">S</text>
        <text x="-4.5" y="46.2" textAnchor="middle" fontSize="3.6" fill="#5d554c">W</text>
        <text x="94.5" y="46.2" textAnchor="middle" fontSize="3.6" fill="#5d554c">E</text>
      </svg>
      <figcaption>
        <ul className="adv-legend">
          {map.areas.map((a) => (
            <li key={a.side}><span className="sw" style={{ background: color(a.side) }} /> Área inicial: {a.label}</li>
          ))}
          {map.terrain ? (
            <>
              {map.tokens.length > 0 && <li><span className="sw" style={{ background: '#b9a57b' }} /> Altares rúnicos (1 a 3)</li>}
              {map.terrain.some((t) => t.kind === 'portal') && <li><span className="sw sw-dot" style={{ background: '#c0282d' }} /> Portal de Avernus (Tiamat começa aqui)</li>}
              {map.terrain.some((t) => t.kind === 'mask') && <li><span className="sw" style={{ background: 'linear-gradient(90deg,#1d1815 20%,#2f5fb0 20% 40%,#3f8a4a 40% 60%,#c0282d 60% 80%,#e8e8ea 80%)' }} /> Máscaras Dracônicas (negra, azul, verde, vermelha e branca)</li>}
              {map.terrain.some((t) => t.kind === 'river') && <li><span className="sw" style={{ background: '#3a7cb0' }} /> Rio</li>}
              {map.terrain.some((t) => t.kind === 'road') && <li><span className="sw" style={{ background: '#d9c9a8' }} /> Estrada</li>}
              {map.terrain.some((t) => t.kind === 'wagon') && <li><span className="sw" style={{ background: '#7a5532' }} /> Carroças do tesouro (1 a 3)</li>}
              {map.terrain.some((t) => t.kind === 'grove') && <li><span className="sw sw-dot" style={{ background: '#3f7a44' }} /> Bosques</li>}
              {map.terrain.some((t) => t.kind === 'ruin') && <li><span className="sw" style={{ background: '#8a8178' }} /> Ruína da estalagem</li>}
              {map.terrain.some((t) => t.kind === 'lava') && <li><span className="sw" style={{ background: '#e2461d' }} /> Rio de lava</li>}
              {map.terrain.some((t) => t.kind === 'bridge') && <li><span className="sw" style={{ background: '#2b2622' }} /> {map.terrain.find((t) => t.kind === 'bridge')!.label.startsWith('Ponte de B') ? 'Ponte de Boareskyr' : 'Pontes de obsidiana'}</li>}
              {map.terrain.some((t) => t.kind === 'pillar') && <li><span className="sw sw-dot" style={{ background: '#4a4540' }} /> {map.terrain.find((t) => t.kind === 'pillar')!.label === 'Rocha' ? 'Rochas de basalto' : 'Pilares de basalto'}</li>}
              {map.terrain.some((t) => t.kind === 'ash') && <li><span className="sw sw-dot" style={{ background: '#b3aca6' }} /> Nuvens de cinzas</li>}
            </>
          ) : <li><span className="sw sw-dot" /> Fichas de objetivo</li>}
          {map.center && <li><span className="sw sw-center" /> Centro da área</li>}
          {map.walls?.map((w) => (
            <li key={w.label}><span className="sw sw-line" style={{ background: w.color }} /> {w.label}</li>
          ))}
        </ul>
        {map.note && <p>{map.note}</p>}
      </figcaption>
    </figure>
  );
}

function AdventureItem({ a, label }: { a: Adventure; label: string }) {
  return (
    <Link to={`/aventuras/${a.slug}`} className="adv-item">
      <span className="adv-num">{a.chapter ?? <img src="/brand-dragon-light.png" width={26} height={26} alt="" />}</span>
      <div className="adv-item-copy">
        <h3>{a.title}</h3>
        <p className="adv-orig">{label} · {a.original}</p>
        <p>{a.theme ?? a.synopsis[0]}</p>
        <p className="adv-meta">
          {a.players} jogadores · {a.sides.map((s) => `${s.name} ${s.points} pts`).join(' · ')}
        </p>
      </div>
      <span className="adv-go" aria-hidden>→</span>
    </Link>
  );
}

export function AdventuresPage() {
  useEffect(() => {
    document.title = 'Aventuras · Attack Wing';
  }, []);
  return (
    <Shell>
      <div className="adv">
        <header className="adv-hero">
          <img src="/home/keyart.webp" alt="" aria-hidden />
          <div className="adv-hero-copy">
            <h1>Aventuras</h1>
            <p>Partidas com objetivos próprios, regras especiais e um pedaço de história. Jogue cada uma sozinha ou em sequência, como campanha, acumulando experiência e artefatos.</p>
          </div>
        </header>

        {CAMPAIGNS.map((c) => (
          <section key={c.slug} className="adv-camp-group" aria-labelledby={`camp-${c.slug}`}>
            <header className="adv-camp-head">
              <div>
                <h2 id={`camp-${c.slug}`}>Campanha: {c.title}</h2>
                <p className="adv-orig">{c.original} · {c.source} · {c.status}</p>
                <p>{c.summary}</p>
              </div>
            </header>
            <CampaignTrail campaign={c} />
          </section>
        ))}

        <section className="adv-camp-group" aria-labelledby="avulsas">
          <header className="adv-camp-head">
            <div>
              <h2 id="avulsas">Aventuras do portal</h2>
              <p>Aventuras novas, criadas aqui com as peças da caixa básica. Jogam sozinhas ou entre os capítulos de uma campanha.</p>
            </div>
          </header>
          <div className="adv-list">
            {standaloneAdventures().map((a) => <AdventureItem key={a.slug} a={a} label="Avulsa" />)}
          </div>
        </section>

        <section className="adv-campaign" aria-labelledby="camp-title">
          <div>
            <h2 id="camp-title">{CAMPAIGN_RULES.title}</h2>
            <p>{CAMPAIGN_RULES.intro}</p>
            <h3>Como jogar uma aventura</h3>
            <ol>
              {CAMPAIGN_RULES.howTo.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
            <p className="muted">{CAMPAIGN_RULES.playArea}</p>
          </div>
          <dl className="adv-rules">
            {CAMPAIGN_RULES.rules.map((r) => (
              <div key={r.title}>
                <dt>{r.title}</dt>
                <dd>{r.text}</dd>
              </div>
            ))}
          </dl>
        </section>
        <p className="adv-source">
          Os capítulos da campanha são guias escritos a partir do livro de regras de D&D Attack Wing, páginas 34 a 38; o texto completo, com os parágrafos de história, está no{' '}
          <a className="text-link" href={MANUAL} target="_blank" rel="noopener">livro de regras em PDF</a>.
        </p>
      </div>
    </Shell>
  );
}

export function AdventurePage() {
  const { slug = '' } = useParams();
  const a = adventureBySlug(slug);
  const { replace, notify, setSettings } = useStore();
  const navigate = useNavigate();
  const [printing, setPrinting] = useState<{ legion: Legion; name: string; subtitle: string } | null>(null);

  useEffect(() => {
    document.title = a ? `${a.title} · Aventuras · Attack Wing` : 'Aventura não encontrada · Attack Wing';
    window.scrollTo(0, 0);
  }, [a]);

  if (!a) {
    return (
      <Shell>
        <div className="page">
          <h1 className="page-title">Aventura não encontrada</h1>
          <p><Link className="text-link" to="/aventuras">Ver todas as aventuras</Link></p>
        </div>
      </Shell>
    );
  }

  const build = (side: Adventure['sides'][number]) => {
    const l = new Legion();
    const d = side.creatureUid ? catalog.creatureByUid.get(side.creatureUid) : undefined;
    if (d) l.addCreature(d);
    replace(l, `${a.title}: ${side.name}`);
    setSettings({ target: side.points });
    notify('ok', d ? `Legião de ${side.name} com limite de ${side.points} pontos. Complete com criaturas e melhorias.` : `Limite de ${side.points} pontos para ${side.name}. ${side.requires ?? ''}`);
    navigate('/construtor');
  };

  const camp = campaignBySlug(a.campaign);
  const chapters = camp ? campaignChapters(camp.slug) : [];
  const idx = chapters.findIndex((x) => x.slug === a.slug);
  const next = camp ? chapters[idx + 1] : undefined;
  const prev = camp && idx > 0 ? chapters[idx - 1] : undefined;

  return (
    <Shell>
      {printing && <PrintSheet legion={printing.legion} name={printing.name} subtitle={printing.subtitle} mode="completa" />}
      <article className="adv adv-detail">
        <header className={`adv-hero adv-hero-sm${!a.hero && coverFor(a.chapter) ? ' has-cover' : ''}`}>
          <img src={a.hero ?? coverFor(a.chapter) ?? '/home/keyart.webp'} alt="" aria-hidden style={a.heroPosition ? { objectPosition: a.heroPosition } : undefined} />
          <div className="adv-hero-copy">
            <nav className="adv-crumbs" aria-label="Trilha">
              <Link to="/aventuras">Aventuras</Link> / {camp ? `${camp.title}, capítulo ${a.chapter}` : 'Aventura do portal'}
            </nav>
            <h1>{a.title}</h1>
            <p className="adv-orig-light">{a.original} · {a.source}</p>
          </div>
        </header>

        <div className="adv-body">
          <div className="adv-main">
            <section className="adv-block">
              <h2>A história</h2>
              {a.synopsis.map((p, i) => <p key={i}>{p}</p>)}
            </section>

            <section className="adv-block">
              <h2>Preparação</h2>
              <ol className="adv-steps">
                {a.setup.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </section>

            <section className="adv-block">
              <h2>Regras especiais</h2>
              <p className="muted">Valem acima de qualquer outra regra ou habilidade.</p>
              <dl className="adv-special">
                {a.specialRules.map((r) => (
                  <div key={r.title}>
                    <dt>{r.title}</dt>
                    <dd>{r.text}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="adv-block">
              <h2>Objetivos</h2>
              <div className="adv-objectives">
                {a.objectives.map((o) => {
                  const side = a.sides.find((s) => s.name === o.side);
                  return (
                    <div key={o.side} className="adv-obj" style={side ? { borderColor: side.color } : undefined}>
                      <h3>{o.side}</h3>
                      <ul>{o.text.map((t, i) => <li key={i}>{t}</li>)}</ul>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="adv-block">
              <h2>Depois da batalha</h2>
              <ol className="adv-outcomes">
                {a.outcomes.map((o) => (
                  <li key={o.id}>
                    <span className="adv-out-n">{o.id}</span>
                    <div>
                      <h3>{o.title}</h3>
                      <p>{o.summary}</p>
                      <ul className="adv-rewards">{o.rewards.map((r) => <li key={r}>{r}</li>)}</ul>
                    </div>
                  </li>
                ))}
              </ol>
              {a.epilogue && <p className="adv-epilogue">{a.epilogue}</p>}
            </section>
          </div>

          <aside className="adv-side">
            <AdventureMap map={a.map} sides={a.sides} />
            <section className="adv-facts">
              <h2>Em resumo</h2>
              <dl>
                <div><dt>Jogadores</dt><dd>{a.players}</dd></div>
                <div><dt>Área</dt><dd>{a.playArea}</dd></div>
                <div><dt>Componentes</dt><dd>{a.components.join('; ')}{a.tokenSheet && <> <a className="text-link" href={a.tokenSheet} download>Baixar a folha de terrenos (PDF)</a></>}</dd></div>
              </dl>
            </section>
            <section className="adv-build">
              <h2>Montar a legião</h2>
              <p className="muted">Abre o construtor com o dragão do lado escolhido e o limite de pontos da aventura. Quando há uma legião sugerida, você pode abrir a sugestão e trocar criaturas e melhorias, desde que respeite os requisitos e o limite de pontos.</p>
              {a.sides.map((s) => (
                <div key={s.id} className="adv-side-opt">
                  <button className="adv-side-btn" onClick={() => build(s)}>
                    <span className="sw" style={{ background: s.color }} />
                    <span>{s.name}</span>
                    <span className="num">{s.points} pts</span>
                  </button>
                  {s.requires && <p className="adv-requires">{s.requires}</p>}
                  {s.suggested && (
                    <div className="adv-suggest">
                      <p className="adv-suggest-title">Legião sugerida · <span className="num">{s.suggested.total} pts</span></p>
                      <ul>{s.suggested.list.map((x) => <li key={x}>{x}</li>)}</ul>
                      {s.suggested.note && <p className="muted">{s.suggested.note}</p>}
                      <button className="btn btn-ghost btn-sm" onClick={() => {
                        const { legion } = loadLegionFromCode(s.suggested!.code, catalog);
                        replace(legion, `${a.title}: ${s.name}`);
                        setSettings({ target: s.points });
                        notify('ok', `Legião sugerida de ${s.name} aberta. Troque o que quiser, sem passar de ${s.points} pontos e mantendo os requisitos.`);
                        navigate('/construtor');
                      }}>Abrir a sugestão no construtor</button>
                      <button className="btn btn-ghost btn-sm adv-print-btn" onClick={() => {
                        setPrinting({ legion: loadLegionFromCode(s.suggested!.code, catalog).legion, name: `${s.name} · ${s.suggested!.total} pontos`, subtitle: `${a.title} · legião sugerida` });
                        setTimeout(() => window.print(), 80);
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6Z" /></svg>
                        Imprimir a lista
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>
            {next && (
              <Link className="adv-next" to={`/aventuras/${next.slug}`}>
                Capítulo {next.chapter}: {next.title} →
              </Link>
            )}
            {prev && (
              <Link className="adv-prev" to={`/aventuras/${prev.slug}`}>
                ← Capítulo {prev.chapter}: {prev.title}
              </Link>
            )}
            {camp && !next && camp.planned?.[0] && (
              <p className="adv-pending">
                Próximo na campanha: capítulo {camp.planned[0].code}, {camp.planned[0].title} (expansão {camp.planned[0].expansion}). O guia entra aqui quando o texto da aventura estiver disponível.
              </p>
            )}
          </aside>
        </div>
      </article>
    </Shell>
  );
}
