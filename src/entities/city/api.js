import { api } from "../../shared/api";

// універсальний хелпер: витягти масив із ApiResponse
function unbox(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

/** Пошук міст: /api/City/search?q=...&limit=... */
export async function searchCities(q, limit = 20) {
  const res = await api(`/api/City/search?q=${encodeURIComponent(q || "")}&limit=${limit}`);
  return unbox(res);
}

/** Топ/перші N міст (без рядка пошуку) — контролер повертає перші за абеткою */
export async function topCities(limit = 8) {
  const res = await api(`/api/City/search?limit=${limit}`);
  return unbox(res);
}

/** Всі активні (fallback) */
export async function getAllCities() {
  const res = await api("/api/City/all");
  return unbox(res);
}

/** За id */
export async function getCityById(id) {
  const res = await api(`/api/City/${id}`);
  // тут бек повертає одиничний об’єкт у Data
  return res?.data ?? null;
}
