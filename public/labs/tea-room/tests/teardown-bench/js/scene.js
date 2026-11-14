// The teardowns, in the tea room: one chapter of the tea room, as a module the host page drives.
//
//   const ch = mount(hostElement, { reduced, still, live });
//   ch.frame(q, time, pointer)   q: the chapter's progress 0..1; time: seconds (stopped when still)
//   ch.resize(); ch.setActive(on); ch.dispose();
//
// Everything on screen is a function of q: which machine is on the table, which part is picked, isolated or cut open,
// which card is up, where the camera is. Only the machine's own page (alive in a frame, see live.js) and the films run
// on their own clocks, and they are only ever shown in the state q asks for.

import { MACHINES, LAB_POST } from './machines.js';
import { createLive } from './live.js';

// look B's room at night, its television and its low table (the table with its teapot and cups lifted off, so it can be
// the workbench): copies kept here, in this test's own img/
const IMG = new URL('../img/', import.meta.url).pathname;
const ROOM = { src: IMG + 'room.webp', w: 2752, h: 1536 };
// the table's picture: its top is an ellipse centred at (436, 271), 425 by 130, in its own 873 x 682 pixels
const TABLE = { w: 873, h: 682, cx: 436, cy: 271, rx: 425, ry: 130 };
// the one hanging lamp over the bench: a paper lantern, inked like the room (its cord runs up out of the picture)
const LAMP_SVG = `<svg class="lamp-svg" viewBox="0 0 100 160" width="100" height="160" aria-hidden="true">
  <defs><radialGradient id="tbLampPaper" cx="50%" cy="58%" r="60%">
    <stop offset="0" stop-color="#fff6dc"/><stop offset="0.45" stop-color="#ffd58c"/><stop offset="0.85" stop-color="#f09a48"/><stop offset="1" stop-color="#c8682e"/>
  </radialGradient></defs>
  <path d="M50 -900 V22" stroke="#1d1520" stroke-width="2.4" fill="none"/>
  <path d="M37 21 h26 l3 10 h-32 z" fill="#2b1e25" stroke="#1d1520" stroke-width="2.2" stroke-linejoin="round"/>
  <ellipse cx="50" cy="83" rx="39" ry="53" fill="url(#tbLampPaper)" stroke="#1d1520" stroke-width="3"/>
  <g fill="none" stroke="#a5532a" stroke-opacity="0.5" stroke-width="1.3">
    <path d="M24 44 Q50 50 76 44"/><path d="M16 58 Q50 66 84 58"/><path d="M12 73 Q50 82 88 73"/><path d="M11 88 Q50 97 89 88"/>
    <path d="M14 103 Q50 111 86 103"/><path d="M21 118 Q50 125 79 118"/>
  </g>
  <path d="M34 134 h32 l-3 10 h-26 z" fill="#2b1e25" stroke="#1d1520" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M50 144 v9" stroke="#1d1520" stroke-width="2"/>
</svg>`;
const INTRO = 0.045;                       // the first screen: the title over the room
const SEG = (1 - INTRO) / MACHINES.length; // one machine's share of the scroll
// inside one machine's share: it arrives whole, then its parts, then "break it", then its film and its page
const ARRIVE = 0.13, PARTS_END = 0.68, BREAK_END = 0.86;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
const lerp = (a, b, t) => a + (b - a) * t;
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// where a machine is in the scroll, and what step it is on
export function placeOf(q) {
  if (q < INTRO) return { i: 0, t: 0, step: 'intro', intro: 1 - q / INTRO };
  const i = Math.min(MACHINES.length - 1, Math.floor((q - INTRO) / SEG));
  const t = clamp((q - INTRO - i * SEG) / SEG);
  const m = MACHINES[i];
  if (t < ARRIVE) return { i, t, step: 'arrive' };
  if (t < PARTS_END) {
    const n = m.parts.length, u = (t - ARRIVE) / (PARTS_END - ARRIVE) * n;
    const k = Math.min(n - 1, Math.floor(u));
    return { i, t, step: 'part', k, mode: u - k < 0.5 ? 'isolate' : (m.parts[k].second || 'cut') };
  }
  if (t < BREAK_END) return { i, t, step: 'break' };
  return { i, t, step: 'end' };
}
// the q at which a machine (and a step in it) starts: for the tabs and for tests
export const qOf = (i, t = 0) => INTRO + (i + t) * SEG;

