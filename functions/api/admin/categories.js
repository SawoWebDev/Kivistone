// functions/api/admin/categories.js
import { requireSession, logActivity } from "../../_lib/auth.js";

const SLUG_RE = /^[a-z0-9-]+$/;

function parseSpecs(row) {
  if (!row) return row;
  let specs = [];
  if (row.specs) {
    try {
      specs = JSON.parse(row.specs);
    } catch {
      specs = [];
    }
  }
  return { ...row, specs, feature: !!row.feature };
}

export async function onRequestGet(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { env } = context;
  const { results } = await env.DB
    .prepare("SELECT * FROM categories ORDER BY sort_order, title")
    .all();

  return Response.json(results.map(parseSpecs), { status: 200 });
}

export async function onRequestPost(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const body = await request.json().catch(() => ({}));
  const {
    slug,
    title,
    seed = null,
    image = null,
    feature = false,
    description = null,
    short = null,
    specs = [],
    sort_order = 0,
  } = body || {};

  if (!slug || typeof slug !== "string" || !SLUG_RE.test(slug)) {
    return Response.json({ error: "Invalid slug: must be a non-empty string matching /^[a-z0-9-]+$/" }, { status: 400 });
  }
  if (!title || typeof title !== "string") {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const existing = await env.DB.prepare("SELECT slug FROM categories WHERE slug = ?").bind(slug).first();
  if (existing) {
    return Response.json({ error: `Category with slug "${slug}" already exists` }, { status: 409 });
  }

  const specsJson = JSON.stringify(Array.isArray(specs) ? specs : []);

  await env.DB
    .prepare(
      `INSERT INTO categories (slug, title, seed, image, feature, description, short, specs, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(slug, title, seed, image, feature ? 1 : 0, description, short, specsJson, sort_order)
    .run();

  const created = await env.DB.prepare("SELECT * FROM categories WHERE slug = ?").bind(slug).first();

  await logActivity(env, {
    action: "create",
    entity: "category",
    entity_id: slug,
    entity_name: title,
    username: session.username,
    changes: body,
  });

  return Response.json(parseSpecs(created), { status: 201 });
}
