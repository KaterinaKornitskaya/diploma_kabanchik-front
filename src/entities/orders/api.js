import { api } from "../../api";

export const ordersApi = {
  create: (body) => api("/api/Order/create", { method: "POST", body }),

  // ЕДИНЫЙ формат + backward-compat поля workId/workName
  my: async () => {
    const res = await api("/api/Order/my");
    const raw = Array.isArray(res) ? res : (res?.data ?? []);

    return raw.map(o => {
      const workId   = o.workId ?? o.WorkId ?? o.work?.id ?? o.Work?.Id ?? null;
      const workName = o.workName ?? o.WorkName ?? o.work?.name ?? o.Work?.Name ?? "Робота";

      // имя виконавця: сначала плоское поле specialistName из DTO,
      // затем вложенные варианты на случай других сериализаторов
      const specialistId =
        o.specialistId ?? o.SpecialistId ?? o.specialist?.id ?? o.Specialist?.Id ?? null;

      const specialistName =
        o.specialistName ?? o.SpecialistName
        ?? o.specialistName?.value // на всякий случай
        ?? o.specialist?.user?.fullName ?? o.Specialist?.User?.FullName
        ?? o.specialist?.user?.userName ?? o.Specialist?.User?.UserName
        ?? o.specialist?.fullName ?? o.Specialist?.FullName
        ?? o.specialist?.userName ?? o.Specialist?.UserName
        ?? null;

      return {
        id:          o.id ?? o.Id,
        createdAt:   o.createdAt ?? o.CreatedAt,
        completedAt: o.completedAt ?? o.CompletedAt ?? null,
        description: o.description ?? o.Description ?? "",
        price:       o.price ?? o.Price ?? 0,
        status:      String(o.status ?? o.Status ?? "Pending"),
        workId,
        workName,
        specialistId,
        specialistName,
      };
    });
  },


  restore: (id) => api(`/api/Order/${id}/restore`, { method: "POST" }),

  cancel: (id) => api(`/api/Order/${id}`, { method: "DELETE" }),

  // Открытые (Pending, без виконавця)
  findOpen: async ({ workId } = {}) => {
    const res = await api("/api/Order/new", {
      query: workId ? { workId } : undefined,
    });
    const raw = Array.isArray(res) ? res : (res?.data ?? []);
    return raw.map(o => ({
      id:          o.id ?? o.Id,
      createdAt:   o.createdAt ?? o.CreatedAt,
      description: o.description ?? o.Description ?? "",
      price:       o.price ?? o.Price ?? 0,
      status:      String(o.status ?? o.Status ?? "Pending"),
      workId:      o.workId ?? o.WorkId,
      workName:    o.workName ?? o.WorkName ?? "Робота",
      customerId:  o.customerId ?? o.CustomerId,
      customerName:o.customerName ?? o.CustomerName ?? "",
    }));
  },

  accept:   (id) => api(`/api/Order/${id}/accept`,   { method: "POST" }),
  complete: (id) => api(`/api/Order/${id}/complete`, { method: "POST" }),
  update: (id, body) => api(`/api/Order/${id}`, { method: "PUT", body }),


  myAssigned: async () => {
    const res = await api("/api/Order/my-assigned");
    const raw = Array.isArray(res) ? res : (res?.data ?? []);
    return raw.map(o => ({
      id:          o.id ?? o.Id,
      createdAt:   o.createdAt ?? o.CreatedAt,
      completedAt: o.completedAt ?? o.CompletedAt ?? null,
      description: o.description ?? o.Description ?? "",
      price:       o.price ?? o.Price ?? 0,
      status:      String(o.status ?? o.Status ?? "InProgress"),
      workId:      o.workId ?? o.WorkId,
      workName:    o.workName ?? o.WorkName ?? "Робота",
      customerName:o.customerName ?? o.CustomerName ?? "",
    }));
  },
};
