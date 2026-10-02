/* 00.05 · scene 02 — Where it lives
   The course map (K.map). The desk from 01 waits off-stage and returns unchanged in 03; this scene only shows WHERE
   the lesson sits (Start, Orientation) and that the Lanterns (AI, never a district) run on the engine from 01.
   Beats (local seconds, cues.json):
     - open            the map assembles as it is named ("On the course map"): map.js's own staggered reveal, the six
                       lanterns held back as bare ghosts.
     - [[pin]]         on "Start" the pin drops on the Start gate (the scene's one 'back'); the gate takes its gold ring
                       and the districts dim to 0.5 (focus '00').
     - "Orientation"   a two-line Orientation note sits in the top band (y 136-248, over the still-ghost lanterns 0-2,
                       covering no district), its leader climbing from the Start gate up the left gutter; its line
                       arrives on "what this course is" and "and the lantern you carry" (a small gold lantern lights
                       16 px after "you carry" on "lantern"). It leaves before the string lights.
     - [[lanterns]]    the note leaves; the six lanterns light left to right (stagger 0.15); on "every district" a soft
                       pool of light falls on each district in map order; the Lanterns' label row fades in.
     - [[open]]        the camera eases toward the third lantern (z 1 -> 1.5, 0.8 s), the rest of the map steps back (other
                       lanterns half lit; district cards, Start, Finish, path and label row fade out); a gold ring draws round the spot.
                       On "engine" the lantern lifts out and the 00.04 engine (scale 0.4, labelled "model") glows in
                       its place, hung from the same cord; on "look inside" its lid opens a crack.
   Exit: one small engine glowing in a lantern's place, its lid cracked, the map soft behind. */
