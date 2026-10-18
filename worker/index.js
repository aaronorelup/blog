// The blog's one Worker. Only the paths wrangler.jsonc's run_worker_first names ever reach it,
// for three jobs: byte ranges for video and audio (media.js; the asset server ignores Range), the
// live reader counter at /api/reads (reads.js, D1), and the daily traffic snapshot at /api/stats
// (stats.js, D1). Every other request on the site is a static asset served without running any
// code. The snapshot is gathered by the cron trigger in wrangler.jsonc, which calls scheduled()
// once a minute for one small step at a time (stats.js says why).
import { serveMedia } from './media.js';
import { serveReads } from './reads.js';
import { serveStats, runStep } from './stats.js';

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/reads') return serveReads(request, env);
    if (pathname === '/api/stats') return serveStats(request, env);
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    return serveMedia(request, env);
  },
  scheduled(controller, env, ctx) {
    ctx.waitUntil(runStep(env).catch((e) => console.error('stats: ' + ((e && e.message) || e))));
  },
};
