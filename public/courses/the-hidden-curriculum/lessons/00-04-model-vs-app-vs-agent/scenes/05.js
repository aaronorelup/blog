/* 00.04 · 05 — Handing over the wheel: the agent
   The same car (M.car), now allowed to act: a steering ring, a roof rack of tools, a loop, and you in the passenger seat.
   - opens on 04's exit (car at layout.std); "An agent" fades in the terracotta 'agent' tag; the car eases up to
     layout.agent; on "allowed to drive" the gold steering ring draws in behind the windshield with a soft glow.
   - [[tools]] the rack bar draws; the three tools drop on "files", "terminal", "edit code".
   - [[loop]] the loop draws around the car; station pills on "decide", "do it", "check" (each one lit while spoken,
     a terracotta dot steps between them, gears spin up on "decide", the terminal lights on "do it"); on "go again"
     the dot laps (1.6 s per lap); on "Claude" a small caption 'e.g. Claude Code', right-aligned outside the loop
     under 'do it' (the space between the car and 'check' stays clear).
   - [[notepad]] the car shrinks to layout.compare (loop follows it at 0.3). Right half: an 'Untitled - Notepad' window
     types two lines of plain Python; on "saved" it becomes 'script.txt - Notepad' and script.txt appears.
     Ghost steps on their words: ".py ?" (dot P Y), a dim prompt with a grey `cd` (C D), a dim .venv folder with '?'.
   - [[agent-steps]] the Notepad window becomes a chat window that writes the same code fast; on "steps" a gold bracket
     gathers the three steps, on "yours" the pill "the rest is yours". On "An agent" the rack's terminal tile slides over
     (terracotta) and the steps resolve by "take them": txt flips to py, `cd project` types, .venv turns solid. No
     permission chip here: asking is the next beat.
   - [[ask]] the right half fades and the car is home at layout.agent (the tile rides back to its rack) before
     "passenger"; you appear in the passenger seat and glow gold on "passenger"; the dot runs decide -> do it and parks;
     on "ask" the "Allow this command?" dialog (literal `python script.py`, continuing the Notepad story) opens under
     'do it'; "command" underlines it in terracotta; on "say no" the No pill lights and Yes drops to a neutral stroke.
   Exit: car mid-loop, dialog open, passenger lit, loop arrows at 0.6. */
