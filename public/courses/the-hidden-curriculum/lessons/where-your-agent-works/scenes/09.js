/* 09 — What you'll meet at the tube
   Continues 08's frame: your house small at the left (x 90, y 205, s 0.45, labels hidden, as 08 leaves it), the speaking tube from the workshop
   bench to a terminal window at x 600-1840, y 180-560; notes and source cards below it (y 600-930).
   - [[not-recognized]] the drawn terminal types `claude` and prints CMD's "not recognized" lines (terracotta: a
     failed command). "usually" -> S206 card (the PATH sentence); "PATH" -> "PATH itself" + pointer to the lesson on
     keys; "new terminal window" -> chip; the claude.exe caveat (S207) as a quiet chip. "Recognise" -> the error lines
     boxed, "you: recognise it". "slash doctor" -> S101 card + a sparkle chip "the agent: checks and fixes its own
     setup" (you recognise, the agent fixes).
   - [[their-shell]] the window splits: the tube's end becomes the agent's Git Bash, a second window is yours,
     Windows PowerShell. The same && line as 08 runs in the agent's window; on "copied" a chip lifts from it and
     flies to yours, and on "fail" yours prints the real 5.1 error and a terracotta warning chip. S206 card.
   - [[skip]] your window gives way to the Claude desktop app; a gold door path runs from it under the terminal
     straight into the workshop, bypassing the tube; inside, a small terminal pane blinks: "still runs commands".
     S207 card "skip the terminal entirely".
   - [[deep]] the S207 card gives way to the MIT Missing Semester card (cap icon): 2026-01-12 Shell,
     2026-01-13 Command-line Environment; "two days" underlined.
   Exit: terminal (the tube's end) and the desktop app with its door, side by side; MIT card. No 'back' overshoot. */
