/* 13 — You vs the agent (storyboard layout).
   Top band (y 140-390): THE AGENT column (x 120-860) and YOU column (x 1060-1800).
   Middle band (y 405-750): the finished map at camera z .5, centred (sheet y ~427-747); legends either side tie the guide to THE AGENT
   and the walker to YOU; the deny-rule pill sits right of the station during [[rule]].
   Bottom band (y 762-928): the rule card during [[rule]], then the full-width BRING IN AN EXPERT strip.
   Sources: S206, S208, S129 (the agent's list), S052 (stated boundaries, deny rule; read 2026-10-23). */
SCENE('13', (t, S) => {
  K.bg();
  const C = K.C, L = M.L;
  const cAgent = S.cue('agent', 0), cYou = S.cue('you', 15.5), cDecide = S.cue('decide', 25.8);
  const cRule = S.cue('rule', 30.2), cExpert = S.cue('expert', 44.5);
  const w = (s, n, fb) => S.find(s, n || 0, fb);
  // spoken anchors (fallbacks are the measured local times)
  const tTypes = w('types', 0, cAgent + 0.6), tCommits = w('commits', 0, cAgent + 2.2), tAsked = w('asked', 0, cAgent + 8.3);
  const tCopy = w('copy', 0, cYou + 0.8), tWhich = w('which', 0, cYou + 4.7), tChanged = w('changed', 1, cYou + 8.9);
  const tEvid = w('evidence', 0, cDecide + 2.3);
  const tSay = w('saying', 0, cRule), tLost = w('lost', 0, cRule + 4.8), tDeny = w('deny', 0, cRule + 8.9), tLess = w('lesson', 0, cRule + 11.4);
  const tShared = w('shared', 0, cExpert + 1.2), tSecret = w('secret', 0, cExpert + 3.6), tKeys = w('keys', 0, cExpert + 9.7), tTell = w('tell', 0, cExpert + 11.8);

  // ---- the map at z .5 in the middle band: world (1000, 565) at screen (960, 562); sheet trimmed to y 250-890
  const z = 0.5, cam = { x: 1000, y: 565 + (540 - 584) / z, z }, ts = M.ts(cam), SH = { y: 250, h: 640 };
  const scr = (x, y) => M.toScreen(cam, x, y);
  const id = M.ids();
  const merge = [L.mergeX, L.pathY], [s1, s2] = L.sideStones;
  const tracingR = { x: 970, y: 640, w: 260, h: 190 };   // right of the guide's walk, under the lantern
  const sq = [1170, 735];                                     // the stray file on the tracing paper
  const walkerP = [L.walker[0], L.walker[1] + 40], guideRest = L.guide;

  // the guide's walk along the path while the agent's list is spoken
  const go = K.io(t, tCommits - 0.3, 0.7), run = K.seg(t, tCommits + 0.3, tAsked - 0.4), back = K.io(t, tAsked + 0.2, 1.2);
  const runX = K.lerp(300, 860, K.ease.io(run));
  let gx = K.lerp(guideRest[0], 300, go), gy = K.lerp(guideRest[1], 705, go);
  if (go >= 1) { gx = runX; gy = 705; }
  if (back > 0) { gx = K.lerp(860, guideRest[0], back); gy = K.lerp(705, guideRest[1], back); }
  const writing = go >= 1 && back <= 0 && run < 1;
  const tipNear = (sx) => (writing ? K.clamp(1 - Math.abs(runX + 70 - sx) / 90) : 0);

  // which of the walker's three readings is current
  const sightK = (a) => K.io(t, a, 0.6);
  const now = (a, b) => K.env(t, a, b, 0.4);
  const hiStation = now(tCopy, tWhich), hiLantern = now(tWhich, tChanged), hiFiles = now(tChanged, cDecide + 1);

  let lanternC = null, eye = [walkerP[0], walkerP[1] - 24];
  K.withCam(cam, () => {
    M.sheet(t, { ts, y: SH.y, h: SH.h });
    M.valley({ y0: SH.y + 28, y1: SH.y + SH.h - 28 });
    const lockK = K.io(t, tDeny, 0.6);
    M.station(t, {
      ts, solid: 1, eyebrow: 'remote',
      stones: [{ glow: hiStation }, { glow: hiStation }, { glow: hiStation }],
      door: lockK > 0 ? 'lock' : null, doorK: lockK,
    });
    M.mainPath();
    M.trail(L.side, { kind: 'side' });
    // parent arrows
    M.back(300, 560, 520, 560);
    M.back(520, 560, s1[0], s1[1], { bend: 0 });
    M.back(s1[0], s1[1], s2[0], s2[1], { bend: 0 });
    M.back(s2[0], s2[1], merge[0], merge[1], { bend: 0 });
    // stones
    M.stone(300, 560, { id: id.home, ts, glow: tipNear(300) });
    M.stone(520, 560, { ts, glow: tipNear(520) });   // its ID would run into the first stone's at z .5
    M.stone(s1[0], s1[1], { ts });   // side-stone IDs collide with the side trail at this scale; main IDs stay
    M.stone(s2[0], s2[1], { ts });
    M.stone(merge[0], merge[1], { id: id.merge, ts, glow: tipNear(960) });
    // signposts; the lantern on main
    // plank hangs LEFT of its post and sits low (h 50), so it stays inside the sheet and clear of 'main' (screen x 955+)
    M.signFor('feature/contact', s2[0], s2[1], { ts, h: 50, side: 'left' });
    const sp = M.signFor('main', merge[0], merge[1], { ts, lantern: 1, t, lanternS: 64 });
    lanternC = [sp.hook[0], sp.hook[1] + 64 * 0.45 + 32];
    if (hiLantern > 0) K.glow(lanternC[0], lanternC[1], 120, C.head, 0.35 * hiLantern);
    // the tracing paper with the diff: two additions and the stray file
    M.tracing(tracingR.x, tracingR.y, tracingR.w, tracingR.h, {});
    M.diff('+', 1030, 700, { s: 46 });
    M.diff('+', 1030, 775, { s: 46 });
    if (hiFiles > 0) K.glow(sq[0], sq[1], 90, C.accent, 0.4 * hiFiles);
    M.diff('square', sq[0], sq[1], { s: 52 });
    // the walker's three readings: station copy, the lantern, the stray file
    const wk = M.walker(t, walkerP[0], walkerP[1], { s: 96 });
    eye = wk.eye;
    const sightTo = (x2, y2, a, hi) => {
      const k = sightK(a); if (k <= 0) return;
      const al = 0.4 + 0.6 * hi;
      K.line(eye[0], eye[1], x2, y2, { k, color: C.strong, w: 2.5 * ts, dash: [5 * ts, 10 * ts], alpha: al });
      if (k > 0.95) K.ring(x2, y2, 14 * ts, 14 * ts, 1, { color: C.strong, w: 2.5 * ts, rot: 0 });
    };
    sightTo(1570, 500, tCopy, hiStation);
    sightTo(lanternC[0] + 40, lanternC[1] + 10, tWhich, hiLantern);
    sightTo(sq[0] + 40, sq[1] + 10, tChanged, hiFiles);
    // the guide (the agent): walks the path, pen on it, while its list is spoken
    M.guide(t, gx, gy, { s: 110, penTo: writing ? [gx + 70, 560] : null, scribble: writing ? 1 : 0 });

    // [[rule]] the walker's "don't push" bubble shields the station door, then erodes from its left edge
    const bk = K.io(t, tSay + 0.3, 0.5), erode = K.io(t, tLost, 1.6, 'sine');
    if (bk > 0 && erode < 1) {
      const bx = 1570, by = 652, bsz = 28 * ts;
      const dim = M.bubble("don't push", bx, by, { size: bsz, k: 0 });
      const x0 = bx - dim.w / 2 - 30, cut = x0 + (dim.w + 60) * erode;
      const g = K.ctx(); g.save(); g.beginPath(); g.rect(cut, by - 200, 2000, 400); g.clip();
      M.bubble("don't push", bx, by, { size: bsz, k: bk, tail: eye, alpha: 1 - 0.4 * erode });
      g.restore();
    }
  });

  // ---- top band: the two columns (shorter storyboard wordings so both fit above the map)
  const CA = 120, CY = CA + 940, CW = 740, TOP = 140;
  const agentRows = [
    'types every git command',
    'commits · branches · conflicts · pushes · pull requests · fixes for failing checks',
    'asked: lists the files it changed, says if a remote exists and is public, names the default branch',
  ];
  const agentAt = [tTypes, tCommits, tAsked];
  M.rows(CA, TOP, CW, agentRows, {
    head: 'the agent', k: (i) => K.io(t, i < 0 ? cAgent - 0.2 : agentAt[i] - 0.15, 0.5), icon: 'sparkle', size: 26, gap: 8,
  });
  const youRows = [
    'a copy elsewhere exists, private or public as you intend',
    'which branch is default; which one your host deploys',
    'the changed files',
    'you decide what merges',
    'ask for evidence, not a claim',
  ];
  const youAt = [tCopy - 0.4, tWhich, tChanged, cDecide, tEvid - 0.4];
  M.rows(CY, TOP, CW, youRows, {
    head: 'you', headColor: C.strong, color: C.strong, icon: 'person',
    k: (i) => K.io(t, i < 0 ? cYou - 0.3 : youAt[i] - 0.15, 0.5), size: 26, gap: 4,
  });

  // ---- middle band, either side of the map: who is who
  const gS = scr(gx, gy - 40), wS = scr(walkerP[0], walkerP[1] - 30);
  const lgA = K.io(t, cAgent + 0.2, 0.5), lgY = K.io(t, cYou + 0.2, 0.5);
  if (lgA > 0) {
    const w0 = M.pillL('the guide = the agent', CA, 470, { size: 26, icon: 'sparkle', iconColor: C.head, color: C.head, fill: C.panel, stroke: C.head, alpha: lgA });
    K.line(CA + w0 / 2, 494, gS[0] - 30, gS[1], { k: lgA, color: C.head, w: 2, dash: [4, 8], alpha: 0.7 * lgA });
  }
  if (lgY > 0) {
    const pw = M.pillL('the walker = you', 1800, 470, { size: 26, icon: 'person', iconColor: C.strong, color: C.strong, fill: C.panel, stroke: C.strong, alpha: lgY, align: 'right' });
    K.line(1800 - pw / 2, 494, wS[0] + 30, wS[1], { k: lgY, color: C.strong, w: 2, dash: [4, 8], alpha: 0.6 * lgY });
  }
  // [[rule]] the lock on the station door gets its name, right of the map
  const lk = K.io(t, tDeny, 0.5);
  if (lk > 0) {
    const door = scr(1570, 674);
    const dw = M.pillL('deny rule · branch protection', 1800, 640, { size: 26, icon: 'lock', iconColor: C.head, color: C.strong, fill: C.panel, stroke: C.head, alpha: lk, align: 'right' });
    K.line(1800 - dw, 640, door[0] + 22, door[1], { k: lk, color: C.head, w: 2, alpha: 0.8 * lk });
  }

  // ---- bottom band: the rule card, then the expert strip
  const BX = 120, BW = 1680, BY = 762;
  // the lower band fills as soon as [[rule]] starts, and clears just before the expert strip takes it
  const cardA = K.io(t, cRule + 0.3, 0.6) * (1 - K.io(t, cExpert - 0.5, 0.45));
  if (cardA > 0) K.layer(cardA, () => {
    M.dated(BX, BY, BW, {
      eyebrow: 'Anthropic · Choose a permission mode · ' + M.READ,
      body: 'Stated boundaries like “don’t push” block a matching push in auto mode, but aren’t stored as rules; they can be lost when the conversation is compacted. “For a hard guarantee, add a deny rule.”',
      size: 26,
    });
    M.pointer('the lesson on rules that actually hold', BX + BW - 30, BY + 44, { align: 'right', alpha: K.io(t, tLess - 0.2, 0.5) });
  });

  const stripK = (i) => K.io(t, i < 0 ? cExpert - 0.05 : [tShared, tSecret, tTell][i] - 0.2, 0.5);
  const hk = stripK(-1);
  if (hk > 0) K.layer(hk, () => {
    K.card(BX, BY, BW, 166, { r: 24, fill: C.tile, stroke: C.line2, lw: 1.5, shadow: false });
    K.icon('shield', BX + 40, BY + 36, 34, { color: C.head, w: 2.6 });
    K.text('BRING IN AN EXPERT', BX + 72, BY + 46, { font: 'ui', weight: 600, size: 26, tracking: 3, color: C.head });
  });
  M.pointer('the lesson on keys', BX + BW - 30, BY + 36, { align: 'right', alpha: K.io(t, tKeys - 0.3, 0.5) });
  const ex = [
    'shared history must be rewritten',
    'a secret or personal data was pushed: revoke and rotate the key first; deleting the commit does nothing',
    'can’t tell what it touched, real credentials on the machine',
  ];
  const colX = [BX + 20, BX + 470, BX + 1200], colW = [430, 710, 470];   // the long middle row gets the room for 2 lines
  ex.forEach((s, i) => M.rows(colX[i], BY + 70, colW[i], [s], { k: () => stripK(i), icon: 'person', color: C.head, size: 26, gap: 0 }));
});
