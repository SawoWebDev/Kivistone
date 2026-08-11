// functions/api/admin/analytics.js
import { requireSession } from "../../_lib/auth.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function onRequestGet(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
    return Response.json({ error: "from and to (YYYY-MM-DD) query params are required" }, { status: 400 });
  }
  if (to < from) {
    return Response.json({ error: "to must not be before from" }, { status: 400 });
  }

  const { results } = await env.DB
    .prepare(
      "SELECT * FROM analytics_page_views WHERE date(timestamp) >= ? AND date(timestamp) <= ? ORDER BY timestamp LIMIT 20000"
    )
    .bind(from, to)
    .all();

  return Response.json({ rows: results }, { status: 200 });
}
