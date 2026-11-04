import { useMemo, useRef, useState, type PointerEvent as RPE } from 'react';
import { availableManeuvers, COLOR_NAME, maneuverLabel, type Maneuver, type Unit } from '../engine/opponent';
import {
  ARC_HALF, BOARD, RANGE_BAND, TEMPLATE_W, applyManeuver, band, baseDistance, fwd, inArc, sizeOf, type Pose, type Pt,
} from '../engine/table';

/* Mesa de 90 x 90 cm desenhada em escala: bases, arcos, régua de alcance e gabaritos de manobra. */

const SIDE_COLOR = { ai: '#8c2b22', me: '#2f6b3a' } as const;
const ptsAttr = (pts: Pt[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
const GLYPH = ['↰', '↖', '↑', '↗', '↱', '⤺'];

function Base({ u, p, selected, ghost }: { u: Unit; p: Pose; selected?: boolean; ghost?: boolean }) {
  const s = sizeOf(u);
  const c = SIDE_COLOR[u.side];
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.a})`} opacity={ghost ? 0.45 : u.alive ? 1 : 0.25} pointerEvents={ghost ? 'none' : undefined}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={3} fill={ghost ? 'none' : '#fbf8f3'} stroke={c} strokeWidth={selected ? 3.5 : 2} strokeDasharray={ghost ? '6 4' : undefined} />
      <path d={`M0 0 L${-s / 2} ${-s / 2} L${s / 2} ${-s / 2} Z`} fill={c} opacity={ghost ? 0.25 : 0.85} />
      {!ghost && (
        <g transform={`rotate(${-p.a})`}>
          <text y={s / 2 - 6 > 8 ? 10 : 6} textAnchor="middle" fontSize={Math.max(9, Math.min(13, s / 5))} fontWeight={600} fill="#1d1815" style={{ pointerEvents: 'none' }}>
            {u.name.length > 14 ? `${u.name.slice(0, 13)}…` : u.name}
          </text>
          {u.flyer && <text y={-s / 2 - 4} textAnchor="middle" fontSize={11} fill="#5d554c" style={{ pointerEvents: 'none' }}>{u.air ? 'no ar' : 'no solo'}</text>}
        </g>
      )}
    </g>
  );
}

function Rings({ p, s }: { p: Pose; s: number }) {
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.a})`} pointerEvents="none">
      {[1, 2, 3, 4].map((n) => {
        const r = n * RANGE_BAND;
        return (
          <g key={n}>
            <rect x={-s / 2 - r} y={-s / 2 - r} width={s + 2 * r} height={s + 2 * r} rx={r} fill="none" stroke="#b9a57b" strokeWidth={1.4} strokeDasharray={n === 4 ? '2 6' : '8 6'} />
            <text x={0} y={-s / 2 - r + 13} textAnchor="middle" fontSize={12} fill="#8a7a55">{n}</text>
          </g>
        );
      })}
    </g>
  );
}

