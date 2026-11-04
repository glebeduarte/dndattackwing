// Diagramas das regras, desenhados em SVG nas cores do portal.
// Escala: 1 unidade = 1 cm na mesa, salvo indicação.

const MUTED = '#5d554c';
const PAPER = '#efe7da';
const SEAL = '#8c2b22';
const GOLD = '#b9a57b';
const BLUE = '#1f6fb5';
const COPPER = '#c8803e';
const GREEN = '#23774a';

/* Base vista de cima: quadrado com a cunha do arco frontal. */
function Base({ x, y, size = 6, rot = 0, color = SEAL, label }: { x: number; y: number; size?: number; rot?: number; color?: string; label?: string }) {
  const h = size / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-h} y={-h} width={size} height={size} rx={0.6} fill="#fff" stroke={color} strokeWidth={0.5} />
      <path d={`M ${-h} ${-h} L 0 0 L ${h} ${-h} Z`} fill={color} opacity={0.85} />
    </g>
  );
}

export function PhaseCycle() {
  const phases = [
    ['Planejamento', 'Todos escolhem a manobra de cada criatura, em segredo, no disco.'],
    ['Ativação', 'Uma criatura por vez, do menor nível para o maior: revela, move, ação.'],
    ['Combate', 'Uma criatura por vez, do maior nível para o menor: um ataque cada.'],
    ['Final', 'Efeitos de fim de rodada, criaturas derrotadas saem, fichas são limpas.'],
  ];
  return (
    <ol className="rg-cycle">
      {phases.map(([t, d], i) => (
        <li key={t}>
          <span className="rg-cycle-n">{i + 1}</span>
          <strong>{t}</strong>
          <span>{d}</span>
        </li>
      ))}
    </ol>
  );
}

export function LevelOrder() {
  const cs = [
    { n: 'Balagos', l: 8, c: SEAL },
    { n: 'Eshaedra', l: 9, c: BLUE },
    { n: 'Galadaeros', l: 10, c: COPPER },
  ];
  return (
    <div className="rg-order">
      <div>
        <p className="rg-order-title">Ativação: do menor nível para o maior</p>
        <ol>{cs.map((c) => <li key={c.n}><span style={{ background: c.c }}>{c.l}</span> {c.n}</li>)}</ol>
      </div>
      <div>
        <p className="rg-order-title">Combate: do maior nível para o menor</p>
        <ol>{[...cs].reverse().map((c) => <li key={c.n}><span style={{ background: c.c }}>{c.l}</span> {c.n}</li>)}</ol>
      </div>
    </div>
  );
}

