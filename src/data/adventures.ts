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
  requires?: string; // o que a legião deste lado precisa ter
  suggested?: { code: string; total: number; list: string[]; note?: string };
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
  terrain?: { kind: 'lava' | 'bridge' | 'pillar' | 'ash' | 'river' | 'road' | 'wagon' | 'grove' | 'ruin' | 'portal' | 'mask'; x: number; y: number; w: number; h: number; label: string }[];
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
  campaign?: string; // slug da campanha; ausente = aventura avulsa
  chapter?: number;
  theme?: string; // uma linha sobre o clima da aventura
  tokenSheet?: string; // PDF com os terrenos para imprimir
  hero?: string; // imagem do topo da página (proporção 16:5)
  heroPosition?: string;
}

/* Capítulo listado na campanha cujo guia ainda não foi escrito. */
export interface PlannedChapter {
  code: string; // "3.1"
  title: string;
  expansion: string;
  wave: string;
  artifacts: { name: string; uid: number }[];
  premise?: string; // premissa oficial, quando a WizKids publicou
}

export interface Campaign {
  slug: string;
  planned?: PlannedChapter[];
  title: string;
  original: string;
  source: string;
  summary: string;
  status: string;
  pending?: string;
}

export const CAMPAIGNS: Campaign[] = [
  {
    slug: 'cemiterio-primordial',
    title: 'O Cemitério Primordial',
    original: 'The Primordial Graveyard',
    source: 'Livro de regras de D&D Attack Wing e expansões',
    summary:
      'A campanha que abre o jogo. Uma rixa entre três dragões da caixa básica, um roubo e uma emboscada, termina com o dragão de cobre recebendo uma missão maior: achar o lugar sagrado onde os dragões antigos guardaram suas relíquias antes que os servos de Tiamat cheguem lá.',
    status: '21 capítulos, todos com guia completo',
    pending: 'Os capítulos seguintes vinham nos livretos das expansões. Cada um entra aqui com o guia completo assim que o texto da aventura estiver disponível.',
    planned: [
    ],
  },
  {
    slug: 'mal-elemental',
    title: 'O Mal Elemental',
    original: 'Elemental Evil',
    source: 'Livretos de aventura das expansões da Onda 6',
    summary: 'A segunda campanha. Os quatro cultos elementais, servos dos príncipes do Mal Elemental, se escondem em fortalezas disfarçadas, e as facções do bem (Ordem da Manopla, Enclave Esmeralda, Aliança dos Lordes e Harpistas) atacam uma por uma, enquanto Quelindritar junta os heróis para um golpe decisivo.',
    status: '4 capítulos, todos com guia completo',
    planned: [
    ],
  },
];

