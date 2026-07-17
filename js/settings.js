// Shield — módulo Configuración
import { getPrefs, setPrefs, resetAllData, loadCollection, COLLECTIONS } from "./storage.js";
import { toast, confirmAction } from "./utils.js";

const bannerSelect = document.getElementById("p-banner");
const maskSelect = document.getElementById("p-mask");

function loadPrefsIntoForm() {
  const prefs = getPrefs();
  bannerSelect.value = String(prefs.showSecurityBanner ?? true);
  maskSelect.value = String(prefs.maskSecretsByDefault ?? true);
}

function savePrefs() {
  setPrefs({
    showSecurityBanner: bannerSelect.value === "true",
    maskSecretsByDefault: maskSelect.value === "true",
  });
  toast("Preferencias guardadas", "success");
}

async function exportData() {
  const entries = await Promise.all(COLLECTIONS.map((name) => loadCollection(name)));
  const payload = {};
  COLLECTIONS.forEach((name, i) => {
    payload[name] = entries[i];
  });

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shield-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Exportación generada", "success");
}

function resetData() {
  if (!confirmAction("¿Restablecer todos los datos a los valores demo originales? Se perderán tus cambios locales.")) return;
  resetAllData();
  toast("Datos restablecidos. Recargando...", "warning");
  setTimeout(() => window.location.reload(), 900);
}

function init() {
  loadPrefsIntoForm();
  document.getElementById("save-prefs-btn").addEventListener("click", savePrefs);
  document.getElementById("export-btn").addEventListener("click", exportData);
  document.getElementById("reset-btn").addEventListener("click", resetData);
}

document.addEventListener("DOMContentLoaded", init);
