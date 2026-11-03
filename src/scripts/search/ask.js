// RAG Goobie, loaded only once the box's switch opens it. GET /api/session says first whether Ask is on; when it is
// off, Turnstile never loads. When it is on, Turnstile (explicit, interaction-only, action ask) solves once, and POST
// /api/session turns the solve into a 30-minute Ask token, kept in sessionStorage. Asking sends POST /api/ask { q }
// with the token in X-AO-Session, one question at a time, no retry, and draws the answer's stream as it comes: the
// steps (ask-trace.js), then the words typing in and the final answer (ask-answer.js), always as text.
import { TURNSTILE_SITE_KEY, TURNSTILE_TEST_SITE_KEY } from '../../data/public-keys.js';
import { load } from '../cards/data.js';
import { answer, SAY, say } from './ask-answer.js';
import { events } from './ask-stream.js';
import { summary, trace } from './ask-trace.js';
import { h } from './results.js';

const TURNSTILE = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=aoTurnstileReady';
// The real widget answers only on the site; anywhere else (localhost, wrangler dev, e2e) Cloudflare's test key.
const SITE_KEY = location.hostname === 'aaronorelup.com' ? TURNSTILE_SITE_KEY : TURNSTILE_TEST_SITE_KEY;
const KEPT = 'ao-ask';
const MARGIN = 60e3;      // ms: a token this close to its end is replaced before asking

let turnstile = null;     // a promise of window.turnstile
let widget = null;        // the rendered widget's id
let host = null;          // the box it was rendered into (the homepage overlay mounts a fresh box every time)
let solving = null;       // { promise, resolve, box } of the token a solve under way will mint
let asking = false;

const kept = () => JSON.parse(sessionStorage.getItem(KEPT) || 'null');
const fresh = (s) => !!s && s.exp - MARGIN > Date.now();

// Whether Ask is on. When it is, the widget starts its solve now, so a token is ready by the first question.
export async function open(ui) {
  const r = await fetch('/api/session').catch(() => null);
  const on = !!(r?.ok && (await r.json()).ask);
  if (on && !fresh(kept())) solve(ui);
  return on;
}

function loadTurnstile() {
  turnstile ??= new Promise((resolve, reject) => {
    window.aoTurnstileReady = () => resolve(window.turnstile);
    const script = h('script', { src: TURNSTILE, async: '' });
    script.onerror = reject;
    document.head.append(script);
  });
  return turnstile;
}

// The token the solve under way mints (null when Turnstile or the mint fails).
function finish(token) {
  const s = solving;
  solving = null;
  s?.resolve(token);
}

// A promise of an Ask token from a new solve: the widget's first, or a reset once a session has run out.
function solve(ui) {
  if (solving?.box === ui.turnstile) return solving.promise;
  finish(null);           // a solve left under way in a box that has since gone
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  solving = { promise, resolve, box: ui.turnstile };
  loadTurnstile().then((ts) => {
    if (widget !== null && host === ui.turnstile) return ts.reset(widget);
    if (widget !== null) ts.remove(widget);
    host = ui.turnstile;
    widget = ts.render(host, {
      sitekey: SITE_KEY, action: 'ask', appearance: 'interaction-only', 'refresh-expired': 'manual',
      callback: (t) => mint(t).then(finish),
      'error-callback': () => finish(null),
      // An interactive challenge left unsolved: the question waiting on it is told so, and the next one resets it.
      'timeout-callback': () => finish(null),
    });
  }, () => finish(null));
  return promise;
}

async function mint(turnstileToken) {
  const r = await fetch('/api/session', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ turnstile: turnstileToken }),
  }).catch(() => null);
  if (!r?.ok) return null;
  const session = await r.json();
  sessionStorage.setItem(KEPT, JSON.stringify(session));
  return session.token;
}

// Asks q and draws its answer through draw(node) as it streams; nothing while an earlier question is still out.
export async function ask(ui, q, draw) {
  if (asking) return;
  asking = true;
  ui.go.disabled = true;
  ui.form.classList.add('is-thinking');
  try {
    const s = kept();
    const token = fresh(s) ? s.token : await solve(ui);
    if (!token) return draw(say(SAY.unsolved));
    const r = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-AO-Session': token },
      body: JSON.stringify({ q }),
    });
    if (r.status === 401) sessionStorage.removeItem(KEPT);
    if (!r.ok) return draw(say(r.status === 401 ? SAY.expired : r.status === 429 ? SAY.busy : SAY.down));
    await streamed(r.body, q, draw);
  } catch {
    draw(say(SAY.down));
  } finally {
    asking = false;
    ui.go.disabled = false;
    ui.form.classList.remove('is-thinking');
  }
}

// The steps, then the words, then the answer or a note. A stream that ends with neither reads as down.
async function streamed(body, q, draw) {
  const cards = (await load()) ?? {};
  const steps = trace(cards);
  const words = answer(q, cards);
  const view = h('div', { class: 'ask', 'aria-busy': 'true' }, steps.el, words.el);
  draw(view);
  for await (const e of events(body)) {
    if (e.t === 'cite') words.cite(e);
    else if (e.t === 'text') words.text(e.d);
    else if (e.t === 'answer') return answered(view, words.done(e, summary(e, steps.read)));
    else if (e.t === 'end') return show(view, words.ended(e));
    else steps.on(e);
  }
  throw new Error('the stream ended without an answer');
}

function show(view, parts) {
  view.replaceChildren(...parts);
  view.removeAttribute('aria-busy');
}

// The answer in place of the steps. Its paragraph (parts[0], the words typed in) stays in the page, the same node:
// one taken out and put back, as replaceChildren does even to a node it keeps, takes a cite under a press with it, and
// that press gets no click (Chromium and WebKit). Everything else in the view (the step list) goes, and the rest of the
// answer goes in after the paragraph. The step list going moves the paragraph up once, by its height.
function answered(view, [el, ...rest]) {
  for (const n of [...view.childNodes]) if (n !== el) n.remove();
  el.after(...rest);
  view.removeAttribute('aria-busy');
}
