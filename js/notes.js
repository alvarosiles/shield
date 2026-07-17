// Shield — módulo Notas privadas
import { loadCollection, addRecord, updateRecord, deleteRecord } from "./storage.js";
import { uid, todayISO, escapeHtml, formatDate, toast, confirmAction, debounce } from "./utils.js";
import { openModal, closeModal } from "../app.js";

let records = [];
let editingId = null;

const grid = document.getElementById("record-grid");
const searchInput = document.getElementById("search-input");
const form = document.getElementById("note-form");
const modalTitle = document.getElementById("modal-title");

function matchesFilters(item) {
  const term = searchInput.value.trim().toLowerCase();
  const haystack = `${item.title} ${item.content} ${item.category}`.toLowerCase();
  return !term || haystack.includes(term);
}

function sortNotes(list) {
  return [...list].sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));
}

function render() {
  const filtered = sortNotes(records.filter(matchesFilters));

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">📝</div>
        <h3>Sin notas</h3>
        <p>Agrega tu primera nota con el botón "+ Nueva nota".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <article class="record-card">
      <div class="record-card__head">
        <div class="record-card__title">${item.pinned ? "📌" : "📝"} ${escapeHtml(item.title)}</div>
        ${item.category ? `<span class="record-card__badge">${escapeHtml(item.category)}</span>` : ""}
      </div>
      <p class="text-muted" style="font-size: 0.85rem; white-space: pre-wrap;">${escapeHtml(item.content)}</p>
      <div class="record-card__row"><span>Creada</span><span>${formatDate(item.createdAt)}</span></div>
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
  modalTitle.textContent = "Nueva nota";
  form.reset();
  openModal("note-modal");
}

function openEdit(item) {
  editingId = item.id;
  modalTitle.textContent = "Editar nota";
  document.getElementById("f-title").value = item.title;
  document.getElementById("f-category").value = item.category ?? "";
  document.getElementById("f-pinned").value = String(!!item.pinned);
  document.getElementById("f-content").value = item.content;
  openModal("note-modal");
}

async function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById("f-title").value.trim(),
    category: document.getElementById("f-category").value.trim(),
    pinned: document.getElementById("f-pinned").value === "true",
    content: document.getElementById("f-content").value.trim(),
  };

  if (editingId) {
    records = await updateRecord("notes", editingId, payload);
    toast("Nota actualizada", "success");
  } else {
    records = await addRecord("notes", { id: uid(), createdAt: todayISO(), ...payload });
    toast("Nota agregada", "success");
  }

  closeModal("note-modal");
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
    if (confirmAction(`¿Eliminar la nota "${item.title}"?`)) {
      deleteRecord("notes", id).then((next) => {
        records = next;
        render();
        toast("Nota eliminada", "danger");
      });
    }
  }
}

async function init() {
  records = await loadCollection("notes");
  render();

  document.getElementById("add-btn").addEventListener("click", openCreate);
  form.addEventListener("submit", handleSubmit);
  grid.addEventListener("click", handleGridClick);
  searchInput.addEventListener("input", debounce(render, 150));
  document.addEventListener("shield:globalsearch", (e) => {
    searchInput.value = e.detail;
    render();
  });
}

document.addEventListener("DOMContentLoaded", init);
