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
                   'GET /cdn-cgi/trace': 'trace' };

// A test that ends mid-download cancels the fetch; that is the only way this fails, so it is let go.
async function forward(route) {
  const u = new URL(route.request().url());
  await route.fetch({ url: LIVE + u.pathname + u.search, timeout: 60_000 })
    .then((response) => route.fulfill({ response }), () => {});
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
