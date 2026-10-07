/* 01.02 · scene 02 — Where it lives: the rename Aaron didn't know
   The course map (pin on 01, District 1 The Machine, stop 2), then 01.01's string of beads with its tag, then
   Aaron's true story (Python saved in Notepad as hello.txt, didn't know renaming to .py was the fix), then the
   window folds back into the string: this lesson is the why behind that rename.
   Beats (local seconds, cues.json):
     - [[pin]] 0       map assembles; on "District" the pin drops on row 01 (the scene's one 'back') and the
                       camera eases into The Machine; "asks" underlines its question; "second stop" adds a
                       small gold "· 2nd stop" tick inside row 01, just left of the pin.
     - [[beads]] 7.2   map fades; the cord draws and the 12 beads (print("hi")\n) drop in; "the bytes" lights
                       them + pill; "paper tag" swings the hello.txt tag on; "its name" pill under the tag.
     - [[notepad]] 14.9 the string shrinks into a centred Notepad window; cap tile + "IT degree" at its
                       top-right on "Aaron"; print("hi") types from the cue and finishes on "Python"; "dot T X T"
                       names the window hello.txt; on "renaming" a .py chip arcs into the title, and on "fix" the
                       title becomes hello.py (underlined); "Nobody" pill under the window.
     - [[why]] 27.5    the window starts fading 0.25 s before the cue and the string rises (higher) as it finishes;
                       eyebrow "the why behind the rename" on "why"; on "rename" a Notepad door rises under
                       it, lit (who answers .txt today); on "change" the gold hold ring + underline, the old
                       label strikes and the tag becomes hello.py (beads never move); on "different" Notepad
                       dims and a V S Code door slides in and lights, a gold dashed line from the string to it.
   Exit: the hello.py string over two doors (dashed line from the tag), V S Code lit, gently swaying. */