export const CAMPAIGN_RULES = {
  title: 'Como funcionam as campanhas',
  intro:
    'Dá para jogar cada aventura sozinha, como cenário, ou em sequência, como campanha. Na campanha, cada jogador escolhe um lado no começo de cada aventura e acumula pontos de experiência e artefatos. As aventuras avulsas do portal também dão XP e podem entrar entre os capítulos de uma campanha.',
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
    campaign: 'cemiterio-primordial',
    chapter: 1,
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
    campaign: 'cemiterio-primordial',
    chapter: 2,
  },
  {
    slug: 'dominio-da-rainha-verde',
    number: 3.1,
    title: 'O domínio da Rainha Verde',
    original: "The Green Queen's Demesne",
    source: 'Livreto da expansão Green Dragon (Onda 1), aventura 3.1',
    players: 2,
    playArea: '90 x 90 cm, o bosque central da floresta de Claugiyliamatar',
    components: ['3 fichas de aventura', '9 fichas de objetivo, numeradas de 1 a 9 (as árvores)', 'A carta de melhoria Tome of Naming'],
    sides: [
      { id: 'claug', name: 'Claugiyliamatar', creatureUid: 401, points: 45, color: '#3f8a4a', requires: 'Claugiyliamatar e melhorias' },
      { id: 'invasores', name: 'Invasores', points: 60, color: '#d9822b', requires: 'Quaisquer outras criaturas e melhorias' },
    ],
    synopsis: [
      'A dragoa verde Claugiyliamatar governa a floresta, e cada pássaro, cobra ou cipó trabalha como olho dela. A criatura favorita da corte é Legunt, um velho hobgoblin que ela chama de Arquivista Real. Ele sai da mata para roubar livros e lê para ela em voz alta, soletrando palavras que quase nunca entende.',
      'Correu a notícia de que Legunt trouxe um tomo que cita o nome de um Lugar do Conhecimento. Desde então, grupos de forasteiros entram na floresta atrás do hobgoblin ou do livro, mesmo sabendo que vão enfrentar uma dragoa dentro do próprio covil. Claugiyliamatar está à espera deles.',
    ],
    setup: [
      'Claugiyliamatar monta a legião com 45 pontos, com ela e melhorias. Os Invasores montam a legião com 60 pontos, com quaisquer outras criaturas e melhorias.',
      'As 3 fichas de aventura ficam fora da área de jogo.',
      'Claugiyliamatar coloca as 9 fichas de objetivo com o número virado para baixo, na ordem que quiser: uma no centro e as outras em grade, a 23 cm (9") umas das outras e a 15 cm (6") das bordas. Cada ficha é uma árvore grande e conta como Obstáculo de solo.',
      'Ela pode anotar num papel onde ficou cada número e pode espiar qualquer ficha a qualquer momento, devolvendo-a virada para baixo no mesmo lugar.',
      'As criaturas entram em ordem crescente de Nível, como de costume. Os Invasores ficam a até 15 cm da borda sul. Claugiyliamatar começa em qualquer ponto a até alcance 1 da ficha central.',
    ],
    specialRules: [
      { title: 'O que há em cada árvore', text: 'As árvores 1 a 3 escondem armadilhas de cipó, as árvores 4 a 6 escondem armadilhas de espinhos envenenados, e as árvores 7 a 9 guardam pistas que os Invasores procuram.' },
      { title: 'Armadilha de cipó (árvores 1 a 3)', text: 'Quando Claugiyliamatar for a criatura ativa na Fase de Combate, ela pode fazer este ataque grátis, antes ou depois do ataque normal, contra uma criatura voadora dos Invasores a alcance 1 ou 2 de uma das fichas 1 a 3. Ela vira a ficha e rola 3 dados de ataque, que penetram a Armadura. Se sobrar pelo menos um acerto ou crítico sem cancelar, a criatura não sofre dano, mas cai no solo e recebe uma ficha de Exaustão. Cada crítico que passar ainda causa 1 de dano normal.' },
      { title: 'Armadilha de espinhos (árvores 4 a 6)', text: 'Como alternativa, o ataque grátis pode ser feito contra uma criatura dos Invasores no solo a alcance 1 ou 2 de uma das fichas 4 a 6. Ela vira a ficha e rola 4 dados de ataque. O alvo defende normalmente e pode usar a Armadura. Acertos e críticos causam dano normal.' },
      { title: 'Uma armadilha por vez', text: 'Cada ficha só serve para um ataque desses se estava com o número virado para baixo no começo da rodada. Claugiyliamatar faz no máximo um ataque grátis de armadilha por rodada.' },
      { title: 'Ação: vasculhar a árvore', text: 'Uma criatura dos Invasores no solo, a alcance 1 de uma ficha virada para baixo, pode usar a Ação para virá-la. As fichas 1 a 6 reveladas deixam de servir para armadilhas. Nas fichas 7 a 9, a criatura coloca 1 ficha de aventura na própria carta.' },
      { title: 'Pistas caídas', text: 'Se a criatura que carrega uma ficha de aventura for derrotada, o dono coloca a ficha em qualquer ponto a alcance 1 de onde ela caiu, desde que fique toda dentro da área. Uma criatura aliada a alcance 1 pode recolhê-la com a Ação.' },
    ],
    objectives: [
      { side: 'Invasores', text: [
        'Vencem se derrotarem Claugiyliamatar (depois da batalha 1).',
        'Também vencem se uma ou mais criaturas deles saírem da área de jogo levando, somadas, 2 ou mais fichas de aventura (depois da batalha 2).',
      ] },
      { side: 'Claugiyliamatar', text: ['Vence se derrotar Invasores suficientes para que eles não consigam mais fugir com as fichas de aventura necessárias (depois da batalha 3).'] },
    ],
    outcomes: [
      { id: '1', title: 'A dragoa cai', summary: 'Claugiyliamatar acorda com um cervo lambendo o seu rosto. Ferida, ela entende que outros já vieram e morreram ali por causa do tomo de Legunt, que cita o "Baronato Inferior" e deve ter relação com a busca pelo Cemitério Primordial. Quando se recupera, come o cervo.', rewards: ['Invasores: 1 XP', 'Invasores recebem o Tome of Naming'] },
      { id: '2', title: 'Os Invasores fogem com as pistas', summary: 'A dragoa ruge, mais com raiva de si mesma. Depois de tantos grupos fracos, era questão de tempo até chegar um mais forte. Ela também conclui que o "Baronato Inferior" citado no tomo guarda algo ligado ao Cemitério Primordial.', rewards: ['Invasores: 1 XP', 'Invasores recebem o Tome of Naming'] },
      { id: '3', title: 'A Rainha Verde defende a floresta', summary: 'Claugiyliamatar repara que os intrusos nunca foram atrás do tesouro dela, só das árvores do bosque central onde guarda os livros. O mais recente era o Tomo de Nomes, que fala do "Baronato Inferior". Ela decide lê-lo sozinha, sem depender do pobre Legunt.', rewards: ['Claugiyliamatar: 1 XP', 'Claugiyliamatar recebe o Tome of Naming'] },
    ],
    map: {
      areas: [
        { x: 0, y: 75, w: 90, h: 15, side: 'invasores', label: 'Invasores (borda sul)' },
      ],
      tokens: [
        { x: 22, y: 22 }, { x: 45, y: 22 }, { x: 68, y: 22 },
        { x: 22, y: 45 }, { x: 45, y: 45, label: 'centro' }, { x: 68, y: 45 },
        { x: 22, y: 68 }, { x: 45, y: 68 }, { x: 68, y: 68 },
      ],
      note: 'As nove fichas são árvores. Claugiyliamatar escolhe a ordem dos números em segredo e começa a alcance 1 da árvore central.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 3.1,
    theme: 'Caça às pistas numa floresta cheia de armadilhas, com a dona da casa vigiando cada árvore.',
  },
  {
    slug: 'baronato-inferior',
    number: 3.2,
    title: 'O Baronato Inferior',
    original: 'The Barony Below',
    source: 'Livreto da expansão Wraith (Onda 1), aventura 3.2',
    players: 2,
    playArea: '90 x 90 cm, o grande salão de um palácio em ruínas, debaixo da terra',
    components: ['2 fichas de torre de castelo', '3 fichas de muralha de castelo', '4 fichas de objetivo', '5 fichas de aventura', 'A carta de melhoria Chisel'],
    sides: [
      { id: 'invasores', name: 'Invasores', points: 120, color: '#3f8a4a', requires: 'Criaturas e melhorias, com o Artefato de Campanha Chisel obrigatório' },
      { id: 'maximilian', name: 'Lorde Maximilian', creatureUid: 801, points: 90, color: '#55505a', requires: 'Lord Maximilian, 1 Wraith e melhorias, sem Create Spawn' },
    ],
    synopsis: [
      'Debaixo de uma planície poeirenta estão os restos de um principado esquecido, que os mais ousados chamam de Baronato Inferior. Na superfície, Lorde Maximilian virou uma história que os pais contam para assustar as crianças. As que crescem e descem até lá descobrem tarde demais que ele existe. Ele quase não sai do palácio afundado onde foi um cortesão importante, porque ali, entre as coisas que eram dele, às vezes consegue se lembrar.',
      'Agora o Baronato está sob ataque. Os servos mortos-vivos do Espectro Terrível defendem a parte de fora do palácio, mas um grupo atrás de conhecimento passou por eles e chegou ao grande salão. Eles trazem um objeto que pode ajudar a dominar Maximilian, e isso não vai ser fácil.',
    ],
    setup: [
      'Os Invasores montam a legião com 120 pontos e precisam incluir o Artefato de Campanha Chisel. Ele pode ocupar qualquer slot de melhoria, mas o texto dele só funciona num slot de Equipamento.',
      'Lorde Maximilian monta a legião com 90 pontos: ele, 1 Wraith e melhorias. Create Spawn não pode entrar.',
      'Os Invasores seguram juntas todas as fichas dos componentes especiais e as soltam ao mesmo tempo, de pelo menos 60 cm (2 pés) acima do centro da área. As que caírem fora ou quicarem para fora são recolhidas por Maximilian, que as coloca onde quiser dentro da área.',
      'As fichas são escombros do palácio. As que ficam deitadas na mesa são Obstáculos de solo. As que ficam total ou parcialmente por cima de outras são Obstáculos de solo e de ar. As fichas de aventura e de objetivo também são só escombros.',
      'O dano por atravessar esses obstáculos não penetra a Armadura, mas os críticos ignoram a Armadura como de costume.',
      'Os jogadores posicionam as criaturas em bordas opostas, pela preparação padrão para 2 jogadores: os Invasores na borda norte e Maximilian na borda sul.',
    ],
    specialRules: [
      { title: 'Paredes do palácio', text: 'A luta é dentro de um palácio murado, mas a criatura que sai pela borda é derrotada pela regra normal: ela passou por uma parede ou janela quebrada.' },
      { title: 'A passagem do espectro', text: 'Uma vez por partida, se Lorde Maximilian sair da área, ele reaparece na parede oposta, à mesma distância da borda vizinha mais próxima, virado para o centro, e recebe uma ficha de Exaustão na hora.' },
      { title: 'Ele não morre', text: 'Nesta aventura Lorde Maximilian não cai abaixo de 1 de Vida. Quando estiver com 1 de Vida, as Cartas de Dano seguintes que ele receber ficam com a face para cima.' },
      { title: 'Ação: mostrar a Espada a Maximilian', text: 'Quando Lorde Maximilian estiver com 1 de Vida, a criatura que carrega o Chisel pode usar a Ação para "mostrar a Espada a Maximilian", se ele estiver a alcance 2 e no arco frontal dela.' },
      { title: 'O Chisel não sai', text: 'O Chisel não pode ser retirado do jogo, mesmo que o dono receba o efeito crítico Desarmado.' },
    ],
    objectives: [
      { side: 'Invasores', text: ['Vencem se "mostrarem a Espada a Maximilian" como descrito nas regras especiais (depois da batalha 1).'] },
      { side: 'Lorde Maximilian', text: ['Vence no momento em que a criatura que carrega o Chisel for derrotada (depois da batalha 2).'] },
    ],
    outcomes: [
      { id: '1', title: 'A Espada é mostrada', summary: 'O salão fica em silêncio, e até a luta do lado de fora para. Os espectros se juntam no grande salão, e Maximilian fala numa língua esquecida que todos conseguem entender. Ele agradece por terem devolvido um velho amigo. Se algum invasor sobreviveu, leiam também o final 3.', rewards: ['Invasores: 1 XP', 'Invasores podem ficar com o Chisel'] },
      { id: '2', title: 'O portador cai', summary: 'Com o inimigo no chão, Maximilian diz a Palavra Antiga e o Chisel voa para a mão fantasmagórica dele. Num clarão, todos ficam paralisados enquanto imagens invadem a mente deles. Se algum invasor sobreviveu, leiam também o final 3.', rewards: ['Lorde Maximilian: 1 XP', 'Lorde Maximilian pode ficar com o Chisel'] },
      { id: '3', title: 'A memória de Maximilian', summary: 'Maximilian conta que foi soldado e escultor, contratado pelo Rei Opalino para erguer um monumento ao Guardião do Cemitério Primordial, Luminos V, o Poderoso. Ele lembra que já foi bom e famoso, mas as lembranças estão sumindo, e pede que os visitantes partam em paz e sem demora. Ele e os espectros se desfazem em névoa negra, e os invasores saem antes que ela volte a se juntar, satisfeitos com o que vieram buscar.', rewards: ['Sem recompensa extra: este final completa o 1 ou o 2'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 10, side: 'invasores', label: 'Invasores' },
        { x: 0, y: 80, w: 90, h: 10, side: 'maximilian', label: 'Lorde Maximilian' },
      ],
      tokens: [
        { x: 18, y: 32 }, { x: 34, y: 25 }, { x: 46, y: 36 }, { x: 62, y: 30 }, { x: 72, y: 52 },
        { x: 28, y: 52 }, { x: 40, y: 58 }, { x: 52, y: 50 }, { x: 58, y: 64 }, { x: 64, y: 70 }, { x: 47, y: 14 },
      ],
      walls: [{ edge: 'all', label: 'Paredes do palácio', color: '#55505a' }],
      note: 'Todas as fichas são escombros: a posição de cada uma sai de onde caiu ao serem soltas sobre a mesa. O mapa mostra uma queda possível.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 3.2,
    theme: 'Luta dentro de um palácio em ruínas contra um espectro que só cede quando lembra quem foi.',
  },
  {
    slug: 'o-toque-do-alarme-terrivel',
    number: 3.3,
    title: 'O toque do Alarme Terrível',
    original: 'The Toll of the Dread Alarum',
    source: 'Livreto da expansão Sun Elf Wizard (Onda 1), aventura 3.3',
    players: 2,
    playArea: '90 x 90 cm, a vila de Auvandell, com a fortaleza anã no centro',
    components: ['2 fichas de torre de castelo', '5 fichas de fortificação retas (1 portão e 4 muralhas)', '12 fichas de dano da fortaleza', '5 fichas de objetivo', '9 fichas de aventura', 'A carta de melhoria Elixir of Healing'],
    sides: [
      { id: 'bem', name: 'Forças do Bem', points: 100, color: '#a77bd1', requires: 'Nymmestra, Galadaeros e melhorias' },
      { id: 'mal', name: 'Forças do Mal', points: 100, color: '#c0282d', requires: 'Quaisquer criaturas Neutras ou Malignas e melhorias' },
    ],
    synopsis: [
      'Do outro lado das Montanhas Nether, longe de Lua Prateada, fica Auvandell, uma vila de fazendeiros que já viu muitas batalhas. As montanhas separam a vila da cidade, mas existe um sino encantado em Auvandell que, quando toca, faz tocar o sino irmão em Lua Prateada. Faz tanto tempo que ninguém usa esse alarme que quase todos esqueceram o que ele significa.',
      'Dois ainda sabem: Nymmestra, maga dos elfos do sol que mantém um gabinete de estudos em Lua Prateada, e Galadaeros, o dragão de cobre, que está em busca do Cemitério Primordial. Quando o Alarme Terrível toca, os dois ouvem e entendem. Um exército se aproxima, e eles vão descobrir qual.',
    ],
    setup: [
      'Cada lado monta a legião com 100 pontos. As Forças do Bem usam Nymmestra, Galadaeros e melhorias. As Forças do Mal usam quaisquer criaturas Neutras ou Malignas e melhorias. Podem ser 2 jogadores ou 2 equipes.',
      'Montem a fortaleza anã no centro da borda sul, como no mapa: ela ocupa 30 x 30 cm, a 30 cm de cada lateral. As 2 torres ficam nos cantos do lado norte, o portão fica entre elas e as muralhas fecham o resto, sem buracos, de torre a torre e de torre até a borda sul.',
      'As torres, as muralhas e o portão são Obstáculos de solo. A área de dentro representa o telhado e os parapeitos da fortaleza.',
      'Galadaeros e Nymmestra começam em qualquer ponto do telhado da fortaleza. As Forças do Mal começam a até 15 cm da borda norte.',
      'Deixem as 9 fichas de aventura ao lado da área para marcar o tempo, e as 5 fichas de objetivo perto da fortaleza para contar os pontos dos invasores.',
    ],
    specialRules: [
      { title: 'O telhado', text: 'Toda criatura no telhado da fortaleza conta como estando no ar, mesmo sem voar. O telhado dá cobertura parcial: quem está nele rola +1 dado de defesa contra atacantes voadores cujo ataque passa por cima das fortificações e +2 contra atacantes no solo cujo ataque à distância passa por elas. Duas criaturas no telhado não ganham esse bônus uma contra a outra.' },
      { title: 'Corpo a corpo e alcance', text: 'Criaturas no solo não fazem ataques corpo a corpo contra quem está no telhado, e quem está no telhado em terra não faz ataques corpo a corpo contra quem está fora. Ataques à distância saindo do telhado não sofrem penalidade.' },
      { title: 'Entrar e sair', text: 'Criaturas no solo não entram na fortaleza: se terminarem o movimento sobre ela, recuam. Criaturas voadoras passam por cima livremente e podem pousar no telhado depois de se mover. Quem está no telhado em terra pode descer para o solo do lado de fora e recebe uma ficha de Exaustão por isso.' },
      { title: 'Atacar a fortaleza', text: 'De fora, dá para atacar o portão, as muralhas e as torres, que contam como "criaturas" no solo para o texto das cartas, mas são imunes a efeitos críticos e a dano de Veneno. Um marcador de Estouro colocado do lado de fora conta como ataque vindo de fora.' },
      { title: 'Valor de Fortificação', text: 'Cada parte tem um Valor de Fortificação (VF), que funciona como Armadura, mas também desvia ataques que normalmente penetram Armadura, como Fire Breath ou Ice Storm. Críticos ainda ignoram o VF. O portão tem VF 1 e aguenta 4 de dano antes de ser rompido. Cada muralha tem VF 2 e aguenta 5. Cada torre tem VF 3 e aguenta 6 antes de desabar. Marquem o dano de cada parte com as fichas de dano da fortaleza.' },
      { title: 'A brecha', text: 'Depois que o portão ou uma muralha for rompido, cada ataque feito através da brecha dá 1 ficha de objetivo às Forças do Mal. Um ataque de Cone ou de Estouro capaz de causar dano dá 2 fichas.' },
      { title: 'O tempo passa', text: 'Em cada Fase Final, tirem 1 ficha de aventura do jogo.' },
    ],
    objectives: [
      { side: 'Forças do Mal', text: ['Vencem se uma torre desabar ou se juntarem 5 fichas de objetivo (depois da batalha 1).'] },
      { side: 'Forças do Bem', text: ['Vencem se todas as Forças do Mal forem destruídas ou se a nona ficha de aventura sair do jogo antes de o Mal vencer. Nymmestra e Galadaeros seguraram a fortaleza até as tropas de Lua Prateada chegarem (depois da batalha 2).'] },
    ],
    outcomes: [
      { id: '1', title: 'A fortaleza cai', summary: 'No meio dos escombros, as tropas de Lua Prateada acham a maga e o dragão ainda vivos. Os atacantes já foram embora. Nymmestra não sabe se foi um saque a uma vila indefesa ou o primeiro passo de uma guerra maior, mas sabe que a fortaleza precisa ser reconstruída logo, porque guarda a passagem secreta para a biblioteca dela em Lua Prateada.', rewards: ['Forças do Mal: 1 XP', 'Forças do Mal encontram o Elixir of Healing debaixo de um silo virado'] },
      { id: '2', title: 'A fortaleza resiste', summary: 'Enquanto cuidam dos ferimentos, Nymmestra agradece aos deuses pela presença de Galadaeros e se pergunta o que ele faz tão longe de casa. Ela não pergunta, porque dragões guardam seus segredos. Prefere dizer que deve um favor a ele e oferecer ajuda. Assim nasce a aliança: ela fica sabendo da missão do dragão de cobre e jura acompanhá-lo nas próximas aventuras.', rewards: ['Forças do Bem: 1 XP', 'Forças do Bem encontram o Elixir of Healing debaixo de um silo virado'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'mal', label: 'Forças do Mal' },
        { x: 30, y: 60, w: 30, h: 30, side: 'bem', label: 'Fortaleza (telhado)' },
      ],
      tokens: [{ x: 32, y: 61, label: 'torre' }, { x: 58, y: 61, label: 'torre' }, { x: 45, y: 60, label: 'portão' }],
      note: 'A fortaleza tem 30 x 30 cm, encostada na borda sul e a 30 cm de cada lateral. Torres nos cantos do norte, portão entre elas, muralhas no resto do contorno.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 3.3,
    theme: 'Defesa de uma fortaleza com contagem regressiva até a chegada dos reforços.',
  },
  {
    slug: 'cacada-grossa',
    number: 3.4,
    title: 'Caçada grossa',
    original: 'Big Game Hunting',
    source: 'Livreto da expansão Frost Giant (Onda 1), aventura 3.4',
    players: 2,
    playArea: '90 x 90 cm, uma passagem nevada no alto das Montanhas Nether',
    components: ['5 fichas de objetivo (os picos)', 'A carta de melhoria Scale of the White Wyrm'],
    sides: [
      { id: 'horn', name: 'Jarl Hörn', creatureUid: 301, points: 52, color: '#5b63b8', requires: 'Jarl Hörn e melhorias' },
      { id: 'cacados', name: 'Os Caçados', points: 65, color: '#c0282d', requires: 'Quaisquer criaturas não únicas e melhorias' },
    ],
    synopsis: [
      'No alto das Montanhas Nether, o velho gigante do gelo Jarl Hörn para, tira da bolsa a perna de urso polar que leva de lanche e dá duas mordidas. Hoje ele saiu para caçar. Aceitaria mais urso, mas queria mesmo um lagarto grande, branco ou prateado.',
      'Com tanta neve, o chão lá em cima é traiçoeiro, então ele sopra a trompa mágica e ri pensando nos pequenos que tentam usar aquela passagem, até o estrondo da avalanche abafar a risada. Sopra de novo para derrubar toda a neve solta e, com sorte, atrair alguma presa curiosa. A presa vem. Se o velho Jarl não tomar cuidado, quem vira caça é ele.',
    ],
    setup: [
      'Jarl Hörn monta a legião com 52 pontos, com ele e melhorias. Os Caçados montam a legião com 65 pontos, com quaisquer criaturas não únicas e melhorias.',
      'Hörn coloca 3 fichas de objetivo na metade dele da área (a metade sul), a pelo menos 23 cm (9") umas das outras.',
      'Os Caçados colocam 2 fichas de objetivo na metade deles (a metade norte), a pelo menos 23 cm umas das outras e das que já estão na mesa.',
      'Depois os dois posicionam as criaturas pela preparação padrão para 2 jogadores: Hörn na borda sul e os Caçados na borda norte.',
    ],
    specialRules: [
      { title: 'Os picos', text: 'As fichas de objetivo são picos cercados de ventos fortes. Contam como Obstáculos para criaturas voadoras e para as que estão no solo, mas o dano que causam não penetra a Armadura.' },
      { title: 'Vento nos picos', text: 'Uma criatura voadora que termina uma manobra branca ou vermelha a alcance 1 de um pico declara se vai ficar no ar, pousar ou dar um rasante, e rola um dado de defesa na hora. Com resultado em branco: no ar, recebe uma ficha de Exaustão; pousando, sofre 1 de dano crítico; no rasante, sofre as duas coisas e é obrigada a pousar. Só depois disso escolhe a Ação, se não estiver exausta.' },
      { title: 'Perto dos picos', text: 'A alcance 1 de um pico, ninguém consegue decolar nem fazer manobras vermelhas.' },
      { title: 'Montanhista experiente', text: 'Jarl Hörn ignora quase tudo isso: passa pelos picos livremente e pode fazer manobras vermelhas perto deles. Mas quem ele ataca através de um pico ainda ganha +1 dado de defesa.' },
    ],
    objectives: [
      { side: 'Os dois lados', text: ['Vence quem derrotar o outro lado, pelas regras normais do jogo.'] },
    ],
    outcomes: [
      { id: '1', title: 'Depois da batalha', summary: 'O eco da trompa e da avalanche chega a um pico distante, onde outra avalanche revela parte de um rosto de pedra imenso, com olhos maiores que a cabeça de Hörn. A luta derruba mais neve e expõe a metade de cima de uma figura esculpida na montanha. Ninguém via aquele monumento ao Guardião do Cemitério Primordial havia mais de mil anos, e vai levar uma ou duas estações até que agentes a favor e contra o Culto do Dragão descubram o que ele é e o que significa.', rewards: ['Lado vencedor: 1 XP', 'Lado vencedor recebe o Scale of the White Wyrm, desenterrado durante a luta'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'cacados', label: 'Os Caçados' },
        { x: 0, y: 75, w: 90, h: 15, side: 'horn', label: 'Jarl Hörn' },
      ],
      tokens: [{ x: 28, y: 28 }, { x: 62, y: 34 }, { x: 14, y: 54 }, { x: 40, y: 54 }, { x: 66, y: 62 }],
      note: 'Hörn põe 3 picos na metade sul e os Caçados põem 2 na metade norte, sempre a 23 cm uns dos outros. O mapa mostra uma distribuição possível.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 3.4,
    theme: 'Duelo nas montanhas contra um gigante que conhece o terreno melhor que qualquer um.',
  },
  {
    slug: 'proteja-o-prototipo',
    number: 3.5,
    title: 'Proteja o protótipo',
    original: 'Protect the Prototype',
    source: 'Livreto da expansão Dwarven Ballista (Onda 1), aventura 3.5',
    players: 2,
    playArea: '90 x 90 cm, o campo de treino de artilharia dos anões',
    components: ['6 fichas de objetivo (as balistas de treino)', 'A carta de melhoria Bag of Diamond Dust'],
    sides: [
      { id: 'calamity', name: 'Calamity', creatureUid: 201, points: 50, color: '#8a5a44', requires: 'Calamity e melhorias' },
      { id: 'balagos', name: 'Balagos', creatureUid: 101, points: 80, color: '#c0282d', requires: 'Balagos, lacaios e melhorias' },
    ],
    synopsis: [
      'Os engenheiros anões resolveram presentear os recrutas do Campo de Treino de Artilharia com a apresentação do novo protótipo, a Calamity. Os aprendizes vão disputar uma vaga na equipe da máquina e estão ansiosos para disparar algo diferente das setas cegas de treino.',
      'Outra pessoa esperava por esse dia. Balagos levou um tiro de balista numa batalha recente e, já recuperado, decidiu acabar com a próxima turma antes da formatura e com a fábrica de balistas que fica ali perto. Ele costuma trabalhar por encomenda, mas este serviço é por conta própria, e ele trouxe ajuda.',
    ],
    setup: [
      'Calamity monta a legião com 50 pontos, com ela e melhorias. Balagos monta a legião com 80 pontos, com ele, lacaios e melhorias.',
      'O jogador de Calamity coloca as 6 fichas de objetivo numa linha reta a 30 cm (12") da borda sul, na ordem e no espaçamento que quiser ao longo dessa linha. Cada ficha é uma balista de treino controlada por ele.',
      'Calamity começa em qualquer ponto atrás da linha de balistas, na faixa de 30 cm da borda sul.',
      'Balagos posiciona as criaturas do lado oposto, pela preparação padrão para 2 jogadores.',
    ],
    specialRules: [
      { title: 'Balistas de treino', text: 'Cada balista tem Valor da Arma Primária 3 (arma à distância, alcance 3), Agilidade 0, Vida 3 e Armadura 0. Elas não fazem Ações, não têm slots de melhoria e atacam por último em cada Fase de Combate.' },
      { title: 'Plataformas giratórias', text: 'As balistas não têm rodas: ficam sobre plataformas que giram, por isso têm arco de ataque de 360 graus. Como não se movem, quem ataca uma delas rola +1 dado de ataque.' },
      { title: 'Setas cegas', text: 'As balistas disparam setas de treino. Cada crítico delas que não for cancelado ainda ignora a Armadura, mas só causa Cartas de Dano com a face para baixo.' },
    ],
    objectives: [
      { side: 'Calamity (balista)', text: ['Vence se Balagos chegar a 0 de Vida. Nesse caso o dragão e os lacaios fogem (depois da batalha 1).'] },
      { side: 'Balagos (dragão vermelho)', text: ['Só vence se destruir Calamity e todas as balistas de treino (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se os dois objetivos forem cumpridos ao mesmo tempo, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'O dragão foge', summary: 'O Mestre de Artilharia Denilon visita os recrutas feridos e um deles pergunta o que cantavam enquanto empurravam o protótipo. Era uma canção antiga em anão sobre a forja de uma corrente de âncora enorme, com elos de quase uma tonelada, e cada verso tentava adivinhar para que servia. O último verso dizia que a corrente prendia o reino de um poderoso Gigante das Nuvens chamado Luminos V. Pouco depois, um dos recrutas feridos manda essa informação para a sua verdadeira Senhora: a batalha tinha servido de distração para um espião, que enfim descobriu o segredo que veio buscar.', rewards: ['Calamity: 1 XP', 'Calamity recebe o Bag of Diamond Dust'] },
      { id: '2', title: 'Balagos arrasa o campo', summary: 'Balagos diz a si mesmo que matou a sede de vingança, mas o que sente é alívio por atrasar o avanço dos anões, porque os inimigos dele ficam mais perigosos à medida que ele envelhece. A missão também tinha outro objetivo. Antes de engolir um dos anões caídos, ele o interrogou e descobriu a resposta da canção "Para que servia a corrente": era a âncora do reino do poderoso Gigante das Nuvens, Luminos V.', rewards: ['Balagos: 2 XP'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 12, side: 'balagos', label: 'Balagos' },
        { x: 0, y: 60, w: 90, h: 30, side: 'calamity', label: 'Calamity (atrás das balistas)' },
      ],
      tokens: [{ x: 8, y: 60 }, { x: 20, y: 60 }, { x: 32, y: 60 }, { x: 44, y: 60 }, { x: 66, y: 60 }, { x: 80, y: 60 }],
      note: 'As 6 balistas de treino ficam em linha reta a 30 cm da borda sul. O jogador de Calamity escolhe o espaçamento.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 3.5,
    theme: 'Um dragão vingativo contra uma bateria de artilharia que não sai do lugar.',
  },
  {
    slug: 'batalha-ladeira-acima',
    number: 3.6,
    title: 'Batalha ladeira acima',
    original: 'An Uphill Battle',
    source: 'Livreto da expansão Hobgoblin Troop (Onda 1), aventura 3.6',
    players: 2,
    playArea: '90 x 90 cm, uma estrada de subida no caminho do covil de Eshaedra no deserto',
    components: ['1 ficha de carroça de 7,5 x 6,5 cm (3" x 2½")', '6 fichas de dano estrutural', 'A carta de melhoria Juggernaut Mantlet'],
    sides: [
      { id: 'transportadores', name: 'Transportadores', points: 120, color: '#8c2b22', requires: 'Criaturas e melhorias, incluindo um Zhentarim Warband' },
      { id: 'salteadores', name: 'Salteadores', points: 80, color: '#3a56b0', requires: 'Quaisquer criaturas e melhorias' },
    ],
    synopsis: [
      'Eshaedra está de mudança e pagou aos Zhentarim para levar os tesouros menos valiosos dela até o novo covil no deserto. Para ficar de olho neles, mandou alguns lacaios junto como escolta. A carga vai numa carroça blindada e coberta, puxada por golens de pedra sem mente, enfeitiçados para seguir a rota.',
      'O problema é que a força dos golens não basta para subir esta ladeira com a carroça. Pior, a caravana está para encontrar algo muito mais perigoso que salteadores comuns. E o pior de tudo é falhar com Eshaedra, porque ninguém falha com ela duas vezes.',
    ],
    setup: [
      'Os Transportadores montam a legião com 120 pontos, incluindo um Zhentarim Warband. Os Salteadores montam a legião com 80 pontos.',
      'Coloquem a ficha de carroça centralizada entre leste e oeste, apontando para a borda inicial dos Salteadores (sul), com a traseira a exatamente 23 cm (alcance 3) da borda inicial dos Transportadores (norte).',
      'Os jogadores posicionam as criaturas nas áreas iniciais normais. A exceção é o Zhentarim Warband, que pode começar em qualquer ponto a até 30 cm (alcance 4) da borda norte.',
    ],
    specialRules: [
      { title: 'A carroça blindada', text: 'A carroça é um Obstáculo de solo que se move. Ela conta como "criatura" para o texto das cartas, mas é imune a efeitos críticos e a dano de Veneno.' },
      { title: 'Cobertura', text: 'A carroça protege quem está atrás dela: o defensor ganha 2 dados de defesa extras contra ataques de solo que passam por ela e 1 dado extra contra ataques aéreos que passam por ela.' },
      { title: 'Valor de Fortificação 2', text: 'A carroça tem VF 2, que funciona como Armadura mas também desvia ataques que normalmente penetram Armadura. Críticos ainda ignoram o VF. Marquem o dano com as fichas de dano estrutural. Com 3 de dano ela fica imóvel, e com 6 ela desmonta.' },
      { title: 'Ação: consertar a carroça', text: 'Na Fase de Ação, o Zhentarim Warband pode descartar 1 ficha de dano estrutural da carroça se estiver a alcance 1 dela e se ela tiver menos de 6 fichas.' },
      { title: 'Ataque: empurrar a carroça', text: 'Na Fase de Combate, qualquer criatura no solo com ataque corpo a corpo e ao alcance corpo a corpo da carroça pode fazer este ataque, se a carroça tiver menos de 3 fichas de dano estrutural e estiver no arco frontal dela. Ela rola tantos dados de ataque quanto o seu Valor da Arma Primária e soma os acertos e críticos, que não causam dano mas podem ser modificados com fichas de Mira ou de Concentração. A carroça anda para a frente ou para trás com o gabarito de manobra reto desse número, e para antes se fosse terminar em cima da base de uma criatura. Quem empurra pode escolher um gabarito menor.' },
      { title: 'Atravessar criaturas', text: 'A carroça passa por cima de criaturas no solo sem teste de Atropelamento.' },
    ],
    objectives: [
      { side: 'Salteadores', text: ['Vencem se eliminarem todas as forças dos Transportadores, se eliminarem o Zhentarim Warband e deixarem a carroça imóvel, ou se a carroça desmontar ou sair pela borda inicial dos Transportadores (depois da batalha 1).'] },
      { side: 'Transportadores', text: ['Vencem se eliminarem os Salteadores antes de perder o último soldado do Warband, se eliminarem os Salteadores com a carroça ainda andando, ou se levarem a carroça além da borda inicial dos Salteadores (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se a carroça desmontar no mesmo turno em que os Salteadores forem eliminados, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'A carga se perde', summary: 'Eshaedra fica furiosa e não se acalma quando os Zhentarim dizem que os itens tinham seguro. Quando está para eletrocutar o mensageiro, percebe o propósito de Tiamat naquela tragédia. Como pedido de desculpas, juros da dívida ou resgate, os Zhentarim oferecem uma informação que vale a perda: a localização da Agulha da Corrente, a corrente de âncora que prende um certo Reino das Nuvens, que estaria em algum lugar das Ilhas Moonshae. Ela deixa o mensageiro ir embora só com alguns pelos chamuscados nas costas.', rewards: ['Salteadores: 1 XP', 'Salteadores podem usar o Juggernaut Mantlet ou qualquer Artefato de Campanha ainda sem dono de uma aventura anterior'] },
      { id: '2', title: 'A carga chega', summary: 'Eshaedra agradece a Tiamat pela chegada dos seus enfeites, descontada a comissão de sempre dos Zhentarim. Depois da prece, decide recompensar os hobgoblins com uma peça do tesouro, grande e feia, mas útil. Em troca da generosidade, eles oferecem algo que ela queria muito: a localização da Agulha da Corrente, a corrente de âncora que prende o reino de um certo Gigante das Nuvens, que estaria em algum lugar das Ilhas Moonshae.', rewards: ['Transportadores: 1 XP', 'O Zhentarim Warband recebe o Juggernaut Mantlet'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 10, side: 'transportadores', label: 'Aliados hobgoblins' },
        { x: 0, y: 10, w: 90, h: 20, side: 'transportadores', label: 'Zhentarim Warband (até 30 cm)' },
        { x: 0, y: 78, w: 90, h: 12, side: 'salteadores', label: 'Salteadores' },
      ],
      tokens: [{ x: 45, y: 26, label: 'carroça' }],
      note: 'A carroça fica no centro, apontada para o sul, com a traseira a 23 cm da borda norte.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 3.6,
    theme: 'Escolta de uma carroça blindada que precisa ser empurrada ladeira acima sob ataque.',
  },
  {
    slug: 'atras-das-linhas-inimigas',
    number: 3.7,
    title: 'Atrás das linhas inimigas',
    original: 'Behind Enemy Lines',
    source: 'Livreto da expansão Sun Elf Troop (Onda 1), aventura 3.7',
    players: 2,
    playArea: '90 x 90 cm, a orla de uma grande floresta onde um exército inimigo acampou',
    components: ['Nenhum componente especial', 'A carta de melhoria Mithral Thorn'],
    sides: [
      { id: 'elfos', name: 'Elfos', points: 120, color: '#3f8a4a', requires: 'Criaturas e melhorias, com pelo menos um soldado dos Harper Legion Elves' },
      { id: 'inimigo', name: 'Inimigo', points: 120, color: '#7a3a9a', requires: 'Quaisquer criaturas e melhorias' },
    ],
    synopsis: [
      'Uma informação importante foi deixada para a Legião Harpista no ponto de entrega de sempre, na orla de uma grande floresta. Isso foi antes de uma força inimiga acampar bem na frente dele.',
      'Ontem à noite, a Legião mandou uma tropa de elfos entrar escondida e buscar a mensagem. Para sair com a luz da manhã, eles vão precisar que uma batalha campal distraia o inimigo.',
    ],
    setup: [
      'Cada lado monta a legião com 120 pontos. A legião dos Elfos precisa ter pelo menos um soldado dos Harper Legion Elves.',
      'Os Elfos colocam a tropa da Legião Harpista a até 15 cm (6") da borda inicial sul.',
      'O Inimigo coloca as criaturas dele a até 7,5 cm (3") da linha do meio, entre as duas bordas iniciais.',
      'Os Elfos colocam o resto das criaturas a até 15 cm da borda inicial norte.',
    ],
    specialRules: [
      { title: 'A tropa escondida', text: 'Nenhuma criatura do Inimigo pode atacar a tropa de elfos até que uma destas coisas aconteça: a tropa ataca uma criatura inimiga; a tropa cruza a linha do meio; todos os aliados da tropa são derrotados; ou a tropa é pega no mesmo ataque de área que atinge pelo menos 1 aliado dela.' },
      { title: 'A saída', text: 'Um soldado da tropa de elfos que sai pela borda inicial norte não é derrotado. É a única forma de deixar a área sem ser derrotado nesta aventura.' },
    ],
    objectives: [
      { side: 'Elfos', text: ['Vencem se pelo menos um soldado da tropa de elfos sair pela borda inicial norte (depois da batalha 1).'] },
      { side: 'Inimigo', text: ['Vence se ainda tiver alguma criatura em jogo quando o último soldado da tropa de elfos morrer (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se nenhum dos objetivos for cumprido, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'A mensagem chega', summary: 'Nymmestra, a maga dos elfos do sol, lê o relatório e escreve na hora para Galadaeros: o inimigo já sabe que os planos dele foram descobertos e que o dragão de cobre está tentando impedi-los, e talvez tenha as mesmas pistas que eles. Ela pede cuidado, avisa que forças maiores vão se voltar contra ele nos próximos meses e promete mandar a ajuda que puder.', rewards: ['Harper Legion Elves: 1 XP', 'Harper Legion Elves recebem o Mithral Thorn'] },
      { id: '2', title: 'A mensagem é interceptada', summary: 'A mensagem achada no corpo de um elfo é decifrada e levada a Rezmir, que a lê sorrindo: agora os inimigos sabem de tudo. Ela pergunta se houve movimento de tropas para o oeste e ouve que ainda não. Fica satisfeita, porque eles têm as mesmas pistas, mas ainda não encontraram a Agulha da Corrente.', rewards: ['Inimigo: 1 XP', 'Inimigo recebe o Mithral Thorn'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'elfos', label: 'Aliados dos elfos (saída ao norte)' },
        { x: 0, y: 37.5, w: 90, h: 15, side: 'inimigo', label: 'Inimigo (linha do meio)' },
        { x: 0, y: 75, w: 90, h: 15, side: 'elfos', label: 'Tropa da Legião Harpista' },
      ],
      tokens: [],
      note: 'A tropa da Legião Harpista começa no sul e precisa atravessar o acampamento inimigo até sair pela borda norte.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 3.7,
    theme: 'Fuga com uma mensagem secreta através do acampamento inimigo, com a batalha como distração.',
  },
  {
    slug: 'o-abismo-uivante',
    number: 4.1,
    title: 'O abismo uivante',
    original: 'The Howling Chasm',
    source: 'Livreto da expansão Aarakocra Troop (Onda 2), aventura 4.1',
    players: 2,
    playArea: '90 x 90 cm, a borda de um abismo varrido pelo vento',
    components: ['1 ficha de abismo de 18 x 18 cm (7" x 7")', 'A carta de melhoria 7th Shard of Law'],
    sides: [
      { id: 'parlamentares', name: 'Força parlamentar', points: 120, color: '#c0282d', requires: 'Uma tropa Aarakocra e aliados' },
      { id: 'culto', name: 'Força do Culto', points: 120, color: '#3a56b0', requires: 'Quaisquer criaturas e melhorias' },
    ],
    synopsis: [
      'Enquanto alguns procuram a localização exata do Palácio de Luminos, o Poderoso, gente dos dois lados estuda as defesas lendárias da fortaleza externa. Com relatórios antigos, histórias contadas de boca em boca, canções e bastante espionagem, descobriram que há três portões nas muralhas quase inexpugnáveis, e cada um só abre com uma Chave mística.',
      'Uma dessas Chaves está sob a guarda permanente de um esquadrão de elite de aarakocras a serviço dos Duques do Vento de Aaqa, que os mandaram do Plano Elemental do Ar com a Chave para impedir que a guerra chegue ao plano deles. Os aarakocras se esconderam no Abismo Uivante por meses, mas precisaram sair para caçar algumas vezes e foram descobertos. Um grupo pequeno de inimigos do Culto do Dragão chega para negociar com eles, e ao mesmo tempo chega uma força bem maior, disposta a tomar a Chave à força.',
    ],
    setup: [
      'Cada lado monta a legião com 120 pontos. A Força parlamentar inclui 1 tropa Aarakocra e aliados.',
      'Coloquem a ficha de abismo no centro da área, com cada lado a 37 cm (14,5") da borda mais próxima.',
      'Os jogadores posicionam as criaturas pela preparação padrão para 2 jogadores: a Força parlamentar na borda norte e a Força do Culto na borda sul.',
    ],
    specialRules: [
      { title: 'O abismo sem fundo', text: 'Qualquer criatura ou soldado no solo que, depois do passo de mudar de altitude do movimento, esteja com o flanco direito ou esquerdo inteiro dentro do abismo, como mostra a ficha, cai e é derrotado.' },
      { title: 'Vento traiçoeiro', text: 'O vento do abismo torna o voo perigoso para todos, menos para os aarakocras. Qualquer criatura que esteja no ar depois do passo de mudar de altitude não pode fazer Ações, esteja onde estiver na área. Uma criatura voadora com o flanco direito ou esquerdo inteiro dentro do abismo depois desse passo também recebe uma ficha de Exaustão. Os aarakocras ignoram as duas regras.' },
      { title: 'O ritual dos aarakocras', text: 'Os aarakocras precisam fazer um ritual para acalmar o vento do abismo antes de voltar para ele, e isso não dá para fazer no meio de uma luta. Por isso não podem voltar para casa até o Culto ser derrotado e precisam manter o controle do abismo: a tropa perde a aventura se o soldado da ponta se afastar demais dele.' },
    ],
    objectives: [
      { side: 'Força parlamentar', text: ['Vence se eliminar toda a Força do Culto (depois da batalha 1).'] },
      { side: 'Força do Culto', text: [
        'Vence se a tropa Aarakocra for derrotada, mesmo que outras criaturas da Força parlamentar sobrevivam (depois da batalha 2).',
        'Os aarakocras também são derrotados se o soldado da ponta não estiver a alcance 3 da ficha de abismo no começo da Fase Final.',
      ] },
      { side: 'Empate', text: ['Se os dois objetivos forem cumpridos ao mesmo tempo, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'O Culto é expulso', summary: 'Aaroqa, líder da tropa, diz que os Mestres preferiam ficar fora do conflito, mas isso já não é possível. Os aarakocras não vão se separar da Chave, mas, como ela pode servir a quem não voa, vão deixar que alguém assim a use e vão acompanhar o grupo até o que eles chamam de Portão da Ventania, embora ninguém saiba onde ele fica.', rewards: ['Força parlamentar: 1 XP', 'Força parlamentar recebe o 7th Shard of Law'] },
      { id: '2', title: 'A Chave é tomada', summary: 'Um orc cansado entrega ao comandante dragão o fragmento brilhante que achou depois de revirar as penas de todos os aarakocras mortos. Eshaedra, a dragoa azul, olha para a Chave mística e sorri: o Culto vai ficar muito satisfeito com o sucesso dela. Depois empurra o servo para o abismo, e os gritos dele ecoam por minutos até se perderem no uivo do vento.', rewards: ['Força do Culto: 1 XP', 'Força do Culto recebe o 7th Shard of Law'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 10, side: 'parlamentares', label: 'Força parlamentar' },
        { x: 0, y: 80, w: 90, h: 10, side: 'culto', label: 'Força do Culto' },
        { x: 36.5, y: 36.5, w: 17, h: 17, side: 'culto', label: 'Abismo' },
      ],
      tokens: [],
      note: 'O abismo tem 18 x 18 cm no centro da área. A zona segura dos aarakocras vai até alcance 3 (23 cm) da ficha de abismo.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 4.1,
    theme: 'Disputa pela primeira Chave na borda de um abismo onde só os aarakocras voam com segurança.',
  },
  {
    slug: 'uma-noite-de-sombras',
    number: 4.2,
    title: 'Uma noite de sombras',
    original: 'A Night of Shadows',
    source: 'Livreto da expansão Black Shadow Dragon (Onda 2), aventura 4.2',
    players: 2,
    playArea: '90 x 90 cm, um acampamento na noite, iluminado só por uma fogueira',
    components: ['1 ficha de fogueira de 2,5 cm (1") de diâmetro', 'A carta de melhoria The Ebon Cloak'],
    sides: [
      { id: 'umberlis', name: 'Umberlis', creatureUid: 1101, points: 60, color: '#55505a', requires: 'Umberlis e melhorias' },
      { id: 'campistas', name: 'Campistas', points: 80, color: '#3f8a4a', requires: 'Só criaturas terrestres e melhorias, a menos que o jogador não tenha nenhuma' },
    ],
    synopsis: [
      'Desde que saiu do ovo, Spite foi o menor da ninhada de dragões negros, sempre maltratado e expulso dos melhores pântanos. Deprimido, levou o tesouro de que mais gostava, uma capa negra tirada do corpo de um assassino ousado demais, e se enfiou numa caverna úmida querendo só se encolher e morrer. De certa forma, morreu.',
      'Por mais de dois séculos a capa, que ele chama de Inky, o consolou, sussurrou para ele e o transformou. Agora ele é Umberlis, um dragão mais negro que o negro, uma coisa de sombra que as sombras obedecem. A capa diz que é uma chave capaz de levá-lo a um Reino das Sombras, mas primeiro ele precisa achar a porta. Saiu no brilho quase cegante do anoitecer para interrogar quem encontrasse, matou muitos, e agora se aproximou de um grupo de campistas. Escutando a conversa, descobre que eles sabem da Inky e querem tirá-la dele.',
    ],
    setup: [
      'Umberlis monta a legião com 60 pontos, com ele e melhorias. Os Campistas montam a legião com 80 pontos, só com criaturas terrestres e melhorias. A restrição não vale se o jogador não tiver nenhuma criatura terrestre.',
      'Os Campistas colocam a ficha de fogueira a 30 cm (12") da borda inicial deles, no sul, centralizada entre leste e oeste.',
      'A área inicial dos Campistas é tudo o que estiver inteiramente a alcance 2 (15 cm) da fogueira. Essa mesma área é o clarão da fogueira.',
      'A área inicial de Umberlis vai até 15 cm da borda norte, como de costume.',
      'Os Campistas posicionam todas as criaturas primeiro, e depois Umberlis se coloca em qualquer ponto da área dele.',
    ],
    specialRules: [
      { title: 'É noite', text: 'Para o texto da carta de referência de Sombras, é noite em toda a área, menos na ficha de fogueira e no clarão dela.' },
      { title: 'O clarão da fogueira', text: 'Uma criatura com qualquer parte a alcance 2 do clarão da fogueira não está no escuro. Mas se ela também estiver a alcance 2 de um feitiço de Escuridão, volta a contar como no escuro. Se a área de um feitiço de Escuridão cobrir a própria ficha de fogueira, a área inteira fica no escuro enquanto o feitiço durar.' },
      { title: 'O ataque surpresa', text: 'Na primeira rodada, só Umberlis planeja manobra, se move, faz Ação e ataca. Os Campistas só podem se defender nessa rodada.' },
    ],
    objectives: [
      { side: 'Campistas', text: ['Vencem se eliminarem Umberlis (depois da batalha 1).'] },
      { side: 'Umberlis', text: [
        'Vence se eliminar todas as criaturas menos uma (ou um soldado) e deixar essa última com 1 ou 2 de Vida (depois da batalha 2).',
        'Se eliminar todos os Campistas, consegue só uma vitória parcial (depois da batalha 3).',
      ] },
    ],
    outcomes: [
      { id: '1', title: 'Umberlis recua', summary: 'Com o odiado amanhecer chegando, Umberlis recupera o juízo e a velha sensação de inferioridade volta. Desta vez ele a afasta com uma facilidade estranha e planeja o próximo passo com calma: se a Inky é uma chave, ele ainda pode encontrar esse inimigo na porta e chegar aonde quer. Por enquanto, precisa de uma escuridão que o acalme.', rewards: ['Campistas: 1 XP', 'Campistas recebem The Ebon Cloak'] },
      { id: '2', title: 'Um sobrevivente para interrogar', summary: 'Acariciando a capa como um bicho de estimação, Umberlis fala com o único sobrevivente consciente. Uma aura de escuridão total se junta em volta do dragão e a voz rouca dele ecoa em sussurros: o prisioneiro vai contar o que eles querem saber, ou vai conhecer um tipo novo de escuridão.', rewards: ['Umberlis: 2 XP', 'Umberlis recebe The Ebon Cloak'] },
      { id: '3', title: 'Ninguém sobra para falar', summary: 'Umberlis grita, esfregando a capa no rosto: matou todos de novo. Mas pode seguir o rastro de onde eles vieram e talvez achar outros que saibam onde fica a porta. Ele parte noite adentro antes de perder a pista, sem saber que alguns daqueles inimigos ainda estão vivos.', rewards: ['Umberlis: 1 XP', 'Umberlis recebe The Ebon Cloak'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'umberlis', label: 'Umberlis' },
        { x: 30, y: 45, w: 30, h: 30, side: 'campistas', label: 'Clarão da fogueira' },
      ],
      tokens: [{ x: 45, y: 60, label: 'fogueira' }],
      note: 'A fogueira fica a 30 cm da borda sul. A área inicial dos Campistas e o clarão são o círculo de alcance 2 (15 cm) em volta dela; o mapa simplifica como um quadrado.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 4.2,
    theme: 'Um dragão de sombras ataca um acampamento à noite, e a única luz é a fogueira.',
  },
  {
    slug: 'os-olhos-sempre-atentos',
    number: 4.3,
    title: 'Os olhos sempre atentos',
    original: 'The Ever-Watchful Eyes',
    source: 'Livreto da expansão Movanic Deva Angel (Onda 2), aventura 4.3',
    players: 2,
    playArea: '90 x 90 cm, entre dois acampamentos aos pés da estátua de Luminos nas Montanhas Nether',
    components: ['2 fichas de barraca (uma para cada lado)', 'A carta de melhoria Tuning Fork of Neutrality'],
    sides: [
      { id: 'sarpiel', name: 'Força de Sarpiel', creatureUid: 1201, points: 150, color: '#3f8a4a', requires: 'Criaturas Boas e Neutras, incluindo Sarpiel' },
      { id: 'culto', name: 'Força do Culto', points: 150, color: '#c0282d', requires: 'Criaturas Malignas e Neutras' },
    ],
    synopsis: [
      'Uma comunidade movimentada cresceu à sombra de um dos picos mais altos das Montanhas Nether. Humanoides de várias raças foram contratados para tirar a neve que cobre há séculos o pico e a estátua esculpida nele. Apesar das diferenças, ninguém brigou: o pagamento é bom, e muitos querem ver como vai ficar a imagem gigante de Luminos, o Poderoso. Mais acima, na base de duas montanhas vizinhas, há dois acampamentos com construções de verdade. De um saem relatórios para o Culto do Dragão, do outro saem notícias para os inimigos dele. A tensão é grande, mas nenhum lado quer uma luta que machuque os trabalhadores e atrase a obra.',
      'Isso muda quando os trabalhadores acham uma tábua de pedra enorme numa das mãos da estátua e, para passar o tempo, tentam pronunciar as palavras antigas gravadas nela. Alguém acertou, porque as palavras invocaram um juramento antigo e Sarpiel, o Anjo Guardião, foi enviado para cumpri-lo. Ele não gosta de ver tantas criaturas malignas perto de quem pode ser corrompido e não suporta o fedor do acampamento do Culto. Os trabalhadores se escondem quando ele grita um desafio. Lá de cima, os guerreiros dos dois lados descem: o Culto quer destruir o anjo que atrapalhou a obra, e o outro acampamento decide que ele está em desvantagem e precisa de ajuda.',
    ],
    setup: [
      'Cada lado monta a legião com 150 pontos. Podem ser 2 jogadores ou 2 equipes de 2. A Força de Sarpiel usa criaturas Boas e Neutras, incluindo Sarpiel. A Força do Culto usa criaturas Malignas e Neutras.',
      'Coloquem as duas fichas de barraca centralizadas entre oeste e leste, cada uma com a borda mais distante a 30 cm (12", alcance 4) da borda inicial do próprio lado.',
      'Os jogadores posicionam as criaturas nas áreas iniciais, pela preparação padrão para 2 jogadores: Sarpiel ao norte e o Culto ao sul.',
    ],
    specialRules: [
      { title: 'Bravura', text: 'O desafio de Sarpiel inspirou todos. Quem ataca a criatura de Nível mais alto do lado adversário rola +1 dado de ataque. Se houver empate no Nível mais alto de um lado, todas as empatadas contam como as de Nível mais alto.' },
      { title: 'As barracas', text: 'Cada barraca é um Obstáculo de solo só para as criaturas adversárias. As suas criaturas entram, atravessam e atacam através da sua barraca sem penalidade.' },
      { title: 'Atacar uma barraca', text: 'Uma barraca pode ser atacada como se fosse uma criatura terrestre sem Armadura e sem defesa, com 3 de Vida. Ela é imune a ataques de veneno e a efeitos críticos. Quando destruída, sai da área.' },
      { title: 'Ação: descansar na barraca', text: 'Uma criatura que termina o movimento a alcance 1 da própria barraca pode usar a Ação para remover 1 das suas Cartas de Dano viradas para baixo. Nessa rodada ela não pode atacar.' },
    ],
    objectives: [
      { side: 'Força de Sarpiel', text: ['Vence se eliminar todas as criaturas do lado adversário (depois da batalha 1).'] },
      { side: 'Força do Culto', text: ['Vence se eliminar todas as criaturas do lado adversário (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se todos forem eliminados no mesmo turno, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'O anjo vence', summary: 'Sarpiel se cura depressa e ordena que todas as criaturas malignas deixem o lugar sagrado na hora. Enquanto os trabalhadores do Culto fogem, ele cuida dos feridos do seu lado e promete mostrar o que eles procuram. Leiam também o final 3.', rewards: ['Leiam o final 3'] },
      { id: '2', title: 'O Culto vence', summary: 'Vencido, Sarpiel fala com amargura e dignidade: se pouparem as pessoas boas dali e as deixarem partir, ele vai mostrar o que procuram, para o bem que isso possa trazer. Leiam também o final 3.', rewards: ['Leiam o final 3'] },
      { id: '3', title: 'A Agulha da Corrente', summary: 'Sarpiel leva os vencedores a uma entrada escondida atrás da coroa da estátua e desce uma longa escada até duas salas secretas atrás dos olhos. Numa delas, um baú que o anjo abre guarda uma varinha misteriosa de duas pontas, um item de grande poder que também serve de Chave. Na outra há uma grande luneta ornamentada, fixa para olhar pelo olho do gigante. Num dia limpo, ela mostra, entre dois picos no extremo oeste da cordilheira, uma tempestade enorme sob uma nuvem colossal, com raios caindo sempre no mesmo ponto e apontando para uma ilha das Moonshae. A Agulha da Corrente foi encontrada.', rewards: ['Força vencedora: 2 XP', 'Força vencedora recebe o Tuning Fork of Neutrality'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'sarpiel', label: 'Força de Sarpiel' },
        { x: 0, y: 75, w: 90, h: 15, side: 'culto', label: 'Força do Culto' },
      ],
      tokens: [{ x: 45, y: 26, label: 'barraca de Sarpiel' }, { x: 45, y: 64, label: 'barraca do Culto' }],
      note: 'Cada barraca fica centralizada, com a borda mais distante a 30 cm da borda inicial do próprio lado.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 4.3,
    theme: 'Batalha aberta de 150 pontos pelo segredo guardado nos olhos da estátua de Luminos.',
  },
  {
    slug: 'um-erro-fatal',
    number: 5.1,
    title: 'Um erro fatal',
    original: 'A Grave Mistake',
    source: 'Livreto da expansão Wyvern (Onda 3), aventura 5.1',
    players: 2,
    playArea: '90 x 90 cm, a caverna escura onde Blackthorn guarda as presas',
    components: ['10 fichas de coluna (4 cm de diâmetro)', '1 ficha de corpo', 'A carta de melhoria Sulfuric Dagger'],
    sides: [
      { id: 'blackthorn', name: 'Blackthorn', creatureUid: 1901, points: 50, color: '#c0282d', requires: 'Blackthorn e melhorias' },
      { id: 'busca', name: 'Grupo de busca', points: 60, color: '#3a56b0', requires: 'Quaisquer criaturas e melhorias' },
    ],
    synopsis: [
      'Os dois lados que procuram o Palácio de Luminos, o Poderoso, já têm Chaves místicas para os portões, mas ninguém conseguiu chegar aos portões. A tempestade permanente criada pela nuvem onde o palácio está é grande, alta e violenta demais para atravessar com segurança.',
      'A esperta dragoa verde Claugiyliamatar mandou Legunt, o seu "Arquivista Real", pegar um certo livro numa biblioteca próxima em busca de uma pista. O velho hobgoblin não voltou, e testemunhas dizem que ele foi levado por Blackthorn, uma serpe poderosa que devora as vítimas depois de inchá-las com o veneno do ferrão da cauda. Os dois lados sabem da missão de Legunt, e começa outra corrida para achar o corpo e recuperar o tomo antigo.',
    ],
    setup: [
      'Blackthorn monta a legião com 50 pontos, com ele e melhorias, e começa no norte. O Grupo de busca monta a legião com 60 pontos e começa no sul.',
      'Blackthorn coloca as 10 fichas de coluna em qualquer ponto fora da área inicial do Grupo de busca, a pelo menos 15 cm (6") umas das outras. São colunas da caverna e contam como Obstáculos de solo e de ar.',
      'Depois ele coloca a ficha de corpo em qualquer ponto a pelo menos 15 cm das bordas.',
      'Os jogadores posicionam as criaturas nas áreas iniciais, pela preparação padrão para 2 jogadores.',
    ],
    specialRules: [
      { title: 'Paredes da caverna', text: 'As bordas norte, leste e oeste são paredes. Uma criatura que fosse terminar o movimento fora da área por uma delas não é derrotada: recua até ficar inteira dentro da área, e uma criatura voadora nessa situação precisa pousar na hora. Criaturas Incorpóreas são derrotadas pela regra normal, porque não conseguiriam levar o corpo para fora assim.' },
      { title: 'Escuridão', text: 'A caverna inteira está quase totalmente escura. Algumas criaturas, e algumas melhorias, têm vantagens no escuro.' },
      { title: 'A saída', text: 'A única saída é a borda sul da área inicial do Grupo de busca. Uma criatura sai da aventura se qualquer parte da base dela passar dessa borda, e é eliminada se não estiver levando a ficha de corpo.' },
      { title: 'As colunas', text: 'As colunas são estalactites e estalagmites unidas. São obstáculos de solo e de ar cujo dano não penetra a Armadura, mas não contam como obstáculos para Blackthorn.' },
      { title: 'Blackthorn conhece a caverna', text: 'Ele não voa tão bem ao ar livre, mas na própria casa é muito ágil. Se fosse terminar o movimento sobre uma coluna, ele pode girar a base para que alguma parte dela encoste na coluna, virado para onde quiser, desde que não fique sobre uma criatura inimiga. Ele ataca através das colunas como se elas não estivessem lá, mas quem ele ataca através delas ainda ganha +1 dado de defesa pela regra normal de obstáculos.' },
      { title: 'Ação: pegar o corpo', text: 'Um membro do Grupo de busca a alcance 1 da ficha de corpo pode usar a Ação para colocá-la na carta da criatura. Se a criatura que carrega o corpo for eliminada, deslizem a ficha para algum ponto embaixo da base dela antes de removê-la, onde o jogador do Grupo de busca preferir.' },
    ],
    objectives: [
      { side: 'Grupo de busca', text: ['Vence se eliminar Blackthorn ou se a criatura que carrega a ficha de corpo sair pela borda sul (depois da batalha 1).'] },
      { side: 'Blackthorn', text: ['Vence se eliminar o Grupo de busca (depois da batalha 2).'] },
    ],
    outcomes: [
      { id: '1', title: 'O corpo é recuperado', summary: 'Revistando o corpo de Legunt e a caverna, os vencedores entendem como o velho hobgoblin entrava em tantas bibliotecas: uma adaga mágica de cerâmica, numa bainha de vidro, que solta um ácido capaz de derreter o metal de qualquer fechadura. Leiam também o final 3.', rewards: ['Leiam o final 3'] },
      { id: '2', title: 'A serpe guarda a presa', summary: 'A velha serpe defende o corpo que capturou, enquanto alguns dos que vieram buscá-lo fogem mancando. Se tanta gente quer aquela carne, ela deve ter valor, pensa ele, e é melhor comê-la logo. Além disso, os que fugiram talvez não cheguem longe com o veneno dele no corpo. Leiam também o final 3.', rewards: ['Leiam o final 3'] },
      { id: '3', title: 'Uma história recente das Moonshae', summary: 'Depois de muitas perguntas a testemunhas, alguém acha a sacola que Legunt deixou cair quando foi atacado, e que Blackthorn largou sem perceber ao arrastá-lo para o covil. O livro dentro dela, Uma História Recente das Moonshae, aponta quem pode saber como entrar no castelo do rei gigante: a antiga governante da Ilha da Tempestade, a ilha inacessível onde a Agulha da Corrente está ancorada. É a rainha harpia Sycorax, hoje exilada numa ilha vizinha, de onde observa com amargura o território que perdeu. O autor duvida que ela aceite conversar sobre qualquer assunto, mas ela continua sendo a melhor chance de atravessar as tempestades que guardam o caminho até o Palácio de Luminos.', rewards: ['Jogador vencedor: 1 XP', 'Jogador vencedor recebe o Sulfuric Dagger'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 10, side: 'blackthorn', label: 'Blackthorn' },
        { x: 0, y: 78, w: 90, h: 12, side: 'busca', label: 'Grupo de busca (saída ao sul)' },
      ],
      tokens: [
        { x: 30, y: 6 }, { x: 68, y: 12 }, { x: 8, y: 25 }, { x: 36, y: 29 }, { x: 77, y: 31 },
        { x: 20, y: 42 }, { x: 60, y: 41 }, { x: 11, y: 70 }, { x: 45, y: 71 }, { x: 81, y: 71 },
        { x: 20, y: 18, label: 'corpo' },
      ],
      walls: [{ edge: 'N', label: 'Paredes da caverna', color: '#55505a' }, { edge: 'E', label: 'Paredes da caverna', color: '#55505a' }, { edge: 'W', label: 'Paredes da caverna', color: '#55505a' }],
      note: 'Blackthorn escolhe onde ficam as 10 colunas e o corpo. O mapa mostra uma distribuição possível.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 5.1,
    theme: 'Resgate de um corpo numa caverna escura, cheia de colunas, onde a serpe se move melhor que qualquer um.',
  },
  {
    slug: 'reconquista',
    number: 5.2,
    title: 'Reconquista',
    original: 'Reclamation',
    source: 'Livreto da expansão Harpy (Onda 3), aventura 5.2',
    players: 2,
    playArea: '90 x 90 cm, a ilha onde Sycorax vive exilada, diante da Ilha da Tempestade',
    components: ['1 ficha de jaula de 7,5 x 12,5 cm (3" x 5")', '3 fichas de elfo', 'A carta de melhoria Boots of Balance'],
    sides: [
      { id: 'sycorax', name: 'Sycorax e a comitiva', creatureUid: 2001, points: 120, color: '#d9822b', requires: 'Criaturas Malignas e Neutras; Sycorax com melhorias custa mais que qualquer outra criatura' },
      { id: 'resgate', name: 'Resgate', points: 120, color: '#8a3a9a', requires: 'Criaturas não malignas (110 pontos se incluir uma tropa de elfos)' },
    ],
    synopsis: [
      'Depois de semanas de negociação delicada com a rainha harpia Sycorax, o Culto do Dragão mandou uma comitiva de criaturas. Ela não é forte o bastante para assustar a rainha: veio entregar três prisioneiros elfos robustos e garantir que o Culto quer ver Sycorax de volta ao trono da Ilha da Tempestade. Em troca, ela só precisa ajudar o Culto a atravessar a tempestade até o interior da ilha, sob o olho do temporal. Para isso, a rainha harpia vai fazer um ritual antigo que exige o sacrifício de três elfos.',
      'Ao saber dos planos do Culto, os dragões bons juntaram às pressas uma força para salvar os elfos.',
    ],
    setup: [
      'Sycorax e a comitiva montam a legião com 120 pontos, só com criaturas Malignas e Neutras. Sycorax com as melhorias dela precisa custar mais que qualquer outra criatura com melhorias.',
      'O Resgate monta a legião com 120 pontos, só com criaturas não malignas, ou com 110 pontos se a legião incluir uma tropa de elfos.',
      'Coloquem a ficha de jaula a 30 cm (12", alcance 4) da borda inicial de Sycorax, no sul, à mesma distância das bordas leste e oeste. As 3 fichas de elfo ficam sobre a jaula.',
      'Os jogadores posicionam as criaturas nas áreas iniciais, pela preparação padrão para 2 jogadores: o Resgate ao norte e Sycorax ao sul.',
    ],
    specialRules: [
      { title: 'A jaula', text: 'A jaula guarda os elfos que a comitiva trouxe de "presente". Ela tem Valor de Fortificação 1 e 3 de Vida e é imune a veneno e a efeitos críticos. O VF funciona como Armadura, mas ataques que penetram Armadura não penetram o VF; críticos ainda passam. Os três elfos estão sem armadura, sem defesa e com 1 de Vida, e a jaula não os protege de ataques de área. A jaula e os elfos contam como criaturas terrestres para o texto das cartas.' },
      { title: 'Atirar através da jaula', text: 'Um ataque à distância que passa pela jaula pode acertar um elfo, a menos que seja um ataque que não é de área e ignora obstáculos ou criaturas no caminho, como o Precise Shot. Depois de declarar o ataque, rolem 1 dado de ataque: com acerto ou crítico, o tiro atinge um elfo no caminho e uma ficha de elfo sai da jaula. Senão, o ataque segue como declarado, e o alvo ainda ganha +1 dado de defesa por ser atacado através de um obstáculo.' },
      { title: 'Abrir a jaula', text: 'A jaula pode ser aberta sem ferir os elfos, mas só com ataques corpo a corpo. Se uma criatura do Resgate destruir a jaula com um ataque corpo a corpo, as 3 fichas de elfo vão para a carta dela. Se essa criatura for derrotada, os elfos também contam como derrotados.' },
      { title: 'Reforços élficos', text: 'Se os elfos forem soltos e o Resgate tiver uma tropa de elfos com pelo menos 1 soldado, os elfos que restarem viram reforços: para cada ficha de elfo resgatado, ponham 1 ficha de tropa de volta na carta da criatura e 1 soldado de verdade na formação. Ignorem o que passar de seis membros. As 3 fichas de elfo saem do jogo.' },
    ],
    objectives: [
      { side: 'Sycorax', text: [
        'Vence se eliminar o Resgate.',
        'Se os três prisioneiros ainda estiverem vivos na jaula, é vitória total (depois da batalha 2).',
        'Se algum elfo foi resgatado ou derrotado, é vitória parcial (depois da batalha 1).',
      ] },
      { side: 'Resgate', text: [
        'Vence se Sycorax e a comitiva forem eliminadas.',
        'Se os três elfos foram tirados da jaula, mesmo que derrotados depois, é vitória total (depois da batalha 3).',
        'Se os elfos ainda estiverem na jaula ou algum deles foi eliminado lá dentro, é vitória parcial (depois da batalha 3).',
      ] },
      { side: 'Empate', text: ['Se os dois lados forem eliminados ao mesmo tempo, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'Vitória parcial de Sycorax', summary: 'A rainha harpia grita de raiva: precisava daqueles elfos vivos, e exige que arranjem mais na mesma hora. Leiam também o final 2.', rewards: ['Sycorax: 1 XP'] },
      { id: '2', title: 'O ritual', summary: 'Sycorax manda pôr a jaula no lugar e mostra uma grande laje de pedra, retangular e coberta de selos. O sangue de três elfos vivos deve encher os três sulcos da pedra, cuja gêmea está na ilha, no olho da tempestade. Ela vai cantar as palavras que ligam as duas pedras, e um portal vai se abrir para atacar o usurpador que a expulsou e para que o Culto chegue ao palácio. Ela pede que mandem uma legião maior, porque vão precisar dela contra o inimigo.', rewards: ['Na vitória total: Sycorax ganha 2 XP e recebe o Boots of Balance, tirado de um dos prisioneiros sacrificados'] },
      { id: '3', title: 'A voz no ar', summary: 'Segundos depois da queda do último inimigo, o mundo parece se torcer em volta de um ponto no ar do outro lado da jaula, que cresce enquanto os vencedores observam assustados. Uma voz feminina, forte e melodiosa, diz que eles se saíram bem e provaram ser leais. Ela manda pegar uma moeda, juntar as Chaves e os aliados, e promete abrir um portal igual onde a moeda estiver dali a dois dias, para que eles a visitem no olho da tempestade. Uma moeda de prata aparece e cai no chão enquanto o portal se fecha com uma risada grave. A voz ainda avisa, divertida, para não guardar a moeda no bolso.', rewards: ['Vitória total: o Resgate ganha 2 XP e recebe o Boots of Balance de um elfo agradecido', 'Vitória parcial: o Resgate ganha 1 XP'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 10, side: 'resgate', label: 'Resgate' },
        { x: 0, y: 78, w: 90, h: 12, side: 'sycorax', label: 'Sycorax e a comitiva' },
        { x: 39, y: 56.5, w: 12.5, h: 3.5, side: 'resgate', label: 'Jaula' },
      ],
      tokens: [{ x: 41.5, y: 58.2 }, { x: 45.2, y: 58.2 }, { x: 48.9, y: 58.2 }],
      note: 'A jaula fica a 30 cm da borda sul, no centro entre leste e oeste, com os 3 elfos prisioneiros sobre ela.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 5.2,
    theme: 'Resgate de três prisioneiros elfos antes que a rainha harpia os sacrifique no ritual.',
  },
  {
    slug: 'uma-agulha-no-olho',
    number: 5.3,
    title: 'Uma agulha no olho',
    original: 'A Needle in the Eye',
    source: 'Livreto da expansão Silver Dragon (Onda 3), aventura 5.3',
    players: 2,
    playArea: '90 x 90 cm, o olho da tempestade na Ilha da Tempestade, em volta da Agulha da Corrente',
    components: ['1 ficha da Agulha da Corrente de 15 cm (6") de diâmetro', 'A carta de melhoria Monocle of the Twitching Tail'],
    sides: [
      { id: 'bem', name: 'Força dos dragões bons', creatureUid: 2101, points: 150, color: '#5b7fc4', requires: 'Vakka e aliados' },
      { id: 'culto', name: 'Força do Culto', points: 150, color: '#c0282d', requires: 'Quaisquer criaturas e melhorias' },
    ],
    synopsis: [
      'Os aventureiros a serviço dos dragões bons olham assombrados para a Agulha da Corrente, que sobe até sumir nas nuvens. Cada elo da corrente gigante foi forjado pelos anões séculos atrás, e a cada minuto um raio enorme desce por ela e faz o metal estalar. A Agulha fica no olho da tempestade, a única área segura da Ilha da Tempestade, cercada por um temporal giratório cheio de destroços voando.',
      'Diante deles está a guardiã da ilha, a antiga dragoa de prata Vakka, a Usurpadora que expulsou a rainha harpia Sycorax muitos anos antes. Ela se nomeou guardiã da ilha, sem saber que os dragões bons a procuravam, e ficou feliz de achar aliados depois de décadas sozinha. Ela avisa que o céu abre um pouco mais no alto, mas que ninguém deve se afastar demais nem chegar perto demais da Agulha. Nesse momento um portal, parecido com o que trouxe os aventureiros, se abre perto da borda sul do olho do temporal, e as forças do Culto do Dragão entram. Tudo vira caos.',
    ],
    setup: [
      'Cada lado monta a legião com 150 pontos. A Força dos dragões bons inclui Vakka e os aliados dela.',
      'Coloquem a ficha da Agulha da Corrente no centro da área.',
      'A área inicial de cada lado é metade de um anel em volta da Agulha: a metade norte para os dragões bons e a metade sul para o Culto. O anel vai de 15 a 30 cm (6" a 12") da ficha, ou seja, entre os alcances 3 e 4.',
      'As criaturas são posicionadas na ordem normal para 2 jogadores, com a base inteira dentro da sua metade do anel.',
      'Se o soldado da ponta de uma tropa for colocado de forma que não haja como montar a formação do resto da tropa, os soldados que não couberem numa formação válida ficam pressionados.',
    ],
    specialRules: [
      { title: 'A Agulha da Corrente', text: 'A ficha representa a corrente gigante que prende o palácio de Luminos. Ela é um Obstáculo de solo e de ar, e o dano que causa penetra a Armadura.' },
      { title: 'O olho e a tempestade', text: 'Ventos de tornado giram no sentido horário em volta do olho, que é a área circular até alcance 4 da Agulha. Depois que cada criatura faz qualquer manobra (inclusive as concedidas por investida, finta ou outra manobra especial), e antes de escolher a Ação, confiram se a base dela está inteira dentro do olho, a alcance 1 a 4 da ficha. Uma criatura, ou o soldado da ponta de uma tropa, que não estiver inteira no olho é levada pela tempestade na hora.' },
      { title: 'Destroços', text: 'Façam um ataque de 5 dados contra cada criatura levada pela tempestade. Ela não rola defesa, mas a Armadura protege normalmente. Se o soldado da ponta de uma tropa for pego, o dano conta como ataque de área contra a tropa inteira. Se o soldado da ponta estiver seguro no olho, os soldados que estiverem fora dele ficam pressionados.' },
      { title: 'Arrastada pelo vento', text: 'A criatura que sobreviver recebe pontos de vento: 1 por acerto e 2 por crítico rolados no ataque de 5 dados. Usem um gabarito de curva com esse número para movê-la no sentido horário em volta do olho; acima de 4, combinem gabaritos de curva que somem o total. Antes, virem a base para que o flanco direito fique voltado para a Agulha, com a borda da base paralela a ela, e movam a criatura para a frente. Se o movimento terminasse sobre outra criatura, continuem com mais gabaritos de curva até passar.' },
      { title: 'Tropas na tempestade', text: 'Se o soldado da ponta for pego, ele é movido como descrito, e todos os outros soldados sobreviventes ficam pressionados, agarrados uns aos outros.' },
      { title: 'Sem fôlego', text: 'Uma criatura que foi levada pela tempestade não faz Ação nem ataque nesse turno, mesmo que não tenha sofrido dano e que o vento não a tenha movido.' },
    ],
    objectives: [
      { side: 'Força do Culto', text: ['Vence se eliminar a Força dos dragões bons (depois da batalha 1).'] },
      { side: 'Força dos dragões bons', text: ['Vence se eliminar a Força do Culto (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se os dois lados forem eliminados na mesma rodada, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'O Culto domina o olho', summary: 'Quase morta, Vakka sussurra palavras de poder e se teleporta com os aliados feridos para longe. Um dos cultistas vitoriosos olha o céu limpo e imagina os três portões místicos do Palácio das Nuvens de Luminos, o Poderoso, satisfeito por ser o primeiro a vê-los.', rewards: ['Força do Culto: 2 XP', 'Força do Culto recebe o Monocle of the Twitching Tail'] },
      { id: '2', title: 'Os dragões bons vencem', summary: 'Vakka queria acabar com o inimigo moribundo, mas tinha prometido ao novo aliado dourado, o "Estorvo Dourado" como ela pensava nele, poupar os derrotados. Agora ela e os aliados olham para a Agulha da Corrente e se preparam para o voo sinuoso entre a corrente mortal e a borda da tempestade. Fazia muito tempo que ela tinha trocado o lar gelado por aquela ilha abafada, e ela fica feliz em entrar no grupo, ou melhor, em liderá-lo, na próxima etapa da viagem.', rewards: ['Força dos dragões bons: 2 XP', 'Força dos dragões bons recebe o Monocle of the Twitching Tail'] },
    ],
    map: {
      areas: [
        { x: 15, y: 15, w: 60, h: 15, side: 'bem', label: 'Dragões bons (metade norte do anel)' },
        { x: 15, y: 60, w: 60, h: 15, side: 'culto', label: 'Culto (metade sul do anel)' },
      ],
      tokens: [{ x: 45, y: 45, label: 'Agulha da Corrente' }],
      note: 'As áreas iniciais são as duas metades de um anel entre 15 e 30 cm da Agulha; o mapa simplifica como faixas. O olho da tempestade vai até alcance 4 da Agulha, e tudo além disso é temporal girando no sentido horário.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 5.3,
    theme: 'Batalha de 150 pontos no olho de um furacão que arrasta quem se afasta da corrente.',
  },
  {
    slug: 'o-portao-pulsante',
    number: 6.1,
    title: 'O Portão Pulsante',
    original: 'The Pulsating Gate',
    source: 'Livreto da expansão Gold Dragon (Onda 4), aventura 6.1',
    players: 2,
    playArea: '90 x 90 cm, a câmara do Portão Pulsante no Palácio de Luminos',
    components: ['2 fichas de pulso de 5 x 5 cm (2" x 2") com entalhes, uma positiva e uma negativa', '1 ficha de iniciativa', 'A carta de melhoria Luck Gem'],
    sides: [
      { id: 'guardioes', name: 'Guardiões do Portão', points: 150, color: '#7a3a9a', requires: 'Quaisquer criaturas e melhorias' },
      { id: 'chaveiros', name: 'Mestres da Chave', points: 150, color: '#c0282d', requires: 'O lado que ganhou o Tuning Fork of Neutrality na aventura 4.3' },
    ],
    synopsis: [
      'O Palácio de Luminos, o Poderoso, tem 3 portões externos, e cada um só abre com a Chave certa. Por longos meses os dragões malignos e os inimigos deles procuraram essas Chaves, e agora cada uma está nas mãos de um dos lados. O Portão Pulsante foi aberto pelo Tuning Fork of Neutrality, a Chave entregue pelo anjo deva movânico Sarpiel.',
      'O dragão de ouro Pacatus, um dos principais dragões bons que mandaram Galadaeros na missão, trouxe aliados para proteger o portão dos dragões malignos. Outro grupo acabou de chegar, cansado dessa gente intrometida, e decidido a fazer a sua própria dissuasão. O problema é que dentro da câmara há duas sentinelas de energia pura que flutuam na direção dos grupos: uma irradia ondas de energia brilhante, a outra é cercada por uma aura escura e parasita.',
    ],
    setup: [
      'Os Guardiões do Portão montam a legião com 150 pontos. Os Mestres da Chave montam a legião com 150 pontos: é o lado que ganhou o artefato Tuning Fork of Neutrality na aventura 4.3, Os olhos sempre atentos.',
      'Pelo menos um dos lados precisa incluir Pacatus.',
      'Coloquem a ficha de pulso positiva centralizada na borda oeste e a negativa centralizada na borda leste, com os entalhes virados para leste e oeste.',
      'Os jogadores posicionam as criaturas nas áreas iniciais pela preparação padrão para 2 jogadores: os Guardiões ao norte e os Mestres da Chave ao sul.',
      'A ficha de iniciativa é obrigatória nesta aventura, mesmo que não haja criaturas do mesmo Nível dos dois lados. Usem a regra de Iniciativa na Construção da Legião, na página 28 do livro de regras completo, para decidir quem começa com ela. Ela passa para o adversário na Fase Final, como de costume.',
    ],
    specialRules: [
      { title: 'As sentinelas de energia', text: 'As fichas de pulso se movem como criaturas voadoras, inclusive para sobreposição, mas não podem ser atacadas nem sofrer dano.' },
      { title: 'O pulso', text: 'No começo da Fase Final, o jogador com a ficha de iniciativa escolhe uma das fichas de pulso e a move com o gabarito reto ou de curva 1 ou 2, encaixado num dos entalhes (da frente ou de trás). Se o movimento levaria a ficha para fora da área, ela não se move nessa rodada. Depois de mover, a ficha causa 1 de dano a todas as criaturas no solo e no ar a alcance 1 dela. Ninguém rola defesa, e o dano ignora toda Armadura, mesmo a que não pode ser penetrada. Criaturas do mesmo tipo de energia (positiva ou negativa) ignoram esse dano, e quem carrega o Tuning Fork of Neutrality é imune aos dois tipos.' },
      { title: 'A outra sentinela', text: 'Em seguida, o jogador sem a ficha de iniciativa move a outra ficha de pulso do mesmo jeito, e o dano é aplicado de novo a alcance 1 dela.' },
      { title: 'Choque entre as sentinelas', text: 'Se uma ficha de pulso passar por cima, encostar ou se sobrepor à outra, em vez de 1 de dano às criaturas ao redor, façam um ataque de 5 dados contra cada criatura a alcance 1 das duas fichas, no ponto onde elas se encontraram. Ninguém rola defesa, e o dano ignora toda Armadura. Criaturas de energia positiva ou negativa podem ignorar 1 acerto ou crítico à escolha delas, e quem carrega o Tuning Fork of Neutrality pode ignorar 2.' },
    ],
    objectives: [
      { side: 'Guardiões do Portão', text: ['Vencem se os Mestres da Chave forem eliminados.'] },
      { side: 'Mestres da Chave', text: ['Vencem se os Guardiões do Portão forem eliminados.'] },
      { side: 'Qual final ler', text: ['Se o lado de Pacatus vencer, leiam o final 1. Se não, leiam o final 2. Se os dois lados forem eliminados na mesma rodada, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'Pacatus vence', summary: 'Depois de curar a si mesmo e aos sobreviventes dos dois lados, de olho nas sentinelas flutuantes, Pacatus pega o Tuning Fork of Neutrality e bate com ele perto do ouvido. Uma nota pura soa, e as sentinelas de energia se aproximam uma da outra e param a uns vinte passos de distância. Talvez a Luck Gem que ele preparou de manhã o tenha ajudado a descobrir o verdadeiro poder do diapasão. Com a câmara segura, ele toca a runa no centro e ouve um grande mecanismo girar dentro das muralhas. A câmara não leva mais para dentro da fortaleza, mas ele está um passo mais perto do pátio do palácio e do Cemitério Primordial.', rewards: ['Pacatus: 1 XP', 'Pacatus recebe a Luck Gem'] },
      { id: '2', title: 'O lado de Pacatus perde', summary: 'O vilão diz que aquilo vai ensinar Pacatus a pensar antes de se meter e bate com tanta força no ombro do dragão ferido que solta uma escama dourada. Embaixo dela brilha uma joia, que a criatura maligna pega na hora e testa com o Tuning Fork of Neutrality para ver se tem alguma proteção. As sentinelas de energia se aproximam e param a uns vinte passos uma da outra. Sorrindo, a criatura toca a runa no centro da câmara e ouve um grande mecanismo girar dentro das muralhas: está um passo mais perto do pátio do palácio e do Cemitério Primordial.', rewards: ['Jogador vencedor: 1 XP', 'Jogador vencedor recebe a Luck Gem'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'guardioes', label: 'Guardiões do Portão' },
        { x: 0, y: 75, w: 90, h: 15, side: 'chaveiros', label: 'Mestres da Chave' },
      ],
      tokens: [{ x: 3, y: 45, label: 'pulso positivo' }, { x: 87, y: 45, label: 'pulso negativo' }],
      note: 'O pulso positivo começa no centro da borda oeste e o negativo no centro da borda leste, com os entalhes virados para leste e oeste.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 6.1,
    theme: 'Batalha de 150 pontos entre duas sentinelas de energia que os jogadores empurram rodada a rodada.',
  },
  {
    slug: 'o-portao-da-ventania',
    number: 6.2,
    title: 'O Portão da Ventania',
    original: 'The Gale Force Gate',
    source: 'Livreto da expansão Gargoyle (Onda 4), aventura 6.2',
    players: 2,
    playArea: '90 x 90 cm, a câmara do Portão da Ventania, com o poleiro de Malebolge ao fundo',
    components: ['2 fichas de basilisco de 4 cm (1,5") com entalhe', '10 fichas de dano', '10 fichas de petrificação', 'A carta de melhoria Bag of Winds'],
    sides: [
      { id: 'malebolge', name: 'Malebolge', creatureUid: 2401, points: 50, color: '#5b8fc4', requires: 'Malebolge e melhorias' },
      { id: 'invasores', name: 'Invasores do Portão', points: 90, color: '#c0282d', requires: 'O lado que ganhou o 7th Shard of Law na aventura 4.1' },
    ],
    synopsis: [
      'O Portão da Ventania é guardado por gárgulas desde pouco depois de ser construído, mas o tempo cobrou o seu preço até dessas criaturas, e só sobrou Malebolge. Ele e as duas estátuas mágicas de basilisco, Leão e Tigre, foram postos ali para pegar e matar qualquer coisa que entrasse pelo portão.',
      'Faz séculos que ele não tem uma luta decente, mas paciência é algo que uma gárgula entende. Agora essa paciência vai ser recompensada: chegaram criaturas com a Chave, provavelmente achando que só ela basta para passar em segurança até o pátio do palácio. No poleiro do outro lado da câmara, Malebolge ri da ideia.',
    ],
    setup: [
      'Malebolge monta a legião com 50 pontos. Os Invasores do Portão montam a legião com 90 pontos: é o lado que ganhou o artefato 7th Shard of Law na aventura 4.1, O abismo uivante.',
      'Malebolge se coloca de costas para o centro da borda norte, a borda inicial dele, e depois coloca as 2 fichas de basilisco em qualquer outro ponto da área inicial dele.',
      'Depois os Invasores colocam as criaturas na área inicial deles, no sul. Deixem as fichas de dano e de petrificação ao lado da mesa por enquanto.',
    ],
    specialRules: [
      { title: 'Os basiliscos', text: 'Cada ficha de basilisco é uma criatura terrestre sem dados de ataque nem de defesa, com Armadura 0 e 5 de Vida, imune a efeitos críticos. Marquem o dano de cada basilisco com fichas de dano ao lado dele. Um basilisco que recebe dano letal sai da área na hora, sem esperar a Fase Final.' },
      { title: 'O olhar de pedra', text: 'No fim da Fase de Ativação, depois que todas as outras criaturas se moveram, Malebolge controla os 2 basiliscos. Cada um pode girar livremente para qualquer direção ou andar para a frente com o gabarito reto 1, 2 ou 3. Logo depois de se mover, o basilisco pode pôr 1 ficha de petrificação numa criatura a alcance 1 a 3 no arco de ataque frontal dele.' },
      { title: 'Petrificação', text: 'Cada criatura com fichas de petrificação rola -1 dado de ataque e -1 dado de defesa por ficha. Isso pode tirar todos os dados de defesa dela, mas ela sempre rola pelo menos 1 dado de ataque. Se a soma de fichas de petrificação e Cartas de Dano chegar à Vida da criatura, ela vira pedra para sempre: conta como derrotada e sai da área na hora, sem esperar a Fase Final.' },
      { title: 'Desfazer a pedra', text: 'No começo da Fase Final, se os dois basiliscos já foram derrotados, os Invasores podem tirar 1 ficha de petrificação de uma das criaturas sobreviventes deles. Uma criatura que já virou pedra por inteiro não pode ser recuperada.' },
    ],
    objectives: [
      { side: 'Malebolge', text: ['Vence se os Invasores do Portão forem eliminados (depois da batalha 1).'] },
      { side: 'Invasores do Portão', text: ['Vencem se eliminarem Malebolge e os basiliscos (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se os dois lados forem eliminados na mesma rodada, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'A gárgula vence', summary: 'Um canto da boca de granito de Malebolge se curva para cima: a espera valeu a pena. Ele pega o 7th Shard of Law, uma relíquia dos aarakocras que ele despreza, e ela queima as mãos dele. Uma runa embaixo do poleiro brilha e um vento forte varre a câmara sem tocá-lo. Ele ouve um grande mecanismo girar dentro das muralhas sem entender o que significa, e quando o vento passa volta ao poleiro para esperar a próxima vítima, desconfiado da bolsa mágica que surgiu no centro da câmara.', rewards: ['Malebolge: 1 XP', 'Malebolge recebe o Bag of Winds'] },
      { id: '2', title: 'O portão é vencido', summary: 'O vencedor, de pé sobre os restos de Malebolge e dos bichos dele, leva a Chave até o poleiro da gárgula. O nome do portão faz sentido na hora: ventos tão fortes quanto os da tempestade lá embaixo jogam tudo e todos para fora da câmara, menos quem segura o 7th Shard of Law, que fica numa bolha de calma. Um grande mecanismo gira dentro das muralhas, o vento para, e no centro da câmara fica uma bolsa mágica com propriedades maravilhosas.', rewards: ['Invasores do Portão: 1 XP', 'Invasores do Portão recebem o Bag of Winds'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 12, side: 'malebolge', label: 'Malebolge e basiliscos' },
        { x: 0, y: 78, w: 90, h: 12, side: 'invasores', label: 'Invasores do Portão' },
      ],
      tokens: [{ x: 45, y: 4, label: 'Malebolge' }, { x: 25, y: 7, label: 'basilisco' }, { x: 65, y: 7, label: 'basilisco' }],
      note: 'Malebolge começa de costas para o centro da borda norte. Os dois basiliscos ficam em qualquer outro ponto da área inicial dele.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 6.2,
    theme: 'Uma gárgula paciente e dois basiliscos que transformam os invasores em pedra.',
  },
  {
    slug: 'o-portao-sussurrante',
    number: 6.3,
    title: 'O Portão Sussurrante',
    original: 'The Whispering Gate',
    source: 'Livreto da expansão Stone Giant (Onda 4), aventura 6.3',
    players: 2,
    playArea: '90 x 90 cm, a câmara do Portão dos Sussurros, com o arco selado ao norte',
    components: ['1 ficha de arco de 15 x 2,5 cm (6" x 1")', '1 ficha da Umbra (Shadowfell)', 'A carta de melhoria Ring of Freedom of Movement'],
    sides: [
      { id: 'ancoram', name: 'Ancoram', creatureUid: 2501, points: 50, color: '#5b8fc4', requires: 'Ancoram e melhorias' },
      { id: 'despertadores', name: 'Os que o acordaram', points: 90, color: '#c0282d', requires: 'O lado que ganhou The Ebon Cloak na aventura 4.2' },
    ],
    synopsis: [
      'O ancião gigante de pedra Ancoram dorme em animação suspensa há muitos séculos, a pedido dele mesmo, como recompensa por ter construído a âncora de pedra que prende a Agulha da Corrente no chão e o arremate na outra ponta, que segura o Palácio de Luminos. Também foi ele quem criou as runas de pedra espalhadas pelo palácio, que ativam os mecanismos internos.',
      'Uma maldição poderosa, vinda de uma força maligna no fundo do palácio, caiu sobre a runa de pedra do outro lado desta câmara. A lanterna de latão que seria a Chave virou pó, e a magia passou para o pano sujo com que Ancoram polia a runa, que ficou negro como breu. Esse pano virou The Ebon Cloak, a Chave da câmara, e o portão começou a sussurrar pensamentos sombrios para o mundo. O feitiço que mantém Ancoram vivo e adormecido se alimentava da energia da Umbra que sairia do Portão dos Sussurros. Com a volta da Chave, o feitiço se rompe, e ondas mortais de energia da Umbra saem da runa. Acordado pelo anel encantado, o gigante fica furioso e decide não deixar os intrusos chegarem à runa, que está sob um enorme arco selado que ele vai guardar até o último suspiro.',
    ],
    setup: [
      'Ancoram monta a legião com 50 pontos. Os que o acordaram montam a legião com 90 pontos: é o lado que ganhou o artefato The Ebon Cloak na aventura 4.2, Uma noite de sombras.',
      'Coloquem a ficha de arco centralizada, com o lado comprido encostado na borda inicial de Ancoram, ao norte.',
      'Depois os jogadores posicionam as criaturas nas áreas iniciais pela preparação padrão para 2 jogadores: Ancoram ao norte e os que o acordaram ao sul.',
    ],
    specialRules: [
      { title: 'Ondas da Umbra', text: 'Ondas de energia de sombra saem do portão em intervalos regulares e em várias direções. Ancoram conhece o padrão e costuma conseguir desviar delas.' },
      { title: 'O cone de sombra', text: 'No começo da Fase Final, Ancoram coloca a ficha da Umbra com a ponta encostada na marca central da ficha de arco e a parte larga apontando para onde ele quiser. A ficha marca o arco de um ataque em cone que atinge todas as criaturas a alcance 1 a 4 da borda arredondada, dentro do arco de 60 graus da ficha.' },
      { title: 'Quem a sombra atinge', text: 'As criaturas no cone com a palavra-chave sombra, inclusive quem está equipado com The Ebon Cloak, sofrem 1 de dano normal. As outras criaturas no cone, inclusive Ancoram se estiver nele, sofrem 1 de dano crítico. Ninguém rola defesa, e o dano ignora toda Armadura, mesmo a que não pode ser penetrada. Depois tirem a ficha da Umbra, para que ela seja colocada de novo na rodada seguinte.' },
    ],
    objectives: [
      { side: 'Ancoram', text: ['Vence no fim de qualquer rodada em que todos os inimigos dele tenham sido eliminados (depois da batalha 1).'] },
      { side: 'Os que o acordaram', text: ['Vencem se Ancoram for eliminado (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se os dois lados forem eliminados na mesma rodada, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'Ancoram defende o arco', summary: 'Ele sabe que não vai conseguir voltar a dormir, mas talvez ainda dê para evitar que o palácio seja invadido de vez se correr. Pega uma caixa de pedra pequena e grossa que construiu há muito tempo para isso e guarda a capa nela. Quando vai fechar a caixa, ouve o som que temia: as grandes engrenagens de pedra que ele fez dentro das muralhas estão girando e realinhando o portão num padrão que pode destrancar o portão do pátio. Frustrado, ele quebra a caixa. Se os outros cilindros da fechadura mística também já giraram, a entrada do pátio de Luminos, o Poderoso, está aberta de novo.', rewards: ['Ancoram: 1 XP', 'Ancoram recebe o Ring of Freedom of Movement'] },
      { id: '2', title: 'O gigante cai', summary: 'Os sussurros tinham dito ao vencedor que não deixasse nada detê-lo, porque havia grandes recompensas ao alcance. Ele ouviu e ainda está ouvindo, mesmo quando os ecos são abafados pelo som de um grande mecanismo atrás das paredes. O portão do pátio do palácio finalmente se abriu.', rewards: ['Os que o acordaram: 1 XP', 'Os que o acordaram recebem o Ring of Freedom of Movement'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 12, side: 'ancoram', label: 'Ancoram' },
        { x: 0, y: 78, w: 90, h: 12, side: 'despertadores', label: 'Os que o acordaram' },
      ],
      tokens: [{ x: 37.5, y: 1.5, label: 'arco' }, { x: 45, y: 1.5, label: 'arco' }, { x: 52.5, y: 1.5, label: 'arco' }, { x: 45, y: 8, label: 'Umbra' }],
      note: 'O arco de 15 x 2,5 cm fica centralizado na borda norte. A ficha da Umbra não está na mesa no começo: Ancoram a coloca em cada Fase Final, com a ponta no centro do arco.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 6.3,
    theme: 'Um gigante recém-acordado e ondas de sombra que varrem a câmara a cada rodada.',
  },
  {
    slug: 'combate-de-perto',
    number: 7.1,
    title: 'Combate de perto',
    original: 'Close Quarters',
    source: 'Livreto da expansão Drow Elf Ranger (Onda 5), aventura 7.1',
    players: 2,
    playArea: '90 x 90 cm, o pátio murado do palácio de Luminos, coberto por uma Muralha de Energia',
    components: ['Nenhum componente especial', 'A carta de melhoria Spider Silk Shirt'],
    sides: [
      { id: 'drizzt', name: 'Forças de Drizzt', creatureUid: 2701, points: 120, color: '#3a56b0', requires: 'Drizzt com aliados Neutros e Bons' },
      { id: 'culto', name: 'Forças do Culto do Dragão', points: 120, color: '#c0282d', requires: 'Só criaturas Neutras e Malignas' },
    ],
    synopsis: [
      'Quem vive tanto quanto um elfo ou um dragão tem tempo de acumular muitos juros numa dívida. É nisso que Drizzt Do\'Urden pensa ao entrar no pátio de Luminos, o Poderoso. O portão do pátio finalmente abriu, depois que três mecanismos escondidos foram ativados em câmaras secretas nas bordas do palácio do gigante das nuvens. O dragão de ouro Pacatus, a quem Drizzt deve um favor e que o trouxe até ali, avisou que qualquer coisa pode acontecer naquele pátio majestoso. Por enquanto Drizzt só vê belas estátuas de heróis e divindades antigas, e saca as cimitarras mesmo assim, porque o que é bonito pode ser perigoso.',
      'Olhando para cima, ele entende por que o pátio aberto não pode ser invadido pelo céu: os ventos de fora não passam por uma barreira invisível, provavelmente uma Muralha de Energia. Ele acha bom, porque isso dificulta o voo e ele prefere a luta de perto. Logo um estrondo atrás dele mostra os companheiros entrando às pressas no pátio, e alguém grita que as forças do Culto do Dragão chegaram. Drizzt está pronto.',
    ],
    setup: [
      'Cada lado monta a legião com 120 pontos. As Forças de Drizzt incluem Drizzt e aliados Neutros e Bons. As Forças do Culto do Dragão usam só criaturas Neutras e Malignas.',
      'Os jogadores posicionam as criaturas nas áreas iniciais pela preparação padrão para 2 jogadores: Drizzt ao norte e o Culto ao sul.',
    ],
    specialRules: [
      { title: 'Muros do pátio', text: 'As bordas da área são os muros do pátio. Uma criatura que fosse terminar o movimento fora da área não é derrotada: recua até ficar inteira dentro da área. Uma criatura voadora nessa situação precisa pousar na hora.' },
      { title: 'A Muralha de Energia', text: 'Como uma Muralha de Energia fecha o alto do pátio, cada criatura voadora começa o jogo com uma ficha de rasante. No passo de mudar de altitude da Fase de Ativação, cada criatura voadora escolhe se continua em rasante ou se pousa. Uma criatura voadora que decola do solo recebe uma ficha de rasante na hora.' },
    ],
    objectives: [
      { side: 'Forças de Drizzt', text: ['Vencem se todas as Forças do Culto forem eliminadas (depois da batalha 1).'] },
      { side: 'Forças do Culto do Dragão', text: ['Vencem se todas as Forças de Drizzt forem eliminadas (depois da batalha 2).'] },
    ],
    outcomes: [
      { id: '1', title: 'Drizzt vence', summary: 'Drizzt e os aliados recuperam o fôlego e seguem até as grandes portas de adamantina no fim do pátio. O patrulheiro drow levou alguns golpes fortes, mas a camisa de seda de aranha desviou o pior. As portas são grossas e enormes, largas o bastante para gigantes e dragões, mas ninguém acha o mecanismo que as abre. Enquanto os dragões batem e sopram contra elas sem resultado, Drizzt examina as paredes em volta do arco e acha uma trava que abre uma porta secreta, pequena demais para os aliados maiores. Ele chama quem couber para entrar e tentar abrir as portas por dentro.', rewards: ['Forças de Drizzt: 1 XP', 'Forças de Drizzt recebem o Spider Silk Shirt'] },
      { id: '2', title: 'O Culto vence', summary: 'O líder das forças do Culto revira o pátio e tira a camisa de seda de aranha do rival drow desacordado. Um aliado avisa que as grandes portas do palácio não abrem por mais que batam, mas que um batedor achou uma passagem pequena. O cultista aprova e aponta para as estátuas, antes belas, agora em pedaços pelo pátio: já quebrou ossos e estátuas o bastante por um dia.', rewards: ['Forças do Culto: 1 XP', 'Forças do Culto recebem o Spider Silk Shirt'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'drizzt', label: 'Forças de Drizzt' },
        { x: 0, y: 75, w: 90, h: 15, side: 'culto', label: 'Forças do Culto' },
      ],
      tokens: [],
      walls: [{ edge: 'all', label: 'Muros do pátio', color: '#55505a' }],
      note: 'Todas as bordas são muros. Quem voa fica em rasante por causa da Muralha de Energia no alto.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 7.1,
    theme: 'Luta de 120 pontos num pátio murado onde ninguém consegue voar alto.',
  },
  {
    slug: 'o-salao-de-luminos',
    number: 7.2,
    title: 'O salão de Luminos, o Poderoso',
    original: 'The Hall of Luminos the Mighty',
    source: 'Livreto da expansão Young Bronze Dragon (Onda 5), aventura 7.2',
    players: 2,
    playArea: '90 x 90 cm, o grande salão do trono de Luminos, pouco iluminado',
    components: ['Nenhum componente especial', 'A carta de melhoria Pearl of Power'],
    sides: [
      { id: 'eyruaad', name: 'Forças de Eyruaad', creatureUid: 2801, points: 120, color: '#3a56b0', requires: 'Eyruaad com aliados Neutros e Bons' },
      { id: 'culto', name: 'Forças do Culto do Dragão', points: 120, color: '#c0282d', requires: 'Só criaturas Neutras e Malignas' },
    ],
    synopsis: [
      'O jovem dragão de bronze Eyruaad, filho da ilustre Quelindritar, se pergunta de novo como virou a maior criatura da sala pela primeira vez na vida. Como as portas de adamantina do pátio não cederam, acharam uma passagem secreta pequena demais para os dragões grandes. A mãe dele e outros dragões tentaram se transformar em humanos, mas um encanto do pátio força todos à forma original. Os lacaios seguiram na frente para tentar abrir as portas por dentro, e Eyruaad, pequeno o bastante para se espremer pela passagem, ficou na retaguarda. Uma entrada sem dignidade, mas da qual ele se orgulha, porque adora provar o seu valor aos outros dragões.',
      'Parece que havia duas passagens, porque Eyruaad e os companheiros estão diante de uma força inimiga também feita de criaturas menores. Os dois lados hesitam, maravilhados com o salão, que deve ter sido glorioso milhares de anos atrás, no auge do poder de Luminos. E veem pela primeira vez o gigante das nuvens: Luminos, o Poderoso, sentado para sempre no trono, agora só um esqueleto colossal em trajes rasgados, com um cetro encimado por uma pérola no colo. Até a visão mais impressionante só prende os ambiciosos por um tempo. Os dois lados percebem que os segredos da câmara vão ser revelados a uma só facção, e esse vai ser o maior prêmio da batalha.',
    ],
    setup: [
      'Cada lado monta a legião com 120 pontos. As Forças de Eyruaad incluem Eyruaad e aliados Neutros e Bons. As Forças do Culto do Dragão usam só criaturas Neutras e Malignas.',
      'Todas as criaturas, menos Eyruaad, precisam ter base pequena. Se os jogadores não tiverem criaturas de base pequena suficientes, podem usar criaturas de base grande, mas cada uma custa +10 Pontos de Legião.',
      'Os jogadores posicionam as criaturas nas áreas iniciais pela preparação padrão para 2 jogadores: Eyruaad ao norte e o Culto ao sul.',
    ],
    specialRules: [
      { title: 'Paredes do salão', text: 'As bordas da área são as paredes do salão. Uma criatura que fosse terminar o movimento fora da área não é derrotada: recua até ficar inteira dentro da área. Uma criatura voadora nessa situação precisa pousar na hora.' },
      { title: 'Salão escuro', text: 'O salão antigo é mal iluminado, e todas as criaturas de sombra contam como "no escuro".' },
    ],
    objectives: [
      { side: 'Forças de Eyruaad', text: ['Vencem se todas as Forças do Culto forem eliminadas.'] },
      { side: 'Forças do Culto do Dragão', text: ['Vencem se todas as Forças de Eyruaad forem eliminadas.'] },
    ],
    outcomes: [
      { id: '1', title: 'Luminos se levanta', summary: 'Uma voz poderosa grita "Basta!". A poeira do trono se mexe e o esqueleto gigante se levanta, erguendo o cetro. Ele diz que esperou muito pelos guerreiros: uma profecia antiga anunciou que ele abriria o caminho para o Cemitério Primordial quando o seu salão de banquetes virasse campo de batalha, e isso acaba de acontecer diante dos olhos frios dele. Um portal mágico brilhante se abre ao lado do trono, e ao mesmo tempo as portas de adamantina do pátio se abrem. Lá fora a batalha recomeçou com força, com mais tropas dos dragões bons e malignos chegando. Mas a luta para quando todos veem Luminos. Ele proíbe mais combate no salão sagrado e explica que o cemitério fica num plano distante do nosso. Os vencedores do salão têm o direito de entrar primeiro no Portal com os aliados, e os rivais podem segui-los depois, para que todos encontrem o destino anunciado quando as estrelas eram jovens. Enquanto o exército vencedor se prepara, o esqueleto real tira a pérola cintilante do cetro e, inclinando a cabeça em respeito, entrega a joia como prêmio pela coragem.', rewards: ['Força vencedora: 2 XP', 'Força vencedora recebe o Pearl of Power'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'eyruaad', label: 'Forças de Eyruaad' },
        { x: 0, y: 75, w: 90, h: 15, side: 'culto', label: 'Forças do Culto' },
      ],
      tokens: [],
      walls: [{ edge: 'all', label: 'Paredes do salão', color: '#55505a' }],
      note: 'Todas as bordas são paredes. Só criaturas de base pequena, com exceção de Eyruaad.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 7.2,
    theme: 'Criaturas pequenas lutam no salão escuro diante do esqueleto de Luminos pelo direito de entrar primeiro no Cemitério.',
  },
  {
    slug: 'aniquilacao-e-vitoria',
    number: 7.3,
    title: 'Aniquilação e vitória',
    original: 'Annihilation and Victory',
    source: 'Livreto da expansão Red Dracolich (Onda 5), aventura 7.3',
    players: 2,
    playArea: '90 x 90 cm, o Cemitério Primordial (pode ser maior se a batalha tiver mais pontos)',
    components: ['7 fichas de objetivo, numeradas de 1 a 7 (as proteções antigas)', 'As cartas de melhoria Talisman of Ultimate Evil e Talisman of Pure Good'],
    sides: [
      { id: 'mal', name: 'Dragões malignos', creatureUid: 2901, points: 200, color: '#c0282d', requires: 'Maurghoros com aliados Neutros e Malignos; Balagos não pode ser usado' },
      { id: 'bem', name: 'Dragões bons', points: 200, color: '#3aa0d8', requires: 'Só criaturas Neutras e Boas' },
    ],
    synopsis: [
      'O exército vencedor atravessa o portal para o Cemitério Primordial, seguido logo depois pelo exército inimigo. O tamanho e a grandeza do lugar superam tudo o que imaginavam: tesouros poderosos estão espalhados entre os ossos de dragões antigos, intocados desde o começo dos tempos. Na hora, uma voz troveja pedindo que os servos a libertem da prisão de eras. Todos olham para a origem da voz: uma gema negra flutuando logo além da borda do cemitério, um filactério de dragão antigo cheio de energia necrótica, que guarda uma alma de escuridão primordial.',
      'Balagos, o dragão vermelho, sente o poder e avança antes que alguém o segure. Claugiyliamatar grita para ele esperar, e Eshaedra só sorri. No primeiro passo fora do cemitério, uma onda de energia sobe sob os pés de Balagos, com raios, fogo, ácido, frio e luz radiante rasgando o corpo e a alma dele, e ele cai morto com um olhar de traição. Quelindritar reconhece as proteções antigas, e Pacatus nota que funcionaram até bem demais: a energia sombria sai do filactério e entra no corpo destroçado de Balagos, que se levanta com um brilho vermelho nos olhos destruídos. É Maurghoros, um dragão mais velho que o mundo e antigo consorte de Tiamat, que se declara o novo senhor dos dragões. Eshaedra e o Wyrmspeaker Rezmir correm para o lado dele. Nymmestra acusa Quelindritar de saber de tudo, e a anciã de bronze admite: eles conheciam a profecia do retorno de Maurghoros e queriam estar ali quando acontecesse, porque só ali, no Cemitério Primordial, há um jeito de destruir o espírito dele para sempre. Vakka discorda do plano, mas fica. Drizzt saca as cimitarras e chama a pantera Guenhwyvar, e o elfo Limnen manda os arqueiros se prepararem. Maurghoros dá a ordem, e a batalha do Cemitério Primordial começa.',
    ],
    setup: [
      'Cada lado monta a legião com 200 pontos. Os Dragões malignos incluem Maurghoros e aliados Neutros e Malignos; Balagos não pode ser usado nesta aventura. Os Dragões bons usam só criaturas Neutras e Boas.',
      'Os jogadores podem combinar mais de 200 pontos para deixar a batalha final ainda maior. Nesse caso, usem uma área maior que 90 x 90 cm e ajustem as medidas.',
      'Embaralhem as 7 fichas de objetivo e coloquem viradas para baixo como no mapa: uma no centro exato, duas ao lado dela, a leste e a oeste, e as outras perto das áreas iniciais, a 23 cm (9") delas.',
      'Os jogadores posicionam as criaturas nas áreas iniciais pela preparação padrão para 2 jogadores: os Dragões malignos ao norte e os Dragões bons ao sul.',
    ],
    specialRules: [
      { title: 'As proteções antigas', text: 'As fichas de objetivo não são obstáculos. Elas representam proteções antigas que os dragões bons podem ativar. Enquanto houver qualquer ficha de objetivo na área, Maurghoros não pode ser derrotado, não importa quanto dano receba.' },
      { title: 'Ação: ativar uma proteção', text: 'Uma criatura dos Dragões bons, ou o soldado da ponta de uma tropa desse lado, a alcance 1 de uma ficha virada para baixo, pode usar a Ação para revelá-la e aplicar o efeito dela. Só pode haver 1 ficha virada para cima por vez: ninguém faz essa Ação se já houver uma.' },
      { title: 'Fim da proteção', text: 'No começo da Fase Final, tirem da área a ficha virada para cima, que deixa de ter efeito. Quando a última ficha sair da área, Maurghoros é aniquilado na hora, com ou sem dano, e os Dragões bons vencem a aventura.' },
      { title: 'Ficha 1: energia positiva', text: 'Uma onda de energia positiva percorre o campo. Cada criatura remove 1 Carta de Dano virada para baixo, se puder. Criaturas de energia negativa recebem 1 Carta de Dano virada para baixo em vez disso.' },
      { title: 'Ficha 2: chuva ácida', text: 'Cada criatura, menos as de ácido, vira 1 ficha de Armadura para o lado quebrado. Cada criatura sem ficha de Armadura virada para cima recebe 1 Carta de Dano virada para baixo em vez disso. Criaturas de ácido são imunes.' },
      { title: 'Ficha 3: energia vampírica', text: 'Cada criatura, menos as de energia negativa, com pelo menos 1 Carta de Dano virada para baixo escolhe uma delas ao acaso, vira para cima e sofre o efeito da carta na hora.' },
      { title: 'Ficha 4: ventos gelados', text: 'Nenhuma criatura, menos as de frio, pode fazer Ações pelo resto da rodada.' },
      { title: 'Ficha 5: magia selvagem', text: 'Nesta rodada, quem ataca com uma melhoria de feitiço pode rolar os dados de ataque duas vezes seguidas e escolher qual resultado manter.' },
      { title: 'Ficha 6: música de heroísmo', text: 'Todas as criaturas rolam +1 dado de ataque sempre que atacam nesta rodada.' },
      { title: 'Ficha 7: esfera de aniquilação', text: 'Uma esfera de aniquilação aparece sobre o campo de batalha. Cada criatura precisa descartar na hora 1 melhoria à sua escolha.' },
    ],
    objectives: [
      { side: 'Dragões malignos', text: [
        'Vencem se todas as forças dos Dragões bons forem eliminadas (depois da batalha 1).',
        'Se isso acontecer durante a Fase de Combate, por exemplo pela habilidade de Maurghoros de derrotar inimigos na hora, sem esperar a Fase Final, os Dragões malignos vencem imediatamente, sem passar para a Fase Final.',
      ] },
      { side: 'Dragões bons', text: [
        'Vencem imediatamente no começo da Fase Final se a última ficha de objetivo sair da área (depois da batalha 2).',
        'Vencem mesmo que todas as criaturas restantes deles fossem eliminadas depois, nessa Fase Final, por dano letal: o poder do cemitério revitaliza as criaturas que morreriam dos ferimentos nessa rodada.',
        'Lembrem que Maurghoros não pode ser derrotado enquanto houver fichas de objetivo na área, então os Dragões bons só vencem ativando todas as proteções.',
      ] },
    ],
    outcomes: [
      { id: '1', title: 'Maurghoros triunfa', summary: 'Maurghoros despedaça os inimigos com uma fúria que assusta até os novos aliados. Ele declara que o cemitério é deles para profanar: a maioria dos objetos é abençoada e não serve para eles, então vão derretê-los e oferecer o metal à sua amada senhora. Um aliado mostra que entre as relíquias há uma que vai agradá-lo, e Maurghoros olha para o colar que os dragões bons esperavam enterrar ali, onde os dragões malignos nunca o achariam. Ele aprova e decide usá-lo no pescoço na mesma hora.', rewards: ['Dragões malignos: 4 XP', 'Dragões malignos recebem o Talisman of Ultimate Evil'] },
      { id: '2', title: 'As proteções se fecham', summary: 'Quando a última proteção é ativada, a esfera de aniquilação que flutuava sobre o campo cresce e engole Maurghoros. Entre gritos de agonia, o globo escuro bane o espírito dele e o corpo roubado do multiverso para sempre, e depois se fecha. Os aliados do dracolich, derrotados e feridos, se rendem, cada um já planejando a vingança. Pacatus diz que eles não vão morrer, mas vão sofrer pelo que quase conseguiram. Galadaeros, aliviado, diz que venceram afinal. Quelindritar o chama de Chama do Poente, elogia a coragem dele ao longo de meses de conflito e, embora a maior parte dos tesouros deva ficar com os ancestrais, entrega a ele um símbolo de coragem e bondade. Galadaeros aceita o presente brilhante com humildade e já pensa nas próximas aventuras com Nymmestra e os outros, agora que a amizade deles foi forjada em sangue e vitória.', rewards: ['Dragões bons: 4 XP', 'Dragões bons recebem o Talisman of Pure Good'] },
    ],
    epilogue: 'Fim da campanha O Cemitério Primordial. Somem a XP de cada jogador: vence a campanha quem tiver mais experiência acumulada.',
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 12, side: 'mal', label: 'Dragões malignos' },
        { x: 0, y: 78, w: 90, h: 12, side: 'bem', label: 'Dragões bons' },
      ],
      tokens: [
        { x: 45, y: 45, label: '1 a 7' }, { x: 14, y: 45 }, { x: 76, y: 45 },
        { x: 30, y: 23 }, { x: 62, y: 18 }, { x: 33, y: 68 }, { x: 62, y: 67 },
      ],
      note: 'As 7 proteções ficam viradas para baixo: uma no centro, duas ao lado dela, a leste e a oeste, e duas perto de cada área inicial, a 23 cm dela. O número de cada uma só aparece quando um dragão bom a ativa.',
    },
    origin: 'livro',
    campaign: 'cemiterio-primordial',
    chapter: 7.3,
    theme: 'A batalha final de 200 pontos: os dragões bons precisam ativar as sete proteções antes que Maurghoros os destrua.',
  },
  {
    slug: 'fortaleza-rivergard',
    number: 8,
    title: 'A fortaleza Rivergard',
    original: 'Rivergard Keep',
    source: 'Livreto de aventura #8 (Onda 6, Mal Elemental)',
    players: 2,
    playArea: '90 x 90 cm, a areia da praia em volta da fortaleza Rivergard, à beira do rio',
    components: ['Nenhum componente especial', 'Prêmio à escolha: Hammer of Thunderbolts, Frost Brand ou Brooch of Shielding'],
    sides: [
      { id: 'defensores', name: 'Defensores da fortaleza', points: 120, color: '#3a56b0', requires: 'Criaturas Neutras e Malignas, com pelo menos uma criatura terrestre' },
      { id: 'ulfgar', name: 'Companhia de Ulfgar', creatureUid: 3101, points: 150, color: '#6b4a32', requires: 'Criaturas Neutras e Boas, incluindo Ulfgar; Quelindritar não pode entrar' },
    ],
    synopsis: [
      'Ulfgar Ironfist é um anão de ambição modesta. Há décadas ele serve à Ordem da Manopla com distinção e quase sem pensar em subir de posto: o tempo está do lado dele, ele gosta de ser uma engrenagem que faz o bem quando precisam, e faz isso bem.',
      'Hoje o destino dele muda. A Ordem o encarregou de reunir uma força e ir até a fortaleza Rivergard, uma tarefa que parece simples e não é. Ao chegar ao forte da margem do rio, eles encontram um castelo velho em reforma. Ele diz pertencer a um grupo que protege o tráfego do rio, mas o disfarce caiu: o lugar é ocupado em segredo pelo Culto da Onda Esmagadora, servo de Olhydra, a princesa da água maligna. Os cultistas contrataram um bando variado para guardar a fortaleza, e a Ordem da Manopla espera estar à altura.',
    ],
    setup: [
      'Os Defensores da fortaleza montam a legião com 120 pontos, com criaturas Neutras e Malignas, incluindo pelo menos uma criatura terrestre.',
      'A Companhia de Ulfgar monta a legião com 150 pontos, com criaturas Neutras e Boas, incluindo Ulfgar. Quelindritar não pode entrar nesta força.',
      'Os jogadores posicionam as criaturas pela preparação padrão para 2 jogadores: os Defensores ao norte e Ulfgar ao sul.',
      'Um dos Defensores é uma criatura terrestre que acabou de trancar o portão principal. Ela começa a no máximo 15 cm (6") do centro da borda norte.',
    ],
    specialRules: [
      { title: 'Areia da praia', text: 'A fortaleza é cercada de areia, e andar por ela é difícil. Toda manobra no solo com velocidade maior que 1 conta como manobra vermelha.' },
      { title: 'Flechas de gelo', text: 'Defensores invisíveis no alto da fortaleza atiram flechas de gelo nos invasores. No começo de cada Fase Final, cada criatura da Companhia de Ulfgar se defende de uma flecha de arma primária que causa 1 de dano de gelo. Ela rola os dados de defesa normalmente, mas não pode usar a Armadura contra esse ataque. Para o texto das cartas, as flechas vêm da direção da borda norte.' },
      { title: 'Medo de acertar os seus', text: 'Quem da Companhia de Ulfgar estiver a alcance 1 de pelo menos uma criatura inimiga não é alvo das flechas: os arqueiros têm medo de acertar os próprios aliados.' },
    ],
    objectives: [
      { side: 'Defensores da fortaleza', text: ['Vencem se eliminarem a Companhia de Ulfgar (depois da batalha 1).'] },
      { side: 'Companhia de Ulfgar', text: ['Vence se eliminar os Defensores da fortaleza (depois da batalha 2).'] },
      { side: 'Empate', text: ['Se os dois lados forem eliminados na mesma rodada, joguem a aventura de novo.'] },
    ],
    outcomes: [
      { id: '1', title: 'A fortaleza resiste', summary: 'Algum tempo depois, no domínio dele sob as Colinas Sumber, Gar Shatterkeel ouve um mensageiro da fortaleza: Rivergard foi defendida, mas outras legiões vão ser mandadas contra eles, e é preciso dinheiro para contratar mais defensores. Gar concorda e sorri sombrio enquanto revira os objetos de poder tomados dos inimigos.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Hammer of Thunderbolts, Frost Brand (expansão Water Cult Warrior) ou Brooch of Shielding (expansão White Dragon)'] },
      { id: '2', title: 'A fortaleza cai', summary: 'A dragoa de bronze Quelindritar, aliada da Ordem da Manopla, chega depois da batalha para cumprimentar Ulfgar. Ela diz que ele provou o valor dele mais uma vez, mas que a batalha só começou: os cultos elementais devem estar protegendo algo de grande poder, e é preciso impedi-los a qualquer custo. Ela oferece prêmios para a próxima luta.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Hammer of Thunderbolts, Frost Brand (expansão Water Cult Warrior) ou Brooch of Shielding (expansão White Dragon)'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'defensores', label: 'Defensores da fortaleza' },
        { x: 0, y: 75, w: 90, h: 15, side: 'ulfgar', label: 'Companhia de Ulfgar' },
      ],
      tokens: [{ x: 45, y: 4, label: 'portão' }],
      note: 'A fortaleza fica além da borda norte. Uma criatura terrestre dos Defensores começa a até 15 cm do centro dessa borda, junto ao portão.',
    },
    origin: 'livro',
    campaign: 'mal-elemental',
    chapter: 8,
    theme: 'Assalto à fortaleza do culto da água, debaixo de flechas de gelo e sobre areia fofa.',
  },
  {
    slug: 'mosteiro-da-pedra-sagrada',
    number: 9,
    title: 'O mosteiro da Pedra Sagrada',
    original: 'Monastery of the Sacred Stone',
    source: 'Livreto de aventura #9 (Onda 6, Mal Elemental)',
    players: 2,
    playArea: '90 x 90 cm, a frente do mosteiro da Pedra Sagrada, com a muralha elevada ao norte',
    components: ['4 fichas de parapeito', '6 fichas de objetivo (formações de rocha)', 'Prêmio à escolha: Deep Red Ioun Stone, Exploding Gem ou Necklace of Adaptation'],
    sides: [
      { id: 'terra', name: 'Cultistas da Terra', points: 100, color: '#3a2f8a', requires: 'Só criaturas Malignas' },
      { id: 'enclave', name: 'Enclave Esmeralda', creatureUid: 3501, points: 120, color: '#3f8a4a', requires: 'Bellatoris com a melhoria Milo Timberheart e aliados' },
    ],
    synopsis: [
      'Milo Timberheart, patrulheiro humano, é um aliado de confiança do Enclave Esmeralda. Ele é respeitado pela pontaria, e enquanto ouve o ancião explicar a próxima missão, não para quieto esperando a "parte boa". Na semana anterior, uma das videntes mais talentosas do Enclave, Lijanne, foi ao mosteiro da Pedra Sagrada consultar os monges sobre um assunto pessoal e não voltou. Os monges garantem que ela foi e voltou sem problemas, mas a égua dela foi vista nos estábulos, e ela nunca trocaria nem deixaria a montaria lá. Algo sinistro acontece no mosteiro, e Milo deve reunir uma força e arrancar a verdade.',
      'No fim, o ancião acrescenta que sim, Milo pode montar o pégaso Bellatoris até lá, desde que o devolva inteiro. Quando chegam ao mosteiro, descobrem que eram esperados: os mestres do lugar são, em segredo, membros do Culto da Terra Negra, que serve a Ogrémoch, o príncipe elemental da terra.',
    ],
    setup: [
      'Os Cultistas da Terra montam a legião com 100 pontos, só com criaturas Malignas. O Enclave Esmeralda monta a legião com 120 pontos: Bellatoris com a melhoria Milo Timberheart e aliados.',
      'Coloquem as 4 fichas de parapeito ponta com ponta formando um semicírculo encostado na borda norte, começando a 27 cm (10,5") da borda oeste, como no mapa. Elas são a frente da muralha elevada do mosteiro.',
      'Criaturas terrestres dentro do semicírculo estão sobre a muralha e contam como "no ar" para o nível de jogo.',
      'Depois, começando pelos Cultistas, os jogadores se alternam colocando as 6 fichas de objetivo, cada uma a pelo menos 15 cm (alcance 2) das outras, dos parapeitos e das bordas.',
      'Os jogadores posicionam as criaturas pela preparação padrão para 2 jogadores: os Cultistas ao norte e o Enclave ao sul.',
    ],
    specialRules: [
      { title: 'A muralha do mosteiro', text: 'Criaturas terrestres de fora não entram no mosteiro: se terminarem o movimento passando pelos parapeitos ou sobre eles, recuam. Uma criatura terrestre está sobre a muralha enquanto pelo menos parte da base estiver dentro dos parapeitos ou encostada neles.' },
      { title: 'A queda', text: 'Uma criatura terrestre, ou uma voadora que pousou, que sai inteira da muralha rola 3 dados de ataque e sofre dano por acerto e por crítico, sem rolar defesa nem usar a Armadura. Depois disso ela fica no solo, do lado de fora do mosteiro. Por isso as criaturas que andam pelo solo levam dano de queda se saírem da borda da muralha.' },
      { title: 'Parede dos fundos', text: 'A parte da borda norte dentro do semicírculo é uma parede. Uma criatura que fosse terminar o movimento fora da área por ali não é derrotada: recua até ficar inteira dentro da área. Uma criatura voadora nessa situação precisa pousar sobre a muralha.' },
      { title: 'Corpo a corpo e distância', text: 'Criaturas terrestres de fora não fazem ataques corpo a corpo contra inimigos sobre a muralha, nem o contrário. Ataques à distância entre os dois níveis valem normalmente.' },
      { title: 'Espelhos dos monges', text: 'Os servos do culto da terra usam espelhos e lentes para ofuscar os invasores. Uma criatura voadora do Enclave que termina o movimento a alcance 2 a 4 do parapeito mais próximo, virada para o mosteiro (com algum parapeito no arco frontal), precisa pousar ou fica sem atacar pelo resto da rodada; ponham uma ficha de "sem ataque" ao lado dela. Se qualquer parte dela estiver a alcance 1 dos parapeitos, ou se ela passar por cima deles, os servos não conseguem mirar e ela ataca normalmente.' },
      { title: 'Formações de rocha', text: 'As fichas de objetivo são formações de rocha altas: obstáculos para criaturas no solo e para as que estão em rasante, e o dano de atravessá-las não penetra a Armadura. Criaturas voadoras que não estão em rasante não são afetadas, a menos que pousem ou deem rasante encostadas nelas.' },
    ],
    objectives: [
      { side: 'Cultistas da Terra', text: ['Vencem se eliminarem o Enclave Esmeralda (depois da batalha 1).'] },
      { side: 'Enclave Esmeralda', text: ['Vence se eliminar os Cultistas da Terra (depois da batalha 2).'] },
    ],
    outcomes: [
      { id: '1', title: 'O mosteiro resiste', summary: 'Marlos Urnrayle, Profeta da Terra do Olho Elemental Ancião, ouve com preocupação crescente a notícia do ataque ao mosteiro. Primeiro foi a fortaleza do culto da água, e agora uma das deles foi sitiada. A medusa enlouquecida decide que quem conspira contra eles deve ser esmagado como todos que se opõem a ela, e então se consola examinando os despojos trazidos pelas forças vitoriosas.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Deep Red Ioun Stone, Exploding Gem (expansão Earth Cult Warrior) ou Necklace of Adaptation (expansão Young Blue Dragon)'] },
      { id: '2', title: 'O mosteiro cai', summary: 'Milo acha os restos da pobre Lijanne e a enterra nas colinas próximas. Quando vai descansar sobre a muralha tomada, um bufo nervoso de Bellatoris avisa que um dragão se aproxima. Contra o sol poente, ele vê o brilho de um dragão de bronze, com um anão robusto montado nas costas. É Ulfgar Ironfist, que desce do ombro do dragão e apresenta a nova companheira, Quelindritar, que está reunindo aliados para um golpe decisivo contra os cultos elementais. Milo aceita, e Quelindritar recompensa a coragem dele com um presente.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Deep Red Ioun Stone, Exploding Gem (expansão Earth Cult Warrior) ou Necklace of Adaptation (expansão Young Blue Dragon)'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 10, side: 'terra', label: 'Cultistas da Terra (muralha ao norte)' },
        { x: 0, y: 78, w: 90, h: 12, side: 'enclave', label: 'Enclave Esmeralda' },
      ],
      tokens: [
        { x: 30, y: 9, label: 'parapeito' }, { x: 38, y: 17, label: 'parapeito' }, { x: 52, y: 17, label: 'parapeito' }, { x: 60, y: 9, label: 'parapeito' },
        { x: 18, y: 32 }, { x: 52, y: 37 }, { x: 74, y: 30 }, { x: 33, y: 52 }, { x: 68, y: 55 }, { x: 15, y: 68 },
      ],
      note: 'Os 4 parapeitos formam um semicírculo encostado na borda norte, começando a 27 cm da borda oeste. As 6 formações de rocha ficam a 15 cm umas das outras, dos parapeitos e das bordas; o mapa mostra uma distribuição possível.',
    },
    origin: 'livro',
    campaign: 'mal-elemental',
    chapter: 9,
    theme: 'Ataque a um mosteiro murado onde espelhos ofuscam quem voa e cair da muralha machuca.',
  },
  {
    slug: 'sociedade-feathergale',
    number: 10,
    title: 'A Sociedade Feathergale',
    original: 'The Feathergale Society',
    source: 'Livreto de aventura #10 (Onda 6, Mal Elemental)',
    players: 2,
    playArea: '90 x 90 cm, o céu em volta da Torre Feathergale, nas Colinas Sumber',
    components: ['3 fichas de cavaleiro de hipogrifo (5 x 5 cm)', '3 fichas de dano de hipogrifo (2,5 x 2,5 cm)', 'Prêmio à escolha: Gem of Seeing, Dagger of Venom ou Cloak of Resistance'],
    sides: [
      { id: 'feathergale', name: 'Sociedade Feathergale', points: 90, color: '#c0282d', requires: 'Criaturas Neutras e Malignas; +5 pontos se incluir pelo menos 1 guerreiro do culto do ar' },
      { id: 'harpistas', name: 'Harpistas', creatureUid: 3951, points: 120, color: '#3a2f8a', requires: 'Criaturas Neutras e Boas, sem Quelindritar' },
    ],
    synopsis: [
      'Os ataques recentes aos cultos elementais não passaram despercebidos pelos Harpistas. Investigando um pouco mais, eles concluíram que uma força enorme e sinistra se reúne em algum ponto das Colinas Sumber. Ainda não juntaram todas as peças, mas descobriram onde fica uma fortaleza elemental, que seria usada por um clube rico de voo de hipogrifos chamado Sociedade Feathergale.',
      'Reunir aliados para derrubar a operação inteira leva tempo, mas dá para ir tomando as bases do inimigo agora. Por isso os Harpistas chamaram uma das aliadas mais próximas, a dragoa de latão Janic, para derrubar a Torre Feathergale. Janic vive ocupada com os próprios interesses, mas ajuda de bom grado quando os Harpistas sabem aproveitar a sabedoria dela, e o emissário sempre lembra o quanto ela é esperta; ela reconhece a bajulação, mas nunca reclama. Ao chegar perto da torre, Janic vê proteções mágicas escondidas no chão e avisa os seguidores para ficarem no ar: são armadilhas de elementais do ar, e eles enfrentam o Culto do Ódio Uivante. Os moradores da torre têm dois planos: derrotar a dragoa e os companheiros, ou mandar cavaleiros de hipogrifo buscarem reforços.',
    ],
    setup: [
      'A Sociedade Feathergale monta a legião com 90 pontos, com criaturas Neutras e Malignas, e ganha +5 pontos se incluir pelo menos 1 guerreiro do culto do ar.',
      'Os Harpistas montam a legião com 120 pontos, com criaturas Neutras e Boas, sem Quelindritar.',
      'Os jogadores posicionam as criaturas pela preparação padrão para 2 jogadores: os Harpistas ao norte e a Sociedade ao sul.',
      'Depois a Sociedade coloca 1 ficha de cavaleiro de hipogrifo com a traseira encostada na borda inicial dela, virada para a borda do adversário. As outras 2 ficam ao lado da área.',
    ],
    specialRules: [
      { title: 'Ventos das proteções', text: 'A batalha acontece no alto. Quem pousa ou dá rasante, por escolha ou à força, é atingido por tempestades de vento disparadas pelas proteções mágicas. Criaturas no solo ou em rasante não fazem Ações nem atacam, e ainda sofrem dano na Fase Final.' },
      { title: 'Os cavaleiros de hipogrifo', text: 'As fichas de cavaleiro de hipogrifo são criaturas voadoras malignas que só querem fugir. Não fazem Ações nem atacam, e só mudam de altitude para voltar a voar se uma habilidade especial as forçou a pousar ou dar rasante. Têm Valor da Arma Primária 0, Agilidade 2, Vida 2 e Armadura 1. Críticos passam pela Armadura normalmente, mas elas são imunes a efeitos críticos. Marquem o dano com as fichas de dano de hipogrifo. Um cavaleiro que recebe dano letal sai do jogo na hora, sem esperar a Fase Final.' },
      { title: 'A fuga', text: 'No começo da Fase de Ativação, antes de qualquer outra criatura se mover, a Sociedade move cada cavaleiro na área para a frente com o gabarito reto 1, 2 ou 3, esteja ele no ar ou forçado ao solo. Um cavaleiro que sai só em parte pela borda oposta continua em jogo, e a parte da base ainda na área pode ser atacada normalmente. Se um cavaleiro sair inteiro pela área inicial dos Harpistas, a Sociedade vence na hora.' },
      { title: 'Fase Final, passo 1', text: 'Todas as criaturas no solo ou em rasante sofrem 1 de dano normal, sem rolar defesa nem usar a Armadura.' },
      { title: 'Fase Final, passo 2', text: 'A Sociedade põe um novo cavaleiro de hipogrifo com a traseira encostada na borda inicial dela, virado para a borda do adversário. Quando os 3 cavaleiros já tiverem entrado, este passo é pulado. Cavaleiros eliminados saem do jogo para sempre. Se alguma criatura lançou o feitiço Time Stop, este passo também é pulado.' },
    ],
    objectives: [
      { side: 'Sociedade Feathergale', text: ['Vence se eliminar os Harpistas ou se pelo menos 1 cavaleiro de hipogrifo sair da área pela borda inicial dos Harpistas (depois da batalha 1).'] },
      { side: 'Harpistas', text: ['Vencem se eliminarem a Sociedade Feathergale e os 3 cavaleiros de hipogrifo (depois da batalha 2).'] },
    ],
    outcomes: [
      { id: '1', title: 'O culto do ar resiste', summary: 'A líder do Culto do Ódio Uivante, a elfa alada Aerisi Kalinoth, lê o relatório da batalha furiosa por ter sido atacada, mas orgulhosa da vitória. Ela conclui que os cultos da água e da terra podem ter entregado o jogo, mas que os Harpistas sabem o que eles pretendem, e manda avisar o culto do fogo. Quando o mensageiro pergunta se o culto do fogo vai ouvir, ela dá um tapa nele: eles vão obedecer porque sabem que o culto do ar é o mais forte, servo de Yan-C-Bin, o mais poderoso dos príncipes elementais, e do Olho. Talvez até se separem de algo bonito como agradecimento.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Gem of Seeing, Dagger of Venom (expansão Air Cult Warrior) ou Cloak of Resistance (expansão Mind Flayer)'] },
      { id: '2', title: 'A torre cai', summary: 'Pouco depois da vitória, Janic recebe a visita da famosa dragoa de bronze Quelindritar, com o anão Ulfgar Ironfist, o patrulheiro Milo Timberheart e o pégaso Bellatoris. Eles ficam felizes de ver Janic inteira. Quelindritar não esconde muito bem a irritação por ter perdido a batalha de novo, mas tenta distrair Janic com uma boa escolha de recompensas.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Gem of Seeing, Dagger of Venom (expansão Air Cult Warrior) ou Cloak of Resistance (expansão Mind Flayer)'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'harpistas', label: 'Harpistas' },
        { x: 0, y: 75, w: 90, h: 15, side: 'feathergale', label: 'Sociedade Feathergale' },
      ],
      tokens: [{ x: 45, y: 87, label: 'hipogrifo' }],
      note: 'Os cavaleiros de hipogrifo entram um por vez pela borda sul e tentam atravessar a área até sair pela borda norte.',
    },
    origin: 'livro',
    campaign: 'mal-elemental',
    chapter: 10,
    theme: 'Batalha no ar contra o culto do ar, que tenta fazer cavaleiros de hipogrifo furarem o bloqueio.',
  },
  {
    slug: 'fortaleza-da-lua-escarlate',
    number: 11,
    title: 'A fortaleza da Lua Escarlate',
    original: 'The Scarlet Moon Keep',
    source: 'Livreto de aventura #11 (Onda 6, Mal Elemental)',
    players: 2,
    playArea: '90 x 90 cm, as ruínas da fortaleza da Lua Escarlate, nas Colinas Sumber',
    components: ['6 fichas de objetivo, numeradas de 1 a 6 (as armadilhas de fogo)', '6 fichas de aventura', '3 fichas de duração', '1 copo ou algo parecido', 'Prêmio à escolha: Pale Green Ioun Stone, Flame Tongue ou Amulet of Health'],
    sides: [
      { id: 'chama', name: 'Chama Eterna', points: 170, color: '#8a2b22', requires: 'Criaturas Malignas; +5 pontos por cultista elemental único' },
      { id: 'alianca', name: 'Aliança dos Lordes', creatureUid: 4301, points: 200, color: '#3f8a4a', requires: 'Criaturas Neutras e Boas, incluindo Borion com a melhoria Ahnah Crimson' },
    ],
    synopsis: [
      'Nas Colinas Sumber fica a fortaleza da Lua Escarlate. Ninguém se perguntou de início por que um grupo de ascetas iria morar naquelas ruínas, mas a desconfiança cresceu, e hoje é um segredo aberto que o lugar serve de base para ataques do Culto da Chama Eterna. A Aliança dos Lordes pouco se importa com ameaças ao próprio poder, mas ameaças às suas cidades e ao seu povo são úteis: dão a chance de consolidar o poder e, de quebra, mandar alguns encrenqueiros para o perigo.',
      'Uma dessas "anarquistas" é a cavaleira meio-elfa Ahnah Crimson, famosa por montar o majestoso grifo Borion e por caçar corrupção pela Costa da Espada. Ela virou um incômodo e uma possível recruta, se aprender como o mundo funciona de verdade, e não vai recusar a chance de liderar as forças da Aliança contra o culto do fogo. Morra ela heroicamente ou vença, a Aliança ganha. Os cultistas do fogo, avisados dos ataques a outras fortalezas elementais, contrataram mais gente e espalharam armadilhas de fogo pelo campo. A grande dragoa de bronze Quelindritar preparou um feitiço que reduz por pouco tempo o dano de fogo dos atacantes e chamou aliados das outras facções: Ulfgar Ironfist, da Ordem da Manopla; Milo Timbershaft e o pégaso Bellatoris, do Enclave Esmeralda; e o dragão de latão Janic, aliado dos Harpistas. Mesmo assim, ela teme que não baste.',
    ],
    setup: [
      'A Chama Eterna monta a legião com 170 pontos, só com criaturas Malignas, e ganha +5 pontos para cada cultista elemental único.',
      'A Aliança dos Lordes monta a legião com 200 pontos, com criaturas Neutras e Boas, incluindo Borion com a melhoria Ahnah Crimson. Ela ganha +5 pontos para cada um destes personagens: Quelindritar, Bellatoris com a melhoria Milo Timbershaft, Janic e Ulfgar Ironfist.',
      'A Chama Eterna coloca as fichas de objetivo 1 a 6 viradas para baixo, fora das duas áreas iniciais e a mais de alcance 2 umas das outras. O jogador pode fazer um mapa para lembrar qual é qual.',
      'Em segredo, a Chama Eterna põe de 1 a 6 fichas de aventura debaixo de um copo, para o adversário não ver quantas são. Esse número indica qual das seis armadilhas é a especial.',
      'Coloquem as 3 fichas de duração ao lado da área para marcar quanto dura o feitiço de resistência a fogo de Quelindritar.',
      'Os jogadores posicionam as criaturas pela preparação padrão para 2 jogadores: a Chama Eterna ao norte e a Aliança ao sul.',
    ],
    specialRules: [
      { title: 'Armadilhas de fogo', text: 'Cada ficha de objetivo é uma armadilha de fogo que a Chama Eterna pode disparar quando uma criatura no solo ou no ar termina o movimento a alcance 1 dela. A Chama Eterna pode usar a régua de alcance para conferir. A armadilha atinge todas as criaturas a alcance 1 da ficha que estejam no mesmo nível de jogo de quem a disparou (solo ou ar). A Chama Eterna sempre pode escolher não disparar.' },
      { title: 'Disparar a armadilha', text: 'Ao disparar, a Chama Eterna vira a ficha com o número para cima e faz um ataque de fogo de 3 dados contra cada criatura atingida, que penetra a Armadura. Criaturas de fogo recebem 1 resultado de esquiva pela regra normal de resistência a energia. Cada armadilha normalmente dispara uma vez por jogo, mas a ficha fica virada para cima na área, porque ninguém sabe se ela é a armadilha especial.' },
      { title: 'O feitiço de Quelindritar', text: 'Nas três primeiras rodadas, toda criatura da Aliança na área conta como se tivesse resistência a fogo, graças a Quelindritar. Enquanto o efeito durar, sempre que uma criatura da Aliança sofrer dano de fogo, ela recebe 1 resultado de esquiva grátis, como se fosse uma criatura de fogo. Uma criatura que já é de fogo não ganha proteção extra. Tirem 1 ficha de duração na Fase Final de cada rodada; depois da terceira rodada a proteção acaba.' },
      { title: 'O unguento da Chama Eterna', text: 'Todas as criaturas da Chama Eterna foram cobertas por um unguento grosso com resistência a fogo parecida, que dura a aventura inteira. Depois das três primeiras rodadas, só elas têm essa proteção.' },
      { title: 'A armadilha especial', text: 'Uma das armadilhas tem uma segunda carga, mais forte, embaixo da primeira, e pode disparar uma segunda vez. O número dela é o número de fichas de aventura debaixo do copo. A Chama Eterna só pode disparar a segunda explosão depois da primeira, numa rodada seguinte. Ao disparar, ela revela as fichas debaixo do copo para provar qual é a armadilha e faz um ataque de fogo de 5 dados contra cada criatura a alcance 1 a 2 da ficha, no solo e no ar, que penetra a Armadura.' },
    ],
    objectives: [
      { side: 'Chama Eterna', text: ['Vence se eliminar a Aliança dos Lordes (depois da batalha 1).'] },
      { side: 'Aliança dos Lordes', text: ['Vence se eliminar a Chama Eterna (depois da batalha 2).'] },
    ],
    outcomes: [
      { id: '1', title: 'A Chama Eterna vence', summary: 'Vanifer, Profetisa da Chama Eterna, acha adequado que a Aliança dos Lordes tenha vindo contra eles: agora ficou provado que as riquezas deles não servem para nada. Ela gira numa dança de fogo e diz que o mundo inteiro vai queimar, começando por eles e suas cidades douradas. Mas este prêmio, segundo ela, merece até alguém como ela.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Pale Green Ioun Stone, Flame Tongue (expansão Human Barbarian, Fire Cult) ou Amulet of Health (expansão Young Black Dragon)'] },
      { id: '2', title: 'A Aliança vence', summary: 'Depois de cuidar dos ferimentos e conferir que não há mais armadilhas, os comandantes dispensam as tropas para comemorar. Milo tenta tirar a fuligem da crina de Bellatoris, com medo de que o Enclave não empreste mais o pégaso, e Ulfgar bebe demais e dá tapinhas nas costas de Ahnah Crimson até levar um empurrão merecido. Quelindritar diz a Janic que teme que essas fortalezas sejam só uma peça do problema; o dragão de latão responde que eles fizeram a parte deles e que ela precisa aprender a relaxar. Ela admite que faz muito tempo que não descansa. Um representante da Aliança chega com um presente para "a Lady Crimson", cujo futuro nas fileiras da Aliança parece garantido.', rewards: ['Jogador vencedor: 2 XP', 'Escolha um artefato: Pale Green Ioun Stone, Flame Tongue (expansão Human Barbarian, Fire Cult) ou Amulet of Health (expansão Young Black Dragon)'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'chama', label: 'Chama Eterna' },
        { x: 0, y: 75, w: 90, h: 15, side: 'alianca', label: 'Aliança dos Lordes' },
      ],
      tokens: [{ x: 26, y: 28 }, { x: 64, y: 28 }, { x: 44, y: 38 }, { x: 18, y: 52 }, { x: 70, y: 52 }, { x: 34, y: 60 }],
      note: 'A Chama Eterna escolhe onde ficam as 6 armadilhas, fora das áreas iniciais e a mais de alcance 2 umas das outras. O mapa mostra uma distribuição possível.',
    },
    origin: 'livro',
    campaign: 'mal-elemental',
    chapter: 11,
    theme: 'Batalha grande contra o culto do fogo num campo cheio de armadilhas, uma delas com carga dupla.',
  },
  {
    slug: 'covil-do-gelo-antigo',
    number: 101,
    title: 'O covil do gelo antigo',
    original: 'Lair of Ancient Frost',
    source: 'Cenário especial #1',
    players: 2,
    playArea: '90 x 90 cm, o covil de Ossalur, cheio de armadilhas mágicas',
    components: ['6 fichas de objetivo, numeradas de 1 a 6 (as armadilhas)'],
    sides: [
      { id: 'ossalur', name: 'Ossalur', creatureUid: 4601, points: 100, color: '#3a56b0', requires: 'Ossalur e melhorias' },
      { id: 'intrusos', name: 'Intrusos', points: 120, color: '#c0282d', requires: 'Só criaturas Malignas' },
    ],
    synopsis: [
      'Há mais de mil anos o dragão de prata Ossalur percorre o mundo espalhando a sua sabedoria. Mas a cada cem anos, mais ou menos, ele escolhe descansar por um longo tempo, e nesse período o dragão normalmente gentil perde a paciência rápido quando o acordam. Hoje essa paciência vai ser testada.',
      'Mal fecha as pálpebras brilhantes, Ossalur se assusta com o barulho de intrusos malignos. Ele sabe que as armadilhas mágicas espalhadas pelo covil vão machucar bastante os invasores, mas se surpreende com a vontade de enfrentá-los pessoalmente. Faz mais de setenta anos desde a última batalha, e até um dragão bondoso quer testar a força de vez em quando.',
    ],
    setup: [
      'Ossalur monta a legião com 100 pontos, com ele e melhorias. Os Intrusos montam a legião com 120 pontos, só com criaturas Malignas.',
      'Os jogadores posicionam as criaturas pela preparação padrão para 2 jogadores: Ossalur ao norte e os Intrusos ao sul.',
      'Depois Ossalur embaralha as 6 fichas de objetivo e as coloca viradas para baixo na área, sem olhar os números. Nenhuma ficha pode ficar a alcance 1 a 2 de qualquer borda ou de qualquer criatura inimiga, nem a alcance 1 de outra ficha.',
    ],
    specialRules: [
      { title: 'Armadilhas mágicas', text: 'Depois de fazer uma Ação normal, Ossalur pode disparar uma (e só uma) das armadilhas como ação grátis. Ele vira uma ficha de objetivo e aplica o efeito do número revelado a todas as criaturas inimigas a alcance 1 a 2 dela, no solo e no ar. Ossalur é imune aos efeitos das armadilhas; só os inimigos dele são afetados.' },
      { title: 'Fim do efeito', text: 'No começo da Fase Final, tirem da área para sempre a ficha virada para cima na rodada.' },
      { title: 'Ficha 1: armadilha de lentidão', text: 'Os inimigos a alcance 1 a 2 rolam -2 dados de defesa sempre que se defendem pelo resto da rodada.' },
      { title: 'Ficha 2: ventos cortantes', text: 'Os inimigos a alcance 1 a 2 sofrem 1 de dano de gelo, sem rolar defesa, usar fichas de combate nem a Armadura. Além disso, rolam -2 dados de ataque sempre que atacam pelo resto da rodada.' },
      { title: 'Ficha 3: estilhaços de gelo', text: 'Façam um ataque de 5 dados contra cada inimigo a alcance 1 a 2. As criaturas se defendem normalmente.' },
      { title: 'Ficha 4: raio polar', text: 'Façam um ataque de gelo de 6 dados contra 1 inimigo à escolha a alcance 1 a 2. O ataque penetra a Armadura.' },
      { title: 'Ficha 5: vórtice', text: 'Os inimigos voadores a alcance 1 a 2 recebem uma ficha de solo e não podem mudar de altitude pelo resto da rodada. Além disso, os inimigos a alcance 1 a 2 não podem fazer ataques de arma primária pelo resto da rodada.' },
      { title: 'Ficha 6: nuvem de névoa', text: 'Todos os inimigos a alcance 1 a 2 precisam escolher e descartar 1 melhoria.' },
    ],
    objectives: [
      { side: 'Ossalur', text: ['Vence se eliminar todos os intrusos.'] },
      { side: 'Intrusos', text: ['Vencem se eliminarem Ossalur.'] },
      { side: 'Empate', text: ['Se todas as criaturas forem derrotadas na mesma Fase Final, Ossalur vence.'] },
    ],
    outcomes: [],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'ossalur', label: 'Ossalur' },
        { x: 0, y: 75, w: 90, h: 15, side: 'intrusos', label: 'Intrusos' },
      ],
      tokens: [{ x: 28, y: 26 }, { x: 64, y: 30 }, { x: 46, y: 39 }, { x: 22, y: 50 }, { x: 62, y: 52 }, { x: 38, y: 60 }],
      note: 'Ossalur põe as 6 armadilhas depois de todas as criaturas, sem olhar os números, longe das bordas e dos inimigos. O mapa mostra uma distribuição possível.',
    },
    origin: 'livro',
    theme: 'Um dragão de prata acordado do descanso enfrenta invasores com seis armadilhas mágicas.',
  },
  {
    slug: 'altares-do-vale-das-cinzas',
    number: 5,
    title: 'Os altares do Vale das Cinzas',
    original: 'Aventura original do portal',
    source: 'Criada para este portal com as miniaturas da caixa básica e das expansões de dragões',
    theme: 'Dragões bons e malignos disputam três altares rúnicos que amplificam o sopro de quem os controla, num vale cortado por um rio de lava.',
    players: 2,
    playArea: '90 x 90 cm, um vale vulcânico cortado de leste a oeste por um rio de lava com duas pontes de obsidiana',
    components: [
      '3 segmentos de rio de lava (cerca de 25 x 9 cm) e 2 pontes de obsidiana de 7 cm',
      '4 pilares de basalto (4 cm de diâmetro)',
      '2 nuvens de cinzas (10 cm de diâmetro)',
      '3 altares rúnicos (fichas hexagonais de 3 cm), numerados de 1 a 3',
      '12 fichas de ponto (6 para cada lado) e fichas de duração para contar as rodadas',
      'A folha de terrenos desta aventura, para imprimir em A4 na escala real',
    ],
    sides: [
      { id: 'bem', name: 'Conselho Metálico', points: 120, color: '#c8803e', requires: 'Criaturas Boas e Neutras, com pelo menos um dragão Bom (Galadaeros, Vakka, Pacatus, Janic, Eyruaad ou outro)',
        suggested: { code: 'MTA1OjEwNzoxMTU6MDoxMTg6MTE5LDI4MDE6MTA5OjExNjowOjAsNjAyOjA6MDowOjAsNjA3OjA6MA', total: 117, list: [
          'Galadaeros (37), dragão de cobre, com Acid Breath, Hidecarved Scales, Shield e Magic Missile',
          'Eyruaad (30), jovem dragão de bronze, com Lightning Breath e Legendary Resistance',
          'Harper Legion Elves 2 (25), tropa de elfos que segura os altares no solo',
          'Sun Elf Archers (10), arqueiros para disputar o altar do outro lado da ponte',
        ], note: 'Dois sopros em linha para varrer as pontes e duas tropas para ficar a Alcance 1 dos altares 2 e 3.' } },
      { id: 'mal', name: 'Revoada de Tiamat', points: 120, color: '#c0282d', requires: 'Criaturas Malignas e Neutras, com pelo menos um dragão Maligno (Balagos, Eshaedra, Claugiyliamatar, Umberlis ou outro)',
        suggested: { code: 'MTAxOjEwODowOjA6MTE4LDEwMzoxMDk6MTE2OjExNDowOjAsNTA5OjA6MA', total: 117, list: [
          'Balagos (42), dragão vermelho, com Fire Breath e Shield; como é de Fogo, ignora o dano do rio de lava',
          'Eshaedra (39), dragoa azul, com Lightning Breath, Legendary Resistance e Devotrix of Tiamat',
          'Hobgoblin Band 3 (18), bando hobgoblin para ocupar o altar do seu lado do rio',
        ], note: 'Dois dragões fortes para dominar o altar 1, sobre a lava, e um bando para segurar o altar 2.' } },
    ],
    synopsis: [
      'No sul das Montanhas Nether existe um vale onde a terra nunca esfria. Os anões o chamam de Vale das Cinzas, e os dragões o chamam de Primeiro Fôlego. Segundo as histórias, foi ali que os primeiros dragões aprenderam a soprar, e três altares de pedra rúnica guardam até hoje um pouco daquele poder: um dragão que respira sobre eles sai com o sopro mais forte do que entrou.',
      'Há séculos os altares dormem sob a cinza. Esta semana, um tremor rachou a crosta do vale, o rio de lava mudou de curso e as runas voltaram a brilhar. Balagos sentiu o calor do próprio covil e chamou a Revoada de Tiamat para tomar os altares antes de qualquer outro. O dragão de cobre Galadaeros viu a coluna de fumaça do alto e avisou o Conselho Metálico. As duas revoadas chegam ao mesmo tempo, cada uma pela sua encosta, e entre elas só há o rio de lava, duas pontes de obsidiana e três pedras que brilham no escuro.',
    ],
    setup: [
      'Cada lado monta a legião com 120 pontos. O Conselho Metálico usa criaturas Boas e Neutras e precisa ter pelo menos um dragão Bom. A Revoada de Tiamat usa criaturas Malignas e Neutras e precisa ter pelo menos um dragão Maligno.',
      'Coloquem o rio de lava atravessando a área de leste a oeste, com 9 cm de largura e a borda de cima a 40 cm da borda norte. Deixem duas pontes de 7 cm de largura: uma entre 25 e 32 cm da borda oeste e outra entre 58 e 65 cm. Use os 3 segmentos da folha de terrenos.',
      'Coloquem os altares: o altar 1 no centro exato do rio, sobre uma pequena ilha (ele flutua acima da lava), o altar 2 a 22 cm da borda oeste e a 20 cm da borda norte, e o altar 3 a 22 cm da borda leste e a 20 cm da borda sul.',
      'Os jogadores se revezam colocando os 4 pilares de basalto, começando por quem tem a iniciativa, cada um a pelo menos 15 cm das bordas, dos altares e dos outros pilares. Depois cada lado coloca 1 nuvem de cinzas na metade do adversário, a pelo menos 15 cm de qualquer altar.',
      'O Conselho Metálico começa a até 15 cm da borda sul e a Revoada de Tiamat a até 15 cm da borda norte, pela preparação padrão para 2 jogadores.',
    ],
    specialRules: [
      { title: 'Rio de lava', text: 'O rio é um obstáculo só para criaturas no solo, que não podem atravessá-lo nem terminar o movimento sobre ele, a não ser pelas pontes. Uma criatura no solo que passaria por cima do rio para antes dele, encostada na borda, e sofre 1 de dano normal. Criaturas voadoras passam por cima livremente, mas se pousarem, derem rasante ou forem forçadas ao solo sobre o rio, sofrem 1 de dano crítico e vão para o lado mais próximo. Criaturas de Fogo ignoram o dano do rio.' },
      { title: 'Pontes de obsidiana', text: 'As pontes contam como solo comum. Uma criatura terrestre só cruza o rio por elas, e nenhuma criatura pode ser empurrada para fora de uma ponte.' },
      { title: 'Pilares de basalto', text: 'Os pilares são obstáculos para o solo e para o ar. O dano por passar por eles é normal e não penetra a Armadura.' },
      { title: 'Nuvens de cinzas', text: 'A fumaça quente esconde quem está dentro. Uma criatura com qualquer parte da base dentro de uma nuvem rola +1 dado de defesa contra ataques à distância, e quem está dentro dela não pode fazer a ação Adquirir alvo.' },
      { title: 'Controlar um altar', text: 'No começo da Fase Final, um lado controla um altar se tiver pelo menos uma criatura a Alcance 1 dele e o adversário não tiver nenhuma. O altar 1, sobre a lava, também pode ser controlado por criaturas no ar sobre ele. Para cada altar controlado, o lado ganha 1 ficha de ponto.' },
      { title: 'Sopro amplificado', text: 'Um dragão a Alcance 1 de um altar que o seu lado controlou na rodada anterior rola +1 dado de ataque em ataques de Arma de Sopro.' },
      { title: 'O vale treme', text: 'No começo da rodada 4 e da rodada 7, o vale treme: cada criatura no solo a Alcance 1 do rio de lava sofre 1 de dano normal, sem defesa, e as nuvens de cinzas se deslocam 5 cm para o leste (para o oeste se encostarem na borda leste).' },
      { title: 'Duração', text: 'A batalha dura no máximo 8 rodadas. Usem fichas de duração para contar.' },
    ],
    objectives: [
      { side: 'Os dois lados', text: [
        'Vence na hora quem chegar a 6 fichas de ponto.',
        'Também vence quem eliminar todas as criaturas do adversário.',
        'Se ninguém vencer até o fim da rodada 8, vence quem tiver mais fichas de ponto; com empate, vence quem tiver mais pontos de legião em criaturas ainda vivas.',
      ] },
      { side: 'Depois da batalha', text: ['Se o Conselho Metálico vencer, leiam o final 1. Se a Revoada de Tiamat vencer, leiam o final 2.'] },
    ],
    outcomes: [
      { id: '1', title: 'O Conselho Metálico guarda os altares', summary: 'Quando a última fumaça baixa, Galadaeros pousa sobre o altar do rio e sente o calor das runas subir pelas garras. Os dragões metálicos decidem enterrar dois dos altares sob basalto, para que ninguém volte a usá-los, e levam a pedra do terceiro para Quelindritar estudar. Pelas runas, ela descobre que o Primeiro Fôlego não é só uma lenda: as pedras foram talhadas por alguém que conhecia o Cemitério Primordial.', rewards: ['Lado vencedor: 1 XP', '+1 XP se a vitória veio pelas fichas de ponto antes da rodada 6'] },
      { id: '2', title: 'A Revoada de Tiamat toma o vale', summary: 'Balagos respira fogo sobre os três altares, um após o outro, e o vale responde com um rugido que se ouve até as Montanhas Nether. A Revoada passa a noite revezando quem respira sobre as pedras, e quando o sol nasce o rio de lava corre na direção dos vales dos anões. Eshaedra já planeja vender o acesso ao Primeiro Fôlego para os outros servos de Tiamat, pelo preço certo.', rewards: ['Lado vencedor: 1 XP', '+1 XP se a vitória veio pelas fichas de ponto antes da rodada 6'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'mal', label: 'Revoada de Tiamat' },
        { x: 0, y: 75, w: 90, h: 15, side: 'bem', label: 'Conselho Metálico' },
      ],
      tokens: [{ x: 45, y: 44.5, label: '1' }, { x: 22, y: 20, label: '2' }, { x: 68, y: 70, label: '3' }],
      terrain: [
        { kind: 'lava', x: 0, y: 40, w: 25, h: 9, label: 'Rio de lava' },
        { kind: 'lava', x: 32, y: 40, w: 26, h: 9, label: 'Rio de lava' },
        { kind: 'lava', x: 65, y: 40, w: 25, h: 9, label: 'Rio de lava' },
        { kind: 'bridge', x: 25, y: 40, w: 7, h: 9, label: 'Ponte' },
        { kind: 'bridge', x: 58, y: 40, w: 7, h: 9, label: 'Ponte' },
        { kind: 'pillar', x: 16, y: 58, w: 4, h: 4, label: 'Pilar' },
        { kind: 'pillar', x: 72, y: 28, w: 4, h: 4, label: 'Pilar' },
        { kind: 'pillar', x: 40, y: 26, w: 4, h: 4, label: 'Pilar' },
        { kind: 'pillar', x: 48, y: 62, w: 4, h: 4, label: 'Pilar' },
        { kind: 'ash', x: 62, y: 18, w: 10, h: 10, label: 'Cinzas' },
        { kind: 'ash', x: 22, y: 64, w: 10, h: 10, label: 'Cinzas' },
      ],
      note: 'Os altares 1, 2 e 3 têm posição fixa. Os pilares e as nuvens de cinzas são colocados pelos jogadores; o mapa mostra uma distribuição possível.',
    },
    origin: 'portal',
    tokenSheet: '/aventuras/terrenos-vale-das-cinzas.pdf',
  },
  {
    slug: 'emboscada-na-ponte-de-boareskyr',
    number: 6,
    title: 'Emboscada na Ponte de Boareskyr',
    original: 'Aventura original do portal',
    source: 'Criada para este portal, ambientada na Costa da Espada de Forgotten Realms, durante a Tirania dos Dragões',
    theme: 'Os Harpistas e uma dragoa de latão tentam roubar as carroças do tesouro do Culto do Dragão antes que elas cruzem a Ponte de Boareskyr rumo ao Poço dos Dragões.',
    players: 2,
    playArea: '90 x 90 cm, a Estrada do Comércio onde ela cruza o rio Winding Water pela Ponte de Boareskyr',
    components: [
      '4 segmentos de rio (20 x 9 cm) e 1 ponte de pedra (10 x 9 cm)',
      '3 carroças do tesouro (fichas de 6,5 x 4 cm), numeradas de 1 a 3',
      '2 bosques (10 cm de diâmetro) e 1 ruína da estalagem (6 x 4 cm)',
      '6 fichas de saque e fichas de dano para as carroças',
      'A folha de terrenos desta aventura, para imprimir em A4 na escala real',
    ],
    sides: [
      { id: 'bem', name: 'Harpistas e aliados', points: 120, color: '#3f8a4a', requires: 'Criaturas Boas e Neutras, com pelo menos um dragão Bom',
        suggested: { code: 'Mzk1MToxMDg6MTE2OjA6MTE4LDI4MDE6MTA5OjExNTowOjAsNjAyOjA6MDowOjAsNjA3OjA6MA', total: 119, list: [
          'Janic (39), dragoa de latão aliada dos Harpistas, com Fire Breath, Legendary Resistance e Shield',
          'Eyruaad (30), jovem dragão de bronze, com Lightning Breath e Hidecarved Scales',
          'Harper Legion Elves 2 (25), a tropa harpista que saqueia as carroças no solo',
          'Sun Elf Archers (10), arqueiros escondidos nos bosques',
        ], note: 'Os dragões atacam a escolta do alto, e as duas tropas chegam às carroças para saquear.' } },
      { id: 'mal', name: 'Culto do Dragão', points: 120, color: '#7a3a9a', requires: 'Criaturas Malignas e Neutras, com pelo menos um dragão Maligno',
        suggested: { code: 'NDAxOjQwMzoxMTY6MTE4OjAsMTAzOjEwOToxMTQ6MDowOjAsNTAxOjA6MDowOjAsNTA3OjA6MA', total: 119, list: [
          'Claugiyliamatar (35), a dragoa verde da Floresta de Kryptgarden, com Poison Breath, Legendary Resistance e Shield',
          'Eshaedra (39), dragoa azul devota de Tiamat, com Lightning Breath e Devotrix of Tiamat',
          'Zhentarim Warband (19), mercenários contratados para escoltar as carroças',
          'Hobgoblin Band (10), bando que segura a ponte',
        ], note: 'As duas dragoas protegem o céu enquanto as tropas escoltam as carroças pela estrada.' } },
    ],
    synopsis: [
      'Por toda a Costa da Espada, o Culto do Dragão rouba aldeias e caravanas para encher o tesouro que vai libertar Tiamat dos Nove Infernos. O ouro segue em carroças pela Estrada do Comércio até o Poço dos Dragões, e o caminho mais curto passa pela Ponte de Boareskyr, a velha ponte de pedra sobre o rio Winding Water, onde há séculos os deuses Bhaal e Tyr se enfrentaram durante o Tempo das Perturbações.',
      'Os Harpistas souberam por um espião que três carroças vão cruzar a ponte ao entardecer. A escolta é pequena, mas o Wyrmspeaker Rezmir comprou a proteção de Claugiyliamatar, a velha dragoa verde de Kryptgarden, com uma parte do tesouro, e Eshaedra voa com ela. Do outro lado, a dragoa de latão Janic aceitou ajudar os Harpistas, desde que alguém lembre bem alto o quanto ela é esperta. O jovem Eyruaad, filho de Quelindritar, veio provar que já tem idade para estas missões. Se as carroças cruzarem o rio, o ouro some no deserto. Se forem saqueadas, a Rainha dos Dragões fica um pouco mais longe de casa.',
    ],
    setup: [
      'Cada lado monta a legião com 120 pontos. Os Harpistas e aliados usam criaturas Boas e Neutras, com pelo menos um dragão Bom. O Culto do Dragão usa criaturas Malignas e Neutras, com pelo menos um dragão Maligno. Há uma legião sugerida para cada lado; troquem o que quiserem dentro desses requisitos.',
      'Coloquem o rio Winding Water atravessando a área de norte a sul, com 9 cm de largura, a 40 cm da borda oeste. A Ponte de Boareskyr fica no meio do rio, com a borda de cima a 40 cm da borda norte e 10 cm de comprimento.',
      'A Estrada do Comércio corre de leste a oeste pelo centro da área e passa pela ponte. Coloquem as 3 carroças em fila sobre a estrada, viradas para oeste, com a frente da primeira a 8 cm do rio e 2 cm entre uma carroça e outra.',
      'O Culto coloca a ruína da estalagem a pelo menos 10 cm da estrada. Os Harpistas colocam os 2 bosques, cada um a pelo menos 10 cm da estrada, do rio e das bordas.',
      'Os Harpistas começam a até 15 cm da borda oeste. O Culto começa a até 15 cm da borda leste. As criaturas são posicionadas pela preparação padrão para 2 jogadores.',
    ],
    specialRules: [
      { title: 'O rio Winding Water', text: 'O rio é um obstáculo só para criaturas no solo, que só o atravessam pela ponte. Uma criatura no solo que passaria por cima da água para encostada na margem. Criaturas voadoras que pousam, dão rasante ou são forçadas ao solo sobre o rio vão para a margem mais próxima e recebem uma ficha de Exaustão.' },
      { title: 'A Ponte de Boareskyr', text: 'A ponte conta como solo comum. Uma criatura no solo sobre a ponte rola +1 dado de defesa contra ataques à distância, pela proteção das muretas de pedra.' },
      { title: 'Bosques e ruína', text: 'Os bosques são obstáculos só para o solo e dão +1 dado de defesa contra ataques à distância a quem está dentro deles. A ruína da estalagem é um obstáculo para o solo e para o ar.' },
      { title: 'As carroças do tesouro', text: 'Cada carroça é uma criatura terrestre do Culto que não ataca, não faz ações e não pode ser alvo de efeitos críticos. Ela tem Agilidade 0, Armadura 1 e 4 de Vida. Quem passa por cima dela é tratado como se passasse por um obstáculo.' },
      { title: 'A carroça anda', text: 'No começo de cada Fase Final, cada carroça avança pela estrada com o gabarito de reta 2, na ordem 1, 2 e 3. Se uma carroça fosse terminar sobre outra base ou um obstáculo, ela para antes. Uma carroça que sai pela borda oeste escapou com o tesouro.' },
      { title: 'Ação: saquear', text: 'Uma criatura dos Harpistas no solo, a Alcance 1 de uma carroça e sem nenhuma criatura do Culto a Alcance 1 dela, pode usar a Ação para colocar 1 ficha de saque na carroça. Com 2 fichas de saque, a carroça foi esvaziada e sai do jogo. Uma carroça destruída por dano também sai do jogo, mas o ouro se perde no rio.' },
      { title: 'Ao entardecer', text: 'A batalha dura no máximo 8 rodadas. Usem fichas de duração para contar.' },
    ],
    objectives: [
      { side: 'Culto do Dragão', text: ['Vence se 2 carroças escaparem pela borda oeste (depois da batalha 1).', 'Também vence se eliminar todas as criaturas dos Harpistas (depois da batalha 1).'] },
      { side: 'Harpistas e aliados', text: ['Vencem se 2 carroças saírem do jogo, saqueadas ou destruídas (depois da batalha 2).', 'Também vencem se eliminarem todas as criaturas do Culto.'] },
      { side: 'No fim da rodada 8', text: ['Se ninguém venceu, vence o Culto se tiver alguma carroça em jogo a oeste do rio; senão, vencem os Harpistas.'] },
    ],
    outcomes: [
      { id: '1', title: 'O ouro segue para o Poço dos Dragões', summary: 'As carroças somem na poeira da Estrada do Comércio, e Claugiyliamatar conta de cabeça a parte que lhe cabe. Rezmir recebe a notícia com um sorriso e manda pregar no portão de Boareskyr o estandarte dos Harpistas que caiu no rio. Ninguém precisava saber que uma das carroças levava só pedras: era a isca para descobrir quem anda vendendo as rotas do Culto.', rewards: ['Culto do Dragão: 1 XP', '+1 XP se as 3 carroças escaparam'] },
      { id: '2', title: 'O tesouro volta para a Costa da Espada', summary: 'Os Harpistas dividem o ouro em sacos pequenos para devolver às aldeias saqueadas, e Janic insiste em contar as moedas ela mesma, para garantir que ninguém a chame de distraída depois. Entre o ouro, eles acham uma lista com os nomes das próximas cidades que o Culto pretende atacar. Eyruaad voa na mesma noite para levá-la à mãe.', rewards: ['Harpistas e aliados: 1 XP', '+1 XP se as 3 carroças foram saqueadas ou destruídas'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 15, h: 90, side: 'bem', label: 'Harpistas e aliados' },
        { x: 75, y: 0, w: 15, h: 90, side: 'mal', label: 'Culto do Dragão' },
      ],
      tokens: [],
      terrain: [
        { kind: 'road', x: 0, y: 42.5, w: 90, h: 5, label: 'Estrada do Comércio' },
        { kind: 'river', x: 40, y: 0, w: 9, h: 40, label: 'Winding Water' },
        { kind: 'river', x: 40, y: 50, w: 9, h: 40, label: 'Winding Water' },
        { kind: 'bridge', x: 40, y: 40, w: 9, h: 10, label: 'Ponte de Boareskyr' },
        { kind: 'wagon', x: 57, y: 43, w: 6.5, h: 4, label: '1' },
        { kind: 'wagon', x: 65.5, y: 43, w: 6.5, h: 4, label: '2' },
        { kind: 'wagon', x: 74, y: 43, w: 6.5, h: 4, label: '3' },
        { kind: 'grove', x: 18, y: 18, w: 10, h: 10, label: 'Bosque' },
        { kind: 'grove', x: 22, y: 62, w: 10, h: 10, label: 'Bosque' },
        { kind: 'ruin', x: 60, y: 62, w: 6, h: 4, label: 'Ruína' },
      ],
      note: 'O rio e a ponte têm posição fixa, e as carroças começam em fila na estrada, a leste do rio. Os bosques e a ruína são colocados pelos jogadores; o mapa mostra uma distribuição possível.',
    },
    origin: 'portal',
    tokenSheet: '/aventuras/terrenos-ponte-de-boareskyr.pdf',
    hero: '/aventuras/hero-ponte-de-boareskyr.webp',
    heroPosition: '55% 45%',
  },
  {
    slug: 'o-poco-dos-dragoes',
    number: 7,
    title: 'O Poço dos Dragões',
    original: 'Aventura original do portal',
    source: 'Criada para este portal, ambientada em Forgotten Realms, no clímax da Tirania dos Dragões',
    theme: 'O Culto do Dragão abre o portal dos Nove Infernos e Tiamat começa a atravessar. Os dragões metálicos têm poucas rodadas para arrancar as Máscaras Dracônicas e fechar o caminho da Rainha.',
    players: 2,
    playArea: '90 x 90 cm, a cratera do Poço dos Dragões, um vulcão extinto ao sul do Bosque Mere dos Pântanos Mortos',
    components: [
      '1 portal de Avernus (círculo de 15 cm)',
      '5 Máscaras Dracônicas (fichas hexagonais de 3,8 cm): negra, azul, verde, vermelha e branca',
      '3 rochas de basalto (6 cm de diâmetro)',
      '10 fichas de invocação e fichas de dano para as máscaras',
      'A folha de terrenos desta aventura, para imprimir em A4 na escala real',
    ],
    sides: [
      { id: 'mal', name: 'Culto do Dragão', creatureUid: 3801, points: 160, color: '#7a3a9a', requires: 'Tiamat e criaturas Malignas e Neutras',
        suggested: { code: 'MzgwMTozODAyOjM4MDM6MzgwNzozODEwOjM4MTEsNTAxOjA6MDowOjAsNTA5OjA6MCw1MDc6MDow', total: 158, list: [
          'Tiamat (84), a Rainha dos Dragões, com Fire Breath, Lightning Breath, Queen of the Evil Dragons, Power Word Kill e Regenerate',
          'Zhentarim Warband (19), mercenários que guardam as máscaras',
          'Hobgoblin Band 3 (18) e Hobgoblin Band (10), bandos que seguram as máscaras do anel externo',
        ], note: 'Tiamat segura o centro e sopra em quem se aproxima; as tropas ficam a Alcance 1 das máscaras para alimentar o ritual.' } },
      { id: 'bem', name: 'Dragões Metálicos', points: 160, color: '#c8803e', requires: 'Criaturas Boas e Neutras, com pelo menos um dragão Bom; Bahamut pode entrar',
        suggested: { code: 'MjMwMToxMDg6MTE2OjA6MDowLDIxMDE6MDowOjA6MDowLDI4MDE6MTA5OjA6MDowLDYwNzowOjA', total: 159, list: [
          'Pacatus (52), dragão de ouro, com Fire Breath e Legendary Resistance',
          'Vakka (57), a anciã de prata que guardava a Agulha da Corrente',
          'Eyruaad (30), jovem dragão de bronze, com Lightning Breath',
          'Sun Elf Archers (10), arqueiros que arrancam as máscaras no solo',
        ], note: 'Três dragões voando rápido para arrancar as máscaras longe de Tiamat, e uma tropa para as que ficam perto do portal.' } },
    ],
    synopsis: [
      'Ao sul do Bosque Mere dos Pântanos Mortos fica um vulcão extinto que os servos de Tiamat chamam de Poço dos Dragões. Ali, depois de meses saqueando a Costa da Espada, o Culto do Dragão reuniu o tesouro, os dragões cromáticos e as cinco Máscaras Dracônicas, uma para cada cor da Rainha. Cada Wyrmspeaker colocou a sua máscara num pedestal em volta da cratera, e Severin, o líder do Culto, começou o ritual que abre um portal até Avernus, a primeira camada dos Nove Infernos.',
      'O céu da cratera ficou vermelho e cinco cabeças subiram pelo portal: negra, azul, verde, vermelha e branca. Tiamat ainda está presa entre os planos, mas cada máscara que o Culto mantém no lugar a puxa mais um pouco para Faerûn. Os dragões metálicos que lutaram contra o Culto desde o roubo do covil de Balagos chegam pelo sul, junto com os elfos do sol. Se três máscaras forem arrancadas, o portal se fecha e a Rainha volta para os Infernos. Se o ritual terminar, ela pisa em Faerûn pela primeira vez em milênios.',
    ],
    setup: [
      'O Culto do Dragão monta a legião com 160 pontos, com Tiamat e criaturas Malignas e Neutras. Os Dragões Metálicos montam a legião com 160 pontos, com criaturas Boas e Neutras e pelo menos um dragão Bom. Há uma legião sugerida para cada lado; troquem o que quiserem dentro desses requisitos.',
      'Coloquem o portal de Avernus centralizado entre leste e oeste, com o centro a 30 cm da borda norte. Tiamat começa sobre o portal, virada para o sul.',
      'Coloquem as 5 Máscaras Dracônicas em arco em volta do portal, todas a 23 cm (alcance 3) do centro dele: uma ao sul, duas a sudeste e sudoeste e duas a leste e oeste, como no mapa.',
      'Os Dragões Metálicos colocam as 3 rochas de basalto, cada uma a pelo menos 15 cm do portal, das máscaras e das bordas.',
      'O Culto posiciona as outras criaturas a até 15 cm da borda norte. Os Dragões Metálicos começam a até 15 cm da borda sul.',
    ],
    specialRules: [
      { title: 'Tiamat atravessa o portal', text: 'Enquanto o portal estiver aberto, Tiamat está presa a ele: não planeja manobra, não se move nem gira, mas faz ações e ataca normalmente, inclusive com os sopros. O portal não é obstáculo para ela; para as outras criaturas, é um obstáculo para o solo e para o ar.' },
      { title: 'A Rainha não morre aqui', text: 'Enquanto houver pelo menos 3 máscaras na mesa, Tiamat não pode ser derrotada: se as Cartas de Dano chegarem à Vida dela, ela fica com 1 de Vida e as cartas que passarem disso são descartadas.' },
      { title: 'As Máscaras Dracônicas', text: 'Cada máscara é uma criatura terrestre do Culto que não se move, não ataca e não faz ações. Ela tem Agilidade 0, Armadura 2 e 3 de Vida, e é imune a efeitos críticos. Uma máscara destruída por dano sai da mesa.' },
      { title: 'Ação: arrancar a máscara', text: 'Uma criatura dos Dragões Metálicos, no solo ou em rasante, a Alcance 1 de uma máscara e sem nenhuma criatura do Culto a Alcance 1 dela (Tiamat não conta), pode usar a Ação para arrancar a máscara: ela sai da mesa.' },
      { title: 'A dor da Rainha', text: 'Cada vez que uma máscara sai da mesa, Tiamat recebe 1 Carta de Dano virada para cima.' },
      { title: 'O ritual', text: 'No começo de cada Fase Final, o Culto ganha 1 ficha de invocação para cada máscara que tenha uma criatura do Culto a Alcance 1 dela e nenhuma criatura dos Dragões Metálicos a Alcance 1. Tiamat conta para as máscaras ao alcance dela.' },
      { title: 'A cratera', text: 'As rochas de basalto são obstáculos para o solo e para o ar. A batalha dura no máximo 8 rodadas.' },
    ],
    objectives: [
      { side: 'Culto do Dragão', text: ['Vence na hora ao chegar a 10 fichas de invocação: Tiamat se liberta do portal (depois da batalha 1).', 'Também vence se eliminar todas as criaturas dos Dragões Metálicos.'] },
      { side: 'Dragões Metálicos', text: ['Vencem na hora quando a terceira máscara sair da mesa: o portal se fecha e Tiamat volta para Avernus (depois da batalha 2).'] },
      { side: 'No fim da rodada 8', text: ['Se ninguém venceu, vence o Culto se tiver 6 ou mais fichas de invocação; senão, vencem os Dragões Metálicos.'] },
    ],
    outcomes: [
      { id: '1', title: 'A Rainha pisa em Faerûn', summary: 'As cinco cabeças rugem ao mesmo tempo e a cratera inteira treme quando Tiamat arranca as patas do portal. Os dragões metálicos recuam para o sul, levando os feridos, enquanto os Wyrmspeakers se ajoelham na cinza. A notícia vai correr a Costa da Espada em poucos dias, e todas as cidades vão olhar para o céu à procura de cinco sombras.', rewards: ['Culto do Dragão: 2 XP'] },
      { id: '2', title: 'O portal se fecha', summary: 'Com a terceira máscara arrancada, o portal se dobra sobre si mesmo e puxa a Rainha de volta para Avernus. O último rugido dela derruba metade da parede da cratera. Vakka segura a máscara branca entre as garras e diz, sem tirar os olhos do céu que volta à cor normal, que alguém precisa garantir que essas máscaras nunca mais fiquem juntas no mesmo lugar.', rewards: ['Dragões Metálicos: 2 XP', '+1 XP se o portal se fechou antes da rodada 5'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'mal', label: 'Culto do Dragão' },
        { x: 0, y: 75, w: 90, h: 15, side: 'bem', label: 'Dragões Metálicos' },
      ],
      tokens: [],
      terrain: [
        { kind: 'portal', x: 37.5, y: 22.5, w: 15, h: 15, label: 'Portal de Avernus' },
        { kind: 'mask', x: 45, y: 53, w: 3.8, h: 3.8, label: 'V' },
        { kind: 'mask', x: 61.3, y: 46.3, w: 3.8, h: 3.8, label: 'A' },
        { kind: 'mask', x: 28.7, y: 46.3, w: 3.8, h: 3.8, label: 'N' },
        { kind: 'mask', x: 68, y: 30, w: 3.8, h: 3.8, label: 'B' },
        { kind: 'mask', x: 22, y: 30, w: 3.8, h: 3.8, label: 'Ve' },
        { kind: 'pillar', x: 12, y: 58, w: 6, h: 6, label: 'Rocha' },
        { kind: 'pillar', x: 72, y: 60, w: 6, h: 6, label: 'Rocha' },
        { kind: 'pillar', x: 42, y: 64, w: 6, h: 6, label: 'Rocha' },
      ],
      note: 'O portal e as cinco máscaras têm posição fixa: todas a 23 cm do centro do portal. As rochas são colocadas pelos Dragões Metálicos; o mapa mostra uma distribuição possível.',
    },
    origin: 'portal',
    tokenSheet: '/aventuras/terrenos-poco-dos-dragoes.pdf',
    hero: '/aventuras/hero-poco-dos-dragoes.webp',
    heroPosition: '62% 30%',
  },
  {
    slug: 'ninho-na-tempestade',
    hero: '/aventuras/hero-ninho-na-tempestade.webp',
    heroPosition: '55% 40%',
    number: 3,
    title: 'O ninho na tempestade',
    original: 'Aventura original do portal',
    source: 'Criada para este portal com as peças da caixa básica',
    theme: 'Um saque às cegas dentro de uma tempestade de areia, com ovos verdadeiros e ovos de pedra.',
    players: 2,
    playArea: '90 x 90 cm, um campo de dunas no deserto onde Eshaedra esconde o ninho',
    components: [
      '4 fichas de objetivo, de número 1 a 4 (os ovos)',
      '1 ficha de aventura (o ninho, no centro)',
      '8 fichas de duração (a tempestade)',
      'Fichas de exaustão',
    ],
    sides: [
      { id: 'balagos', name: 'Balagos', creatureUid: 101, points: 60, color: '#c0282d' },
      { id: 'eshaedra', name: 'Eshaedra', creatureUid: 103, points: 55, color: '#1f6fb5' },
    ],
    synopsis: [
      'Dragões azuis fazem seus ninhos em desertos e caçam dentro das tempestades que eles mesmos atraem. Eshaedra guarda uma ninhada num campo de dunas, e Balagos, que nunca esqueceu quem entrou no seu covil, descobriu onde fica.',
      'O vermelho chega com a tempestade já formada. Ele sabe que existem ovos no ninho, mas não sabe quais. Eshaedra, que esperava por esse dia, misturou pedras lisas aos ovos verdadeiros. Quando a areia baixar, alguém terá vencido a aposta.',
    ],
    setup: [
      'Balagos tem 60 pontos e Eshaedra tem 55, e cada lado usa o seu dragão. Os 5 pontos a mais pagam a desvantagem de atacar no terreno do inimigo.',
      'Coloquem a ficha de aventura no centro exato da área: é o ninho.',
      'Sem que Balagos veja, Eshaedra coloca as 4 fichas de objetivo com o número para baixo, cada uma a até alcance 1 do ninho e a pelo menos 7,5 cm das outras. As fichas 1 e 2 são ovos verdadeiros. As fichas 3 e 4 são pedras.',
      'Empilhem 8 fichas de duração ao lado da área. Esta pilha é a tempestade.',
      'Eshaedra começa a até alcance 1 do ninho, em qualquer direção. Balagos começa na faixa da borda norte, a até 15 cm dela e a pelo menos 30 cm de cada canto.',
    ],
    specialRules: [
      { title: 'A tempestade', text: 'Em cada Fase Final, tirem 1 ficha de duração da pilha. Quando a última sair, a areia baixa e a aventura termina.' },
      { title: 'Areia nos olhos', text: 'Enquanto houver tempestade, ataques a alcance 3 ou mais rolam 1 dado de ataque a menos. Criaturas do Tipo de Energia Raio ignoram esta regra: é o clima delas.' },
      { title: 'Raios', text: 'Em cada Fase Final, depois de tirar a ficha de duração, Eshaedra rola 1 dado de ataque. Num resultado de crítico, um raio cai sobre a criatura voadora mais distante do ninho: ela sofre 1 de dano normal, que penetra a Armadura. Criaturas do Tipo de Energia Raio não são atingidas.' },
      { title: 'Ação: pegar um ovo', text: 'Uma criatura do lado de Balagos a até alcance 1 de uma ficha de objetivo pode usar a Ação para pegá-la e virá-la. Se for uma pedra (3 ou 4), a ficha sai do jogo e a criatura recebe uma ficha de exaustão pela raiva. Se for um ovo (1 ou 2), a criatura o carrega na carta. Cada criatura carrega no máximo 1 ovo.' },
      { title: 'Carregar um ovo', text: 'A criatura com um ovo não pode fazer manobras vermelhas e rola 1 dado de defesa a menos. Se sofrer 2 ou mais de dano de uma mesma fonte num turno, larga o ovo logo atrás da base, com o número para cima. Qualquer criatura do lado de Eshaedra a até alcance 1 de um ovo largado pode usar a Ação para devolvê-lo ao ninho, encostado na ficha de aventura.' },
      { title: 'A fuga', text: 'A criatura com um ovo que sai da área pela borda norte não é derrotada: ela escapa e o ovo conta como roubado. Sair por qualquer outra borda segue a regra normal de fuga do campo de batalha, e o ovo volta ao ninho.' },
      { title: 'A mãe', text: 'Eshaedra rola 1 dado de defesa a mais enquanto estiver a até alcance 1 do ninho.' },
    ],
    objectives: [
      {
        side: 'Balagos',
        text: [
          'Vitória total: roubar os 2 ovos verdadeiros antes de a tempestade acabar (desfecho 1).',
          'Vitória parcial: roubar 1 ovo verdadeiro antes de a tempestade acabar (desfecho 2).',
          'Se a tempestade acabar sem nenhum ovo roubado, ele perde a aventura.',
        ],
      },
      {
        side: 'Eshaedra',
        text: [
          'Vitória total: derrotar Balagos, ou a tempestade acabar com os 2 ovos verdadeiros no ninho e nenhuma criatura de Balagos carregando um ovo (desfecho 3).',
          'Se Eshaedra for derrotada, Balagos tem até a tempestade acabar para pegar e levar o que conseguir.',
        ],
      },
    ],
    outcomes: [
      { id: '1', title: 'Os dois ovos levados', summary: 'Balagos sai da tempestade com a ninhada inteira. Eshaedra passa a lhe dever obediência, e o vermelho ganha uma aliada contra a vontade dela.', rewards: ['Balagos: 2 XP'] },
      { id: '2', title: 'Um ovo levado', summary: 'Um dos ovos some com o vermelho. Eshaedra guarda o outro e jura reaver o primeiro, o que dá a Balagos uma vantagem sobre ela nas próximas vezes em que se encontrarem.', rewards: ['Balagos: 1 XP', 'Eshaedra: 1 XP se derrotou alguma criatura de Balagos'] },
      { id: '3', title: 'O ninho resiste', summary: 'A areia baixa e o ninho está inteiro. Balagos voa para longe com as pedras que achou e uma lição sobre dragões azuis no próprio deserto.', rewards: ['Eshaedra: 2 XP'] },
    ],
    map: {
      areas: [
        { x: 30, y: 0, w: 30, h: 15, side: 'balagos', label: 'Balagos (borda norte)' },
        { x: 37.5, y: 56, w: 15, h: 12, side: 'eshaedra', label: 'Eshaedra, a até alcance 1 do ninho' },
      ],
      tokens: [
        { x: 37, y: 38 },
        { x: 53, y: 38 },
        { x: 36, y: 51 },
        { x: 54, y: 51 },
      ],
      center: true,
      walls: [{ edge: 'N', label: 'Borda norte: rota de fuga com os ovos', color: '#c0282d' }],
      note: 'Eshaedra escolhe onde ficam os 4 ovos, a até alcance 1 do ninho; o mapa mostra uma disposição possível.',
    },
    origin: 'portal',
  },
  {
    slug: 'cerco-a-forja',
    hero: '/aventuras/hero-cerco-a-forja.webp',
    heroPosition: '60% 50%',
    number: 4,
    title: 'O cerco à forja de Ulfgar',
    original: 'Aventura original do portal',
    source: 'Criada para este portal com as peças da caixa básica e criaturas das expansões',
    theme: 'Os quatro cultos elementais contra um clã anão que precisa manter as forjas acesas até o amanhecer.',
    players: 2,
    playArea: '90 x 90 cm, o pátio diante do portão de uma fortaleza anã, cavado na encosta da montanha',
    components: [
      '3 fichas de objetivo, de número 1 a 3 (as forjas)',
      '19 fichas de duração: 9 para as brasas das forjas e 10 para a noite',
      '3 fichas de efeito (as forjas apagadas)',
      'Fichas de exaustão',
    ],
    sides: [
      {
        id: 'cla',
        name: 'Clã Ironfist',
        creatureUid: 3101,
        points: 160,
        color: '#2f6f8f',
        requires: 'Ulfgar Ironfist e pelo menos uma Arma de Cerco Anã (Dwarven Ballista ou Calamity). Só criaturas de alinhamento Bom ou Neutro.',
      },
      {
        id: 'cultos',
        name: 'Cultos Elementais',
        points: 160,
        color: '#b2452c',
        requires: 'Um líder de culto (Bastian Embers, Valen Shatterhelm, Mortimer Flax ou Aeryn Crestin) e criaturas de pelo menos dois cultos diferentes. Só criaturas de alinhamento Mau; no máximo um dragão.',
      },
    ],
    synopsis: [
      'Os cultos do Fogo, da Terra, do Ar e da Água costumam brigar entre si, mas desta vez juntaram forças. O alvo é a fortaleza do clã Ironfist, onde três forjas antigas trabalham dia e noite. Dizem que o metal que sai delas corta encantamentos elementais, e os profetas dos cultos querem essas forjas apagadas antes que o clã arme os reinos vizinhos.',
      'Ulfgar Ironfist sabe que a ajuda das outras fortalezas chega com o sol. Até lá, os anões precisam proteger as forjas no pátio diante do portão, sustentar o fogo e fazer as balistas falarem. Os cultistas têm a noite inteira para apagar o que puderem.',
    ],
    setup: [
      'Cada lado monta uma legião de 160 pontos pelas regras de Construção de Legiões, cumprindo o que a aventura exige de cada lado.',
      'O jogador do clã coloca as 3 fichas de objetivo (as forjas) na metade sul da área, cada uma a pelo menos 15 cm das bordas e a pelo menos 20 cm das outras. Coloquem 3 fichas de duração sobre cada forja: são as brasas.',
      'Empilhem 10 fichas de duração ao lado da área. Esta pilha é a noite.',
      'O clã posiciona as suas criaturas na faixa da borda sul, a até 15 cm dela. Os cultos posicionam as suas na faixa da borda norte, a até 15 cm dela.',
      'A iniciativa segue a regra de Construção de Legiões: quem gastou menos pontos decide.',
    ],
    specialRules: [
      { title: 'A noite', text: 'Em cada Fase Final, tirem 1 ficha de duração da pilha da noite. Quando a última sair, o sol nasce, os reforços do clã chegam e a aventura termina.' },
      { title: 'Ação: sabotar uma forja', text: 'Uma criatura dos cultos a até alcance 1 de uma forja acesa pode usar a Ação para tirar 1 brasa dela. Criaturas do Culto do Fogo ou do Culto da Terra tiram 2 brasas, porque conhecem o fogo e a pedra. Quando sai a última brasa, a forja se apaga: coloquem uma ficha de efeito sobre ela.' },
      { title: 'Ação: alimentar o fogo', text: 'Uma criatura Anã a até alcance 1 de uma forja ainda acesa pode usar a Ação para devolver 1 brasa a ela, até o máximo de 3. Uma forja apagada não volta a acender.' },
      { title: 'Virotes da forja', text: 'Uma Arma de Cerco Anã a até alcance 2 de uma forja acesa rola 1 dado de ataque a mais nos seus ataques à distância.' },
      { title: 'Calor das forjas', text: 'Uma criatura que termina o movimento encostada numa forja acesa recebe uma ficha de exaustão.' },
      { title: 'O portão', text: 'A borda sul é o portão da fortaleza. Criaturas do clã que saem por ela não são derrotadas: recuam para dentro, ficam fora do jogo e não contam como derrotadas. Criaturas dos cultos que saem pela borda sul são derrotadas pelas defesas do portão.' },
      { title: 'Ulfgar caído', text: 'Se Ulfgar Ironfist for derrotado, cada criatura Anã que restar rola 1 dado de ataque a menos até o fim da partida.' },
    ],
    objectives: [
      {
        side: 'Cultos Elementais',
        text: [
          'Vitória total: apagar as 3 forjas antes do nascer do sol (desfecho 1).',
          'Vitória parcial: ter 2 forjas apagadas quando o sol nascer, ou derrotar Ulfgar Ironfist, sem apagar as 3 (desfecho 2).',
        ],
      },
      {
        side: 'Clã Ironfist',
        text: [
          'Vitória total: chegar ao nascer do sol com pelo menos 2 forjas acesas e Ulfgar vivo, ou derrotar todas as criaturas dos cultos (desfecho 3).',
          'Se o sol nascer com 1 forja acesa ou com Ulfgar caído, os cultos ficam com a vitória parcial.',
        ],
      },
    ],
    outcomes: [
      { id: '1', title: 'As três forjas apagadas', summary: 'O pátio amanhece frio. Os cultos se dispersam antes da chegada dos reforços, cada profeta contando a vitória como sua, e a aliança entre eles começa a rachar na mesma manhã.', rewards: ['Cultos: 2 XP'] },
      { id: '2', title: 'A fortaleza ferida', summary: 'Os reforços encontram fogo em parte das forjas e um clã exausto. O metal vai demorar meses para voltar a sair na quantidade de antes, e os cultos ganham esse tempo.', rewards: ['Cultos: 1 XP', 'Clã: 1 XP se Ulfgar estiver vivo'] },
      { id: '3', title: 'O fogo resiste', summary: 'O sol nasce sobre as balistas ainda quentes. Ulfgar manda os primeiros virotes da manhã para as fortalezas vizinhas, e os cultos voltam a brigar entre si pela culpa.', rewards: ['Clã: 2 XP'] },
    ],
    map: {
      areas: [
        { x: 0, y: 0, w: 90, h: 15, side: 'cultos', label: 'Cultos Elementais (borda norte)' },
        { x: 0, y: 75, w: 90, h: 15, side: 'cla', label: 'Clã Ironfist (borda sul, o portão)' },
      ],
      tokens: [
        { x: 22, y: 56 },
        { x: 45, y: 64 },
        { x: 68, y: 56 },
      ],
      walls: [{ edge: 'S', label: 'Borda sul: portão da fortaleza', color: '#2f6f8f' }],
      note: 'O clã escolhe onde ficam as 3 forjas, na metade sul; o mapa mostra uma disposição possível.',
    },
    origin: 'portal',
  },
];

export const adventureBySlug = (slug: string) => ADVENTURES.find((a) => a.slug === slug);
export const campaignBySlug = (slug?: string) => CAMPAIGNS.find((c) => c.slug === slug);
export const campaignChapters = (slug: string) =>
  ADVENTURES.filter((a) => a.campaign === slug).sort((a, b) => (a.chapter ?? 0) - (b.chapter ?? 0));
export const standaloneAdventures = () => ADVENTURES.filter((a) => !a.campaign);

/* ---------- trilha da campanha: etapas e como cada capítulo leva ao seguinte ---------- */

export interface Stage {
  id: string;
  title: string;
  wave: string;
  summary: string;
  codes: string[];
}

export const STAGES: Record<string, Stage[]> = {
  'cemiterio-primordial': [
    {
      id: 'inicio', title: 'A rixa dos dragões', wave: 'Caixa básica',
      summary: 'Tudo começa com uma briga entre vizinhos. Eshaedra e Galadaeros invadem o covil de Balagos, e o vermelho cobra a dívida numa emboscada. No fim, a anciã Quelindritar conta a Galadaeros que servos de Tiamat procuram o Cemitério Primordial e dá a ele a missão de chegar primeiro.',
      codes: ['1', '2'],
    },
    {
      id: 'onda1', title: 'As pistas de Luminos', wave: 'Onda 1',
      summary: 'Os dois lados saem atrás de pistas. O Tomo de Nomes leva ao Baronato Inferior, onde Lorde Maximilian lembra que esculpiu um monumento a Luminos V, o Guardião do Cemitério. A avalanche de Hörn revela esse monumento nas Montanhas Nether, a canção dos anões liga Luminos a uma corrente que ancora um reino nas nuvens, e os Zhentarim e Rezmir descobrem que essa corrente, a Agulha da Corrente, fica nas Ilhas Moonshae. No meio disso, Nymmestra se alia a Galadaeros.',
      codes: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7'],
    },
    {
      id: 'onda2', title: 'As Chaves e a Agulha', wave: 'Onda 2',
      summary: 'A fortaleza de Luminos tem três portões, e cada um só abre com uma Chave mística. Os dois lados disputam as Chaves: a dos aarakocras no Abismo Uivante, a capa de sombras de Umberlis e a varinha escondida nos olhos da estátua. Pela luneta da estátua, alguém finalmente vê a Agulha da Corrente, sob uma tempestade eterna numa ilha das Moonshae.',
      codes: ['4.1', '4.2', '4.3'],
    },
    {
      id: 'onda3', title: 'Atravessar a tempestade', wave: 'Onda 3',
      summary: 'Com as Chaves na mão, ninguém consegue passar pela tempestade que protege o palácio. O livro que Legunt carregava aponta a rainha harpia Sycorax, exilada da Ilha da Tempestade, como a única que conhece o caminho. O ritual dela abre um portal para o olho do temporal, onde a dragoa de prata Vakka guarda a Agulha da Corrente e o Culto chega pelo mesmo caminho.',
      codes: ['5.1', '5.2', '5.3'],
    },
    {
      id: 'onda4', title: 'Os três portões', wave: 'Onda 4',
      summary: 'Cada Chave abre um dos três portões externos do Palácio de Luminos. O Tuning Fork of Neutrality, de Sarpiel, abre o Portão Pulsante, guardado por duas sentinelas de energia. O 7th Shard of Law, dos aarakocras, abre o Portão da Ventania, onde a gárgula Malebolge espera com dois basiliscos. The Ebon Cloak, a capa de Umberlis, abre o Portão Sussurrante e acorda o gigante Ancoram, que construiu a âncora da Agulha da Corrente. Cada portão vencido gira as engrenagens da fechadura do pátio, e no fim o portão do pátio do palácio se abre.',
      codes: ['6.1', '6.2', '6.3'],
    },
    {
      id: 'onda5', title: 'O salão de Luminos', wave: 'Onda 5',
      summary: 'Com o portão do pátio aberto, Drizzt e o Culto lutam no pátio murado, onde ninguém voa alto. As portas de adamantina não abrem, e só criaturas pequenas passam pelas passagens secretas até o salão do trono, onde o esqueleto de Luminos se levanta e abre o portal para o Cemitério Primordial. Lá dentro, Balagos morre nas proteções antigas e o espírito do dracolich Maurghoros toma o corpo dele. Na batalha final, os dragões bons precisam ativar as sete proteções para banir Maurghoros, e o lado vencedor leva o Talismã do Mal Supremo ou o Talismã do Bem Puro.',
      codes: ['7.1', '7.2', '7.3'],
    },
  ],
  'mal-elemental': [
    {
      id: 'fortalezas', title: 'As fortalezas dos cultos', wave: 'Onda 6',
      summary: 'Cada capítulo é o ataque a uma fortaleza de um culto elemental, e cada vitória junta mais heróis. Ulfgar Ironfist, da Ordem da Manopla, toma a fortaleza Rivergard do culto da água e conhece Quelindritar. Milo Timberheart e o pégaso Bellatoris, do Enclave Esmeralda, descobrem que o mosteiro da Pedra Sagrada pertence ao culto da terra, e Ulfgar chega montado em Quelindritar para recrutá-lo. A dragoa de latão Janic, aliada dos Harpistas, ataca a Torre Feathergale do culto do ar. Na fortaleza da Lua Escarlate, Ahnah Crimson lidera a Aliança dos Lordes contra o culto do fogo, com todos os aliados reunidos, e Quelindritar suspeita que as fortalezas são só uma parte do problema.',
      codes: ['8', '9', '10', '11'],
    },
  ],
};

/* O que cada capítulo revela ou entrega para o capítulo seguinte. */
export const CHAPTER_HOOKS: Record<string, string> = {
  '1': 'Balagos descobre quem invadiu o covil.',
  '2': 'Galadaeros recebe a missão de achar o Cemitério Primordial.',
  '3.1': 'O Tomo de Nomes cita o "Baronato Inferior".',
  '3.2': 'Maximilian revela Luminos V, o Guardião do Cemitério.',
  '3.3': 'Nymmestra se alia a Galadaeros.',
  '3.4': 'A avalanche descobre o monumento a Luminos.',
  '3.5': 'A canção dos anões: a corrente ancora o reino de Luminos.',
  '3.6': 'A Agulha da Corrente fica nas Ilhas Moonshae.',
  '3.7': 'Rezmir sabe de tudo, mas não achou a Agulha.',
  '4.1': 'Primeira Chave: o fragmento dos aarakocras.',
  '4.2': 'Inky, a capa de Umberlis, também é uma chave.',
  '4.3': 'A luneta da estátua mostra onde está a Agulha.',
  '5.1': 'O livro de Legunt aponta a rainha Sycorax.',
  '5.2': 'Uma moeda abre o portal para o olho da tempestade.',
  '5.3': 'Vakka guia o voo até os três portões do Palácio das Nuvens.',
  '6.1': 'O Tuning Fork acalma as sentinelas e gira o primeiro mecanismo.',
  '6.2': 'O 7th Shard of Law vence a ventania e gira o segundo mecanismo.',
  '6.3': 'O portão do pátio do palácio se abre.',
  '7.1': 'As portas não abrem, mas há uma passagem secreta pequena.',
  '7.2': 'Luminos abre o portal para o Cemitério Primordial.',
  '7.3': 'Maurghoros é banido ou toma o cemitério. Fim da campanha.',
  '8': 'Ulfgar conhece Quelindritar, que reúne aliados contra os cultos.',
  '9': 'Milo e Bellatoris entram para o grupo de Quelindritar.',
  '10': 'Janic entra para o grupo; o culto do ar avisa o culto do fogo.',
  '11': 'Quelindritar teme que as fortalezas sejam só uma parte do problema.',
};

/* Criatura que representa cada capítulo das expansões (para a imagem da trilha). */
export const CHAPTER_CREATURE: Record<string, number> = {
  '3.3': 701, '3.6': 501, '3.7': 602, '4.1': 1002, '5.3': 2101, '6.1': 2301, '6.2': 2401, '6.3': 2501, '7.1': 2701, '7.2': 2801, '7.3': 2901,
};

/* Capa de cada capítulo (arquivo em public/aventuras/<nome>.svg). */
export const CHAPTER_COVER: Record<string, string> = {
  '1': 'galadaeros',
  '2': 'balagos',
  '3.1': 'claugiyliamatar',
  '3.2': 'maximilian',
  '3.3': 'nymmestra',
  '3.4': 'jarl-horn',
  '3.5': 'balagos',
  '3.6': 'zhentarim',
  '3.7': 'harper-elfo',
  '4.1': 'aarakocra',
  '4.2': 'umberlis',
  '4.3': 'sarpiel',
  '5.1': 'blackthorn',
  '5.2': 'sycorax',
  '5.3': 'vakka',
  '6.1': 'pacatus',
  '6.2': 'malebolge',
  '6.3': 'ancoram',
  '7.1': 'drizzt',
  '7.2': 'eyruaad',
  '7.3': 'maurghoros',
  '8': 'rivergard',
  '9': 'pedra-sagrada',
  '10': 'janic',
  '11': 'borion',
};
export const coverFor = (chapter?: number | string) => {
  const name = chapter !== undefined ? CHAPTER_COVER[String(chapter)] : undefined;
  return name ? `/aventuras/${name}.svg` : undefined;
};
