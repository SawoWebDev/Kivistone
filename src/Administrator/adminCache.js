// src/Administrator/adminCache.js
//
// Tiny localStorage-backed cache used to seed admin page state instantly on
// repeat visits, before a fresh fetch completes — avoids a loading-flash
// every time React Router unmounts/remounts a page on navigation. Wrapped in
// try/catch throughout: private browsing, storage quota, or serialization
// failures should never break the page, just fall back to "no cache".
const PREFIX = 'kivistone_admin_cache:';

export function getCache(key) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function setCache(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota / private-browsing errors
  }
}
