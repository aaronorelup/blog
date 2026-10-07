// Mini Loom: a small Loom in the browser.
// Inspired by Loom by janus (@repligate), github.com/socketteer/loom. The ideas are hers;
// this page lets a reader feel the loop: read, choose, go back, branch again.

const $ = (s, el = document) => el.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const narrowMQ = matchMedia('(max-width: 599px)');
const wideMQ = matchMedia('(min-width: 1024px)');
const shortMQ = matchMedia('(max-width: 1023px) and (max-height: 520px)');
const coarseMQ = matchMedia('(pointer: coarse)');
// Small both ways (the post's 16:9 embed on a phone): the "needs more room" card. Same query as .room in loom.css.
const roomMQ = matchMedia('(max-width: 599px) and (max-height: 319px)');
let embedded = true;
try { embedded = window.self !== window.top; } catch (e) {}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const words = (s) => (String(s).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
// "a 6% chance", "an 11% chance", "an 8.5% chance"
const aPct = (t) => (/^(8|11(\D|$)|18(\D|$))/.test(String(t)) ? 'an ' : 'a ') + t;
const fmtBits = (b) => (Math.abs(b - Math.round(b)) < 1e-9 ? String(Math.round(b)) : b.toFixed(2));
const NBSP = String.fromCharCode(160);   // keeps "≤ 32" on one line
const isOneBit = (b) => Math.abs(b - 1) < 1e-9;
const bitsWord = (b) => fmtBits(b) + (isOneBit(b) ? ' bit' : ' bits');
// Said under the first fork, in the "most surprising" tooltip and in the first task: the two
// numbers on a card measure different things.
const ODDS_NOTE = 'Odds: the whole passage, so longer futures always look rarer. Flags and bar: how expected each word was.';
const timesWord = (n) => (n === 2 ? 'twice' : `${n} times`);
const NUM_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
// The card's bar is per word, so the bars of one fork do not add up to anything.
const barTip = (n) => 'How expected a typical word in this future was' + (n > 1 ? ` (not a share of the ${NUM_WORDS[n] || n})` : '');

const KIND = { lighthouse: 'a story', jacquard: 'nonfiction', manual: 'a handbook', advice: 'a forum answer' };
// Said next to every pre-grown tree: the branches are a base model's writing, not checked facts.
const NOTE_ALL = 'Everything after the prompt is the model’s writing: plausible, not checked.';
const NOTE = { jacquard: 'Its dates and names are often wrong, and that is part of the lesson.' };
const TASKS = [
  { key: 'surprise', main: 'Pick the most surprising future, three times running.', sub: 'Follow the card flagged “most surprising”. ' + ODDS_NOTE },
  { key: 'opposite', main: 'Go back to the root and take a different first branch.', sub: 'Two choices deep is enough. Watch the map split.' },
  { key: 'narrowWide', main: 'Find a narrow fork and a wide one.', sub: 'Narrow: the model was surer of each word than usual. Wide: less sure, and the futures scatter. A label appears above the cards.' },
  { key: 'bits', main: 'Compare your bits with the model’s words.', sub: 'Make four choices on one path, then read the meter.' },
];

// ------------------------------------------------------------------ state
const S = {
  entries: [], tree: null, cur: 0, choices: 0, whyOpen: false, hashMode: null,
  visited: new Set(), lastChild: new Map(), sessions: new Map(),
  tokenView: false, mapLarge: false, loadingSeed: null,
  live: { mod: null, det: null, eng: null, state: 'idle', growing: null, loading: null, plan: null, frac: 0 },
  settings: { branches: 4, tokens: 28, temp: 1.0, stop: true },
  tasks: { surprise: false, opposite: false, narrow: false, wide: false, bits: false },
  tasksOpen: true,
};
try { Object.assign(S.tasks, JSON.parse(store.get('mini-loom-tasks') || '{}')); } catch (e) {}
S.tasksOpen = store.get('mini-loom-tasks-open') !== '0';

const el = {};
const node = (id) => S.tree && S.tree.nodes.get(id);

// ------------------------------------------------------------------ tree
function makeTree(data, entry) {
  const nodes = new Map();
  let maxId = 0;
  for (const r of data.nodes || []) {
    const n = {
      id: r.id, parent: r.parent ?? null, text: r.text ?? '', tokens: Array.isArray(r.tokens) && r.tokens.length ? r.tokens : null,
      children: [], depth: 0, src: r.parent == null ? 'prompt' : (r.src === 'you' ? 'you' : 'grown'),
      model: (data.model && data.model.label) || '', logp: null, wrote: 0,
    };
    if (n.tokens) n.logp = n.tokens.reduce((s, t) => s + (+t[1] || 0), 0);
    nodes.set(n.id, n);
    if (typeof n.id === 'number' && n.id > maxId) maxId = n.id;
  }
  let root = null;
  for (const n of nodes.values()) {
    if (n.parent == null) { if (!root) root = n; continue; }
    const p = nodes.get(n.parent);
    if (p) p.children.push(n.id);
  }
  if (!root) throw new Error('This tree has no root node.');
  const q = [root.id];
  while (q.length) { const n = nodes.get(q.shift()); for (const c of n.children) { nodes.get(c).depth = n.depth + 1; q.push(c); } }
  const t = {
    id: entry.id, title: data.title || entry.title || entry.id, kind: KIND[entry.id] || '', model: data.model || entry.model || null,
    sampling: data.sampling || entry.sampling || null, notes: data.notes || '',
    nodes, root: root.id, nextId: maxId + 1, custom: false,
  };
  forkStats(t);
  return t;
}

// Fork width: the geometric-mean token probability across a fork's children.
// High = the model was sure (narrow), low = unsure (wide). Thresholds are this tree's quartiles.
// Only pre-grown branches are measured. Live ones come from a smaller model, at whatever
// temperature the reader set, so their numbers are not comparable with the tree's: a fork with
// only live branches (and every fork of a tree grown from the reader's own prompt) gets no label.
function forkStats(t) {
  const gs = [];
  for (const n of t.nodes.values()) {
    let sum = 0, cnt = 0;
    const grown = t.custom ? [] : n.children.map((c) => t.nodes.get(c)).filter((k) => k && k.tokens && !k.growing && k.src === 'grown');
    for (const k of grown) for (const tk of k.tokens) { sum += +tk[1] || 0; cnt++; }
    n.forkG = grown.length >= 2 && cnt ? Math.exp(sum / cnt) : null;
    if (n.forkG != null) gs.push(n.forkG);
  }
  gs.sort((a, b) => a - b);
  const qt = (p) => gs[Math.min(gs.length - 1, Math.max(0, Math.round(p * (gs.length - 1))))];
  t.q = gs.length >= 8 ? { lo: qt(0.25), hi: qt(0.75) } : null;
}
function forkWidth(n) {
  if (n.forkG == null || !S.tree.q) return null;
  if (n.forkG >= S.tree.q.hi) return 'narrow';
  if (n.forkG <= S.tree.q.lo) return 'wide';
  return 'middling';
}

function pathTo(id) {
  const p = [];
  let n = node(id);
  while (n) { p.unshift(n.id); n = n.parent == null ? null : node(n.parent); }
  return p;
}
function ghostFrom(id) {
  const g = [];
  let c = S.lastChild.get(id);
  while (c != null && node(c) && S.visited.has(c) && g.length < 40) { g.push(c); c = S.lastChild.get(c); }
  return g;
}

// ------------------------------------------------------------------ numbers
function oneIn(logp) {
  const l10 = -logp / Math.LN10;
  if (l10 < Math.log10(1.6)) return { html: `${Math.round(Math.exp(logp) * 100)}% likely`, text: `${Math.round(Math.exp(logp) * 100)} percent likely` };
  if (l10 < 6) {
    const N = Number(Math.pow(10, l10).toPrecision(2));
    const s = N.toLocaleString('en-US');
    return { html: `1 in ${s}`, text: `1 in ${s}` };
  }
  if (l10 < 15) {
    const s = new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'long', maximumSignificantDigits: 2 }).format(Math.pow(10, l10));
    return { html: `1 in ${s}`, text: `1 in ${s}` };
  }
  let e = Math.floor(l10), m = Math.pow(10, l10 - e);
  let ms = m.toFixed(1);
  if (ms === '10.0') { e += 1; ms = '1.0'; }
  return { html: `1 in ${ms} × 10<sup>${e}</sup>`, text: `1 in ${ms} times 10 to the ${e}` };
}
function pct(p) {
  const v = p * 100;
  if (v >= 99.5) return '>99%';
  if (v >= 10) return Math.round(v) + '%';
  if (v >= 1) return v.toFixed(1) + '%';
  if (v >= 0.1) return v.toFixed(1) + '%';
  return '<0.1%';
}
// How expected each future was, word for word: the mean log-probability of its tokens, shown as
// a typical token's chance (the geometric mean). The whole-passage odds ("1 in N") mostly measure
// length, because branches run 12 to 32 tokens; this does not. The "most expected" and "most
// surprising" flags go only to the model that grew the fork (the pre-grown group when live
// branches sit beside it), so one fork never shows two of each, and never to a live branch the
// reader stopped halfway (a two-token stub is not the model's favourite, just short).
// Every card shows this figure ("12% a word") next to its bar, so the flags match a number.
function perToken(k) { return k.tokens && k.tokens.length ? k.logp / k.tokens.length : null; }
function shares(kids) {
  const all = kids.filter((k) => k.logp != null && !k.growing && k.src !== 'you' && k.tokens && k.tokens.length);
  const whole = all.filter((k) => !k.cut);
  const grown = whole.filter((k) => k.src !== 'live');
  const flagged = new Set((grown.length ? grown : whole).map((k) => k.id));
  const g = all.filter((k) => flagged.has(k.id));
  const out = new Map();
  const hi = g.length > 1 ? Math.max(...g.map(perToken)) : null, lo = g.length > 1 ? Math.min(...g.map(perToken)) : null;
  for (const k of all) {
    const m = perToken(k), f = flagged.has(k.id);
    out.set(k.id, { typ: Math.exp(m), of: g.length, max: f && hi != null && m === hi && hi !== lo, min: f && lo != null && m === lo && hi !== lo });
  }
  return out;
}
function bitsOf(path) {
  let bits = 0, choices = 0, modelW = 0, youW = 0;
  const counts = [], steps = [];
  path.forEach((id, i) => {
    const n = node(id);
    if (i === 0) { if (n.src === 'you') youW += n.wrote; return; }
    if (n.src === 'you') { youW += n.wrote; modelW += Math.max(0, words(n.text) - n.wrote); steps.push({ wrote: n.wrote }); return; }
    const sib = node(n.parent).children.length;
    const b = Math.log2(sib);
    bits += b; choices++; counts.push(sib); modelW += words(n.text); steps.push({ bits: b });
  });
  return { bits, choices, counts, modelW, youW, steps };
}
function wordDiff(a, b) {
  const A = String(a).toLowerCase().match(/\S+/g) || [], B = String(b).toLowerCase().match(/\S+/g) || [];
  const dp = Array.from({ length: A.length + 1 }, () => new Uint16Array(B.length + 1));
  for (let i = 1; i <= A.length; i++) for (let j = 1; j <= B.length; j++) dp[i][j] = A[i - 1] === B[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return Math.max(0, words(b) - dp[A.length][B.length]);
}

// ------------------------------------------------------------------ loading
async function loadIndex() {
  try {
    const r = await fetch('data/index.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    const list = (Array.isArray(j) ? j : (j.seeds || j.entries || [])).filter((e) => e && e.id != null);
    if (!list.length) throw new Error('empty index');
    S.entries = list.map((e) => ({ ...e, model: e.model || j.model, sampling: e.sampling || j.sampling }));
    const bt = +((S.entries[0] && S.entries[0].sampling && S.entries[0].sampling.branch_tokens) || 0);
    if (bt >= 8 && bt <= 64) S.settings.tokens = bt;
    return true;
  } catch (e) {
    console.warn('[mini-loom] index:', e && e.message);
    S.entries = [];
    el.seedLabel.textContent = 'No trees';
    el.eyebrow.textContent = 'Mini Loom';
    el.doc.innerHTML = '<p class="err">The trees did not load. Reload the page.</p>';
    el.fork.innerHTML = '';
    return false;
  }
}

async function openSeed(id, opts = {}) {
  saveSession();
  const entry = S.entries.find((e) => e.id === id) || S.entries[0];
  if (!entry) return;
  if (S.sessions.has(entry.id)) { restoreSession(entry.id); afterSeedOpen(opts); return; }
  S.loadingSeed = entry.id;
  el.seedLabel.textContent = entry.title;
  el.eyebrow.textContent = 'Loading…';
  el.grownBy.textContent = entry.bytes ? `Fetching ${Math.round(entry.bytes / 1024)} KB of branches.` : '';
  el.doc.innerHTML = '<div class="skeleton" aria-hidden="true"><i style="width:92%"></i><i style="width:86%"></i><i style="width:64%"></i></div>';
  el.fork.innerHTML = '';
  try {
    const r = await fetch('data/' + (entry.file || entry.id + '.json'));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if (S.loadingSeed !== entry.id) return;
    S.tree = makeTree(data, entry);
    S.cur = S.tree.root; S.visited = new Set([S.tree.root]); S.lastChild = new Map();
    S.loadingSeed = null;
    afterSeedOpen(opts);
  } catch (e) {
    S.loadingSeed = null;
    el.eyebrow.textContent = entry.title;
    el.doc.innerHTML = `<p class="err">This tree did not load (${esc(e.message)}). Try another seed from the menu above.</p>`;
  }
}
function saveSession() {
  if (S.tree) S.sessions.set(S.tree.id, { tree: S.tree, cur: S.cur, visited: S.visited, lastChild: S.lastChild });
}
function restoreSession(id) {
  const s = S.sessions.get(id);
  S.tree = s.tree; S.cur = s.cur; S.visited = s.visited; S.lastChild = s.lastChild;
}
function afterSeedOpen(opts) {
  if (opts.path) {
    let cur = S.tree.root;
    for (const ix of opts.path) { const n = node(cur); const c = n.children[ix]; if (c == null) break; cur = c; }
    S.cur = cur;
  }
  markPath();
  MapView.reset();
  renderAll('open');
  el.scroller.scrollTop = 0;
  if (opts.path && opts.path.length) scrollToCurrent(false);
  writeHash();
}

// ------------------------------------------------------------------ navigation
function markPath() {
  const p = pathTo(S.cur);
  for (let i = 0; i < p.length; i++) { S.visited.add(p[i]); if (i) S.lastChild.set(p[i - 1], p[i]); }
}
function goTo(id, how = 'jump') {
  if (!node(id) || id === S.cur) return;
  const prev = S.cur;
  S.cur = id;
  markPath();
  renderAll(how, prev);
  writeHash();
  checkTasks();
}
function choose(i, cardEl) {
  const n = node(S.cur);
  const id = n.children[i];
  const k = node(id);
  if (!k || k.growing) return;
  const rect = cardEl && !reduced.matches ? cardEl.getBoundingClientRect() : null;
  const hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest('#fork');
  S.choices++;
  goTo(id, 'choose');
  if (hadFocus) { const f = el.fork.querySelector('.card, .edge button'); if (f) f.focus({ preventScroll: true }); }
  const sib = n.children.length;
  announce(`Chose future ${i + 1} of ${sib}. ${bitsWord(bitsOf(pathTo(S.cur)).bits)} of selection so far.`);
  if (rect) fly(rect, id);
}
function toParent() { const n = node(S.cur); if (n && n.parent != null) goTo(n.parent, 'up'); }
function toChild() {
  const n = node(S.cur); if (!n || !n.children.length) return;
  const c = S.lastChild.get(n.id);
  goTo(c != null && n.children.includes(c) ? c : n.children[0], 'down');
}
function toSibling(d) {
  const n = node(S.cur); if (!n || n.parent == null) return;
  const sibs = node(n.parent).children;
  const i = sibs.indexOf(n.id);
  const j = (i + d + sibs.length) % sibs.length;
  if (j !== i && !node(sibs[j]).growing) goTo(sibs[j], 'side');
}
function toRoot() { if (S.tree) goTo(S.tree.root, 'up'); }

// The address always reproduces the view: the seed, the path (up to the first passage grown
// live or written by you, which a reload cannot restore), token view, the large map, and the
// mode when the link carried one.
function writeHash() {
  if (!S.tree || S.tree.custom) return;
  const p = pathTo(S.cur);
  const ix = ['0'];
  for (let i = 1; i < p.length; i++) {
    if (node(p[i]).src === 'live' || node(p[i]).src === 'you') break;
    ix.push(String(node(p[i - 1]).children.indexOf(p[i])));
  }
  let h = `#seed=${encodeURIComponent(S.tree.id)}&path=${ix.join('.')}`;
  if (S.tokenView) h += '&tokens=1';
  if (S.mapLarge) h += '&map=large';
  if (S.hashMode) h += `&mode=${document.documentElement.dataset.mode === 'day' ? 'day' : 'night'}`;
  if (location.hash !== h) try { history.replaceState(null, '', h); } catch (e) {}
  if (el.roomTab) el.roomTab.href = './' + h;   // "Open in its own tab" carries the reader's place
}
function readHash() {
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  const path = (h.get('path') || '').split('.').filter((x) => x !== '').map(Number).filter((x) => Number.isInteger(x) && x >= 0);
  const mode = h.get('mode');
  return { seed: h.get('seed'), path: path.slice(1), tokens: h.get('tokens') === '1', map: h.get('map'), mode: mode === 'day' || mode === 'night' ? mode : null };
}

// ------------------------------------------------------------------ rendering
function renderAll(how, prev) {
  renderHeader();
  renderDoc(how);
  renderFork(how);
  renderMeter();
  renderTasks();
  MapView.relayout(how !== 'open');
  if (how === 'choose' || how === 'up' || how === 'down' || how === 'side' || how === 'jump' || how === 'map') scrollToCurrent(true);
}

function renderHeader() {
  const t = S.tree;
  if (!t) return;
  el.seedLabel.textContent = t.title;
  const n = node(S.cur);
  const depth = n.depth;
  // the title is also on the seed button; short frames hide it here (CSS) to keep this one line
  const rest = [t.kind, depth ? `${depth} choice${depth > 1 ? 's' : ''} deep` : (t.custom ? 'the start' : 'the prompt')].filter(Boolean).join(' · ');
  el.eyebrow.innerHTML = `<span class="eb-title">${esc(t.custom ? 'Your prompt' : t.title)} · </span>${esc(rest)}`;
  let gb = '', note = '';
  if (t.custom) {
    gb = `Written by you, grown live by <b>${esc(S.live.eng ? S.live.eng.label : 'the live model')}</b> in your browser.`;
    note = 'Everything after your prompt is the model’s writing: plausible, not checked.';
  } else {
    const m = t.model || {}, s = t.sampling || {};
    const bits = [];
    if (s.temperature != null) bits.push(`temperature ${(+s.temperature).toFixed(1)}`);
    if (s.top_p != null) bits.push(`top-p ${s.top_p}`);
    if (s.branch_tokens) bits.push(`up to ${s.branch_tokens} tokens per branch${s.stop_at_sentence_end ? ', ending at a sentence break where there is one' : ''}`);
    if (s.branches) bits.push(`${s.branches} branches per fork`);
    const name = esc(m.label || m.id || 'a base model');
    const linked = m.url && /^https:\/\//.test(m.url) ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">${name}</a>` : name;
    gb = `Pre-grown offline by <b>${linked}</b>${m.params ? ` (${esc(m.params)} parameters)` : ''}${bits.length ? ' · ' + bits.join(' · ') : ''}.`;
    note = [NOTE_ALL, NOTE[t.id]].filter(Boolean).join(' ');
  }
  // The model and its settings in short: in the footer at every size, and in place of the line
  // above in the post's 720×405 frame (CSS swaps them there), where the long form is hidden.
  const m = t.model || {}, s = t.sampling || {};
  const set = t.custom ? [] : [
    s.temperature != null ? `temperature ${(+s.temperature).toFixed(1)}` : null,
    s.top_p != null ? `top-p ${s.top_p}` : null,
    s.branch_tokens ? `≤${NBSP}${s.branch_tokens} tokens a branch` : null,
  ].filter(Boolean);
  const label = t.custom ? (S.live.eng ? S.live.eng.label : 'a small model') : (m.label || 'a base model');
  const short = t.custom ? `Grown live by ${label} in your browser. Plausible, not checked.`
    : `${label}${set.length ? ' · ' + set.join(' · ').replace(/ a branch$/, '') : ''}. Plausible, not checked.${NOTE[t.id] ? ' ' + NOTE[t.id] : ''}`;
  el.grownBy.innerHTML = `<span class="gb-model">${gb}</span> <span class="gb-note">${esc(note)}</span><span class="gb-short">${esc(short)}</span>`;
  el.grownBy.querySelector('.gb-note').title = note;
  const plain = document.createElement('div'); plain.innerHTML = gb;
  el.creditModel.innerHTML = esc(t.custom ? `this tree grown live with ${label}` : `trees grown with ${label}${m.params && !label.includes(m.params) ? ` (${m.params})` : ''}`) +
    (set.length ? `<span class="cm-set"> · ${esc(set.join(' · '))}</span>` : '');
  el.creditModel.title = plain.textContent;
  el.grownBy.querySelector('.gb-short').title = plain.textContent + ' ' + note;
  el.rootBtn.disabled = S.cur === t.root;
  const live = S.live.state === 'ready';
  el.editBtn.hidden = !live;
  el.editBtn.textContent = S.cur === t.root ? 'Edit the prompt' : 'Edit this passage';
  el.app.classList.toggle('has-you', [...t.nodes.values()].some((x) => x.src === 'you' && x.parent != null));
}

function tokenSpans(n, focusable) {
  if (!n.tokens) return null;
  const f = document.createDocumentFragment();
  n.tokens.forEach((tk, i) => {
    const s = document.createElement('span');
    s.className = 'tok';
    s.textContent = tk[0];
    const p = Math.exp(+tk[1] || 0);
    s.style.setProperty('--p', Math.pow(Math.min(1, p), 0.6).toFixed(3));
    s.dataset.i = i;
    s.dataset.id = n.id;
    if (focusable) { s.tabIndex = 0; s.setAttribute('aria-label', `${JSON.stringify(tk[0])}, ${pct(p)} likely`); }
    f.appendChild(s);
  });
  return f;
}

function segEl(n, cls, focusTokens) {
  const s = document.createElement('span');
  s.className = 'seg ' + cls;
  s.dataset.id = n.id;
  const toks = S.tokenView && n.tokens && n.src !== 'you' ? tokenSpans(n, focusTokens) : null;
  if (toks) s.appendChild(toks); else s.textContent = n.text;
  if (n.src === 'you' && n.parent != null) { s.classList.add('you'); s.title = 'Written by you'; }
  return s;
}

function renderDoc(how) {
  if (!S.tree) return;
  const path = pathTo(S.cur);
  const ghost = ghostFrom(S.cur);
  const f = document.createDocumentFragment();
  path.forEach((id, i) => {
    const n = node(id);
    const cls = (i === 0 ? 'prompt' : (i % 2 ? 'odd' : 'even')) + (id === S.cur ? ' cur' : '') + (id === S.cur && how === 'choose' ? ' arrive' : '');
    const s = segEl(n, cls, id === S.cur);
    if (i === 0 && n.src !== 'you') s.title = 'The prompt';
    f.appendChild(s);
  });
  const caret = document.createElement('span');
  caret.className = 'caret'; caret.setAttribute('aria-hidden', 'true');
  f.appendChild(caret);
  for (const id of ghost) {
    const s = segEl(node(id), 'ghost', false);
    s.title = 'Where you were. Press → to walk back down.';
    f.appendChild(s);
  }
  el.doc.replaceChildren(f);
  el.doc.classList.toggle('tokens', S.tokenView);
  el.tokLegend.hidden = !S.tokenView;
}

function cardEl(k, i, sh, n) {
  const b = document.createElement('button');
  b.className = 'card' + (k.growing ? ' growing' : '');
  b.dataset.i = i; b.dataset.id = k.id;
  const st = sh.get(k.id);
  const odds = k.logp != null && !k.growing ? oneIn(k.logp) : null;
  const seen = S.visited.has(k.id);
  const back = S.lastChild.get(n.id) === k.id;
  const flags = [];
  if (k.src === 'you') flags.push('<span class="flag you">written by you</span>');
  if (k.src === 'live') flags.push(`<span class="flag live" title="Grown live by ${esc(k.model)}">live</span>`);
  if (k.cut) flags.push('<span class="flag cut" title="You stopped this branch before it finished, so it is shorter than the model would have made it. It is left out of the most expected and most surprising flags.">stopped</span>');
  if (k.times > 1) flags.push(`<span class="flag" title="This exact text came up ${timesWord(k.times)} at this fork. Identical futures are one choice, so the copies are shown as one card.">grown ${timesWord(k.times)}</span>`);
  if (back) flags.push('<span class="flag" title="The branch you came from: press →">→</span>');
  flags.push(`<span class="seen${seen ? ' yes' : ''}" title="${seen ? 'You have read this branch' : 'Not read yet'}"></span>`);
  // The foot carries the per-word measure: its bar, its figure, and the flag that ranks it.
  let foot = '', flagTxt = '';
  if (st) {
    const w = pct(st.typ);
    const typTxt = `Per word: a typical token (a word or part of one) in this future had about ${aPct(w)} chance. ${ODDS_NOTE}`;
    let flag = '';
    if (st.max) { flag = `<span class="flag likely" title="${esc('Of these futures, the one the model expected most, word for word. ' + ODDS_NOTE)}">most expected</span>`; flagTxt = ', the most expected per word'; }
    else if (st.min) { flag = `<span class="flag unlikely" title="${esc('Of these futures, the one the model expected least, word for word. ' + ODDS_NOTE)}">most surprising</span>`; flagTxt = ', the most surprising per word'; }
    const tip = esc(barTip(n.children.length));
    foot = `<span class="card-foot" title="${tip}"><span class="bar-track" aria-hidden="true" title="${tip}"><span class="bar-fill" style="width:${Math.max(2, st.typ * 100).toFixed(1)}%"></span></span>` +
      `<span class="per-word" title="${esc(typTxt)}">${esc(w)} a word</span>${flag}</span>`;
    flagTxt = `, about ${w.replace('<', 'under ').replace('>', 'over ')} a word` + flagTxt;
  }
  b.innerHTML = `<span class="card-meta"><span class="knum" aria-hidden="true">${i < 9 ? i + 1 : ''}</span>` +
    (odds ? `<span class="odds" title="The whole passage, every token multiplied together: ${esc(odds.text)}. Longer passages always look rarer.">${odds.html}</span>` : (k.growing ? '<span class="odds">growing…</span>' : '')) +
    `<span class="card-flags">${flags.join('')}</span></span><span class="card-text"></span>${foot}`;
  const t = b.querySelector('.card-text');
  const toks = S.tokenView && k.tokens && !k.growing ? tokenSpans(k, false) : null;
  if (toks) { trimLead(toks); t.appendChild(toks); } else t.textContent = k.text.replace(/^\s+/, '');
  b.setAttribute('aria-label', `Future ${i + 1} of ${n.children.length}${odds ? ', ' + odds.text : ''}${flagTxt}${k.src === 'live' ? ', grown live' : ''}${k.cut ? ', stopped early' : ''}${k.times > 1 ? `, grown ${timesWord(k.times)}` : ''}${seen ? ', read' : ''}${k.src === 'you' ? ', written by you' : ''}: ${k.text}`);
  if (k.growing) b.setAttribute('aria-disabled', 'true');
  return b;
}

function renderFork(how) {
  if (!S.tree) return;
  const n = node(S.cur);
  const kids = n.children.map(node).filter(Boolean);
  const live = S.live.state === 'ready';
  const growingHere = S.live.growing && S.live.growing.tree === S.tree && S.live.growing.parent === n.id;
  const f = document.createDocumentFragment();
  if (!kids.length) {
    const box = document.createElement('div');
    box.className = 'edge';
    if (live) {
      box.innerHTML = `<div><strong>Nothing grown here yet.</strong> The live model can continue this text.</div>
        <div class="row"><button class="pill primary" data-act="grow">Grow ${S.settings.branches} futures · G</button>${n.parent != null ? '<button class="pill" data-act="up">Back to the fork above · ←</button>' : ''}</div>`;
    } else {
      box.innerHTML = `<div><strong>The pre-grown tree ends here.</strong> The model could keep going; this branch was not grown further. Go back and choose another future, or grow new ones with a small model in your browser.</div>
        <div class="row">${n.parent != null ? '<button class="pill" data-act="up">Back to the fork above · ←</button>' : ''}<button class="pill" data-act="live">Load a live model…</button></div>`;
    }
    f.appendChild(box);
  } else {
    const head = document.createElement('div');
    head.className = 'fork-head';
    const w = forkWidth(n);
    const word = kids.length === 1 ? 'future' : 'futures';
    let chip = '', why = '';
    if (w === 'narrow' || w === 'wide') {
      const g = Math.round(n.forkG * 100);
      const tip = w === 'narrow'
        ? `Narrow: the model was surer of the words here than at most forks in this tree (the surest quarter). A typical token in these futures had about ${aPct(g + '%')} chance.`
        : `Wide: the model was less sure here than at most forks in this tree (the least sure quarter). A typical token in these futures had about ${aPct(g + '%')} chance.`;
      chip = `<button class="width-chip ${w}" data-act="why" aria-expanded="${S.whyOpen}" aria-controls="forkWhy" title="What does ${w} mean?">${w} fork</button>`;
      why = `<p class="fork-note fork-why" id="forkWhy" ${S.whyOpen ? '' : 'hidden'}>${esc(tip)}</p>`;
    }
    const tap = coarseMQ.matches && !wideMQ.matches;
    const hint = growingHere
      ? (S.live.growing.stopping ? 'stopping…' : `growing ${Math.min(S.live.growing.n, S.live.growing.done + 1)} of ${S.live.growing.n}…<button class="pill tiny" data-act="stop">Stop</button>`)
      : tap ? 'tap a future' : (kids.length > 1 ? `press 1–${Math.min(9, kids.length)} or click` : 'press 1 or click');
    head.innerHTML = `<h2 class="fork-title">${kids.length} ${word}</h2>${chip}<span class="fork-hint">${hint}</span>`;
    f.appendChild(head);
    const notes = document.createElement('div');
    notes.className = 'fork-notes';
    notes.innerHTML = why;
    const hasLive = kids.some((k) => k.src === 'live'), hasGrown = kids.some((k) => k.src === 'grown');
    if (hasLive && hasGrown) {
      notes.insertAdjacentHTML('beforeend', '<p class="fork-note">Live futures come from a smaller model; their odds aren’t comparable with the pre-grown ones.</p>');
    } else if (!S.choices && kids.some((k) => k.tokens)) {
      notes.insertAdjacentHTML('beforeend', `<p class="fork-note">${esc(ODDS_NOTE)}</p>`);
    }
    if (notes.childNodes.length) f.appendChild(notes);
    const grid = document.createElement('div');
    grid.className = 'cards';
    const sh = shares(kids);
    kids.forEach((k, i) => grid.appendChild(cardEl(k, i, sh, n)));
    f.appendChild(grid);
    if (live) {
      const strip = document.createElement('div');
      strip.className = 'live-strip';
      strip.innerHTML = `<button class="pill small" data-act="grow" ${S.live.growing ? 'disabled' : ''}>Grow ${S.settings.branches} more · G</button>
        <span>${S.settings.tokens} tokens · temperature ${S.settings.temp.toFixed(1)} · ${esc(S.live.eng.label)}</span>
        <button class="link" data-act="settings">settings</button>`;
      f.appendChild(strip);
    }
  }
  el.fork.replaceChildren(f);
  el.keyN.textContent = Math.max(1, Math.min(9, kids.length || 4));
  markClamped();
}
// In short frames the cards clamp their text; a clamped card carries its full text as a tooltip
// (its aria-label always has it, and choosing it puts the whole passage in the document).
function markClamped() {
  for (const c of el.fork.querySelectorAll('.card')) {
    const t = c.querySelector('.card-text');
    const k = node(+c.dataset.id);
    if (t && k && !k.growing && t.scrollHeight > t.clientHeight + 2) { c.title = k.text.replace(/^\s+/, ''); c.classList.add('clamped'); }
    else { c.removeAttribute('title'); c.classList.remove('clamped'); }
  }
}

function updateGrowingCard(k) {
  const b = el.fork.querySelector(`.card[data-id="${k.id}"] .card-text`);
  if (b) b.textContent = k.text.replace(/^\s+/, '');
}
// cards drop a branch's leading whitespace (the document keeps it)
function trimLead(frag) {
  for (const s of frag.childNodes) {
    const t = s.textContent.replace(/^\s+/, '');
    s.textContent = t;
    if (t) break;
  }
}

function renderMeter() {
  if (!S.tree) return;
  const r = bitsOf(pathTo(S.cur));
  el.bitsNum.textContent = fmtBits(r.bits);
  const uniq = [...new Set(r.counts)];
  const among = uniq.length === 1 ? `among ${uniq[0]}` : uniq.length ? `among ${Math.min(...uniq)} to ${Math.max(...uniq)}` : '';
  if (!r.choices) el.bits1.textContent = 'No choices yet: 0 bits of selection.';
  else el.bits1.textContent = `You chose ${r.choices === 1 ? 'once' : r.choices + ' times'} ${among} → ${bitsWord(r.bits)} of selection.`;
  el.bitsUnit.textContent = isOneBit(r.bits) ? 'bit' : 'bits';
  el.bits2.textContent = `The model wrote ${r.modelW.toLocaleString('en-US')} word${r.modelW === 1 ? '' : 's'}. You wrote ${r.youW.toLocaleString('en-US')}.`;
  const f = document.createDocumentFragment();
  let squares = 0;
  for (const s of r.steps) {
    const g = document.createElement('span');
    g.className = 'choice';
    if (s.wrote != null) { const w = document.createElement('i'); w.className = 'wrote'; w.title = `You wrote ${s.wrote} word${s.wrote === 1 ? '' : 's'}`; g.appendChild(w); }
    else {
      const full = Math.floor(s.bits + 1e-9), part = s.bits - full;
      for (let i = 0; i < full && squares < 160; i++, squares++) g.appendChild(document.createElement('i'));
      if (part > 0.01) { const p = document.createElement('i'); p.className = 'part'; p.style.width = (part * 9).toFixed(1) + 'px'; g.appendChild(p); }
    }
    f.appendChild(g);
  }
  el.bitStrip.replaceChildren(f);
  el.meter.setAttribute('aria-label', `Bits of selection: ${el.bits1.textContent} ${el.bits2.textContent}`);
}

// ------------------------------------------------------------------ tasks
function taskDone(k) { return k === 'narrowWide' ? S.tasks.narrow && S.tasks.wide : !!S.tasks[k]; }
function checkTasks() {
  if (!S.tree) return;
  const before = TASKS.map((t) => taskDone(t.key));
  const path = pathTo(S.cur);
  // 1. three least-likely picks in a row along the current path
  let run = 0;
  for (let i = 1; i < path.length; i++) {
    const n = node(path[i]);
    const sibs = node(n.parent).children.map(node).filter((k) => k.logp != null && !k.growing);
    const st = sibs.length >= 2 ? shares(sibs).get(n.id) : null;
    run = st && st.min ? run + 1 : 0;
    if (run >= 3) S.tasks.surprise = true;
  }
  // 2. two first branches each explored at least two choices deep
  if (!S.tree.custom) {
    const firsts = new Set();
    for (const id of S.visited) { const n = node(id); if (n && n.depth >= 2) { const p = pathTo(id); firsts.add(p[1]); } }
    if (firsts.size >= 2) S.tasks.opposite = true;
  }
  // 3. narrow and wide forks seen
  const w = forkWidth(node(S.cur));
  if (w === 'narrow') S.tasks.narrow = true;
  if (w === 'wide') S.tasks.wide = true;
  // 4. four choices on one path (every branch of the pre-grown trees is at least four deep)
  if (bitsOf(path).choices >= 4) S.tasks.bits = true;
  store.set('mini-loom-tasks', JSON.stringify(S.tasks));
  const just = TASKS.map((t, i) => !before[i] && taskDone(t.key));
  if (just.some(Boolean)) {
    renderTasks(just);
    const t = TASKS[just.indexOf(true)];
    announce('Done: ' + t.main);
  } else renderTasks();
}
function tasksHTML(just = []) {
  return '<ul class="task-list">' + TASKS.map((t, i) => `<li class="task${taskDone(t.key) ? ' done' : ''}${just[i] ? ' just' : ''}"><span class="box" aria-hidden="true"></span><span><span class="t-main">${esc(t.main)}<span class="sr-only">${taskDone(t.key) ? ' (done)' : ''}</span></span><span class="t-sub">${esc(t.sub)}</span></span></li>`).join('') +
    '</ul>' + (TASKS.some((t) => taskDone(t.key)) ? '<div class="tasks-foot"><button class="link" data-act="reset-tasks">start the list over</button></div>' : '');
}
function renderTasks(just) {
  const done = TASKS.filter((t) => taskDone(t.key)).length;
  el.taskCount.textContent = `${done}/4`;
  el.tasksSide.innerHTML = `<button class="tasks-head" aria-expanded="${S.tasksOpen}" aria-controls="taskListSide"><span class="t-title">Try this</span><span class="t-count">${done} of 4</span><span class="chev" aria-hidden="true">▾</span></button>` +
    `<div id="taskListSide" ${S.tasksOpen ? '' : 'hidden'}>${tasksHTML(just)}</div>`;
  el.tasksDlgBody.innerHTML = `<p class="note">Four things to try, from the video. Each one ticks itself off when you have done it.</p>${tasksHTML(just)}`;
  el.taskBtn.setAttribute('aria-expanded', wideMQ.matches ? String(S.tasksOpen) : String(el.taskDialog.open));
}

// ------------------------------------------------------------------ motion
// Where the reader should scroll after a move: the current passage's start about 20% down, as
// long as the futures under it are all in view too. When both don't fit, the futures win and the
// passage shows as much of its end as fits above them (in a 720×405 embed that is the usual case).
function scrollTarget(seg) {
  const sc = el.scroller, H = sc.clientHeight, base = sc.getBoundingClientRect().top - sc.scrollTop;
  const segTop = seg.getBoundingClientRect().top - base;
  let target = segTop - Math.max(36, H * 0.2);
  const head = el.fork.querySelector('.fork-head, .edge');
  if (head) {
    const forkTop = head.getBoundingClientRect().top - base;
    const forkBottom = el.fork.getBoundingClientRect().bottom - base;
    if (forkBottom - target > H) {
      const showAll = forkBottom + 8 - H;
      if (showAll <= segTop - 8 || shortMQ.matches || forkBottom - forkTop + 20 <= H * 0.85) target = Math.min(showAll, forkTop - 4);
    }
  }
  return Math.max(0, Math.min(sc.scrollHeight - H, target));
}
function scrollToCurrent(smooth) {
  const seg = el.doc.querySelector('.seg.cur');
  if (!seg) return;
  const sc = el.scroller;
  const target = scrollTarget(seg);
  if (Math.abs(target - sc.scrollTop) < 2) return;
  sc.scrollTo({ top: target, behavior: smooth && !reduced.matches ? 'smooth' : 'auto' });
}
function fly(rect, id) {
  const seg = el.doc.querySelector(`.seg[data-id="${id}"]`);
  if (!seg) return;
  const sc = el.scroller;
  const target = scrollTarget(seg);
  const first = seg.getClientRects()[0];
  if (!first) return;
  const dy = first.top - (target - sc.scrollTop) - rect.top;
  const dx = first.left - rect.left;
  const fl = document.createElement('div');
  fl.className = 'flyer';
  fl.textContent = node(id).text;
  Object.assign(fl.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: Math.min(rect.height, 160) + 'px' });
  document.body.appendChild(fl);
  const a = fl.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 0.95 },
    { transform: `translate(${dx}px, ${dy}px) scale(.97)`, opacity: 0 },
  ], { duration: 360, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
  a.onfinish = a.oncancel = () => fl.remove();
}
function announce(t) { el.announce.textContent = ''; setTimeout(() => { el.announce.textContent = t; }, 30); }

