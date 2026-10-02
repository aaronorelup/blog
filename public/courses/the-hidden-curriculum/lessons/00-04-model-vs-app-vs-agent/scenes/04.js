/* 00.04 scene 04 — The car: the app
   The engine from 03 (on its stand at layout.solo) eases into the hood while the car builds around it.
   Beats: [[car]] product names · [[parts]] five callouts · [[rules]] the system prompt note, read first by the engine ·
   [[many-cars]] pull back: one engine wired into three cars, then back in; the picker swaps Model A for a silver Model B ·
   [[names]] the car eases right (s .72) and an app/model name table takes the left-centre: ChatGPT vs GPT·#, Claude = Claude, Gemini = Gemini; "layers, not numbers".
   Exit: the table fades and the car eases back to std with its gold engine idling (05 starts from the same car);
   the 'layers, not numbers' pill holds. */
SCENE('04', (t, S) => {
  K.bg();
  const C = K.C;
  const STD = M.layout.std, SOLO = M.layout.solo;
  const MANY = M.layout.many;
  const strip = (w) => w.replace(/[^\w'.-]/g, '');
  /** first spoken word matching re at or after local time t0 */
  const after = (re, t0, fb) => {
    for (const w of S.words) { const tt = w[1] - S.start; if (tt >= t0 - 0.02 && re.test(strip(w[0]))) return tt; }
    return fb;
  };

  // ---------------------------------------------------------------- timing
  const cCar = S.cue('car', 1.54), cParts = S.cue('parts', 8.6), cRules = S.cue('rules', 14.06);
  const cMany = S.cue('many-cars', 18.19), cNames = S.cue('names', 26.73);
  const wProd = [after(/^ChatGPT/i, cCar, 3.88), after(/^Claude/i, cCar, 5.18), after(/^Gemini/i, cCar, 6.28), after(/^Copilot/i, cCar, 7.43)];
  const wChat = after(/^chat$/i, cParts, 9.27), wSaved = after(/^saved/i, cParts, 10.11), wFile = after(/^file/i, cParts, 11.03);
  const wSafety = after(/^safety/i, cParts, 12.05), wBill = after(/^bill/i, cParts, 13.21);
  const wHidden = after(/^hidden/i, cRules, 14.27), wReads = after(/^model/i, cRules + 1, 16.64);
  const wLab = after(/^lab/i, cMany, 20.19), wCode = after(/^code/i, cMany, 21.41), wDesk = after(/^company/i, cMany, 22.38);
  const wAndOne = after(/^And/i, wDesk, 23.83), wSwap = after(/^swap/i, cMany, 24.68), wPicker = after(/^picker/i, cMany, 25.97);
  const wChatGPT = after(/^ChatGPT/i, cNames, 28.75), wCarSaid = after(/^car\.?$/i, wChatGPT, 30.09);
  const wGPT = after(/^GPT/i, cNames, 31.0), wEngine = after(/^engine/i, wGPT, 33.61);
  const wClaude = after(/^Claude/i, cNames, 34.68), wGemini = after(/^Gemini/i, cNames, 35.14);
  const wNumbers = after(/^numbers$/i, wEngine, 38.29);   // "The numbers change often": the takeaway lands here and holds ~3 s
  const END = S.out || 41.82;                              // local time this scene hands over to 05 (crossfade starts)

  // ---------------------------------------------------------------- where the car is
  // [[names]]: the car eases right and shrinks so the name table can take the left-centre of the frame; just before
  // the scene ends the table fades and the car eases back to layout.std, where 05 picks it up.
  const NAMES = { x: 1340, y: 600, s: 0.72 };
  const retAt = Math.max(wNumbers + 2.2, END - 1.0);
  const kNm = K.io(t, cNames, M.motion.move), kRet = K.io(t, retAt, 0.8);
  const P = M.lerpPlace(M.lerpPlace(STD, NAMES, kNm), STD, kRet);
  const SL = M.slot(P.x, P.y, P.s);
  const tableA = 1 - K.io(t, retAt - 0.2, 0.6);

  // ---------------------------------------------------------------- the engine's journey (world coords, under the zoom)
  const turn = M.spin(t, [{ at: wReads + 0.3, rate: M.motion.busy }, { at: wReads + 1.3, rate: M.motion.turn }]);
  const kIn = K.io(t, 0.35, M.motion.move);                    // stand -> hood ("Now build a car around it")
  const kLift = K.io(t, cMany + 0.45, M.motion.move);          // hood -> above all three cars
  const kDown = K.io(t, wAndOne, M.motion.move);               // back into the centre car
  const FLOAT = { x: 960, y: 120, s: 1.0 };
  let E = M.lerpPlace(SOLO, SL, kIn);
  E = M.lerpPlace(E, FLOAT, kLift);
  E = M.lerpPlace(E, SL, kDown);

  // camera: pull back on [[many-cars]], come back in on "And one car can swap engines"
  const z = 1 - (1 - MANY.z) * K.io(t, cMany, 0.8) + (1 - MANY.z) * K.io(t, wAndOne, 0.8);
  const toScreen = (x, y) => ({ x: 960 + (x - 960) * z, y: 540 + (y - 540) * z });

  // engine swap (picker): the list opens on "swap", Model B is picked, the list closes; THEN A slides down out of the bay
  // and B (a neutral silver engine, never terracotta: that is the agent's colour) lowers in. At [[names]] the gold engine returns.
  const sClose = wSwap + 0.75;                                   // list closes, label flips to Model B
  const sOut = sClose + 0.2;
  const kAOut = K.io(t, sOut, 0.55), kBIn = K.io(t, sOut + 0.3, 0.6), kBack = K.io(t, cNames + 0.4, 1.2);
  const aAlpha = Math.max(1 - kAOut, kBack), aDy = 90 * kAOut * (1 - kBack);
  const bAlpha = kBIn * (1 - kBack), bDy = -150 * (1 - kBIn);
  const engGlow = 0.55 * K.io(t, wEngine, 0.5);

  // ---------------------------------------------------------------- eyebrow
  K.eyebrow('The app', 960, 160, { align: 'center', alpha: K.io(t, -0.2, 0.6) });

  // ---------------------------------------------------------------- world (zoomable)
  const sideA = 1 - K.io(t, wAndOne + 0.15, 0.6);
  const sideBuild = K.seg(t, cMany + 0.3, cMany + 0.3 + M.motion.build);
  const linesA = 1 - 0.4 * K.io(t, wDesk + 0.5, 0.4) - 0.6 * K.io(t, wAndOne - 0.05, 0.35);   // >= .6 until the engine leaves
  // the wire's landing in each hood: a ghost of the same gold engine pops into the side cars' bays
  const landAt = [wCode - 0.3 + 0.8, wDesk - 0.1 + 0.8];
  K.zoomAt(960, 540, z, () => {
    // side cars (simple detail): "a code editor" (left) and "a help desk" (right); each shows a one-glyph window hint
    if (t > cMany) [MANY.cars[1], MANY.cars[2]].forEach((c, i) => {
      const land = K.io(t, landAt[i] - 0.1, 0.35, 'out');
      M.car(t, c.x, c.y, c.s, { detail: 'simple', build: sideBuild, alpha: sideA,
        engine: land > 0 ? { turn, alpha: 0.8 * land, shadow: false } : false });
      const hk = K.io(t, (i ? wDesk : wCode) - 0.05, 0.45) * sideA;
      if (hk > 0) { const gp = M.pt(c.x, c.y, c.s, 'glass'); windowHint(i, gp.x, gp.y + 12, hk); }
    });
    // the centre car (the app) builds around the engine; while the engine floats above, its bay holds the same ghost
    const land0 = K.io(t, wLab - 0.35 + 0.6, 0.35, 'out') * (1 - K.io(t, wAndOne + 0.2, 0.4));
    M.car(t, P.x, P.y, P.s, { build: K.seg(t, 0.55, 0.55 + M.motion.build),
      engine: t > cMany && land0 > 0 ? { turn, alpha: 0.8 * land0, shadow: false } : false });

    // gold dashed wiring: one engine, three hoods
    if (t > cMany && linesA > 0 && sideA > 0) {
      const w = 3 / z, dash = [14 / z, 10 / z], busY = 230;
      const sl = MANY.cars.map((c) => M.slot(c.x, c.y, c.s));
      const tops = sl.map((s) => ({ x: s.x, y: s.y - 70 * s.s - 4 }));
      const runs = [
        { pts: [[960, FLOAT.y + 70], [960, busY], [tops[0].x, busY], [tops[0].x, tops[0].y]], at: wLab - 0.35, d: 0.7, slot: sl[0] },
        { pts: [[960, busY], [tops[1].x, busY], [tops[1].x, tops[1].y]], at: wCode - 0.3, d: 0.8, slot: sl[1] },
        { pts: [[960, busY], [tops[2].x, busY], [tops[2].x, tops[2].y]], at: wDesk - 0.1, d: 0.8, slot: sl[2] },
      ];
      K.layer(linesA, () => runs.forEach((r) => {
        const k = K.io(t, r.at, r.d, 'io');
        polyline(r.pts, k, { color: C.head, w, dash });
        const land = K.io(t, r.at + r.d - 0.1, 0.4);
        if (land > 0) K.glow(r.slot.x, r.slot.y, 120 * r.slot.s / 0.56, C.head, 0.38 * land);
      }));
    }

    // the system prompt, tucked behind the windshield once the engine has read it
    note(t);

    // the engine(s)
    if (aAlpha > 0.002) M.engine(t, E.x, E.y + aDy, E.s, { turn, shadow: kIn < 1 || (kLift > 0 && kDown < 1), alpha: aAlpha, glow: engGlow,
      stand: 1 - K.io(t, 0.05, 0.4), digits: 0.6 * (1 - K.io(t, 0, 0.5)),
      label: kIn < 1 ? 'model' : null, labelK: 1 - K.io(t, -0.1, 0.35) });
    if (bAlpha > 0.002) {   // Model B: the same drawing, desaturated to a neutral silver (works around o.alt being terracotta)
      const g = K.ctx(); g.save(); g.filter = 'saturate(0.1) brightness(1.12)';
      M.engine(t, SL.x, SL.y + bDy, SL.s, { turn, shadow: false, alpha: bAlpha });
      g.restore();
    }
  });

  // ---------------------------------------------------------------- [[car]] the apps you touch (row under the car)
  {
    const names = ['ChatGPT', 'Claude app', 'Gemini app', 'Copilot'];
    const ws = names.map((s) => K.measure(s, M.type.label) + 26 * 1.6), gap = 26;
    let x = 960 - (ws.reduce((a, b) => a + b, 0) + gap * (names.length - 1)) / 2;
    const out = 1 - K.io(t, cParts, 0.5);
    names.forEach((s, i) => {
      const k = K.io(t, wProd[i] - 0.05, 0.45);
      if (k > 0 && out > 0) M.tag('app', x + ws[i] / 2, 836 + (1 - k) * 12, { text: s, alpha: k * out });
      x += ws[i] + gap;
    });
  }

  // ---------------------------------------------------------------- [[parts]] what the car adds (callouts, screen = world at z 1)
  const tagsA = (1 - 0.72 * K.io(t, cRules, 0.5)) * (1 - K.io(t, cMany - 0.35, 0.4));
  if (tagsA > 0.002 && t > cParts - 0.2) {
    const fk = K.io(t, wFile - 0.05, 0.45);
    if (fk > 0) K.layer(tagsA * fk, () => K.file(600, 604 + (1 - fk) * 10, 58, {}));
    // each callout lands on a real drawn thing: the window, a stack of saved chats on the roof, the file in the trunk,
    // a shield on the door, a receipt hanging out of the tail
    const gk = (w) => K.io(t, w - 0.05, 0.4);
    const sk = gk(wSaved), shk = gk(wSafety), bk = gk(wBill);
    if (sk > 0) K.layer(tagsA * sk, () => savedChats(780, 316 + (1 - sk) * 10));
    if (shk > 0) K.layer(tagsA * shk, () => K.icon('shield', 880, 612 + (1 - shk) * 8, 52, { color: C.strong, w: 3 }));
    if (bk > 0) K.layer(tagsA * bk, () => receipt(512, 640 + (1 - bk) * 10, bk));
    const parts = [
      ['chat window', 724, 446, 400, 330, wChat],
      ['saved chats', 780, 292, 560, 238, wSaved],
      ['file uploads', 574, 592, 330, 500, wFile],
      ['safety checks', 880, 640, 880, 852, wSafety],
      ['the bill', 500, 684, 330, 760, wBill],
    ];
    parts.forEach(([s, ax, ay, lx, ly, w]) => callout(s, ax, ay, lx, ly, K.seg(t, w - 0.05, w + 0.55), tagsA));
  }

  // ---------------------------------------------------------------- [[rules]] the system prompt (before the zoom it is screen = world)
  if (t > cRules - 0.2 && t < cMany + 0.6) {
    const kArrow = K.io(t, wReads, 0.5);
    const fade = 1 - K.io(t, cMany - 0.1, 0.35);
    if (kArrow > 0 && fade > 0) K.arrow(1520, 388, 1212, 530, { k: kArrow, bend: 70, color: C.accent, w: 3, alpha: fade });
  }

  // ---------------------------------------------------------------- [[many-cars]] labels + picker (fixed screen size)
  if (t > cMany) {
    const lab = [['the lab\'s app', MANY.cars[0], wLab], ['a code editor', MANY.cars[1], wCode], ['a help desk', MANY.cars[2], wDesk]];
    lab.forEach(([s, c, w]) => {
      const k = K.io(t, w - 0.05, 0.45) * sideA; if (k <= 0) return;
      const p = toScreen(c.x, 790);
      M.tag('app', p.x, p.y + (1 - k) * 10, { text: s, alpha: k });
    });
    const mk = K.io(t, kLift > 0 ? cMany + 1.0 : Infinity, 0.5) * (1 - K.io(t, wAndOne - 0.05, 0.35));
    if (mk > 0) { const p = toScreen(FLOAT.x, FLOAT.y); M.tag('model', p.x + 140 * z + 60, p.y, { alpha: mk }); }
  }
  {
    const pk = K.io(t, wSwap, 0.4) * (1 - K.io(t, cNames, 0.5));
    if (pk > 0) {
      const flipped = t >= sClose + 0.1;
      const open = K.io(t, wSwap + 0.1, 0.3) * (1 - K.io(t, sClose, 0.25));
      // above the hood, right of the windshield: the list drops into empty space over the engine bay, clear of the
      // chat window (M.pt 'picker' sits over the window's title bar). The new engine lowers in only after it closes.
      const pp = { x: 1215, y: 292 };
      const sc = flipped ? K.lerp(0.82, 1, K.io(t, sClose + 0.1, 0.5, 'back')) : 1;   // the scene's one 'back'
      K.at(pp.x, pp.y, sc, 0, () => M.picker(flipped ? 'Model B' : 'Model A', 0, 0, {
        open, options: ['Model A', 'Model B'], hi: 1, hiK: K.io(t, wSwap + 0.45, 0.25), alpha: pk, w: 190 }));
      // hairline from the picker down to the bay it controls
      const lk = K.io(t, wSwap + 0.2, 0.4) * pk;
      if (lk > 0 && open < 0.05) K.line(pp.x, pp.y + 30, pp.x, SL.y - 70 * SL.s - 10, { color: C.soft, w: 2, dash: [6, 7], alpha: 0.7 * lk });
    }
  }

  // ---------------------------------------------------------------- [[names]] the name table (left of the car)
  if (t > cNames) names(t);

  // ================================================================ helpers (closures over the timing above)
  function polyline(pts, k, o) {
    if (k <= 0) return;
    const segs = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); total += l; }
    let left = total * k;
    for (let i = 1; i < pts.length && left > 0; i++) {
      const u = Math.min(1, left / segs[i - 1]);
      K.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], { ...o, k: u });
      left -= segs[i - 1];
    }
  }

  function note(t) {
    if (t < cRules - 0.2) return;
    const kIn2 = K.io(t, wHidden - 0.1, 0.7), kTuck = K.io(t, cMany - 0.05, 0.7);   // full card until [[many-cars]]
    const gone = 1 - K.io(t, cNames, 0.5);
    if (kIn2 <= 0 || gone <= 0) return;
    const W = 380, H = 178;
    const home = { x: 1440 + W / 2 + (1 - kIn2) * 260, y: 196 + H / 2 };
    const tuck = { x: P.x + (1052 - 960) * P.s, y: P.y + (452 - 590) * P.s };   // behind the windshield, follows the car
    const cx = K.lerp(home.x, tuck.x, kTuck), cy = K.lerp(home.y, tuck.y, kTuck);
    // the readable note travels and shrinks only to half size while it fades; a plain note glyph (no text) docks
    // behind the windshield, so no text is ever drawn below 26 px
    const noteA = 1 - K.clamp(kTuck / 0.6);
    if (noteA > 0) K.layer(kIn2 * noteA * gone, () => K.at(cx, cy, K.lerp(1, 0.5, kTuck), 0, () =>
      K.note(-W / 2, -H / 2, W, 'system prompt', 'Be helpful. Be brief. Never…', { size: 26 })));
    const glyphA = K.clamp((kTuck - 0.35) / 0.5);
    if (glyphA > 0) K.layer(glyphA * gone * 0.9, () => noteGlyph(tuck.x, tuck.y));
  }

  function noteGlyph(x, y) {   // a small folded note: paper with three ruled lines
    const g = K.ctx(), w = 36, h = 44, f = 11;
    g.save(); g.translate(x - w / 2, y - h / 2);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w - f, 0); g.lineTo(w, f); g.lineTo(w, h); g.lineTo(0, h); g.closePath();
    g.fillStyle = C.paper; g.fill();
    g.beginPath(); g.moveTo(w - f, 0); g.lineTo(w - f, f); g.lineTo(w, f); g.fillStyle = C.paperShade; g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 2; g.lineCap = 'round';
    [15, 23, 31].forEach((yy, i) => { g.beginPath(); g.moveTo(7, yy); g.lineTo(w - (i === 2 ? 15 : 7), yy); g.stroke(); });
    g.restore();
  }

  function savedChats(x, y) {   // three stacked chat bubbles, like luggage on the roof
    const g = K.ctx();
    [[-8, 12], [0, 0], [8, -12]].forEach(([dx, dy], i) => {
      g.save(); K.rr(x - 34 + dx, y - 12 + dy, 68, 24, 10); g.fillStyle = C.tile; g.fill();
      g.strokeStyle = i === 2 ? C.strong : C.body; g.lineWidth = 2; g.stroke(); g.restore();
    });
    K.line(x - 16, y - 12, x + 14, y - 12, { color: C.soft, w: 3 });
  }

  function receipt(x, y, k) {   // a receipt with a torn bottom edge, sliding out of the tail
    const g = K.ctx(), w = 34, h = 50 * (0.6 + 0.4 * k);
    g.save(); g.translate(x - w / 2, y - 25);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h);
    for (let i = 0; i < 4; i++) { g.lineTo(w - (i + 0.5) * w / 4, h - 5); g.lineTo(w - (i + 1) * w / 4, h); }
    g.closePath(); g.fillStyle = C.paper; g.fill();
    g.strokeStyle = C.ink; g.lineWidth = 2; g.lineCap = 'round';
    [10, 18, 26].forEach((yy, i) => { if (yy < h - 8) { g.beginPath(); g.moveTo(7, yy); g.lineTo(i === 2 ? 18 : w - 7, yy); g.stroke(); } });
    g.restore();
  }

  function callout(label, ax, ay, lx, ly, k, alpha) {   // M.callout with a stronger leader (C.soft, 2 px)
    if (k <= 0) return;
    K.layer(alpha, () => {
      const lk = K.clamp(k / 0.5), g = K.ctx();
      g.save(); g.fillStyle = C.soft; g.globalAlpha *= lk; g.beginPath(); g.arc(ax, ay, 5, 0, Math.PI * 2); g.fill(); g.restore();
      // stop the leader at the pill's edge, so a dimmed (translucent) pill never shows the line through its text
      const pw = K.measure(label, M.type.label) + 26 * 1.6, ph = 26 * 1.9, dx = ax - lx, dy = ay - ly;
      const f = Math.min(dx ? (pw / 2 + 2) / Math.abs(dx) : 1e9, dy ? (ph / 2 + 2) / Math.abs(dy) : 1e9, 1);
      const ex = lx + dx * f, ey = ly + dy * f;
      K.line(ax, ay, ex, ey, { color: C.soft, w: 2, k: lk });
      const pk = K.clamp((k - 0.4) / 0.6);
      if (pk > 0) K.pill(label, lx, ly, { size: 26, alpha: pk, stroke: C.line2, color: C.strong, fill: C.tile });
    });
  }

  function windowHint(i, x, y, k) {   // one glyph per side car: '</>' for the code editor, a '?' bubble for the help desk
    K.layer(k, () => {
      if (i === 0) { K.text('</>', x, y + 18, { font: 'mono', weight: 600, size: 52, color: C.body, align: 'center' }); return; }
      const g = K.ctx();
      g.save(); K.rr(x - 44, y - 34, 88, 62, 22); g.strokeStyle = C.body; g.lineWidth = 3.5; g.stroke();
      g.beginPath(); g.moveTo(x - 18, y + 28); g.lineTo(x - 26, y + 46); g.lineTo(x - 2, y + 28); g.stroke(); g.restore();
      K.text('?', x, y + 16, { font: 'ui', weight: 600, size: 46, color: C.body, align: 'center' });
    });
  }

  function names(t) {
    const cx1 = 440, cx2 = 780, rc = (cx1 + cx2) / 2;
    const yIcon = 300, yTag = 374, rows = [462, 572, 690];
    const dim = K.lerp(1, 0.72, K.io(t, wNumbers + 1.0, 0.6));
    const glowL = 0.6 * K.io(t, wNumbers, 0.5);
    // headers: the mini car (app) and the engine (model), on their spoken words
    const hc = K.io(t, wCarSaid - 0.05, 0.45), he = K.io(t, wEngine - 0.05, 0.45);
    if (hc > 0) {
      M.car(t, cx1, yIcon + 4 + (1 - hc) * 10, 0.16, { detail: 'mini', alpha: hc * tableA });
      M.tag('app', cx1, yTag, { alpha: hc * tableA, glow: glowL });
    }
    if (he > 0) {
      M.engine(t, cx2, yIcon + (1 - he) * 10, 0.46, { turn, shadow: false, alpha: he * tableA });
      M.tag('model', cx2, yTag, { alpha: he * tableA, glow: glowL });
    }
    // row 1: ChatGPT is the car; GPT + a number is the engine
    const r1a = K.io(t, wChatGPT - 0.05, 0.45), r1b = K.io(t, wGPT - 0.05, 0.45);
    // the number drops off in sequence (never crossfaded: two chips of different widths read as 'GPGPT #')
    const hOut = K.io(t, wNumbers + 0.1, 0.35), hIn = K.io(t, wNumbers + 0.5, 0.35);
    if (r1a > 0) M.chip('ChatGPT', cx1, rows[0] + (1 - r1a) * 10, { size: 30, alpha: r1a * dim * tableA });
    if (r1b > 0) {
      if (hOut < 1) M.chip('GPT · #', cx2, rows[0] + (1 - r1b) * 10, { size: 30, kind: 'out', alpha: r1b * (1 - hOut) * dim * tableA });
      if (hIn > 0) M.chip('GPT', cx2, rows[0], { size: 30, kind: 'out', alpha: hIn * dim * tableA });
    }
    // rows 2-3: Claude and Gemini name both the car and the engine (ringed: one name, two things)
    [['Claude', wClaude, rows[1]], ['Gemini', wGemini, rows[2]]].forEach(([s, w, y]) => {
      const k = K.io(t, w - 0.05, 0.45); if (k <= 0) return;
      M.chip(s, cx1, y + (1 - k) * 10, { size: 30, alpha: k * dim * tableA });
      M.chip(s, cx2, y + (1 - k) * 10, { size: 30, kind: 'out', alpha: k * dim * tableA });
      K.layer(dim * tableA, () => K.ring(rc, y, 262, 52, K.io(t, w + 0.25, 0.7), { rot: 0, w: 3, color: C.accent }));
    });
    // learn the layers, not the numbers
    const lk = K.io(t, wNumbers + 0.1, 0.5);
    if (lk > 0) K.pill('layers, not numbers', 960, 862 + (1 - lk) * 10, { size: 30, alpha: lk, stroke: C.gold, color: C.head });
  }
});
