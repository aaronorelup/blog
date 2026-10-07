// Information Flow Explorer — app shell: state, tabs, grid settings, theme, deep links.
// The ideas are janus's (@repligate); see her thread linked in the footer.
import { Grid } from './grid.js';
import { h } from './dom.js';
import highways from './modes/highways.js';
import reach from './modes/reach.js';
import paths from './modes/paths.js';
import slices from './modes/slices.js';
import cell from './modes/cell.js';
import puzzles from './modes/puzzles.js';

const DEFAULT_WORDS = 'You are absolutely correct . The fix works on every test'.split(' ');
const DEFAULT = { L: 4, P: 4, words: DEFAULT_WORDS, detail: 'auto' };
const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

const app = {
  grid: null,
  user: { ...DEFAULT },
  mode: null,
  modes: {},
  get reduced() { return reduced.matches; },
  cfgFor(user) {
    const { L, P, words } = user;
    const inputs = words.slice(0, P);
    const outputs = Array.from({ length: P }, (_, p) => words[p + 1] ?? '?');
    return { L, P, inputs, outputs, words };
  },
  cfg() { return this._cfg; },
  name(l, p) { return `layer ${l} at ‘${this._cfg.inputs[p]}’`; },
  tok(p) { return this._cfg.inputs[p]; },
  say(t) { const el = $('live'); el.textContent = ''; setTimeout(() => (el.textContent = t), 30); },
  repaint() { this.mode?.paint?.(); },
  setHash() { writeHash(); },
};

// ------------------------------------------------------------------------------- modes
const ORDER = [highways, reach, paths, slices, cell, puzzles].map((f) => f(app));
for (const m of ORDER) app.modes[m.id] = m;

const tabs = $('tabs');
ORDER.forEach((m, i) => {
  const b = h('button', { type: 'button', class: 'tab', role: 'tab', id: 'tab-' + m.id, 'aria-controls': 'panel', 'aria-selected': 'false', tabindex: '-1' },
    h('span', { class: 'n', 'aria-hidden': 'true' }, String(i + 1)),
    h('span', { class: 'lbl-long' }, m.label),
    h('span', { class: 'lbl-short', 'aria-hidden': 'true' }, m.short || m.label));
  b.addEventListener('click', () => setMode(m.id));
  tabs.append(b);
});
tabs.addEventListener('keydown', (e) => {
  const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!dir) return;
  e.preventDefault();
  const i = ORDER.findIndex((m) => m === app.mode);
  const j = (i + dir + ORDER.length) % ORDER.length;
  setMode(ORDER[j].id);
  $('tab-' + ORDER[j].id).focus();
});

function setMode(id, params) {
  const m = app.modes[id] || ORDER[0];
  app.mode?.leave?.();
  toggleLegend(false);
  const changed = app.mode !== m;
  app.mode = m;
  for (const t of ORDER) {
    const b = $('tab-' + t.id);
    b.setAttribute('aria-selected', t === m ? 'true' : 'false');
    b.tabIndex = t === m ? 0 : -1;
  }
  $('panel').setAttribute('aria-labelledby', 'tab-' + m.id);
  if (changed) revealTab($('tab-' + m.id));
  if (params) m.fromHash?.(params);
  applyGrid();
  const panel = $('panel');
  panel.replaceChildren();
  panel.scrollTop = 0;
  panel.append(intro(m));
  m.enter(panel);
  syncStage();
  m.paint?.();
  writeHash();
  syncIntro();
}

