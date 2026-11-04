# 02. Motor de regras do D&D Attack Wing Legion Builder

Fonte: `engine_globals_equipcommand.pretty.js` (GLOBALS + EquipCommand) e `engine_app.pretty.js` (serviços, factories, diretivas, templates). Dados: `out/module_125.json` (155 criaturas) e `out/module_126.json` (418 upgrades). Todo o pseudocódigo abaixo foi reescrito; nada foi executado.

Convenção: "não determinado" marca o que não aparece no código lido.

---

## 1. GLOBALS e constantes

```ts
const GLOBALS = Object.freeze({
  ENUM_ALIGNMENTS: ["Good", "Evil", "Neutral"],
  ENUM_ELEMENTS:   ["Acid","Cold","Disease","Fire","Lightning","Negative","Poison","Positive","Thunder"],
  ENUM_ACTIONS:    ["Charge","Concentrate","Dodge","Feint","Target"],
  ENUM_AREAS:      ["Burst","Cone","Line"],
  ENUM_UPGRADES:   ["Arcane","Divine","Dragon","Equipment","Heroic","Monster","Universal"],
  ENUM_HITLEVELS:  ["Air","Both","Either","Ground","Same"],
});
const RESOURCE_CONFIG = { urlPrefix: "/api/" };       // módulo "config"
const ICON_BASE = "https://dndaw.com/static/icon/";   // diretiva dndawicon
const LOCALSTORAGE_PREFIX = "ngStorage-";             // ngStorage
const TITLE_SUFFIX = " - Dungeons & Dragons: Attack Wing Legion Builder";
const PRINT_FORM_ACTION = "https://dndaw.com/catsync/form/tournament.php";
const PRINT_SLOT_ABBR = { Dragon:"Dr", Monster:"M", Heroic:"H", Equipment:"E", Arcane:"A", Divine:"Di", Universal:"*" };
const VALID_SORTS = [ {name:"Release Order", value:"+uid"}, {name:"Alphabetical", value:"+name"} ];
const INITIAL_TOKENS = { Evil: 0, WealthOfTheAncients: 0 };
const MOVE_TABLE_WITH_ZERO    = [5,4,3,2,1,0,-1];
const MOVE_TABLE_WITHOUT_ZERO = [6,5,4,3,2,1,-1];
const MOVE_SYMBOLS = ["<","\\","^","/",">","n"];
```

`Creature.valid_elements = ENUM_ELEMENTS` e `Creature.valid_equip_types = ENUM_UPGRADES` (usados nos selects de filtro).

Observação sobre os dados: `hitlevel` e `area` nos JSON não respeitam os enums (há "either", "Flying", "360", "false", "arc" etc.). Os enums não são usados para validar nada; servem só para os selects.

### 1.1 Modelo de dados

```ts
interface Attack { type: "Melee"|"Ranged"|string; range: number; description: string; arc: string }
interface MoveGrid {               // movement.flight | movement.ground
  [speed: string]: (null|"g"|"w"|"r")[] | number; // chaves "-1","0".."6" -> array de 6 posições
  reds: number; reverse: number; wingover?: number;
}
interface CreatureData {
  _id: string; uid: number; name: string; classtype: string; identifiers: string[];
  level: number; cost: number; alignment: "Good"|"Evil"|"Neutral";
  element: string|null; elements?: string[]|null;   // element2 é lido pelo código mas não existe nos dados
  attack: number; agility: number; health: number; armor: number;
  special: string; flyer: boolean; base: "Small"|"Large"|"Huge";
  set: string; wave: string; unique: boolean; uniquename?: string|null;
  troop?: boolean; Troop?: unknown;
  movement: { flight?: MoveGrid; ground?: MoveGrid };
  primary_attacks: Attack[]; actions: string[];
  upgrades: string[];                // barra de slots, ex. ["Dragon","Dragon","Dragon","Arcane"]
  cost_special?: Rule[];             // modificadores de custo aplicados aos upgrades equipados
  equip_special?: Rule[];
}
interface Rule { func: string; params?: any }
interface UpgradeData {
  _id: string; uid: number; name: string; classtype: string;
  upgrade: "Arcane"|"Divine"|"Dragon"|"Equipment"|"Heroic"|"Monster"|"Universal";
  cost: string;                      // sempre string nos dados; "*" em 43 cartas
  unique: boolean; artifact?: boolean; artifactSet?: string;   // "of Tiamat" | "of Bahamut"
  level?: number; element?: string; text: string; set: string; wave: string;
  area?, arc?, range?, dts?, disables?, discards?, exhausts?, action?, attack?, penetrates?,
  hitlevel?, target?, concentrate?, ignores?, movement?;
  armorMod?: { base?: number; add?: number };
  restriction: Rule[]|null; cost_special: Rule[]; cost_penalty: unknown[];
  equip_special?: Rule[]; legion_cost_special?: Rule[];
  alternateSlot?: { slot: string; restriction: Rule[] }[];
}
```