SCENE('05', (t, S) => {
  const M = window.M, C = K.C, g = K.ctx(), L = M.layout;

  // ---- cues and spoken words (local seconds; fallbacks from the narration timing)
  const cTools = S.cue('tools', 3.12), cLoop = S.cue('loop', 9.04), cNote = S.cue('notepad', 20.11);
  const cSteps = S.cue('agent-steps', 33.69), cAsk = S.cue('ask', 40.24);
  const tAgent0 = S.find(/^agent$/i, 0, 0.28), tAllowed = S.find('allowed', 0, 1.67);
  const tFiles = S.find(/^files/i, 0, 5.18), tTerminal = S.find(/^terminal/i, 0, 6.8), tEdit = S.find(/^edit$/i, 0, 7.7);
  const tDecide = S.find(/^decide/i, 0, 10.52), tDo = S.find(/^do$/i, 0, 12.05), tCheck = S.find(/^check/i, 0, 12.81);
  const tGo = S.find(/^go$/i, 0, 14.15), tCoding = S.find(/^coding/i, 0, 16.6), tClaude = S.find(/^Claude$/i, 0, 17.86);
  const tPython = S.find(/^python/i, 0, 22.48), tSaved = S.find(/^saved/i, 0, 24.15);
  const tDotPy = S.find(/^dot$/i, 1, 27.74), tCD = S.find(/^C$/i, 0, 29.26), tDotVenv = S.find(/^dot$/i, 2, 31.5);
  const tPlain = S.find(/^plain/i, 0, 33.87), tWrite = S.find(/^write$/i, 0, 34.96);
  const tStepsW = S.find(/^steps/i, 0, 36.57), tYours = S.find(/^yours/i, 0, 37.68), tAn = S.find(/^An$/i, 1, 38.62);
  const tPassenger = S.find(/^passenger/i, 0, 41.0), tAskW = S.find(/^ask$/i, 0, 44.22), tSay = S.find(/^say$/i, 0, 46.87);
  const tCommand = S.find(/^command/i, 1, 45.36);

  K.bg({ glow: 0.12, glowX: 960, glowY: 560 });
  K.eyebrow('THE AGENT', 960, 160, { align: 'center', alpha: K.io(t, -0.3, 0.6) });

  // ================================================================ where the car is
  const k1 = K.io(t, 0.45, M.motion.move);            // 04's std -> agent (room for rack + loop)
  const k2 = K.io(t, cNote, 0.8);                     // agent -> compare (the Notepad story takes the right half)
  const backAt = tAn + 1.2;                            // the steps are resolved by 'take them'; home before 'passenger'
  const kBack = K.io(t, backAt, 0.75);                 // compare -> agent
  let P = M.lerpPlace(L.std, L.agent, k1);
  P = M.lerpPlace(P, L.compare, k2);
  P = M.lerpPlace(P, L.agent, kBack);
  const loopGeo = (p) => ({ cx: p.x, cy: p.y - 100 * p.s, rx: 775 * p.s, ry: 400 * p.s });   // = layout.loop at layout.agent
  const LG = loopGeo(P);

  // ================================================================ the loop (drawn under the car)
  const loopK = K.io(t, cLoop, 1.4, 'lin');
  const arrowsA = K.lerp(K.lerp(1, 0.3, k2), 0.6, kBack);
  // station pills step aside while the car crosses back over the Notepad side, and return once it is home
  const stA = K.lerp(K.lerp(1, 0.45, k2) * (1 - K.io(t, backAt, 0.25)), 1, K.io(t, backAt + 0.55, 0.35));
  const stations = [K.io(t, tDecide - 0.15, 0.4), K.io(t, tDo - 0.15, 0.4), K.io(t, tCheck - 0.15, 0.4)].map((v) => v * stA);
  // the dot: steps with the words, then laps of 1.6 s; after the story it runs decide -> do it and parks just before 'do it'
  const lap = M.motion.loop;
  const parkAt = cAsk + 2.0;
  let u = 0.375 * K.io(t, tDo - 0.55, 0.5) + 0.25 * K.io(t, tCheck - 0.5, 0.45) + 0.375 * K.io(t, tGo - 0.6, 0.6)
    + K.io(t, tGo + 0.2, lap) + K.io(t, tCoding, lap) + K.io(t, tCoding + lap + 0.15, lap)
    + 0.31 * K.io(t, parkAt, 1.1);   // parks just before 'do it': waiting for your yes
  const dotA = K.io(t, tDecide - 0.25, 0.3) * (1 - K.io(t, cNote, 0.4)) + K.io(t, backAt + 0.6, 0.4);
  // which station is lit: the one being spoken, then 'do it' once the dot parks there
  let active = null;
  if (t >= tDecide && t < tGo) active = t >= tCheck ? 2 : t >= tDo ? 1 : 0;
  if (t >= parkAt + 1.0) active = 1;
  if (dotA > 0.01) K.layer(dotA, () => M.loop(t, { ...LG, k: 0, stations: 0, dot: u }));
  if (loopK > 0) M.loop(t, { ...LG, k: loopK, alpha: arrowsA, stations, active });

  // ================================================================ the car
  const turn = M.spin(t, [
    { at: tDecide, rate: M.motion.busy }, { at: tDecide + 1.0, rate: M.motion.turn },
    { at: parkAt - 0.6, rate: M.motion.busy }, { at: parkAt + 0.4, rate: M.motion.turn },
  ]);
  const rackK = K.io(t, cTools, 0.6);
  const tools = [K.io(t, tFiles - 0.35, 0.5, 'out'), K.io(t, tTerminal - 0.3, 0.5, 'out'), K.io(t, tEdit - 0.3, 0.5, 'out')];
  // the terminal tile leaves the rack for the Notepad side on "An agent" and rides back with the car
  const tileOut = K.io(t, tAn - 0.05, 0.5), tileBack = kBack;
  const detached = tileOut > 0 && tileBack < 1;
  const lit = [];
  if ((t >= tDo && t < tCheck + 0.6) || t >= parkAt + 1.0) lit.push(1);
  const rack = rackK > 0 ? {
    k: rackK, tools, lit,
    labels: K.clamp((P.s - 0.62) / 0.15),
    hide: detached ? [1] : [],
  } : undefined;
  const wheelK = K.io(t, tAllowed, 0.8);
  M.car(t, P.x, P.y, P.s, {
    engine: { turn },
    wheel: wheelK, wheelGlow: 0.7 * K.io(t, tAllowed + 0.3, 0.5),
    passenger: K.io(t, tPassenger - 0.55, 0.5), youGlow: K.io(t, tPassenger, 0.5),
    rack,
  });

  // the layer pill and the "coding agents" note (fixed 26 px)
  const tagA = K.io(t, tAgent0, 0.5) * (1 - K.io(t, cNote, 0.4)) + K.io(t, backAt + 0.6, 0.5);
  if (tagA > 0.01) { const p = M.pt(P.x, P.y, P.s, 'labelAgent'); M.tag('agent', p.x, p.y, { alpha: tagA }); }
  // the one real product name, on "Claude": a small caption outside the ellipse, right-aligned under 'do it'
  const codingA = K.io(t, tClaude - 0.05, 0.4) * (1 - K.io(t, cNote, 0.4));
  if (codingA > 0.01) {
    const s = 'e.g. Claude Code', w = K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
    K.pill(s, 1820 - w / 2, 662 + (1 - codingA) * 8, { size: 26, alpha: codingA, color: C.strong });
  }

  // ================================================================ the Notepad story (right half)
  const gA = K.io(t, cNote + 0.45, 0.5) * (1 - K.io(t, backAt, 0.45));
  if (gA > 0.01) K.layer(gA, () => {
    const WX = 1000, WY = 190, WW = 780, WH = 250;
    const code = ['name = input("Your name? ")', 'print("Hello, " + name)'];
    // Notepad: Aaron's version (plain text, no line numbers, no colours)
    const nA = 1 - K.io(t, cSteps, 0.35);
    if (nA > 0.01) K.layer(nA, () => {
      const cr = K.win(WX, WY, WW, WH, { kind: 'notepad', title: t < tSaved + 0.3 ? 'Untitled - Notepad' : 'script.txt - Notepad', titleSize: 26 });
      K.editor(cr, t, code, { typeAt: tPython - 0.2, cps: 24, size: 30, gutter: false, syntax: 'none' });
    });
    // today: a plain chat window writes the same code
    const cA = K.io(t, cSteps + 0.1, 0.4);
    if (cA > 0.01) K.layer(cA, () => {
      const cr = K.win(WX, WY, WW, WH, { kind: 'browser', title: 'chat', titleSize: 26 });
      const yk = K.io(t, tPlain, 0.4);
      if (yk > 0) {   // your ask, right-aligned and gold-tinted (as in M.chat)
        const f = { font: 'ui', size: 26 }, s = 'write my script', bw = K.measure(s, f) + 32;
        K.card(cr.x + cr.w - 18 - bw, cr.y + 14, bw, 44, { r: 18, shadow: false, fill: K.rgba(C.head, 0.14), stroke: K.rgba(C.head, 0.55), lw: 1.5, alpha: yk });
        K.text(s, cr.x + cr.w - 18 - bw + 16, cr.y + 45, { ...f, color: C.strong, alpha: yk });
      }
      const bk = K.io(t, tWrite - 0.5, 0.35);
      if (bk > 0) K.layer(bk, () => {
        K.card(cr.x + 18, cr.y + 70, 500, 116, { r: 18, shadow: false, fill: C.tile, stroke: C.line2, lw: 1.5 });
        K.editor({ x: cr.x + 18 - 8, y: cr.y + 60, w: 500, h: 140 }, t, code, { typeAt: tWrite - 0.4, cps: 60, size: 28, gutter: false, syntax: 'none' });
      });
    });

    // ---- the three steps around the code (ghosts until an agent takes them)
    // each ghost arrives on its spoken word at 0.8 with a 10 px rise and a terracotta '?' pulse, then settles to 0.55
    const ghostIn = (w) => K.io(t, w - 0.1, 0.45);
    const ghostA = (w) => ghostIn(w) * (0.55 + 0.25 * (1 - K.io(t, w + 0.9, 0.9)));
    const ghostRise = (w) => (1 - K.io(t, w - 0.1, 0.5)) * 10;
    const pulse = (w) => K.io(t, w - 0.05, 0.2) * (1 - K.io(t, w + 0.55, 0.6));
    // the agent takes them on "take them" (the permission dialog comes later, on "ask")
    const res1 = K.io(t, tAn + 0.45, 0.35);            // txt -> py
    const tType = tAn + 0.6;                           // cd project
    const res2 = K.io(t, tType - 0.1, 0.3);
    const res3 = K.io(t, tAn + 0.85, 0.35);            // .venv solid
    // row 1: the file
    const r1 = K.io(t, tSaved, 0.5);
    if (r1 > 0.01) K.layer(r1, () => {
      const fx = 1060, fy = 530, sx = Math.max(0.03, Math.abs(Math.cos(Math.PI * res1)));
      g.save(); g.translate(fx, fy); g.scale(sx, 1); g.translate(-fx, -fy);
      K.file(fx, fy + (1 - r1) * 10, 96, { ext: res1 < 0.5 ? 'txt' : 'py' });
      g.restore();
      K.text(res1 < 0.5 ? 'script.txt' : 'script.py', 1130, 541, { font: 'mono', size: 30, color: res1 < 0.5 ? C.strong : C.head });
      const a1 = ghostA(tDotPy) * (1 - res1);
      if (a1 > 0.01) K.layer(a1, () => {   // a 30 px dashed ghost pill '.py ?'
        const f = { font: 'ui', weight: 600, size: 30 }, px = 1420, py = 530 + ghostRise(tDotPy), pu = pulse(tDotPy);
        const w1 = K.measure('.py', f), wq = K.measure('?', f), gap = 10, pw = w1 + gap + wq + 48, ph = 56;
        g.save(); g.strokeStyle = C.soft; g.lineWidth = 2; g.setLineDash([7, 7]); K.rr(px - pw / 2, py - ph / 2, pw, ph, ph / 2); g.stroke(); g.restore();
        const tx = px - pw / 2 + 24;
        K.text('.py', tx, py + 10, { ...f, color: C.body });
        const qx = tx + w1 + gap + wq / 2, qs = 1 + 0.35 * pu;
        g.save(); g.translate(qx, py); g.scale(qs, qs);
        K.text('?', 0, 10, { ...f, color: K.mixColor(C.soft, C.accent, 0.35 + 0.65 * pu), align: 'center' });
        g.restore();
      });
    });
    // row 2: the terminal prompt
    const r2 = ghostIn(tCD);
    if (r2 > 0.01) K.layer(K.lerp(ghostA(tCD), 1, res2), () => {
      const x0 = 1010, y0 = 632 + ghostRise(tCD), w = 470, h = 76;
      g.save(); g.fillStyle = C.code; K.rr(x0, y0, w, h, 14); g.fill();
      g.strokeStyle = C.line2; g.lineWidth = 2; if (res2 < 0.5) g.setLineDash([7, 7]); K.rr(x0, y0, w, h, 14); g.stroke(); g.restore();
      const by = y0 + h / 2 + 10, f = { font: 'mono', size: 28 };
      const pw = K.text('C:\\Users\\you>', x0 + 22, by, { ...f, color: C.head });
      K.text(' cd', x0 + 22 + pw, by, { ...f, color: C.soft, alpha: 1 - K.io(t, tType - 0.1, 0.15) });
      if (t >= tType) K.text(' ' + K.typed('cd project', t, tType, 36), x0 + 22 + pw, by, { ...f, color: C.strong });
      const pu = pulse(tCD), qa = (1 - res2) * (0.6 + 0.4 * pu);
      if (qa > 0.01) K.icon('question', x0 + w - 40, y0 + h / 2, 30 * (1 + 0.35 * pu), { color: C.accent, alpha: qa, w: 3 });
    });
    // row 3: the .venv folder
    const r3 = ghostIn(tDotVenv);
    if (r3 > 0.01) K.layer(r3, () => {
      const fy = 805 + ghostRise(tDotVenv), ga = ghostA(tDotVenv) / Math.max(0.01, r3), pu = pulse(tDotVenv);
      K.folder(1060, fy, 64, { alpha: K.lerp(ga, 1, res3) });
      const qa3 = (1 - res3) * (0.65 + 0.35 * pu), qr = 17 * (1 + 0.2 * pu);   // a dark badge keeps the '?' readable on the gold folder
      if (qa3 > 0.01) { g.save(); g.globalAlpha *= qa3; g.fillStyle = C.code; g.beginPath(); g.arc(1060, fy + 7, qr, 0, Math.PI * 2); g.fill(); g.restore(); }
      K.icon('question', 1060, fy + 7, 24 * (1 + 0.3 * pu), { color: C.accent, alpha: qa3, w: 3 });
      K.text('.venv', 1130, fy + 11, { font: 'mono', size: 30, color: K.mixColor(C.soft, C.strong, res3), alpha: K.lerp(Math.min(1, ga + 0.2), 1, res3) });
    });
    // the bracket: "the steps around it stay yours" (gold) -> taken by the agent (terracotta)
    const brK = K.io(t, tStepsW - 0.1, 0.6);
    const took = K.io(t, tAn + 0.35, 0.4);
    if (brK > 0) {
      const col = K.mixColor(C.head, C.accent, took), bx = 1520, y0 = 482, y1 = 858, mid = 670;
      K.line(bx, mid, bx, K.lerp(mid, y0, brK), { color: col, w: 3 }); K.line(bx, mid, bx, K.lerp(mid, y1, brK), { color: col, w: 3 });
      if (brK > 0.9) { K.line(bx, y0, bx - 18, y0, { color: col, w: 3 }); K.line(bx, y1, bx - 18, y1, { color: col, w: 3 }); }
    }
    const pillA = K.io(t, tYours - 0.4, 0.5) * (1 - K.io(t, tAn - 0.05, 0.3));
    if (pillA > 0.01) K.pill('the rest is yours', 1680, 670, { size: 26, stroke: C.gold, color: C.head, alpha: pillA });
    // the agent reaching each step: three short terracotta leaders from the tile to the bracket
    [[res1, 530], [res2, 670], [res3, 805]].forEach(([r, yy], i) => {
      const k = K.io(t, tAn + 0.35 + i * 0.2, 0.3);
      if (k > 0) K.line(1634, 670, K.lerp(1634, 1528, k), K.lerp(670, yy, k), { color: C.accent, w: 2, alpha: 0.85 });
    });
  });

  // ================================================================ the detached terminal tile (drawn above everything)
  if (detached) {
    const from = M.rackPt(L.compare.x, L.compare.y, L.compare.s, 1);
    const to = { x: 1680, y: 670, s: 84 };
    const e = K.ease.io(K.clamp(tileOut));
    // a gentle arc over the gap between the window and the steps
    const cx = 1300, cy = 430;
    let x = (1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * cx + e * e * to.x;
    let y = (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * cy + e * e * to.y;
    let s = K.lerp(from.s, to.s, e);
    if (tileBack > 0) {
      const home = M.rackPt(P.x, P.y, P.s, 1);
      x = K.lerp(x, home.x, tileBack); y = K.lerp(y, home.y, tileBack); s = K.lerp(s, home.s, tileBack);
    }
    M.drawTool('terminal', x, y, s, true);
  }
  // ================================================================ "Run this command?" (by 'do it')
  // the same dialog as 07 ('Allow this command?' + python script.py, the story's own script), under 'do it' so the arc into 'do it' stays visible
  const dA = K.io(t, tAskW - 0.1, 0.45);
  if (dA > 0.01) {
    g.save(); g.translate(0, (1 - dA) * 12);
    const noK = K.io(t, tSay, 0.5);
    const r = M.ask(t, 1345, 668, { w: 490, alpha: dA, q: 'Allow this command?', cmd: 'python script.py', choice: noK > 0 ? 'no' : null, choiceK: noK });
    // "command": a terracotta underline draws under the literal command
    const cw = K.measure('python script.py', { font: 'mono', size: 26, weight: 600 });
    K.line(r.cmdX, r.cmdY + 9, r.cmdX + cw, r.cmdY + 9, { color: C.accent, w: 2.5, k: K.io(t, tCommand - 0.1, 0.5), alpha: dA });
    // Yes and No wait as equals (nothing is pre-approved); on "say no" only No lights
    K.layer(dA, () => {
      const f = { font: 'ui', weight: 600, size: 26 }, yw = K.measure('Yes', f) + 26 * 1.6, yh = 26 * 1.9;
      K.card(r.yes.x - yw / 2, r.yes.y - yh / 2, yw, yh, { r: yh / 2, fill: C.tile, stroke: C.code, lw: 5, shadow: false });
      K.pill('Yes', r.yes.x, r.yes.y, { size: 26, stroke: C.line2, color: C.body });
    });
    g.restore();
  }
});
