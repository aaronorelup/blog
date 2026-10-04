/* 06 — The surprises you'll hit.
   Card 1 (hidden extensions) opens LARGE and centred so its hidden ".txt" can be read appearing; on [[png-jpg]] it
   shrinks into the top-left slot of a 2 x 2 grid (centred vertically, y 200-860) as card 2 arrives. Each card holds
   the lesson's object in miniature (M.drawString s 0.52, labels 'none', tag size 66) or a literal. Then the grid fades out
   fully and one string with a lying tag (invoice.pdf, its .exe hidden) takes the centre, the .exe inks on, and its first
   beads show the program stamp. Cards are drawn in card-local coordinates (800 x 310) through K.at, so the hero
   card and the grid card are the same drawing at two scales. */
SCENE('06', (t, S) => {
  const C = K.C;
  K.bg({ glow: 0.35 });

  // ---- beats (local seconds; fallbacks are the measured times)
  const cHidden = S.cue('hidden', 0);
  const fHide = S.find('hide', 0, 1.32);
  const fLooks = S.find('looks', 0, 3.98);
  const fReally = S.find('really', 0, 6.57);
  const fTxt = S.find(/^T$/, 0, 9.32);
  const cPng = S.cue('png-jpg', 11.31);
  const fJpg = S.find(/^J$/, 0, 13.98);
  const fConvert = S.find(/^doesn/, 0, 15.14);
  const cMoji = S.cue('mojibake', 16.75);
  const fAccent = S.find('accented', 0, 17.96);
  const fWrong = S.find('wrong', 0, 19.85);
  const cDbl = S.cue('double-click', 22.08);
  const fOpens = S.find('opens', 0, 24.6);
  const fDepends = S.find('depends', 0, 25.47);
  const cCost = S.cue('costume', 27.43);
  const fExe = S.find(/^E$/, 0, 31.32);
  const fProgram = S.find('program', 0, 32.93);
  const fTag = S.find('tag', 0, 35.36);

  // A hidden extension that simply appears: the tag is drawn with the short name at the FULL name's width, and the
  // last extension is inked on in tag-local space (no flap patch, no blank mid-crossfade); at k = 1 the full name
  // takes over so mark/ring land on the real extension. Same metrics as M.tag (pad 26s, baseline 0.36 size).
  const extTag = (base, full, size, s, k, extra) => {
    const font = { font: 'mono', weight: 600, size: size * s };
    const w = Math.max(220 * s, K.measure(full, font) + 92 * s);
    return { name: k >= 1 ? full : base, w, size, ...extra };
  };
  const inkExt = (r, base, full, size, s, k, alpha = 1) => {
    if (!r || !r.tag || k <= 0 || k >= 1) return;
    const g = K.ctx(), font = { font: 'mono', weight: 600, size: size * s };
    const x = -r.tag.w + 26 * s + K.measure(base, font);
    g.save(); g.translate(r.tag.x1, (r.tag.y0 + r.tag.y1) / 2); g.rotate(r.tag.rot);
    K.text(full.slice(base.length), x, size * s * 0.36, { ...font, color: M.palette.tagInk, alpha: k * alpha });
    g.restore();
  };

  // ---- grid: four 800 x 310 cards, centred on the frame (x 140-1780, y 200-860)
  const CW = 800, CH = 310;
  const slots = [[140, 200], [980, 200], [140, 550], [980, 550]];
  const enters = [cHidden, cPng + 0.35, cMoji, cDbl];
  const gridDim = 1 - K.io(t, cCost - 0.45, 0.45);           // grid (and heading) fully gone just before the costume
  const eyeA = K.io(t, cHidden, 0.5) * gridDim;
  if (eyeA > 0) K.eyebrow("THE SURPRISES YOU'LL HIT", 960, 160, { size: 22, align: 'center', alpha: eyeA });

  // card 1 starts as a hero (scale 1.4, centred at 960, 545) and settles into its slot on [[png-jpg]]
  const HS = 1.4, hero = [960 - CW * HS / 2, 545 - CH * HS / 2];
  const settle = K.io(t, cPng, 0.8);
  const place = (n) => {
    if (n !== 0) return [slots[n][0], slots[n][1], 1];
    return [K.lerp(hero[0], slots[0][0], settle), K.lerp(hero[1], slots[0][1], settle), K.lerp(HS, 1, settle)];
  };

  // a card frame + its label; body() draws the contents in card-local space (0..CW, 0..CH)
  const card = (n, label, labelAt, body) => {
    const k = K.io(t, enters[n], 0.5);
    if (k <= 0) return;
    const [x, y, sc] = place(n);
    K.layer(k * gridDim, () => K.at(x, y + (1 - k) * 18, sc, 0, () => {
      K.card(0, 0, CW, CH, { r: 24, fill: K.rgba(C.page, 0.55), stroke: C.line2, shadow: false });
      body();
      const lk = K.io(t, labelAt, 0.5);
      if (lk > 0) K.text(label, CW / 2, 278, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center', alpha: lk });
    }));
  };
  const MS = 0.52;   // mini-string scale inside cards (1.24 x the old 0.42)

  // 1 — hidden extensions: the tag reads hello.py; on "really be" the hidden .txt inks on
  card(0, 'hidden extensions, still default', fHide, () => {
    const open = K.io(t, fReally + 0.3, 0.9);
    const r = M.drawString(540, 130, MS, {
      t, labels: 'none', bytes: M.BYTES.slice(0, 6),
      beadK: (i) => K.stagger(t, cHidden + 0.1, i, 0.08, 0.4),
      tag: extTag('hello.py', 'hello.py.txt', 66, MS, open, { mark: open >= 1 ? K.io(t, fTxt, 0.5) : 0, markColor: C.accent }),
    });
    inkExt(r, 'hello.py', 'hello.py.txt', 66, MS, open);
    // a tiny caption under the tag: what you see -> what it really is
    if (r.tag) {
      const cx = (r.tag.x0 + r.tag.x1) / 2;
      const kLook = K.io(t, fLooks, 0.5) * (1 - K.io(t, fReally, 0.4));
      const kReal = K.io(t, fReally + 0.2, 0.5) * (1 - K.io(t, cPng, 0.4));
      if (kLook > 0) K.text('what you see', cx, 215, { font: 'ui', weight: 400, size: 26, color: C.soft, align: 'center', alpha: kLook });
      if (kReal > 0) K.text('what it really is', cx, 215, { font: 'ui', weight: 600, size: 26, color: C.accent, align: 'center', alpha: kReal });
    }
  });

  // 2 — renamed, not converted: photo.png -> photo.jpg, the ‰PNG stamp stays (ringed gold)
  card(1, 'renamed, not converted', fConvert, () => {
    M.drawString(510, 150, MS, {
      t, preset: 'png', labels: 'none', bytes: M.STRINGS.png.bytes.slice(0, 6), stampLabel: '·PNG',   // same label as 05 (UI font has no per-mille glyph)
      stampRing: K.io(t, fConvert, 0.6),
      tag: { name: 'photo.png', to: 'photo.jpg', k: K.io(t, fJpg - 0.1, 0.6), size: 66 },
    });
  });

  // 3 — mojibake: café read with the wrong card comes out cafÃ©
  card(2, 'wrong code card', fWrong, () => {
    const kL = K.io(t, fAccent - 0.2, 0.5), kA = K.io(t, fWrong - 0.3, 0.6), kJ = K.io(t, fWrong - 0.1, 0.5);
    const yy = 125;
    if (kL > 0) M.chip('café', 220, yy, { size: 44, alpha: kL, stroke: K.rgba(C.gold, 0.7) });
    if (kA > 0.05) K.arrow(330, yy, 450, yy, { k: kA, color: C.accent, w: 3, alpha: K.clamp(kA * 4) });
    if (kJ > 0) M.chip('cafÃ©', 590, yy, { size: 44, alpha: kJ, color: C.accent, stroke: K.rgba(C.accent, 0.7) });
  });

  // 4 — double-click a .py: what opens depends on the machine. Each target tile fades in first, then its arrow
  //     draws to it from one shared origin at the file's right edge.
  card(3, 'depends on the machine', fDepends, () => {
    const fx = 220, fy = 110, fs = 120;
    K.file(fx, fy, fs, { ext: 'py', name: 'hello.py', nameSize: 28 });
    const ox = fx + fs * 0.39 + 18, oy = fy;                   // shared origin, just right of the file
    const tiles = [['code', 50], ['file', 125], ['question', 200]];
    const tx = 620, ts = 62;
    tiles.forEach(([ic, ty], i) => {
      const ki = K.stagger(t, fOpens - 0.25, i, 0.22, 0.4);
      if (ki <= 0) return;
      K.iconTile(ic, tx, ty, ts, { alpha: ki, stroke: C.line2 });
      const ka = K.stagger(t, fOpens - 0.05, i, 0.22, 0.45);
      if (ka > 0.05) K.arrow(ox, oy, tx - ts / 2 - 14, ty, { k: ka, color: C.soft, w: 2.5, headSize: 13, alpha: K.clamp(ka * 4) });
    });
  });

  // 5 — the costume: invoice.pdf, then its hidden .exe inks on; its first beads carry the program stamp
  if (t > cCost - 0.05) {
    const MZ = [77, 90, 144, 0, 3, 0, 0, 0, 4, 0, 0, 0];     // the real first bytes of a Windows program (MZ header)
    const open = K.io(t, fExe - 0.15, 0.6);
    const sx = 1139, sy = 560, s = 0.8;
    const r = M.drawString(sx, sy, s, {
      t, bytes: MZ,
      beadK: (i) => K.stagger(t, cCost + 0.5, i, 0.07, 0.4),
      cordK: K.io(t, cCost + 0.4, 0.6),
      stamp: 2, stampLabel: 'MZ', stampK: K.io(t, fProgram - 0.1, 0.6),
      tag: extTag('invoice.pdf', 'invoice.pdf.exe', 40, s, open, {
        swing: K.io(t, cCost + 0.45, 0.8, 'back'),
        mark: open >= 1 ? K.io(t, fProgram - 0.3, 0.6) : 0, markColor: C.accent,
      }),
      tagK: K.io(t, cCost + 0.45, 0.4),
    });
    inkExt(r, 'invoice.pdf', 'invoice.pdf.exe', 40, s, open, K.io(t, cCost + 0.45, 0.4));
    const wk = K.io(t, fTag - 0.2, 0.5);
    if (wk > 0 && r.tag) {
      K.icon('warning', r.tag.ext.cx, r.tag.y0 - 62, 64, { color: C.accent, alpha: wk });
      K.pill('a tag can lie', 960, 750, { size: 30, color: C.strong, stroke: K.rgba(C.accent, 0.7), alpha: wk });
    }
  }
});