No construtor de `Creature`: copia os dados, cria `attack1`, `attack2`... a partir de `primary_attacks`, `equipped = upgrades.map(() => null)`, `equip_restrict = {}`, `unequip_funcs = {}`, `post_unequip_funcs = {}`, `pre_equip_commands = []`, `upgrade_uses_alt_id = {}`, `upgrade_equip_depends_on = {}` e chama `preEquipCommands()`. Bug fiel ao original: o construtor faz `equip_special = []` depois do `extend`, apagando qualquer `equip_special` vindo dos dados (nenhuma criatura usa, então não há efeito prático).

No construtor de `Upgrade`: `restriction ||= []`, `cost_special ||= []`, `post_equip_func = null`, `pre_equip_commands = []` (populado a partir de `equip_special`), `post_unequip_commands = []`, `legion_cost_mod = 0`.

---

## 2. Cálculo de custo de upgrade

```ts
baseCost(u) = u.cost === "*" ? 0 : parseInt(u.cost)

costForCreature(u, c) =
    baseCost(u)
  + Σ UPGRADE_COST_SPECIAL[r.func](c, r.params)  para r em u.cost_special
  + c.costModifier(u)                            // cost_special da CRIATURA
  + u.legion_cost_mod                            // calculado por legionCostModifier
```

### 2.1 `cost_special` do upgrade (`this` = upgrade)

| func | params | semântica | uso |
|---|---|---|---|
| `pwv` | `{add?}` | `c.attack + (add ?? 0)` (Primary Weapon Value) | 28 |
| `dragon_element` | `{required, penalty}` | `c.isElement(required) ? 0 : penalty` | 25 |
| `identifier` | `{required, penalty}` | 0 se `hasPrimaryIdentifier(required)` ou `hasAlternateIdentifier(required, this, params)`, senão `penalty` | 23 |
| `class_type` | `{required, penalty}` | 0 se `c.classtype` contém `required` (`String.search`, portanto regex), senão `penalty` | 1 (Sophisticated Tactics: Hobgoblin, +3) |
| `red_maneuvers` | `{basecost}` | `parseInt(c.movement.flight.reds) + (parseInt(basecost) or 0)`; sem flight, só basecost | 1 (Aerobat Amulet, base 2) |
| `base_armor` | `{multiplier?}` | `c.baseArmorWithUpgrades() * (multiplier ?? 1)` | 1 (Barkskin, x3) |
| `base_attribute` | `{attribute, add?}` | `c[attribute] + parseInt(add)` | 1 (Amulet of Health: health - 2) |

Sem params: `identifier`, `class_type`, `base_armor`, `base_attribute` retornam 0. Exemplo: Acid Breath (`cost "*"`, `[pwv, dragon_element{Acid,5}]`) em Balagos (attack 5, Fire) = 0 + 5 + 5 = 10.

### 2.2 `cost_special` da criatura (`Creature.costModifier`, `this` = criatura, recebe o upgrade)

| func | params | semântica |
|---|---|---|
| `slot_master` | `{type?, class?, exclude?, modifier}` | 0 se `exclude === u.uid`; 0 se `class` definido e `u.classtype` não contém `class`; senão, se `type === u.upgrade` e `modifier`, retorna `parseInt(modifier)`; caso contrário 0. Ex.: Nymmestra `{type:Arcane, class:"Arcane Spell", modifier:-1}` |
| `name_master` | `{name, modifier}` | `name === u.name ? parseInt(modifier) : 0`. Ex.: Arveiaturace `-3` em "Close Quarters" |
| `wealth_of_ancients_discount` | `{type, modifier}` | só se `u.artifact`. Se `this.wealthOfAncients` é nulo e `type === u.upgrade` retorna modifier; se `this.wealthOfAncients === u.uid` retorna modifier; senão 0 |

Esses cost_special podem também ser adicionados dinamicamente pelo comando `add_cost_special` (Helm of Leadership, Veterans, Wealth of the Ancients).

### 2.3 `cost_penalty`
Campo presente nos dados (sempre lista vazia) e **não lido** pelo código. Ignorar.

### 2.4 `legion_cost_mod` / `legion_cost_special`

```ts
LEGION_COST_SPECIAL.number_of_artifacts(u, {name_contains}) =
  count(a in legion.legionArtifacts() where a.name.includes(name_contains))
legionCostModifier(u) = u.legion_cost_mod = Σ funcs(u.legion_cost_special)
```
Usado nos 12 artefatos "of Tiamat"/"of Bahamut": o custo sobe +1 para cada artefato da mesma família na legião (incluindo o próprio). Atenção: `legion_cost_mod` só é recalculado quando o template do `creature` chama `upgradeCostForCreature` (efeito colateral na renderização). Na reconstrução, calcular isso de forma pura dentro de `costForCreature`.

### 2.5 Custo `*`
`"*"` vale 0 em `baseCost` (todo o custo vem de `cost_special`). No filtro de custo máximo, cartas com `"*"` são **excluídas** quando há filtro ativo. Em `legionArtifactTotalCost`, `parseInt("*")` gera NaN e o total vira `"?"`.

