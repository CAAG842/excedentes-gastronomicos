const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  if (!isFormData && options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }),
};
