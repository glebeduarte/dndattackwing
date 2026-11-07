import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ENUM_ELEMENTS, encodeLegion } from '../engine/engine';
import { generateLegions, storyTerms, type AlignmentPick, type Context, type Focus, type GeneratedLegion, type Play, type Style, type Synergy } from '../engine/generator';
import { catalog, useStore } from '../store';
import { ALIGN_LABEL, GameIcon, SLOT_LABEL } from '../ui/bits';
import { Shell } from '../ui/Shell';

const POINTS = [60, 90, 120, 150, 180, 200, 240, 300];
const STYLES: [Style, string, string][] = [
  ['elite', 'Poucos e fortes', '2 ou 3 criaturas grandes, bem equipadas'],
  ['equilibrada', 'Equilibrada', '3 a 6 criaturas, pontos divididos'],
  ['enxame', 'Muitas criaturas', 'tropas e criaturas baratas em número'],
];
const PLAYS: [Play, string, string][] = [
  ['agressivo', 'Ataque direto', 'criaturas com muitos dados de ataque'],
  ['defensivo', 'Resistir', 'agilidade, armadura e vida altas'],
  ['distancia', 'À distância', 'ataques de longe, sem encostar'],
  ['sopros', 'Sopros em área', 'dragões com sopros que pegam vários alvos'],
  ['magia', 'Magia', 'slots de feitiços arcanos e divinos'],
];
const FOCUS: [Focus, string][] = [['dragao', 'Dragões'], ['tropa', 'Tropas'], ['heroi', 'Heróis e montarias'], ['monstro', 'Monstros']];
const SYN: [Synergy, string, string][] = [
  ['livre', 'Sem regra', 'qualquer combinação'],
  ['elemento', 'Mesmo elemento', 'criaturas do elemento da primeira escolhida'],
  ['alinhamento', 'Mesmo alinhamento', 'todas Boas, Más ou Neutras'],
];
const CTX: [Context, string, string][] = [
  ['aberto', 'Campo aberto', 'batalha direta'],
  ['objetivos', 'Objetivos', 'segurar pontos no solo, muitas ativações'],
  ['obstaculos', 'Muitos obstáculos', 'voadoras passam por cima'],
];
const STORY_EX = ['O Culto do Dragão prepara a volta de Tiamat', 'Anões e dragões metálicos defendem a montanha', 'Mortos-vivos e sombras no pântano', 'Elfos da floresta e um dragão verde'];
const ALIGNS: [AlignmentPick, string][] = [
  ['qualquer', 'Qualquer'],
  ['Good', 'Bom'],
  ['Evil', 'Mau'],
  ['Neutral', 'Neutro'],
];

