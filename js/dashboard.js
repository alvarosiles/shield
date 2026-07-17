// Shield — lógica del Dashboard
import { loadCollection } from "./storage.js";
import { escapeHtml, formatDate } from "./utils.js";

const STAT_CONFIG = [
  { key: "credentials", icon: "🔑", label: "Credenciales" },
  { key: "cards", icon: "💳", label: "Tarjetas" },
  { key: "accounts", icon: "💰", label: "Cuentas / pagos" },
  { key: "documents", icon: "📄", label: "Documentos" },
];

function recordLabel(collection, item) {
  switch (collection) {
    case "credentials": return item.service;
    case "cards": return `${item.bank} •••• ${item.last4}`;
    case "payments": return item.name;
    case "services": return item.name;
    case "documents": return item.name;
    case "apikeys": return item.name;
    case "notes": return item.title;
    default: return item.name ?? item.id;
  }
}

function recordDate(collection, item) {
  return item.createdAt ?? item.date ?? null;
}

function recordIcon(collection) {
  return { credentials: "🔑", cards: "💳", payments: "💰", services: "🌐", documents: "📄", apikeys: "🔐", notes: "📝" }[collection] ?? "📁";
}

function recordCategory(collection, item) {
  if (collection === "apikeys") return item.environment === "production" ? "Producción" : "Desarrollo";
  return item.category ?? item.type ?? collection;
}

async function renderStats() {
  const [credentials, cards, payments, services, documents] = await Promise.all([
    loadCollection("credentials"),
    loadCollection("cards"),
    loadCollection("payments"),
    loadCollection("services"),
    loadCollection("documents"),
  ]);

  const values = {
    credentials: credentials.length,
    cards: cards.length,
    accounts: payments.length + services.length,
    documents: documents.length,
  };

  const grid = document.getElementById("stats-grid");
  grid.innerHTML = STAT_CONFIG.map(
    (stat) => `
    <div class="stat-card">
      <div class="stat-card__top">
        <div class="stat-card__icon">${stat.icon}</div>
      </div>
      <div class="stat-card__value">${values[stat.key]}</div>
      <div class="stat-card__label">${stat.label}</div>
    </div>`
  ).join("");
}

async function renderRecent() {
  const collections = ["credentials", "cards", "payments", "services", "documents", "apikeys", "notes"];
  const lists = await Promise.all(collections.map((name) => loadCollection(name)));

  const all = [];
  collections.forEach((name, i) => {
    lists[i].forEach((item) => {
      all.push({ collection: name, item });
    });
  });

  all.sort((a, b) => {
    const da = recordDate(a.collection, a.item) ?? "";
    const db = recordDate(b.collection, b.item) ?? "";
    return db.localeCompare(da);
  });

  const recent = all.slice(0, 6);
  const container = document.getElementById("recent-list");

  if (recent.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📭</div><h3>Sin registros aún</h3></div>`;
    return;
  }

  container.innerHTML = `<ul>${recent
    .map(
      ({ collection, item }) => `
    <li class="record-card__row" style="padding: 0.6rem 0; border-bottom: 1px solid var(--border);">
      <span>${recordIcon(collection)} ${escapeHtml(recordLabel(collection, item))}</span>
      <span>${formatDate(recordDate(collection, item))}</span>
    </li>`
    )
    .join("")}</ul>`;
}

async function renderCategories() {
  const collections = ["credentials", "cards", "payments", "services", "documents", "apikeys", "notes"];
  const lists = await Promise.all(collections.map((name) => loadCollection(name)));

  const counts = {};
  collections.forEach((name, i) => {
    lists[i].forEach((item) => {
      const cat = recordCategory(name, item);
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
  });

  const container = document.getElementById("category-list");
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🏷️</div><h3>Sin categorías</h3></div>`;
    return;
  }

  container.innerHTML = `<div class="flex gap-1" style="flex-wrap: wrap;">${entries
    .map(
      ([cat, count]) => `
      <span class="record-card__badge" style="text-transform:none;">${escapeHtml(cat)} · ${count}</span>`
    )
    .join("")}</div>`;
}

async function init() {
  await Promise.all([renderStats(), renderRecent(), renderCategories()]);
}

document.addEventListener("DOMContentLoaded", init);
