// Shield — módulo Servicios digitales
import { loadCollection, addRecord, updateRecord, deleteRecord } from "./storage.js";
import { uid, escapeHtml, toast, confirmAction, debounce } from "./utils.js";
import { openModal, closeModal } from "../app.js";

let records = [];
let editingId = null;

const grid = document.getElementById("record-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const form = document.getElementById("service-form");
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
  const haystack = `${item.name} ${item.category} ${item.account}`.toLowerCase();
  return (!term || haystack.includes(term)) && (!category || item.category === category);
}

function render() {
  const filtered = records.filter(matchesFilters);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🌐</div>
        <h3>Sin servicios</h3>
        <p>Agrega tu primer servicio con el botón "+ Nuevo servicio".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <article class="record-card">
      <div class="record-card__head">
        <div class="record-card__title">🌐 ${escapeHtml(item.name)}</div>
        <span class="record-card__badge record-card__badge--${item.status === "active" ? "active" : "inactive"}">${item.status === "active" ? "Activo" : "Inactivo"}</span>
      </div>
      <div class="record-card__row"><span>Categoría</span><span>${escapeHtml(item.category)}</span></div>
      ${item.account ? `<div class="record-card__row"><span>Cuenta</span><span>${escapeHtml(item.account)}</span></div>` : ""}
      ${item.plan ? `<div class="record-card__row"><span>Plan</span><span>${escapeHtml(item.plan)}</span></div>` : ""}
      ${item.url ? `<div class="record-card__row"><span>URL</span><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="text-muted">${escapeHtml(item.url)}</a></div>` : ""}
      <div class="record-card__actions">
        <button class="btn btn--sm" data-action="edit" data-id="${item.id}">✏️ Editar</button>
        <button class="btn btn--sm btn--danger" data-action="delete" data-id="${item.id}">🗑️ Eliminar</button>
      </div>
    </article>`
    )
    .join("");
}

function openCreate() {
  editingId = null;
  modalTitle.textContent = "Nuevo servicio";
  form.reset();
  openModal("service-modal");
}

function openEdit(item) {
  editingId = item.id;
  modalTitle.textContent = "Editar servicio";
  document.getElementById("f-name").value = item.name;
  document.getElementById("f-category").value = item.category;
  document.getElementById("f-status").value = item.status;
  document.getElementById("f-url").value = item.url ?? "";
  document.getElementById("f-account").value = item.account ?? "";
  document.getElementById("f-plan").value = item.plan ?? "";
  document.getElementById("f-notes").value = item.notes ?? "";
  openModal("service-modal");
}

async function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("f-name").value.trim(),
    category: document.getElementById("f-category").value.trim(),
    status: document.getElementById("f-status").value,
    url: document.getElementById("f-url").value.trim(),
    account: document.getElementById("f-account").value.trim(),
    plan: document.getElementById("f-plan").value.trim(),
    notes: document.getElementById("f-notes").value.trim(),
  };

  if (editingId) {
    records = await updateRecord("services", editingId, payload);
    toast("Servicio actualizado", "success");
  } else {
    records = await addRecord("services", { id: uid(), ...payload });
    toast("Servicio agregado", "success");
  }

  closeModal("service-modal");
  populateCategories();
  render();
}

function handleGridClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const item = records.find((r) => r.id === id);
  if (!item) return;

  if (action === "edit") {
    openEdit(item);
  } else if (action === "delete") {
    if (confirmAction(`¿Eliminar el servicio "${item.name}"?`)) {
      deleteRecord("services", id).then((next) => {
        records = next;
        render();
        toast("Servicio eliminado", "danger");
      });
    }
  }
}

async function init() {
  records = await loadCollection("services");
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
