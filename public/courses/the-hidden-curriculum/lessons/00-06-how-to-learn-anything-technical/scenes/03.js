/* 03 — They fix their own errors now.
   Left: the screen of each era (Notepad .txt -> autocomplete editor -> chat -> agent terminal), then the dated cards.
   Right: the house is built across the three eras: the owner lays bricks by hand (2021, 2022), then the crew
   carries them (2025-) until the house stands; "a crash is machine-checkable". */
SCENE('03', (t, S) => {
  const C = K.C, P = M.palette;
  K.bg({ glow: 0.22, glowX: 1380, glowY: 600 });

  // ---------------------------------------------------------------- beats
  const tNote = S.find('Notepad', 0, 3.5);
  const tTxt = S.find(/^dot$/, 0, 4.9);
  const tAgent = S.find('agent', 0, 7.6);
  const tFive = S.find('Five', 0, 10.2);
  const aAuto = S.cue('autocomplete', 12.8);
  const tRan = S.find('ran', 0, 14.1);
  const tRead = S.find('read', 0, 15.3);
  const tSearch = S.find('searched', 0, 16.2);
  const tFixed = S.find('fixed', 0, 17.3);
  const aPaste = S.cue('paste', 20.3);
  const tFixBack = S.find('fix', 1, 22.4);
  const aAgents = S.cue('agents', 25.3);
  const tRuns = S.find('runs', 0, 25.8);
  const tReads = S.find('reads', 0, 26.8);
  const tFixes = S.find('fixes', 0, 27.9);
  const tAgain = S.find('runs', 1, 29.0);
  const tPass = S.find('passes.', 0, 30.4);
  const aAaron = S.cue('aaron', 31.6);
  const tHand = S.find('Writing', 0, 36.7);
  const aShare = S.cue('share', 41.5);
  const tAnth = S.find('Anthropic', 0, 46.6);
  const aCheck = S.cue('machine-check', 51.9);
  const aAgentic = S.cue('agentic', 57.8);
  const tDirect = S.find('direct,', 0, 60.4);

  // ---------------------------------------------------------------- the era strip
  const SY = 196;
  const eras = [
    { x: 420, s: '2021 · autocomplete', at: aAuto },
    { x: 960, s: '2022 · paste into chat', at: aPaste },
    { x: 1500, s: '2025– · agents fix and re-run', at: aAgents },
  ];
  const stripK = K.io(t, tFive - 0.3, 0.7, 'out');
  if (stripK > 0) {
    K.line(560, SY, 790, SY, { color: C.line2, w: 2, alpha: stripK * 0.8 });
    K.line(1130, SY, 1270, SY, { color: C.line2, w: 2, alpha: stripK * 0.8 });
    eras.forEach((e, i) => {
      const on = K.io(t, e.at, 0.5, 'out');
      const next = i < 2 ? K.io(t, eras[i + 1].at, 0.6) : 0;
      const a = stripK * (0.38 + 0.62 * on - 0.3 * next);
      const lit = on * (1 - next);
      K.pill(e.s, e.x, SY, {
        size: 28, alpha: a,
        color: K.mixColor(C.soft, i === 2 ? C.head : C.strong, on),
        stroke: K.mixColor(C.line2, C.head, lit), glow: 0.5 * lit,
      });
    });
  }

  // ---------------------------------------------------------------- left panel: the screen of each era
  const WX = 120, WY = 286, WW = 760, WH = 340;
  const mono = (s, x, y, color, o = {}) => K.text(s, x, y, { font: 'mono', size: 28, color, ...o });

  // A + B share ONE window frame (constant alpha across the 2021 hand-off); only the contents crossfade.
  // A. Notepad, script.txt (0 .. autocomplete); the title flips to .py when the agent is named
  // B. 2021: an editor with autocomplete, then the by-hand loop (run, read, search, fix)
  const flip = K.io(t, tAgent, 0.5);
  const frameA = K.io(t, -0.4, 0.6) * (1 - K.io(t, aPaste - 0.4, 0.6));
  const aA = 1 - K.io(t, aAuto - 0.7, 0.6);        // contents of A
  const aB = K.io(t, aAuto - 0.4, 0.6);            // contents of B
  let r = null;
  if (frameA > 0) {
    const hand = K.io(t, aAuto - 0.7, 0.6);
    r = K.win(WX, WY, WW, WH, {
      kind: flip > 0.5 ? 'code' : 'notepad', titleSize: 28, alpha: frameA,
      title: flip > 0.5 ? 'script.py' : 'script.txt', stroke: K.mixColor(C.line2, C.head, flip * (1 - hand)),
    });
    // lines 1 and 3 are the same in A and B: drawn once, so they never dip during the hand-off
    const fx = K.io(t, tFixed, 0.4);
    K.layer(frameA, () => {
      mono('prices = [3, 5, 8]', r.x + 34, r.y + 60, flip > 0.5 ? C.strong : C.body);
      mono(fx < 0.5 ? 'print(totl)' : 'print(total)', r.x + 34, r.y + 152, fx < 0.5 ? (flip > 0.5 ? C.strong : C.body) : C.head);
      // the typo the error points at: underlined in terracotta from "read the error" until it is fixed
      const uk = K.io(t, tRead, 0.35) * (1 - K.io(t, tFixed, 0.3));
      if (uk > 0) {
        const ux = r.x + 34 + K.measure('print(', { font: 'mono', size: 28 });
        const uw = K.measure('totl', { font: 'mono', size: 28 });
        K.line(ux, r.y + 166, ux + uw * uk, r.y + 166, { color: C.accent, w: 3 });
      }
    });
  }
  if (r && aA > 0) {
    K.layer(frameA * aA, () => {
      mono('total = sum(prices)', r.x + 34, r.y + 106, flip > 0.5 ? C.strong : C.body);
      // the .txt / .py ending, said out loud
      const tk = K.io(t, tTxt, 0.4, 'out');
      if (tk > 0) {
        const ext = flip > 0.5 ? '.py' : '.txt';
        const col = flip > 0.5 ? C.head : C.accent;
        K.pill(ext, r.x + r.w - 110, r.y + r.h - 50, { size: 30, font: 'mono', color: col, stroke: col, alpha: tk });
      }
      // the agent drifts over the window and does it
      const ck = K.io(t, tAgent - 0.2, 0.8, 'out');
      if (ck > 0) M.crew(t, K.lerp(1000, r.x + r.w - 110, ck), r.y + r.h - 130, 60, { i: 4, alpha: ck * (1 - K.io(t, aAuto - 1.2, 0.5)) });
    });
  }
  if (r && aB > 0) {
    K.layer(frameA * aB, () => {
      const x0 = r.x + 34;
      // autocomplete: a grey guess of the rest of the line, accepted a moment later
      const w1 = mono('total = ', x0, r.y + 106, C.strong);
      const acc = K.io(t, aAuto + 0.9, 0.3);
      mono('sum(prices)', x0 + w1, r.y + 106, K.mixColor(C.quiet, C.strong, acc), { alpha: K.io(t, aAuto, 0.3) });
      if (acc < 1 && t > aAuto) K.pill('Tab', x0 + w1 + 260, r.y + 96, { size: 26, color: C.soft, alpha: K.io(t, aAuto, 0.3) * (1 - acc) });
      const fx = K.io(t, tFixed, 0.4);
      // output pane
      K.line(r.x + 20, r.y + 184, r.x + r.w - 20, r.y + 184, { color: C.line, w: 1.5, alpha: K.io(t, tRan, 0.3) });
      const oa = K.io(t, tRan, 0.3);
      if (oa > 0) K.text('> python script.py', x0, r.y + 230, { font: 'mono', size: 26, color: C.head, alpha: oa });
      const ea = K.io(t, tRead - 0.1, 0.3);
      if (ea > 0) K.text("NameError: name 'totl' is not defined", x0, r.y + 272, { font: 'mono', size: 26, color: K.mixColor(C.accent, C.quiet, fx), alpha: ea });
    });
  }

  // C. 2022: paste the error into a chat, paste the fix back
  const aC = K.io(t, aPaste - 0.2, 0.5) * (1 - K.io(t, aAgents - 0.4, 0.5));
  if (aC > 0) K.layer(aC, () => {
    M.bubble("NameError: name 'totl' is not defined", 470, 360, 'owner', { size: 30, maxW: 700, k: K.io(t, aPaste, 0.5) });
    M.bubble('Change totl to total.', 560, 520, 'crew', { size: 30, k: K.io(t, tFixBack - 0.5, 0.5) });
  });

  // D. 2025-: the agent's own terminal, rests on "5 passed"
  const aD = K.io(t, aAgents - 0.2, 0.6);
  let passRow = null;
  if (aD > 0) {
    const r = K.win(WX, WY, WW, WH, { kind: 'terminal', title: 'agent', titleSize: 28, alpha: aD, focus: t > tPass && t < tPass + 1.5 });
    K.layer(aD, () => {
      K.term(r, t, [
        { at: tRuns, cmd: 'python -m pytest', cps: 34 },
        { at: tReads, out: '2 failed, 3 passed', color: C.accent },
        { at: tFixes, out: '  editing script.py ...', color: C.soft },
        { at: tAgain, cmd: 'python -m pytest', cps: 34 },
        { at: tPass, out: '5 passed', color: C.head },
      ], { prompt: '> ', size: 28, lh: 44, rows: 5, idle: true });
      passRow = { x: r.x + 28, y: r.y + 28 + 28 + 4 * 44 };
      // the agent sits on the window
      M.crew(t, r.x + r.w - 70, r.y + 110, 60, { i: 5, alpha: K.io(t, aAgents, 0.5) });
    });
  }
  // the machine can check this one
  const rk = K.io(t, aCheck, 0.7, 'out');
  if (passRow && rk > 0) K.ring(passRow.x + 67, passRow.y - 10, 92, 25, rk, { color: C.head, w: 4, rot: 0 });

  // the by-hand loop vs the agent's loop: a row of steps under the window
  const RY = 690;
  const row = (label, steps, a, gold) => K.layer(a, () => {
    const lw = K.text(label, WX, RY + 10, { font: 'ui', weight: 600, size: 30, color: gold ? C.head : C.body });
    let x = WX + lw + 24;
    steps.forEach(([s, at], i) => {
      const k = K.io(t, at, 0.35, 'out');
      const w = K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
      K.pill(s, x + w / 2, RY, { size: 26, alpha: 0.3 + 0.7 * k, color: k > 0.5 ? (gold ? C.head : C.strong) : C.soft, stroke: k > 0.5 && gold ? C.head : C.line2 });
      x += w + 12;
      if (i < steps.length - 1) { K.text('→', x + 2, RY + 9, { size: 26, color: C.soft, alpha: 0.3 + 0.7 * k }); x += 40; }
    });
  });
  const handA = K.io(t, tRan - 0.2, 0.4) * (1 - K.io(t, aPaste - 0.4, 0.5));
  if (handA > 0) row('by hand:', [['run', tRan], ['read', tRead], ['search', tSearch], ['fix', tFixed]], handA, false);
  const pasteA = K.io(t, aPaste, 0.4) * (1 - K.io(t, aAgents - 0.4, 0.5));
  if (pasteA > 0) row('by hand:', [['paste error', aPaste + 0.4], ['paste fix back', tFixBack]], pasteA, false);
  const agentA = K.io(t, aAgents, 0.4) * (1 - K.io(t, aAaron - 0.2, 0.5));
  if (agentA > 0) row('the agent:', [['run', tRuns], ['read', tReads], ['fix', tFixes], ['re-run', tAgain]], agentA, true);

  // cards under the window
  const CY = 656, CW = WW;
  const aaronA = K.io(t, aAaron, 0.6, 'out') * (1 - K.io(t, aShare - 0.5, 0.5));
  if (aaronA > 0) {
    M.dated(WX, CY, CW, 'Aaron, who made this course', 'No hand-debugging since Claude Code', { kind: 'machine', k: aaronA, alpha: aaronA });
    const hk = K.io(t, tHand, 0.5, 'out') * (1 - K.io(t, aShare - 0.5, 0.5));
    if (hk > 0) M.chip('code by hand: the exception', WX + 230, 850, 'neutral', { k: hk, alpha: hk });
  }
  const shareA = 1 - K.io(t, aAgentic - 0.5, 0.5);
  const gk = K.io(t, aShare, 0.6, 'out') * shareA;
  if (gk > 0) M.dated(WX, CY, CW, 'Google · Apr 2026', 'About 75% of its new code is AI-written', { kind: 'machine', k: gk, alpha: gk, badge: { text: 'as of Oct 2026', kind: 'asof' } });
  const ak = K.io(t, tAnth, 0.6, 'out') * shareA;
  if (ak > 0) M.dated(WX, CY + 136, CW, 'Anthropic · 2026', 'Most of its own code is written by Claude', { kind: 'machine', k: ak, alpha: ak });
  const kk = K.io(t, aAgentic, 0.6, 'out');
  if (kk > 0) M.dated(WX, CY, CW, 'Andrej Karpathy · Feb 2026', 'The careful version: agentic engineering', { kind: 'machine', k: kk, alpha: kk });

  // ---------------------------------------------------------------- right: the house goes up
  const HX = 1380, HY = 630, HS = 340;
  // build: plot, then the owner's slow bricks (2021, 2022), then the crew's fast ones (2025-)
  // the Notepad years: the owner lays the first bricks by hand while the story is told
  const lay0 = [tNote + 0.5, tTxt + 1.2];
  const lay21 = [aAuto + 1.4, aAuto + 3.6, aAuto + 5.8];
  const lay22 = [aPaste + 1.2, aPaste + 3.4];
  let build = 0.1;
  const hands = [...lay0, ...lay21, ...lay22];
  hands.forEach((at) => { build += 0.035 * K.io(t, at, 0.4); });
  // 0.345 after the by-hand bricks
  const b1 = K.io(t, aAgents + 0.8, aCheck - 12.5 - aAgents, 'sine');        // walls to the top
  const b2 = K.io(t, aCheck - 11.3, 5.2);                                     // roof
  const b3 = K.io(t, aCheck - 5.6, 2.6);                                      // plaster, door and windows
  build += (0.68 - 0.345) * b1 + 0.22 * b2 + 0.1 * b3;
  // the plan: a faint ghost of the finished house over the plot, so the empty site reads as "not built yet"
  const ghostA = K.io(t, -0.4, 0.6) * (1 - K.io(t, aCheck - 5.6, 2.4));
  if (ghostA > 0) M.house(t, HX, HY, HS, { ghost: true, noGround: true, alpha: 0.55 * ghostA });
  const gm = M.house(t, HX, HY, HS, { build: Math.min(1, build) });
  const B = gm.body;
  const wallsK = K.clamp((build - 0.08) / 0.6);
  const wallTop = K.lerp(B.y1, B.y0, wallsK);

  // the owner: lays bricks by hand, then steps back and watches
  const back = K.io(t, aAgents + 0.2, 1.3);
  const ox = K.lerp(1095, 1720, back);
  const owner = M.person(t, ox, gm.ground, 140, 'owner', { i: 1, sway: back < 0.02 || back > 0.98 });
  // a brick in flight from the owner's hand to the wall; and the ghost of the next one (autocomplete's guess)
  hands.forEach((at, i) => {
    const p = K.seg(t, at - 1.1, at);
    if (p <= 0 || p >= 1) return;
    const e = K.ease.io(p);
    const tx = K.lerp(B.x0 + 40, B.x1 - 60, (i * 0.37) % 1), ty = wallTop - 10;
    const bx = K.lerp(owner.hand.x, tx, e), by = K.lerp(owner.hand.y, ty, e) - Math.sin(e * Math.PI) * 60;
    const g = K.ctx(); g.save(); g.fillStyle = P.brick; g.strokeStyle = P.brickLine; g.lineWidth = 2;
    K.rr(bx - 20, by - 8, 40, 16, 3); g.fill(); g.stroke(); g.restore();
    if (i >= 2 && i < 5) { // 2021: autocomplete's faint guess of where the next brick goes
      const ga = K.io(t, at - 1.1, 0.3) * (1 - K.io(t, at - 0.15, 0.15));
      K.layer(ga * 0.8, () => { const g2 = K.ctx(); g2.save(); g2.setLineDash([5, 5]); g2.strokeStyle = C.soft; g2.lineWidth = 2; K.rr(tx - 20, ty - 8 - 18, 40, 16, 3); g2.stroke(); g2.restore(); });
    }
  });

  // the crew: three sparkles carry bricks up from a pile, then settle around the finished house
  const crewIn = K.io(t, aAgents, 0.6, 'out');
  const settle = K.io(t, aCheck - 3, 1.4);
  const pile = { x: 1090, y: gm.ground - 30 };
  const rest = [{ x: 1070, y: 560 }, { x: 1130, y: 680 }, { x: 1650, y: 520 }];
  if (crewIn > 0) {
    // brick pile
    K.layer(crewIn * (1 - settle), () => {
      const g = K.ctx(); g.save(); g.fillStyle = P.brick; g.strokeStyle = P.brickLine; g.lineWidth = 2;
      [[-44, 0], [0, 0], [44, 0], [-22, -18], [22, -18]].forEach(([dx, dy]) => { K.rr(pile.x + dx - 20, gm.ground - 16 + dy, 40, 16, 3); g.fill(); g.stroke(); });
      g.restore();
    });
    const period = 2.2;
    for (let i = 0; i < 3; i++) {
      const ph = ((t - aAgents) / period + i / 3) % 1;
      const up = ph < 0.5;
      const e = K.ease.io(up ? ph * 2 : (ph - 0.5) * 2);
      const roofing = build > 0.69;
      const tx = roofing ? K.lerp(gm.eave.x0 + 60, gm.eave.x1 - 60, (i + 0.5) / 3) : K.lerp(B.x0 + 50, B.x1 - 50, (i + 0.5) / 3);
      const ty = (roofing ? gm.ridgeY : wallTop) - 60;
      const from = up ? pile : { x: tx, y: ty }, to = up ? { x: tx, y: ty } : pile;
      let cx = K.lerp(from.x, to.x, e), cy = K.lerp(from.y - 40, to.y, e) - Math.sin(e * Math.PI) * 70;
      cx = K.lerp(cx, rest[i].x, settle); cy = K.lerp(cy, rest[i].y, settle);
      M.crew(t, cx, cy, 56, { i, alpha: crewIn, carry: up && settle < 0.5 && t < aCheck - 4 ? 'brick' : null });
    }
  }

  // a crash is something a machine can check
  const mk = K.io(t, aCheck + 0.3, 0.5, 'out');
  if (mk > 0) M.chip('a crash is machine-checkable', HX, 418, 'machine', { k: mk, glow: 0.4 });

  // the owner's new job
  const dk = K.io(t, tDirect - 0.2, 0.5, 'out');
  if (dk > 0) M.label('direct · oversee', ox, gm.ground + 52, 'machine', { alpha: dk });
});
