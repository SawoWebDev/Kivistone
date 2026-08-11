// functions/api/admin/profile/password.js
import bcrypt from "bcryptjs";
import { requireSession, logActivity } from "../../../_lib/auth.js";

export async function onRequestPut(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const { current_password, new_password } = body || {};

  if (!current_password || typeof current_password !== "string") {
    return Response.json({ error: "Current password is required" }, { status: 400 });
  }
  if (!new_password || typeof new_password !== "string" || new_password.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const row = await env.DB
    .prepare("SELECT password_hash FROM admin_users WHERE username = ?")
    .bind(session.username)
    .first();
  if (!row || !bcrypt.compareSync(current_password, row.password_hash)) {
    return Response.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const passwordHash = bcrypt.hashSync(new_password, 10);
  await env.DB
    .prepare("UPDATE admin_users SET password_hash = ? WHERE username = ?")
    .bind(passwordHash, session.username)
    .run();

  await logActivity(env, {
    action: "update",
    entity: "profile",
    entity_id: session.username,
    entity_name: session.username,
    username: session.username,
    changes: { password: "changed" },
  });

  return Response.json({ ok: true }, { status: 200 });
}
