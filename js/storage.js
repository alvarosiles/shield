// Shield — capa de persistencia (LocalStorage, sembrada desde data/*.json)
import { basePath } from "./utils.js";

const KEYS = {
  credentials: "shield_credentials",
  cards: "shield_cards",
  payments: "shield_payments",
  documents: "shield_documents",
  notes: "shield_notes",
  apikeys: "shield_apikeys",
  prefs: "shield_prefs",
};

const cache = {};

/** Carga una colección: usa LocalStorage si existe, si no la siembra desde data/<name>.json */
export async function loadCollection(name) {
  if (cache[name]) return cache[name];

  const key = KEYS[name];
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      cache[name] = JSON.parse(raw);
      return cache[name];
    } catch (err) {
      console.warn(`Shield: datos corruptos en ${key}, se reiniciará desde JSON.`, err);
    }
  }

  try {
    const res = await fetch(`${basePath()}data/${name}.json`);
    const json = await res.json();
    const list = json[name] ?? [];
    cache[name] = list;
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  } catch (err) {
    console.error(`Shield: no se pudo cargar data/${name}.json`, err);
    cache[name] = [];
    return [];
  }
}

export function saveCollection(name, list) {
  cache[name] = list;
  localStorage.setItem(KEYS[name], JSON.stringify(list));
}

export async function addRecord(name, record) {
  const list = await loadCollection(name);
  list.push(record);
  saveCollection(name, list);
  return list;
}

export async function updateRecord(name, id, patch) {
  const list = await loadCollection(name);
  const idx = list.findIndex((item) => String(item.id) === String(id));
  if (idx === -1) return list;
  list[idx] = { ...list[idx], ...patch };
  saveCollection(name, list);
  return list;
}

export async function deleteRecord(name, id) {
  const list = await loadCollection(name);
  const next = list.filter((item) => String(item.id) !== String(id));
  saveCollection(name, next);
  return next;
}

export function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.prefs)) ?? {};
  } catch {
    return {};
  }
}

export function setPrefs(patch) {
  const prefs = { ...getPrefs(), ...patch };
  localStorage.setItem(KEYS.prefs, JSON.stringify(prefs));
  return prefs;
}

/** Borra todos los datos locales y vuelve a sembrar desde los JSON originales. */
export function resetAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  Object.keys(cache).forEach((key) => delete cache[key]);
}

export const COLLECTIONS = Object.keys(KEYS).filter((k) => k !== "prefs");
