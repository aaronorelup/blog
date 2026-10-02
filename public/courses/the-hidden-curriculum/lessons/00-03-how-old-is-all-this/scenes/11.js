/* 00.03 · 11 — The metal wears out
   The lock opened up: its metal (the math) shown as a shelf of lock cores that age and crack.
   - Frame 0 = 10's exit pose for the building ('left', ~.32). The camera pushes (0.8 s) into its door lock; the passkey icon
     cross-dissolves into a big cut-away padlock (x1.35) that sits framed in the ghosted door. The building never leaves.
   - "the metal: the math": a window in the lock body shows five brass pins. "scrambles data" (left label) -> pins jiggle;
     "checks nothing changed" (right label) -> pins line up on the shear line (gold).
   - [[metal]] "wears out too": the shackle opens and closes once, faint wear scratches; on "faster" a gear turns at right.
     On "shortcuts" the camera eases back (padlock x1.0, still in the door), the side labels clear and five dashed slots wait.
   - [[hashes]] MD5 fills slot 1, dims to .6 + strike (strike behind the words, full strength) on "broken"; SHA-1 fills slot 2,
     two different files point into one "same fingerprint" pill above it, then the card dims + strike.
   - [[tls]] TLS (small lock by its name on "lock behind HTTPS"): chip "1.0 · 1.1" retires on "retired"; under it "1.2" and
     "1.3" stay lit (both still in use).
     On "NIST" post-quantum rises (the scene's one 'back'), gold edge on "quantum".
   - [[git-hash]] git: pill repaints SHA-1 -> SHA-256 on "moving to"; a gold arrow of time draws under the shelf.
   - [[breaks]] two lines (charm / pick); the lock shakes, its pins line up by themselves and the shackle lifts: picked.
   Exit: the ghosted building door with the open padlock, the shelf of five cores old -> new, the two lines held. */