### 2.6 Custo único
Não há ajuste de custo por `unique`; o campo só afeta legalidade (seção 5) e o estilo (`uniquecostbg` versus `costbg`).

### 2.7 Custo da criatura e da legião
```ts
creature.totalCost() = creature.cost + Σ u.costForCreature(creature) para u equipado
legion.totalCost()   = Σ creature.totalCost()
legion.totalCards()  = nº criaturas + nº upgrades equipados
```

---

## 3. Legalidade de equipar

### 3.1 Slots
```ts
openUpgradeSlotOfType(type): index|null
  // primeiro índice i com equipped[i] === null e (type === "*" || type === "Universal" || upgrades[i] === type)
lastOpenUpgradeSlotOfType(type)   // igual, do fim para o início
numberOpenUpgradeSlotsOfType(type)
addUpgradeSlotOfType(type)        // upgrades.push(type); equipped.push(null)
removeUpgradeSlotOfType(type)     // remove o último slot livre daquele tipo
```
Universal: um upgrade com `upgrade: "Universal"` cabe em **qualquer** slot livre. Não existe slot "Universal" nas criaturas.

### 3.2 `Creature.canEquipUpgrade(u)`
```ts
if (!u) return false
if (slotContainingUpgrade(u) > -1) return false   // mesma instância ou mesmo NOME já na criatura
slot = openUpgradeSlotOfType(u.upgrade)
  ?? openUpgradeSlotOfType(u.hasAlternateSlot(this))       // alternateSlot do upgrade
  ?? openUpgradeSlotOfType(this.hasAlternateSlotForUpgrade(u)?.slot) // comando add_alternate_slot na criatura
  ?? (this.upgradeAddsOwnSlot(u) ? true : null)             // comando add_own_slot na criatura
return slot !== null && u.creatureCanEquip(this)
```
`u.hasAlternateSlot(c)`: percorre `u.alternateSlot[]`, retorna o primeiro `slot` cuja `restriction` passa em `processRestrictionsForCreature`. Exemplo: Bag of Diamond Dust usa slot Heroic se a criatura for Siege Weapon ou Troop.

### 3.3 `Upgrade.creatureCanEquip(c)`
```ts
if (!processRestrictions(u.restriction, c)) return false
for (r of Object.values(c.equip_restrict))       // restrições "persistentes" deixadas por upgrades já equipados
  if (r && r.func && !r.func.call(u, c, r.params ?? {})) return false
return true

processRestrictions(list, c):
  if (!c) return false; if (!list?.length) return true
  return list.every(r => !RESTR[r.func] || RESTR[r.func].call(u, c, r.params))  // func desconhecida = passa
```
Todas as restrições do array são AND. `this` é sempre o upgrade candidato.

### 3.4 Funções de restrição (`RESTR`)
Em todas, `params` ausente => `true`.

| func | params | semântica |
|---|---|---|
| `identifier` | `{required}` | `c.identifiers.includes(required)`; ou `hasAlternateIdentifier(required, this, params)`, que também marca `c.upgrade_uses_alt_id[this.uid] = true` (efeito colateral) |
| `class_type` | `{required}` | `c.classtype.search(required) > -1` |
| `creature_name` | `{required}` | `c.name === required` |
| `creature_armor` | `{min?, max?}` | `c.armor` (armadura base dos dados, sem upgrades) dentro de [min,max] |
| `creature_level` | `{min?, max?}` | `c.level` dentro de [min,max] (77 usos) |
| `creature_min_max` | `{attribute, min?, max?}` | `parseInt(c[attribute])`; se NaN passa; senão dentro do intervalo (min pode ser string "3"; comparação numérica coerciva) |
| `alignment` | `{required?}` | `c.alignment === required` (alinhamento atual, pode ter sido mudado por token Evil) |
| `unique` | `{required?}` | `c.unique === required` |
| `base` | `{required}` | `c.base === required`, ou `required === "Large"` e `c.base === "Huge"`. Sem `required` => false |
| `flyer` | `{required}` | `c.flyer === required` |
| `upgrade_bar` | `{required}` | `c.upgrades` contém `required` (barra atual, inclui slots adicionados) |
| `action_bar` | `{required}` | `c.actions` contém `required` |
| `upgrade_equipped` | `{required}` | existe upgrade equipado cujo classtype contém `required`; grava `c.upgrade_equip_depends_on[this.uid] = thatUpgrade.uid` (cria dependência no equip). Ex.: Armor Crystals |
| `no_weapon` | sem params | falso se o próprio upgrade é arma ou se já há arma equipada |
| `not` | `{func, params}` | `!(RESTR[func].call(this, c, params))`; func inexistente => false |
| `or` | `Rule[]` | true se alguma sub-regra passar; lista vazia => true; func desconhecida conta como falha |
| `restrict_creature` | `{restrict, ...}` | executa `RESTR[restrict].call(this, c, params)` (recebe o objeto params inteiro); se passar, guarda `this.post_equip_func = {func, params}`, que no `equipSuccess` vira `c.equip_restrict[this.uid]`. Ou seja, a regra passa a valer para todo upgrade futuro naquela criatura enquanto este estiver equipado |

