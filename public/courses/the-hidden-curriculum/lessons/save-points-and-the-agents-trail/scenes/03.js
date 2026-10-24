/* 03 — The guide holds the pen
   The trail map unfolds (sheet, contours, then the empty main path left to right). The guide (the agent) pops in
   with its pen and draws a short squiggle at the trailhead; the walker (you) fades in with a dashed sight-line to the
   map: "draws" / "reads".
   [[before]] the guide dims; a ghost walker holding a pen slides in and scribbles crooked terracotta marks on the
   map, which get crossed out (Aaron, May 2025, AO-007 card).
   [[talk]] the ghost fades, the guide returns; the walker's questions rise as speech bubbles (Anthropic Quickstart
   prompts, newest at the bottom, older ones pushed up), with the Terminal guide quote on a card.
   [[changed]] a dated pill '2026-09-25 · auto mode' drops onto the guide (the scene's one 'back' overshoot), an
   arrow "may push on its own", and the permission-modes card (read 2026-10-23 · this moves monthly).
   [[heading]] cards fade; the walker's sight-line brightens and splits toward three empty spots (where the lantern,
   the station and the footprints will be): "likely: your job is checking these". The lines settle back to .4.
   Exit: empty path, guide and walker resting, sight-lines at .4. */
SCENE('03', (t, S) => {
  const C = K.C, L = M.L;
  const cMap = S.cue('map', 0), cGuide = S.cue('guide', 2.55), cBefore = S.cue('before', 10.7);
  const cTalk = S.cue('talk', 19), cChanged = S.cue('changed', 26.6), cHead = S.cue('heading', 34);
  const out = (a, d = 0.5) => 1 - K.io(t, a, d);
  // hand-off: the lamp glow (02's exit) and this scene's extra ink settle into 04's plain ground and sheet over the
  // last seconds, so the 04 cut changes nothing
  const endT = S.out != null ? S.out : (S.dur || 40.2) + 0.6;
  const hand = K.io(t, Math.max(cHead + 3.8, endT - 3.4), 2.6);
  K.bg({ glow: K.lerp(0.3, 0.1, hand), glowX: K.lerp(960, 1920 * 0.24, hand), glowY: K.lerp(520, 1080 * 0.08, hand) });

  // ---------------------------------------------------------------- the map
  const unfold = K.io(t, cMap, 0.7, 'out');
  const roseK = K.io(t, cMap + 0.5, 1.4, 'lin');                     // the compass rose inks itself
  const sh = M.sheet(t, { unfold, contours: K.io(t, cMap + 0.4, 1.0), compass: hand });
  const inkA = unfold * (1 - hand);                          // parchment and hand-inking (03's own; see notes)
  const INK = K.mixColor(C.head, C.accent, 0.45);                   // a warm brown-gold ink
  if (inkA > 0.002) {
    const g = K.ctx(), r = sh, cy = r.y + r.h / 2;
    g.save(); g.translate(0, cy); g.scale(1, Math.max(0.02, K.ease.out(unfold))); g.translate(0, -cy);
    // parchment tint and topographic loops (two hills), clipped to the sheet
    g.save(); K.rr(r.x, r.y, r.w, r.h, 24); g.clip();
    g.globalAlpha = inkA;
    const pg = g.createRadialGradient(r.x + r.w * 0.5, r.y + r.h * 0.5, 80, r.x + r.w * 0.5, r.y + r.h * 0.5, r.w * 0.62);
    pg.addColorStop(0, K.rgba(C.head, 0.1)); pg.addColorStop(1, K.rgba(INK, 0.19));
    g.fillStyle = pg; g.fillRect(r.x, r.y, r.w, r.h);
    const topoK = K.io(t, cMap + 0.6, 1.6);
    [[470, 300, 150, 62, 4], [1020, 800, 190, 58, 3]].forEach(([hx, hy, rx, ry, n], hi) => {
      for (let j = 0; j < n; j++) {
        const sc = 1 - j * 0.24, pts = [];
        for (let i = 0; i <= 40; i++) {
          const a = (i / 40) * Math.PI * 2, wob = 1 + 0.08 * Math.sin(a * 3 + hi * 2 + j) + 0.05 * Math.sin(a * 5 + j * 1.7);
          pts.push([hx + Math.cos(a) * rx * sc * wob, hy + Math.sin(a) * ry * sc * wob]);
        }
        K.path(pts, { k: K.clamp(topoK * 1.3 - j * 0.1), head: false, color: INK, w: 1.3, alpha: 0.32, tension: 0.4 });
      }
    });
    g.restore();
    // hand-inked border: a slightly irregular line drawn round the sheet like a pen stroke
    const bk = K.io(t, cMap + 0.2, 2.2, 'io');
    if (bk > 0) {
      const rnd = K.rng(3031), ins = 11, pts = [];
      const corners = [[r.x + ins, r.y + ins], [r.x + r.w - ins, r.y + ins], [r.x + r.w - ins, r.y + r.h - ins], [r.x + ins, r.y + r.h - ins], [r.x + ins, r.y + ins]];
      for (let c = 0; c < 4; c++) {
        const [ax, ay] = corners[c], [bx, by] = corners[c + 1], len = Math.hypot(bx - ax, by - ay), n = Math.round(len / 46);
        for (let i = 0; i < n; i++) { const f = i / n; pts.push([ax + (bx - ax) * f + (rnd() - 0.5) * 3.2, ay + (by - ay) * f + (rnd() - 0.5) * 3.2]); }
      }
      pts.push(pts[0].slice());
      K.layer(inkA, () => K.path(pts, { k: bk, head: false, color: INK, w: 2.4, alpha: 0.75, tension: 0.2 }));
    }
    // compass rose in the lower-left corner (where the standard north mark sits; it hands over to that mark at the end)
    if (roseK > 0) K.layer(inkA * (1 - hand), () => {
      const x = r.x + 70, y = r.y + r.h - 74, R = 40;
      g.save(); g.lineWidth = 1.6; g.strokeStyle = K.rgba(INK, 0.8);
      g.beginPath(); g.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * K.clamp(roseK * 1.4)); g.stroke();
      g.restore();
      const pk = K.clamp(roseK * 1.6 - 0.4);
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 4, len = (i % 2 ? 0.55 : 1) * R * 1.1 * pk, wd = i % 2 ? 4 : 7;
        if (len <= 1) continue;
        g.save(); g.translate(x, y); g.rotate(a);
        g.beginPath(); g.moveTo(len, 0); g.lineTo(0, wd); g.lineTo(0, -wd); g.closePath();
        g.fillStyle = i === 0 ? K.rgba(C.head, 0.85) : K.rgba(INK, i % 2 ? 0.45 : 0.6); g.fill();
        g.restore();
      }
      if (pk > 0.6) M.label('N', x, y - R - 16, { size: 22, color: C.head, alpha: K.clamp((pk - 0.6) / 0.4) });
    });
    g.restore();
  }
  // the path draws in with a pen stroke from the first moment: a gold nib leads it left to right
  const pathK = K.io(t, cMap + 0.25, 2.25, 'lin');
  M.mainPath({ k: pathK, alpha: unfold });
  if (pathK > 0 && pathK < 1) {
    const nx = L.pathX0 + (L.pathX1 - L.pathX0) * pathK, ny = L.pathY;
    const na = K.clamp(pathK * 8) * K.clamp((1 - pathK) * 8);
    K.layer(na, () => {
      K.line(nx, ny, nx + 34, ny - 58, { color: C.strong, w: 6 });
      K.line(nx, ny, nx + 8, ny - 14, { color: C.head, w: 4 });
      K.glow(nx, ny, 26, C.head, 0.35);
    });
  }

  // the guide's first mark: a little squiggle at the trailhead (gone again by the heading beat)
  const sqA = cGuide + 0.7, sqK = K.io(t, sqA, 1.1, 'lin');
  const squig = [];
  for (let i = 0; i <= 14; i++) { const f = i / 14; squig.push([206 + f * 96, 604 + Math.sin(f * Math.PI * 3) * 9 - f * 4]); }
  const sqAlpha = out(cHead - 0.2, 0.6);
  if (sqK > 0) K.path(squig, { k: sqK, head: false, color: C.head, w: 3.5, alpha: 0.9 * sqAlpha });

  // ---------------------------------------------------------------- the ghost: walker with a pen (before)
  const ghostIn = K.io(t, cBefore + 0.2, 0.7), ghostOut = out(cTalk - 0.1, 0.6);
  const ghostA = ghostIn * ghostOut;
  // crooked terracotta marks, then crossed out
  const crook = [
    [[690, 452], [722, 478], [741, 440], [776, 492], [796, 446], [829, 486], [858, 452]],
    [[700, 512], [740, 498], [772, 524], [812, 500], [850, 522]],
  ];
  const sc0 = cBefore + 1.1;
  const c1 = K.io(t, sc0, 1.4, 'lin'), c2 = K.io(t, sc0 + 1.5, 1.1, 'lin');
  const x1 = K.io(t, sc0 + 3.2, 0.35, 'out'), x2 = K.io(t, sc0 + 3.6, 0.35, 'out');
  if (ghostA > 0.002) {
    K.layer(ghostA, () => {
      if (c1 > 0) K.path(crook[0], { k: c1, head: false, color: C.accent, w: 4, tension: 0.15 });
      if (c2 > 0) K.path(crook[1], { k: c2, head: false, color: C.accent, w: 4, tension: 0.15 });
      if (x1 > 0) K.line(672, 432, 878, 538, { k: x1, color: C.accent, w: 5 });
      if (x2 > 0) K.line(878, 432, 672, 538, { k: x2, color: C.accent, w: 5 });
    });
    // the ghost walker slides in from the walker's place
    const gx = K.lerp(L.walker[0], 980, ghostIn), gy = K.lerp(L.walker[1], 520, ghostIn);
    const writing = c1 > 0 && c1 < 1 ? M.along(crook[0], c1) : c2 > 0 && c2 < 1 ? M.along(crook[1], c2) : null;
    const aim = writing ? [writing.x, writing.y] : [860, 470];
    K.layer(0.45 * ghostA, () => {
      M.walker(t, gx, gy, { bob: false });
      const hx = gx - 30, hy = gy + 14, ang = Math.atan2(aim[1] - hy, aim[0] - hx);
      const jx = writing ? K.wave(t, 17, 4) : 0, jy = writing ? K.wave(t, 12, 3, 1) : 0;
      const tx = hx + Math.cos(ang) * 92 + jx, ty = hy + Math.sin(ang) * 92 + jy;
      K.line(hx, hy, tx, ty, { color: C.strong, w: 7 });
      K.line(tx - Math.cos(ang) * 12, ty - Math.sin(ang) * 12, tx, ty, { color: C.accent, w: 4 });
    });
  }

  // ---------------------------------------------------------------- the guide and the walker
  const gIn = K.io(t, cGuide, 0.6, 'out');
  const dim = K.io(t, cBefore, 0.6) * out(cTalk + 0.1, 0.6);
  const lblA = K.io(t, cGuide + 1.0, 0.5) * out(cHead, 0.6);
  const penTo = sqK > 0 && sqK < 1 ? [squig[Math.round(sqK * 14)][0], squig[Math.round(sqK * 14)][1]] : null;
  K.layer(gIn, () => K.at(L.guide[0], L.guide[1], 0.7 + 0.3 * gIn, 0, () => {
    M.guide(t, 0, 0, { dim, scribble: penTo ? 1 : 0 });
  }));
  if (lblA > 0) M.label('draws', L.guide[0], L.guide[1] + 42 + 48, { color: K.mixColor(C.head, C.soft, dim), alpha: lblA * (1 - 0.5 * dim) });

  // the walker: one sight-line to the map, which at [[heading]] splits toward three empty spots
  const wIn = K.io(t, cGuide + 0.5, 0.6);
  const look = [780, L.pathY];
  const spots = [
    { p: [628, 430], icon: 'lantern', say: 'which branch is live', above: true },     // where the lantern will hang (under main's signpost)
    { p: [1572, 470], icon: 'house', say: 'a copy elsewhere', above: true },      // where the station will stand, across the valley
    { p: look, icon: 'prints', say: 'the trail it left' },            // where the footprints will be stamped, on the path
  ];
  const split = K.io(t, cHead + 0.3, 0.8) * (1 - hand);   // spots rest away with the hand-off: 04 opens on the bare path
  const bright = K.io(t, cHead + 0.1, 0.5) * out(cHead + 3.6, 0.9);
  const sightA = (0.4 + 0.6 * bright) * (1 - 0.7 * ghostA);
  const eye0 = [L.walker[0], L.walker[1] - 17];
  if (split > 0) [0, 1].forEach((i) => {
    const [sx, sy] = spots[i].p, d = Math.hypot(sx - eye0[0], sy - eye0[1]), ex = sx - ((sx - eye0[0]) / d) * 44, ey = sy - ((sy - eye0[1]) / d) * 44;
    M.sight(eye0[0], eye0[1], ex, ey, { k: K.clamp(split * 1.15 - i * 0.15), alpha: sightA * wIn, end: false });
  });
  const W = M.walker(t, L.walker[0], L.walker[1], { alpha: wIn, look: wIn > 0 ? look : null, sightK: K.io(t, cGuide + 1.0, 0.7), sightAlpha: sightA });
  if (lblA > 0) M.label('reads', L.walker[0], L.walker[1] + 42 + 48, { color: C.strong, alpha: lblA * wIn });
  if (split > 0) {
    spots.forEach((s, i) => {
      const k = K.io(t, cHead + 0.7 + i * 0.15, 0.5) * (1 - hand), x = s.p[0], y = s.p[1];
      if (k <= 0) return;
      M.dashedCircle(x, y, 40, { color: C.strong, w: 2.5, alpha: (0.6 + 0.35 * bright) * k, fill: K.rgba(C.tile, 0.85 * k) });
      if (s.icon === 'prints') M.prints(x, y, { k: 1, alpha: 0.85 * k, s: 0.75 });
      else K.icon(s.icon, x, y, 40, { color: C.body, alpha: 0.9 * k, w: 2.4 });
      const lk = K.io(t, cHead + 1.0 + i * 0.2, 0.5) * (1 - hand);
      if (lk > 0) M.label(s.say, x, s.above ? y - 40 - 22 : y + 40 + 34, { size: 26, color: C.strong, alpha: lk });
    });
    const hk = K.io(t, cHead + 0.9, 0.6) * (1 - hand);
    if (hk > 0) K.spans([{ s: 'likely: ', color: C.head }, { s: 'your job is checking these', color: C.strong }], 1110, 300, { size: 30, font: 'ui', weight: 600, align: 'center', alpha: hk });
  }

  // ---------------------------------------------------------------- source cards (top-right band)
  const cx = L.cards.x, cy = L.cards.y, cw = L.cards.w;
  const card1 = K.io(t, cBefore + 0.5, 0.6) * out(cTalk - 0.2, 0.5);
  if (card1 > 0) M.dated(cx, cy, cw, { eyebrow: 'Aaron Orelup · AO-007 · 2026-08-08', body: '“Git was the worst of it” (May 2025)', alpha: card1 });
  const card2 = K.io(t, cTalk + 0.4, 0.6) * out(cChanged - 0.3, 0.5);
  let c2h = 0;
  if (card2 > 0) c2h = M.dated(cx, cy, cw, { eyebrow: 'Anthropic · Terminal guide for new users · ' + M.READ, body: 'You won’t need to learn Git yourself.', quote: true, alpha: card2 });
  const card3 = K.io(t, cChanged + 0.6, 0.6) * out(cHead - 0.1, 0.6);
  if (card3 > 0) M.dated(cx - 30, cy, cw + 30, { eyebrow: 'Anthropic · Choose a permission mode', body: 'auto mode: the starting mode for terminal and VS Code sessions from v2.1.283', footer: true, alpha: card3 });

  // ---------------------------------------------------------------- the walker's questions (talk)
  const bubA = out(cChanged - 0.3, 0.5);
  if (bubA > 0.002 && t > cTalk) {
    const qs = [
      { s: 'what files have I changed?', at: S.find('what', 0, cTalk + 1.2) - 0.15, size: 28 },
      { s: 'show me the last 5 commits', at: S.find('show', 0, cTalk + 3.6) - 0.15, size: 28 },
      { s: 'help me resolve merge conflicts', at: S.find('show', 0, cTalk + 3.6) + 2.0, size: 26 },
    ];
    const slots = [612, 516, 420];               // bottom slot nearest the walker; older bubbles are pushed up
    const newest = qs.reduce((n, q, i) => (t >= q.at - 0.45 ? i : n), -1);
    K.layer(bubA, () => {
      qs.forEach((q, i) => {
        const k = K.io(t, q.at, 0.5, 'out');
        if (k <= 0) return;
        // how many later bubbles have arrived (eased): that is how far this one has been pushed up
        let up = 0; for (let j = i + 1; j < qs.length; j++) up += K.io(t, qs[j].at - 0.45, 0.45);
        const y = K.lerp(slots[Math.floor(up)], slots[Math.min(2, Math.floor(up) + 1)], up - Math.floor(up));
        M.bubble(q.s, 1490, y, { k, size: q.size, tail: i === newest ? [W.eye[0] - 10, W.eye[1] - 30] : null });
      });
    });
    const chA = K.io(t, qs[0].at + 0.8, 0.5);
    if (chA > 0) M.chip('Anthropic, Quickstart · ' + M.READ, L.walker[0] - 80, L.walker[1] + 4, { align: 'right', alpha: chA * bubA });
  }

  // ---------------------------------------------------------------- what changed: auto mode drops onto the guide
  const drop = K.io(t, cChanged, 0.7, 'back');
  // the auto-mode pill stays through [[heading]] as the one setting to check, then rests away with the hand-off
  const chgA = K.io(t, cChanged, 0.25) * (1 - hand);
  const arrA = out(cHead - 0.1, 0.6);
  if (chgA > 0) {
    const py = K.lerp(L.guide[1] - 230, L.guide[1] - 82, drop);
    const w = M.chip('2026-09-25 · auto mode', L.guide[0], py, { align: 'center', color: C.head, alpha: chgA, glow: 0.4 });
    const ak = K.io(t, cChanged + 0.9, 0.6);
    const ax0 = L.guide[0] + w / 2 + 16, ax1 = ax0 + 150;
    if (ak > 0 && arrA > 0) K.layer(chgA * arrA, () => {
      K.arrow(ax0, L.guide[1] - 82, ax1, L.guide[1] - 82, { k: ak, color: C.head, w: 3, headSize: 13, dash: [8, 7] });
      M.label('may push on its own', ax1 + 16, L.guide[1] - 73, { align: 'left', color: C.head, alpha: K.io(t, cChanged + 1.3, 0.5) });
    });
    const setK = K.io(t, cHead + 0.6, 0.5);
    if (setK > 0) M.label('a setting to check', L.guide[0], L.guide[1] - 82 - 48, { size: 26, color: C.strong, alpha: setK * chgA });
  }
});
