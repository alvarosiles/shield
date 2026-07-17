// Shield — bootstrap general de la aplicación (modales, atajos globales)

/** Abre un modal por id (elemento .modal-overlay). */
export function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add("is-open");
  const firstInput = overlay.querySelector("input, textarea, select");
  if (firstInput) firstInput.focus();
}

/** Cierra un modal por id. */
export function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove("is-open");
}

/** Cierra cualquier modal abierto. */
export function closeAllModals() {
  document.querySelectorAll(".modal-overlay.is-open").forEach((el) => el.classList.remove("is-open"));
}

/** Conecta el cierre de modales vía backdrop, botón [data-modal-close] y tecla Escape. */
export function setupModalDismiss() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      e.target.classList.remove("is-open");
    }
    const closeBtn = e.target.closest("[data-modal-close]");
    if (closeBtn) {
      closeAllModals();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
  });
}

document.addEventListener("DOMContentLoaded", setupModalDismiss);
