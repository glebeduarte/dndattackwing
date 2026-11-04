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
  campaign?: string; // slug da campanha; ausente = aventura avulsa
  chapter?: number;
  theme?: string; // uma linha sobre o clima da aventura
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
    status: '21 capítulos, 14 com guia completo',
    pending: 'Os capítulos seguintes vinham nos livretos das expansões. Cada um entra aqui com o guia completo assim que o texto da aventura estiver disponível.',
    planned: [
      { code: '5.3', title: 'A Needle In The Eye', expansion: 'Silver Dragon', wave: 'Onda 3', artifacts: [{ name: 'Monocle of the Twitching Tail', uid: 2109 }] },
      { code: '6.1', title: 'The Pulsating Gate', expansion: 'Gold Dragon', wave: 'Onda 4', artifacts: [{ name: 'Luck Gem', uid: 2309 }] },
      { code: '6.2', title: 'The Gale Force Gate', expansion: 'Gargoyle', wave: 'Onda 4', artifacts: [{ name: 'Bag of Winds', uid: 2408 }] },
      { code: '6.3', title: 'The Whispering Gate', expansion: 'Stone Giant', wave: 'Onda 4', artifacts: [{ name: 'Ring of Freedom', uid: 2509 }] },
      { code: '7.1', title: 'Close Quarters', expansion: 'Drow Elf Ranger', wave: 'Onda 5', artifacts: [{ name: 'Spider Silk Shirt', uid: 2709 }] },
      { code: '7.2', title: 'The Hall of Luminos the Mighty', expansion: 'Young Bronze Dragon', wave: 'Onda 5', artifacts: [{ name: 'Pearl of Power', uid: 2808 }] },
      { code: '7.3', title: 'Annihilation and Victory', expansion: 'Red Dracolich', wave: 'Onda 5', artifacts: [{ name: 'Talisman of Ultimate Evil', uid: 2909 }, { name: 'Talisman of Pure Good', uid: 2908 }] },
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
    slug: 'ninho-na-tempestade',
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
      summary: 'Com as Chaves na mão, ninguém consegue passar pela tempestade que protege o palácio. O livro que Legunt carregava aponta a rainha harpia Sycorax, exilada da Ilha da Tempestade, como a única que conhece o caminho. O ritual dela abre um portal para o olho do temporal.',
      codes: ['5.1', '5.2', '5.3'],
    },
    {
      id: 'onda4', title: 'Os três portões', wave: 'Onda 4',
      summary: 'Dentro da tempestade, cada Chave abre um portão da fortaleza externa de Luminos: o Portão Pulsante, o Portão da Ventania e o Portão Sussurrante. Cada capítulo é a batalha por um deles.',
      codes: ['6.1', '6.2', '6.3'],
    },
    {
      id: 'onda5', title: 'O salão de Luminos', wave: 'Onda 5',
      summary: 'O fim da campanha: a luta corpo a corpo nos corredores, o Salão de Luminos, o Poderoso, e a batalha final, em que os Talismãs do Mal Supremo e do Bem Puro decidem quem fica com as relíquias do Cemitério Primordial.',
      codes: ['7.1', '7.2', '7.3'],
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
};

/* Criatura que representa cada capítulo das expansões (para a imagem da trilha). */
export const CHAPTER_CREATURE: Record<string, number> = {
  '3.3': 701, '3.6': 501, '3.7': 602, '4.1': 1002, '5.3': 2101, '6.1': 2301, '6.2': 2401, '6.3': 2501, '7.1': 2701, '7.2': 2801, '7.3': 2901,
};
