import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ADVENTURES, CAMPAIGN_RULES, adventureBySlug, type Adventure, type MapSpec } from '../data/adventures';
import { Legion } from '../engine/engine';
import { catalog, useStore } from '../store';
import { Shell } from '../ui/Shell';

const MANUAL = '/manual/attack-wing-livro-de-regras.pdf';

/* Mapa da área de jogo, desenhado a partir dos dados da aventura (90 x 90 cm). */
function AdventureMap({ map, sides }: { map: MapSpec; sides: Adventure['sides'] }) {
  const color = (id: string) => sides.find((s) => s.id === id)?.color ?? '#555';
  const wall = map.walls?.[0];
  const except = wall?.except ? map.areas.find((a) => a.side === wall.except) : undefined;
  return (
    <figure className="adv-map">
      <svg viewBox="-8 -8 106 106" role="img" aria-label="Mapa da área de jogo">
        <rect x="0" y="0" width="90" height="90" fill="#efe7da" />
        {wall?.edge === 'all' && (
          <path
            d={except ? `M ${except.x} 90 L 0 90 L 0 0 L 90 0 L 90 ${except.y}` : 'M0 0 H90 V90 H0 Z'}
            fill="none" stroke={wall.color} strokeWidth="1.6"
          />
        )}
        {wall?.edge === 'W' && <line x1="0" y1="0" x2="0" y2="90" stroke={wall.color} strokeWidth="2.2" />}
        {map.areas.map((a) => (
          <g key={a.side}>
            <rect x={a.x} y={a.y} width={a.w} height={a.h} fill={color(a.side)} opacity="0.9" />
          </g>
        ))}
        {map.tokens.map((t, i) => (
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
          <li><span className="sw sw-dot" /> Fichas de objetivo</li>
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

        <section className="adv-list" aria-label="Aventuras disponíveis">
          {ADVENTURES.map((a) => (
            <Link key={a.slug} to={`/aventuras/${a.slug}`} className="adv-item">
              <span className="adv-num">{a.number}</span>
              <div className="adv-item-copy">
                <h2>{a.title}</h2>
                <p className="adv-orig">{a.original}</p>
                <p>{a.synopsis[0]}</p>
                <p className="adv-meta">
                  {a.players} jogadores · {a.sides.map((s) => `${s.name} ${s.points} pts`).join(' · ')}
                </p>
              </div>
              <span className="adv-go" aria-hidden>→</span>
            </Link>
          ))}
          <div className="adv-soon">
            <h2>Novas aventuras</h2>
            <p>As próximas aventuras do portal entram aqui, no mesmo formato: preparação, regras especiais, objetivos e recompensas para a campanha.</p>
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
          Guias escritos a partir do livro de regras de D&D Attack Wing, páginas 34 a 38. O texto completo, com os parágrafos de história, está no{' '}
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
    notify('ok', `Legião de ${side.name} com limite de ${side.points} pontos. Complete com melhorias.`);
    navigate('/construtor');
  };

  const next = ADVENTURES.find((x) => x.number === a.number + 1);

  return (
    <Shell>
      <article className="adv adv-detail">
        <header className="adv-hero adv-hero-sm">
          <img src="/home/keyart.webp" alt="" aria-hidden />
          <div className="adv-hero-copy">
            <nav className="adv-crumbs" aria-label="Trilha"><Link to="/aventuras">Aventuras</Link> / Aventura {a.number}</nav>
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
                <div><dt>Componentes</dt><dd>{a.components.join('; ')}</dd></div>
              </dl>
            </section>
            <section className="adv-build">
              <h2>Montar a legião</h2>
              <p className="muted">Abre o construtor com o dragão do lado escolhido e o limite de pontos da aventura.</p>
              {a.sides.map((s) => (
                <button key={s.id} className="adv-side-btn" onClick={() => build(s)}>
                  <span className="sw" style={{ background: s.color }} />
                  <span>{s.name}</span>
                  <span className="num">{s.points} pts</span>
                </button>
              ))}
            </section>
            {next && (
              <Link className="adv-next" to={`/aventuras/${next.slug}`}>
                Próxima: Aventura {next.number}, {next.title} →
              </Link>
            )}
          </aside>
        </div>
      </article>
    </Shell>
  );
}
