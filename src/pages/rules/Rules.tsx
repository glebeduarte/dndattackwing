import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { catalog } from '../../store';
import { CreatureCard, UpgradeCard } from '../../ui/Cards';
import { Shell } from '../../ui/Shell';
import {
  AltitudeTable, ArcDiagram, AreaAttacks, DiceFaces, DiceRow, DifficultyKey, LevelOrder,
  ManeuverTypes, PhaseCycle, RangeRuler, SetupDiagram,
} from './diagrams';

const MANUAL = '/manual/attack-wing-livro-de-regras.pdf';

const SECTIONS: [string, string][] = [
  ['visao', 'O jogo em 1 minuto'],
  ['carta', 'A carta de criatura'],
  ['preparacao', 'Preparação'],
  ['rodada', 'A rodada'],
  ['manobras', 'Planejamento e manobras'],
  ['ativacao', 'Ativação'],
  ['acoes', 'Ações'],
  ['alcance', 'Alcance e arcos'],
  ['combate', 'Combate'],
  ['exemplo', 'Exemplo de combate'],
  ['area', 'Ataques em área'],
  ['dano', 'Dano e derrota'],
  ['final', 'Fase final e vitória'],
  ['melhorias', 'Melhorias'],
  ['movimento', 'Situações de movimento'],
  ['conflitos', 'Iniciativa e disputas'],
  ['legioes', 'Construção de legiões'],
  ['tropas', 'Tropas'],
  ['equipe', 'Equipes e obstáculos'],
  ['resumo', 'Resumo para a mesa'],
];

