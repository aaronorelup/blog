/* 00.04 · scene 02 — Where it lives
   The course map (K.map), the shelf every lesson pins itself on. The car from 01 waits off-stage; this scene
   only shows WHERE the lesson sits and that the Lanterns (AI, never a district) are its subject.
   Beats (local seconds, cues.json):
     - open            the map assembles as it is named ("On the course map"): map.js's own staggered reveal,
                       with the six lanterns held back as bare ghosts.
     - [[pin]]         on "Start" the pin drops on the Start gate (the scene's one 'back'), the gate takes its gold
                       ring, the districts veil to 0.5 and the camera eases toward the Start (z 1.15); while it is in, the
                       right column it cuts sinks to 0.9 and the ghost lantern string steps back (out of the badge band).
     - "Orientation"   a compact Orientation note hangs under the gate (over a quieted Shipping); its question arrives
                       in two lines on "what this course is" and "and the lantern you carry" (a small gold lantern
                       lights at the end of the second line on "lantern").
     - [[lanterns]]    the note leaves, the camera eases back to z 1, the six lanterns light left to right; on
                       "every district" a soft pool of lantern light falls on each district in map order; the
                       Lanterns' label row fades in on "AI".
     - [[open]]        the camera eases into the third lantern (z 2.4) so it lands at screen (960, 520), where 03's
                       first frame has its lantern; the cards, Start and Finish fade out (districtK) and the string sits under a
                       0.82 veil, so no zoomed-up district text shows; a gold ring draws round it.
                       On "names the parts inside" three layer pills (model / app / agent, the lesson's colours)
                       slide out of the lantern into a small card under it, on hairline leaders.
   Exit: one glowing lantern at screen centre, its three-part label under it, the map soft behind. */
