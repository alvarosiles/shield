// Shield — módulo Documentos
import { loadCollection, addRecord, updateRecord, deleteRecord } from "./storage.js";
import { uid, escapeHtml, formatDate, toast, confirmAction, debounce } from "./utils.js";
import { openModal, closeModal } from "../app.js";

const TYPE_ICONS = { "Licencia": "🪪", "Certificado": "📜", "Contrato": "📑" };

let records = [];
let editingId = null;

const grid = document.getElementById("record-grid");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const form = document.getElementById("document-form");
const modalTitle = document.getElementById("modal-title");

function matchesFilters(item) {
  const term = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const haystack = `${item.name} ${item.file}`.toLowerCase();
  return (!term || haystack.includes(term)) && (!type || item.type === type);
}

function render() {
  const filtered = records.filter(matchesFilters);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">📄</div>
        <h3>Sin documentos</h3>
        <p>Agrega tu primer documento con el botón "+ Nuevo documento".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <article class="record-card">
      <div class="record-card__head">
        <div class="record-card__title">${TYPE_ICONS[item.type] ?? "📄"} ${escapeHtml(item.name)}</div>
        <span class="record-card__badge">${escapeHtml(item.type)}</span>
      </div>
      ${item.file ? `<div class="record-card__row"><span>Archivo</span><span>${escapeHtml(item.file)}</span></div>` : ""}
      <div class="record-card__row"><span>Fecha</span><span>${formatDate(item.date)}</span></div>
      ${item.notes ? `<div class="record-card__row"><span>Notas</span><span>${escapeHtml(item.notes)}</span></div>` : ""}
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
  modalTitle.textContent = "Nuevo documento";
  form.reset();
  openModal("document-modal");
}

function openEdit(item) {
  editingId = item.id;
  modalTitle.textContent = "Editar documento";
  document.getElementById("f-name").value = item.name;
  document.getElementById("f-type").value = item.type;
  document.getElementById("f-date").value = item.date;
  document.getElementById("f-file").value = item.file ?? "";
  document.getElementById("f-notes").value = item.notes ?? "";
  openModal("document-modal");
}

async function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("f-name").value.trim(),
    type: document.getElementById("f-type").value,
    date: document.getElementById("f-date").value,
    file: document.getElementById("f-file").value.trim(),
    notes: document.getElementById("f-notes").value.trim(),
  };

  if (editingId) {
    records = await updateRecord("documents", editingId, payload);
    toast("Documento actualizado", "success");
  } else {
    records = await addRecord("documents", { id: uid(), ...payload });
    toast("Documento agregado", "success");
  }

  closeModal("document-modal");
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
    if (confirmAction(`¿Eliminar el documento "${item.name}"?`)) {
      deleteRecord("documents", id).then((next) => {
        records = next;
        render();
        toast("Documento eliminado", "danger");
      });
    }
  }
}

async function init() {
  records = await loadCollection("documents");
  render();

  document.getElementById("add-btn").addEventListener("click", openCreate);
  form.addEventListener("submit", handleSubmit);
  grid.addEventListener("click", handleGridClick);
  searchInput.addEventListener("input", debounce(render, 150));
  typeFilter.addEventListener("change", render);
  document.addEventListener("shield:globalsearch", (e) => {
    searchInput.value = e.detail;
    render();
  });
}

document.addEventListener("DOMContentLoaded", init);