// The intro: what this mode shows, and one thing to try. In a short frame (the post's 16:9
// embed) the "shows" line is clamped to two lines with a "more" toggle, so the controls stay
// in view.
function intro(m) {
  const box = h('div', { class: 'intro' });
  const more = h('button', { type: 'button', class: 'linkish more', 'aria-expanded': 'false', hidden: true }, 'more');
  more.addEventListener('click', () => {
    const open = !box.classList.contains('open');
    box.classList.toggle('open', open);
    more.textContent = open ? 'less' : 'more';
    more.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  box.append(
    h('h2', {}, m.title || m.label),
    h('div', { class: 'shows-wrap' }, h('p', { class: 'shows' }, m.shows), more),
    h('p', { class: 'try' }, h('span', { class: 'eyebrow' }, 'Try this'), ' ', m.tryThis));
  return box;
}
function syncIntro() {
  const box = $('panel').querySelector('.intro');
  if (!box) return;
  const shows = box.querySelector('.shows'), more = box.querySelector('.more');
  if (box.classList.contains('open')) { more.hidden = false; return; }
  more.hidden = !(shows.scrollHeight > shows.clientHeight + 1);
}
addEventListener('resize', syncIntro);

// Which view fills the stage: the grid, or the mode's own view (inside one cell, scale it up)
function syncStage() {
  const m = app.mode;
  const alt = m.altView?.() || null;
  const host = $('altHost');
  $('app').classList.toggle('alt', !!alt);
  $('legendBtn').hidden = !!alt; // the legend describes the grid, which these views don't show
  if (alt) toggleLegend(false);
  $('gridHost').hidden = !!alt;
  host.hidden = !alt;
  $('stage').classList.toggle('tall', !!alt);
  if (alt) { if (host.firstChild !== alt) host.replaceChildren(alt); }
  else host.replaceChildren();
  const chip = $('gridChip');
  chip.hidden = !!alt;
  const locked = !!m.lockedGrid;
  chip.disabled = locked;
  chip.textContent = locked ? `${app._cfg.L} layers × ${app._cfg.P} positions (janus's example)` : `${app._cfg.L} layers × ${app._cfg.P} positions · Edit`;
  chip.title = locked ? 'The puzzles use janus’s example grid' : 'Change the sentence, layers and positions';
  if (locked || alt) closePop();
}
app.syncStage = syncStage;

// ------------------------------------------------------------------------------- grid
const grid = new Grid($('gridHost'), {
  onHover: (c, e) => app.mode?.hover?.(c, e),
  onClick: (c, e) => app.mode?.click?.(c, e),
  onKey: (e, c) => app.mode?.key?.(e, c),
  onFocusCell: (c) => { app.mode?.focusCell?.(c); if (c) app.say(app.name(c.l, c.p)); },
  onBuild: () => app.mode?.built?.(),
});
app.grid = grid;

const shapeOf = (c) => [c.L, c.P, c.inputs.join('\u0001'), c.outputs.join('\u0001')].join('|');
function applyGrid() {
  const m = app.mode;
  const user = m?.lockedGrid ? DEFAULT : app.user;
  app._cfg = app.cfgFor(user);
  const c = app._cfg;
  const shape = shapeOf(c);
  const sig = shape + '|' + (m?.detail || user.detail);
  if (sig !== app._sig) {
    app._sig = sig;
    grid.configure({ ...c, detail: m?.detail || user.detail });
  }
  // modes keep their selections unless the grid's shape (not just its drawing) changed.
  // When the reader's own grid changes, every mode that draws it hears about it, even when it
  // is not on screen (its panel is not mounted then; gridChanged must cope), so no mode keeps a
  // selection that has fallen off the grid. Visiting the puzzles' fixed grid is not a change.
  const ucfg = m?.lockedGrid ? app.cfgFor(app.user) : c;
  const ushape = shapeOf(ucfg);
  if (ushape !== app._ushape) {
    const first = app._ushape === undefined;
    app._ushape = ushape;
    if (!first) {
      const keep = app._cfg;
      app._cfg = ucfg;
      for (const other of ORDER) if (other !== m && !other.lockedGrid) other.gridChanged?.();
      app._cfg = keep;
    }
  }
  if (shape !== app._shape) {
    app._shape = shape;
    m?.gridChanged?.();
  }
  syncPop();
}
app.applyGrid = () => { applyGrid(); syncStage(); app.repaint(); writeHash(); };

// grid settings popover
const pop = $('gridPop'), chip = $('gridChip');
function openPop() { pop.hidden = false; chip.setAttribute('aria-expanded', 'true'); syncPop(); $('sentence').focus(); }
function closePop() { if (pop.hidden) return; pop.hidden = true; chip.setAttribute('aria-expanded', 'false'); }
chip.addEventListener('click', () => (pop.hidden ? openPop() : closePop()));
$('gridDone').addEventListener('click', () => { closePop(); chip.focus(); });
pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePop(); chip.focus(); } });
document.addEventListener('pointerdown', (e) => {
  if (!pop.hidden && !pop.contains(e.target) && e.target !== chip) closePop();
  const lg = $('legendPop');
  if (lg.classList.contains('open') && !lg.contains(e.target) && e.target !== $('legendBtn')) toggleLegend(false);
});
function syncPop() {
  const u = app.user;
  if (document.activeElement !== $('sentence')) $('sentence').value = u.words === DEFAULT_WORDS ? DEFAULT_WORDS.slice(0, u.P).join(' ') : u.words.join(' ');
  $('layOut').textContent = u.L; $('posOut').textContent = u.P;
  const maxP = Math.min(10, u.words === DEFAULT_WORDS ? 10 : u.words.length);
  pop.querySelector('[data-t="L"][data-d="-1"]').disabled = u.L <= 2;
  pop.querySelector('[data-t="L"][data-d="1"]').disabled = u.L >= 12;
  pop.querySelector('[data-t="P"][data-d="-1"]').disabled = u.P <= 2;
  pop.querySelector('[data-t="P"][data-d="1"]').disabled = u.P >= maxP;
  const g = grid.g;
  const chk = $('detailChk');
  chk.checked = g ? g.detail : true;
  chk.disabled = g ? !g.detailOk : false;
  $('detailNote').textContent = g && !g.detailOk ? '(too many cells for this window)' : '';
}
pop.querySelectorAll('.stepper button').forEach((b) => b.addEventListener('click', () => {
  const u = app.user, d = +b.dataset.d;
  if (b.dataset.t === 'L') u.L = Math.max(2, Math.min(12, u.L + d));
  else {
    const maxP = Math.min(10, u.words === DEFAULT_WORDS ? 10 : u.words.length);
    u.P = Math.max(2, Math.min(maxP, u.P + d));
  }
  app.applyGrid();
}));
function useSentence() {
  const words = $('sentence').value.trim().split(/\s+/).filter(Boolean).slice(0, 11);
  const msg = $('sentNote');
  if (words.length < 2) { msg.textContent = 'Type at least two words. One word = one position here; real tokenizers split differently.'; return; }
  msg.textContent = 'One word = one position here; real tokenizers split differently.';
  const same = words.join(' ') === DEFAULT_WORDS.slice(0, words.length).join(' ');
  app.user.words = same ? DEFAULT_WORDS : words;
  app.user.P = Math.min(10, words.length);
  app.applyGrid();
}
$('sentApply').addEventListener('click', useSentence);
$('sentence').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); useSentence(); } });
$('detailChk').addEventListener('change', (e) => { app.user.detail = e.target.checked ? 'on' : 'off'; app.applyGrid(); });
$('gridReset').addEventListener('click', () => { app.user = { ...DEFAULT }; app.applyGrid(); syncPop(); });

