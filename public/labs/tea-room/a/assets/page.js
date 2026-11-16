/* SHOJI: the page's one script.
   Every scroll-driven value below is a pure function of scroll position (no easing toward a target), so a given
   ?y= always gives the same frame. Ambient motion is CSS (the lights) plus one small canvas (the petals), both
   functions of a single clock; ?still=1 and prefers-reduced-motion pin that clock. */
(function () {
  'use strict';
  var html = document.documentElement;
  var qs = new URLSearchParams(location.search);
  var STILL = qs.get('still') === '1';
  var CALM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var FROZEN = STILL || CALM;
  var STILL_T = 7.3;
  var yParam = parseFloat(qs.get('y'));

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (x, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x)); };
  var ramp = function (y, a, b) { return clamp((y - a) / (b - a)); };
  var ease = function (x) { return x * x * (3 - 2 * x); };
  var io = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  var tri = function (d, w) { return Math.max(0, 1 - Math.abs(d) / w); };
  var Q = function (x) { return CALM ? Math.round(x) : x; };       // reduced motion: no in-betweens

  var scene = { garden: $('#w-garden'), room: $('#w-room'), alcove: $('#w-alcove'), face: $('#w-face'), cinema: $('#w-cinema') };
  var pl = { far: $('#pl-far'), midl: $('#pl-midl'), midr: $('#pl-midr'), tv: $('#pl-tv'), room: $('#pl-room'), alcove: $('#pl-alcove'), cinema: $('#pl-cinema') };
  var shoji = $('#shoji'), pL = $('.panel-l'), pR = $('.panel-r');
  var sils = {}; ['amber', 'blue', 'pale'].forEach(function (v) { sils[v] = [$('.panel-l .sil[data-v="' + v + '"]'), $('.panel-r .sil[data-v="' + v + '"]')]; });
  var eps = $$('.tube .ep'), flash = $('.tube-flash'), verm = $('.tube-verm'), knob = $('.knob'), turnImg = $('.ep-turn');
  var chs = $$('#card .ch'), clock = $('#clock'), clockHM = $('#clock .hm'), clockSS = $('#clock .ss');
  var rail = $('#rail'), railItems = $$('#rail li[data-c]'), tab = $('#tab'), slip = $('.slip');
  var figs = $$('.print'), hello = $('.hello'), words = $$('.word-wrap');
  var canvas = $('#petals'), ctx = canvas.getContext('2d');
  var CHAPTERS = [['I', 'Start here'], ['II', 'I Love My Evening Television'], ['III', 'AI video & film']];
  var REST = [-0.6, 0.5, -0.4];                                 // each print hangs a fraction off square
  // the glass of the painted face, as fractions of the frame (from the bake: shoji-work/face.json)
  var HOLE_WIDE = { x: 0.040625, y: 0.063889, w: 0.795313, h: 0.872222 }, HOLE_TALL = { x: 0.051282, y: 0.135861, w: 0.897436, h: 0.312006 };

  var W = 0, H = 0, M = {}, G = {}, last = {}, lastY = -1, dirty = true;

  /* ── geometry ─────────────────────────────────────────── */
  function docTop(el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; }
  // cover-fit a plate of aspect A, keeping its light (fx, fy) at (tx, ty) of the screen where the crop allows
  function cover(A, fx, fy, tx, ty) {
    var w = Math.max(W, H * A), h = w / A;
    var x = clamp(tx * W - fx * w, W - w, 0), y = clamp(ty * H - fy * h, H - h, 0);
    return { x: x, y: y, w: w, h: h };
  }
  function lay(el, r, L) { r.L = L; el.style.width = (r.w * L).toFixed(1) + 'px'; el.style.height = (r.h * L).toFixed(1) + 'px'; }
  function place(el, r, s, vx, vy, ax, ay) {
    var X = vx + (r.x - vx) * s + ax, Y = vy + (r.y - vy) * s + ay;
    el.style.transform = 'translate3d(' + X.toFixed(2) + 'px,' + Y.toFixed(2) + 'px,0) scale(' + (s / r.L).toFixed(5) + ')';
  }

  function measure() {
    W = html.clientWidth; H = window.innerHeight;
    var tall = W / H < 0.8, narrow = window.matchMedia('(max-width: 820px)').matches;
    M.start = docTop($('#start')); M.tv = docTop($('#tv')); M.push = docTop($('.push')); M.dial = docTop($('.dial'));
    M.also = docTop($('#tv-also')); M.next = docTop($('#next'));
    M.max = Math.max(1, html.scrollHeight - H);
    M.sH = 0.85 * H;
    M.figs = figs.map(docTop);
    M.slipEnd = docTop(slip) + slip.offsetHeight;

    // garden: far plate, mid cut-outs, television (placement from the kit's manifest, projected to the far plane)
    var far = cover(16 / 9, 0.5025, 0.4667, 0.5, tall ? 0.40 : 0.4667);
    G.far = far; G.vx = far.x + 0.5025 * far.w; G.vy = far.y + 0.4667 * far.h;
    // the kit's mid cut-out, split in two so neither bush group shows its cut edge in a wide frame
    // the left one is staged as a canopy hanging into the top-left corner (its trunk out of frame): the title slip hangs in its blossom
    G.midl = { x: far.x - 0.2 * far.w, y: far.y - 0.12 * far.h, w: 0.493 * far.w, h: 1.118 * far.h };
    G.midr = { x: far.x + 0.7879 * far.w, y: far.y + 0.0436 * far.h, w: 0.2181 * far.w, h: 0.8598 * far.h };
    var tvw = (tall ? 0.086 : 0.112) * far.w, tvh = tvw * 1093 / 1200;
    G.tv = { x: far.x + (tall ? 0.432 : 0.346) * far.w - tvw / 2, y: far.y + (tall ? 0.622 : 0.772) * far.h - tvh / 2, w: tvw, h: tvh };
    lay(pl.far, G.far, Math.min(1.9, Math.max(1, 2816 / far.w)));
    lay(pl.midl, G.midl, Math.min(2.6, Math.max(1, 800 / G.midl.w)));
    lay(pl.midr, G.midr, Math.min(2.6, Math.max(1, 460 / G.midr.w)));
    lay(pl.tv, G.tv, Math.min(4, 1200 / tvw));

    var A = 2560 / 1429;
    G.room = cover(A, 0.656, 0.62, tall ? 0.62 : 0.656, 0.62);
    G.rvx = G.room.x + 0.656 * G.room.w; G.rvy = G.room.y + 0.62 * G.room.h;
    lay(pl.room, G.room, 1.06);
    G.alcove = cover(A, 0.713, 0.66, tall ? 0.56 : 0.713, 0.66);
    lay(pl.alcove, G.alcove, Math.min(1.6, Math.max(1, 2560 / G.alcove.w)));
    // the alcove television's tube, in plate fractions (CSS places .tvset-alcove in % of the plate)
    var cs = getComputedStyle($('.tvset-alcove')), pw = G.alcove.w * G.alcove.L, ph = G.alcove.h * G.alcove.L;
    var tl = parseFloat(cs.left) / pw, tt = parseFloat(cs.top) / ph, tw = parseFloat(cs.width) / pw;
    var th = tw * G.alcove.w * (1093 / 1200) / G.alcove.h;
    G.avx = G.alcove.x + (tl + 0.354 * tw) * G.alcove.w; G.avy = G.alcove.y + (tt + 0.592 * th) * G.alcove.h;
    G.atl = tl; G.att = tt; G.atw = tw;
    // the painted face takes over where its glass is as wide as the little set's glass has grown
    var hole = narrow ? HOLE_TALL : HOLE_WIDE;
    G.hx = (hole.x + hole.w / 2) * W; G.hy = (hole.y + hole.h / 2) * H;
    G.send = hole.w * W / (0.4917 * tw * G.alcove.w);
    scene.face.style.transformOrigin = G.hx.toFixed(1) + 'px ' + G.hy.toFixed(1) + 'px';
    G.cinema = cover(A, 0.70, 0.40, tall ? 0.36 : 0.70, 0.40);
    G.cvx = G.cinema.x + 0.70 * G.cinema.w; G.cvy = G.cinema.y + 0.40 * G.cinema.h;
    lay(pl.cinema, G.cinema, 1.06);

    // shadow-play: each shadow on the shut screens stands exactly where its object stands in the room behind
    // (numbers are the objects' places in the plates and in the baked silhouettes, 900x760)
    G.panelW = pR.offsetWidth; var pLeft = W - G.panelW;
    // (one copy on each screen, so a shadow that straddles the post is whole)
    function sil(pair, k, ax, ay, sx, sy) { pair.forEach(function (el, i) { el.style.width = (900 * k).toFixed(1) + 'px'; el.style.left = (sx - ax * k - (i ? pLeft : 0)).toFixed(1) + 'px'; el.style.top = (sy - ay * k).toFixed(1) + 'px'; }); }
    sil(sils.amber, 0.0606 * G.room.w / 200, 250, 451, G.room.x + 0.657 * G.room.w, G.room.y + 0.643 * G.room.h);
    sil(sils.blue, tw * G.alcove.w / 470, 200, 760 - Math.round(470 * 1093 / 1200) - 96, G.alcove.x + tl * G.alcove.w, G.alcove.y + tt * G.alcove.h);
    sil(sils.pale, 0.269 * G.cinema.h / 372, 575, 598, G.cinema.x + 0.857 * G.cinema.w, G.cinema.y + 0.834 * G.cinema.h);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    last = {}; dirty = true;
  }

  /* ── small state setters that only touch the DOM on change ── */
  function on(el, key, v) { v = !!v; if (last[key] !== v) { last[key] = v; el.classList.toggle('on', v); } }
  function css(el, key, prop, v) { if (last[key] !== v) { last[key] = v; el.style[prop] = v; } }

  /* ── petals: seeded, a function of t ─────────────────────── */
  var seed = 20261112; function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  var petals = []; for (var i = 0; i < 26; i++) petals.push({ x: rnd(), y: rnd(), sp: 0.016 + 0.03 * rnd(), dr: 0.006 + 0.014 * rnd(), sw: 6 + 16 * rnd(), sf: 0.25 + 0.5 * rnd(), ph: rnd() * 6.283, sz: 3.6 + 4.4 * rnd(), rot: rnd() * 6.283, rs: (rnd() - 0.5) * 0.9, sh: rnd() });
  var petalMode = 0, petalAlpha = 0, petalsDrawn = false;
  function drawPetals(t) {
    ctx.clearRect(0, 0, W, H); petalsDrawn = false;
    if (!petalMode || petalAlpha <= 0.01) return;
    var up = petalMode === 2, n = W < 700 ? 14 : petals.length;
    for (var i = 0; i < n; i++) {
      var p = petals[i];
      var fy = (p.y + p.sp * t * (up ? -0.8 : 1)) % 1; if (fy < 0) fy += 1;
      var fx = (p.x + p.dr * t * (up ? -0.4 : 1)) % 1; if (fx < 0) fx += 1;
      var x = fx * (W + 60) - 30 + Math.sin(t * p.sf + p.ph) * p.sw, y = fy * (H + 60) - 30;
      var edge = Math.min(1, fy / 0.08, (1 - fy) / 0.08);
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot + t * p.rs * 0.6); ctx.globalAlpha = petalAlpha * (0.55 + 0.45 * p.sh) * edge;
      ctx.beginPath(); ctx.moveTo(-p.sz, 0); ctx.quadraticCurveTo(0, -p.sz * 0.78, p.sz, 0); ctx.quadraticCurveTo(0, p.sz * 0.62, -p.sz, 0); ctx.closePath();
      ctx.fillStyle = up ? '#f3e7cb' : (p.sh > 0.5 ? '#e7a9bd' : '#c98ba3'); ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = up ? 'rgba(20,10,10,.55)' : 'rgba(26,16,34,.55)'; ctx.stroke();
      ctx.restore();
    }
    petalsDrawn = true;
  }

  /* ── the frame: everything from y ────────────────────────── */
  function frame(y) {
    var sH = M.sH, rel = y - M.dial;
    var pushEnd = M.push + 1.0 * H;
    var inGarden = y < M.start - 0.05 * H;
    var inRoom = !inGarden && y < M.tv - 0.05 * H;
    var inCinema = y >= M.next - 0.05 * H;
    var afterRoom = !inGarden && !inRoom && !inCinema;
    // the push into the television: one exponential zoom, the alcove handing over to the painted face
    var p = afterRoom ? Q(ease(ramp(y, M.push - 0.12 * H, pushEnd))) : 0;
    var S = Math.exp(Math.log(G.send) * p), k = S / G.send, fo = afterRoom ? (W < 821 ? ramp(p, 0.6, 0.84) : ramp(p, 0.4, 0.68)) : 0;
    var inAlcove = afterRoom && p < 1, inFace = afterRoom && fo > 0;
    on(scene.garden, 'sg', inGarden); on(scene.room, 'sr', inRoom); on(scene.alcove, 'sa', inAlcove); on(scene.face, 'sf', inFace); on(scene.cinema, 'sc', inCinema);

    petalMode = 0;
    if (inGarden) {
      // the camera glides up the stepping stones: a dolly along z, so near things grow faster than far ones
      var g = Q(ease(ramp(y, 0.03 * H, M.start - 0.2 * H)));
      var dz = g * 7.6;
      var sF = 16.4 / (16.4 - dz), sM = 12.4 / (12.4 - dz), sT = 4.7 / Math.max(0.3, 4.7 - dz);
      var ax = (W * 0.5 - G.vx) * g, ay = (H * 0.5 - G.vy) * g;
      place(pl.far, G.far, sF, G.vx, G.vy, ax, ay);
      place(pl.midl, G.midl, sM, G.vx, G.vy, ax, ay);
      place(pl.midr, G.midr, sM, G.vx, G.vy, ax, ay);
      var tvIn = sT < 5;
      css(pl.tv, 'tvv', 'visibility', tvIn ? '' : 'hidden');
      if (tvIn) place(pl.tv, G.tv, sT, G.vx, G.vy, ax, ay);
      petalMode = 1; petalAlpha = 1 - ramp(g, 0.5, 0.9);
    } else if (inRoom) {
      place(pl.room, G.room, 1 + 0.06 * Q(ramp(y, M.start, M.tv)), G.rvx, G.rvy, 0, 0);
    } else if (inCinema) {
      place(pl.cinema, G.cinema, 1 + 0.06 * Q(ramp(y, M.next, M.max)), G.cvx, G.cvy, 0, 0);
    }
    if (inAlcove) {
      var a = ease(ramp(p, 0, 0.75));
      place(pl.alcove, G.alcove, S, G.avx, G.avy, (G.hx - G.avx) * a, (G.hy - G.avy) * a);
    }
    if (inFace) {
      var a2 = ease(ramp(p, 0, 0.75));
      // the face starts turned the way the little set is turned, and squares up as it takes the frame
      var tilt = 1 - ease(ramp(p, 0.42, 0.96));
      css(scene.face, 'ft', 'transform', p < 1 ? 'translate3d(' + ((G.avx - G.hx) * (1 - a2)).toFixed(2) + 'px,' + ((G.avy - G.hy) * (1 - a2)).toFixed(2) + 'px,0) scale(' + k.toFixed(5) + ') perspective(' + (2.2 * W).toFixed(0) + 'px) rotateY(' + (11 * tilt).toFixed(2) + 'deg) rotateX(' + (4 * tilt).toFixed(2) + 'deg)' : 'none');
      css(scene.face, 'fo', 'opacity', fo.toFixed(3));
      // while it grows the face is one flat picture: its moving parts get their own layers only once it has the frame
      if (last.pushing !== (p < 1)) { last.pushing = p < 1; scene.face.classList.toggle('pushing', p < 1); }
      // what the tube shows: the moon until the dial is reached, then one channel per step, then 20:00
      var step = rel < -0.02 * H ? -1 : clamp(Math.floor(rel / sH), 0, 5);
      var f = ease(tri(rel + 0.02 * H, 0.1 * H)), turns = 0;
      for (var b = 1; b <= 5; b++) {
        if (b < 5) f = Math.max(f, ease(tri(rel - b * sH, 0.09 * H)));
        turns += io(ramp(rel, b * sH - 0.11 * H, b * sH + 0.11 * H));
      }
      if (CALM) { f = 0; turns = Math.max(0, step); }
      var vm = CALM ? 0 : ease(tri(rel - 5 * sH, 0.15 * H));
      for (var e = 0; e < eps.length; e++) on(eps[e], 'ep' + e, +eps[e].getAttribute('data-ep') === step);
      // the camera glides: each picture is pushed a little while its channel is on
      if (step >= 0 && step < 5) css(eps[step + 1], 'eg' + step, 'transform', 'scale(' + (1 + 0.05 * Q(clamp((rel - step * sH) / sH))).toFixed(4) + ')');
      css(flash, 'fl', 'opacity', (f * 0.94).toFixed(3)); css(verm, 'vm', 'opacity', vm.toFixed(3));
      css(knob, 'kn', 'transform', 'rotate(' + (-36 + 36 * turns).toFixed(2) + 'deg)');
      if (step === 5) {
        css(turnImg, 'ts', 'transform', 'scale(' + (1 + 0.07 * Q(ramp(rel, 5 * sH, 5 * sH + 1.6 * H))).toFixed(4) + ')');
        petalMode = 2; petalAlpha = ramp(rel, 5 * sH + 0.05 * H, 5 * sH + 0.4 * H);
      }
    }

    // the channel card and the clock (the clock is read off the scroll, never off the wall)
    var st = clamp(Math.floor(rel / sH), 0, 5);
    for (var c = 0; c < chs.length; c++) on(chs[c], 'ch' + c, c === st);
    var secs = Math.floor(19 * 3600 + 40 * 60 + 300 * ramp(y, M.tv + 0.1 * H, M.dial) + 900 * ramp(y, M.dial, M.dial + 5 * sH));
    if (last.secs !== secs) {
      last.secs = secs;
      var mm = Math.floor(secs % 3600 / 60), ss = secs % 60;
      clockHM.textContent = Math.floor(secs / 3600) + ':' + (mm < 10 ? '0' : '') + mm; clockSS.textContent = ':' + (ss < 10 ? '0' : '') + ss;
    }
    var clockOn = y > M.tv + 0.4 * H && y < M.next - 0.86 * H;
    on(clock, 'ck', clockOn);
    var turning = rel >= 5 * sH && y < M.next - 0.05 * H;
    if (last.turn !== turning) { last.turn = turning; html.classList.toggle('turn', turning); }

    // the screens: shut on the room before, change it, open on the next
    var Ts = [[M.start, 'amber'], [M.tv, 'blue'], [M.next, 'pale']], v = null, o = 1;
    for (var n = 0; n < 3; n++) {
      var T = Ts[n][0];
      if (y > T - 0.88 * H && y < T + 0.78 * H) { v = Ts[n][1]; o = y < T ? 1 - Q(io(ramp(y, T - 0.86 * H, T - 0.14 * H))) : Q(io(ramp(y, T + 0.04 * H, T + 0.74 * H))); }
    }
    var showShoji = !!v && o < 0.999;
    on(shoji, 'sj', showShoji);
    if (showShoji) {
      if (last.sjv !== v) { last.sjv = v; shoji.setAttribute('data-v', v); }
      css(pL, 'pl', 'transform', 'translate3d(' + (-o * 100).toFixed(3) + '%,0,0)');
      css(pR, 'pr', 'transform', 'translate3d(' + (o * 100).toFixed(3) + '%,0,0)');
      // the shadow does not travel with the screen: it stays on its object and the sliding screen wipes it away
      css(sils[v][0], 'sl0' + v, 'transform', 'translate3d(' + (o * G.panelW).toFixed(2) + 'px,0,0)');
      css(sils[v][1], 'sl1' + v, 'transform', 'translate3d(' + (-o * G.panelW).toFixed(2) + 'px,0,0)');
    }
    // a chapter's word belongs to its room: it is not there until the screens have shut on the room before
    on(words[0], 'w0', y >= M.start - 0.1 * H); on(words[1], 'w1', y >= M.tv - 0.1 * H); on(words[2], 'w2', y >= M.next - 0.1 * H);

    // prints settle the last few pixels as they arrive
    for (var q = 0; q < figs.length; q++) {
      var top = M.figs[q];
      if (y > top - 1.2 * H && y < top + 1.2 * H) {
        var s = CALM ? 1 : ease(ramp(y, top - 1.02 * H, top - 0.6 * H));
        css(figs[q], 'fg' + q, 'transform', 'translate3d(0,' + ((1 - s) * 34).toFixed(2) + 'px,0) rotate(' + (REST[q] + (1 - s) * (q % 2 ? -1.1 : 1.1)).toFixed(3) + 'deg)');
      }
    }

    // the rail
    var cur = y < M.start - 0.05 * H ? -1 : y < M.tv - 0.05 * H ? 0 : y < M.next - 0.05 * H ? 1 : 2;
    if (last.cur !== cur) {
      last.cur = cur;
      railItems.forEach(function (li) { var is = +li.getAttribute('data-c') === cur; li.classList.toggle('cur', is); var a = $('a', li); if (is) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      if (cur >= 0) { $('.n', tab).textContent = CHAPTERS[cur][0]; $('.t', tab).textContent = CHAPTERS[cur][1]; }
    }
    on(rail, 'rl', y > M.start - 0.14 * H);     /* the rail arrives with the first room, when the screens are shut */ on(tab, 'tb', cur >= 0 && !(clockOn && W < 520));
  }

  /* ── the loop ────────────────────────────────────────────── */
  var t0 = performance.now();
  function tick(now) {
    var y = window.scrollY || window.pageYOffset || 0;
    var moved = y !== lastY || dirty;
    if (moved) { lastY = y; dirty = false; frame(y); }
    var t = FROZEN ? STILL_T : (now - t0) / 1000;
    if (petalMode && petalAlpha > 0.01) { if (!FROZEN || moved) drawPetals(t); }
    else if (petalsDrawn) drawPetals(t);
    requestAnimationFrame(tick);
  }

  /* ── one-time entrances, loops, links ─────────────────────── */
  function entrances() {
    if (FROZEN || !('IntersectionObserver' in window)) { hello.classList.add('out'); }
    else new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { hello.classList.add('out'); ob.disconnect(); } }); }, { threshold: 0.55 }).observe(hello);
    var vids = $$('video');
    if (!FROZEN && 'IntersectionObserver' in window) {
      var vo = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); }); }, { threshold: 0.35 });
      vids.forEach(function (v) { vo.observe(v); });
    }
  }
  function goTo(id, smooth) {
    var el = document.getElementById(id); if (!el) return false;
    var top = docTop(el) + ($('.opening', el) ? 0.8 * H : 0);
    window.scrollTo({ top: top, behavior: smooth && !FROZEN ? 'smooth' : 'auto' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (goTo(id, true)) { e.preventDefault(); var h = $('h2', document.getElementById(id)); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  });
  // a channel's link that takes focus brings its channel onto the screen
  $('#card').addEventListener('focusin', function (e) {
    var ch = e.target.closest('.ch'); if (!ch || ch.classList.contains('on')) return;
    window.scrollTo(0, M.dial + (+ch.getAttribute('data-step') + 0.5) * M.sH);
  });

  function start() {
    measure();
    if (!isNaN(yParam)) window.scrollTo(0, Math.round(clamp(yParam) * M.max));
    else if (location.hash) goTo(location.hash.slice(1), false);
    dirty = true; lastY = -1;
    frame(window.scrollY || 0); drawPetals(FROZEN ? STILL_T : 0);
    entrances();
    // decode the plates ahead of the scroll so a scene change never waits on a picture
    $$('#world img, #shoji img').forEach(function (im) { if (im.decode) im.decode().catch(function () {}); });
    html.setAttribute('data-ready', '1');
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  measure(); frame(window.scrollY || 0); requestAnimationFrame(tick);            // alive at once
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var loaded = new Promise(function (r) { if (document.readyState === 'complete') r(); else window.addEventListener('load', r); });
  Promise.all([fontsReady, loaded]).then(start);
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { measure(); }, 80); });
})();
