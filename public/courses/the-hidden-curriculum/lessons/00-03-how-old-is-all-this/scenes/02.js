/* 00.03 · scene 02 — Where it lives
   The course map (K.map), the shelf every lesson pins itself on. The Lanterns (AI) are held back as a
   bare ghost cord so they can be "strung up last".
   Beats (local seconds, cues.json):
     - open      the map assembles as it is named ("On the course map"): map.js's own staggered reveal from
                 t 0, lanterns a ghost cord, no lantern labels.
     - [[pin]]   on "Start" the you-are-here pin drops on the Start gate (the scene's one 'back'), the gate takes
                 map.js's pinned gold ring, the districts veil to 0.6 and the camera eases toward the Start
                 (z 1 -> 1.2 aimed so every module row stays above y 930, then a slow push to 1.24); the cards the
                 zoom crops (History, Shipping, Trust, Network) veil to ~0.87 so they read as background.
     - "Orientation"  the Machine goes quiet, then an Orientation card fills exactly its rectangle (same type scale
                 as a district); its question arrives in two lines, on "what this course is" and "and the lantern you carry".
     - [[districts]]  the note leaves, the camera eases back to z 1 and the six districts brighten one by one
                 in map order (veil 0.6 -> 0.3, 0.12 s stagger).
     - "streets" (Most of these streets...)  a gold outline runs quickly over the six districts in map order (gold =
                 the old street, lesson-wide), done before the sign; on "laid" a gold street line is laid along the
                 seam between the two rows and on "long" the eyebrow LAID DOWN LONG AGO settles in its gap (no pill).
     - [[lanterns]]  the sign leaves; the six lanterns light left to right (0.15 s stagger), the districts
                 brighten under them, map.js's label row fades in on "AI", and on "strung" a terracotta
                 STRUNG UP LAST (terracotta = the lantern end, lesson-wide) settles at the right end of that row.
   Exit: whole map, Start pinned and glowing, six lanterns lit; STRUNG UP LAST eases out after the last word. */
