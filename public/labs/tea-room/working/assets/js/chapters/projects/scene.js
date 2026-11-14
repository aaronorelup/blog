/* PROJECTS: A WALK DOWN THE GARDEN PATH. One chapter of the tea room, as a scene a host page drives.

   Further down the same garden, the same night. The camera walks along a path of stepping stones towards the tea
   house. A stone lantern stands by the path for each project, and only the lantern of the project in front of you is
   lit. Beside it the project stands as it is used: a game in a framed window that plays where it stands, a film on a
   lit screen that plays where it stands, a download or a write-up as its picture. The path bends at each shelf, so
   the builds stand now on the right, now on the left.

   The tea room test tests/projects-walk/, its js/scene.js, made the projects chapter of the working copy
   (../projects.js drives it). Changed: the numbers are plan.js's (shared with the modelled twin of the first view);
   the cards and whatever plays stand in options.top (pressable, in front), what plays in a frame laid over its
   window's screen that follows the window; a game's frame hands the mouse wheel to the page; on a phone a game opens
   on its own page; the buttons say that what they start plays with sound; frame() takes cards (0..1: the chapter
   takes the cards away at its end); no style sheet of its own (css/chapters/projects.css).

   mount(host, options) -> { frame(q, time, pointer, cards), resize(), setActive(on), dispose(), ready(), plan() }
     q        the walk's progress, 0 to 1: where the camera is, which lantern is lit, which card is shown,
     time     seconds (the clouds, the fireflies, the flicker of the flame),
     pointer  { x, y } from -1 to 1: the far garden leans a little, if given.
   The one thing that is not a function of q is what the reader started with a button (a game, a film): it stops
   as soon as its project is no longer the one in front, and on setActive(false).

   options: projects, shelves, total (data.js), top, inset() ({ left, top }: the rail), still, onChange(). */

import { garden, layout as planLayout, TREE, HOUSE, EYE, LH, FAR, ss, rnd } from './plan.js';

const IMG = (p) => new URL('../../../img/projects/' + p, import.meta.url).href;

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (x, m) => ((x % m) + m) % m;

