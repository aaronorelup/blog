// Getting the filing. stats.astro starts the fetch inline, before any module has even
// downloaded (window.__stStats), so by the time this runs the answer is usually already here.
// Every way it can go wrong becomes a named state the page knows how to say warmly
// (DESIGN.md §A.5); nothing here throws.
import { normalize } from './agg.js';

/** @typedef {{ok:true, snap:import('./types.js').Snap}
 *          | {ok:false, state:'not-connected'|'gathering'|'error'|'offline'|'unknown-version', message:string, status:number}} Loaded */

// The dev middleware shows the other answers for ?state=…; the production Worker ignores it.
function url() {
  let s = null;
  try { s = new URLSearchParams(location.search).get('state'); } catch (e) { s = null; }
  return '/api/stats' + (s ? '?state=' + encodeURIComponent(s) : '');
}

async function fetchRaw(init) {
  try {
    const r = await fetch(url(), init);
    let text = null;
    try { text = await r.text(); } catch (e) { text = null; }
    return { status: r.status, text };
  } catch (e) {
    return { status: 0, text: null };
  }
}

/** @returns {Loaded} */
function interpret(res) {
  const status = res?.status ?? 0;
  if (status === 0) return { ok: false, state: 'offline', message: '', status };
  if (status === 200) {
    let json;
    try { json = JSON.parse(res.text); } catch (e) { return { ok: false, state: 'error', message: 'unreadable answer', status }; }
    if (!json || json.v !== 1) return { ok: false, state: 'unknown-version', message: '', status };
    try {
      return { ok: true, snap: normalize(json) };
    } catch (e) {
      console.error('[stats] the filing could not be read', e);
      return { ok: false, state: 'error', message: 'unreadable answer', status };
    }
  }
  if (status === 503) {
    let body = {};
    try { body = JSON.parse(res.text || '{}') || {}; } catch (e) { body = {}; }
    const state = body.state === 'gathering' ? 'gathering' : 'not-connected';
    return { ok: false, state, message: String(body.error || ''), status };
  }
  return { ok: false, state: 'error', message: '', status };
}

let used = false;
/** @returns {Promise<Loaded>} */
export async function loadSnapshot() {
  // the inline prefetch is a one-shot: use it once, then fetch normally (a retry must be fresh)
  if (!used && typeof window !== 'undefined' && window.__stStats && typeof window.__stStats.then === 'function') {
    used = true;
    return interpret(await window.__stStats.catch(() => ({ status: 0, text: null })));
  }
  used = true;
  return interpret(await fetchRaw());
}

/** @returns {Promise<Loaded>} */
export async function retry() {
  return interpret(await fetchRaw({ cache: 'reload' }));
}
