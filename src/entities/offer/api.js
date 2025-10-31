// src/entities/offer/api.js
import { http } from "../../api";

/**
 * API для роботи з Offer (спеціалізації фахівця)
 */
export const offerApi = {
  /**
   * Масове створення офферів (зв’язок Specialist ↔ Works)
   * @param {number[]} workIds - масив ID робіт (підкатегорій)
   * @param {object} defaults - додаткові опції: price, description, plannedDurationIso, cityIds
   */
  async createOffersForWorks(workIds, defaults = {}) {
    const body = { workIds, ...defaults };
    console.debug("API.createOffersForWorks", body);
    return http.post("/api/Offer/bulk", body);
  },

  /**
   * Створити один оффер
   * @param {object} payload { workId, price?, description?, plannedDuration?, cityIds? }
   */
  async createOffer(payload) {
    console.debug("API.createOffer", payload);
    return http.post("/api/Offer", payload);
  },

  /**
   * Отримати власні оффери (спеціалізації)
   */
  async getMyOffers() {
    return http.get("/api/Offer/my");
  },

  /**
   * (опціонально) Отримати один оффер за ID
   */
  async getOffer(id) {
    return http.get(`/api/Offer/${id}`);
  },

  /**
   * Оновити оффер
   * @param {number} id - ID оффера
   * @param {object} payload { price?, description?, plannedDuration?, cityIds? }
   */
  async updateOffer(id, payload) {
    console.debug("API.updateOffer", id, payload);
    return http.put(`/api/Offer/${id}`, payload);
  },

  /**
   * Видалити оффер за ID
   */
  async deleteOffer(id) {
    console.debug("API.deleteOffer", id);
    return http.del(`/api/Offer/${id}`);
  },

  /**
   * ✅ Завантажити кілька фото до оффера (multipart/form-data)
   * Використовує той самий API_BASE і токен, що й інші методи.
   *
   * @param {number} offerId
   * @param {File[]} files
   */
  async uploadOfferPhotos(offerId, files = []) {
    if (!offerId || !Array.isArray(files) || files.length === 0) {
      return { ok: true, data: { count: 0 } };
    }

    const formData = new FormData();
    for (const f of files) {
      if (f && f.type?.startsWith("image/")) {
        formData.append("files", f);
      }
    }

    console.debug(`API.uploadOfferPhotos → /api/Offer/${offerId}/photos`, files);

    // використовуємо наш http.postForm, який уже додає BASE та токен
    return http.postForm(`/api/Offer/${offerId}/photos`, formData);
  },

  /**
   * Видалити конкретне фото (одне з агатьох)
   */
  async deleteOfferPhoto(offerId, fileName) {
    console.debug("API.deleteOfferPhoto", offerId, fileName);
    return http.del(`/api/Offer/${offerId}/photos/${encodeURIComponent(fileName)}`);
  },

  searchPublic(params) {
    const qs = new URLSearchParams(params || {}).toString();
    return http.get(`/api/Offer/public-search?${qs}`);
  },
  getPublicSpecialist(id) {
    return http.get(`/api/Offer/specialist/${id}`);
  },
};