// ------------------------------------------------------------------ token popover
let popFor = null, popPinned = false;
function showPop(span, pin = false) {
  const n = node(+span.dataset.id) || node(span.dataset.id);
  if (!n || !n.tokens) return;
  const tk = n.tokens[+span.dataset.i];
  if (!tk) return;
  if (popFor && popFor !== span) popFor.classList.remove('on');
  popFor = span; popPinned = pin;
  span.classList.add('on');
  const show = (s) => `'${String(s).replace(/\n/g, '↵').replace(/\t/g, '⇥')}'`;
  const p = Math.exp(+tk[1] || 0);
  const alts = (tk[2] || []).filter((a) => a[0] !== tk[0]);
  const inTop = (tk[2] || []).some((a) => a[0] === tk[0]);
  const maxp = Math.max(p, ...alts.map((a) => Math.exp(a[1])));
  let h = `<div class="pop-chosen"><span class="ptok">${esc(show(tk[0]))}</span><b>${pct(p)}</b><span>chosen</span></div>`;
  if (alts.length) {
    h += '<div>The model also considered:</div><div class="pop-alts">';
    for (const a of alts.slice(0, 5)) {
      const q = Math.exp(a[1]);
      h += `<span class="ptok">${esc(show(a[0]))}</span><span class="bar-track"><span class="bar-fill" style="width:${Math.max(2, (q / maxp) * 100).toFixed(1)}%"></span></span><span class="pct">${pct(q)}</span>`;
    }
    h += '</div>';
  }
  if (!inTop && (tk[2] || []).length) {
    // A character written as several byte tokens is stored as one entry (log-probs summed); its
    // alternatives come from the first piece, so they are not like-for-like with what was drawn.
    const split = (tk[2] || []).some((a) => String(a[0]).includes('\uFFFD')) || /[^\u0000-\u024F\u2013\u2014\u2018-\u201F\u2026]/u.test(tk[0]);
    let note = p < 0.01 ? 'It wasn’t among the top four here: sampling took a long shot.' : 'It wasn’t among the top four here; sampling can pick from the whole spread.';
    if (split) note += ' A character like this can be written in several pieces; then these alternatives are for its first piece.';
    h += `<div class="pop-note">${note}</div>`;
  }
  el.pop.innerHTML = h;
  el.pop.hidden = false;
  placePop();
}
function placePop() {
  if (!popFor || el.pop.hidden) return;
  const r = popFor.getBoundingClientRect(), sr = el.scroller.getBoundingClientRect();
  if (r.bottom < sr.top || r.top > sr.bottom) { hidePop(); return; }
  const pw = el.pop.offsetWidth, ph = el.pop.offsetHeight;
  let x = Math.min(window.innerWidth - pw - 12, Math.max(12, r.left + r.width / 2 - pw / 2));
  let y = r.bottom + 8;
  if (y + ph > window.innerHeight - 8) y = Math.max(8, r.top - ph - 8);
  el.pop.style.left = x + 'px'; el.pop.style.top = y + 'px';
}
function hidePop() {
  if (popFor) popFor.classList.remove('on');
  popFor = null; popPinned = false; el.pop.hidden = true;
}

