import { Chess } from './chess.js';
import { START, T } from './table.js';

const W0 = 12 * 60e3 + 20e3;          // White's time on the clock when it stopped
const B0 = 10 * 60e3;                 // Black's: the 10 on the sheet
const FLAG_LIFT = 180e3;
const CHECKS = 23;                    // 50...Rc2+ to 72...Rc1+
const FILES = 'abcdefgh';
const DIAL = { w: [190, 150], b: [570, 150] };
const R = 104;

const $ = (id) => document.getElementById(id);
const boardEl = $('board'), sqsEl = $('sqs'), lineEl = $('line');
const againBtn = $('again'), resignBtn = $('resign');
const sheetEl = $('sheet'), struckEl = $('struck'), amendedEl = $('amended');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let game, clock, state, touched, checks, record, els, thinkT, drag, amended = false;

/* ---------------------------------------------------------------- the clock */
function angles(ms) {
  const t = 60 - Math.max(0, ms) / 60000;            // minutes past five; the flag falls at six
  return [((5 + t / 60) * 30) % 360, ((t % 60) * 6) % 360];
}
function flagAngle(ms) {
  if (ms <= 0 || ms >= FLAG_LIFT) return 0;
  return 70 * Math.pow(1 - ms / FLAG_LIFT, 1.6);
}
function setFlag(s, a) {
  const [cx, cy] = DIAL[s];
  $('f' + s).setAttribute('transform', `translate(${cx - 20} ${cy - R + 9}) rotate(${(a - 8).toFixed(2)})`);
}
function drawClock() {
  for (const s of ['w', 'b']) {
    const ms = s === 'w' ? clock.w : clock.b;
    const [h, m] = angles(ms);
    for (const id of ['h' + s, 'h' + s + 's']) $(id).setAttribute('transform', `rotate(${h.toFixed(2)})`);
    for (const id of ['m' + s, 'm' + s + 's']) $(id).setAttribute('transform', `rotate(${m.toFixed(2)})`);
    if (!clock.fallen) setFlag(s, flagAngle(ms));
  }
}
function plungers() {
  // the side whose clock runs has its plunger up; the other is pressed down
  for (const s of ['w', 'b']) $('p' + s).style.transform = s === clock.lastUp ? 'translateY(0px)' : 'translateY(20px)';
}
function press(next) {
  clock.lastUp = next;
  clock.run = next;
  clock.t = performance.now();
  plungers();
}
function tick() {
  const now = performance.now();
  if (clock.run && state !== 'over') {
    const dt = now - clock.t;
    clock[clock.run] -= dt;
    if (clock.b <= 0) {
      clock.b = 0;
      drawClock();
      fallFlag('b');
      end('time');
    }
  }
  clock.t = now;
  drawClock();
}
function fallFlag(s) {
  clock.fallen = true;
  const a0 = 70, t0 = performance.now(), dur = reduce ? 1 : 260;
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / dur);
    setFlag(s, a0 * (1 - k * k));
    if (k < 1) requestAnimationFrame(step);
  };
  step();
}

/* ---------------------------------------------------------------- the board */
function pos(sq) {                              // Black sits at the bottom
  const f = FILES.indexOf(sq[0]), r = +sq[1] - 1;
  return { left: (7 - f) * 12.5, top: r * 12.5 };
}
function sqAt(x, y) {
  const b = sqsEl.getBoundingClientRect();
  const cx = Math.floor((x - b.left) / b.width * 8), cy = Math.floor((y - b.top) / b.height * 8);
  if (cx < 0 || cx > 7 || cy < 0 || cy > 7) return null;
  return FILES[7 - cx] + (cy + 1);
}
function place(el, sq) {
  const p = pos(sq);
  el.style.left = p.left + '%';
  el.style.top = p.top + '%';
  el.dataset.sq = sq;
}
function makePiece(sq, p) {
  const el = document.createElement('div');
  el.className = 'pc';
  const img = document.createElement('img');
  img.src = `img/pc_${p.color}${p.type.toUpperCase()}.webp`;
  img.alt = '';
  img.draggable = false;
  el.appendChild(img);
  el.dataset.pc = p.color + p.type;
  place(el, sq);
  sqsEl.appendChild(el);
  return el;
}
function buildPieces() {
  sqsEl.querySelectorAll('.pc').forEach((e) => e.remove());
  els = {};
  for (const row of game.board()) for (const c of row) if (c) els[c.square] = makePiece(c.square, c);
}
function reconcile() {                          // after any move: the DOM equals the position
  const want = {};
  for (const row of game.board()) for (const c of row) if (c) want[c.square] = c;
  for (const sq of Object.keys(els)) {
    const w = want[sq];
    if (!w || els[sq].dataset.pc !== w.color + w.type) { const e = els[sq]; delete els[sq]; e.classList.add('gone'); setTimeout(() => e.remove(), 320); }
  }
  for (const sq of Object.keys(want)) if (!els[sq]) els[sq] = makePiece(sq, want[sq]);
}
function animateMove(mv) {
  const el = els[mv.from];
  const victim = els[mv.to];
  if (victim && victim !== el) { delete els[mv.to]; victim.classList.add('gone'); setTimeout(() => victim.remove(), 320); }
  delete els[mv.from];
  if (el) { el.classList.remove('lift', 'touched'); place(el, mv.to); els[mv.to] = el; }
  if (mv.promotion && el) { el.dataset.pc = mv.color + mv.promotion; el.firstChild.src = `img/pc_${mv.color}${mv.promotion.toUpperCase()}.webp`; }
  reconcile();
}
function squares() { return sqsEl.querySelectorAll('.sq'); }
function sqEl(sq) { return sqsEl.querySelector(`.sq[data-sq="${sq}"]`); }
function marks(sq) {
  sqsEl.querySelectorAll('.mk').forEach((e) => e.remove());
  if (!sq) return;
  for (const m of game.moves({ square: sq, verbose: true })) {
    const d = document.createElement('div');
    const f = FILES.indexOf(m.to[0]), r = +m.to[1] - 1;
    d.className = 'mk' + ((f + r) % 2 === 0 ? ' d' : '') + (m.captured ? ' cap' : '');
    const p = pos(m.to);
    d.style.left = p.left + '%';
    d.style.top = p.top + '%';
    sqsEl.insertBefore(d, sqsEl.querySelector('.pc'));
  }
}
function highlight(mv) {
  squares().forEach((e) => e.classList.remove('last', 'chk'));
  if (mv) { sqEl(mv.from).classList.add('last'); sqEl(mv.to).classList.add('last'); }
  if (game.inCheck()) {
    for (const row of game.board()) for (const c of row) if (c && c.type === 'k' && c.color === game.turn()) sqEl(c.square).classList.add('chk');
  }
}
function setTouched(sq) {
  if (touched && els[touched]) els[touched].classList.remove('touched');
  touched = sq;
  if (sq && els[sq]) els[sq].classList.add('touched');
  marks(sq);
}

