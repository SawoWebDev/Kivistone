// functions/api/admin/products/[id].js
import { requireSession, logActivity } from "../../../_lib/auth.js";
import { triggerDeploy } from "../../../_lib/deploy.js";

const ALLOWED_FIELDS = [
  "name",
  "category_slug",
  "size_mm",
  "weight_kg",
  "weight_label",
  "image",
  "status",
  "visible",
  "sort_order",
  "meta_title",
  "meta_description",
];

export async function onRequestPut(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env, params } = context;
  const id = params.id;

  const existing = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  if (!existing) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  const setClauses = [];
  const values = [];
  const changedFields = {};

  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      let value = body[field];
      if (field === "visible") value = value ? 1 : 0;
      setClauses.push(`${field} = ?`);
      values.push(value);
      changedFields[field] = body[field];
    }
  }

  if (setClauses.length === 0) {
    return Response.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  // Validate category_slug references an existing category if it's being changed.
  if (Object.prototype.hasOwnProperty.call(body, "category_slug")) {
    const categoryRow = await env.DB
      .prepare("SELECT slug FROM categories WHERE slug = ?")
      .bind(body.category_slug)
      .first();
    if (!categoryRow) {
      return Response.json({ error: `category_slug "${body.category_slug}" does not reference an existing category` }, { status: 400 });
    }
  }

  setClauses.push("updated_at = datetime('now')");
  values.push(id);

  await env.DB
    .prepare(`UPDATE products SET ${setClauses.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  const updated = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();

  await logActivity(env, {
    action: "update",
    entity: "product",
    entity_id: id,
    entity_name: updated.name,
    username: session.username,
    changes: changedFields,
  });

  triggerDeploy(context);

  return Response.json(updated, { status: 200 });
}

export async function onRequestDelete(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { env, params } = context;
  const id = params.id;

  const existing = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  if (!existing) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const result = await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  if (!result.meta || result.meta.changes === 0) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  await logActivity(env, {
    action: "delete",
    entity: "product",
    entity_id: id,
    entity_name: existing.name,
    username: session.username,
    changes: null,
  });

  triggerDeploy(context);

  return new Response(null, { status: 204 });
}