Sub-funções usadas via `restrict_creature` (podem também ser chamadas diretamente):

| restrict | params | semântica (contam o próprio `this` + os equipados) |
|---|---|---|
| `two_hands` | | máximo 2 itens entre armas e escudos (implementação: rejeita se já há 2 contados ao achar outro) |
| `one_armor` | | no máximo 1 `isArmor` |
| `one_weapon` | | no máximo 1 entre arma/escudo |
| `one_weapon_shield` | | no máximo 1 arma (escudos não contam) |
| `shield` | | no máximo 1 entre escudo e arma de duas mãos |
| `forbid_name` | `{name}` | nenhum upgrade (incluindo `this`) com esse nome |
| `forbid_class` | `{class}` | no máximo 1 upgrade cujo classtype contém `class` |

Classificadores do upgrade: `isArmor`: classtype contém "Armor"; `isWeapon`: contém "Weapon" e não "Breath Weapon"; `isTwoHandedWeapon`: contém "Two-Handed Weapon"; `isShield`: contém "Shield".

### 3.5 Aninhamento
`not` recebe uma única regra `{func, params}`; `or` recebe um array de regras. Ambos chamam recursivamente o mesmo dicionário `RESTR` com o mesmo `this`, então qualquer profundidade funciona. Exemplos reais:
- `not(alignment Good)` (Scales of Tiamat).
- `or(identifier Dwarven Siege Weapon, identifier Dwarf)`.
- `not(or(identifier Siege Weapon, identifier Troop))` (Commander).
- `or(creature_armor{min:2}, upgrade_equipped{Armor})` (Armor Crystals).

### 3.6 Regras extras na legião (`legionService.canCreatureEquipUpgrade(c,u)`)
```ts
if (!u || !c) return false
if (u.unique && legion.containsUpgrade(u)) return false   // mesmo nome em qualquer criatura
if (u.artifact && legion.legionContainsArtifact()) {
  max = 1 + (extraArtifacts ?? 0); arts = legionArtifacts()
  if (!u.artifactSet && (!extraArtifacts || arts.length >= max)) return false
  if (c.hasArtifactEquipped()) return false               // 1 artefato por criatura
  for (a of arts)
    if ((!a.artifactSet || !u.isArtifactSet(a.artifactSet)) && (!extraArtifacts || arts.length >= max)) return false
}
return c.canEquipUpgrade(u)
```
Resumo: 1 artefato por legião, exceto artefatos do mesmo `artifactSet` ("of Tiamat" com "of Tiamat"), que podem se acumular (uma por criatura); Wealth of the Ancients concede `extraArtifacts`.

### 3.7 Fluxo de `Creature.equipUpgrade(u, legion)` (retorna `null` = sucesso, string = erro, `false` = ilegal)
1. `canEquipUpgrade` falso => `false`.
2. Copia profunda do upgrade (exceto `isTestCreature`).
3. Dependências iniciais: `upgrade_equip_depends_on[u.uid]` se existir.
4. `EquipCommand.executeAll(u.preEquipCommands(), c, u, legion)`; erro => retorna.
5. `EquipCommand.process(c.pre_equip_commands, c, u, legion)` (comandos instalados na criatura por outros upgrades); erro => retorna.
6. `equip_special` da criatura com filtros `upgrade_attribute`/`upgrade_class` chama `applyCreatureEquipSpecial`, mas o dicionário de handlers está vazio: código morto.
7. Escolhe slot: tipo, alternateSlot do upgrade, `add_alternate_slot` (adiciona dependência ao upgrade que criou o comando). O caso `add_own_slot` já criou o slot no passo 5.
8. Grava em `equipped[slot]`, cria vínculos `dependsOn`/`dependedOnBy`, chama `equipSuccess` (instala `equip_restrict`).

Mensagens no controller: sucesso `"Added <upgrade> to <criatura>"`; único repetido `"You already equipped <nome>"`.

### 3.8 Desequipar (`unequipUpgrade(u, legion)`)
1. Se `u.isDependedOn()` => `"<nome> can't be removed due to another card."`.
2. `unequip_funcs` (sempre vazio na prática) => `"<nome> can't be removed due to unequip functions."`.
3. `EquipCommand.undoAll(u.preEquipCommands(), ...)`; erro => retorna a mensagem do comando.
4. Limpa dependências, `delete equip_restrict[u.uid]`, `equipped[slot] = null`.
5. `post_unequip_funcs`, depois `EquipCommand.process(u.postUnequipCommands())` (ex.: `remove_own_slot`).
6. Upgrade não encontrado => `"Can't remove <nome>"`. Sucesso no service: `"<upgrade> removed from <criatura>"`.

`validateUpgrades()`: todo equipado ainda passa em `creatureCanEquip`. Usado ao mudar alinhamento.

---

## 4. Sistema de comandos (EquipCommand)

