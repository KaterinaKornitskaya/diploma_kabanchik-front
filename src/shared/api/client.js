// src/api/client.js
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE : undefined) ||
  'https://localhost:7004';

export async function api(path, { method = 'GET', headers = {}, body, isFormData = false } = {}) {
  const token = localStorage.getItem("token");

  const finalHeaders = {
    'Accept': 'application/json',
    ...headers,
  };

  // JSON body → ставимо Content-Type
  if (body && !isFormData) {
    finalHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  // Якщо є токен — додати в заголовки
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body,
    credentials: 'omit',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`${res.status} ${res.statusText} — ${text}`);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// Додаткові зручні обгортки
export const http = {
  get: (path) => api(path),
  post: (path, json) => api(path, { method: 'POST', body: json }),
  postForm: (path, formData) => api(path, { method: 'POST', body: formData, isFormData: true }),
};
