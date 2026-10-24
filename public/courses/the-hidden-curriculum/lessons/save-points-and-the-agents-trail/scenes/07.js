/* 07 — Footprints: the verb and the target.
   The map comes back as 05/06 left it (main with its stones, the merged side trail, the feature/contact and main
   signposts, the lantern on main); the valley and the ranger station fade out as the camera returns, and the right
   column (where the station stood) holds a drawn transcript of a made-up demo session, one source card under it at
   a time. The guide's footprints stamp along main, just under the path line so its dashes stay visible; each gains
   a verb pill under it and an arrow down to a named target (a row of target pills). At [[offmap]] the transcript
   gains a seventh line, 'push → claude/side-branch', and its print steps off the trail in terracotta: the print
   ringed, the line boxed, joined by a dashed arrow (its target is not on the map). At [[examples]] a card of real off-map cases (push / create /
   add, each dated) takes the card slot, with a dashed arrow from the ringed print to it. The walker sits in the
   sheet's empty top-left corner; its question flies to the guide and lands as an action stamp. Pointers sit in the
   sheet's lower band. Camera: from 06's station framing to the full map (world = screen). */
SCENE('07', (t, S) => {
  const C = K.C, L = M.L, id = M.ids(), Y = L.pathY;
  K.bg();

  // ---------------------------------------------------------------- times
  const tVerb = S.cue('verb', 5.7), tTarget = S.cue('target', 10.9), tAsk = S.cue('ask', 16.0);
  const tOff = S.cue('offmap', 23.2), tEx = S.cue('examples', 26.4), tQ = S.cue('question', 36.3), tTrail = S.cue('trail', 45.2);
  const f = (w, n, fb) => S.find(w, n, fb);
  const wFile = f('file', 0, tTarget + 1.1), wBranch = f('branch', 0, tTarget + 1.9), wRemote = f('remote', 0, tTarget + 2.8), wWeb = f('web', 0, tTarget + 3.7);
  const wSweep = f('accessing', 0, tAsk + 3.9);
  const wPush = f('push', 1, tEx + 0.2), wPublic = f('public', 0, wPush + 2.9), wRemote2 = f('remote', 1, wPublic + 2);
  const wAuto = f('auto', 0, wRemote2 + 1.6);
  const wReplied = f('replied', 0, tQ + 3.3), wKeeps = f('keeps', 0, tTrail + 1.8);
  const wL1 = f('lesson', 0, tTrail + 6.3), wL2 = f('lesson', 1, tTrail + 9.6), wL3 = f('lesson', 2, tTrail + 14.8);

  // ---------------------------------------------------------------- camera: back from the station onto the full map
  const VIEW = { x: 960, y: 540, z: 1 };
  const cam = K.cam(t, [{ at: -10, ...M.VIEW.station }, { at: 0.15, ...VIEW, d: 1.3 }]);
  const scr = (x, y) => M.toScreen(cam, x, y);

  // ---------------------------------------------------------------- the guide's footprints (world coords)
  // prints sit 28 px under the path line (the dashes stay visible), clear of the stone IDs; verb pills under them;
  // the named targets in a row below the verbs
  const PY = Y + 28, VY = Y + 96, TY = Y + 180;
  const steps = [
    { x: 390, px: 420, verb: 'read', tv: f('read', 0, tVerb + 1.0), tt: wFile, to: 455 },
    { x: 615, verb: 'write', tv: f('write', 0, tVerb + 1.7), tt: wFile + 0.15, to: 500 },
    { x: 728, verb: 'delete', tv: f('delete', 0, tVerb + 2.3), tt: wFile + 0.3, to: 648 },
    { x: 850, verb: 'commit', tv: f('commit', 0, tVerb + 3.0), tt: wBranch, to: 783 },
    { x: 1045, verb: 'push', tv: f('push', 0, tVerb + 3.6), tt: wRemote, to: 917 },
    { x: 1150, verb: 'fetch', tv: f('fetch', 0, tVerb + 4.2), tt: wWeb, to: 1085 },
  ];
  const tgt = ['index.html', 'index.html', 'old.txt', 'main', 'origin', 'example.com'];
  steps.forEach((s, i) => { s.tp = 0.9 + i * 0.3; s.target = tgt[i]; });   // they stamp one after another, like walking
  const targets = [
    { s: 'index.html', x: 478, at: wFile },
    { s: 'old.txt', x: 648, at: wFile + 0.3 },
    { s: 'main', x: 783, at: wBranch },
    { s: 'origin', x: 917, at: wRemote },
    { s: 'example.com', x: 1085, at: wWeb },
  ];
  // pills in a row never touch: push neighbours apart (12 px gaps), each kept as near its anchor as it can be
  const spread = (items, gap, lo, hi) => {
    for (let n = 0; n < 40; n++) for (let i = 1; i < items.length; i++) {
      const a = items[i - 1], b = items[i], ov = (a.w + b.w) / 2 + gap - (b.x - a.x);
      if (ov > 0) { a.x -= ov / 2; b.x += ov / 2; }
      if (items[0].x - items[0].w / 2 < lo) items[0].x = lo + items[0].w / 2;
      const z = items[items.length - 1]; if (z.x + z.w / 2 > hi) z.x = hi - z.w / 2;
    }
  };
  const vw26 = (s) => K.measure(s, { size: 26, font: 'ui', weight: 600 }) + 26 * 1.6;
  const mw26 = (s) => K.measure(s, { size: 26, font: 'mono', weight: 600 }) + 26 * 1.6;
  const vItems = steps.map((s) => ({ x: s.px || s.x, w: vw26(s.verb) }));
  spread(vItems, 12, (steps[0].px || steps[0].x) - vItems[0].w / 2, 1215);
  steps.forEach((s, i) => { s.px = vItems[i].x; });
  const tItems = targets.map((g) => ({ x: g.x, w: mw26(g.s) }));
  spread(tItems, 12, 380, 1215);
  targets.forEach((g, i) => { g.x = tItems[i].x; });
  const tOf = [[0, -26], [0, 26], [1, 0], [2, 0], [3, 0], [4, 0]];       // each step's target pill (and an offset on it)
  steps.forEach((s, i) => { s.to = targets[tOf[i][0]].x + tOf[i][1]; });
  // the step aimed at a target nobody named: it steps off the end of the trail, up and away from the path
  const OFF = { x: 1150, y: 492, ang: -0.55, verb: 'push', target: 'claude/side-branch', tp: tOff + 0.25, tv: tOff + 0.15, tt: tOff + 0.5 };
  // the question taken as an order: the walker's bubble flies to the guide and comes back as an action stamp
  const qUp = tQ + 0.3, qFly = tQ + 1.7, qLand = tQ + 3.1, stampX = 432, stampY = 462;
  const GUIDE = [252, 706];
  const WALK = [250, 330];                                   // the walker: in the sheet's empty top-left corner

  // ---------------------------------------------------------------- the walker's sight-line target (world)
  const P0 = [steps[0].x, PY], P5 = [steps[5].x, PY];
  const sweep = K.io(t, wSweep, 2.6, 'sine');
  const back0 = K.io(t, wSweep - 0.7, 0.7);                  // glance to the first print, then read along the trail
  const sightK = K.env(t, wSweep - 0.9, tOff - 0.2, 0.4);    // only while it reads the trail

  let st = null;
  // ---------------------------------------------------------------- the map (under the camera), as 05/06 left it
  K.withCam(cam, () => {
    M.sheet(t);
    M.mainPath();
    M.trail(L.side, { kind: 'side' });
    const [s1, s2, mx] = [L.stoneX[0], L.stoneX[1], L.mergeX], [c1, c2] = L.sideStones;
    M.back(s1, Y, s2, Y);
    M.back(s2, Y, c1[0], c1[1], { bend: 0 });
    M.back(c1[0], c1[1], c2[0], c2[1], { bend: 0 });
    M.back(s2, Y, mx, Y);
    M.back(c2[0], c2[1], mx, Y, { bend: -30 });
    M.stone(s1, Y, { id: id.home });
    M.stone(s2, Y, { id: id.about });
    M.stone(c1[0], c1[1], { id: id.contact, idSide: 'above' });
    M.stone(c2[0], c2[1]);
    // its ID sits down-left of the stone, so the parent arrow to the merge stone does not cross it
    M.label(id.phone, c2[0] - 52, c2[1] + 60, { ...M.T.mono, color: C.body });
    M.stone(mx, Y, { id: id.merge, glow: 0.36 * (1 - K.io(t, 0.3, 1.2)) });   // 06's glow settles
    M.signFor('feature/contact', c2[0], c2[1], { h: 96 });
    M.signFor('main', mx, Y, { lantern: 1, t });

    // the valley and the ranger station, as 06 left them, fade as the camera returns: the transcript takes their place
    const stA = 1 - K.io(t, 0.2, 0.9);
    if (stA > 0.002) K.layer(stA, () => {
      M.valley();
      st = M.station(t, { solid: 1, stones: [{ id: id.home }, { id: id.about }, { state: 'empty' }] });
      K.text('=', (L.valley.x0 + L.valley.x1) / 2, Y + 18, { font: 'ui', weight: 700, size: 72, color: C.head, align: 'center', alpha: 1 - K.io(t, 0.05, 0.5) });
    });

    // the six named steps: prints, verb pills under them, arrows down to the target row
    steps.forEach((s) => {
      M.prints(s.x, PY, { k: K.io(t, s.tp, 0.4, 'out'), s: 1.05 });
      const ak = K.io(t, s.tt, 0.55, 'out');
      if (ak > 0) K.arrow(s.px + (s.to - s.px) * 0.12, VY + 27, s.to, TY - 27, { k: ak, color: C.head, w: 2.5, headSize: 11, alpha: 0.85 });
    });
    steps.forEach((s) => {
      const vk = K.io(t, s.tv, 0.35, 'out');
      if (vk > 0) K.layer(vk, () => K.pill(s.verb, s.px, VY - (1 - vk) * 10, { size: 26, color: C.strong, stroke: C.line2 }));
    });
    targets.forEach((g) => {
      const k = K.io(t, g.at + 0.25, 0.35, 'out');
      if (k > 0) K.layer(k, () => K.pill(g.s, g.x, TY + (1 - k) * 8, { size: 26, font: 'mono', color: C.head, stroke: K.mixColor(C.line2, C.head, 0.4) }));
    });

    // the step off the trail: terracotta, ringed (it stays ringed to the end)
    M.prints(OFF.x, OFF.y, { k: K.io(t, OFF.tp, 0.4, 'out'), s: 1.05, color: C.accent, ang: OFF.ang });
    K.ring(OFF.x, OFF.y, 62, 44, K.io(t, OFF.tp + 0.35, 0.7, 'out'), { color: C.accent, w: 3 });

    // the action stamp: a question the agent took as permission
    const sk = K.io(t, qLand, 0.4, 'out') * (1 - K.io(t, tTrail + 0.1, 0.6));
    if (sk > 0) K.layer(Math.min(1, sk * 1.5), () => {
      M.prints(stampX, stampY, { k: sk, s: 1.05, color: C.accent, ang: -0.15 });
      K.pill('write → index.html', stampX, stampY - 60, { size: 26, color: C.accent, stroke: C.accent });
    });

    // the guide aims its pen at whatever it is doing; the walker reads
    const stamping = steps.findIndex((s) => t < s.tp + 0.4);
    let pen = null;
    if (t > steps[0].tp - 0.3 && t < steps[5].tp + 0.5) pen = [steps[Math.max(0, stamping)].x, PY];
    else if (t > OFF.tp - 0.4 && t < OFF.tp + 1.6) pen = [OFF.x, OFF.y];
    else if (t > qFly && t < tTrail) pen = [stampX, stampY];
    M.guide(t, GUIDE[0], GUIDE[1], { alpha: K.io(t, 0.3, 0.6), penTo: pen || undefined, scribble: t > qLand - 0.2 && t < qLand + 0.5 ? 1 : 0 });

    // the walker: 06 left it under the station's '?'; it fades there and comes back in the map's empty corner
    const oldA = 1 - K.io(t, 0.15, 0.55);
    if (oldA > 0.002 && st) M.walker(t, st.slots[2][0], st.y + st.h + 84, { alpha: oldA, look: st.slots[2], sightAlpha: 0.4 });
    const lx = K.lerp(K.lerp(P5[0], P0[0], back0), P5[0], sweep);
    M.walker(t, WALK[0], WALK[1], { alpha: K.io(t, 0.8, 0.6), look: sightK > 0.002 ? [lx, PY] : undefined, sightAlpha: 0.9 * sightK, sightK: 1 });
  });

  // ---------------------------------------------------------------- right column (screen coords), where the station stood
  const RX = 1240, RW = 590, WY0 = 140, WH = 360, SY = WY0 + WH + 16, CX = RX, CW = RW;
  const wk = K.io(t, 0.9, 0.6);
  const sz = 28, lh = 40;
  let line7 = null;
  if (wk > 0) {
    const WY = WY0 + (1 - K.ease.out(wk)) * 20;
    const focus = t > wKeeps;
    const r = K.win(RX, WY, RW, WH, { kind: 'terminal', title: '', titleSize: 26, alpha: wk, focus });
    K.layer(wk, () => {
      const swap = K.io(t, wKeeps, 0.5);
      const tt = { size: 26, color: C.body, weight: 600 };
      if (swap < 1) K.text('demo transcript (made up)', RX + 56, WY + 34, { ...tt, alpha: 1 - swap });
      if (swap > 0) {
        K.icon('file', RX + 72, WY + 25, 26, { color: C.head, alpha: swap, w: 2.2 });
        K.text('plain text · made up', RX + 96, WY + 34, { ...tt, color: C.strong, alpha: swap });
      }
      const x0 = r.x + 24, y0 = r.y + 14 + sz, vw = K.measure('delete ', { font: 'mono', size: sz });
      [...steps, { ...OFF, off: true }].forEach((s, i) => {
        if (t < s.tv) return;
        const y = y0 + i * lh;
        K.text(K.typed(s.verb, t, s.tv, 30), x0, y, { font: 'mono', size: sz, color: s.off ? C.accent : C.strong });
        if (t >= s.tt) K.text(K.typed('→ ' + s.target, t, s.tt, 34), x0 + vw, y, { font: 'mono', size: sz, color: s.off ? C.accent : C.head });
        if (s.off) {
          const w = vw + K.measure('→ ' + s.target, { font: 'mono', size: sz });
          // a rounded box inset inside the window: from its left padding to the end of the target
          const bx = r.x + 6, bw = x0 + w + 14 - bx;
          line7 = [bx, y - 9, bw];
          const hk = K.io(t, OFF.tt + 0.4, 0.5, 'out');
          if (hk > 0) K.card(bx, y - 30, bw, 42, { r: 14, fill: K.rgba(C.accent, 0.1), stroke: C.accent, lw: 3, shadow: false, alpha: hk });
        }
      });
    });
  }
  // the dashed arrow from the off-trail print to its line in the transcript: its target is not on the map
  {
    const ak = K.io(t, OFF.tt + 0.7, 0.7, 'out');
    if (ak > 0 && line7) {
      const [px, py] = scr(OFF.x + 40, OFF.y - 34);
      K.arrow(px, py, line7[0] - 6, line7[1] + 4, { k: ak, color: C.accent, w: 3, headSize: 12, bend: -18, dash: [8, 6] });
    }
  }

  // ---------------------------------------------------------------- the card slot under the transcript: one card at a time
  const card = (a, b, o) => { const k = K.env(t, a, b, 0.4); if (k > 0.002) K.layer(k, () => K.at(0, (1 - K.ease.out(K.io(t, a, 0.4))) * 12, 1, 0, () => M.dated(CX, SY, CW, { ...o, alpha: 1 }))); };
  card(tAsk + 0.3, tEx - 0.3, { eyebrow: 'Anthropic Help Center · Use Claude Cowork safely · read 2026-10-23', body: "Is Claude accessing files or websites you didn't mention?", quote: true, size: 28 });

  // [[examples]] real off-map steps, each dated: rows land on 'push', 'public', 'remote'
  const exA = tEx + 0.15, exB = wAuto - 0.45;
  const exK = K.env(t, exA, exB, 0.4);
  if (exK > 0.002) K.layer(exK, () => K.at(0, (1 - K.ease.out(K.io(t, exA, 0.4))) * 12, 1, 0, () => {
    K.card(CX, SY, CW, 384, { r: 24, stroke: C.accent, lw: 2 });
    K.text('steps aimed at targets nobody named', CX + 30, SY + 50, { font: 'ui', weight: 600, size: 26, color: C.accent });
    const rows = [
      { s: 'push → claude/side-branch', src: 'host deploys it · AO-043 · 2026-10-09', at: wPush - 0.1 },
      { s: 'create → public repository', src: 'PixelLeak · 2026-10-02', at: wPublic - 0.2 },
      { s: 'add → new remote', src: 'Anthropic · Choose a permission mode', at: wRemote2 - 0.2 },
    ];
    rows.forEach((rw, i) => {
      const k = K.io(t, rw.at, 0.4, 'out'); if (k <= 0) return;
      const y = SY + 112 + i * 96;
      K.layer(k, () => K.at((1 - K.ease.out(k)) * 12, 0, 1, 0, () => {
        M.pillL(rw.s, CX + 30, y, { size: 26, font: 'mono', weight: 400, color: C.accent, stroke: C.accent });
        K.text(rw.src, CX + 34, y + 46, { font: 'ui', weight: 400, size: 26, color: C.body });
      }));
    });
  }));
  // the dashed arrow from the ringed print to the card of real cases
  {
    const ak = K.io(t, tEx + 0.5, 0.6, 'out') * (1 - K.io(t, exB, 0.4));
    if (ak > 0) {
      const [px, py] = scr(OFF.x + 10, OFF.y + 48);
      K.layer(ak > 0 ? 1 - K.io(t, exB, 0.4) : 0, () => K.arrow(px, py, CX - 8, SY + 112, { k: K.io(t, tEx + 0.5, 0.6, 'out'), color: C.accent, w: 3, headSize: 12, bend: 18, dash: [8, 6] }));
    }
  }

  card(wAuto, tQ - 0.2, { eyebrow: 'auto mode blocks · Anthropic, Choose a permission mode', body: 'Changing where pushes go with git remote set-url or git remote add, unless you named the new remote', quote: true, footer: 'read 2026-10-23 · moves monthly', size: 26 });
  card(wReplied, tTrail - 0.4, { eyebrow: "an agent's reply, as a user quoted it · Cursor forum · 2026-08-16", body: 'I see now that “Can you change this?” is not permission.', quote: true, size: 28 });
  card(tTrail + 0.3, Infinity, { eyebrow: 'Anthropic · How Claude Code works', body: 'Your git state. Current branch, uncommitted changes, and recent commit history', quote: true, footer: 'read 2026-10-23 · moves monthly', size: 26 });

  // pointers: in the sheet's lower band, under the target row
  const pk = (a) => K.io(t, a - 0.1, 0.4);
  const ptr = (s, a, x, y) => { const k = pk(a); if (k > 0) K.layer(k, () => K.at((1 - K.ease.out(k)) * -12, 0, 1, 0, () => M.pointer('the lesson on ' + s, x, y))); };
  // two rows (10 px apart) between the target row and the sheet's inner frame
  const [px0, py0] = scr(330, TY + 60);
  const w1 = K.measure("→ the lesson on the agent's folder", { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
  ptr("the agent's folder", wL1, px0, py0);
  ptr('keys', wL2, px0 + w1 + 16, py0);
  ptr('getting from your laptop to a URL', wL3, px0, py0 + 26 * 1.9 + 10);

  // the walker's question: rises, flies to the guide, lands as the stamp
  const bk = K.io(t, qUp, 0.4, 'out');
  if (bk > 0 && t < qLand + 0.3) {
    const fly = K.io(t, qFly, qLand - qFly, 'io');
    const [ex, ey] = scr(stampX, stampY - 60);
    const [wx, wy] = scr(WALK[0] + 30, WALK[1] - 40);
    const sx = wx + 190, sy = wy - 80;
    const bx = K.lerp(sx, ex, fly), by = K.lerp(sy, ey, fly) - Math.sin(fly * Math.PI) * 60;
    const fade = 1 - K.io(t, qLand - 0.15, 0.4);
    K.layer(fade, () => K.at(bx, by, 1 - 0.12 * fly, 0, () => M.bubble('Can you change this?', 0, 0, { k: bk, tail: fly < 0.05 ? [wx - bx, wy - by] : null })));
  }
});
