// The blog's one Worker. Only the paths wrangler.jsonc's run_worker_first names reach it: /api/* through ROUTES,
// everything else (video, audio, HLS, /read/*) through media/serve.js. Each cron runs one bounded step of its
// features. A thrown error is logged and answered 503; every other failure is a status its handler chose.
import * as media from './media/serve.js';   import * as reads from './reads/serve.js';
import * as stats from './stats/index.js';   import * as session from './session/serve.js';
import * as search from './search/serve.js'; import * as sync from './search/sync.js';
import * as ask from './ask/serve.js';       import * as read from './read/step.js';
import * as cleanup from './cleanup.js';     import { status } from './lib/http.js';

const ROUTES = {
  '/api/reads':   { GET: reads.counts, POST: reads.count },
  '/api/stats':   { GET: stats.serve, HEAD: stats.serve },
  '/api/session': { GET: session.flags, POST: session.mint },
  '/api/search':  { GET: search.serve },
  '/api/ask':     { POST: ask.serve },
};
// Job names are what Workers Logs show, with the word each step returns ("stats.runStep idle").
const CRONS = {
  '* * * * *':    { 'stats.runStep': stats.runStep, 'search.sync': sync.step, 'cleanup.daily': cleanup.daily },
  '*/10 * * * *': { 'read.step': read.step },
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const route = ROUTES[pathname];
    if (!route) return pathname.startsWith('/api/') ? status(404) : media.serve(request, env);
    const handler = route[request.method];
    if (!handler) return status(405, { Allow: Object.keys(route).join(', ') });
    try { return await handler(request, env, ctx); }
    catch (e) { console.error(pathname, e.message); return status(503); }
  },
  scheduled(controller, env, ctx) {
    for (const [name, job] of Object.entries(CRONS[controller.cron])) {
      ctx.waitUntil(job(env, controller.scheduledTime).then(
        (did) => did && console.log(name, did),
        (e) => console.error(name, e.message),
      ));
    }
  },
};