// ------------------------------------------------------------------ the tree map
const MapView = {
  pos: new Map(), from: new Map(), to: new Map(), t0: 0, animating: false,
  cam: { kx: 40, ky: 12, tx: 16, ty: 16 }, camFrom: null, camTo: null,
  manual: false, W: 0, H: 0, dpr: 1, colors: {}, drawn: [], maxX: 1, span: 1,
  hover: null, drag: null, pointers: new Map(),

  init() {
    this.c = el.map; this.ctx = this.c.getContext('2d');
    new ResizeObserver(() => this.resize()).observe(el.mapStage);
    this.readColors();
    const c = this.c;
    c.addEventListener('pointerdown', (e) => this.down(e));
    c.addEventListener('pointermove', (e) => this.move(e));
    c.addEventListener('pointerup', (e) => this.up(e));
    c.addEventListener('pointercancel', (e) => this.up(e, true));
    c.addEventListener('pointerleave', () => { if (!this.drag) this.setHover(null); });
    // Inside the post (an iframe), a plain wheel scrolls the post: zooming needs Ctrl or ⌘ (a
    // trackpad pinch sends Ctrl too). In its own tab, or full screen, the wheel zooms.
    c.addEventListener('wheel', (e) => {
      if (embedded && !(e.ctrlKey || e.metaKey) && !this.fullish()) { this.wheelTip(); return; }
      e.preventDefault();
      const r = c.getBoundingClientRect();
      this.zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0016)));
    }, { passive: false });
    c.addEventListener('dblclick', (e) => { if (!this.hit(e)) this.fit(); });
    c.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') { this.zoomAt(this.W / 2, this.H / 2, 1.25); e.preventDefault(); e.stopPropagation(); }
      else if (e.key === '-' || e.key === '_') { this.zoomAt(this.W / 2, this.H / 2, 0.8); e.preventDefault(); e.stopPropagation(); }
      else if (e.key === '0') { this.fit(); e.preventDefault(); e.stopPropagation(); }
    });
  },
  fullish() { return window.innerWidth >= screen.width - 4 && window.innerHeight >= screen.height - 4; },
  wheelTip() {
    if (this.tipShown) return;
    this.tipShown = true;
    const t = document.createElement('div');
    t.className = 'map-hint';
    t.textContent = /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘ + scroll zooms the map' : 'Ctrl + scroll zooms the map';
    el.mapStage.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 1800);
  },
  readColors() {
    const cs = getComputedStyle(document.documentElement);
    const g = (k) => cs.getPropertyValue(k).trim();
    this.colors = { page: g('--pc-page'), line: g('--pc-line'), line2: g('--pc-line2'), head: g('--pc-head'), strong: g('--pc-strong'),
      body: g('--pc-body'), soft: g('--pc-soft'), quiet: g('--pc-quiet'), accent: g('--pc-accent'), day: document.documentElement.dataset.mode === 'day' };
  },
  resize() {
    const r = el.mapStage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = r.width; this.H = r.height;
    this.c.width = Math.round(r.width * this.dpr); this.c.height = Math.round(r.height * this.dpr);
    if (!this.manual) { this.cam = this.autoCam(); this.camTo = null; }
    this.draw();
  },
  reset() { this.manual = false; this.pos = new Map(); this.camTo = null; },

  layout() {
    const t = S.tree, P = new Map(), fanSet = new Set(), fans = new Map();
    const leaves = new Map();
    const leafCount = (id) => {
      if (leaves.has(id)) return leaves.get(id);
      const n = node(id); const v = n.children.length ? n.children.reduce((s, c) => s + leafCount(c), 0) : 1;
      leaves.set(id, v); return v;
    };
    let maxX = 1;
    const fan = (id, y0, s) => {
      const L = leafCount(id); const step = s / L; let i = 0;
      const group = []; fans.set(id, { ids: group, leaves: L, span: s });
      const rec = (cid) => {
        const m = node(cid); fanSet.add(cid); group.push(cid); maxX = Math.max(maxX, m.depth);
        if (!m.children.length) { P.set(cid, { x: m.depth, y: y0 + (i + 0.5) * step }); i++; return; }
        m.children.forEach(rec);
        P.set(cid, { x: m.depth, y: (P.get(m.children[0]).y + P.get(m.children[m.children.length - 1]).y) / 2 });
      };
      node(id).children.forEach(rec);
    };
    const lay = (id, y0) => {
      const n = node(id); maxX = Math.max(maxX, n.depth);
      if (!n.children.length) { P.set(id, { x: n.depth, y: y0 + 0.5 }); return 1; }
      if (S.visited.has(id)) {
        let y = y0;
        for (const c of n.children) y += lay(c, y);
        P.set(id, { x: n.depth, y: (P.get(n.children[0]).y + P.get(n.children[n.children.length - 1]).y) / 2 });
        return y - y0;
      }
      const s = 1 + 0.45 * Math.log2(leafCount(id));
      P.set(id, { x: n.depth, y: y0 + s / 2 });
      fan(id, y0, s);
      return s;
    };
    this.span = lay(t.root, 0);
    this.maxX = Math.max(1, maxX);
    this.fanSet = fanSet; this.fans = fans;
    return P;
  },
  pad() { return { l: 16, r: 18, t: 12, b: 14 }; },
  autoCam() {
    const p = this.pad();
    const W = Math.max(40, this.W - p.l - p.r), H = Math.max(40, this.H - p.t - p.b);
    const kx = Math.min(130, W / this.maxX);
    let ky = Math.min(30, H / this.span);
    let ty;
    if (ky >= 8) ty = p.t + (H - this.span * ky) / 2;
    else {
      // Following: the whole gold path from the prompt to here, plus the children, in frame.
      // Zoom out as far as 5 px a row to keep it; if even that is too tight, show the whole tree.
      const n = node(S.cur); const P = this.to.size ? this.to : this.pos;
      const ys = [n.id, ...n.children, ...pathTo(S.cur)].map((id) => P.get(id)?.y).filter((y) => y != null);
      const lo = Math.min(...ys), hi = Math.max(...ys);
      ky = Math.min(11, H / (hi - lo + 1.2));
      if (ky < 5) {
        ky = H / this.span;
        ty = p.t + (H - this.span * ky) / 2;
      } else {
        ty = p.t + H / 2 - ((lo + hi) / 2) * ky;
        ty = Math.min(p.t, Math.max(this.H - p.b - this.span * ky, ty));
      }
    }
    return { kx, ky, tx: p.l + Math.max(0, (W - this.maxX * kx) / 2), ty };
  },
  relayout(animate) {
    if (!S.tree) return;
    const next = this.layout();
    const cur = this.currentPositions();
    this.from = new Map();
    for (const [id, v] of next) {
      let f = cur.get(id);
      if (!f) { const n = node(id); f = (n.parent != null && cur.get(n.parent)) || v; }
      this.from.set(id, f);
    }
    this.to = next;
    const camNext = this.manual ? this.keepVisible() : this.autoCam();
    this.camFrom = { ...this.cam }; this.camTo = camNext;
    if (!animate || reduced.matches || !this.pos.size) { this.pos = next; this.cam = camNext; this.camTo = null; this.animating = false; this.draw(); }
    else { this.t0 = performance.now(); if (!this.animating) { this.animating = true; requestAnimationFrame(() => this.tick()); } }
    this.updateStats();
  },
  keepVisible() {
    const c = { ...this.cam }, v = this.to.get(S.cur);
    if (!v) return c;
    const x = v.x * c.kx + c.tx, y = v.y * c.ky + c.ty, m = 30;
    if (x < m || x > this.W - m) c.tx += this.W / 2 - x;
    if (y < m || y > this.H - m) c.ty += this.H / 2 - y;
    return c;
  },
  currentPositions() {
    if (!this.animating) return this.pos;
    const k = this.ease(Math.min(1, (performance.now() - this.t0) / 320));
    const m = new Map();
    for (const [id, b] of this.to) { const a = this.from.get(id) || b; m.set(id, { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }); }
    return m;
  },
  ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  tick() {
    const k0 = Math.min(1, (performance.now() - this.t0) / 320), k = this.ease(k0);
    this.pos = this.currentPositions();
    if (this.camTo) { const a = this.camFrom, b = this.camTo; this.cam = { kx: a.kx + (b.kx - a.kx) * k, ky: a.ky + (b.ky - a.ky) * k, tx: a.tx + (b.tx - a.tx) * k, ty: a.ty + (b.ty - a.ty) * k }; }
    this.draw();
    if (k0 < 1) requestAnimationFrame(() => this.tick());
    else { this.animating = false; this.pos = this.to; if (this.camTo) { this.cam = this.camTo; this.camTo = null; } this.draw(); }
  },
  sx(v) { return v.x * this.cam.kx + this.cam.tx; },
  sy(v) { return v.y * this.cam.ky + this.cam.ty; },

  draw() {
    const ctx = this.ctx, C = this.colors;
    if (!ctx || !S.tree || !this.W) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    const P = this.pos;
    if (!P.size) return;
    const kx = this.cam.kx;
    // depth guides
    ctx.lineWidth = 1; ctx.strokeStyle = C.line; ctx.globalAlpha = 0.6;
    for (let d = 0; d <= this.maxX; d++) { const x = Math.round(d * kx + this.cam.tx) + 0.5; if (x < -2 || x > this.W + 2) continue; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.H); ctx.stroke(); }
    ctx.globalAlpha = 1;
    const path = pathTo(S.cur), onPath = new Set(path);
    const curve = (a, b) => {
      const x1 = this.sx(a), y1 = this.sy(a), x2 = this.sx(b), y2 = this.sy(b), mx = (x1 + x2) / 2;
      ctx.moveTo(x1, y1); ctx.bezierCurveTo(mx, y1, mx, y2, x2, y2);
    };
    const inView = (a, b) => {
      const y1 = this.sy(a), y2 = this.sy(b);
      return !((y1 < -20 && y2 < -20) || (y1 > this.H + 20 && y2 > this.H + 20));
    };
    // fan lines (the unexplored depths), fainter where they crowd together, then resting edges
    ctx.lineWidth = 1; ctx.strokeStyle = C.line2;
    const base = C.day ? 0.55 : 0.5;
    for (const f of (this.fans || new Map()).values()) {
      const perPx = f.leaves / Math.max(1, f.span * this.cam.ky);
      ctx.globalAlpha = base / Math.max(1, perPx / 1.2);
      ctx.beginPath();
      for (const id of f.ids) { const v = P.get(id), a = P.get(node(id).parent); if (v && a && inView(a, v)) curve(a, v); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineWidth = 1.4; ctx.strokeStyle = C.line2;
    ctx.beginPath();
    for (const [id, v] of P) {
      if (this.fanSet.has(id) || onPath.has(id)) continue;
      const n = node(id); if (n.parent == null) continue;
      const a = P.get(n.parent); if (a && inView(a, v)) curve(a, v);
    }
    ctx.stroke();
    // the path, gold with a lamp glow
    ctx.save();
    ctx.strokeStyle = C.head; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.shadowColor = C.head; ctx.shadowBlur = C.day ? 0 : 10;
    ctx.beginPath();
    for (let i = 1; i < path.length; i++) { const a = P.get(path[i - 1]), b = P.get(path[i]); if (a && b) curve(a, b); }
    ctx.stroke();
    ctx.restore();
    // ghost continuation
    const ghost = ghostFrom(S.cur);
    if (ghost.length) {
      ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.head; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.6; ctx.beginPath();
      let prev = S.cur;
      for (const g of ghost) { const a = P.get(prev), b = P.get(g); if (a && b) curve(a, b); prev = g; }
      ctx.stroke(); ctx.restore();
    }
    // nodes
    this.drawn = [];
    const r = Math.max(2.6, Math.min(4.2, this.cam.ky * 0.32));
    for (const [id, v] of P) {
      const x = this.sx(v), y = this.sy(v);
      if (this.fanSet.has(id)) { this.drawn.push({ id, x, y, fan: true }); continue; }
      if (x < -10 || x > this.W + 10 || y < -10 || y > this.H + 10) { this.drawn.push({ id, x, y }); continue; }
      const n = node(id), seen = S.visited.has(id), you = n.src === 'you' && n.parent != null;
      const isCur = id === S.cur, isPath = onPath.has(id);
      if (isCur) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 16);
        g.addColorStop(0, C.day ? 'rgba(190,122,16,.35)' : 'rgba(240,192,106,.45)'); g.addColorStop(1, 'rgba(240,192,106,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
      }
      const rr = isCur ? r + 2.4 : isPath ? r + 0.6 : r;
      ctx.beginPath();
      if (you) ctx.rect(x - rr, y - rr, rr * 2, rr * 2); else ctx.arc(x, y, rr, 0, Math.PI * 2);
      if (isPath) { ctx.fillStyle = you ? C.accent : C.head; ctx.fill(); }
      else if (seen) { ctx.fillStyle = you ? C.accent : C.body; ctx.fill(); }
      else { ctx.fillStyle = C.page; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = you ? C.accent : C.soft; ctx.stroke(); }
      if (this.hover === id) { ctx.lineWidth = 2; ctx.strokeStyle = C.head; ctx.beginPath(); ctx.arc(x, y, rr + 3.5, 0, Math.PI * 2); ctx.stroke(); }
      this.drawn.push({ id, x, y });
    }
    if (this.hover != null && this.fanSet.has(this.hover)) {
      const v = P.get(this.hover); if (v) { ctx.lineWidth = 2; ctx.strokeStyle = C.head; ctx.beginPath(); ctx.arc(this.sx(v), this.sy(v), 4, 0, Math.PI * 2); ctx.stroke(); }
    }
  },
  updateStats() {
    const t = S.tree; if (!t) return;
    const total = t.nodes.size, read = [...S.visited].filter((id) => t.nodes.has(id)).length;
    el.mapStats.textContent = `${read} of ${total.toLocaleString('en-US')} read`;
    el.mapStats.title = `${total.toLocaleString('en-US')} passages in this tree; you have read ${read}.`;
    el.map.setAttribute('aria-label', `Tree map: ${total} passages, ${read} read. You are ${node(S.cur).depth} choices deep. Use the arrow keys to move through the tree; plus and minus zoom the map.`);
  },
  hit(e) {
    const r = this.c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null, bd = 13 * 13;
    for (const d of this.drawn) { if (d.fan) continue; const q = (d.x - x) ** 2 + (d.y - y) ** 2; if (q < bd) { bd = q; best = d.id; } }
    if (best != null) return best;
    bd = 6 * 6;
    for (const d of this.drawn) { if (!d.fan) continue; const q = (d.x - x) ** 2 + (d.y - y) ** 2; if (q < bd) { bd = q; best = d.id; } }
    return best;
  },
  setHover(id, e) {
    if (this.hover !== id) { this.hover = id; this.draw(); }
    this.c.classList.toggle('over', id != null);
    if (id == null) { el.mapTip.hidden = true; return; }
    const n = node(id);
    const txt = n.text.replace(/\s+/g, ' ').trim();
    const snip = txt.length > 110 ? txt.slice(0, 107).replace(/\s\S*$/, '') + '…' : txt;
    const meta = n.parent == null ? 'the prompt' : [
      `${n.depth} choice${n.depth > 1 ? 's' : ''} deep`, S.visited.has(id) ? 'read' : 'not read yet',
      n.src === 'you' ? 'written by you' : n.src === 'live' ? `grown live by ${n.model}` : null,
      n.logp != null && !n.growing ? oneIn(n.logp).text : null,
    ].filter(Boolean).join(' · ');
    el.mapTip.innerHTML = `${esc(snip || '…')}<span class="tip-meta">${esc(meta)}</span>`;
    el.mapTip.hidden = false;
    const d = this.drawn.find((q) => q.id === id);
    const tw = el.mapTip.offsetWidth, th = el.mapTip.offsetHeight;
    let x = d.x + 12, y = d.y + 12;
    if (x + tw > this.W - 6) x = Math.max(6, d.x - tw - 12);
    if (y + th > this.H - 6) y = Math.max(6, d.y - th - 12);
    el.mapTip.style.left = x + 'px'; el.mapTip.style.top = y + 'px';
  },
  down(e) {
    this.c.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 1) this.drag = { x: e.clientX, y: e.clientY, moved: false, cam: { ...this.cam } };
    else if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; }
  },
  move(e) {
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2 && this.pinch) {
      const [a, b] = [...this.pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = this.c.getBoundingClientRect();
      this.zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / this.pinch.d); this.pinch.d = d;
      if (this.drag) this.drag.moved = true;
      return;
    }
    if (this.drag) {
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      if (!this.drag.moved && Math.hypot(dx, dy) > 5) { this.drag.moved = true; this.c.classList.add('dragging'); this.setHover(null); }
      if (this.drag.moved) { this.manual = true; this.camTo = null; this.cam = { ...this.drag.cam, tx: this.drag.cam.tx + dx, ty: this.drag.cam.ty + dy }; this.draw(); }
      return;
    }
    if (e.pointerType === 'mouse') this.setHover(this.hit(e), e);
  },
  up(e, cancel) {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    const d = this.drag;
    if (this.pointers.size === 0) { this.drag = null; this.c.classList.remove('dragging'); }
    if (!cancel && d && !d.moved && this.pointers.size === 0) {
      const id = this.hit(e);
      if (id != null) { this.setHover(null); goTo(id, 'map'); }
    }
  },
  // Zoom never goes below "Fit" (the whole tree): each axis stops at its fit scale on the way out.
  zoomAt(x, y, f) {
    const c = this.cam, fit = this.fitCam();
    const kx = Math.max(fit.kx, Math.min(fit.kx * 8, c.kx * f));
    const ky = Math.max(fit.ky, Math.min(Math.max(fit.ky, 11) * 8, c.ky * f));
    this.manual = true; this.camTo = null;
    if (kx <= fit.kx + 1e-6 && ky <= fit.ky + 1e-6) this.cam = fit;
    else this.cam = { kx, ky, tx: x - (x - c.tx) * (kx / c.kx), ty: y - (y - c.ty) * (ky / c.ky) };
    this.draw();
  },
  fitCam() {
    const p = this.pad(), H = Math.max(40, this.H - p.t - p.b), W = Math.max(40, this.W - p.l - p.r);
    const kx = Math.min(130, W / this.maxX), ky = Math.min(30, H / this.span);
    return { kx, ky, tx: p.l + Math.max(0, (W - this.maxX * kx) / 2), ty: p.t + Math.max(0, (H - this.span * ky) / 2) };
  },
  fit() {
    this.camFrom = { ...this.cam };
    // "Fit" means the whole tree, even when following would zoom in
    this.camTo = this.fitCam();
    this.manual = true;
    if (reduced.matches) { this.cam = this.camTo; this.camTo = null; this.draw(); return; }
    this.from = this.to = this.pos; this.t0 = performance.now();
    if (!this.animating) { this.animating = true; requestAnimationFrame(() => this.tick()); }
  },
};

