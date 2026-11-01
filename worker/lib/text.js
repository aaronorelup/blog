// Query text. normalize: NFKC, lowercase, whitespace collapsed, trimmed (the form every limiter, cache key and
// count uses). scrub: a query that may carry someone's details (an @, a URL, 6 or more digits in a row) is stored
// as "(redacted)", never as typed. sha256: the hex digest that keys the query limiter and the answer cache.
export const normalize = (q) => String(q).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

export const scrub = (q) => (/@|https?:\/\/|www\.|\d{6}/i.test(q) ? '(redacted)' : q);

export async function sha256(s) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
