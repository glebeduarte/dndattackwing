import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { catalog, useStore } from '../store';
import { Mark } from '../ui/Shell';
import '../home.css';

/* Ondas na ordem do jogo, com o que cada uma trouxe, contado dos dados. */
function useWaves() {
  return useMemo(() => {
    const order = (w: string) => {
      if (w === 'Starter') return 0;
      if (w === 'Wave 0') return 0.5;
      const m = /^Wave (\d+)/.exec(w);
      if (m) return Number(m[1]);
      return 999;
    };
    const map = new Map<string, { creatures: string[]; upgrades: number }>();
    for (const c of catalog.creatures) {
      const e = map.get(c.wave) ?? { creatures: [], upgrades: 0 };
      e.creatures.push(c.name);
      map.set(c.wave, e);
    }
    for (const u of catalog.upgrades) {
      const e = map.get(u.wave) ?? { creatures: [], upgrades: 0 };
      e.upgrades++;
      map.set(u.wave, e);
    }
    const waves = [...map.entries()]
      .filter(([w]) => order(w) < 999 && w !== 'Wave 0')
      .sort((a, b) => order(a[0]) - order(b[0]));
    const op = [...map.keys()].filter((w) => w.startsWith('OP')).length;
    return { waves, op };
  }, []);
}

const SLOTS: [string, string, string][] = [
  ['dragon', 'Dragão', 'sopros, presença aterradora e golpes de cauda, só para dragões'],
  ['arcane', 'Arcano', 'magias de mago e feiticeiro, com nível mínimo'],
  ['divine', 'Divino', 'orações e milagres de clérigos e paladinos'],
  ['heroic', 'Heroico', 'talentos de quem luta: líderes, veteranos, caçadores'],
  ['equipment', 'Equipamento', 'armas, armaduras, escudos e itens mágicos'],
  ['monster', 'Monstro', 'instintos e habilidades de feras e gigantes'],
];

