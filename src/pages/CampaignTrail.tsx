import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCardImage } from '../cardImages';
import { CHAPTER_CREATURE, CHAPTER_HOOKS, STAGES, campaignChapters, type Campaign } from '../data/adventures';
import { catalog } from '../store';

interface Node {
  code: string;
  title: string;
  original: string;
  slug?: string;
  creatureUid?: number;
  hook?: string;
}

/* Imagem do capítulo: primeiro a arte enviada para o portal (public/aventuras/<código>.webp),
   depois a foto da carta guardada no Leitor, por fim um selo com o nome da criatura. */
function ChapterArt({ code, uid }: { code: string; uid?: number }) {
  const [staticOk, setStaticOk] = useState(true);
  const photo = useCardImage('creature', uid ?? -1);
  const name = uid ? catalog.creatures.find((c) => c.uid === uid)?.name : undefined;
  if (staticOk) {
    return <img className="trail-art" src={`/aventuras/${code}.webp`} alt="" loading="lazy" onError={() => setStaticOk(false)} />;
  }
  if (photo) return <img className="trail-art" src={photo} alt="" />;
  return (
    <div className="trail-art trail-art-empty" aria-hidden>
      <img src="/brand-dragon-light.png" width={34} height={34} alt="" />
      {name && <span>{name}</span>}
    </div>
  );
}

export function CampaignTrail({ campaign }: { campaign: Campaign }) {
  const stages = STAGES[campaign.slug];
  if (!stages) return null;
  const written = campaignChapters(campaign.slug);
  const node = (code: string): Node | null => {
    const a = written.find((x) => String(x.chapter) === code);
    if (a) {
      return {
        code, title: a.title, original: a.original, slug: a.slug,
        creatureUid: a.sides.find((s) => s.creatureUid)?.creatureUid,
        hook: CHAPTER_HOOKS[code],
      };
    }
    const p = campaign.planned?.find((x) => x.code === code);
    if (!p) return null;
    return { code, title: p.title, original: p.expansion, creatureUid: CHAPTER_CREATURE[code] , hook: CHAPTER_HOOKS[code] ?? p.premise };
  };

  return (
    <ol className="trail" aria-label={`Trilha da campanha ${campaign.title}`}>
      {stages.map((st, i) => {
        const nodes = st.codes.map(node).filter(Boolean) as Node[];
        const done = nodes.filter((n) => n.slug).length;
        return (
          <li key={st.id} className="trail-stage">
            <div className="trail-marker" aria-hidden><span>{i + 1}</span></div>
            <div className="trail-body">
              <header className="trail-head">
                <p className="trail-wave">Etapa {i + 1} · {st.wave} · {done} de {nodes.length} com guia</p>
                <h3>{st.title}</h3>
                <p>{st.summary}</p>
              </header>
              <div className="trail-row">
                {nodes.map((n, j) => {
                  const inner = (
                    <>
                      <ChapterArt code={n.code} uid={n.creatureUid} />
                      <div className="trail-card-copy">
                        <span className="trail-code">{n.code.includes('.') ? n.code : `Cap. ${n.code}`}</span>
                        <strong>{n.title}</strong>
                        <span className="trail-orig">{n.original}</span>
                        {n.hook && <span className="trail-hook">{n.hook}</span>}
                        {!n.slug && <span className="trail-wait">Aguardando o texto</span>}
                      </div>
                    </>
                  );
                  return (
                    <div key={n.code} className="trail-cell">
                      {n.slug ? <Link to={`/aventuras/${n.slug}`} className="trail-card">{inner}</Link> : <div className="trail-card is-pending">{inner}</div>}
                      {j < nodes.length - 1 && <span className="trail-arrow" aria-hidden>→</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
