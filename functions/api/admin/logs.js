// functions/api/admin/logs.js
import { requireSession } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const url = new URL(request.url);

  let page = parseInt(url.searchParams.get("page") || "1", 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  let pageSize = parseInt(url.searchParams.get("pageSize") || "50", 10);
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 50;
  if (pageSize > 200) pageSize = 200;

  const action = url.searchParams.get("action");
  const entity = url.searchParams.get("entity");
  const username = url.searchParams.get("username");
  const search = url.searchParams.get("search");

  const whereClauses = [];
  const params = [];

  if (action) {
    whereClauses.push("action = ?");
    params.push(action);
  }
  if (entity) {
    whereClauses.push("entity = ?");
    params.push(entity);
  }
  if (username) {
    whereClauses.push("username = ?");
    params.push(username);
  }
  if (search) {
    whereClauses.push("entity_name LIKE ?");
    params.push(`%${search}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const offset = (page - 1) * pageSize;

  const rowsStmt = env.DB
    .prepare(
      `SELECT * FROM activity_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, pageSize, offset);

  const countStmt = env.DB
    .prepare(`SELECT COUNT(*) AS n FROM activity_logs ${whereSql}`)
    .bind(...params);

  const [rowsResult, countResult] = await Promise.all([rowsStmt.all(), countStmt.first()]);

  return Response.json(
    { rows: rowsResult.results, total: countResult ? countResult.n : 0 },
    { status: 200 }
  );
}
