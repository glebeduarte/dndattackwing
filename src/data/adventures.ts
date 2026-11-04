// Aventuras jogáveis. As duas primeiras vêm do livro de regras (páginas 34 a 38) e estão aqui como
// guias de mesa escritos com as nossas palavras: preparação, regras especiais, objetivos e recompensas.
// O texto narrativo original fica no livro, que o portal oferece para download.
// Novas aventuras entram nesta lista com o mesmo formato.

export interface Side {
  id: string;
  name: string; // nome do dragão ou da facção
  creatureUid?: number; // criatura obrigatória, se houver
  points: number;
  color: string; // cor no mapa
}

export interface Outcome {
  id: string; // "Depois da batalha 1"
  title: string;
  summary: string; // o que acontece, em uma ou duas frases nossas
  rewards: string[];
}

export interface MapSpec {
  // Coordenadas em centímetros numa área de 90 x 90.
  areas: { x: number; y: number; w: number; h: number; side: string; label: string }[];
  tokens: { x: number; y: number; label?: string }[];
  center?: boolean;
  walls?: { edge: 'N' | 'S' | 'E' | 'W' | 'all'; label: string; color: string; except?: string }[];
  note?: string;
}

export interface Adventure {
  slug: string;
  number: number;
  title: string;
  original: string;
  source: string;
  players: number;
  playArea: string;
  components: string[];
  sides: Side[];
  synopsis: string[];
  setup: string[];
  specialRules: { title: string; text: string }[];
  objectives: { side: string; text: string[] }[];
  outcomes: Outcome[];
  epilogue?: string;
  map: MapSpec;
  origin: 'livro' | 'portal';
}

export const CAMPAIGN_RULES = {
  title: 'Campanha do Cemitério Primordial',
  intro:
    'As aventuras do livro abrem a campanha do Cemitério Primordial, que continuou nas expansões do jogo. Dá para jogar cada aventura sozinha, como cenário, ou em sequência, como campanha. Na campanha, cada jogador escolhe um lado no começo de cada aventura e acumula pontos de experiência e artefatos.',
  rules: [
    { title: 'Diário de aventuras', text: 'Cada jogador anota quanta experiência (XP) ganhou e quais Artefatos de Campanha recebeu ao longo da campanha.' },
    { title: 'Gastar XP em pontos', text: 'No começo de cada aventura, 1 XP vira 1 Ponto de Legião extra. Gastar não consome a experiência: o total acumulado pode ser gasto de novo na aventura seguinte.' },
    { title: 'Gastar XP em slots', text: 'Cada slot de melhoria novo custa 2 XP. Ele repete um ícone que a criatura já tem, e cada criatura recebe no máximo 1 slot extra. A XP que sobrar pode virar pontos.' },
    { title: 'Repetir aventuras', text: 'Uma aventura pode ser jogada de novo para ver outros finais, mas cada jogador ganha XP e artefatos dela uma vez só e gasta XP numa única sessão dela.' },
    { title: 'Artefatos de Campanha', text: 'Só entram em jogo depois de conquistados. Em cada aventura o jogador pode levar um artefato que já ganhou, pagando o custo normal, sem repetir o mesmo artefato em sessões da mesma aventura. Em qualquer jogo vale o limite de 1 Artefato de Campanha por legião (ou por equipe).' },
    { title: 'Quem vence', text: 'Ao fim da campanha vence quem tiver mais XP no total. Vale jogar de novo trocando de lado.' },
  ],
  howTo: [
    'Combinem qual aventura vão jogar.',
    'Cada jogador monta a legião com os pontos e as cartas que a aventura indica, pelas regras de Construção de Legiões. A iniciativa segue a regra de quem gastou menos pontos.',
    'Façam a preparação normal do jogo, trocando o passo de posicionar as forças pela preparação da aventura.',
    'Leiam as regras especiais e os objetivos. As regras especiais valem acima de qualquer outra regra ou habilidade.',
    'Joguem rodadas normais até alguém cumprir o seu objetivo. Só vence quem cumpre o objetivo: derrotar todas as criaturas inimigas não basta, a menos que o objetivo diga isso.',
  ],
  playArea: 'As aventuras do livro funcionam melhor numa área de 90 x 90 cm.',
};

