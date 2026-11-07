import { useEffect, useRef } from 'react';
import { analyzeLegion } from '../engine/analyzer';
import { useStore } from '../store';

export function AnalyzerDialog({ onClose }: { onClose(): void }) {
  const { legion, settings, name } = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  const a = analyzeLegion(legion, settings.target);
  return (
    <dialog ref={ref} className="dialog an-dialog" onClose={onClose} aria-labelledby="an-title">
      <form method="dialog" className="dialog-body">
        <header className="dialog-head">
          <h2 id="an-title">Análise da legião</h2>
          <button className="icon-btn" aria-label="Fechar" value="close">×</button>
        </header>
        {!a ? <p className="muted">Adicione criaturas para analisar a legião.</p> : (
          <>
            <div className="an-top">
              <div className={`an-score${a.score >= 68 ? ' is-good' : a.score >= 55 ? ' is-mid' : ' is-low'}`}><b className="num">{a.score}</b><small>de 100</small></div>
              <div>
                <p className="an-verdict">{a.verdict}</p>
                <p className="muted">{name} · estilo <b>{a.archetype}</b></p>
              </div>
            </div>
            <ul className="an-metrics">
              {a.metrics.map((m) => (
                <li key={m.id}>
                  <div className="an-m-head"><span>{m.label}</span><span className="num">{m.score}</span></div>
                  <div className="an-bar"><i style={{ width: `${m.score}%` }} /></div>
                  <p>{m.text}</p>
                </li>
              ))}
            </ul>
            <div className="an-cols">
              {a.strengths.length > 0 && <section><h3>Pontos fortes</h3><ul>{a.strengths.map((x) => <li key={x}>{x}</li>)}</ul></section>}
              {a.risks.length > 0 && <section className="an-risk"><h3>Riscos</h3><ul>{a.risks.map((x) => <li key={x}>{x}</li>)}</ul></section>}
            </div>
            <section className="an-strat"><h3>Como jogar com ela</h3><ol>{a.strategy.map((x) => <li key={x}>{x}</li>)}</ol></section>
            {a.tips.length > 0 && <section><h3>Ajustes sugeridos</h3><ul>{a.tips.map((x) => <li key={x}>{x}</li>)}</ul></section>}
            <p className="muted an-note">A análise usa os números das cartas e os princípios do jogo (pontos, ativações, iniciativa, dados esperados, ações exigidas pelas melhorias). Não conhece a legião do adversário nem o cenário.</p>
          </>
        )}
      </form>
    </dialog>
  );
}
