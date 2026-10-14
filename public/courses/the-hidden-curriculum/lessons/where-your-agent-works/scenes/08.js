// 08 — The speaking tube: the terminal is the window, the shell reads each line; one real line in CMD and in
// Windows PowerShell 5.1; whatever goes down the tube runs as you.
SCENE('08', (t, S) => {
  const C = K.C, P = M.P;
  K.bg();

  // ---- cues
  const cShell = S.cue('shell', 4.95), cPs = S.cue('ps', 15.56), cSame = S.cue('same-line', 22.36);
  const cFails = S.cue('fails', 28.98), cYou = S.cue('as-you', 38.12);
  const tGuide = S.find("Anthropic's", 0, cShell + 4.7);
  const tPS = S.find('P', 0, cPs + 1.9, { whole: true }), tCMD = S.find('C', 0, cPs + 3, { whole: true });
  const tMac = S.find('Mac', 0, cPs + 5), tEcho = S.find('echo', 0, cSame + 1.2);
  const tMeaning = S.find('Same', 0, cFails + 5.9), tPerm = S.find('permissions', 0, cYou + 4.2);
  const tLoose = S.find('What', 0, cYou + 5.3, { whole: true });
  const tTwo = S.find('two', 0, cShell + 7.3), tPSw = S.find('PowerShell', 0, cShell + 8.1);
  const tCw = S.find('C', 0, cShell + 9, { whole: true });

  // ---- the house (small, a picture: labels hide below s 0.6); the workshop is the lit room
  const H = M.house(t, { x: 90, y: 205, s: 0.45, office: 0, rooms: { chat: 0.25, cowork: 0.25, code: 1 } });
  const bench = H.rooms.code.bench;
  const B = [bench[0], bench[1] - 14];

  // ---- windows
  // the one terminal (tube .. ps): compact until the two prompts arrive on "Windows has two", then full height
  const W1 = [720, 150, 1120, K.lerp(340, 560, K.io(t, tTwo - 0.45, 0.6))];
  const RC = [720, 140, 1120, 280];                 // Command Prompt
  const RP = [720, 500, 1120, 430];                 // Windows PowerShell
  const kSplit = K.io(t, cSame, 0.7);
  const kDemo = K.io(t, cSame + 0.55, 0.35);
  const kPsIn = K.io(t, cSame + 0.25, 0.7);
  const kYou = K.io(t, cYou, 0.7);

  // tube end: the left edge of whichever terminal is talking
  const yA = B[1], yC = RC[1] + 50 + (RC[3] - 50) / 2, yP = RP[1] + 50 + (RP[3] - 50) / 2;
  const kToPs = K.io(t, cFails - 0.2, 0.7);
  const Ey = K.lerp(K.lerp(yA, yC, kSplit), yP, kToPs);
  const E = [W1[0], Ey];
  const TX = 706;
  const pts = Math.abs(Ey - B[1]) < 2 ? [B, [TX, B[1]], [E[0], B[1]]] : [B, [TX, B[1]], [TX, Ey], E];

  // the speaking tube: a hollow pipe, with a mouthpiece at each end
  const kTube = K.io(t, 0.15, 1.3);
  if (kTube > 0) {
    K.path(pts, { k: kTube, head: false, tension: 0, w: 16, color: K.mixColor(P.wood, C.line2, 0.35) });
    K.path(pts, { k: kTube, head: false, tension: 0, w: 7, color: C.tile });
    K.layer(K.io(t, 0.15, 0.3), () => { K.glow(B[0], B[1], 30, C.head, 0.35); K.ring(B[0], B[1], 13, 13, 1, { color: C.head, w: 3, rot: 0 }); });
  }
  // a gold pulse travelling down the tube (a line being sent to the shell)
  const pulse = (t0) => {
    const k = K.seg(t, t0, t0 + 0.9);
    if (k <= 0 || k >= 1) return;
    const p = M.along(pts, K.ease.io(k));
    const a = Math.sin(Math.PI * k);
    K.glow(p[0], p[1], 34, C.head, 0.6 * a);
    K.layer(a, () => { const g = K.ctx(); g.save(); g.fillStyle = C.head; g.beginPath(); g.arc(p[0], p[1], 7, 0, Math.PI * 2); g.fill(); g.restore(); });
  };

  const cmdO = { size: 26, lh: 35, pad: 20 };
  const psO = { size: 26, lh: 35, pad: 20, only: [1] };   // just the && line: the version check is not narrated
  const ttC = K.termTimes('shells-cmd', cmdO), ttP = K.termTimes('shells-ps', psO);
  const c0 = ttC.items[0] || { start: 0.6, enter: 2.5, out: [{ at: 2.6 }] };
  const p1 = ttP.items[0] || { start: 4, enter: 6, out: [{ at: 6.7 }, { at: 6.7 }, { at: 6.7 }, { at: 6.7 }] };
  const offC = tEcho - c0.start;                    // CMD types the line as it is read out
  const offP = cFails - p1.start;                   // PowerShell types it on [[fails]]
  pulse(cShell - 0.15); pulse(offC + c0.enter - 0.75); pulse(offP + p1.enter - 0.75);

  // ---- phase A: one terminal window, the shell inside it
  if (kDemo < 1) {
    const r = [K.lerp(W1[0], RC[0], kSplit), K.lerp(W1[1], RC[1], kSplit), K.lerp(W1[2], RC[2], kSplit), K.lerp(W1[3], RC[3], kSplit)];
    const kWin = K.io(t, 0.45, 0.6);
    K.layer(kWin * (1 - kDemo), () => {
      K.win(r[0], r[1], r[2], r[3], { kind: 'terminal', title: 'Terminal', titleSize: 26, focus: true });
    });
    const kIn = kWin * (1 - K.io(t, cSame - 0.1, 0.45));
    K.layer(kIn, () => {
      // eyebrow: what the window is
      K.text('the terminal · just the window', W1[0] + W1[2] / 2, 250, { ...M.T.eyebrow, size: 26, color: C.head, align: 'center', alpha: K.io(t, 1.3, 0.6) });
      // the shell: the program at the tube's end
      const kS = K.io(t, cShell, 0.6, 'out');
      K.layer(kS, () => {
        K.glow(W1[0] + 85, yA, 60, C.head, 0.25);
        K.icon('program', W1[0] + 85, yA, 70, { color: C.head, w: 3 });
        K.text('the shell', W1[0] + 152, yA - 6, { font: 'ui', size: 34, weight: 700, color: C.strong });
        K.text('reads each line', W1[0] + 152, yA + 34, { font: 'ui', size: 28, weight: 600, color: C.soft });
      });
      // a line arrives down the tube, is typed into the window, and the shell takes it in and reads it
      const ln = 'echo hi', tTy = cShell + 0.75, cps = 11;
      const nT = K.clamp(Math.floor((t - tTy) * cps), 0, ln.length);
      const kMv = K.io(t, cShell + 2.0, 0.8);
      const kLn = K.io(t, tTy - 0.2, 0.3) * (1 - K.io(t, cShell + 2.55, 0.3));
      if (kLn > 0.002) {
        const lx0 = W1[0] + 640, sx = W1[0] + 85;
        const lx = K.lerp(lx0, sx, kMv), ly = yA - 70 * Math.sin(Math.PI * kMv), sc = K.lerp(1, 0.45, kMv);
        K.layer(kLn, () => K.at(lx, ly, sc, 0, () => {
          const tw = K.measure('> ' + ln, { font: 'mono', size: 30 });
          const w = tw + 70, h = 60;
          K.glow(0, 0, 70, C.head, 0.12 + 0.2 * kMv);
          K.card(-w / 2, -h / 2, w, h, { r: 14, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.4 + 0.6 * kMv) });
          const x0 = -w / 2 + 22;
          const xx = x0 + K.text('> ', x0, 10, { font: 'mono', size: 30, color: C.head });
          const xe = xx + K.text(ln.slice(0, nT), xx, 10, { font: 'mono', size: 30, color: C.strong });
          if (kMv <= 0 && (nT < ln.length || K.caretOn(t))) { const g = K.ctx(); g.save(); g.fillStyle = C.strong; g.fillRect(xe + 3, -14, 15, 28); g.restore(); }
        }));
      }
      // the shell lights as it reads the line
      const kRd = K.env(t, cShell + 2.6, cShell + 3.9, 0.35);
      if (kRd > 0) K.glow(W1[0] + 85, yA, 90, C.head, 0.45 * kRd * kS);
      // ...and answers with the line's output
      const kHi = K.io(t, cShell + 3.1, 0.4, 'out') * (1 - K.io(t, tTwo - 0.6, 0.4));
      if (kHi > 0.002) K.text('hi', W1[0] + 640, yA + 10, { font: 'mono', size: 30, color: C.body, align: 'center', alpha: kHi });
      // two prompts (and the Mac's shell)
      const chip = (s, x, y, a, o = {}) => {
        const w = K.measure(s, { font: 'mono', size: 30 }) + 44 + (o.ps ? 16 : 0);
        K.layer(a, () => {
          K.card(x, y - 30, w, 60, { r: 14, fill: C.panel, stroke: o.stroke || C.line2 });
          let xx = x + 22;
          if (o.ps) xx += K.text('PS', xx, y + 10, { font: 'mono', size: 30, color: C.head, weight: 600 }) + 16;
          K.text(o.ps ? s.slice(3) : s, xx, y + 10, { font: 'mono', size: 30, color: o.color || C.strong });
        });
        return w;
      };
      const yc = 545;
      const k1 = K.io(t, tPSw - 0.15, 0.5, 'out'), k2 = K.io(t, tCw - 0.15, 0.5, 'out');
      const w1 = chip('PS C:\\Users\\you>', W1[0] + 80, yc, k1, { ps: true });
      const x0 = W1[0] + 80, x2 = x0 + w1 + 60;
      const w2 = chip('C:\\Users\\you>', x2, yc, k2, { stroke: K.mixColor(C.line2, C.head, K.io(t, tCMD, 0.4) * 0.5) });
      K.text('PowerShell', x0 + w1 / 2, yc + 66, { font: 'ui', size: 26, weight: 600, color: C.body, align: 'center', alpha: k1 });
      K.text('CMD', x2 + w2 / 2, yc + 66, { font: 'ui', size: 26, weight: 600, color: C.body, align: 'center', alpha: k2 });
      const psW = K.measure('PS', { font: 'mono', size: 30 });
      K.ring(x0 + 22 + psW / 2, yc, psW / 2 + 14, 30, K.io(t, tPS - 0.05, 0.6), { color: C.head, w: 3.5, rot: 0 });
      // the Mac's default shell, quieter
      const kz = K.io(t, tMac - 0.1, 0.5, 'out');
      K.layer(kz * 0.85, () => M.pillL('zsh · macOS default', x0, yc + 125, { size: 26, font: 'mono', weight: 400, color: C.soft, fill: C.tile }));
    });
  }

  // ---- phase B: two real shells, the same line
  const kCmdA = kDemo * (1 - kYou) * (1 - 0.35 * K.io(t, cFails, 0.6));
  if (kCmdA > 0.002) {
    K.demo('shells-cmd', t - offC, RC, { ...cmdO, title: 'Command Prompt', alpha: kCmdA, focus: t < cFails });
    // both words printed: a small check
    const tOut = offC + (c0.out[c0.out.length - 1] || c0.out[0] || { at: c0.enter }).at;
    const kc = K.io(t, tOut + 0.25, 0.45, 'back');
    K.layer(kCmdA * K.clamp(kc), () => {
      K.at(RC[0] + RC[2] - 70, RC[1] + 50 + (RC[3] - 50) / 2, 0.6 + 0.4 * kc, 0, () => {
        K.glow(0, 0, 50, C.head, 0.3);
        K.icon('check', 0, 0, 58, { color: C.head, w: 4 });
      });
    });
  }
  const kPsA = kPsIn * (0.5 + 0.5 * K.io(t, cFails - 0.3, 0.6));
  if (kPsA > 0.002) {
    const errAt = (p1.out[3] || p1.out[0]).at;
    K.layer(1, () => {
      const dy = (1 - kPsIn) * 30;
      K.demo('shells-ps', t - offP, [RP[0], RP[1] + dy, RP[2], RP[3]], {
        ...psO, title: 'Windows PowerShell', alpha: kPsA, focus: t >= cFails, errColor: K.mixColor(C.accent, C.body, 0.15),
        marks: [{ at: errAt + 0.3, until: cYou + 0.2 - offP, match: 'not a valid statement separator' }],
      });
    });
    // the mark's label sits in the title bar row, so the whole error stays readable
    const kChip = K.io(t, offP + errAt + 0.55, 0.5, 'out') * (1 - K.io(t, cYou + 0.2, 0.45));
    if (kChip > 0.002) {
      const s = 'PowerShell, not CMD', w = K.measure(s, { font: 'ui', size: 26, weight: 700 }) + 42;
      K.layer(kChip * kPsA, () => K.pill(s, RP[0] + RP[2] - 190 - w / 2, RP[1] + 25, { size: 26, weight: 700, color: C.strong, fill: C.tile, stroke: C.head, glow: 0.2 }));
    }
  }

  // the line both shells were given, and what it means
  const kCap = K.env(t, tMeaning - 0.05, cYou, 0.5);
  if (kCap > 0) K.layer(kCap, () => {
    K.pill('same window · different shell · different meaning', RC[0] + RC[2] / 2, 460, { size: 28, color: C.strong, fill: C.tile, stroke: C.head, glow: 0.2 });
  });

  // ---- source cards (left column, under the house)
  const cardX = 80, cardW = 614;
  const guideO = { eyebrow: 'Anthropic · Claude Code terminal guide · read 2026-10-14', body: 'Windows has two command-line programs: PowerShell and CMD.', quote: true, footer: true };
  const kG = K.env(t, tGuide - 0.1, cSame + 0.2, 0.5);
  if (kG > 0) {
    const h = M.dated(cardX, 0, cardW, { ...guideO, measure: true });
    K.rise(t, tGuide - 0.1, () => M.dated(cardX, 930 - h, cardW, { ...guideO, alpha: kG }));
  }
  const quickO = { eyebrow: 'Anthropic · Claude Code quickstart · read 2026-10-14', body: "If you see ‘The token '&&' is not a valid statement separator’, you're in PowerShell, not CMD", quote: true, footer: true };
  const kQ = K.env(t, cFails + 0.3, cYou, 0.5);
  if (kQ > 0) {
    const h = M.dated(cardX, 0, cardW, { ...quickO, measure: true });
    K.rise(t, cFails + 0.3, () => M.dated(cardX, 930 - h, cardW, { ...quickO, alpha: kQ }));
  }

  // ---- phase C: it runs as you
  if (kYou > 0) {
    // the key ring travels down the tube to the shell
    const kK = K.io(t, cYou + 0.35, 1.3);
    const kPts = [B, [TX, B[1]], [TX, Ey]];
    const kp0 = M.along(kPts, kK), kSide = K.io(t, cYou + 1.45, 0.4);
    const kp = [kp0[0] - 52 * kSide, kp0[1]], rest = [TX - 52, Ey];
    const kA = K.io(t, cYou + 0.25, 0.4);
    // faint arrows: from the shell to every shelf you can reach
    const names = ['Documents', 'Projects', 'Photos', 'Finances'];
    names.forEach((n, i) => {
      const f = H.folders[n]; if (!f) return;
      const ka = K.stagger(t, tPerm - 0.9, i, 0.14, 0.7);
      if (ka <= 0) return;
      K.arrow(rest[0] - 8, rest[1] - 34, f.x, f.y + 26, { k: ka, bend: -0.12, w: 2.5, dash: [8, 8],
        color: K.rgba(n === 'Finances' ? C.accent : C.head, 0.6) });
    });
    K.layer(kA, () => {
      K.glow(kp[0], kp[1], 46, C.head, 0.4);
      K.card(kp[0] - 30, kp[1] - 30, 60, 60, { r: 30, fill: C.tile, stroke: C.head });
      K.icon('key', kp[0], kp[1], 38, { color: C.head, w: 3 });
      K.card(kp[0] - 48, kp[1] - 46, 34, 34, { r: 17, fill: C.panel, stroke: C.head, shadow: false });
      K.icon('person', kp[0] - 31, kp[1] - 29, 22, { color: C.strong, w: 2.4 });
    });
    const kL = K.io(t, S.find('runs', 0, cYou + 2.1) - 0.1, 0.5, 'out');
    K.layer(kL, () => {
      K.text('runs as you', 400, 800, { font: 'ui', size: 34, weight: 700, color: C.strong, align: 'center' });
      K.text('with your permissions', 400, 842, { font: 'ui', size: 28, weight: 600, color: C.soft, align: 'center', alpha: K.io(t, tPerm - 0.2, 0.5) });
    });
    // the source, in its own words, where the CMD window was
    const anyO = { eyebrow: 'Anthropic · How Claude Code works · read 2026-10-14', body: 'Any command you could run: build tools, git, package managers, system utilities, scripts.', quote: true, footer: true };
    const kAny = K.io(t, tPerm - 0.3, 0.6);
    if (kAny > 0) K.rise(t, tPerm - 0.3, () => M.dated(RC[0], 150, RC[2], { ...anyO, alpha: kAny }));
    M.pointer('the lesson on letting it loose', RC[0], 460, { alpha: K.io(t, tLoose, 0.5) });
  }
});
