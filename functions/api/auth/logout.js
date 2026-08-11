// functions/api/auth/logout.js
import { getCookie, clearSessionCookie } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, "session");
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": clearSessionCookie(),
    },
  });
}
