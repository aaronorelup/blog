// Ask tokens: base64url({ s, e }) + '.' + base64url(HMAC-SHA256 of that part), keyed by the secret SESSION_KEY.
// One is minted only after a Turnstile solve (session/serve.js). Nothing about a session is stored: s, 128 random
// bits, only ever keys a rate limiter, in memory. verify() checks with crypto.subtle.verify, in constant time.
const TTL = 30 * 60e3;
const enc = new TextEncoder();
const toB64url = (bytes) => btoa(String.fromCharCode(...bytes))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

const HMAC = { name: 'HMAC', hash: 'SHA-256' };
let hmac = null; // { secret, key }, imported once per isolate
function key(env) {
  if (hmac?.secret !== env.SESSION_KEY) {
    const imported = crypto.subtle.importKey('raw', enc.encode(env.SESSION_KEY), HMAC, false, ['sign', 'verify']);
    hmac = { secret: env.SESSION_KEY, key: imported };
  }
  return hmac.key;
}

export async function mint(env, now = Date.now()) {
  const e = now + TTL;
  const body = toB64url(enc.encode(JSON.stringify({ s: toB64url(crypto.getRandomValues(new Uint8Array(16))), e })));
  const sig = await crypto.subtle.sign('HMAC', await key(env), enc.encode(body));
  return { token: `${body}.${toB64url(new Uint8Array(sig))}`, exp: e };
}

// The session { s, e }, or null for a token that is malformed, altered, signed with another key or expired.
export async function verify(env, token, now = Date.now()) {
  const parts = String(token).split('.');
  if (parts.length !== 2 || !/^[\w-]+$/.test(parts[0]) || !/^[\w-]{43}$/.test(parts[1])) return null;
  const ok = await crypto.subtle.verify('HMAC', await key(env), fromB64url(parts[1]), enc.encode(parts[0]));
  if (!ok) return null;
  const claims = JSON.parse(new TextDecoder().decode(fromB64url(parts[0])));
  return claims.e > now ? claims : null;
}