// ------------------------------------------------------------------ the stone lantern, drawn once in the garden's own hand
export function drawLantern(doc, lit) {
  const U = 420, Wc = Math.round(0.9 * U), Hc = Math.round((LH + 0.06) * U);
  const c = doc.createElement('canvas'); c.width = Wc; c.height = Hc;
  const x = c.getContext('2d');
  const ink = '#12131d', cx = Wc / 2, base = Hc - 0.02 * U;
  const Y = (y) => base - y * U, X = (v) => cx + v * U;
  const stone = lit ? '#8f8a8c' : '#646a7c', dark = lit ? '#5f5a62' : '#454a5c', top = lit ? '#b0a596' : '#7a8094';
  x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = 0.016 * U; x.strokeStyle = ink;
  const poly = (pts, fill) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(X(a), Y(b)) : x.moveTo(X(a), Y(b)))); x.closePath(); x.fillStyle = fill; x.fill(); x.stroke(); };
  const shade = (pts, fill) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(X(a), Y(b)) : x.moveTo(X(a), Y(b)))); x.closePath(); x.fillStyle = fill; x.fill(); };
  // the foot, two steps
  poly([[-0.34, 0], [0.34, 0], [0.3, 0.07], [-0.3, 0.07]], stone); shade([[0.12, 0.004], [0.335, 0.004], [0.297, 0.066], [0.1, 0.066]], dark);
  poly([[-0.22, 0.07], [0.22, 0.07], [0.19, 0.13], [-0.19, 0.13]], top);
  // the post
  poly([[-0.085, 0.13], [0.085, 0.13], [0.075, 0.55], [-0.075, 0.55]], stone); shade([[0.03, 0.135], [0.082, 0.135], [0.072, 0.545], [0.026, 0.545]], dark);
  // the shelf under the light
  poly([[-0.2, 0.55], [0.2, 0.55], [0.26, 0.63], [-0.26, 0.63]], top); shade([[0.09, 0.556], [0.2, 0.556], [0.255, 0.624], [0.11, 0.624]], dark);
  // the light box and its window
  poly([[-0.17, 0.63], [0.17, 0.63], [0.17, 0.86], [-0.17, 0.86]], stone);
  shade([[0.1, 0.635], [0.165, 0.635], [0.165, 0.855], [0.1, 0.855]], dark);
  x.beginPath(); x.rect(X(-0.105), Y(0.82), 0.19 * U, 0.15 * U);
  if (lit) {
    const g = x.createRadialGradient(X(-0.01), Y(0.745), 0, X(-0.01), Y(0.745), 0.13 * U);
    g.addColorStop(0, '#fff6d8'); g.addColorStop(0.45, '#ffd98f'); g.addColorStop(1, '#f2a14e');
    x.fillStyle = g;
  } else x.fillStyle = '#151a2b';
  x.fill(); x.stroke();
  x.beginPath(); x.moveTo(X(-0.01), Y(0.82)); x.lineTo(X(-0.01), Y(0.67)); x.lineWidth = 0.012 * U; x.stroke(); x.lineWidth = 0.016 * U;
  // the roof, its corners turned up
  x.beginPath();
  x.moveTo(X(-0.4), Y(0.875)); x.quadraticCurveTo(X(-0.3), Y(0.9), X(-0.2), Y(0.9));
  x.lineTo(X(0.2), Y(0.9)); x.quadraticCurveTo(X(0.3), Y(0.9), X(0.4), Y(0.875));
  x.quadraticCurveTo(X(0.36), Y(0.93), X(0.25), Y(0.96));
  x.quadraticCurveTo(X(0.1), Y(1.04), X(0.02), Y(1.07));
  x.lineTo(X(-0.02), Y(1.07));
  x.quadraticCurveTo(X(-0.1), Y(1.04), X(-0.25), Y(0.96));
  x.quadraticCurveTo(X(-0.36), Y(0.93), X(-0.4), Y(0.875));
  x.closePath(); x.fillStyle = stone; x.fill();
  // the roof's underside catches the flame
  x.save(); x.clip();
  x.fillStyle = lit ? '#c9a77e' : '#3e4356'; x.fillRect(X(-0.42), Y(0.92), 0.84 * U, 0.06 * U);
  x.fillStyle = top; x.beginPath(); x.moveTo(X(-0.25), Y(0.96)); x.quadraticCurveTo(X(-0.1), Y(1.04), X(0), Y(1.07)); x.lineTo(X(-0.12), Y(0.95)); x.closePath(); x.fill();
  x.restore();
  x.beginPath();
  x.moveTo(X(-0.4), Y(0.875)); x.quadraticCurveTo(X(-0.3), Y(0.9), X(-0.2), Y(0.9));
  x.lineTo(X(0.2), Y(0.9)); x.quadraticCurveTo(X(0.3), Y(0.9), X(0.4), Y(0.875));
  x.quadraticCurveTo(X(0.36), Y(0.93), X(0.25), Y(0.96));
  x.quadraticCurveTo(X(0.1), Y(1.04), X(0.02), Y(1.07));
  x.lineTo(X(-0.02), Y(1.07));
  x.quadraticCurveTo(X(-0.1), Y(1.04), X(-0.25), Y(0.96));
  x.quadraticCurveTo(X(-0.36), Y(0.93), X(-0.4), Y(0.875));
  x.closePath(); x.stroke();
  // the jewel on top
  x.beginPath(); x.moveTo(X(0), Y(1.17)); x.quadraticCurveTo(X(0.07), Y(1.1), X(0.04), Y(1.075)); x.lineTo(X(-0.04), Y(1.075)); x.quadraticCurveTo(X(-0.07), Y(1.1), X(0), Y(1.17));
  x.closePath(); x.fillStyle = top; x.fill(); x.stroke();
  // moss
  x.fillStyle = lit ? 'rgba(104,132,82,0.85)' : 'rgba(64,92,70,0.85)';
  for (const [a, b, r] of [[-0.22, 0.03, 0.05], [-0.15, 0.06, 0.035], [0.24, 0.025, 0.035], [-0.06, 0.6, 0.03], [-0.3, 0.9, 0.025]]) { x.beginPath(); x.ellipse(X(a), Y(b), r * U, r * U * 0.5, 0, 0, 6.3); x.fill(); }
  return { url: c.toDataURL('image/png'), w: Wc, h: Hc, U };
}