SCENE('09', (t, S) => {
  const C = K.C;
  K.bg();

  // ---- times (local), every beat on its cue or spoken word
  const cNR = S.cue('not-recognized', 0), cShell = S.cue('their-shell', 18.4), cSkip = S.cue('skip', 25.02), cDeep = S.cue('deep', 32.03);
  const wClaude = S.find(/^claude$/i, 0, 1.42), wNot = S.find(/^not$/i, 0, 1.9), wUsually = S.find(/^usually$/i, 0, 3.75);
  const wPath = S.find(/^path$/i, 0, 6.11), wNew = S.find(/^new$/i, 0, 8.63), wRecog = S.find(/^recognise/i, 0, 10.47);
  const wSlash = S.find(/^slash$/i, 0, 14.28);
  const wGit = S.find(/^git$/i, 0, 20.7), wPS = S.find(/^powershell/i, 0, 21.98), wCopied = S.find(/^copied$/i, 0, 22.04);
  const wFail = S.find(/^fail$/i, 0, 23.63);
  const wDesktop = S.find(/^desktop$/i, 0, 28.84), wRuns = S.find(/^runs$/i, 1, 29.98);
  const wMIT = S.find(/^(m|mit|mit's)$/i, 0, 33.09), wTwo = S.find(/^two$/i, 0, 36.33);

  // ---- your house, small (labels hide below s 0.6: here it is a picture)
  const H = M.house(t, { x: 90, y: 205, s: 0.45, rooms: { chat: 0.5, cowork: 0.5, code: 0.95 } });
  const bench = H.rooms.code.bench, door = H.rooms.code.door;

  // ---- layout states
  const split = K.io(t, cShell, 0.7);                 // one window -> agent's + yours
  const termW = K.lerp(1240, 460, split);
  const term = [600, 180, termW, 380];
  // your window: wide and tall enough that the real Windows PowerShell 5.1 parser error fits without scrolling
  const YR = [1080, 130, 760, 470];

  // ---- the speaking tube: bench -> the terminal's left edge
  const tubePts = [[bench[0] + 40, bench[1] - 12], [548, bench[1] - 16], [604, bench[1] - 22]];
  K.path(tubePts, { head: false, w: 14, color: K.mixColor(C.line2, C.head, 0.32), tension: 0.5 });
  K.path(tubePts, { head: false, w: 5, color: K.mixColor(C.page, C.tile, 0.5), tension: 0.5 });
  K.glow(604, bench[1] - 22, 40, C.head, 0.18);

  // ---- the door from the desktop app straight into the workshop (drawn under the windows)
  const dWin = [1080, 180, 760, 380];
  const doorK = K.io(t, wDesktop - 0.2, 1.2);
  if (doorK > 0) {
    const dp = [[dWin[0] + 120, dWin[1] + dWin[3] - 6], [dWin[0] + 60, 612], [700, 616], [door[0] + 60, door[1] + 70], [door[0] + 6, door[1] + 14]];
    K.path(dp, { k: doorK, color: C.head, w: 5, headSize: 18, tension: 0.4 });
    K.glow(door[0], door[1], 46, C.head, 0.35 * doorK);
  }

  // =========================================================== the tube's end window
  const winTitle = split < 0.5 ? 'Command Prompt' : 'the agent’s Git Bash';
  const titleA = split < 0.5 ? 1 - K.clamp(split * 2.4) : K.clamp((split - 0.5) * 2.4);
  const cr = K.win(term[0], term[1], term[2], term[3], { kind: 'terminal', title: '', titleSize: 26 });
  K.text(winTitle, term[0] + 56, term[1] + 34, { size: 26, color: C.body, weight: 600, alpha: titleA });

  // beat 1: claude is not recognized (CMD's real wording, drawn)
  const e1 = '\'claude\' is not recognized as an internal or external command,', e2 = 'operable program or batch file.';
  const tType = Math.min(wClaude - 0.9, 0.5), tErr = wNot;
  const a1 = 1 - K.clamp(split * 3);
  if (a1 > 0) K.layer(a1, () => K.term(cr, t, [
    { at: tType, cmd: 'claude', cps: 12 },
    { at: tErr, out: e1, color: C.accent },
    { at: tErr + 0.05, out: e2, color: C.accent },
    { at: tErr + 0.1, out: '' },
    { at: tErr + 0.45, cmd: '' },
  ], { size: 28, prompt: 'C:\\Users\\you>' }));
  // "Recognise it": the error lines boxed, the human's part
  const recK = K.io(t, wRecog - 0.1, 0.7) * a1;
  if (recK > 0) {
    const ew = K.measure(e1, { font: 'mono', size: 28 });
    M.outline(cr.x + 14, cr.y + 28 + 42 - 4, ew + 30, 92, 12, recK, { color: C.head, w: 3 });
    M.pillL('you: recognise it', cr.x + cr.w - 24, cr.y + 28 + 28 + 4 * 42 - 9, { align: 'right', size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: recK });
  }

  // beat 2: the agent's shell runs the && line
  const a2 = K.clamp((split - 0.55) / 0.45);
  const tAg = cShell + 0.9;
  if (a2 > 0) K.layer(a2, () => K.term(cr, t, [
    { at: tAg, cmd: 'echo first && echo second', cps: 20 },
    { at: tAg + 1.6, out: 'first' },
    { at: tAg + 1.65, out: 'second' },
    { at: tAg + 2.0, cmd: '' },
  ], { size: 26, prompt: '$ ', idle: true }));

  // =========================================================== your window (PowerShell), then the desktop app
  // the copied line is pasted (fast), and Windows PowerShell 5.1 answers with its real parser error
  // (the 'shells-ps' capture from the shells section), landing just before "fail" and holding ~1.8 s before
  // the desktop app takes its place
  const swapK = K.io(t, cSkip + 0.25, 0.6);
  const yoursA = K.clamp((split - 0.6) / 0.4) * (1 - swapK);
  const psO = { size: 26, lh: 35, pad: 12, only: [1], cps: 80, think: 0.15, speed: 2, idle: false };
  const p1 = K.termTimes('shells-ps', psO).items[0] || { start: 0.6, enter: 1.1, out: [{ at: 1.4 }, { at: 1.4 }, { at: 1.4 }, { at: 1.4 }] };
  const errAt = (p1.out[3] || p1.out[0]).at;
  const offP = Math.max(wCopied + 0.45 - p1.start, wFail - 0.25 - errAt);   // pasted as the chip lands
  if (yoursA > 0) {
    const yx = K.lerp(1300, YR[0], K.ease.out(split));
    K.demo('shells-ps', t - offP, [yx, YR[1], YR[2], YR[3]], {
      ...psO, title: 'Windows PowerShell 5.1 · yours', alpha: yoursA, focus: t >= offP + errAt,
      errColor: K.mixColor(C.accent, C.body, 0.15),
      marks: [{ at: errAt + 0.2, until: cSkip + 0.3 - offP, match: /is not a valid/ }],
    });
    const warnK = K.io(t, offP + errAt + 0.3, 0.5) * yoursA;
    if (warnK > 0) M.pillL('fails in yours', yx + YR[2] - 24, YR[1] + 25, { align: 'right', size: 26, icon: 'warning', iconColor: C.accent, color: C.accent, fill: C.tile, stroke: C.accent, alpha: warnK });
  }
  // the copied command flies from the agent's trail to your window
  const fly = K.seg(t, wCopied - 0.35, wCopied + 0.45);
  if (fly > 0 && fly < 1) {
    const fe = K.ease.io(fly);
    const sx = cr.x + 28 + K.measure('$ ', { font: 'mono', size: 26 }), sy = cr.y + 28 + 26;
    const ex = YR[0] + 12 + K.measure('PS C:\\Users\\you\\demo> ', { font: 'mono', size: 26 }), ey = YR[1] + 50 + 12 + 22;
    const p = M.along([[sx, sy - 9], [K.lerp(sx, ex, 0.5), 150], [ex, ey - 9]], fe);
    const fa = K.clamp(fly * 6) * K.clamp((1 - fly) * 6);
    M.pillL('echo first && echo second', p[0], p[1], { size: 26, font: 'mono', weight: 400, color: C.page, fill: C.head, stroke: C.head, alpha: fa });
  }

  // desktop app window
  const dA = swapK;
  if (dA > 0) {
    const dr = K.win(dWin[0], dWin[1], dWin[2], dWin[3], { kind: 'code', title: 'Claude desktop app · Code', titleSize: 26, alpha: dA, focus: true });
    K.layer(dA, () => {
      K.iconTile('sparkle', dr.x + 64, dr.y + 62, 72, { color: C.head });
      K.text('no terminal to open', dr.x + 120, dr.y + 72, { size: 30, color: C.strong, weight: 600 });
      // the app's own terminal pane, still running commands
      const px = dr.x + 24, pw = dr.w - 48, ph = 150, py = dr.y + dr.h - ph - 22;
      const g = K.ctx();
      g.save(); K.rr(px, py, pw, ph, 12); g.fillStyle = C.page; g.fill(); g.lineWidth = 2; g.strokeStyle = C.line2; g.stroke(); g.restore();
      K.text('terminal pane', px + 20, py + 38, { size: 26, color: C.soft, weight: 600 });
      K.term({ x: px, y: py + 34, w: pw, h: ph - 34 }, t, [], { size: 26, prompt: '$ ', pad: 20 });
      M.pillL('still runs commands', px + pw - 18, py + 32, { align: 'right', size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: K.io(t, wRuns, 0.5) });
    });
  }

  // =========================================================== beat 1 notes (below the windows)
  const b1Out = 1 - K.io(t, wSlash - 0.75, 0.5);
  const pathCard = K.io(t, wUsually - 0.1, 0.6) * b1Out;
  if (pathCard > 0) {
    K.layer(pathCard, () => {
      M.dated(600, 600, 1240, { eyebrow: 'Anthropic · Claude Code quickstart · read 2026-10-14',
        body: 'If your shell says claude isn\u2019t found or isn\u2019t recognized, the install directory isn\u2019t on your PATH yet', quote: true });
    });
  }
  const chipNew = K.io(t, wNew - 0.1, 0.5) * b1Out;
  if (chipNew > 0) M.pillL('after the fix: open a new terminal window', 600, 830, { size: 26, icon: 'terminal', iconColor: C.head, color: C.strong, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.5), alpha: chipNew });
  const chipExe = K.io(t, wNew + 0.9, 0.5) * b1Out;
  if (chipExe > 0) M.pillL('after an update, maybe a missing claude.exe', 600, 886, { size: 26, color: C.soft, fill: C.tile, stroke: C.line2, alpha: chipExe });
  // PATH itself belongs to the lesson on keys (left column, under the house)
  const ptrK = K.io(t, wPath, 0.5) * (1 - K.io(t, cShell, 0.5));
  if (ptrK > 0) {
    M.label('PATH itself', 92, 560, { align: 'left', color: C.body, alpha: ptrK });
    M.pointer('the lesson on keys', 90, 608, { alpha: ptrK });
  }
  // /doctor: the agent's part
  const docK = K.io(t, wSlash - 0.15, 0.6) * (1 - K.io(t, cShell, 0.5));
  if (docK > 0) {
    K.layer(docK, () => {
      M.dated(600, 600, 1240, { eyebrow: 'Anthropic · How Claude Code works · read 2026-10-14',
        body: '/doctor \u201Cdiagnoses installation and configuration issues and can fix them\u201D' });
    });
    M.pillL('the agent: checks and fixes its own setup', 600, 836, { size: 26, icon: 'sparkle', iconColor: C.page, color: C.page, fill: C.head, stroke: C.head, alpha: K.io(t, wSlash + 0.6, 0.5) * (1 - K.io(t, cShell, 0.5)) });
  }

  // =========================================================== beat 2 notes
  const b2 = K.io(t, wGit - 0.1, 0.5) * (1 - K.io(t, cSkip, 0.5));
  if (b2 > 0) {
    let x = 600;
    x += M.pillL('with Git for Windows: Git Bash', x, 642, { size: 26, color: C.strong, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.6), alpha: b2 });
    M.pillL('without it: PowerShell', x + 18, 642, { size: 26, color: C.body, fill: C.tile, stroke: C.line2, alpha: b2 * K.io(t, wGit + 0.5, 0.5) });
  }
  const b2c = K.io(t, wPS - 0.1, 0.6) * (1 - K.io(t, cSkip, 0.5));
  if (b2c > 0) K.layer(b2c, () => M.dated(600, 696, 1240, { eyebrow: 'Anthropic · Claude Code quickstart · read 2026-10-14',
    body: 'If Git for Windows is not installed, Claude Code uses PowerShell as the shell tool instead', quote: true }));

  // =========================================================== beat 3 card: skip the terminal entirely
  const b3 = K.io(t, cSkip + 0.5, 0.6) * (1 - K.io(t, cDeep, 0.5));
  if (b3 > 0) K.layer(b3, () => M.dated(600, 662, 1240, { eyebrow: 'Anthropic · Claude Code terminal guide · read 2026-10-14',
    body: 'Don\u2019t want to use the terminal? The Claude Code desktop app lets you skip the terminal entirely', quote: true }));

  // =========================================================== beat 4: to go deep
  const b4 = K.io(t, wMIT - 0.4, 0.6);
  if (b4 > 0) {
    K.layer(b4, () => {
      M.dated(600, 662, 1240, { eyebrow: 'MIT Missing Semester 2026 · lectures',
        body: '2026-01-12 Shell  ·  2026-01-13 Command-line Environment' });
      K.icon('cap', 600 + 1240 - 56, 662 + 46, 48, { color: C.head, w: 2.6 });
    });
    const ul = K.io(t, wTwo - 0.05, 0.7);
    if (ul > 0) {
      const w = K.measure('2026-01-12 Shell  ·  2026-01-13 Command-line Environment', { font: 'read', size: 30 });
      K.line(632, 662 + 32 + 46 + 24 + 14, 632 + w, 662 + 32 + 46 + 24 + 14, { k: ul, color: C.head, w: 4 });
      M.pillL('two days of the shell', 632 + w + 30, 662 + 32 + 46 + 14, { size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: ul });
    }
  }
});
