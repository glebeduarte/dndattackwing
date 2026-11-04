import { useStore } from '../store';

const TARGETS = [100, 150, 200, 250, 300];

/* A linha de custo da legião: cada criatura é um trecho, base em cor cheia e upgrades no tom claro, contra o limite escolhido. */
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
      <div className="cl-figures">
        <div className="cl-total">
          <span className="cl-label">Custo da legião</span>
          <span className="cl-value num">
            {total}
            {target !== null && <span className="cl-of"> / {target} pts</span>}
            {target === null && <span className="cl-of"> pts</span>}
          </span>
          {left !== null && (
            <span className={`cl-left ${left < 0 ? 'is-over' : ''}`}>
              {left >= 0 ? `${left} pts livres até ${target}` : `${-left} pts acima do limite de ${target}`}
            </span>
          )}
        </div>
        <dl className="cl-side">
          <div><dt>Cartas</dt><dd className="num">{legion.totalCards()}</dd></div>
          <div><dt>Criaturas</dt><dd className="num">{legion.creatures.length}</dd></div>
          <div><dt>Artefatos</dt><dd className="num">{artifacts}{legion.extraArtifacts > 0 ? <span className="muted"> de {1 + legion.extraArtifacts}</span> : null}</dd></div>
          {evil !== 0 && <div><dt>Marcadores Evil</dt><dd className="num">{evil}</dd></div>}
        </dl>
        <label className="field cl-target">
          <span>Limite</span>
          <select value={target ?? ''} onChange={(e) => setSettings({ target: e.target.value === '' ? null : Number(e.target.value) })}>
            <option value="">Sem limite</option>
            {TARGETS.map((t) => <option key={t} value={t}>{t} pts</option>)}
          </select>
        </label>
      </div>

      <div className="cl-track" role="img" aria-label={`${total} de ${target ?? total} pontos usados`}>
        {legion.creatures.map((c, i) => {
          const up = c.upgradesCost(legion);
          return (
            <div className="cl-seg" key={c.key} style={{ width: `${((c.cost + up) / scale) * 100}%` }} title={`#${i + 1} ${c.name}: ${c.cost} + ${up} = ${c.cost + up} pts`}>
              <span className="cl-base" style={{ flexGrow: c.cost }} />
              {up > 0 && <span className="cl-up" style={{ flexGrow: up }} />}
            </div>
          );
        })}
        {target !== null && total > target && <span className="cl-limit" style={{ left: `${(target / scale) * 100}%` }} />}
      </div>
      <div className="cl-axis" aria-hidden>
        {legion.creatures.map((c, i) => (
          <span key={c.key} style={{ width: `${(c.totalCost(legion) / scale) * 100}%` }}>
            <span className="num">{i + 1}</span>
          </span>
        ))}
      </div>
      <p className="cl-legend">
        <span className="sw sw-base" /> Criatura <span className="sw sw-up" /> Upgrades
      </p>
    </section>
  );
}
