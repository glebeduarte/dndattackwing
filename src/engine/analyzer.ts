// Analisador de legião: mede a legião pelos princípios do jogo e sugere como jogar com ela.
// Tudo é calculado no navegador a partir dos números das cartas; não há servidor.

import type { Legion } from './engine';
import { parseSpecial } from './opponent';

export interface Metric { id: string; label: string; score: number; text: string }
export interface Analysis {
  score: number;
  verdict: string;
  archetype: string;
  metrics: Metric[];
  strengths: string[];
  risks: string[];
  strategy: string[];
  tips: string[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
// Dados esperados por dado de ataque e de defesa (3/8 acerto, 1/8 crítico, 3/8 esquiva).
const ATK = 0.5, DEF = 0.375;

export function analyzeLegion(l: Legion, target: number | null): Analysis | null {
  const cs = l.creatures;
  if (!cs.length) return null;
  const total = l.totalCost();
  const limit = target ?? total;
  const n = cs.length;
  const ups = cs.flatMap((c) => c.equippedUpgrades().map((u) => ({ c, u, s: parseSpecial(u.data as never) })));
  const slots = cs.reduce((t, c) => t + c.equipped.length, 0);
  const filled = cs.reduce((t, c) => t + c.equipped.filter(Boolean).length, 0);
  const flyers = cs.filter((c) => c.flyer).length;
  const dragons = cs.filter((c) => c.identifiers.includes('Dragon'));
  const troops = cs.filter((c) => c.identifiers.includes('Troop'));
  const hp = cs.reduce((t, c) => t + c.health, 0);
  const firepower = cs.reduce((t, c) => t + c.attack * ATK, 0);
  const avgAgi = cs.reduce((t, c) => t + c.agility, 0) / n;
  const avgArmor = cs.reduce((t, c) => t + c.baseArmorWithUpgrades(), 0) / n;
  const breaths = ups.filter((x) => x.s?.kind === 'attack' && x.s.area);
  const specials = ups.filter((x) => x.s?.kind === 'attack');
  const levels = cs.map((c) => c.level);
  const maxLevel = Math.max(...levels);
  const ranged = cs.filter((c) => c.data.primary_attacks.some((a) => a.type === 'Ranged')).length;

  const metrics: Metric[] = [];
  const strengths: string[] = [];
  const risks: string[] = [];
  const tips: string[] = [];

  // 1. Uso dos pontos
  const use = target ? total / target : 1;
  const left = target ? target - total : 0;
  let sPts = use > 1 ? 20 : left <= 3 ? 100 : left <= 6 ? 85 : left <= 12 ? 65 : 40;
  metrics.push({ id: 'pts', label: 'Uso dos pontos', score: sPts, text: use > 1 ? `Passa ${-left} pts do limite de ${target}: a legião não é válida.` : target ? `Usa ${total} de ${target} pts${left ? `; sobram ${left}` : ''}.` : `${total} pts sem limite definido.` });
  if (use > 1) risks.push(`A legião passa ${-left} pontos do limite. Tire uma melhoria ou troque uma criatura.`);
  else if (left > 6) tips.push(`Sobram ${left} pontos: dá para encaixar uma melhoria ou trocar por uma criatura melhor. Deixar 1 a 3 pontos livres ajuda a ganhar a iniciativa.`);
  else if (left >= 1 && left <= 3) strengths.push(`Sobram ${left} pontos, o que costuma garantir a iniciativa contra legiões que gastam tudo.`);

  // 2. Slots
  const fill = slots ? filled / slots : 1;
  metrics.push({ id: 'slots', label: 'Melhorias equipadas', score: clamp(fill * 100), text: `${filled} de ${slots} slots ocupados.` });
  if (fill < 0.5 && left > 0) tips.push('Mais da metade dos slots está vazia. Melhorias baratas de defesa (Shield, Hidecarved Scales) costumam render mais que pontos sobrando.');

  // 3. Ativações
  const actPer100 = (n / limit) * 100;
  const sAct = clamp(actPer100 >= 3 ? 90 : actPer100 >= 2.2 ? 75 : actPer100 >= 1.6 ? 60 : 40);
  metrics.push({ id: 'act', label: 'Número de ativações', score: sAct, text: `${n} criatura(s). Mais ativações dão mais escolhas de ordem e de alvo; menos ativações concentram força.` });
  if (n === 1) risks.push('Uma criatura só: qualquer azar nos dados decide a partida, e o adversário sempre sabe quem atacar.');

  // 4. Poder de fogo e resistência por ponto
  const fpPer = (firepower / limit) * 100;
  const tough = cs.reduce((t, c) => t + c.health * (1 + c.agility * DEF) + c.baseArmorWithUpgrades() * 1.5, 0);
  const tPer = (tough / limit) * 100;
  metrics.push({ id: 'fire', label: 'Poder de fogo', score: clamp(fpPer * 22), text: `Cerca de ${firepower.toFixed(1)} danos esperados por rodada com as armas primárias${breaths.length ? `, mais ${breaths.length} ataque(s) em área` : ''}.` });
  metrics.push({ id: 'tough', label: 'Resistência', score: clamp(tPer * 6.5), text: `${hp} de vida no total, Agilidade média ${avgAgi.toFixed(1)}, Armadura média ${avgArmor.toFixed(1)}.` });

  // 5. Sinergia
  let syn = 55;
  const synNotes: string[] = [];
  for (const { c, u, s } of ups) {
    if (!s) continue;
    if (s.needs === 'target' && !c.actions.includes('Target')) { syn -= 12; risks.push(`${u.name} exige ficha de Alvo, mas ${c.name} não tem Adquirir alvo na barra de ações.`); }
    if (s.needs === 'concentrate' && !c.actions.includes('Concentrate')) { syn -= 12; risks.push(`${u.name} exige Concentração, mas ${c.name} não tem essa ação.`); }
    if (s.area && s.element && c.element === s.element) { syn += 6; synNotes.push(`${u.name} combina com o elemento de ${c.name} e sai mais barato.`); }
    if (s.area && s.element && c.element && c.element !== s.element) { syn -= 4; tips.push(`${u.name} em ${c.name} custa mais porque o sopro não é do elemento dela.`); }
  }
  const aligns = new Set(cs.map((c) => c.alignment));
  if (aligns.size === 1) { syn += 6; synNotes.push('Todas as criaturas têm o mesmo alinhamento, o que libera melhorias que pedem legião Boa ou Má.'); }
  const bahamut = cs.find((c) => c.name === 'Bahamut');
  if (bahamut && cs.filter((c) => c.alignment === 'Good').length > 2) { syn += 8; synNotes.push('Bahamut dá +1 dado de ataque às criaturas Boas a Alcance 1: mantenha-as perto dele.'); }
  if (troops.length && dragons.length) { syn += 4; synNotes.push('Dragões e tropas juntos: as tropas seguram objetivos no solo enquanto os dragões atacam do alto.'); }
  const sameLevelPairs = levels.length - new Set(levels).size;
  if (sameLevelPairs) synNotes.push(`${sameLevelPairs + 1} criaturas dividem o mesmo nível; a iniciativa decide quem age antes nelas.`);
  metrics.push({ id: 'syn', label: 'Sinergia', score: clamp(syn), text: synNotes[0] ?? 'Pouca combinação entre cartas; cada criatura joga sozinha.' });
  strengths.push(...synNotes.slice(0, 3));

  // 6. Mobilidade e alcance
  const mob = clamp((flyers / n) * 70 + (ranged / n) * 30 + 10);
  metrics.push({ id: 'mob', label: 'Mobilidade e alcance', score: mob, text: `${flyers} de ${n} voam; ${ranged} têm ataque à distância.` });
  if (flyers === 0) risks.push('Nenhuma criatura voa: obstáculos e terreno vão limitar muito o movimento.');

  // Arquétipo
  let archetype = 'Equilibrada';
  if (n <= 2 && dragons.length) archetype = 'Elite de dragões';
  else if (troops.length >= Math.ceil(n / 2)) archetype = 'Muralha de tropas';
  else if (n >= 5) archetype = 'Enxame';
  else if (breaths.length >= 2) archetype = 'Artilharia de sopros';
  else if (ranged > n / 2) archetype = 'Ataque à distância';

  // Estratégia
  const strategy: string[] = [];
  if (archetype === 'Elite de dragões') {
    strategy.push('Mantenha os dragões juntos e entre em combate pelo mesmo flanco, para que o adversário nunca consiga isolar um deles.');
    strategy.push('Use a Esquiva quando não houver alvo bom: cada ponto de vida conta mais numa legião com poucas criaturas.');
  }
  if (archetype === 'Enxame' || archetype === 'Muralha de tropas') {
    strategy.push('Mova as criaturas de nível baixo primeiro para bloquear o caminho e esconder as mais fortes; você ativa depois dos níveis maiores do adversário e reage ao que ele fez.');
    strategy.push('Espalhe a legião para não entregar vários alvos a um mesmo cone ou linha de sopro.');
  }
  if (breaths.length) strategy.push(`Guarde ${breaths.map((b) => b.u.name).join(' e ')} para o turno em que o gabarito pegar duas ou mais criaturas; o sopro entra em recarga por algumas rodadas depois de usado.`);
  if (specials.some((x) => x.s?.needs === 'target')) strategy.push('Adquira alvo antes do turno do ataque especial: sem a ficha, a melhoria não pode ser usada.');
  if (ranged > n / 2) strategy.push('Fique a Alcance 3 e use a ação de Alvo para rolar de novo; só feche a distância quando o adversário estiver ferido.');
  if (flyers === n) strategy.push('Use a altitude: ataques corpo a corpo de criaturas no solo não alcançam quem está no ar.');
  if (maxLevel >= 12) strategy.push('A sua criatura de nível mais alto ataca primeiro no combate. Use isso para eliminar quem ainda não atacou.');
  if (left >= 1 && left <= 3) strategy.push('Com pontos sobrando, você provavelmente terá a iniciativa: nos empates de nível, mova por último e ataque primeiro.');
  if (!strategy.length) strategy.push('Avance em formação, escolha um alvo por rodada e concentre todos os ataques nele até derrubá-lo.');

  const weights: Record<string, number> = { pts: 1, slots: 0.7, act: 0.8, fire: 1.2, tough: 1.1, syn: 1.2, mob: 0.8 };
  const score = clamp(metrics.reduce((t, m) => t + m.score * weights[m.id], 0) / Object.values(weights).reduce((a, b) => a + b, 0));
  const verdict = use > 1 ? 'Inválida: passa do limite de pontos' : score >= 80 ? 'Muito forte' : score >= 68 ? 'Boa' : score >= 55 ? 'Jogável, com pontos fracos' : 'Precisa de ajustes';

  return { score, verdict, archetype, metrics, strengths: [...new Set(strengths)].slice(0, 5), risks: [...new Set(risks)].slice(0, 5), strategy, tips: [...new Set(tips)].slice(0, 4) };
}
