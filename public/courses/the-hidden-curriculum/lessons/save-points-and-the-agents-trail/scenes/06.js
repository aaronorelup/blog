/* 06 — The ranger station: a copy that lives elsewhere.
   The camera pans right onto the valley and the station (the remote). git vs GitHub; the burnt second map with no
   station (Cursor forum, 2026-10-03 to 10-05); the real copy-elsewhere capture (no remote, then a push, then
   "ahead by 1 commit"); the cloud clones the station's copy (S129); where the picture breaks: every copy is full
   and equal. The station holds a scaled replica of the whole graph (main, the side trail, the merge stone); the
   merge stone's place is a '?' from "ahead by one" until "so push first", when it arrives. Exit: both maps solid and
   equal, the camera on M.VIEW.station (07's opening view), the closing words faded before the hand-over. */
SCENE('06', (t, S) => {
  const C = K.C, L = M.L, V = M.VIEW, Y = L.pathY, P_FILL = M.P.stationFill;
  K.bg();

  // ---------------------------------------------------------------- times
  const tStation = S.cue('station', 0), tNot = S.cue('notgithub', 5.8), tBurn = S.cue('burn', 13.6);
  const E = S.cue('empty', 30.8), A = S.cue('ahead', 34.3), tCloud = S.cue('cloud', 42.5), tBreaks = S.cue('breaks', 52.2);
  const tDelete = S.find('delete', 0, tBurn + 2.5), tReply = S.find('reply', 0, tBurn + 7.3), tCopies = S.find('copies', 0, E - 1.4);
  const tExists = S.find('exists', 0, A + 6), tAheadW = S.find(/ahead/, 0, A + 3.8);
  const tLaptop = S.find('laptop', 0, tCloud + 4.4), tFull = S.find('full', 0, tBreaks + 3);
  const tPush = S.find('push', 1, tCloud + 14.2, { whole: true });   // "so push first": the merge stone reaches the station
  const tOut = S.out;

  // ---------------------------------------------------------------- the capture's clock (all from K.termTimes)
  const TO = { cps: 40, think: 0.2, gap: 0.3, speed: 2, maxWait: 0.5, start: 0.4 };
  const sch = K.termTimes('copy-elsewhere', TO), it = sch.items;
  const ok = it.length >= 13;
  // lesson time -> capture time: piecewise linear and monotone (a replay with its quiet stretches held and the
  // set-up commands between the two beats run faster), so every line still appears in its real order
  let knots = [[0, 0], [1, 0]];
  if (ok) {
    const c0 = it[4].start - 0.2, c1 = it[4].done + 0.2;
    const t1 = E + (c1 - c0);
    const tB0 = Math.max(t1 + 0.5, A - 1.6);
    const cB1 = it[11].out[Math.min(1, it[11].out.length - 1)].at + 0.05, tB1 = Math.max(tB0 + 2, tAheadW - 0.15);
    const cC = it[12].done + 1.2, tC = tB1 + (cC - cB1) / 1.3;
    knots = [[E, c0], [t1, c1], [tB0, c1], [tB1, cB1], [tC, cC]];
  }
  const warp = (x) => {
    if (x <= knots[0][0]) return knots[0][1];
    for (let i = 1; i < knots.length; i++) {
      const [ta, ca] = knots[i - 1], [tb, cb] = knots[i];
      if (x <= tb) return tb > ta ? K.lerp(ca, cb, (x - ta) / (tb - ta)) : cb;
    }
    return knots[knots.length - 1][1];
  };
  const tTermEnd = ok ? knots[4][0] : A + 5;
  const tClose = Math.max(tTermEnd + 0.2, tExists - 0.15);      // the window closes as "exists only on this machine" is said
  const tQ = tClose + 0.35;                                     // the '?' slot and the glow land as the window clears

  // ---------------------------------------------------------------- camera: full view -> the station (+100);
  // while the terminal is up the map steps back to the left half (M.VIEW.left, as in 04/05) so the signposts and
  // the lantern stay in view beside the window; it returns to the station as the window closes
  // Framing (worked around here, not in 00-shared): the shared VIEW.station (x 1060) and VIEW.left leave the sheet's
  // left edge ~15 px from the frame. These local views put the sheet's left edge (world x 120) at screen x 80, the
  // same gutter as the kicker. Math.min keeps them in step if the shared VIEW is fixed later (x <= 1000).
  const VS = { ...V.station, x: Math.min(V.station.x, 1000) };
  // left: z .8 so the map content (world 120-1070) spans screen 80-840 and clears the terminal at x 980
  const VL = { x: 120 + 880 / 0.8, y: 480, z: 0.8 };
  const cam = K.cam(t, [
    { at: -10, ...V.full }, { at: tStation + 0.15, ...VS, d: 1.0 },
    { at: E - 0.9, ...VL, d: 0.8 }, { at: tClose - 0.1, ...VS, d: 0.9 },
    // hand-over: 07 opens on M.VIEW.station, so the cross-dissolve shows one map, not two offset copies
    { at: tOut - 1.5, ...V.station, d: 0.9 },
  ]);
  const id = M.ids();

  // ---------------------------------------------------------------- envelopes
  const kValley = K.io(t, tStation + 0.2, 0.9, 'out');
  const kStation = K.seg(t, tStation + 0.5, tStation + 2.6);
  const kGitLbl = K.env(t, tNot + 2.0, tBurn - 0.3, 0.5);
  const kHubLbl = K.env(t, tNot + 4.9, E - 0.4, 0.5);
  const kMit = K.env(t, tNot + 0.3, tBurn - 0.3, 0.5);
  const kMini = K.env(t, tBurn + 0.2, E - 0.5, 0.5);
  const kCurl = K.io(t, tDelete, 2.6, 'io');
  const kForum = K.env(t, tReply - 0.4, E - 0.5, 0.5);
  const kNoCopy = K.env(t, tCopies - 0.1, E - 0.5, 0.45);
  const kTerm = Math.min(K.io(t, E, 0.5, 'out'), 1 - K.io(t, tClose, 0.5, 'in'));
  const kQ = K.io(t, tQ, 0.6, 'out');
  const glowQ = kQ * (0.55 + 0.45 * (1 - K.io(t, tQ + 0.6, 1.4, 'sine'))) * (1 - K.io(t, tPush + 0.4, 0.8));
  const kOnly = K.env(t, tQ + 0.15, tCloud - 0.2, 0.5);
  const kCloud = K.env(t, tCloud + 0.1, tBreaks - 0.3, 0.6);
  const kCloudArrow = K.io(t, tCloud + 0.6, 0.8, 'io') * (1 - K.io(t, tBreaks - 0.3, 0.6, 'in'));
  const kS129 = K.env(t, tCloud + 0.9, tBreaks - 0.3, 0.5);
  const kPointer = K.env(t, S.find('lesson', 0, tCloud + 6.9) - 0.1, tBreaks - 0.3, 0.5);
  const kEnd = 1 - K.io(t, tOut - 1.1, 0.5, 'in');    // '=' and the closing words are gone by S.out - 0.6
  const kBreak = K.io(t, tBreaks + 0.1, 0.6, 'out') * kEnd;
  const kSolid = K.io(t, tBreaks + 0.1, 0.9, 'io');   // solid from [[breaks]]: the copy is not a ghost
  const kArrive = K.io(t, tPush - 0.1, 0.7, 'out');   // the merge stone reaches the station ('?' -> copy)
  const kEq = K.io(t, tFull + 0.5, 0.6, 'out') * kEnd;
  const kBreakText = K.io(t, tFull - 0.3, 0.7, 'out') * kEnd;
  const walkLook = K.io(t, tQ, 0.6);
  const kUnder = K.clamp(1 - kTerm * 1.8);
  // the station's copies: gone while 'asking for remotes prints nothing', back once the capture has pushed
  const kCopies = K.clamp(1 - K.io(t, E - 0.2, 0.4) + K.io(t, tClose, 0.6));
  const idA = 1 - 0.7 * kTerm;   // the map's IDs step back while the (separate) demo folder's capture is up
  const mapA = 1 - 0.7 * kTerm;  // the whole map dims to .3 under the capture: its IDs are not this repo's

  // ---------------------------------------------------------------- the map and the station (world space)
  K.withCam(cam, () => {
    const ts = M.ts(cam);
    M.sheet(t, { ts });
    const [s1, s2, mx] = [L.stoneX[0], L.stoneX[1], L.mergeX], [c1, c2] = L.sideStones;
    K.layer(mapA, () => {   // the map's own ink (not the sheet) dims to .3 under the capture
    M.mainPath();
    M.trail(L.side, { kind: 'side' });
    M.back(s1, Y, s2, Y);
    M.back(s2, Y, c1[0], c1[1], { bend: 0 });
    M.back(c1[0], c1[1], c2[0], c2[1], { bend: 0 });
    M.back(s2, Y, mx, Y);
    M.back(c2[0], c2[1], mx, Y, { bend: -30 });
    M.stone(s1, Y, { id: id.home, ts, idAlpha: idA });
    M.stone(s2, Y, { id: id.about, ts, idAlpha: idA });
    M.stone(c1[0], c1[1], { id: id.contact, ts, idSide: 'above', idAlpha: idA });
    M.stone(c2[0], c2[1], { id: id.phone, ts, idAlpha: idA });
    // the newest stone: it is not at the station yet, so it glows while the '?' does
    M.stone(mx, Y, { id: id.merge, ts, glow: glowQ, idAlpha: idA });
    M.signFor('feature/contact', c2[0], c2[1], { ts, h: 96 });
    M.signFor('main', mx, Y, { ts, lantern: 1, t });
    if (kOnly > 0) M.label('only on this machine', mx, Y + 104, { color: C.head, alpha: kOnly, ts });
    });

    // the valley and the ranger station across it
    M.valley({ k: kValley, alpha: mapA });
    // The station holds a scaled replica of the SAME graph as the map: main (home, about, merge) and the side trail
    // (contact, phone), IDs on the same sides. Worked around here, not in 00-shared: M.station only lays its stones
    // in one straight row, so it is called with no stones (its straight dashed trail is the replica's main line) and
    // the replica is drawn below. Wider than L.station (only here) so neighbouring IDs do not touch.
    const kp = K.clamp((kStation - 0.55) / 0.45);
    const st = M.station(t, {
      x: L.station.x - 40, w: L.station.w + 100,
      k: kStation, ts, solid: kSolid, alpha: kUnder * (0.3 + 0.7 * mapA), stones: [],
    });
    // map -> station: home..about gets 125 px (their two IDs, both below, must not touch), about..merge is scaled
    // into the rest; heights use the same scale as about..merge
    const SM = 66, x0 = st.x + SM, gHA = 125, sc = (st.w - 2 * SM - gHA) / (mx - s2);
    const rp = (x, y) => [x <= s2 ? x0 + (x - s1) * gHA / (s2 - s1) : x0 + gHA + (x - s2) * sc, st.pathY + (y - Y) * sc];
    const [qx, qy] = rp(mx, Y);
    if (kp > 0 && kUnder > 0.002) K.layer(kUnder * (0.3 + 0.7 * mapA), () => {
      const side = L.side.map(([x, y]) => rp(x, y));
      M.trail(side, { kind: 'copy', k: kp, alpha: 1 - kSolid, w: 3 });
      if (kSolid > 0) M.trail(side, { kind: 'side', k: kp, alpha: kSolid, w: 3 });
      const sk = (i) => Math.min(kp, kCopies, K.io(t, tStation + 1.6 + 0.12 * i, 0.5));
      const copyStone = (x, y, o) => {          // a dashed copy that turns solid at [[breaks]]
        const [px, py] = rp(x, y), base = { r: 20, ts, bg: P_FILL, ...o };
        if (kSolid < 1) M.stone(px, py, { ...base, state: 'copy', alpha: 1 - kSolid });
        if (kSolid > 0) M.stone(px, py, { ...base, state: 'solid', alpha: kSolid });
      };
      copyStone(s1, Y, { id: id.home, k: sk(0) });
      copyStone(s2, Y, { id: id.about, k: sk(1) });
      copyStone(c1[0], c1[1], { id: id.contact, k: sk(2), idSide: 'above' });
      copyStone(c2[0], c2[1], { id: id.phone, k: sk(3) });
      // the merge stone's place: a '?' from "ahead by one" until "so push first", then the stone arrives
      if (kQ * (1 - kArrive) > 0.002) M.stone(qx, qy, { state: 'empty', r: 20, k: kQ, alpha: 1 - kArrive, glow: glowQ, ts, bg: P_FILL });
      if (kArrive > 0) copyStone(mx, Y, { id: id.merge, k: kArrive, glow: (1 - kArrive) * 0.8 + 0.6 * (1 - K.io(t, tPush + 0.6, 1.0)) });
    });

    // labels: git is the map in your folder, GitHub one place to keep a copy
    if (kGitLbl > 0) M.label('git: stones and signposts, in your folder', 560, 262, { size: 30, color: C.head, alpha: kGitLbl, ts });
    if (kHubLbl > 0) K.layer(kHubLbl, () => {   // under the replica's IDs, inside the card
      M.label('GitHub: one place', st.x + st.w / 2, st.y + st.h - 62, { size: 28, color: C.strong });
      M.label('to keep a copy', st.x + st.w / 2, st.y + st.h - 26, { size: 28, color: C.strong });
    });

    // where the picture breaks: the two maps are equal
    if (kEq > 0) K.layer(kEq, () => {
      const vx = (L.valley.x0 + L.valley.x1) / 2;
      K.glow(vx, Y - 10, 70, C.head, 0.25 * kEq);
      K.text('=', vx, Y + 18, { font: 'ui', weight: 700, size: 72, color: C.head, align: 'center' });
    });

    // the walker reads the station; at "only on this machine" the sight-line lands on the '?'
    const slotQ = [qx, qy];
    M.walker(t, qx - 40, st.y + st.h + 84, {   // under the '?' slot, clear of the card's bottom edge
      alpha: K.io(t, tStation + 1.2, 0.6) * kUnder * kEnd,
      look: walkLook > 0 ? slotQ : [slotQ[0] - 40, st.pathY + 60],
      sightK: K.io(t, tStation + 2.2, 0.8), sightAlpha: 0.4 + 0.5 * walkLook * (1 - K.io(t, tCloud, 0.6)),
    });
  });

  // ---------------------------------------------------------------- screen-space overlays
  // [[notgithub]] MIT card (lower left, over the empty part of the sheet)
  if (kMit > 0) M.dated(140, 668, 700, { eyebrow: 'MIT Missing Semester 2026 · Version Control and Git', body: 'Git is not GitHub', quote: true, alpha: kMit });

  // [[burn]] a second map with no station: its corner curls, it greys out, its .git goes with it
  if (kMini > 0) K.layer(kMini, () => {
    // the delete: the map curls, shrinks and fades to a dashed outline; its '.git' stays, struck through
    const mx0 = 196, my0 = 640, mw = 440, mh = 190, sh = 1 - 0.18 * kCurl;
    const g = K.ctx();
    if (kCurl > 0) {   // the outline of where the map was
      g.save(); g.globalAlpha *= kCurl; g.setLineDash([10, 8]); g.lineWidth = 2; g.strokeStyle = C.accent;
      g.beginPath(); g.roundRect(mx0, my0, mw, mh, 8); g.stroke(); g.restore();
    }
    M.miniMap(t, mx0 + mw * (1 - sh) / 2, my0 + mh * (1 - sh) / 2, mw * sh, mh * sh, { k: K.io(t, tBurn + 0.2, 0.6, 'out'), curl: kCurl, grey: kCurl, rot: -0.02, alpha: 1 - 0.8 * kCurl });
    const gx = mx0 + 150, gy = my0 + 66;   // the sheet's empty top-left, clear of its path and stones
    const gw = K.text('.git', gx, gy, { font: 'mono', weight: 600, size: 36, color: K.mixColor(C.body, C.accent, kCurl), align: 'center' });
    if (kCurl > 0) K.line(gx - gw / 2 - 8, gy - 9, gx - gw / 2 - 8 + (gw + 16) * K.clamp((kCurl - 0.3) / 0.5), gy - 9, { color: C.accent, w: 4 });
    if (kNoCopy > 0) K.layer(kNoCopy, () => K.pill('no station, no copy', mx0 + mw / 2, 884, { size: 28, color: C.accent, stroke: C.accent, fill: C.tile }));
  });
  if (kForum > 0) M.dated(660, 645, 600, {
    eyebrow: 'Cursor forum · shuang_yang and replies · 2026-10-03 to 10-05',
    body: 'step 1: stop writing to the drive · step 2: if it was ever pushed anywhere, clone it back',
    alpha: kForum,
  });

  // [[empty]] .. [[ahead]] the real capture, in the terminal over the station
  if (kTerm > 0.002) {
    const r = M.term({ k: kTerm, title: 'Git Bash · notes-site · a second demo folder' });
    const ct = warp(t);
    const marks = ok ? [
      { at: it[4].done + 0.05, until: warp(A + 0.6), match: 'git remote -v', text: 'no copy elsewhere' },
      // label above the boxed line (side 'above'): below it would cover the real '(use "git push" ...)' hint
      { at: it[11].out[Math.min(1, it[11].out.length - 1)].at + 0.05, until: 1e9, match: "ahead of 'origin/main' by 1 commit", text: 'only on this machine', side: 'above' },
      { at: it[12].out[it[12].out.length - 1].at + 0.05, until: 1e9, match: '(push)', text: 'now there is one' },
    ] : [];
    K.termReplay(r, ct, 'copy-elsewhere', { ...TO, size: 26, pad: 26, alpha: kTerm, marks });
    M.chip('a local folder standing in for GitHub', L.term.x, L.term.y + L.term.h + 34, { alpha: kTerm });
  }

  // [[cloud]] a cloud session clones the station's copy, not your laptop
  const [sx0, sy0] = M.toScreen(cam, L.station.x, L.station.y);     // the station card's top-left on screen
  const cloudP = [sx0 - 110, 190];
  if (kCloud > 0) K.layer(kCloud, () => {
    K.glow(cloudP[0], cloudP[1], 90, C.head, 0.12);
    K.icon('cloud', cloudP[0], cloudP[1], 76, { color: C.head, w: 2.6 });
    K.text('cloud session', cloudP[0] - 58, cloudP[1] + 10, { font: 'ui', weight: 600, size: 26, color: C.head, align: 'right' });
  });
  if (kCloudArrow > 0) K.arrow(sx0 + 30, sy0 - 4, cloudP[0] + 34, cloudP[1] + 26, { k: kCloudArrow, color: C.head, w: 3, dash: [9, 8], bend: 24 });
  if (kS129 > 0) M.dated(140, 652, 980, {
    eyebrow: 'Anthropic · Use Claude Code in the cloud',
    body: "clones your current directory's GitHub remote at your current branch, not your local checkout, so push first if you have local commits",
    quote: true, footer: true, size: 28, alpha: kS129,
  });
  if (kPointer > 0) M.pointer('the lesson on where your agent works', 1150, 880, { alpha: kPointer });

  // [[breaks]] where the picture breaks
  if (kBreak > 0) {
    M.breaks(230, 712, { alpha: kBreak });   // x 230: clear of the sheet's compass rose (screen ~150, 830)
    if (kBreakText > 0) K.layer(kBreakText, () => K.para('Every git copy is full and equal; “the original” is just the one everyone agrees on.', 230, 774, 940, { font: 'read', size: 34, color: C.strong }));
  }
});
