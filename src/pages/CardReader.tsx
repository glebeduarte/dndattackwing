import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteImage, exportPack, imageKey, importPack, putImage, useCardImage, useImageKeys, type CardKind } from '../cardImages';
import { catalog, useStore } from '../store';
import { SLOT_LABEL } from '../ui/bits';
import { Shell } from '../ui/Shell';

const OUT_W = 600;
const OUT_H = 840; // proporção 5:7 das cartas
const FRAME_W = 300;
const FRAME_H = 420;

interface Pick {
  kind: CardKind;
  uid: number;
  name: string;
  sub: string;
}

const ALL: Pick[] = [
  ...catalog.creatures.map((c) => ({ kind: 'creature' as const, uid: c.uid, name: c.name, sub: `${c.classtype} · ${c.set}` })),
  ...catalog.upgrades.map((u) => ({ kind: 'upgrade' as const, uid: u.uid, name: u.name, sub: `${SLOT_LABEL[u.upgrade] ?? u.upgrade} · ${u.set}` })),
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* Gira uma imagem em passos de 90° e devolve um canvas novo. */
function rotated(src: CanvasImageSource & { width: number; height: number }, turns: number) {
  const t = ((turns % 4) + 4) % 4;
  const c = document.createElement('canvas');
  c.width = t % 2 ? src.height : src.width;
  c.height = t % 2 ? src.width : src.height;
  const g = c.getContext('2d')!;
  g.translate(c.width / 2, c.height / 2);
  g.rotate((t * Math.PI) / 2);
  g.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
}

export function CardReaderPage() {
  const [params, setParams] = useSearchParams();
  const { notify } = useStore();
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<Pick | null>(() => {
    const kind = params.get('tipo') as CardKind | null;
    const uid = Number(params.get('uid'));
    return ALL.find((p) => p.kind === kind && p.uid === uid) ?? null;
  });
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const keys = useImageKeys();
  const saved = useMemo(() => new Set(keys), [keys]);

  useEffect(() => {
    document.title = 'Leitor de cartas · Attack Wing';
  }, []);

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return [];
    return ALL.filter((p) => norm(p.name).includes(n)).slice(0, 12);
  }, [q]);

  // Escala que faz a imagem cobrir o quadro; o zoom multiplica a partir dela.
  const baseScale = source ? Math.max(FRAME_W / source.width, FRAME_H / source.height) : 1;
  const scale = baseScale * zoom;

  const loadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return notify('error', 'Escolha uma imagem.');
    const bmp = await createImageBitmap(file);
    // Fotos em pé de cartas costumam vir certas; se vier deitada, vira para ficar em pé.
    const c = rotated(bmp, bmp.width > bmp.height ? 1 : 0);
    setSource(c);
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const choose = (p: Pick) => {
    setPick(p);
    setQ('');
    setParams({ tipo: p.kind, uid: String(p.uid) }, { replace: true });
  };

  const save = async () => {
    if (!pick || !source) return;
    setSaving(true);
    const out = document.createElement('canvas');
    out.width = OUT_W;
    out.height = OUT_H;
    const g = out.getContext('2d')!;
    const k = OUT_W / FRAME_W;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, OUT_W, OUT_H);
    g.translate(OUT_W / 2 + pos.x * k, OUT_H / 2 + pos.y * k);
    g.scale(scale * k, scale * k);
    g.drawImage(source, -source.width / 2, -source.height / 2);
    const blob: Blob | null = await new Promise((r) => out.toBlob(r, 'image/webp', 0.86));
    if (blob) {
      await putImage(imageKey(pick.kind, pick.uid), blob);
      notify('ok', `Foto de ${pick.name} salva. Ela aparece no construtor.`);
      setSource(null);
    }
    setSaving(false);
  };

  return (
    <Shell>
      <div className="rd">
        <header className="rd-head">
          <h1>Leitor de cartas</h1>
          <p>Fotografe ou envie a imagem de uma carta original. O leitor recorta no formato da carta e guarda a foto neste navegador; a partir daí, o construtor mostra a carta original no lugar da ficha desenhada pelo sistema. Cartas sem foto continuam aparecendo como hoje.</p>
        </header>

        <div className="rd-work">
          <section className="rd-step" aria-labelledby="rd-1">
            <h2 id="rd-1"><span>1</span> Qual carta</h2>
            {pick ? (
              <div className="rd-picked">
                <div>
                  <strong>{pick.name}</strong>
                  <span>{pick.kind === 'creature' ? 'Criatura' : 'Melhoria'} · {pick.sub}</span>
                  {saved.has(imageKey(pick.kind, pick.uid)) && <span className="rd-has">Já tem foto; salvar de novo substitui.</span>}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setPick(null)}>Trocar</button>
              </div>
            ) : (
              <>
                <input className="rd-search" type="search" placeholder="Nome da carta, ex.: Balagos, Fire Breath" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
                {results.length > 0 && (
                  <ul className="rd-results">
                    {results.map((p) => (
                      <li key={`${p.kind}${p.uid}`}>
                        <button onClick={() => choose(p)}>
                          <span className="rd-r-name">{p.name}{saved.has(imageKey(p.kind, p.uid)) && <span className="rd-dot" title="Já tem foto" />}</span>
                          <span className="rd-r-sub">{p.kind === 'creature' ? 'Criatura' : 'Melhoria'} · {p.sub}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          <section className="rd-step" aria-labelledby="rd-2">
            <h2 id="rd-2"><span>2</span> A foto</h2>
            <div
              className={`rd-drop${source ? ' has-image' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) loadFile(f);
              }}
            >
              {source ? (
                <>
                  <div
                    className="rd-frame"
                    style={{ width: FRAME_W, height: FRAME_H }}
                    onPointerDown={(e) => {
                      (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
                    }}
                    onPointerMove={(e) => {
                      if (!drag.current) return;
                      setPos({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y });
                    }}
                    onPointerUp={() => (drag.current = null)}
                    onWheel={(e) => setZoom((z) => Math.min(4, Math.max(0.5, z - e.deltaY * 0.0015)))}
                  >
                    <canvas
                      ref={(el) => {
                        if (!el || !source) return;
                        el.width = source.width;
                        el.height = source.height;
                        el.getContext('2d')!.drawImage(source, 0, 0);
                      }}
                      style={{
                        width: source.width,
                        height: source.height,
                        transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                      }}
                    />
                    <span className="rd-guide" aria-hidden />
                  </div>
                  <div className="rd-tools">
                    <label className="rd-zoom">
                      <span>Zoom</span>
                      <input type="range" min={0.5} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
                    </label>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSource(rotated(source, -1))}>Girar ↺</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSource(rotated(source, 1))}>Girar ↻</button>
                    <button className="btn btn-text btn-sm" onClick={() => { setZoom(1); setPos({ x: 0, y: 0 }); }}>Centralizar</button>
                    <button className="btn btn-text btn-sm" onClick={() => setSource(null)}>Outra foto</button>
                  </div>
                  <p className="rd-hint">Arraste a foto para encaixar a carta no quadro e use o zoom até as bordas da carta encostarem na moldura.</p>
                </>
              ) : (
                <div className="rd-empty">
                  <p>Arraste uma imagem para cá, ou</p>
                  <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>Fotografar ou escolher imagem</button>
                  <p className="rd-hint">No celular, o botão abre a câmera. Fotografe a carta de frente, sobre um fundo liso, sem reflexo.</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadFile(f);
                  e.target.value = '';
                }}
              />
            </div>
          </section>

          <section className="rd-step" aria-labelledby="rd-3">
            <h2 id="rd-3"><span>3</span> Salvar</h2>
            <button className="btn btn-primary btn-lg" disabled={!pick || !source || saving} onClick={save}>
              {saving ? 'Salvando…' : pick ? `Salvar foto de ${pick.name}` : 'Escolha a carta e a foto'}
            </button>
            {pick && <PickedPreview pick={pick} />}
          </section>
        </div>

        <Gallery />
      </div>
    </Shell>
  );
}

function PickedPreview({ pick }: { pick: Pick }) {
  const url = useCardImage(pick.kind, pick.uid);
  if (!url) return null;
  return (
    <figure className="rd-current">
      <img src={url} alt={`Foto atual de ${pick.name}`} />
      <figcaption>Foto salva agora</figcaption>
    </figure>
  );
}

function Thumb({ k }: { k: string }) {
  const [kind, uidS] = k.split(':') as [CardKind, string];
  const uid = Number(uidS);
  const url = useCardImage(kind, uid);
  const name = kind === 'creature' ? catalog.creatureByUid.get(uid)?.name : catalog.upgradeByUid.get(uid)?.name;
  return (
    <li>
      <Link to={`/card/${kind}/${uid}`}>{url ? <img src={url} alt={name ?? k} loading="lazy" /> : <span className="rd-thumb-empty" />}</Link>
      <span className="rd-thumb-name">{name ?? k}</span>
      <button className="text-btn" onClick={() => window.confirm(`Apagar a foto de ${name}?`) && deleteImage(k)}>Apagar</button>
    </li>
  );
}

function Gallery() {
  const keys = useImageKeys();
  const { notify } = useStore();
  const importRef = useRef<HTMLInputElement>(null);
  const creatures = keys.filter((k) => k.startsWith('creature:')).length;

  const doExport = async () => {
    const blob = await exportPack();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attack-wing-cartas-${new Date().toLocaleDateString('sv-SE')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="rd-gallery" aria-labelledby="rd-gal">
      <div className="rd-gal-head">
        <div>
          <h2 id="rd-gal">Cartas lidas</h2>
          <p>
            {keys.length} de {catalog.creatures.length + catalog.upgrades.length} cartas com foto: {creatures} criaturas e {keys.length - creatures} melhorias. As fotos ficam só neste navegador.
          </p>
        </div>
        <div className="rd-gal-actions">
          <button className="btn btn-secondary" onClick={doExport} disabled={!keys.length}>Exportar pacote</button>
          <button className="btn btn-secondary" onClick={() => importRef.current?.click()}>Importar pacote</button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              try {
                const n = await importPack(f);
                notify('ok', `${n} fotos de cartas importadas.`);
              } catch (err) {
                notify('error', (err as Error).message);
              }
            }}
          />
        </div>
      </div>
      {keys.length === 0 ? (
        <p className="empty-block">Nenhuma carta lida ainda. Comece pelas criaturas que você usa mais: elas aparecem em destaque no construtor.</p>
      ) : (
        <ul className="rd-thumbs">{keys.sort().map((k) => <Thumb key={k} k={k} />)}</ul>
      )}
      <p className="rd-note">Para levar as fotos a outro aparelho ou dividir com o grupo, exporte o pacote e importe no outro navegador. As imagens das cartas são da WizKids e da Wizards of the Coast; use as fotos para consulta pessoal.</p>
    </section>
  );
}
