const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE : undefined) ||
  'https://localhost:7004';

export async function api(path, { method = 'GET', headers = {}, body, isFormData = false } = {}) {
  const token = localStorage.getItem('token');

  const finalHeaders = { Accept: 'application/json', ...headers };

  if (body && !isFormData) {
    finalHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

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

// зручні обгортки (можеш використовувати за потреби)
export const http = {
  get: (p) => api(p),
  post: (p, json) => api(p, { method: 'POST', body: json }),
  postForm: (p, formData) => api(p, { method: 'POST', body: formData, isFormData: true }),
  put: (p, json) => api(p, { method: 'PUT', body: json }),
  del: (p) => api(p, { method: 'DELETE' }),
};
