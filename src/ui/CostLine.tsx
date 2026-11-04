import { useStore } from '../store';

const TARGETS = [100, 150, 200, 250, 300];

/* Linha de custo compacta: total, a barra (cada criatura um trecho: base cheia, upgrades no tom claro), contagens e limite. */
export function CostLine() {
  const { legion, settings, setSettings } = useStore();
  const total = legion.totalCost();
  const target = settings.target;
  const scale = Math.max(target ?? 0, total, 1);
  const left = target !== null ? target - total : null;
  const artifacts = legion.legionArtifacts().length;
  const evil = legion.tokens.Evil ?? 0;

  return (
    <section className="costline" aria-label="Custo da legião">
      <div className="cl-total">
        <span className="cl-value num">{total}</span>
        <span className="cl-of">{target !== null ? `de ${target} pts` : 'pts'}</span>
      </div>

      <div className="cl-bar">
        <div className="cl-track" role="img" aria-label={`${total} de ${target ?? total} pontos usados`}>
          {legion.creatures.map((c, i) => {
            const up = c.upgradesCost(legion);
            return (
              <div className="cl-seg" key={c.key} style={{ width: `${((c.cost + up) / scale) * 100}%` }} title={`${i + 1}. ${c.name}: ${c.cost} + ${up} = ${c.cost + up} pts`}>
                <span className="cl-base" style={{ flexGrow: c.cost }} />
                {up > 0 && <span className="cl-up" style={{ flexGrow: up }} />}
                <span className="cl-n num">{i + 1}</span>
              </div>
            );
          })}
          {target !== null && total > target && <span className="cl-limit" style={{ left: `${(target / scale) * 100}%` }} />}
        </div>
        <span className={`cl-left${left !== null && left < 0 ? ' is-over' : ''}`}>
          {left === null ? `${legion.creatures.length} criaturas` : left >= 0 ? `${left} pts livres` : `${-left} pts acima do limite`}
        </span>
      </div>

      <dl className="cl-side">
        <div><dt>Cartas</dt><dd className="num">{legion.totalCards()}</dd></div>
        <div><dt>Artefatos</dt><dd className="num">{artifacts}{legion.extraArtifacts > 0 ? `/${1 + legion.extraArtifacts}` : ''}</dd></div>
        {evil !== 0 && <div><dt>Evil</dt><dd className="num">{evil}</dd></div>}
      </dl>

      <label className="cl-target">
        <span className="sr-only">Limite de pontos</span>
        <select value={target ?? ''} onChange={(e) => setSettings({ target: e.target.value === '' ? null : Number(e.target.value) })}>
          <option value="">Sem limite</option>
          {TARGETS.map((t) => <option key={t} value={t}>Limite {t}</option>)}
        </select>
      </label>
    </section>
  );
}
