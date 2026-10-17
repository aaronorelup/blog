// The blog's one Worker. Only the paths wrangler.jsonc's run_worker_first names ever reach it,
// for two jobs: byte ranges for video and audio (media.js; the asset server ignores Range), and
// the live reader counter at /api/reads (reads.js, D1). Every other request on the site is a
// static asset served without running any code.
import { serveMedia } from './media.js';
import { serveReads } from './reads.js';

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/reads') return serveReads(request, env);
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    return serveMedia(request, env);
  },
};
