export const required = (v) => (String(v ?? "").trim() ? "" : "Обов’язкове поле");
export const email = (v) => (/^\S+@\S+\.\S+$/.test(v) ? "" : "Некоректний email");
export const phone = (v) => (/^\+?\d[\d\s()-]{7,}$/.test(v) ? "" : "Некоректний телефон");