// ------------------------------------------------------------------------------- theme, legend
const themeBtn = $('themeBtn');
function syncTheme() {
  const day = document.documentElement.dataset.mode === 'day';
  themeBtn.textContent = day ? 'Night' : 'Day';
  themeBtn.setAttribute('aria-label', day ? 'Switch to night mode' : 'Switch to day mode');
}
themeBtn.addEventListener('click', () => {
  const day = document.documentElement.dataset.mode !== 'day';
  document.documentElement.dataset.mode = day ? 'day' : 'night';
  try { localStorage.setItem('ao-info-flow-mode', day ? 'day' : 'night'); } catch (e) { /* storage blocked */ }
  syncTheme();
});
syncTheme();
function toggleLegend(open) {
  const lg = $('legendPop');
  const o = open ?? !lg.classList.contains('open');
  lg.classList.toggle('open', o);
  $('legendBtn').setAttribute('aria-expanded', o ? 'true' : 'false');
}
$('legendBtn').addEventListener('click', () => toggleLegend());

// ------------------------------------------------------------------------------- keys
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'Escape') { closePop(); toggleLegend(false); }
  // digits switch modes only from the page itself, the grid or a tab, never from another control
  const onTab = e.target.closest('.tab');
  if (/^[1-6]$/.test(e.key) && (onTab || !e.target.closest('button, a, label, [role=radio], [role=switch], .dots, .rlist, .pop'))) {
    const next = ORDER[+e.key - 1];
    setMode(next.id);
    if (onTab) $('tab-' + next.id).focus();
  }
});