// ------------------------------------------------------------------ large map / theme / tokens
function setMapLarge(on) {
  S.mapLarge = on;
  el.app.classList.toggle('map-large', on);
  el.mapBtn.setAttribute('aria-pressed', String(on));
  el.mapClose.hidden = !on || wideMQ.matches;
  if (on && narrowMQ.matches) el.mapbox.classList.remove('collapsed');
  requestAnimationFrame(() => { MapView.resize(); if (on) el.map.focus({ preventScroll: true }); else scrollToCurrent(false); });
  writeHash();
}
function setTokenView(on) {
  S.tokenView = on;
  el.tokBtn.setAttribute('aria-pressed', String(on));
  hidePop();
  const keep = el.scroller.scrollTop;
  renderDoc('toggle'); renderFork('toggle');
  el.scroller.scrollTop = keep;
  writeHash();
}
// Only the reader's own click is remembered. On load the mode comes from the head script (the
// link, else the post's choice when embedded, else this tool's, else night).
function setMode(day, persist = false) {
  if (day) document.documentElement.dataset.mode = 'day'; else delete document.documentElement.dataset.mode;
  el.modeBtn.textContent = day ? 'Night' : 'Day';
  el.modeBtn.setAttribute('aria-label', day ? 'Switch to night mode' : 'Switch to day mode');
  if (persist) store.set('mini-loom-mode', day ? 'day' : 'night');
  MapView.readColors(); MapView.draw();
  if (S.tree) writeHash();
}

