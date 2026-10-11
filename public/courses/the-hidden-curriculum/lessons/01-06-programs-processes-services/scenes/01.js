// 01 · The point (title card, painted plate).
// Screen A (purpose -> three-shelves), all left of the lit house: eyebrow + gold title, then three rows that build
//   as they are said. Purpose: 'a program on your disk' + node.exe card on "program"; 'a process running it now' + a
//   cook on "process" (a dashed copy flies card -> hand on "running"); 'a service in the background' + night cook on
//   "service"; 'no window' on "window". Conclusion: the gold definitions land on "file" / "copy" / "alive". Three-shelves:
//   each row pulses (middle terracotta) on "File" / "running copy" / "kept alive". Slow 3 % push-in throughout.
// Screen B ([[one-idea]] -> [[your-part]]): text and tokens give way, title rises and dims; three symptom cards rise
//   one per spoken symptom ('port already in use' with a small mono EADDRINUSE :3000 sub-label) and one gold frame gathers them: "one idea". [[your-part]]: the agent (sparkle head cook)
//   at left, "finds · stops"; the viewer (a round person mark, not a tile: people are not processes) at right,
//   "knows what ought to run" in terracotta.
// Screen C ([[notepad]] -> [[sat-there]]): an "Information Systems degree" pill, then a Notepad window with
//   print("hello") and a hello.txt file beside it. [[sat-there]]: the window fades, the file glides to centre with
//   a still clock: "a program that never ran". Last frame: the lone hello.txt, title dimmed above, petals idle.
SCENE('01', (t, S) => {
  const K = window.K, C = K.C, M = window.M;

  const cConc = S.cue('conclusion', 10.46);
  const cShelves = S.cue('three-shelves', 20.52);
  const cIdea = S.cue('one-idea', 23.56);
  const cPart = S.cue('your-part', 32.06);
  const cNote = S.cue('notepad', 36.83);
  const cSat = S.cue('sat-there', 46.86);

  // purpose: the three nouns land as they are said; conclusion: the short definitions; three-shelves: rows pulse
  const pProg = S.find('program', 0, 2.55), pProc = S.find('process', 0, 4.21), pRun = S.find('running', 0, 4.74);
  const pServ = S.find('service', 0, 6.5), pWin = S.find('window', 0, 9.35);
  const wFile = S.find('file', 0, cConc + 1.0);
  const wCopy = S.find('copy', 0, cConc + 4.3);
  const wAlive = S.find('alive', 0, cConc + 8.5);
  const wFile2 = S.find('file', 1, cShelves);
  const wRun2 = S.find('running', 3, cShelves + 0.8);
  const wKept = S.find('kept', 0, cShelves + 1.8);
  const wServer = S.find('server', 0, cIdea + 2.45);
  const wAI = S.find('an', 0, cIdea + 4.4, { whole: true });
  const wOne = S.find('one', 1, cIdea + 7.45, { whole: true });
  const wFind = S.find('find', 0, cPart + 0.7);
  const wPart = S.find('part', 0, cPart + 2.5);
  const wInfo = S.find('information', 0, cNote + 1.9);
  const wWrote = S.find('wrote', 0, cNote + 4.5);
  const wSaved = S.find('saved', 0, cNote + 6.1);
  const wNever = S.find('never', 0, cSat + 1.9);

  K.bg({ glow: 0.5, glowX: 1440, glowY: 460 });
  K.plate('plate', t, { zoom: true, shade: 0.45 });

  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    if (a <= 0.002) return;
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.6, K.rgba(C.page, 0.85)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  // soft indigo scrims so cream and gold read over the painted plate (screen A sits left of the lit house)
  const base = K.io(t, -0.6, 0.8, 'out');
  blob(640, 520, 860, 420, 0.8 * base);
  blob(1450, 760, 460, 200, 0.7 * K.io(t, cPart - 0.3, 0.6) * (1 - K.io(t, cNote - 0.25, 0.55)));
  blob(1530, 640, 300, 220, 0.6 * K.io(t, cNote + 4, 0.6));

  // screen phases
  const outA = K.io(t, cIdea - 0.35, 0.5);           // screen A's text + tokens leave
  const outB = K.io(t, cNote - 0.25, 0.55);          // screen B leaves
  const X = 160;

  // ---------------------------------------------------------------- title block (persists, rises and dims)
  {
    const up = K.io(t, cIdea - 0.35, 0.7);
    const ty = 288 - 92 * up;
    M.eyebrow('Module 01 · Lesson 6', X, 200, { align: 'left', alpha: base * (1 - up) });
    K.title('Programs, processes & services', X, ty, { size: 70, alpha: base * (1 - 0.55 * up) });
  }

  // ---------------------------------------------------------------- screen A: three rows, phrase | token | definition
  // a slow push-in on screen A's content (about its centre) so the card is never still
  const push = 1 + 0.03 * K.clamp(t / Math.max(1, cIdea), 0, 1);
  if (outA < 1) K.layer(1 - outA, () => K.zoomAt(620, 560, push, () => {
    const rowY = [430, 595, 760];
    const TX = 760, LX = 875;
    const kR = K.io(t, pProg - 0.15, 0.6, 'out');
    const kC = K.io(t, pProc - 0.15, 0.6, 'out');
    const kS = K.io(t, pServ - 0.15, 0.6, 'out');
    const phrases = [[kR, 'a program on your disk'], [kC, 'a process running it now'], [kS, 'a service in the background']];
    const defs = [[wFile, 'a file of instructions'], [wCopy, 'one running copy'], [wAlive, 'kept alive by the OS']];
    // three-shelves: each row pulses as it is said (middle one terracotta: the thing named)
    const pulse = [wFile2, wRun2, wKept].map((at) => K.io(t, at - 0.15, 0.4) * (1 - K.io(t, at + 0.75, 0.5)));
    rowY.forEach((y, i) => {
      const dk = K.io(t, defs[i][0] - 0.15, 0.5);
      const pk = pulse[i];
      if (pk > 0.002) {
        const dw = K.measure(defs[i][1], { font: 'ui', weight: 600, size: 32 });
        const col = i === 1 ? C.accent : C.head;
        K.card(130, y - 66, LX + dw + 40 - 130, 132, { r: 24, fill: K.rgba(col, 0.13), stroke: K.rgba(col, 0.75), shadow: false, alpha: pk });
      }
      const [k, s] = phrases[i];
      if (k > 0.002) K.text(s, X + 12 * (1 - k), y + 11, { font: 'ui', weight: 600, size: 32, color: C.strong, alpha: k });
      if (dk > 0.002) {
        const col = i === 1 ? K.mixColor(C.head, C.accent, pk) : C.head;
        K.text(defs[i][1], LX + 12 * (1 - dk), y + 11, { font: 'ui', weight: 600, size: 32, color: col, alpha: dk });
        // a thin connector from the token to its definition
        K.layer(dk * 0.6, () => { g.save(); g.strokeStyle = C.line2; g.lineWidth = 2; g.setLineDash([4, 6]);
          g.beginPath(); g.moveTo(TX + 90, y); g.lineTo(LX - 14, y); g.stroke(); g.restore(); });
      }
    });
    // 'no window': a faint dashed window outline beside the service phrase that crosses out
    const nk = K.io(t, pWin - 0.25, 0.5);
    if (nk > 0.002) {
      K.text('no window', X, rowY[2] + 56, { font: 'ui', weight: 600, size: 26, color: C.soft, alpha: nk });
    }
    if (kR > 0.002) M.recipe(TX, rowY[0] + 14 * (1 - kR), { name: 'node.exe', icon: 'program', w: 150, h: 100, alpha: kR,
      lit: 0.6 * pulse[0] });
    if (kC > 0.002) {
      M.cook(t, TX, rowY[1] + 14 * (1 - kC), 96, { alpha: kC, named: pulse[1], lit: 0.5 * K.io(t, wCopy - 0.1, 0.5) * (1 - K.io(t, wCopy + 1.2, 0.6)) });
      // the dashed copy flies from the card into the cook's hand on 'running' (the card itself stays put)
      const ck = K.io(t, pRun - 0.2, 0.75);
      if (ck > 0) {
        const e = K.ease.io(ck);
        const fx = TX, fy = rowY[0], tx = TX + 44, ty = rowY[1] + 34;
        M.recipe(K.lerp(fx, tx, e), K.lerp(fy, ty, e) - Math.sin(Math.PI * e) * 24, { name: null, icon: 'program',
          w: K.lerp(150, 64, e), h: K.lerp(100, 42, e), dashed: true, alpha: Math.min(1, ck * 4) });
      }
    }
    if (kS > 0.002) M.cook(t, TX, rowY[2] + 14 * (1 - kS), 96, { kind: 'service', alpha: kS, lit: 0.5 * pulse[2] });
  }));

  // ---------------------------------------------------------------- screen B: three symptoms, one idea, your part
  if (t > cIdea - 0.5 && outB < 1) K.layer(1 - outB, () => {
    const cw = 500, ch = 108, cy = 360, xs = [150, 710, 1270];
    const items = [
      { at: cIdea + 0.05, s: 'port already in use', sub: 'EADDRINUSE :3000', icon: 'warning', ic: C.accent },
      { at: wServer - 0.2, s: 'still running after close', icon: 'program', ic: C.head },
      { at: wAI - 0.1, s: 'AI busy in the background', icon: 'sparkle', ic: C.head },
    ];
    items.forEach((it, i) => {
      const k = K.io(t, it.at, 0.5);
      if (k <= 0.002) return;
      const x = xs[i], y = cy + 16 * (1 - k);
      K.card(x, y, cw, ch, { r: 18, alpha: k, fill: C.tile, stroke: C.line2 });
      K.icon(it.icon, x + 50, y + ch / 2, 40, { color: it.ic, alpha: k, w: 3 });
      if (it.sub) {
        K.text(it.s, x + 92, y + 48, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: k });
        K.text(it.sub, x + 92, y + 86, { font: 'mono', weight: 500, size: 26, color: C.soft, alpha: k });
      } else K.text(it.s, x + 92, y + ch / 2 + 10, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: k });
    });
    const rk = K.io(t, wOne - 0.1, 0.9);
    if (rk > 0) {
      const fx = 118, fy = cy - 24, fw = 1684, fh = ch + 48, per = 2 * (fw + fh);
      g.save(); g.lineWidth = 3; g.strokeStyle = C.head; g.shadowColor = K.rgba(C.head, 0.5); g.shadowBlur = 16;
      const e = K.ease.io(rk); if (e < 1) g.setLineDash([per * e, per * (1 - e) + 0.5]); g.lineDashOffset = -fw / 2;
      K.rr(fx, fy, fw, fh, 30); g.stroke(); g.restore();
      K.text('one idea', 960, fy + fh + 54, { font: 'ui', weight: 600, size: 32, color: C.head, align: 'center', alpha: K.io(t, wOne + 0.2, 0.5) });
    }

    // your part: the agent finds and stops; you know what ought to run
    const ak = K.io(t, cPart, 0.6, 'out');
    if (ak > 0.002) {
      const AX = 470, AY = 700;
      M.cook(t, AX, AY + 14 * (1 - ak), 110, { kind: 'agent', alpha: ak });
      const lk = K.io(t, wFind - 0.1, 0.5);
      K.text('your agent', AX, AY + 104, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: ak });
      K.text('finds · stops', AX, AY + 146, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center', alpha: lk });
      // a dashed gold reach from the agent up to the gathered symptoms
      K.arrow(AX + 80, AY - 30, 640, 512, { k: K.io(t, wFind, 0.5), color: C.head, w: 2.5, dash: [9, 8], bend: 30 });
    }
    const yk = K.io(t, wPart - 0.3, 0.6, 'out');
    if (yk > 0.002) {
      const YX = 1450, YY = 700 + 14 * (1 - yk), r = 62;
      K.layer(yk, () => {
        K.glow(YX, YY, 130, C.accent, 0.25);
        g.save(); g.beginPath(); g.arc(YX, YY, r, 0, Math.PI * 2); g.fillStyle = K.rgba(C.page, 0.9); g.fill();
        g.lineWidth = 3; g.strokeStyle = C.accent; g.stroke(); g.restore();
        K.icon('person', YX, YY + 3, 70, { color: C.accent, w: 3 });
      });
      K.text('you', YX, 700 + 104, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: yk });
      K.text('know what ought to run', YX, 700 + 146, { font: 'ui', weight: 600, size: 30, color: C.accent, align: 'center', alpha: K.io(t, wPart + 0.35, 0.5) });
    }
  });

  // ---------------------------------------------------------------- screen C: the Notepad moment
  if (t > cNote - 0.3) {
    const satK = K.io(t, cSat - 0.1, 0.6);             // the window fades
    const glide = K.io(t, cSat + 0.3, 0.9);            // the file glides to centre
    // the degree pill, until the window opens
    const pk = K.io(t, wInfo - 0.15, 0.5) * (1 - K.io(t, wWrote - 0.3, 0.4));
    if (pk > 0.002) K.pill('Information Systems degree', 960, 540 + 10 * (1 - pk), { size: 30, icon: 'cap', iconColor: C.head, alpha: pk, fill: C.tile, stroke: C.line2, color: C.strong });
    // the window
    const wk = K.io(t, wWrote - 0.15, 0.6, 'out') * (1 - satK);
    if (wk > 0.002) K.layer(wk, () => {
      const r = K.win(500, 330 + 16 * (1 - wk), 820, 430, { kind: 'notepad', title: 'hello.txt - Notepad', titleSize: 26 });
      K.editor(r, t, ['print("hello")'], { size: 34, typeAt: wWrote + 0.25, cps: 18, gutter: false });
    });
    // the file
    const fk = K.io(t, wSaved - 0.1, 0.6, 'out');
    if (fk > 0.002) {
      const fx = K.lerp(1530, 960, K.ease.io(glide)), fy = K.lerp(620, 470, K.ease.io(glide)) - 26 * (1 - fk);
      const s = K.lerp(150, 190, K.ease.io(glide));
      K.file(fx, fy, s, { ext: 'txt', name: 'hello.txt', nameSize: 30, alpha: fk });
      // a still clock beside it: nothing ever ran
      const clk = K.io(t, cSat + 0.9, 0.6);
      if (clk > 0.002) K.icon('clock', fx + 170, fy - 40, 64, { color: C.soft, alpha: clk, w: 3 });
      const lk = K.io(t, wNever - 0.5, 0.6);
      if (lk > 0.002) K.text('a program that never ran', 960, 712 + 10 * (1 - lk), { font: 'ui', weight: 600, size: 32, color: C.body, align: 'center', alpha: lk });
    }
  }

  K.petals(t, {
    n: 6, seed: 7, alpha: 0.5,
    avoid: [[110, 120, 1500, 920], [1260, 220, 1840, 900]],
  });
});
