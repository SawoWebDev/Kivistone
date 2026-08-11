// functions/_lib/deploy.js
// The public site is a prerendered static build (see scripts/prerender.mjs)
// that only picks up D1 changes via `npm run build` (prebuild syncs D1 ->
// src/data/*.json). To make CMS edits show up on kivistone.com without a
// human running that build by hand, every product/category mutation below
// pings a Cloudflare Pages Deploy Hook, which re-triggers that same build
// from the connected git branch.
//
// Requires a `DEPLOY_HOOK_URL` secret on the Pages project (Pages dashboard
// -> kivistone -> Settings -> Builds & deployments -> Deploy hooks), e.g.:
//   npx wrangler pages secret put DEPLOY_HOOK_URL --project-name kivistone
// If it isn't set (e.g. local dev), this is a silent no-op.

export function triggerDeploy(context) {
  const { env } = context;
  if (!env.DEPLOY_HOOK_URL) return;

  const promise = fetch(env.DEPLOY_HOOK_URL, { method: "POST" }).catch((err) => {
    console.error("triggerDeploy failed:", err && err.message);
  });

  if (context.waitUntil) context.waitUntil(promise);
}
