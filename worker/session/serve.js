// /api/session: GET says whether Ask is on, { ask }, cached 30 s. POST { turnstile } turns a Turnstile solve made
// on one of the site's own pages into a 30-minute Ask token, { token, exp } (lib/session.js). siteverify gets the
// secret and the response only, nothing about the visitor. There is no mint limiter: every mint costs a solve.
import { json, readJson, sameOrigin, status } from '../lib/http.js';
import { flags as switches } from '../lib/flags.js';
import { mint as mintToken } from '../lib/session.js';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_BODY = 3072; // a Turnstile response can be 2,048 characters long

export async function flags(request, env) {
  const { ask } = await switches(env);
  return json({ ask: ask === 'on' && !!env.DEEPSEEK_API_KEY }, 200, { 'Cache-Control': 'max-age=30' });
}

export async function mint(request, env) {
  if (!sameOrigin(request)) return status(403);
  const body = await readJson(request, MAX_BODY);
  if (!body) return status(413);
  const form = new FormData();
  form.set('secret', env.TURNSTILE_SECRET);
  form.set('response', typeof body.turnstile === 'string' ? body.turnstile : '');
  const r = await (await fetch(SITEVERIFY, { method: 'POST', body: form, signal: AbortSignal.timeout(10e3) })).json();
  // Cloudflare's always-pass test secret (.dev.vars) answers hostname example.com and no action at all.
  const action = r.metadata?.result_with_testing_key ? 'ask' : r.action;
  const hosts = env.TURNSTILE_HOSTNAMES.split(',').map((h) => h.trim());
  if (!r.success || !hosts.includes(r.hostname) || action !== 'ask') return status(401);
  return json(await mintToken(env));
}
