import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import creaturesJson from './data/creatures.json';
import upgradesJson from './data/upgrades.json';
import { buildCatalog, Creature, encodeLegion, Legion, loadLegionFromCode, type Catalog } from './engine/engine';
import type { CreatureData, UpgradeData } from './engine/types';

export const catalog: Catalog = buildCatalog(
  creaturesJson as unknown as CreatureData[],
  upgradesJson as unknown as UpgradeData[],
);

export const ALL_SETS = [...new Set([...catalog.creatures, ...catalog.upgrades].map((c) => c.set))];

/* ---------- persistência local ---------- */

const KEY_CURRENT = 'aw:current';
const KEY_SAVED = 'aw:saved';
const KEY_SETTINGS = 'aw:settings';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível: a legião segue só na memória */
  }
}

export type SortKey = 'uid' | 'name' | 'cost';
export interface Settings {
  creatureSort: SortKey;
  upgradeSort: SortKey;
  equippableOnly: boolean;
  sets: Record<string, boolean>;
  target: number | null;
  lang?: 'en' | 'pt';
}

const defaultSettings: Settings = {
  creatureSort: 'uid',
  upgradeSort: 'uid',
  equippableOnly: false,
  sets: Object.fromEntries(ALL_SETS.map((s) => [s, true])),
  target: 200,
  lang: 'en',
};

export interface SavedLegion {
  id: string;
  name: string;
  code: string;
  cost: number;
  cards: number;
  creatures: string[];
  updated: string;
}

/* ---------- mensagens ---------- */

export interface Flash {
  id: number;
  kind: 'ok' | 'error' | 'info';
  text: string;
}

/* ---------- contexto ---------- */

interface Store {
  legion: Legion;
  version: number;
  name: string;
  savedId: string | null;
  setName(n: string): void;
  mutate(fn: (l: Legion) => string | null | void, success?: string): boolean;
  replace(l: Legion, name?: string, savedId?: string | null): void;
  reset(): void;
  code: string;
  saved: SavedLegion[];
  saveCurrent(): void;
  deleteSaved(id: string): void;
  importSaved(list: SavedLegion[]): number;
  loadSaved(s: SavedLegion): void;
  settings: Settings;
  setSettings(patch: Partial<Settings>): void;
  flash: Flash | null;
  notify(kind: Flash['kind'], text: string): void;
}

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider ausente');
  return s;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => read<{ code: string; name: string; savedId: string | null }>(KEY_CURRENT, { code: '', name: 'Nova legião', savedId: null }), []);
  const legionRef = useRef<Legion>(initial.code ? loadLegionFromCode(initial.code, catalog).legion : new Legion());
  const [version, setVersion] = useState(0);
  const [name, setNameState] = useState(initial.name || 'Nova legião');
  const [savedId, setSavedId] = useState<string | null>(initial.savedId ?? null);
  const [saved, setSaved] = useState<SavedLegion[]>(() => read(KEY_SAVED, []));
  const [settings, setSettingsState] = useState<Settings>(() => {
    const s = read<Partial<Settings>>(KEY_SETTINGS, {});
    return { ...defaultSettings, ...s, sets: { ...defaultSettings.sets, ...(s.sets ?? {}) } };
  });
  const [flash, setFlash] = useState<Flash | null>(null);
  const flashTimer = useRef<number>(0);

  const legion = legionRef.current;
  const code = useMemo(() => encodeLegion(legion), [legion, version]);

  useEffect(() => {
    write(KEY_CURRENT, { code, name, savedId });
  }, [code, name, savedId]);

  const notify = useCallback((kind: Flash['kind'], text: string) => {
    window.clearTimeout(flashTimer.current);
    setFlash({ id: Date.now(), kind, text });
    flashTimer.current = window.setTimeout(() => setFlash(null), kind === 'error' ? 5200 : 3200);
  }, []);

  const mutate = useCallback(
    (fn: (l: Legion) => string | null | void, success?: string) => {
      const err = fn(legionRef.current);
      setVersion((v) => v + 1);
      if (err) {
        notify('error', err);
        return false;
      }
      if (success) notify('ok', success);
      return true;
    },
    [notify],
  );

  const replace = useCallback((l: Legion, n?: string, id: string | null = null) => {
    legionRef.current = l;
    if (n) setNameState(n);
    setSavedId(id);
    setVersion((v) => v + 1);
  }, []);

  const reset = useCallback(() => {
    legionRef.current = new Legion();
    setNameState('Nova legião');
    setSavedId(null);
    setVersion((v) => v + 1);
  }, []);

  const saveCurrent = useCallback(() => {
    const l = legionRef.current;
    const entry: SavedLegion = {
      id: savedId ?? `l${Date.now().toString(36)}`,
      name: name.trim() || 'Legião sem nome',
      code: encodeLegion(l),
      cost: l.totalCost(),
      cards: l.totalCards(),
      creatures: l.creatures.map((c) => c.name),
      updated: new Date().toISOString(),
    };
    setSaved((list) => {
      const next = [entry, ...list.filter((s) => s.id !== entry.id)];
      write(KEY_SAVED, next);
      return next;
    });
    setSavedId(entry.id);
    notify('ok', `${entry.name} salva neste navegador.`);
  }, [name, savedId, notify]);

  const deleteSaved = useCallback((id: string) => {
    setSaved((list) => {
      const next = list.filter((s) => s.id !== id);
      write(KEY_SAVED, next);
      return next;
    });
    if (savedId === id) setSavedId(null);
  }, [savedId]);

  const importSaved = useCallback((list: SavedLegion[]) => {
    let n = 0;
    setSaved((cur) => {
      const codes = new Set(cur.map((x) => x.code));
      const add = list.filter((x) => !codes.has(x.code));
      n = add.length;
      const next = [...add, ...cur];
      write(KEY_SAVED, next);
      return next;
    });
    return n;
  }, []);

  const loadSaved = useCallback(
    (s: SavedLegion) => {
      const { legion: l, problems } = loadLegionFromCode(s.code, catalog);
      replace(l, s.name, s.id);
      if (problems.length) notify('error', problems.join(' '));
      else notify('info', `${s.name} aberta.`);
    },
    [replace, notify],
  );

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((s) => {
      const next = { ...s, ...patch };
      write(KEY_SETTINGS, next);
      return next;
    });
  }, []);

  const value: Store = {
    legion,
    version,
    name,
    savedId,
    setName: setNameState,
    mutate,
    replace,
    reset,
    code,
    saved,
    saveCurrent,
    deleteSaved,
    importSaved,
    loadSaved,
    settings,
    setSettings,
    flash,
    notify,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function creatureIndex(legion: Legion, c: Creature) {
  return legion.creatures.indexOf(c) + 1;
}
