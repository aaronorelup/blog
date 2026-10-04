/* 00.06 · 08 — Where the picture breaks.
   The house metaphor visibly cracks in three places (three dots under the eyebrow fill as each is named):
   1 [[rooms]] an inspector walks all four rooms, each checked gold; [[not-proven]] a thicket of program paths
     spreads far past the walls: "inspected ≠ proven safe".
   2 [[own-report]] camera slides the house left; an inspection report signed by a crew sparkle; on "AI" the
     inspector gets the AI badge: "AI inspector = another crew member", "independent authority" struck.
   3 [[every-door]] camera pulls back to the street (09's layout: 5 houses, s 220, gap 330, y 560); burglars at
     every door at once; on "Now with AI" some of them get the AI sparkle.
   World coords = the street; the opening frame is the street's middle house zoomed to the hero size (s ≈ 420). */
SCENE('08', (t, S) => {
  const C = K.C, P = M.palette;
  const cRooms = S.cue('rooms', 2.64), cNot = S.cue('not-proven', 8.77),
    cOwn = S.cue('own-report', 12.42), cDoor = S.cue('every-door', 22.08);
  const tPath = S.find('path', 0, 7.22), tOwnWord = S.find('own', 0, 13.48), tAI = S.find('AI', 0, 15.45),
    tMember = S.find('member', 0, 16.9), tNot = S.find(/^not$/, 0, 18.17), tNow = S.find('Now', 0, 26.19);

  // ---- camera: world street (middle house at 960, 560, s 220) seen at hero size, then left, then all of it
  const SW = 220, HX = 960, HY = 560, Z = 420 / SW;
  const cyHero = HY - 60 / Z, cxLeft = HX + 260 / Z;
  const cam = K.cam(t, [
    { at: 0, x: HX, y: cyHero, z: Z },
    { at: cOwn - 0.2, x: cxLeft, y: cyHero, z: Z, d: 0.9 },
    { at: cDoor - 0.4, x: 960, y: 540, z: 1, d: 1.5 },
  ]);
  const toScreen = (x, y) => [960 + cam.z * (x - cam.x), 540 + cam.z * (y - cam.y)];

  K.bg({ glow: 0.4, glowX: 960, glowY: 600 });

  // ---- house timeline
  const cutK = K.io(t, 0.5, 1.0) * (1 - K.io(t, cDoor - 1.0, 0.7));
  const gm = M.geo(HX, HY, SW), R = gm.rooms;
  const order = ['front', 'living', 'data', 'back'];
  const arrive = [cRooms + 0.35, cRooms + 1.25, cRooms + 2.15, cRooms + 3.05];   // reach each room
  const litK = (key) => K.io(t, arrive[order.indexOf(key)], 0.5, 'out');
  const neighK = K.io(t, cDoor - 0.2, 1.0, 'out');

  K.withCam(cam, () => {
    M.street(t, 960, HY, 5, SW, 330, {
      each: (i) => i === 2
        ? { cutaway: cutK, roomLit: litK }
        : { alpha: neighK },
    });

    // checks in each room as the inspector reaches it
    order.forEach((key, i) => {
      const r = R[key], ck = K.io(t, arrive[i] + 0.1, 0.45, 'out') * cutK;
      if (ck > 0) K.icon('check', r.x + r.w - 11, r.y + 11, 13 * (0.7 + 0.3 * ck), { color: P.machine, alpha: ck, w: 2.2 });
    });

    // the inspector's dotted route and the inspector himself (world size 37 → about 70 on screen)
    const feet = order.map((k) => [R[k].x + 10, R[k].y + R[k].h - 3]);
    const routeK = K.seg(t, arrive[0], arrive[3]);
    const inspA = K.io(t, cRooms, 0.4) * cutK;
    if (inspA > 0) {
      K.path(feet, { k: routeK, color: C.strong, w: 1.4, dash: [3, 5], head: false, alpha: 0.55 * cutK, tension: 0 });
      let px = feet[0][0], py = feet[0][1];
      for (let i = 1; i < 4; i++) {
        const m = K.io(t, arrive[i] - 0.65, 0.65, 'io');
        if (m <= 0) break;
        px = K.lerp(feet[i - 1][0], feet[i][0], m); py = K.lerp(feet[i - 1][1], feet[i][1], m);
      }
      M.person(t, px, py, 37, 'inspector', { alpha: inspA, ai: K.io(t, tAI, 0.6, 'out') });
    }
  });

  // ---- break 1: the thicket of paths (screen space, around the house)
  const webIn = K.io(t, tPath - 0.3, 0.1), webOut = 1 - K.io(t, cOwn - 0.6, 0.8);
  if (webIn > 0 && webOut > 0) {
    const r = K.rng(808), N = 44, hx = 960, hy = 600;
    const col = K.mixColor(C.line2, C.accent, 0.45);
    K.layer(webOut, () => {
      for (let i = 0; i < N; i++) {
        const sx = hx + (r() - 0.5) * 300, sy = hy - 20 + (r() - 0.5) * 170;
        let ang = r() * Math.PI * 2, x = sx, y = sy;
        const pts = [[x, y]], steps = 5 + Math.floor(r() * 3);
        for (let j = 0; j < steps; j++) {
          ang += (r() - 0.5) * 1.3;
          const len = 70 + r() * 70;
          x += Math.cos(ang) * len; y += Math.sin(ang) * len * 0.62;
          // keep inside an ellipse clear of the eyebrow and the chip band
          const ex = (x - hx) / 760, ey = (y - (hy - 10)) / 285, d = Math.hypot(ex, ey);
          if (d > 1) { x = hx + (x - hx) / d; y = hy - 10 + (y - hy + 10) / d; ang += Math.PI * 0.6; }
          pts.push([x, y]);
        }
        const k = K.stagger(t, tPath - 0.2, i, 0.035, 1.1, 'out');
        if (k <= 0) continue;
        K.path(pts, { k, color: col, w: 1.8, head: false, alpha: 0.75 });
        const g = K.ctx();
        pts.forEach((p, j) => {
          if (j / (pts.length - 1) > k) return;
          g.save(); g.globalAlpha *= 0.8; g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1], 3.2, 0, 7); g.fill(); g.restore();
        });
      }
    });
  }

  // ---- break 1 chips (bottom band, one idea at a time)
  const chipY = 878;
  const roomsChip = K.io(t, arrive[3] + 0.2, 0.5, 'out') * (1 - K.io(t, cNot - 0.45, 0.4));
  if (roomsChip > 0) M.chip('every room checked', 960, chipY, 'machine', { k: 1, alpha: roomsChip });
  const npChip = K.io(t, cNot, 0.5, 'out') * (1 - K.io(t, cOwn - 0.6, 0.6));
  if (npChip > 0) M.chip('inspected ≠ proven safe', 960, chipY, 'unseen', { k: Math.min(1, npChip * 1.6), alpha: npChip });

  // ---- break 2: the report card in the right column
  const repOut = 1 - K.io(t, cDoor - 1.3, 0.5);
  const repK = K.io(t, cOwn + 0.15, 0.6, 'out') * repOut;
  const CX = 1190, CY = 250, CW = 600, CH = 400;
  if (repK > 0) {
    K.layer(repK, () => {
      const g = K.ctx(); g.save(); g.translate(0, (1 - repK) * 18);
      K.card(CX, CY, CW, CH, { r: 20, stroke: K.mixColor(C.line2, C.head, 0.35) });
      K.eyebrow('INSPECTION REPORT', CX + 40, CY + 58, { size: 22 });
      const rows = ['every room: safe', 'no problems found'];
      rows.forEach((s, i) => {
        const y = CY + 122 + i * 58;
        K.icon('check', CX + 56, y - 10, 30, { color: P.machine, w: 3 });
        K.text(s, CX + 88, y, { font: 'ui', weight: 600, size: 30, color: C.strong });
      });
      K.line(CX + 40, CY + 248, CX + CW - 40, CY + 248, { color: C.line2, w: 1.5 });
      K.text('signed by', CX + 40, CY + 318, { font: 'ui', weight: 600, size: 26, color: C.soft });
      // the crew's sparkle signs it on "own"
      const sg = K.io(t, tOwnWord - 0.1, 0.6, 'out');
      if (sg > 0) {
        K.glow(CX + 210, CY + 308, 52 * sg, C.head, 0.3 * sg);
        M.sparkleShape(CX + 210, CY + 308, 30 * K.ease.out(sg), P.crew, sg);
        K.text('the crew', CX + 252, CY + 318, { font: 'ui', weight: 600, size: 26, color: P.crew, alpha: sg });
      }
      // the inspector, on the card's right, gets the AI badge
      M.person(t, CX + CW - 110, CY + CH - 34, 110, 'inspector', { ai: K.io(t, tAI, 0.6, 'out'), i: 1 });
      g.restore();
    });
  }
  const aiLab = K.io(t, tMember - 0.4, 0.6, 'out') * repOut;
  if (aiLab > 0) M.label('AI inspector = another crew member', CX + CW / 2, CY + CH + 70, 'machine', { alpha: aiLab });
  const offK = K.io(t, tNot, 0.5, 'out') * repOut;
  if (offK > 0) M.chip('independent authority', CX + CW / 2, CY + CH + 150, 'off', { k: Math.min(1, offK * 1.6), alpha: offK });

  // ---- break 3: burglars at every door of every house (screen = world here, z ends at 1)
  if (t > cDoor - 0.5) {
    const bs = 64, ground = HY + 0.36 * SW;
    const spots = [];
    for (let i = 0; i < 5; i++) {
      const hx = 960 + (i - 2) * 330;
      spots.push({ x: hx - 0.19 * SW - 2, face: 1 });            // front door
      spots.push({ x: hx + 0.38 * SW + 22, face: -1 });          // back door
    }
    const orderB = [3, 6, 0, 9, 4, 1, 7, 2, 8, 5];                // "at once": scattered, not left to right
    const aiSet = new Set([1, 3, 4, 6, 9]);
    spots.forEach((sp, j) => {
      const k = K.stagger(t, cDoor + 0.6, orderB.indexOf(j), 0.12, 0.6, 'out');
      if (k <= 0) return;
      const [sx, sy] = toScreen(sp.x, ground);
      const ai = aiSet.has(j) ? K.stagger(t, tNow + 0.1, [...aiSet].indexOf(j), 0.12, 0.5, 'out') : 0;
      M.person(t, sx, sy + (1 - k) * 14, bs * cam.z, 'burglar', { alpha: k, face: sp.face, ai, i: j });
    });
    const d1 = K.io(t, cDoor + 1.0, 0.5, 'out');
    if (d1 > 0) M.chip('every door, every house, at once', 960, 790, 'unseen', { k: Math.min(1, d1 * 1.6), alpha: d1 });
    const d2 = K.io(t, tNow, 0.5, 'out');
    if (d2 > 0) M.chip('now with AI too', 960, 870, 'unseen', { k: Math.min(1, d2 * 1.6), alpha: d2, icon: 'sparkle' });
  }

  // ---- eyebrow + three-break counter (screen space, from the first frame)
  K.eyebrow('WHERE THE PICTURE BREAKS', 960, 168, { align: 'center', size: 22 });
  [cNot, cOwn, cDoor].forEach((at, i) => {
    const x = 960 + (i - 1) * 34, y = 202, f = K.io(t, at, 0.5, 'out');
    const g = K.ctx(); g.save();
    g.lineWidth = 2; g.strokeStyle = K.mixColor(C.line2, C.accent, f);
    g.beginPath(); g.arc(x, y, 8, 0, 7); g.stroke();
    if (f > 0) { g.globalAlpha *= f; g.fillStyle = C.accent; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); }
    g.restore();
  });
});
