// functions/api/admin/categories/[slug].js
import { requireSession, logActivity } from "../../../_lib/auth.js";
import { triggerDeploy } from "../../../_lib/deploy.js";

const ALLOWED_FIELDS = ["title", "seed", "image", "feature", "description", "short", "specs", "sort_order"];

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

export async function onRequestPut(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env, params } = context;
  const slug = params.slug;

  const existing = await env.DB.prepare("SELECT * FROM categories WHERE slug = ?").bind(slug).first();
  if (!existing) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  const setClauses = [];
  const values = [];
  const changedFields = {};

  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      let value = body[field];
      if (field === "specs") {
        value = JSON.stringify(Array.isArray(value) ? value : []);
      } else if (field === "feature") {
        value = value ? 1 : 0;
      }
      setClauses.push(`${field} = ?`);
      values.push(value);
      changedFields[field] = body[field];
    }
  }

  if (setClauses.length === 0) {
    return Response.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  values.push(slug);

  await env.DB
    .prepare(`UPDATE categories SET ${setClauses.join(", ")} WHERE slug = ?`)
    .bind(...values)
    .run();

  const updated = await env.DB.prepare("SELECT * FROM categories WHERE slug = ?").bind(slug).first();

  await logActivity(env, {
    action: "update",
    entity: "category",
    entity_id: slug,
    entity_name: updated.title,
    username: session.username,
    changes: changedFields,
  });

  triggerDeploy(context);

  return Response.json(parseSpecs(updated), { status: 200 });
}

export async function onRequestDelete(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { env, params } = context;
  const slug = params.slug;

  const existing = await env.DB.prepare("SELECT * FROM categories WHERE slug = ?").bind(slug).first();
  if (!existing) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  const countRow = await env.DB
    .prepare("SELECT COUNT(*) AS n FROM products WHERE category_slug = ?")
    .bind(slug)
    .first();
  const count = countRow ? countRow.n : 0;

  if (count > 0) {
    return Response.json(
      { error: `Cannot delete category with ${count} product(s) still assigned to it` },
      { status: 409 }
    );
  }

  await env.DB.prepare("DELETE FROM categories WHERE slug = ?").bind(slug).run();

  await logActivity(env, {
    action: "delete",
    entity: "category",
    entity_id: slug,
    entity_name: existing.title,
    username: session.username,
    changes: null,
  });

  triggerDeploy(context);

  return new Response(null, { status: 204 });
}
