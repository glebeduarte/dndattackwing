// Tradução dos tipos (classtype) de criaturas e melhorias.

const COLORS: Record<string, string> = {
  Blue: 'Azul', Brass: 'de Latão', Bronze: 'de Bronze', Copper: 'de Cobre', Gold: 'de Ouro', Green: 'Verde',
  Red: 'Vermelho', White: 'Branco', Black: 'Negro', Silver: 'de Prata',
};

const EXACT: Record<string, string> = {
  'Aarakocra Leader': 'Líder Aarakocra', 'Aarakocra Troop': 'Tropa Aarakocra', 'Air Elemental': 'Elemental do Ar',
  'Black Shadow Dragon': 'Dragão Negro das Sombras', Chimera: 'Quimera', 'Dragon Goddess': 'Deusa Dragão',
  Dragonrider: 'Cavaleiro de Dragão', 'Dread Wraith (Undead)': 'Espectro Terrível (Morto-vivo)', Drider: 'Drider',
  'Drow Elf Ranger': 'Patrulheiro Elfo Drow', 'Dwarven Siege Weapon': 'Arma de Cerco Anã', 'Earth Genasi Fighter': 'Guerreiro Genasi da Terra',
  'Elf Leader': 'Líder Elfo', 'Frost Giant': 'Gigante do Gelo', Gargoyle: 'Gárgula', 'Goblin Leader': 'Líder Goblin', 'Goblin Troop': 'Tropa Goblin',
  Griffon: 'Grifo', 'Half-Black Dragon Fighter': 'Guerreiro Meio-Dragão Negro', 'Half-Elf Rider': 'Cavaleiro Meio-Elfo', 'Halfling Rider': 'Cavaleiro Halfling',
  Harpy: 'Harpia', Hieracosphinx: 'Hieracoesfinge', 'Hobgoblin Shaman Leader': 'Líder Xamã Hobgoblin', 'Hobgoblin Troop': 'Tropa Hobgoblin',
  'Human Barbarian (Fire Cult)': 'Bárbaro Humano (Culto do Fogo)', 'Human Fighter (Earth Cult)': 'Guerreiro Humano (Culto da Terra)',
  'Human Paladin': 'Paladino Humano', 'Human Ranger': 'Patrulheiro Humano', 'Human Ranger (Water Cult)': 'Patrulheiro Humano (Culto da Água)',
  'Human Red Wizard': 'Mago Vermelho Humano', 'Human Rider': 'Cavaleiro Humano', 'Human Rogue (Air Cult)': 'Ladino Humano (Culto do Ar)',
  'Mind Flayer': 'Devorador de Mentes', 'Mind Flayer Arcanist': 'Devorador de Mentes Arcanista', 'Movanic Deva Angel': 'Anjo Deva Movânico',
  'Nalfeshnee Demon': 'Demônio Nalfeshnee', Nightmare: 'Pesadelo', 'Ogre Mage': 'Ogro Mago', Pegasus: 'Pégaso', 'Platinum Dragon God': 'Deus Dragão de Platina',
  'Red Dracolich (Undead Red Dragon)': 'Dracolich Vermelho (Dragão Vermelho Morto-vivo)', 'Shadow Beholder': 'Observador das Sombras',
  'Shield Dwarf Fighter': 'Guerreiro Anão Escudo', 'Solar Angel': 'Anjo Solar', 'Stone Giant': 'Gigante de Pedra', 'Stone Giant Elder': 'Ancião Gigante de Pedra',
  'Sun Elf Troop': 'Tropa de Elfos do Sol', 'Sun Elf Wizard': 'Mago Elfo do Sol', 'Undead Rider': 'Cavaleiro Morto-vivo', 'Vrock Demon': 'Demônio Vrock',
  'Wood Elf Druid': 'Druida Elfo da Floresta', 'Wraith (Undead)': 'Espectro (Morto-vivo)', Wyvern: 'Serpe', 'Giant Rat': 'Rato Gigante',
};

const PHRASES: [string, string][] = [
  ['Campaign Artifact', 'Artefato de Campanha'], ['Arcane Spell', 'Feitiço Arcano'], ['Divine Spell', 'Feitiço Divino'],
  ['Arcane Feat', 'Talento Arcano'], ['Divine Feat', 'Talento Divino'], ['Breath Weapon', 'Arma de Sopro'],
  ['Two-Handed Weapon', 'Arma de Duas Mãos'], ['Full Plate Armor', 'Armadura de Placas'], ['Leather Armor', 'Armadura de Couro'],
  ['Magic Horn', 'Trompa Mágica'], ['Flying Mount', 'Montaria Voadora'], ['Eye Ray', 'Raio Ocular'], ['Explosive Heart', 'Coração Explosivo'],
  ['Weapon', 'Arma'], ['Armor', 'Armadura'], ['Bow', 'Arco'], ['Arrow', 'Flecha'], ['Bracers', 'Braçadeiras'], ['Cloak', 'Manto'],
  ['Helmet', 'Elmo'], ['Shield', 'Escudo'], ['Saddle', 'Sela'], ['Potion', 'Poção'], ['Relic', 'Relíquia'], ['Ring', 'Anel'],
  ['Stone', 'Pedra'], ['Wand', 'Varinha'], ['Figurine', 'Estatueta'], ['Mount', 'Montaria'], ['Resistance', 'Resistência'],
  ['Augment', 'Aprimoramento'], ['Combat', 'Combate'], ['Special', 'Especial'], ['Immortal', 'Imortal'],
  ['Ranged ', 'À distância, '], ['Ranged', 'À distância'], ['Melee ', 'Corpo a corpo, '], ['Melee', 'Corpo a corpo'], [', ->', ' ->'], [', >', ' >'], ['Range', 'Alcance'], ['Burst', 'Estouro'], ['Line', 'Linha'], [' or ', ' ou '],
];

export function translateClasstype(s: string | null | undefined): string {
  if (!s) return '';
  const base = s.replace(/\s*\(.*$/, '');
  const paren = s.slice(base.length);
  const dragon = /^(Adult|Ancient|Young) (\w+) Dragon$/.exec(base);
  if (dragon && COLORS[dragon[2]]) {
    const age = dragon[1] === 'Adult' ? 'Adulto' : dragon[1] === 'Ancient' ? 'Ancião' : 'Jovem';
    return `Dragão ${COLORS[dragon[2]]} ${age}${translateParen(paren)}`;
  }
  if (EXACT[s]) return EXACT[s];
  if (EXACT[base]) return EXACT[base] + translateParen(paren);
  let out = s;
  for (const [en, pt] of PHRASES) out = out.split(en).join(pt);
  return out;
}

function translateParen(p: string) {
  let out = p;
  for (const [en, pt] of PHRASES) out = out.split(en).join(pt);
  return out;
}

const AREAS: Record<string, string> = { Line: 'Linha', Cone: 'Cone', Burst: 'Estouro' };
export const translateArea = (s: string) => AREAS[s] ?? s;
