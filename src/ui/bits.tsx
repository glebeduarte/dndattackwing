import { Fragment, useState, type ReactNode } from 'react';
import type { MoveGrid } from '../engine/types';

/* Ícones do jogo, servidos localmente a partir da captura do site original. */
const MISSING = new Set(['bank', 'disease', 'color-disease']);

export function GameIcon({ type, color = false, size = 20, title }: { type: string | null | undefined; color?: boolean; size?: number; title?: string }) {
  const [broken, setBroken] = useState(false);
  if (!type) return null;
  const file = `${color ? 'color-' : ''}${type.toLowerCase()}`;
  const label = title ?? type;
  if (broken || MISSING.has(file)) {
    return (
      <span className="gi-fallback" style={{ height: size, minWidth: size }} title={label} aria-label={label}>
        {type.slice(0, 3)}
      </span>
    );
  }
  return (
    <img
      className="gi"
      src={`/icons/${file}.png`}
      width={size}
      height={size}
      alt={label}
      title={label}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

/* Texto de carta: *negrito*, [Token] vira ícone, quebras de linha preservadas. Sem HTML injetado. */
export function CardText({ text, iconSize = 18 }: { text: string | null | undefined; iconSize?: number }) {
  if (!text) return null;
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="cardtext">
      {paragraphs.map((p, pi) => (
        <p key={pi}>
          {p.split('\n').map((line, li) => (
            <Fragment key={li}>
              {li > 0 && <br />}
              {renderInline(line, iconSize)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

function renderInline(line: string, iconSize: number): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*([^*]+)\*|\[(\w*)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={k++}>{renderInline(m[1], iconSize)}</strong>);
    else out.push(<GameIcon key={k++} type={m[2]} size={iconSize} />);
    last = re.lastIndex;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/* Atributos da criatura com os ícones coloridos do jogo. */
export function StatRow({ attack, agility, health, armor, size = 22 }: { attack: number; agility: number; health: number; armor: number; size?: number }) {
  const stats: [string, string, number][] = [
    ['pwv', 'Valor da arma primária', attack],
    ['agility', 'Agilidade', agility],
    ['health', 'Vida', health],
    ['armor', 'Armadura', armor],
  ];
  return (
    <div className="stats">
      {stats.map(([icon, label, v]) => (
        <span className={`stat stat-${icon}`} key={icon} title={label}>
          <GameIcon type={icon} color size={size} title={label} />
          <span className="num">{v}</span>
        </span>
      ))}
    </div>
  );
}

/* Cartão de manobras: velocidades nas linhas, direções nas colunas, cor pela dificuldade. */
const GLYPHS = ['↰', '↖', '↑', '↗', '↱', '⤺'];
const COL_NAMES = ['Curva à esquerda', 'Inclinação à esquerda', 'Reta', 'Inclinação à direita', 'Curva à direita', 'Manobra especial'];
const DIFF: Record<string, string> = { g: 'fácil', w: 'normal', r: 'difícil' };

export function ManeuverDial({ grid, label }: { grid: MoveGrid | undefined; label: string }) {
  if (!grid || !Array.isArray(grid['1'])) return null;
  const speeds = (grid['0'] ? [5, 4, 3, 2, 1, 0, -1] : [6, 5, 4, 3, 2, 1, -1]).filter((s) => Array.isArray(grid[String(s)]));
  const usesSpecial = speeds.some((s) => (grid[String(s)] as any[])[5]);
  const cols = usesSpecial ? 6 : 5;
  return (
    <figure className="dial" aria-label={`Cartão de manobras: ${label}`}>
      <figcaption>
        {label}
        {grid.reds !== undefined && <span className="dial-meta">{grid.reds} vermelhas</span>}
      </figcaption>
      <table>
        <tbody>
          {speeds.map((s) => {
            const row = grid[String(s)] as (string | null)[];
            return (
              <tr key={s}>
                <th scope="row" className="num">{Math.abs(s)}</th>
                {Array.from({ length: cols }, (_, col) => {
                  const color = row[col];
                  const glyph = s === 0 && col === 2 ? '●' : s === -1 && col === 2 ? '↓' : GLYPHS[col];
                  return (
                    <td key={col} className={color ? `mv mv-${color}` : 'mv mv-none'} title={color ? `${COL_NAMES[col]} ${Math.abs(s)}, ${DIFF[color]}` : undefined}>
                      {color ? glyph : ''}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}

export function CostBadge({ value, unique, title }: { value: number | string; unique?: boolean; title?: string }) {
  return (
    <span className={`cost-badge${unique ? ' is-unique' : ''}`} title={title ?? (unique ? 'Custo (carta única)' : 'Custo')}>
      <span className="num">{value}</span>
    </span>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'positive' | 'negative' | 'warning' | 'accent' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export const SLOT_LABEL: Record<string, string> = {
  Arcane: 'Arcano',
  Divine: 'Divino',
  Dragon: 'Dragão',
  Equipment: 'Equipamento',
  Heroic: 'Heroico',
  Monster: 'Monstro',
  Universal: 'Universal',
};
export const ALIGN_LABEL: Record<string, string> = { Good: 'Bom', Evil: 'Mau', Neutral: 'Neutro' };
export const BASE_LABEL: Record<string, string> = { Small: 'Pequena', Large: 'Grande', Huge: 'Enorme' };
export const ARC_LABEL: Record<string, string> = { Forward: 'frontal', Rear: 'traseiro' };