// ------------------------------------------------------------------ seed menu
function renderSeedMenu() {
  const opts = [];
  for (const e of S.entries) {
    // Only the first-branch spine reaches the deepest level, so give the range (index.json's min_depth).
    const deep = !e.depth ? null : e.min_depth && e.min_depth < e.depth ? `${e.min_depth} to ${e.depth} choices deep` : `up to ${e.depth} choices deep`;
    const sub = [KIND[e.id], e.nodes ? `${e.nodes} passages` : null, deep].filter(Boolean).join(' · ');
    opts.push(`<button role="menuitemradio" data-seed="${esc(e.id)}" aria-checked="${!!(S.tree && S.tree.id === e.id)}"><span class="opt-title">${esc(e.title || e.id)}</span>${sub ? `<span class="opt-sub">${esc(sub)}</span>` : ''}${e.prompt ? `<span class="opt-prompt">${esc(e.prompt)}</span>` : ''}</button>`);
  }
  if (S.sessions.has('custom') || (S.tree && S.tree.custom)) opts.push(`<button role="menuitemradio" data-seed="custom" aria-checked="${!!(S.tree && S.tree.custom)}"><span class="opt-title">Your prompt</span><span class="opt-sub">grown live in this browser</span></button>`);
  if (S.live.state === 'ready') opts.push('<button role="menuitem" class="sep" data-act="own"><span class="opt-title">Write your own prompt…</span><span class="opt-sub">the live model grows the futures</span></button>');
  else opts.push('<button role="menuitem" class="sep" data-act="live"><span class="opt-title">Write your own prompt…</span><span class="opt-sub">needs the live model (loads in your browser)</span></button>');
  el.seedMenu.innerHTML = opts.join('');
}
function openMenu() {
  renderSeedMenu();
  el.seedMenu.hidden = false; el.seedBtn.setAttribute('aria-expanded', 'true');
  const sel = el.seedMenu.querySelector('[aria-checked="true"]') || el.seedMenu.querySelector('button');
  sel && sel.focus();
}
function closeMenu(focusBtn) {
  if (el.seedMenu.hidden) return;
  el.seedMenu.hidden = true; el.seedBtn.setAttribute('aria-expanded', 'false');
  if (focusBtn) el.seedBtn.focus();
}

