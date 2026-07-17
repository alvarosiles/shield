// Shield — utilidades compartidas (ES6 module)

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function maskSecret(value = "", visible = 0) {
  const str = String(value);
  if (str.length <= visible) return "•".repeat(str.length || 8);
  return "•".repeat(Math.max(str.length - visible, 4)) + str.slice(-visible);
}

export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}

export function toast(message, type = "info") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

export function confirmAction(message) {
  return window.confirm(message);
}

/** Resuelve la ruta base a los archivos data/ y raíz según la profundidad de la página. */
export function basePath() {
  return window.BASE_PATH ?? "";
}
