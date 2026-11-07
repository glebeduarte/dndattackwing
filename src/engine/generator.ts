// Gerador de legião, a partir das regras de Construção de Legiões do livro de regras:
// - a soma dos Custos de Pontos de Legião de criaturas e melhorias fica igual ou abaixo do total combinado
//   (120 ou 200 recomendados; 60 com só a caixa básica);
// - cada nome único aparece uma vez por legião, e nenhuma criatura equipa duas cópias da mesma melhoria;
// - cada ícone da faixa de melhorias aceita uma melhoria daquele tipo, respeitando restrições,
//   nível mínimo dos feitiços e penalidades de custo;
// - no máximo um artefato por legião (salvo efeitos que permitam mais);
// - alinhamentos podem ser misturados livremente;
// - o jogador com o menor total de pontos decide a iniciativa, então gastar um pouco menos tem valor.
// Toda a legalidade vem do motor (engine.ts); aqui só se escolhe o que tentar.

import { Legion, Upgrade, type Catalog, type Creature } from './engine';
import type { CreatureData, UpgradeData } from './types';

export type Style = 'equilibrada' | 'elite' | 'enxame';
export type AlignmentPick = 'qualquer' | 'Good' | 'Evil' | 'Neutral';

export interface GeneratorOptions {
  points: number;
  style: Style;
  alignment: AlignmentPick;
  element: string; // '' = qualquer
  dragonsOnly: boolean;
  sets: Record<string, boolean> | null; // null = todas as coleções
  initiative: boolean; // deixar alguns pontos livres para disputar a iniciativa
  seed: number;
  profile?: Profile;
}

/* ---------- perfil: o que o jogador quer da legião ---------- */

export type Play = 'agressivo' | 'defensivo' | 'distancia' | 'sopros' | 'magia';
export type Focus = 'dragao' | 'tropa' | 'heroi' | 'monstro';
export type Synergy = 'elemento' | 'alinhamento' | 'livre';
export type Context = 'aberto' | 'objetivos' | 'obstaculos';
export interface Profile { play?: Play; focus?: Focus[]; synergy?: Synergy; context?: Context; story?: string }

// Palavras da história em português que apontam para termos das cartas em inglês.
const STORY_TERMS: [RegExp, string[]][] = [
  [/tiamat/, ['Tiamat', 'Red Dragon', 'Blue Dragon', 'Green Dragon']], [/drag[aãoõe]+s?\b|dragon/, ['Dragon']], [/bahamut/, ['Bahamut', 'Platinum']], [/culto|cultist/, ['Cult', 'Wyrmspeaker']],
  [/metálic|metalic/, ['Copper', 'Bronze', 'Brass', 'Gold', 'Silver']], [/cromátic|cromatic/, ['Red Dragon', 'Blue Dragon', 'Green Dragon', 'Black Dragon', 'White Dragon']],
  [/vermelh/, ['Red']], [/azul/, ['Blue']], [/verde/, ['Green']], [/negr|pret/, ['Black']], [/branc/, ['White']],
  [/cobre/, ['Copper']], [/bronze/, ['Bronze']], [/latão|latao/, ['Brass']], [/ouro|dourad/, ['Gold']], [/prata|pratead/, ['Silver']],
  [/anã|anão|anões|anao|anoes/, ['Dwarf', 'Dwarven']], [/elf/, ['Elf']], [/drow/, ['Drow']], [/gigant/, ['Giant']], [/goblin/, ['Goblin']], [/hobgoblin|zhentarim/, ['Hobgoblin', 'Zhentarim']],
  [/morto|mortos|undead|espectr|lich/, ['Undead', 'Wraith', 'Dracolich']], [/demôni|demoni|abism/, ['Demon']], [/anjo|celestial/, ['Angel', 'Deva']],
  [/harpista/, ['Harper']], [/montaria|cavaleir|grifo|pégaso|pegaso/, ['Rider', 'Griffon', 'Pegasus', 'Hippogriff']], [/sombra|trevas|escurid/, ['Shadow', 'Negative', 'Darkness']],
  [/fogo|chama|vulc|lava/, ['Fire']], [/gelo|frio|neve|inverno/, ['Cold', 'Frost', 'White']], [/raio|tempestade|trovão|trovao/, ['Lightning', 'Thunder', 'Storm']],
  [/ácido|acido|pântano|pantano/, ['Acid', 'Black']], [/veneno|floresta/, ['Poison', 'Green', 'Wood Elf']], [/água|agua|mar|rio/, ['Water']], [/vento|céu|ceu|ar\b/, ['Air']], [/terra|pedra|montanha/, ['Earth', 'Stone']],
  [/mago|feitic|arcan/, ['Wizard', 'Arcane']], [/clérig|cleric|sacerd|divin/, ['Divine', 'Cleric', 'Paladin']], [/bárbar|barbar/, ['Barbarian']], [/patrulh|arqueir/, ['Ranger', 'Archer']],
];

