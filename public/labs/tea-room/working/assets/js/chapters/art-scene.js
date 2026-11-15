/* THE GARDEN GALLERY, the scene of the AI art & images chapter (art.js drives it). It is the test
   tests/garden-gallery/ (its js/scene.js), made a part of the working copy. What changed from the test: the plates by
   the working copy's own addresses (the cinema's garden is the film chapter's night plate, the tea house is look B's
   garden-ground, both the same files the test copied); his pictures by their own addresses in the test's folder, not
   copied a second time; the turn starts from the games chapter's last view of the garden (start(), join.js endPlate)
   instead of the test's own framing; at the end the camera can tilt back down (lift); a click is found by pick(),
   because this layer is behind the page; nothing here sets visibility: visible.


   The same garden as the outdoor cinema, later the same evening. The camera turns from the cloth to the trees, and
   the pictures hang there as lit lanterns, one behind another down an avenue. The camera drifts along it; each
   picture comes close, lets go of its string and rises. At the end the grove opens onto the tea house, the camera
   looks up, and the whole sky is the pictures, rising past the moon.

   mount(hostElement, options) -> { frame(q, time, pointer), resize(), setActive(on), dispose(), ... }
     q        the chapter's progress, 0 to 1. Everything on screen is a function of q,
     time     of the seconds given (what sways, drifts and glows), and
     pointer  of { x, y } from -1 to 1 (the camera leans a little), if given.
   The scene keeps no clock of its own, reads nothing from the page and writes only inside hostElement. The one
   thing that is not a function of q is a picture brought forward by a click: any change of q sends it back.

   DRAWING: the avenue is drawn into ONE canvas (gg-pics: the trees, the bushes, the hanging pictures and their light
   rings, in depth order) and the sky's pictures into a second (gg-skypics), at the screen's own device pixels. Before
   this each of them was a layer of the document (about 430), and every layer whose size changes as the camera moves
   was painted again at its new size every frame: on an ordinary graphics card the chapter drew at half rate. Each
   picture is drawn as its element was (halo, string, cap, tassel, ring, picture, the dim of distance), with the same
   numbers, and with the element's opacity over the whole of it (drawFrame: the picture's own ground is cut out, never
   drawn twice). The pictures' elements are still made: the one brought forward by a click is drawn by its element,
   over the night that closes in (z 300001), and only while it is forward. pick() finds a picture from the geometry it
   was drawn with, so a click and the pointer's zoom cursor go where they went.

   options: pictures [{ file, title, w, h }], still (time is held: nothing eases, pictures load at once),
            onChange() (something changed by itself, a picture arrived or was clicked: draw again). */

const OWN = new URL('../../img/', import.meta.url).href;
const SMOOTH = 'medium';      // (how a bitmap is drawn smaller: mip levels, as the browser paints an <img>)
const PICS = '/labs/tea-room/tests/garden-gallery/img/pictures/';     // his pictures stay in the test's folder (11 MB)
const MAP = { 'clouds.webp': 'art/clouds.webp', 'tree-night.webp': 'art/tree-night.webp', 'tree-blossom.webp': 'art/tree-blossom.webp',
  'tea-house.webp': 'garden-ground.webp', 'cinema-garden.webp': 'film/garden-night.webp', 'near-bush-l.webp': 'near-bush-l.webp', 'near-bush-r.webp': 'near-bush-r.webp' };
