/* PROJECTS: A WALK DOWN THE GARDEN PATH. One chapter of the tea room, as a scene a host page drives.

   Further down the same garden, the same night. The camera walks along a path of stepping stones towards the tea
   house. A stone lantern stands by the path for each project, and only the lantern of the project in front of you is
   lit. Beside it the project stands as it is used: a game in a framed window that plays where it stands, a film on a
   lit screen that plays where it stands, a download or a write-up as its picture. The path bends at each shelf, so
   the builds stand now on the right, now on the left.

   mount(hostElement, options) -> { frame(q, time, pointer), resize(), setActive(on), dispose(), qOf(i), ... }
     q        the chapter's progress, 0 to 1: where the camera is, which lantern is lit, which card is shown,
     time     seconds (the clouds, the fireflies, the flicker of the flame),
     pointer  { x, y } from -1 to 1: the far garden leans a little, if given.
   The one thing that is not a function of q is what the reader started with a button (a game, a film): it stops
   as soon as its project is no longer the one in front, and on setActive(false).

   options: projects, shelves, total (see projects.js), still (time is held), onChange() (draw again). */

const IMG = (p) => new URL('../img/' + p, import.meta.url).href;
const CSS = new URL('../css/scene.css', import.meta.url).href;

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mod = (x, m) => ((x % m) + m) % m;
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// The walk, in metres more or less. Station i (a lantern and its project) stands at zs(i); the shelves are further apart.
const DZ = 7, GAP = 4.5, EYE = 1.6, LH = 1.3;            // LH: the lantern's height
const K0 = -1.35, KEND_PAD = 1.75;                       // the walk in before the first lantern, and on to the house after the last
const TREE = { w: 1180, h: 1271, ax: 0.30, ay: 0.967 };
const HOUSE = { w: 2816, h: 1297, lawn: 462, door: 1408 };
const FAR = 34;

