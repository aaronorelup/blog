// Ask's token in the page (src/scripts/search/ask.js): when Turnstile's script fails to load, the question is told
// "Try again in a minute", so the next question must ask for the script again rather than reuse the failure. The
// browser is faked: the script "loads" or fails when the test says, and the widget solves when the test says.
import test from 'node:test';
import assert from 'node:assert/strict';

const scripts = [];       // the <script> elements in the head, in order
const el = () => ({ attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, append() {},
  remove() { const i = scripts.indexOf(this); if (i >= 0) scripts.splice(i, 1); } });
globalThis.window = globalThis;
globalThis.location = { hostname: 'localhost' };
globalThis.document = { createElement: el, head: { append: (s) => scripts.push(s) } };
const kept = new Map();
globalThis.sessionStorage = { getItem: (k) => kept.get(k) ?? null, setItem: (k, v) => kept.set(k, v), removeItem: (k) => kept.delete(k) };
globalThis.fetch = async () => ({ ok: true, json: async () => ({ token: 'minted', exp: Date.now() + 30 * 60e3 }) });

const { token } = await import('../../src/scripts/search/ask.js');

test('a Turnstile script that failed to load is asked for again by the next question', async () => {
  const ui = { turnstile: {} };
  const first = token(ui);
  assert.equal(scripts.length, 1);
  const failed = scripts[0];
  failed.onerror(new Event('error'));
  assert.equal(await first, null, 'the question waiting on it is told the check did not finish');

  const second = token(ui);
  const again = scripts.find((s) => s !== failed);
  assert.ok(again, 'the script is requested again');
  assert.match(again.attrs.src, /challenges\.cloudflare\.com\/turnstile/);

  // This time it loads, the widget renders and solves, and the solve is minted into a token.
  let widget;
  globalThis.turnstile = { render: (host, o) => { widget = o; return 'w1'; }, reset() {}, remove() {} };
  window.aoTurnstileReady();
  await new Promise((r) => setImmediate(r));
  widget.callback('a-solve');
  assert.equal(await second, 'minted');
});