### 4.1 Objeto comando
```ts
class EquipCommand {
  name: string; uid?: number;           // uid do upgrade que gerou
  rule: Rule; params: any;              // params = rule.params
  error: string|null; info: { active: boolean; [k: string]: any };
  test?(creature, upgrade, legion, undoing: boolean): boolean;
  filter?(creature, upgrade, legion): boolean;   // false => execute é pulado mas conta como sucesso
  execute(creature, upgrade, legion): boolean;
  undo?(creature, upgrade, legion): boolean;
}
static test   = c => !c.test || (c.error = null, c.test(...))
static filter = c => !c.filter || c.filter(...)
static execute= c => !c.execute ? (error "Command X has no execute method.", false) : (!filter() || c.execute())
static undo   = c => !c.undo || c.undo(...)
static process(cmds, creature, upgrade, legion, undoing=false): string|null
  // transacional: para cada cmd, test, depois execute (ou undo); em falha desfaz os já aplicados na ordem e retorna error ("Unknown Error" se vazio)
  // marca info.active = !undoing; remove do array os que tiverem .remove
executeAll = process(..., false); undoAll = process(..., true)
```

`Upgrade.preEquipCommands()` cria um comando por item de `equip_special` (`new EquipCommand(rule.func, rule)`), cacheado. `Creature.preEquipCommands()` idem com `info.type = "creature"`.

### 4.2 Comandos (`equip_special.func`)

| comando | params | execute | undo | test |
|---|---|---|---|---|
| `add_upgrade` | `{type, num=1}` | adiciona `num` slots de `type` | remove `num` últimos slots livres | ao desfazer, exige `num` slots livres daquele tipo, senão `"Not enough empty <type> slots to unequip."` |
| `add_alternate_element` | `{element}` | `c.alternateElements.push(element)` | remove | |
| `add_cost_special` | `{func, params}` | `c.cost_special.push(params)` (o objeto `{func, params}` interno) | remove por igualdade profunda | |
| `add_creature_pre_equip_command` | `{func, params, dependency}` | cria comando `func` com `uid` do upgrade, adiciona a `c.pre_equip_commands`, e roda nos upgrades já equipados (`doEquipCommandOnExistingUpgrades`, pulando `dependency`) | desfaz o comando e remove-o da criatura por uid | ao desfazer, roda o `test(undo=true)` do comando filho |
| `add_legion_token` | `{token}` | `legion.tokens[token] += 1` | `-= 1` | ao desfazer, exige token livre: `"Must have a free <token> token to unequip."` |
| `add_alt_identifiers` | `{identities[], func?, dependency}` | resolve `func` no dicionário de filtros, `c.altIdentifiers = params`, instala `check_alt_identifiers` na criatura | `altIdentifiers = null`, remove comando | |

Comandos instalados na criatura (via `add_creature_pre_equip_command` ou internos):

| comando | params | semântica |
|---|---|---|
| `add_alternate_slot` | `{func, slot, ...}` | `filter`: filtro `func` aplicado ao upgrade candidato; usado por `hasAlternateSlotForUpgrade` para permitir slot `slot`. Ex.: Poison Tail permite "Deadly Venom" em slot Dragon |
| `add_own_slot` | `{func, params}` | `filter` idem; `execute` cria um slot do tipo do próprio upgrade candidato e anexa a ele um `remove_own_slot` pós-desequipar. `test(undo)` roda os `remove_own_slot` pendentes. Ex.: Queen of the Evil Dragons (Breath Weapon), King of the Good Dragons (Dragon Special/Combat) |
| `remove_own_slot` | `info.upgrade_type` | pós-desequipar: remove um slot livre daquele tipo (`"Need an open <type> slot to remove."`) |
| `add_wealth_of_ancients` | | primeira execução (inativo): `wealthOfAncients = null`, `legion.extraArtifacts += 1`; depois, ao equipar o primeiro artefato Dragon, `wealthOfAncients = uid` dele. `test`: não desfaz com mais de 1 artefato (`"Can't unequip with more than one artifact in Legion"`) |
| `check_alt_identifiers` | | se o upgrade equipado usou identificador alternativo (`upgrade_uses_alt_id[uid]`), cria dependência para o upgrade que concedeu os identificadores (impede removê-lo). Bug no undo: lê `e.upgrade.uses_alt_id` (lançaria erro) |

Filtros de upgrade (dicionário do EquipCommand):
- `upgrade_attribute {attribute, required}`: `u[attribute] === required`.
- `upgrade_class {required}`: `u.classtype` contém `required`.
- `dragon_special_or_combat`: `u.upgrade === "Dragon"` e classtype contém "Special" ou "Combat".

`hasAlternateIdentifier(id, upgrade, params)`: true se `altIdentifiers.identities` contém `id` e (`func` ausente ou `func(upgrade, params)`).

