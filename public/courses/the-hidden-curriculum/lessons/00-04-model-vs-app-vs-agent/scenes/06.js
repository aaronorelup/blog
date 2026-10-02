/* 00.04 scene 06 — Where the picture breaks.
   The car from 05, hood lifted, body at 0.55 so the engine reads. Three true mechanisms under the metaphor:
   [[cold]]     on "doesn't" the gears stop (pill 'stopped'). With every message the app sends the WHOLE chat back in:
                three round trips, each a new bubble -> a 30 px 'whole chat' chip on a solid terracotta arrow into the
                engine -> gears spin ('thinking') -> reply bubble -> stopped again; a counter 'message N: fresh start'.
                On "memory lives in the car" a ring round the stack (the memory is in the car's window, not the engine).
   [[bench]]    a program reaches the same model on a test bench through an API, with a key (dashed link + 'same model'
                from the car's engine); no chat window, no saved chats.
   [[driver]]   the bench fades to 0.2; the car's engine relights. No separate driver: the wheel fades to an outline,
                a '?' sits in the seat; the engine only writes text, and some of it is a command (run chip out of the
                engine's output port, up through the open hood).
   [[app-runs]] the app runs it: the chip parks right of the rack in one row with a lock and "allowed" (you glow);
                an arrow hands it to the rack's terminal, which lights. */