const IMG = (p) => p.indexOf('pictures/') === 0 ? PICS + p.slice(9) : OWN + MAP[p];
const GLOW = { x: 638, y: 290, w: 1899, h: 1246 }, GS = 0.5, LIGHT = [154, 154, 184];   // the lamp's light (games.js has the same)

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const io = (t) => { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
const mod = (x, m) => ((x % m) + m) % m;
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// The avenue, in metres more or less. A picture is met DH in front of the camera; the next hangs DZ behind it.
const DH = 2.2, DZ = 2.6, Z0 = 7;
// q: 0..QA the camera turns from the cloth to the trees; QA..QB it drifts down the avenue; QB..1 it looks up.
const QA = 0.055, QB = 0.845;
const FAR = 24, FAR_PIC = 21;
const TREE = { w: 1180, h: 1271, ax: 0.30, ay: 0.967 };       // the painted tree: where its trunk meets the ground
const PLATE = { w: 2752, h: 1536, horizon: 812, cloth: 1823 };  // the cinema's garden
const HOUSE = { w: 2816, h: 1297, lawn: 462 };                  // the tea house on its lawn

export function mount(host, options = {}) {
  const pics = options.pictures || [];
  const N = pics.length;
  const still = !!options.still;
  const onChange = typeof options.onChange === 'function' ? options.onChange : () => {};
  const doc = host.ownerDocument;
  let core = 0;                                   // the world's own plates still on their way (the picture is not whole)

  // start(W, H): the plate as the chapter before left it, { s, x, y } (join.js endPlate)
  const start = typeof options.start === 'function' ? options.start : null;

  // ------------------------------------------------------------------ what stands in the scene
  const world = doc.createElement('div'); world.className = 'gg-world';
  const make = (tag, cls, parent) => { const e = doc.createElement(tag); e.className = cls; (parent || world).appendChild(e); return e; };
  // the world's own plates are drawn in the frame that first shows them, never a frame late
  const picture = (cls, src) => { const e = make('img', cls); e.alt = ''; e.decoding = 'sync'; e.draggable = false; e.src = src; return e; };

  const sky = make('div', 'gg-sky'); const stars = make('div', 'gg-stars', sky);
  const moon = make('div', 'gg-flat gg-moon');
  const cloudsA = picture('gg-flat gg-clouds', IMG('clouds.webp'));
  const cloudsB = picture('gg-flat gg-clouds', IMG('clouds.webp'));
  const far = make('canvas', 'gg-layer gg-far'); const fx = far.getContext('2d');
  const ground = make('canvas', 'gg-layer gg-ground'); const gx = ground.getContext('2d');
  const house = picture('gg-flat gg-house', IMG('tea-house.webp'));
  const plate = picture('gg-flat gg-plate', IMG('cinema-garden.webp'));
  const glowC = make('canvas', 'gg-flat gg-lamp'); glowC.width = Math.round(GLOW.w * GS); glowC.height = Math.round(GLOW.h * GS);
  { const gi = new Image(); gi.decoding = 'async'; core++;
    gi.onload = () => { const x = glowC.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(gi, 0, 0, glowC.width, glowC.height);
      x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgb(' + LIGHT.join(',') + ')'; x.fillRect(0, 0, glowC.width, glowC.height); core--; onChange(); };
    gi.onerror = () => { core--; onChange(); }; gi.src = OWN + 'film/garden-glow.webp'; }
  const air = make('canvas', 'gg-layer gg-air'); const ax = air.getContext('2d');
  make('div', 'gg-vignette');
  const shade = make('div', 'gg-shade');
  const caption = make('div', 'gg-caption'); const capTitle = make('b', '', caption); const capSay = make('span', '', caption);

  // stars: one small tile, drawn once
  (function () {
    const c = doc.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); const R = rnd(7);
    for (let i = 0; i < 150; i++) {
      const big = R() < 0.12; x.globalAlpha = big ? 0.9 : 0.25 + R() * 0.5; x.fillStyle = R() < 0.2 ? '#ffe9c0' : '#dfe3ff';
      x.beginPath(); x.arc(R() * 512, R() * 512, big ? 1.5 : 0.6 + R() * 0.5, 0, 6.3); x.fill();
    }
    stars.style.backgroundImage = 'url(' + c.toDataURL() + ')';
  })();
  // a firefly: a soft warm dot, drawn once
  const fly = doc.createElement('canvas'); fly.width = fly.height = 48;
  (function () {
    const x = fly.getContext('2d'); const g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, 'rgba(255,246,190,1)'); g.addColorStop(0.18, 'rgba(240,226,130,0.75)'); g.addColorStop(0.5, 'rgba(190,210,90,0.16)'); g.addColorStop(1, 'rgba(160,200,80,0)');
    x.fillStyle = g; x.fillRect(0, 0, 48, 48);
  })();
  // a lantern too far away to be a picture: a warm point of light
  const dot = doc.createElement('canvas'); dot.width = dot.height = 32;
  (function () {
    const x = dot.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,236,190,1)'); g.addColorStop(0.25, 'rgba(255,200,120,0.8)'); g.addColorStop(0.6, 'rgba(240,150,80,0.18)'); g.addColorStop(1, 'rgba(230,130,70,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
  })();
  const dots = (function () { const R = rnd(77), a = []; for (let i = 0; i < 130; i++) a.push({ e: R(), xr: R(), v: 0.004 + R() * 0.004, ph: R() * 6.28, r: 0.6 + R() * 0.8 }); return a; })();

  // the trees: two rows that make the avenue, and on a wide screen the wood behind them
  const TR = rnd(20261113);
  const trees = [];
  const treeSrc = [IMG('tree-night.webp'), IMG('tree-blossom.webp')];
  const zEndOfWood = Z0 + (N - 1) * DZ + 3.4;
  // the wood changes along the walk: a stretch under blossom, a stretch of dark wood, and blossom again at the end
  const blossom = (z) => { const w = 0.5 + 0.5 * Math.sin(z / 9.5 + 0.6); return 0.04 + 0.9 * w * w; };
  for (let i = -3; i < N; i++) {
    for (const side of [-1, 1]) {
      trees.push({ row: 0, side, xr: TR(), Z: Z0 + (i + 0.5 + side * 0.16 + (TR() - 0.5) * 0.14) * DZ, h: 5.5 + TR() * 1.6, pink: TR() < blossom(Z0 + i * DZ), flip: TR() < 0.5 });
    }
  }
  for (let z = -3; z < zEndOfWood + 22; z += 2.6) {
    const open = z > zEndOfWood;                                  // past the avenue: only the wood round the clearing
    for (const side of [-1, 1]) {
      if (open) { trees.push({ row: 3, side, xr: TR(), Z: z + TR() * 1.6, h: 6 + TR() * 2.4, pink: TR() < 0.3, flip: TR() < 0.5 }); continue; }
      trees.push({ row: 1, side, xr: TR(), Z: z + TR() * 1.6, h: 5.8 + TR() * 2.1, pink: TR() < blossom(z) * 0.8, flip: TR() < 0.5 });
      if (TR() < 0.6) trees.push({ row: 2, side, xr: TR(), Z: z + TR() * 2, h: 6.2 + TR() * 2.6, pink: TR() < blossom(z) * 0.7, flip: TR() < 0.5 });
    }
  }
  trees.sort((a, b) => a.Z - b.Z);
  // (drawn into the avenue's canvas: each was an <img> 590 x 635 (its height attribute TREE.h / 2, truncated) with its
  // z-index; the same box, the same depth order)
  trees.forEach((t, i) => { t.z = Math.round(100000 - t.Z * 100); t.ord = i; t.shown = false; t.src = t.pink ? 1 : 0; });

  // bushes close to the camera, dark and out of focus, along the edges of the avenue
  const bushes = [];
  for (let z = 1, j = 0; z < zEndOfWood + 8; z += 2.3 + TR() * 1.4, j++) {
    const side = j % 2 ? 1 : -1, b = { side, Z: z, xr: TR(), wr: 0.8 + TR() * 0.5, shown: false, z: Math.round(100000 - z * 100), ord: 10000 + j, src: side < 0 ? 2 : 3 };
    bushes.push(b);
  }
  // the bitmaps the avenue is drawn from: the two trees and the two bushes, decoded once (no frame waits on a decode)
  let gone = false;
  const toBitmap = (im) => (doc.defaultView.createImageBitmap ? doc.defaultView.createImageBitmap(im) : Promise.resolve(im));
  const bmp = [null, null, null, null];
  [treeSrc[0], treeSrc[1], IMG('near-bush-l.webp'), IMG('near-bush-r.webp')].forEach((src, i) => {
    const im = new Image(); im.decoding = 'async'; core++;
    const done = () => { core--; onChange(); };
    im.onload = () => { toBitmap(im).then((b) => { if (gone) { if (b.close) b.close(); return; } bmp[i] = b; done(); }, done); };
    im.onerror = done; im.src = src;
  });

  // the pictures
  const P = pics.map((d, i) => {
    const b = make('div', 'gg-pic'); b._i = i;
    const halo = make('i', 'gg-halo', b), string = make('i', 'gg-string', b), cap = make('i', 'gg-cap', b), tassel = make('i', 'gg-tassel', b);
    const frame = make('span', 'gg-frame', b);
    const lo = make('img', 'gg-lo', frame); lo.alt = ''; lo.decoding = 'async'; lo.draggable = false; lo.src = IMG('pictures/s/' + d.file + '.webp');
    const hi = make('img', 'gg-hi', frame); hi.alt = ''; hi.decoding = 'async'; hi.draggable = false;
    const dim = make('i', 'gg-dim', frame);
    b.style.visibility = 'hidden';
    const glow = make('i', 'gg-flat gg-glow'); glow.style.visibility = 'hidden'; glow.style.willChange = 'transform';
    return { d, i, a: d.w / d.h, s: i % 2 ? -1 : 1, el: b, halo, string, cap, tassel, lo, hi, dim, glow, gShown: false, gLast: '', gOp: -1, hiState: 0, shown: false, last: '', lz: -1, lDim: -1, lHalo: -1, lStr: -1, lOp: -1,
      loBmp: null, loDone: false, hiBmp: null, dom: false, m: [1, 0, 0, 1, 0, 0] };
  });
  // the two canvases the scene's depth is drawn into (DRAWING in the head comment): the avenue over the cinema's plate
  // and the lamp (z 801) and under the fireflies (200000); the sky's pictures where their z-index was (10 to 90)
  const avenue = make('canvas', 'gg-layer gg-pics'); avenue.style.zIndex = '850'; const vx = avenue.getContext('2d');
  const skyPics = make('canvas', 'gg-layer gg-skypics'); skyPics.style.zIndex = '9'; const kx = skyPics.getContext('2d');

  host.appendChild(world);

  // ------------------------------------------------------------------ the frame's geometry
  let W = 0, H = 0, tall = false, f = 1, cx = 0, cy = 0, cy0 = 0, sp = null, EYE = 1.6, A = 0.5, B = 0, DPR = 1;
  let RX = 1, RY = 1;
  let Emax = 1.7, Tmax = 0, moonE = 1.5, moonX = 0.66, moonR = 60, houseW = 30, panDist = 0, plateS = 1, plateX = 0, plateY = 0;
  const E0 = 0.24;
  const kStart = -1.25, kEnd = N - 1 + 1.55, SLOPE = (kEnd - kStart) / (QB - QA);
  const kOf = (q) => q < QA ? kStart - SLOPE * QA / 2 + SLOPE * q * q / (2 * QA)
    : q < QB ? kStart + SLOPE * (q - QA)
      : kEnd + SLOPE * (1 - QB) * ((q - QB) / (1 - QB) - Math.pow((q - QB) / (1 - QB), 2) / 2);
  const env = (k) => ss(-1.1, -0.1, k) * (1 - ss(N - 0.8, N + 0.2, k));
  const camAt = (k) => { const wv = Math.cos(Math.PI * k) * env(k); return { x: A * wv, y: EYE + B * wv, z: Z0 - DH + k * DZ }; };
  const zHouse = Z0 - DH + (kEnd + SLOPE * (1 - QB) / 2) * DZ + 13;
  // The sky's river of lanterns, from its foot (t = 0) to its head (t = 1). Low and near, they are large and spread
  // wide; high and far, they are small and draw together beside the moon.
  const river = (t) => {
    const n = 1 - t;
    return { n, e: E0 + (Emax - E0) * Math.pow(t, 0.75), x: lerp(0.5, tall ? 0.36 : 0.4, t) + (tall ? 0.06 : 0.05) * Math.sin(t * 5.2 + 0.8), spread: lerp(tall ? 0.5 : 0.34, tall ? 0.9 : 0.98, Math.pow(n, 0.85)) };
  };

  function layout() {
    W = host.clientWidth || 1; H = host.clientHeight || 1; tall = W / H < 0.9;
    DPR = Math.min((doc.defaultView && doc.defaultView.devicePixelRatio) || 1, 1.5);
    const heroPx = tall ? 0.88 * W : Math.min(0.46 * W, 0.92 * H);
    f = heroPx * DH / 1.5; cx = W / 2; cy = cy0 = (tall ? 0.48 : 0.53) * H;
    sp = start ? start(W, H) : null;
    A = tall ? 0 : 0.5; B = tall ? 0.66 : 0; EYE = tall ? 1.85 : 1.6;
    const off = tall ? 0.22 : 0.62;
    Emax = tall ? 2.55 : 1.72; Tmax = (Emax + 0.12) * H - cy;
    moonE = tall ? 2.18 : 1.46; moonX = tall ? 0.68 : 0.64; moonR = tall ? 0.17 * W : 0.068 * W;
    houseW = (tall ? 4.2 : 2.2) * W * 13 / f;
    panDist = (tall ? 1.5 : 1.12) * W * (sp ? 1.35 : 1);     // (from the cloth: far enough that no tree stands in the first view)
    plateS = tall ? 0.9 * W / 752 : Math.max(W / PLATE.w, H / PLATE.h) * 1.04;
    world.classList.toggle('gg-tall', tall);
    plateX = tall ? W / 2 - PLATE.cloth * plateS : clamp(0.94 * W - 2262 * plateS, W - PLATE.w * plateS, 0);
    plateY = cy - PLATE.horizon * plateS;
    if (sp) { plateS = sp.s; plateX = sp.x; plateY = sp.y; }
    plate.style.width = PLATE.w + 'px'; plate.style.height = PLATE.h + 'px';

    for (const c of [ground, air, far]) {
      const dp = c === ground ? DPR : 1; c.width = Math.round(W * dp); c.height = Math.round(H * dp);
    }
    // (the pictures and the trees at the screen's own device pixels, as their layers were painted: 3 on a phone, 0.8 in
    // a browser zoomed out)
    const PR = Math.min((doc.defaultView && doc.defaultView.devicePixelRatio) || 1, 3);
    for (const c of [avenue, skyPics]) { c.width = Math.max(1, Math.round(W * PR)); c.height = Math.max(1, Math.round(H * PR)); }
    RX = avenue.width / W; RY = avenue.height / H;
    for (const b of bushes) { b.X = b.side * ((tall ? 1.3 : 2.1) + b.xr * (tall ? 0.3 : 0.6)); b.w = (tall ? 1.5 : 2.3) * b.wr; b.last = ''; }
    sky.style.height = (H + Tmax + 0.3 * H) + 'px';
    moon.style.width = moon.style.height = 2 * moonR + 'px'; moon.style.fontSize = moonR / 4 + 'px';

    for (const t of trees) {
      t.X = t.row === 0 ? t.side * ((tall ? 1.8 : 2.75) + t.xr * (tall ? 0.5 : 0.7)) : t.row === 1 ? t.side * (4.7 + t.xr * 3.3) : t.row === 2 ? t.side * (8.6 + t.xr * 6) : t.side * ((tall ? 3.4 : 6.5) + t.xr * (tall ? 3 : 9));
      t.off = tall && (t.row === 1 || t.row === 2); t.last = '';
      if (t.off) t.shown = false;
    }

    const SR = rnd(tall ? 99 : 42);
    const order = P.map((_, i) => i);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(SR() * (i + 1)); const o = order[i]; order[i] = order[j]; order[j] = o; }
    order.forEach((i, j) => {
      const p = P[i];
      p.e = (j + 0.2 + 0.6 * SR()) / N;                           // its place in the river's height, 0 to 1
      p.xs = mod(j * 0.618034 + 0.13, 1);                         // and across it: neighbours in height stand apart
      p.ph = SR() * 6.28;
      p.af = Math.sqrt(Math.min(p.a, 1.8) / 1.5);
    });

    for (const p of P) {
      const a = p.a;
      p.ww = tall ? (a >= 1.25 ? 1.5 : a >= 0.8 ? 1.36 : 1.22) : (a >= 1.25 ? 1.5 : a >= 0.8 ? 1.22 : 1.55 * a);
      p.wh = p.ww / a;
      p.X = tall ? p.s * 0.1 : p.s * (A + off);
      p.Y = tall ? EYE + p.s * (B + off) : EYE + 0.06 * Math.sin(p.i * 2.4);
      p.Z = Z0 + p.i * DZ;
      p.bw = f * p.ww / DH; p.bh = p.bw / a;
      const top = p.Y + p.wh / 2;
      p.L = Math.max(1.3, 4.6 - top) * f / DH;                    // the string, up into the crowns
      const cr = camAt(p.i);
      p.dr = DH; p.xr0 = p.X - cr.x; p.yr0 = p.Y - cr.y;
      p.el.style.width = p.bw + 'px'; p.el.style.height = p.bh + 'px';
      p.el.style.transformOrigin = (p.bw / 2) + 'px ' + (-p.L) + 'px';
      p.string.style.height = p.L + 'px';
      p.last = '';
    }
    lastQ = -9;
  }

  // ------------------------------------------------------------------ pictures arriving
  let pending = 0;
  // (each small picture is drawn from a bitmap decoded once; until it is there the picture is not whole)
  for (const p of P) {
    pending++;
    const done = () => { if (!p.loDone) { p.loDone = true; pending--; onChange(); } };
    const take = () => { if (!p.lo.naturalWidth) return done(); toBitmap(p.lo).then((b) => { if (gone) { if (b.close) b.close(); return; } p.loBmp = b; done(); }, done); };
    if (p.lo.complete) take(); else { p.lo.addEventListener('load', take, { once: true }); p.lo.addEventListener('error', done, { once: true }); }
  }
  const countCore = (im) => { if (!im.complete) { core++; const done = () => { core--; onChange(); }; im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); } };
  for (const e of [house, plate, cloudsA]) countCore(e);

  function wantHi(p) {
    if (p.hiState) return;
    p.hiState = 1; pending++;
    const done = () => { pending--; onChange(); };
    p.hi.src = IMG('pictures/' + p.d.file + '.webp');
    const took = () => {
      if (p.hiState !== 1 || !(p.hi.naturalWidth > 0)) return done();
      toBitmap(p.hi).then((b) => {
        if (gone || p.hiState !== 1) { if (b.close) b.close(); return done(); }
        p.hiBmp = b; p.hiState = 2; p.hi.classList.add('gg-on'); done();
      }, done);
    };
    if (p.hi.decode) p.hi.decode().then(took, took); else { p.hi.addEventListener('load', took, { once: true }); p.hi.addEventListener('error', done, { once: true }); }
  }
  function dropHi(p) {
    if (p.hiState !== 2) return;
    p.hi.classList.remove('gg-on'); p.hi.removeAttribute('src'); p.hiState = 0;
    if (p.hiBmp && p.hiBmp.close) p.hiBmp.close(); p.hiBmp = null;
  }

  // ------------------------------------------------------------------ a picture brought forward
  let openIdx = -1, openT = 0, closeT = -1, openQ = 0, lastTime = 0, lastQ = -9, curQ = 0;
  function open(i) {
    if (i < 0 || i >= N) return;
    if (openIdx >= 0 && openIdx !== i) shut(openIdx);
    openIdx = i; openT = lastTime; closeT = -1; openQ = curQ;
    const p = P[i]; wantHi(p); p.el.classList.add('gg-is-open');
    capTitle.textContent = p.d.title; capSay.textContent = (i + 1) + ' of ' + N;
    p.el.setAttribute('aria-label', p.d.title + '. Send this picture back');
    onChange();
  }
  function close() { if (openIdx >= 0 && closeT < 0) { closeT = lastTime; onChange(); } }
  function shut(i) {
    const p = P[i]; p.el.classList.remove('gg-is-open'); p.el.setAttribute('aria-label', p.d.title + '. Bring this picture forward');
    p.cap.style.opacity = ''; p.tassel.style.opacity = ''; p.last = '';
    openIdx = -1; closeT = -1;
  }
  const onClick = (e) => {
    const b = e.target && e.target.closest ? e.target.closest('.gg-pic') : null;
    if (b && world.contains(b)) { if (openIdx === b._i) close(); else open(b._i); } else close();
  };
  const onKey = (e) => { if (e.key === 'Escape' && openIdx >= 0) { close(); } };
  world.addEventListener('click', onClick);
  world.addEventListener('keydown', onKey);

  // ------------------------------------------------------------------ one frame
  let active = true, firstTree = 0;
  const petals = (function () { const R = rnd(31), a = []; for (let i = 0; i < 520; i++) a.push({ X: (R() - 0.5) * 15, Z: -6 + R() * (Z0 + N * DZ + 24), r: 0.035 + R() * 0.03, t: R() * 3.1, c: R() }); a.sort((p, q) => p.Z - q.Z); return a; })();
  const flies = (function () { const R = rnd(5), a = []; for (let i = 0; i < 64; i++) a.push({ X: (R() - 0.5) * 9, Y: 0.25 + R() * 3.3, Z: R() * 15, w: 0.3 + R() * 0.5, ph: R() * 6.28, r: 0.6 + R() * 0.7 }); return a; })();
  const state = { index: -1, k: 0, phase: 'turn', open: -1, flats: 0 };

  // (a tree, a bush or a picture not drawn this frame; a picture's own element, if it was forward, goes too)
  function hide(o) { o.shown = false; if (o.dom) { o.el.style.visibility = 'hidden'; o.dom = false; } }
  function glowOff(p) { if (p.gShown) { p.glow.style.visibility = 'hidden'; p.gShown = false; } }

  // ------------------------------------------------------------------ drawing into the canvases
  // Every part as its element painted it (art.css: .gg-halo, .gg-string, .gg-cap, .gg-tassel and its ::after, .gg-frame
  // with its two rings, the pictures, .gg-dim; .gg-glow), in their order, in the element's own box of bw x bh, under
  // the element's transform (origin bw / 2, -L). The element's opacity was over the whole picture: with op < 1 each part
  // is drawn where only it is (the rings as bands, the halo with the frame cut out, the picture over what it covers
  // taken out first), so nothing shows through the picture that did not before.
  const TAU = Math.PI * 2;
  function grads(c) {
    const h = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    h.addColorStop(0, 'rgba(255,222,164,0.6)'); h.addColorStop(0.3, 'rgba(255,210,140,0.4)'); h.addColorStop(0.58, 'rgba(255,198,122,0.16)'); h.addColorStop(0.8, 'rgba(255,190,110,0.05)'); h.addColorStop(1, 'rgba(255,190,110,0)');
    const g = c.createRadialGradient(200, 200, 0, 200, 200, 200);
    g.addColorStop(0, 'rgba(255,208,138,0)'); g.addColorStop(0.4, 'rgba(255,208,138,0)'); g.addColorStop(0.5, 'rgba(255,208,138,0.15)'); g.addColorStop(0.72, 'rgba(255,198,122,0.07)'); g.addColorStop(1, 'rgba(255,190,110,0)');
    const s = c.createLinearGradient(0, 0, 0, 1);
    s.addColorStop(0, '#0a0c1a'); s.addColorStop(0.7, '#0a0c1a'); s.addColorStop(1, '#3a2c2e');
    return { halo: h, glow: g, str: s };
  }
  const G = new Map();
  const byZ = (a, b) => a.z - b.z || a.o - b.o;
  // a box-shadow spread ring (spread e round the box x, y, w, h of radius r): the whole shape, or only its band
  function shadow(c, x, y, w, h, r, e, band) {
    c.beginPath(); c.roundRect(x - e, y - e, w + 2 * e, h + 2 * e, Array.isArray(r) ? r.map((v) => v + e) : r + e);
    if (band) { c.roundRect(x, y, w, h, r); c.fill('evenodd'); } else c.fill();
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
  function drawPic(c, g, it) {
    const p = it.p, bw = p.bw, bh = p.bh, ox = bw / 2, oy = -p.L, op = it.op, cut = op < 0.995, mid = bw / 2;
    c.setTransform(RX, 0, 0, RY, 0, 0);
    c.translate(ox + it.tx, oy + it.ty); c.scale(it.s, it.s); if (it.ang) c.rotate(it.ang * Math.PI / 180); c.translate(-ox, -oy);
    // the halo
    if (it.haloO > 0) {
      c.globalAlpha = op * it.haloO; c.save();
      if (cut) { c.beginPath(); c.rect(-0.4 * bw - 2, -0.62 * bh - 2, 1.8 * bw + 4, 2.24 * bh + 4); c.roundRect(-3, -3, bw + 6, bh + 6, 13); c.clip('evenodd'); }
      c.translate(mid, bh / 2); c.scale(0.9 * bw, 1.12 * bh); c.fillStyle = g.halo; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
    }
    // the string, up into the crowns
    if (it.strO > 0) { c.globalAlpha = op * it.strO; c.save(); c.translate(mid - 1.25, -p.L); c.scale(2.5, p.L); c.fillStyle = g.str; c.fillRect(0, 0, 1, 1); c.restore(); }
    c.globalAlpha = op;
    // the cap, the tassel and its bob
    c.fillStyle = '#0c0f20'; shadow(c, mid - 31, -11, 62, 13, 7, 3, cut); c.fillStyle = '#3a2b33'; rr(c, mid - 31, -11, 62, 13, 7);
    c.fillStyle = '#c9a227'; c.fillRect(mid - 1.5, bh + 3, 3, 30);
    c.fillStyle = '#0c0f20'; shadow(c, mid - 6.5, bh + 33, 13, 22, [4, 4, 7, 7], 2.5, cut); c.fillStyle = '#e2795c'; rr(c, mid - 6.5, bh + 33, 13, 22, [4, 4, 7, 7]);
    // the frame's two rings (the first shadow of the list on top)
    c.fillStyle = 'rgba(255,216,146,0.28)'; shadow(c, 0, 0, bw, bh, 10, 4.5, true);
    c.fillStyle = '#0c0f20'; shadow(c, 0, 0, bw, bh, 10, 3, cut);
    // the picture (large once it has come, else small), its ground under it, the dim of distance over it
    const im = p.hiState === 2 && p.hiBmp ? p.hiBmp : p.loBmp;
    c.save(); c.beginPath(); c.roundRect(0, 0, bw, bh, 10); c.clip();
    if (!cut) {
      if (im) c.drawImage(im, 0, 0, bw, bh); else { c.fillStyle = '#1a1f3c'; c.fillRect(0, 0, bw, bh); }
      if (it.dimO > 0) { c.globalAlpha = op * it.dimO; c.fillStyle = '#0d1233'; c.fillRect(0, 0, bw, bh); }
    } else {
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.fillRect(0, 0, bw, bh);
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = op * (1 - it.dimO);
      if (im) c.drawImage(im, 0, 0, bw, bh); else { c.fillStyle = '#1a1f3c'; c.fillRect(0, 0, bw, bh); }
      if (it.dimO > 0) { c.globalAlpha = op * it.dimO; c.fillStyle = '#0d1233'; c.fillRect(0, 0, bw, bh); }
      c.globalCompositeOperation = 'source-over';
    }
    c.restore();
  }
  function paint(c, cv, list) {
    let g = G.get(c); if (!g) { g = grads(c); G.set(c, g); }
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, cv.width, cv.height);
    if (!list.length) return;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = SMOOTH;
    list.sort(byZ);
    for (const it of list) {
      if (it.k === 1) { drawPic(c, g, it); continue; }
      if (it.k === 0) { const b = bmp[it.b]; if (!b) continue; c.setTransform(RX * it.a, 0, 0, RY * it.d, RX * it.x, RY * it.y); c.globalAlpha = it.op; c.drawImage(b, 0, 0, it.w, it.h); continue; }
      c.setTransform(RX * it.s, 0, 0, RY * it.s, RX * it.x, RY * it.y); c.globalAlpha = it.op; c.fillStyle = g.glow; c.beginPath(); c.arc(200, 200, 200, 0, TAU); c.fill();
    }
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  }

  // lift: how far (pixels) the camera has tilted back down after the sky (the art chapter's end, art.js)
  function frame(q, time, pointer, lift) {
    if (!W) layout();
    lift = lift || 0;
    q = clamp(q || 0); time = time || 0;
    const px = pointer ? clamp(pointer.x || 0, -1, 1) : 0, py = pointer ? clamp(pointer.y || 0, -1, 1) : 0;
    const slow = still || Math.abs(q - lastQ) < 0.0012;
    if (openIdx >= 0 && closeT < 0 && Math.abs(q - openQ) > 0.0015) closeT = time;
    lastTime = time; lastQ = q; curQ = q;

    const k = kOf(q), cam = camAt(k);
    const camX = cam.x + px * 0.12, camY = cam.y - py * 0.05, camZ = cam.z;
    const turn = io(q / QA), pan = -(1 - turn) * panDist;
    // (the grove does not fade up over the cloth: it is solid, and comes in from the left as the camera turns, while the
    // cloth's garden goes out on the right, solid too, as one painted world seen turning)
    const grove = sp ? ss(0.0, 0.025, turn) : ss(0.16, 0.7, turn);
    // (the turn starts from the chapter before's view of the garden: its horizon eases to the avenue's own)
    cy = sp ? lerp(plateY + PLATE.horizon * plateS, cy0, turn) : cy0;
    const tq0 = QB - 0.02, T = Tmax * io((q - tq0) / (0.985 - tq0)) - lift;
    const hY = cy + T;                                   // the horizon on the screen
    const hero = clamp(Math.round(k), 0, N - 1);
    let flats = 0;

    // --- the sky
    sky.style.transform = 'translate3d(0,' + (hY + 0.14 * H - (H + Tmax + 0.3 * H)).toFixed(1) + 'px,0)';
    stars.style.backgroundPosition = (pan * 0.25 - px * 4).toFixed(1) + 'px 0';
    moon.style.transform = 'translate3d(' + (moonX * W - moonR + pan * 0.5 - px * 6).toFixed(1) + 'px,' + (hY - moonE * H - moonR).toFixed(1) + 'px,0)';
    const cw = (tall ? 3.1 : 1.5) * W, ch = cw * 350 / 2816;
    cloudsA.style.transform = 'translate3d(' + (cx - cw * 0.52 + pan * 0.55 - px * 9 + Math.sin(time * 0.05) * 14).toFixed(1) + 'px,' + (hY - (tall ? 0.78 : 0.7) * H - ch / 2).toFixed(1) + 'px,0) scale(' + (cw / 2816).toFixed(4) + ')';
    cloudsB.style.transform = 'translate3d(' + (cx + cw * 0.6 + pan * 0.55 - px * 12 - Math.sin(time * 0.04) * 18).toFixed(1) + 'px,' + (hY - (tall ? 1.72 : 1.22) * H - ch / 2).toFixed(1) + 'px,0) scale(' + (-cw * 1.15 / 2816).toFixed(4) + ',' + (cw * 1.15 / 2816).toFixed(4) + ')';

    // --- the cinema's garden, turning out of sight
    if (turn < (sp ? 0.995 : 0.8)) {
      const po = (sp ? 1 - ss(0.72, 0.98, turn) : 1 - ss(0.38, 0.8, turn)).toFixed(3), x0 = plateX + turn * panDist - px * 5, y0 = cy - PLATE.horizon * plateS;
      plate.style.visibility = ''; plate.style.opacity = po;
      plate.style.transform = 'translate3d(' + x0.toFixed(1) + 'px,' + y0.toFixed(1) + 'px,0) scale(' + plateS.toFixed(5) + ')';
      glowC.style.visibility = ''; glowC.style.opacity = (0.5 * po).toFixed(3);
      glowC.style.transform = 'translate3d(' + (x0 + GLOW.x * plateS).toFixed(1) + 'px,' + (y0 + GLOW.y * plateS).toFixed(1) + 'px,0) scale(' + (plateS / GS).toFixed(5) + ')';
    } else { plate.style.visibility = 'hidden'; glowC.style.visibility = 'hidden'; }

    // --- the tea house at the end of the avenue
    {
      const d = zHouse - camZ, w = f * houseW / d, s = w / HOUSE.w, h = HOUSE.h * s;
      const y = cy + f * camY / d + T - HOUSE.lawn * s;
      if (y < H + 20 && w > 12 && lift <= 0) {
        house.style.visibility = ''; house.style.opacity = grove.toFixed(2);
        house.style.transform = 'translate3d(' + (cx + pan - w / 2 - f * camX / d).toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(5) + ')';
      } else house.style.visibility = 'hidden';
    }

    // --- the ground: the lawn, the stepping stones, the fallen petals, the light under each lantern
    const g = gx, dp = ground.width / W;
    g.setTransform(dp, 0, 0, dp, 0, 0); g.clearRect(0, 0, W, H);
    if (hY < H) {
      const mixc = ss(0.02, 0.3, q), col = (a, b) => 'rgb(' + Math.round(lerp(a[0], b[0], mixc)) + ',' + Math.round(lerp(a[1], b[1], mixc)) + ',' + Math.round(lerp(a[2], b[2], mixc)) + ')';
      const haze = g.createLinearGradient(0, hY - 0.2 * H, 0, hY);
      haze.addColorStop(0, 'rgba(70,74,140,0)'); haze.addColorStop(1, 'rgba(84,86,150,0.5)');
      g.fillStyle = haze; g.fillRect(0, hY - 0.2 * H, W, 0.2 * H);
      const lawn = g.createLinearGradient(0, hY, 0, Math.max(hY + 1, H));
      lawn.addColorStop(0, col([40, 52, 50], [30, 43, 48])); lawn.addColorStop(0.3, col([36, 47, 45], [24, 36, 40])); lawn.addColorStop(1, col([26, 34, 36], [15, 23, 30]));
      g.fillStyle = lawn; g.fillRect(0, hY, W, H - hY);
      const gy = (d) => hY + f * camY / d, gxs = (X, d) => cx + pan + f * (X - camX) / d;
      // stones
      const z0s = Math.ceil((camZ + 0.9) / 1.3) * 1.3;
      for (let z = z0s + 26; z >= z0s; z -= 1.3) {
        if (z > zEndOfWood + 12) continue;
        const d = z - camZ, rx = f * 0.36 / d, ry = Math.max(0.6, f * 0.36 * camY * 0.55 / (d * d)), x = gxs(0.22 * Math.sin(z * 1.7), d), y = gy(d);
        const fade = (1 - ss(16, 26, d)) * grove;
        g.globalAlpha = fade; g.fillStyle = '#0e1320'; g.beginPath(); g.ellipse(x, y + ry * 0.18, rx + 2.5, ry + 2.5, 0, 0, 6.3); g.fill();
        g.fillStyle = '#28313c'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.3); g.fill();
        g.fillStyle = '#343f4b'; g.beginPath(); g.ellipse(x - rx * 0.06, y - ry * 0.16, rx * 0.84, ry * 0.7, 0, 0, 6.3); g.fill();
      }
      g.globalAlpha = 1;
      // pools of light
      g.globalCompositeOperation = 'lighter';
      for (let i = Math.max(0, hero - 1); i < Math.min(N, hero + 8); i++) {
        const p = P[i], u = clamp((k - i) / 1.3); if (u >= 0.6) continue;
        const d = p.Z - camZ; if (d < 0.7) continue;
        const x = gxs(p.X, d), y = gy(d), rx = f * 2.2 / d, ry = f * 2.2 * camY * 0.6 / (d * d), al = 0.5 * (1 - u / 0.6) * (1 - ss(8, 20, d)) * grove;
        g.save(); g.translate(x, y); g.scale(1, ry / rx);
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        rg.addColorStop(0, 'rgba(255,214,150,' + al.toFixed(3) + ')'); rg.addColorStop(0.3, 'rgba(240,184,112,' + (al * 0.55).toFixed(3) + ')'); rg.addColorStop(0.65, 'rgba(210,150,90,' + (al * 0.18).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(200,140,80,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rx, 0, 6.3); g.fill(); g.restore();
      }
      g.globalCompositeOperation = 'source-over';
      // petals
      for (let i = 0; i < petals.length; i++) {
        const pt = petals[i], d = pt.Z - camZ; if (d < 0.7) continue; if (d > 17) break;
        const x = gxs(pt.X, d); if (x < -20 || x > W + 20) continue;
        const y = gy(d), rx = f * pt.r / d, ry = rx * clamp(camY * 0.7 / d, 0.12, 0.6);
        g.globalAlpha = (1 - ss(10, 17, d)) * 0.9; g.fillStyle = pt.c < 0.5 ? '#8d6a8c' : '#b584a0';
        g.beginPath(); g.ellipse(x, y, rx, ry, pt.t, 0, 6.3); g.fill();
      }
      g.globalAlpha = 1;
    }

    // --- the trees (into the avenue's canvas, in depth order with the bushes, the pictures and their light)
    const av = [], kv = [];
    while (firstTree > 0 && trees[firstTree - 1].Z > camZ + 0.5) firstTree--;
    while (firstTree < trees.length && trees[firstTree].Z <= camZ + 0.5) { hide(trees[firstTree]); firstTree++; }
    for (let i = firstTree; i < trees.length; i++) {
      const t = trees[i], d = t.Z - camZ;
      if (d > FAR) { hide(t); continue; }
      if (t.off) continue;
      const sc = f / d, hpx = t.h * sc, wpx = hpx * TREE.w / TREE.h;
      const sx = cx + pan + (t.X - camX) * sc, sy = hY + camY * sc;
      const left = sx - (t.flip ? 1 - TREE.ax : TREE.ax) * wpx, top = sy - TREE.ay * hpx;
      // a tree the camera is about to pass melts away before it can fill the frame
      // (a tall screen looking up: the nearest trunks would fill half the frame as they pass below it; they go first)
      const up = tall && d < 7 ? 1 - ss(0.1, 0.28, T / Tmax) : 1;
      const op = Math.round((1 - ss(FAR - 10, FAR, d)) * ss(1.4, 3, d) * grove * up * 50) / 50;
      if (op <= 0 || left > W + 10 || left + wpx < -10 || top > H + 10) { hide(t); continue; }
      t.shown = true; flats++;
      const s = +(hpx / (TREE.h / 2)).toFixed(4);
      av.push({ z: t.z, o: t.ord, k: 0, b: t.src, a: t.flip ? -s : s, d: s, x: +(t.flip ? left + wpx : left).toFixed(1), y: +top.toFixed(1), op, w: TREE.w / 2, h: 635 });
    }

    // --- bushes close to the camera
    for (let i = 0; i < bushes.length; i++) {
      const b = bushes[i], d = b.Z - camZ;
      const op = d > 1 && d < 5.4 ? Math.round(ss(1.2, 2.2, d) * (1 - ss(3.6, 5.2, d)) * grove * 40) / 40 : 0;   // only while it is close
      if (op <= 0) { hide(b); continue; }
      const sc = f / d, wpx = b.w * sc, hpx = wpx * 250 / 550, left = cx + pan + (b.X - camX) * sc - wpx / 2, top = hY + camY * sc - hpx * 0.8;
      if (left > W || left + wpx < 0 || top > H) { hide(b); continue; }
      b.shown = true; flats++;
      const s = +(wpx / 275).toFixed(4);
      av.push({ z: b.z, o: b.ord, k: 0, b: b.src, a: s, d: s, x: +left.toFixed(1), y: +top.toFixed(1), op, w: 275, h: 125 });
    }

    // --- a picture brought forward
    let fwd = 0;
    if (openIdx >= 0) {
      fwd = still ? 1 : io((time - openT) / 0.42);
      if (closeT >= 0) { fwd = still ? 0 : Math.min(fwd, 1 - io((time - closeT) / 0.3)); if (fwd <= 0.001) { shut(openIdx); fwd = 0; } }
    }
    shade.style.opacity = (0.82 * fwd).toFixed(3);
    shade.classList.toggle('gg-on', fwd > 0.02);

    // --- the pictures
    const clear = [];                                     // where a picture hangs: no firefly is drawn across it
    const skyIn = ss(N - 3.2, N - 1.4, k);                // the sky fills as the grove thins
    const skyMin = tall ? 40 : 54 * Math.sqrt(W / 1440), skyMax = tall ? 118 : 156 * Math.sqrt(W / 1440);
    for (let i = 0; i < N; i++) {
      const p = P[i], kr = k - i, u = clamp(kr / 1.3);
      let sx, sy, wpx, ang = 0, dimO = 0, haloO = 1, strO = 1, op = 1, z, gO = 0;
      if (u < 1) {                                                   // hanging in the avenue, or just let go
        let d;
        if (u <= 0) {
          d = p.Z - camZ;
          if (d > FAR_PIC) { hide(p); glowOff(p); continue; }
          sx = cx + pan + f * (p.X - camX) / d; sy = hY - f * (p.Y - camY) / d;
          ang = 0.9 * Math.sin(time * 0.7 + i * 1.7) + 0.5 * Math.sin(time * 1.13 + i);
          op = (1 - ss(FAR_PIC - 5, FAR_PIC, d)) * grove;
          z = Math.round(100000 - p.Z * 100) + 1;
        } else {
          const e = u * u * (3 - 2 * u);
          d = p.dr * (1 + 0.9 * e);
          sx = cx + pan + f * (p.xr0 * (1 - 0.12 * u) - px * 0.12) / d;
          sy = hY - f * (p.yr0 + py * 0.05) / d - u * u * 1.3 * H;
          ang = p.s * 4 * Math.sin(Math.PI * Math.pow(u, 0.8)) + 0.9 * Math.sin(time * 0.7 + i * 1.7) * (1 - u);
          strO = 1 - ss(0, 0.1, u);
          z = Math.round(100000 - (camZ + d) * 100) + 1;
        }
        wpx = f * p.ww / d;
        dimO = 0.66 * ss(DH + 0.2, 9, d);
        haloO = 0.5 + 0.5 * (1 - ss(DH, 10, d));
        gO = u < 0.5 ? (1 - ss(3.5, 9, d)) * (1 - u * 2) * grove * (tall ? 0.8 : 1) : 0;
      } else {                                                       // in the sky
        const vis = ss(i + 1.5, i + 2.6, k) * skyIn;
        if (vis <= 0.002) { hide(p); glowOff(p); continue; }
        const t = mod(p.e + time * 0.0045, 1), r = river(t);     // it drifts up the river, and comes round again
        sx = (r.x + (p.xs - 0.5) * r.spread) * W - px * (6 + 26 * r.n) + Math.sin(time * 0.27 + p.ph) * 6 * (0.3 + r.n);
        sy = hY - r.e * H + Math.sin(time * 0.41 + p.ph * 2) * 4 * (0.3 + r.n);
        wpx = lerp(skyMin, skyMax, Math.pow(r.n, 1.8)) * p.af; ang = 2.4 * Math.sin(time * 0.33 + p.ph);
        op = vis * ss(0, 0.05, t) * (1 - ss(0.93, 1, t));
        dimO = 0.16 * (1 - r.n); haloO = 1; strO = 0;
        z = 10 + Math.round(r.n * 80);
      }
      let hpx = wpx / p.a;
      if (i === openIdx && fwd > 0) {
        // (it comes forward into the room right of the page's rail, never under it)
        const inL = options.inset ? options.inset() : 0, mx = inL + (W - inL) / 2;
        const tw = Math.min(0.92 * (W - inL) - (inL ? 24 : 0), 0.78 * H * p.a), th = tw / p.a;
        sx = lerp(sx, mx, fwd); sy = lerp(sy, 0.445 * H, fwd); wpx = lerp(wpx, tw, fwd); hpx = wpx / p.a;
        ang *= 1 - fwd; dimO *= 1 - fwd; strO *= 1 - fwd; op = lerp(op, 1, fwd); haloO = lerp(haloO, 0.5, fwd); gO *= 1 - fwd; z = 300001;
        p.cap.style.opacity = p.tassel.style.opacity = (1 - fwd).toFixed(3);
        caption.style.opacity = fwd.toFixed(3);
        caption.style.transform = 'translate3d(' + mx.toFixed(1) + 'px,' + (0.445 * H + th / 2 + 20).toFixed(1) + 'px,0) translateX(-50%)';
      }
      if (op <= 0.003 || sx + wpx < -80 || sx - wpx > W + 80 || sy + hpx * 0.5 + 60 < 0 || sy - hpx * 0.5 - (u < 1 ? p.L * (wpx / p.bw) : 12) > H) { hide(p); glowOff(p); continue; }
      p.shown = true; flats++;
      const s = wpx / p.bw, top = sy - hpx / 2;
      const tx = +(sx - p.bw / 2).toFixed(2), ty = +(top - p.L * s + p.L).toFixed(2), s5 = +s.toFixed(5), a3 = +ang.toFixed(3);
      p.m[0] = tx; p.m[1] = ty; p.m[2] = s5; p.m[3] = a3; p.lz = z;
      dimO = Math.round(dimO * 100) / 100; haloO = Math.round(haloO * 50) / 50; strO = Math.round(strO * 50) / 50; op = Math.round(op * 100) / 100;
      p.lOp = op;
      gO = Math.round(gO * 40) / 40;
      const gs = 2.5 * Math.sqrt(wpx * wpx + hpx * hpx);
      if (i === openIdx && fwd > 0) {
        // (forward: its own element draws it, over the night that closes in)
        if (!p.dom) { p.el.style.visibility = ''; p.dom = true; }
        const tr = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ') rotate(' + ang.toFixed(3) + 'deg)';
        if (tr !== p.last) { p.el.style.transform = tr; p.last = tr; }
        if (z !== p.lzd) { p.el.style.zIndex = String(z); p.lzd = z; }
        if (dimO !== p.lDim) { p.dim.style.opacity = dimO; p.lDim = dimO; }
        if (haloO !== p.lHalo) { p.halo.style.opacity = haloO; p.lHalo = haloO; }
        if (strO !== p.lStr) { p.string.style.opacity = strO; p.lStr = strO; }
        if (op !== p.lOpd) { p.el.style.opacity = op; p.lOpd = op; }
        if (gO > 0) {
          const gt = 'translate3d(' + (sx - gs / 2).toFixed(1) + 'px,' + (sy - gs / 2).toFixed(1) + 'px,0) scale(' + (gs / 400).toFixed(4) + ')';
          if (!p.gShown) { p.glow.style.visibility = ''; p.gShown = true; }
          if (gt !== p.gLast) { p.glow.style.transform = gt; p.glow.style.zIndex = String(z + 240); p.gLast = gt; }
          if (gO !== p.gOp) { p.glow.style.opacity = gO; p.gOp = gO; }
        } else glowOff(p);
      } else {
        if (p.dom) { p.el.style.visibility = 'hidden'; p.dom = false; }
        glowOff(p);
        (u < 1 ? av : kv).push({ z, o: 20000 + 2 * i, k: 1, p, tx, ty, s: s5, ang: a3, op, haloO, strO, dimO });
        // the lantern's light in the air, in front of the trees just this side of it
        if (gO > 0) av.push({ z: z + 240, o: 20001 + 2 * i, k: 2, x: +(sx - gs / 2).toFixed(1), y: +(sy - gs / 2).toFixed(1), s: +(gs / 400).toFixed(4), op: gO });
      }
      if (u < 1) clear.push(sx - wpx / 2 - 4, top - 4, sx + wpx / 2 + 4, top + hpx + 4, i === hero || i === openIdx || wpx > 0.3 * W ? 0 : f * p.ww / wpx);
    }
    paint(vx, avenue, av); paint(kx, skyPics, kv);
    if (openIdx < 0) caption.style.opacity = '0';

    // --- lanterns too far to be pictures: points of light up the river
    fx.setTransform(1, 0, 0, 1, 0, 0); fx.clearRect(0, 0, far.width, far.height);
    if (skyIn > 0.01) {
      fx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < dots.length; i++) {
        const dt = dots[i], t = mod(dt.e + time * dt.v, 1), r = river(0.3 + 0.7 * t);
        const y = hY - (r.e + 0.22 * t + 0.05 * Math.sin(dt.ph)) * H; if (y < -12 || y > H + 12) continue;
        const x = (r.x + (dt.xr - 0.5) * r.spread * 1.3) * W - px * 4, rad = (tall ? 3 : 4) * dt.r * (0.7 + 1.6 * r.n);
        fx.globalAlpha = skyIn * ss(0, 0.06, t) * (1 - ss(0.9, 1, t)) * (0.6 + 0.4 * Math.sin(time * 0.9 + dt.ph));
        fx.drawImage(dot, x - rad, y - rad, 2 * rad, 2 * rad);
      }
      fx.globalAlpha = 1; fx.globalCompositeOperation = 'source-over';
    }

    // --- which pictures are wanted large
    const walking = k > -0.8 && k < N - 0.2;
    for (let i = 0; i < N; i++) {
      const p = P[i], near = walking && Math.abs(i - hero) <= 1;
      if (i === openIdx || (near && slow)) wantHi(p);
      else if (p.hiState === 2 && !near) dropHi(p);            // so what is sharp depends on the place alone
    }

    // --- the fireflies
    ax.setTransform(1, 0, 0, 1, 0, 0); ax.clearRect(0, 0, air.width, air.height);
    if (hY < H * 1.4 && fwd < 0.98) {
      ax.globalCompositeOperation = 'lighter';
      for (let i = 0; i < flies.length; i++) {
        const fl = flies[i], d = 1.4 + mod(fl.Z - camZ, 15);
        const X = fl.X + 0.35 * Math.sin(time * fl.w + fl.ph), Y = fl.Y + 0.22 * Math.sin(time * fl.w * 1.3 + fl.ph * 2);
        const x = cx + pan * 0.9 + f * (X - camX) / d, y = hY - f * (Y - camY) / d;
        if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
        let over = false;
        for (let c = 0; c < clear.length; c += 5) if (x > clear[c] && y > clear[c + 1] && x < clear[c + 2] && y < clear[c + 3] && clear[c + 4] < d) { over = true; break; }
        if (over) continue;
        const pulse = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(time * 1.1 + fl.ph * 3), 2);
        const r = clamp(f * 0.05 * fl.r / d, 2.5, 26);
        ax.globalAlpha = pulse * ss(1.4, 3, d) * (1 - ss(11, 16.4, d)) * (1 - fwd) * 0.9;
        ax.drawImage(fly, x - r, y - r, 2 * r, 2 * r);
      }
      ax.globalAlpha = 1; ax.globalCompositeOperation = 'source-over';
    }

    state.index = walking ? hero : -1; state.k = k; state.open = openIdx; state.flats = flats;
    state.phase = q < QA ? 'turn' : T > 0.5 * Tmax ? 'sky' : 'walk';
    return state;
  }

  function resize() { layout(); }
  // (off: the chapter is a guest or away; it still draws when asked, but a picture brought forward goes back)
  function setActive(on) {
    active = !!on;
    if (!active) { if (openIdx >= 0) shut(openIdx); for (const p of P) dropHi(p); }
  }
  // which picture is under a point of the screen (this layer is behind the page: the page's clicks come here)
  function pick(x, y) {
    // (the box round the frame as it was drawn, as the frame's element measured it: its four corners under the
    // picture's transform, on the screen)
    let best = -1, bz = -1;
    const wr = world.getBoundingClientRect();
    for (const p of P) {
      if (!p.shown || p.lOp < 0.2) continue;
      const [tx, ty, s, ang] = p.m, ox = p.bw / 2, oy = -p.L, cs = Math.cos(ang * Math.PI / 180) * s, sn = Math.sin(ang * Math.PI / 180) * s;
      let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
      for (const [u, v] of [[0, 0], [p.bw, 0], [0, p.bh], [p.bw, p.bh]]) {
        const X = wr.left + ox + tx + cs * (u - ox) - sn * (v - oy), Y = wr.top + oy + ty + sn * (u - ox) + cs * (v - oy);
        if (X < l) l = X; if (X > r) r = X; if (Y < t) t = Y; if (Y > b) b = Y;
      }
      if (x >= l && x <= r && y >= t && y <= b && p.lz > bz) { best = p.i; bz = p.lz; }
    }
    return best;
  }
  function toggle(i) { if (i < 0) close(); else if (openIdx === i) close(); else open(i); }
  function dispose() {
    world.removeEventListener('click', onClick); world.removeEventListener('keydown', onKey);
    if (core < 0) core = 0;
    gone = true;
    for (const p of P) { p.hi.removeAttribute('src'); p.lo.removeAttribute('src'); for (const b of [p.loBmp, p.hiBmp]) if (b && b.close) b.close(); p.loBmp = p.hiBmp = null; }
    for (let i = 0; i < bmp.length; i++) { if (bmp[i] && bmp[i].close) bmp[i].close(); bmp[i] = null; }
    for (const c of [avenue, skyPics]) { c.width = c.height = 1; }
    world.remove();
  }
  // the q at which picture i is met, and whether everything this frame needs has arrived
  const qOf = (i) => QA + (clamp(i, 0, N - 1) - kStart) / SLOPE;
  const ready = () => pending === 0;
  const whole = () => core === 0 && P.every((p) => p.loDone);

  layout();
  return { frame, resize, setActive, dispose, open, close, toggle, pick, qOf, kOf, ready, whole, count: N, state, skyQ: 0.975, isOpen: () => openIdx };
}