// ------------------------------------------------------------------ live model
async function ensureLiveModule() {
  if (!S.live.mod) S.live.mod = await import('./live.js');
  if (!S.live.det) S.live.det = await S.live.mod.detect();
  return S.live.mod;
}
function paramsNum(p) { const m = /([\d.]+)\s*([MB])/i.exec(String(p || '')); return m ? parseFloat(m[1]) * (m[2].toUpperCase() === 'B' ? 1e9 : 1e6) : null; }
async function openLive() {
  closeMenu();
  el.liveDialog.showModal();
  try { await ensureLiveModule(); } catch (e) { el.liveDevice.textContent = 'The live model could not start in this browser.'; return; }
  updateLiveDialog();
}
function updateLiveDialog() {
  const d = S.live.det; if (!d) return;
  const plan = S.live.eng ? S.live.eng.plan : S.live.state === 'loading' && S.live.plan ? S.live.plan : d.plan;
  const grower = (S.tree && !S.tree.custom && S.tree.model) || (S.entries[0] && S.entries[0].model) || null;
  const a = paramsNum(grower && grower.params), b = paramsNum(plan.params);
  el.liveCompare.innerHTML = grower && a && b && a > b
    ? `It is <b>${esc(plan.label)}</b>, about ${Math.round(a / b)} times smaller than ${esc(grower.label)}, which grew the trees on this page, so its branches will be weaker.`
    : `It is <b>${esc(plan.label)}</b> (${esc(plan.params)} parameters), smaller than the model that grew the trees on this page, so its branches will be weaker.`;
  if (S.live.state === 'ready') {
    el.liveDevice.innerHTML = `<b>Ready.</b> ${esc(plan.label)} is running on ${esc(plan.where)}. Press G, or use Grow under the futures.`;
  } else if (d.webgpu) el.liveDevice.innerHTML = `Your browser supports WebGPU, so it will run on your graphics card: <b>${esc(plan.label)}</b>, about ${plan.mb} MB.`;
  else el.liveDevice.innerHTML = `WebGPU is not available here (${esc(d.why || 'unsupported')}), so it will run on your processor instead: <b>${esc(plan.label)}</b>, about ${plan.mb} MB. Slower, but it works.`;
  if (d.webgpu && d.phone && d.altLarger && S.live.state === 'idle') el.liveDevice.innerHTML += ' On a phone or a small-memory device it starts with the smaller model, to spare your data and memory.';
  if (d.mem && d.mem < 4 && S.live.state !== 'ready') el.liveDevice.innerHTML += ' This device reports little memory, so loading may fail.';
  el.liveLoad.textContent = S.live.state === 'ready' ? 'Close and grow' : S.live.state === 'loading' ? 'Cancel download' : `Load a live model (≈ ${plan.mb} MB)`;
  el.liveLoad.classList.toggle('primary', S.live.state !== 'loading');
  el.liveLoad.disabled = false;
  const alt = d.alt;
  el.liveSmall.hidden = !alt || S.live.state !== 'idle';
  if (alt) el.liveSmall.textContent = d.altLarger ? `or the larger ${alt.label}, ≈ ${alt.mb} MB` : `or the smaller ${alt.label} (≈ ${alt.mb} MB, weaker)`;
  el.writeOwn.hidden = S.live.state !== 'ready';
}
async function loadLive(which) {
  if (S.live.state === 'ready') { el.liveDialog.close(); return; }
  if (S.live.state === 'loading') { cancelLive(); return; }
  const mod = await ensureLiveModule();
  let plan = which === 'alt' && S.live.det.alt ? S.live.det.alt : S.live.det.plan;
  S.live.state = 'loading'; S.live.plan = plan; S.live.frac = 0; liveBtnState();
  updateLiveDialog();
  el.liveProgress.hidden = false;
  el.liveBar.style.width = '0%';
  el.liveStatus.textContent = 'Starting…';
  // The total grows as the library finds each file, so the bar is measured against the stated
  // size and only ever moves forward.
  const onP = (p) => {
    if (S.live.state !== 'loading') return;
    if (p.phase === 'download') {
      const tot = Math.max(p.total || 0, S.live.plan.mb * 1e6);
      S.live.frac = Math.max(S.live.frac, Math.min(1, (p.loaded || 0) / tot));
      el.liveBar.style.width = (S.live.frac * 100).toFixed(1) + '%';
      el.liveStatus.textContent = `Downloading ${Math.round((p.loaded || 0) / 1e6)} of ≈${S.live.plan.mb} MB`;
      liveBtnState();
    } else if (p.phase === 'warmup') { S.live.frac = 1; el.liveBar.style.width = '100%'; el.liveStatus.textContent = 'Preparing the model…'; liveBtnState(); }
  };
  const attempt = async (pl) => { S.live.plan = pl; S.live.loading = mod.load(pl, onP); try { return await S.live.loading.promise; } finally { S.live.loading = null; } };
  try {
    S.live.eng = await attempt(plan);
  } catch (e) {
    if (isCancel(e)) return;
    console.warn('[mini-loom] live model:', e && e.message);
    if (plan.device === 'webgpu') {
      plan = mod.PLANS.cpu;
      S.live.frac = 0; el.liveBar.style.width = '0%';
      el.liveStatus.textContent = 'The graphics card did not work for this model. Trying the processor version…';
      el.liveDevice.innerHTML = `The graphics card did not work for this model here, so it will run on your processor instead: <b>${esc(plan.label)}</b>, about ${plan.mb} MB.`;
      try { S.live.eng = await attempt(plan); } catch (e2) { if (isCancel(e2)) return; console.warn('[mini-loom] live model (cpu):', e2 && e2.message); return liveFail(e2); }
    } else return liveFail(e);
  }
  S.live.state = 'ready';
  el.liveStatus.textContent = `Ready: ${S.live.eng.label} on ${S.live.eng.plan.where}.`;
  liveBtnState(); updateLiveDialog();
  el.app.classList.add('live-ready');
  renderHeader(); renderFork('live');
  announce(`Live model ready: ${S.live.eng.label}.`);
}
const isCancel = (e) => e && e.message === 'cancelled';
function cancelLive() {
  if (S.live.state !== 'loading') return;
  const h = S.live.loading;
  S.live.state = 'idle'; S.live.frac = 0;
  if (h) h.cancel();
  el.liveBar.style.width = '0%';
  el.liveStatus.textContent = 'Download cancelled. Already-downloaded files stay in your browser cache.';
  liveBtnState(); updateLiveDialog();
  announce('Download cancelled.');
}
function liveFail(e) {
  S.live.state = 'error'; liveBtnState();
  const msg = String((e && e.message) || e);
  el.liveStatus.textContent = /memory|alloc|oom|out of/i.test(msg)
    ? 'Your device ran out of memory loading the model. The pre-grown trees still work.'
    : `The model did not load (${msg.slice(0, 140)}). The pre-grown trees still work.`;
  el.liveBar.style.width = '0%';
  S.live.state = 'idle'; liveBtnState(); updateLiveDialog();
}
function liveBtnState() {
  const b = el.liveBtn, st = S.live.state;
  b.classList.toggle('ready', st === 'ready'); b.classList.toggle('loading', st === 'loading');
  const pc = Math.round(S.live.frac * 100);
  el.liveBtnText.textContent = st === 'ready' ? (wideMQ.matches ? `Live: ${S.live.eng.label}` : 'Live') : st === 'loading' ? (wideMQ.matches ? `Loading ${pc}%` : narrowMQ.matches ? `${pc}%` : `Live ${pc}%`) : (wideMQ.matches ? 'Live model' : 'Live');
  b.title = st === 'loading' ? 'Downloading the live model: open to cancel' : st === 'ready' ? `Live model: ${S.live.eng.label}` : 'Grow new branches with a model in your browser';
}
async function grow() {
  if (S.live.state !== 'ready') { openLive(); return; }
  if (S.live.growing || !S.tree) return;
  const parent = node(S.cur), eng = S.live.eng, cfg = { ...S.settings };
  const context = pathTo(parent.id).map((id) => node(id).text).join('');
  const ids = [];
  for (let i = 0; i < cfg.branches; i++) {
    const n = { id: S.tree.nextId++, parent: parent.id, text: '', tokens: [], children: [], depth: parent.depth + 1, src: 'live', model: eng.label, logp: 0, wrote: 0, growing: true };
    S.tree.nodes.set(n.id, n); parent.children.push(n.id); ids.push(n.id);
  }
  const tree = S.tree;
  const here = () => S.tree === tree && S.cur === parent.id;
  S.live.growing = { tree, parent: parent.id, n: cfg.branches, done: 0 };
  renderFork('grow'); MapView.relayout(true); renderMeter();
  try {
    await eng.grow({
      context, n: cfg.branches, maxTokens: cfg.tokens, temperature: cfg.temp, topP: 0.95, stopAtSentence: cfg.stop, minTokens: minStop(cfg.tokens),
      onUpdate: (b, tokens, text, done, cut) => {
        const k = tree.nodes.get(ids[b]); if (!k) return;
        k.tokens = tokens.slice(); k.text = text; k.logp = tokens.reduce((s, t) => s + t[1], 0);
        if (done) {
          k.growing = false; S.live.growing.done = b + 1;
          if (cut && text) k.cut = true;   // the reader pressed Stop while this one was mid-sentence
          if (!k.tokens.length) k.tokens = null;
          if (here()) renderFork('grow');
        } else if (here()) updateGrowingCard(k);
      },
    });
  } catch (e) {
    console.warn('[mini-loom] grow:', e);
    announce('The live model stopped: ' + (e.message || e));
  }
  // a branch still open after an error was cut short too
  for (const id of ids) { const k = tree.nodes.get(id); if (k && k.growing) { k.growing = false; if (k.text) k.cut = true; } }
  // drop empty branches (the model ended the text at once)
  parent.children = parent.children.filter((c) => { const k = tree.nodes.get(c); if (k.src === 'live' && !k.text) { tree.nodes.delete(c); return false; } return true; });
  const merged = mergeDuplicates(tree, parent, ids);
  const stopped = S.live.growing && S.live.growing.stopping;
  S.live.growing = null;
  forkStats(tree);
  renderAll('grown');
  checkTasks();
  const kept = ids.filter((id) => tree.nodes.has(id)).length;
  const fut = (k) => `${k} new ${k === 1 ? 'future' : 'futures'}`;
  const same = merged === 1 ? ' 2 identical futures merged into one card.' : merged > 1 ? ` ${merged} repeated futures merged into the cards they repeat.` : '';
  if (stopped) announce((kept ? `Stopped. Kept ${fut(kept)} of ${ids.length}.` : 'Stopped before anything grew.') + same);
  else announce((kept ? `Grew ${fut(kept)}.` : 'The model ended the text here; nothing new grew.') + same);
}
// At a low temperature a small model often writes the same text twice. Identical futures are
// one choice, not two, so a repeat is folded into the card it repeats ("grown twice") instead of
// standing as a separate future (which would also inflate the bits). Only branches from this
// grow are ever removed, never one on the reader's path.
function mergeDuplicates(tree, parent, ids) {
  const fresh = new Set(ids);
  const cur = S.tree === tree ? S.cur : (S.sessions.get(tree.id) || {}).cur;
  const onPath = new Set();
  for (let id = cur; id != null && tree.nodes.has(id); id = tree.nodes.get(id).parent) onPath.add(id);
  const first = new Map();
  let merged = 0;
  for (const c of parent.children.slice()) {
    const k = tree.nodes.get(c);
    if (!k || k.src === 'you' || !k.text) continue;
    const keep = first.get(k.text);
    if (keep == null) { first.set(k.text, c); continue; }
    const canDrop = (id) => fresh.has(id) && !onPath.has(id);
    let drop, stay;
    if (canDrop(c)) { drop = c; stay = keep; }
    else if (canDrop(keep)) { drop = keep; stay = c; first.set(k.text, c); }
    else continue;
    const d = tree.nodes.get(drop), s = tree.nodes.get(stay);
    s.times = (s.times || 1) + (d.times || 1);
    if (s.cut && !d.cut) s.cut = false;   // one copy ran to its natural end
    tree.nodes.delete(drop);
    parent.children = parent.children.filter((x) => x !== drop);
    const vis = S.tree === tree ? S.visited : (S.sessions.get(tree.id) || {}).visited;
    const lc = S.tree === tree ? S.lastChild : (S.sessions.get(tree.id) || {}).lastChild;
    if (vis && vis.delete(drop)) vis.add(stay);
    if (lc && lc.get(parent.id) === drop) lc.set(parent.id, stay);
    merged++;
  }
  return merged;
}
function openEdit(mode) {
  const n = node(S.cur);
  el.editDialog.dataset.mode = mode;
  if (mode === 'own') {
    el.editTitle.textContent = 'Write your own prompt';
    el.editNote.textContent = 'The live model will continue it. A base model continues documents, so a prompt that looks like the start of a real text (a story, a letter, a manual, a forum post) works best.';
    el.editText.value = '';
    el.editSave.textContent = 'Start and grow';
  } else if (n.parent == null) {
    el.editTitle.textContent = 'Edit the prompt';
    el.editNote.textContent = 'Your edited prompt starts a new tree, written by you. The live model grows the futures.';
    el.editText.value = n.text;
    el.editSave.textContent = 'Start and grow';
  } else {
    el.editTitle.textContent = 'Edit this passage';
    el.editNote.textContent = 'Your version becomes a new sibling, marked as written by you. The model’s version stays in the tree. Words you add count as words you wrote.';
    el.editText.value = n.text;
    el.editSave.textContent = 'Save and grow from it';
  }
  closeMenu();
  el.editDialog.showModal();
  el.editText.focus();
}
function saveEdit() {
  const mode = el.editDialog.dataset.mode;
  const n = node(S.cur);
  let text = el.editText.value.replace(/\r/g, '');
  if (!text.trim()) { el.editText.focus(); return; }
  el.editDialog.close();
  if (mode === 'own' || n.parent == null) {
    const wrote = mode === 'own' ? words(text) : wordDiff(n.text, text);
    saveSession();
    const t = { id: 'custom', title: 'Your prompt', kind: '', model: null, sampling: null, notes: '', sample: false, custom: true, nodes: new Map(), root: 0, nextId: 1, q: null };
    t.nodes.set(0, { id: 0, parent: null, text, tokens: null, children: [], depth: 0, src: 'you', model: '', logp: null, wrote });
    S.tree = t; S.cur = 0; S.visited = new Set([0]); S.lastChild = new Map();
    MapView.reset(); renderAll('open'); el.scroller.scrollTop = 0;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    grow();
    return;
  }
  if (/^\s/.test(n.text) && !/^\s/.test(text)) text = ' ' + text;
  const k = { id: S.tree.nextId++, parent: n.parent, text, tokens: null, children: [], depth: n.depth, src: 'you', model: '', logp: null, wrote: wordDiff(n.text, text) };
  S.tree.nodes.set(k.id, k);
  node(n.parent).children.push(k.id);   // at the end, so the pre-grown siblings keep their keys and link indices
  goTo(k.id, 'jump');
  grow();
}