SCENE('06', (t, S) => {
  K.bg();
  const C = K.C, io = K.io, clamp = K.clamp, lerp = K.lerp;
  const P = M.layout.breaks, X = P.x, Y = P.y, s = P.s;
  const CAR = M.CAR;
  const W = (p) => ({ x: X + p[0] * s, y: Y + p[1] * s });   // car-local -> world

  // ---------------------------------------------------------------- timing (cues + spoken words)
  const tBench = S.cue('bench', 13.6), tDriver = S.cue('driver', 25.64), tRuns = S.cue('app-runs', 32.8);
  const tHood = 0.45;                                      // "Here's where the picture breaks": the hood lifts
  const tStop = S.find(/^doesn/, 0, 4.6);                  // "A model doesn't."
  const tMsg = S.find('message', 0, 5.99);                 // "With every message"
  const tReread = S.find('rereads', 0, 7.38);
  const tMemory = S.find('memory', 0, 10.81);
  const tCarW = S.find(/^car/, 0, 11.74);                  // "lives in the car"
  const tReach = S.find('reach', 0, 15.34);
  const tAPI = S.find(/^API/, 0, 16.57);
  const tKey = S.find(/^key/, 0, 18.03);
  const tTest = S.find('test', 0, 20.1);
  const tChatW = S.find('chat', 0, 21.33);
  const tSaved = S.find('saved', 0, 22.54);
  const tSep = S.find('separate', 0, 26.34);
  const tEng = S.find('still', 0, 28.0) - 0.35;            // "The engine still only makes text"
  const tRun = S.find(/^run$/, 0, 31.34);                  // "says: run this command"
  const tAllowed = S.find(/^allowed/, 0, 35.63);

  // three round trips: a new bubble (Bi) -> the whole chat departs (Di) -> arrives (Ai) -> reply -> stopped again
  const D1 = tReread - 0.25, GAP = 1.4;
  const ROUNDS = [0, 1, 2].map((i) => {
    const D = D1 + i * GAP, A = D + 0.6;
    return { B: i === 0 ? tMsg : D - 0.45, D, A, reply: A + 0.45, cold: A + 0.6 };
  });

  // ---------------------------------------------------------------- shared states
  const carA = 1 - 0.5 * io(t, tBench, 0.6) + 0.5 * io(t, tDriver, 0.5);
  const hood = io(t, tHood, M.motion.move);
  const busy = M.motion.busy;
  const keys = [{ at: tStop, rate: 0, d: 0.5 }];
  ROUNDS.forEach((r) => { keys.push({ at: r.A - 0.05, rate: busy, d: 0.15 }, { at: r.cold - 0.1, rate: 0, d: 0.3 }); });
  keys.push({ at: tDriver, rate: M.motion.turn, d: 0.4 }, { at: tEng, rate: busy, d: 0.3 }, { at: tRun + 0.4, rate: M.motion.turn, d: 0.5 });
  const turn = M.spin(t, keys);
  const pulse = (a, b) => io(t, a, 0.2) * (1 - io(t, b, 0.25));
  const roundLit = Math.max(...ROUNDS.map((r) => pulse(r.A - 0.1, r.cold)));
  const lit = Math.max(1 - io(t, tStop, 0.5), roundLit, io(t, tDriver, 0.5));
  const engGlow = 0.35 * roundLit + 0.7 * io(t, tEng, 0.4) * (1 - io(t, tRun + 0.4, 0.5));

  const slot = M.slot(X, Y, s);
  const inPort = M.ept(slot.x, slot.y, slot.s, 'in'), outPort = M.ept(slot.x, slot.y, slot.s, 'out');

  // ---------------------------------------------------------------- the car (the same drawing; interior drawn below at full strength)
  M.car(t, X, Y, s, {
    alpha: carA, bodyA: 0.55, hood, chat: 0, wheel: 0, passenger: 0,
    engine: { turn, lit, glow: engGlow },
  });
  // roof rack (the agent's tools), quiet until the app runs the command
  const rackA = 0.5 + 0.5 * io(t, tRuns, 0.5);
  K.layer(carA * rackA, () => M.rack(t, X + CAR.rack[0] * s, Y + CAR.rack[1] * s, s, { posts: true, labels: 0, tools: 1 }));
  const term = M.rackPt(X, Y, s, 1);
  const tLand = tAllowed + 0.55;                      // the hand-off arrow reaches the terminal
  K.layer(carA * io(t, tLand - 0.15, 0.4), () => M.drawTool('terminal', term.x, term.y, term.s, true));

  // ---------------------------------------------------------------- the window: conversation stack (memory lives in the car)
  const cr = { x: X + CAR.glass.x * s, y: Y + (CAR.glass.y + 50) * s, w: CAR.glass.w * s, h: (CAR.glass.h - 50) * s };
  const stackL = cr.x + 12, stackR = cr.x + 190, pitch = 19, barH = 13;
  const LINES = [{ you: 1, w: 96 }, { you: 0, w: 150 }, { you: 1, w: 76 }, { you: 0, w: 132 }];
  const YW = [108, 86, 100], AW = [156, 124, 140];
  ROUNDS.forEach((r, i) => { LINES.push({ you: 1, w: YW[i], at: r.B }, { you: 0, w: AW[i], at: r.reply }); });
  const appear = (L) => (L.at == null ? 1 : io(t, L.at, 0.3));
  const top = LINES.reduce((a, L) => a + (L.at == null ? 0 : appear(L)), 0);
  // the stack fades in as 05's passenger leaves (they share the window), and goes when the driver beat starts
  const stackA = carA * io(t, 0.15, 0.6) * (1 - io(t, tDriver, 0.5));
  const bar = (x, y, w, you, a) => {
    const g = K.ctx(); g.save(); g.globalAlpha *= a;
    g.fillStyle = you ? K.rgba(C.head, 0.5) : K.rgba(C.strong, 0.3);
    K.rr(x, y, w, barH, barH / 2); g.fill(); g.restore();
  };
  K.layer(stackA, () => {
    const g = K.ctx(); g.save(); K.rr(cr.x + 4, cr.y + 2, 206, cr.h - 4, 8); g.clip();
    LINES.forEach((L, i) => {
      const a = appear(L); if (a <= 0) return;
      const pos = i - top, al = a * clamp(pos + 1);
      if (al <= 0) return;
      const y = cr.y + 10 + pos * pitch;
      bar(L.you ? stackR - L.w : stackL, y, L.w, L.you, al);
    });
    g.restore();
  });
  const stackC = { x: (stackL + stackR) / 2, y: cr.y + 10 + 1.5 * pitch + barH / 2 };

  // "the memory lives in the car": a ring round the stack, and a callout
  const memA = carA * (1 - io(t, tBench, 0.4));
  K.layer(memA, () => {
    K.ring(stackC.x, stackC.y + 2, 118, 50, io(t, tMemory, 0.6), { color: C.strong, w: 3.5, rot: 0 });
    M.callout('memory lives in the car', stackC.x - 118, stackC.y, 265, 345, { k: io(t, tCarW - 0.45, 0.7) });
  });

  // ---------------------------------------------------------------- the interior: driver's seat + wheel, '?' and you
  const outl = io(t, tSep, 0.5);                       // the wheel fades to an outline: no separate driver
  // you: 05 ends with you lit in the back seat; you leave over the crossfade (the chat stack needs the window),
  // come back dim when the app runs the command, and glow on "allowed"
  const pOut = 1 - io(t, 0.1, 0.6);
  const pK = Math.max(pOut, 0.5 * io(t, tRuns, 0.5) + 0.5 * io(t, tAllowed, 0.5));
  const youGlow = Math.max(0.6 * (1 - io(t, 0, 0.5)), io(t, tAllowed, 0.5));
  K.layer(carA, () => {
    const sd = W(CAR.seat), st = W(CAR.steer), ps = W(CAR.pseat), pp = W(CAR.passenger);
    M.seat(sd.x, sd.y, 66 * s, { alpha: 0.9 });
    M.steer(st.x, st.y, 28 * s, { color: K.mixColor(C.head, C.soft, outl), w: lerp(4.5, 2, outl) * s });
    const q = io(t, tSep + 0.15, 0.4) * (1 - io(t, tSep + 2.6, 0.6));
    if (q > 0) K.layer(q, () => {
      const g = K.ctx(), qx = sd.x + 2 * s, qy = sd.y - 6 * s;
      g.save(); g.fillStyle = C.code; g.strokeStyle = K.rgba(C.accent, 0.6); g.lineWidth = 1.5;
      g.beginPath(); g.arc(qx, qy, 25 * s, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
      K.icon('question', qx, qy, 40 * s, { color: C.accent, w: 3 });
    });
    if (pK > 0.002) {
      M.seat(ps.x, ps.y, 66 * s, { alpha: 0.9 * pK });
      K.layer(pK, () => M.person(pp.x, pp.y + (1 - pK) * 8, 56 * s, { glow: youGlow }));
    }
  });

  // ---------------------------------------------------------------- the round trips: the whole chat goes back in, every time
  const sx0 = stackR - 14, sy0 = cr.y + cr.h + 2;   // leaves from the window's lower edge, under the seat
  ROUNDS.forEach((r) => {
    const aA = io(t, r.D - 0.4, 0.3) * (1 - io(t, r.A + 0.3, 0.35));
    if (aA > 0.002) K.arrow(sx0, sy0, inPort.x - 6, inPort.y, { k: io(t, r.D - 0.4, 0.4), color: C.accent, w: 3, alpha: 0.95 * aA * carA, headSize: 14 });
    const u = clamp((t - r.D) / 0.6);
    if (u > 0 && u < 1) {
      const e = K.ease.io(u), x = lerp(stackC.x, inPort.x - 10, e), y = lerp(stackC.y, inPort.y, e);
      const sc = lerp(1, 0.55, clamp((e - 0.55) / 0.45));
      const a = Math.min(1, u / 0.12, (1 - u) / 0.2);
      K.at(x, y, sc, 0, () => M.chip('whole chat', 0, 0, { kind: 'in', size: 30, alpha: a * carA }));
    }
  });

  // engine status: 'stopped' (held through "starts cold"), 'thinking' while a message is being read; and the counter
  const statusA = io(t, tStop, 0.4) * (1 - io(t, tBench - 0.5, 0.4));
  if (statusA > 0.002) {
    const ax = outPort.x + 4, ay = outPort.y + 20, PX = 1450, PY = 632;
    K.layer(statusA, () => {
      const lk = io(t, tStop, 0.35);
      const g = K.ctx(); g.save(); g.fillStyle = C.soft; g.beginPath(); g.arc(ax, ay, 5, 0, Math.PI * 2); g.fill(); g.restore();
      K.line(ax, ay, PX - 60, PY, { color: C.line2, w: 1.5, k: lk });
      const pk = io(t, tStop + 0.15, 0.35);
      if (1 - roundLit > 0.01) K.pill('stopped', PX, PY, { size: 26, stroke: C.soft, color: C.strong, fill: C.tile, alpha: pk * (1 - roundLit) });
      if (roundLit > 0.01) M.tag('model', PX, PY, { text: 'thinking', alpha: roundLit, glow: 0.3 * roundLit });
      ROUNDS.forEach((r, i) => {
        const next = ROUNDS[i + 1];
        const a = io(t, r.B, 0.3) * (next ? 1 - io(t, next.B - 0.15, 0.25) : 1);
        if (a > 0.01) K.layer(a, () => K.at(0, (1 - io(t, r.B, 0.3)) * 10, 1, 0, () =>
          K.pill(`message ${i + 1}: fresh start`, PX, PY + 72, { size: 26, stroke: K.rgba(C.accent, 0.8), color: C.strong, fill: C.tile })));
      });
    });
  }

  // ---------------------------------------------------------------- the test bench: a program reaches the same engine through an API, with a key
  const bShow = io(t, tBench, 0.6), bA = bShow * (1 - 0.8 * io(t, tDriver, 0.5));
  const BX = 1630, BY = 640;
  if (bA > 0) {
    // the same model: a faint dashed link from the car's engine to the bench engine
    const bin = M.ept(BX, BY, 1, 'in');
    const lkK = io(t, tReach - 0.2, 0.6);
    K.line(outPort.x + 4, outPort.y + 14, bin.x - 6, bin.y + 6, { color: C.gold, w: 2, dash: [8, 9], k: lkK, alpha: 0.75 * bA });
    K.layer(bA * io(t, tReach + 0.3, 0.4), () => M.tag('model', 1375, 694, { text: 'same model' }));
    K.layer(bA, () => K.at(0, (1 - bShow) * 20, 1, 0, () => {
      const bturn = M.spin(t, [{ at: tReach, rate: busy, d: 0.25 }, { at: tReach + 0.9, rate: M.motion.turn, d: 0.4 }]);
      const glow = io(t, tTest, 0.5) * (1 - io(t, tTest + 1.0, 0.6));
      M.engine(t, BX, BY, 1, { stand: 1, turn: bturn, glow: 0.7 * glow });
      // program.py (w 400: the title needs ~210 px beside it for the window buttons)
      K.layer(io(t, tBench + 0.3, 0.5), () => {
        const wr = K.win(1430, 230, 400, 150, { kind: 'code', title: 'program.py', titleSize: 26 });
        const g = K.ctx(); g.save();
        [[0, 210, C.head], [1, 150, C.strong], [2, 250, C.strong]].forEach(([i, w, c]) => {
          g.fillStyle = K.rgba(c, i === 0 ? 0.35 : 0.2); K.rr(wr.x + 28 + (i ? 30 : 0), wr.y + 18 + i * 26, w, 12, 6); g.fill();
        });
        g.restore();
      });
      const top = M.ept(BX, BY, 1, 'top');
      K.arrow(BX, 384, top.x, top.y - 8, { k: io(t, tReach - 0.55, 0.6), color: C.soft, w: 3 });
      const keyK = io(t, tKey, 0.4, 'out');
      if (keyK > 0) K.layer(keyK, () => {
        const g = K.ctx(); g.save(); g.fillStyle = C.page; g.strokeStyle = C.line2; g.lineWidth = 1.5;
        g.beginPath(); g.arc(BX, 468, 30, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
        K.icon('key', BX, 468, 44 * (0.85 + 0.15 * keyK), { color: C.head });
      });
      K.text('API', BX + 46, 478 + 9, { font: 'mono', size: 26, weight: 600, color: C.strong, alpha: io(t, tAPI, 0.4) });
    }));
    // what the bench does not have
    M.ghost('chat window', BX, 792, { k: io(t, tChatW - 0.2, 0.4), cross: io(t, tChatW + 0.15, 0.5), alpha: 0.55 * bA });
    M.ghost('saved chats', BX, 860, { k: io(t, tSaved - 0.1, 0.4), cross: io(t, tSaved + 0.25, 0.5), alpha: 0.55 * bA });
  }

  // ---------------------------------------------------------------- the engine only writes text; the app runs it
  const engTagA = 1 - io(t, tRuns - 0.1, 0.4);
  if (engTagA > 0.002) K.layer(engTagA, () => K.rise(t, tEng, () => M.tag('model', 1040, 365, { text: 'engine: writes text' })));

  // the run chip: grows out of the engine's output port, up through the open hood, then parks in clear space right
  // of the rack. Command -> lock -> 'allowed' read as ONE row; on "allowed" a terracotta arrow hands it to the
  // rack's terminal tile, which lights. The chip stays parked (calm last frame).
  const cmd = 'run: npm test', chipO = { kind: 'cmd', size: 26 };
  const chipW = K.measure(cmd, { font: 'mono', weight: 600, size: 26 }) + 26 * 1.1;
  const RY = 212, chipL = 966;                                   // row height; chip left edge (rack bar ends ~955)
  const C1 = { x: 1112, y: 462 }, WT = { x: chipL + chipW / 2, y: RY };
  const LOCK = { x: chipL + chipW + 8 + 22, y: RY };              // hard against the chip's right end
  const allowW = K.measure('allowed', { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
  const AL = { x: LOCK.x + 22 + 8 + allowW / 2, y: RY };          // hard against the lock
  const ride1 = clamp((t - (tRun - 0.1)) / 0.6);
  const move2 = io(t, tRuns + 0.2, 0.7);
  // the lock (the app's permission gate) and "allowed"
  const lockA = io(t, tRuns + 0.6, 0.4);
  if (lockA > 0) {
    K.layer(lockA, () => {
      const g = K.ctx(); g.save(); g.fillStyle = C.tile; g.strokeStyle = K.mixColor(C.line2, C.gold, youGlow); g.lineWidth = 1.5;
      g.beginPath(); g.arc(LOCK.x, LOCK.y, 22, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
      K.icon('lock', LOCK.x, LOCK.y, 30, { color: K.mixColor(C.soft, C.head, youGlow) });
    });
    const ak = K.io(t, tAllowed, 0.5, 'back');
    if (ak > 0) K.layer(Math.min(1, ak), () => K.at(AL.x, AL.y, 0.7 + 0.3 * ak, 0, () =>
      K.pill('allowed', 0, 0, { size: 26, stroke: C.gold, color: C.head, fill: C.tile, glow: 0.4 })));
  }
  if (ride1 > 0) {
    const e = K.ease.out(ride1);
    let x = lerp(outPort.x, C1.x, e), y = lerp(outPort.y, C1.y, e);
    x = lerp(x, WT.x, move2); y = lerp(y, WT.y, move2);
    K.at(x, y, lerp(0.45, 1, e), 0, () => M.chip(cmd, 0, 0, { ...chipO, alpha: Math.min(1, ride1 / 0.25), glow: 0.3 * io(t, tAllowed + 0.2, 0.4) }));
  }
  // handed to the terminal: a terracotta arrow arching over the </> tile into the terminal tile
  const hand = io(t, tAllowed + 0.15, 0.5);
  if (hand > 0) K.arrow(chipL - 8, RY + 4, term.x + 26, term.y - 54, { k: hand, bend: 34, color: C.accent, w: 3, headSize: 14 });
  K.rise(t, tRuns + 0.1, () => M.tag('app', W([-160, 0]).x, Y - 2 * s, { text: 'app: runs it' }));

  // ---------------------------------------------------------------- eyebrow (same height as 05's)
  K.eyebrow('Where the picture breaks', 960, 160, { align: 'center', alpha: io(t, -0.3, 0.6) });
});