// ------------------------------------------------------------------ the stone lantern, drawn once in the garden's own hand
function drawLantern(doc, lit) {
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
  const doc = host.ownerDocument;
  if (!doc.querySelector('link[data-pw-scene]')) {
    const l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = CSS; l.setAttribute('data-pw-scene', ''); doc.head.appendChild(l);
  }

  // ------------------------------------------------------------------ the stations
  const shelfOf = (it) => shelves.findIndex((s) => s.key === it.shelf);
  const S = items.map((it, i) => {
    const sh = shelfOf(it);
    const inShelf = items.filter((o) => o.shelf === it.shelf);
    return { it, i, sh, side: sh % 2 ? -1 : 1, nth: inShelf.indexOf(it) + 1, of: inShelf.length, Z: i * DZ + sh * GAP };
  });
  const zs = (k) => {                                   // where station k stands; before and after, the walk goes on evenly
    if (k <= 0) return S[0].Z + k * DZ;
    if (k >= N - 1) return S[N - 1].Z + (k - N + 1) * DZ;
    const i = Math.floor(k), t = k - i; return lerp(S[i].Z, S[i + 1].Z, t);
  };
  const KEND = N - 1 + KEND_PAD;
  const zHouse = zs(KEND) + 16;

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

  // trees: a row each side of the path and the wood behind; bushes close to the eye
  const TR = rnd(20261113);
  const trees = [];
  const treeSrc = [IMG('tree-night.webp'), IMG('tree-blossom.webp')];
  for (let z = -14; z < zHouse + 6; z += 3.1) {
    for (const side of [-1, 1]) {
      trees.push({ row: 0, side, xr: TR(), Z: z + TR() * 1.8, h: 5.4 + TR() * 1.8, pink: TR() < 0.42, flip: TR() < 0.5 });
      trees.push({ row: 1, side, xr: TR(), Z: z + 1.4 + TR() * 1.8, h: 6 + TR() * 2.4, pink: TR() < 0.3, flip: TR() < 0.5 });
    }
  }
  trees.sort((a, b) => a.Z - b.Z);
  for (const t of trees) {
    t.el = picture('pw-flat', treeSrc[t.pink ? 1 : 0]);
    t.el.width = TREE.w / 2; t.el.height = TREE.h / 2; t.el.style.visibility = 'hidden'; t.shown = false; t.last = ''; t.lo = -1;
  }
  const bushes = [];
  for (let z = -6, j = 0; z < zHouse; z += 2.4 + TR() * 1.6, j++) {
    const side = j % 2 ? 1 : -1, b = { side, Z: z, xr: TR(), wr: 0.8 + TR() * 0.5, shown: false, last: '', lo: -1 };
    b.el = picture('pw-flat', IMG(side < 0 ? 'near-bush-l.webp' : 'near-bush-r.webp'));
    b.el.width = 275; b.el.height = 125; b.el.style.visibility = 'hidden';
    bushes.push(b);
  }

  // the lanterns, the projects' windows and their cards
  const P = S.map((s) => {
    const it = s.it;
    const lan = make('div', 'pw-flat pw-lantern');
    const lanDark = picture('pw-lan-dark', DARK.url, lan), lanLit = picture('pw-lan-lit', LIT.url, lan);
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

    const card = make('article', 'pw-card'); card.setAttribute('aria-label', it.name);
    const shelfTitle = shelves[s.sh] ? shelves[s.sh].title : '';
    make('p', 'pw-kick', card).textContent = shelfTitle + ' · ' + s.nth + ' of ' + s.of;
    make('h2', 'pw-name', card).textContent = it.name;
    make('p', 'pw-line', card).textContent = it.line;
    if (it.needs) make('p', 'pw-needs', card).textContent = it.needs;
    if (it.credit) make('p', 'pw-needs', card).textContent = it.credit;
    const act = make('p', 'pw-act', card);
    let btn;
    const big = it.mb && it.mb > 5 ? ' (' + (it.mb % 1 ? it.mb.toFixed(1) : it.mb) + ' MB)' : '';
    if (it.run === 'link') {
      btn = make('a', 'pw-btn', act); btn.href = it.href; btn.textContent = it.label;
      if (/^https?:/.test(it.href)) { btn.target = '_blank'; btn.rel = 'noopener'; btn.classList.add('pw-out'); }
      if (it.note) make('span', 'pw-note', act).textContent = it.note;
    } else {
      btn = make('button', 'pw-btn pw-go', act); btn.type = 'button'; btn.textContent = it.label + big;
      btn.addEventListener('click', () => (P[s.i].on ? stop(s.i) : start(s.i)));
    }
    card.style.visibility = 'hidden';
    return { s, it, kind, lan, lanLit, halo, win, legs, frm, scr, img, card, btn, label: it.label + big, on: null, picState: 0,
      lanShown: false, winShown: false, cardShown: false, haloShown: false, lastL: '', lastW: '', lastLit: -1, lastHalo: -1, lastCard: -1, lastWin: -1 };
  });

  // the end of the walk: the house, and one card
  const endCard = make('article', 'pw-card pw-end');
  make('p', 'pw-kick', endCard).textContent = 'All of them';
  make('h2', 'pw-name', endCard).textContent = total + ' projects';
  make('p', 'pw-line', endCard).textContent = 'Games, films, apps and the things behind them, on one page.';
  const endAct = make('p', 'pw-act', endCard);
  const endBtn = make('a', 'pw-btn', endAct); endBtn.href = '/projects/'; endBtn.textContent = 'Open the projects page';
  endCard.style.visibility = 'hidden';

  host.appendChild(world);

  // ------------------------------------------------------------------ what plays: started by a button, stopped by leaving
  function start(i) {
    const p = P[i]; if (p.on) return;
    for (const o of P) if (o.on) stop(o.s.i);
    const it = p.it;
    if (it.run === 'frame') {
      const f = doc.createElement('iframe'); f.className = 'pw-play';
      f.src = it.src; f.title = it.name; f.allow = 'fullscreen; gamepad; autoplay'; f.setAttribute('allowfullscreen', '');
      p.scr.appendChild(f); p.on = f;
      setTimeout(() => { try { f.focus(); } catch (e) { /* not yet */ } }, 300);
    } else if (it.run === 'film') {
      const v = doc.createElement('video'); v.className = 'pw-play';
      v.controls = true; v.playsInline = true; v.preload = 'auto'; v.poster = it.pic.src; v.src = it.src;
      v.setAttribute('aria-label', it.name);
      p.scr.appendChild(v); p.on = v;
      const pr = v.play(); if (pr && pr.catch) pr.catch(() => { /* the controls are there */ });
    }
    p.win.classList.add('pw-is-on');
    p.btn.textContent = 'Stop'; p.btn.setAttribute('aria-pressed', 'true');
    onChange();
  }
  function stop(i) {
    const p = P[i]; if (!p.on) return;
    const el = p.on; p.on = null;
    if (el.tagName === 'VIDEO') { try { el.pause(); } catch (e) { /* gone */ } el.removeAttribute('src'); el.load(); }
    else el.src = 'about:blank';
    el.remove();
    p.win.classList.remove('pw-is-on');
    p.btn.textContent = p.label; p.btn.removeAttribute('aria-pressed');
    onChange();
  }

  // ------------------------------------------------------------------ pictures: fetched when their station is near
  let pending = 0;
  const count = (im) => { if (!im.complete) { pending++; const done = () => { pending--; onChange(); }; im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); } };
  for (const e of [house, clouds]) count(e);
  for (const s of treeSrc) { const im = new Image(); im.src = s; count(im); }
  function wantPic(p) {
    if (p.picState) return;
    p.picState = 1; pending++;
    const done = () => { pending--; p.picState = 2; p.img.classList.add('pw-on'); onChange(); };
    p.img.src = p.it.pic.src;
    if (p.img.decode) p.img.decode().then(done, done); else { p.img.addEventListener('load', done, { once: true }); p.img.addEventListener('error', done, { once: true }); }
  }

  // ------------------------------------------------------------------ the frame's geometry
  let W = 0, H = 0, tall = false, f = 1, cx = 0, hY = 0, DV = 5, WB = 2, DPR = 1, cardW = 400;
  const camX0 = (i) => -S[i].side * (tall ? 0.12 : 0.32);       // the camera keeps to the side away from the build
  const ease = (t) => t - 0.86 * Math.sin(2 * Math.PI * t) / (2 * Math.PI);   // slow by a lantern, quicker between
  function camAt(k) {
    let z, x;
    if (k <= 0) { const t = k + 1; z = S[0].Z - DZ + DZ * (t >= 0 ? ease(t) : t); x = lerp(camX0(0), 0, ss(0, -1.3, k)); }
    else if (k >= N - 1) { const t = k - (N - 1); z = zs(N - 1) + DZ * (t < 1 ? ease(t) : t); x = lerp(camX0(N - 1), 0, ss(0, 1.2, t)); }
    else { const i = Math.floor(k), t = ease(k - i); z = lerp(S[i].Z, S[i + 1].Z, t); x = lerp(camX0(i), camX0(i + 1), t); }
    return { x, y: EYE, z: z - DV };
  }
  const kOf = (q) => K0 + (KEND - K0) * clamp(q);
  const qOf = (i) => (clamp(i, 0, N - 1) - K0) / (KEND - K0);

  // where things stand on the screen when their station is in front, and so where they stand in the garden
  let pathPts = [];
  function layout() {
    W = host.clientWidth || 1; H = host.clientHeight || 1; tall = W / H < 0.9;
    DPR = Math.min((doc.defaultView && doc.defaultView.devicePixelRatio) || 1, 1.5);
    world.classList.toggle('pw-tall', tall);
    if (tall) { f = 1.15 * W; hY = 0.63 * H; WB = 5; } else { f = 1.22 * H; hY = 0.46 * H; WB = 2.2; }
    const footY = tall ? 0.955 * H : 0.9 * H;
    DV = f * EYE / (footY - hY);
    cx = W / 2;
    const pad = tall ? 14 : Math.max(24, 0.035 * W);
    cardW = tall ? W - 2 * pad : Math.min(440, 0.32 * W);

    for (const c of [ground, air]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }

    for (const p of P) {
      const s = p.s, it = p.it, side = s.side, a = it.pic.w / it.pic.h;
      // the window's rectangle when its station is in front
      let w, x0, y0;
      if (tall) {
        w = W - 2 * pad; if (it.pic.w < 900) w = Math.min(w, it.pic.w); y0 = Math.max(10, 0.045 * H);
        x0 = (W - w) / 2;
      } else {
        const room = p.kind === 'watch' ? 0.56 : p.kind === 'play' ? 0.54 : 0.46;
        w = Math.min(room * W, (0.5 * H) * a);
        if (it.pic.w < 900) w = Math.min(w, it.pic.w);
        y0 = 0.085 * H;
        x0 = side > 0 ? W - pad - w - 0.02 * W : pad + 0.02 * W;
      }
      const h = w / a;
      p.rect = { x: x0, y: y0, w, h };
      const frameT = tall ? 7 : 11;
      p.bw = w + 2 * frameT; p.bh = h + 2 * frameT; p.ft = frameT;
      // in the garden: it stands WB behind its lantern
      const cam = camAt(s.i), d = DV + WB;
      p.d0 = d; p.wZ = s.Z + WB;
      p.wX = cam.x + ((x0 - frameT) - cx) * d / f;                       // its left edge
      p.wY = cam.y + (hY - (y0 - frameT)) * d / f;                       // its top
      p.ww = p.bw * d / f; p.wh = p.bh * d / f;
      p.legLen = Math.max(0, (p.wY - p.wh)) * f / d;                     // from its foot to the ground, in its own pixels
      p.win.style.width = p.bw + 'px'; p.win.style.height = p.bh + 'px'; p.win.style.setProperty('--ft', frameT + 'px');
      p.legs.style.height = (p.legLen + 4) + 'px';
      // the lantern: just past the window's near edge, on the path's side
      const lx = tall ? cx + side * 0.25 * W : (side > 0 ? x0 - 0.045 * W : x0 + w + 0.045 * W);
      p.lX = cam.x + (lx - cx) * DV / f; p.lZ = s.Z;
      // the card: under the window
      if (tall) p.cardAt = { x: pad, y: y0 + h + 2 * frameT + 12 };
      else p.cardAt = { x: side > 0 ? x0 + w + frameT - cardW : x0 - frameT, y: y0 + h + 2 * frameT + 0.03 * H };
      p.card.style.width = cardW + 'px';
      p.lastW = ''; p.lastL = ''; p.lastCard = -1;
    }
    endCard.style.width = (tall ? W - 2 * pad : Math.min(460, 0.36 * W)) + 'px';
    // the path: past each lantern on the side away from its build, then on to the tea house's door
    pathPts = [];
    pathPts.push([zs(-3), 0]);
    for (const p of P) pathPts.push([p.lZ, p.lX - p.s.side * 0.85]);
    pathPts.push([zs(KEND) + 2, 0]); pathPts.push([zHouse - 1, 0]);
    for (const t of trees) {
      const base = t.row === 0 ? (tall ? 2.3 : 3.2) + t.xr * 1.2 : (tall ? 4.5 : 6) + t.xr * 6;
      t.X = pathAt(t.Z) + t.side * base; t.last = '';
      t.off = false;
    }
    // a tree that would stand between the eye and a window, or in front of the card, is not planted
    for (const t of trees) {
      for (const p of P) {
        const cam = camAt(p.s.i), d = t.Z - cam.z; if (d < 0.6 || t.Z > p.wZ + 0.5) continue;
        const sc = f / d, hpx = t.h * sc, wpx = hpx * TREE.w / TREE.h, sx = cx + (t.X - cam.x) * sc;
        const left = sx - TREE.ax * wpx, right = left + wpx, top = hY + EYE * sc - TREE.ay * hpx;
        const r = p.rect;
        if (right > r.x - 20 && left < r.x + r.w + 20 && top < r.y + r.h + 0.35 * H) { t.off = true; break; }
      }
      if (t.off && t.shown) { t.el.style.visibility = 'hidden'; t.shown = false; }
    }
    for (const b of bushes) { b.X = pathAt(b.Z) + b.side * ((tall ? 1.15 : 1.9) + b.xr * 0.6); b.w = (tall ? 1.3 : 2.1) * b.wr; b.last = ''; }
    moon.style.width = moon.style.height = (tall ? 0.16 * W : 0.06 * W) * 2 + 'px';
    lastQ = -9;
  }
  function pathAt(z) {
    const a = pathPts; if (!a.length) return 0;
    if (z <= a[0][0]) return a[0][1];
    for (let i = 1; i < a.length; i++) if (z <= a[i][0]) { const t = (z - a[i - 1][0]) / (a[i][0] - a[i - 1][0]); const e = t * t * (3 - 2 * t); return lerp(a[i - 1][1], a[i][1], e); }
    return a[a.length - 1][1];
  }

  // ------------------------------------------------------------------ one frame
  let active = true, lastQ = -9;
  const petals = (function () { const R = rnd(31), a = []; for (let i = 0; i < 700; i++) a.push({ X: (R() - 0.5) * 16, Z: -12 + R() * (zHouse + 14), r: 0.035 + R() * 0.03, t: R() * 3.1, c: R() }); a.sort((p, q) => p.Z - q.Z); return a; })();
  const stones = (function () { const R = rnd(9), a = []; for (let z = -12; z < zHouse - 1; z += 1.05 + R() * 0.2) a.push({ Z: z, j: (R() - 0.5) * 0.16, s: 0.9 + R() * 0.25, t: (R() - 0.5) * 0.3 }); return a; })();
  const flies = (function () { const R = rnd(5), a = []; for (let i = 0; i < 46; i++) a.push({ X: (R() - 0.5) * 9, Y: 0.25 + R() * 2.8, Z: R() * 16, w: 0.3 + R() * 0.5, ph: R() * 6.28, r: 0.6 + R() * 0.7 }); return a; })();
  const state = { index: -1, k: 0, flats: 0, playing: -1 };
  const hide = (o, key = 'shown', el = o.el) => { if (o[key]) { el.style.visibility = 'hidden'; o[key] = false; } };
  const show = (o, key = 'shown', el = o.el) => { if (!o[key]) { el.style.visibility = 'visible'; o[key] = true; } };

  function frame(q, time, pointer) {
    if (!active) return state;
    if (!W) layout();
    q = clamp(q || 0); time = time || 0; lastQ = q;
    const px = pointer ? clamp(pointer.x || 0, -1, 1) : 0;
    const k = kOf(q), cam = camAt(k), camX = cam.x, camY = cam.y, camZ = cam.z;
    const front = clamp(Math.round(k), 0, N - 1);
    const walking = k > -0.5 && k < N - 0.5;
    let flats = 0;
    const lean = px * 10;                                  // the far garden leans with the mouse, the near things do not
    const gxs = (X, d) => cx + f * (X - camX) / d, gy = (Y, d) => hY - f * (Y - camY) / d;

    // --- what was started stops when its project is no longer in front
    for (const p of P) if (p.on && (Math.abs(k - p.s.i) > 0.5)) stop(p.s.i);

    // --- the sky
    stars.style.backgroundPosition = (-lean * 0.4 - camZ * 0.4).toFixed(1) + 'px 0';
    const mr = (tall ? 0.16 * W : 0.06 * W);
    moon.style.transform = 'translate3d(' + ((tall ? 0.74 : 0.8) * W - mr - lean * 0.5).toFixed(1) + 'px,' + (hY - (tall ? 0.5 : 0.36) * H - mr).toFixed(1) + 'px,0)';
    {
      const cw = (tall ? 3.2 : 1.6) * W, ch = cw * 350 / 2816;
      clouds.style.transform = 'translate3d(' + (cx - cw * 0.5 - lean - camZ * 0.9 % cw + Math.sin(time * 0.05) * 14).toFixed(1) + 'px,' + (hY - (tall ? 0.5 : 0.3) * H - ch / 2).toFixed(1) + 'px,0) scale(' + (cw / 2816).toFixed(4) + ')';
    }

    // --- the tea house at the end of the path
    {
      const d = zHouse - camZ, hw = 11, w = f * hw / d, s = w / HOUSE.w;
      const sx = gxs(0, d) - lean * 0.6, y = hY + f * camY / d - HOUSE.lawn * s;
      house.style.transform = 'translate3d(' + (sx - HOUSE.door * s).toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(5) + ')';
    }

    // --- the ground: the lawn, the stepping stones, the light under the lit lantern, the petals
    const g = gx;
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
    {
      const haze = g.createLinearGradient(0, hY - 0.16 * H, 0, hY + 2);
      haze.addColorStop(0, 'rgba(70,74,140,0)'); haze.addColorStop(1, 'rgba(84,86,150,0.45)');
      g.fillStyle = haze; g.fillRect(0, hY - 0.16 * H, W, 0.16 * H + 2);
      const lawn = g.createLinearGradient(0, hY, 0, H);
      lawn.addColorStop(0, '#2a3734'); lawn.addColorStop(0.25, '#232f2e'); lawn.addColorStop(1, '#141c22');
      g.fillStyle = lawn; g.fillRect(0, hY, W, H - hY);
      // pools of light first, so the stones sit in them
      g.globalCompositeOperation = 'lighter';
      for (const p of P) {
        const u = Math.abs(k - p.s.i); if (u > 0.55) continue;
        const d = p.lZ - camZ; if (d < 0.5) continue;
        const al = 0.55 * (1 - ss(0.3, 0.55, u));
        const x = gxs(p.lX, d), y = gy(0, d), rx = f * 2.4 / d, ry = rx * clamp(camY * 0.75 / d, 0.1, 0.6);
        g.save(); g.translate(x, y); g.scale(1, ry / rx);
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        rg.addColorStop(0, 'rgba(255,214,150,' + al.toFixed(3) + ')'); rg.addColorStop(0.3, 'rgba(240,184,112,' + (al * 0.5).toFixed(3) + ')'); rg.addColorStop(0.7, 'rgba(210,150,90,' + (al * 0.12).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(200,140,80,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rx, 0, 6.3); g.fill(); g.restore();
      }
      g.globalCompositeOperation = 'source-over';
      // the stones, far to near
      let lit = null; { const p = P[front]; if (Math.abs(k - front) < 0.55) lit = p; }
      for (let i = stones.length - 1; i >= 0; i--) {
        const st = stones[i], d = st.Z - camZ; if (d < 0.45 || d > FAR) continue;
        const X = pathAt(st.Z) + st.j;
        const rx = f * 0.34 * st.s / d, ry = Math.max(0.5, rx * clamp(camY * 0.62 / d, 0.06, 0.62)), x = gxs(X, d), y = gy(0, d);
        if (x + rx < 0 || x - rx > W || y - ry > H) continue;
        const fade = 1 - ss(FAR - 12, FAR, d);
        let warm = 0; if (lit) { const dd = Math.hypot(X - lit.lX, st.Z - lit.lZ); warm = (1 - ss(0.4, 2.6, dd)) * (1 - ss(0.3, 0.55, Math.abs(k - lit.s.i))); }
        g.globalAlpha = fade;
        g.fillStyle = '#0d1119'; g.beginPath(); g.ellipse(x, y + ry * 0.2, rx + 2, ry + 2, st.t * 0.2, 0, 6.3); g.fill();
        g.fillStyle = 'rgb(' + Math.round(lerp(44, 92, warm)) + ',' + Math.round(lerp(52, 80, warm)) + ',' + Math.round(lerp(64, 70, warm)) + ')';
        g.beginPath(); g.ellipse(x, y, rx, ry, st.t * 0.2, 0, 6.3); g.fill();
        g.fillStyle = 'rgb(' + Math.round(lerp(58, 150, warm)) + ',' + Math.round(lerp(68, 126, warm)) + ',' + Math.round(lerp(82, 98, warm)) + ')';
        g.beginPath(); g.ellipse(x - rx * 0.05, y - ry * 0.18, rx * 0.82, ry * 0.66, st.t * 0.2, 0, 6.3); g.fill();
      }
      g.globalAlpha = 1;
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
      const left = sx - (t.flip ? 1 - TREE.ax : TREE.ax) * wpx, top = sy - TREE.ay * hpx;
      const op = Math.round((1 - ss(FAR - 6, FAR + 6, d)) * ss(1.6, 3.4, d) * 50) / 50;
      if (op <= 0 || left > W + 10 || left + wpx < -10 || top > H + 10) { hide(t); continue; }
      show(t); flats++;
      const s = hpx / (TREE.h / 2);
      const tr = t.flip ? 'translate3d(' + (left + wpx).toFixed(1) + 'px,' + top.toFixed(1) + 'px,0) scale(' + (-s).toFixed(4) + ',' + s.toFixed(4) + ')'
        : 'translate3d(' + left.toFixed(1) + 'px,' + top.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      if (tr !== t.last) { t.el.style.transform = tr; t.last = tr; }
      if (op !== t.lo) { t.el.style.opacity = op; t.lo = op; }
      const z = String(Math.round(100000 - t.Z * 100)); if (t.el.style.zIndex !== z) t.el.style.zIndex = z;
    }

    // --- bushes close to the eye
    for (const b of bushes) {
      const d = b.Z - camZ;
      const op = d > 0.9 && d < 5 ? Math.round(ss(1, 2, d) * (1 - ss(3.4, 5, d)) * 40) / 40 : 0;
      if (op <= 0) { hide(b); continue; }
      const sc = f / d, wpx = b.w * sc, hpx = wpx * 250 / 550, left = gxs(b.X, d) - wpx / 2, top = hY + camY * sc - hpx * 0.8;
      if (left > W || left + wpx < 0 || top > H) { hide(b); continue; }
      show(b); flats++;
      const tr = 'translate3d(' + left.toFixed(1) + 'px,' + top.toFixed(1) + 'px,0) scale(' + (wpx / 275).toFixed(4) + ')';
      if (tr !== b.last) { b.el.style.transform = tr; b.last = tr; }
      if (op !== b.lo) { b.el.style.opacity = op; b.lo = op; }
      const z = String(Math.round(100000 - b.Z * 100)); if (b.el.style.zIndex !== z) b.el.style.zIndex = z;
    }

    // --- the stations: lantern, window, card
    for (const p of P) {
      const i = p.s.i, u = Math.abs(k - i);
      const litO = Math.round((1 - ss(0.3, 0.5, u)) * 100) / 100;
      // the lantern
      {
        const d = p.lZ - camZ;
        if (d < 0.7 || d > FAR) { hide(p, 'lanShown', p.lan); hide(p, 'haloShown', p.halo); }
        else {
          const sc = f / d, hpx = (LH + 0.06) * sc, wpx = hpx * LIT.w / LIT.h, x = gxs(p.lX, d) - wpx / 2, y = gy(0, d) - hpx + 0.02 * LIT.U * hpx / LIT.h;
          if (x > W + 20 || x + wpx < -20 || y > H + 20) { hide(p, 'lanShown', p.lan); hide(p, 'haloShown', p.halo); }
          else {
            show(p, 'lanShown', p.lan); flats++;
            const s = hpx / LIT.h;
            const tr = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(5) + ')';
            if (tr !== p.lastL) { p.lan.style.transform = tr; p.lan.style.zIndex = String(Math.round(100000 - p.lZ * 100)); p.lastL = tr; }
            const fl = still ? 1 : 0.94 + 0.06 * Math.sin(time * 7.3 + i) * Math.sin(time * 3.1 + i * 2);
            const lo = Math.round(litO * fl * 100) / 100;
            if (lo !== p.lastLit) { p.lanLit.style.opacity = lo; p.lastLit = lo; }
            // the flame's light in the air round the light box
            if (litO > 0.01) {
              show(p, 'haloShown', p.halo);
              const hs = 1.6 * sc, hx = x + wpx / 2 - 0.01 * sc - hs / 2, hy = gy(0.745, d) - hs / 2;
              p.halo.style.transform = 'translate3d(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px,0) scale(' + (hs / 200).toFixed(4) + ')';
              p.halo.style.zIndex = String(Math.round(100000 - p.lZ * 100) + 1);
              const ho = Math.round(litO * fl * 0.8 * 100) / 100; if (ho !== p.lastHalo) { p.halo.style.opacity = ho; p.lastHalo = ho; }
            } else hide(p, 'haloShown', p.halo);
          }
        }
      }
      // the window
      {
        const d = p.wZ - camZ;
        const gone = ss(0.3, 0.56, k - i);                 // a window the walk has passed steps aside into the dark
        if (d < 0.8 || d > FAR || gone >= 1) hide(p, 'winShown', p.win);
        else {
          const sc = f / d;
          let x = gxs(p.wX, d), y = gy(p.wY, d), s = (p.ww * sc) / p.bw;
          // close to its station it holds still, at its own size, so a game or a film in it is sharp
          const hold = 1 - ss(0.04, 0.32, u);
          if (hold > 0) { x = lerp(x, p.rect.x - p.ft, hold); y = lerp(y, p.rect.y - p.ft, hold); s = lerp(s, 1, hold); }
          if (x > W + 20 || x + p.bw * s < -20 || y > H + 20) hide(p, 'winShown', p.win);
          else {
            show(p, 'winShown', p.win); flats++;
            const tr = hold >= 1 ? 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)' : 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ')';
            if (tr !== p.lastW) { p.win.style.transform = tr; p.win.style.zIndex = String(Math.round(100000 - p.wZ * 100)); p.lastW = tr; }
            const dim = Math.round((1 - litO) * 0.55 * 100) / 100;
            if (dim !== p.lastWin) { p.win.style.setProperty('--dim', dim); p.lastWin = dim; }
            const wo = Math.round((1 - gone) * (1 - ss(FAR - 8, FAR, d)) * 100) / 100;
            if (wo !== p.lastWo) { p.win.style.opacity = wo; p.lastWo = wo; }
            if (u < 1.6) wantPic(p);
          }
        }
        if (still && u < 1.6) wantPic(p);
      }
      // the card
      {
        const co = Math.round((1 - ss(0.22, 0.4, u)) * 100) / 100;
        if (co <= 0) hide(p, 'cardShown', p.card);
        else {
          show(p, 'cardShown', p.card);
          if (co !== p.lastCard) {
            const rise = (1 - co) * 14;
            p.card.style.opacity = co; p.card.style.transform = 'translate3d(' + Math.round(p.cardAt.x) + 'px,' + Math.round(p.cardAt.y + rise) + 'px,0)';
            p.lastCard = co;
          }
        }
      }
    }
    // the end card
    {
      const eo = ss(N - 1 + 0.75, N - 1 + 1.25, k);
      if (eo <= 0.005) { if (endCard.style.visibility !== 'hidden') endCard.style.visibility = 'hidden'; }
      else {
        endCard.style.visibility = 'visible'; endCard.style.opacity = eo.toFixed(3);
        const ew = endCard.offsetWidth, eh = endCard.offsetHeight;
        const ey = tall ? 0.16 * H : 0.2 * H;
        endCard.style.transform = 'translate3d(' + Math.round((W - ew) / 2) + 'px,' + Math.round(ey + (1 - eo) * 14 - (tall ? 0 : eh * 0)) + 'px,0)';
      }
    }

    // --- the fireflies
    ax.setTransform(DPR, 0, 0, DPR, 0, 0); ax.clearRect(0, 0, W, H);
    if (!still) {
      ax.globalCompositeOperation = 'lighter';
      const hold = P[front] && Math.abs(k - front) < 0.3 ? P[front].rect : null;
      for (const fl of flies) {
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
    if (!active) for (const p of P) if (p.on) stop(p.s.i);
  }
  function dispose() { for (const p of P) if (p.on) stop(p.s.i); world.remove(); }
  const ready = () => pending === 0;

  layout();
  return { frame, resize, setActive, dispose, qOf, ready, count: N, state, start, stop };
}