function Arcs({ p, s, rear }: { p: Pose; s: number; rear: boolean }) {
  const R = s / 2 + RANGE_BAND * 4;
  const wedge = (center: number) => {
    const a1 = ((center - ARC_HALF) * Math.PI) / 180, a2 = ((center + ARC_HALF) * Math.PI) / 180;
    return `M0 0 L${R * Math.sin(a1)} ${-R * Math.cos(a1)} A${R} ${R} 0 0 1 ${R * Math.sin(a2)} ${-R * Math.cos(a2)} Z`;
  };
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.a})`} pointerEvents="none">
      <path d={wedge(0)} fill="#8c2b22" opacity={0.08} stroke="#8c2b22" strokeOpacity={0.35} />
      {rear && <path d={wedge(180)} fill="#3a56b0" opacity={0.07} stroke="#3a56b0" strokeOpacity={0.3} />}
    </g>
  );
}

export function TableBoard({ units, poses, setPoses, onAltitude }: {
  units: Unit[];
  poses: Record<string, Pose>;
  setPoses(next: Record<string, Pose>): void;
  onAltitude?(id: string, air: boolean): void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [preview, setPreview] = useState<Maneuver | null>(null);
  const [measure, setMeasure] = useState<string | null>(null);
  const [showRings, setShowRings] = useState(true);
  const drag = useRef<{ id: string; mode: 'move' | 'rotate'; dx: number; dy: number } | null>(null);
  const [live, setLive] = useState<Record<string, Pose> | null>(null);
  const view = live ?? poses;
  const placed = units.filter((u) => u.alive && view[u.id]);
  const su = units.find((u) => u.id === sel);
  const sp = su ? view[su.id] : undefined;

  const toBoard = (e: RPE<SVGElement>): Pt => {
    const el = svg.current!;
    const pt = el.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const r = pt.matrixTransform(el.getScreenCTM()!.inverse());
    return { x: r.x, y: r.y };
  };
  const down = (e: RPE<SVGElement>, id: string, mode: 'move' | 'rotate') => {
    e.stopPropagation();
    if (measure && mode === 'move' && id !== measure) { setSel(id); return; }
    const p = view[id], b = toBoard(e);
    drag.current = { id, mode, dx: b.x - p.x, dy: b.y - p.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setSel(id);
    setPreview(null);
  };
  const move = (e: RPE<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const b = toBoard(e);
    const p = (live ?? poses)[d.id];
    const next = { ...(live ?? poses) };
    if (d.mode === 'move') next[d.id] = { ...p, x: Math.max(0, Math.min(BOARD, b.x - d.dx)), y: Math.max(0, Math.min(BOARD, b.y - d.dy)) };
    else next[d.id] = { ...p, a: Math.round((Math.atan2(b.x - p.x, -(b.y - p.y)) * 180) / Math.PI / 5) * 5 };
    setLive(next);
  };
  const up = () => {
    if (drag.current && live) setPoses(live);
    drag.current = null;
    setLive(null);
  };
  const rotate = (deg: number) => { if (su && sp) setPoses({ ...poses, [su.id]: { ...sp, a: ((sp.a + deg + 540) % 360) - 180 } }); };
  const ghost = su && sp && preview ? applyManeuver(sp, preview, sizeOf(su)) : null;
  const execute = () => { if (su && ghost) { setPoses({ ...poses, [su.id]: ghost.pose }); setPreview(null); } };

  const meas = useMemo(() => {
    if (!measure || !sel || measure === sel) return null;
    const a = units.find((u) => u.id === measure), b = units.find((u) => u.id === sel);
    if (!a || !b || !view[a.id] || !view[b.id]) return null;
    const d = baseDistance(view[a.id], sizeOf(a), view[b.id], sizeOf(b));
    return { a, b, d, r: band(d), front: inArc(view[a.id], view[b.id], sizeOf(b), 'F'), rear: inArc(view[a.id], view[b.id], sizeOf(b), 'B') };
  }, [measure, sel, view, units]);

  const maneuvers = su ? availableManeuvers(su) : [];
  const speeds = [...new Set(maneuvers.map((m) => m.speed))].sort((a, b) => b - a);

  return (
    <div className="tb">
      <div className="tb-board">
        <svg ref={svg} viewBox="-12 -12 924 924" onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerDown={() => { setSel(null); setPreview(null); }} role="img" aria-label="Mesa de 90 por 90 centímetros">
          <rect x={0} y={0} width={BOARD} height={BOARD} fill="#e9e2d4" stroke="#5d554c" strokeWidth={2} />
          {Array.from({ length: 11 }, (_, i) => (i + 1) * RANGE_BAND).map((v) => (
            <g key={v} stroke="#d8cfbf" strokeWidth={1}><line x1={v} y1={0} x2={v} y2={BOARD} /><line x1={0} y1={v} x2={BOARD} y2={v} /></g>
          ))}
          <rect x={0} y={0} width={BOARD} height={RANGE_BAND * 2} fill={SIDE_COLOR.ai} opacity={0.06} />
          <rect x={0} y={BOARD - RANGE_BAND * 2} width={BOARD} height={RANGE_BAND * 2} fill={SIDE_COLOR.me} opacity={0.06} />
          {su && sp && <Arcs p={sp} s={sizeOf(su)} rear={su.attacks.some((a) => a.arc === 'Rear')} />}
          {su && sp && showRings && <Rings p={sp} s={sizeOf(su)} />}
          {ghost && ghost.path.length > 1 && (
            <polyline points={ptsAttr(ghost.path)} fill="none" stroke={preview?.color === 'r' ? '#c0392b' : preview?.color === 'g' ? '#3f8a4a' : '#5d554c'} strokeOpacity={0.45} strokeWidth={TEMPLATE_W} strokeLinecap="butt" strokeLinejoin="round" pointerEvents="none" />
          )}
          {placed.map((u) => (
            <g key={u.id} onPointerDown={(e) => down(e, u.id, 'move')} style={{ cursor: 'grab', touchAction: 'none' }}>
              <Base u={u} p={view[u.id]} selected={u.id === sel} />
            </g>
          ))}
          {ghost && su && <Base u={su} p={ghost.pose} ghost />}
          {su && sp && (() => { const h = { x: sp.x + fwd(sp.a).x * (sizeOf(su) / 2 + 22), y: sp.y + fwd(sp.a).y * (sizeOf(su) / 2 + 22) }; return (
            <circle cx={h.x} cy={h.y} r={10} fill="#fff" stroke="#1d1815" strokeWidth={2} style={{ cursor: 'grab', touchAction: 'none' }} onPointerDown={(e) => down(e, su.id, 'rotate')}><title>Arraste para girar</title></circle>
          ); })()}
          {meas && (() => {
            const pa = view[meas.a.id], pb = view[meas.b.id];
            return (
              <g pointerEvents="none">
                <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#1d1815" strokeWidth={2} strokeDasharray="10 6" />
                <rect x={(pa.x + pb.x) / 2 - 62} y={(pa.y + pb.y) / 2 - 16} width={124} height={30} rx={8} fill="#1d1815" />
                <text x={(pa.x + pb.x) / 2} y={(pa.y + pb.y) / 2 + 5} textAnchor="middle" fontSize={15} fill="#fff" fontWeight={600}>{meas.r ? `Alcance ${meas.r}` : 'Fora de alcance'}</text>
              </g>
            );
          })()}
          <text x={BOARD / 2} y={-2} textAnchor="middle" fontSize={11} fill="#5d554c">N · área inicial da IA</text>
          <text x={BOARD / 2} y={BOARD + 11} textAnchor="middle" fontSize={11} fill="#5d554c">S · sua área inicial</text>
        </svg>
      </div>

      <div className="tb-side">
        {!su && <p className="muted">Toque numa base para selecionar. Arraste para mover; arraste o círculo branco à frente dela para girar. A régua mostra os quatro alcances a partir da borda da base.</p>}
        {su && sp && (
          <>
            <h3 className={`tb-name side-${su.side}`}>{su.name}</h3>
            <p className="muted">Base {su.base === 'Large' ? 'grande' : su.base === 'Huge' ? 'enorme' : 'pequena'} · {Math.round(sizeOf(su))} mm · nível {su.level}</p>
            <div className="tb-row">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => rotate(-45)}>↺ 45°</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => rotate(-15)}>↺ 15°</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => rotate(15)}>15° ↻</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => rotate(45)}>45° ↻</button>
            </div>
            <div className="tb-row">
              <button type="button" className={`btn btn-sm ${measure === su.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMeasure(measure === su.id ? null : su.id)}>{measure === su.id ? 'Toque no alvo…' : 'Medir a partir dela'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowRings((v) => !v)}>{showRings ? 'Esconder régua' : 'Mostrar régua'}</button>
              {su.flyer && onAltitude && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onAltitude(su.id, !su.air)}>{su.air ? 'Pousar' : 'Decolar'}</button>}
            </div>
            {maneuvers.length > 0 && (
              <>
                <h4>Manobras ({su.flyer && su.air ? 'voo' : 'solo'})</h4>
                <table className="tb-dial">
                  <tbody>
                    {speeds.map((sp2) => (
                      <tr key={sp2}>
                        <th className="num">{Math.abs(sp2)}</th>
                        {[0, 1, 2, 3, 4, 5].map((col) => {
                          const mv = maneuvers.find((m) => m.speed === sp2 && m.col === col);
                          return (
                            <td key={col}>
                              {mv && (
                                <button type="button" className={`tb-mv mv-${mv.color}${preview === mv || (preview && preview.speed === mv.speed && preview.col === mv.col) ? ' is-on' : ''}`} title={`${maneuverLabel(mv)}, ${COLOR_NAME[mv.color]}`} onClick={() => setPreview(mv)}>
                                  {sp2 === 0 ? '●' : sp2 === -1 ? '↓' : GLYPH[col]}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview && (
                  <div className="tb-row">
                    <span className="tb-prev">{maneuverLabel(preview)}</span>
                    <button type="button" className="btn btn-primary btn-sm" onClick={execute}>Executar</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>Cancelar</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {meas && (
          <div className="tb-meas">
            <p><strong>{meas.a.name}</strong> até <strong>{meas.b.name}</strong></p>
            <p className="tb-big">{meas.r ? `Alcance ${meas.r}` : 'Fora de alcance'} <span className="muted">· {(meas.d / 10).toFixed(1)} cm</span></p>
            <p>{meas.front ? 'Dentro do arco frontal.' : meas.rear ? 'No arco traseiro.' : 'Fora dos arcos.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

