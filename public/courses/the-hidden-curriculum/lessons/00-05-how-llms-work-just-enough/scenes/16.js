/* 16 — More rooms: design and voice
   Two rooms side by side. Left: the design studio. A prompt card becomes a layout plus a code strip (drawn, not
   painted: a crossed-out static thumbnail says "no image model"); research preview (Apr) turns beta in chats (Sep),
   next to Docs and Slides. Right: the voice booth. Row 1, the pipeline (speech → text → model → text → speech,
   taking turns); row 2, one model that hears and speaks sound (waves in and out at once, you can cut in; GPT-Live,
   Gemini Live). Last, a Claude card: bigger models + connected apps, takes turns, build not disclosed. */
SCENE('16', (t, S) => {
  K.bg();
  const C = K.C, P = M.palette;
  const g = K.ctx();
  const W = (re, n, fb) => S.find(re, n, fb);

  // ---- cue / word times (local seconds)
  const cDesign = S.cue('design', 0), cVoice = S.cue('voice', 17.76), cPipe = S.cue('pipeline', 20.12);
  const cNative = S.cue('native', 26.68), cClaude = S.cue('claude-voice', 40.09);
  const wApril = W(/^april/i, 0, 1.6), wResearch = W(/^research/i, 0, 2.4), wDescribe = W(/^describe/i, 0, 4.1);
  const wLayout = W(/^layout/i, 0, 7.2), wCode = W(/^code/i, 0, 8.0), wNot = W(/^not$/i, 0, 8.7);
  const wSept = W(/^september/i, 0, 11.1), wChats = W(/^chats/i, 0, 12.9), wBeta = W(/^beta/i, 0, 14.9);
  const wDocs = W(/^docs/i, 0, 16.2), wSlides = W(/^slides/i, 0, 16.8);
  const wSp1 = W(/^speech$/i, 0, cPipe + 1.1), wModel = W(/^model,?$/i, 0, cPipe + 3.1), wText2 = W(/^text$/i, 1, cPipe + 4.0);
  const wTurns = W(/^turns/i, 0, cPipe + 5.6);
  const wHears = W(/^hears/i, 0, cNative + 0.8), wSpeaks = W(/^speaks/i, 0, cNative + 1.4), wTone = W(/^tone/i, 0, cNative + 3.3);
  const wListens = W(/^listens/i, 0, cNative + 4.4), wCut = W(/^cut$/i, 0, cNative + 6.6);
  const wGPT = W(/^G$/, 0, cNative + 9.0), wGem = W(/^gemini/i, 0, cNative + 11.0);
  const wBigger = W(/^bigger/i, 0, cClaude + 2.3), wConn = W(/^connected/i, 0, cClaude + 4.0);
  const wTurns2 = W(/^turns/i, 1, cClaude + 6.0), wHasnt = W(/^hasn't/i, 0, cClaude + 7.5);
  const wBuilders = W(/^builders/i, 0, cClaude + 9.6), wNet = W(/^voice,?$/i, 2, cClaude + 12.1);

  // ---- helpers
  const sine = (x0, x1, y, amp, ph, col, a, o = {}) => {
    if (a <= 0 || x1 <= x0) return;
    g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineWidth = o.w || 3; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    const n = Math.max(8, Math.round((x1 - x0) / 4)), span = o.span || (x1 - x0);
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = x0 + (x1 - x0) * u, ux = (x - x0) / span;
      const env = Math.sin(Math.PI * K.clamp(ux)) * (o.mod ? 0.6 + 0.4 * Math.sin(ux * 7 + ph * 0.7) : 1);
      const y1 = y + amp * env * Math.sin(ux * (o.freq || 18) + ph);
      i ? g.lineTo(x, y1) : g.moveTo(x, y1);
    }
    g.stroke(); g.restore();
  };
  const room = (x, y, w, h, lit, accent) => {
    K.card(x, y, w, h, { r: 26, fill: K.rgba(C.tile, 0.9), stroke: K.rgba(accent, 0.18 + 0.5 * lit), lw: 2, glow: 0.18 * lit });
    if (lit > 0) K.glow(x + w / 2, y + 120, w * 0.5, C.head, 0.07 * lit);
  };

  // ---- rooms (static outlines from the first frame; each lights when it is named)
  const DX = 120, DY = 200, DW = 780, DH = 640;            // design studio
  const VX = 1020, VY = 200, VW = 780, VH = 640;           // voice booth
  const dLit = K.io(t, cDesign - 0.2, 0.8);
  const vLit = K.io(t, cVoice - 0.1, 0.7);
  const dFocus = 1 - 0.5 * K.io(t, cVoice, 0.7) + 0.5 * K.io(t, wBuilders - 0.2, 0.7);   // design dims while voice talks
  room(DX, DY, DW, DH, dLit * dFocus, C.head);
  room(VX, VY, VW, VH, vLit, C.head);

  // ================================================================ DESIGN STUDIO
  K.layer(0.35 + 0.65 * dFocus, () => {
    // header
    K.layer(0.4 + 0.6 * dLit, () => K.text('Claude Design', 160, 268, { font: 'head', weight: 700, size: 38, color: C.head }));
    const betaK = K.io(t, wBeta - 0.1, 0.6);
    K.layer(K.io(t, wResearch - 0.1, 0.5) * (1 - betaK), () => M.flag('RESEARCH PREVIEW', 712, 256));
    K.layer(betaK, () => M.flag('BETA', 812, 256));
    const chatK = K.io(t, wChats - 0.15, 0.5, 'out');
    K.layer(chatK, () => {
      K.pill('in chats', 650, 256 + (1 - chatK) * 8, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5) });
    });
    // dated tag, top-left corner: April, then September
    // "Apr" stays put; the old "2026" fades out first, then "→ Sep 2026" slides in (never sharing pixels)
    const dto = { font: 'mono', size: 22, weight: 600 };
    const tailX = 120 + 18 + K.measure('Apr ', dto);
    const oldOut = K.io(t, wSept - 0.15, 0.3);
    const newIn = K.io(t, wSept + 0.2, 0.45, 'out');
    K.layer(K.io(t, wApril - 0.1, 0.5), () => {
      M.dated('Apr', 120, 172);
      if (oldOut < 1) K.layer(1 - oldOut, () => K.text('2026', tailX, 172, { ...dto, color: C.gold }));
      if (newIn > 0) K.layer(newIn, () => K.text('→ Sep 2026', tailX + (1 - newIn) * 18, 172, { ...dto, color: C.gold }));
    });

    // the prompt card
    const pk = K.io(t, wDescribe - 0.25, 0.5, 'out');
    K.layer(pk, () => {
      const y = 300 + (1 - pk) * 12;
      K.card(160, y, 700, 72, { r: 16, fill: K.rgba(C.page, 0.95), stroke: K.rgba(C.head, 0.35 + 0.4 * K.env(t, wDescribe, wLayout, 0.4)), shadow: true });
      K.icon('chat', 200, y + 36, 36, { color: C.head });
      const s = 'a poster for a tea house';
      const typed = K.typed(s, t, wDescribe + 0.1, 22);
      K.text(typed, 236, y + 46, { font: 'read', size: 30, color: C.strong, italic: true });
      if (typed.length < s.length && t > wDescribe) {
        const tw = K.measure(typed, { font: 'read', size: 30, italic: true });
        K.line(240 + tw, y + 22, 240 + tw, y + 52, { color: C.strong, w: 2 });
      }
    });
    // arrows down into the draft
    const ak = K.io(t, wLayout - 0.35, 0.5);
    K.arrow(315, 382, 315, 412, { k: ak, color: C.head, w: 3 });
    K.arrow(680, 382, 680, 412, { k: K.io(t, wCode - 0.35, 0.5), color: C.head, w: 3 });

    // the layout: a poster built from blocks (vector, not pixels)
    const PX = 160, PY = 420, PW = 310, PH = 290;
    const blk = (i) => K.io(t, wLayout - 0.1 + i * 0.22, 0.45, 'out');
    K.layer(blk(0), () => K.card(PX, PY, PW, PH, { r: 14, fill: P.night ? P.night.skyTop || '#1F2340' : '#1F2340', stroke: K.rgba(C.head, 0.5), lw: 2, shadow: true }));
    K.layer(blk(1), () => {                                             // moon
      g.save(); g.fillStyle = '#F3E6C4'; g.beginPath(); g.arc(PX + 238, PY + 62 + (1 - blk(1)) * 10, 26, 0, Math.PI * 2); g.fill(); g.restore();
    });
    K.layer(blk(2), () => {                                             // tea house: roof + wall + lit window
      const dy = (1 - blk(2)) * 12, bx = PX + 50, by = PY + 84 + dy;
      g.save();
      g.fillStyle = P.woodDark; g.beginPath();
      g.moveTo(bx - 8, by + 52); g.quadraticCurveTo(bx + 20, by + 46, bx + 46, by); g.lineTo(bx + 132, by);
      g.quadraticCurveTo(bx + 158, by + 46, bx + 186, by + 52); g.closePath(); g.fill();
      g.fillStyle = '#4A3A30'; g.fillRect(bx + 18, by + 52, 150, 70);
      g.fillStyle = C.head; g.fillRect(bx + 32, by + 64, 52, 40);
      g.fillStyle = P.beam; g.fillRect(bx + 56, by + 64, 4, 40); g.fillRect(bx + 112, by + 72, 30, 50);
      g.restore();
    });
    K.layer(blk(3), () => {                                             // headline + body lines
      const y = PY + 246 + (1 - blk(3)) * 8;
      K.card(PX + 24, y - 6, 170, 16, { r: 8, fill: K.rgba(C.head, 0.85), stroke: false, shadow: false });
      K.card(PX + 24, y + 22, 120, 10, { r: 5, fill: K.rgba(C.body, 0.5), stroke: false, shadow: false });
    });
    K.layer(blk(4), () => K.card(PX + 214, PY + 232 + (1 - blk(4)) * 8, 72, 34, { r: 17, fill: K.rgba(C.accent, 0.85), stroke: false, shadow: false }));

    // the code strip
    const CX = 500, CY = 420, CW = 360, CH = 290;
    const ck = K.io(t, wCode - 0.15, 0.45, 'out');
    K.layer(ck, () => {
      K.card(CX, CY, CW, CH, { r: 14, fill: K.rgba(C.page, 0.95), stroke: K.rgba(C.head, 0.5), lw: 2, shadow: true });
      const lines = [['<h1>', 'Tea House', '</h1>'], ['<div ', 'class="moon"', '>'], ['.roof ', '{ curve }', ''], ['<p>', 'Open nightly', '</p>']];
      lines.forEach((ln, i) => {
        const a = K.io(t, wCode + 0.05 + i * 0.3, 0.3);
        K.layer(a, () => K.spans([{ s: ln[0], color: C.soft }, { s: ln[1], color: C.head }, { s: ln[2], color: C.soft }], CX + 22, CY + 62 + i * 62, { font: 'mono', weight: 600, size: 26 }));
      });
    });

    // "not with an image model": a crossed-out static thumbnail
    const nk = K.io(t, wNot - 0.1, 0.5);
    K.layer(nk, () => {
      M.well(t, 196, 766, 52, 0.1, { cells: 13, still: true, seed: 11 });
      const xk = K.io(t, wNot + 0.3, 0.4);
      K.line(170, 740, 170 + 52 * xk, 740 + 52 * xk, { color: C.accent, w: 4 });
      K.line(222, 740, 222 - 52 * xk, 740 + 52 * xk, { color: C.accent, w: 4 });
      K.text('no image model', 240, 776, { font: 'ui', weight: 600, size: 28, color: C.strong });
    });
    // next to Docs and Slides
    const docK = K.io(t, wDocs - 0.15, 0.45, 'out'), slK = K.io(t, wSlides - 0.15, 0.45, 'out');
    K.layer(docK, () => K.pill('Docs', 578, 766 + (1 - docK) * 8, { size: 26, color: C.strong }));
    K.layer(slK, () => K.pill('Slides', 700, 766 + (1 - slK) * 8, { size: 26, color: C.strong }));
    K.layer(K.io(t, wSlides + 0.2, 0.5), () => M.flag('BETA', 815, 766));
  });

  // ================================================================ VOICE BOOTH
  const bA = 0.35 + 0.65 * vLit;
  K.layer(bA, () => {
    K.text('Voice', VX + 40, 268, { font: 'head', weight: 700, size: 38, color: C.head });
    K.icon('phone', VX + 174, 256, 40, { color: vLit > 0.5 ? C.head : C.soft });
  });
  // idle sound wave in the header
  sine(1240, 1760, 254, 16 * vLit, t * 4, C.head, vLit * 0.85, { freq: 22, mod: true });

  // ---- row 1: the pipeline
  const pE = K.io(t, cPipe - 0.1, 0.5);
  const claudeK = K.io(t, cClaude - 0.1, 0.6);
  const nativeDim = 1 - 0.3 * claudeK;
  K.layer(pE * nativeDim, () => K.eyebrow('1 · pipeline', VX + 40, 306, { size: 22, color: C.head }));
  const boxes = [
    { x: 1060, w: 210, s: 'speech → text', at: wSp1, gold: 0 },
    { x: 1310, w: 150, s: 'model', at: wModel, gold: 1 },
    { x: 1500, w: 210, s: 'text → speech', at: wText2, gold: 0 },
  ];
  const BY = 318, BH = 60;
  boxes.forEach((b, i) => {
    const k = K.io(t, b.at - 0.2, 0.45, 'out');
    if (i > 0) K.layer(nativeDim, () => K.arrow(boxes[i - 1].x + boxes[i - 1].w + 4, BY + BH / 2, b.x - 4, BY + BH / 2, { k: K.io(t, b.at - 0.45, 0.35), color: C.soft, w: 3 }));
    K.layer(k * nativeDim, () => {
      const glow = b.gold ? 0.3 * K.env(t, b.at, b.at + 1.2, 0.4) : 0;
      K.card(b.x, BY + (1 - k) * 10, b.w, BH, { r: 16, fill: K.rgba(C.page, 0.95), stroke: b.gold ? C.head : K.rgba(C.line2, 1), lw: 2, glow, shadow: false });
      K.text(b.s, b.x + b.w / 2, BY + BH / 2 + 9 + (1 - k) * 10, { font: 'ui', weight: 600, size: 26, color: b.gold ? C.head : C.strong, align: 'center' });
    });
  });
  // turn-taking track: you, then it, then you (never at once)
  const ttK = K.io(t, wTurns - 0.2, 0.5);
  K.layer(ttK * nativeDim, () => K.text('takes turns', 1060, 426, { font: 'ui', weight: 600, size: 28, color: C.strong }));
  K.layer(ttK * nativeDim, () => {
    const tx0 = 1260, tx1 = 1740, ty = 418;
    K.icon('person', tx0 + 14, ty, 26, { color: C.soft });
    const segs = [[0.0, 0.26, 0], [0.36, 0.66, 1], [0.76, 1.0, 0]];
    const run = K.seg(t, wTurns - 0.1, wTurns + 1.2);
    segs.forEach(([a, b, ai]) => {
      const e = Math.min(b, Math.max(a, run));
      if (e <= a) return;
      const x0 = tx0 + 44 + (tx1 - tx0 - 44) * a, x1 = tx0 + 44 + (tx1 - tx0 - 44) * e;
      K.card(x0, ty - 7, x1 - x0, 14, { r: 7, fill: ai ? C.head : K.rgba(C.soft, 0.7), stroke: false, shadow: false });
    });
  });

  // ---- row 2: one model that hears and speaks sound
  K.layer(K.io(t, cNative - 0.1, 0.5) * nativeDim, () => K.eyebrow('2 · speech ↔ speech', VX + 40, 474, { size: 22, color: C.head }));
  const nbK = K.io(t, cNative - 0.05, 0.5, 'out');
  const NY = 488, NH = 68;
  K.layer(nbK * nativeDim, () => {
    K.card(1060, NY + (1 - nbK) * 10, 700, NH, { r: 18, fill: K.rgba(C.page, 0.95), stroke: C.head, lw: 2, glow: 0.12, shadow: false });
    K.text('one model', 1410, NY + NH / 2 + 10, { font: 'ui', weight: 600, size: 28, color: C.head, align: 'center' });
  });
  const inK = K.io(t, wHears - 0.15, 0.6), outK = K.io(t, wSpeaks - 0.15, 0.6);
  const toneK = K.io(t, wTone - 0.2, 0.6);
  const ampIn = 14 + 8 * toneK * (0.5 + 0.5 * Math.sin(t * 2.3));
  sine(1084, 1084 + 230 * inK, NY + NH / 2, ampIn * nbK, t * 5, C.soft, inK * nativeDim, { span: 230, freq: 20, mod: toneK > 0 });
  sine(1506, 1506 + 230 * outK, NY + NH / 2, 14 * nbK, -t * 5, C.head, outK * nativeDim, { span: 230, freq: 20 });
  K.layer(K.io(t, wTone - 0.2, 0.4) * (1 - K.io(t, wCut - 0.3, 0.4)) * nativeDim, () =>
    K.text('hears your tone', 1060, 660, { font: 'ui', weight: 600, size: 28, color: C.strong }));
  // overlapping track: you and it at the same time; you cut in
  const ovK = K.io(t, wListens - 0.2, 0.5);
  K.layer(ovK * nativeDim, () => {
    const tx0 = 1060, tx1 = 1740, y1 = 584, y2 = 608;
    K.icon('person', tx0 + 14, y1, 24, { color: C.soft });
    K.icon('sparkle', tx0 + 14, y2, 24, { color: C.head });
    const L = tx0 + 44, R = tx1, run = K.seg(t, wListens - 0.1, wListens + 1.6);
    const aiEnd = L + (R - L) * Math.min(run, 0.62), youA = L + (R - L) * 0.42;
    K.card(L, y2 - 6, Math.max(0, aiEnd - L), 12, { r: 6, fill: C.head, stroke: false, shadow: false });
    if (run > 0.0) K.card(L, y1 - 6, (R - L) * Math.min(run, 0.18), 12, { r: 6, fill: K.rgba(C.soft, 0.7), stroke: false, shadow: false });
    const cutK = K.io(t, wCut - 0.2, 0.6);
    if (cutK > 0) {
      K.card(youA, y1 - 6, (R - L) * 0.5 * cutK, 12, { r: 6, fill: K.rgba(C.soft, 0.9), stroke: false, shadow: false });
      K.line(youA, y1 - 18, youA, y2 + 16, { color: C.accent, w: 2, dash: [5, 5], alpha: cutK });
    }
  });
  const cutTxtK = K.io(t, wCut - 0.15, 0.5);
  K.layer(cutTxtK * nativeDim, () => K.text('you can cut in', 1060, 660, { font: 'ui', weight: 600, size: 28, color: C.strong }));
  const gk = K.io(t, wGPT - 0.15, 0.5, 'out'), mk = K.io(t, wGem - 0.15, 0.5, 'out');
  K.layer(gk * nativeDim, () => K.pill('GPT-Live', 1400, 652 + (1 - gk) * 8, { size: 26, color: C.strong }));
  K.layer(mk * nativeDim, () => K.pill('Gemini Live', 1580, 652 + (1 - mk) * 8, { size: 26, color: C.strong }));

  // ---- row 3: Claude's voice mode, its own row (not inside either group: the build is not disclosed)
  const ccK = K.io(t, cClaude - 0.1, 0.6, 'out');
  K.layer(ccK, () => {
    const x0 = 1060, y0 = 734 + (1 - ccK) * 8, w = 700, h = 86;
    K.eyebrow('3 · Claude voice mode', VX + 40, y0 - 16, { size: 22, color: C.head });
    K.card(x0, y0, w, h, { r: 20, fill: K.rgba(C.tile, 1), stroke: K.rgba(C.head, 0.75), lw: 2, glow: 0.15, shadow: false });
    // a "?" badge: how it is built is unknown
    g.save(); g.strokeStyle = K.rgba(C.accent, 0.9); g.lineWidth = 2.5; g.beginPath(); g.arc(x0 + 44, y0 + h / 2, 26, 0, Math.PI * 2); g.stroke(); g.restore();
    K.icon('question', x0 + 44, y0 + h / 2, 30, { color: C.accent });
    const f = { font: 'ui', weight: 600, size: 26 };
    const bk = K.io(t, wBigger - 0.15, 0.5), ak = K.io(t, wConn - 0.15, 0.5);
    K.layer(bk, () => K.text('bigger models', x0 + 90, y0 + 36, { ...f, color: C.strong }));
    K.layer(ak, () => K.text('+ connected apps', x0 + 90 + K.measure('bigger models ', f), y0 + 36, { ...f, color: C.strong }));
    const tk = K.io(t, wTurns2 - 0.15, 0.5), qK = K.io(t, wHasnt - 0.2, 0.4);
    K.layer(tk, () => K.text('takes turns', x0 + 90, y0 + 72, { ...f, color: C.strong }));
    K.layer(qK, () => K.text('·  build not disclosed', x0 + 90 + K.measure('takes turns ', f), y0 + 72, { ...f, color: C.accent }));
  });
  K.layer(K.io(t, wBigger - 0.15, 0.5), () => M.dated('Jul 2026', 1800, 172, { align: 'right' }));

  // ---- shelf chips: builders · Shipping (left), voice · The Network (right)
  M.shelf('Shipping', 120, 880, { align: 'left', k: K.io(t, wBuilders - 0.1, 0.6) });
  M.shelf('The Network', 1840, 880, { k: K.io(t, wNet - 0.1, 0.6) });
});