export function Generator() {
  const { replace, notify, settings } = useStore();
  const navigate = useNavigate();
  // Os filtros vivem no endereço, para que um resultado possa ser compartilhado: ?pontos=200&estilo=elite&semente=123
  const [params, setParams] = useSearchParams();
  const qp = Number(params.get('pontos')) || 120;
  const [points, setPoints] = useState(POINTS.includes(qp) ? qp : 120);
  const [custom, setCustom] = useState(POINTS.includes(qp) ? '' : String(qp));
  const [style, setStyle] = useState<Style>((['elite', 'equilibrada', 'enxame'] as Style[]).find((x) => x === params.get('estilo')) ?? 'equilibrada');
  const [alignment, setAlignment] = useState<AlignmentPick>((['qualquer', 'Good', 'Evil', 'Neutral'] as AlignmentPick[]).find((x) => x === params.get('alinhamento')) ?? 'qualquer');
  const [element, setElement] = useState(params.get('elemento') ?? '');
  const [dragonsOnly, setDragonsOnly] = useState(params.get('dragoes') === '1');
  const [ownedOnly, setOwnedOnly] = useState(params.get('colecoes') === '1');
  const [initiative, setInitiative] = useState(params.get('iniciativa') === '1');
  const [seed, setSeed] = useState(() => Number(params.get('semente')) || Date.now() % 100000);
  const [play, setPlay] = useState<Play | ''>((params.get('jogo') as Play) ?? '');
  const [focus, setFocus] = useState<Focus[]>(params.get('foco') ? (params.get('foco')!.split(',') as Focus[]) : []);
  const [synergy, setSynergy] = useState<Synergy>((params.get('sinergia') as Synergy) ?? 'livre');
  const [context, setContext] = useState<Context>((params.get('cenario') as Context) ?? 'aberto');
  const [story, setStory] = useState(params.get('historia') ?? '');
  const [results, setResults] = useState<GeneratedLegion[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Gerador de legião · Attack Wing';
    if (params.get('semente')) run(seed);
  }, []);

  const limit = custom.trim() ? Math.max(20, Math.min(400, Number(custom) || 0)) : points;
  const owned = Object.values(settings.sets).filter((v) => v !== false).length;

  const run = (nextSeed = seed) => {
    setBusy(true);
    setSeed(nextSeed);
    const q: Record<string, string> = { pontos: String(limit), estilo: style, semente: String(nextSeed) };
    if (alignment !== 'qualquer') q.alinhamento = alignment;
    if (element) q.elemento = element;
    if (dragonsOnly) q.dragoes = '1';
    if (ownedOnly) q.colecoes = '1';
    if (initiative) q.iniciativa = '1';
    if (play) q.jogo = play;
    if (focus.length) q.foco = focus.join(',');
    if (synergy !== 'livre') q.sinergia = synergy;
    if (context !== 'aberto') q.cenario = context;
    if (story.trim()) q.historia = story.trim();
    setParams(q, { replace: true });
    // Deixa o navegador pintar o estado "gerando" antes do cálculo.
    window.setTimeout(() => {
      const out = generateLegions(catalog, {
        points: limit,
        style,
        alignment,
        element,
        dragonsOnly,
        sets: ownedOnly ? settings.sets : null,
        initiative,
        seed: nextSeed,
        profile: { play: play || undefined, focus, synergy, context, story },
      });
      setResults(out);
      setBusy(false);
    }, 30);
  };

  const open = (g: GeneratedLegion, i: number) => {
    replace(g.legion, `Legião gerada ${limit} pts (${i + 1})`);
    notify('ok', 'Legião aberta no construtor. Ajuste o que quiser.');
    navigate('/construtor');
  };

  const copy = async (g: GeneratedLegion) => {
    const url = `${window.location.origin}/link/${encodeLegion(g.legion)}`;
    try {
      await navigator.clipboard.writeText(url);
      notify('ok', 'Link da legião copiado.');
    } catch {
      window.prompt('Copie o link:', url);
    }
  };

  return (
    <Shell>
      <div className="gen">
        <header className="gen-hero">
          <img src="/home/keyart.webp" alt="" aria-hidden />
          <div className="gen-hero-copy">
            <h1>Gerador de legião</h1>
            <p>Escolha os pontos e o estilo de jogo. O gerador monta legiões completas dentro das regras de Construção de Legiões do livro de regras, com custos, slots, nomes únicos e artefatos conferidos carta a carta.</p>
          </div>
        </header>

        <form
          className="gen-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(Date.now() % 100000);
          }}
        >
          <fieldset className="gen-field">
            <legend>Pontos de legião</legend>
            <div className="seg">
              {POINTS.map((p) => (
                <button type="button" key={p} className={!custom && points === p ? 'is-on' : ''} aria-pressed={!custom && points === p} onClick={() => { setPoints(p); setCustom(''); }}>
                  {p}
                </button>
              ))}
              <input
                aria-label="Outro total de pontos"
                className={custom ? 'is-on' : ''}
                inputMode="numeric"
                placeholder="Outro"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 3))}
              />
            </div>
            <p className="gen-hint">O livro recomenda 120 ou 200; 60 com só a caixa básica.</p>
          </fieldset>

          <fieldset className="gen-field gen-style">
            <legend>Estilo</legend>
            <div className="style-cards">
              {STYLES.map(([v, l, d]) => (
                <label key={v} className={style === v ? 'style-card is-on' : 'style-card'}>
                  <input type="radio" name="style" value={v} checked={style === v} onChange={() => setStyle(v)} />
                  <strong>{l}</strong>
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="gen-field gen-wide">
            <legend>Como você quer vencer?</legend>
            <div className="style-cards style-cards-5">
              {PLAYS.map(([v, l, d]) => (
                <label key={v} className={play === v ? 'style-card is-on' : 'style-card'}>
                  <input type="radio" name="play" checked={play === v} onChange={() => setPlay(v)} onClick={() => play === v && setPlay('')} />
                  <strong>{l}</strong><span>{d}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="gen-field">
            <legend>Que criaturas você quer ver na mesa?</legend>
            <div className="seg seg-wrap">
              {FOCUS.map(([v, l]) => <button type="button" key={v} className={focus.includes(v) ? 'is-on' : ''} aria-pressed={focus.includes(v)} onClick={() => setFocus((f) => (f.includes(v) ? f.filter((x) => x !== v) : [...f, v]))}>{l}</button>)}
            </div>
            <p className="gen-hint">Pode marcar mais de um. Sem marcar, vale qualquer tipo.</p>
          </fieldset>

          <fieldset className="gen-field">
            <legend>Sinergia</legend>
            <div className="seg seg-wrap">
              {SYN.map(([v, l, d]) => <button type="button" key={v} title={d} className={synergy === v ? 'is-on' : ''} aria-pressed={synergy === v} onClick={() => setSynergy(v)}>{l}</button>)}
            </div>
            <p className="gen-hint">{SYN.find((x) => x[0] === synergy)![2]}</p>
          </fieldset>

          <fieldset className="gen-field">
            <legend>Cenário da partida</legend>
            <div className="seg seg-wrap">
              {CTX.map(([v, l, d]) => <button type="button" key={v} title={d} className={context === v ? 'is-on' : ''} aria-pressed={context === v} onClick={() => setContext(v)}>{l}</button>)}
            </div>
            <p className="gen-hint">{CTX.find((x) => x[0] === context)![2]}</p>
          </fieldset>

          <fieldset className="gen-field gen-wide">
            <legend>A história da sua legião</legend>
            <textarea className="gen-story" rows={3} value={story} onChange={(e) => setStory(e.target.value)} placeholder="Conte em poucas palavras quem são e o que querem. Ex.: um bando de mortos-vivos servindo um dragão negro no pântano." />
            <div className="gen-story-ex">
              {STORY_EX.map((x) => <button type="button" key={x} onClick={() => setStory(x)}>{x}</button>)}
            </div>
            {story.trim() && <p className="gen-hint">Termos reconhecidos: {storyTerms(story).slice(0, 10).join(', ') || 'nenhum ainda; tente citar cores de dragão, raças, elementos ou nomes de cartas'}.</p>}
          </fieldset>

          <fieldset className="gen-field">
            <legend>Alinhamento</legend>
            <div className="seg">
              {ALIGNS.map(([v, l]) => (
                <button type="button" key={v} className={alignment === v ? 'is-on' : ''} aria-pressed={alignment === v} onClick={() => setAlignment(v)}>
                  {v !== 'qualquer' && <GameIcon type={v} color size={18} title={ALIGN_LABEL[v]} />} {l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="gen-field">
            <legend>Elemento</legend>
            <select value={element} onChange={(e) => setElement(e.target.value)}>
              <option value="">Qualquer</option>
              {ENUM_ELEMENTS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </fieldset>

          <div className="gen-checks">
            <label className="check"><input type="checkbox" checked={dragonsOnly} onChange={(e) => setDragonsOnly(e.target.checked)} /><span>Só dragões</span></label>
            <label className="check"><input type="checkbox" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} /><span>Só as minhas coleções ({owned})</span></label>
            <label className="check"><input type="checkbox" checked={initiative} onChange={(e) => setInitiative(e.target.checked)} /><span>Ficar 1 a 3 pontos abaixo para disputar a iniciativa</span></label>
          </div>

          <div className="gen-go">
            <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Montando legiões…' : results ? 'Gerar outras' : 'Gerar legiões'}</button>
            {results && <span className="gen-seed">Semente {seed}</span>}
          </div>
        </form>

        <section className="gen-results" aria-label="Legiões geradas" aria-busy={busy}>
          {!results && !busy && (
            <div className="gen-rules">
              <h2>As regras que o gerador segue</h2>
              <ul>
                <li>A soma dos custos de criaturas e melhorias fica igual ou abaixo do total combinado.</li>
                <li>Cada carta de nome único aparece uma só vez na legião, criatura ou melhoria.</li>
                <li>Nenhuma criatura equipa duas cópias da mesma melhoria.</li>
                <li>Cada ícone da faixa de melhorias recebe uma melhoria daquele tipo, com restrições, nível mínimo de feitiço e penalidades de custo aplicadas.</li>
                <li>Um artefato por legião, salvo cartas que liberam mais.</li>
                <li>Alinhamentos podem ser misturados. Quem gasta menos pontos decide a iniciativa.</li>
              </ul>
              <p className="muted">Livro de regras de D&D Attack Wing, Construção de Legiões, páginas 28 e 29. <a className="text-link" href="/manual/attack-wing-livro-de-regras.pdf" target="_blank" rel="noopener">Abrir o livro</a></p>
            </div>
          )}
          {busy && <p className="gen-busy">Testando dezenas de combinações…</p>}
          {results && !busy && results.length === 0 && (
            <div className="empty-block">Nenhuma legião cabe nesses filtros. Tente mais pontos, outro alinhamento ou desmarque Só dragões.</div>
          )}
          {results && !busy && results.map((g, i) => (
            <article key={i} className="gen-card">
              <header className="gen-card-head">
                <span className="seal"><span className="seal-label">Total</span><span className="seal-value">{g.total}</span></span>
                <div>
                  <h2>Opção {i + 1}</h2>
                  <p>{g.legion.creatures.length} criaturas · {g.slotsFilled} de {g.slotsTotal} slots</p>
                </div>
              </header>
              <ol className="gen-list">
                {g.legion.creatures.map((c) => (
                  <li key={c.key}>
                    <div className="gen-creature">
                      <span className="gen-cost num">{c.totalCost(g.legion)}</span>
                      <span className="gen-cname">{c.name}</span>
                      <GameIcon type={c.alignment} color size={18} title={ALIGN_LABEL[c.alignment]} />
                    </div>
                    {c.equippedUpgrades().length > 0 && (
                      <ul className="gen-ups">
                        {c.equippedUpgrades().map((u) => (
                          <li key={u.key}>
                            <GameIcon type={c.upgrades[c.equipped.indexOf(u)]} size={16} title={SLOT_LABEL[c.upgrades[c.equipped.indexOf(u)]]} />
                            <span>{u.name}</span>
                            <span className="num">{u.costForCreature(c, g.legion)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
              <ul className="gen-notes">
                {g.notes.map((n, k) => <li key={k}>{n}</li>)}
              </ul>
              <footer className="gen-card-foot">
                <button className="btn btn-primary" onClick={() => open(g, i)}>Abrir no construtor</button>
                <button className="btn btn-secondary" onClick={() => copy(g)}>Copiar link</button>
              </footer>
            </article>
          ))}
        </section>
      </div>
    </Shell>
  );
}
