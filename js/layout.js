// Shield — layout compartido: sidebar, topbar y bloqueo visual simulado
import { basePath, toast } from "./utils.js";
import { getPrefs, setPrefs } from "./storage.js";

const NAV_ITEMS = [
  { page: "dashboard", href: "index.html", icon: "🏠", label: "Dashboard" },
  { page: "credentials", href: "pages/credentials.html", icon: "🔑", label: "Credenciales" },
  { page: "cards", href: "pages/cards.html", icon: "💳", label: "Tarjetas" },
  { page: "payments", href: "pages/payments.html", icon: "💰", label: "Pagos" },
  { page: "services", href: "pages/services.html", icon: "🌐", label: "Servicios" },
  { page: "documents", href: "pages/documents.html", icon: "📄", label: "Documentos" },
  { page: "apikeys", href: "pages/apikeys.html", icon: "🔐", label: "API Keys" },
  { page: "notes", href: "pages/notes.html", icon: "📝", label: "Notas" },
  { page: "settings", href: "pages/settings.html", icon: "⚙", label: "Configuración" },
];

const PAGE_TITLES = {
  dashboard: ["Dashboard", "Resumen general de tu bóveda"],
  credentials: ["Credenciales", "Usuarios, contraseñas y accesos"],
  cards: ["Tarjetas", "Tu billetera visual"],
  payments: ["Métodos de pago", "Bancos, billeteras y cuentas"],
  services: ["Servicios digitales", "Suscripciones y servicios en línea"],
  documents: ["Documentos", "Licencias, certificados y contratos"],
  apikeys: ["API Keys", "Claves de integración y tokens"],
  notes: ["Notas privadas", "Información libre y segura"],
  settings: ["Configuración", "Preferencias de la aplicación"],
};

function resolveHref(href) {
  const page = document.body.dataset.page;
  if (page === "dashboard") return href;
  return href === "index.html" ? `${basePath()}index.html` : href.replace("pages/", "");
}

function renderSidebar() {
  const root = document.getElementById("sidebar-root");
  if (!root) return;
  const currentPage = document.body.dataset.page;

  root.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__brand-icon">🛡️</span>
        <span class="sidebar__brand-text">Shield<small>Digital Vault</small></span>
      </div>
      <nav class="sidebar__nav">
        <ul>
          ${NAV_ITEMS.map(
            (item) => `
            <li>
              <a class="sidebar__link ${item.page === currentPage ? "is-active" : ""}" href="${resolveHref(item.href)}">
                <span class="sidebar__link-icon">${item.icon}</span>
                <span>${item.label}</span>
              </a>
            </li>`
          ).join("")}
        </ul>
      </nav>
      <div class="sidebar__footer">
        <button class="sidebar__lock" id="lock-btn" type="button">
          🔒 Bloquear bóveda
        </button>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const root = document.getElementById("topbar-root");
  if (!root) return;
  const page = document.body.dataset.page;
  const [title, subtitle] = PAGE_TITLES[page] ?? ["Shield", ""];

  root.innerHTML = `
    <div class="topbar">
      <button class="topbar__menu-btn" id="menu-btn" type="button" aria-label="Abrir menú">☰</button>
      <div class="topbar__title">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="topbar__search">
        <input type="search" id="global-search" placeholder="Buscar en esta sección..." autocomplete="off" />
      </div>
      <div class="topbar__actions">
        <button class="btn btn--icon" id="lock-btn-top" title="Bloquear bóveda" type="button">🔒</button>
        <div class="avatar" title="Usuario Demo">UD</div>
      </div>
    </div>
  `;
}

function renderLockOverlay() {
  if (document.getElementById("lock-overlay")) return;
  const el = document.createElement("div");
  el.className = "lock-overlay";
  el.id = "lock-overlay";
  el.innerHTML = `
    <div class="lock-overlay__icon">🛡️</div>
    <h2>Bóveda bloqueada</h2>
    <p>Tu información está protegida. Haz clic para continuar (demo visual).</p>
    <button class="btn btn--primary" id="unlock-btn" type="button">Desbloquear</button>
  `;
  document.body.appendChild(el);

  const open = () => el.classList.add("is-open");
  const close = () => el.classList.remove("is-open");

  document.getElementById("unlock-btn").addEventListener("click", close);

  document.addEventListener("click", (e) => {
    if (e.target.closest("#lock-btn") || e.target.closest("#lock-btn-top")) {
      open();
      toast("Bóveda bloqueada (simulación visual)", "warning");
    }
  });
}

function wireMobileMenu() {
  document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    if (e.target.closest("#menu-btn")) {
      sidebar.classList.toggle("is-open");
    } else if (!e.target.closest(".sidebar") && sidebar.classList.contains("is-open")) {
      sidebar.classList.remove("is-open");
    }
  });
}

function wireGlobalSearch() {
  const input = document.getElementById("global-search");
  if (!input) return;
  input.addEventListener("input", () => {
    document.dispatchEvent(new CustomEvent("shield:globalsearch", { detail: input.value.trim().toLowerCase() }));
  });
}

export function initLayout() {
  renderSidebar();
  renderTopbar();
  renderLockOverlay();
  wireMobileMenu();
  wireGlobalSearch();

  const prefs = getPrefs();
  if (!prefs.visited) {
    setPrefs({ visited: true, lastVisit: new Date().toISOString() });
  } else {
    setPrefs({ lastVisit: new Date().toISOString() });
  }
}

document.addEventListener("DOMContentLoaded", initLayout);
