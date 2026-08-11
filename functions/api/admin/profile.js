// functions/api/admin/profile.js
// Self-service personal info for the logged-in admin (display name only —
// username is immutable to avoid desyncing it from `sessions.username`).
import { requireSession, logActivity } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { env } = context;
  const row = await env.DB
    .prepare("SELECT id, username, display_name, created_at FROM admin_users WHERE username = ?")
    .bind(session.username)
    .first();

  return Response.json(row, { status: 200 });
}

export async function onRequestPut(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const displayName = body?.display_name ? String(body.display_name).trim() || null : null;

  await env.DB
    .prepare("UPDATE admin_users SET display_name = ? WHERE username = ?")
    .bind(displayName, session.username)
    .run();

  const updated = await env.DB
    .prepare("SELECT id, username, display_name, created_at FROM admin_users WHERE username = ?")
    .bind(session.username)
    .first();

  await logActivity(env, {
    action: "update",
    entity: "profile",
    entity_id: session.username,
    entity_name: displayName || session.username,
    username: session.username,
    changes: { display_name: displayName },
  });

  return Response.json(updated, { status: 200 });
}
