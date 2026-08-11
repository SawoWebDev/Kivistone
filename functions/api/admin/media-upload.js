// functions/api/admin/media-upload.js
import { requireSession } from "../../_lib/auth.js";

function isSafeKey(key) {
  if (!key || typeof key !== "string") return false;
  if (key.startsWith("/")) return false;
  if (key.includes("..")) return false;
  return true;
}

export async function onRequestPost(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const contentType = url.searchParams.get("contentType");

  if (!key || !contentType) {
    return Response.json({ error: "key and contentType query params are required" }, { status: 400 });
  }
  if (!isSafeKey(key)) {
    return Response.json({ error: "Invalid key" }, { status: 400 });
  }

  const body = await request.arrayBuffer();

  await env.MEDIA_BUCKET.put(key, body, { httpMetadata: { contentType } });

  return Response.json({ url: "/media/" + key, key }, { status: 201 });
}

export async function onRequestDelete(context) {
  const session = await requireSession(context);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key || !isSafeKey(key)) {
    return Response.json({ error: "Invalid key" }, { status: 400 });
  }

  await env.MEDIA_BUCKET.delete(key);

  return new Response(null, { status: 204 });
}
