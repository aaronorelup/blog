// Every spec imports `test` and `expect` from here. Each browser context answers /api/* and /cdn-cgi/trace from
// recorded shapes (fixtures/api.json; `test.use({ api: { '/api/stats': 'stats-503' } })` picks another; a shape with
// `sse` is RAG Goobie's event stream) and, off the live site, fetches media and /read/* GETs from
// https://aaronorelup.com. No run posts to the live API.
import fs from 'node:fs';
import { test as base, expect } from '@playwright/test';

export { expect };
export const LIVE = 'https://aaronorelup.com';
const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac|m3u8|ts)$/i;
const here = (f) => new URL(f, import.meta.url);
const SHAPES = JSON.parse(fs.readFileSync(here('fixtures/api.json'), 'utf8'));
const DEFAULTS = { 'GET /api/reads': 'reads-200', 'POST /api/reads': 'reads-204', 'GET /api/stats': 'stats-200',
                   'GET /api/session': 'session-on', 'POST /api/session': 'session-mint', 'GET /api/search': 'search-200',
                   'POST /api/ask': 'ask-200', 'POST /api/ask/hear': 'hear-200', 'GET /cdn-cgi/trace': 'trace' };

// A media element is sent to the live file itself (a redirect), so it streams and seeks there in byte ranges as it
// would on the site; scripts' requests (hls.js segments, ao-fetch) are fetched for them, the response passed through
// whole. A test that ends mid-download disposes of that fetch; that is the only way this fails, so it is let go.
async function forward(route) {
  const u = new URL(route.request().url());
  const live = LIVE + u.pathname + u.search;
  if (route.request().resourceType() === 'media') return route.fulfill({ status: 302, headers: { location: live } });
  await route.fetch({ url: live, timeout: 60_000 })
    .then((response) => route.fulfill({ response }))
    .catch(() => {});
}

// E2E_MEDIA_DELAY=150-400 (off by default) holds every request for a media file on the live site (where a media
// element is sent) that many ms, picked at random in the range: a slow phone network, under which a clip's seeks and
// waits for data run long (WebKit's replay of a paused clip came out of it, listen-2).
const [lo, hi = lo] = (process.env.E2E_MEDIA_DELAY || '').split('-').map(Number);
const late = () => (lo > 0 ? new Promise((r) => setTimeout(r, lo + Math.random() * (hi - lo))) : null);

// POST /api/ask's answer as route.fulfill() takes it: its events as server-sent events.
export const sse = (events) => ({ status: 200, contentType: 'text/event-stream; charset=utf-8',
  body: events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('') });
// An answer ({ answer, cites, related }) as RAG Goobie streams it: the steps, its words with each cite just before
// the words that first use it, then the answer.
export function streamOf(a, focus = a.related) {
  const typed = [];
  const sent = new Set();
  for (const piece of a.answer.match(/[^.]+\.?\s*/g)) {
    for (const [, k] of piece.matchAll(/\[(\d+)\]/g)) {
      const c = a.cites.find((x) => String(x.n) === k);
      if (c && !sent.has(k)) typed.push({ t: 'cite', ...c });
      sent.add(k);
    }
    typed.push({ t: 'text', d: piece });
  }
  return [{ t: 'start', posts: 71, notes: 11, mode: 'whole', packs: 1 }, { t: 'plan', topics: ['video'], picks: 2 },
    { t: 'found', searches: 5, passages: 312, posts: 41, matched: 9, ranked: focus },
    { t: 'read', given: 71, of: 71, tokens: 318754, focus }, { t: 'write' }, ...typed,
    { t: 'answer', cached: false, took: 5210, usage: { tokens: 309012, hit: 308700, out: 230, usd: 0.0025 }, ...a }];
}

function answer(route, picks) {
  const req = route.request();
  const path = new URL(req.url()).pathname;
  const name = picks[path] || DEFAULTS[`${req.method()} ${path}`];
  if (!name) return route.fulfill({ status: 404, body: '' });
  const shape = SHAPES[name];
  if (shape.sse) return route.fulfill(sse(shape.sse));
  const body = shape.file ? fs.readFileSync(here('fixtures/' + shape.file), 'utf8')
    : shape.text ?? (shape.json ? JSON.stringify(shape.json) : '');
  return route.fulfill({ status: shape.status, contentType: shape.text ? 'text/plain' : 'application/json', body });
}

export const test = base.extend({
  api: [{}, { option: true }],
  context: async ({ context, baseURL, api }, use) => {
    const origin = new URL(baseURL).origin;
    const ours = (u) => u.origin === origin;
    if (lo > 0) await context.route((u) => u.origin === LIVE && MEDIA.test(u.pathname), async (r) => { await late(); await r.fallback(); });
    if (origin !== LIVE) await context.route((u) => ours(u) && (MEDIA.test(u.pathname) || u.pathname.startsWith('/read/')), forward);
    await context.route((u) => ours(u) && (u.pathname.startsWith('/api/') || u.pathname === '/cdn-cgi/trace'), (r) => answer(r, api));
    await use(context);
  },
});