export function Home() {
  const { legion } = useStore();
  const { waves, op } = useWaves();
  const hasLegion = legion.creatures.length > 0;

  useEffect(() => {
    document.title = 'D&D Attack Wing · Construtor de legião';
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.h-reveal');
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('h-anim');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      document.documentElement.classList.remove('h-anim');
    };
  }, []);

  return (
    <div className="home">
      <header className="h-nav">
        <Link to="/" className="h-brand"><Mark size={30} light /> Attack Wing</Link>
        <nav aria-label="Seções">
          <a href="#jogo">O jogo</a>
          <a href="#memoria">Memória</a>
          <a href="#upgrades">Upgrades</a>
          <Link to="/legioes">Legiões salvas</Link>
        </nav>
        <Link className="h-btn h-btn-sm" to="/construtor">{hasLegion ? 'Voltar à legião' : 'Construir'}</Link>
      </header>

      <section className="h-hero" aria-labelledby="h-title">
        <img className="h-hero-art" src="/home/keyart.webp" alt="Dragão de escamas prateadas solta um sopro de gelo contra uma criatura de cristal" />
        <div className="h-hero-copy">
          <img className="h-logo" src="/home/logo.png" width={300} height={129} alt="D&D Attack Wing" />
          <h1 id="h-title">Monte sua legião de dragões</h1>
          <p className="h-lead">
            O construtor de legiões de D&D Attack Wing está de volta: {catalog.creatures.length} criaturas, {catalog.upgrades.length} upgrades e todas as regras de montagem do construtor original, direto no navegador.
          </p>
          <div className="h-cta">
            <Link className="h-btn" to="/construtor">{hasLegion ? `Continuar ${legion.creatures.length === 1 ? 'a legião' : `a legião de ${legion.creatures.length} criaturas`}` : 'Construir minha legião'}</Link>
            <a className="h-link" href="#jogo">Como funciona o jogo</a>
          </div>
        </div>
      </section>

      <section id="jogo" className="h-game" aria-labelledby="jogo-title">
        <div className="h-game-copy h-reveal">
          <h2 id="jogo-title">Dragões em miniatura, manobras às cegas</h2>
          <p>
            D&D Attack Wing é o jogo de miniaturas da WizKids ambientado nos Reinos Esquecidos, lançado em 2014. Cada jogador comanda uma legião de dragões, gigantes, elfos e anjos pré-pintados e escolhe em segredo a manobra de cada criatura no seu disco. As manobras se revelam ao mesmo tempo, as criaturas se movem pela mesa e o combate se resolve nos dados.
          </p>
          <p>
            A legião é montada antes da partida, contando pontos: cada criatura tem um custo e slots onde entram upgrades, que também custam pontos. É essa conta que o construtor faz por você.
          </p>
        </div>

        <figure className="h-anatomy h-reveal">
          <img src="/home/vuthala.webp" width={468} height={654} alt="Carta de Vuthala, Young Black Dragon, custo 28, nível 6" loading="lazy" />
          <figcaption>
            <h3>O que a carta conta</h3>
            <dl>
              <div><dt>Selo vermelho</dt><dd>o custo em pontos da criatura: Vuthala custa 28</dd></div>
              <div><dt>Coluna de ícones</dt><dd>os slots de upgrade: três de Dragão e um Arcano</dd></div>
              <div><dt>Blocos coloridos</dt><dd>ataque, agilidade, vida e armadura</dd></div>
              <div><dt>Escudos à direita</dt><dd>os ataques, com alcance e tipo</dd></div>
              <div><dt>Ícones no pé</dt><dd>as ações que a criatura pode fazer</dd></div>
              <div><dt>Medalhões</dt><dd>alinhamento, elemento e nível</dd></div>
            </dl>
          </figcaption>
        </figure>
      </section>

      <section id="memoria" className="h-memory" aria-labelledby="memoria-title">
        <div className="h-memory-head h-reveal">
          <h2 id="memoria-title">A memória do jogo, carta por carta</h2>
          <p>
            Durante anos a comunidade montou legiões no construtor do site dndaw.com. Quando ele saiu do ar, as listas de torneio, os links compartilhados e as regras de cada carta ficaram sem casa. Este construtor foi refeito a partir dos dados daquele site, com as mesmas cartas, as mesmas regras e os mesmos links.
          </p>
        </div>

        <div className="h-fan h-reveal" aria-label="Cartas de criatura">
          <img src="/home/drizzt.webp" alt="Carta de Drizzt Do'Urden, Drow Elf Ranger, custo 40" loading="lazy" />
          <img src="/home/janic.webp" alt="Carta de Janic, Adult Brass Dragon, custo 39" loading="lazy" />
          <img src="/home/vakka.webp" alt="Carta de Vakka, Ancient Silver Dragon, custo 57" loading="lazy" />
          <img src="/home/sarpiel.webp" alt="Carta de Sarpiel, Movanic Deva Angel, custo 40" loading="lazy" />
        </div>

        <div className="h-waves h-reveal">
          <h3>Do kit inicial à décima onda</h3>
          <ol className="h-wave-list">
            {waves.map(([w, e]) => (
              <li key={w}>
                <span className="h-wave-name">{w === 'Starter' ? 'Kit inicial' : w.replace('Wave', 'Onda')}</span>
                <span className="h-wave-count"><strong>{e.creatures.length}</strong> criaturas</span>
                <span className="h-wave-names">{[...new Set(e.creatures)].slice(0, 4).join(', ')}{new Set(e.creatures).size > 4 ? '…' : ''}</span>
              </li>
            ))}
          </ol>
          <p className="h-waves-note">Além das ondas, {op} kits de jogo organizado trouxeram cartas promocionais, todas no catálogo.</p>
        </div>
      </section>

      <section id="upgrades" className="h-upgrades" aria-labelledby="upgrades-title">
        <div className="h-up-cards h-reveal">
          <img src="/home/frightful-presence.webp" width={375} height={525} alt="Carta de upgrade Frightful Presence, custo 4" loading="lazy" />
          <img src="/home/witch-bolt.webp" width={240} height={336} alt="Carta de upgrade Witch Bolt, magia arcana, custo 3" loading="lazy" />
        </div>
        <div className="h-up-copy h-reveal">
          <h2 id="upgrades-title">Upgrades decidem a batalha</h2>
          <p>
            Cada ícone na coluna da criatura é um slot, e cada slot aceita um tipo de upgrade. O construtor só oferece o que cabe: confere o tipo do slot, o nível, o alinhamento, o tamanho da base e as cartas que já estão equipadas, e calcula custos que mudam de criatura para criatura, como os sopros que custam o ataque do dragão.
          </p>
          <ul className="h-slots">
            {SLOTS.map(([icon, name, desc]) => (
              <li key={icon}>
                <img src={`/icons/${icon}.png`} width={36} height={36} alt="" />
                <span><strong>{name}</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="h-invite" aria-labelledby="invite-title">
        <img className="h-invite-mark" src="/brand-dragon-light.png" width={329} height={362} alt="" aria-hidden />
        <div className="h-invite-copy h-reveal">
          <h2 id="invite-title">Sua legião começa com uma criatura</h2>
          <p>Escolha um dragão, preencha os slots, acompanhe os pontos e leve a lista para a mesa: salve no navegador, compartilhe por link ou imprima a folha para o torneio.</p>
          <div className="h-cta">
            <Link className="h-btn h-btn-light" to="/construtor">Construir minha legião</Link>
            <Link className="h-link h-link-light" to="/legioes">Ver legiões salvas</Link>
          </div>
        </div>
      </section>

      <footer className="h-footer">
        <p className="h-footer-name"><Mark size={40} light /> Attack Wing</p>
        <p>
          Ferramenta de fã, gratuita e sem fins comerciais. D&D Attack Wing, nomes, textos, ilustrações e ícones das cartas são da WizKids e da Wizards of the Coast. Dados reconstruídos a partir do antigo construtor do dndaw.com.
        </p>
      </footer>
    </div>
  );
}
