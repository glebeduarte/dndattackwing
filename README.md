# Attack Wing · Construtor de legião

Construtor de legiões para **D&D Attack Wing**, refeito a partir do construtor oficial que ficava em `build.dndaw.com` e foi encerrado. É um app estático (React + TypeScript + Vite), sem banco de dados: as 155 criaturas e os 418 upgrades vêm em JSON dentro do próprio app, e as legiões ficam no navegador ou num link.

## O que faz

- Catálogo de criaturas e upgrades com busca no texto, filtros por coleção, elemento, slot e custo, e ordenação.
- Legião com custo total, custo por criatura (base + upgrades) e uma linha de custo contra o limite escolhido (100 a 300 pts, ou sem limite).
- Equipar pelos botões numerados de cada upgrade, pela carta em destaque ou arrastando a carta até a criatura. Clicar num slot vazio filtra o catálogo para aquele tipo.
- Todas as regras do construtor original: slots extras (Pearl of Power, Veterans, Saddle of the Cavalier), slots alternativos, custos especiais (Breath Weapons pelo PWV, penalidades de elemento e de identificador, Helm of Leadership, Wealth of the Ancients), restrições de arma, armadura e escudo, artefatos (um por legião, conjuntos "of Tiamat" e "of Bahamut"), cartas únicas e o marcador Evil de Corruption.
- Cartão de manobras de voo e de solo em cada criatura.
- Link de compartilhamento em `/link/:code`, compatível com os links do site antigo.
- Legiões salvas no navegador, folha de legião para impressão em torneio e página própria de cada carta (`/card/creature/:uid`, `/card/upgrade/:uid`).
- Layout próprio para celular, com Catálogo, Legião e Carta em abas.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm test         # testes do motor de regras
npm run build    # build de produção em dist/
```

Na Vercel, o `vercel.json` manda todas as rotas para o `index.html`.

## Estrutura

- `src/data/` dados das cartas extraídos do site original.
- `src/engine/` motor de regras (custos, legalidade, comandos de equipar, código do link) e seus testes.
- `src/ui/`, `src/pages/` interface.
- `public/icons/` ícones do jogo baixados do servidor original. Faltam `bank`, `disease` e `color-disease`, que aparecem como abreviação.
- `docs/captura/` a captura completa do site original: especificação do motor de regras, dados, schema e telas.

## Direitos

Ferramenta de fã, sem fins comerciais. D&D Attack Wing é da WizKids e da Wizards of the Coast; textos das cartas, nomes e ícones pertencem aos seus donos.