export function mount(host, options = {}) {
  const items = options.projects || [];
  const shelves = options.shelves || [];
  const total = options.total || items.length;
  const N = items.length;
  const still = !!options.still;
  const onChange = typeof options.onChange === 'function' ? options.onChange : () => {};
  const top = options.top || host;                           // the cards and what plays: pressable, in front
  const inset = typeof options.inset === 'function' ? options.inset : () => ({ left: 0, top: 0 });
  const coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const doc = host.ownerDocument;

  // ------------------------------------------------------------------ the stations (plan.js: the same numbers as the twin)
  const G = garden(items, shelves);
  const S = G.S, trees = G.trees, bushes = G.bushes;
  let L = null;

  // ------------------------------------------------------------------ what stands in the scene
  const world = doc.createElement('div'); world.className = 'pw-world';
  const make = (tag, cls, parent) => { const e = doc.createElement(tag); if (cls) e.className = cls; (parent || world).appendChild(e); return e; };
  const picture = (cls, src, parent) => { const e = make('img', cls, parent); e.alt = ''; e.decoding = 'sync'; e.draggable = false; e.src = src; return e; };

  const sky = make('div', 'pw-sky'); const stars = make('div', 'pw-stars', sky);
  const moon = make('div', 'pw-flat pw-moon');
  const clouds = picture('pw-flat pw-clouds', IMG('clouds.webp'));
  const house = picture('pw-flat pw-house', IMG('tea-house.webp'));
  const ground = make('canvas', 'pw-layer pw-ground'); const gx = ground.getContext('2d');
  const air = make('canvas', 'pw-layer pw-air'); const ax = air.getContext('2d');
  make('div', 'pw-vignette');

  (function () {
    const c = doc.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); const R = rnd(11);
    for (let i = 0; i < 150; i++) {
      const big = R() < 0.12; x.globalAlpha = big ? 0.9 : 0.25 + R() * 0.5; x.fillStyle = R() < 0.2 ? '#ffe9c0' : '#dfe3ff';
      x.beginPath(); x.arc(R() * 512, R() * 512, big ? 1.5 : 0.6 + R() * 0.5, 0, 6.3); x.fill();
    }
    stars.style.backgroundImage = 'url(' + c.toDataURL() + ')';
  })();
  const fly = doc.createElement('canvas'); fly.width = fly.height = 48;
  (function () {
    const x = fly.getContext('2d'); const g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, 'rgba(255,246,190,1)'); g.addColorStop(0.18, 'rgba(240,226,130,0.75)'); g.addColorStop(0.5, 'rgba(190,210,90,0.16)'); g.addColorStop(1, 'rgba(160,200,80,0)');
    x.fillStyle = g; x.fillRect(0, 0, 48, 48);
  })();

  const LIT = drawLantern(doc, true), DARK = drawLantern(doc, false);

  const treeSrc = [IMG('tree-night.webp'), IMG('tree-blossom.webp')];
  for (const t of trees) {
    t.el = picture('pw-flat', treeSrc[t.pink ? 1 : 0]);
    t.el.width = TREE.w / 2; t.el.height = TREE.h / 2; t.el.style.visibility = 'hidden'; t.shown = false; t.last = ''; t.lo = -1;
  }
  for (const b of bushes) {
    b.el = picture('pw-flat', IMG(b.side < 0 ? 'near-bush-l.webp' : 'near-bush-r.webp'));
    b.el.width = 275; b.el.height = 125; b.el.style.visibility = 'hidden'; b.shown = false; b.last = ''; b.lo = -1;
  }

  // the lanterns, the projects' windows and their cards
  const P = S.map((s) => {
    const it = s.it;
    const lan = make('div', 'pw-flat pw-lantern');
    const lanDark = picture('pw-lan-dark', DARK.url, lan), lanLit = picture('pw-lan-lit', LIT.url, lan);
    void lanDark;
    lan.style.visibility = 'hidden';
    const halo = make('div', 'pw-flat pw-halo'); halo.style.visibility = 'hidden';

    const kind = it.run === 'frame' ? 'play' : it.run === 'film' ? 'watch' : it.shelf;
    const win = make('div', 'pw-flat pw-win pw-' + kind + ' pw-' + it.shelf);
    const legs = make('div', 'pw-legs', win); make('i', '', legs); make('i', '', legs);
    if (it.shelf === 'play') make('div', 'pw-eave', win);
    const frm = make('div', 'pw-frame', win);
    const scr = make('div', 'pw-screen', frm);
    const img = make('img', 'pw-pic', scr); img.alt = it.pic.alt; img.decoding = 'async'; img.draggable = false;
    img.width = it.pic.w; img.height = it.pic.h;
    win.style.visibility = 'hidden';

    // the card, in front (top): its buttons are pressed
    const card = make('article', 'pw-card', top); card.setAttribute('aria-label', it.name);
    const shelfTitle = shelves[s.sh] ? shelves[s.sh].title : '';
    make('p', 'pw-kick', card).textContent = shelfTitle + ' · ' + s.nth + ' of ' + s.of;
    make('h3', 'pw-name', card).textContent = it.name;
    make('p', 'pw-line', card).textContent = it.line;
    if (it.needs) make('p', 'pw-needs', card).textContent = it.needs;
    if (it.credit) make('p', 'pw-needs', card).textContent = it.credit;
    const act = make('p', 'pw-act', card);
    let btn, run = it.run;
    // (a phone: a game wants a keyboard, and a finger on a game in the page would never scroll the page again: it
    // opens on its own page instead)
    if (run === 'frame' && coarse) run = 'link';
    const big = it.mb && it.mb > 5 ? ' (' + (it.mb % 1 ? it.mb.toFixed(1) : it.mb) + ' MB)' : '';
    if (run === 'link') {
      btn = make('a', 'pw-btn', act); btn.href = it.href; btn.textContent = it.label;
      if (/^https?:/.test(it.href)) { btn.target = '_blank'; btn.rel = 'noopener'; btn.classList.add('pw-out'); }
      const note = it.run === 'frame' ? 'Opens the game on its own page' : it.note;
      if (note) make('span', 'pw-note', act).textContent = note;
    } else {
      btn = make('button', 'pw-btn pw-go', act); btn.type = 'button'; btn.textContent = it.label + big;
      btn.addEventListener('click', () => (P[s.i].on ? stop(s.i) : start(s.i)));
      make('span', 'pw-note', act).textContent = run === 'film' ? 'Plays here, with sound' : 'Plays here, with sound. Scroll on to stop it';
    }
    card.style.visibility = 'hidden';
    return { s, it, kind, run, lan, lanLit, halo, win, legs, frm, scr, img, card, btn, label: it.label + big, on: null, live: null, picState: 0,
      lanShown: false, winShown: false, cardShown: false, haloShown: false, lastL: '', lastW: '', lastLit: -1, lastHalo: -1, lastCard: -1, lastWin: -1, lastWo: -1 };
  });

  // the end of the walk: the house, and one card
  const endCard = make('article', 'pw-card pw-end', top);
  make('p', 'pw-kick', endCard).textContent = 'All of them';
  make('h3', 'pw-name', endCard).textContent = total + ' projects';
  make('p', 'pw-line', endCard).textContent = 'Games, films, apps and the things behind them, on one page.';
  const endAct = make('p', 'pw-act', endCard);
  const endBtn = make('a', 'pw-btn', endAct); endBtn.href = '/projects/'; endBtn.textContent = 'Open the projects page';
  endCard.style.visibility = 'hidden';

  host.appendChild(world);

  // ------------------------------------------------------------------ what plays: started by a button, stopped by leaving
  // It plays in front (top), in a frame laid exactly over its window's screen, which follows the window while it is
  // still near its place. A game is a page of this site in a frame: the mouse wheel over it is handed to this page,
  // so a game can never hold the page's scroll.
  function start(i) {
    const p = P[i]; if (p.on) return;
    for (const o of P) if (o.on) stop(o.s.i);
    const it = p.it;
    const live = make('div', 'pw-live', top); const box = make('div', 'pw-live-screen', live);
    let el;
    if (p.run === 'frame') {
      el = doc.createElement('iframe'); el.className = 'pw-play';
      el.src = it.src; el.title = it.name; el.allow = 'fullscreen; gamepad; autoplay'; el.setAttribute('allowfullscreen', '');
      el.addEventListener('load', () => {
        try {
          const w = el.contentWindow;
          w.addEventListener('wheel', (e) => {
            e.preventDefault();
            const k = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
            window.scrollBy(0, e.deltaY * k);
          }, { capture: true, passive: false });
        } catch (err) { /* another site's page: it cannot be reached */ }
      });
      box.appendChild(el);
      setTimeout(() => { try { el.focus(); } catch (e) { /* not yet */ } }, 300);
    } else {
      el = doc.createElement('video'); el.className = 'pw-play';
      el.controls = true; el.playsInline = true; el.preload = 'auto'; el.poster = it.pic.src; el.src = it.src;
      el.setAttribute('aria-label', it.name);
      box.appendChild(el);
      const pr = el.play(); if (pr && pr.catch) pr.catch(() => { /* the controls are there */ });
    }
    p.on = el; p.live = live; p.liveT = '';
    p.win.classList.add('pw-is-on');
    p.btn.textContent = 'Stop'; p.btn.setAttribute('aria-pressed', 'true');
    placeLive(p);
    onChange();
  }
  function stop(i) {
    const p = P[i]; if (!p.on) return;
    const el = p.on; p.on = null;
    if (el.tagName === 'VIDEO') { try { el.pause(); } catch (e) { /* gone */ } el.removeAttribute('src'); el.load(); }
    else el.src = 'about:blank';
    el.remove(); if (p.live) p.live.remove(); p.live = null;
    p.win.classList.remove('pw-is-on');
    p.btn.textContent = p.label; p.btn.removeAttribute('aria-pressed');
    onChange();
  }
  function placeLive(p) {
    if (!p.live || !L) return;
    const o = L.st[p.s.i];
    const sz = o.bw + 'x' + o.bh + ',' + o.ft;
    if (sz !== p.liveSz) { p.liveSz = sz; p.live.style.width = o.bw + 'px'; p.live.style.height = o.bh + 'px'; p.live.style.setProperty('--ft', o.ft + 'px'); }
    if (p.lastW !== p.liveT) { p.liveT = p.lastW; p.live.style.transform = p.lastW; }
    p.live.style.visibility = p.winShown ? '' : 'hidden';
  }

  // ------------------------------------------------------------------ pictures: fetched when their station is near
  let pending = 0;
  const count = (im) => { if (!im.complete) { pending++; const done = () => { pending--; onChange(); }; im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); } };
  for (const e of [house, clouds]) count(e);
  for (const s of treeSrc) { const im = new Image(); im.src = s; count(im); }
  // (the pictures in the windows are not plates: while one is coming the walk is still whole, its window shows its
  // empty screen; picsPending is only for the tests' settle)
  let picsPending = 0;
  function wantPic(p) {
    if (p.picState) return;
    p.picState = 1; picsPending++;
    const done = () => { picsPending--; p.picState = 2; p.img.classList.add('pw-on'); onChange(); };
    p.img.src = p.it.pic.src;
    if (p.img.decode) p.img.decode().then(done, done); else { p.img.addEventListener('load', done, { once: true }); p.img.addEventListener('error', done, { once: true }); }
  }

  // ------------------------------------------------------------------ the frame's geometry (plan.js)
  let W = 0, H = 0, tall = false, f = 1, cx = 0, hY = 0, DPR = 1;
  function layout() {
    W = host.clientWidth || 1; H = host.clientHeight || 1;
    const ins = inset();
    L = planLayout(G, W, H, ins.left || 0, ins.top || 0);
    tall = L.tall; f = L.f; cx = L.cx; hY = L.hY;
    DPR = Math.min((doc.defaultView && doc.defaultView.devicePixelRatio) || 1, 1.5);
    world.classList.toggle('pw-tall', tall); top.classList.toggle('pw-tall', tall);
    for (const c of [ground, air]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
    for (const p of P) {
      const o = L.st[p.s.i];
      p.win.style.width = o.bw + 'px'; p.win.style.height = o.bh + 'px'; p.win.style.setProperty('--ft', o.ft + 'px');
      p.legs.style.height = (o.legLen + 4) + 'px';
      p.card.style.width = L.cardW + 'px';
      p.lastW = ''; p.lastL = ''; p.lastCard = -1; p.liveSz = '';
    }
    endCard.style.width = L.endW + 'px';
    for (const t of trees) { t.last = ''; if (t.off && t.shown) { t.el.style.visibility = 'hidden'; t.shown = false; } }
    for (const b of bushes) b.last = '';
    moon.style.width = moon.style.height = (tall ? 0.1 * W : 0.06 * W) * 2 + 'px';
    lastKey = '';
  }

  // ------------------------------------------------------------------ one frame
  let active = true, lastKey = '';
  const state = { index: -1, k: 0, flats: 0, playing: -1 };
  const hide = (o, key = 'shown', el = o.el) => { if (o[key]) { el.style.visibility = 'hidden'; o[key] = false; } };
  const show = (o, key = 'shown', el = o.el) => { if (!o[key]) { el.style.visibility = 'inherit'; o[key] = true; } };

  // q: the walk's progress; time: seconds; pointer: the mouse (null: no lean); cards: 0..1, how much of the cards
  // and of the end card is shown (the chapter fades them out at its end: projects.js)
  function frame(q, time, pointer, cards) {
    if (!active) return state;
    if (!L) layout();
    q = clamp(q || 0); time = time || 0;
    const cv = cards === undefined ? 1 : clamp(cards);
    const px = pointer ? clamp(pointer.x || 0, -1, 1) : 0;
    const k = L.kOf(q), cam = L.camAt(k), camX = cam.x, camY = cam.y, camZ = cam.z;
    const pathAt = L.pathAt;
    const front = clamp(Math.round(k), 0, N - 1);
    const walking = k > -0.5 && k < N - 0.5;
    let flats = 0;
    const lean = px * 10;                                  // the far garden leans with the mouse, the near things do not
    const gxs = (X, d) => cx + f * (X - camX) / d, gy = (Y, d) => hY - f * (Y - camY) / d;

    // --- what was started stops when its project is no longer in front
    for (const p of P) if (p.on && (Math.abs(k - p.s.i) > 0.28)) stop(p.s.i);   // as soon as its window leaves its place

    // --- the sky
    stars.style.backgroundPosition = (-lean * 0.4 - camZ * 0.4).toFixed(1) + 'px 0';
    const mr = (tall ? 0.1 * W : 0.06 * W);
    moon.style.opacity = tall ? '1' : (1 - (walking ? 1 - ss(0.62, 0.9, Math.abs(k - front)) : 0) * (k > -0.6 && k < N - 0.4 ? 1 : 0)).toFixed(3);
    moon.style.transform = 'translate3d(' + (cx + ((tall ? 0.74 : 0.8) - 0.5) * W - mr - lean * 0.5).toFixed(1) + 'px,' + (hY - (tall ? 0.3 : 0.36) * H - mr).toFixed(1) + 'px,0)';
    {
      const cw = (tall ? 3.2 : 1.6) * W, ch = cw * 350 / 2816;
      clouds.style.transform = 'translate3d(' + (cx - cw * 0.5 - lean - camZ * 0.9 % cw + Math.sin(time * 0.05) * 14).toFixed(1) + 'px,' + (hY - (tall ? 0.5 : 0.3) * H - ch / 2).toFixed(1) + 'px,0) scale(' + (cw / 2816).toFixed(4) + ')';
    }

    // --- the tea house at the end of the path
    {
      const d = G.zHouse - camZ, w = f * HOUSE.hw / d, s = w / HOUSE.w;
      const sx = gxs(0, d) - lean * 0.6, y = hY + f * camY / d - HOUSE.lawn * s;
      house.style.transform = 'translate3d(' + (sx - HOUSE.door * s).toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(5) + ')';
    }

    // --- the ground: the lawn, the stepping stones, the light under the lit lantern, the petals
    const g = gx;
    // (the ground depends only on where the camera is: drawn again only when that changes)
    const gk = k.toFixed(5) + ',' + W + ',' + H;
    if (gk !== lastKey) {
    lastKey = gk;
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
      const haze = g.createLinearGradient(0, hY - 0.16 * H, 0, hY + 2);
      haze.addColorStop(0, 'rgba(70,74,140,0)'); haze.addColorStop(1, 'rgba(84,86,150,0.45)');
      g.fillStyle = haze; g.fillRect(0, hY - 0.16 * H, W, 0.16 * H + 2);
      const lawn = g.createLinearGradient(0, hY, 0, H);
      lawn.addColorStop(0, '#2a3734'); lawn.addColorStop(0.25, '#232f2e'); lawn.addColorStop(1, '#141c22');
      g.fillStyle = lawn; g.fillRect(0, hY, W, H - hY);
      g.globalCompositeOperation = 'lighter';
      for (const p of P) {
        const o = L.st[p.s.i];
        const u = p.s.i === 0 && k < 0 ? 0 : Math.abs(k - p.s.i); if (u > 0.55) continue;
        const d = o.lZ - camZ; if (d < 0.5) continue;
        const al = 0.55 * (1 - ss(0.3, 0.55, u));
        const x = gxs(o.lX, d), y = gy(0, d), rx = f * 2.4 / d, ry = rx * clamp(camY * 0.75 / d, 0.1, 0.6);
        g.save(); g.translate(x, y); g.scale(1, ry / rx);
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        rg.addColorStop(0, 'rgba(255,214,150,' + al.toFixed(3) + ')'); rg.addColorStop(0.3, 'rgba(240,184,112,' + (al * 0.5).toFixed(3) + ')'); rg.addColorStop(0.7, 'rgba(210,150,90,' + (al * 0.12).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(200,140,80,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rx, 0, 6.3); g.fill(); g.restore();
      }
      for (const p of P) {
        if (p.kind !== 'watch') continue;
        const o = L.st[p.s.i];
        const u = Math.abs(k - p.s.i); if (u > 0.6) continue;
        const d = o.wZ - 0.8 - camZ; if (d < 0.5) continue;
        const al = 0.3 * (1 - ss(0.3, 0.6, u));
        const x = gxs(o.wX + o.ww / 2, d), y = gy(0, d), rx = f * o.ww * 0.75 / d, ry = rx * clamp(camY * 0.75 / d, 0.1, 0.5);
        g.save(); g.translate(x, y); g.scale(1, ry / rx);
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        rg.addColorStop(0, 'rgba(170,186,255,' + al.toFixed(3) + ')'); rg.addColorStop(0.45, 'rgba(140,150,230,' + (al * 0.4).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(120,130,210,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rx, 0, 6.3); g.fill(); g.restore();
      }
      g.globalCompositeOperation = 'source-over';
      let lit = null; { const p = P[front]; if (Math.abs(k - front) < 0.55) lit = L.st[front]; }
      const litI = lit ? front : -1;
      const stones = G.stones;
      for (let i = stones.length - 1; i >= 0; i--) {
        const st = stones[i], d = st.Z - camZ; if (d < 0.45 || d > FAR) continue;
        const X = pathAt(st.Z) + st.j;
        const rx = f * 0.34 * st.s / d, ry = Math.max(0.5, rx * clamp(camY * 0.62 / d, 0.06, 0.62)), x = gxs(X, d), y = gy(0, d);
        if (x + rx < 0 || x - rx > W || y - ry > H) continue;
        const fade = 1 - ss(FAR - 12, FAR, d);
        let warm = 0; if (lit) { const dd = Math.hypot(X - lit.lX, st.Z - lit.lZ); warm = (1 - ss(0.4, 2.6, dd)) * (1 - ss(0.3, 0.55, Math.abs(k - litI))); }
        g.globalAlpha = fade;
        g.fillStyle = '#0d1119'; g.beginPath(); g.ellipse(x, y + ry * 0.2, rx + 2, ry + 2, st.t * 0.2, 0, 6.3); g.fill();
        g.fillStyle = 'rgb(' + Math.round(lerp(44, 92, warm)) + ',' + Math.round(lerp(52, 80, warm)) + ',' + Math.round(lerp(64, 70, warm)) + ')';
        g.beginPath(); g.ellipse(x, y, rx, ry, st.t * 0.2, 0, 6.3); g.fill();
        g.fillStyle = 'rgb(' + Math.round(lerp(58, 150, warm)) + ',' + Math.round(lerp(68, 126, warm)) + ',' + Math.round(lerp(82, 98, warm)) + ')';
        g.beginPath(); g.ellipse(x - rx * 0.05, y - ry * 0.18, rx * 0.82, ry * 0.66, st.t * 0.2, 0, 6.3); g.fill();
      }
      g.globalAlpha = 1;
      const petals = G.petals;
      for (let i = 0; i < petals.length; i++) {
        const pt = petals[i], d = pt.Z - camZ; if (d < 0.6) continue; if (d > 18) break;
        const x = gxs(pathAt(pt.Z) + pt.X, d); if (x < -20 || x > W + 20) continue;
        const y = gy(0, d), rx = f * pt.r / d, ry = rx * clamp(camY * 0.7 / d, 0.12, 0.6);
        g.globalAlpha = (1 - ss(11, 18, d)) * 0.85; g.fillStyle = pt.c < 0.5 ? '#8d6a8c' : '#b584a0';
        g.beginPath(); g.ellipse(x, y, rx, ry, pt.t, 0, 6.3); g.fill();
      }
      g.globalAlpha = 1;
    }

    // --- the trees
    for (const t of trees) {
      const d = t.Z - camZ;
      if (t.off || d < 0.8 || d > FAR + 6) { hide(t); continue; }
      const sc = f / d, hpx = t.h * sc, wpx = hpx * TREE.w / TREE.h;
      const sx = gxs(t.X, d) - lean * (t.row ? 0.5 : 0.25), sy = hY + camY * sc;
      const left = sx - (t.flip ? 1 - TREE.ax : TREE.ax) * wpx, topY = sy - TREE.ay * hpx;
      const op = Math.round((1 - ss(FAR - 6, FAR + 6, d)) * ss(1.6, 3.4, d) * 50) / 50;
      if (op <= 0 || left > W + 10 || left + wpx < -10 || topY > H + 10) { hide(t); continue; }
      show(t); flats++;
      const s = hpx / (TREE.h / 2);
      const tr = t.flip ? 'translate3d(' + (left + wpx).toFixed(1) + 'px,' + topY.toFixed(1) + 'px,0) scale(' + (-s).toFixed(4) + ',' + s.toFixed(4) + ')'
        : 'translate3d(' + left.toFixed(1) + 'px,' + topY.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      if (tr !== t.last) { t.el.style.transform = tr; t.last = tr; }
      if (op !== t.lo) { t.el.style.opacity = op; t.lo = op; }
      const z = String(Math.round(100000 - t.Z * 100)); if (t.el.style.zIndex !== z) t.el.style.zIndex = z;
    }

    // --- bushes close to the eye
    for (const b of bushes) {
      const d = b.Z - camZ;
      const op = d > 0.9 && d < 5 ? Math.round(ss(1, 2, d) * (1 - ss(3.4, 5, d)) * 40) / 40 : 0;
      if (op <= 0) { hide(b); continue; }
      const sc = f / d, wpx = b.w * sc, hpx = wpx * 250 / 550, left = gxs(b.X, d) - wpx / 2, topY = hY + camY * sc - hpx * 0.8;
      if (left > W || left + wpx < 0 || topY > H) { hide(b); continue; }
      show(b); flats++;
      const tr = 'translate3d(' + left.toFixed(1) + 'px,' + topY.toFixed(1) + 'px,0) scale(' + (wpx / 275).toFixed(4) + ')';
      if (tr !== b.last) { b.el.style.transform = tr; b.last = tr; }
      if (op !== b.lo) { b.el.style.opacity = op; b.lo = op; }
      const z = String(Math.round(100000 - b.Z * 100)); if (b.el.style.zIndex !== z) b.el.style.zIndex = z;
    }

    // --- the stations: lantern, window, card
    for (const p of P) {
      const i = p.s.i, u = Math.abs(k - i), o = L.st[i];
      const litO = Math.round((i === 0 && k < 0 ? 1 : 1 - ss(0.3, 0.5, u)) * 100) / 100;
      {
        const d = o.lZ - camZ;
        if (d < 0.7 || d > FAR) { hide(p, 'lanShown', p.lan); hide(p, 'haloShown', p.halo); }
        else {
          const sc = f / d, hpx = (LH + 0.06) * sc, wpx = hpx * LIT.w / LIT.h, x = gxs(o.lX, d) - wpx / 2, y = gy(0, d) - hpx + 0.02 * LIT.U * hpx / LIT.h;
          if (x > W + 20 || x + wpx < -20 || y > H + 20) { hide(p, 'lanShown', p.lan); hide(p, 'haloShown', p.halo); }
          else {
            show(p, 'lanShown', p.lan); flats++;
            const s = hpx / LIT.h;
            const tr = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(5) + ')';
            if (tr !== p.lastL) { p.lan.style.transform = tr; p.lan.style.zIndex = String(Math.round(100000 - o.lZ * 100)); p.lastL = tr; }
            const fl = still ? 1 : 0.94 + 0.06 * Math.sin(time * 7.3 + i) * Math.sin(time * 3.1 + i * 2);
            const lo = Math.round(litO * fl * 100) / 100;
            if (lo !== p.lastLit) { p.lanLit.style.opacity = lo; p.lastLit = lo; }
            if (litO > 0.01) {
              show(p, 'haloShown', p.halo);
              const hs = 1.6 * sc, hx = x + wpx / 2 - 0.01 * sc - hs / 2, hy = gy(0.745, d) - hs / 2;
              p.halo.style.transform = 'translate3d(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px,0) scale(' + (hs / 200).toFixed(4) + ')';
              p.halo.style.zIndex = String(Math.round(100000 - o.lZ * 100) + 1);
              const ho = Math.round(litO * fl * 0.8 * 100) / 100; if (ho !== p.lastHalo) { p.halo.style.opacity = ho; p.lastHalo = ho; }
            } else hide(p, 'haloShown', p.halo);
          }
        }
      }
      {
        const d = o.wZ - camZ;
        const gone = ss(0.3, 0.56, k - i);                 // a window the walk has passed steps aside into the dark
        if (d < 0.8 || d > FAR || gone >= 1) hide(p, 'winShown', p.win);
        else {
          const sc = f / d;
          let x = gxs(o.wX, d), y = gy(o.wY, d), s = (o.ww * sc) / o.bw;
          // close to its station it holds still, at its own size, so a game or a film in it is sharp
          const hold = 1 - ss(0.04, 0.32, u);
          if (hold > 0) { x = lerp(x, o.rect.x - o.ft, hold); y = lerp(y, o.rect.y - o.ft, hold); s = lerp(s, 1, hold); }
          if (x > W + 20 || x + o.bw * s < -20 || y > H + 20) hide(p, 'winShown', p.win);
          else {
            show(p, 'winShown', p.win); flats++;
            const tr = hold >= 1 ? 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)' : 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ')';
            if (tr !== p.lastW) { p.win.style.transform = tr; p.win.style.zIndex = String(Math.round(100000 - o.wZ * 100)); p.lastW = tr; }
            const dim = Math.round((1 - litO) * 0.3 * 100) / 100;
            if (dim !== p.lastWin) { p.win.style.setProperty('--dim', dim); p.lastWin = dim; }
            const wo = Math.round((1 - gone) * (1 - ss(FAR - 8, FAR, d)) * 100) / 100;
            if (wo !== p.lastWo) { p.win.style.opacity = wo; p.lastWo = wo; }
            if (u < 2.4) wantPic(p);
          }
        }
        if (still && u < 2.4) wantPic(p);
        placeLive(p);
      }
      {
        const co = Math.round((1 - ss(0.22, 0.4, u)) * cv * 100) / 100;
        if (co <= 0) hide(p, 'cardShown', p.card);
        else {
          show(p, 'cardShown', p.card);
          if (co !== p.lastCard) {
            const rise = (1 - co) * 14;
            p.card.style.opacity = co; p.card.style.transform = 'translate3d(' + Math.round(o.cardAt.x) + 'px,' + Math.round(o.cardAt.y + rise) + 'px,0)';
            p.lastCard = co;
          }
        }
      }
    }
    // the end card (the chapter takes it away, up, at its very end: cards)
    {
      const eo = ss(N - 1 + 0.75, N - 1 + 1.25, k), ev = eo * cv;
      if (ev <= 0.005) { if (endCard.style.visibility !== 'hidden') endCard.style.visibility = 'hidden'; }
      else {
        endCard.style.visibility = 'inherit'; endCard.style.opacity = ev.toFixed(3);
        const ew = endCard.offsetWidth;
        const ey = tall ? Math.max(0.1 * H, (L.top || 0) + 16) : 0.08 * H;
        endCard.style.transform = 'translate3d(' + Math.round(cx - ew / 2) + 'px,' + Math.round(ey + (1 - eo) * 14 - (1 - cv) * 0.06 * H) + 'px,0)';
      }
    }

    // --- the fireflies
    ax.setTransform(DPR, 0, 0, DPR, 0, 0); ax.clearRect(0, 0, W, H);
    if (!still) {
      ax.globalCompositeOperation = 'lighter';
      const hold = P[front] && Math.abs(k - front) < 0.3 ? L.st[front].rect : null;
      for (const fl of G.flies) {
        const d = 1.4 + mod(fl.Z - camZ, 16);
        const X = fl.X + 0.35 * Math.sin(time * fl.w + fl.ph) + pathAt(camZ + d), Y = fl.Y + 0.22 * Math.sin(time * fl.w * 1.3 + fl.ph * 2);
        const x = gxs(X, d) - lean * 0.3, y = gy(Y, d);
        if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
        if (hold && x > hold.x - 10 && x < hold.x + hold.w + 10 && y > hold.y - 10 && y < hold.y + hold.h + 10) continue;
        const pulse = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(time * 1.1 + fl.ph * 3), 2);
        const r = clamp(f * 0.045 * fl.r / d, 2, 20);
        ax.globalAlpha = pulse * ss(1.4, 3, d) * (1 - ss(11, 17, d)) * 0.8;
        ax.drawImage(fly, x - r, y - r, 2 * r, 2 * r);
      }
      ax.globalAlpha = 1; ax.globalCompositeOperation = 'source-over';
    }

    state.index = walking ? front : -1; state.k = k; state.flats = flats;
    state.playing = P.findIndex((p) => p.on);
    return state;
  }

  function resize() { layout(); }
  function setActive(on) {
    active = !!on;
    world.style.visibility = active ? '' : 'hidden';
    if (!active) {
      for (const p of P) { if (p.on) stop(p.s.i); hide(p, 'cardShown', p.card); p.lastCard = -1; }
      endCard.style.visibility = 'hidden';
    }
  }
  function dispose() { for (const p of P) { if (p.on) stop(p.s.i); p.card.remove(); } endCard.remove(); world.remove(); }
  const ready = () => pending === 0;
  const picsReady = () => picsPending === 0;

  layout();
  // (the first two stations' pictures at once: they are in the walk's first view, under the dissolve)
  wantPic(P[0]); if (P[1]) wantPic(P[1]);
  return { frame, resize, setActive, dispose, ready, picsReady, count: N, state, start, stop, plan: () => L, world };
}
