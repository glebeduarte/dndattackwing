// Fotos de cartas lidas pelo leitor, guardadas no navegador (IndexedDB).
// Chave: "creature:101" ou "upgrade:107". Valor: imagem webp recortada em 5:7.

import { useEffect, useState } from 'react';

export type CardKind = 'creature' | 'upgrade';
export const imageKey = (kind: CardKind, uid: number) => `${kind}:${uid}`;

const DB = 'aw-card-images';
const STORE = 'images';
const EVT = 'aw-card-images';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const r = fn(db.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function getImage(key: string): Promise<Blob | undefined> {
  try {
    return await tx<Blob | undefined>('readonly', (s) => s.get(key));
  } catch {
    return undefined;
  }
}

export async function putImage(key: string, blob: Blob) {
  await tx('readwrite', (s) => s.put(blob, key));
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

export async function deleteImage(key: string) {
  await tx('readwrite', (s) => s.delete(key));
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

export async function listKeys(): Promise<string[]> {
  try {
    return (await tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys())).map(String);
  } catch {
    return [];
  }
}

/** URL da foto da carta, ou null. Atualiza quando a foto muda. */
export function useCardImage(kind: CardKind, uid: number) {
  const key = imageKey(kind, uid);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    let current: string | null = null;
    const load = async () => {
      const b = await getImage(key);
      if (!alive) return;
      if (current) URL.revokeObjectURL(current);
      current = b ? URL.createObjectURL(b) : null;
      setUrl(current);
    };
    load();
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d === key) load();
    };
    window.addEventListener(EVT, on);
    return () => {
      alive = false;
      window.removeEventListener(EVT, on);
      if (current) URL.revokeObjectURL(current);
    };
  }, [key]);
  return url;
}

export function useImageKeys() {
  const [keys, setKeys] = useState<string[]>([]);
  useEffect(() => {
    const load = () => listKeys().then(setKeys);
    load();
    window.addEventListener(EVT, load);
    return () => window.removeEventListener(EVT, load);
  }, []);
  return keys;
}

/* Pacote para dividir com o grupo: um JSON com as imagens em base64. */

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(b);
  });

export async function exportPack(): Promise<Blob> {
  const keys = await listKeys();
  const images: Record<string, string> = {};
  for (const k of keys) {
    const b = await getImage(k);
    if (b) images[k] = await blobToDataUrl(b);
  }
  return new Blob([JSON.stringify({ format: 'aw-card-images', version: 1, images })], { type: 'application/json' });
}

export async function importPack(file: File): Promise<number> {
  const data = JSON.parse(await file.text());
  if (data?.format !== 'aw-card-images' || typeof data.images !== 'object') throw new Error('Arquivo não é um pacote de cartas do Attack Wing.');
  let n = 0;
  for (const [k, v] of Object.entries<string>(data.images)) {
    if (!/^(creature|upgrade):\d+$/.test(k) || typeof v !== 'string' || !v.startsWith('data:image/')) continue;
    const blob = await (await fetch(v)).blob();
    await tx('readwrite', (s) => s.put(blob, k));
    n++;
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: null }));
  return n;
}
