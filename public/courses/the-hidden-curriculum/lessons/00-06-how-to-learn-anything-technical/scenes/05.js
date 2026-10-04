/* 00.06 scene 05: It works, and it's unsafe.
   The hero house (lit, from 04, centred) opens into its four rooms, then slides right to pair with a "before" ghost
   house that collapses (loud errors). "Now": a burglar walks in through the back door of the working house (quiet
   errors) and it leaks. On "valid" the ghost is gone and the house eases left for the right column: Veracode Jul 2026
   (valid ~100%, secure 56%, 2025: 55%) and Stanford 2022. The burglar creeps across the key room meanwhile.
   Last beat: the owner's view cone lights only the rooms they can see; the back door stays outside it. */
SCENE('05', (t, S) => {
  const C = K.C, P = M.palette;
  const cLoud = S.cue('loud', 3.4), cQuiet = S.cue('quiet', 8.4), cValid = S.cue('valid', 17.9);
  const cHalf = S.cue('half', 20.0), cStan = S.cue('stanford', 30.5), cElse = S.cue('someone-else', 41.5);
  const tUsed = S.find('used', 0, cLoud - 1.3);           // "They used to be loud"
  const tWalk = S.find('walk', 0, cQuiet + 0.7);          // "walk right in"
  const tAbove = S.find('Above', 0, cQuiet + 2.2);        // "Above all, ... security holes"
  const tYear = S.find('year', 0, cHalf + 3.6);           // "about the same as a year earlier"
  const tAtt = S.find('attacker', 0, cElse + 5.2);


  // ------------------------------------------------ the house: centred (from 04), cut away, then a before/now pair
  const L = M.layout.left;
  const PAIR_X = 1240, GHOST_X = 620;                      // "before" ghost left, "now" house right
  const toPair = K.io(t, tUsed - 0.5, 0.8, 'io');          // makes room for the ghost on "used to be loud"
  const ghostGone = K.io(t, cValid - 1.5, 0.7, 'io');      // ghost leaves as the house starts to slide
  const toLeft = K.io(t, cValid - 1.0, 0.8, 'io');         // house eases left as the Veracode card arrives
  const hx = K.lerp(K.lerp(960, PAIR_X, toPair), L.x, toLeft);
  const cut = K.io(t, 0.3, 1.0, 'io');
  const hot = K.io(t, cQuiet + 0.2, 0.7, 'out');
  const coneK = K.io(t, cElse, 0.9, 'out');
  const houseO = {
    lights: 1,
    cutaway: cut,
    roomHot: { back: hot },
    roomLit: { living: coneK, front: coneK },
    backOpen: K.io(t, tWalk - 1.0, 0.7, 'io'),
    leak: K.io(t, tAbove, M.motion.leak, 'lin'),
  };
  K.bg({ glow: 0.35, glowX: K.lerp(hx, 900, toPair * (1 - toLeft)), glowY: 600 });   // glow follows the house (pair: between both)
  const gm = M.house(t, hx, L.y, L.s, houseO);
  const R = gm.rooms;

  // Work-around: 00-shared.js nests K.mixColor (which returns rgb(), not hex), so its room fill comes out #000.
  // Repaint the four room cards with a single hex mix, then redraw their icons (same colours as M.house).
  const hexMix = (a, b, k) => {
    const A = parseInt(a.slice(1), 16), Bc = parseInt(b.slice(1), 16);
    const ch = (sh) => Math.round(K.lerp((A >> sh) & 255, (Bc >> sh) & 255, k)).toString(16).padStart(2, '0');
    return '#' + ch(16) + ch(8) + ch(0);
  };
  if (cut > 0) {
    const g = K.ctx(), lw = Math.max(1.6, L.s * 0.007);
    Object.keys(R).forEach((key, i) => {
      const r = R[key], rk = K.clamp(cut * 1.6 - i * 0.15);
      if (rk <= 0) return;
      const lit = K.clamp(houseO.roomLit[key] || 0), ht = K.clamp(houseO.roomHot[key] || 0);
      g.save(); g.globalAlpha *= rk;
      K.rr(r.x, r.y, r.w, r.h, Math.min(12, L.s * 0.03));
      g.fillStyle = hexMix(hexMix(P.room, '#3A3226', lit), '#3A2522', ht); g.fill();
      g.strokeStyle = ht > 0.05 ? K.mixColor(C.line2, P.unseen, ht) : K.mixColor(C.line2, P.machine, lit * 0.8);
      g.lineWidth = lw; g.stroke();
      g.restore();
      if (lit > 0) K.layer(rk * lit, () => K.glow(r.cx, r.cy, r.w * 0.55, C.head, 0.22));
      const icColor = ht > 0.05 ? P.unseen : lit > 0.3 ? P.machine : C.body;
      K.icon(r.icon, r.cx, r.cy, Math.min(r.w, r.h) * 0.5, { color: icColor, alpha: rk, w: Math.max(2, L.s * 0.008) });
    });
  }

  // the owner's view cone (drawn over the rooms, under the people)
  const ownerX = R.front.x + 26, ownerY = R.front.y + R.front.h - 6;
  if (coneK > 0) {
    const g = K.ctx(), B = gm.body;
    g.save(); g.beginPath(); g.rect(B.x0, B.y0, B.x1 - B.x0, B.y1 - B.y0); g.clip();   // the view stays indoors
    M.cone(ownerX + 6, ownerY - 50, -Math.PI / 2 - 0.12, 0.62, 250, coneK);
    g.restore();
  }

  // owner inside the front room
  M.person(t, ownerX, ownerY, 70, 'owner', { alpha: K.io(t, 1.2, 0.6, 'out'), i: 1 });

  // burglar: walks in from the right along the ground, through the back door, then creeps slowly across the key room
  const bw = K.io(t, cQuiet - 0.3, 1.9, 'io');
  if (bw > 0) {
    const gx0 = gm.body.x1 + 210, gx1 = R.back.x + R.back.w - 20;
    const creep = K.io(t, cHalf + 4.6, cElse - 1.0 - (cHalf + 4.6), 'io');      // slow walk, "Everything else got better" → "invisible?"
    const bx = bw < 1 ? K.lerp(gx0, gx1, bw) : K.lerp(gx1, R.back.x + 34, creep);
    const by = bx > gm.body.x1 ? gm.ground : K.lerp(gm.ground, R.back.y + R.back.h - 6, K.clamp((gm.body.x1 - bx) / 20));
    M.person(t, bx, by, 70, 'burglar', { face: -1, i: 2, alpha: K.clamp(bw * 5), sway: bw >= 1, propK: 1 - K.clamp((gm.body.x1 + 10 - bx) / 30) });
  }

  // ------------------------------------------------ "before": the ghost house, the loud error (it crashed)
  const gIn = K.io(t, tUsed - 0.1, 0.6, 'out');
  const gOut = 1 - ghostGone;
  const gA = gIn * gOut;
  if (gA > 0) {
    const gs = 240, gx = GHOST_X, gy = gm.ground - gs * 0.36, gg = M.geo(gx, gy, gs);
    const fall = K.io(t, cLoud, 0.9, 'in');
    K.layer(gA, () => {
      // M.house resets globalAlpha internally, so the ghost leaves by rising from and sinking below its ground line (clipped)
      const sink = (1 - Math.min(gIn, gOut)) * gs * 0.95;
      const g = K.ctx(); g.save();
      g.beginPath(); g.rect(gx - gs, gg.ground - gs * 1.2, gs * 2, gs * 1.2 + 34); g.clip();
      K.at(gx + gs * 0.3, gg.ground + sink, 1, fall * 0.32, () => {
        K.at(0, fall * 26, 1, 0, () => {
          M.house(t, -gs * 0.3, gy - gg.ground, gs, { ghost: true, noGround: true });
        });
      });
      g.restore();
      K.line(gx - gs * 0.6, gg.ground, gx + gs * 0.6, gg.ground, { color: C.line2, w: 2 });
      K.pop(t, cLoud + 0.35, gx, gy + 10, () => K.icon('cross', gx, gy + 10, 64, { color: C.strong, w: 5 }));
      M.chip('before: loud, it crashed', gx, 380, 'neutral', { icon: 'cross', k: K.io(t, cLoud, 0.5, 'out') });
    });
  }

  // ------------------------------------------------ the quiet error
  M.chip('now: quiet, it works and leaks', hx, 380, 'unseen', { k: K.io(t, cQuiet, 0.5, 'out') });

  // ------------------------------------------------ common holes (on screen only, not taught)
  const holesA = 1 - K.io(t, cElse - 0.2, 0.6, 'io');
  const holes = ['injection', 'cross-site scripting', 'missing access checks'];
  K.layer(holesA, () => {
    K.layer(K.io(t, cHalf + 0.6, 0.5, 'out'), () => K.eyebrow('common holes', 270, 548, { color: C.soft, size: 22, align: 'center' }));
    holes.forEach((h, i) => {
      M.chip(h, 270, 604 + i * 72, 'unseen', { size: 26, k: K.stagger(t, cHalf + 0.7, i, 0.35, 0.5) });
    });
  });

  // ------------------------------------------------ Veracode card (right column)
  const X0 = M.layout.rightCol.x0, W = 620, pad = 36;
  const dimCards = 1 - 0.5 * K.io(t, cElse, 0.8, 'io');
  const vK = K.io(t, cValid - 0.1, 0.6, 'out');
  if (vK > 0) {
    const y0 = 188, h = 318;
    K.layer(vK * dimCards, () => K.at(0, (1 - vK) * 18, 1, 0, () => {
      K.card(X0, y0, W, h, { r: 18 });
      const g = K.ctx();
      g.fillStyle = P.unseen; K.rr(X0 + 10, y0 + 16, 5, h - 32, 3); g.fill();
      K.eyebrow('Veracode · Jul 2026', X0 + pad + 8, y0 + 44, { size: 22, color: C.head, tracking: 3 });
      const bx0 = X0 + pad + 8, bx1 = X0 + W - pad, bw2 = bx1 - bx0;
      const bar = (y, frac, color, k) => {
        K.card(bx0, y, bw2, 16, { r: 8, fill: C.line, stroke: false, shadow: false });
        if (k > 0) K.card(bx0, y, Math.max(16, bw2 * frac * k), 16, { r: 8, fill: color, stroke: false, shadow: false });
      };
      // row 1: valid code
      const k1 = K.io(t, cValid + 0.2, 0.9, 'out');
      K.text('valid code', bx0, y0 + 104, { ...M.type.read, color: C.strong });
      K.text('~100%', bx1, y0 + 104, { ...M.type.read, color: P.machine, align: 'right', alpha: k1 });
      bar(y0 + 124, 1, P.machine, k1);
      // row 2: passes security
      const r2 = K.io(t, cHalf - 0.1, 0.5, 'out'), k2 = K.io(t, cHalf + 0.2, 0.9, 'out');
      K.layer(r2, () => {
        K.text('passes security', bx0, y0 + 202, { ...M.type.read, color: C.strong });
        K.text('56%', bx1, y0 + 202, { ...M.type.read, color: P.unseen, align: 'right', alpha: k2 });
        bar(y0 + 222, 0.56, P.unseen, k2);
      });
      // a year earlier: 55%, a tick on the same bar
      const k3 = K.io(t, tYear - 0.2, 0.6, 'out');
      K.layer(k3, () => {
        const tx = bx0 + bw2 * 0.55;
        K.line(tx, y0 + 214, tx, y0 + 246, { color: C.strong, w: 2.5 });
        K.text('2025: 55%', tx, y0 + 282, { ...M.type.label, color: C.soft, align: 'center' });
      });
    }));
  }

  // ------------------------------------------------ Stanford 2022 card
  M.dated(X0, 540, W, 'Stanford · 2022', 'AI users wrote less secure code, and felt surer it was safe', {
    kind: 'unseen', badge: { text: 'early tools', kind: 'preview' },
    k: K.io(t, cStan, 0.6, 'out'), alpha: dimCards,
  });

  // ------------------------------------------------ why it's invisible
  M.label('Security = what someone else can do', L.x, 850, 'unseen', { alpha: K.io(t, cElse + 0.1, 0.6, 'out') });
  M.label('you test as you · they test as everyone', L.x, 900, 'note', { size: 28, alpha: K.io(t, tAtt - 0.1, 0.6, 'out') });
});
