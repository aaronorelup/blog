/* THE EVENING BROADCAST: one rAF loop; every state is a function of the scroll position.
   ?y=0.37 jumps to that fraction of the scroll; ?still=1 freezes ambient motion. Both together give a repeatable frame. */
(function () {
  'use strict';
  var root = document.documentElement;
  var qs = new URLSearchParams(location.search);
  var STILL = root.classList.contains('still');
  var RM = root.classList.contains('rm');
  var FROZEN = STILL || RM;

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var eio = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var tf = function (el, x, y, s) { el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ')'; };
  var show = function (el, on) { if (el._on !== on) { el._on = on; el.style.display = on ? 'block' : 'none'; } };
  var cls = function (el, name, on) { if (el['_c' + name] !== on) { el['_c' + name] = on; el.classList.toggle(name, on); } };
  var op = function (el, o) { o = Math.round(o * 1000) / 1000; if (el._o !== o) { el._o = o; el.style.opacity = o; } };

  /* elements */
  var E = {
    garden: $('#w-garden'), gfar: $('#g-far'), gmid: $('#g-mid'), ghi: $('#g-hi'), gglow: $('#g-glow'), gtv: $('#g-tv'), title: $('.titleblock'),
    drain: $('#drain'), drainIn: $('#drain-in'), dcam: $('#d-cam'), dmid: $('#d-midcam'), tide: $('#tide'),
    wstart: $('#w-start'), scam: $('#s-cam'),
    wtv: $('#w-tv'), room: $('#tv-room'), set: $('#tv-set'), tube: $('#tube'), tubeview: $('#tubeview'), tubecover: $('#tubecover'), index: $('.index'), setglow: $('#setglow'),
    wnext: $('#w-next'), ncam: $('#n-cam'),
    petals: $('#petals'), light: $('#light'),
    clock: $('#clock'), ckh: $('#ck-h'), ckm: $('#ck-m'), cks: $('#ck-s'),
    chan: $('#chan'), chanN: $('#chan-n'), chanL: $('#chan-l'),
    rail: $('#rail'), bars: $('#bars'), slip: $('#slip'), slipN: $('#slip-n'), slipL: $('#slip-l'),
    hero: $('#hero'), start: $('#start'), tv: $('#tv'), also: $('#tv-also'), next: $('#next'),
    tvword: $('#tvwordblock'), startword: $('#start .wordblock'), nextword: $('#next .wordblock'), knob: $('#knob'), knobcap: $('#knobcap'), rollbar: $('#rollbar'), stagefx: $('#stagefx')
  };
  var barEls = $$('#bars > i');
  var breaks = $$('.break');
  var eps = $$('.ep');
  var cards = eps.map(function (a) { return a.querySelector('.card'); });
  var knobLis = $$('#knob li');
  var KA = [-112, -67, -22, 22, 67, 112];   /* where the dial points for channels 1..5 and for 20:00, in degrees from the top */
  knobLis.forEach(function (li, n) { var a = KA[n] * Math.PI / 180; li.style.left = (50 + Math.sin(a) * 37.5) + '%'; li.style.top = (50 - Math.cos(a) * 37.5) + '%'; });

  /* the dark rail inside each paper sheet: same place on screen, clipped by the sheet, so the rail turns to ink exactly at the paper's edge */
  var railClones = [];
  $$('.sheet').forEach(function (sheet) {
    var c = E.rail.cloneNode(true);
    c.removeAttribute('id'); c.classList.add('dark'); c.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(c.querySelectorAll('a'), function (a) { a.tabIndex = -1; });
    sheet.appendChild(c); railClones.push(c);
  });
  var allRails = [E.rail].concat(railClones);
  /* keyboard focus on the real rail shows on the ink copies too */
  E.rail.addEventListener('focusin', function (e) {
    var i = $$('#rail a').indexOf(e.target);
    railClones.forEach(function (c) { var a = c.querySelectorAll('a')[i]; if (a) a.style.outline = '3px solid #14162A'; });
  });
  E.rail.addEventListener('focusout', function () {
    railClones.forEach(function (c) { Array.prototype.forEach.call(c.querySelectorAll('a'), function (a) { a.style.outline = ''; }); });
  });

  /* ───────── layout: everything measured once per resize ───────── */
  var vw = 0, vh = 0, portrait = false, M = {}, G = {}, T = {}, R = {};
  var FX = 0.5023, FY = 0.4637;              // the tea house door in the far plate
  var HOLE = { x0: 0.1255, x1: 0.7128, y0: 0.2822, y1: 0.8246, cx: 0.4192, cy: 0.5534, w: 0.5802, aspect: 1.168 }; // the screen opening in tv-front
  var docTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  function coverBox(natAspect, fx, anchorX, fy, anchorY, zoom) {
    var W = Math.max(vw, vh * natAspect) * (zoom || 1), H = W / natAspect;
    return { W: W, H: H, left: clamp(anchorX * vw - fx * W, vw - W, 0), top: clamp(anchorY * vh - fy * H, vh - H, 0) };
  }
  function box(el, b) { el.style.width = b.W + 'px'; el.style.height = b.H + 'px'; }

  function measure() {
    vw = document.documentElement.clientWidth; vh = window.innerHeight; portrait = vw / vh < 0.8;

    /* the garden */
    G.Wp = portrait ? vw / 0.345 : Math.max(vw / 0.72, vh * 1.14 / 0.5625);
    G.Hp = G.Wp * 0.5625;
    G.ax = portrait ? 0.5 : 0.47; G.ay = portrait ? 0.27 : 0.5;
    G.doorW = 0.0394 * G.Wp; G.doorH = 0.0739 * G.Hp;
    G.sEnd = Math.max(vw / G.doorW, vh / G.doorH) * 1.15;
    G.midW = 0.885 * G.Wp; G.midH = G.midW / 1.5;
    var left0 = G.ax * vw - FX * G.Wp, top0 = G.ay * vh - FY * G.Hp;
    G.mdx = (G.ax * vw) - (left0 + (0.5 - 0.049) * G.Wp - G.midW / 2);   // the door, in the mid layer's own pixels
    G.mdy = (G.ay * vh) - (top0 + 0.5 * G.Hp - 0.0102 * G.Wp - G.midH / 2);
    box(E.dcam, { W: G.Wp, H: G.Hp }); box(E.dmid, { W: G.midW, H: G.midH });
    box(E.gglow, { W: 0.285 * G.Wp, H: 0.46 * G.Hp });
    G.tvW = (portrait ? vw * 0.31 : clamp(vw * 0.17, 170, 320)) * 1.065; G.tvH = G.tvW * 641 / 700;
    G.tvX = portrait ? vw * 0.07 : vw * 0.2; G.tvY = portrait ? vh * 0.40 : vh - G.tvH - vh * 0.05;
    E.gtv.style.width = G.tvW + 'px'; E.gtv.style.height = G.tvH + 'px';

    /* the room inside the door */
    var sw = $('#start-word').getBoundingClientRect(), nw = $('#next-word').getBoundingClientRect();
    if (portrait) {
      /* phones: the plate stands at the foot of the frame, the calm dark wall runs on above it for the word */
      var Ws = vw * 2.3, Hs = Ws / (2400 / 1340);
      R.start = { W: Ws, H: Hs, left: clamp(0.70 * vw - 0.806 * Ws, vw - Ws, 0), top: vh - Hs };
      var Wn = vw * 2.5, Hn = Wn / (2400 / 1340);
      R.next = { W: Wn, H: Hn, left: clamp(0.5 * vw - 0.68 * Wn, vw - Wn, 0), top: vh - Hn };
    } else {
      /* the alcove wall (27.5% across the plate) goes under the word; the dark wall of the screening room likewise */
      R.start = coverBox(2400 / 1340, 0.275, (sw.left + sw.width / 2) / vw, 0.5, 0.5, 1.02);
      R.next = coverBox(2400 / 1340, 0.235, (nw.left + nw.width / 2) / vw, 0.45, 0.45, 1.03);
    }
    box(E.scam, R.start);
    box(E.ncam, R.next); tf(E.ncam, R.next.left, R.next.top, 1);

    /* the television's room and the set */
    T.w0 = (portrait ? vw * 0.6 : clamp(vw * 0.235, 220, 440)) * 1.0526; T.h0 = T.w0 * 1339 / 1441;
    T.cx = portrait ? vw * 0.5 : vw * 0.775; T.by = portrait ? vh * 0.78 : vh * 0.735;
    var Wr = Math.max(T.w0 / 0.5 / 0.328, T.cx / 0.501, (vw - T.cx) / 0.499, T.by / 0.577 / 0.5583, (vh - T.by) / 0.423 / 0.5583) * 1.01;
    T.room = { W: Wr, H: Wr * 0.5583, left: T.cx - 0.501 * Wr, top: T.by - 0.577 * Wr * 0.5583 };
    box(E.room, T.room);
    var holeWEnd = Math.max(vw, vh * HOLE.aspect) * 1.06;
    T.wEnd = holeWEnd / HOLE.w; T.hEnd = T.wEnd * 1339 / 1441; T.k0 = T.w0 / T.wEnd;
    T.c0x = T.cx - T.w0 / 2 + HOLE.cx * T.w0; T.c0y = T.by - T.h0 * 0.962 + HOLE.cy * T.h0;
    E.set.style.width = T.wEnd + 'px'; E.set.style.height = T.hEnd + 'px';
    var tl = HOLE.x0 * T.wEnd, tt = HOLE.y0 * T.hEnd;
    E.tube.style.left = tl + 'px'; E.tube.style.top = tt + 'px';
    E.tube.style.width = (HOLE.x1 - HOLE.x0) * T.wEnd + 'px'; E.tube.style.height = (HOLE.y1 - HOLE.y0) * T.hEnd + 'px';
    E.tubeview.style.left = (HOLE.cx * T.wEnd - vw / 2 - tl) + 'px'; E.tubeview.style.top = (HOLE.cy * T.hEnd - vh / 2 - tt) + 'px';
    E.tubeview.style.width = vw + 'px'; E.tubeview.style.height = vh + 'px';
    var gs = T.w0 * 2.7;
    E.setglow.style.width = gs + 'px'; E.setglow.style.height = gs + 'px';
    E.setglow.style.left = (T.c0x - T.room.left - gs / 2) + 'px'; E.setglow.style.top = (T.c0y - T.room.top - gs / 2) + 'px';

    /* the page */
    M.heroTop = docTop(E.hero); M.heroH = E.hero.offsetHeight;
    M.startTop = docTop(E.start); M.heroEnd = M.heroTop + M.heroH - vh;
    M.tvTop = docTop(E.tv); M.tvH = E.tv.offsetHeight;
    M.alsoTop = docTop(E.also); M.nextTop = docTop(E.next);
    M.br = breaks.map(function (b) { var t = docTop(b), h = b.offsetHeight; return { top: t, h: h, mid: t + 0.5 * (h + vh) - vh }; });
    M.max = Math.max(1, document.documentElement.scrollHeight - vh);
    M.epTops = RM ? eps.map(docTop) : null;

    /* the clock: seconds after 19:40:00, as a function of scroll */
    var U = vh / 100;
    if (RM) {
      M.clock = [[0, 0], [M.heroEnd, 150], [M.br[0].top, 440], [M.tvTop, 500], [M.epTops[0] - vh * 0.5, 600], [M.epTops[4] - vh * 0.5, 1140], [M.epTops[5] - vh * 0.6, 1200], [M.alsoTop - vh, 1200], [M.br[1].top, 1290], [M.nextTop, 1380], [M.max, 1440]];
    } else {
      M.clock = [[0, 0], [M.heroEnd, 150], [M.br[0].top, 440], [M.tvTop, 500], [M.tvTop + TL.zoom1 * U, 600], [M.tvTop + TL.turn0 * U, 1170], [M.tvTop + TL.eight * U, 1200], [M.alsoTop - vh, 1200], [M.br[1].top, 1290], [M.nextTop, 1380], [M.max, 1440]];
    }
    sizeCanvas();
  }

  /* the television chapter's timeline, in vh from the top of the section */
  var TL = { zoom0: 40, zoom1: 150, step: 80, turn0: 550, eight: 585, drain1: 680 };

  /* ───────── petals ───────── */
  var ctx = E.petals.getContext('2d'), P = [], lastT = 0;
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function sizeCanvas() {
    E.petals.width = vw; E.petals.height = vh;
    var r = rng(1940), n = portrait ? 11 : 20; P = [];
    for (var i = 0; i < n; i++) {
      P.push({ x: r() * vw, y: r() * vh, z: 0.5 + r() * 0.6, vy: 14 + r() * 20, vx: 4 + r() * 9, ph: r() * 6.28, f: 0.5 + r() * 0.9, rot: r() * 3.14, vr: (r() - 0.5) * 1.2, c: r() });
    }
    petalsDirty = true;
  }
  var petalsDirty = true, petalsShown = false, motesShown = false, MOTES = [];
  (function () { var r = rng(2003); for (var i = 0; i < 26; i++) MOTES.push({ u: r(), v: r(), ph: r() * 6.28, f: 0.25 + r() * 0.5, s: 0.8 + r() * 1.4, a: 0.25 + r() * 0.5 }); })();
  /* dust in the projector's beam: a few warm specks that hang and turn in the cone of light */
  function drawMotes(t) {
    ctx.clearRect(0, 0, vw, vh);
    /* the cone, in fractions of the plate: from the lens to the two far corners of the cloth screen */
    var b = R.next, ax = 0.885, ay = 0.735, c1x = 0.805, c1y = 0.225, c2x = 0.565, c2y = 0.55;
    ctx.fillStyle = '#FFE6B8';
    for (var i = 0; i < MOTES.length; i++) {
      var m = MOTES[i];
      var w = clamp(m.u + Math.sin(t * m.f * 0.3 + m.ph) * 0.05, 0.04, 0.96);          /* across the cone */
      var s = 0.14 + 0.8 * ((m.v + t * 0.01 * m.f) % 1);                                /* along it, drifting toward the screen */
      var fx = ax + s * (lerp(c1x, c2x, w) - ax), fy = ay + s * (lerp(c1y, c2y, w) - ay);
      var near = 1 - s;                                                                 /* brighter and larger near the lens */
      ctx.globalAlpha = Math.min(1, m.a * 1.3 * (0.45 + 0.55 * near) * (0.62 + 0.38 * Math.sin(t * m.f * 2 + m.ph)) * Math.sin((s - 0.14) / 0.8 * 3.1416));
      ctx.beginPath(); ctx.arc(b.left + fx * b.W, b.top + fy * b.H, m.s * (0.8 + near * 1.3), 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function drawPetals(alpha, rise, pale, dt, t) {
    ctx.clearRect(0, 0, vw, vh);
    if (alpha <= 0.01) return;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (dt > 0) {
        var vy = lerp(p.vy, -p.vy * 0.5, rise), vx = lerp(p.vx, 0, rise);
        p.y += vy * p.z * dt; p.x += (vx + Math.sin(t * p.f + p.ph) * 9 * (1 - rise)) * p.z * dt; p.rot += p.vr * dt * (1 - rise * 0.8);
        if (p.y > vh + 14) { p.y = -12; } if (p.y < -14) { p.y = vh + 12; }
        if (p.x > vw + 14) { p.x = -12; }
      }
      var r = 4.4 * p.z * (portrait ? 0.85 : 1);
      ctx.globalAlpha = alpha * (pale ? 0.95 : 0.5 + 0.4 * p.c);
      ctx.fillStyle = pale ? '#D6789A' : (p.c > 0.5 ? '#DFA2B8' : '#BE829B');
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 1.45, r * 0.8, p.rot, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ───────── the frame ───────── */
  var lastY = -1, lastKey = '', curCh;
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function frame(now) {
    var y = window.scrollY, t = FROZEN ? 0 : now / 1000, dt = FROZEN ? 0 : Math.min(0.05, t - lastT); lastT = t;
    var U = vh / 100;

    /* hero progress */
    var p = RM ? 0 : clamp(y / (M.heroH - vh), 0, 1);
    /* television chapter, local scroll in vh */
    var l = (y - M.tvTop) / U;
    var b0 = M.br[0], b1 = M.br[1];
    var inTv = y >= b0.mid && y < b1.mid;
    var z = RM ? 0 : clamp((l - TL.zoom0) / (TL.zoom1 - TL.zoom0), 0, 1), ez = eio(z);
    var turnIn = RM ? 0 : sstep(TL.turn0 - 18, TL.turn0 - 2, l);            // E5 dissolves to the ident
    var d = RM ? (inTv && l > 0 && y > (M.epTops[5] - vh) ? 1.06 : 0) : clamp((l - TL.eight) / (TL.drain1 - TL.eight), 0, 1.06);
    var inTurn = inTv && (RM ? d > 0 : l >= TL.turn0 - 18);
    var inside = !RM && inTv && z >= 1;

    /* which world is on */
    /* reduced motion has no glide: the garden gives way to the room just before the word Start here comes into the frame */
    var rmCut = M.startTop - vh * 0.79;
    var gardenHero = RM ? y < rmCut : (p < 0.62 && y < M.heroEnd + vh);
    var startOn = RM ? (y >= rmCut && y < b0.mid) : (p >= 0.47 && y < b0.mid);
    var gardenOn = gardenHero || inTurn;
    cls(E.garden, 'on', gardenOn);
    cls(E.wstart, 'on', startOn);
    cls(E.wtv, 'on', inTv && !inTurn && !(inside && l > TL.zoom1 + 8));
    cls(E.wnext, 'on', y >= b1.mid);

    /* the garden camera */
    if (gardenOn) {
      var pp = inTurn ? 0 : p;
      var s = Math.exp(Math.log(G.sEnd) * sstep(0, 0.7, pp));
      var e = sstep(0, 0.45, pp);
      var dx = lerp(G.ax, 0.5, e) * vw, dy = lerp(G.ay, 0.5, e) * vh;
      var X = dx - s * FX * G.Wp, Y = dy - s * FY * G.Hp, u = G.Wp / 2816;
      tf(E.gfar, X, Y, s * u);
      var hi = s > 1.12 && s * G.doorH < vh * 1.5;
      show(E.ghi, hi);
      if (hi) tf(E.ghi, X + s * u * 660, Y + s * u * 300, s * u / 2.5);
      tf(E.gglow, X + s * 0.36 * G.Wp, Y + s * 0.30 * G.Hp, s);
      var sm = Math.pow(s, 1.5);
      show(E.gmid, sm < 7);
      if (sm < 7) { tf(E.gmid, dx - sm * G.mdx, dy - sm * G.mdy, sm * G.midW / 1800); op(E.gmid, 1 - sstep(2.6, 6, sm)); }
      var tvE = sstep(0.04, 0.42, pp);
      show(E.gtv, tvE < 1 && d < 1);
      tf(E.gtv, G.tvX - tvE * vw * 0.05, G.tvY + tvE * vh * 0.62, 1 + tvE * 0.7);
      /* 20:00 */
      var draining = inTurn && d > 0;
      show(E.drain, draining); show(E.tide, draining && d < 1.06);
      if (draining) {
        var off = (1 - Math.min(d, 1)) * vh;
        E.drain.style.transform = 'translate3d(0,' + (-off).toFixed(2) + 'px,0)';
        E.drainIn.style.transform = 'translate3d(0,' + off.toFixed(2) + 'px,0)';
        E.tide.style.transform = 'translate3d(0,' + (d * vh - 2).toFixed(2) + 'px,0)';
        tf(E.dcam, G.ax * vw - FX * G.Wp, G.ay * vh - FY * G.Hp, 1);
        tf(E.dmid, G.ax * vw - G.mdx, G.ay * vh - G.mdy, 1);
      }
    }
    /* petals */
    var pa = gardenOn ? (inTurn ? 1 : 1 - sstep(0.15, 0.42, p)) : 0;
    if (pa > 0 || petalsShown) {
      if (!FROZEN || petalsDirty || y !== lastY) { drawPetals(pa, inTurn ? sstep(0, 0.2, d) : 0, inTurn && d > 0.5, dt, t); petalsDirty = false; }
      petalsShown = pa > 0;
    }

    var nextOn = y >= b1.mid;
    if (nextOn && (!FROZEN || !motesShown || y !== lastY)) { drawMotes(t); motesShown = true; }
    else if (!nextOn && motesShown) { ctx.clearRect(0, 0, vw, vh); motesShown = false; petalsDirty = true; }

    /* through the door: the light, then the room */
    var doorPx = Math.exp(Math.log(G.sEnd) * sstep(0, 0.7, p)) * G.doorH;
    var lo = RM ? 0 : sstep(vh * 0.55, vh * 1.0, doorPx) * (1 - sstep(0.5, 0.8, p));
    if (!RM) { var wo = sstep(0.6, 0.86, p); op(E.startword, wo); E.startword.style.transform = 'translate3d(0,' + ((1 - wo) * 26).toFixed(1) + 'px,0)'; }
    if (!RM) { var to = 1 - sstep(0.015, 0.085, p); op(E.title, to); E.title.style.visibility = to > 0 ? 'visible' : 'hidden'; op(E.index, to); E.index.style.visibility = to > 0 ? 'visible' : 'hidden'; }
    show(E.light, lo > 0.002); if (lo > 0.002) op(E.light, lo);
    if (startOn) {
      var ss = RM ? 1 : lerp(1.1, 1, sstep(0.5, 0.88, p));
      tf(E.scam, R.start.left - (ss - 1) * (vw * 0.5 - R.start.left), R.start.top - (ss - 1) * (vh * 0.5 - R.start.top), ss);
    }

    /* the television */
    if (inTv && !inTurn) {
      var k = Math.exp(lerp(Math.log(T.k0), 0, ez));
      var cx = lerp(T.c0x, vw / 2, ez), cy = lerp(T.c0y, vh / 2, ez);
      tf(E.set, cx - k * HOLE.cx * T.wEnd, cy - k * HOLE.cy * T.hEnd, k);
      var kr = k / T.k0;
      show(E.room, kr < 9);
      if (kr < 9) tf(E.room, cx - kr * (T.c0x - T.room.left), cy - kr * (T.c0y - T.room.top), kr);
      op(E.tubecover, portrait ? 1 - sstep(0.5, 0.9, z) : 0);
    }
    if (!RM) {
      op(E.tvword, 1 - sstep(TL.zoom0 - 6, TL.zoom0 + 26, l));
      E.tvword.style.visibility = l > TL.zoom0 + 28 ? 'hidden' : 'visible';
      /* the dial */
      var step = (l - TL.zoom1) / TL.step, ki = clamp(Math.floor(step), 0, 4), f = clamp(step - ki, 0, 1);
      var roll = 0;
      for (var i = 0; i < 5; i++) {
        var o = 0, co = 0;
        if (inside && l < TL.turn0 + 2) {
          /* the picture dissolves first; only when it has landed is its card put on the stand, so two cards never overlap */
          if (i === ki) { o = 1; co = Math.min(sstep(i === 0 ? 0.02 : 0, i === 0 ? 0.16 : 0.12, step - ki), 1 - sstep(0.67, 0.775, f)); }   /* and it is taken off the stand before the next mix begins */
          else if (i === ki + 1 && f > 0.78) { o = sstep(0.78, 0.97, f); roll = o; }
          if (i === 4 && ki === 4) { o = 1 - turnIn; }
        }
        var a = eps[i];
        /* hidden channels stay in the tab order (opacity, not visibility); only the one on air takes the pointer */
        op(a, o); cls(a, 'on', o > 0); cls(a, 'live', co > 0.5);
        if (o > 0) { cards[i].style.transform = 'translate3d(0,' + ((1 - co) * 34).toFixed(1) + 'px,0)'; op(cards[i], co); }
      }
      /* the turn card */
      var tc = inTurn ? sstep(0.84, 1.0, d) : 0, ta = eps[5];
      op(ta, tc > 0 ? 1 : 0); cls(ta, 'live', tc > 0.5);
      if (tc > 0) { cards[5].style.transform = 'translate3d(0,' + ((1 - tc) * 34).toFixed(1) + 'px,0)'; op(cards[5], tc); }
      /* the rolling bar between channels */
      op(E.rollbar, roll > 0 && roll < 1 ? Math.sin(roll * 3.1416) * 0.9 : 0);
      if (roll > 0 && roll < 1) E.rollbar.style.transform = 'translate3d(0,' + (lerp(-24, 104, roll) * U).toFixed(1) + 'px,0)';
      var fxOn = inside && l < TL.turn0 - 2;
      if (E.stagefx._v !== fxOn) { E.stagefx._v = fxOn; E.stagefx.style.visibility = fxOn ? 'visible' : 'hidden'; }
      /* the knob */
      var ko = (inside || inTurn) ? sstep(TL.zoom1, TL.zoom1 + 10, l) : 0;
      op(E.knob, ko);
      if (ko > 0) {
        var kc = inTurn && l >= TL.turn0 - 8 ? 5 : ki + (f > 0.88 && ki < 4 ? 1 : 0);
        if (E.knob._k !== kc) { E.knob._k = kc; knobLis.forEach(function (li, n) { li.classList.toggle('cur', n === kc); }); }
        var ang = inTurn ? lerp(KA[4], KA[5], turnIn) : lerp(KA[ki], KA[Math.min(ki + 1, 5)], ki < 4 ? sstep(0.78, 0.97, f) : 0);
        E.knobcap.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
      }
    }
    /* the next programme's word resolves in place once its stage has nearly arrived */
    if (!RM) op(E.nextword, 1 - sstep(vh * (portrait ? 0.015 : 0.3), vh * (portrait ? 0.12 : 0.8), M.nextTop - y));
    else {
      /* reduced motion: a word is simply there once its stage has arrived (a cut, no travel across the lit part of a room) */
      var cut = vh * (portrait ? 0.14 : 0.55);   /* on wide screens the word's wall is calm all the way up, so it may show sooner */
      op(E.startword, M.startTop - y < cut ? 1 : 0);
      op(E.nextword, M.nextTop - y < cut ? 1 : 0);
      if (portrait) op(E.tvword, E.tvword.getBoundingClientRect().bottom - vh * 0.46 < vh * 0.52 ? 1 : 0);
    }

    /* station breaks */
    var barsOn = false;
    for (var j = 0; j < M.br.length; j++) {
      var br = M.br[j], b = (y + vh - br.top) / (br.h + vh);
      if (b > 0.24 && b < 0.78) {
        barsOn = true;
        if (RM) { op(E.bars, Math.sin(clamp((b - 0.24) / 0.54, 0, 1) * 3.1416)); for (var q = 0; q < 7; q++) barEls[q].style.transform = 'none'; }
        else {
          for (var n = 0; n < 7; n++) {
            var u = eio(clamp((b - 0.27 - n * 0.012) / 0.15, 0, 1)), v = eio(clamp((b - 0.535 - n * 0.012) / 0.15, 0, 1));
            barEls[n].style.transform = 'translate3d(0,' + ((1 - u) * 101 - v * 101).toFixed(2) + '%,0)';
          }
        }
        op(E.slip, sstep(0.44, 0.49, b) * (1 - sstep(0.53, 0.58, b)));
        if (E.slip._j !== j) { E.slip._j = j; E.slipN.textContent = breaks[j].dataset.n; E.slipL.textContent = breaks[j].dataset.l; }
      }
    }
    cls(E.bars, 'on', barsOn);

    /* the rail and the channel plate */
    var ch = y >= b1.mid ? 'next' : y >= b0.mid ? 'tv' : ((RM ? y >= M.startTop - vh * 0.75 : p >= 0.56) ? 'start' : null);
    if (ch !== curCh) {
      curCh = ch;
      allRails.forEach(function (r) { Array.prototype.forEach.call(r.querySelectorAll('li'), function (li) { li.classList.toggle('cur', !!ch && li.dataset.ch === ch); }); });
      var cur = ch ? E.rail.querySelector('li[data-ch="' + ch + '"]') : null;
      E.chanN.textContent = cur ? cur.querySelector('b').textContent : '';
      E.chanN.style.display = cur ? '' : 'none';
      E.chanL.textContent = cur ? cur.querySelector('span').textContent : 'The tea room';
    }
    cls(E.rail, 'pale', inTurn && d > 0.7);
    cls(E.rail, 'hide', !RM && inTv && !inTurn && z > 0.55);

    /* the clock */
    var c = M.clock, sec = c[c.length - 1][1];
    for (var m = 1; m < c.length; m++) { if (y <= c[m][0]) { var a0 = c[m - 1], a1 = c[m]; sec = a1[0] === a0[0] ? a1[1] : lerp(a0[1], a1[1], clamp((y - a0[0]) / (a1[0] - a0[0]), 0, 1)); break; } }
    sec = Math.floor(sec + 1e-6);
    var key = String(sec);
    if (key !== lastKey) {
      lastKey = key;
      var total = 19 * 3600 + 40 * 60 + sec;
      E.ckh.textContent = pad2(Math.floor(total / 3600)); E.ckm.textContent = pad2(Math.floor(total / 60) % 60); E.cks.textContent = pad2(total % 60);
    }
    cls(E.clock, 'stuck', sec === 1200 && inTurn);

    lastY = y;
  }

  function loop(now) { frame(now); requestAnimationFrame(loop); }

  /* keyboard: tabbing to a link inside the pinned television turns the dial to its channel */
  $('#dial').addEventListener('focusin', function (e) {
    if (RM) return;
    var a = e.target.closest ? e.target.closest('.ep') : null; if (!a) return;
    var k = +a.dataset.k, l = k < 5 ? TL.zoom1 + (k + 0.4) * TL.step : TL.drain1 + 22;
    window.scrollTo(0, Math.round(M.tvTop + l * vh / 100));
  });

  /* ───────── entrances and loops ───────── */
  function observers() {
    if (FROZEN || !('IntersectionObserver' in window)) { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -14% 0px', threshold: 0.12 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { var v = en.target; if (en.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); });
    }, { threshold: 0.25 });
    $$('video.loop').forEach(function (v) { vio.observe(v); });
  }

  /* ───────── start ───────── */
  function ready() {
    $$('img[loading="lazy"]').forEach(function (im) { im.loading = 'eager'; });
    var waits = $$('img').map(function (im) { return im.complete ? Promise.resolve() : new Promise(function (res) { im.addEventListener('load', res); im.addEventListener('error', res); }); });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return Promise.all(waits.concat([fonts]));
  }

  measure();
  observers();
  if (E.ghi.decode) E.ghi.decode().catch(function () {});   /* decoded ahead, so its first frame in the glide does not stall */
  requestAnimationFrame(loop);
  var rz;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { measure(); petalsDirty = true; lastKey = ''; }, 80); });
  window.addEventListener('load', function () {
    ready().then(function () {
      measure();
      var fy = parseFloat(qs.get('y'));
      if (!isNaN(fy)) window.scrollTo(0, Math.round(clamp(fy, 0, 1) * M.max));
      requestAnimationFrame(function () { requestAnimationFrame(function () { root.dataset.ready = '1'; }); });
    });
  });
})();