SCENE('02', (t, S) => {
  const C = K.C, MAP = K.map, GATE = MAP.GATE, g = K.ctx();

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 2.57);
  const tOrient = S.find('Orientation', 0, 3.34);
  const tWhat = S.find('what', 0, 4.56);
  const tAnd = S.find(/^and$/i, 0, 5.99);
  const tLanternW = S.find(/^lantern$/i, 0, 6.36);     // "the lantern you carry"
  const tLan = S.cue('lanterns', 8.01);
  const tEvery = S.find('every', 0, 9.63);
  const tOpen = S.cue('open', 12.02);
  const tEngine = S.find('engine', 0, 13.57);
  const tLook = S.find('look', 0, 15.45);

  // ------------------------------------------------------------------ the chosen lantern and the engine that replaces it
  const LI = 2, LP = MAP.lanternAt(LI);                 // the pivot on the string (map.js hangs the icon at (0, 16) local)
  const S_ENG = M.layout.engineMap.s;                    // 0.4
  const EH = 70 * S_ENG;                                 // half the engine card's height (world)
  const EC = { x: LP.x, y: LP.y + 12 + EH };             // engine centre: its lid hangs 12 px under the pivot
  const Z = 1.5, SCR = { x: 960, y: 520 };               // the engine settles at screen (960, 520)

  // ------------------------------------------------------------------ camera
  const cam = K.cam(t, [
    { at: -10, x: 960, y: 540, z: 1 },
    { at: tOpen, x: EC.x, y: EC.y + (540 - SCR.y) / Z, z: Z, d: 0.8 },
  ]);
  const toScreen = (x, y) => ({ x: (x - cam.x) * cam.z + 960, y: (y - cam.y) * cam.z + 540 });

  // ------------------------------------------------------------------ states
  const pinDrop = K.io(t, tPin, 0.7, 'back');           // the scene's one overshoot
  const pinGlow = K.io(t, tPin + 0.15, 0.6);
  const focusK = K.io(t, tPin, 0.8);
  const openK = K.io(t, tOpen, 0.8);
  const cardsOut = K.io(t, tOpen - 0.05, 0.45);   // leave faster than the camera travels
  const ringK = K.io(t, tOpen + 0.35, 0.8);
  const hideK = K.io(t, tEngine - 0.1, 0.4);
  const engK = K.io(t, tEngine, 0.5);
  const lidK = K.io(t, tLook, 0.6);
  const lanterns = (i) => K.stagger(t, tLan, i, 0.15, 0.6) * (i === LI ? 1 : 1 - 0.5 * openK);
  const labelK = K.io(t, tLan + 0.9, 0.6) * (1 - K.io(t, tOpen, 0.4));
  // the Orientation note
  const noteIn = K.io(t, tOrient, 0.5);
  const noteOut = K.io(t, tLan - 0.5, 0.4);
  const noteK = noteIn * (1 - noteOut);
  const pool = (i) => K.stagger(t, tEvery, i, 0.12, 0.7);

  K.bg();
  K.withCam(cam, () => {
    K.glow(GATE.x, GATE.y, 120, C.head, 0.22 * pinGlow * (1 - openK));
    MAP.draw(t, {
      t0: 0, focus: '00', focusK, dim: 0.5,
      pin: '00', pinDrop, pinK: K.io(t, tPin, 0.25) * (1 - cardsOut), pinGlowK: pinGlow,
      lanterns, lanternLabels: labelK,
      lanternHide: (i) => (i === LI ? hideK : 0),
      path: 1 - openK,
      // [[open]]: the cards, Start and Finish leave as the camera moves in (no zoomed-up, frame-cut district text
      // behind the engine); the lantern string stays as the soft map behind it
      districtK: (id) => {
        if (id === 'ai') return 1;
        return 1 - cardsOut;
      },
    });

    // "every district": lantern light pools on each card, in map order (gone again as the camera moves in)
    MAP.DISTRICTS.forEach((d, i) => {
      const k = pool(i) * (1 - openK);
      if (k > 0.002) K.glow(d.x + d.w / 2, d.y + d.h * 0.42, 250, C.head, 0.1 * k);
    });

    // ---------------------------------------------------------------- the Orientation note, hung over the gate
    if (noteK > 0.002) {
      // A two-line strip in the top band, between the (still ghost) lantern string and the cards' top edge: it covers
      // no district (only the bare ghost lanterns 0-2, which light only after it has gone), and its leader climbs
      // from the Start gate through the left gutter, so all six districts stay whole while the narrator names 00.
      const l1 = K.io(t, tWhat, 0.5, 'out'), l2 = K.io(t, tAnd, 0.5, 'out'), l3 = K.io(t, tAnd + 0.25, 0.5, 'out');
      const lk = K.io(t, tLanternW, 0.5);
      const BF = { font: 'ui', size: 30 };
      const P1 = 'what this course is,', P2 = ' and the lantern', P3 = ' you carry';
      const w1 = K.measure(P1, BF), w2 = K.measure(P2, BF), w3 = K.measure(P3, BF);
      const PAD = 28, ICON = 34;
      const NX = 250, NY = 136, NH = 112, NW = Math.round(PAD + w1 + w2 + w3 + 16 + ICON + PAD);   // bottom at 248: 10 px above the cards
      const cardA = Math.min(1, noteK * 3), textA = noteK * noteK;
      const dy = -(1 - noteIn) * 6;   // settles down from above, never toward the cards (top stays at y >= 130)
      K.layer(cardA, () => {
        // leader: from the top of the Start ring, up the gutter left of The Machine, into the note's left edge
        const ax = GATE.x + 13, ay = GATE.y - 48, bx = NX + 1, by = NY + NH - 34 + dy;
        K.line(ax, ay, bx, by, { color: K.rgba(C.head, 0.7), w: 2 });
        g.beginPath(); g.arc(ax, ay, 4, 0, Math.PI * 2); g.fillStyle = C.head; g.fill();
        g.save(); g.translate(0, dy);
        K.card(NX, NY, NW, NH, { fill: C.tile, stroke: K.rgba(C.head, 0.6), r: 22, shadow: true });
        g.restore();
      });
      K.layer(textA, () => {
        g.save(); g.translate(0, dy);
        const tx = NX + PAD, y1 = NY + 46, y2 = NY + 90;
        K.text('00', tx, y1, { font: 'mono', size: 30, color: C.head, weight: 700 });
        K.text('Orientation', tx + 52, y1, { font: 'ui', size: 32, color: C.head, weight: 700 });
        if (l1 > 0) K.text(P1, tx, y2 + (1 - l1) * 8, { ...BF, color: C.body, alpha: l1 });
        if (l2 > 0) K.text(P2, tx + w1, y2 + (1 - l2) * 8, { ...BF, color: C.body, alpha: l2 });
        if (l3 > 0) K.text(P3, tx + w1 + w2, y2 + (1 - l3) * 8, { ...BF, color: C.body, alpha: l3 });
        if (lk > 0 && l3 > 0) {   // the lantern you carry: a small one lights 16 px after the line
          const lx = tx + w1 + w2 + w3 + 16 + ICON / 2, ly = y2 - 11;
          K.glow(lx, ly, 42, C.head, 0.3 * lk);
          K.icon('lantern', lx, ly, ICON, { color: C.head, w: 2.2, alpha: lk });
        }
        g.restore();
      });
    }

    // ---------------------------------------------------------------- [[open]]: the engine in the lantern's place
    if (ringK > 0.002) K.ring(EC.x, EC.y - 6, 70, 56, ringK, { color: C.head, w: 1.6, rot: 0 });
    if (engK > 0.002) {
      // hung from the lantern's own cord
      K.line(LP.x, LP.y - 2, LP.x, EC.y - EH + 2, { color: K.rgba(C.soft, 0.7), w: 1.5, alpha: engK });
      const s = S_ENG * (0.85 + 0.15 * engK);
      M.engine(t, EC.x, EC.y, s, { alpha: engK, lid: 0.25 * lidK, glow: 0.5 * engK, shadow: true });
      // a little light escapes through the cracked lid
      if (lidK > 0.002) K.glow(EC.x - 6, EC.y - EH - 2, 46, C.head, 0.35 * lidK);
    }
  });

  // ------------------------------------------------------------------ the engine's name (screen space, fixed 26 px)
  if (engK > 0.002) {
    const p = toScreen(EC.x, EC.y + EH);
    K.pill('model', p.x, p.y + 78, { size: 26, color: C.head, alpha: engK * K.io(t, tEngine + 0.2, 0.5) });
  }
});