// a 1600 x 900 picture of the page (its stills, its film, the page itself) placed in a box so the crop shows
function cropRect(boxW, boxH, crop, pw = 1600, ph = 900) {
  let s = Math.max(boxH / crop.vh, crop.vw ? boxW / crop.vw : 0);
  s = Math.max(s, boxW / 1600, boxH / 900);
  const W = 1600 * s, H = 900 * s;
  const left = clamp(boxW / 2 - crop.cx * s, boxW - W, 0);
  const top = clamp(boxH / 2 - crop.cy * s, boxH - H, 0);
  return { left, top, W, H, s: s * 1600 / pw };
}

export function mount(host, options = {}) {
  const opt = { reduced: false, still: false, live: true, ...options };
  return opt.reduced ? mountList(host, opt) : mountStage(host, opt);
}

/* ---------------------------------------------------------------- the moving chapter */
function mountStage(host, opt) {
  const root = el('div', 'tb');
  root.innerHTML = `
    <div class="world">
      <div class="room" aria-hidden="true"><img class="room-img" src="${ROOM.src}" width="${ROOM.w}" height="${ROOM.h}" alt="" decoding="async"></div>
      <div class="cone" aria-hidden="true"></div>
      <img class="table" src="${IMG}bench-table.webp" width="873" height="682" alt="" aria-hidden="true">
      <div class="sweep" aria-hidden="true"></div>
      <div class="pool" aria-hidden="true"></div>
      <div class="shade" aria-hidden="true"></div>
      <figure class="bench">
        <div class="view">
          <div class="pics"><img class="pic a" alt=""><img class="pic b" alt=""><div class="erase"></div></div>
          <div class="holder"></div>
          <div class="film-box" hidden><video class="film" playsinline preload="none" disableremoteplayback></video></div>
          <p class="waking" hidden>Waking the machine…</p>
        </div>
        <figcaption class="plate">
          <span class="plate-name"></span><span class="plate-what"></span>
          <button type="button" class="turn-btn" hidden>Turn it yourself</button>
        </figcaption>
      </figure>
      <div class="tv" aria-hidden="true"><div class="tv-glow"></div><div class="tv-flip">
        <div class="tv-screen"><img class="tv-still" alt=""><video class="tv-film" muted playsinline loop preload="none" disableremoteplayback tabindex="-1"></video></div>
        <img class="tv-body" src="${IMG}tv-body.webp" width="1200" height="1093" alt="">
      </div></div>
      <div class="lamp" aria-hidden="true">${LAMP_SVG}<div class="lamp-glow"></div></div>
    </div>
    <nav class="tabs" aria-label="The four machines"></nav>
    <div class="dock">
      <header class="card lead">
        <p class="kicker">The tea room · a test</p>
        <h1 class="lead-title">The teardowns</h1>
        <p class="lead-say">Four machines from the Moon base of <em>Earthlight</em>, taken apart one part at a time in the tea room, under the lamp.</p>
        <p class="lead-go">Scroll, and the first one arrives.</p>
      </header>
      <article class="card part" aria-live="polite">
        <p class="meta"><span class="m-name"></span><span class="m-step"></span></p>
        <h2 class="p-name"></h2>
        <p class="p-num"><b></b><span></span></p>
        <p class="p-say"></p>
        <p class="p-modes"><span class="chip c-iso">Isolated</span><span class="chip c-cut">Cut open</span></p>
      </article>
      <article class="card brk">
        <p class="meta"><span class="m-name"></span><span>Break it</span></p>
        <h2 class="b-title"></h2>
        <p class="b-say"></p>
        <label class="b-range"><span class="b-label"></span><input type="range" class="b-input"><span class="b-marks"></span></label>
        <p class="b-out"><span class="b-val"></span><b class="b-read"></b><span class="b-small"></span></p>
      </article>
      <article class="card end">
        <p class="meta"><span class="m-name"></span><span>The film and the page</span></p>
        <h2 class="e-title"></h2>
        <p class="e-say"></p>
        <div class="e-btns">
          <button type="button" class="btn e-film">Watch its film</button>
          <a class="btn e-open" target="_self">Open the full teardown</a>
        </div>
        <div class="sound" hidden>
          <span class="sound-say">The film has sound. It stays off until you turn it on.</span>
          <span class="switch"><button type="button" class="snd-off" aria-pressed="true">Sound off</button><button type="button" class="snd-on" aria-pressed="false">Sound on</button></span>
        </div>
        <p class="e-post"><a class="go" href="${LAB_POST}">Read the lab’s post: how these were built</a></p>
      </article>
    </div>
    <p class="hint" aria-hidden="true">Scroll</p>`;
  host.appendChild(root);
  if (opt.still) root.classList.add('still');

  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const world = $('.world'), table = $('.table'), sweep = $('.sweep'), lampEl = $('.lamp'), erase = $('.erase');
  const roomImg = $('.room-img'), tv = $('.tv'), tvFilm = $('.tv-film'), tvStill = $('.tv-still');
  const bench = $('.bench'), view = $('.view'), picA = $('.pic.a'), picB = $('.pic.b'), holder = $('.holder');
  const filmBox = $('.film-box'), film = $('.film'), waking = $('.waking'), turnBtn = $('.turn-btn');
  const lead = $('.lead'), cPart = $('.part'), cBrk = $('.brk'), cEnd = $('.end'), hint = $('.hint');
  const range = $('.b-input');
  tvFilm.addEventListener('playing', () => tvFilm.classList.add('on'));

  // tabs: one per machine, each a link to its place in the scroll
  const tabs = $('.tabs');
  MACHINES.forEach((m, i) => {
    const b = el('button', 'tab', `<span>${m.name}</span><i><b></b></i>`);
    b.type = 'button';
    b.addEventListener('click', () => opt.onSeek && opt.onSeek(qOf(i, 0.02)));
    tabs.appendChild(b);
  });
  const tabEls = $$('.tab');

  let W = 0, H = 0, phone = false, active = false;
  let cur = { i: -1, step: '', k: -1, mode: '' };
  let live = null, liveI = -1, liveTimer = null, pendingI = -1;
  const failed = new Set();
  let held = false, heldQ = 0, lastQ = 0;
  let filmOn = false, sliderVal = {}, readTimer = null, tvOn = false;
  let picShown = { a: '', b: '' }, picFront = 'a';
  let crop = MACHINES[0].crop, viewW = 0, viewH = 0;

  // ---- layout: the workbench (the low table, drawn large), the machine standing on it, the lamp over it, the television
  // on the floor beside it; all of it in the room's own picture space, so the camera moves them together
  let ref = { s: 1, tx: 0, ty: 0 }, pivot = { x: 0, y: 0 };
  function layout() {
    W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight;
    phone = W < 820 || W / H < 1.05;
    root.classList.toggle('phone', phone);
    let bx, by, bw, bh, tvW = 0;
    if (phone) {
      bx = 6; by = 84; bw = W - 12; bh = Math.round(Math.min(H * 0.46, bw * 1.04));
    } else {
      const dockW = Math.min(400, W * 0.28);
      root.style.setProperty('--dock-w', dockW + 'px');
      tvW = Math.round(Math.min(300, W * 0.18));
      bx = Math.round(W * 0.04 + dockW + W * 0.01);
      bw = Math.round(W - bx - tvW * 0.72 - W * 0.015); by = Math.round(H * 0.15); bh = Math.round(H * 0.68);
    }
    Object.assign(bench.style, { left: bx + 'px', top: by + 'px', width: bw + 'px' });
    view.style.height = bh + 'px';
    viewW = bw; viewH = bh;
    root.style.setProperty('--bench-bottom', (by + bh) + 'px');
    // the table: its top centred under the machine, the machines' feet about four fifths of the way down the view
    const tw = bw * (phone ? 1.3 : 1.16), ts = tw / TABLE.w;
    const tcx = bx + bw / 2, tcy = by + bh * (phone ? 0.8 : 0.82);
    Object.assign(table.style, { left: (tcx - TABLE.cx * ts) + 'px', top: (tcy - TABLE.cy * ts) + 'px', width: tw + 'px' });
    root.style.setProperty('--tcx', tcx + 'px'); root.style.setProperty('--tcy', tcy + 'px');
    root.style.setProperty('--trx', TABLE.rx * ts + 'px'); root.style.setProperty('--try', TABLE.ry * ts + 'px');
    // the paper sweep: a sheet hung from a rod behind the machine and run forward onto the table, as models are lit on a
    // bench. The machine's page is multiplied onto it, so the page's pale studio becomes this paper in the lamp's light.
    sweep.innerHTML = sweepSvg(bx, by, bw, bh, tcx, tcy, TABLE.ry * ts, W);
    // the lamp: over the machine, hanging from above the picture
    const lw = phone ? 34 : Math.round(Math.min(78, W * 0.05)), ly = phone ? 52 : Math.round(H * 0.005);
    Object.assign(lampEl.style, { left: (tcx - lw / 2) + 'px', top: ly + 'px', width: lw + 'px' });
    root.style.setProperty('--lx', tcx + 'px'); root.style.setProperty('--ly', (ly + lw * 1.0) + 'px');
    // the television on the floor at the right, nearer than the bench, its screen turned to the room
    if (!phone) {
      const th = tvW * 1093 / 1200;
      Object.assign(tv.style, { width: tvW + 'px', left: Math.round(W - W * 0.012 - tvW) + 'px', top: Math.round(H * 0.985 - th) + 'px' });
    }
    // the room: the alcove and its scroll behind the bench, the paper screens and the floor lamp to the right
    const s0 = Math.max(W / ROOM.w, H / ROOM.h) * (phone ? 1.0 : 1.08);
    const tx = clamp(tcx - (phone ? 1080 : 1180) * s0, W - ROOM.w * s0, 0), ty = clamp(H * 0.5 - (phone ? 700 : 760) * s0, H - ROOM.h * s0, 0);
    ref = { s: s0, tx, ty };
    roomImg.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s0})`;
    pivot = { x: tcx, y: tcy - bh * 0.35 };
    world.style.transformOrigin = `${pivot.x}px ${pivot.y}px`;
    placeAll();
  }
  function placeMedia(node, c, pw = 1600, ph = 900) {
    const r = cropRect(viewW, viewH, c, pw, ph);
    Object.assign(node.style, { left: r.left + 'px', top: r.top + 'px', width: r.W + 'px', height: r.H + 'px' });
  }
  function cropFor(m) { return phone ? m.cropNarrow : m.crop; }
  function placeAll() {
    const m = MACHINES[Math.max(0, cur.i)];
    crop = cropFor(m);
    placeMedia(picA, crop); placeMedia(picB, crop);
    const f = holder.querySelector('iframe');
    if (f) placeMedia(f, crop);
    placeMedia(film, crop);
    placeTv(m);
    if (picShown[picFront]) placeErase(picShown[picFront]);
  }
  // the television shows the same machine, closer: its film cropped to the machine, never to the page's console
  function placeTv(m) {
    if (phone) return;
    const sw = tv.clientWidth * 0.504, sh = tv.clientHeight * 0.494;
    if (!sw || !sh) return;
    const c = { ...m.crop, vh: m.crop.vh * 0.92, vw: m.crop.vw * 0.92 };
    for (const node of [tvFilm, tvStill]) {
      const r = cropRect(sw, sh, c);
      Object.assign(node.style, { left: r.left + 'px', top: r.top + 'px', width: r.W + 'px', height: r.H + 'px' });
    }
  }
  // the stills are pictures of the whole page, console and all: white (nothing, on the bench) over what is not the machine
  function placeErase(src) {
    const m = MACHINES[Math.max(0, cur.i)];
    const key = src.replace(/^.*teardown-lab\//, '').replace(/\.webp$/, '');
    const boxes = [...outside(m.keep && m.keep[key]), ...((m.erase && m.erase[key]) || []).map((b) => [...b, 'w'])];
    const r = cropRect(viewW, viewH, crop);
    const k = r.W / 1600;
    erase.innerHTML = boxes.map(([x, y, w, h, kind]) => `<i${kind ? ' class="word"' : ''} style="left:${(r.left + x * k).toFixed(1)}px;top:${(r.top + y * k).toFixed(1)}px;width:${(w * k).toFixed(1)}px;height:${(h * k).toFixed(1)}px"></i>`).join('');
  }

  // ---- the pictures under the live page: two layers, cross-faded when the picture changes
  function showPic(src) {
    const front = picFront === 'a' ? picA : picB, back = picFront === 'a' ? picB : picA;
    if (picShown[picFront] === src) return;
    placeErase(src);
    const backKey = picFront === 'a' ? 'b' : 'a';
    if (picShown[backKey] !== src) { back.src = src; picShown[backKey] = src; }
    back.classList.add('on'); front.classList.remove('on');
    picFront = backKey;
  }

  // ---- the live page in the frame: only one, only for the machine on the table, only once the scroll rests there
  function wantLive(i) {
    if (!opt.live || opt.still || !active || failed.has(i)) return dropLive();
    if (liveI === i || pendingI === i) return;
    dropLive();
    pendingI = i;
    liveTimer = setTimeout(() => { pendingI = -1; startLive(i); }, 420);
  }
  function startLive(i) {
    if (!active || cur.i !== i || cur.step === 'intro') return;
    const m = MACHINES[i];
    liveI = i;
    waking.hidden = false;
    live = createLive(m, holder, {
      onReady: () => { waking.hidden = true; turnBtn.hidden = false; root.classList.add('alive'); applyLive(); },
      onFail: () => { failed.add(i); waking.hidden = true; turnBtn.hidden = true; live = null; liveI = -1; root.classList.remove('alive'); },
      onWheel: () => release(),
    });
    placeMedia(holder.querySelector('iframe'), cropFor(m));
    applyLive();
  }
  function dropLive() {
    clearTimeout(liveTimer); pendingI = -1;
    if (live) { live.dispose(); live = null; }
    liveI = -1; waking.hidden = true; turnBtn.hidden = true; root.classList.remove('alive');
    if (held) release();
  }
  function applyLive() {
    if (!live) return;
    const m = MACHINES[cur.i];
    if (cur.step === 'part') live.set({ view: m.hero.view, part: m.parts[cur.k].button, mode: cur.mode });
    else if (cur.step === 'break') live.set({ view: m.breakIt.view || m.hero.view, part: null, mode: null });
    else live.set({ view: m.hero.view, part: null, mode: null });
    const br = m.breakIt;
    live.breakSetup(cur.step === 'break');
    if (cur.step === 'break') live.slide(sliderVal[m.key] ?? br.value);
    else if (br.resetOnLeave) live.slide(br.value);
  }

  // ---- "Turn it yourself": the frame takes the pointer only when asked, and gives it back on scroll
  function hold() { if (!live || !live.ready) return; held = true; heldQ = lastQ; live.hold(true); root.classList.add('held'); turnBtn.textContent = 'Done turning'; turnBtn.setAttribute('aria-pressed', 'true'); }
  function release() { if (!held) return; held = false; if (live) live.hold(false); root.classList.remove('held'); turnBtn.textContent = 'Turn it yourself'; turnBtn.setAttribute('aria-pressed', 'false'); }
  turnBtn.addEventListener('click', () => (held ? release() : hold()));

  // ---- the film: on the television (muted, always), and in place on the table when asked
  const sndOn = $('.snd-on'), sndOff = $('.snd-off'), sound = $('.sound'), filmBtn = $('.e-film');
  function setSound(on) {
    film.muted = !on;
    sndOn.setAttribute('aria-pressed', String(on)); sndOff.setAttribute('aria-pressed', String(!on));
  }
  sndOn.addEventListener('click', () => setSound(true));
  sndOff.addEventListener('click', () => setSound(false));
  function openFilm(on) {
    filmOn = on;
    const m = MACHINES[cur.i];
    if (on) {
      if (film.getAttribute('src') !== m.film) { film.src = m.film; film.poster = m.poster; }
      film.muted = true; setSound(false);
      filmBox.hidden = false; sound.hidden = false;
      film.currentTime = 0;
      film.play().catch(() => {});
      filmBtn.textContent = 'Back to the machine';
    } else {
      film.pause(); filmBox.hidden = true; sound.hidden = true; setSound(false);
      filmBtn.textContent = 'Watch its film';
    }
  }
  filmBtn.addEventListener('click', () => openFilm(!filmOn));
  film.addEventListener('ended', () => openFilm(false));

  // ---- break it: the page's one slider, offered big
  range.addEventListener('input', () => {
    const m = MACHINES[cur.i];
    const v = parseFloat(range.value);
    sliderVal[m.key] = v;
    if (live) live.slide(v);
    paintBreak();
  });
  function fmt(v, br) { return br.unit ? `${v.toFixed(br.step < 0.1 ? 2 : br.step < 1 ? 1 : 0)} ${br.unit}` : `${Math.round(v * 100)} %`; }
  function paintBreak() {
    const m = MACHINES[cur.i], br = m.breakIt;
    const v = sliderVal[m.key] ?? br.value;
    $('.b-val').textContent = `${br.label}: ${fmt(v, br)}`;
    const r = live && live.ready ? live.reading() : null;
    const big = $('.b-read'), small = $('.b-small');
    if (r && r.big) {
      const b = br.readout.tidy ? br.readout.tidy(r.big) : r.big;
      big.textContent = b.replace(/ MM$/, ' mm').replace(/ CM$/, ' cm').replace(/ M$/, ' m').replace(/ M /, ' m ');
      small.textContent = `${br.readout.label}${r.small ? ' · ' + r.small : ''}`;
    } else { big.textContent = br.offline(v); small.textContent = ''; }
    if (!live || !live.ready) showPic(m.stills[br.stills[v >= br.at ? 1 : 0]]);
  }

  // ---- the cards
  function fillMachine(m, i) {
    $$('.m-name').forEach((e) => (e.textContent = `${m.name} · ${i + 1} of ${MACHINES.length}`));
    $('.plate-name').textContent = m.name;
    $('.plate-what').textContent = m.what;
    $('.e-title').textContent = `${m.name}: the whole teardown`;
    $('.e-say').textContent = `Its ${m.filmLength} film, and its own page, where every part, view and number is yours to try.`;
    $('.e-open').href = m.page;
    filmBtn.textContent = 'Watch its film';
    const br = m.breakIt;
    $('.b-title').textContent = br.label;
    $('.b-say').textContent = br.say;
    $('.b-label').textContent = `${br.label}, from ${fmt(br.min, br)} to ${fmt(br.max, br)}`;
    Object.assign(range, { min: br.min, max: br.max, step: br.step });
    range.value = sliderVal[m.key] ?? br.value;
    $('.b-marks').innerHTML = br.marks.map(([v, w]) => `<i style="left:${((v - br.min) / (br.max - br.min)) * 100}%">${w}</i>`).join('');
    tvStill.src = m.poster;
    tvFilm.classList.remove('on');
  }
  function fillStep(p) {
    const m = MACHINES[p.i];
    if (p.step === 'arrive') {
      $('.m-step').textContent = 'Arrived whole';
      $('.p-name').textContent = m.name;
      $('.p-num b').textContent = '';
      $('.p-num span').textContent = m.what;
      $('.p-say').textContent = m.parts.length + ' of its parts next, one at a time: picked out, then cut open. Then you get to break it.';
      cPart.classList.add('whole');
      showPic(m.stills[0]);
    } else if (p.step === 'part') {
      const part = m.parts[p.k];
      $('.m-step').textContent = `Part ${p.k + 1} of ${m.parts.length}`;
      $('.p-name').textContent = part.name;
      $('.p-num b').textContent = part.num;
      $('.p-num span').textContent = part.unit;
      $('.p-say').textContent = part.say;
      cPart.classList.remove('whole');
      $('.c-iso').classList.toggle('on', p.mode === 'isolate');
      $('.c-cut').classList.toggle('on', p.mode !== 'isolate');
      $('.c-cut').textContent = part.second === 'alone' ? 'Shown alone' : 'Cut open';
      showPic(m.stills[part.still]);
    } else if (p.step === 'break') {
      paintBreak();
    } else if (p.step === 'end' || p.step === 'intro') {
      showPic(m.stills[0]);
    }
  }

  // ---- every frame
  function frame(q, time = 0) {
    if (!active) return;
    q = clamp(q); lastQ = q;
    if (held && Math.abs(q - heldQ) > 0.0015) release();
    const p = placeOf(q);
    const m = MACHINES[p.i];
    if (p.i !== cur.i) {
      if (filmOn) openFilm(false);
      cur.i = p.i; cur.step = ''; fillMachine(m, p.i); placeAll();
    }
    if (p.step !== cur.step || p.k !== cur.k || p.mode !== cur.mode) {
      if (filmOn && p.step !== 'end') openFilm(false);
      Object.assign(cur, { step: p.step, k: p.k ?? -1, mode: p.mode ?? '' });
      fillStep(p);
      applyLive();
    }
    if (p.step === 'intro') dropLive(); else wantLive(p.i);
    // the television plays the machine's film with no sound, once the machine is on the table (never at the top)
    const wantTv = !opt.still && !phone && p.step !== 'intro';
    if (wantTv !== tvOn || (wantTv && tvFilm.getAttribute('src') !== m.film)) {
      tvOn = wantTv;
      if (wantTv) { if (tvFilm.getAttribute('src') !== m.film) tvFilm.src = m.film; tvFilm.play().catch(() => {}); }
      else tvFilm.pause();
    }

    // which card is up
    lead.classList.toggle('up', p.step === 'intro');
    cPart.classList.toggle('up', p.step === 'arrive' || p.step === 'part');
    cBrk.classList.toggle('up', p.step === 'break');
    cEnd.classList.toggle('up', p.step === 'end');
    root.dataset.step = p.step;
    hint.classList.toggle('up', q < 0.012);

    // the tabs
    tabEls.forEach((b, i) => {
      const f = clamp((q - qOf(i)) / SEG);
      b.classList.toggle('on', i === p.i && p.step !== 'intro');
      b.querySelector('b').style.transform = `scaleX(${f})`;
    });

    // the camera: a slow push in on the bench through each machine (the room, the table, the lamp and the machine move as one)
    const g = p.step === 'intro' ? 0 : p.t;
    const zoom = p.step === 'intro' ? lerp(1.0, 1.015, 1 - p.intro) : lerp(1.015, 1.07, smooth(g));
    world.style.transform = `scale(${zoom})`;

    // the lamp: lit over a machine, dimmed between two (the next one is set down in the dark)
    const edge = p.step === 'intro' ? 1 - 0.35 * p.intro : Math.min(p.i === 0 ? 1 : p.t / 0.025, p.i === MACHINES.length - 1 ? 1 : (1 - p.t) / 0.025);
    const lit = smooth(edge);
    root.style.setProperty('--lit', lit.toFixed(3));
    // the intro: the machine comes up onto the table
    const rise = p.step === 'intro' ? smooth(1 - p.intro * 1.0) : 1;
    view.style.transform = `translate3d(0, ${(1 - rise) * 18}px, 0)`;
    // the still under the page turns a little, as the machine does, when the page is not there
    const kb = 1 + 0.035 * smooth(p.step === 'arrive' ? p.t / ARRIVE : 1);
    picA.style.transform = picB.style.transform = `scale(${kb})`;
  }

  function setActive(on) {
    if (on === active) return;
    active = on;
    root.classList.toggle('off', !on);
    if (!on) {
      dropLive(); tvFilm.pause(); tvOn = false; if (filmOn) openFilm(false);
      clearInterval(readTimer); readTimer = null;
    } else {
      cur.i = -1; // fill again on the next frame
      if (!readTimer) readTimer = setInterval(() => { if (cur.step === 'break') paintBreak(); }, 300);
    }
  }

  const onResize = () => layout();
  layout();
  return {
    frame,
    resize: onResize,
    setActive,
    dispose() { setActive(false); root.remove(); },
    get state() { return { ...cur, live: !!(live && live.ready), liveI, failed: [...failed], driver: live ? live.debug : null }; },
  };
}

// the console around a still's machine: everything outside its box
export function outside(k) {
  if (!k) return [];
  const [x, y, w, h] = k;
  return [[0, 0, 1600, y], [0, y + h, 1600, 900 - y - h], [0, y, x, h], [x + w, y, 1600 - x - w, h]];
}

/* the paper sweep behind and under the machine, in screen pixels: an inked outline, lit warm from the lamp above */
function sweepSvg(bx, by, bw, bh, tcx, tcy, tRy, W) {
  const L = bx + bw * 0.1, R = bx + bw * 0.9, T = by + bh * 0.03;
  const yB = tcy - tRy * 0.62, yF = tcy + tRy * 0.42, d = bw * 0.045;
  const f = (v) => v.toFixed(1);
  const path = `M${f(L)} ${f(T)} H${f(R)} V${f(yB)} C${f(R)} ${f(yB + tRy * 0.35)} ${f(R + d)} ${f(yF - tRy * 0.5)} ${f(R + d)} ${f(yF - tRy * 0.18)}`
    + ` Q${f(tcx)} ${f(yF + tRy * 0.22)} ${f(L - d)} ${f(yF - tRy * 0.18)} C${f(L - d)} ${f(yF - tRy * 0.5)} ${f(L)} ${f(yB + tRy * 0.35)} ${f(L)} ${f(yB)} Z`;
  const top = (T / 1).toFixed(1), bend = ((yB - T) / (yF - T)).toFixed(3);
  return `<svg width="${Math.ceil(W)}" height="${Math.ceil(yF + tRy)}" viewBox="0 0 ${Math.ceil(W)} ${Math.ceil(yF + tRy)}" aria-hidden="true">
    <defs>
      <linearGradient id="tbSweepV" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${f(yF)}">
        <stop offset="0" stop-color="#7a5658"/><stop offset="${(bend * 0.45).toFixed(3)}" stop-color="#d9ae86"/>
        <stop offset="${bend}" stop-color="#f3cf9f"/><stop offset="1" stop-color="#f7d6a8"/>
      </linearGradient>
      <radialGradient id="tbSweepR" gradientUnits="userSpaceOnUse" cx="${f(tcx)}" cy="${f(yB)}" r="${f((R - L) * 0.62)}" gradientTransform="translate(${f(tcx)} ${f(yB)}) scale(1 1.25) translate(${f(-tcx)} ${f(-yB)})">
        <stop offset="0.38" stop-color="#2a1a26" stop-opacity="0"/><stop offset="1" stop-color="#2a1a26" stop-opacity="0.68"/>
      </radialGradient>
    </defs>
    <path d="M${f(L - 14)} ${f(T)} V-20 M${f(R + 14)} ${f(T)} V-20" stroke="#1d1520" stroke-width="2"/>
    <path d="${path}" fill="url(#tbSweepV)"/>
    <path d="${path}" fill="url(#tbSweepR)" stroke="#1d1520" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M${f(L - 22)} ${f(T)} H${f(R + 22)}" stroke="#1d1520" stroke-width="9" stroke-linecap="round"/>
    <path d="M${f(L - 20)} ${f(T - 1)} H${f(R + 20)}" stroke="#6b4632" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

