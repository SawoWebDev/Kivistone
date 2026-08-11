// functions/api/track/pageview.js
// PUBLIC Cloudflare Pages Function — no auth. Ported from REACT_SITE's
// functions/api/track/pageview.js but writes to D1 instead of Supabase.
//
// Geo comes from request.cf (country/region/city) — Cloudflare populates
// this for every request that reaches a Worker/Pages Function, for free,
// no external API call needed.
import { isBot } from "../../_lib/botPatterns.js";

// Body fields come straight from the browser — cap length and normalize
// empties to null so junk/oversized values can't bloat the table.
function clean(v, max = 200) {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
}

export async function onRequestPost({ request, env }) {
  const userAgent = request.headers.get("user-agent");

  if (!userAgent) {
    return Response.json({ error: "Missing User-Agent header" }, { status: 400 });
  }

  if (isBot(userAgent)) {
    return new Response(null, { status: 204 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    session_id,
    page_path,
    device_type,
    browser,
    os,
    screen_size,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
  } = body || {};

  if (!session_id || !page_path) {
    return Response.json({ error: "Missing session_id or page_path" }, { status: 400 });
  }

  const { country = null, region = null, city = null } = request.cf || {};

  try {
    const result = await env.DB
      .prepare(
        `INSERT INTO analytics_page_views
          (session_id, page_path, device_type, browser, os, screen_size, referrer, utm_source, utm_medium, utm_campaign, country, region, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        clean(session_id),
        clean(page_path, 500),
        clean(device_type, 40),
        clean(browser, 40),
        clean(os, 40),
        clean(screen_size, 40),
        clean(referrer),
        clean(utm_source),
        clean(utm_medium),
        clean(utm_campaign),
        country || null,
        region || null,
        city || null
      )
      .run();

    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    console.error("track/pageview insert failed:", err && err.message);
    return Response.json({ error: "Insert failed" }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
