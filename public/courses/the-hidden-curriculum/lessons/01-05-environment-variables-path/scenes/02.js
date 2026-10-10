/* 01.05 · 02 Where it lives. The course map; the pin drops on module 01 (The Machine).
   Beats (local seconds, cues.json; section 22.06 s):
     - [[map]] 0          the map assembles (staggered reveal from t0 0); the closed satchel from 01's title card
                          shrinks and fades out as the map assembles (it would read as a stray map element).
       "first" ~1.7       The Machine eases into focus (others dim, gold outline).
       "question" ~5.2    a gold underline draws under the district's question on the map.
     - [[pin]] ~8.5       the terracotta pin drops on row 01 (the scene's one 'back'); the bottom row of districts
                          recedes, and a card "01.05 Environment variables & PATH" arrives under The Machine, tied
                          to the pin by a dashed gold leader.
     - [[continuity]] ~11.4
       "files" ~13.5      ghost chip "01.03 paths" (dim) to the card's left;
       "back room" ~16.0  ghost chip "01.04 back room" (dim), between them;
       "carries" ~20.3    the satchel token slides in (x 1500, clear of the map route); a gold arrow runs to it: "what goes out the door".
   Last frame: map with the pin glowing, the lesson chain, the satchel token waiting in the corner. */
SCENE('02', (t, S) => {
  const C = K.C, L = M.L;
  K.bg();

  const tMap = S.cue('map', 0);
  const tFirst = S.find('first', 0, 1.7);
  const tQ = S.find('question', 0, 5.24);
  const tPin = S.cue('pin', 8.53);
  const tCont = S.cue('continuity', 11.37);
  const tFiles = S.find('files', 0, 13.54);
  const tBack = S.find('back', 0, 16.02);
  const tCarry = S.find('carries', 0, 20.35);

  // the bottom row (and the Finish gate) recedes on [[pin]] to make room for this lesson's chain
  const recede = K.io(t, tPin - 0.1, 0.8, 'io');
  const bottom = { network: 1, trust: 1, shipping: 1, end: 1 };
  const focusK = K.io(t, tFirst, 0.8, 'io');
  K.map.draw(t, {
    t0: tMap,
    focus: 'machine',
    focusK,
    dim: 0.75,
    highlight: { machine: focusK },
    pin: '01',
    pinK: K.io(t, tPin, 0.25, 'io'),
    pinDrop: K.io(t, tPin, 0.7, 'back'),
    pinGlowK: K.io(t, tPin + 0.5, 0.6, 'io'),
    lanterns: 0.6,
    districtK: (id) => (bottom[id] ? 1 - recede : 1),
  });

  const g = K.ctx();
  const md = K.map.district('machine');

  // "question": a gold underline under the district's question on the map itself
  const qk = K.io(t, tQ, 0.6, 'io');
  if (qk > 0) K.mark(md.x + 36, md.y + K.map.ROW.q + 8, K.measure(md.q, { font: 'ui', size: K.map.TYPE.q }) + 8, qk, { alpha: 0.85, w: 3 });

  // ---- the lesson chain under The Machine: 01.03 · 01.04 (ghosts) → 01.05 (this lesson) ----
  const CY = 700, CH = 78;                                     // chain row: card centre y, card height
  const numO = { font: 'mono', size: 30, weight: 700 };
  const txtO = { font: 'ui', size: 30, weight: 600 };
  const chip = (num, name) => 28 + K.measure(num, numO) + 16 + K.measure(name, txtO) + 28;
  const items = [
    { num: '01.03', name: 'paths', at: tFiles },
    { num: '01.04', name: 'back room', at: tBack - 0.15 },
    { num: '01.05', name: 'Environment variables & PATH', at: tPin + 0.35, me: true },
  ];
  const GAP = 64;
  let x = 110;
  items.forEach((it) => { it.w = chip(it.num, it.name); it.x = x; x += it.w + GAP; });
  const me = items[2];

  // dashed gold leader: from the pin on row 01 straight down, then across into the top of the 01.05 card
  const pinC = K.map.chipPos('01');
  const lx = pinC.x + pinC.w - 14, ly0 = pinC.y + 18;
  const lk = K.io(t, tPin + 0.35, 0.7, 'io');
  if (lk > 0) {
    const ex = me.x + 70, ey = md.y + md.h + 48;   // elbow: down out of the card, across, down into 01.05's top
    K.path([[lx, ly0], [lx, ey], [ex, ey], [ex, CY - CH / 2 - 4]], { k: lk, color: K.rgba(C.head, 0.75), w: 2.5, dash: [3, 9], head: false, tension: 0 });
    g.save(); g.fillStyle = K.rgba(C.head, 0.85 * Math.min(1, lk * 3));
    g.beginPath(); g.arc(lx, ly0, 4, 0, Math.PI * 2); g.fill(); g.restore();
  }

  items.forEach((it, i) => {
    const a = K.io(t, it.at, 0.5, 'io');
    if (a <= 0.002) return;
    const y0 = CY - CH / 2 + (1 - a) * 12;
    const ghost = !it.me;
    const al = a * (ghost ? 0.6 : 1);
    if (ghost) {
      g.save(); g.globalAlpha *= al;
      K.rr(it.x, y0, it.w, CH, 22);
      g.fillStyle = K.rgba(C.tile, 0.6); g.fill();
      g.strokeStyle = C.line2; g.lineWidth = 2; g.setLineDash([8, 8]); g.stroke(); g.setLineDash([]);
      g.restore();
    } else {
      K.card(it.x, y0, it.w, CH, { r: 22, fill: C.tile, stroke: C.head, glow: 0.5 * K.io(t, tPin + 0.8, 0.6, 'io'), alpha: al, shadow: true });
    }
    const nx = it.x + 28;
    const nw = K.text(it.num, nx, y0 + CH / 2 + 11, { ...numO, color: ghost ? C.soft : C.head, alpha: al });
    K.text(it.name, nx + nw + 16, y0 + CH / 2 + 11, { ...txtO, color: ghost ? C.soft : C.strong, alpha: al });
    // a small dim arrow from each chip to the next, once both are there
    if (i < 2) {
      const ak = K.io(t, Math.max(it.at, items[i + 1].at) + 0.2, 0.4, 'io');
      if (ak > 0) K.arrow(it.x + it.w + 12, CY, it.x + it.w + GAP - 12, CY, { k: ak, color: K.rgba(C.soft, 0.7), w: 2.5 });
    }
  });

  // ---- the satchel: 01's emblem shrinks toward the corner and fades out while the map assembles (so it never
  // sits on the map's dotted route as a stray element), then slides back in on "carries", parked clear of the route ----
  const tk = { x: 1500, y: 866, s: L.token.s }, em = L.emblem;
  const sk = K.io(t, 0.1, 1.1, 'io');
  const outA = 1 - K.io(t, 0.35, 0.75, 'io');
  if (outA > 0.002) {
    M.satchel(t, K.lerp(em.x, 1640, sk), K.lerp(em.y, 820, sk), K.lerp(em.s, tk.s, sk), { open: 0, glow: 0.25, alpha: outA });
  }
  const inK = K.io(t, tCarry - 0.35, 0.6, 'io');
  const carryK = K.io(t, tCarry - 0.05, 0.8, 'io');
  if (inK > 0.002) {
    M.satchel(t, tk.x + (1 - inK) * 70, tk.y, tk.s, { open: 0, glow: 0.25 + 0.6 * carryK, alpha: inK });
  }

  // "carries out the door": a gold arrow from this lesson's card down to the satchel token, with its label
  if (carryK > 0) {
    const x1 = me.x + me.w + 14, y1 = CY + 10;
    K.arrow(x1, y1, tk.x - 6, tk.y - 70, { k: carryK, color: C.head, w: 3, bend: -50 });
    M.label('what goes out the door', tk.x - tk.s / 2 - 30, tk.y + 12, { align: 'right', color: C.strong, size: 30, alpha: K.io(t, tCarry + 0.2, 0.5, 'io') });
  }
});
