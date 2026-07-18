// Shield — módulo Tarjetas (billetera visual)
import { loadCollection, addRecord, updateRecord, deleteRecord } from "./storage.js";
import { uid, escapeHtml, copyToClipboard, toast, confirmAction, debounce } from "./utils.js";
import { openModal, closeModal } from "../app.js";

const TYPE_LABELS = { credit: "Crédito", debit: "Débito", virtual: "Virtual", prepaid: "Prepago" };

let records = [];
let editingId = null;

const grid = document.getElementById("wallet-grid");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const form = document.getElementById("card-form");
const modalTitle = document.getElementById("modal-title");

function matchesFilters(item) {
  const term = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const haystack = `${item.name} ${item.bank} ${item.holder}`.toLowerCase();
  return (!term || haystack.includes(term)) && (!type || item.type === type);
}

function render() {
  const filtered = records.filter(matchesFilters);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">💳</div>
        <h3>Sin tarjetas</h3>
        <p>Agrega tu primera tarjeta con el botón "+ Nueva tarjeta".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <div class="wallet-card wallet-card--${item.color || "blue"}">
      <div class="wallet-card__top">
        <div>
          <div class="wallet-card__bank">${escapeHtml(item.name)}</div>
          <div class="wallet-card__type">${escapeHtml(item.bank)} · ${TYPE_LABELS[item.type] ?? item.type}</div>
        </div>
        <div class="wallet-card__brand">${escapeHtml(item.brand || "")}</div>
      </div>
      <div class="wallet-card__number">•••• •••• •••• ${escapeHtml(item.last4)}</div>
      <div class="wallet-card__bottom">
        <div>
          <div class="wallet-card__holder">${escapeHtml(item.holder)}</div>
        </div>
        <div class="wallet-card__exp">${escapeHtml(item.expiration)}</div>
      </div>
      <div class="wallet-card__actions">
        <button class="btn btn--sm" data-action="copy" data-id="${item.id}">📋 Copiar</button>
        <button class="btn btn--sm" data-action="edit" data-id="${item.id}">✏️ Editar</button>
        <button class="btn btn--sm btn--danger" data-action="delete" data-id="${item.id}">🗑️</button>
      </div>
    </div>`
    )
    .join("");
}

function openCreate() {
  editingId = null;
  modalTitle.textContent = "Nueva tarjeta";
  form.reset();
  openModal("card-modal");
}

function openEdit(item) {
  editingId = item.id;
  modalTitle.textContent = "Editar tarjeta";
  document.getElementById("f-name").value = item.name;
  document.getElementById("f-bank").value = item.bank;
  document.getElementById("f-type").value = item.type;
  document.getElementById("f-brand").value = item.brand ?? "";
  document.getElementById("f-holder").value = item.holder;
  document.getElementById("f-last4").value = item.last4;
  document.getElementById("f-expiration").value = item.expiration;
  document.getElementById("f-color").value = item.color ?? "blue";
  document.getElementById("f-notes").value = item.notes ?? "";
  openModal("card-modal");
}

async function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("f-name").value.trim(),
    bank: document.getElementById("f-bank").value.trim(),
    type: document.getElementById("f-type").value,
    brand: document.getElementById("f-brand").value.trim().toUpperCase(),
    holder: document.getElementById("f-holder").value.trim(),
    last4: document.getElementById("f-last4").value.trim().slice(-4),
    expiration: document.getElementById("f-expiration").value.trim(),
    color: document.getElementById("f-color").value,
    notes: document.getElementById("f-notes").value.trim(),
  };

  if (editingId) {
    records = await updateRecord("cards", editingId, payload);
    toast("Tarjeta actualizada", "success");
  } else {
    records = await addRecord("cards", { id: uid(), ...payload });
    toast("Tarjeta agregada", "success");
  }

  closeModal("card-modal");
  render();
}

function handleGridClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const item = records.find((r) => r.id === id);
  if (!item) return;

  if (action === "copy") {
    copyToClipboard(`•••• •••• •••• ${item.last4}`);
    toast("Número enmascarado copiado", "success");
  } else if (action === "edit") {
    openEdit(item);
  } else if (action === "delete") {
    if (confirmAction(`¿Eliminar la tarjeta "${item.name}"?`)) {
      deleteRecord("cards", id).then((next) => {
        records = next;
        render();
        toast("Tarjeta eliminada", "danger");
      });
    }
  }
}

async function init() {
  records = await loadCollection("cards");
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