/* ---------------------------------------------------------------- the line under the board */
function writeLine(result, word) {
  if (!record.length && !result) { lineEl.textContent = 'Black to move.'; return; }
  let s = '';
  for (const r of record) {
    if (r.c === 'b') s += (s ? ' ' : `${r.n}… `) + r.san;
    else s += ` ${r.n}. ${r.san}`;
  }
  if (word) s += (s ? ' ' : `${START.split(' ')[5]}… `) + word;   // as he wrote it on the sheet
  lineEl.textContent = s;
  if (result) { const e = document.createElement('span'); e.className = 'res'; e.textContent = result; lineEl.appendChild(e); }
}

/* ---------------------------------------------------------------- moves */
function key() { return game.fen().split(' ').slice(0, 4).join(' '); }
function reply() { return game.turn() === 'w' ? T[game.fen().split(' ')[0]] : undefined; }
function occurrences(k) {
  let n = START.split(' ').slice(0, 4).join(' ') === k ? 1 : 0;
  for (const m of game.history({ verbose: true })) if (m.after.split(' ').slice(0, 4).join(' ') === k) n++;
  return n;
}
function rookTake() {                           // a capture of the rook that leaves Black with no move: stalemate
  const caps = game.moves({ verbose: true }).filter((m) => m.captured === 'r')
    .sort((a, b) => (a.piece === 'k' ? 0 : 1) - (b.piece === 'k' ? 0 : 1));
  for (const m of caps) {
    game.move(m.san);
    const st = game.isStalemate();
    game.undo();
    if (st) return m.from + m.to;
  }
  return null;
}
function fallback() {                           // never reached while the table is complete
  const all = game.moves({ verbose: true });
  for (const m of all) { game.move(m.san); const mate = game.isCheckmate(); game.undo(); if (mate) return m.from + m.to + (m.promotion || ''); }
  const k = all.find((m) => m.piece === 'k' && !m.captured);
  const m = k || all[0];
  return m.from + m.to + (m.promotion || '');
}
function whiteMove() {
  const k = key();
  const t = reply();
  let uci = t ? t.replace('!', '') : null;
  const won = !!t && t.endsWith('!');
  if (!won && (checks >= CHECKS || occurrences(k) >= 2)) { const take = rookTake(); if (take) uci = take; }
  if (!uci) uci = fallback();
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined };
}
function play(m, side) {
  const mv = game.move(m);
  animateMove(mv);
  highlight(mv);
  const n = +game.fen().split(' ')[5] - (side === 'b' ? 1 : 0);   // the move number this ply belongs to
  record.push({ c: side, n, san: mv.san });
  if (side === 'b' && mv.san.includes('+')) checks++;
  return mv;
}
function after(side) {
  if (game.isCheckmate()) return end('mate');
  if (game.isStalemate()) return end('stalemate');
  if (game.isThreefoldRepetition() || game.isDrawByFiftyMoves() || game.isInsufficientMaterial()) return end('draw');
  if (side === 'b') {
    state = 'white';
    const won = (reply() || '').endsWith('!');
    const think = (won ? 900 : 1100) + ((game.history().length * 7919) % 1100);
    thinkT = setTimeout(() => {
      if (state !== 'white') return;
      play(whiteMove(), 'w');
      press('b');
      writeLine();
      state = 'black';
      after('w');
    }, think);
  }
}
function blackMove(from, to) {
  const mv = game.moves({ square: from, verbose: true }).find((m) => m.to === to);
  if (!mv) return false;
  setTouched(null);
  play({ from, to, promotion: mv.promotion ? 'q' : undefined }, 'b');
  press('w');
  writeLine();
  after('b');
  return true;
}

