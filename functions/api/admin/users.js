// functions/api/admin/users.js
import bcrypt from "bcryptjs";
import { requireSession, logActivity } from "../../_lib/auth.js";

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

export async function onRequestGet(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { env } = context;
  const { results } = await env.DB
    .prepare("SELECT id, username, display_name, created_at FROM admin_users ORDER BY username")
    .all();

  return Response.json(results, { status: 200 });
}

export async function onRequestPost(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const { username, password, display_name = null } = body || {};

  if (!username || typeof username !== "string" || !USERNAME_RE.test(username)) {
    return Response.json(
      { error: "Invalid username: 3-32 lowercase letters, numbers, dots, underscores or hyphens" },
      { status: 400 }
    );
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await env.DB.prepare("SELECT id FROM admin_users WHERE username = ?").bind(username).first();
  if (existing) {
    return Response.json({ error: `A user with username "${username}" already exists` }, { status: 409 });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  await env.DB
    .prepare("INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)")
    .bind(username, passwordHash, display_name ? String(display_name).trim() || null : null)
    .run();

  const created = await env.DB
    .prepare("SELECT id, username, display_name, created_at FROM admin_users WHERE username = ?")
    .bind(username)
    .first();

  await logActivity(env, {
    action: "create",
    entity: "user",
    entity_id: username,
    entity_name: display_name || username,
    username: session.username,
    changes: { username, display_name },
  });

  return Response.json(created, { status: 201 });
}
