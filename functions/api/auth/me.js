// functions/api/auth/me.js
import { requireSession } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const session = await requireSession(context);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { env } = context;
  const row = await env.DB
    .prepare("SELECT display_name FROM admin_users WHERE username = ?")
    .bind(session.username)
    .first();
  return Response.json({ username: session.username, displayName: row?.display_name || null }, { status: 200 });
}