export const ADVENTURES: Adventure[] = [
  {
    slug: 'roubo-no-covil',
    number: 1,
    title: 'Roubo no covil',
    original: 'In for a Penny, In for a Pounding',
    source: 'Livro de regras, páginas 35 a 37',
    players: 2,
    playArea: '90 x 90 cm, que representa o salão do tesouro do covil de Balagos',
    components: ['5 fichas de objetivo, numeradas de 1 a 5', 'As cartas de melhoria Aerobat Amulet e Iron Tail Spike'],
    sides: [
      { id: 'galadaeros', name: 'Galadaeros', creatureUid: 105, points: 50, color: '#c8803e' },
      { id: 'eshaedra', name: 'Eshaedra', creatureUid: 103, points: 50, color: '#1f6fb5' },
    ],
    synopsis: [
      'Balagos, o dragão vermelho, aceita trabalhos por encomenda. Eshaedra, a dragoa azul, armou uma proposta falsa para tirá-lo do covil vulcânico e aproveitar a ausência para revirar o tesouro dele.',
      'Galadaeros, o dragão de cobre, vigiava o vizinho e teve a mesma ideia. Os dois se encontram lá dentro. Eshaedra pensa em culpá-lo pelo roubo e cobrar uma recompensa; Galadaeros não pode deixar que ela o siga até a própria casa, mas também não quer sair de mãos vazias.',
    ],
    setup: [
      'Galadaeros embaralha as 5 fichas de objetivo com o número virado para baixo.',
      'Sem olhar os números, Eshaedra coloca uma ficha no centro exato da área e as outras quatro a 15 cm dela, formando um X, todas à mesma distância umas das outras.',
      'Cada jogador coloca o seu dragão na própria área inicial, um quadrado de 15 x 15 cm num canto: Galadaeros no canto noroeste, Eshaedra no canto sudeste.',
      'Cada legião tem 50 pontos e usa o seu dragão.',
    ],
    specialRules: [
      { title: 'Paredes do covil', text: 'Todas as bordas da área, menos a área inicial de Eshaedra, são paredes. Um dragão que termina o movimento fora da área não é derrotado: volta para dentro, a até alcance 1 de onde bateu, virado para o centro. Nessa rodada ele não faz Ações e rola 2 dados de defesa a menos contra cada ataque.' },
      { title: 'A saída', text: 'A área inicial de Eshaedra é a saída do covil. Quando qualquer dragão sai por ela, o jogo acaba e os objetivos decidem quem venceu.' },
      { title: 'Ação: revirar o tesouro', text: 'A até alcance 1 de uma ficha de objetivo, o dragão pode usar a Ação para virá-la. Se não for a ficha 5, ele pega a ficha e a coloca na carta dele. Cada dragão carrega no máximo 2 fichas.' },
      { title: 'Ficha 5: armadilha de fogo', text: 'Quem vira a ficha 5 dispara uma armadilha: rola 3 dados de ataque vermelhos e sofre dano por acerto e por crítico, defendendo normalmente, mas sem a Armadura. Depois a ficha sai do jogo.' },
      { title: 'Fichas 1 e 2: artefatos', text: 'A ficha 1 é o Aerobat Amulet e a ficha 2 é o Iron Tail Spike. Quem pega uma delas recebe a carta de melhoria correspondente e já pode usá-la de graça, mesmo sem slot livre. As fichas 3 e 4 são baús que não mudam o jogo.' },
      { title: 'Largar o que pegou', text: 'Depois do movimento, sem gastar Ação, o dragão pode largar uma ficha logo atrás da base. Se sofrer 2 ou mais de dano de uma mesma fonte num turno, ele é obrigado a largar uma ficha à sua escolha. Uma ficha largada pode ser pega de novo depois, uma por Ação. Ao largar a ficha 1 ou 2, a carta do artefato também sai.' },
    ],
    objectives: [
      {
        side: 'Eshaedra',
        text: [
          'Vence se derrotar Galadaeros (depois da batalha 1).',
          'Vence se tiver 3 ou mais de Vida quando Galadaeros escapar do salão (depois da batalha 2).',
          'Se ela própria sair pela saída, fracassa na hora (depois da batalha 3).',
        ],
      },
      {
        side: 'Galadaeros',
        text: [
          'Vence se escapar pela saída enquanto Eshaedra tem 1 ou 2 de Vida (depois da batalha 4).',
          'Também vence se derrotar Eshaedra (depois da batalha 5).',
          'Se sair enquanto Eshaedra ainda tem 3 ou mais de Vida, é derrotado e perde as melhorias que pegou.',
        ],
      },
      { side: 'Empate', text: ['Se os dois forem derrotados, ninguém ganha carta de melhoria. Joguem de novo antes de seguir para a próxima aventura.'] },
    ],
    outcomes: [
      { id: '1', title: 'Eshaedra derrota Galadaeros', summary: 'Ela descansa no salão à espera da recompensa, e o rival ferido escapa sem ser notado enquanto ela dorme.', rewards: ['Eshaedra: 1 XP', 'Eshaedra escolhe Aerobat Amulet ou Iron Tail Spike'] },
      { id: '2', title: 'Galadaeros foge, Eshaedra inteira', summary: 'Uma armadilha de pedra prende o dragão de cobre por um tempo, mas ele escapa enquanto ela procura algo no tesouro.', rewards: ['Eshaedra: 1 XP', 'Eshaedra escolhe Aerobat Amulet ou Iron Tail Spike'] },
      { id: '3', title: 'Eshaedra sai pela saída', summary: 'A armadilha de pedra pega a dragoa azul, e Galadaeros sai com o item que queria.', rewards: ['Galadaeros: 1 XP', 'Galadaeros escolhe Aerobat Amulet ou Iron Tail Spike'] },
      { id: '4', title: 'Galadaeros foge, Eshaedra ferida', summary: 'Ele dispara a armadilha atrás de si e some na noite; ela, ferida demais, só quer ir embora antes que o dono volte.', rewards: ['Galadaeros: 1 XP', 'Se pegou um dos dois artefatos, Galadaeros fica com um deles'] },
      { id: '5', title: 'Galadaeros derrota Eshaedra', summary: 'O dragão de cobre recolhe o que pode e parte; a rival sobrevive por pouco e se arrasta para fora do covil.', rewards: ['Galadaeros: 1 XP', 'Galadaeros escolhe Aerobat Amulet ou Iron Tail Spike'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 15, h: 15, side: 'galadaeros', label: 'Galadaeros' },
        { x: 75, y: 75, w: 15, h: 15, side: 'eshaedra', label: 'Eshaedra (saída)' },
      ],
      tokens: [
        { x: 45, y: 45 },
        { x: 34.4, y: 34.4 },
        { x: 55.6, y: 34.4 },
        { x: 34.4, y: 55.6 },
        { x: 55.6, y: 55.6 },
      ],
      walls: [{ edge: 'all', label: 'Paredes do covil', color: '#b4467a', except: 'eshaedra' }],
      note: 'As cinco fichas formam um X: uma no centro e quatro a 15 cm dela.',
    },
    origin: 'livro',
  },
  {
    slug: 'emboscada-no-vale',
    number: 2,
    title: 'Emboscada no vale',
    original: 'Ambush in the Valley',
    source: 'Livro de regras, páginas 37 e 38',
    players: 3,
    playArea: '90 x 90 cm, um campo de gêiseres na cratera de um vulcão adormecido',
    components: ['12 fichas de objetivo (os gêiseres)', '1 ficha de aventura (o marcador do centro)', 'A carta de melhoria Ring of Swift Breath'],
    sides: [
      { id: 'balagos', name: 'Balagos', creatureUid: 101, points: 55, color: '#c0282d' },
      { id: 'eshaedra', name: 'Eshaedra', creatureUid: 103, points: 55, color: '#1f6fb5' },
      { id: 'galadaeros', name: 'Galadaeros', creatureUid: 105, points: 55, color: '#c8803e' },
    ],
    synopsis: [
      'Balagos descobriu quem invadiu o covil. Pressionou Eshaedra a ajudá-lo a punir Galadaeros, que vai esperar dois dragões metálicos mais velhos num campo de gêiseres, numa cratera, depois do pôr do sol.',
      'Balagos quer Galadaeros morto, e se Eshaedra cair junto, melhor. Eshaedra também quer o dragão de cobre morto, mas aceitaria a morte de Balagos, que descobriu o covil dela e ameaçou seus ovos; só que ela não ataca o vermelho sem ser atacada ou sem ter certeza de acabar com ele. Galadaeros só precisa sobreviver até os aliados chegarem. Nenhum deles sabe que os gêiseres costumam explodir sem aviso antes do anoitecer.',
    ],
    setup: [
      'Cada legião tem 55 pontos e usa o seu dragão.',
      'Quem ganhou um Artefato de Campanha na aventura anterior pode equipá-lo pagando o custo normal. Se o Aerobat Amulet ou o Iron Tail Spike ficou no covil de Balagos, o dragão vermelho pode equipar um deles à sua escolha.',
      'Coloquem a ficha de aventura no centro exato da área. Ela marca o centro e não pode ser coberta por fichas de objetivo.',
      'Em ordem de Nível, do maior para o menor, os jogadores se revezam colocando as 12 fichas de objetivo (os gêiseres), cada uma a pelo menos 15 cm das bordas e a 7,5 cm de qualquer outra ficha.',
      'Ao colocar cada ficha, rolem um dado de ataque. Num resultado de olho, o gêiser está ativo: vira um Obstáculo para o solo e para o ar, e o dano que ele causa penetra a Armadura. Virem os ativos com o número para cima; os outros ficam virados para baixo como gêiseres adormecidos, que não são obstáculos.',
      'Posicionem os dragões pela preparação padrão para 3 jogadores, com Galadaeros na posição do jogador 1.',
    ],
    specialRules: [
      { title: 'Fugir do campo', text: 'Vale a regra normal: o dragão que termina o movimento fora da borda é derrotado, a menos que já tenha cumprido o objetivo. A exceção é a borda oeste, oposta a Galadaeros, que é um penhasco.' },
      { title: 'O penhasco', text: 'Quem termina o movimento na borda oeste perde todas as Ações da rodada, volta virado para o centro a até alcance 1 do ponto de contato e rola 2 dados de defesa a menos contra cada ataque até o fim da rodada.' },
      { title: 'O tempo passa', text: 'Em cada Fase Final, o jogador cujo dragão está mais perto do centro escolhe uma ficha de objetivo para tirar do jogo. Se dois estiverem empatados, o terceiro jogador escolhe, mesmo que já tenha sido derrotado.' },
      { title: 'Erupções', text: 'Se ainda restarem 2 ou mais fichas, rolem um dado de ataque para cada gêiser adormecido. Num olho, ele entra em atividade e é virado. Um gêiser que desperta embaixo de um dragão causa 1 de dano normal, que penetra a Armadura, e dá a ele uma ficha de Exaustão.' },
      { title: 'A chegada da ajuda', text: 'Quando sobrar só 1 ficha de objetivo, os dragões que Galadaeros espera chegam e a aventura acaba. Confiram os objetivos.' },
      { title: 'A trégua de Eshaedra', text: 'Eshaedra não pode atacar Balagos, a menos que ele a ataque primeiro, que ele esteja com 3 ou menos de Vida, ou que restem 7 ou menos fichas de objetivo.' },
    ],
    objectives: [
      {
        side: 'Balagos',
        text: [
          'Vitória total se os outros dois forem derrotados e ele sair pela borda norte, sul ou leste antes do fim (depois da batalha 1).',
          'Vitória parcial se só Galadaeros for derrotado e ele sair antes do fim (depois da batalha 2).',
          'Se ainda estiver no campo quando o tempo acabar, ou sair antes de Galadaeros morrer, é derrotado.',
        ],
      },
      {
        side: 'Eshaedra',
        text: [
          'Vitória total se os outros dois forem derrotados e ela sair do campo antes do fim (depois da batalha 3).',
          'Vitória parcial se sair depois que um dos outros for derrotado e antes do fim (depois da batalha 2 se foi Galadaeros, 4 se foi Balagos).',
          'Caso contrário, é derrotada.',
        ],
      },
      {
        side: 'Galadaeros',
        text: [
          'Vitória total se Eshaedra estiver derrotada ou ainda no campo e ele estiver vivo quando a ajuda chegar (depois da batalha 5).',
          'Vitória parcial se sobreviver e só Balagos for derrotado, ou, mesmo derrotado, se os outros dois forem derrotados de qualquer forma (depois da batalha 6).',
          'Caso contrário, perde a aventura.',
        ],
      },
      { side: 'Atenção', text: ['Mais de um dragão pode conseguir uma vitória parcial na mesma partida.'] },
    ],
    outcomes: [
      { id: '1', title: 'Vitória total de Balagos', summary: 'O vermelho se vinga, sai com tempo de sobra e ainda acha um anel mágico perto de um dos gêiseres.', rewards: ['Balagos: 2 XP', 'Balagos recebe o Ring of Swift Breath'] },
      { id: '2', title: 'Galadaeros cai, os dois saem', summary: 'Balagos e Eshaedra se separam em silêncio, cada um vigiando o outro até sumirem no horizonte.', rewards: ['Balagos: 1 XP', 'Eshaedra: 1 XP'] },
      { id: '3', title: 'Vitória total de Eshaedra', summary: 'A azul agradece a Tiamat pela morte dos dois rivais e leva o anel que um gêiser jogou na direção dela.', rewards: ['Eshaedra: 2 XP', 'Eshaedra recebe o Ring of Swift Breath'] },
      { id: '4', title: 'Balagos cai, Eshaedra sai', summary: 'Livre da ameaça aos seus ovos, Eshaedra planeja tomar o tesouro do vermelho; Galadaeros vê a azul escapar, mas os aliados que chegam trazem notícias mais urgentes.', rewards: ['Eshaedra: 1 XP', 'Galadaeros: 1 XP', 'Leiam o desfecho da campanha'] },
      { id: '5', title: 'Vitória total de Galadaeros', summary: 'A anciã de bronze Quelindritar chega, cuida dos ferimentos do dragão de cobre e recompensa a sua coragem.', rewards: ['Galadaeros: 2 XP', 'Galadaeros recebe o Ring of Swift Breath', 'Leiam o desfecho da campanha'] },
      { id: '6', title: 'Vitória parcial de Galadaeros', summary: 'Os dragões metálicos cuidam do cobre e garantem que os agressores saiam apenas feridos; Quelindritar tem uma missão para ele.', rewards: ['Galadaeros: 1 XP', 'Leiam o desfecho da campanha'] },
    ],
    epilogue:
      'Desfecho (depois da batalha 7): Quelindritar conta a Galadaeros que dragões malignos ligados a Tiamat podem estar atrás do Cemitério Primordial, o lugar sagrado onde os dragões antigos foram morrer e guardaram suas relíquias. Ninguém sabe onde ele fica. Galadaeros, chamado de Chama do Poente, recebe a missão de encontrá-lo em segredo antes dos inimigos e proteger as relíquias.',
    map: {
      areas: [
        { x: 0, y: 4, w: 15, h: 15, side: 'balagos', label: 'Balagos' },
        { x: 0, y: 71, w: 15, h: 15, side: 'eshaedra', label: 'Eshaedra' },
        { x: 75, y: 37.5, w: 15, h: 15, side: 'galadaeros', label: 'Galadaeros' },
      ],
      tokens: [
        { x: 30, y: 26 }, { x: 52, y: 22 }, { x: 66, y: 30 }, { x: 24, y: 44 }, { x: 40, y: 36 },
        { x: 58, y: 44 }, { x: 33, y: 58 }, { x: 50, y: 56 }, { x: 64, y: 62 }, { x: 26, y: 70 },
        { x: 44, y: 70 }, { x: 58, y: 74 },
      ],
      center: true,
      walls: [{ edge: 'W', label: 'Penhasco', color: '#3f8a4a' }],
      note: 'Os jogadores escolhem onde ficam os gêiseres; o mapa mostra uma distribuição possível.',
    },
    origin: 'livro',
  },
];

export const adventureBySlug = (slug: string) => ADVENTURES.find((a) => a.slug === slug);
