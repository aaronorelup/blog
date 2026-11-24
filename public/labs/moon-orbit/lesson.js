// The lesson: runs every check on the engine first and keeps throwing locked until all of them pass, then lets the
// reader throw. Every throw is flown by the same engine the checks just passed. URL options, for links and tests:
// ?engine=<id> starts with a broken twin, ?speed=1.67 sets the speed, ?throw=1 throws once the checks pass,
// ?instant=1 skips the animations, ?mode=day|night picks the look.
import { ENGINES, GM, HEIGHT, R, engineById } from './engine.js';
import { CHECKS, runCheck } from './checks.js';
import { vCirc, vEsc } from './kepler.js';
import { createPlayer, flight } from './play.js';
import { createView } from './view.js';

const $ = (id) => document.getElementById(id);
const app = $('app');
const params = new URLSearchParams(location.search);
const reduce = params.has('instant') || matchMedia('(prefers-reduced-motion: reduce)').matches;
let host = null;
try { if (window.parent !== window && window.parent.document) host = window.parent; } catch (e) { host = null; }

const R0 = R + HEIGHT;
const V_CIRC = vCirc(GM, R0);
const V_ESC = vEsc(GM, R0);
const MAX_Q = 30000;                       // 3.0000 km/s, in steps of 0.0001 km/s
const PLACES = [10000, 1000, 100, 10, 1];  // what one click of each digit is worth
const GUIDE = [0.5, 1.0, 1.5, 1.6, 1.67, 1.68, 2.38];
const SHORT = { real: 'Real', euler: 'Euler', flat: 'Flat Moon', constant: 'Same pull', late: 'Late', typo: 'Typo' };

const S = {
  engine: engineById(params.get('engine')),
  gate: 'testing',
  q: Math.round(Math.min(3, Math.max(0, Number(params.get('speed')) || 0.5)) * 10000),
  place: 2,
  current: null,
  old: [],
  last: 0,
  done: new Set(),
  far: null,
};
const view = createView($('sky'));
let player = null;
const kick = () => { if (player) player.kick(); };

// ---------- Day and night: the site's switch, live ----------
const mode = () => (document.documentElement.dataset.mode === 'day' ? 'day' : 'night');
function setMode(m) {
  document.documentElement.dataset.mode = m;
  $('modeBtn').textContent = m === 'day' ? 'Night' : 'Day';
  kick();
}
if (!params.get('mode')) {
  addEventListener('storage', (e) => { if (e.key === 'scene-mode') setMode(e.newValue === 'day' ? 'day' : 'night'); });
  if (host) {
    try {
      const root = host.document.documentElement;
      const sync = () => setMode(root.dataset.mode === 'day' ? 'day' : 'night');
      new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-mode'] });
      sync();
    } catch (e) { /* the page around us is gone */ }
  }
}
if (!host) {
  $('modeBtn').hidden = false;
  $('modeBtn').addEventListener('click', () => {
    const m = mode() === 'day' ? 'night' : 'day';
    try { localStorage.setItem('scene-mode', m); } catch (e) { /* this page only */ }
    setMode(m);
  });
}
setMode(mode());

// The site's own fonts, borrowed from the page around the frame (no second download, no hard-coded file names).
function borrowFonts() {
  if (!host || !('FontFace' in window)) return;
  try {
    for (const sheet of host.document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { continue; }
      for (const rule of rules) {
        if (!rule.cssText.startsWith('@font-face')) continue;
        const family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
        if (family !== 'Karla' && family !== 'Zen Maru Gothic') continue;
        const face = new FontFace(family, rule.style.getPropertyValue('src'), {
          weight: rule.style.getPropertyValue('font-weight') || 'normal',
          unicodeRange: rule.style.getPropertyValue('unicode-range') || 'U+0-10FFFF',
          display: 'swap',
        });
        document.fonts.add(face);
      }
    }
    document.fonts.ready.then(kick);
  } catch (e) { /* system fonts it is */ }
}
borrowFonts();