/* ---------------------------------------------------------------- reduced motion: the stills, the cards, the buttons */
function mountList(host, opt) {
  const root = el('div', 'tb-list');
  root.innerHTML = `<header class="card lead up">
      <p class="kicker">The tea room · a test</p>
      <h1 class="lead-title">The teardowns</h1>
      <p class="lead-say">Four machines from the Moon base of <em>Earthlight</em>, taken apart one part at a time.</p>
    </header>`;
  for (const m of MACHINES) {
    const sec = el('section', 'li-m');
    sec.innerHTML = `
      <div class="li-head"><h2>${m.name}</h2><p>${m.what}</p></div>
      <div class="li-pic"><img src="${m.stills[0]}" alt="${m.name}, from its teardown page" loading="lazy" decoding="async"></div>
      <div class="li-film" hidden><video playsinline preload="none" muted></video></div>
      <ol class="li-parts">${m.parts.map((p) => `<li class="card"><h3>${p.name}</h3><p class="p-num"><b>${p.num}</b><span>${p.unit}</span></p><p class="p-say">${p.say}</p></li>`).join('')}
        <li class="card"><h3>Break it: ${m.breakIt.label.toLowerCase()}</h3><p class="p-say">${m.breakIt.say}</p></li></ol>
      <p class="e-btns"><button type="button" class="btn li-play">Watch its film</button><a class="btn" href="${m.page}">Open the full teardown</a></p>
      <div class="sound" hidden><span class="sound-say">The film has sound. It stays off until you turn it on.</span>
        <span class="switch"><button type="button" class="snd-off" aria-pressed="true">Sound off</button><button type="button" class="snd-on" aria-pressed="false">Sound on</button></span></div>`;
    const pic = sec.querySelector('.li-pic img');
    const filmBox = sec.querySelector('.li-film'), video = sec.querySelector('video'), sound = sec.querySelector('.sound');
    sec.querySelector('.li-play').addEventListener('click', (e) => {
      const on = filmBox.hidden;
      filmBox.hidden = !on; sound.hidden = !on;
      if (on) { video.src = m.film; video.muted = true; video.controls = true; video.play().catch(() => {}); e.target.textContent = 'Close the film'; }
      else { video.pause(); e.target.textContent = 'Watch its film'; }
    });
    sec.querySelector('.snd-on').addEventListener('click', () => { video.muted = false; sec.querySelector('.snd-on').setAttribute('aria-pressed', 'true'); sec.querySelector('.snd-off').setAttribute('aria-pressed', 'false'); });
    sec.querySelector('.snd-off').addEventListener('click', () => { video.muted = true; sec.querySelector('.snd-on').setAttribute('aria-pressed', 'false'); sec.querySelector('.snd-off').setAttribute('aria-pressed', 'true'); });
    sec._fit = () => {
      const box = pic.parentElement, w = box.clientWidth, h = box.clientHeight;
      const c = w < 600 ? m.cropNarrow : m.crop;
      const r = cropRect(w, h, { cx: c.cx, cy: c.cy, vh: 900, vw: c.vw });
      Object.assign(pic.style, { left: r.left + 'px', top: r.top + 'px', width: r.W + 'px', height: r.H + 'px' });
    };
    root.appendChild(sec);
  }
  root.appendChild(el('p', 'li-post', `<a class="go" href="${LAB_POST}">Read the lab’s post: how these were built</a>`));
  host.appendChild(root);
  const fit = () => root.querySelectorAll('.li-m').forEach((s) => s._fit());
  fit();
  return {
    frame() {}, resize: fit,
    setActive(on) { if (!on) root.querySelectorAll('video').forEach((v) => v.pause()); },
    dispose() { root.remove(); },
    get state() { return { list: true }; },
  };
}
