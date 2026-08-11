// functions/_lib/auth.js
// Shared session helpers for the admin CMS. Sessions are opaque random
// tokens stored in the `sessions` D1 table (looked up per request) — not
// JWT/HMAC. Simpler to reason about for a single-admin-role CMS, and D1
// makes server-side revocation (logout, expiry) trivial.

const SESSION_COOKIE = "session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Generates a cryptographically random 32-byte token, hex-encoded (64
// chars). Uses Web Crypto's getRandomValues — available as a global in the
// Workers/Pages runtime, no Node `crypto` import needed.
export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCookie(request, name) {
  const header = request.headers.get("Cookie") || request.headers.get("cookie");
  if (!header) return null;
  const parts = header.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

export function setSessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// Reads the session cookie off the request, looks it up in D1, and returns
// { username } if it exists and hasn't expired, otherwise null. Callers
// should respond 401 { error: "Unauthorized" } when this returns null.
export async function requireSession(context) {
  const { request, env } = context;
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const row = await env.DB
    .prepare("SELECT username, expires_at FROM sessions WHERE token = ?")
    .bind(token)
    .first();

  if (!row) return null;
  if (new Date(row.expires_at + "Z").getTime() < Date.now()) return null;

  return { username: row.username };
}

// Inserts an activity_logs row. Never throws — a logging failure should
// never break the actual mutation that triggered it.
export async function logActivity(env, { action, entity, entity_id, entity_name, username, changes }) {
  try {
    const changesStr =
      changes == null
        ? null
        : typeof changes === "string"
        ? changes
        : JSON.stringify(changes);

    await env.DB
      .prepare(
        "INSERT INTO activity_logs (action, entity, entity_id, entity_name, username, changes) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(action, entity, entity_id ?? null, entity_name ?? null, username, changesStr)
      .run();
  } catch (err) {
    console.error("logActivity failed:", err && err.message);
  }
}
