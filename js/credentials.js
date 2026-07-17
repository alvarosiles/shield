// Shield — módulo Credenciales
import { loadCollection, addRecord, updateRecord, deleteRecord } from "./storage.js";
import { uid, todayISO, formatDate, escapeHtml, maskSecret, copyToClipboard, toast, confirmAction, debounce } from "./utils.js";
import { openModal, closeModal } from "../app.js";

let records = [];
let visibleSecrets = new Set();
let editingId = null;

const grid = document.getElementById("record-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const form = document.getElementById("credential-form");
const modalTitle = document.getElementById("modal-title");

function populateCategories() {
  const cats = [...new Set(records.map((r) => r.category).filter(Boolean))].sort();
  categoryFilter.innerHTML = `<option value="">Todas las categorías</option>${cats
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join("")}`;
}

function matchesFilters(item) {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const haystack = `${item.service} ${item.username} ${item.email}`.toLowerCase();
  const matchesTerm = !term || haystack.includes(term);
  const matchesCategory = !category || item.category === category;
  return matchesTerm && matchesCategory;
}

function render() {
  const filtered = records.filter(matchesFilters);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🔑</div>
        <h3>Sin credenciales</h3>
        <p>Agrega tu primera credencial con el botón "+ Nueva credencial".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((item) => {
      const shown = visibleSecrets.has(item.id);
      return `
      <article class="record-card">
        <div class="record-card__head">
          <div class="record-card__title">🔑 ${escapeHtml(item.service)}</div>
          <span class="record-card__badge record-card__badge--${item.status === "active" ? "active" : "inactive"}">${item.status === "active" ? "Activo" : "Inactivo"}</span>
        </div>
        <div class="record-card__row"><span>Categoría</span><span>${escapeHtml(item.category)}</span></div>
        <div class="record-card__row"><span>Usuario</span><span>${escapeHtml(item.username)}</span></div>
        <div class="record-card__row">
          <span>Contraseña</span>
          <span class="secret-field">
            <span class="record-card__secret">${shown ? escapeHtml(item.password) : maskSecret(item.password)}</span>
            <button class="icon-btn" data-action="toggle" data-id="${item.id}" title="Mostrar/ocultar">${shown ? "🙈" : "👁️"}</button>
            <button class="icon-btn" data-action="copy" data-id="${item.id}" title="Copiar contraseña">📋</button>
          </span>
        </div>
        ${item.url ? `<div class="record-card__row"><span>URL</span><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="text-muted">${escapeHtml(item.url)}</a></div>` : ""}
        <div class="record-card__row"><span>Creado</span><span>${formatDate(item.createdAt)}</span></div>
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
  modalTitle.textContent = "Nueva credencial";
  form.reset();
  document.getElementById("f-status").value = "active";
  openModal("credential-modal");
}

function openEdit(item) {
  editingId = item.id;
  modalTitle.textContent = "Editar credencial";
  document.getElementById("f-service").value = item.service;
  document.getElementById("f-category").value = item.category;
  document.getElementById("f-status").value = item.status;
  document.getElementById("f-url").value = item.url ?? "";
  document.getElementById("f-username").value = item.username;
  document.getElementById("f-password").value = item.password;
  document.getElementById("f-email").value = item.email ?? "";
  document.getElementById("f-notes").value = item.notes ?? "";
  openModal("credential-modal");
}

async function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    service: document.getElementById("f-service").value.trim(),
    category: document.getElementById("f-category").value.trim(),
    status: document.getElementById("f-status").value,
    url: document.getElementById("f-url").value.trim(),
    username: document.getElementById("f-username").value.trim(),
    password: document.getElementById("f-password").value,
    email: document.getElementById("f-email").value.trim(),
    notes: document.getElementById("f-notes").value.trim(),
  };

  if (editingId) {
    records = await updateRecord("credentials", editingId, payload);
    toast("Credencial actualizada", "success");
  } else {
    const record = { id: uid(), createdAt: todayISO(), ...payload };
    records = await addRecord("credentials", record);
    toast("Credencial creada", "success");
  }

  closeModal("credential-modal");
  populateCategories();
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
    copyToClipboard(item.password);
    toast("Contraseña copiada al portapapeles", "success");
  } else if (action === "edit") {
    openEdit(item);
  } else if (action === "delete") {
    if (confirmAction(`¿Eliminar la credencial "${item.service}"? Esta acción no se puede deshacer.`)) {
      deleteRecord("credentials", id).then((next) => {
        records = next;
        render();
        toast("Credencial eliminada", "danger");
      });
    }
  }
}

async function init() {
  records = await loadCollection("credentials");
  populateCategories();
  render();

  document.getElementById("add-btn").addEventListener("click", openCreate);
  form.addEventListener("submit", handleSubmit);
  grid.addEventListener("click", handleGridClick);
  searchInput.addEventListener("input", debounce(render, 150));
  categoryFilter.addEventListener("change", render);
  document.addEventListener("shield:globalsearch", (e) => {
    searchInput.value = e.detail;
    render();
  });
}

document.addEventListener("DOMContentLoaded", init);