// The tab strip scrolls sideways on narrow screens: fade the edge that has more tabs past it.
function syncTabFade() {
  const more = tabs.scrollWidth - tabs.clientWidth;
  tabs.classList.toggle('fade-r', more > 2 && tabs.scrollLeft < more - 2);
  tabs.classList.toggle('fade-l', more > 2 && tabs.scrollLeft > 2);
}
// Scroll the strip (only the strip) to show a tab. Not scrollIntoView: that also scrolls the page
// around an embed, and Chrome then starts Tab navigation after the tab instead of on it.
function revealTab(b) {
  const tr = tabs.getBoundingClientRect(), br = b.getBoundingClientRect();
  if (br.left < tr.left + 8) tabs.scrollLeft -= tr.left - br.left + 44;
  else if (br.right > tr.right - 8) tabs.scrollLeft += br.right - tr.right + 52;
}
tabs.addEventListener('scroll', syncTabFade, { passive: true });
new ResizeObserver(syncTabFade).observe(tabs);

// ------------------------------------------------------------------------------- tiny frames
const tiny = $('tiny');
let tinyDismissed = false;
function checkTiny() {
  const small = innerWidth < 330 || innerHeight < 280;
  tiny.hidden = !small || tinyDismissed;
}
$('tinyFull').addEventListener('click', () => {
  const d = document.documentElement;
  (d.requestFullscreen || d.webkitRequestFullscreen)?.call(d)?.catch?.(() => {});
});
$('tinyStay').addEventListener('click', () => { tinyDismissed = true; checkTiny(); });
addEventListener('resize', checkTiny);
checkTiny();
// phones: the grid stays in view (sticky under the header) while the panel scrolls
new ResizeObserver(() => document.documentElement.style.setProperty('--top-h', document.querySelector('.top').offsetHeight + 'px')).observe(document.querySelector('.top'));
if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) $('tinyFull').hidden = true;

// ------------------------------------------------------------------------------- deep links
function writeHash() {
  if (!app.mode) return;
  const p = new URLSearchParams();
  p.set('mode', app.mode.id);
  const u = app.user;
  if (!app.mode.lockedGrid && !app.mode.altView?.()) {
    if (u.L !== DEFAULT.L) p.set('layers', u.L);
    if (u.P !== DEFAULT.P) p.set('positions', u.P);
    if (u.words !== DEFAULT_WORDS) p.set('text', u.words.join(' '));
  }
  const extra = app.mode.toHash?.() || {};
  for (const k in extra) if (extra[k] !== undefined && extra[k] !== null) p.set(k, extra[k]);
  const s = '#' + p.toString();
  if (location.hash !== s) history.replaceState(null, '', s);
  $('tinyTab').href = location.pathname + s;
}
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const u = { ...DEFAULT };
  if (p.get('text')) {
    const w = p.get('text').trim().split(/\s+/).filter(Boolean).slice(0, 11);
    if (w.length >= 2) { u.words = w; u.P = Math.min(10, w.length); }
  }
  const L = parseInt(p.get('layers'), 10), P = parseInt(p.get('positions'), 10);
  if (L >= 2 && L <= 12) u.L = L;
  const maxP = Math.min(10, u.words === DEFAULT_WORDS ? 10 : u.words.length);
  if (P >= 2 && P <= maxP) u.P = P;
  app.user = u;
  const id = app.modes[p.get('mode')] ? p.get('mode') : 'highways';
  app.mode?.leave?.();
  app.mode = null;
  setMode(id, p);
}
addEventListener('hashchange', () => {
  const want = '#' + new URLSearchParams(location.hash.slice(1)).toString();
  if (want !== app._lastHash) readHash();
});
const origReplace = history.replaceState.bind(history);
history.replaceState = (s, t, url) => { app._lastHash = url; origReplace(s, t, url); };

readHash();
