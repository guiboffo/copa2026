const STORAGE_KEY = "copa2026v4";
const BOLAO_KEY = "copa2026bolao";

export function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

export function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function loadBolao() {
  try { return JSON.parse(localStorage.getItem(BOLAO_KEY)); } catch { return null; }
}

export function saveBolao(data) {
  try { localStorage.setItem(BOLAO_KEY, JSON.stringify(data)); } catch {}
}

export function exportCode(bolao) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(bolao)))); } catch { return ""; }
}

export function importCode(code) {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!parsed || typeof parsed !== "object") throw new Error("Formato inválido");
    return { ok: true, data: parsed };
  } catch {
    return { ok: false, error: "Código inválido. Verifique e tente novamente." };
  }
}