export function storyTerms(story: string): string[] {
  const t = story.toLowerCase();
  const out = new Set<string>();
  for (const [re, terms] of STORY_TERMS) if (re.test(t)) terms.forEach((x) => out.add(x.toLowerCase()));
  // palavras em inglês escritas direto (nomes de cartas)
  for (const w of story.split(/[^A-Za-zÀ-ú'-]+/)) if (w.length >= 4 && /^[A-Z]/.test(w)) out.add(w.toLowerCase());
  return [...out];
}

function groupOf(c: CreatureData): Focus {
  const ids = c.identifiers ?? [];
  if (ids.includes('Dragon')) return 'dragao';
  if (ids.includes('Troop')) return 'tropa';
  if (/Human|Elf|Dwarf|Drow|Genasi|Half|Rider|Pegasus|Griffon|Angel|Deva/.test(c.classtype)) return 'heroi';
  return 'monstro';
}

const hayC = (c: CreatureData) => [c.name, c.classtype, ...(c.identifiers ?? []), c.special ?? '', c.set, c.element ?? ''].join(' ').toLowerCase();
const hayU = (u: UpgradeData) => [u.name, u.classtype ?? '', u.text ?? '', u.set, u.element ?? ''].join(' ').toLowerCase();

/** Quanto uma criatura combina com o perfil (1 = neutro). */
function creatureFit(c: CreatureData, p: Profile | undefined, legion: Legion, terms: string[]) {
  if (!p) return 1;
  let f = 1;
  if (p.focus?.length) f *= p.focus.includes(groupOf(c)) ? 4 : 0.2;
  const ranged = c.primary_attacks.some((a) => a.type === 'Ranged');
  if (p.play === 'agressivo') f *= 0.6 + c.attack * 0.25;
  if (p.play === 'defensivo') f *= 0.5 + (c.agility + c.armor) * 0.25 + c.health * 0.05;
  if (p.play === 'distancia') f *= ranged ? 2.5 : 0.6;
  if (p.play === 'sopros') f *= c.upgrades.includes('Dragon') ? 2.5 : 0.5;
  if (p.play === 'magia') f *= 0.6 + c.upgrades.filter((s) => s === 'Arcane' || s === 'Divine').length * 0.6;
  if (p.context === 'obstaculos') f *= c.flyer ? 1.8 : 0.6;
  if (p.context === 'objetivos') f *= c.identifiers.includes('Troop') || !c.flyer ? 1.6 : 1;
  const first = legion.creatures[0];
  if (first && p.synergy === 'elemento' && first.element) f *= c.element === first.element || (c.elements ?? []).includes(first.element) ? 3 : 0.5;
  if (first && p.synergy === 'alinhamento') f *= c.alignment === first.alignment ? 3 : 0.3;
  if (terms.length) { const h = hayC(c); const hits = terms.filter((t) => h.includes(t)).length; f *= hits ? 6 + hits * 4 : 0.4; }
  return f;
}

function upgradeFit(u: Upgrade, p: Profile | undefined, terms: string[]) {
  if (!p) return 1;
  const d = u.data;
  let f = 1;
  const area = ['line', 'cone', 'burst'].includes(String(d.area).toLowerCase());
  if (p.play === 'sopros') f *= area ? 2.2 : 1;
  if (p.play === 'agressivo') f *= d.attack ? 1.5 : 0.9;
  if (p.play === 'defensivo') f *= d.armorMod || /defense|armor|dodge|esquiva/i.test(d.text ?? '') ? 1.6 : 0.9;
  if (p.play === 'magia') f *= d.upgrade === 'Arcane' || d.upgrade === 'Divine' ? 1.6 : 0.9;
  if (p.play === 'distancia') f *= /Range [34]|Ranged/.test(d.text ?? '') ? 1.4 : 1;
  if (terms.length) { const h = hayU(d); f *= terms.some((t) => h.includes(t)) ? 1.6 : 1; }
  return f;
}

export interface GeneratedLegion {
  legion: Legion;
  score: number;
  total: number;
  slotsFilled: number;
  slotsTotal: number;
  notes: string[];
}

/* ---------- aleatoriedade reprodutível ---------- */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- avaliação ---------- */

const STYLE: Record<Style, { min: number; max: number; upgradeShare: number }> = {
  elite: { min: 2, max: 3, upgradeShare: 0.22 },
  equilibrada: { min: 3, max: 5, upgradeShare: 0.26 },
  enxame: { min: 5, max: 9, upgradeShare: 0.14 },
};

/** Força bruta de uma criatura: atributos, nível e ataques, sem custo. */
export function creaturePower(c: CreatureData) {
  const attacks = c.primary_attacks.reduce((s, a) => s + Math.min(a.range, 3) * 0.4, 0);
  return c.attack * 2.2 + c.agility * 1.4 + c.health * 1.6 + c.armor * 2 + c.level * 0.25 + c.actions.length * 0.5 + attacks;
}

function upgradeValue(u: Upgrade, c: Creature, legion: Legion) {
  const d = u.data;
  const cost = u.costForCreature(c, legion);
  const base = u.baseCost();
  let v = 3;
  if (d.attack) v += 2.5;
  if (d.penetrates) v += 1;
  if (d.action) v += 1;
  if (d.armorMod) v += 2;
  if (d.equip_special?.some((r) => r.func === 'add_upgrade')) v += 1.5;
  // Penalidade de custo paga: a melhoria não foi feita para esta criatura.
  const penalty = u.cost === '*' ? 0 : Math.max(0, cost - base);
  if (penalty > 0) v -= 2.5 + penalty * 0.4;
  // Sopro do próprio elemento: o caso que o livro cita.
  if (d.element && c.isElement(d.element)) v += 1.5;
  return { value: v, cost };
}

/* ---------- montagem ---------- */

function baseTroopName(name: string) {
  return name.replace(/\s+\d+$/, '');
}

function candidateCreatures(catalog: Catalog, o: GeneratorOptions) {
  return catalog.creatures.filter((c) => {
    if (o.sets && o.sets[c.set] === false) return false;
    if (o.alignment !== 'qualquer' && c.alignment !== o.alignment) return false;
    if (o.dragonsOnly && !c.identifiers.includes('Dragon')) return false;
    if (o.element && c.element !== o.element && !(c.elements ?? []).includes(o.element)) return false;
    return c.cost <= o.points;
  });
}

function candidateUpgrades(catalog: Catalog, o: GeneratorOptions) {
  return catalog.upgrades.filter((u) => !(o.sets && o.sets[u.set] === false));
}

function pickWeighted<T>(items: T[], weight: (t: T) => number, rnd: () => number): T | null {
  const ws = items.map((i) => Math.max(0.0001, weight(i)));
  const total = ws.reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1] ?? null;
}

function fillUpgrades(legion: Legion, target: number, upgradesFor: (c: CreatureData) => Upgrade[], rnd: () => number, fit: (u: Upgrade) => number = () => 1) {
  for (let guard = 0; guard < 40; guard++) {
    const left = target - legion.totalCost();
    if (left <= 0) break;
    let best: { c: Creature; u: Upgrade; score: number } | null = null;
    for (const c of legion.creatures) {
      if (!c.equipped.some((e) => !e) && !c.pre_equip_commands.some((x) => x.name === 'add_own_slot')) continue;
      for (const u of upgradesFor(c.data)) {
        if (!legion.canCreatureEquipUpgrade(c, u)) continue;
        const { value, cost } = upgradeValue(u, c, legion);
        if (cost > left || cost < 0) continue;
        const score = (value / Math.max(cost, 1)) * (0.75 + rnd() * 0.5) * fit(u);
        if (!best || score > best.score) best = { c, u, score };
      }
    }
    if (!best) break;
    legion.equip(best.c, best.u.data);
  }
}

function attempt(o: GeneratorOptions, creatures: CreatureData[], upgradesFor: (c: CreatureData) => Upgrade[], rnd: () => number): GeneratedLegion | null {
  const st = STYLE[o.style];
  const terms = o.profile?.story ? storyTerms(o.profile.story) : [];
  const limit = o.points;
  const creatureBudget = limit * (1 - st.upgradeShare) * (0.9 + rnd() * 0.2);
  const legion = new Legion();
  const usedTroops = new Set<string>();
  const want = st.min + Math.floor(rnd() * (st.max - st.min + 1));

  // 1. Criaturas: sorteio ponderado pela eficiência (força por ponto), puxado pelo estilo.
  for (let guard = 0; guard < 40 && legion.creatures.length < want; guard++) {
    const spent = legion.creatures.reduce((s, c) => s + c.cost, 0);
    const room = creatureBudget - spent;
    const slotsLeft = want - legion.creatures.length;
    const pool = creatures.filter((c) => {
      if (c.cost > room) return false;
      if (o.style === 'elite' && slotsLeft > 1 && c.cost < limit * 0.18) return false;
      if (o.style === 'enxame' && c.cost > Math.max(room / slotsLeft * 1.6, 12)) return false;
      if (c.unique && legion.creatures.some((x) => x.unique && (x.name === c.name || x.uniqueName === (c.uniquename || c.name)))) return false;
      if (usedTroops.has(baseTroopName(c.name))) return false;
      return true;
    });
    if (!pool.length) break;
    const pick = pickWeighted(pool, (c) => {
      const eff = creaturePower(c) / Math.max(c.cost, 1);
      const size = o.style === 'elite' ? c.cost / limit : o.style === 'enxame' ? 1 / c.cost : 1;
      return Math.pow(eff, 2) * (0.6 + size * 2) * (c.upgrades.length * 0.15 + 1) * creatureFit(c, o.profile, legion, terms);
    }, rnd);
    if (!pick || legion.addCreature(pick)) continue;
    usedTroops.add(baseTroopName(pick.name));
  }
  if (legion.creatures.length === 0) return null;

  // 2. Melhorias: a cada passo, a melhor razão valor/custo que ainda cabe, com um pouco de acaso.
  const target = o.initiative ? limit - 1 - Math.floor(rnd() * 3) : limit;
  fillUpgrades(legion, target, upgradesFor, rnd, (u) => upgradeFit(u, o.profile, terms));

  // 3. Sobrou muito? Cabe mais uma criatura barata, e depois mais melhorias.
  const cap = st.max + (o.style === 'enxame' ? 3 : 1);
  for (let extra = 0; extra < 3 && legion.creatures.length < cap && target - legion.totalCost() > 6; extra++) {
    const room = target - legion.totalCost();
    const pool = creatures.filter(
      (c) =>
        c.cost <= room &&
        !usedTroops.has(baseTroopName(c.name)) &&
        !(c.unique && legion.creatures.some((x) => x.unique && (x.name === c.name || x.uniqueName === (c.uniquename || c.name)))),
    );
    const pick = pickWeighted(pool, (c) => c.cost * Math.pow(creaturePower(c) / Math.max(c.cost, 1), 2) * creatureFit(c, o.profile, legion, terms), rnd);
    if (!pick || legion.addCreature(pick)) break;
    usedTroops.add(baseTroopName(pick.name));
    fillUpgrades(legion, target, upgradesFor, rnd, (u) => upgradeFit(u, o.profile, terms));
  }

  const total = legion.totalCost();
  if (total > limit) return null;
  const slotsTotal = legion.creatures.reduce((s, c) => s + c.upgrades.length, 0);
  const slotsFilled = legion.creatures.reduce((s, c) => s + c.equippedUpgrades().length, 0);
  const power = legion.creatures.reduce((s, c) => s + creaturePower(c.data), 0);
  const upgradeScore = legion.creatures.reduce(
    (s, c) => s + c.equippedUpgrades().reduce((t, u) => t + upgradeValue(u, c, legion).value, 0),
    0,
  );
  const unused = limit - total;
  // aderência ao perfil pesa tanto quanto a força
  const fitAvg = o.profile ? legion.creatures.reduce((t, c) => t + Math.log(creatureFit(c.data, o.profile, legion, terms) + 0.01), 0) / legion.creatures.length : 0;
  const score = power + upgradeScore * 1.2 + fitAvg * 25 - unused * (unused > 6 ? 2.5 : 0.6) - (o.initiative && unused === 0 ? 3 : 0);

  return { legion, score, total, slotsFilled, slotsTotal, notes: describe(legion, o, total) };
}

function describe(legion: Legion, o: GeneratorOptions, total: number): string[] {
  const notes: string[] = [];
  const left = o.points - total;
  notes.push(left === 0 ? `Usa todos os ${o.points} pontos.` : `Usa ${total} de ${o.points} pontos; sobram ${left}.`);
  if (o.initiative && left > 0) notes.push(`Ficar ${left} abaixo do limite dá a decisão da iniciativa se o adversário gastar tudo.`);
  const breath = legion.creatures.flatMap((c) => c.equippedUpgrades().filter((u) => u.data.element && c.isElement(u.data.element!)).map((u) => `${u.name} em ${c.name}`));
  if (breath.length) notes.push(`Sem penalidade de elemento: ${breath.slice(0, 3).join(', ')}.`);
  const penal = legion.creatures.flatMap((c) =>
    c.equippedUpgrades().filter((u) => u.cost !== '*' && u.costForCreature(c, legion) > u.baseCost()).map((u) => u.name),
  );
  if (penal.length) notes.push(`Paga penalidade de custo em ${penal.join(', ')}.`);
  const aligns = [...new Set(legion.creatures.map((c) => c.alignment))];
  if (aligns.length > 1) notes.push('Mistura alinhamentos, o que as regras permitem.');
  const arts = legion.legionArtifacts();
  if (arts.length) notes.push(`Artefato: ${arts.map((a) => a.name).join(', ')}.`);
  if (o.profile?.story) {
    const terms = storyTerms(o.profile.story);
    const hit = legion.creatures.filter((c) => terms.some((t) => hayC(c.data).includes(t))).map((c) => c.name);
    if (hit.length) notes.push(`Ligadas à sua história: ${[...new Set(hit)].join(', ')}.`);
  }
  return notes;
}

/** Gera várias tentativas e devolve as melhores legiões distintas (por conjunto de criaturas). */
export function generateLegions(catalog: Catalog, o: GeneratorOptions, tries = 70, keep = 3): GeneratedLegion[] {
  const rnd = mulberry32(o.seed);
  const creatures = candidateCreatures(catalog, o);
  const upgrades = candidateUpgrades(catalog, o);
  // Para cada criatura, as melhorias que ela aceita sozinha. Equipar outras cartas só pode
  // abrir poucas portas novas (slots extras), então este recorte guarda quase tudo e é muito mais rápido.
  const memo = new Map<number, Upgrade[]>();
  const upgradesFor = (c: CreatureData) => {
    let list = memo.get(c.uid);
    if (!list) {
      const l = new Legion();
      l.addCreature(c);
      const probe = l.creatures[0];
      for (const t of ['Arcane', 'Divine', 'Dragon', 'Equipment', 'Heroic', 'Monster']) probe.addUpgradeSlotOfType(t);
      list = upgrades.map((d) => new Upgrade(d)).filter((u) => u.creatureCanEquip(probe));
      memo.set(c.uid, list);
    }
    return list;
  };
  const results: GeneratedLegion[] = [];
  for (let i = 0; i < tries; i++) {
    const r = attempt(o, creatures, upgradesFor, rnd);
    if (r) results.push(r);
  }
  results.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: GeneratedLegion[] = [];
  for (const r of results) {
    const key = r.legion.creatures.map((c) => c.uid).sort().join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
    if (out.length === keep) break;
  }
  return out;
}
