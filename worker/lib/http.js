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