SCENE('02', (t, S) => {
  const C = K.C;

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 0);
  const tDist = S.find('District', 0, 0.7);
  const tAsks = S.find('asks', 0, 2.5);
  const tStop = S.find('second', 0, 5.88);
  const tBeads = S.cue('beads', 7.175);
  const tBytes = S.find('bytes', 0, 11.26);
  const tPaper = S.find('paper', 0, 12.07);
  const tName = S.find('name', 0, 14.01);
  const tNote = S.cue('notepad', 14.93);
  const tPython = S.find('Python', 0, 19.16);
  const tTXT = S.find('dot', 0, 20.42);                     // "dot T X T"
  const tPY = S.find('dot', 1, 23.6);                       // "dot P Y"
  const tFix = S.find('fix', 0, 24.81);
  const tNobody = S.find('Nobody', 0, 26.02);
  const tWhy = S.cue('why', 27.515);
  const tWhyW = S.find('why', 0, 28.54);
  const tRename = S.find(/^rename/, 0, 29.44);             // "that rename:"
  const tChange = S.find('change', 0, 30.79);
  const tDiff = S.find('different', 0, 32.44);
  const tProg = S.find('program', 0, 32.8);

  K.bg({ glow: 0.45 });

  // ------------------------------------------------------------------ the map (full canvas, then gone)
  const md = K.map.district('machine');
  const cam = K.cam(t, [
    { at: -10, x: 960, y: 540, z: 1 },
    { at: tDist, x: 640, y: 420, z: 1.45, d: 1.0 },
  ]);
  const mapA = 1 - K.io(t, tBeads - 0.1, 0.7);
  if (mapA > 0) K.layer(mapA, () => K.withCam(cam, () => {
    K.map.draw(t, {
      t0: tPin,
      focus: 'machine',
      focusK: K.io(t, tDist, 0.6),
      dim: 0.97,
      pin: '01',
      pinK: K.io(t, tDist, 0.25),
      pinDrop: K.io(t, tDist, 0.7, 'back'),
      pinGlowK: K.io(t, tDist + 0.4, 0.6),
      lanterns: 0.5,
    });
    // "which asks what's on your computer": gold underline under the district's question
    const qk = K.io(t, tAsks + 0.2, 0.6);
    if (qk > 0) K.mark(md.x + 40, md.y + K.map.ROW.q + 8, K.measure(md.q, { font: 'ui', size: K.map.TYPE.q }) + 6, qk, { alpha: 0.8, w: 3 });
    // "This is its second stop": a small gold tick inside the 01 row, just left of the pin
    const sk = K.io(t, tStop - 0.1, 0.6);
    if (sk > 0) {
      const c = K.map.chipPos('01');
      K.text('· 2nd stop', c.x + c.w - 44 + (1 - sk) * 10, c.y + 9, { size: 22, color: C.head, weight: 700, align: 'right', alpha: sk });
    }
  }));

  // ------------------------------------------------------------------ the string (01.01's file)
  const SX = 1069, SY = 470, SS = 0.95;                     // hero string: tag + beads centred on x 960 (s 0.95 -> byte numbers ~27 px)
  const RS = 0.62;                                          // [[why]] string scale (smaller, doors below)
  const WX = 900, WY = 470, WS = 1.15;                      // Notepad window centre and scale (centred; badge at its top-right)
  const RX = 1069, RY = 380;                                // [[why]]: the string sits higher, doors below
  // crossfades: the window starts leaving just before "This lesson", the string rises while it fades
  const strOut = K.io(t, tNote, 0.4);                       // string leaves (shrinks toward the window)
  const winIn = K.io(t, tNote + 0.4, 0.6);                  // then the window grows in
  const winOut = K.io(t, tWhy - 0.25, 0.4);                 // window leaves (ends at tWhy + 0.15)
  const strIn2 = K.io(t, tWhy + 0.05, 0.6);                 // the string rises as the window finishes fading
  const why = t >= tWhy + 0.05;
  const strA = why ? strIn2 : K.io(t, tBeads + 0.4, 0.4) * (1 - strOut);
  let G = null;
  if (strA > 0) {
    const sk = why ? 0 : strOut;
    const s = why ? RS : SS * K.lerp(1, 0.75, sk);
    const x = why ? RX : K.lerp(SX, WX, sk * 0.5), y = why ? RY + (1 - strIn2) * 16 : K.lerp(SY, WY, sk * 0.5);
    const litK = K.env(t, tBytes - 0.1, tPaper + 0.3, 0.4);
    const tagK = why ? 1 : K.io(t, tPaper - 0.1, 0.6);
    // the rename: underline .txt, hold ring on the beads, strike, the tag becomes hello.py
    const markK = why ? K.io(t, tChange - 0.35, 0.6) : 0;
    const strike = why ? K.io(t, tChange, 0.45) : 0;
    const renK = why ? K.io(t, tChange + 0.3, 0.7) : 0;
    const hold = why ? K.io(t, tChange - 0.2, 0.6) * (1 - K.io(t, tProg + 0.2, 0.8)) : 0;
    G = M.drawString(x, y, s, {
      t, preset: 'txt', alpha: strA,
      cordK: why ? 1 : K.io(t, tBeads + 0.4, 0.8),
      beadK: why ? 1 : (i) => K.stagger(t, tBeads + 0.6, i, 0.1, 0.5),
      lit: why ? 0.15 : (i) => litK * K.clamp(K.stagger(t, tBytes - 0.1, i, 0.04, 0.3)),
      labels: why ? 'none' : 'auto', hold,
      tagK, tagS: 0.8,
      tag: { name: 'hello.txt', to: 'hello.py', k: renK, swing: why ? 1 : tagK, mark: markK, strike },
    });
    // labels under the string (beads section only)
    if (!why) {
      const pa = strA * (1 - K.io(t, tNote - 0.2, 0.3));
      const bk = K.io(t, tBytes, 0.5) * pa;
      if (bk > 0) K.layer(bk, () => K.pill('the bytes', (G.x0 + G.x1) / 2, SY + 96 - bk * 8, { size: 28, color: C.strong }));
      const nk = K.io(t, tName - 0.15, 0.5) * pa;
      if (nk > 0 && G.tag) K.layer(nk, () => K.pill('its name', (G.tag.x0 + G.tag.x1) / 2, SY + 96 - nk * 8, { size: 28, color: C.strong }));
      const ek = K.io(t, tBeads + 0.6, 0.6) * pa;
      if (ek > 0) K.eyebrow('from lesson 01.01', 960, 330, { size: 26, align: 'center', alpha: ek });
    }
  }

  // ------------------------------------------------------------------ Notepad story
  const tRen = S.find('renaming', 0, 22.81);
  const winA = winIn * (1 - winOut);
  if (winA > 0) {
    const sc = WS * K.lerp(0.85, 1, winIn);
    K.layer(winA, () => K.at(WX, WY, sc, 0, () => {
      const named = t >= tTXT - 0.1;
      const r = K.win(-400, -220, 800, 440, { kind: 'notepad', title: named ? '' : 'Untitled - Notepad', titleSize: 26 });
      // print("hi") types from just after the window lands and finishes on "Python"
      K.editor(r, t, ['print("hi")'], { size: 40, typeAt: tNote + 1.0, cps: 11 / Math.max(1, tPython - tNote - 0.9), syntax: 'none' });
      // the title: hello.txt on "dot T X T"; on "fix" the flying .py lands and it becomes hello.py
      const by = -220 + 25 + 8 + (26 - 22) * 0.36, tx = -400 + 56, to = { size: 26, weight: 600 };
      const swap = K.io(t, tFix - 0.15, 0.3);
      if (named) {
        const nA = K.io(t, tTXT - 0.1, 0.3);
        const wHello = K.text('hello', tx, by, { ...to, color: C.body, alpha: nA });
        const ex = tx + wHello;
        const wT = K.measure('.txt', to), wP = K.measure('.py', to);
        if (swap < 1) K.text('.txt', ex, by, { ...to, color: C.body, alpha: nA * (1 - swap) });
        if (swap > 0) K.text('.py', ex, by, { ...to, color: C.accent, weight: 700, alpha: swap });
        K.text(' - Notepad', ex + K.lerp(wT, wP, swap), by, { ...to, color: C.body, alpha: nA });
        const mk = K.io(t, tFix + 0.05, 0.5);
        if (mk > 0) K.mark(ex - 2, by + 9, wP + 4, mk, { alpha: 0.85, w: 3 });
        // "renaming it to dot P Y": a .py chip appears just ABOVE the window, over the .txt it will replace,
        // waits there (fully outside the window), then drops into the title on "fix"
        const fk = K.io(t, tFix - 0.45, 0.35);
        const fA = K.io(t, tRen - 0.1, 0.3) * (1 - swap);
        if (fA > 0) {
          const x1 = ex + wT / 2, y1 = by - 9, x0 = x1, y0 = -262;
          const fx = x0, fy = K.lerp(y0 + (1 - K.io(t, tRen - 0.1, 0.4)) * 8, y1, fk);
          K.layer(fA, () => K.pill('.py', fx, fy, { size: 26, font: 'mono', color: C.accent, stroke: C.accent }));
        }
      }
    }));
  }
  // Aaron's degree, tucked at the window's top-right corner; "nobody told him" under the window
  const sideA = 1 - winOut;
  const capK = K.io(t, tNote + 0.45, 0.6) * sideA;
  if (capK > 0) K.layer(capK, () => {
    const dx = (1 - K.io(t, tNote + 0.45, 0.6)) * 40;
    K.iconTile('cap', 1490 + dx, 270, 96);
    K.pill('IT degree', 1490 + dx, 375, { size: 28, color: C.strong });
  });
  const nobK = K.io(t, tNobody - 0.1, 0.6) * sideA;
  if (nobK > 0) K.layer(nobK, () => K.pill('nobody told him', WX, 800 - nobK * 8, { size: 30, color: C.strong }));

  // ------------------------------------------------------------------ [[why]]: one change to a tag, a different program answers
  if (why) {
    const ek = K.io(t, tWhyW - 0.1, 0.6);
    if (ek > 0) K.eyebrow('the why behind the rename', 960, 230, { size: 28, align: 'center', alpha: ek });
    const DY = 520, DH = 300, DW = 170, NX = 800, VX = 1200;
    const npK = K.io(t, tRename - 0.1, 0.7);                // Notepad: who answers .txt today
    const vsK = K.io(t, tDiff - 0.1, 0.7);                  // V S Code slides in on "different"
    const swapK = K.io(t, tProg - 0.2, 0.6);                // ...and answers on "program"
    if (npK > 0) M.door(NX, DY + (1 - npK) * 40, DW, DH, {
      name: 'Notepad', alpha: npK, focus: K.io(t, tRename + 0.3, 0.5) * (1 - swapK), dim: swapK * 0.6,
    });
    if (vsK > 0) M.door(VX + (1 - vsK) * 80, DY, DW, DH, { name: 'V S Code', alpha: vsK, focus: swapK });
    // gold dashed line: the string to whichever door answers
    if (G) {
      const fromX = G.tag ? (G.tag.x0 + G.tag.x1) / 2 + 30 : (G.x0 + G.x1) / 2, fromY = G.tag ? G.tag.y1 + 14 : RY + G.r * 2 + 10;   // the tag decides
      const aN = K.io(t, tRename + 0.3, 0.6) * (1 - K.io(t, tChange - 0.2, 0.4));
      if (aN > 0) K.arrow(fromX, fromY, NX - 20, DY - 12, { k: aN, color: C.gold, w: 2.5, dash: [9, 9], alpha: 0.7 * aN, bend: 10 });
      const aV = K.io(t, tProg, 0.6);
      if (aV > 0) K.arrow(fromX, fromY, VX - 40, DY - 12, { k: aV, color: C.gold, w: 2.5, dash: [9, 9], alpha: 0.8, bend: 40 });
    }
  }
});
