// 01.06 scene 08: Servers and ports: one cook per hatch
// A server is a process waiting at a numbered hatch (a port); only one cook per hatch;
// numbers you'll often see; localhost = this machine; 27 hatches open at once on the course laptop.
SCENE('08', (t, S) => {
  const M = window.M, C = K.C;
  K.bg();

  // ---- beats (local seconds; word fallbacks from cues.json)
  const cHatch = S.cue('hatch', 0);
  const cOne = S.cue('one-per-hatch', 6.53);
  const cNum = S.cue('numbers', 9.65);
  const cLocal = S.cue('localhost', 28.11);
  const cList = S.cue('listeners', 31.01);
  const wNumbered = S.find('numbered', 0, 3.13);
  const wPort = S.find('port', 0, 4.81);
  const wOrders = S.find('orders', 0, 5.46);
  // the six numbers, each landing on its spoken word
  const wN = [
    S.find('three', 0, 11.7),
    S.find('fifty', 0, 14.52),
    S.find('eight', 0, 17.29),
    S.find(/^eighty/i, 0, 19.13),
    S.find('twelve', 0, 21.95),
    S.find('eleven', 0, 25.02),
  ];
  const wTwentySeven = S.find(/^twenty/i, 0, 32.34);
  const wLaptop = S.find('laptop', 0, 31.76);
  // the localhost line and the 27-strip clear out right as the crossfade begins,
  // so nothing ghosts through scene 09's terminal (gone before the 50% point)
  const OUT = (S.out != null ? S.out : 35.37);
  const exitK = 1 - K.io(t, OUT - 0.1, 0.3);

  // ---- geometry: the hatch wall raised to y 160 so owner labels clear the cooks' hats
  const geo = { y: 205, w: 210, h: 124, xs: M.L.hatches.xs };
  const HY = geo.y + geo.h / 2;
  const COOKY = 505, CS = 96;
  const PORTS = [
    { num: '3000', owner: 'Node' },
    { num: '5173', owner: 'Vite' },
    { num: '8000', owner: 'Python' },
    { num: '8188', owner: 'ComfyUI', ai: true },
    { num: '1234', owner: 'LM Studio', ai: true },
    { num: '11434', owner: 'Ollama', ai: true },
  ];

  const walkK = (a, d) => K.seg(t, a, a + 0.15) * (1 - K.seg(t, a + d - 0.15, a + d));

  // ---- when each hatch's cook arrives (hatch light comes on then)
  const arrive1 = cHatch + 0.9, arriveD1 = 1.4;          // cook 1 walks in from the left, waits at 3000
  const c2In = cOne + 0.1, c2InD = 0.9;                   // cook 2 tries 3000 too
  const c2Move = wN[1] + 0.15, c2MoveD = 0.8;            // ...and goes to 5173 when it is said
  const arrive = [
    arrive1 + arriveD1,
    c2Move + c2MoveD,
    wN[2] + 0.2 + 0.6, wN[3] + 0.2 + 0.6, wN[4] + 0.2 + 0.6, wN[5] + 0.2 + 0.6,
  ];
  // number plates: 3000 is "numbered" at the first beat; the rest fill in on their words
  const numAt = [wNumbered, wN[1], wN[2], wN[3], wN[4], wN[5]];
  const ownerAt = wN.slice();

  // ---- the back wall
  const wallK = K.io(t, cHatch + 0.05, 1.2);
  M.hatchWall(t, { geo, k: wallK, hatches: PORTS.map(() => ({ state: 'idle' })) });

  PORTS.forEach((p, i) => {
    const x = geo.xs[i];
    const openK = K.io(t, arrive[i] - 0.2, 0.5);
    if (openK > 0) M.hatch(t, x, HY, { w: geo.w, h: geo.h, state: 'open', alpha: openK, ai: p.ai,
      slips: i === 0 ? 3 : 0, slipK: i === 0 ? K.io(t, wOrders - 0.1, 0.8) * (1 - K.io(t, cNum - 0.2, 0.5)) : 0 });
    const nk = K.io(t, numAt[i], 0.45) * wallK;
    if (nk > 0) K.text(p.num, x, geo.y + 34, { font: 'mono', weight: 700, size: 30, color: K.mixColor(C.strong, C.head, openK), align: 'center', alpha: nk });
    const ok = K.io(t, ownerAt[i], 0.5);
    if (ok > 0) M.label(p.owner, x, geo.y + geo.h + 44, { color: C.strong, alpha: ok });
  });

  // ---- the cooks
  // cook 1: node.exe, PID 18412 (continuity), walks in and waits at hatch 3000
  {
    const k = K.io(t, arrive1, arriveD1);
    const x = K.lerp(150, geo.xs[0], k);
    const litK = K.io(t, arrive[0], 0.5) * (1 - K.io(t, cOne, 0.5));
    M.cook(t, x, COOKY, CS, { pid: '18412', name: 'node.exe', alpha: K.io(t, arrive1 - 0.3, 0.5),
      walking: walkK(arrive1, arriveD1), lit: litK });
  }
  // cook 2: approaches 3000, is stopped by the bar, then takes 5173
  {
    const kIn = K.io(t, c2In, c2InD), kMove = K.io(t, c2Move, c2MoveD);
    const x = K.lerp(K.lerp(720, 448, kIn), geo.xs[1], kMove);
    const stopped = K.io(t, c2In + c2InD - 0.15, 0.4) * (1 - K.io(t, c2Move - 0.1, 0.4));
    const r2 = M.cook(t, x, COOKY, CS, { alpha: K.io(t, c2In - 0.2, 0.4),
      walking: walkK(c2In, c2InD) + walkK(c2Move, c2MoveD), named: stopped, phase: 1.7 });
    if (stopped > 0) M.badge('cross', x + CS * 0.44, r2.y - CS * 0.44, 17, { color: C.accent, alpha: stopped });
    // the soft bar between the two cooks (one process per port)
    const barUp = K.io(t, c2In + c2InD - 0.15, 0.4), barA = 1 - K.io(t, c2Move - 0.1, 0.4);
    if (barUp > 0 && barA > 0) {
      const bx = 362, by0 = COOKY - 62, by1 = COOKY + 50;
      K.line(bx, by1, bx, K.lerp(by1, by0, barUp), { color: K.rgba(C.accent, 0.85), w: 10, alpha: barA });
    }
  }
  // cooks 3-6 rise into place under their hatches as each number is said
  for (let i = 2; i < 6; i++) {
    const a = wN[i] + 0.2, k = K.io(t, a, 0.6, 'out');
    if (k <= 0) continue;
    M.cook(t, geo.xs[i], COOKY + (1 - k) * 70, CS, { alpha: k, walking: walkK(a, 0.6), ai: PORTS[i].ai });
  }

  // ---- the bottom line: one message at a time at y 700
  const LY = 752;
  {
    const a1 = K.io(t, wPort, 0.5) * (1 - K.io(t, cOne - 0.1, 0.4));
    if (a1 > 0) K.spans([{ s: 'server', color: C.head }, { s: ' = process waiting at a ', color: C.strong }, { s: 'port', color: C.head }],
      960, LY, { size: 34, font: 'ui', weight: 600, align: 'center', alpha: a1 });
    const a2 = K.io(t, cOne + 0.3, 0.5) * (1 - K.io(t, cNum - 0.1, 0.4));
    if (a2 > 0) K.text('one process per port', 960, LY, { font: 'ui', weight: 600, size: 34, color: C.accent, align: 'center', alpha: a2 });
    // eyebrow introduces the hatch row from above it, left-aligned like other section eyebrows
    const a3 = K.io(t, cNum + 0.1, 0.5) * (1 - K.io(t, cLocal - 0.3, 0.4));
    if (a3 > 0) M.eyebrow("numbers you'll often see", 120, 152, { align: 'left', alpha: a3 });
    const a4 = K.io(t, cLocal + 0.1, 0.5) * exitK;
    if (a4 > 0) {
      const parts = [{ s: 'localhost', color: C.head, font: 'mono' }, { s: ' = this machine', color: C.strong }];
      const lw = K.spans(parts, 0, -999, { size: 34, font: 'ui', weight: 600, align: 'left', alpha: 0 });
      const mw = K.measure('more: 09.02 · 09.03', M.T.label);
      const x0 = 960 - (70 + lw + 56 + mw) / 2;
      K.icon('house', x0 + 24, LY - 12, 48, { color: C.head, w: 2.6, alpha: a4 });
      K.spans(parts,
        x0 + 70, LY, { size: 34, font: 'ui', weight: 600, align: 'left', alpha: a4 });
      K.text('more: 09.02 · 09.03', x0 + 70 + lw + 56, LY, { font: 'ui', weight: 400, size: 26, color: C.soft, align: 'left', alpha: K.io(t, cLocal + 0.8, 0.5) * exitK });
    }
  }

  // ---- 27 hatches open at once (course laptop observation)
  {
    const N = 27, pitch = 56, sy = 842;
    const bandK = K.io(t, cList + 0.1, 0.6) * exitK;
    if (bandK > 0) {
      const g = K.ctx(), full = (N - 1) * pitch + 46 + 40, w = full * bandK;
      g.save(); K.rr(960 - w / 2, sy - 30, w, 60, 14); g.fillStyle = K.rgba(M.P.wall, 0.85 * bandK); g.fill(); g.restore();
    }
    for (let i = 0; i < N; i++) {
      // fills across "laptop" (~0.8 s) so the full strip is lit as "twenty-seven" is said
      const k = K.io(t, wLaptop - 0.1 + i * 0.025, 0.3);
      if (k <= 0 || exitK <= 0) continue;
      M.hatch(t, 960 + (i - (N - 1) / 2) * pitch, sy, { small: true, state: 'open', k, alpha: exitK });
    }
    const lk = K.io(t, wTwentySeven, 0.4) * exitK;
    if (lk > 0) {
      const tw = K.spans([{ s: '27', color: C.head, font: 'mono' }, { s: ' open at once', color: C.strong }], 0, -999, { size: 30, font: 'ui', weight: 600, align: 'left', alpha: 0 });
      const ow = K.measure('course laptop · Oct 2026', M.T.label) + 44;
      const total = tw + 40 + ow, x0 = 960 - total / 2;
      K.spans([{ s: '27', color: C.head, font: 'mono' }, { s: ' open at once', color: C.strong }], x0, 904, { size: 30, font: 'ui', weight: 600, align: 'left', alpha: lk });
      M.obsTag(x0 + tw + 40, 904, { alpha: K.io(t, wTwentySeven + 0.2, 0.4) * exitK });
    }
  }
});
