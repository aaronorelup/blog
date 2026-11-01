// Every spec imports `test` and `expect` from here. Each browser context answers /api/* and /cdn-cgi/trace from
// recorded shapes (fixtures/api.json; `test.use({ api: { '/api/stats': 'stats-503' } })` picks another) and, off
// the live site, fetches media and /read/* GETs from https://aaronorelup.com. No run posts to the live API.
import fs from 'node:fs';
import { test as base, expect } from '@playwright/test';

export { expect };
export const LIVE = 'https://aaronorelup.com';
const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac|m3u8|ts)$/i;
const here = (f) => new URL(f, import.meta.url);
const SHAPES = JSON.parse(fs.readFileSync(here('fixtures/api.json'), 'utf8'));
const DEFAULTS = { 'GET /api/reads': 'reads-200', 'POST /api/reads': 'reads-204', 'GET /api/stats': 'stats-200',
                   'GET /api/session': 'session-on', 'POST /api/session': 'session-mint', 'GET /api/search': 'search-200',
                   'POST /api/ask': 'ask-200', 'GET /cdn-cgi/trace': 'trace' };

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

function answer(route, picks) {
  const req = route.request();
  const path = new URL(req.url()).pathname;
  const name = picks[path] || DEFAULTS[`${req.method()} ${path}`];
  if (!name) return route.fulfill({ status: 404, body: '' });
  const shape = SHAPES[name];
  const body = shape.file ? fs.readFileSync(here('fixtures/' + shape.file), 'utf8')
    : shape.text ?? (shape.json ? JSON.stringify(shape.json) : '');
  return route.fulfill({ status: shape.status, contentType: shape.text ? 'text/plain' : 'application/json', body });
}

export const test = base.extend({
  api: [{}, { option: true }],
  context: async ({ context, baseURL, api }, use) => {
    const origin = new URL(baseURL).origin;
    const ours = (u) => u.origin === origin;
    if (origin !== LIVE) await context.route((u) => ours(u) && (MEDIA.test(u.pathname) || u.pathname.startsWith('/read/')), forward);
    await context.route((u) => ours(u) && (u.pathname.startsWith('/api/') || u.pathname === '/cdn-cgi/trace'), (r) => answer(r, api));
    await use(context);
  },
});
