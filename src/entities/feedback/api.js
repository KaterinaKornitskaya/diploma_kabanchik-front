import { http } from "../../api";

export const feedbackApi = {
  // створити фідбек
  create(body) {
    // { orderId, rating:1..5, comment? }
    return http.post("/api/Feedback", body);
  },

  // є фідбек по замовленню?
  existsForOrder(orderId) {
    return http.get(`/api/Feedback/order/${orderId}/exists`);
  },

  // список відгуків по фахівцю (опц. по роботі)
  listForSpecialist(id, { workId, skip = 0, take = 20 } = {}) {
    const qs = new URLSearchParams();
    if (workId) qs.set("workId", workId);
    if (skip) qs.set("skip", skip);
    if (take) qs.set("take", take);
    return http.get(`/api/Feedback/specialist/${id}?${qs.toString()}`);
  },

  // зведення
  summary(id) {
    return http.get(`/api/Feedback/specialist/${id}/summary`);
  },

  createForOrder(payload) {
    // payload: { orderId, rating, comment? }
    return http.post("/api/Feedback", payload);
  },
};
