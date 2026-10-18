// The Gate: every page of the range becomes a dot (or one dot stands for u pages), the dots walk
// a garden road past four lanterns that each ask one question, and the first yes drops a dot
// into its pile. DESIGN.md §A.4 "The Gate" is the spec; this is the engine.
//
// How it stays smooth and exact:
// - Every dot's whole life is a function of one clock. At build time each dot gets a spawn time
//   (from a seeded shuffle, so every visitor and every reload sees the same replay), and from its
//   kind's walking speed the times it reaches its lantern, starts to fall and lands. A frame just
//   evaluates "where is dot i at time T". Nothing integrates, so a dropped frame never drifts,
//   a resize mid-replay simply lays out again and carries on, and Skip is "T = the end".
// - The per-dot facts live in typed arrays, and the dots are stamped from a sprite atlas
//   (gate-sprites.js), so 1,600 of them cost well under a millisecond a frame.
// - Two canvases: the scenery (redrawn only on resize or day/night) and the dots (cleared each
//   frame while anything moves). One frameLoop; it stops when nothing moves, when the stage is
//   off screen and while the tab is hidden.
// - Words are never painted: stations, pile labels, bracket labels, the key and the buttons are
//   DOM over the canvases, so screen readers, keyboards and zoom all get real text.
import { frame, layout, slotXY, at, hitTest, KIND_ORDER } from './gate-layout.js';
import { buildAtlas, stamp } from './gate-sprites.js';
import { drawArt, doorRect } from './gate-art.js';

const PERSONALITY = [
  // speed ×, lateral jitter px, dwell at the lantern ms
  { speed: 1.0, jit: 0, dwell: 90 },    // bot: single file, a polite pause
  { speed: 1.15, jit: 6, dwell: 90 },   // scanner: zig-zags, tries every door
  { speed: 1.35, jit: 0, dwell: 0 },    // agent: a program doesn't stop to look
  { speed: 0.8, jit: 2, dwell: 90 },    // stale: a slight wobble, in costume
  { speed: 1.0, jit: 3, dwell: 0 },     // person: strolls to the end
];
const POP = 260, DROP = 320, SETTLE = 120, RATTLE = 180;
const BLINK = 200;           // lantern light per catch, ms of replay time
const BRACKET_MS = 220, PETAL_MS = 2400, BLOOM_MS = 400, FADE_MS = 160, DIM_MS = 200;
const YOU_MS = 1600;
// At most this many guests are drawn walking the road (wide, tall). A month is over a thousand
// dots; drawn all at once they merge into one grey worm and hide the stones. The rest still
// arrive: they appear at their lantern, pop into their glyph and drop like everyone else.
const WALKERS = [110, 60];
const DIM = 0.35;
const SPRITE_OF = ['bot', 'scanner', 'agent', 'stale'];
const NS = 'http://www.w3.org/2000/svg';

