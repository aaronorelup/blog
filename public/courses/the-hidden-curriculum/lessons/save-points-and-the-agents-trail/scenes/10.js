// 10 — The noticeboard: pushing is a decision
// The guide carries a copy of the newest stone across the valley (push); an open gate (auto mode allows it);
// a 'production' signpost at the station judged on its own, the shield of branch protection on the door; then the
// camera turns to the station's noticeboard by the public road: blank screenshots flutter onto it (PixelLeak), and
// its 'public' tag turns into a '?' that only the walker can answer.
SCENE('10', (t, S) => {
  const M = window.M, C = K.C, L = M.L, id = M.ids();
  K.bg();

  // ---------------------------------------------------------------- beats (all from cues / spoken words)
  const cPush = S.cue('push', 0), cAuto = S.cue('auto', 4), cDeploy = S.cue('deploy', 14.1);
  const cBoard = S.cue('board', 23.5), cPixel = S.cue('pixel', 29.6), cKnown = S.cue('known', 54.1);
  const after = (w, a, fb) => { const v = S.find(w, 0, NaN); return isFinite(v) && v >= a ? v : fb; };
  const wProd = after('production', cDeploy, cDeploy + 3.3);
  const wJudged = after('judged', cDeploy, cDeploy + 4.5);
  const wProt = after('protection', cDeploy, cDeploy + 7.4);
  const wAnyone = after('anyone', cBoard, cBoard + 4.5);
  const wPut = after('put', cPixel, cPixel + 7.1);
  const wOne = after('One', cPixel + 4, cPixel + 11.7);
  const wThirteen = after('thirteen', cPixel, cPixel + 16.7);
  const wOrgs = after('organisations', cPixel, cPixel + 19.4);
  const wCount = after('count', wThirteen, cPixel + 21.8);
  const wTell = after('tell', cKnown, cKnown + 5.9);
  const wFiles = after('files', cKnown, cKnown + 9.1);
  const wWhether = after('Whether', cKnown, cKnown + 12.0);

  // ---------------------------------------------------------------- camera: the station, then the road
  // the road beat: the whole sheet, the station and the board in one frame (world x 120-2110 -> screen 84-1836),
  // so nothing is cropped by the frame edge; labels scale with M.ts(cam)
  const VB = { x: 1115, y: 540, z: 0.88 };
  // PixelLeak onward: lean in on the station and its board (world x ~1330-2105 -> screen ~870-1835) so the pasted
  // screenshots read as screenshots; the source cards take the left column, the dimmed map shows under/below them
  const VZ = { x: 1405, y: 610, z: 1.25 };   // y 610: the sheet's top edge leaves the frame above the header
  const cam = K.cam(t, [{ at: -99, ...M.VIEW.station }, { at: cBoard, ...VB, d: 0.9 }, { at: cPixel - 0.3, ...VZ, d: 1.3 }]);
  const tsc = M.ts(cam);

  // the push: a copy lifts off the newest stone (the merge) and flies over the valley to the station's empty slot
  const MX = L.mergeX, PY = L.pathY;
  // the station as in 06: wider than L.station so five slots' alternating IDs do not touch; it already holds every
  // stone on main except the newest (the merged side-trail stones too), and the push fills the last slot
  const SX = { x: L.station.x - 30, w: L.station.w + 60 };
  const st = M.station(t, { ...SX, alpha: 0, stones: [{}, {}, {}, {}, {}] });   // geometry only (alpha 0 draws nothing)
  const slot = st.slots[4];
  const arc = [[MX, PY], [MX - 12, 430], [MX + 2, 330], [1040, 292], [1150, 300], [1250, 335], [1380, 395], [1560, 412], [1655, 455], [slot[0], slot[1]]];
  const gMove = K.io(t, cPush + 0.05, 0.8);                       // the guide walks up to the merge stone
  const lift = cPush + 0.8, fly0 = cPush + 1.05, fly1 = cPush + 2.9;
  const flyK = K.io(t, fly0, fly1 - fly0, 'io');
  const landK = K.io(t, fly1, 0.45, 'out');
  const liftK = K.io(t, lift, 0.3, 'out');
  const along = (k) => {                                           // point on the smooth arc by its sampled length
    const P = [];
    for (let i = 0; i < arc.length - 1; i++) {
      const p0 = arc[Math.max(0, i - 1)], p1 = arc[i], p2 = arc[i + 1], p3 = arc[Math.min(arc.length - 1, i + 2)];
      for (let j = 0; j < 12; j++) {
        const u = j / 12, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        P.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    P.push(arc[arc.length - 1]);
    return M.along(P, k);
  };

  K.withCam(cam, () => {
    // ---------------------------------------------------------------- the map, as built in 03-05
    M.sheet(t);
    // dim while the gate and the station are discussed; dimmed again (never removed) while the left cards read
    const mapA = 1 - Math.max(0.5 * K.io(t, cAuto + 0.3, 0.6) * (1 - K.io(t, cBoard - 0.3, 0.6)), 0.7 * K.io(t, cPixel - 0.4, 0.8), K.io(t, cKnown - 0.6, 0.6));
    // (the visibility card and its chip rows fill the left column from 'known': the map's last stone would sit
    // half under the chips, so it goes then)
    // the side stones' IDs sit under the deploy card (left column): fade them fully while it shows
    const sideIdA = 1 - K.io(t, cDeploy - 0.2, 0.4) * (1 - K.io(t, cBoard - 0.3, 0.5));
    // leaning in, the side trail would be cut by the frame's left edge and poke out above the card: it goes, the
    // main path and the newest stone stay (dimmed) as the map's corner
    const sideA = 1 - K.io(t, cPixel - 0.6, 0.6);
    K.layer(mapA, () => {
    M.mainPath();
    K.layer(sideA, () => M.trail(L.side, { kind: 'side' }));
    const [c1, c2] = L.sideStones;
    M.back(L.stoneX[0], PY, L.stoneX[1], PY);
    K.layer(sideA, () => {
      M.back(L.stoneX[1], PY, c1[0], c1[1], { bend: -20 });
      M.back(c1[0], c1[1], c2[0], c2[1]);
      M.back(c2[0], c2[1], MX, PY, { bend: 20 });
    });
    M.back(L.stoneX[1], PY, MX, PY);
    // the home stone's id is cut by the frame edge once the camera pans to the road: fade it before the pan
    M.stone(L.stoneX[0], PY, { id: id.home, ts: tsc });
    M.stone(L.stoneX[1], PY, { id: id.about, ts: tsc });
    M.stone(c1[0], c1[1], { id: id.contact, ts: tsc, idAlpha: sideIdA, alpha: Math.min(sideIdA, sideA) });   // its ring would peek out under the deploy card
    M.stone(c2[0], c2[1], { id: id.phone, ts: tsc, idAlpha: sideIdA, alpha: sideA });
    M.stone(MX, PY, { id: id.merge, ts: tsc, glow: 0.6 * K.env(t, lift - 0.3, fly1, 0.4) });
    K.layer(sideA, () => M.signFor('feature/contact', c2[0], c2[1], { ts: tsc }));
    K.layer(sideA, () => M.signFor('main', MX, PY, { ts: tsc, lantern: 1, t }));   // its plank would peek out under the card's lower edge
    });

    // ---------------------------------------------------------------- the valley, the open gate, the station
    M.valley();
    const gateK = K.io(t, cAuto + 0.1, 0.7, 'out');
    const gateLblA = K.io(t, cAuto + 0.6, 0.5) * (1 - K.io(t, cBoard - 0.5, 0.5));
    if (gateK > 0) K.layer(gateK * (1 - 0.6 * K.io(t, cBoard - 0.5, 0.6)) * (1 - K.io(t, cKnown - 0.6, 0.6)), () => {
      // a field gate at the valley edge: two capped posts, the leaf swung wide open on its left hinge
      const px0 = 1146, px1 = 1236, gy = 610, gh = 124, g = K.ctx();
      [px0, px1].forEach((x) => {
        K.line(x, gy + 8, x, gy - gh - 8, { color: C.body, w: 6 });
        g.save(); g.beginPath(); g.arc(x, gy - gh - 12, 7, 0, 7); g.fillStyle = C.body; g.fill(); g.restore();
      });
      const open = 1.1 * K.ease.out(gateK), W = px1 - px0 - 10;
      const ex = px0 + 5 + W * Math.cos(open), drop = 30 * Math.sin(open);
      const top = gy - gh + 12, bot = gy - 10;
      const q = [[px0 + 5, top], [ex, top + drop], [ex, bot + drop], [px0 + 5, bot]];
      K.path([q[0], q[1], q[2], q[3], q[0]], { head: false, tension: 0, color: C.strong, w: 3.5 });
      for (let i = 1; i < 4; i++) { const f = i / 4; K.line(K.lerp(q[0][0], q[1][0], f), K.lerp(q[0][1], q[1][1], f), K.lerp(q[3][0], q[2][0], f), K.lerp(q[3][1], q[2][1], f), { color: C.strong, w: 2.5, alpha: 0.8 }); }
      K.line(q[3][0], q[3][1], q[1][0], q[1][1], { color: C.strong, w: 2.5, alpha: 0.8 });
      // the way through is clear: a gold arrow passes the open gateway toward the station
      const thru = K.io(t, cAuto + 0.5, 0.7);
      if (thru > 0) K.arrow(px0 + 14, gy - 64, px1 + 110, gy - 64, { k: thru, color: C.head, w: 3.5 });
    });
    M.label('auto mode: push allowed', 1150, 672, { color: C.strong, alpha: gateLblA, ts: tsc });

    const landed = t >= fly1;
    M.station(t, {
      ...SX, solid: 1,                                             // 06 [breaks] made the station's copy solid
      stones: [
        ...[id.home, id.about, id.contact, id.phone].map((s) => ({ id: s, state: 'copy' })),
        landed ? { id: id.merge, state: 'copy', k: landK, glow: 0.7 * (1 - K.io(t, fly1 + 0.8, 1.2)) } : { state: 'empty' },
      ],
      door: 'shield', doorK: K.io(t, wProt, 0.6, 'out'), ts: tsc,
    });
    // a branch named like a deploy target, at the station: judged on its own
    const prodK = K.io(t, wProd - 0.6, 0.8);
    M.signpost('production', slot[0] + 44, slot[1] - 30, { side: 'left', h: 110, k: prodK, ts: tsc });
    const judgedA = K.io(t, wJudged, 0.5) * (1 - K.io(t, cBoard - 0.3, 0.5));
    if (judgedA > 0) K.pill('judged on its own', slot[0] - 40, 770, { size: 26, color: C.strong, fill: C.tile, stroke: C.strong, alpha: judgedA });

    // ---------------------------------------------------------------- the flight
    const arcA = K.io(t, fly0, 0.3) * (1 - K.io(t, fly1 + 1.6, 1.2));
    if (arcA > 0) K.path(arc, { k: flyK, head: false, color: C.head, w: 2.5, dash: [6, 9], alpha: 0.6 * arcA });
    if (t >= lift && landK < 1) {
      const p = along(flyK);
      const rise = flyK > 0 ? 0 : -10 * liftK;
      M.stone(p.x, p.y + rise, { r: 22, k: liftK, glow: 0.8, alpha: 1 - landK });
    }
    M.label('push', 1262, 286, { ...M.T.labelBig, color: C.head, alpha: K.io(t, fly0 + 0.3, 0.5) * (1 - K.io(t, cAuto, 0.4)), ts: tsc });

    // ---------------------------------------------------------------- the guide carries it
    const gA = 1 - K.io(t, cBoard - 0.2, 0.6);
    if (gA > 0) {
      const gx = K.lerp(L.guide[0], 880, gMove), gy = K.lerp(L.guide[1], 704, gMove);
      const tgt = t < lift ? [MX - 6, PY + 10] : (() => { const p = along(flyK); return [p.x, p.y]; })();
      const aim = K.io(t, lift - 0.4, 0.4);
      const pen = t >= fly1 + 0.6 ? null : [K.lerp(gx + 140, tgt[0], aim), K.lerp(gy - 140, tgt[1], aim)];
      M.guide(t, gx, gy, { penTo: pen || undefined, alpha: gA, scribble: K.env(t, lift - 0.3, lift + 0.25, 0.15) });
    }

    // ---------------------------------------------------------------- the noticeboard by the road
    const B = { x: 1840, y: 560, w: 260, h: 200 };
    const roadK = K.io(t, cBoard + 0.5, 0.9);
    const roadEnd = VZ.x + (1840 - 960) / VZ.z;                    // the frame's right gutter (screen x 1840), in world x
    if (roadK > 0) {
      K.line(1620, L.road, K.lerp(1620, roadEnd, roadK), L.road, { color: K.rgba(C.line2, 0.35), w: 22 });
      K.line(1620, L.road, K.lerp(1620, roadEnd, roadK), L.road, { color: C.line2, w: 3, dash: [18, 12] });
    }
    const boardK = K.io(t, cBoard + 0.6, 1.0);
    M.board(t, { ...B, k: boardK, pinned: K.io(t, cBoard + 1.3, 0.7), tag: null });

    // passers-by on the road, glancing up at the board
    const passA = K.io(t, cBoard + 1.4, 0.8);
    if (passA > 0) {
      const gap = 170, sp = 46, xa = roadEnd - 24, xb = 1690, off = ((t * sp) % gap + gap) % gap;
      for (let d = off; d < xa - xb; d += gap) {
        const px = xa - d, edge = Math.min(1, d / 80, (xa - xb - d) / 80), py = L.road - 18 + K.wave(t * 5 + d, 1, 1.5);
        K.icon('person', px, py, 30 * tsc, { color: C.body, alpha: 0.75 * edge * passA, w: 2 });
        const near = K.clamp(1 - Math.abs(px - (B.x + B.w / 2)) / 150);
        if (near > 0.05 && Math.abs(px - (B.x + B.w / 2)) > 40) M.sight(px, py - 14, px + (px < B.x + B.w / 2 ? 20 : -20), B.y + B.h + 6, { alpha: 0.35 * near * edge * passA, end: false });
      }
    }

    // blank screenshots flutter onto the board (PixelLeak)
    const thumbs = [[1890, 600, -0.12], [2050, 606, 0.09], [1894, 722, 0.07], [1972, 728, -0.05], [2050, 718, 0.11], [2036, 664, -0.08], [1904, 662, 0.05]];
    thumbs.forEach(([x, y, rot], i) => {
      const a0 = wPut + i * 0.38, k = K.io(t, a0, 1.15, 'out');
      if (k <= 0) return;
      const fx = x + (1 - k) * (30 * Math.sin(i * 2.1 + 1) + 22 * Math.sin((t - a0) * 7)), fy = y - (1 - k) * 300;
      const r = rot + (1 - k) * 0.5 * Math.sin((t - a0) * 9 + i);
      K.layer(Math.min(1, k * 2.5), () => K.at(fx, fy, 1, r, () => {
        const g = K.ctx(), w = 84, h = 60;
        K.card(-w / 2, -h / 2, w, h, { r: 4, fill: K.mixColor(C.tile, C.paper, 0.22), stroke: C.body, lw: 1.6, shadow: false });
        K.line(-w / 2, -h / 2 + 11, w / 2, -h / 2 + 11, { color: C.body, w: 1.2, alpha: 0.8 });
        [0, 1, 2].forEach((j) => { g.save(); g.beginPath(); g.arc(-w / 2 + 8 + j * 7, -h / 2 + 5.5, 2.2, 0, 7); g.fillStyle = C.body; g.globalAlpha *= 0.8; g.fill(); g.restore(); });
        K.card(-w / 2 + 7, -h / 2 + 17, 30, 34, { r: 2, fill: K.mixColor(C.tile, C.soft, 0.35), stroke: K.mixColor(C.tile, C.soft, 0.35), lw: 1, shadow: false });
        K.line(-w / 2 + 44, -h / 2 + 23, w / 2 - 8, -h / 2 + 23, { color: C.soft, w: 3, alpha: 0.55 });
        K.line(-w / 2 + 44, -h / 2 + 33, w / 2 - 14, -h / 2 + 33, { color: C.soft, w: 3, alpha: 0.55 });
        K.line(-w / 2 + 44, -h / 2 + 43, w / 2 - 20, -h / 2 + 43, { color: C.soft, w: 3, alpha: 0.55 });
      }));
    });

    // the tag on the board: 'public', then '?'; it hangs just under the board's frame, between its legs
    const tagIn = K.io(t, cBoard + 2.0, 0.6), toQ = K.io(t, wTell, 0.6);
    const tagX = B.x + B.w / 2, tagDY = 8 + 26 * tsc, tagY = B.y + B.h + tagDY;
    if (tagIn > 0 && boardK > 0.5) K.at(tagX, B.y + B.h, 1, K.wave(t, 1.1, 0.04), () => {
      K.line(0, 0, 0, 10, { color: C.soft, w: 2, alpha: tagIn });
      if (toQ < 1) K.pill('public', 0, tagDY, { size: 26 * tsc, color: C.accent, stroke: C.accent, fill: C.tile, alpha: tagIn * (1 - toQ) });
      if (toQ > 0) K.pill('?', 0, tagDY, { size: 30 * tsc, w: 64 * tsc, color: C.head, stroke: C.head, fill: C.tile, alpha: toQ, glow: 0.6 * K.io(t, wWhether, 0.6) });
    });
    // known public: a shield over the board, which fades once visibility can't be told
    const shA = K.io(t, cKnown + 0.2, 0.6, 'out') * (1 - K.io(t, wTell, 0.7));
    if (shA > 0) K.layer(shA, () => {
      const cx = B.x + B.w / 2, cy = B.y + B.h / 2 - (1 - shA) * 10, g = K.ctx();
      g.save(); g.beginPath(); g.arc(cx, cy, 46, 0, 7); g.fillStyle = C.page; g.fill(); g.lineWidth = 3; g.strokeStyle = C.head; g.stroke(); g.restore();
      K.icon('shield', cx, cy, 56, { color: C.head, w: 2.8 });
    });
    // the label above the board, right-aligned inside the frame's gutter so it never runs off screen
    const lbX = Math.min(B.x + B.w, VB.x + (1828 - 960) / VB.z);
    // two short lines in a small card, so it fits between the station and the gutter
    const lb = (lines, a, o = {}) => {
      if (a <= 0.002) return;
      const sz = 26 * tsc, to = { font: 'ui', weight: 600, size: sz }, lh = sz * 1.3, pad = 16 * tsc, is = o.icon ? sz * 1.4 : 0;
      const w = Math.max(...lines.map((l) => K.measure(l, to))) + is + pad * 2, h = lines.length * lh + pad * 1.4;
      const x0 = lbX - w, y0 = B.y - 24 * tsc - h, col = o.color || C.strong;
      K.layer(a, () => {
        K.card(x0, y0, w, h, { r: 14 * tsc, fill: C.tile, stroke: o.color || C.line2, lw: 2, shadow: false });
        if (o.icon) K.icon(o.icon, x0 + pad + sz * 0.5, y0 + h / 2, sz * 1.1, { color: col, w: 2.4 });
        lines.forEach((l, j) => K.text(l, x0 + pad + is, y0 + pad * 0.7 + lh * (j + 0.72), { ...to, color: col }));
      });
    };
    lb(['read by anyone', 'passing'], K.io(t, wAnyone, 0.5) * (1 - K.io(t, cKnown - 0.2, 0.4)));
    lb(['known public:', 'blocked'], K.io(t, cKnown + 0.3, 0.5) * (1 - K.io(t, wTell, 0.4)), { color: C.head, icon: 'shield' });
    lb(['visibility not', 'established'], K.io(t, wTell + 0.3, 0.5), { icon: 'question' });

    // the walker reads it: below the station card, clear of its border
    const wA = K.io(t, cBoard + 0.5, 0.6);
    const qK = K.io(t, wWhether, 0.7);
    const WX = L.walker[0], WY = L.walker[1] + 50;
    const look = [K.lerp(B.x - 12, tagX - 40 * tsc, qK), K.lerp(B.y + 130, tagY, qK)];
    M.walker(t, WX, WY, { alpha: wA, look, sightK: K.io(t, cBoard + 1.2, 0.8), sightAlpha: K.lerp(0.4, 1, qK), label: qK > 0.02 ? 'yours to know' : undefined, ts: tsc });
  });

  // ---------------------------------------------------------------- source panels (screen space, left column)
  const MV = M.MOVES;
  const panel = (x, y, w, alpha, items) => {
    if (alpha <= 0.002) return;
    const pad = 30, iw = w - pad * 2, gap = 14;
    const lay = items.map((it) => {
      let h = 0, lines = [];
      if (it.kind === 'eyebrow') { lines = K.wrap(String(it.text).toUpperCase(), iw, M.T.eyebrow); h = lines.length * 32 - 8; }
      else if (it.kind === 'body') { const o = { ...M.T.read, size: it.size || 30, italic: it.italic }; lines = K.wrap(it.text, iw - (it.icon ? 46 : 0), o); h = lines.length * o.size * 1.36 - o.size * 0.36; }
      else if (it.kind === 'note') { lines = K.wrap(it.text, iw, { font: 'ui', size: 26 }); h = lines.length * 36 - 10; }
      else if (it.kind === 'chips') h = it.rows.length * 62 - 12;
      else h = 50;
      return { ...it, lines, h, k: K.clamp(it.k == null ? 1 : it.k) };
    });
    let H = pad * 2 - gap;
    lay.forEach((it) => { H += (it.h + gap) * K.ease.io(K.clamp(it.k * 1.6)); });
    K.layer(alpha, () => {
      K.card(x, y, w, H, { r: 24, stroke: C.line2, lw: 1.5 });
      let cy = y + pad;
      lay.forEach((it) => {
        const grow = K.ease.io(K.clamp(it.k * 1.6));
        if (grow <= 0) return;
        const a = K.clamp((it.k - 0.25) / 0.75), dy = (1 - K.ease.out(a)) * 10;
        K.layer(a, () => {
          if (it.kind === 'eyebrow') it.lines.forEach((ln, i) => K.text(ln, x + pad, cy + 20 + i * 32 + dy, { ...M.T.eyebrow, color: it.color || C.head }));
          else if (it.kind === 'body') {
            const sz = it.size || 30;
            if (it.icon) K.icon(it.icon, x + pad + 16, cy + sz * 0.45 + dy, 32, { color: C.head, w: 2.6 });
            it.lines.forEach((ln, i) => K.text(ln, x + pad + (it.icon ? 46 : 0), cy + sz * 0.8 + i * sz * 1.36 + dy, { ...M.T.read, size: sz, italic: it.italic, color: it.color || C.strong }));
          } else if (it.kind === 'note') it.lines.forEach((ln, i) => K.text(ln, x + pad, cy + 26 + i * 36 + dy, { font: 'ui', size: 26, weight: 600, color: it.color || C.soft }));
          else if (it.kind === 'chips') it.rows.forEach((row, r) => { let cx = x + pad; row.forEach((s) => { cx += M.chip(s, cx, cy + 25 + r * 62 + dy, { color: C.head }) + 14; }); });
          else if (it.kind === 'footer') M.pillL(it.text || MV, x + pad, cy + 25 + dy, { size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel });
          else if (it.kind === 'pill') M.pillL(it.text, x + pad, cy + 25 + dy, { size: 26, color: C.strong, fill: C.panel, stroke: C.strong });
        });
        cy += (it.h + gap) * grow;
      });
    });
  };

  // auto mode: pushing is allowed, the default branch included. Top-right band, one card at a time, so the trail on
  // the left stays visible: the current rule first, then (once it has been read) the dated history note replaces it
  const swapT = cAuto + 6.4;
  const autoA = K.io(t, cAuto + 0.3, 0.6) * (1 - K.io(t, swapT, 0.4));
  panel(1190, 140, 620, autoA, [
    { kind: 'eyebrow', text: 'Anthropic · Choose a permission mode · ' + MV },
    { kind: 'body', size: 28, text: '“Pushing to any branch of the repository you\'re working in, including the default branch”' },
    { kind: 'note', text: 'allowed by default in auto mode', color: C.head },
  ]);
  const histA = K.io(t, swapT + 0.3, 0.5) * (1 - K.io(t, cDeploy + 2.4, 0.5));
  panel(1190, 140, 620, histA, [
    { kind: 'eyebrow', text: 'Earlier advice is out of date', color: C.soft },
    { kind: 'body', size: 28, text: 'For about a week in July 2026 (v2.1.203 to v2.1.211) auto mode allowed fewer pushes.' },
    { kind: 'note', text: 'versions: Choose a permission mode · dates: Claude Code changelog' },
  ]);

  // deploy-named branches, and the remote's own protection
  const depA = K.io(t, cDeploy + 0.2, 0.6) * (1 - K.io(t, cBoard - 0.3, 0.5));
  panel(100, 160, 610, depA, [
    { kind: 'eyebrow', text: 'Anthropic · Choose a permission mode · ' + MV },
    { kind: 'body', text: 'A branch named like a deploy target (production, gh-pages): that default “isn\'t covered”; it is judged on its own.' },
    { kind: 'body', text: '“The remote\'s own branch protection still applies.”', icon: 'shield', k: K.io(t, wProt, 0.6) },
  ]);

  // PixelLeak
  const pixA = K.io(t, cPixel + 0.2, 0.6) * (1 - K.io(t, cKnown - 0.5, 0.5));
  panel(90, 160, 750, pixA, [
    { kind: 'eyebrow', text: 'PixelLeak · Glow Labs research 2026-09-29 · reported by Hive Security 2026-10-02' },
    { kind: 'body', text: 'Coding agents with no private place to attach an image put internal screenshots in public GitHub repositories.', k: K.io(t, cPixel + 0.6, 0.6) },
    { kind: 'note', text: 'one helper’s default:', k: K.io(t, wOne, 0.6) },
    { kind: 'pill', text: '“creates a public gitshot-images repository”', k: K.io(t, wOne + 0.2, 0.6) },
    { kind: 'chips', rows: [['13,000+ images', '300+ organisations'], ['93% under personal usernames']], k: K.io(t, wThirteen, 0.6) },
    { kind: 'note', text: 'the researcher\'s count, not independently audited', k: K.io(t, wCount, 0.6) },
  ]);
  void wOrgs;

  // what auto mode does about visibility: the card keeps the two visibility statements; the sensitive-files rule is
  // its own chip row under it, beside the 'secrets file' tag
  const visA = K.io(t, cKnown + 0.1, 0.6);
  panel(90, 160, 750, visA, [
    { kind: 'eyebrow', text: 'Anthropic · Choose a permission mode · ' + MV },
    { kind: 'body', text: 'Secrets or personal data, pushed to a repository known to be public: blocked.' },
    { kind: 'body', size: 28, text: '“When a repository\'s visibility isn\'t established, the classifier doesn\'t block on that alone; it judges the content against the other rules instead.”', k: K.io(t, wTell, 0.6) },
  ]);
  const secK = K.io(t, wFiles, 0.6, 'out'), secR = K.io(t, wFiles + 0.5, 0.6, 'out');
  if (secK > 0) {
    const y1 = 560 + (1 - secK) * 12;
    const w1 = M.pillL('secrets file', 100, y1, { size: 26, color: C.strong, stroke: C.head, fill: C.tile, icon: 'shield', iconColor: C.head, alpha: secK });
    M.pillL('files marked sensitive: blocked either way', 100 + w1 + 14, y1, { size: 26, color: C.head, stroke: C.line2, fill: C.panel, alpha: secR });
    M.pillL('“the repository being private doesn\'t clear it”', 100, y1 + 62, { size: 26, color: C.body, stroke: C.line2, fill: C.panel, alpha: secR });
  }
});
