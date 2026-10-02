/* 00.03 (extended) · scene 02 — Where it lives
   Adapted from v1's scene 02 (drafts/v1/scenes/02.js): the course map (K.map), the shelf every lesson pins
   itself on. The Lanterns (AI) are held back as a bare ghost cord so they can be "strung up last".
   Colour, lesson-wide: gold = the old street, cream = versions (paint), terracotta = locks / security and
   the lantern end.
   Beats (local seconds, cues.json):
     - open        the map assembles as it is named ("On the course map"): map.js's own staggered reveal.
     - [[pin]]     on "Start" the pin drops on the Start gate (the scene's one 'back'), the gate takes its gold
                   ring, the districts veil to 0.6 and the camera eases toward the Start; cards the zoom crops
                   veil further so they read as background.
     - "Orientation"  the Machine goes quiet and an Orientation card fills its rectangle; the question arrives
                   in two lines on "what this course is" and "and the lantern you carry".
     - [[districts]]  the note leaves, the camera eases back to z 1, the six districts brighten in map order.
                   On "old street" a gold outline runs over them; on "laid" a gold street line is laid along the
                   seam between the rows, and on "long" the 26 px eyebrow OLD STREETS, LAID LONG AGO settles in
                   the empty band above the top row (y 238, under the dark lantern ghosts).
     - "Versions"  row 05 Packages washes cream with a "versions" tag (cream = paint / versions).
     - "git"       row 08 Git & GitHub washes gold with a matching "git" tag (an old street).
     - [[trust]]   the washes ease back and the top eyebrow leaves; on "fastest" a terracotta "fastest-changing"
                   tag and lock land INSIDE Trust (right-aligned on its title line), with a faint terracotta edge,
                   so the label can only belong to Trust; on "locks" the lock pulses once; on "district of its
                   own" the terracotta outline draws round Trust and its rows 14 and 15 wash.
     - [[lanterns]]  the seam street line leaves; the six lanterns light left to right, the districts brighten under them,
                   the label row fades in on "AI", STRUNG UP LAST settles at the right end of that row on
                   "strung", and on "rehung" each lantern dims and relights once in turn (a gentle rehang).
   Exit: whole map, Start pinned, Trust outlined softly, lanterns lit; STRUNG UP LAST eases out at the end. */
