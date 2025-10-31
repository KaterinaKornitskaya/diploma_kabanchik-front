// src/entities/category/api.js
import { api } from '../../../shared/api';

// Усі категорії (повний список)
export async function getAllCategories() {
  const res = await api("/api/Category/all");
  // бек повертає ApiResponse => дані лежать у res.data
  return Array.isArray(res) ? res : (res?.data ?? []);
}

// Лише ті категорії, де Є хоча б одна робота (для селекторів)
export async function getCategoriesWithWorks() {
  const res = await api("/api/Category/with-works");
  // очікуємо масив { id, name, works:[{id,name}] }
  return Array.isArray(res) ? res : (res?.data ?? []);
}

// Підкатегорії (works) за категорією
export async function getWorksByCategoryId(categoryId) {
  try {
    const res = await api(`/api/Work/category/${categoryId}`);
    // ApiResponse => тягнемо data
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    return list;
  } catch (e) {
    // якщо бек каже "немає робіт" → повертаємо порожній масив
    if (e.status === 404) return [];
    throw e;
  }
}

// (опційно) зручний об’єкт-агрегатор
export const categoryApi = {
  getAllCategories,
  getCategoriesWithWorks,
  getWorksByCategoryId,
};

