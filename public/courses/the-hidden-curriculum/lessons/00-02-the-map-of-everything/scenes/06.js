/* 06 — The surprises you'll hit
   The road shrinks from 05's shelf layout to a "you are here" strip at the top. One surprise at a time
   in the centre panel (x 480–1440, y 380–820), each crossfading into the next; gold pins mark the stop
   each surprise belongs to, and the other stops dim. Ends on the strip enlarged slightly and the
   terracotta question "Which stop am I at?", the five stops pulsing once in sequence. */
SCENE('06', (t, S) => {
  K.bg();
  const C = K.C, P = M.palette;

  // ---- times (local)
  const cLocal = S.cue('localhost', 3.87);
  const cMachine = S.cue('my-machine', 11.96);
  const c401 = S.cue('four-oh-one', 22.1);
  const cWhich = S.cue('which-stop', 34.87);
  const tPhrases = S.find('phrases', 0, 0.4);
  const tThis = S.find('this', 0, cLocal + 1);
  const tRoom = S.find(/^room/, 0, cLocal + 5);
  const tNobody = S.find('nobody', 0, cLocal + 6);
  const tFiles = S.find(/^files/, 0, cMachine + 4);
  const tVersions = S.find(/^versions/, 0, cMachine + 5);
  const tSettings = S.find(/^settings/, 0, cMachine + 6);
  const tGap = S.find('gap', 0, cMachine + 7);
  const tUnauth = S.find(/^Unauthorized/, 0, c401 + 1.4);
  const tDoor = S.find('door', 0, c401 + 4.8);
  const tCode = S.find('code', 0, c401 + 8.6);
  const tTrust = S.find(/^Trust/, 0, c401 + 10.3);
  const tWhichQ = S.find('which', 0, cWhich + 2.3);

  // ---- the road: 05's shelf layout → strip (during the opening line) → strip, slightly larger (which-stop)
  const STRIP = M.geom('strip');
  const BIG = M.geom('strip', { y: 250, w: 240, h: 124, icon: 46, label: 28 });
  let gm = M.lerpGeom('shelf', STRIP, K.io(t, 0.3, 0.8));
  gm = M.lerpGeom(gm, BIG, K.io(t, cWhich + 0.2, M.motion.move));

  // focus per surprise: the stops it belongs to stay full, the others dim
  const focusSets = [[cLocal, [0]], [cMachine, [0, 3]], [c401, [3]], [cWhich, [0, 1, 2, 3, 4]]];
  const focus = (i) => {
    let v = 1;
    focusSets.forEach(([c, set]) => (v = K.lerp(v, set.includes(i) ? 1 : 0.4, K.io(t, c - 0.2, 0.6))));
    return v;
  };
  // localhost: "nobody else can reach it yet" — the road out of the room goes quiet
  const roomQuiet = K.io(t, tNobody, 0.6) * (1 - K.io(t, cMachine - 0.2, 0.6));
  const pulseTimes = {
    0: [cLocal + 0.3, cMachine + 0.3],
    3: [cMachine + 0.55, c401 + 0.3, tTrust + 0.2],
  };
  // [[which-stop]] on "which", the five stops warm once in sequence (staggered .25 s) — the question
  // applies to every stop; no ring, so no frame ever shows a marker between two stops
  const seqAt = (i) => tWhichQ + i * 0.22;
  const pulse = (i) => {
    let p = 0;
    (pulseTimes[i] || []).forEach((a) => (p = Math.max(p, 0.7 * M.bump(t, a))));
    p = Math.max(p, M.bump(t, seqAt(i), 0.8));
    return p;
  };
  M.road(t, {
    geom: gm, lit: 1, pulse,
    arrowAlpha: (i) => Math.min(focus(i), focus(i + 1)) * (1 - 0.6 * roomQuiet),
    iconDx: (i) => (i === 2 ? K.wave(t, 1.2, 3) : 0),
  });
  const cardAt = (i) => gm.cards[i];
  // dim the stops a surprise doesn't belong to with a night veil over the (opaque) card, so the lane's
  // dashed centre line never shows through a half-transparent tile
  gm.cards.forEach((c, i) => {
    const v = 1 - focus(i);
    if (v > 0.002) K.card(c.l - 3, c.t - 3, c.w + 6, c.h + 6, { r: Math.min(26, c.h * 0.24), fill: C.page, stroke: false, shadow: false, alpha: 0.75 * v / 0.6 });
  });

  // ---- pins: stop 1 (localhost → my-machine), stop 4 (my-machine → 401); both lift away at which-stop
  const pinOut = (a) => 1 - K.io(t, a, 0.5);
  const pinAt = (i, at, out) => {
    const c = cardAt(i);
    M.pin(t, at, c.x, c.t + 6, { s: 40, alpha: pinOut(out) });
  };
  pinAt(0, cLocal + 0.1, c401 - 0.2);
  pinAt(3, cMachine + 0.35, cWhich - 0.1);

  // panel envelope: in at a, out (crossfade .4) at b
  const panel = (a, b) => Math.min(K.io(t, a, 0.4), 1 - K.io(t, b - 0.2, 0.4));

  // ---- intro: the three phrases, previewed
  const aIntro = 1 - K.io(t, cLocal - 0.3, 0.4);
  if (aIntro > 0) {
    const ph = [
      { s: 'localhost', font: 'mono', color: C.strong },
      { s: 'It works on my machine', font: 'read', italic: true, color: C.strong },
      { s: '401 Unauthorized', font: 'mono', color: C.accent },
    ];
    ph.forEach((p, j) => {
      const k = K.stagger(t, tPhrases + 0.1, j, 0.45, 0.6);
      K.layer(aIntro * k, () => {
        const y = 500 + j * 110 + (1 - k) * 18;
        const w = K.measure(p.s, { font: p.font, size: 34, weight: p.font === 'mono' ? 600 : 400, italic: p.italic }) + 64;
        K.card(960 - w / 2, y - 36, w, 72, { r: 36, fill: C.tile, stroke: C.line2, shadow: false });
        K.text(p.s, 960, y + 12, { font: p.font, size: 34, weight: p.font === 'mono' ? 600 : 400, italic: p.italic, color: p.color, align: 'center' });
      });
    });
  }

  // ---- 1. localhost: a browser on your own computer
  const a1 = panel(cLocal, cMachine);
  if (a1 > 0) K.layer(a1, () => {
    const r = K.win(510, 400, 900, 300, { kind: 'browser', title: 'browser', shadow: false });
    // address bar
    K.card(r.x + 28, r.y + 22, r.w - 56, 58, { r: 29, fill: C.page, stroke: C.line2, shadow: false });
    const url = 'localhost:3000', t0 = cLocal + 0.25;
    const typed = K.typed(url, t, t0, 16);
    const ux = r.x + 60, uy = r.y + 62;
    const uw = K.text(typed, ux, uy, { font: 'mono', size: 30, weight: 600, color: C.strong });
    if (!K.typedDone(url, t, t0, 16) && K.caretOn(t)) { const g = K.ctx(); g.save(); g.fillStyle = C.strong; g.fillRect(ux + uw + 3, uy - 26, 3, 32); g.restore(); }
    // page body
    const tBody = t0 + url.length / 16 + 0.25;
    K.layer(K.io(t, tBody, 0.5), () =>
      K.text('Hello from your own computer', 960, r.y + 180, { font: 'read', size: 36, color: C.body, align: 'center' }));
    // the meaning, under the window
    K.layer(K.io(t, tThis, 0.5), () =>
      K.spans([
        { s: 'localhost', font: 'mono', color: C.head, weight: 600 },
        { s: '  =  this computer', font: 'ui', color: C.body, weight: 400 },
      ], 960, 790, { align: 'center', size: 32 }));
  });
  // a loop under card 1: the request goes out and comes straight back in, never leaving the room
  const loopK = K.io(t, tRoom - 0.1, 0.8) * (1 - K.io(t, cMachine - 0.2, 0.4));
  if (loopK > 0) {
    const c = cardAt(0);
    K.arrow(c.x - 52, c.b + 10, c.x + 52, c.b + 10, { bend: 58, k: K.io(t, tRoom - 0.1, 0.8), color: C.head, w: 3, headSize: 13, alpha: 1 - K.io(t, cMachine - 0.2, 0.4) });
  }

  // ---- 2. "It works on my machine": two computers, same command, different result
  const a2 = panel(cMachine, c401);
  if (a2 > 0) K.layer(a2, () => {
    K.text('“It works on my machine”', 960, 410, { font: 'read', size: 36, italic: true, color: C.strong, align: 'center' });
    const t0 = cMachine + 0.5;
    const rl = K.win(500, 450, 420, 220, { kind: 'terminal', title: 'your computer', shadow: false });
    K.term(rl, t, [{ at: t0, cmd: 'python app.py', cps: 22 }, { at: t0 + 0.9, out: '✓ tests passed', color: C.head }], { prompt: '$ ', size: 26 });
    const rs = K.win(1000, 450, 420, 220, { kind: 'terminal', title: 'their computer', shadow: false });
    K.term(rs, t, [{ at: t0 + 0.3, cmd: 'python app.py', cps: 22 }, { at: t0 + 1.4, out: 'Error: file not found', color: C.accent }], { prompt: '$ ', size: 26 });
    // tie the second computer to stop 4 without saying "server" out loud: the stop's own detail line
    K.layer(K.io(t, t0 + 0.3, 0.5), () =>
      K.text('someone else’s computer (a server)', rs.x + rs.w / 2, 708, { font: 'ui', size: 26, color: C.soft, align: 'center' }));
    // the gap between them
    const gk = K.io(t, cMachine + 1.6, 0.5);
    K.text('≠', 960, 584, { font: 'ui', size: 48, weight: 700, color: C.head, align: 'center', alpha: gk });
    if (gk > 0) K.glow(960, 568, 70, C.head, 0.22 * M.bump(t, tGap, 1.2));
    // what differs, one word at a time as it is said
    const diffs = [['files', tFiles], ['versions', tVersions], ['settings', tSettings]];
    const pw = diffs.map(([s]) => K.measure('different ' + s, { font: 'ui', size: 26, weight: 600 }) + 26 * 1.6);
    const gapX = 28, total = pw.reduce((a, b) => a + b, 0) + gapX * 2;
    let px = 960 - total / 2;
    diffs.forEach(([s, at], j) => {
      const k = K.io(t, at, 0.5), cx = px + pw[j] / 2;
      px += pw[j] + gapX;
      K.layer(k, () => K.pill('different ' + s, cx, 760 + (1 - k) * 14, { size: 26, color: C.body }));
    });
  });

  // ---- 3. 401 Unauthorized: you reached the service, the door refused the key
  const a3 = panel(c401, cWhich);
  if (a3 > 0) K.layer(a3, () => {
    K.card(560, 420, 800, 300, { r: 24, fill: C.tile, shadow: false });
    K.text('401', 960, 515, { font: 'mono', size: 64, weight: 700, color: C.accent, align: 'center' });
    K.layer(K.io(t, tUnauth - 0.1, 0.5), () =>
      K.text('Unauthorized', 960, 572, { font: 'mono', size: 40, weight: 600, color: C.accent, align: 'center' }));
    // the door's verdict: a key it won't accept, or none
    const dk = K.io(t, tDoor, 0.5);
    K.layer(dk, () => {
      K.line(640, 612, 1280, 612, { color: C.line2, w: 1.5, alpha: 0.8 });
      const s = 'no key, or one it won’t accept';
      const w = K.measure(s, { font: 'ui', size: 30 });
      const x0 = 960 - (w + 54) / 2;
      K.icon('lock', x0 + 18, 660, 40, { color: C.head });
      K.text(s, x0 + 54, 670, { font: 'ui', size: 30, color: C.strong });
    });
    // your code may be fine
    K.layer(K.io(t, tCode, 0.5), () =>
      K.text('your code may be fine', 960, 790, { font: 'ui', size: 30, color: C.soft, align: 'center' }));
  });
  // the district's name settles under stop 4 on "Trust", and leaves with the panel
  const trK = K.io(t, tTrust, 0.5) * (1 - K.io(t, cWhich - 0.2, 0.4));
  if (trK > 0) {
    const c = cardAt(3);
    K.pill('Trust', c.x, c.b + 46 + (1 - K.io(t, tTrust, 0.5)) * 14, { size: 28, color: C.head, stroke: K.rgba(C.head, 0.6), alpha: trK });
  }

  // ---- 4. the one question: "ask one question first" (eyebrow), then the question itself, large
  const ek = K.io(t, cWhich + 0.05, 0.6);
  if (ek > 0) K.eyebrow('Ask one question first', 960, 515 + (1 - ek) * 12, { align: 'center', color: C.soft, size: 24, alpha: ek });
  const qk = K.io(t, tWhichQ - 0.1, 0.6);
  if (qk > 0) {
    K.glow(960, 600, 420, C.accent, 0.12 * qk);
    K.text('Which stop am I at?', 960, 628 + (1 - qk) * 18, { font: 'head', size: 62, weight: 700, color: C.accent, align: 'center', alpha: qk });
    // a short underline draws once the question has been asked
    const w = K.measure('Which stop am I at?', { font: 'head', size: 62, weight: 700 });
    const uk = K.io(t, tWhichQ + 0.6, 0.5);
    if (uk > 0.01) K.line(960 - w / 2, 668, 960 - w / 2 + w * uk, 668, { color: K.rgba(C.accent, 0.55), w: 2.5 });
  }
});
