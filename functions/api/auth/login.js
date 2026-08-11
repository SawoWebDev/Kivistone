// functions/api/auth/login.js
import bcrypt from "bcryptjs";
import { randomToken, setSessionCookie } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body || {};

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const row = await env.DB
    .prepare("SELECT * FROM admin_users WHERE username = ?")
    .bind(username)
    .first();

  // Same error message whether the username doesn't exist or the password
  // is wrong — don't leak which one it was.
  if (!row) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = randomToken();
  await env.DB
    .prepare("INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, datetime('now', '+7 days'))")
    .bind(token, row.username)
    .run();

  return new Response(JSON.stringify({ username: row.username, displayName: row.display_name || null }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": setSessionCookie(token),
    },
  });
}
