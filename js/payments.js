// Shield — módulo Métodos de pago
import { loadCollection, addRecord, updateRecord, deleteRecord } from "./storage.js";
import { uid, escapeHtml, copyToClipboard, toast, confirmAction, debounce } from "./utils.js";
import { openModal, closeModal } from "../app.js";

const TYPE_ICONS = { "Banco": "🏦", "Billetera digital": "👛", "Cuenta": "🧾", "QR de pago": "📱" };

let records = [];
let editingId = null;

const grid = document.getElementById("record-grid");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const form = document.getElementById("payment-form");
const modalTitle = document.getElementById("modal-title");

function matchesFilters(item) {
  const term = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const haystack = `${item.name} ${item.account}`.toLowerCase();
  return (!term || haystack.includes(term)) && (!type || item.type === type);
}

function render() {
  const filtered = records.filter(matchesFilters);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">💰</div>
        <h3>Sin métodos de pago</h3>
        <p>Agrega tu primer método con el botón "+ Nuevo método".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <article class="record-card">
      <div class="record-card__head">
        <div class="record-card__title">${TYPE_ICONS[item.type] ?? "💰"} ${escapeHtml(item.name)}</div>
        <span class="record-card__badge record-card__badge--${item.status === "active" ? "active" : "inactive"}">${item.status === "active" ? "Activo" : "Inactivo"}</span>
      </div>
      <div class="record-card__row"><span>Tipo</span><span>${escapeHtml(item.type)}</span></div>
      <div class="record-card__row">
        <span>Cuenta</span>
        <span class="secret-field">
          <span class="record-card__secret">${escapeHtml(item.account)}</span>
          <button class="icon-btn" data-action="copy" data-id="${item.id}" title="Copiar">📋</button>
        </span>
      </div>
      ${item.description ? `<div class="record-card__row"><span>Descripción</span><span>${escapeHtml(item.description)}</span></div>` : ""}
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
  modalTitle.textContent = "Nuevo método de pago";
  form.reset();
  openModal("payment-modal");
}

function openEdit(item) {
  editingId = item.id;
  modalTitle.textContent = "Editar método de pago";
  document.getElementById("f-name").value = item.name;
  document.getElementById("f-type").value = item.type;
  document.getElementById("f-status").value = item.status;
  document.getElementById("f-account").value = item.account;
  document.getElementById("f-description").value = item.description ?? "";
  openModal("payment-modal");
}

async function handleSubmit(e) {
  e.preventDefault();
  const type = document.getElementById("f-type").value;
  const payload = {
    name: document.getElementById("f-name").value.trim(),
    type,
    status: document.getElementById("f-status").value,
    account: document.getElementById("f-account").value.trim(),
    description: document.getElementById("f-description").value.trim(),
    qr: type === "QR de pago",
  };

  if (editingId) {
    records = await updateRecord("payments", editingId, payload);
    toast("Método de pago actualizado", "success");
  } else {
    records = await addRecord("payments", { id: uid(), ...payload });
    toast("Método de pago agregado", "success");
  }

  closeModal("payment-modal");
  render();
}

function handleGridClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const item = records.find((r) => r.id === id);
  if (!item) return;

  if (action === "copy") {
    copyToClipboard(item.account);
    toast("Cuenta copiada al portapapeles", "success");
  } else if (action === "edit") {
    openEdit(item);
  } else if (action === "delete") {
    if (confirmAction(`¿Eliminar "${item.name}"?`)) {
      deleteRecord("payments", id).then((next) => {
        records = next;
        render();
        toast("Método de pago eliminado", "danger");
      });
    }
  }
}

async function init() {
  records = await loadCollection("payments");
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