/* ---------------------------------------------------------------- the end */
function end(kind) {
  if (state === 'over') return;
  state = 'over';
  clearTimeout(thinkT);
  clock.run = null;
  setTouched(null);
  resignBtn.hidden = true;
  if (kind === 'stalemate' || kind === 'draw') {
    writeLine('½–½');
    setTimeout(pen, 900);
    return;
  }
  writeLine('1–0', kind === 'resign' ? 'resigns' : '');
  if (kind === 'resign') {
    for (const sq of Object.keys(els)) if (els[sq].dataset.pc === 'bk') els[sq].classList.add('tip');
  }
  setTimeout(() => { againBtn.hidden = false; }, 1800);
}
function reveal(el, from, dur) {
  const kf = [{ clipPath: `inset(0 ${from}% 0 0)` }, { clipPath: 'inset(0 0% 0 0)' }];
  el.style.clipPath = 'inset(0 0% 0 0)';
  if (!reduce && el.animate) el.animate(kf, { duration: dur, easing: 'linear' });
}
function pen() {
  if (amended) return;
  amended = true;
  const r = amendedEl.getBoundingClientRect();
  const away = r.top < 0 || r.bottom > innerHeight;
  if (away) amendedEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  setTimeout(() => {
    reveal(struckEl, 100, 520);                         // one straight line through 1-0
    setTimeout(() => reveal(amendedEl, 52, 1500), 900); // then 1/2-1/2 beside it
    sheetEl.querySelector('img').alt = 'Score sheet. Junior Open, round 3, board 14. White: R. Black: Daniel Fenn. Result: 1–0, crossed out; ½–½.';
  }, away ? 800 : 0);
}

/* ---------------------------------------------------------------- input (touch move: a touched piece must be moved) */
function own(sq) {
  const p = game.get(sq);
  return p && p.color === 'b' && game.moves({ square: sq }).length > 0;
}
function dragTo(x, y) {
  const b = sqsEl.getBoundingClientRect();
  drag.el.style.left = ((x - b.left) / b.width * 100 - 6.25) + '%';
  drag.el.style.top = ((y - b.top) / b.height * 100 - 6.25) + '%';
}
boardEl.addEventListener('pointerdown', (e) => {
  if (state !== 'black') return;
  const sq = sqAt(e.clientX, e.clientY);
  if (!sq) return;
  e.preventDefault();
  if (touched && sq !== touched) { blackMove(touched, sq); return; }
  if (!own(sq)) return;
  setTouched(sq);
  drag = { sq, el: els[sq], x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
  try { boardEl.setPointerCapture(e.pointerId); } catch (_) {}
});
boardEl.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) return;
  drag.moved = true;
  drag.el.classList.add('lift');
  dragTo(e.clientX, e.clientY);
});
function drop(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  d.el.classList.remove('lift');
  if (!d.moved) return;
  const to = sqAt(e.clientX, e.clientY);
  if (to && to !== d.sq && state === 'black') {
    d.el.style.transition = 'none';
    const ok = blackMove(d.sq, to);
    requestAnimationFrame(() => { d.el.style.transition = ''; });
    if (ok) return;
  }
  place(d.el, d.sq);
}
boardEl.addEventListener('pointerup', drop);
boardEl.addEventListener('pointercancel', drop);
boardEl.addEventListener('contextmenu', (e) => e.preventDefault());

resignBtn.addEventListener('click', () => { if (state !== 'over') end('resign'); });
againBtn.addEventListener('click', () => { againBtn.hidden = true; setup(); });
sheetEl.addEventListener('click', () => {
  const big = !sheetEl.classList.contains('big');
  sheetEl.classList.toggle('big', big);
  document.body.style.overflow = big ? 'hidden' : '';
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheetEl.classList.contains('big')) sheetEl.click(); });

/* ---------------------------------------------------------------- set up */
function setup() {
  clearTimeout(thinkT);
  game = new Chess(START);
  record = [];
  checks = 0;
  touched = null;
  drag = null;
  clock = { w: W0, b: B0, run: null, t: performance.now(), fallen: false, lastUp: 'b' };
  buildPieces();
  marks(null);
  highlight({ from: 'e6', to: 'f7' });          // 50.exf7, the last move before he resigned
  writeLine();
  resignBtn.hidden = false;
  state = 'black';
  press('b');                                   // Black's clock is running
  drawClock();
}
setup();
setInterval(tick, 200);
document.addEventListener('visibilitychange', tick);
