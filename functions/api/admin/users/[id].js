// functions/api/admin/users/[id].js
import bcrypt from "bcryptjs";
import { requireSession, logActivity } from "../../../_lib/auth.js";

export async function onRequestPut(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env, params } = context;
  const id = params.id;

  const existing = await env.DB.prepare("SELECT * FROM admin_users WHERE id = ?").bind(id).first();
  if (!existing) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const setClauses = [];
  const values = [];
  const changedFields = {};

  if (Object.prototype.hasOwnProperty.call(body, "display_name")) {
    const displayName = body.display_name ? String(body.display_name).trim() || null : null;
    setClauses.push("display_name = ?");
    values.push(displayName);
    changedFields.display_name = displayName;
  }

  if (Object.prototype.hasOwnProperty.call(body, "password") && body.password) {
    if (typeof body.password !== "string" || body.password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    setClauses.push("password_hash = ?");
    values.push(bcrypt.hashSync(body.password, 10));
    changedFields.password = "reset";
  }

  if (setClauses.length === 0) {
    return Response.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  values.push(id);
  await env.DB.prepare(`UPDATE admin_users SET ${setClauses.join(", ")} WHERE id = ?`).bind(...values).run();

  // A password reset invalidates that user's existing sessions so the new
  // credentials take effect immediately instead of only on next expiry.
  if (changedFields.password) {
    await env.DB.prepare("DELETE FROM sessions WHERE username = ?").bind(existing.username).run();
  }

  const updated = await env.DB
    .prepare("SELECT id, username, display_name, created_at FROM admin_users WHERE id = ?")
    .bind(id)
    .first();

  await logActivity(env, {
    action: "update",
    entity: "user",
    entity_id: existing.username,
    entity_name: updated.display_name || updated.username,
    username: session.username,
    changes: changedFields,
  });

  return Response.json(updated, { status: 200 });
}

export async function onRequestDelete(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { env, params } = context;
  const id = params.id;

  const existing = await env.DB.prepare("SELECT * FROM admin_users WHERE id = ?").bind(id).first();
  if (!existing) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (existing.username === session.username) {
    return Response.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  const countRow = await env.DB.prepare("SELECT COUNT(*) AS n FROM admin_users").first();
  if ((countRow?.n || 0) <= 1) {
    return Response.json({ error: "Can't delete the last remaining admin account" }, { status: 400 });
  }

  await env.DB.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM sessions WHERE username = ?").bind(existing.username).run();

  await logActivity(env, {
    action: "delete",
    entity: "user",
    entity_id: existing.username,
    entity_name: existing.display_name || existing.username,
    username: session.username,
    changes: null,
  });

  return new Response(null, { status: 204 });
}