SCENE('02', (t, S) => {
  const C = K.C, MAP = K.map, GATE = MAP.GATE, g = K.ctx();

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 2.47);
  const tOrient = S.find('Orientation', 0, 3.37);
  const tWhat = S.find('what', 0, 4.81);
  const tAnd = S.find(/^and$/i, 0, 6.12);
  const tDist = S.cue('districts', 9.47);
  const tStreets = S.find('streets', 0, 13.35);
  const tLaid = S.find('laid', 0, 14.0);
  const tLong = S.find('long', 0, 14.33);
  const tLan = S.cue('lanterns', 16.81);
  const tAI = S.find(/^AI,?$/, 1, 17.94);      // "The lanterns, the AI," (the 0th "AI" is "before AI tools")
  const tStrung = S.find('strung', 0, 18.76);

  // ------------------------------------------------------------------ camera
  const cam = K.cam(t, [
    { at: -10, x: 960, y: 540, z: 1 },
    // aimed low enough that every module row stays above y 930 (the caption band); cut-off cards are veiled
    { at: tPin, x: 640, y: 560, z: 1.2, d: 0.8 },
    { at: tPin + 0.8, x: 632, y: 556, z: 1.24, d: tDist - tPin - 1.25 },   // slow push while the note is read
    { at: tDist, x: 960, y: 540, z: 1, d: 0.8 },
  ]);

  // ------------------------------------------------------------------ district veils (page colour over each card)
  // 0.6 dim on the pin, back to 0.3 one by one on "six districts", then light falls on them with the lanterns
  const noteK = K.io(t, tOrient, 0.5) * (1 - K.io(t, tDist - 0.65, 0.35));
  // the Machine goes fully quiet just before the note arrives and wakes just after it leaves: never a cross-fade
  const quietK = K.io(t, tOrient - 0.3, 0.3) * (1 - K.io(t, tDist - 0.3, 0.3));
  const zoomK = K.io(t, tPin, 0.8) * (1 - K.io(t, tDist, 0.8));
  const CUT = { shipping: 1, trust: 1, network: 1, history: 1 };   // cards the zoom crops: background while zoomed
  const veil = (i) => 0.6 * K.io(t, tPin, 0.8) + (CUT[MAP.DISTRICTS[i].id] ? 0.27 * zoomK : 0)
    - 0.3 * K.stagger(t, tDist, i, 0.12, 0.6)
    - 0.22 * K.stagger(t, tLan + 0.2, i, 0.15, 0.8);

  // ------------------------------------------------------------------ lanterns
  const lanterns = (i) => K.stagger(t, tLan, i, 0.15, 0.6);
  const labelK = K.io(t, tAI, 0.6);

  // ------------------------------------------------------------------ signs
  const laidK = K.io(t, tLong, 0.6, 'out') * (1 - K.io(t, tLan - 0.1, 0.5));
  const strungK = K.io(t, tStrung, 0.6, 'out') * (1 - K.io(t, S.dur + 0.15, 0.6));

  K.bg();
  K.withCam(cam, () => {
    K.glow(GATE.x, GATE.y, 120, C.head, 0.22 * K.io(t, tPin + 0.15, 0.6));
    MAP.draw(t, {
      t0: 0, pin: '00',
      pinDrop: K.io(t, tPin, 0.7, 'back'), pinK: K.io(t, tPin, 0.25), pinGlowK: K.io(t, tPin + 0.15, 0.6),
      lanterns, lanternLabels: labelK,
    });

    // veils: the Machine card goes fully quiet while the Orientation note sits on it
    MAP.DISTRICTS.forEach((d, i) => {
      // under the full-size Orientation card the Machine goes fully quiet, so the two texts never cross-fade
      const v = K.clamp(veil(i) + (d.id === 'machine' ? quietK : 0));
      if (v > 0.002) { K.rr(d.x - 1, d.y - 1, d.w + 2, d.h + 2, 25); g.fillStyle = K.rgba(C.page, v); g.fill(); }
    });

    // "Most of these streets": a gold outline runs over the districts in map order, once each
    MAP.DISTRICTS.forEach((d, i) => {
      const b = M.bump(t, tStreets + 0.08 * i, 0.7);      // all six done by ~14.45, as the sign arrives
      if (b < 0.002) return;
      K.rr(d.x, d.y, d.w, d.h, 24);
      g.save(); g.strokeStyle = K.rgba(C.head, 0.8 * b); g.lineWidth = 2.5; g.stroke(); g.restore();
      K.glow(d.x + d.w / 2, d.y + d.h / 2, 240, C.head, 0.05 * b);
    });

    // the Orientation note: a card exactly over The Machine's rectangle (world space), same type scale as a district
    if (noteK > 0) {
      const d = MAP.district('machine'), l1 = K.io(t, tWhat, 0.5, 'out'), l2 = K.io(t, tAnd, 0.5, 'out');
      K.layer(noteK, () => {
        K.line(GATE.x + 54, GATE.y, d.x - 4, GATE.y, { color: K.rgba(C.head, 0.7), w: 2 });
        g.save(); g.translate((1 - noteK) * 14, 0);
        K.card(d.x, d.y, d.w, d.h, { fill: C.tile, stroke: K.rgba(C.head, 0.6), r: 24, shadow: true });
        K.text('00', d.x + 44, d.y + 82, { font: 'mono', size: 34, color: C.head, weight: 700 });
        K.text('Orientation', d.x + 104, d.y + 82, { font: 'ui', size: 38, color: C.head, weight: 700 });
        if (l1 > 0) K.text('what this course is,', d.x + 44, d.y + 168 + (1 - l1) * 10, { font: 'ui', size: 32, color: C.body, alpha: l1 });
        if (l2 > 0) K.text('and the lantern you carry', d.x + 44, d.y + 220 + (1 - l2) * 10, { font: 'ui', size: 32, color: C.body, alpha: l2 });
        g.restore();
      });
    }

    // "laid": a gold street line is laid along the seam between the two rows, the sign rides in its gap
    if (laidK > 0) {
      const y = 571, x0 = 250, x1 = 1670, o = { size: 22, weight: 600, tracking: 4, upper: true, font: 'ui' };
      const s = 'Laid down long ago', hw = (K.measure(s, o) + 18 * 4) / 2 + 22;
      const run = K.io(t, tLaid, 0.9) * (1 - K.io(t, tLan - 0.1, 0.5));
      const xe = K.lerp(x0, x1, K.io(t, tLaid, 0.9));
      g.save(); g.globalAlpha = run;
      K.line(x0, y, Math.min(xe, 960 - hw), y, { color: K.rgba(C.head, 0.55), w: 2 });
      if (xe > 960 + hw) K.line(960 + hw, y, xe, y, { color: K.rgba(C.head, 0.55), w: 2 });
      g.restore();
      K.eyebrow(s, 960, y + 8, { ...o, color: C.head, align: 'center', alpha: laidK });
    }
  });

  // ------------------------------------------------------------------ STRUNG UP LAST (right end of the lantern row)
  if (strungK > 0) {
    const y = MAP.LANTERNS.y + 66;     // map.js's label row baseline (230)
    K.eyebrow('Strung up last', 1670 + (1 - strungK) * 14, y, { size: 28, weight: 600, tracking: 3, upper: true, color: C.accent, align: 'right', alpha: strungK });
  }
});
