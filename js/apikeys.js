// Shield — módulo API Keys
import { loadCollection, addRecord, updateRecord, deleteRecord } from "./storage.js";
import { uid, todayISO, escapeHtml, formatDate, maskSecret, copyToClipboard, toast, confirmAction, debounce } from "./utils.js";
import { openModal, closeModal } from "../app.js";

const ENV_LABELS = { development: "Desarrollo", production: "Producción" };

let records = [];
let visibleSecrets = new Set();
let editingId = null;

const grid = document.getElementById("record-grid");
const searchInput = document.getElementById("search-input");
const envFilter = document.getElementById("env-filter");
const form = document.getElementById("apikey-form");
const modalTitle = document.getElementById("modal-title");

function matchesFilters(item) {
  const term = searchInput.value.trim().toLowerCase();
  const env = envFilter.value;
  const haystack = `${item.name} ${item.service}`.toLowerCase();
  return (!term || haystack.includes(term)) && (!env || item.environment === env);
}

function render() {
  const filtered = records.filter(matchesFilters);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🔐</div>
        <h3>Sin API keys</h3>
        <p>Agrega tu primera clave con el botón "+ Nueva API key".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((item) => {
      const shown = visibleSecrets.has(item.id);
      return `
      <article class="record-card">
        <div class="record-card__head">
          <div class="record-card__title">🔐 ${escapeHtml(item.name)}</div>
          <span class="record-card__badge record-card__badge--${item.status === "active" ? "active" : "inactive"}">${item.status === "active" ? "Activo" : "Inactivo"}</span>
        </div>
        <div class="record-card__row"><span>Servicio</span><span>${escapeHtml(item.service)}</span></div>
        <div class="record-card__row"><span>Entorno</span><span>${ENV_LABELS[item.environment] ?? item.environment}</span></div>
        <div class="record-card__row">
          <span>Clave</span>
          <span class="secret-field">
            <span class="record-card__secret">${shown ? escapeHtml(item.key) : maskSecret(item.key, 4)}</span>
            <button class="icon-btn" data-action="toggle" data-id="${item.id}" title="Mostrar/ocultar">${shown ? "🙈" : "👁️"}</button>
            <button class="icon-btn" data-action="copy" data-id="${item.id}" title="Copiar clave">📋</button>
          </span>
        </div>
        <div class="record-card__row"><span>Creada</span><span>${formatDate(item.createdAt)}</span></div>
        <div class="record-card__actions">
          <button class="btn btn--sm" data-action="edit" data-id="${item.id}">✏️ Editar</button>
          <button class="btn btn--sm btn--danger" data-action="delete" data-id="${item.id}">🗑️ Eliminar</button>
        </div>
      </article>`;
    })
    .join("");
}

function openCreate() {
  editingId = null;
  modalTitle.textContent = "Nueva API key";
  form.reset();
  openModal("apikey-modal");
}

function openEdit(item) {
  editingId = item.id;
  modalTitle.textContent = "Editar API key";
  document.getElementById("f-name").value = item.name;
  document.getElementById("f-service").value = item.service;
  document.getElementById("f-environment").value = item.environment;
  document.getElementById("f-key").value = item.key;
  document.getElementById("f-status").value = item.status;
  document.getElementById("f-notes").value = item.notes ?? "";
  openModal("apikey-modal");
}

async function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("f-name").value.trim(),
    service: document.getElementById("f-service").value.trim(),
    environment: document.getElementById("f-environment").value,
    key: document.getElementById("f-key").value.trim(),
    status: document.getElementById("f-status").value,
    notes: document.getElementById("f-notes").value.trim(),
  };

  if (editingId) {
    records = await updateRecord("apikeys", editingId, payload);
    toast("API key actualizada", "success");
  } else {
    records = await addRecord("apikeys", { id: uid(), createdAt: todayISO(), ...payload });
    toast("API key agregada", "success");
  }

  closeModal("apikey-modal");
  render();
}

function handleGridClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const item = records.find((r) => r.id === id);
  if (!item) return;

  if (action === "toggle") {
    visibleSecrets.has(id) ? visibleSecrets.delete(id) : visibleSecrets.add(id);
    render();
  } else if (action === "copy") {
    copyToClipboard(item.key);
    toast("Clave copiada al portapapeles", "success");
  } else if (action === "edit") {
    openEdit(item);
  } else if (action === "delete") {
    if (confirmAction(`¿Eliminar la API key "${item.name}"?`)) {
      deleteRecord("apikeys", id).then((next) => {
        records = next;
        render();
        toast("API key eliminada", "danger");
      });
    }
  }
}

async function init() {
  records = await loadCollection("apikeys");
  render();

  document.getElementById("add-btn").addEventListener("click", openCreate);
  form.addEventListener("submit", handleSubmit);
  grid.addEventListener("click", handleGridClick);
  searchInput.addEventListener("input", debounce(render, 150));
  envFilter.addEventListener("change", render);
  document.addEventListener("shield:globalsearch", (e) => {
    searchInput.value = e.detail;
    render();
  });
}

document.addEventListener("DOMContentLoaded", init);
