// Ask Goobie, loaded only once the box's switch opens it. GET /api/session says first whether Ask is on; when it is
// off, Turnstile never loads. When it is on, Turnstile (explicit, interaction-only, action ask) solves once, and POST
// /api/session turns the solve into a 30-minute Ask token, kept in sessionStorage. Asking sends POST /api/ask { q }
// with the token in X-AO-Session: one question at a time, no retry. ask() returns the reply for box.js to draw: the
// answer as text, never as HTML.
import { TURNSTILE_SITE_KEY, TURNSTILE_TEST_SITE_KEY } from '../../data/public-keys.js';
import { load } from '../cards/data.js';
import { deepLink, h, pagePath, relatedRow } from './results.js';

const TURNSTILE = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=aoTurnstileReady';
// The real widget answers only on the site; anywhere else (localhost, wrangler dev, e2e) Cloudflare's test key.
const SITE_KEY = location.hostname === 'aaronorelup.com' ? TURNSTILE_SITE_KEY : TURNSTILE_TEST_SITE_KEY;
const KEPT = 'ao-ask';
const MARGIN = 60e3;      // ms: a token this close to its end is replaced before asking
const SAY = {
  resting: 'Goobie is resting. These posts are closest.',
  'not-found': "Nothing Aaron has written covers that yet. These posts come closest.",
  fine: "Goobie answers from Aaron's posts only and can be wrong.",
  unsolved: 'The check that this is a person didn’t finish. Try again in a minute.',
  expired: 'That session ran out. Ask again.',
  busy: 'Goobie has had a lot of questions this minute. Try again shortly.',
  down: 'Goobie can’t answer right now. Try again in a minute.',
};

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

// The reply to q, or null while an earlier question is still out.
export async function ask(ui, q) {
  if (asking) return null;
  asking = true;
  ui.go.disabled = true;
  ui.form.classList.add('is-thinking');
  try {
    const s = kept();
    const token = fresh(s) ? s.token : await solve(ui);
    if (!token) return say(SAY.unsolved);
    const r = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-AO-Session': token },
      body: JSON.stringify({ q }),
    });
    if (r.status === 401) sessionStorage.removeItem(KEPT);
    if (!r.ok) return say(r.status === 401 ? SAY.expired : r.status === 429 ? SAY.busy : SAY.down);
    return await answer(await r.json(), q);
  } catch {
    return say(SAY.down);
  } finally {
    asking = false;
    ui.go.disabled = false;
    ui.form.classList.remove('is-thinking');
  }
}

const say = (text) => h('p', { class: 'ask-note' }, text);

// "[2]" becomes a link to the cited passage, on the post or its notes page, with the question's words marked there.
function cited(text, cites, q) {
  const byN = new Map(cites.map((c) => [String(c.n), c]));
  return text.split(/(\[\d+\])/).map((part) => {
    const c = byN.get(part.slice(1, -1));
    if (!c) return part;
    const label = [c.title, c.heading].filter(Boolean).join(' / ');
    return h('a', { class: 'ask-cite', href: deepLink(pagePath(c.slug, c.kind), c.anchor, q), title: label }, part);
  });
}

async function answer({ answer: text, cites, related, reason }, q) {
  const cards = (await load()) ?? {};
  const head = text
    ? [h('p', { class: 'ask-text' }, ...cited(text, cites, q)), h('p', { class: 'ask-fine' }, SAY.fine)]
    : [say(reason === 'not-found' ? SAY['not-found'] : SAY.resting)];
  const rows = related.filter((slug) => cards[slug]).map((slug) => relatedRow(slug, cards[slug]));
  return h('div', { class: 'ask' }, ...head,
    ...(rows.length ? [h('ol', { class: 'rows ask-related', 'aria-label': 'Posts on this' }, ...rows)] : []));
}
