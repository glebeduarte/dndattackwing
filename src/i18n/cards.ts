// Textos das cartas em português. O arquivo é carregado só quando alguém pede a tradução.

import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { translateClasstype } from './classtypes';

export interface Translations {
  c: Record<string, string>; // uid da criatura -> habilidade especial
  u: Record<string, string>; // uid da melhoria -> texto
}

let cache: Translations | null = null;
let pending: Promise<Translations> | null = null;

export function loadTranslations() {
  if (cache) return Promise.resolve(cache);
  if (!pending) pending = import('../data/translations.pt.json').then((m) => (cache = (m.default ?? m) as Translations));
  return pending;
}

export function getLoadedTranslations() {
  return cache;
}

/** Idioma escolhido e as traduções, já carregadas quando o idioma é português. */
export function useCardLang() {
  const { settings, setSettings } = useStore();
  const lang = settings.lang ?? 'en';
  const [tr, setTr] = useState<Translations | null>(cache);
  useEffect(() => {
    if (lang === 'pt' && !tr) loadTranslations().then(setTr);
  }, [lang, tr]);
  const pt = lang === 'pt' && !!tr;
  return {
    lang,
    setLang: (l: 'en' | 'pt') => setSettings({ lang: l }),
    creatureText: (uid: number, original: string | null | undefined) => (pt ? tr!.c[uid] ?? original : original),
    upgradeText: (uid: number, original: string | null | undefined) => (pt ? tr!.u[uid] ?? original : original),
    classtype: (s: string) => (lang === 'pt' ? translateClasstype(s) : s),
  };
}
