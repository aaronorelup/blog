// 06 — Seeing, hearing, and making
// The desk slides left (hall -> 'left'), photos / PDFs / recordings / video land on it, the word "multimodal" splits into
// three slots (reads · makes · hands off), the clerk makes one small picture itself (rare), then phones the studio next door
// (dashed hand-off line) where a separate model turns static into a picture. Top-left panel carries one fact at a time:
// Claude / Gemini inputs -> "Claude writes text only" -> ChatGPT stitches models -> Sora app closed + the paperclip.
SCENE('06', (t, S) => {
  const C = K.C, g = K.ctx();
  K.bg();

  // ---- cues (local seconds)
  const cReads = S.cue('reads', 11.2), cMakes = S.cue('makes', 23.7), cHand = S.cue('handoff', 28.6);
  const cText = S.cue('claude-text', 39.4), cStitch = S.cue('stitched', 48.1), cSora = S.cue('sora', 55.5);
  const wPhotos = S.find(/^photos/, 0, 3.3), wPdf = S.find(/^P$/, 0, 3.8), wRec = S.find(/^recordings/, 0, 4.6), wVid = S.find(/^video/, 0, 5.2);
  const wMulti = S.find(/^multimodal/, 0, 7.3), wHides = S.find(/^hides/, 0, 9.1);
  const wClaude1 = S.find(/^Claude/, 0, 14.8), wGemini = S.find(/^Gemini/, 0, 19.0);
  const wMakesV = S.find(/^makes/, 0, 25.3), wRarer = S.find(/^rarer/, 0, 27.8);
  const wHands = S.find(/^hands/, 0, 30.6), wThrough = S.find(/^through/, 0, 33.6), wPhones = S.find(/^phones/, 0, 37.4);
  const wChart = S.find(/^chart/, 0, 42.0), wDraws = S.find(/^draws/, 0, 44.2), wCalls = S.find(/^calls/, 0, 45.4);
  const wStitches = S.find(/^stitches/, 0, 51.3), wSpring = S.find(/^spring/, 0, 58.5);
  const wPaper = S.find(/^paperclip/, 0, 60.9), wRefuses = S.find(/^refuses/, 0, 63.2), wOwn = S.find(/^Its$/, 0, 64.8);

  // ---- the desk: 05's hall desk slides left to make room for the studio
  const kDesk = K.io(t, 0.2, M.motion.grow);
  const D = M.lerpDesk(M.at(M.layout.hall), M.at(M.layout.left), kDesk);
  const studioA = K.io(t, 0.6, 0.8);
  const openK = K.io(t, wHands + 1.0, 0.8);
  const showK = K.io(t, wThrough - 0.6, 4.2, 'sine');

  // files landing = desk filling up (ruler)
  const lands = [wPhotos, wPdf, wRec, wVid];
  const landed = lands.reduce((s, a) => s + K.io(t, a, M.motion.land, 'out'), 0);
  const writeK = K.io(t, cText + 0.9, 3.0, 'lin');
  const W = M.stage(t, {
    desk: D,
    clerk: { glow: Math.max(K.env(t, cReads + 0.8, cReads + 3.6, 0.5), K.env(t, wMakesV - 0.4, wRarer, 0.4) * 0.8, K.env(t, cText + 0.6, wDraws + 0.4, 0.5) * 0.8) },
    ruler: { fill: 0.06 + 0.06 * landed + 0.06 * writeK },
  });
  const cl = W.clerk;

  // ---- the studio next door (closed until the hand-off)
  const st = M.studio(t, M.layout.studio.x, M.layout.studio.y, { open: openK, show: showK, alpha: studioA * (0.55 + 0.45 * Math.max(openK, K.env(t, cHand, Infinity, 0.6))), seed: 3 });

  // ---- what lies on the desk
  // the one text page (05's summary shrinking to a 2021-style text page)
  const pk = K.io(t, 0.2, M.motion.grow);
  // once the hand-off beat starts, the inputs step back so the eye follows the phone line
  const inDim = 1 - 0.6 * K.io(t, cHand, 0.6);
  const pTo = { x: 290, y: 540 };
  const pFrom = { x: 960, y: 590 };
  M.paper(K.lerp(pFrom.x, pTo.x, pk), K.lerp(pFrom.y, pTo.y, pk), {
    w: K.lerp(240, 120, pk), h: K.lerp(300, 86, pk), lines: 3, kind: 'text', alpha: inDim, glow: 0.5 * K.env(t, 0.9, 2.6, 0.5),
  });
  if (pk > 0.98) K.text('text', 290, 612, { ...M.type.label, color: C.soft, align: 'center', alpha: K.io(t, 1.2, 0.5) * (1 - K.io(t, wPhotos, 0.4)) });

  // four media files land one after another (from above the desk)
  const files = [
    { ext: 'png', name: 'photo.png', x: 460, at: wPhotos },
    { ext: 'pdf', name: 'notes.pdf', x: 630, at: wPdf },
    { ext: 'mp3', name: 'call.mp3', x: 800, at: wRec },
    { ext: 'mp4', name: 'clip.mp4', x: 970, at: wVid },
  ];
  files.forEach((f, i) => {
    if (t < f.at) return;
    const L = M.land(t, f.at, f.x, 540, f.x, 300);
    const scan = K.env(t, cReads + 1.0 + i * 0.35, cReads + 2.2 + i * 0.35, 0.35);
    // while the Claude row is on screen, audio and video dim with a small x: Claude does not read them; Gemini relights all
    const av = f.ext === 'mp3' || f.ext === 'mp4';
    const dimK = av ? K.io(t, wClaude1 - 0.1, 0.5) * (1 - K.io(t, wGemini - 0.1, 0.5)) : 0;
    M.file(L.x, L.y, 110, { ext: f.ext, name: f.name, alpha: L.a * (1 - 0.7 * dimK) * inDim, glow: scan * (1 - dimK) });
    if (dimK > 0.01) {
      const bx = L.x + 44, by = L.y - 58;
      K.layer(dimK, () => {
        g.save(); g.beginPath(); g.arc(bx, by, 19, 0, Math.PI * 2); g.fillStyle = C.page; g.fill();
        g.lineWidth = 2; g.strokeStyle = K.rgba(C.accent, 0.85); g.stroke(); g.restore();
        K.icon('cross', bx, by, 20, { color: C.accent, w: 3 });
      });
    }
  });

  // the picture the clerk makes itself (piece by piece, from its pen) — rare
  const pic = { x: 1150, y: 492, s: 116 };
  const picBuild = K.io(t, wMakesV - 0.2, 2.0, 'lin');
  const picDim = (1 - 0.6 * K.io(t, cText, 0.6)) * (1 - K.io(t, cStitch - 0.3, 0.5));
  if (t >= wMakesV - 0.4) {
    K.layer(K.io(t, wMakesV - 0.4, 0.4) * picDim, () => {
      M.well(t, pic.x, pic.y, pic.s, picBuild, { order: 'tiles', cells: 12, still: true });
      if (picBuild > 0 && picBuild < 1) {
        const n = 12, idx = Math.min(n * n - 1, Math.floor(picBuild * n * n)), r = Math.floor(idx / n), c = idx % n, cs = pic.s / n;
        M.pen(pic.x - pic.s / 2 + (c + 1) * cs, pic.y - pic.s / 2 + (r + 1) * cs, { s: 0.7 });
      }
    });
    const rk = K.io(t, wRarer - 0.2, 0.5) * (1 - K.io(t, cHand + 0.4, 0.5));
    if (rk > 0) K.pill('rare', pic.x + pic.s / 2 + 62, pic.y, { size: 26, color: C.soft, stroke: K.rgba(C.quiet, 0.8), alpha: rk });
    // who actually does this: a small dated example chip under the picture
    // keyed to "Two:" and gone before "Three," so it never reads as an example of the hand-off
    const ek = K.io(t, cMakes + 0.3, 0.5) * (1 - K.io(t, cHand - 0.45, 0.4));
    if (ek > 0) K.layer(ek, () => {
      const ex = 1252, ey = 606, ew = 380, eh = 110;
      K.card(ex - ew / 2, ey, ew, eh, { r: 16, fill: K.rgba(C.tile, 0.94), stroke: K.rgba(C.head, 0.35), shadow: false });
      K.text('e.g. Gemini Omni', ex, ey + 42, { ...M.type.label, color: C.head, align: 'center' });
      K.text('one model: video + sound', ex, ey + 82, { ...M.type.label, color: C.strong, align: 'center' });
    });
  }

  // ---- the hand-off: a phone line from the clerk to the studio door
  const lineK = K.io(t, wHands - 0.2, 1.1, 'out');
  const p1 = { x: cl.x + 66, y: cl.y - 6 }, p2 = { x: st.door.x - 4, y: st.door.y };
  const callBright = K.env(t, wCalls - 0.2, wCalls + 3.0, 0.4);
  M.phone(t, p1.x, p1.y, p2.x, p2.y, { k: lineK, pulse: true, bend: -110, w: 3 + callBright, alpha: 0.75 + 0.2 * callBright });
  // label under the studio: what is behind that door
  const sLab = K.io(t, wThrough - 0.1, 0.6) * (1 - 0.45 * K.io(t, wOwn, 0.6));
  if (sLab > 0) K.layer(sLab, () => {
    K.text('separate model', 1705, 796, { ...M.type.label, color: C.strong, align: 'center' });
    K.text('API or tool', 1705, 830, { ...M.type.label, color: C.accent, align: 'center' });
  });
  // "connector": Claude calls another model through a connector, on the same line
  const conK = K.io(t, wCalls - 0.1, 0.5, 'back') * (1 - K.io(t, cStitch, 0.6));
  if (conK > 0) {
    const cx = 1352, cy = 394, to = { font: 'ui', weight: 600, size: 26 }, w = K.measure('connector', to) + 26 * 1.6 + 34;
    K.layer(K.clamp(conK), () => {
      K.card(cx - w / 2, cy - 25, w, 50, { r: 25, fill: C.page, stroke: K.rgba(C.accent, 0.8), shadow: false, glow: 0.3 });
      K.icon('puzzle', cx - w / 2 + 30, cy, 26, { color: C.accent, w: 2 });
      K.text('connector', cx + 17, cy + 9, { ...to, color: C.accent, align: 'center' });
    });
  }

  // ---- Claude writes code, the code draws the chart
  const code = { x: 1064, y: 606, w: 360, h: 180 };
  const codeA = K.io(t, cText + 0.5, 0.5) * (1 - K.io(t, cStitch - 0.3, 0.5));
  const toChart = K.io(t, wDraws, 0.7);
  if (codeA > 0) K.layer(codeA, () => {
    K.layer(1 - toChart, () => {
      K.card(code.x, code.y, code.w, code.h, { r: 14, fill: C.page, stroke: K.rgba(C.head, 0.5), shadow: true });
      K.editor({ x: code.x - 6, y: code.y - 6, w: code.w, h: code.h }, t, ['bars = [3, 5, 4, 7]', 'plt.bar(x, bars)', 'plt.savefig(c)'], { syntax: 'py', size: 26, typeAt: cText + 0.9, cps: 16, gutter: false });
    });
    if (toChart > 0) K.layer(toChart, () => {
      M.paper(code.x + code.w / 2, code.y + code.h / 2, { w: code.w, h: code.h, lines: 0 });
      const vals = [3, 5, 4, 7], bx = code.x + 70, by = code.y + code.h - 30;
      K.line(code.x + 46, by, code.x + code.w - 40, by, { color: M.palette.inkLine, w: 3 });
      K.line(code.x + 46, by, code.x + 46, code.y + 26, { color: M.palette.inkLine, w: 3 });
      vals.forEach((v, i) => {
        const hk = K.io(t, wDraws + 0.3 + i * 0.12, 0.5, 'out'), bh = v * 17 * hk;
        K.card(bx + i * 72, by - bh, 44, bh, { r: 4, fill: C.head, stroke: false, shadow: false });
      });
    });
  });

  // ---- top right: "multimodal" splits into three slots
  const tK = K.io(t, wMulti - 0.2, 0.6);
  const slotK = (i) => K.io(t, wHides + i * 0.18, 0.5, 'out');
  const active = t < cReads ? -1 : t < cMakes ? 0 : t < cHand ? 1 : 2;
  const slotNames = ['1  reads', '2  makes', '3  hands off'];
  const slotX = [1150, 1385, 1650];
  if (tK > 0) {
    K.title('multimodal', 1400, 192, { size: 56, align: 'center', alpha: tK });
    slotNames.forEach((s, i) => {
      const k = slotK(i); if (k <= 0) return;
      const on = active === i ? 1 : 0;
      const past = i < active ? 0.4 : 0;
      const hot = Math.max(on * K.io(t, [cReads, cMakes, cHand][i], 0.5), past);
      const bright = i === 2 && active === 2 ? 1 : 0.75;
      const x = K.lerp(1400, slotX[i], k);
      K.pill(s, x, 268, { size: 26, alpha: k, color: K.mixColor(C.soft, C.head, hot), stroke: K.rgba(C.head, 0.15 + 0.7 * hot * bright), fill: C.tile, glow: 0.5 * hot * (i === 2 && active === 2 ? 1.4 : 0.8) });
    });
  }

  // ---- top left: one fact at a time
  // reads: two dated cards
  const readsA = K.io(t, wClaude1 - 0.3, 0.5) * (1 - K.io(t, cText - 0.1, 0.5));
  if (readsA > 0) K.layer(readsA, () => {
    M.dated('Oct 2026', 104, 166);
    const row = (y, who, rest, at) => {
      const k = K.io(t, at, 0.5, 'out');
      if (k <= 0) return;
      K.layer(k, () => {
        K.card(96 + (1 - k) * -20, y, 632, 60, { r: 16, fill: K.rgba(C.tile, 0.92), stroke: K.rgba(C.head, 0.35), shadow: false });
        K.spans([{ s: who, color: C.head }, { s: rest, color: C.strong }], 120 + (1 - k) * -20, y + 40, { size: 26, font: 'ui', weight: 600 });
      });
    };
    row(190, 'Claude: ', 'text · images · PDF in', wClaude1 - 0.3);
    row(264, 'Gemini: ', 'text · images · audio · video in', wGemini - 0.3);
  });
  // claude-text: the caption
  const capA = K.io(t, cText + 0.1, 0.5) * (1 - K.io(t, cStitch - 0.3, 0.4));
  if (capA > 0) K.layer(capA, () => {
    K.text('Claude writes text only', 104, 220, { font: 'head', weight: 700, size: 40, color: C.head });
    const s1 = K.io(t, wChart, 0.5), s2 = K.io(t, wCalls, 0.5);
    K.text('a chart: code that draws it', 104, 272, { ...M.type.label, color: C.strong, alpha: s1 });
    K.text('a picture: another model', 104, 312, { ...M.type.label, color: C.accent, alpha: s2 });
  });
  // stitched: "ChatGPT" feels like one model, but it is several stitched together
  const chA = K.io(t, cStitch, 0.5) * (1 - K.io(t, cSora - 0.2, 0.5));
  if (chA > 0) K.layer(chA, () => {
    K.card(96, 140, 632, 190, { r: 18, fill: K.rgba(C.tile, 0.94), stroke: C.line2 });
    K.text('ChatGPT', 124, 184, { font: 'ui', weight: 700, size: 28, color: C.strong });
    K.text('feels like one model', 700, 184, { ...M.type.label, color: C.soft, align: 'right', alpha: 1 - K.io(t, wStitches, 0.4) });
    K.text('three models, stitched', 700, 184, { ...M.type.label, color: C.accent, align: 'right', alpha: K.io(t, wStitches + 0.6, 0.5) });
    const sp = K.io(t, wStitches - 0.1, 0.8);
    const names = ['chat', 'image', 'voice'];
    const xs = [216, 412, 608], tw = 150, ty = 214, th = 88;
    // stitches between the tiles
    if (sp > 0.6) [0, 1].forEach((i) => K.line(xs[i] + tw / 2, ty + th / 2, xs[i + 1] - tw / 2, ty + th / 2, { color: C.accent, w: 3, dash: [6, 6], k: K.io(t, wStitches + 0.5 + i * 0.15, 0.4) }));
    if (sp <= 0) {
      K.card(124, ty, 576, th, { r: 14, fill: K.rgba(C.head, 0.08), stroke: K.rgba(C.head, 0.5), shadow: false });
      K.icon('sparkle', 412, ty + th / 2, 46, { color: C.head });
    } else {
      names.forEach((n, i) => {
        const x = K.lerp(412, xs[i], sp), w = K.lerp(576, tw, sp);
        K.card(x - w / 2, ty, w, th, { r: 14, fill: K.rgba(C.head, 0.08), stroke: K.rgba(i === 0 ? C.head : C.accent, 0.6), shadow: false });
        K.text(n, x, ty + th / 2 + 9, { ...M.type.label, color: i === 0 ? C.head : C.strong, align: 'center', alpha: K.seg(sp, 0.5, 1) });
      });
      if (sp < 0.5) K.icon('sparkle', 412, ty + th / 2, 46, { color: C.head, alpha: 1 - sp * 2 });
    }
  });
  // sora: the app closed this spring; then the paperclip that accepts some files and refuses others
  const soA = K.io(t, cSora + 0.1, 0.5) * (1 - 0.6 * K.io(t, wSpring + 0.6, 0.8));
  if (soA > 0) K.layer(soA, () => {
    K.card(96, 140, 632, 84, { r: 18, fill: K.rgba(C.tile, 0.94), stroke: C.line2, shadow: false });
    K.icon('sparkle', 136, 182, 30, { color: C.soft });
    K.text('Sora app', 164, 192, { font: 'ui', weight: 700, size: 30, color: C.strong });
    M.flag('closed · spring 2026', 560, 182);
  });
  const barA = K.io(t, wPaper - 0.4, 0.5);
  if (barA > 0) K.layer(barA, () => {
    const bx = 96, by = 246, bw = 632, bh = 76;
    K.card(bx, by, bw, bh, { r: bh / 2, fill: C.page, stroke: K.rgba(C.head, 0.45), shadow: true });
    // paperclip
    g.save(); g.strokeStyle = C.head; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
    const px = bx + 44, py = by + bh / 2;
    g.beginPath();
    g.moveTo(px - 4, py + 10); g.lineTo(px - 4, py - 10); g.arc(px + 2, py - 10, 6, Math.PI, 0); g.lineTo(px + 8, py + 12);
    g.arc(px, py + 12, 8, 0, Math.PI); g.lineTo(px - 8, py - 14); g.arc(px + 2, py - 14, 10, Math.PI, 0); g.lineTo(px + 12, py + 4);
    g.stroke(); g.restore();
    const chips = [['.png', true], ['.pdf', true], ['.mp4', false]];
    let x = bx + 140;
    chips.forEach(([s, ok], i) => {
      const at = wPaper + 0.2 + i * 0.45, k = K.io(t, at, 0.4, 'out');
      if (k <= 0) return;
      K.layer(k, () => {
        const w = M.chip(s, x + 52, py, { size: 26, color: ok ? C.strong : C.soft, stroke: K.rgba(ok ? C.head : C.accent, 0.6) });
        const mk = ok ? K.io(t, at + 0.4, 0.3) : K.io(t, wRefuses, 0.4, 'back');
        if (mk > 0) K.icon(ok ? 'check' : 'cross', x + 52 + w / 2 + 26, py, 30, { color: ok ? C.head : C.accent, w: 4, alpha: K.clamp(mk) });
      });
      x += 170;
    });
  });

  // ---- shelf pointer
  M.shelf('The Network', M.layout.shelf.x, M.layout.shelf.y, { k: K.io(t, wOwn, 0.6) });
});