### 4.3 Tabela de upgrades com equip_special (dados)
- `add_upgrade`: Amog (+Divine), Silver Staff, Hazirawn, Evil Sorcerer (+Arcane), Pearl of Power (+2 Arcane), Combat Reflexes, Ancient Lore (+Heroic), Aurelia (+Divine), Saddle of the Cavalier x3 (+Monster/Equipment/Dragon), Helm of Leadership (+Heroic), Veterans (+2 Heroic / +2 Monster).
- `add_cost_special`: Helm of Leadership (`slot_master Heroic -1`), Veterans (`slot_master` exclui a si mesmo, -1), Wealth of the Ancients (`wealth_of_ancients_discount Dragon -2`).
- `add_alternate_element`: Tuning Fork of Neutrality (Positive, Negative).
- `add_legion_token`: Corruption (Evil).
- `add_creature_pre_equip_command`: Queen of the Evil Dragons, Poison Tail, King of the Good Dragons, Wealth of the Ancients.
- `add_alt_identifiers`: King of the Good Dragons (Gold/Silver/Bronze/Brass/Copper Dragon, filtro `dragon_special_or_combat`).

### 4.4 Token Evil e alinhamento
`legionService.tokens = {Evil:0, WealthOfTheAncients:0}`. No componente creature, se `tokens.Evil > 0` e a criatura não é Evil, mostra "Make this creature [evil]": guarda `originalAlignment`, troca para Evil, `validateUpgrades()`; se falhar reverte com `"An upgrade is preventing alignment change"`; senão `tokens.Evil -= 1`. "Restore alignment" faz o inverso e devolve o token. Uma criatura com alinhamento modificado não pode ser removida (`"Can't remove creature with modified alignment."`).

---

## 5. Regras da legião

- `addCreature(c)`: se `c.unique` e já existe criatura única com o mesmo `name`, ou com o mesmo `uniquename` (troops), erro `"<nome> is already in your legion."`; senão adiciona cópia profunda, `"<nome> added to your legion."`.
- Criaturas não únicas podem repetir.
- `removeCreature`: bloqueia alinhamento modificado; desequipa tudo (`unequipAllUpgrades`, a primeira mensagem de erro aborta); `"<nome> removed from your legion."`.
- Upgrade único: um por legião (por nome). Mesmo upgrade não único não pode repetir na mesma criatura (por nome).
- Artefatos: ver 3.6.
- **Limite de pontos: não existe no código.** O app só mostra "Legion Cost" e "Total Cards"; não há validação de 200 pontos nem aviso. (O input de custo máximo do filtro tem `max="200"`, só no HTML.)
- Flash: cada `Flash.create` limpa as mensagens anteriores (só uma visível). Tipos: success, danger, info, error.

---

## 6. Salvar e carregar

### 6.1 localStorage
Só as configurações (`settingsService.mySettings`), via ngStorage `$localStorage.$default`. Cada propriedade de primeiro nível vira uma chave com JSON:
- `ngStorage-equippable` => `false`
- `ngStorage-sortOptions` => `{"creatures":{"primary":{"name":"Release Order","value":"+uid"}},"upgrades":{"primary":{...}}}`
- `ngStorage-sets` => `{"<nome do set>": true|false, ...}` (cada set conhecido é inicializado como true ao abrir a lista)

A legião em si **não** é salva no localStorage; some ao recarregar, exceto pelo link.

### 6.2 Formato do link
```
creatureSaveString = uid ":" (slot0uid|"0") ":" (slot1uid|"0") ... ["|a:" originalAlignment ":" alignment]
code = btoa(creatureSaveStrings.join(","))       // Array.toString junta com vírgula
URL  = <origem>/link/<code>                      // estado "legionview.link", url "^/link/:code", absoluto
```
O número de slots inclui os adicionados por upgrades. Exemplo: Balagos com Acid Breath no primeiro slot: `"101:107:0:0:0"` => `/link/MTAxOjEwNzowOjA6MA==` (o código base64 pode conter `/`, `+` e `=`, não é escapado; detalhe frágil a corrigir com encodeURIComponent ou base64url, mantendo leitura do formato antigo).

Carregamento (`loadLegionFromCode`): `atob(code).split(",")`; para cada parte, separa por `|`, a primeira por `:`; busca criatura pelo uid (cópia), aplica `a:orig:atual` (e coleta o alinhamento para descontar token), e chama `equipUpgrade(copy(getUpgrade(uid)))` para cada uid diferente de "0", na ordem. O slot exato não é preservado: o upgrade vai para o primeiro slot livre compatível. Depois `tokens[alinhamento] -= 1` para cada alinhamento alterado (pode ficar negativo, já que o token vem de Corruption, que já recriou +1). Em seguida redireciona para `/creatures` com reload. Não há tratamento de erro (código inválido quebraria).

### 6.3 API
`resourceFactory(name)` monta `"/api/" + name`. Métodos: `query` (GET com params), `get(id)` (GET `/api/<name>/<id>`), `save` (POST form-urlencoded), `find`. Na versão analisada, `find` **não chama a rede**: `/api/creatures` e `/api/upgrades` carregam os chunks webpack locais (módulos 125 e 126); qualquer outro recurso rejeita `"Not found"`. O construtor padrão converte `_id.$oid` (formato MongoDB) em string, mas nos dados atuais `_id` já é string.

