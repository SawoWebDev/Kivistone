// functions/media/[[path]].js
// PUBLIC — no auth. Serves objects out of the MEDIA_BUCKET R2 bucket at
// same-origin URLs like /media/products/candle-holders/r-131.webp, used
// both by site visitors and the admin UI's own image previews.

export async function onRequestGet({ env, params }) {
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const key = segments.filter(Boolean).join("/");

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  const obj = await env.MEDIA_BUCKET.get(key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
