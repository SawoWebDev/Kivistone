// functions/api/admin/products.js
import { requireSession, logActivity } from "../../_lib/auth.js";

const ID_RE = /^[a-z0-9-]+$/;

export async function onRequestGet(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  let stmt;
  if (category) {
    stmt = env.DB
      .prepare("SELECT * FROM products WHERE category_slug = ? ORDER BY sort_order, name")
      .bind(category);
  } else {
    stmt = env.DB.prepare("SELECT * FROM products ORDER BY sort_order, name");
  }

  const { results } = await stmt.all();
  return Response.json(results, { status: 200 });
}

export async function onRequestPost(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const {
    id,
    category_slug,
    name,
    size_mm = null,
    weight_kg = null,
    weight_label = null,
    image = null,
    status = "published",
    visible = 1,
    sort_order = 0,
    meta_title = null,
    meta_description = null,
  } = body || {};

  if (!id || typeof id !== "string" || !ID_RE.test(id)) {
    return Response.json({ error: "Invalid id: must be a non-empty string matching /^[a-z0-9-]+$/" }, { status: 400 });
  }
  if (!category_slug || typeof category_slug !== "string") {
    return Response.json({ error: "category_slug is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const categoryRow = await env.DB
    .prepare("SELECT slug FROM categories WHERE slug = ?")
    .bind(category_slug)
    .first();
  if (!categoryRow) {
    return Response.json({ error: `category_slug "${category_slug}" does not reference an existing category` }, { status: 400 });
  }

  try {
    await env.DB
      .prepare(
        `INSERT INTO products
          (id, category_slug, name, size_mm, weight_kg, weight_label, image, status, visible, sort_order, meta_title, meta_description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(
        id,
        category_slug,
        name,
        size_mm,
        weight_kg,
        weight_label,
        image,
        status,
        visible ? 1 : 0,
        sort_order,
        meta_title,
        meta_description
      )
      .run();
  } catch (err) {
    return Response.json({ error: `Failed to create product: ${err.message || err}` }, { status: 500 });
  }

  const created = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();

  await logActivity(env, {
    action: "create",
    entity: "product",
    entity_id: id,
    entity_name: name,
    username: session.username,
    changes: body,
  });

  return Response.json(created, { status: 201 });
}
