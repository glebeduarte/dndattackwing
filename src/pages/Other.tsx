import { download, parseLegionText, pickFile, savedToText } from '../legionFile';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Legion, loadLegionFromCode, Upgrade } from '../engine/engine';
import type { CreatureData, UpgradeData } from '../engine/types';
import { GameIcon, SLOT_LABEL } from '../ui/bits';
import { catalog, useStore } from '../store';
import { CreatureCard, UpgradeCard } from '../ui/Cards';
import { Shell } from '../ui/Shell';

/* /link/:code abre uma legião compartilhada (aceita o formato do site original). */
export function LinkRoute() {
  const { code = '' } = useParams();
  const { replace, notify } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    const { legion, problems } = loadLegionFromCode(code, catalog);
    if (legion.creatures.length) {
      replace(legion, 'Legião compartilhada');
      notify(problems.length ? 'error' : 'ok', problems.length ? problems.join(' ') : `Legião aberta: ${legion.creatures.length} criaturas, ${legion.totalCost()} pts.`);
    } else {
      notify('error', problems[0] ?? 'Este link não traz nenhuma criatura.');
    }
    navigate('/construtor', { replace: true });
  }, [code]);
  return null;
}

export function SavedPage() {
  const { saved, loadSaved, deleteSaved, notify, savedId, importSaved } = useStore();
  const doImport = async () => {
    const t = await pickFile();
    if (t == null) return;
    const list = parseLegionText(t);
    if (!list.length) return notify('error', 'Nenhuma legião encontrada no arquivo.');
    const n = importSaved(list);
    notify('ok', n ? `${n} legião(ões) importada(s).` : 'Essas legiões já estavam salvas.');
  };
  const navigate = useNavigate();
  const fmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <Shell>
      <div className="page">
        <div className="title-row">
          <div className="title-block">
            <h1 className="page-title">Legiões salvas</h1>
            <p className="title-sub">Ficam neste navegador. Exporte um arquivo de texto para guardar uma cópia ou abrir em outro aparelho.</p>
          </div>
          <div className="title-actions">
            <button className="btn btn-secondary" onClick={doImport}>Importar arquivo</button>
            <button className="btn btn-secondary" disabled={!saved.length} onClick={() => download(`legioes-attack-wing-${new Date().toISOString().slice(0, 10)}.txt`, savedToText(saved))}>Exportar todas</button>
            <Link className="btn btn-primary" to="/construtor">Abrir o construtor</Link>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="empty-block">
            <p>Nenhuma legião salva ainda. Monte uma no construtor e use Salvar legião.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Legião</th>
                <th>Criaturas</th>
                <th className="num">Cartas</th>
                <th className="num">Custo</th>
                <th className="num">Atualizada</th>
                <th><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {saved.map((s) => (
                <tr key={s.id}>
                  <td className="t-name">
                    {s.name}
                    {s.id === savedId && <span className="pill pill-neutral">Aberta</span>}
                  </td>
                  <td className="t-sub">{s.creatures.join(', ') || '–'}</td>
                  <td className="num">{s.cards}</td>
                  <td className="num">{s.cost} pts</td>
                  <td className="num">{fmt.format(new Date(s.updated))}</td>
                  <td className="t-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => { loadSaved(s); navigate('/construtor'); }}>Abrir</button>
                    <button
                      className="btn btn-text btn-sm"
                      onClick={async () => {
                        const url = `${window.location.origin}/link/${s.code}`;
                        try {
                          await navigator.clipboard.writeText(url);
                          notify('ok', 'Link copiado.');
                        } catch {
                          window.prompt('Copie o link:', url);
                        }
                      }}
                    >
                      Copiar link
                    </button>
                    <button className="btn btn-text btn-sm btn-danger" onClick={() => window.confirm(`Excluir ${s.name}?`) && deleteSaved(s.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}

export function CardPage({ kind }: { kind: 'creature' | 'upgrade' }) {
  const { id = '' } = useParams();
  const { mutate } = useStore();
  const uid = Number(id);
  const c = kind === 'creature' ? catalog.creatureByUid.get(uid) : undefined;
  const u = kind === 'upgrade' ? catalog.upgradeByUid.get(uid) : undefined;
  const name = c?.name ?? u?.name;
  useEffect(() => {
    document.title = name ? `${name} · Attack Wing` : 'Carta não encontrada · Attack Wing';
    return () => {
      document.title = 'Attack Wing · Construtor de legião';
    };
  }, [name]);

  return (
    <Shell>
      <div className="page card-page">
        <nav className="crumbs" aria-label="Trilha">
          <Link to="/construtor">Construtor</Link> <span aria-hidden>/</span> <span>{kind === 'creature' ? 'Criaturas' : 'Upgrades'}</span>
        </nav>
        {!name ? (
          <>
            <h1 className="page-title">Carta não encontrada</h1>
            <p>Nenhuma carta com o número {id}. <Link to="/construtor">Voltar ao construtor</Link></p>
          </>
        ) : (
          <>
            <div className="title-row">
              <h1 className="page-title">{name}</h1>
              <div className="title-actions">
                {c && (
                  <button className="btn btn-primary" onClick={() => mutate((l) => l.addCreature(c), `${c.name} entrou na legião.`)}>
                    Adicionar à legião
                  </button>
                )}
                <Link className="btn btn-secondary" to="/construtor">Voltar ao construtor</Link>
              </div>
            </div>
            <div className="card-page-body">
              <div className="cp-card">
                {c && <CreatureCard data={c} full />}
                {u && <UpgradeCard data={u} full />}
              </div>
              {c && <FitsCreature data={c} />}
              {u && <FitsUpgrade data={u} />}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

/* Os upgrades que cabem nesta criatura sozinha, por tipo de slot, com o custo nela. */
function FitsCreature({ data }: { data: CreatureData }) {
  const l = new Legion();
  l.addCreature(data);
  const c = l.creatures[0];
  const rows = catalog.upgrades
    .map((u) => new Upgrade(u))
    .filter((u) => l.canCreatureEquipUpgrade(c, u))
    .map((u) => ({ u, cost: u.costForCreature(c, l) }));
  const groups = [...new Set(rows.map((r) => r.u.upgrade))];
  return (
    <section className="cp-fits" aria-labelledby="fits-title">
      <h2 id="fits-title" className="cp-fits-title">Upgrades que cabem <span className="num muted">{rows.length}</span></h2>
      <p className="muted">Custo já calculado para esta criatura, antes de outras cartas na legião.</p>
      {groups.map((g) => (
        <div key={g} className="cp-group">
          <h3><GameIcon type={g} size={18} /> {SLOT_LABEL[g] ?? g}</h3>
          <ul>
            {rows.filter((r) => r.u.upgrade === g).map(({ u, cost }) => (
              <li key={u.uid}>
                <Link to={`/card/upgrade/${u.uid}`}>{u.name}</Link>
                <span className="num">{cost}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* As criaturas que podem receber este upgrade, com o custo dele em cada uma. */
function FitsUpgrade({ data }: { data: UpgradeData }) {
  const rows = catalog.creatures.flatMap((cd) => {
    const l = new Legion();
    l.addCreature(cd);
    const c = l.creatures[0];
    const u = new Upgrade(data);
    return l.canCreatureEquipUpgrade(c, u) ? [{ cd, cost: u.costForCreature(c, l) }] : [];
  });
  return (
    <section className="cp-fits" aria-labelledby="fits-title">
      <h2 id="fits-title" className="cp-fits-title">Criaturas que podem usar <span className="num muted">{rows.length}</span></h2>
      <p className="muted">Custo deste upgrade em cada uma.</p>
      {rows.length === 0 ? (
        <p className="empty-block">Nenhuma criatura atende às restrições sozinha; algumas exigem outra carta equipada antes.</p>
      ) : (
        <ul className="cp-list">
          {rows.map(({ cd, cost }) => (
            <li key={cd.uid}>
              <Link to={`/card/creature/${cd.uid}`}>{cd.name}</Link>
              <span className="muted">{cd.classtype}</span>
              <span className="num">{cost}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
