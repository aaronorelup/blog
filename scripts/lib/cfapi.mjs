// The Cloudflare API for box tools: cf(path, init) on the account, with the account token from Infisical, and
// find-or-make for the resources the Worker binds that wrangler doesn't make (docs/WORKER.md). Run it to make
// whatever is missing: `node scripts/lib/cfapi.mjs`. It prints names and the public site key, never a secret.
import { pathToFileURL } from 'node:url';
import { secret } from './secrets.mjs';

export const ACCOUNT = 'd4d2707426a98d95ebd2a70357cc2f0a'; // wrangler.jsonc's account_id
export const WORKER = 'blog';
const API = 'https://api.cloudflare.com/client/v4';
const INDEX = 'blog-search';
const WIDGET = 'aaronorelup.com Ask Goobie';
let token = null;

export async function cf(path, { method = 'GET', body } = {}) {
  token ??= secret('CLOUDFLARE_R2_API_TOKEN'); // the broad account token, despite its name
  const res = await fetch(`${API}/accounts/${ACCOUNT}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json' }) },
    body: body && JSON.stringify(body),
  });
  const out = await res.json();
  if (!out.success) throw new Error(`${method} ${path}: ${res.status} ${out.errors.map((e) => `${e.code} ${e.message}`).join('; ')}`);
  return out.result;
}

// The Vectorize index search embeds into: @cf/baai/bge-m3's 1024 dimensions, cosine.
export async function searchIndex() {
  const found = (await cf('/vectorize/v2/indexes')).find((i) => i.name === INDEX);
  return found || cf('/vectorize/v2/indexes', {
    method: 'POST',
    body: { name: INDEX, description: 'aaronorelup.com search: post and notes chunks', config: { dimensions: 1024, metric: 'cosine' } },
  });
}

// Ask's Turnstile widget, with its secret (the list leaves secrets out, the details have them).
export async function turnstileWidget() {
  const found = (await cf('/challenges/widgets')).find((w) => w.name === WIDGET);
  if (found) return cf(`/challenges/widgets/${found.sitekey}`);
  return cf('/challenges/widgets', { method: 'POST', body: { name: WIDGET, domains: ['aaronorelup.com'], mode: 'managed' } });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const index = await searchIndex();
  console.log(`Vectorize ${index.name}: ${index.config.dimensions} dimensions, ${index.config.metric}`);
  const widget = await turnstileWidget();
  console.log(`Turnstile "${widget.name}" (${widget.mode}, ${widget.domains.join(', ')}): site key ${widget.sitekey}`);
}