// ------------------------------------------------------------------ events
const syncers = [];
const minStop = (max) => Math.max(4, Math.min(12, Math.ceil(max / 2)));
function stopLabel() { const l = document.getElementById('stopLabel'); if (l) l.textContent = `Stop at the end of a sentence (after at least ${minStop(S.settings.tokens)} tokens)`; }
function onKey(e) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (roomOn()) return;   // the app is inert under the small-frame card
  const t = e.target;
  if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
  if (document.querySelector('dialog[open]')) return;
  if (!el.seedMenu.hidden) return;
  if (!S.tree) return;
  const k = e.key;
  if (k === 'Escape') { if (!el.pop.hidden) hidePop(); else if (S.mapLarge) setMapLarge(false); return; }
  if (k === 'ArrowLeft' || k === 'Backspace') { toParent(); e.preventDefault(); }
  else if (k === 'ArrowRight') { toChild(); e.preventDefault(); }
  else if (k === 'ArrowUp') { toSibling(-1); e.preventDefault(); }
  else if (k === 'ArrowDown') { toSibling(1); e.preventDefault(); }
  else if (k === 'Home') { toRoot(); e.preventDefault(); }
  else if (/^[1-9]$/.test(k)) {
    const i = +k - 1;
    if (i < node(S.cur).children.length) { choose(i, el.fork.querySelector(`.card[data-i="${i}"]`)); e.preventDefault(); }
  }
  else if (k === 't' || k === 'T') { setTokenView(!S.tokenView); e.preventDefault(); }
  else if (k === 'm' || k === 'M') { setMapLarge(!S.mapLarge); e.preventDefault(); }
  else if (k === 'g' || k === 'G') { grow(); e.preventDefault(); }
}

