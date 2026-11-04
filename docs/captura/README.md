# D&D Attack Wing Legion Builder: captura completa

Captura feita em 03/11/2026 a partir de https://build.dndaw.com, para reconstruir o construtor de legião.

## Como o site original funcionava

- SPA em AngularJS 1.x empacotada com webpack, sem backend ativo. O endpoint `/api/` responde com o HTML da página, e o app nem chega a usá-lo: todos os dados vêm embutidos nos bundles JS (módulos webpack 125 e 126).
- As cartas não são imagens escaneadas. Cada carta é montada em HTML a partir dos dados mais ícones PNG servidos por `https://dndaw.com/static/icon/<nome>.png`.
- A legião não é salva em servidor. O compartilhamento é um link `/link/:code`, onde o código é um `btoa` da lista de criaturas e upgrades (formato em `docs/02-motor-de-regras.md`, seção 6).
- Não existe limite de pontos no código. O app mostra o total e valida slots, restrições e unicidade.

## Conteúdo

| Pasta | O que tem |
|---|---|
| `data/creatures.json` | 155 criaturas, todos os campos originais (stats, slots, barra de ações, ataques, grade de movimento de voo e solo) |
| `data/upgrades.json` | 418 upgrades, com custo, texto, restrições e funções de custo especial |
| `data/*.csv` | As mesmas tabelas achatadas para abrir em planilha |
| `data/sets.json` | 60 sets/expansões com a onda (Wave, OP, Starter) e contagem de cartas |
| `data/schema_observed.json` | Tipos observados em cada campo |
| `docs/02-motor-de-regras.md` | Especificação do motor: enums, cálculo de custo, legalidade de equipar, comandos de equipar/desequipar, filtros, renderização das cartas, cartão de movimento, rotas, formato do link e bugs conhecidos |
| `docs/icons.json` | Lista dos 44 ícones referenciados |
| `docs/screenshots/` | Telas do site original para referência visual |
| `icons/` | 41 ícones baixados, mais fundos do tema e favicon |
| `source/` | Bundles JS originais e trechos do motor formatados para leitura |

## Lacunas

- 3 ícones não existem mais no servidor (404): `bank.png`, `disease.png`, `color-disease.png`. Precisam ser redesenhados.
- Cores CSS do cartão de movimento (g = verde, w = branco, r = vermelho, pela convenção do jogo) e o layout da folha impressa, que era gerada no servidor, não foram recuperados.
- A impressão enviava os dados para `dndaw.com/catsync/form/tournament.php`. Esse fluxo precisa ser refeito do zero.

## Direitos

Os textos das cartas, nomes e ícones pertencem à WizKids e à Wizards of the Coast. Vale manter o projeto como ferramenta de fã, não comercial, com o crédito aos detentores dos direitos.
