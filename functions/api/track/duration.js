// functions/api/track/duration.js
// PUBLIC Cloudflare Pages Function — no auth. Ported from REACT_SITE's
// functions/api/track/duration.js but writes to D1 instead of Supabase.

const MAX_TIME_ON_PAGE_SECONDS = 86400; // 24h ceiling, rejects garbage values

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const { id, time_on_page } = body || {};

  if (
    id == null ||
    typeof time_on_page !== "number" ||
    !Number.isFinite(time_on_page) ||
    time_on_page < 0 ||
    time_on_page > MAX_TIME_ON_PAGE_SECONDS
  ) {
    return Response.json({ error: "Missing or invalid id/time_on_page" }, { status: 400 });
  }

  try {
    await env.DB
      .prepare("UPDATE analytics_page_views SET time_on_page = ? WHERE id = ?")
      .bind(time_on_page, id)
      .run();

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("track/duration update failed:", err && err.message);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
