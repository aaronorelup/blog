// Answers. Errors are bare status codes, and the page words its own failure (only /api/stats keeps its
// { error, state } bodies, which the stats page reads). Nothing an API answers is cached unless it says so.
const NO_STORE = { 'Cache-Control': 'no-store' };

export const json = (body, code = 200, headers = {}) => new Response(JSON.stringify(body), {
  status: code,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE, ...headers },
});

export const status = (code, headers = {}) => new Response(null, { status: code, headers: { ...NO_STORE, ...headers } });

// The request came from one of this site's own pages: its Origin is the host it was sent to, which holds on
// aaronorelup.com, on workers.dev and under `wrangler dev` alike.
export function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  return !!origin && URL.canParse(origin) && new URL(origin).host === new URL(request.url).host;
}

// The request's body as bytes, or null when it is over max bytes. A declared length over max is refused unread;
// a body with no length, or more than it declared, is read only until it passes max, then dropped, so a sender
// can never make the Worker hold more than max bytes of it.
export async function readBytes(request, max) {
  if (Number(request.headers.get('Content-Length')) > max) return null;
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) { out.set(chunk, at); at += chunk.byteLength; }
  return out;
}

// The request's JSON body, or null when it is over max bytes. A body that isn't JSON reads as {}.
export async function readJson(request, max) {
  const bytes = await readBytes(request, max);
  if (!bytes) return null;
  try { return JSON.parse(new TextDecoder().decode(bytes)) || {}; } catch { return {}; }
}