function Tip({ kind = 'dica', children }: { kind?: 'dica' | 'erro' | 'pratica'; children: ReactNode }) {
  const label = kind === 'erro' ? 'Erro comum' : kind === 'pratica' ? 'Na prática' : 'Dica';
  return (
    <aside className={`rg-tip rg-tip-${kind}`}>
      <strong>{label}</strong>
      <div>{children}</div>
    </aside>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="rg-sec">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function RulesPage() {
  const [active, setActive] = useState('visao');
  const balagos = catalog.creatureByUid.get(101)!;
  const fireBreath = catalog.upgrades.find((u) => u.name === 'Fire Breath')!;

  useEffect(() => {
    document.title = 'Regras do jogo · Attack Wing';
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-10% 0px -75% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <Shell>
      <div className="rg">
        <header className="rg-hero">
          <img src="/home/keyart.webp" alt="" aria-hidden />
          <div className="rg-hero-copy">
            <h1>Regras do jogo</h1>
            <p>Um guia completo de D&D Attack Wing, escrito para quem vai jogar a primeira partida e para quem quer tirar uma dúvida no meio dela. Tudo o que está no livro de regras, explicado com exemplos e diagramas.</p>
            <p className="rg-hero-links">
              <a href={MANUAL} target="_blank" rel="noopener">Livro de regras original (PDF)</a> · <Link to="/aventuras">Aventuras</Link> · <Link to="/construtor">Montar uma legião</Link>
            </p>
          </div>
        </header>

        <div className="rg-layout">
          <nav className="rg-toc" aria-label="Seções">
            <p>Nesta página</p>
            <ol>
              {SECTIONS.map(([id, t]) => (
                <li key={id}><a href={`#${id}`} className={active === id ? 'is-on' : ''}>{t}</a></li>
              ))}
            </ol>
          </nav>

          <article className="rg-body">
            <Section id="visao" title="O jogo em 1 minuto">
              <p>D&D Attack Wing é um jogo de batalha com miniaturas pré-pintadas nos Reinos Esquecidos. Cada jogador comanda uma legião: dragões, gigantes, elfos, magos, tropas e máquinas de cerco. Vence quem destruir todas as criaturas do adversário, ou quem cumprir o objetivo de uma aventura.</p>
              <p>Não há tabuleiro. Joga-se numa mesa livre de 90 x 90 cm, e as criaturas se movem com gabaritos de papelão que mostram exatamente para onde elas vão. O coração do jogo é a escolha secreta: cada jogador decide a manobra de cada criatura num disco, sem ver o que o outro escolheu, e depois todos revelam. Quem antecipar melhor onde o inimigo vai estar ataca primeiro e defende melhor.</p>
              <PhaseCycle />
              <Tip kind="pratica">Uma partida com os três dragões da caixa básica leva de 30 a 45 minutos. Com legiões de 200 pontos, conte de uma hora e meia a duas horas.</Tip>
            </Section>

            <Section id="carta" title="A carta de criatura">
              <p>Tudo o que uma criatura sabe fazer está na carta dela. A ficha encaixada na base repete as informações que importam durante o movimento, mas é na carta que você confere habilidades e melhorias.</p>
              <div className="rg-anatomy">
                <div className="rg-anatomy-card"><CreatureCard data={balagos} full /></div>
                <dl className="rg-legend">
                  <div><dt>Custo</dt><dd>Pontos de legião que a criatura custa. Um anel dourado no selo indica carta de nome único.</dd></div>
                  <div><dt>Faixa de melhorias</dt><dd>Os ícones na coluna escura. Cada ícone é um espaço para uma carta de melhoria daquele tipo.</dd></div>
                  <div><dt>Arma primária (vermelho)</dt><dd>Quantos dados de ataque a criatura rola com as suas armas naturais.</dd></div>
                  <div><dt>Agilidade (verde)</dt><dd>Quantos dados de defesa ela rola quando é atacada.</dd></div>
                  <div><dt>Vida (amarelo)</dt><dd>Quantas cartas de dano ela aguenta. Ao atingir esse número, é derrotada na fase final.</dd></div>
                  <div><dt>Armadura (azul)</dt><dd>Quantos acertos normais ela ignora em cada ataque.</dd></div>
                  <div><dt>Alinhamento e energia</dt><dd>Os medalhões no topo: Bom, Neutro ou Mau, e o tipo de energia, como Fogo ou Raio.</dd></div>
                  <div><dt>Nível</dt><dd>Decide a ordem de movimento e de ataque.</dd></div>
                  <div><dt>Habilidade especial</dt><dd>O texto no pergaminho. Vale sempre, salvo quando diz o contrário.</dd></div>
                  <div><dt>Ações</dt><dd>Os ícones no pé da carta: as ações que a criatura pode escolher depois de se mover.</dd></div>
                  <div><dt>Armas primárias</dt><dd>Os escudos à direita: alcance máximo, nome e se o ataque sai do arco frontal ou traseiro.</dd></div>
                </dl>
              </div>
              <Tip>Na faixa de armas, a seta para cima indica o arco frontal e a seta para baixo, o traseiro. Balagos tem a Mordida na frente e a Cauda atrás, as duas até Alcance 2.</Tip>
            </Section>

            <Section id="preparacao" title="Preparação">
              <ol className="rg-steps">
                <li><strong>Escolham os lados.</strong> Com a caixa básica, cada jogador pega um dragão. Tudo o que é seu é aliado; o que é do oponente é inimigo.</li>
                <li><strong>Juntem as forças.</strong> Sem as regras de construção de legiões, cada dragão usa a sua carta de criatura, a carta de manobras e as melhorias sugeridas pelo livro (Balagos: Fire Breath e Haste; Eshaedra: Lightning Breath, Devotrix of Tiamat e Prayer of Healing; Galadaeros: Acid Breath, Slow Breath, Trickster, Shield e Magic Missile). Depois de uma ou duas partidas, montem as próprias legiões.</li>
                <li><strong>Montem as criaturas.</strong> Voadoras vão sobre pinos transparentes; terrestres, sobre o conector baixo. A cunha da ficha aponta para a frente da base.</li>
                <li><strong>Marquem a área de jogo.</strong> Uma superfície plana de 90 x 90 cm. Um feltro ou tecido evita que as miniaturas escorreguem.</li>
                <li><strong>Iniciativa.</strong> Se criaturas de jogadores diferentes têm o mesmo nível, sorteiem quem recebe a ficha de iniciativa entre esses jogadores. Sem empates, ela não é usada.</li>
                <li><strong>Posicionem as forças.</strong> Uma criatura por vez, do menor nível para o maior. Quem tem iniciativa posiciona por último dentro do empate.</li>
                <li><strong>Separem cartas e fichas.</strong> Cartas viradas para cima ao lado da mesa, visíveis a todos. Fichas de efeito em cima das melhorias correspondentes, com o lado verde para cima.</li>
                <li><strong>Armadura.</strong> Coloquem sobre cada carta de criatura fichas de armadura iguais ao valor de Armadura, com o lado inteiro para cima.</li>
                <li><strong>O resto.</strong> Embaralhem o baralho de dano e deixem dados, gabaritos e fichas ao alcance de todos.</li>
              </ol>
              <div className="rg-two">
                <SetupDiagram players={2} />
                <SetupDiagram players={3} />
              </div>
            </Section>

            <Section id="rodada" title="A rodada">
              <p>O jogo avança em rodadas, sempre com as mesmas quatro fases. A ordem das criaturas muda de uma fase para outra, e é aqui que o nível faz diferença:</p>
              <LevelOrder />
              <p>Quem tem nível baixo se move primeiro, o que é uma desvantagem: o adversário de nível alto já sabe onde você terminou antes de se mover. Em compensação, no combate, quem tem nível alto ataca antes e pode tirar uma criatura do jogo antes que ela reaja.</p>
              <Tip kind="erro">A criatura derrotada no combate só sai da mesa na fase final. Ela ainda ataca na mesma rodada, se a vez dela não tiver passado.</Tip>
            </Section>

            <Section id="manobras" title="Planejamento e manobras">
              <p>No planejamento, cada jogador gira o disco de manobras de cada criatura até a janela mostrar a manobra escolhida e coloca o disco virado para baixo ao lado dela. Ninguém pode medir nada nem testar gabaritos: a escolha é no olho. Você pode olhar os seus discos fechados quando quiser, mas nunca os do oponente.</p>
              <p>Cada manobra tem três partes: a direção (a seta), a velocidade (o número, de 0 a 6) e a dificuldade (a cor da seta).</p>
              <ManeuverTypes />
              <DifficultyKey />
              <p>Criaturas sobre pinos começam voando e usam o disco de Voo. Ao pousar, passam para o disco de Solo. A carta de manobras, de frente e verso, mostra tudo o que cada disco oferece. Consulte-a no planejamento.</p>
              <Tip>Cada tipo de criatura tem o seu disco. Um dragão antigo pode não ter a velocidade 1, e uma criatura ágil pode ter curvas acentuadas verdes. Antes de mover, olhe o cartão de manobras: no construtor, ele aparece em cada carta de criatura.</Tip>
            </Section>

            <Section id="ativacao" title="Ativação">
              <p>As criaturas se ativam uma por vez, do menor nível para o maior. Cada uma faz, na ordem:</p>
              <ol className="rg-steps">
                <li><strong>Revela o disco.</strong></li>
                <li><strong>Encaixa o gabarito</strong> da manobra entre as guias da frente da base.</li>
                <li><strong>Executa a manobra.</strong> Segurando o gabarito, levante a base pelos lados e encaixe as guias de trás na outra ponta. As fichas da criatura vão junto.</li>
                <li><strong>Confere a exaustão.</strong> Manobra vermelha dá uma ficha de exaustão; verde tira uma.</li>
                <li><strong>Devolve o gabarito</strong> e deixa o disco aberto ao lado da carta.</li>
                <li><strong>Muda de altitude,</strong> se quiser e puder.</li>
                <li><strong>Faz uma ação,</strong> se não estiver exausta.</li>
              </ol>
              <h3>Volta, recuo e pivô</h3>
              <p>A volta usa o gabarito de reta e, no fim, a criatura gira 180°. O recuo também usa o gabarito de reta, encaixado atrás da base: a criatura anda para trás. No pivô, a criatura não sai do lugar; ela pode girar 90° para um lado ou 180°, anunciando antes de girar. Depois do pivô ela recebe uma ficha de Pivô: não faz ações na rodada, e todo inimigo que a atacar rola 1 dado de ataque a mais.</p>
              <p>Num empate de nível entre jogadores, a criatura sem iniciativa se ativa primeiro. Com várias criaturas de mesmo nível, o dono escolhe a ordem.</p>
              <h3>Altitude</h3>
              <p>Depois de mover, uma criatura no ar pode pousar (ficha de Solo) ou mergulhar em rasante (ficha de Rasante). Quem está no chão e sabe voar pode levantar voo, tirando a ficha de Solo. É uma mudança por rodada, e as fichas de altitude ficam até a próxima mudança.</p>
              <AltitudeTable />
              <Tip kind="pratica">O rasante é a forma de um dragão morder um gigante no chão. O preço é ficar exposto: na mesma rodada, até as tropas no chão podem atacá-lo corpo a corpo.</Tip>
              <h3>Exaustão</h3>
              <p>Uma criatura com ficha de exaustão não pode fazer manobras vermelhas nem ações, nem mesmo ações gratuitas. Se ela revelar uma manobra vermelha mesmo assim, o oponente escolhe qualquer manobra não vermelha do disco para ela. Manobras verdes tiram uma ficha por vez.</p>
            </Section>

            <Section id="acoes" title="Ações">
              <p>Depois de se mover, a criatura ativa pode fazer uma ação dentre os ícones da sua carta. Cartas de melhoria e de dano podem oferecer outras ações, marcadas com "Ação:". Uma mesma ação não se repete na rodada, nem como ação gratuita.</p>
              <dl className="rg-actions">
                <div><dt><img src="/icons/dodge.png" alt="" width={28} height={28} /> Esquiva</dt><dd>Pegue uma ficha de Esquiva. No combate, ao defender, gaste-a para somar um resultado de esquiva aos seus dados.</dd></div>
                <div><dt><img src="/icons/target.png" alt="" width={28} height={28} /> Adquirir alvo</dt><dd>Aponte um inimigo e meça: se ele estiver a Alcance 1 a 4, em qualquer direção, você ganha uma ficha de Alvo. Se não estiver, a ação é perdida. Ao atacar, gaste a ficha para rolar de novo quantos dados quiser, uma vez. A ficha vale contra qualquer inimigo, não só o que você mediu. Alguns ataques, como Magic Missile, exigem gastá-la.</dd></div>
                <div><dt><img src="/icons/concentrate.png" alt="" width={28} height={28} /> Concentração</dt><dd>Pegue uma ficha de Concentração. Gaste-a ao atacar para transformar os olhos em acertos, ou ao defender para transformar os olhos em esquivas.</dd></div>
                <div><dt><img src="/icons/charge.png" alt="" width={28} height={28} /> Investida</dt><dd>Pegue uma ficha de Investida. No combate, antes de declarar o alvo, gaste-a para avançar com o gabarito de reta 1. Nessa rodada a criatura só ataca corpo a corpo, e rola 1 dado a mais contra quem estiver no arco frontal. A investida pode terminar sobre outra base.</dd></div>
                <div><dt><img src="/icons/feint.png" alt="" width={28} height={28} /> Finta</dt><dd>Encoste o gabarito de reta 1 num lado da base e mude a criatura para a outra ponta, virada para a mesma direção. Depois, receba uma ficha de exaustão. Se não couber sem sobrepor outra base ou obstáculo, a finta falha, e a exaustão vem mesmo assim.</dd></div>
                <div><dt>Passar</dt><dd>Não fazer nada também é uma escolha.</dd></div>
              </dl>
              <Tip kind="erro">Não se mede antes de se comprometer. Na ação de alvo, você aponta o inimigo e só então mede. Vale apontar o mais distante, mesmo sabendo que pode falhar, para descobrir a distância real.</Tip>
              <p>Fichas de Esquiva, Alvo, Concentração e Investida não usadas saem na fase final.</p>
            </Section>

            <Section id="alcance" title="Alcance e arcos">
              <p>A régua tem quatro trechos: Alcance 1 (toque), 2 (perto), 3 (médio) e 4 (longe). Para medir, encoste a ponta do Alcance 1 na base de quem age e aponte para a parte mais próxima da base do alvo. Durante a partida não se mede por antecipação: primeiro se declara o alvo, depois se mede.</p>
              <RangeRuler />
              <div className="rg-two"><ArcDiagram /><div className="rg-fig rg-fig-text"><h3>Como ler o diagrama</h3><p>A criatura vermelha no centro está virada para cima. A cunha desenhada na própria base mostra a abertura do arco frontal: tudo o que estiver entre as duas linhas, por mais longe que esteja, está no arco. O alcance é outra conta, feita com a régua.</p><p>A criatura cinza, ao lado, está perto, mas fora dos dois arcos. Para atacá-la, a vermelha precisa manobrar até deixá-la na frente.</p></div></div>
              <p>Para atacar, o alvo precisa estar dentro do arco da arma e dentro do alcance dela. Se a régua não chega, ou se o alvo está fora do arco, o ataque é perdido e não dá para trocar de alvo.</p>
              <Tip>Contra um alvo a Alcance 4, o defensor rola 1 dado de defesa a mais. Vale para armas primárias e para ataques de melhoria.</Tip>
            </Section>

            <Section id="combate" title="Combate">
              <p>Cada criatura pode fazer um ataque por rodada, do maior nível para o menor, com uma arma primária ou com um ataque de melhoria. O ataque segue nove passos:</p>
              <ol className="rg-steps rg-combat">
                <li><strong>Investida (opcional).</strong> Se tiver a ficha, avance com a reta 1.</li>
                <li><strong>Declarar o alvo e a arma.</strong> Depois meça arco e alcance.</li>
                <li><strong>Rolar o ataque.</strong> Dados iguais à arma primária, ou o que a melhoria disser. Some 1 se o alvo tiver ficha de Pivô e 1 contra o arco frontal depois de uma investida.</li>
                <li><strong>Modificar o ataque.</strong> Gaste Alvo para rolar de novo; habilidades que mexem nos dados entram aqui. Se os dois lados têm algo, o defensor resolve antes.</li>
                <li><strong>Rolar a defesa.</strong> Dados iguais à Agilidade, mais 1 a Alcance 4.</li>
                <li><strong>Modificar a defesa.</strong> Esquiva soma um resultado; Concentração transforma olhos. Aqui o atacante resolve antes.</li>
                <li><strong>Comparar.</strong> Cada esquiva cancela um acerto; só depois de cancelar todos os acertos as esquivas cancelam críticos.</li>
                <li><strong>Armadura.</strong> O defensor ignora acertos normais até o seu valor de Armadura. Críticos passam direto.</li>
                <li><strong>Dano.</strong> Uma carta de dano por acerto e por crítico que sobrou.</li>
              </ol>
              <DiceFaces />
              <h3>Corpo a corpo e à distância</h3>
              <p>A arma diz se o ataque é corpo a corpo ou à distância. Ataques à distância alcançam qualquer nível de jogo. Corpo a corpo, só no mesmo nível, salvo rasante. Muitas criaturas mordem a Alcance 2 ou 3: imagine o bote de um dragão que avança e recua.</p>
              <h3>Atacando através de outras criaturas</h3>
              <p>Voadoras atacam por cima de tudo, e terrestres atacam por cima de voadoras. Mas se uma terrestre ataca outra terrestre e a régua passa por cima de outras criaturas no chão, aliadas ou inimigas, o defensor rola 1 dado de defesa a mais para cada uma. Ataques em área não dão esse bônus.</p>
              <h3>Resistência à energia</h3>
              <p>Se o defensor tem o mesmo tipo de energia do ataque de melhoria, ganha uma esquiva automática. Um gigante do gelo atingido por um sopro de frio já começa com uma esquiva. Armas primárias não têm energia, então isso não vale para elas.</p>
              <h3>Mexendo nos dados</h3>
              <p>Adicionar coloca um resultado novo. Converter vira o dado para outra face. Rolar de novo troca o resultado. Um dado que já foi rolado de novo não pode ser rolado outra vez no mesmo ataque, a menos que uma carta diga que pode.</p>
            </Section>

            <Section id="exemplo" title="Exemplo de combate">
              <p>Fim da ativação. Eshaedra (nível 9) e Balagos (nível 8) estão um de frente para o outro, a Alcance 2. Eshaedra adquiriu alvo; Balagos fez esquiva. Galadaeros, de nível 10, não tem ninguém no arco e não ataca. Eshaedra é a próxima.</p>
              <ol className="rg-example">
                <li>
                  <p><strong>Eshaedra ataca com a Mordida</strong>, arma primária 4. Balagos está no arco frontal, a Alcance 2. Ela rola 4 dados:</p>
                  <DiceRow kind="atk" faces={['hit', 'hit', 'blank', 'blank']} />
                </li>
                <li>
                  <p><strong>Ela gasta a ficha de Alvo</strong> e rola de novo os dois brancos:</p>
                  <DiceRow kind="atk" faces={['hit', 'hit', 'hit', 'crit']} note="dois acertos e um crítico novos" />
                </li>
                <li>
                  <p><strong>Balagos defende</strong> com Agilidade 1 e gasta a ficha de Esquiva para somar mais uma:</p>
                  <DiceRow kind="def" faces={['dodge', 'dodge']} note="uma rolada, uma da ficha" />
                </li>
                <li>
                  <p><strong>Comparar.</strong> As duas esquivas cancelam dois acertos. Sobram um acerto e um crítico:</p>
                  <DiceRow kind="atk" faces={['hit', 'hit', 'hit', 'crit']} cancelled={[0, 1]} />
                </li>
                <li><p><strong>Armadura.</strong> Balagos tem Armadura 2 e ignora o acerto que sobrou. O crítico passa.</p></li>
                <li><p><strong>Dano.</strong> Balagos recebe uma carta de dano virada para cima e aplica o texto dela. Com Vida 6, ainda aguenta 5.</p></li>
                <li><p><strong>Balagos responde.</strong> Tem arma 5 e a habilidade de rolar 1 dado a mais contra quem tem menos cartas de dano do que ele. Eshaedra tem 0, então ele rola 6 dados.</p></li>
              </ol>
            </Section>

            <Section id="area" title="Ataques em área">
              <p>Linha, cone e estouro acertam várias criaturas de uma vez, aliadas incluídas. Para cada criatura atingida, faça um ataque completo e separado, do passo 3 ao 9, na ordem que o atacante escolher. Quase todos dizem "no chão ou no ar": o atacante escolhe um dos níveis, e só as criaturas nesse nível são atingidas.</p>
              <AreaAttacks />
              <div className="rg-card-explain">
                <div className="rg-example-card"><UpgradeCard data={fireBreath} full /></div>
                <div className="rg-fig rg-fig-text">
                  <h3>Lendo um ataque em área: Fire Breath</h3>
                  <p>A etiqueta no canto da arte diz Alcance 3 e Cone. O texto manda usar o valor da arma primária: Balagos rola 5 dados contra cada criatura no cone, no nível que escolher, chão ou ar.</p>
                  <p>Depois do ataque, a carta recebe fichas de duração e fica fora de uso até elas acabarem. O custo aparece como asterisco porque depende de quem equipa: o valor da arma primária, mais 5 se o dragão não for de Fogo. Em Balagos, sai por 5 pontos.</p>
                </div>
              </div>
              <p>No estouro, a ficha não pode ficar sobre uma base, mas pode encostar nela. Se qualquer parte da ficha ficar fora do arco ou do alcance, o ataque falha, e os custos dele, como fichas de duração, são pagos mesmo assim. Alguns estouros, como a Tempestade de Gelo, ficam na mesa por várias rodadas e atingem quem estiver dentro na fase final.</p>
              <Tip kind="erro">Ataque em área não é o mesmo que atacar várias vezes. Um efeito que permite dois ataques na rodada não transforma nenhum deles em ataque em área.</Tip>
            </Section>

            <Section id="dano" title="Dano e derrota">
              <p>Cada acerto que chega vira uma carta de dano virada para baixo, e seu texto é ignorado. Cada crítico vira uma carta virada para cima, com um efeito que precisa ser aplicado; marque a criatura com uma ficha de acerto crítico. O dano normal é aplicado antes do crítico.</p>
              <p>Muitas cartas de dano trazem uma ação para tentar virá-las para baixo, no lugar da ação normal. Quando o baralho acaba, o descarte é embaralhado.</p>
              <p>Na fase final, toda criatura com cartas de dano iguais ou acima da sua Vida é derrotada. Ela sai da mesa, as suas cartas de dano vão para o descarte e as fichas voltam para a reserva. Os efeitos contínuos das suas melhorias continuam até acabarem.</p>
              <Tip kind="pratica">Como a derrota só acontece na fase final, uma criatura condenada ainda ataca se o nível dela ainda não tiver jogado. Também vale atacar quem já está condenado, para empurrar mais um crítico.</Tip>
            </Section>

            <Section id="final" title="Fase final e vitória">
              <ol className="rg-steps">
                <li>Resolvam os efeitos "durante a fase final".</li>
                <li>Retirem as criaturas derrotadas.</li>
                <li>Tirem as fichas de ação não usadas (Esquiva, Alvo, Concentração, Investida) e as de Pivô. As de altitude ficam.</li>
                <li>Tirem 1 ficha de duração de cada melhoria e de cada carta de dano. A que ficar sem nenhuma devolve a sua ficha de efeito para cima da carta.</li>
                <li>Passem a iniciativa para o próximo jogador, à esquerda, que ainda tenha criatura empatada em nível com um oponente.</li>
              </ol>
              <p>Vence quem for o único com criaturas na mesa depois da fase final. Se todas forem derrotadas na mesma fase final, vence quem perdeu a criatura de maior nível naquela rodada; no empate, decide a iniciativa. Numa partida de três, quem perde todas as criaturas sai do jogo. Nas aventuras, valem os objetivos da aventura.</p>
            </Section>

            <Section id="melhorias" title="Melhorias">
              <h3>Fichas de duração</h3>
              <p>Muitas melhorias mandam colocar fichas de duração sobre a carta ao serem usadas. Enquanto houver fichas, a melhoria não pode ser usada de novo. Sai uma por fase final. Um sopro que põe 3 fichas só volta depois de três rodadas. A ficha de duração permanente não sai na fase final.</p>
              <h3>Efeitos contínuos</h3>
              <p>A ficha de efeito tem o mesmo nome da melhoria. Quando o efeito começa, ela sai da carta e vai para o lado de quem recebe o efeito, acompanhando a criatura. Se a melhoria não diz quem recebe, é o próprio dono. Quando sai a última ficha de duração, o efeito acaba e a ficha volta para a carta. Fichas verdes são efeitos bons; vermelhas, ruins.</p>
              <h3>Desativar e descartar</h3>
              <p>Uma melhoria desativada recebe a ficha de melhoria desativada e não pode ser usada até que o dono gaste uma ação para tirar essa ficha. Descartada, ela volta para a caixa até o fim da partida. Nos dois casos, as fichas de duração e os efeitos já em curso continuam.</p>
              <h3>Ataques de melhoria</h3>
              <p>A palavra "Ataque:" indica que a melhoria substitui a arma primária naquele ataque, com arco, alcance e dados próprios. Os sopros usam o valor da arma primária para os dados, mas continuam sendo ataques de melhoria. Se a melhoria dá um alcance e não fala em arco, vale qualquer direção.</p>
              <Tip>No construtor, cada melhoria mostra o custo calculado para a criatura: sopros custam o valor da arma primária, mais 5 se o elemento não for o do dragão.</Tip>
            </Section>

            <Section id="movimento" title="Situações de movimento">
              <h3>Fugir da mesa</h3>
              <p>A criatura cuja base sai, mesmo em parte, da área de jogo durante a manobra fugiu e é derrotada, a menos que a aventura diga outra coisa. Só a base importa; o gabarito ou a miniatura podem sair.</p>
              <h3>Passar por outras criaturas</h3>
              <p>Voadoras passam livremente por cima de tudo, e terrestres passam por voadoras e por terrestres aliadas. Para mover uma criatura através de outra, segure o gabarito acima delas e estime onde ela termina. Para atravessar uma terrestre inimiga, a terrestre faz um teste de invasão: os dois rolam dados de ataque, 1 para base pequena e 2 para grande, e o crítico vale 2. Se quem se move empatar ou superar, passa. Se não, para ao encostar na base inimiga. Não há dano nesse teste.</p>
              <h3>Bases sobrepostas</h3>
              <p>Se a manobra terminaria sobre outra base, recue a criatura pela linha do gabarito até que as bases só se encostem. Não há outra penalidade: ela ainda faz a ação e ataca. Na volta, se houver sobreposição, trate como reta. Uma voadora que termina sobre uma terrestre pode ficar na frente ou passar para o outro lado dela.</p>
              <h3>Miniaturas grandes</h3>
              <p>Asas que passam da base podem esbarrar em outras miniaturas. Ajustem os pinos no começo da partida. Combinando antes, dá para jogar com as miniaturas atrapalhando de verdade, como se fossem bases.</p>
            </Section>

            <Section id="conflitos" title="Iniciativa e disputas">
              <p>Criaturas de jogadores diferentes com o mesmo nível desempatam pela iniciativa. As criaturas de quem tem a ficha contam como se tivessem um nível a mais: na ativação vão por último, no combate atacam primeiro. Com três ou mais jogadores, sem a ficha no empate, tem prioridade quem está mais perto à esquerda de quem a tem.</p>
              <p>Quando a carta e a regra discordam, vale a carta. Quando uma carta proíbe e outra permite, vale a proibição.</p>
              <p>Se surgir uma dúvida que ninguém consegue resolver, um jogador pega 5 dados de ataque e o outro 5 de defesa. Rolam, e quem tirar mais olhos decide. A decisão vale para o resto da partida.</p>
            </Section>

            <Section id="legioes" title="Construção de legiões">
              <p>Com mais criaturas, cada jogador monta a sua legião em segredo, gastando um total combinado de pontos. O livro recomenda 120 ou 200 pontos, ou 60 com só a caixa básica. Depois todos revelam as legiões ao mesmo tempo. Acima de 120 pontos, vale aumentar a área de jogo.</p>
              <ul className="rg-list">
                <li><strong>Pontos.</strong> Criaturas e melhorias somam o total combinado ou menos. Quem gastou menos decide quem fica com a iniciativa; com o mesmo gasto, sorteia-se.</li>
                <li><strong>Nomes únicos.</strong> O anel dourado no custo marca carta única. Cada nome único entra uma vez na legião, mesmo em versões diferentes do mesmo personagem. Uma melhoria única também.</li>
                <li><strong>Uma cópia por criatura.</strong> Nenhuma criatura equipa duas cópias da mesma melhoria, mesmo que não seja única.</li>
                <li><strong>Slots.</strong> Cada ícone na faixa recebe uma melhoria daquele tipo: Dragão, Monstro, Heroico, Equipamento, Arcano ou Divino.</li>
                <li><strong>Restrições e penalidades.</strong> O texto em negrito da melhoria pode proibir certas criaturas ou cobrar pontos a mais. Exemplo: um sopro de outro elemento custa 5 a mais.</li>
                <li><strong>Feitiços.</strong> Magias Arcanas e Divinas pedem um nível mínimo, marcado na carta.</li>
                <li><strong>Alinhamento.</strong> Bom, Neutro e Mau podem ser misturados. Algumas cartas reagem ao alinhamento.</li>
                <li><strong>Energia.</strong> As armas primárias não causam dano de energia; só os ataques de melhoria causam.</li>
              </ul>
              <p className="rg-cta">
                <Link className="btn btn-primary" to="/construtor">Abrir o construtor</Link>
                <Link className="btn btn-secondary" to="/gerador">Gerar uma legião pelas regras</Link>
              </p>
            </Section>

            <Section id="tropas" title="Tropas">
              <p>Uma tropa é uma criatura formada por várias figuras, os soldados. O jogador escolhe de 1 a 6 soldados. Com um só, usa a carta como está. Para cada soldado a mais, empilha uma ficha de tropa sobre a carta, em ordem crescente, e paga o custo da ficha do topo, não o da carta.</p>
              <ul className="rg-list">
                <li><strong>Soldado de linha de frente.</strong> Sempre há um, marcado pela figura de pintura diferente ou pela ficha própria. É ele que executa a manobra e a ação da tropa inteira.</li>
                <li><strong>Formação.</strong> Depois da manobra, os outros soldados são recolocados encostados, ponta com ponta, a partir do soldado da frente: nunca à frente dele e no máximo duas posições para cada lado. Todos olham para a mesma direção. Quem não couber fica imprensado, ao lado da carta, e a tropa rola 1 dado de ataque e 1 de defesa a menos por soldado imprensado.</li>
                <li><strong>Combate.</strong> A tropa faz um único ataque, a partir do arco frontal do soldado da frente. Inimigos atacam qualquer soldado, com 1 dado de defesa a mais para cada soldado no caminho. Críticos atravessam a armadura, mas o dano entra virado para baixo, sem efeito crítico.</li>
                <li><strong>Baixas.</strong> Um soldado com cartas de dano iguais à Vida da tropa sai na hora, junto com a ficha do topo, e o dano dele não passa para os outros. Os imprensados morrem primeiro. O último soldado só sai na fase final.</li>
                <li><strong>Moral.</strong> Se o soldado da frente cai, o dono rola um dado de ataque por soldado restante, e cada crítico faz mais um soldado fugir. Depois escolhe o novo soldado da frente.</li>
                <li><strong>Ataques em área.</strong> Contra a tropa, um dado de ataque e um de defesa para o grupo inteiro. O dano vai para os soldados atingidos, um de cada vez, na ordem que o defensor quiser, e cada soldado precisa morrer antes do próximo receber dano.</li>
              </ul>
              <Tip kind="pratica">Efeitos aplicados a um soldado, como um escudo mágico ou o sono de um sopro, valem para a tropa toda.</Tip>
            </Section>

            <Section id="equipe" title="Equipes e obstáculos">
              <h3>Jogo em equipe</h3>
              <p>Cada equipe recebe os mesmos pontos de legião, não importa quantos jogadores tenha. Cada jogador controla as suas criaturas, mas efeitos em "aliados" valem para a equipe toda. A ficha de iniciativa pertence à equipe. Conversem à vontade, mas sempre em voz alta, e ninguém mostra o disco ao parceiro. Vencem e perdem juntos. Cartas únicas são uma por equipe, e Artefato de Campanha, um por equipe.</p>
              <h3>Obstáculos</h3>
              <p>Fichas de objetivo podem virar obstáculos: terrestres, aéreos ou dos dois níveis. Combinem os números antes, por exemplo 1 a 6 no chão, 7 a 9 nos dois níveis e 10 a 12 névoa que some ao ser revelada. Embaralhem com o número para baixo, distribuam o mesmo tanto para cada um e coloquem um de cada vez, começando por quem tem a criatura de maior nível. Nenhuma ficha fica a Alcance 1 a 3 da borda nem a Alcance 1 de outra ficha.</p>
              <ul className="rg-list">
                <li><strong>Passar por cima.</strong> A ficha é virada para cima, se ainda estava para baixo. Se for do nível da criatura, ela perde a ação da rodada e rola 1 dado de ataque contra si mesma: acerto ou crítico causam dano, que penetra a armadura. Terrestres atravessam sem teste de invasão, mas com essa penalidade.</li>
                <li><strong>Atacar através.</strong> Num ataque comum, se a régua passa sobre um obstáculo do mesmo nível de uma das criaturas, o defensor rola 1 dado de defesa a mais por obstáculo. Ataques em área ignoram isso.</li>
              </ul>
              <h3>Limites de componentes</h3>
              <p>Cartas, miniaturas, bases e fichas de objetivo são limitadas ao que você tem. As outras fichas podem ser trocadas por moedas ou marcadores. Se faltarem dados, anote o resultado e role de novo os que faltam. Se o baralho de dano acabar de vez, todo crítico vira acerto.</p>
            </Section>

            <Section id="resumo" title="Resumo para a mesa">
              <div className="rg-summary">
                <div>
                  <h3>1. Planejamento</h3>
                  <p>Disco de cada criatura, em segredo. Sem medir.</p>
                </div>
                <div>
                  <h3>2. Ativação (nível crescente)</h3>
                  <p>Revela, gabarito, move, exaustão (vermelha +1, verde −1), altitude, uma ação.</p>
                </div>
                <div>
                  <h3>3. Combate (nível decrescente)</h3>
                  <p>Investida, alvo, ataque, modifica, defesa, modifica, esquivas cancelam acertos e depois críticos, armadura para acertos, dano.</p>
                </div>
                <div>
                  <h3>4. Final</h3>
                  <p>Efeitos, derrotados saem, fichas de ação e pivô somem, −1 duração, iniciativa passa.</p>
                </div>
                <div>
                  <h3>Bônus de dados</h3>
                  <p>+1 defesa a Alcance 4. +1 ataque contra quem tem Pivô. +1 ataque no arco frontal depois da investida. +1 defesa por criatura terrestre no caminho (só entre terrestres) e por obstáculo.</p>
                </div>
                <div>
                  <h3>Lembretes</h3>
                  <p>Declare antes de medir. Exausto não faz ação nem vermelha. Derrota só na fase final. Carta vale mais que regra.</p>
                </div>
              </div>
              <p className="rg-source">
                Guia escrito para este portal a partir do livro de regras de D&D Attack Wing. Em caso de dúvida, vale o <a href={MANUAL} target="_blank" rel="noopener">livro original</a>. D&D Attack Wing é da WizKids e da Wizards of the Coast.
              </p>
            </Section>
          </article>
        </div>
      </div>
    </Shell>
  );
}