// The petal drifts once per visit to the tab, after the first full replay: never after a bloom
// (a repeat visit) and never on later replays.
let petalShown = (() => {
  try { return sessionStorage.getItem('st-gate-seen') === '1'; } catch (e) { return false; }
})();

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function createGate(host, opts) {
  const { motion, EASE } = opts;
  const easeIn = EASE.in, easeOut = EASE.out, overshoot = EASE.overshoot, std = EASE.std;

  // ---------- DOM ----------
  host.classList.add('st-gate-host');
  host.textContent = '';
  const top = el('div', 'st-gate-top');
  const status = el('p', 'st-gate-status');
  const statusText = el('span', 'st-gate-status-text');
  statusText.setAttribute('aria-hidden', 'true');
  const filesNote = el('span', 'st-gate-files');
  const backBtn = el('button', 'st-gate-textbtn', 'Back to pages');
  backBtn.type = 'button';
  filesNote.append('Counting files, not pages · ', backBtn);
  status.append(statusText, filesNote);
  const key = el('p', 'st-gate-key');
  const skip = el('button', 'st-gate-skip st-gate-textbtn', 'Skip');
  skip.type = 'button';
  const youBtn = el('button', 'st-gate-you', 'Am I in here?');
  youBtn.type = 'button';
  const topRight = el('div', 'st-gate-topright');
  topRight.append(key, skip);
  top.append(youBtn, status, topRight);

  const stage = el('div', 'st-gate-stage');
  const bg = el('canvas', 'st-gate-bg');
  const fx = el('canvas', 'st-gate-fx');
  bg.setAttribute('aria-hidden', 'true');
  fx.setAttribute('aria-hidden', 'true');
  const stationsBox = el('div', 'st-gate-stations');
  const piles = el('div', 'st-gate-piles');
  piles.setAttribute('role', 'group');
  piles.setAttribute('aria-label', 'The five piles');
  const bracketBox = el('div', 'st-gate-bracket');
  bracketBox.setAttribute('aria-hidden', 'true');
  const bTop = el('span', 'st-gate-blab st-gate-blab-hi');
  const bSeam = el('span', 'st-gate-blab st-gate-blab-lo');
  bracketBox.append(bTop, bSeam);
  const stampsBox = el('div', 'st-gate-stamps');
  stampsBox.setAttribute('aria-hidden', 'true');
  // The first replay waits until this line (just under the piles' shared ground) is on screen,
  // so the people pile and its bracket land where the reader can see them (see setModel).
  const ground = el('div', 'st-gate-ground');
  ground.setAttribute('aria-hidden', 'true');
  stage.append(bg, fx, stationsBox, piles, bracketBox, stampsBox, ground);
  const foot = el('div', 'st-gate-foot');
  host.append(top, stage, foot);

  const stationBtns = [], labelBtns = [], labelParts = [];
  const unbinds = [];
  KIND_ORDER.forEach((kind, k) => {
    const s = el('button', 'st-gate-station');
    s.type = 'button';
    s.dataset.kind = kind;
    stationsBox.append(s);
    stationBtns.push(s);
    if (opts.bindStation) unbinds.push(opts.bindStation(s, k) || (() => {}));
    s.addEventListener('click', () => finish());

    const b = el('button', 'st-gate-label');
    b.type = 'button';
    b.dataset.kind = kind;
    b.setAttribute('aria-expanded', 'false');
    if (opts.drawerId) b.setAttribute('aria-controls', opts.drawerId);
    const eb = el('span', 'st-gate-eb');
    const nameRow = el('span', 'st-gate-name');
    const glyph = opts.glyphSVG ? opts.glyphSVG(kind, { size: 12 }) : null;
    const nameText = el('span', 'st-gate-nametext');
    if (glyph) nameRow.append(glyph);
    nameRow.append(nameText);
    const fig = el('span', 'st-gate-fig');
    const numEl = el('span', 'st-gate-num');
    const shareEl = el('span', 'st-gate-share');
    fig.append(numEl, shareEl);
    b.append(eb, nameRow, fig);
    piles.append(b);
    labelBtns.push(b);
    labelParts.push({ eb, nameText, numEl, shareEl, shown: '' });

    b.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') setHover(k); });
    b.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') setHover(-1); });
    b.addEventListener('focus', () => setHover(k));
    b.addEventListener('blur', () => setHover(-1));
    b.addEventListener('click', () => { finish(); opts.onPick?.(kind, b); });
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      labelBtns[(k + d + 5) % 5].focus();
    });
  });

  skip.addEventListener('click', () => {
    if (phase === 'replay' || phase === 'bloom') finish();
    else replay(1);
  });
  backBtn.addEventListener('click', () => opts.onUnitBack?.());
  // detail 0 means Enter or Space: the hero then moves focus into the result it opens.
  youBtn.addEventListener('click', (e) => opts.onYou?.(youBtn, { keyboard: e.detail === 0 }));
  youBtn.addEventListener('pointerenter', () => opts.onYouNear?.(), { once: true });
  youBtn.addEventListener('focus', () => opts.onYouNear?.(), { once: true });

  // The pile columns themselves are targets too, not just their labels (§A.4 interactions).
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || !geo) return;
    if (e.target !== fx) return;
    const k = hitAt(e);
    fx.style.cursor = k >= 0 ? 'pointer' : '';
    setHover(k);
  });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') setHover(-1); });
  fx.addEventListener('click', (e) => {
    const k = hitAt(e);
    if (k < 0) return;
    finish();
    opts.onPick?.(KIND_ORDER[k], labelBtns[k]);
  });
  function hitAt(e) {
    const r = fx.getBoundingClientRect();
    return hitTest(geo, e.clientX - r.left, e.clientY - r.top);
  }

  // ---------- state ----------
  let model = null;          // what to show (from hero.js)
  let geo = null;            // layout for the current width
  let atlas = null;
  let pal = null;
  let dpr = 1;
  let forced = null;
  let N = 0;
  let walkA;                // 1 = drawn on the road, 0 = appears at its lantern
  let kindA, slotA, spriteA, scaleA, tSpawn, tArr, tDrop, tLand, txA, tyA, laneA;
  let endT = 0;              // replay time when the last dot has settled
  let T = 0;                 // replay clock, ms
  let speed = 1;
  let phase = 'idle';        // idle | wait | replay | bloom | fade | final
  let phaseT = 0;            // real ms inside bloom / fade
  let pending = null;        // a model waiting for the fade to finish
  let started = false;       // has the first replay begun?
  let offWait = [], waitT = 0;   // the first replay's triggers, while phase is "wait"
  let visible = true;
  let doneAt = -1;           // real-time ms since the end (bracket draw, petal)
  let petal = false;
  let hover = -1, lit = -1, brushK = -1, veilK = -1;
  const alpha = new Float32Array(5).fill(1);
  let lastCatch = new Float32Array(5).fill(-1e9);
  let landed = new Int32Array(5);
  let you = null;            // { k, t, from, to, landed, stamps }
  let lowFx = false, slowFrames = 0;
  let chromeKey = '';
  let inkT = 0;              // scenery ink-in, real ms
  let inked = false;
  const tmp = [0, 0, 0, 0];

  const loop = opts.frameLoop((dt) => step(dt));

  // ---------- model and layout ----------
  function rebuild() {
    if (!model) return;
    const W = Math.floor(host.clientWidth || stage.clientWidth || 0);
    if (W < 200) return;
    geo = layout(W, model.values, { lo: model.loForSolid || 0, alloc: opts.alloc, maxH: fitH() });
    host.classList.toggle('st-gate-tall', geo.tall);
    host.classList.toggle('st-gate-wide', !geo.tall);
    // Moving a node drops its focus, so the chrome only moves when its arrangement changes.
    const ck = geo.tall ? 'tall' : keyFits() ? 'wide-in' : 'wide';
    if (ck !== chromeKey) { chromeKey = ck; placeChrome(); }
    sizeCanvases();
    buildDots();
    positionOverlay();
    drawBg();
  }

  // The most height the wide stage can take with its numbers and the button row under it still
  // above the bottom of the scroller (which ends where the fixed footer starts), measured as if
  // the page were at the top: where the reader first meets the gate. The stage's own height
  // never moves its top, so this can't feed back on itself.
  function fitH() {
    const sr = opts.scrollRoot?.();
    if (!sr) return Infinity;
    const R = sr.getBoundingClientRect();
    const topIn = stage.getBoundingClientRect().top - R.top + sr.scrollTop;
    const footH = foot.offsetHeight > 20 ? foot.offsetHeight : 36;
    return R.height - topIn - footH - 14;
  }
  // A window made shorter or taller (or the lede re-wrapping once its font loads) changes that.
  function refit() {
    if (!geo || geo.tall || !model) return;
    const f = frame(geo.W, { maxH: fitH() });
    if (f.H !== geo.H) { rebuild(); draw(); kick(); }
  }

  function placeChrome() {
    // Wide: nothing above the scene, so the piles sit as high on the screen as they can. The key
    // goes in the stage's top-right corner when there's room beside the doorway, and
    // "Am I in here?", the status line and Skip/Replay in one row under the labels.
    // Tall: "Am I in here?", the key and Skip in a row over the rail (where a thumb is).
    if (geo.tall) {
      top.append(youBtn, key, skip);
      foot.append(status);
      key.classList.remove('st-gate-key-in');
    } else {
      const roomy = keyFits();
      key.classList.toggle('st-gate-key-in', roomy);
      if (roomy) { stage.append(key); foot.append(youBtn, status, topRight); topRight.append(skip); }
      else { foot.append(youBtn, status, topRight); topRight.append(key, skip); }
    }
  }

  // The key needs about 150px between the doorway's right eave tip and the stage's edge.
  function keyFits() { return geo.W - (geo.xc[4] + geo.wp / 2 + 32) >= 150; }

  // Canvas resolution. Fine pointers get up to 2x. Phones get 2x on the rail too (at most 700 dots,
  // drawn only while something moves, and a 1.5x rail looks smeared beside the crisp labels);
  // a coarse-pointer wide stage (a tablet, up to 1,600 dots) stays at 1.5x. If frames still run
  // long, draw() drops to 1.5x along with the halos (lowFx).
  function sizeCanvases() {
    const coarse = matchMedia('(pointer: coarse)').matches;
    const cap = lowFx ? 1.5 : coarse && !geo.tall ? 1.5 : 2;
    dpr = Math.min(window.devicePixelRatio || 1, cap);
    stage.style.height = geo.H + 'px';
    for (const c of [bg, fx]) {
      c.width = Math.round(geo.W * dpr);
      c.height = Math.round(geo.H * dpr);
      c.style.width = geo.W + 'px';
      c.style.height = geo.H + 'px';
    }
    refreshPalette();
  }

  function refreshPalette() {
    pal = opts.palette();
    forced = matchMedia('(forced-colors: active)').matches ? systemColor('CanvasText') : null;
    if (!geo) return;
    atlas = buildAtlas({ pal, r: geo.r, p: geo.p, dpr, glyphPath: opts.glyphPath, forced });
    layers = null;
  }

  function systemColor(name) {
    const probe = el('span');
    probe.style.color = name;
    host.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }

  function buildDots() {
    const d = geo.dots;
    N = d.reduce((a, b) => a + b, 0);
    kindA = new Uint8Array(N); slotA = new Uint16Array(N); spriteA = new Uint8Array(N);
    scaleA = new Float32Array(N); tSpawn = new Float32Array(N); tArr = new Float32Array(N);
    tDrop = new Float32Array(N); tLand = new Float32Array(N); txA = new Float32Array(N);
    tyA = new Float32Array(N); laneA = new Float32Array(N); tRest = new Float32Array(N);
    walkA = new Uint8Array(N);
    const stride = Math.max(1, Math.ceil(N / WALKERS[geo.tall ? 1 : 0]));
    // Dots in kind order, then a seeded shuffle gives the walking order.
    const order = new Uint16Array(N);
    let i = 0;
    for (let k = 0; k < 5; k++) for (let j = 0; j < d[k]; j++) order[i++] = k;
    const rnd = opts.mulberry32(opts.hashString(model.seed));
    for (let a = N - 1; a > 0; a--) {
      const b = Math.floor(rnd() * (a + 1));
      const t = order[a]; order[a] = order[b]; order[b] = t;
    }
    const v = (geo.tall ? 380 : 520) / 1000;
    const S = Math.max(900, Math.min(1800, N * 2.2));
    const seen = [0, 0, 0, 0, 0];
    endT = 0;
    for (let n = 0; n < N; n++) {
      const k = order[n];
      const j = seen[k]++;
      const P = PERSONALITY[k];
      kindA[n] = k;
      slotA[n] = j;
      // sprite: 0..3 machine glyphs, 4 counted person, 5 looked like a person
      spriteA[n] = k < 4 ? k : (j < geo.solid ? 4 : 5);
      scaleA[n] = geo.crumbs[k] ? Math.max(1.5 / geo.r, geo.crumbs[k]) : 1;
      // Spawn times are spread evenly (the spec started with an ease-in, n^1.35, which packed
      // the first walkers a couple of pixels apart).
      tSpawn[n] = S * (n / Math.max(1, N));
      walkA[n] = n % stride === 0 ? 1 : 0;
      tArr[n] = tSpawn[n] + geo.stationS[k] / (v * P.speed);
      tDrop[n] = tArr[n] + P.dwell;
      tLand[n] = tDrop[n] + DROP;
      const [x, y] = slotXY(geo, k, j);
      txA[n] = x; tyA[n] = y;
      laneA[n] = rnd() * 2 - 1;
      const end = tLand[n] + SETTLE + (k === 1 ? RATTLE : 0);
      tRest[n] = end;
      if (end > endT) endT = end;
    }
    settleOrder = Uint16Array.from({ length: N }, (_, n) => n).sort((p, q) => tRest[p] - tRest[q]);
    layers = null;
    if (you) placeYouTarget();
  }

  // ---------- overlay (DOM words) ----------
  function positionOverlay() {
    const m = model;
    KIND_ORDER.forEach((kind, k) => {
      const lab = m.labels[k];
      const s = stationBtns[k];
      s.textContent = lab.station;
      const b = labelBtns[k];
      const parts = labelParts[k];
      parts.eb.textContent = lab.eyebrow;
      b.setAttribute('aria-label', lab.aria);
      parts.shareEl.textContent = lab.share;
      const pl = geo.piles[k];
      if (!geo.tall) {
        // All five questions on one line, the doorway's included (its roof sits below it).
        s.style.cssText = `left:${geo.xc[k]}px;top:16px`;
        b.style.cssText = `left:${geo.xc[k] - geo.labelW / 2}px;top:${geo.yBase + 4}px;width:${geo.labelW}px`;
        setName(parts.nameText, lab.long);
      } else {
        s.style.cssText = `left:${geo.bandX}px;top:${pl.y}px`;
        b.style.cssText = `left:0;top:${pl.lineY}px;width:${geo.W}px;height:${geo.rowH - 13}px`;
        setName(parts.nameText, lab.short);
      }
    });
    if (!geo.tall) fitNames();
    // The sentinel for the first replay: the ground line plus the labels' eyebrow row (wide), or
    // the bottom of the people band (tall).
    ground.style.top = (geo.tall ? geo.piles[4].bandTop + 3 * geo.p : geo.yBase + 18) + 'px';
    key.textContent = '';
    key.append(`Each dot = ${opts.num(geo.u)} ${m.unitWord(geo.u)}`);
    // On the rail the bracket under the people band already says which dots were counted.
    if (m.unit === 'pages' && geo.dots[4] > 0 && !geo.tall) {
      const a = el('span', 'st-gate-keyitem');
      if (opts.glyphSVG) a.append(opts.glyphSVG('person', { size: 10 }));
      a.append(' counted');
      const b = el('span', 'st-gate-keyitem');
      if (opts.glyphSVG) b.append(opts.glyphSVG('person', { size: 10, tier: 'ring' }));
      // When the counter's estimate topped the server's count on some day, part of the rings is
      // that estimate, not pages that merely looked like a person's: say "maybe" instead.
      b.append(m.swapped ? ' maybe' : ' looked like a person');
      key.append(a, b);
    }
    filesNote.hidden = m.unit !== 'files';
    host.classList.toggle('st-gate-reduced', motion.reduced);
    setLabelNumbers(phase === 'final' || phase === 'idle' && motion.reduced ? 1 : null);
    positionBracket();
    updateStatus();
    applyDimClasses();
  }

  // Long names where they fit in two lines, short names where they don't (§A.4 pile labels).
  // The name sits in a fixed two-line slot (hero.css), so a one-line name and a two-line name
  // leave their numbers on the same baseline.
  function fitNames() {
    labelParts.forEach((parts, k) => {
      setName(parts.nameText, model.labels[k].long);
      const lh = parseFloat(getComputedStyle(parts.nameText).lineHeight) || 17;
      if (parts.nameText.getBoundingClientRect().height > lh * 2 + 2) setName(parts.nameText, model.labels[k].short);
    });
  }

  // A hyphenated word never breaks at its hyphens ('Out-of-' over 'date browsers'): each one is
  // kept whole in a nowrap span. Spaces still wrap.
  function setName(node, text) {
    node.textContent = '';
    for (const w of text.split(/(\s+)/)) {
      if (w.includes('-')) node.append(el('span', 'st-gate-nobr', w));
      else if (w) node.append(w);
    }
  }

  function positionBracket() {
    const show = model.unit === 'pages' && geo.dots[4] > 0;
    bracketBox.hidden = !show;
    if (!show) return;
    const br = geo.bracket;
    bTop.textContent = `at most ${opts.num(model.hi)}`;
    // On days the counter's estimate came out above the server's count, the low end is partly
    // the server's count, so the label stops naming the counter as its source.
    bSeam.textContent = !(model.loRaw > 0) ? ''
      : model.swapped ? `at least ${model.loWords}`
        : `${model.loWords} counted${geo.tall ? '' : " by Cloudflare's counter"}`;
    bSeam.hidden = !(model.loRaw > 0);
    if (!geo.tall) {
      const w = Math.max(80, br.labelW);
      bTop.style.cssText = `left:${br.labelX}px;width:${w}px;top:${br.top}px;transform:translateY(-62%)`;
      // The seam label hangs below its tick, but never below the ground line.
      bSeam.style.cssText = `left:${br.labelX}px;width:${w}px;top:${br.seam}px`;
      const h = bSeam.getBoundingClientRect().height || 46;
      const ty = Math.min(br.seam - 7, geo.yBase - h);
      bSeam.style.top = Math.max(br.top + 14, ty) + 'px';
    } else {
      // Tall, all on the bracket's own row: "about X counted ├──┤ at most Y". The rail has ended
      // above this row, so the left label may run out to the stage's edge. If even that is too
      // narrow it drops "counted"; the "at most" label slides left rather than wrap.
      const y = br.y - 8;
      bSeam.style.cssText = `top:${y}px;right:${geo.W - br.seam + 7}px;left:auto`;
      if (br.seam - 7 - bSeam.getBoundingClientRect().width < 0) {
        bSeam.textContent = model.loWords;
        if (br.seam - 7 - bSeam.getBoundingClientRect().width < 0) bSeam.style.cssText = `top:${y}px;left:0`;
      }
      bTop.style.cssText = `top:${y}px;left:${br.end + 7}px`;
      if (br.end + 7 + bTop.getBoundingClientRect().width > geo.W) bTop.style.cssText = `top:${y}px;right:0;left:auto`;
    }
  }

  // Pile numbers: the final figures scaled by how many of the pile's dots have landed, written
  // exactly once the last one lands. f = null reads the landing counts.
  // The share waits, hidden, until its pile is complete: "0 · 35%" would read as a contradiction.
  function setLabelNumbers(f) {
    for (let k = 0; k < 5; k++) {
      const lab = model.labels[k];
      const dots = geo ? geo.dots[k] : 0;
      const frac = f != null ? f : dots ? landed[k] / dots : 1;
      const txt = lab.fmt(frac >= 1 ? 1 : frac);
      const parts = labelParts[k];
      if (parts.shown !== txt) { parts.numEl.textContent = txt; parts.shown = txt; }
      parts.shareEl.classList.toggle('st-gate-share-wait', frac < 1);
    }
  }

  function updateStatus() {
    const running = phase === 'replay' || phase === 'bloom' || phase === 'fade';
    statusText.textContent = running ? model.statusRun : model.unit === 'files' ? '' : model.statusDone;
    statusText.hidden = model.unit === 'files' && !running;
    filesNote.hidden = model.unit !== 'files' || running;
    skip.hidden = motion.reduced || phase === 'wait' || phase === 'idle' || N === 0;
    skip.textContent = running ? 'Skip' : 'Replay';
    skip.setAttribute('aria-label', running ? 'Skip the sorting' : 'Replay the sorting');
    host.classList.toggle('st-gate-running', running);
  }

  // ---------- drawing ----------
  function drawBg() {
    const g = bg.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, geo.W, geo.H);
    const ink = inked || motion.reduced ? 1 : std(Math.min(1, inkT / 700));
    drawArt(g, geo, pal, ink);
  }

  // ---------- landed-dot layers ----------
  // A dot that has come to rest never moves again, so it is stamped once into a small canvas per
  // pile (plus one for the people's halos), and a frame draws six bitmaps instead of every
  // settled dot. Only the dots still walking, popping or falling are stamped each frame, which
  // keeps a frame cheap however many dots have already landed.
  let layers = null;
  let tRest = null, settleOrder = null, stamped = 0, layersGlow = false;

  function glowOn() { return !lowFx && !forced && pal.mode === 'night' && model.unit === 'pages'; }
  const spriteKey = (s) => (s < 4 ? SPRITE_OF[s] : s === 4 ? 'pS' : 'pR');

  function makeLayers() {
    const pad = Math.ceil(2.4 * geo.r) + 3;
    const mk = (x0, y0, x1, y1) => {
      const x = Math.floor(x0 - pad), y = Math.floor(y0 - pad);
      const w = Math.max(1, Math.ceil(x1 + pad) - x), h = Math.max(1, Math.ceil(y1 + pad) - y);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * dpr));
      c.height = Math.max(1, Math.round(h * dpr));
      const lg = c.getContext('2d');
      lg.setTransform(dpr, 0, 0, dpr, -x * dpr, -y * dpr);
      return { c, g: lg, x, y, w, h };
    };
    const box = (k) => {
      const pl = geo.piles[k];
      if (!geo.tall) {
        const rows = Math.max(1, Math.ceil(geo.dots[k] / geo.cols));
        return [pl.left, geo.yBase - rows * geo.p, pl.right, geo.yBase];
      }
      return [geo.bandX, pl.bandTop, geo.bandX + Math.max(1, Math.ceil(geo.dots[k] / 3)) * geo.p, pl.bandTop + 3 * geo.p];
    };
    layers = KIND_ORDER.map((_, k) => mk(...box(k)));
    layers.glow = mk(...box(4));
    layersGlow = glowOn();
    stamped = 0;
  }

  function syncLayers(tNow) {
    if (!layers || layersGlow !== glowOn()) makeLayers();
    // Going back in time (a new replay) starts the layers over.
    if (stamped > 0 && tRest[settleOrder[stamped - 1]] > tNow) {
      for (const L of [...layers, layers.glow]) L.g.clearRect(L.x, L.y, L.w, L.h);
      stamped = 0;
    }
    while (stamped < N && tRest[settleOrder[stamped]] <= tNow) {
      const i = settleOrder[stamped++];
      if (layersGlow && spriteA[i] === 4) stamp(layers.glow.g, atlas, 'glow', txA[i], tyA[i], scaleA[i]);
      stamp(layers[kindA[i]].g, atlas, spriteKey(spriteA[i]), txA[i], tyA[i], scaleA[i]);
    }
  }

  function draw() {
    const t0 = performance.now();
    const g = fx.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, geo.W, geo.H);
    if (!N && !you) { drawBracket(g); return 0; }

    let globalA = 1;
    if (phase === 'fade') globalA = 1 - Math.min(1, phaseT / FADE_MS);

    // The veil: dims the scenery outside the lit pile, its lantern and its stretch of road.
    let dimAmt = 0;
    for (let k = 0; k < 5; k++) dimAmt = Math.max(dimAmt, 1 - alpha[k]);
    if (dimAmt > 0.001) drawVeil(g, dimAmt / (1 - DIM));

    landed.fill(0);
    if (phase === 'bloom') drawBloom(g);
    else {
      const settled = phase === 'final' || phase === 'idle';
      syncLayers(settled ? Infinity : T);
      if (layersGlow) { g.globalAlpha = alpha[4] * globalA; drawLayer(g, layers.glow); }
      for (let k = 0; k < 5; k++) { g.globalAlpha = alpha[k] * globalA; drawLayer(g, layers[k]); }
      if (settled) for (let k = 0; k < 5; k++) landed[k] = geo.dots[k];
      else drawMoving(g, globalA);
      g.globalAlpha = 1;
      if (!settled && phase !== 'fade') drawLanterns(g);
    }
    g.globalAlpha = 1;
    drawBracket(g);
    if (you) drawYou(g);
    if (petal) drawPetal(g);
    // If the canvas work alone overruns twice in a row, drop the halos and the jitter.
    const spent = performance.now() - t0;
    slowFrames = spent > 12 ? slowFrames + 1 : 0;
    if (slowFrames >= 2 && !lowFx) lowFx = true;
    return spent;
  }

  function drawLayer(g, L) { if (L) g.drawImage(L.c, L.x, L.y, L.w, L.h); }

  // Every dot not yet at rest: walking the road (an unsorted grey guest), popping into its glyph
  // at its lantern, falling, or bouncing as it lands.
  function drawMoving(g, globalA) {
    const v = (geo.tall ? 380 : 520) / 1000;
    const glow = layersGlow;
    for (let i = 0; i < N; i++) {
      const k = kindA[i];
      if (T >= tLand[i]) landed[k]++;
      const ts = tSpawn[i];
      if (T < ts || T >= tRest[i]) continue;
      let x, y, s = scaleA[i], a = alpha[k] * globalA;
      if (T < tArr[i]) {
        if (!walkA[i]) continue;
        const P = PERSONALITY[k];
        const sArc = (T - ts) * v * P.speed;
        at(geo.path, sArc, tmp);
        let off = 0;
        if (P.jit && !lowFx) {
          const u = sArc / geo.stationS[k];
          if (k === 1) off = P.jit * tri(u * 3 + laneA[i] * 0.1);            // zig-zag
          else if (k === 3) off = P.jit * Math.sin(u * 11 + laneA[i] * 3);   // wobble
          else off = P.jit * laneA[i] * (0.7 + 0.3 * Math.sin(u * 5 + laneA[i] * 7));
        }
        x = tmp[0] + tmp[2] * off; y = tmp[1] + tmp[3] * off;
        if (geo.tall && sArc < 18) a *= sArc / 18;
        g.globalAlpha = a;
        stamp(g, atlas, 'n', x, y, s);
        continue;
      }
      const st = geo.piles[k].station;
      const sx = st.x, sy = geo.tall ? st.y : stationY(k);
      const dt = T - tArr[i];
      if (dt < POP) {
        const u = dt / POP;
        s *= u < 0.4 ? 1 + 0.7 * easeOut(u / 0.4) : 1.7 - 0.7 * overshoot((u - 0.4) / 0.6);
      }
      if (T < tDrop[i]) { x = sx; y = sy; }
      else if (T < tLand[i]) {
        const u = easeIn((T - tDrop[i]) / DROP);
        const cx = (sx + txA[i]) / 2, cy = Math.min(sy, tyA[i]) - (geo.tall ? 14 : 10);
        const m = 1 - u;
        x = m * m * sx + 2 * m * u * cx + u * u * txA[i];
        y = m * m * sy + 2 * m * u * cy + u * u * tyA[i];
      } else {
        x = txA[i]; y = tyA[i];
        const dl = T - tLand[i];
        if (dl < SETTLE) y -= 1.5 * Math.sin(Math.PI * (dl / SETTLE));
        else if (k === 1) x += 2 * Math.sin(((dl - SETTLE) / 60) * Math.PI * 2);   // the rattle
      }
      if (tArr[i] > lastCatch[k]) lastCatch[k] = tArr[i];
      g.globalAlpha = a;
      if (glow && spriteA[i] === 4) stamp(g, atlas, 'glow', x, y, s);
      stamp(g, atlas, spriteKey(spriteA[i]), x, y, s);
    }
  }

  // A repeat visit in the same tab: the piles grow in place instead of walking again.
  function drawBloom(g) {
    for (let i = 0; i < N; i++) {
      const k = kindA[i];
      const dots = geo.dots[k] || 1;
      const delay = (slotA[i] / dots) * (BLOOM_MS / 2);
      const p = Math.max(0, Math.min(1, (phaseT - delay) / (BLOOM_MS / 2)));
      if (p <= 0) continue;
      if (p >= 1) landed[k]++;
      const s = scaleA[i] * easeOut(p);
      g.globalAlpha = alpha[k];
      if (glowOn() && spriteA[i] === 4) stamp(g, atlas, 'glow', txA[i], tyA[i], s);
      stamp(g, atlas, spriteKey(spriteA[i]), txA[i], tyA[i], s);
    }
  }

  function stationY(k) {
    return geo.path.ys[Math.round((geo.stationS[k] / geo.path.len) * geo.path.samples)];
  }

  function tri(x) { const f = x - Math.floor(x); return f < 0.5 ? 4 * f - 1 : 3 - 4 * f; }

  function drawVeil(g, amt) {
    // While the dim fades back out, keep cutting around the pile that was lit, so it doesn't
    // flicker darker on its way back to normal.
    const on = lit >= 0 ? lit : hover >= 0 ? hover : brushK;
    if (on >= 0) veilK = on;
    const k = veilK;
    g.save();
    g.globalAlpha = Math.min(1, amt) * (1 - DIM);
    g.fillStyle = pal.bg;
    g.fillRect(0, 0, geo.W, geo.H);
    if (k >= 0) {
      g.globalCompositeOperation = 'destination-out';
      g.globalAlpha = 1;
      g.fillStyle = '#000';
      if (!geo.tall) {
        const xs = geo.xc;
        const l = k ? (xs[k - 1] + xs[k]) / 2 : 0;
        const r = k < 4 ? (xs[k] + xs[k + 1]) / 2 : geo.W;
        g.fillRect(l, 0, r - l, geo.H);
        const rl = k ? xs[k - 1] : -30;
        g.fillRect(rl, geo.yPath - 16, xs[k] - rl, 30);
      } else {
        const pl = geo.piles[k];
        g.fillRect(0, pl.y - 2, geo.W, geo.rowH + (k === 4 ? 30 : 0));
        const prev = k ? geo.piles[k - 1].junction : -10;
        g.fillRect(0, prev, 22, pl.junction - prev + 6);
      }
    }
    g.restore();
  }

  // A lantern lights for a moment each time it catches someone.
  function drawLanterns(g) {
    for (let k = 0; k < 4; k++) {
      const since = T - lastCatch[k];
      if (since < 0 || since > BLINK) continue;
      const a = (1 - since / BLINK) * alpha[k];
      const st = geo.piles[k].station;
      const x = st.x, y = geo.tall ? st.y : stationY(k) - 10.7;
      const grd = g.createRadialGradient(x, y, 0, x, y, 10);
      grd.addColorStop(0, withAlpha(pal.head, 0.75 * a));
      grd.addColorStop(1, withAlpha(pal.head, 0));
      g.fillStyle = grd;
      g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = withAlpha(pal.head, 0.9 * a);
      if (geo.tall) { g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill(); }
      else g.fillRect(x - 2.6, y - 1.9, 5.2, 3.8);
    }
  }

  function drawBracket(g) {
    if (bracketBox.hidden || doneAt < 0) return;
    const p = motion.reduced ? 1 : std(Math.min(1, doneAt / BRACKET_MS));
    const br = geo.bracket;
    g.save();
    g.strokeStyle = pal.person;
    g.lineWidth = 2;
    g.lineCap = 'butt';
    g.globalAlpha = alpha[4];
    g.beginPath();
    if (!geo.tall) {
      const from = model.loRaw > 0 ? br.seam : geo.yBase;
      const to = from + (br.top - from) * p;
      g.moveTo(br.x, from); g.lineTo(br.x, to);
      g.moveTo(br.x - 6, to); g.lineTo(br.x, to);   // tick at the top
      if (model.loRaw > 0) { g.moveTo(br.x - 6, from); g.lineTo(br.x, from); }
    } else {
      const from = model.loRaw > 0 ? br.seam : geo.bandX;
      const to = from + (br.end - from) * p;
      g.moveTo(from, br.y); g.lineTo(to, br.y);
      g.moveTo(to, br.y - 5); g.lineTo(to, br.y);
      if (model.loRaw > 0) { g.moveTo(from, br.y - 5); g.lineTo(from, br.y); }
    }
    g.stroke();
    g.restore();
  }

  // The petal: one blossom crossing the doorway at the end of the first replay of the visit.
  function drawPetal(g) {
    const u = doneAt / PETAL_MS;
    if (u < 0 || u >= 1) { petal = false; return; }
    let x, y;
    if (!geo.tall) {
      const d = doorRect(geo);
      x = d.x - 24 + (d.w + 60) * u;
      y = d.y + 6 + d.h * 0.55 * u + 7 * Math.sin(u * Math.PI * 3);
    } else {
      x = geo.W * (0.2 + 0.7 * u);
      y = geo.piles[4].y - 4 + 10 * u + 5 * Math.sin(u * Math.PI * 3);
    }
    const a = Math.max(0, Math.min(1, u * 6, (1 - u) * 5));
    g.save();
    g.globalAlpha = a;
    g.translate(x, y);
    g.rotate(u * Math.PI * 1.6 + Math.sin(u * 9) * 0.3);
    g.fillStyle = pal.you || '#F7C9D4';
    g.beginPath();
    // 10px long, a little notch at the tip, the way cherry petals are cut.
    g.moveTo(-5, 0);
    g.bezierCurveTo(-3, -3.4, 2.5, -3.4, 5, -0.9);
    g.lineTo(3.8, 0);
    g.lineTo(5, 0.9);
    g.bezierCurveTo(2.5, 3.4, -3, 3.4, -5, 0);
    g.fill();
    g.restore();
  }

  // ---------- the reader's own guest ("Am I in here?") ----------
  function placeYouTarget() {
    const k = you.k;
    const [x, y] = slotXY(geo, k, geo.dots[k]);
    you.tx = x; you.ty = y;
  }

  function drawYou(g) {
    const k = you.k;
    const D = geo.stationS[k];
    let x, y;
    const u = Math.min(1, you.t / YOU_MS);
    if (motion.reduced || you.landed) { x = you.tx; y = you.ty; }
    else if (u < 1) {
      at(geo.path, D * std(u), tmp);
      x = tmp[0]; y = tmp[1];
    } else {
      const v = Math.min(1, (you.t - YOU_MS) / DROP);
      const st = geo.piles[k].station;
      const sx = st.x, sy = geo.tall ? st.y : stationY(k);
      const e = easeIn(v), m = 1 - e;
      const cx = (sx + you.tx) / 2, cy = Math.min(sy, you.ty) - 12;
      x = m * m * sx + 2 * m * e * cx + e * e * you.tx;
      y = m * m * sy + 2 * m * e * cy + e * e * you.ty;
      if (v >= 1) you.landed = true;
    }
    g.globalAlpha = 1;
    // a little larger on the rail, where the dots are small and the walk is short
    stamp(g, atlas, 'you', x, y, geo.tall ? 1.5 : 1);
    // stamps appear as the guest passes each lantern
    if (!motion.reduced && !you.landed) {
      for (let s = 0; s < you.steps.length && s < 4; s++) {
        if (you.shown[s]) continue;
        if (D * std(u) >= geo.stationS[s] - 1 || u >= 1) showStamp(s);
      }
    }
  }

  function showStamp(s) {
    you.shown[s] = true;
    const step = you.steps[s];
    const st = el('span', 'st-gate-stamp' + (step.yes ? ' st-gate-stamp-yes' : ''));
    if (step.yes && opts.glyphSVG) st.append(opts.glyphSVG(KIND_ORDER[s], { size: 10 }), ' yes');
    else st.textContent = step.yes ? 'yes' : 'no';
    if (!geo.tall) {
      st.style.left = geo.xc[s] + 'px';
      st.style.top = geo.yPath + 12 + 'px';
    } else {
      const b = stationBtns[s];
      st.style.left = b.offsetLeft + b.offsetWidth + 8 + 'px';
      st.style.top = geo.piles[s].y + 'px';
      st.classList.add('st-gate-stamp-tall');
    }
    stampsBox.append(st);
  }

  // ---------- the loop ----------
  function needsFrames() {
    if (!inked && !motion.reduced) return true;
    if (phase === 'replay' || phase === 'bloom' || phase === 'fade') return true;
    if (doneAt >= 0 && doneAt < BRACKET_MS + 40) return true;
    if (petal) return true;
    if (you && !you.landed && !motion.reduced) return true;
    for (let k = 0; k < 5; k++) if (Math.abs(alpha[k] - targetAlpha(k)) > 0.002) return true;
    return false;
  }

  function step(dt) {
    if (!geo || !visible) return false;
    if (lowFx && dpr > 1.5) { sizeCanvases(); drawBg(); }
    if (!inked) {
      inkT += dt;
      drawBg();
      if (inkT >= 700) inked = true;
    }
    // pile focus dimming, 200 ms either way
    for (let k = 0; k < 5; k++) {
      const tgt = targetAlpha(k);
      const d = (1 - DIM) * (dt / DIM_MS);
      alpha[k] = alpha[k] < tgt ? Math.min(tgt, alpha[k] + d) : Math.max(tgt, alpha[k] - d);
    }
    if (phase === 'replay') {
      T += dt * speed;
      if (T >= endT) { T = endT; settle(); }
    } else if (phase === 'bloom') {
      phaseT += dt;
      if (phaseT >= BLOOM_MS) settle();
    } else if (phase === 'fade') {
      phaseT += dt;
      if (phaseT >= FADE_MS) {
        const next = pending; pending = null;
        model = next.model;
        rebuild();
        positionOverlay();
        startReplay(next.speed);
      }
    }
    if (doneAt >= 0) doneAt += dt;
    if (you && !you.landed) you.t += dt;
    if (phase === 'replay') setLabelNumbers(null);
    draw();
    return needsFrames();
  }

  function settle() {
    phase = 'final';
    T = endT;
    doneAt = 0;
    setLabelNumbers(1);
    updateStatus();
    bracketBox.classList.add('st-gate-bracket-in');
    if (!petalShown && !motion.reduced && !motion.saveData && model.unit === 'pages' && N > 0) {
      petalShown = true;
      petal = true;
    }
    opts.onDone?.();
  }

  function kick() { if (geo && visible && !loop.running && needsFrames()) loop.start(); }

  function targetAlpha(k) {
    const on = lit >= 0 ? lit : hover >= 0 ? hover : brushK;
    return on < 0 || on === k ? 1 : DIM;
  }

  function applyDimClasses() {
    const on = lit >= 0 ? lit : hover >= 0 ? hover : brushK;
    for (let k = 0; k < 5; k++) {
      const dim = on >= 0 && on !== k;
      stationBtns[k].classList.toggle('st-gate-dim', dim);
      labelBtns[k].classList.toggle('st-gate-dim', dim);
      labelBtns[k].classList.toggle('st-gate-lit', on === k);
    }
    bracketBox.classList.toggle('st-gate-dim', on >= 0 && on !== 4);
    if (motion.reduced) for (let k = 0; k < 5; k++) alpha[k] = targetAlpha(k);
  }

  function setHover(k) {
    if (k === hover) return;
    hover = k;
    applyDimClasses();
    opts.onHover?.(k >= 0 ? KIND_ORDER[k] : null);
    redrawSoon();
  }

  function redrawSoon() {
    if (!geo) return;
    if (needsFrames()) kick();
    else draw();
  }

  function startReplay(sp) {
    if (motion.reduced) { showFinal(); return; }
    started = true;
    try { sessionStorage.setItem('st-gate-seen', '1'); } catch (e) { /* private mode: replays again next time, fine */ }
    speed = sp;
    T = 0;
    phase = 'replay';
    doneAt = -1;
    // A petal still drifting from the last sort ends with it: it belongs to the first replay's
    // ending only, and with doneAt reset it would hang, opaque, at the doorway's edge.
    petal = false;
    lastCatch = new Float32Array(5).fill(-1e9);
    landed.fill(0);
    bracketBox.classList.remove('st-gate-bracket-in');
    setLabelNumbers(0);
    updateStatus();
    kick();
  }

  function startBloom() {
    started = true;
    phase = 'bloom';
    phaseT = 0;
    doneAt = -1;
    petal = false;
    bracketBox.classList.remove('st-gate-bracket-in');
    setLabelNumbers(0);
    updateStatus();
    kick();
  }

  function showFinal() {
    phase = 'final';
    T = endT;
    doneAt = motion.reduced ? BRACKET_MS + 100 : 0;
    setLabelNumbers(1);
    updateStatus();
    bracketBox.classList.add('st-gate-bracket-in');
    if (geo) { draw(); kick(); }
  }

  // Replay from the start (the Replay button, time travel). A model still waiting behind a fade
  // takes over first.
  function replay(sp = 1) {
    if (!model) return;
    if (pending) { model = pending.model; pending = null; rebuild(); positionOverlay(); }
    startReplay(sp);
  }

  function finish() {
    if (phase === 'replay' || phase === 'bloom') { settle(); draw(); kick(); }
    else if (phase === 'wait') {
      // picked a pile (or asked "Am I in here?") before the sort began: show the sorted piles
      offWait.forEach((f) => f());
      clearTimeout(waitT);
      started = true;
      showFinal();
      opts.onDone?.();
    }
    else if (phase === 'fade' && pending) {
      const next = pending; pending = null;
      model = next.model; rebuild(); positionOverlay(); showFinal();
      opts.onDone?.();
    }
  }

  // ---------- visibility and size ----------
  const ro = new ResizeObserver(() => {
    const W = Math.floor(host.clientWidth);
    if (!geo || W !== geo.W) { rebuild(); if (geo) { draw(); kick(); } }
  });
  ro.observe(host);
  const offVis = opts.watchVisible(stage, (v) => {
    visible = v;
    if (v) { if (geo) draw(); kick(); }
  });
  const offReduced = motion.onChange?.((r) => {
    host.classList.toggle('st-gate-reduced', r);
    if (r && (phase === 'replay' || phase === 'bloom')) finish();
    updateStatus();
  });
  const offFonts = document.fonts?.ready?.then(() => { if (geo && model) { positionOverlay(); refit(); } });
  let refitT = 0;
  const onWinResize = () => { clearTimeout(refitT); refitT = setTimeout(refit, 120); };
  window.addEventListener('resize', onWinResize);
  void offFonts;

  // ---------- public ----------
  return {
    /** Show a new model. how: 'first' (wait until 40% visible, then replay or bloom), 'change'
     *  (fade, then a 3× replay), 'final' (no motion). */
    setModel(m, how = 'change') {
      const firstModel = !model;
      if (you && !firstModel) clearYou();
      if (how === 'change' && model && !motion.reduced && started && N > 0) {
        pending = { model: m, speed: 3 };
        if (phase !== 'fade') { phase = 'fade'; phaseT = 0; }
        petal = false;
        updateStatus();
        kick();
        return;
      }
      model = m;
      rebuild();
      if (!geo) return;
      if (how === 'first') {
        phase = motion.reduced ? 'final' : 'wait';
        if (motion.reduced) showFinal();
        else {
          setLabelNumbers(0);
          updateStatus();
          draw();
          kick();
        }
        // The first replay waits for the piles' ground line to be on screen, not just part of
        // the stage: on a short laptop 40% of the stage is visible while every pile, label and
        // the people's bracket are still below the fold. A reader who doesn't scroll still gets
        // the sort, 3 s after the stage first shows, rather than empty piles reading 0.
        const begin = () => {
          if (phase !== 'wait') return;
          offWait.forEach((f) => f());
          clearTimeout(waitT);
          let seen = false;
          try { seen = sessionStorage.getItem('st-gate-seen') === '1'; } catch (e) { /* no storage */ }
          if (seen) startBloom(); else startReplay(1);
        };
        offWait = [
          opts.onEnter(ground, begin, { threshold: 1 }),
          opts.onEnter(stage, () => { waitT = setTimeout(begin, 3000); }, { threshold: 0.4 }),
        ];
      } else if (how === 'final' || motion.reduced) showFinal();
      else startReplay(3);
    },
    replay,
    finish,
    /** The pile whose drawer is open stays lit. */
    setLit(kind) {
      lit = kind ? KIND_ORDER.indexOf(kind) : -1;
      labelBtns.forEach((b, k) => b.setAttribute('aria-expanded', String(k === lit)));
      applyDimClasses();
      redrawSoon();
    },
    /** A kind word elsewhere on the page is being pointed at. */
    brush(kind) {
      const k = kind ? KIND_ORDER.indexOf(kind) : -1;
      if (k === brushK) return;
      brushK = k;
      applyDimClasses();
      redrawSoon();
    },
    /** Walk the reader's guest. result: classifyYou() output. Resolves when it has landed. */
    you(result) {
      clearYou();
      const k = KIND_ORDER.indexOf(result.kind);
      you = { k, t: 0, landed: motion.reduced, steps: result.steps || [], shown: [] };
      if (geo) placeYouTarget();
      finish();
      if (motion.reduced) { (you.steps || []).forEach((_, s) => s < 4 && showStamp(s)); draw(); return Promise.resolve(); }
      kick();
      return new Promise((res) => setTimeout(res, (YOU_MS + DROP) * 0.8));
    },
    clearYou,
    /** Dev checks only (hero.js exposes it under astro dev): draw replay time t, synchronously. */
    seek(t) {
      if (!geo) return 0;
      loop.stop();
      phase = 'replay'; speed = 0; T = Math.max(0, Math.min(endT, t));
      const spent = draw();
      setLabelNumbers(null);
      return spent;
    },
    get dots() { return N; },
    get endT() { return endT; },
    labelButton: (kind) => labelBtns[KIND_ORDER.indexOf(kind)],
    get youButton() { return youBtn; },
    get stage() { return stage; },
    get running() { return phase === 'replay' || phase === 'bloom' || phase === 'fade'; },
    onMode() {
      if (!geo) return;
      refreshPalette();
      drawBg();
      draw();
    },
    destroy() {
      loop.stop();
      offWait.forEach((f) => f());
      clearTimeout(waitT);
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
      clearTimeout(refitT);
      offVis?.();
      offReduced?.();
      unbinds.forEach((u) => u());
      host.textContent = '';
    },
  };

  function clearYou() {
    you = null;
    stampsBox.textContent = '';
    if (geo) draw();
  }
}

// Canvas colours come from computed styles as rgb()/rgba() strings; lantern light needs them at
// a chosen alpha.
function withAlpha(c, a) {
  const m = /rgba?\(([^)]+)\)/.exec(c || '');
  if (m) {
    const [r, g, b] = m[1].split(',').map((s) => parseFloat(s));
    return `rgba(${r},${g},${b},${a})`;
  }
  if (/^#([0-9a-f]{6})$/i.test(c)) {
    const n = parseInt(c.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return c;
}
