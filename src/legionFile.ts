// Arquivo de texto com legiões: legível por gente e lido de volta pelo construtor.
import { encodeLegion, loadLegionFromCode, type Legion } from './engine/engine';
import { catalog, type SavedLegion } from './store';

export function legionText(name: string, l: Legion) {
  const lines = [`Legião: ${name}`, `Total: ${l.totalCost()} pontos · ${l.totalCards()} cartas`];
  l.creatures.forEach((c, i) => {
    lines.push(`${i + 1}. ${c.name} (${c.cost})`);
    for (const u of c.equippedUpgrades()) lines.push(`   - ${u.name} (${u.costForCreature(c, l)})`);
  });
  lines.push(`Código: ${encodeLegion(l)}`);
  return lines.join('\n');
}

export function savedToText(list: SavedLegion[]) {
  const head = `D&D Attack Wing · legiões exportadas em ${new Date().toLocaleString('pt-BR')}\nPara recuperar, use Importar arquivo em Legiões salvas ou no construtor.\n`;
  return head + '\n' + list.map((s) => legionText(s.name, loadLegionFromCode(s.code, catalog).legion)).join('\n\n') + '\n';
}

export function download(name: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Lê o arquivo: cada bloco tem "Legião:" e "Código:". Também aceita links /link/<código>. */
export function parseLegionText(text: string): SavedLegion[] {
  const out: SavedLegion[] = [];
  let name = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const n = /^Legi[aã]o:\s*(.+)$/i.exec(line);
    if (n) name = n[1];
    const c = /^C[oó]digo:\s*(\S+)/i.exec(line) ?? /\/link\/([A-Za-z0-9_-]+)/.exec(line);
    if (c) {
      const { legion } = loadLegionFromCode(c[1], catalog);
      if (!legion.creatures.length) continue;
      out.push({ id: `l${Date.now().toString(36)}${out.length}`, name: name || 'Legião importada', code: c[1], cost: legion.totalCost(), cards: legion.totalCards(), creatures: legion.creatures.map((x) => x.name), updated: new Date().toISOString() });
      name = '';
    }
  }
  return out;
}

export function pickFile(): Promise<string | null> {
  return new Promise((res) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = '.txt,text/plain';
    i.onchange = () => { const f = i.files?.[0]; if (!f) return res(null); f.text().then(res); };
    i.click();
  });
}
