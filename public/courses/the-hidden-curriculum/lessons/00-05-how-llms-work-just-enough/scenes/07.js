// 07 — Diffusion: from static to picture
// Phase A (0 → not-all): inside the studio. A big square canvas well goes from static to the tea-house picture,
//   step thumbnails on the right, the prompt nudging from the left; then the families list and flow matching.
// Phase B (not-all → text-diffusion): two wells side by side: diffusion (all at once) vs piece by piece (reported).
// Phase C (text-diffusion → end): text: a smudged page that sharpens all at once vs words written one after another.
SCENE('07', (t, S) => {
  const C = K.C, g = K.ctx();
  K.bg();

  const cNoise = S.cue('noise', 4.6), cSteps = S.cue('steps', 7.5), cPic = S.cue('picture', 15.2);
  const cFam = S.cue('families', 17.3), cNot = S.cue('not-all', 32.3), cText = S.cue('text-diffusion', 42.2);
  const cFront = S.cue('frontier', 57.7);
  const w = (re, n, fb) => S.find(re, n || 0, fb);
  const tDiff = w(/^diffusion/i, 0, 3.3);
  const tNudged = w(/^nudged/i, 0, 13.2);
  const tImages = w(/^images/i, 0, 18.4), tVideo = w(/^video/i, 0, 19.1), tSound = w(/^sound/i, 0, 19.8), tMusic = w(/^music/i, 0, 20.8);
  const tVoices = w(/^voices/i, 0, 23.7), tFlow = w(/^flow/i, 0, 29.0), tFewer = w(/^fewer/i, 0, 30.5);
  const tOpenAI = w(/^openai/i, 0, 35.4), tReported = w(/^reported/i, 0, 37.7), tPiece = w(/^piece/i, 0, 39.3);
  const tMercury = w(/^mercury/i, 0, 46.7), tGoogle = w(/^google/i, 0, 47.3), tSmudged = w(/^smudged/i, 0, 51.0);
  const tSharpen = w(/^sharpen/i, 0, 52.3), tFast = w(/^fast/i, 0, 54.9), tOneTok = w(/^token$/i, 0, 60.4);
  const tMachine = w(/^machine/i, 0, 65.5), tOwn = tMachine - 1.6;

  const A = 1 - K.io(t, cNot, 0.6);                 // phase A visibility
  const Bin = K.io(t, cNot + 0.6, 0.6), Bout = 1 - K.io(t, cText, 0.6);
  const Cin = K.io(t, cText + 0.4, 0.7);

  // ---------------------------------------------------------------- the big well: moves from the studio (A) to the left of B
  const mv = K.io(t, cNot, 0.8);
  // opening: 06's studio (right, 190x420, well 150 at 1705,540) zooms to centre, so the crossfade reads as walking in
  const zm = K.io(t, 0, 0.8);
  // a slow push on the canvas from the first frame to 'noise' (keeps the opening alive)
  const push = 0.94 + 0.06 * K.io(t, 0, cNoise + 0.6, 'sine');
  // centred at 960 until the steps column arrives, then eased left to make room for it
  const sx = K.io(t, cSteps - 0.6, 0.8);
  const cx0 = K.lerp(960, 860, sx);
  const wx = K.lerp(K.lerp(1705, cx0, zm), 560, mv), wy = K.lerp(K.lerp(540, 530, zm), 500, mv);
  const ws = K.lerp(K.lerp(150, 600 * push, zm), 380, mv);
  // k: static → picture over the steps, then the crisp finish on 'picture'; in B the picture dissolves back to
  // static while moving, then rebuilds alongside the piece-by-piece well
  const stepT = (i) => cSteps + 0.2 + i * 1.6;      // thumbnail i lands (5 steps, the last one just before 'picture')
  let kBig = 0.85 * K.clamp((t - stepT(0)) / (stepT(4) - stepT(0))) + 0.15 * K.io(t, cPic, 1.2);
  const bRun0 = cNot + 2.2, bRun1 = tPiece + 1.4;
  if (t >= cNot) {
    const back = 1 - K.io(t, cNot, 1.4);            // dissolve back to static
    kBig = t < bRun0 ? back : K.io(t, bRun0, bRun1 - bRun0, 'sine');
  }

  // ---------------------------------------------------------------- phase A: the studio room
  if (A > 0) K.layer(A, () => {
    const op = K.io(t, 0, 0.8);
    // the studio room card: from 06's studio rect to the big room
    const rx0 = K.lerp(1610, cx0 - 350, zm), ry0 = K.lerp(340, 162, zm), rw = K.lerp(190, 700, zm), rh = K.lerp(420, 716, zm);
    K.card(rx0, ry0, rw, rh, { r: K.lerp(18, 22, zm), fill: K.rgba(M.mixHex(C.tile, C.page, 0.2), K.lerp(1, 0.55, zm)), stroke: K.rgba(C.accent, 0.7 - 0.35 * zm + 0.35 * op * zm), lw: 2.5 - zm, glow: 0 });
    if (zm < 1) K.glow(1705, 540, 220, C.accent, 0.16 * (1 - zm));
    K.eyebrow('STUDIO', rx0 + rw / 2, K.lerp(398, 200, zm), { align: 'center', size: 20, color: C.accent });
    // the easel legs of 06's studio fade as the canvas grows
    if (zm < 1) K.layer(1 - zm, () => {
      const lx = wx, ly = wy + ws / 2 + 6, by = ry0 + rh - 50;
      K.line(lx - 40, ly, lx - 58, by, { color: C.line2, w: 3 }); K.line(lx + 40, ly, lx + 58, by, { color: C.line2, w: 3 });
      K.line(lx, ly, lx, by + 10, { color: C.line2, w: 3 });
    });
    // title, left column
    K.layer(K.io(t, tDiff - 0.2, 0.6), () => K.title('diffusion', 310, 300, { size: 60, align: 'center' }));
    // the prompt card + its nudge line
    const pk = K.io(t, tNudged - 0.4, 0.6);
    if (pk > 0) K.layer(pk * (1 - K.io(t, cFam + 6, 0.8) * 0.45), () => {
      K.card(140, 448, 300, 150, { r: 18, fill: C.page, stroke: K.rgba(C.head, 0.45) });
      K.eyebrow('PROMPT', 166, 486, { size: 20 });
      K.text('a tea house', 166, 532, { font: 'read', size: 30, color: C.strong });
      K.text('at night', 166, 572, { font: 'read', size: 30, color: C.strong });
      K.arrow(452, 523, 546, 523, { k: K.io(t, tNudged - 0.1, 0.5), color: C.head, dash: [8, 8], w: 3, head: true, alpha: 0.8 });
      // a pulse on the nudge line each time a step lands
      for (let i = 0; i < 5; i++) {
        const u = K.seg(t, stepT(i) - 0.45, stepT(i));
        if (u > 0 && u < 1 && t > tNudged) { K.glow(452 + 94 * u, 523, 22, C.head, 0.6); }
      }
    });
  });

  // well: blank canvas until the static fades in on 'noise'
  if (t < cNoise + 0.8 && A > 0) K.layer(A, () => K.card(wx - ws / 2 - 8, wy - ws / 2 - 8, ws + 16, ws + 16, { r: 6, fill: C.page, stroke: C.line2, shadow: true }));
  // faint static shimmer once 06's finished picture has cleared, rising to full on 'noise'
  const wellA = (0.32 + 0.68 * K.io(t, cNoise - 0.2, 0.8)) * K.io(t, 1.3, 0.8) * Bout;
  if (wellA > 0) {
    M.well(t, wx, wy, ws, kBig, { seed: 7, alpha: wellA });
    // lift the static's dark end so it reads as grey static, not a black square (M.well's noise floor is #1A1B2C)
    const lift = wellA * Math.pow(1 - K.clamp(kBig), 1.15) * (1 - K.seg(kBig, 0.6, 0.85));
    if (lift > 0.01) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = lift; g.fillStyle = '#4E4A44'; g.fillRect(wx - ws / 2, wy - ws / 2, ws, ws); g.restore(); }
  }
  // 06's finished studio picture rides in with the zoom, then clears to a fresh canvas
  const oldPic = 1 - K.io(t, 1.0, 0.9);
  if (oldPic > 0) M.well(t, wx, wy, ws, 1, { seed: 3, still: true, alpha: oldPic, frame: false });

  // step thumbnails (right column), each less noisy
  const thumbOut = 1 - K.io(t, cFam, 0.6);
  if (A > 0 && thumbOut > 0 && t > cSteps - 0.3) K.layer(A * thumbOut, () => {
    K.layer(K.io(t, cSteps, 0.5), () => K.eyebrow('STEPS', 1400, 205, { align: 'center', size: 20 }));
    for (let i = 0; i < 5; i++) {
      const ty = 287 + i * 122, a0 = stepT(i) - 0.4;
      const k = K.io(t, a0, 0.5, 'out');
      if (k <= 0) continue;
      const newest = i === 4 ? t < cPic + 0.6 : t < stepT(i + 1) - 0.4;
      K.layer(k, () => {
        if (newest) K.glow(1400, ty, 90, C.head, 0.18);
        M.well(t, 1400 + (1 - k) * 30, ty, 100, i / 4, { cells: 30, still: true, seed: 7 });
        { const lf = Math.pow(1 - i / 4, 1.15) * (1 - K.seg(i / 4, 0.6, 0.85)); if (lf > 0.01) { const x = 1400 + (1 - k) * 30; g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha *= lf; g.fillStyle = '#4E4A44'; g.fillRect(x - 50, ty - 50, 100, 100); g.restore(); } }
        if (newest) K.card(1400 - 58, ty - 58, 116, 116, { r: 8, fill: 'rgba(0,0,0,0)', stroke: K.rgba(C.head, 0.8), shadow: false, glow: 0 });
        K.text(String(i + 1), 1490, ty + 10, { font: 'mono', size: 26, weight: 600, color: newest ? C.head : C.soft });
      });
    }
  });

  // families (right column): images · video · sound effects · music, then voices (mostly not), then flow matching
  if (A > 0 && t > cFam) K.layer(A, () => {
    K.layer(K.io(t, cFam + 0.2, 0.5), () => K.eyebrow('SAME TRICK MAKES', 1460, 220, { align: 'center', size: 20 }));
    [['images', tImages], ['video', tVideo], ['sound effects', tSound], ['music', tMusic]].forEach(([s, at], i) => {
      const k = K.io(t, at - 0.15, 0.5, 'out');
      if (k > 0) K.layer(k, () => K.pill(s, 1460 + (1 - k) * 24, 280 + i * 72, { size: 30, color: C.strong }));
    });
    const vk = K.io(t, tVoices - 0.1, 0.5);
    if (vk > 0) K.layer(vk * 0.85, () => {
      K.pill('voices: mostly not', 1460, 580, { size: 26, color: C.soft });
    });
    // flow matching: fewer steps (3 tiny frames instead of 5)
    const fk = K.io(t, tFlow - 0.2, 0.6);
    if (fk > 0) K.layer(fk, () => {
      K.card(1250, 640, 420, 200, { r: 18, fill: C.page, stroke: K.rgba(C.head, 0.4) });
      K.text('flow matching', 1460, 686, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center' });
      [0, 1, 2].forEach((i) => {
        const kk = K.io(t, tFewer - 0.2 + i * 0.25, 0.4, 'out');
        if (kk > 0) K.layer(kk, () => M.well(t, 1350 + i * 110, 768, 76, i / 2, { cells: 24, still: true, seed: 7 }));
        if (i < 2 && kk > 0) K.layer(kk, () => K.text('›', 1405 + i * 110, 778, { font: 'ui', size: 30, color: C.soft, align: 'center' }));
      });
    });
  });

  // ---------------------------------------------------------------- phase B: all at once vs piece by piece
  const B = Bin * Bout;
  if (B > 0) K.layer(B, () => {
    // left label set (the moving well itself is drawn above)
    K.text('most image models', 560, 270, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center' });
    K.text('the whole picture at once', 560, 746, { font: 'ui', weight: 600, size: 28, color: C.head, align: 'center' });
    // right: tile by tile in reading order
    const rk = K.io(t, tOpenAI - 0.3, 0.6);
    K.layer(rk, () => {
      K.text("OpenAI's image models", 1360, 270, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center' });
      M.well(t, 1360, 500, 380, K.seg(t, bRun0, bRun1 + 0.6), { order: 'tiles', cells: 24, seed: 7 });
    });
    K.layer(K.io(t, tPiece - 0.2, 0.6), () => K.text('piece by piece, like text', 1360, 746, { font: 'ui', weight: 600, size: 28, color: C.head, align: 'center' }));
    K.layer(K.io(t, tReported - 0.1, 0.5), () => M.flag('reported', 1360, 802));
    K.layer(K.io(t, cNot + 0.6, 0.6), () => K.text('vs', 960, 512, { font: 'read', size: 34, color: C.soft, align: 'center', italic: true }));
  });

  // ---------------------------------------------------------------- phase C: text, two ways
  if (Cin > 0) {
    const lines = ['A lantern hangs by the door,', 'the window glows gold,', 'and the kettle is on.'];
    const fo = { font: 'read', size: 32 };
    const cardY = 380, cardH = 250, rx = 1060, cw = 660;
    // the diffusion card enters centred, then slides into its left slot when 'frontier' brings its partner
    const lx = K.lerp(630, 200, K.io(t, cFront - 0.15, 0.6));
    // left card: diffusion text (smudged → sharp, every word at once)
    const sharp = K.io(t, tSharpen - 0.3, 2.2, 'sine');
    const leftDim = 1;
    K.layer(Cin * leftDim, () => {
      K.eyebrow('DIFFUSION TEXT · RARE', lx, cardY - 26, { size: 20 });
      K.card(lx, cardY, cw, cardH, { r: 20, fill: C.paper, stroke: false });
      const R = K.rng(41 + (sharp < 1 ? Math.floor(t * 10) : 0) * 7919);
      lines.forEach((ln, li) => {
        let x = lx + 44;
        ln.split(' ').forEach((wd) => {
          const ww = K.measure(wd + ' ', fo), jx = (R() - 0.5) * 14 * (1 - sharp), jy = (R() - 0.5) * 10 * (1 - sharp);
          const blur = Math.round(9 * (1 - sharp) * 10) / 10;
          g.save();
          if (blur > 0.2) g.filter = `blur(${blur}px)`;
          const col = K.mixColor('#9A8F80', C.ink, sharp);
          K.text(wd, x + jx, cardY + 80 + li * 58 + jy, { ...fo, color: col, alpha: 0.55 + 0.45 * sharp });
          g.restore();
          x += ww;
        });
      });
      // pills: who makes them
      const p1 = 'Mercury · Inception', p2 = 'Google · experimental';
      const pw = (s) => K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 42;
      const w1 = pw(p1), w2 = pw(p2), gap = 18, x0 = lx + cw / 2 - (w1 + w2 + gap) / 2;
      K.layer(K.io(t, tMercury - 0.3, 0.5), () => K.pill(p1, x0 + w1 / 2, cardY + cardH + 56, { size: 26, color: C.strong }));
      K.layer(K.io(t, tGoogle - 0.1, 0.5), () => K.pill(p2, x0 + w1 + gap + w2 / 2, cardY + cardH + 56, { size: 26, color: C.strong }));
      K.layer(K.io(t, tFast - 0.4, 0.5), () => M.flag('fast · not frontier', lx + cw / 2, cardY + cardH + 136));
    });
    K.layer(Cin * K.io(t, tMercury - 0.3, 0.6), () => M.dated('Oct 2026', 1840, 172, { align: 'right' }));

    // right card: one token after another
    const rk = K.io(t, cFront, 0.6);
    if (rk > 0) K.layer(rk, () => {
      K.eyebrow('TOP CHAT MODELS', rx, cardY - 26, { size: 20 });
      K.card(rx, cardY, cw, cardH, { r: 20, fill: C.paper, stroke: K.rgba(C.head, 0.6) });
      const t0 = cFront + 0.5, step = M.motion.token;
      let n = 0, penX = rx + 44, penY = cardY + 80;
      const total = lines.join(' ').split(' ').length;
      const shown = Math.max(0, Math.min(total, Math.floor((t - t0) / step) + 1));
      lines.forEach((ln, li) => {
        let x = rx + 44;
        ln.split(' ').forEach((wd) => {
          const ww = K.measure(wd + ' ', fo);
          if (n < shown) {
            const k = K.io(t, t0 + n * step, 0.25, 'out');
            K.text(wd, x, cardY + 80 + li * 58 - (1 - k) * 6, { ...fo, color: C.ink, alpha: k });
            penX = x + K.measure(wd, fo) + 40; penY = cardY + 80 + li * 58;
          }
          x += ww; n++;
        });
      });
      const done = t0 + total * step;
      if (t >= t0) M.pen(penX, penY, { s: 0.7, alpha: K.clamp(1 - (t - done) / 0.6) });
      K.layer(K.io(t, tOneTok - 0.6, 0.5), () => K.text('one token after another', rx + cw / 2, cardY + cardH + 66, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center' }));
    });
    K.layer(K.io(t, tOwn, 0.6), () => M.shelf('The Machine', 1840, 880));
  }
});