// ------------------------------------------------------------------ small frames
// The post embeds Mini Loom in a 16:9 frame; on a phone that is about 352x198, where the reader, the
// fork, the map and the meter overlap. CSS shows the "needs more room" card there; this keeps the
// app behind it inert, offers fullscreen where the frame allows it, and lets the reader stay anyway.
const roomOn = () => !!el.room && roomMQ.matches && !el.room.classList.contains('dismissed');
function syncRoom() {
  const on = roomOn();
  if (el.app.inert === on) return;
  el.app.inert = on;
  if (on) { hidePop(); closeMenu(false); }
}
function bindRoom() {
  if (document.fullscreenEnabled || document.webkitFullscreenEnabled) el.roomFull.hidden = false;
  el.roomFull.addEventListener('click', () => {
    const d = document.documentElement, req = d.requestFullscreen || d.webkitRequestFullscreen;
    try { const p = req && req.call(d); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  });
  el.roomStay.addEventListener('click', () => {
    el.room.classList.add('dismissed');
    syncRoom();
    el.seedBtn.focus({ preventScroll: true });
  });
  roomMQ.addEventListener('change', syncRoom);
  syncRoom();
}

function bind() {
  for (const id of ['room', 'roomFull', 'roomTab', 'roomStay', 'app', 'seedBtn', 'seedLabel', 'seedMenu', 'tokBtn', 'mapBtn', 'taskBtn', 'taskCount', 'liveBtn', 'liveBtnText', 'modeBtn',
    'scroller', 'eyebrow', 'editBtn', 'rootBtn', 'grownBy', 'tokLegend', 'doc', 'fork', 'keyN', 'mapbox', 'mapToggle', 'mapStats', 'zoomOut', 'zoomIn',
    'fitBtn', 'mapClose', 'mapStage', 'map', 'mapTip', 'meter', 'bitsHelp', 'bitsNum', 'bitStrip', 'tasksSide', 'creditModel', 'announce',
    'taskDialog', 'tasksDlgBody', 'bitsDialog', 'liveDialog', 'liveCompare', 'liveDevice', 'liveLoad', 'liveSmall', 'liveProgress', 'liveBar', 'liveStatus',
    'writeOwn', 'editDialog', 'editNote', 'editText', 'editSave']) el[id] = document.getElementById(id);
  el.bits1 = $('#bitsLine1'); el.bits2 = $('#bitsLine2'); el.pop = $('#tokPop'); el.editTitle = $('#editDlgTitle');
  el.bitsUnit = $('#meter .meter-num .unit');
  bindRoom();

  document.addEventListener('keydown', onKey);
  el.seedBtn.addEventListener('click', () => (el.seedMenu.hidden ? openMenu() : closeMenu(true)));
  el.seedMenu.addEventListener('click', (e) => {
    const o = e.target.closest('button'); if (!o) return;
    closeMenu(true);
    if (o.dataset.act === 'own') openEdit('own');
    else if (o.dataset.act === 'live') openLive();
    else if (o.dataset.seed === 'custom') { if (!(S.tree && S.tree.custom)) { saveSession(); restoreSession('custom'); MapView.reset(); renderAll('open'); } }
    else if (!S.tree || o.dataset.seed !== S.tree.id) openSeed(o.dataset.seed);
  });
  el.seedMenu.addEventListener('keydown', (e) => {
    const opts = [...el.seedMenu.querySelectorAll('button')];
    const i = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { opts[(i + 1) % opts.length].focus(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { opts[(i - 1 + opts.length) % opts.length].focus(); e.preventDefault(); }
    else if (e.key === 'Escape') { closeMenu(true); e.preventDefault(); }
    else if (e.key === 'Tab') closeMenu(false);
    e.stopPropagation();
  });
  document.addEventListener('pointerdown', (e) => {
    if (!e.target || !e.target.closest) return;
    if (!el.seedMenu.hidden && !e.target.closest('.seed-wrap')) closeMenu(false);
    if (popPinned && !e.target.closest('.tok, .popover')) hidePop();
  });
  el.tokBtn.addEventListener('click', () => setTokenView(!S.tokenView));
  el.mapBtn.addEventListener('click', () => setMapLarge(!S.mapLarge));
  el.mapClose.addEventListener('click', () => setMapLarge(false));
  el.modeBtn.addEventListener('click', () => setMode(document.documentElement.dataset.mode !== 'day', true));
  // Inside the post, follow the post's own day/night switch (same origin, so the change arrives
  // here as a storage event).
  window.addEventListener('storage', (e) => {
    if (embedded && e.key === 'scene-mode' && (e.newValue === 'day' || e.newValue === 'night') && !S.hashMode) setMode(e.newValue === 'day');
  });
  coarseMQ.addEventListener('change', () => { if (S.tree) renderFork('pointer'); });
  shortMQ.addEventListener('change', () => { if (S.tree) markClamped(); });
  el.liveBtn.addEventListener('click', openLive);
  el.liveLoad.addEventListener('click', () => loadLive('main'));
  el.liveSmall.addEventListener('click', () => loadLive('alt'));
  el.writeOwn.addEventListener('click', () => { el.liveDialog.close(); openEdit('own'); });
  el.rootBtn.addEventListener('click', toRoot);
  el.editBtn.addEventListener('click', () => openEdit('node'));
  el.editSave.addEventListener('click', saveEdit);
  el.editText.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveEdit(); } });
  el.bitsHelp.addEventListener('click', () => el.bitsDialog.showModal());
  el.taskBtn.addEventListener('click', () => {
    if (wideMQ.matches) { S.tasksOpen = !S.tasksOpen; store.set('mini-loom-tasks-open', S.tasksOpen ? '1' : '0'); renderTasks(); if (S.tasksOpen) el.tasksSide.querySelector('.tasks-head').focus(); }
    else { el.taskDialog.showModal(); renderTasks(); }
  });
  el.taskDialog.addEventListener('close', () => renderTasks());
  el.tasksSide.addEventListener('click', (e) => {
    if (e.target.closest('.tasks-head')) { S.tasksOpen = !S.tasksOpen; store.set('mini-loom-tasks-open', S.tasksOpen ? '1' : '0'); renderTasks(); el.tasksSide.querySelector('.tasks-head').focus(); }
  });
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-act="reset-tasks"]');
    if (r) { S.tasks = { surprise: false, opposite: false, narrow: false, wide: false, bits: false }; store.set('mini-loom-tasks', JSON.stringify(S.tasks)); renderTasks(); }
  });
  for (const d of document.querySelectorAll('dialog')) {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  }
  // settings
  const bindRange = (id, out, key, fmt) => {
    const i = document.getElementById(id), o = document.getElementById(out);
    const sync = () => { i.value = S.settings[key]; o.textContent = fmt(S.settings[key]); };
    sync(); syncers.push(sync);
    i.addEventListener('input', () => { S.settings[key] = +i.value; o.textContent = fmt(+i.value); stopLabel(); if (S.live.state === 'ready' && !S.live.growing) renderFork('settings'); });
  };
  bindRange('setBranches', 'outBranches', 'branches', (v) => String(v));
  bindRange('setTokens', 'outTokens', 'tokens', (v) => String(v));
  bindRange('setTemp', 'outTemp', 'temp', (v) => (+v).toFixed(1));
  $('#setStop').addEventListener('change', (e) => { S.settings.stop = e.target.checked; });
  stopLabel();

  // fork: cards and actions
  el.fork.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    if (a) {
      const act = a.dataset.act;
      if (act === 'grow') grow(); else if (act === 'up') toParent(); else if (act === 'live') openLive(); else if (act === 'settings') openLive();
      else if (act === 'stop' && S.live.eng && S.live.growing) { S.live.growing.stopping = true; S.live.eng.stop(); renderFork('stop'); }
      else if (act === 'why') {
        S.whyOpen = !S.whyOpen;
        a.setAttribute('aria-expanded', String(S.whyOpen));
        const w = document.getElementById('forkWhy'); if (w) w.hidden = !S.whyOpen;
      }
      return;
    }
    const c = e.target.closest('.card');
    if (c && c.getAttribute('aria-disabled') !== 'true') choose(+c.dataset.i, c);
  });
  // document: click a passage to go there; tokens show their alternatives
  el.doc.addEventListener('click', (e) => {
    const tok = e.target.closest('.tok');
    if (tok && S.tokenView) { if (popFor === tok && popPinned) hidePop(); else showPop(tok, true); return; }
    const s = e.target.closest('.seg');
    if (s) goTo(+s.dataset.id, 'jump');
  });
  el.doc.addEventListener('pointerover', (e) => { const t = e.target.closest('.tok'); if (t && e.pointerType === 'mouse' && !popPinned) showPop(t); });
  el.doc.addEventListener('pointerout', (e) => { const t = e.target.closest('.tok'); if (t && e.pointerType === 'mouse' && !popPinned && popFor === t) hidePop(); });
  el.doc.addEventListener('focusin', (e) => { const t = e.target.closest('.tok'); if (t) showPop(t); });
  el.doc.addEventListener('focusout', (e) => { const t = e.target.closest('.tok'); if (t && !popPinned) hidePop(); });
  el.scroller.addEventListener('scroll', () => { if (!el.pop.hidden) placePop(); }, { passive: true });
  window.addEventListener('resize', () => { if (!el.pop.hidden) placePop(); });

  // map controls
  el.fitBtn.addEventListener('click', () => MapView.fit());
  el.zoomIn.addEventListener('click', () => MapView.zoomAt(MapView.W / 2, MapView.H / 2, 1.3));
  el.zoomOut.addEventListener('click', () => MapView.zoomAt(MapView.W / 2, MapView.H / 2, 1 / 1.3));
  el.mapToggle.addEventListener('click', () => {
    if (!narrowMQ.matches || S.mapLarge) return;
    const c = el.mapbox.classList.toggle('collapsed');
    el.mapToggle.setAttribute('aria-expanded', String(!c));
    store.set('mini-loom-map', c ? 'closed' : 'open');
    if (!c) requestAnimationFrame(() => MapView.resize());
  });
  const syncLayout = () => {
    el.mapClose.hidden = !S.mapLarge || wideMQ.matches;
    // The collapse button exists only on phones; wider, the title is plain text (CSS swaps them).
    el.mapToggle.setAttribute('aria-expanded', String(!el.mapbox.classList.contains('collapsed')));
    if (S.live.state !== 'idle') liveBtnState(); else el.liveBtnText.textContent = wideMQ.matches ? 'Live model' : 'Live';
    renderTasks();
  };
  narrowMQ.addEventListener('change', syncLayout);
  wideMQ.addEventListener('change', syncLayout);
  syncLayout();
  window.addEventListener('hashchange', () => {
    const h = readHash();
    if (h.tokens !== S.tokenView) setTokenView(h.tokens);
    if ((h.map === 'large') !== S.mapLarge) setMapLarge(h.map === 'large');
    if (h.mode) { S.hashMode = h.mode; setMode(h.mode === 'day'); }
    if (h.seed && S.entries.some((e) => e.id === h.seed)) {
      if (S.tree && S.tree.id === h.seed) { let cur = S.tree.root; for (const ix of h.path) { const c = node(cur).children[ix]; if (c == null) break; cur = c; } goTo(cur, 'jump'); }
      else openSeed(h.seed, { path: h.path });
    }
  });
}

async function main() {
  bind();
  const h0 = readHash();
  S.hashMode = h0.mode;
  setMode(document.documentElement.dataset.mode === 'day');
  if (narrowMQ.matches && store.get('mini-loom-map') === 'closed') { el.mapbox.classList.add('collapsed'); el.mapToggle.setAttribute('aria-expanded', 'false'); }
  MapView.init();
  renderTasks();
  if (!(await loadIndex())) return;
  syncers.forEach((f) => f()); stopLabel();
  const h = readHash();
  const first = (h.seed && S.entries.find((e) => e.id === h.seed)) || S.entries[0];
  if (h.tokens) setTokenView(true);
  await openSeed(first.id, { path: h.path });
  if (h.map === 'large') setMapLarge(true);
  checkTasks();
}
main();