// ---------- Small helpers ----------
const num = (x, d) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const say = (text) => { $('say').textContent = text; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const frame = () => new Promise((r) => window.requestAnimationFrame(r));

// ---------- The gate ----------
const list = $('checkList');
for (const c of CHECKS) {
  const li = document.createElement('li');
  li.dataset.state = 'wait';
  li.innerHTML = '<span class="ic" aria-hidden="true"></span><button type="button" class="name" aria-expanded="false"></button><span class="line"></span><p class="why" hidden></p>';
  li.querySelector('.name').textContent = c.title;
  li.querySelector('.why').textContent = c.why;
  li.querySelector('.name').addEventListener('click', (e) => {
    const why = li.querySelector('.why');
    why.hidden = !why.hidden;
    e.currentTarget.setAttribute('aria-expanded', String(!why.hidden));
  });
  list.appendChild(li);
}
const sel = $('engineSel');
for (const E of ENGINES) sel.add(new Option(E.id === 'real' ? 'The real engine' : `Broken: ${E.label}`, E.id));
sel.value = S.engine.id;
const noteEngine = () => { $('engineNote').textContent = S.engine.note; };
noteEngine();
if (S.engine.id !== 'real') $('breakBox').open = true;
sel.addEventListener('change', () => { S.engine = engineById(sel.value); noteEngine(); runGate(); });

let run = 0;
async function runGate() {
  const me = ++run;
  setGate('testing');
  const rows = [...list.children];
  for (const li of rows) {
    li.dataset.state = 'wait';
    li.querySelector('.line').textContent = '';
  }
  let failed = 0;
  let ms = 0;
  for (let i = 0; i < CHECKS.length; i++) {
    rows[i].dataset.state = 'run';
    $('checksStatus').textContent = `Running check ${i + 1} of ${CHECKS.length}`;
    $('checksChipText').textContent = `Testing ${i + 1}/${CHECKS.length}`;
    await frame();
    if (me !== run) return;
    const r = runCheck(CHECKS[i], S.engine);
    ms += r.ms;
    rows[i].dataset.state = r.pass ? 'pass' : 'fail';
    rows[i].querySelector('.line').textContent = r.line;
    if (!r.pass) failed++;
    if (!reduce) await wait(120);
    if (me !== run) return;
  }
  setGate(failed ? 'locked' : 'open', failed, ms);
}

function setGate(state, failed = 0, ms = 0) {
  S.gate = state;
  app.dataset.gate = state;
  const n = CHECKS.length;
  const dock = $('dock');
  dock.disabled = state !== 'open';
  $('startBtn').disabled = state !== 'open';
  const who = S.engine.id === 'real' ? '' : ` with "${S.engine.label}"`;
  if (state === 'open') {
    $('checksStatus').textContent = `All ${n} passed${who}, in ${num(ms / 1000, 2)} seconds of computing. Throwing is on.`;
    $('checksChipText').textContent = `${n}/${n} checks passed`;
    say(`All ${n} physics checks passed. Throwing is on.`);
    if (params.has('throw') && !S.current) { showSheet(null); throwBall(); }
  } else if (state === 'locked') {
    $('checksStatus').textContent = `${failed} of ${n} failed${who}. Throwing stays locked.`;
    $('checksChipText').textContent = `${failed} check${failed === 1 ? '' : 's'} failed`;
    $('lockNote').textContent = `Locked: ${failed} of ${n} checks failed${who}. Pick the real engine to throw.`;
    say(`${failed} of ${n} physics checks failed. Throwing stays locked.`);
  } else {
    $('lockNote').textContent = 'Throwing turns on when every check passes.';
  }
}

// Every check on every engine, as a table: each broken engine has to fail at least one, and each check has to catch
// at least one of them, or it is a check that can't fail.
$('matrixBtn').addEventListener('click', async () => {
  const box = $('matrix');
  box.hidden = false;
  box.textContent = 'Running 54 checks...';
  await frame();
  const res = ENGINES.map((E) => CHECKS.map((c) => runCheck(c, E)));
  const t = document.createElement('table');
  t.className = 'matrix';
  const head = ENGINES.map((E) => `<th scope="col">${SHORT[E.id]}</th>`).join('');
  t.innerHTML = `<thead><tr><th scope="col">Check</th>${head}</tr></thead><tbody></tbody>`;
  CHECKS.forEach((c, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th scope="row"></th>${ENGINES.map((E, j) => `<td class="${res[j][i].pass ? 'y' : 'n'}">${res[j][i].pass ? '✓' : '✗'}</td>`).join('')}`;
    tr.firstChild.textContent = c.title;
    ENGINES.forEach((E, j) => { tr.children[j + 1].title = res[j][i].line; });
    t.tBodies[0].appendChild(tr);
  });
  const caught = CHECKS.every((c, i) => ENGINES.slice(1).some((E, j) => !res[j + 1][i].pass));
  const broken = ENGINES.slice(1).every((E, j) => res[j + 1].some((r) => !r.pass));
  const realOk = res[0].every((r) => r.pass);
  const p = document.createElement('p');
  p.className = 'note';
  p.textContent = `${realOk ? 'The real engine passes all 9.' : 'The real engine failed a check.'} ${caught ? 'Every check fails on at least one broken engine' : 'Some check never fails'}, and ${broken ? 'every broken engine fails at least one check' : 'some broken engine passes everything'}. Point at a mark to see what was measured.`;
  box.replaceChildren(t, p);
});

// ---------- Sheets ----------
function showSheet(id) {
  for (const [sheet, chip] of [['checksSheet', 'checksChip'], ['goalsSheet', 'goalsChip']]) {
    $(sheet).hidden = sheet !== id;
    $(chip).setAttribute('aria-expanded', String(sheet === id));
  }
  $('readout').hidden = !!id;
}
$('checksChip').addEventListener('click', () => showSheet($('checksSheet').hidden ? 'checksSheet' : null));
$('goalsChip').addEventListener('click', () => showSheet($('goalsSheet').hidden ? 'goalsSheet' : null));
$('startBtn').addEventListener('click', () => { showSheet(null); $('throwBtn').focus(); });
$('goalsDone').addEventListener('click', () => showSheet(null));

// ---------- The speed dial ----------
const dial = $('dial');
function drawDial() {
  const digits = (S.q / 10000).toFixed(4);
  dial.replaceChildren();
  let place = 0;
  for (const ch of digits) {
    if (ch === '.') {
      const pt = document.createElement('span');
      pt.className = 'pt';
      pt.textContent = '.';
      dial.appendChild(pt);
      continue;
    }
    const b = document.createElement('button');
    const me = place++;
    b.type = 'button';
    b.textContent = ch;
    b.setAttribute('aria-pressed', String(me === S.place));
    b.setAttribute('aria-label', `${ch}, change ${['whole km/s', 'tenths', 'hundredths', 'thousandths', 'ten-thousandths'][me]}`);
    b.addEventListener('click', () => { S.place = me; drawDial(); });
    dial.appendChild(b);
  }
  $('slider').value = String(Math.round(S.q / 100));
  $('slider').setAttribute('aria-valuetext', `${(S.q / 10000).toFixed(2)} km/s`);
  hints();
}
function setQ(q) {
  S.q = Math.max(0, Math.min(MAX_Q, Math.round(q)));
  drawDial();
}
const nudge = (sign) => setQ(S.q + sign * PLACES[S.place]);
$('minus').addEventListener('click', () => nudge(-1));
$('plus').addEventListener('click', () => nudge(1));
$('slider').addEventListener('input', (e) => setQ(Number(e.target.value) * 100));
$('throwBtn').addEventListener('click', () => throwBall());
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('select, .sheet')) return;
  if (S.gate !== 'open' || e.altKey || e.ctrlKey || e.metaKey) return;
  const k = e.key;
  if (k === 'ArrowLeft' || k === 'ArrowRight') nudge(k === 'ArrowRight' ? 1 : -1);
  else if (k === 'ArrowUp' || k === 'ArrowDown') { S.place = Math.max(0, Math.min(4, S.place + (k === 'ArrowDown' ? 1 : -1))); drawDial(); }
  else if ((k === ' ' || k === 'Enter') && !(e.target.closest && e.target.closest('button, input'))) throwBall();
  else return;
  e.preventDefault();
});

function hints() {
  const h = $('hints');
  h.replaceChildren();
  const next = GUIDE.find((v) => v > S.last + 1e-9);
  if (next !== undefined && Math.abs(next - S.q / 10000) > 1e-9) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Try ${next.toFixed(2)} km/s next`;
    b.addEventListener('click', () => setQ(next * 10000));
    h.appendChild(b);
  } else if (next === undefined) {
    const s = document.createElement('span');
    s.textContent = 'Now the goals, at the top.';
    h.appendChild(s);
  }
  const s = document.createElement('span');
  s.textContent = `Orbit speed ${num(V_CIRC, 4)} km/s, escape ${num(V_ESC, 4)}`;
  h.appendChild(s);
}

// ---------- Goals ----------
const GOALS = [
  { id: 'g100', title: 'Land it 100 km away', tip: 'Anywhere from 95 to 105 km counts.',
    test: (f) => f.fate === 'landed' && Math.abs(f.along - 100) <= 5 },
  { id: 'g1000', title: 'Land it about 1,000 km away', tip: '900 to 1,100 km. Tap the third digit after the point to fine-tune.',
    test: (f) => f.fate === 'landed' && f.along >= 900 && f.along <= 1100 },
  { id: 'orbit', title: 'Make it never land', tip: 'Fast enough and the ground curves away as fast as it falls.', test: (f) => f.fate === 'orbit' },
  { id: 'circle', title: 'Keep it 1 km up all the way around', tip: 'Never more than half a km higher or lower than it started. Two speeds do it.',
    test: (f) => f.fate === 'orbit' && f.highest <= HEIGHT + 0.5 && f.lowest >= HEIGHT - 0.5 },
  { id: 'far', title: 'Land it more than 4,000 km away', tip: 'The fastest throw that still comes down. It takes all four digits after the point.',
    test: (f) => f.fate === 'landed' && f.along > 4000 },
  { id: 'gone', title: 'Throw it off the Moon for good', tip: 'Faster than escape speed.', test: (f) => f.fate === 'gone' },
];
function drawGoals() {
  const ol = $('goalList');
  ol.replaceChildren();
  for (const g of GOALS) {
    const li = document.createElement('li');
    li.className = S.done.has(g.id) ? 'done' : '';
    li.innerHTML = '<span class="ic" aria-hidden="true"></span><b></b><span class="tip"></span>';
    li.querySelector('b').textContent = g.title + (S.done.has(g.id) ? ' (done)' : '');
    li.querySelector('.tip').textContent = g.tip;
    ol.appendChild(li);
  }
  $('goalsCount').textContent = `${S.done.size}/${GOALS.length}`;
  $('record').textContent = S.far ? `Farthest landing so far: ${num(S.far.along, 1)} km, at ${S.far.v.toFixed(4)} km/s.` : '';
}
drawGoals();

// ---------- Throwing ----------
function throwBall() {
  if (S.gate !== 'open' || !player) return;
  showSheet(null);
  player.start(flight(S.engine, S.q / 10000));
}

function landed(F, text) {
  S.last = F.v;
  if (F.fate === 'landed' && (!S.far || F.along > S.far.along)) S.far = { along: F.along, v: F.v };
  const fresh = GOALS.filter((g) => !S.done.has(g.id) && g.test(F));
  for (const g of fresh) S.done.add(g.id);
  drawGoals();
  hints();
  if (fresh.length) {
    const chip = $('goalsChip');
    chip.classList.remove('flash');
    void chip.offsetWidth;
    chip.classList.add('flash');
  }
  say(`${text}${fresh.length ? ` Goal done: ${fresh.map((g) => g.title).join(', ')}.` : ''}`);
}

player = createPlayer({ view, S, reduce, mode, readout: $('readout'), onDone: landed });
// For tests and the curious: set a speed and throw from the console.
window.orbitLesson = { setSpeed: (v) => setQ(v * 10000), throwBall, state: S };
view.resize();
new ResizeObserver(() => { view.resize(); kick(); }).observe($('stage'));
drawDial();
kick();
runGate();