Nenhum recurso de link usa API: o link é inteiramente client-side. Portanto, com o backend morto (retornando o HTML da SPA), nada do app depende dele para funcionar. Dependências externas mortas ou não verificadas: o formulário de impressão (POST para `dndaw.com/catsync/form/tournament.php`), os ícones em `dndaw.com/static/icon/` e as imagens de fundo do tema WordPress. `query`/`get`/`save` existem mas não são chamados por ninguém. Endpoints `/api/...` de link: não existem.

---

## 7. Lista, filtros e ordenação

Pipeline (ambas as listas): `cards | filter:cardfilter | element | cost | set | orderBy:<sort>`, `track by card._id`.

- **Busca de texto**: `cardfilter.$` (filtro padrão do Angular: substring case-insensitive em qualquer campo, recursivo em objetos). Placeholder "Search Card Text".
- **Set**: `cardfilter.set` (filtro padrão, substring!). O select lista só os sets marcados nas configurações (filtro `setlist`). Opção "All" remove a chave.
- **Slot (só upgrades)**: `cardfilter.upgrade` (substring, ENUM_UPGRADES). Clicar num slot da criatura também define este filtro e navega para upgrades. Ao sair de upgrades o filtro é apagado.
- **Elemento**: `element` filter: mantém cartas com `isElement(el)` (criaturas: element, element2, elements, alternateElements) ou `card.element === el` (upgrades).
- **Custo máximo**: `cost` filter: se `max` definido, mantém cartas com `cost !== "*"` e `cost <= max` (comparação coerciva string/number). Custo base da carta, não o custo calculado.
- **Sets possuídos**: `set` filter: mantém só cartas cujo `set` está true em `mySettings.sets`. Carta sem set some.
- **Equippable**: upgrades com `cardList.showOnlyEquippable` só aparecem (via `ng-show`) se `canCreatureEquipUpgrade` for verdadeiro para alguma criatura da legião. Default vem de `mySettings.equippable`.
- **Ordenação**: `sortOptions.creatures.primary.value` / `upgrades.primary.value`: `"+uid"` (Release Order) ou `"+name"` (Alphabetical).
- Botões por upgrade: um botão numerado por criatura que pode equipá-lo. Swipe para direita: criatura adiciona à legião; upgrade equipa na primeira criatura legal. Hover mostra preview. Ícone de link abre `/card/<tipo>/<uid>` em nova aba.

Modal de configurações: sort de criaturas, sort de upgrades, checkbox "Default to Equippable Only", lista de sets com "Select All"/"Clear All".

---

## 8. Renderização

### 8.1 `dndawicon`
```ts
url = ICON_BASE + (color ? "color-" : "") + type.toLowerCase() + ".png"   // vazio se type vazio
<img class="icon-slottype" alt={type} title={type}>
```
Usos com `color="true"`: alinhamento, elemento(s), `pwv`, `agility`, `health`, `armor`, `evil`. Sem cor: tipo de slot, ações, tokens de texto.

### 8.2 `cardtext`
```ts
html = '<div class="cardtext">' + text + '</div>'
  .replace(/\n/g, "<br>")
  .replace(/\[(\w*)\]/g, '<dndawicon type="$1">')    // ícone sem cor
  .replace(/\*([^*]+)\*/g, "<b>$1</b>")
```
Tokens de colchete encontrados nos textos (contagem): DT 206, Hit 38, Concentrate 26, Critical 26, Feint 17, Straight 13, Fire 12, Dodge 11, Heroic 9, Negative 8, Poison 8, Target 8, Cold 7, PDT 7, Acid 6, Arcane 5, Thunder 5, Dragon 5, Lightning 4, Divine 4, Positive 4, Monster 4, Charge 3, Equipment 3, Crit 2, Bank 1, equipment 1, Disease 1. O HTML do texto é compilado sem sanitização; na reconstrução, tokenizar em vez de injetar HTML.

### 8.3 Linha de criatura na legião
`#n`, nome, botão remover; classtype; linha de ícones: level, cost (classe `uniquecostbg` se único), alinhamento colorido, element e elements coloridos; stats: pwv=attack, agility, health, armor=`baseArmorWithUpgrades()`; ataques `"<type>: <description> (<arc> <range>)"`; ícones de ações; links de token Evil/restaurar; coluna direita: "Cost: total", uma linha por slot (ícone do tipo, nome do slot em itálico se vazio, nome do upgrade, botão remover, custo calculado), texto especial via cardtext.

`baseArmorWithUpgrades`: começa em `armor`; cada `armorMod.base` substitui a base (o último vence), cada `armorMod.add` soma.

### 8.4 Preview de upgrade (template visto)
set (esquerda), wave (direita), nome, classtype, ícone do slot, `level+` (se houver), custo (estilo único), elemento colorido, cardtext. Os detalhes (area, arc, range, dts, disables, discards, exhausts, action, attack, penetrates, hitlevel, target, concentrate) existem no template mas estão **comentados**. O template de preview de criatura (módulo 28) não está nos arquivos: não determinado (presumivelmente análogo à linha de criatura).