SCENE('02', (t, S) => {
  const C = K.C, MAP = K.map, GATE = MAP.GATE, g = K.ctx();

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 2.57);
  const tOrient = S.find('Orientation', 0, 3.55);
  const tWhat = S.find('what', 0, 4.69);
  const tAnd = S.find(/^and$/i, 0, 5.86);
  const tDist = S.cue('districts', 7.9);
  const tOld = S.find('old', 0, 9.55);
  const tLaid = S.find('laid', 0, 10.73);
  const tLong = S.find('long', 0, 11.13);
  const tVers = S.find('Versions', 0, 13.54);
  const tGit = S.find('git', 0, 18.14);
  const tTrust = S.cue('trust', 20.09);
  const tFast = S.find('fastest', 0, 20.28);
  const tLocks = S.find('locks', 0, 23.2);
  const tOwn = S.find('district', 2, 24.32);      // "gets a district of its own"
  const tLan = S.cue('lanterns', 27.05);
  const tAI = S.find('AI', 1, 28.24);             // "the lanterns, the AI," (the 0th is "before AI arrived")
  const tStrung = S.find('strung', 0, 29.05);
  const tRehung = S.find('rehung', 0, 31.02);

  // ------------------------------------------------------------------ camera
  const cam = K.cam(t, [
    { at: -10, x: 960, y: 540, z: 1 },
    // aimed low enough that every module row stays above y 930 (the caption band); cut-off cards are veiled
    { at: tPin, x: 640, y: 560, z: 1.2, d: 0.8 },
    { at: tPin + 0.8, x: 632, y: 556, z: 1.24, d: Math.max(0.5, tDist - tPin - 1.25) },   // slow push while the note is read
    { at: tDist, x: 960, y: 540, z: 1, d: 0.8 },
  ]);

  // ------------------------------------------------------------------ district veils (page colour over each card)
  const noteK = K.io(t, tOrient, 0.5) * (1 - K.io(t, tDist - 0.65, 0.35));
  // the Machine goes fully quiet just before the note arrives and wakes just after it leaves: never a cross-fade
  const quietK = K.io(t, tOrient - 0.3, 0.3) * (1 - K.io(t, tDist - 0.3, 0.3));
  const zoomK = K.io(t, tPin, 0.8) * (1 - K.io(t, tDist, 0.8));
  const CUT = { shipping: 1, trust: 1, network: 1, history: 1 };   // cards the zoom crops: background while zoomed
  const veil = (i) => 0.6 * K.io(t, tPin, 0.8) + (CUT[MAP.DISTRICTS[i].id] ? 0.27 * zoomK : 0)
    - 0.3 * K.stagger(t, tDist, i, 0.12, 0.6)
    - 0.22 * K.stagger(t, tLan + 0.2, i, 0.15, 0.8);

  // ------------------------------------------------------------------ lanterns ("rehung": each dims and relights once)
  const lanterns = (i) => K.stagger(t, tLan, i, 0.15, 0.6) * (1 - 0.65 * M.bump(t, tRehung + 0.08 * i, 0.8));
  const labelK = K.io(t, tAI, 0.6);

  // ------------------------------------------------------------------ top eyebrow OLD STREETS; Trust's own tag
  const oldK = K.io(t, tLong, 0.6, 'out') * (1 - K.io(t, tTrust - 0.2, 0.5));   // gone well before [[lanterns]]
  const fastK = K.io(t, tFast + 0.1, 0.5, 'out');               // the tag and lock arrive together, inside Trust
  const runK = 1 - K.io(t, tLan - 0.1, 0.5);                   // the laid street line leaves as the lanterns light

  // ------------------------------------------------------------------ row washes
  const settle = 1 - 0.6 * K.io(t, tTrust, 0.6);                // 05 and 08 ease back to 0.4 on [[trust]]
  const vK = K.io(t, tVers, 0.5) * settle;
  const gK = K.io(t, tGit, 0.5) * settle;
  const lockK = fastK;
  const lockPulse = M.bump(t, tLocks, 0.9);                      // "locks": one soft glow swell
  const ringK = K.io(t, tOwn, 0.9);                              // terracotta outline draws round Trust
  const ringA = 1 - 0.45 * K.io(t, tLan, 0.8);                   // and softens as the lanterns take over
  const tWashK = K.io(t, tOwn + 0.4, 0.6) * ringA;
  const edgeK = fastK * (1 - ringK);                              // a faint terracotta edge until the outline draws

  const strungK = K.io(t, tStrung, 0.6, 'out') * (1 - K.io(t, S.dur + 0.15, 0.6));

  // a module row lit by a wash: the wash, then the row's own number and name redrawn at full strength over the veil
  const washRow = (mod, k, color, textColor, tag) => {
    if (k <= 0.002) return;
    const c = MAP.chipPos(mod), d = c.d, y = d.y + MAP.ROW.first + d.mods.indexOf(mod) * MAP.ROW.pitch;
    K.rr(d.x + 22, y - 28, d.w - 44, 38, 19); g.fillStyle = K.rgba(color, 0.16 * k); g.fill();
    K.text(mod, d.x + 40, y, { font: 'mono', size: MAP.TYPE.num, color, weight: 600, alpha: k });
    // same weight as map.js draws the row, so the redraw lands exactly on the veiled glyphs (no double image)
    K.text(MAP.MODULES[mod], d.x + 84, y, { size: MAP.TYPE.mod, color: textColor, weight: 400, alpha: k });
    if (tag) K.text(tag, d.x + d.w - 40 - (1 - Math.min(1, k * 1.6)) * 12, y, { size: 26, font: 'ui', weight: 600, color, align: 'right', alpha: Math.min(1, k * 1.6) });
  };

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
      const v = K.clamp(veil(i) + (d.id === 'machine' ? quietK : 0));
      if (v > 0.002) { K.rr(d.x - 1, d.y - 1, d.w + 2, d.h + 2, 25); g.fillStyle = K.rgba(C.page, v); g.fill(); }
    });

    // "an old street": a gold outline runs over the districts in map order, once each
    MAP.DISTRICTS.forEach((d, i) => {
      const b = M.bump(t, tOld + 0.08 * i, 0.7);
      if (b < 0.002) return;
      K.rr(d.x, d.y, d.w, d.h, 24);
      g.save(); g.strokeStyle = K.rgba(C.head, 0.8 * b); g.lineWidth = 2.5; g.stroke(); g.restore();
      K.glow(d.x + d.w / 2, d.y + d.h / 2, 240, C.head, 0.05 * b);
    });

    // the Orientation note: a card exactly over The Machine's rectangle, same type scale as a district
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

    // "Versions and packages ... in the Code district" (cream = versions); "git, in History" (gold = old street)
    washRow('05', vK, C.strong, C.strong, 'versions');
    washRow('08', gK, C.head, C.strong, 'git');

    // Trust: the lock lands on "locks", the outline draws on "a district of its own", rows 14 and 15 wash
    const T = MAP.district('trust');
    if (edgeK > 0.002) {
      K.rr(T.x, T.y, T.w, T.h, 24);
      g.save(); g.strokeStyle = K.rgba(C.accent, 0.4 * edgeK); g.lineWidth = 2; g.stroke(); g.restore();
    }
    if (ringK > 0) {
      // drawn on the card's own edge, so it never crowds the 26 px seam (and its eyebrow) above
      const per = 2 * (T.w + T.h) - 8 * 24 + 2 * Math.PI * 24;
      g.save(); K.rr(T.x, T.y, T.w, T.h, 24);
      g.strokeStyle = K.rgba(C.accent, 0.85 * ringA); g.lineWidth = 3;
      if (ringK < 1) g.setLineDash([per * ringK + 1, per + 60]);
      g.stroke(); g.restore();
      K.glow(T.x + T.w / 2, T.y + T.h / 2, 260, C.accent, 0.07 * ringK * ringA);
    }
    washRow('14', tWashK, C.accent, C.strong);
    washRow('15', tWashK, C.accent, C.strong);
    if (lockK > 0) {
      // the tag sits on Trust's title line, right-aligned just left of the lock (like 05's "versions")
      const lx = T.x + T.w - 46, ly = T.y + 52 - (1 - lockK) * 16;
      K.glow(lx, ly, 46 + 18 * lockPulse, C.accent, 0.25 * lockK + 0.3 * lockPulse);
      K.icon('lock', lx, ly, 38, { color: C.accent, alpha: lockK });
      K.text('fastest-changing', lx - 34 - (1 - lockK) * 12, T.y + MAP.ROW.name, { size: 26, font: 'ui', weight: 600, color: C.accent, align: 'right', alpha: lockK });
    }

    // the seam between the two rows: a gold street line laid on "laid" (nothing else sits in that gutter)
    const y = 571, x0 = 250, x1 = 1670;
    const xe = K.lerp(x0, x1, K.io(t, tLaid, 0.9));
    if (runK > 0 && xe > x0) {
      g.save(); g.globalAlpha *= runK;
      K.line(x0, y, xe, y, { color: K.rgba(C.head, 0.55), w: 2 });
      g.restore();
    }
    // the eyebrow lives in the empty band above the top row, under the dark lantern ghosts (the label row's y)
    if (oldK > 0) K.eyebrow('Old streets, laid long ago', 960, 238 - (1 - oldK) * 6, { size: 26, weight: 600, tracking: 4, upper: true, font: 'ui', color: C.head, align: 'center', alpha: oldK });
  });

  // ------------------------------------------------------------------ STRUNG UP LAST (right end of the lantern row)
  if (strungK > 0) {
    const y = MAP.LANTERNS.y + 66;     // map.js's label row baseline (230)
    K.eyebrow('Strung up last', 1670 + (1 - strungK) * 14, y, { size: 28, weight: 600, tracking: 3, upper: true, color: C.accent, align: 'right', alpha: strungK });
  }
});
