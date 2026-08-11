// src/Administrator/api.js
//
// Thin fetch wrapper shared by every admin page. Every call includes
// credentials so the browser sends the admin session cookie (same-origin,
// no CORS setup needed) and normalizes error handling: a non-2xx response
// throws an Error whose `.message` is the backend's `{ error }` body when
// present, so call sites can just try/catch and show `err.message`.
async function request(path, options = {}) {
  const { body, headers, ...rest } = options;
  const isPlainObjectBody = body && typeof body === 'object' && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !(body instanceof FormData);

  const res = await fetch(path, {
    credentials: 'include',
    headers: isPlainObjectBody
      ? { 'Content-Type': 'application/json', ...(headers || {}) }
      : headers,
    body: isPlainObjectBody ? JSON.stringify(body) : body,
    ...rest,
  });

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && typeof data === 'object' && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export { request };