SCENE('11', (t, S) => {
  const M = window.M, C = K.C, g = K.ctx();

  // ---- times (local seconds)
  const cMetal = S.cue('metal', 6.04), cHash = S.cue('hashes', 11.04), cTls = S.cue('tls', 22.49);
  const cGit = S.cue('git-hash', 35.85), cBreaks = S.cue('breaks', 43.06);
  const tMetalW = S.find('metal', 0, 1.71), tScr = S.find('scrambles', 0, 2.95), tChecks = S.find('checks', 0, 4.0);
  const tWears = S.find('wears', 0, 6.34), tFaster = S.find('faster', 0, 8.08);
  const tBroken = S.find('broken', 0, 14.3), tSha = S.find(/^S$/, 0, 16.56), tFell = S.find('fell', 0, 17.62);
  const tTwo = S.find('two', 0, 20.13), tSame = S.find('same', 0, 21.21);
  const tLockW = S.find('lock', 1, 24.81), tRetired = S.find('retired', 0, 27.43);
  const tNist = S.find(/^N$/, 0, 31.28), tStandards = S.find('standards', 0, 33.03), tQuantum = S.find('quantum', 0, 34.72);
  // git's "S H A one": the first lone 'S' spoken after "commit" (T L S, H T T P S and N I S T also end in a lone S)
  const tCommit = S.find('commit', 0, 37.8);
  const shaW = S.words.find((w) => w[1] - S.start > tCommit && w[0].replace(/[^\w]/g, '') === 'S');
  const tShaGit = shaW ? shaW[1] - S.start : 38.31, tMoving = S.find('moving', 0, 40.15);
  const tOn = S.find(/^On$/, 0, 45.05), tSoftware = S.find('software', 0, 48.17), tSomebody = S.find('somebody', 0, 50.94);
  const tPick = S.find('pick', 0, 52.45);

  K.bg({ glow: 0.16, glowX: 960, glowY: 330 });

  // the dim floor strip from 10 settles away as the camera pushes in
  const stripA = 0.3 * (1 - K.io(t, 0.1, 0.6));
  if (stripA > 0.002) M.street(t, { geom: 'floor', alpha: stripA, show: 0, lanterns: 0, cord: 0 });

  // ================================================================ camera: push into the building's door lock
  // The building never leaves: it stays ghosted behind, zoomed so its door frames the big padlock.
  const lockW = M.at('left', 'lock');               // the door lock in 'left' (world coords)
  const ZB = 2.4, BS = 1.25, ZS = ZB / BS;          // big: z 2.4 -> padlock x1.25; small (from "shortcuts"): padlock x1.0
  const tShort = S.find('shortcuts', 0, 9.72), SHR = tShort - 0.35;
  const camAt = (z, sy) => ({ x: lockW.x, y: lockW.y + (540 - sy) / z, z });
  const big = camAt(ZB, 340), small = camAt(ZS, 305);
  const cam = K.cam(t, [{ at: 0, x: 960, y: 540, z: 1 }, { at: 0.1, ...big, d: 0.8 }, { at: SHR, ...small, d: 0.9 }]);
  const dis = K.io(t, 0.45, 0.5);                   // the door's passkey icon cross-dissolves into the padlock
  const ghostA = K.lerp(K.lerp(0.32, 0.25, K.io(t, 0.1, 0.8)), 0.2, K.io(t, cHash - 0.4, 0.8));
  K.withCam(cam, () => M.building(t, {
    layout: 'left', alpha: ghostA, sign: 'Python 3.13',
    lock: [{ icon: 'passkey', alpha: 1 - dis }],
    fade: { stone: 1 - K.io(t, 0.1, 0.6), sign: 1 - K.io(t, 0.1, 0.6) },   // their zoomed text would clip at the frame edge / sit behind the shelf
    doorGlow: 0.5 * K.io(t, 0.3, 0.6),
  }));
  // where the lock lands on screen, and how big the padlock is (it rides with the camera)
  const sx = 960 + (lockW.x - cam.x) * cam.z, sy = 540 + (lockW.y - cam.y) * cam.z;
  const ps = BS * cam.z / ZB;
  const LX = sx, LY = sy - 50 * ps;                 // padlock origin (body centre is +50 local)

  // ================================================================ the big cut-away padlock
  // pins: 5 stacks, resting offsets (locked), scramble jiggle, aligned when "checked"
  const REST = [-12, 9, -6, 13, -10];
  const scrK = K.env(t, tScr, tChecks - 0.05, 0.25);                       // jiggle while "scrambles data"
  const check1 = K.io(t, tChecks, 0.5) * (1 - K.io(t, tWears, 0.6));      // lined up on "checks", relaxes on "wears out"
  const shakeE = M.bump(t, tSomebody, 0.7);
  const pickK = K.io(t, tSomebody + 0.5, 0.6);                              // picked: pins line up by themselves
  const align = Math.max(check1, pickK);
  const pinOff = (i) => (1 - align) * (REST[i] + scrK * 9 * Math.sin(t * 9 + i * 1.9));
  const shear = Math.max(check1, 0.7 * pickK);    // the shear line glows when everything lines up

  // shackle: one open-and-close on [[metal]], lifts open for good when picked
  const wig = Math.sin(Math.PI * K.seg(t, cMetal + 0.05, cMetal + 0.65));
  const lift = Math.max(wig * 0.55, K.io(t, tPick - 0.4, 0.6));
  const shackleUp = 18 * lift, shackleRot = -0.2 * wig - 0.32 * K.io(t, tPick - 0.4, 0.6);
  const cutK = K.io(t, tMetalW - 0.1, 0.6);       // the cut-away window opens on "metal"
  const wearK = K.io(t, tWears, 0.8);
  const openGlow = K.io(t, tPick - 0.3, 0.8);
  const breakDim = K.io(t, cBreaks, 0.6);

  const padlock = (alpha) => K.layer(alpha, () => {
    const shake = shakeE * Math.sin(t * 40) * 4;
    g.save(); g.translate(shake, 0);
    if (openGlow > 0) K.glow(0, 0, 260, C.accent, 0.3 * openGlow);
    // shackle (behind the body; pivots on its left leg)
    g.save(); g.translate(-50, -10 - shackleUp); g.rotate(shackleRot); g.translate(50, 10);
    g.lineCap = 'butt';
    g.strokeStyle = K.mixColor(C.accent, C.panel, 0.35); g.lineWidth = 16;
    g.beginPath(); g.moveTo(-50, 14); g.lineTo(-50, -55); g.arc(0, -55, 50, Math.PI, 0); g.lineTo(50, 14); g.stroke();
    g.strokeStyle = K.mixColor(C.accent, C.strong, 0.15); g.lineWidth = 3;
    g.beginPath(); g.moveTo(-50, 14); g.lineTo(-50, -55); g.arc(0, -55, 50, Math.PI, 0); g.lineTo(50, 14); g.stroke();
    g.restore();
    // body
    K.card(-80, -10, 160, 120, { r: 16, fill: C.tile, stroke: C.accent, lw: 4, shadow: true });
    // wear: faint scratches on the body
    if (wearK > 0) K.layer(wearK * 0.8, () => {
      [[-70, 4, -52, 0], [56, 98, 72, 90], [-72, 96, -60, 104], [62, 2, 74, 8]].forEach(([a, b, c, d]) =>
        K.line(a, b, c, d, { color: C.quiet, w: 2 }));
    });
    // the cut-away window: brass pins across a shear line
    if (cutK > 0) K.layer(cutK, () => {
      K.rr(-62, 8, 124, 84, 8); g.fillStyle = K.mixColor(C.page, C.panel, 0.5); g.fill();
      g.strokeStyle = K.mixColor(C.line2, C.accent, 0.3); g.lineWidth = 2; g.stroke();
      g.save(); K.rr(-62, 8, 124, 84, 8); g.clip();
      if (shear > 0) K.glow(0, 50, 90, C.head, 0.22 * shear);
      K.line(-60, 50, 60, 50, { color: K.mixColor(C.line2, C.head, shear), w: 2, dash: [6, 6] });
      [-44, -22, 0, 22, 44].forEach((px, i) => {
        const o = pinOff(i);
        K.rr(px - 6, 12 + o, 12, 36, 4); g.fillStyle = K.mixColor(C.soft, C.panel, 0.2); g.fill();          // driver pin
        K.rr(px - 6, 52 + o, 12, 36 - i % 3 * 5, 4); g.fillStyle = K.mixColor(C.head, C.soft, 0.35); g.fill(); // key pin (brass)
      });
      g.restore();
    });
    g.restore();
  });

  // the padlock grows out of the door: cross-dissolve while the camera arrives
  const padA = dis;
  if (padA > 0) K.at(LX, LY, ps * K.lerp(0.85, 1, K.ease.out(dis)), 0, () => padlock(padA));

  // label under the lock (rides with it as the camera eases back)
  const bodyB = LY + 110 * ps;
  const labK = K.io(t, tMetalW, 0.6);
  if (labK > 0) K.text('the metal: the math', LX, bodyB + 46 + 10 * (1 - labK), { font: 'ui', weight: 600, size: 28, color: C.body, align: 'center', alpha: labK });

  // what the math does: two sub-labels either side of the big lock, on their words; they clear for the shelf
  const sideOut = 1 - K.io(t, SHR - 0.1, 0.6);
  const sk1 = K.io(t, tScr, 0.5) * sideOut, sk2 = K.io(t, tChecks, 0.5) * sideOut;
  const sideY = sy + 10, half = 80 * ps + 56;
  if (sk1 > 0) {
    K.text('scrambles data', LX - half + 14 * (1 - sk1), sideY, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'right', alpha: sk1 });
    K.line(LX - half + 14, sy, LX - 80 * ps - 12, sy, { k: K.io(t, tScr + 0.2, 0.5), color: K.rgba(C.soft, 0.7), w: 2.5, dash: [6, 6], alpha: sideOut });
  }
  if (sk2 > 0) {
    K.text('checks nothing changed', LX + half - 14 * (1 - sk2), sideY, { font: 'ui', weight: 600, size: 30, color: K.mixColor(C.strong, C.head, check1), align: 'left', alpha: sk2 });
    K.line(LX + half - 14, sy, LX + 80 * ps + 12, sy, { k: K.io(t, tChecks + 0.2, 0.5), color: K.rgba(C.soft, 0.7), w: 2.5, dash: [6, 6], alpha: sideOut });
  }

  // ---- the gear: computers get faster (turns a little faster as time passes, capped)
  const gk = K.io(t, tFaster, 0.6);
  if (gk > 0) {
    const dt = Math.max(0, t - tFaster), vEnd = 1.2, ramp = 10;
    const rot = dt < ramp ? 0.3 * dt + ((vEnd - 0.3) * dt * dt) / (2 * ramp) : 0.3 * ramp + ((vEnd - 0.3) * ramp) / 2 + vEnd * (dt - ramp);
    const ga = gk * (1 - 0.45 * K.io(t, cHash, 0.8));
    K.layer(ga, () => {
      K.at(1640, 300, 1, rot, () => K.icon('gear', 0, 0, 72, { color: C.soft, w: 3 }));
      K.text('faster computers', 1640, 384, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center' });
    });
  }

  // ================================================================ the metal shelf
  const XS = [300, 630, 960, 1290, 1620], SY = 580, W = 290, H = 200;
  const shelfA = 1 - 0.1 * breakDim;
  const ks = [K.io(t, cHash, 0.6), K.io(t, tSha, 0.6), K.io(t, cTls, 0.6), K.io(t, tNist, 0.5), K.io(t, cGit, 0.6)];
  // five empty slots wait from "wears out", so each core lands in a place already waiting for it
  const slotK = K.io(t, cMetal, 0.8);
  if (slotK > 0) XS.forEach((x, i) => {
    const a = slotK * 0.55 * (1 - ks[i]);
    if (a <= 0.003) return;
    K.layer(a, () => { g.save(); g.setLineDash([9, 9]); g.strokeStyle = C.line2; g.lineWidth = 2; K.rr(x - W / 2, SY - H / 2, W, H, 20); g.stroke(); g.restore(); });
  });

  const eyebrow = (r, text, k, lit) => {
    if (!r || k <= 0) return;
    K.text(text, r.cx, r.y0 + 42, { font: 'mono', weight: 600, size: 22, tracking: 2, align: 'center', color: lit > 0 ? C.head : C.gold, alpha: k });
  };
  const sub = (r, text, color, alpha = 1) => K.text(text, r.cx, r.y0 + 153, { font: 'ui', weight: 600, size: 26, color, align: 'center', alpha });
  // a retired core: the card dims to ~.6, the strike stays full strength and runs BEHIND the words,
  // top-left to bottom-right so it never crosses the year digits (they sit on the eyebrow's right).
  const broken = (x, k, br, name, brow, browK, subText) => {
    const r = M.metal(x, SY, { k, w: W, h: H, alpha: K.lerp(1, 0.6, br) });
    if (!r) return null;
    K.layer(k, () => {
      if (br > 0) M.strike(r.x0 + 12, r.y0 + H - 12, r.x0 + W - 12, r.y0 + 12, br);
      const ta = K.lerp(1, 0.78, br);
      eyebrow(r, brow, browK * ta, 0);
      K.text(name, r.cx, r.y0 + 92, { font: 'mono', weight: 600, size: 32, color: K.mixColor(C.strong, C.soft, br), align: 'center', alpha: ta });
      sub(r, subText, C.soft, ta);
    });
    return r;
  };

  K.layer(shelfA, () => {
    // 1 · MD5
    broken(XS[0], ks[0], K.io(t, tBroken, 0.6), 'MD5', 'BROKEN · 2004', K.io(t, tBroken, 0.5), 'file fingerprint');
    // 2 · SHA-1 (two different files, one fingerprint)
    broken(XS[1], ks[1], K.io(t, tSame + 0.7, 0.6), 'SHA-1', 'BROKEN · 2017', K.io(t, tFell, 0.5), 'file fingerprint');
  });
  // the collision demo above card 2 (dims with the card)
  const demoA = shelfA * K.lerp(1, 0.65, K.io(t, tSame + 0.7, 0.6));
  K.layer(demoA, () => {
    const fa = K.io(t, tTwo, 0.5), fb = K.io(t, tTwo + 0.25, 0.5);
    const nm = { font: 'mono', size: 26, color: C.body, align: 'center' };
    if (fa > 0) { K.file(575, 228 + 10 * (1 - fa), 60, { ext: 'pdf', alpha: fa }); K.text('a.pdf', 575, 304 + 10 * (1 - fa), { ...nm, alpha: fa }); }
    if (fb > 0) { K.file(685, 228 + 10 * (1 - fb), 60, { ext: 'pdf', alpha: fb, color: '#E6D6BC' }); K.text('b.pdf', 685, 304 + 10 * (1 - fb), { ...nm, alpha: fb }); }
    const ak = K.io(t, tSame - 0.25, 0.6);
    K.arrow(580, 322, 612, 372, { k: ak, color: C.head, w: 2.5, headSize: 12 });
    K.arrow(680, 322, 648, 372, { k: ak, color: C.head, w: 2.5, headSize: 12 });
    const pk = K.io(t, tSame + 0.15, 0.5);
    if (pk > 0) K.pill('same fingerprint', 630, 400, { size: 26, color: C.head, alpha: pk });
  });

  K.layer(shelfA, () => {
    // 3 · TLS: only the old versions retire
    const k3 = K.io(t, cTls, 0.6), rk = K.io(t, tRetired, 0.6);
    const r3 = M.metal(XS[2], SY, { name: 'TLS', k: k3, w: W, h: H }, (r) => {
      // two rows (three chips will not fit side by side at mono 26 in a 290 card):
      //   row 1: "1.0 · 1.1" — retires (dim + strike) on "retired"
      //   row 2: "1.2" and "1.3" — still in use, they stay lit (so nobody reads 1.2 as retired too)
      const mono = { font: 'mono', weight: 600, size: 26 }, CH = 34;
      const yA = r.y0 + 117, yB = r.y0 + 164;
      const tOld = '1.0 · 1.1', wOld = K.measure(tOld, mono) + 24, x0 = r.cx - wOld / 2;
      // old versions: dim + strike on "retired"
      K.layer(K.lerp(1, 0.62, rk), () => {
        K.card(x0, yA - CH / 2, wOld, CH, { r: CH / 2, fill: C.panel, stroke: C.line2, shadow: false });
        K.text(tOld, r.cx, yA + 9, { ...mono, color: K.mixColor(C.strong, C.soft, rk), align: 'center' });
      });
      if (rk > 0) M.strike(x0 + 2, yA + CH / 2 - 4, x0 + wOld - 2, yA - CH / 2 + 4, rk);   // stays inside its own chip
      // the versions in use stay lit
      const lit = K.io(t, tRetired + 0.3, 0.6);
      const NEW = ['1.2', '1.3'], wN = NEW.map((s) => K.measure(s, mono) + 24), gap = 16;
      let xn = r.cx - (wN[0] + gap + wN[1]) / 2;
      if (lit > 0) K.glow(r.cx, yB, 90, C.strong, 0.12 * lit);
      NEW.forEach((s, i) => {
        K.card(xn, yB - CH / 2, wN[i], CH, { r: CH / 2, fill: C.panel, stroke: K.mixColor(C.line2, C.strong, 0.6 * lit), shadow: false });
        K.text(s, xn + wN[i] / 2, yB + 9, { ...mono, color: C.strong, align: 'center' });
        xn += wN[i] + gap;
      });
      // "the lock behind HTTPS": a small lock beside the name
      const lk = K.io(t, tLockW, 0.5);
      if (lk > 0) M.lockIcon('lock', r.cx - 62, r.y0 + 73, 30, { alpha: lk });
    });
    if (r3) eyebrow(r3, 'RETIRED · 2021', k3 * rk, 0);

    // 4 · post-quantum (the scene's one 'back')
    const k4 = K.io(t, tNist, 0.5), sc4 = K.lerp(0.86, 1, K.io(t, tNist, 0.75, 'back')), lit4 = K.io(t, tQuantum, 0.8);
    if (k4 > 0) K.at(XS[3], SY, sc4, 0, () => {
      const r4 = M.metal(0, 0, { name: 'post-quantum', k: k4, lit: lit4, w: W, h: H }, (r) =>
        sub(r, 'new standards', C.head, K.io(t, tStandards, 0.5)));
      if (r4) eyebrow(r4, 'NIST · 2024', k4, lit4);
    });

    // 5 · git: SHA-1 -> SHA-256 (repaint)
    const k5 = K.io(t, cGit, 0.6), pk5 = K.io(t, tShaGit - 0.1, 0.4), rp = K.io(t, tMoving + 0.25, 0.6, 'lin');
    const r5 = M.metal(XS[4], SY, { name: 'git', k: k5, w: W, h: H }, (r) => {
      if (pk5 > 0) M.paint(r.cx, r.content.cy, 'SHA-256', { from: 'SHA-1', k: rp, font: 'mono', size: 28, alpha: pk5,
        lit: 0.5 * K.io(t, tMoving + 0.85, 0.6) });
    });
    if (r5) eyebrow(r5, 'MOVING', k5 * K.io(t, tMoving, 0.5), 0);

    // the arrow of time under the shelf: old metal on the left, new on the right
    const ta = K.io(t, tMoving + 1.1, 1.2);
    if (ta > 0) {
      K.arrow(150, 722, 1770, 722, { k: ta, color: K.mixColor(C.head, C.soft, 0.25), w: 2.5, headSize: 14 });
      K.eyebrow('OLDER', 150, 764, { size: 20, tracking: 4, alpha: K.seg(ta, 0, 0.3) });
      K.eyebrow('NEWER', 1770, 764, { size: 20, tracking: 4, align: 'right', alpha: K.seg(ta, 0.75, 1) });
    }
  });

  // ================================================================ where the street picture breaks
  M.say('Real street: an old lock has charm.', 832, K.io(t, tOn, 0.6), { color: C.body });
  M.say('Software: someone may have learned to pick it.', 884, K.io(t, tSoftware, 0.6), { color: C.strong });
});
