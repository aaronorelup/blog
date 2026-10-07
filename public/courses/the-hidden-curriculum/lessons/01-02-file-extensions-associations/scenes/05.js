/* 05 The folded tag: hidden extensions.
   A close-up on one string (hello.py.txt): the tag folds at the last dot, the hidden part is ringed, a setting
   ("Show file extensions") unfolds it, then one card per system: Windows (Advanced page) and Mac (per-file hiding).
   Cues (local s): folded 0 · fold-trap 9.67 · unfold 20.49 · advanced 23.88 · mac-per-file 29.30 · builders 35.09 */
SCENE('05', (t, S) => {
  K.bg();
  const C = K.C;

  const cFold = S.cue('fold-trap', 9.67), cUnfold = S.cue('unfold', 20.49), cAdv = S.cue('advanced', 23.88);
  const cMac = S.cue('mac-per-file', 29.3), cBuild = S.cue('builders', 35.09);
  const wFolded = S.find('folded', 0, 6.0);                 // "The tag is folded at the last dot"
  const wReally = S.find('really', 0, 10.3);                // "A file really named hello.py.txt"
  const wStill = S.find('still', 1, 16.8);                  // "It's still a text file"
  const wAdvanced = S.find('Advanced', 0, 28.2);
  const wPer = S.find('per', 0, 31.2);                      // "per file"
  const wDis = S.find('disagree', 0, 33.8);
  const wSwitch = S.find('switch', 0, 37.0);

  // ---- the hero string: bead row + a big tag, the whole assembly centred on x 1000
  const s = 0.6, n = 8, tagS = 1.5, name = 'hello.py.txt';
  const tw = M.tagWidth(name, tagS);
  const total = tw + 62 * s + (n - 1) * 100 * s + 38 * s + 28 * s;
  const bx = 1000 - total / 2 + tw + 62 * s + (n - 1) * 100 * s / 2, by = 410;

  const fold = K.io(t, wFolded, 0.8) * (1 - K.io(t, cUnfold + 1.3, 0.8));
  const ring = K.io(t, wReally + 0.6, 0.7) * (1 - K.io(t, cUnfold + 1.1, 0.5));
  const unfolded = K.io(t, cUnfold + 1.3, 0.8);
  const mark = K.io(t, wSwitch, 0.7);

  // ---- porter, small, at the left: he still reads the whole tag
  M.porter(200, 420, 110, { t, look: 0.35, alpha: 0.95 });

  // ---- the Notepad door at the right: "still a text file" -> the porter still sends it to Notepad
  const doorIn = K.io(t, wStill, 0.7), doorOut = K.io(t, cUnfold + 0.6, 0.7);
  if (doorIn > 0 && doorOut < 1) {
    M.door(1660, 250 + (1 - K.ease.out(doorIn)) * 40, 170, 400, { name: 'Notepad', alpha: doorIn * (1 - doorOut) * 0.9, focus: 0.45 * doorIn });
  }

  const G = M.drawString(bx, by, s, {
    t, preset: 'pytxt', n, labels: 'none', tagS,
    tag: {
      name, fold, mark,
      extColor: unfolded > 0.3 ? K.mixColor(M.palette.tagInk, C.accent, unfolded) : undefined,
    },
  });
  const ext = G.tag ? G.tag.ext : { cx: 760, cy: 410, x0: 700, x1: 820 };
  // terracotta ring round the folded flap only (kept clear of the visible name)
  const foldRing = (e, tg, k, sc) => {
    if (k <= 0 || !tg) return;
    const rx = (e.x1 - e.x0) / 2 + 5 * sc, cx = e.cx + 6 * sc, cy = e.cy + (cx - e.cx) * Math.sin(tg.rot);
    K.ring(cx, cy, rx, tg.h * 0.4, k, { color: C.accent, w: Math.max(2.5, 4 * sc), rot: tg.rot });
  };
  // the hidden label as a faint ghost on the flap, so the ring circles a hidden '.txt', not a blank
  const ghost = (tg, nm, k, sc, size) => {
    if (k <= 0 || !tg) return;
    const d = nm.lastIndexOf('.'); if (d <= 0) return;
    const g = K.ctx(), fs = (size || 34) * sc;
    g.save(); g.translate(tg.x1, (tg.y0 + tg.y1) / 2); g.rotate(tg.rot);
    K.text(nm.slice(d), tg.ext.x0 - tg.x1, fs * 0.36, { font: 'mono', weight: 600, size: fs, color: M.palette.tagInk, alpha: 0.2 * k });
    g.restore();
  };
  ghost(G.tag, name, K.clamp((fold - 0.6) / 0.4) * (1 - unfolded), tagS);
  foldRing(ext, G.tag, ring, tagS);

  // "still a text file" under the ringed fold
  const stillK = K.io(t, wStill, 0.5) * (1 - K.io(t, cUnfold, 0.4));
  if (stillK > 0) M.quiet('still a text file', ext.cx, 545, { color: C.strong, alpha: stillK });

  // ---- a ghosted File Explorer row under the tag: what the folded tag looks like in a folder.
  // The name column mirrors the tag (".txt" fades as the tag folds, returns in accent when it unfolds);
  // the Type column keeps saying "Text Document" (marked on "still a text file"). Leaves before the cards.
  const exK = K.io(t, 2.0, 0.8) * (1 - K.io(t, cAdv - 0.6, 0.6));
  if (exK > 0) {
    const wx = 560, wy = 660 + (1 - K.ease.out(K.io(t, 2.0, 0.8))) * 24, ww = 800, wh = 210, a = 0.92 * exK;
    const r = K.win(wx, wy, ww, wh, { title: 'File Explorer', titleSize: 26, kind: 'explorer', alpha: a });
    K.layer(a, () => {
      const hy = r.y + 44, ry = r.y + 112, nx = r.x + 96, tx = r.x + 470;
      K.text('Name', r.x + 40, hy, { font: 'ui', weight: 600, size: 26, color: C.soft });
      K.text('Type', tx, hy, { font: 'ui', weight: 600, size: 26, color: C.soft });
      K.line(r.x + 24, hy + 20, r.x + ww - 24, hy + 20, { color: C.line, w: 1.5 });
      K.icon('file', r.x + 58, ry - 10, 34, { color: C.body, w: 2.2 });
      const base = 'hello.py', nf = { font: 'mono', weight: 600, size: 30 };
      K.text(base, nx, ry, { ...nf, color: C.strong });
      const extA = unfolded;   // a folder already hides it: the row enters folded, only the big tag shows .txt before its fold
      if (extA > 0.01) K.text('.txt', nx + K.measure(base, nf), ry, { ...nf, color: unfolded > 0.3 ? C.accent : C.strong, alpha: extA });
      K.text('Text Document', tx, ry, { font: 'ui', weight: 600, size: 30, color: C.body });
      K.mark(tx, ry + 14, K.measure('Text Document', { font: 'ui', weight: 600, size: 30 }), K.io(t, wStill, 0.6), { color: C.gold, w: 4 });
    });
  }

  // ---- date card (top): the current state, as of this month
  const dcW = 760;
  M.dateCard('Oct 2026 · Windows 11 26H2 · macOS 27', 'extensions still hidden by default', 960 - dcW / 2, 140,
    { k: K.io(t, 0.2, 0.7), w: dcW, alpha: 1 - 0.5 * K.io(t, cUnfold, 0.6) });

  // ---- the setting: pill + toggle under the tag; the toggle flips, the fold opens
  const pillK = K.io(t, cUnfold, 0.6);
  if (pillK > 0) {
    const label = 'Show file extensions';
    const pw = K.measure(label, { font: 'ui', weight: 600, size: 28 }) + 28 * 1.6;
    const tgW = 64, gap = 18, rowW = pw + gap + tgW;
    const px = ext.cx - rowW / 2 + pw / 2 - (1 - K.ease.out(pillK)) * 60, py = 590;
    const on = K.io(t, cUnfold + 0.9, 0.35);
    K.layer(pillK, () => {
      K.pill(label, px, py, { size: 28, color: C.head, glow: 0.5 * on });
      const tx = px + pw / 2 + gap, ty = py - 17, g = K.ctx();
      K.rr(tx, ty, tgW, 34, 17); g.fillStyle = K.mixColor(C.line2, C.head, on); g.fill();
      g.beginPath(); g.arc(tx + 17 + (tgW - 34) * on, ty + 17, 12, 0, Math.PI * 2); g.fillStyle = on > 0.5 ? C.page : C.strong; g.fill();
      // builders: a check settles beside it
      const ck = K.io(t, cBuild + 0.3, 0.6);
      if (ck > 0) K.icon('check', tx + tgW + 40, py, 40, { color: C.head, alpha: ck, w: 4 });
    });
  }

  const dimCards = 1 - 0.25 * K.io(t, cBuild, 0.7);

  // ---- Windows card (right): the setting's page is now called Advanced
  const advK = K.io(t, cAdv, 0.7);
  if (advK > 0) {
    const cx = 1150, cy = 640;
    K.layer(dimCards, () => {
      M.dateCard('Windows 11 · 25H2 and later', 'Advanced (formerly For developers)', cx, cy, { k: advK, tone: 'quiet' });
      const mw = K.measure('Advanced', { font: 'ui', weight: 600, size: 28 });
      K.mark(cx + 28, cy + 94, mw, K.io(t, wAdvanced, 0.6), { color: C.gold, w: 4 });
    });
  }

  // ---- Mac card (left): one folder, two files, hidden per file
  const macK = K.io(t, cMac, 0.7);
  if (macK > 0) {
    const x0 = 200, y0 = 640 + (1 - K.ease.out(macK)) * 18, w = 600, h = 270;
    K.layer(macK, () => {
      K.card(x0, y0, w, h, { r: 18, fill: C.tile, stroke: C.line2 });
      K.folder(x0 + 46, y0 + 44, 36, {});
      K.text('Mac · one folder · Hide extension', x0 + 76, y0 + 54, { font: 'ui', weight: 600, size: 28, color: C.strong });
      const cols = [x0 + 160, x0 + 440];
      const files = [{ nm: 'photo.png', f: 0 }, { nm: 'photo2.png', f: K.io(t, wPer, 0.7) }];
      files.forEach((fl, i) => {
        const fx = cols[i];
        K.file(fx, y0 + 130, 74, {});
        const tws = M.tagWidth(fl.nm, 0.77);
        const tg = M.tag(fx + tws / 2 + 12, y0 + 222, { name: fl.nm, s: 0.77, rot: -0.03, t: t + i * 1.3, fold: fl.f });
        if (i === 1) { ghost(tg, fl.nm, K.clamp((fl.f - 0.6) / 0.4), 0.77); foldRing(tg.ext, tg, K.io(t, wDis, 0.6), 0.77); }
      });
      // dim with a veil (a layer alpha would let the hidden label show through the folded flap)
      if (dimCards < 1) { const g = K.ctx(); K.rr(x0 - 2, y0 - 2, w + 4, h + 4, 20); g.fillStyle = K.rgba(C.page, 1 - dimCards); g.fill(); }
    });
  }
});
