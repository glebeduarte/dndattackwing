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

export interface Campaign {
  slug: string;
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
    status: '2 capítulos publicados',
    pending: 'Os próximos capítulos continuam a história nas expansões do jogo e entram aqui na ordem da campanha.',
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