### 8.5 Cartão de movimento (`movementcard`, só na página de carta)
```ts
grid = movedata[type.toLowerCase()]           // "flight" | "ground"
visível se grid?.[1] existe
table = grid[0] ? [5,4,3,2,1,0,-1] : [6,5,4,3,2,1,-1]   // linhas de velocidade
para cada linha (speed = table[i]) e coluna col 0..5:
  número = grid[speed] ? abs(speed) : ""
  cor (classe CSS) = grid[speed]?.[col] ?? ""          // "g" | "w" | "r"
  símbolo = número === 0 && col === 2 ? "o"
          : número === 1 && speed === -1 && col === 2 ? "v"
          : ["<","\\","^","/",">","n"][col]
```
Colunas: curva esquerda, inclinação esquerda, reta, inclinação direita, curva direita, coluna 6 "n" (manobra especial; nos dados aparece em 198 linhas, inclusive em ground). A célula é renderizada com o símbolo mesmo sem cor (fica sem classe); só a classe indica a existência. As cores reais das classes `g`/`w`/`r` estão no CSS, que foi cortado na parte lida: não determinado (convencionalmente verde, branco, vermelho). `reds`, `reverse` e `wingover` não são exibidos no cartão; `reds` só é usado em `red_maneuvers`. Speeds possíveis nos dados: -1, 0..6.

### 8.6 Impressão
Modal com nome, email, data, evento e lista: criatura `n: nome custo`, upgrades `tipo nome custo`, artefatos e total. Envia POST (`target=_blank`) para `tournament.php` com campos ocultos:
- `creature[i] = "nome:custoBase:custoTotal"`
- `upgrade[i][j] = "<abrev>:nome:custo"` (abrev de PRINT_SLOT_ABBR)
- `artifacts[k] = "nome:custo"`, `artifactTotal`, `legionTotal`, mais `name`, `email`, `date`, `event`.
O servidor gerava a folha; está morto. Na reconstrução, gerar a folha no cliente (print CSS ou PDF). Layout da folha original: não determinado.

---

## 9. Rotas (ui-router, html5Mode)

| estado | URL | conteúdo |
|---|---|---|
| `legionview` (abstrato) | `""` | resolve criaturas e upgrades, layout principal |
| `legionview.creatures` | `/creatures` | lista de criaturas + preview de criatura (rota padrão, `otherwise`) |
| `legionview.upgrades` | `/upgrades` | lista de upgrades + preview de upgrade |
| `legionview.link` | `/link/:code` (absoluta) | `LegionViewController` carrega o código e vai para `/creatures` |
| `cardview` (abstrato) | `/card` | página de carta única com link "Go To Legion Builder" e cartões de movimento |
| `cardview.creature` | `/card/creature/:id` | preview por uid |
| `cardview.upgrade` | `/card/upgrade/:id` | preview por uid |

Título da página: nome da carta + `TITLE_SUFFIX` nas rotas de carta.

---

## 10. Bugs e lacunas a decidir na reconstrução
- `check_alt_identifiers.undo` usa `e.upgrade.uses_alt_id` (erro de digitação).
- `add_alt_identifiers.undo` remove pelo `params.dependency` (ok) mas não desfaz dependências criadas.
- `legion_cost_mod` calculado como efeito colateral da renderização.
- Efeitos colaterais em restrições (`identifier`, `upgrade_equipped`) mesmo quando só se testa legalidade.
- Filtros de set e slot usam substring.
- Link não preserva a posição do slot nem é URL-safe.
- Sem limite de pontos.
- Cores CSS de movimento, template de preview de criatura e CSS das classes `*bg`: não determinado.

---

## Apêndice A. Ícones referenciados

Base: `https://dndaw.com/static/icon/`. Nome = `type.toLowerCase()`; com cor recebe o prefixo `color-`. Também em `docs/icons.json`.

Sem cor (slots, ações, tokens de texto, elementos usados em `[Fire]` etc.):
`acid.png, arcane.png, bank.png, charge.png, cold.png, concentrate.png, crit.png, critical.png, disease.png, divine.png, dodge.png, dragon.png, dt.png, equipment.png, feint.png, fire.png, heroic.png, hit.png, lightning.png, monster.png, negative.png, pdt.png, poison.png, positive.png, straight.png, target.png, thunder.png, universal.png`

Com cor:
`color-acid.png, color-agility.png, color-armor.png, color-cold.png, color-disease.png, color-evil.png, color-fire.png, color-good.png, color-health.png, color-lightning.png, color-negative.png, color-neutral.png, color-poison.png, color-positive.png, color-pwv.png, color-thunder.png`

Notas: `universal.png` vem do ícone de slot dos upgrades Universal; `color-disease.png` e `disease.png` só aparecem via enum/texto; não foi verificado se os arquivos existem no servidor. Imagens de tema (fora do ícone): `https://dndaw.com/wp-content/themes/swoopingdragon/images/bg.png`, `dark-bg.png`, `content-bg.png`; fonte Google "Merienda".