/* Tipos de manobra, cada um com o caminho que a base percorre. */
export function ManeuverTypes() {
  const items: { t: string; d: string; path: string; end?: [number, number, number]; pivot?: boolean; back?: boolean }[] = [
    { t: 'Reta', d: 'Anda para a frente sem girar.', path: 'M20 46 L20 10', end: [20, 10, 0] },
    { t: 'Curva', d: 'Avança e desvia de leve; termina girada 45°.', path: 'M20 46 L20 30 Q20 14 32 10', end: [32, 10, 45] },
    { t: 'Curva acentuada', d: 'Vira forte para o lado; termina girada 90°.', path: 'M14 46 L14 26 Q14 16 24 16 L34 16', end: [34, 16, 90] },
    { t: 'Volta', d: 'Mesmo gabarito da reta, mas termina virada para trás (180°).', path: 'M20 46 L20 12', end: [20, 12, 180] },
    { t: 'Recuo', d: 'Anda para trás em linha reta, sem girar.', path: 'M20 18 L20 46', end: [20, 46, 0], back: true },
    { t: 'Pivô', d: 'Fica no lugar e pode girar 90° ou 180°.', path: '', end: [20, 28, 90], pivot: true },
  ];
  return (
    <div className="rg-maneuvers">
      {items.map((m) => (
        <figure key={m.t}>
          <svg viewBox="0 0 40 54" aria-hidden>
            {!m.pivot && !m.back && <Base x={m.t === 'Curva acentuada' ? 14 : 20} y={46} size={7} color={MUTED} />}
            {m.back && <Base x={20} y={18} size={7} color={MUTED} />}
            {m.path && <path d={m.path} fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" opacity={0.7} />}
            {m.pivot && <circle cx={20} cy={28} r={11} fill="none" stroke={GOLD} strokeWidth={1.2} strokeDasharray="2 2" />}
            {m.end && <Base x={m.end[0]} y={m.end[1]} size={7} rot={m.end[2]} />}
          </svg>
          <figcaption><strong>{m.t}</strong>{m.d}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function DifficultyKey() {
  return (
    <ul className="rg-diff">
      <li><span className="mv mv-g">↑</span><div><strong>Verde, fácil.</strong> Ao terminar, a criatura descarta 1 ficha de Exaustão, se tiver.</div></li>
      <li><span className="mv mv-w">↑</span><div><strong>Branca, normal.</strong> Nada muda.</div></li>
      <li><span className="mv mv-r">↑</span><div><strong>Vermelha, difícil.</strong> Ao terminar, a criatura recebe 1 ficha de Exaustão. Exausta, ela não faz manobras vermelhas nem ações.</div></li>
    </ul>
  );
}

/* Régua de alcance: 4 segmentos de 8 cm. */
export function RangeRuler() {
  return (
    <figure className="rg-fig">
      <div className="rg-ruler" role="img" aria-label="Régua de alcance com quatro segmentos; o alvo está no Alcance 2">
        <span className="rg-ruler-base" />
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`rg-ruler-seg rg-ruler-${n}`}>{n}</span>
        ))}
        <span className="rg-ruler-target" />
      </div>
      <ul className="rg-fig-key">
        <li><span className="sw" style={{ background: BLUE }} /> Base de quem age: a ponta do Alcance 1 encosta nela</li>
        <li><span className="sw" style={{ background: SEAL }} /> Base do alvo, encostando no trecho 2: está no Alcance 2</li>
      </ul>
      <figcaption>Cada trecho tem cerca de 8 cm. Vale o trecho de número mais baixo que encosta na base do alvo. Só as bases contam; a miniatura não.</figcaption>
    </figure>
  );
}

/* Arco frontal e traseiro, com três alvos. */
export function ArcDiagram() {
  return (
    <figure className="rg-fig">
      <svg viewBox="0 0 100 70" role="img" aria-label="Arcos de ataque frontal e traseiro">
        <rect x="0" y="0" width="100" height="70" fill={PAPER} />
        <path d="M50 38 L18 6 A 46 46 0 0 1 82 6 Z" fill={SEAL} opacity="0.16" />
        <path d="M50 38 L18 6 M50 38 L82 6" stroke={SEAL} strokeWidth="0.4" />
        <path d="M50 38 L32 66 L68 66 Z" fill={BLUE} opacity="0.13" />
        <Base x={50} y={38} size={9} />
        <Base x={50} y={14} size={7} color={GREEN} />
        <Base x={84} y={34} size={7} color={MUTED} />
        <Base x={50} y={60} size={7} color={GREEN} rot={180} />
      </svg>
      <ul className="rg-fig-key">
        <li><span className="sw" style={{ background: SEAL, opacity: 0.4 }} /> Arco frontal, a mesma cunha desenhada na base</li>
        <li><span className="sw" style={{ background: BLUE, opacity: 0.3 }} /> Arco traseiro</li>
        <li><span className="sw" style={{ background: GREEN }} /> Alvos dentro de um arco</li>
        <li><span className="sw" style={{ background: MUTED }} /> Alvo fora dos dois arcos: não pode ser atacado</li>
      </ul>
      <figcaption>O alvo está no arco se qualquer parte da base dele estiver dentro da cunha. O arco traseiro só existe para quem tem arma traseira, como a cauda dos dragões.</figcaption>
    </figure>
  );
}

/* Níveis de jogo: quem alcança quem no corpo a corpo. */
export function AltitudeTable() {
  return (
    <table className="rg-table">
      <thead>
        <tr><th>Quem ataca, corpo a corpo</th><th>Alvo no chão</th><th>Alvo no ar</th></tr>
      </thead>
      <tbody>
        <tr><td><img src="/icons/charge.png" alt="" width={18} height={18} /> No chão (ficha de Solo)</td><td>Sim</td><td>Não</td></tr>
        <tr><td><img src="/icons/target.png" alt="" width={18} height={18} /> No ar, voando</td><td>Não</td><td>Sim</td></tr>
        <tr><td><img src="/icons/dodge.png" alt="" width={18} height={18} /> Em rasante</td><td>Sim</td><td>Sim</td></tr>
      </tbody>
      <tfoot>
        <tr><td colSpan={3}>Ataques à distância ignoram o nível de jogo. Quem está em rasante também pode ser atacado corpo a corpo por qualquer nível.</td></tr>
      </tfoot>
    </table>
  );
}

/* Áreas: linha, cone e estouro. */
export function AreaAttacks() {
  return (
    <div className="rg-areas">
      <figure>
        <svg viewBox="0 0 60 60" aria-hidden>
          <rect width="60" height="60" fill={PAPER} />
          <rect x="27" y="6" width="6" height="40" fill={SEAL} opacity="0.25" />
          <Base x={30} y={50} size={8} />
          <Base x={30} y={30} size={6} color={GREEN} />
          <Base x={30} y={12} size={6} color={GREEN} />
          <Base x={46} y={22} size={6} color={MUTED} />
        </svg>
        <figcaption><strong>Linha</strong>A régua sai da base, dentro do arco frontal, e acerta cada criatura que tocar.</figcaption>
      </figure>
      <figure>
        <svg viewBox="0 0 60 60" aria-hidden>
          <rect width="60" height="60" fill={PAPER} />
          <path d="M30 48 L6 10 A 40 40 0 0 1 54 10 Z" fill={SEAL} opacity="0.2" />
          <Base x={30} y={50} size={8} />
          <Base x={18} y={22} size={6} color={GREEN} />
          <Base x={38} y={16} size={6} color={GREEN} />
          <Base x={54} y={44} size={6} color={MUTED} />
        </svg>
        <figcaption><strong>Cone</strong>Todo o arco frontal, até o alcance do ataque. Acerta amigos também.</figcaption>
      </figure>
      <figure>
        <svg viewBox="0 0 60 60" aria-hidden>
          <rect width="60" height="60" fill={PAPER} />
          <circle cx="32" cy="20" r="14" fill={SEAL} opacity="0.18" />
          <circle cx="32" cy="20" r="3" fill={SEAL} />
          <Base x={30} y={50} size={8} />
          <Base x={22} y={14} size={6} color={GREEN} />
          <Base x={42} y={26} size={6} color={GREEN} />
          <Base x={52} y={46} size={6} color={MUTED} />
        </svg>
        <figcaption><strong>Estouro</strong>A ficha de estouro vai para um ponto dentro do arco e do alcance; dali se mede a área.</figcaption>
      </figure>
    </div>
  );
}

/* Dados e resultados. */
export function DiceFaces() {
  return (
    <div className="rg-dice">
      <div className="rg-die-set">
        <p className="rg-die-title"><span className="rg-die rg-die-red" /> Dado de ataque (vermelho)</p>
        <ul>
          <li><img src="/icons/hit.png" alt="" width={22} height={22} /> <strong>Acerto</strong> 1 de dano normal</li>
          <li><img src="/icons/critical.png" alt="" width={22} height={22} /> <strong>Crítico</strong> 1 de dano crítico, ignora a Armadura</li>
          <li><img src="/icons/concentrate.png" alt="" width={22} height={22} /> <strong>Olho</strong> nada, a menos que uma ficha de Concentração o converta</li>
          <li><span className="rg-blank" /> <strong>Branco</strong> nada</li>
        </ul>
      </div>
      <div className="rg-die-set">
        <p className="rg-die-title"><span className="rg-die rg-die-green" /> Dado de defesa (verde)</p>
        <ul>
          <li><img src="/icons/dodge.png" alt="" width={22} height={22} /> <strong>Esquiva</strong> cancela 1 acerto ou crítico</li>
          <li><img src="/icons/concentrate.png" alt="" width={22} height={22} /> <strong>Olho</strong> nada, a menos que uma ficha de Concentração o converta</li>
          <li><span className="rg-blank" /> <strong>Branco</strong> nada</li>
        </ul>
      </div>
    </div>
  );
}

type Face = 'hit' | 'crit' | 'eye' | 'blank' | 'dodge';
const FACE_ICON: Record<Face, string | null> = { hit: 'hit', crit: 'critical', eye: 'concentrate', blank: null, dodge: 'dodge' };

export function DiceRow({ faces, kind, cancelled = [], note }: { faces: Face[]; kind: 'atk' | 'def'; cancelled?: number[]; note?: string }) {
  return (
    <div className="rg-roll">
      {faces.map((f, i) => (
        <span key={i} className={`rg-d rg-d-${kind}${cancelled.includes(i) ? ' is-cancel' : ''}`}>
          {FACE_ICON[f] ? <img src={`/icons/${FACE_ICON[f]}.png`} alt={f} width={20} height={20} /> : <span className="rg-blank" />}
        </span>
      ))}
      {note && <span className="rg-roll-note">{note}</span>}
    </div>
  );
}

/* Áreas iniciais para 2 e 3 jogadores. */
export function SetupDiagram({ players }: { players: 2 | 3 }) {
  return (
    <figure className="rg-fig rg-setup">
      <svg viewBox="0 0 90 90" role="img" aria-label={`Preparação para ${players} jogadores`}>
        <rect x="0" y="0" width="90" height="90" fill={PAPER} />
        {players === 2 ? (
          <>
            <rect x="0" y="0" width="90" height="16" fill={BLUE} opacity="0.55" />
            <rect x="0" y="74" width="90" height="16" fill={SEAL} opacity="0.55" />
          </>
        ) : (
          <>
            <rect x="37" y="74" width="16" height="16" fill={SEAL} opacity="0.7" />
            <rect x="0" y="0" width="16" height="16" fill={BLUE} opacity="0.7" />
            <rect x="74" y="0" width="16" height="16" fill={COPPER} opacity="0.8" />
          </>
        )}
      </svg>
      <ul className="rg-fig-key">
        <li><span className="sw" style={{ background: SEAL }} /> Jogador 1{players === 3 ? ', no meio da borda' : ''}</li>
        <li><span className="sw" style={{ background: BLUE }} /> Jogador 2{players === 3 ? ', num canto' : ''}</li>
        {players === 3 && <li><span className="sw" style={{ background: COPPER }} /> Jogador 3, no outro canto</li>}
      </ul>
      <figcaption>
        {players === 2
          ? 'Cada jogador senta num lado. Suas criaturas começam inteiras dentro dos dois primeiros trechos da régua, a partir da sua borda, viradas para onde ele quiser.'
          : 'Um jogador no meio de uma borda e os outros dois nos cantos do lado oposto, cada um com uma área de 16 x 16 cm (24 x 24 cm com 100 pontos ou mais).'}
      </figcaption>
    </figure>
  );
}