SCENE('02', (t, S) => {
  const C = K.C, MAP = K.map, GATE = MAP.GATE, g = K.ctx();

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 2.26);
  const tOrient = S.find('Orientation', 0, 2.91);
  const tWhat = S.find('what', 0, 4.7);
  const tAnd = S.find(/^and$/i, 0, 6.03);
  const tLanternW = S.find('lantern', 0, 6.32);       // "the lantern you carry"
  const tLan = S.cue('lanterns', 7.79);
  const tEvery = S.find('every', 0, 9.42);
  const tAI = S.find(/^AI/, 0, 10.39);
  const tOpen = S.cue('open', 12.31);
  const tNames = S.find('names', 0, 13.38);

  // ------------------------------------------------------------------ the chosen lantern (one drawing: map.js's own)
  const LI = 2, LP = MAP.lanternAt(LI);
  const LC = { x: LP.x, y: LP.y + 16 };                // the lantern icon's centre (map.js draws it at (0, 16) local)
  const Z_OPEN = 2.4, SCR = { x: 960, y: 520 };        // 03 opens on its lantern at screen (960, 520)

  // ------------------------------------------------------------------ camera
  const cam = K.cam(t, [
    { at: -10, x: 960, y: 540, z: 1 },
    // aimed low enough that the bottom row's last line stays above y 930 (the caption band)
    { at: tPin, x: 620, y: 585, z: 1.15, d: 0.8 },
    { at: tLan - 0.1, x: 960, y: 540, z: 1, d: 0.8 },
    { at: tOpen, x: LC.x, y: LC.y + (540 - SCR.y) / Z_OPEN, z: Z_OPEN, d: 1.1 },
  ]);

  // ------------------------------------------------------------------ states
  const pinDrop = K.io(t, tPin, 0.7, 'back');
  const pinGlow = K.io(t, tPin + 0.15, 0.6);
  const noteK = K.io(t, tOrient, 0.5) * (1 - K.io(t, tLan - 0.55, 0.4));
  const quietK = K.io(t, tOrient - 0.3, 0.3) * (1 - K.io(t, tLan - 0.2, 0.3));   // Shipping steps back (never blank) under the note
  // the Start close-up (camera z 1.15 between [[pin]] and [[lanterns]]): the right column the frame cuts and the
  // ghost lantern string (which would ride into the badge band) step back while the camera is in
  const zoomK = K.io(t, tPin, 0.8) * (1 - K.io(t, tLan - 0.1, 0.8));
  const openK = K.io(t, tOpen, 0.9);
  // the cards leave faster than the camera travels, so no zoomed-up district text is left mid-zoom
  const cardsOut = K.io(t, tOpen - 0.05, 0.4);
  const lanterns = (i) => K.stagger(t, tLan, i, 0.15, 0.6);
  const labelK = K.io(t, tAI - 0.35, 0.6) * (1 - K.io(t, tOpen - 0.05, 0.3));
  // districts: veiled to 0.5 on the pin, a touch brighter as the lantern light falls on them
  const veil = (i) => 0.5 * K.io(t, tPin, 0.8) - 0.12 * K.stagger(t, tEvery, i, 0.12, 0.7);
  const pool = (i) => K.stagger(t, tEvery, i, 0.12, 0.7);
  const sway = K.wave(t, 1.1, 0.06, LI * 1.7);          // map.js's own sway for lantern LI

  K.bg();
  K.withCam(cam, () => {
    K.glow(GATE.x, GATE.y, 120, C.head, 0.22 * pinGlow * (1 - cardsOut));
    MAP.draw(t, {
      t0: 0, pin: '00', pinDrop, pinK: K.io(t, tPin, 0.25) * (1 - cardsOut), path: 1 - cardsOut, pinGlowK: pinGlow,
      // [[open]]: the district cards, the Start and the Finish leave entirely (no zoomed-up text behind the
      // lantern); the string stays, softened by the veil below. During the Start close-up the string steps back.
      districtK: (id) => (id === 'ai' ? 1 - zoomK : 1 - cardsOut),
      lanterns, lanternLabels: labelK,
      // from [[open]] the map's own copy of the chosen lantern steps aside; the identical drawing is redrawn
      // above the veil below (same place, sway and glow), so nothing jumps
      lanternDrop: (i) => (i === LI && t >= tOpen ? 0 : 1),
    });

    // district veils (page colour over each card; Shipping quiets to a 0.65 veil under the note, still recognisable)
    MAP.DISTRICTS.forEach((d, i) => {
      // the right column (cut by the frame during the Start close-up) sinks to 0.94; Shipping quiets under the note
      const cut = d.id === 'history' || d.id === 'network' ? 0.94 * zoomK : 0;
      const v = Math.max(K.clamp(veil(i) + (d.id === 'shipping' ? 0.15 * quietK : 0)), cut);
      if (v * (1 - cardsOut) > 0.002) { K.rr(d.x - 1, d.y - 1, d.w + 2, d.h + 2, 25); g.fillStyle = K.rgba(C.page, v * (1 - cardsOut)); g.fill(); }
    });
    // "every district": lantern light pools on each card, in map order
    MAP.DISTRICTS.forEach((d, i) => {
      const k = pool(i) * (1 - cardsOut);
      if (k > 0.002) K.glow(d.x + d.w / 2, d.y + d.h * 0.42, 250, C.head, 0.1 * k);
    });

    // the Orientation note: a compact callout hung under the Start gate (over the quieted Shipping corner, so
    // The Machine stays readable beside it). It holds its title from the first frame and grows a line as each
    // half of the question is said, so it never shows as an empty box.
    // shadeK leads the note in (so Shipping never ghosts through the half-faded card) and holds until the note
    // has gone, then lets Shipping back as the camera returns (with quietK)
    const noteIn = K.io(t, tOrient, 0.5);
    const shadeK = Math.min(1, noteIn * 3) * (1 - K.io(t, tLan - 0.2, 0.3));
    if (noteK > 0.002 || shadeK > 0.002) {
      const l1 = K.io(t, tWhat, 0.5, 'out'), l2 = K.io(t, tAnd, 0.5, 'out'), lk = K.io(t, tLanternW, 0.5);
      const NX = 205, NY = 574, NW = 480, nh = 84 + 50 * l1 + 50 * l2 + 8 * Math.max(l1, 0);
      // a soft shade under the note, clipped to the Shipping card: the row the note's lower edge would cut fades
      // out instead of showing half a line, and the rows below keep Shipping recognisable at its 0.35 veil
      const SH = MAP.DISTRICTS.find((d) => d.id === 'shipping'), nb = NY + nh + (1 - noteIn) * 12;
      g.save(); K.rr(SH.x, SH.y, SH.w, SH.h, 24); g.clip();
      const sg = g.createLinearGradient(0, nb + 26, 0, nb + 66);
      sg.addColorStop(0, K.rgba(C.page, shadeK)); sg.addColorStop(1, K.rgba(C.page, 0));
      g.fillStyle = K.rgba(C.page, shadeK); g.fillRect(SH.x, SH.y, SH.w, nb + 26 - SH.y);
      g.fillStyle = sg; g.fillRect(SH.x, nb + 26, SH.w, 40);
      g.restore();
      K.layer(noteK, () => {
        // leader from the gate's lower right, clear of its "Start" label, to the note's top edge
        K.line(GATE.x + 36, GATE.y + 36, NX + 40, NY - 2, { color: K.rgba(C.head, 0.7), w: 2 });
        g.beginPath(); g.arc(GATE.x + 36, GATE.y + 36, 4, 0, Math.PI * 2); g.fillStyle = C.head; g.fill();
        g.save(); g.translate(0, (1 - noteK) * 12);
        K.card(NX, NY, NW, nh, { fill: C.tile, stroke: K.rgba(C.head, 0.6), r: 24, shadow: true });
        K.text('00', NX + 34, NY + 56, { font: 'mono', size: 30, color: C.head, weight: 700 });
        K.text('Orientation', NX + 88, NY + 56, { font: 'ui', size: 34, color: C.head, weight: 700 });
        if (l1 > 0) K.text('what this course is,', NX + 34, NY + 110 + (1 - l1) * 8, { font: 'ui', size: 30, color: C.body, alpha: l1 });
        if (l2 > 0) {
          const y2 = NY + 160 + (1 - l2) * 8;
          const w2 = K.text('and the lantern you carry', NX + 34, y2, { font: 'ui', size: 30, color: C.body, alpha: l2 });
          if (lk > 0) {   // the lantern you carry: a small one lights at the end of the line
            const lx = NX + 34 + w2 + 30, ly = y2 - 11;
            K.glow(lx, ly, 42, C.head, 0.3 * lk);
            K.icon('lantern', lx, ly, 36, { color: C.head, w: 2.2, alpha: lk });
          }
        }
        g.restore();
      });
    }

    // [[open]]: the cards have left (districtK); the string softens under a 0.82 veil; the chosen lantern is redrawn above the veil
    if (openK > 0.002) {
      g.save(); g.fillStyle = K.rgba(C.page, 0.82 * openK); g.fillRect(-2000, -2000, 6000, 5000); g.restore();
    }
    if (t >= tOpen) {
      const lk = lanterns(LI);
      K.glow(LP.x, LP.y + 16, 60, C.head, lk * 0.22);                       // map.js's glow
      K.glow(LC.x, LC.y, 70, C.head, 0.28 * openK);                         // opened: a warmer light
      K.layer(0.2 + 0.8 * lk, () => K.at(LP.x, LP.y, 1, sway, () => K.icon('lantern', 0, 16, 46, { color: C.head, w: 2.4 })));
      // the gold ring draws round it (world radius 40: ~96 px on screen at z 2.4)
      K.ring(LC.x, LC.y, 38, 40, K.io(t, tOpen + 0.35, 0.8), { color: C.head, w: 1.6, rot: 0 });
    }
  });

  // ------------------------------------------------------------------ the parts inside (screen space, fixed 26 px)
  // three layer pills slide out of the lantern into a small card under it, on hairline leaders
  const CY = 738, CW = 540, CH = 100;
  const PILLS = [{ w: 'model', x: 800 }, { w: 'app', x: 960 }, { w: 'agent', x: 1120 }];
  const top = { x: SCR.x, y: SCR.y + 104 };              // just under the ring
  const pillAt = (i) => {
    const k = K.io(t, tNames + 0.12 + i * 0.3, 0.6);
    return { k, x: K.lerp(top.x, PILLS[i].x, k), y: K.lerp(top.y + 20, CY, k) };
  };
  // leaders first (the card hides their lower ends), then the card, then the pills
  PILLS.forEach((p, i) => {
    const q = pillAt(i);
    if (q.k > 0.002) K.line(top.x, top.y, q.x, q.y - 24, { color: K.rgba(C.head, 0.45), w: 1.5 });
  });
  const cardK = K.io(t, tNames, 0.5, 'out');
  if (cardK > 0.002) K.card(960 - CW / 2, CY - CH / 2 + (1 - cardK) * 12, CW, CH, { fill: C.tile, stroke: C.line2, r: 24, alpha: cardK, shadow: true });
  PILLS.forEach((p, i) => {
    const q = pillAt(i);
    if (q.k > 0.002) M.tag(p.w, q.x, q.y, { alpha: Math.min(1, q.k * 1.6) });
  });
});
