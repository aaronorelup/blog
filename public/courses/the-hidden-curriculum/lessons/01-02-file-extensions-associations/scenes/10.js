/* 01.02 · 10 — Where the picture breaks
   A: the one ledger splits into three (Windows · registry / Mac · label → type → app + per-file note /
      Linux · peeks at contents + a text file).
   B: the three shrink to a strip of pills; the room returns: the porter works the FRONT DOOR
      (double-click · Open with · open command).
   C: walk-past: a terminal names the program (python notes.txt); a dashed arrow goes straight to the Python
      door, the ledger stays shut.
   D: two Pythons: double-click script.py → the porter's route → Python (ledger's); typed in the project's
      (.venv) → Python (.venv).
   E: the web: a parcel with tag page.txt, stamped Content-Type: text/html; the stamp decides, the tag dims. */
SCENE('10', (t, S) => {
  K.bg();
  const C = K.C, P = M.palette, g = K.ctx();
  const io = (a, d = 0.6, e) => K.io(t, a, d, e);

  // ---- beats (local seconds)
  const cThree = S.cue('three-ledgers', 0);
  const cFront = S.cue('front-door', 18.55);
  const cWalk = S.cue('walk-past', 25.45);
  const cTwo = S.cue('two-pythons', 33.05);
  const cWeb = S.cue('web', 48.75);
  const wOne = S.find('one', 0, 2.4);
  const wWin = S.find('Windows', 0, 3.7);
  const wReg = S.find('registry', 0, 5.26);
  const wMac = S.find('Mac', 0, 6.55);
  const wLabel = S.find('label', 0, 7.34);
  const wType = S.find('type', 0, 7.99);
  const wApp = S.find('app', 0, 9.78);
  const wPerFile = S.find('per-file', 0, 10.97);
  const wLinux = S.find('Linux', 0, 12.74);
  const wPeek = S.find('peek', 0, 14.2);
  const wPlain = S.find('plain', 0, 16.95);
  const wDbl = S.find('double-click', 0, 21.13);
  const wOpenWith = S.find('Open', 0, 22.02);
  const wOpenCmd = S.find('open', 1, 23.9);
  const wPython = S.find('python', 0, 27.48);
  const wNoLedger = S.find(/^no$/, 0, 31.1);
  const wDblScript = S.find('double-clicking', 0, 33.37);
  const wTyping = S.find('typing', 0, 36.08);
  const wDiff = S.find('different', 0, 38.8);
  const wDbl2 = S.find(/^double-click$/, 1, 40.53);
  const wNotOne = S.find(/^not$/, 0, 45.37);
  const wPoints = S.find('points', 0, 43.8);
  const wVenv = S.find(/^project/, 0, 46.29) + 0.5;
  const wServer = S.find("server's", 0, 49.92);
  const wDecides = S.find('decides', 0, 50.76);
  const wNot = S.find(/^not$/, 1, 51.69);
  void cThree;

  // ================================================================ A: three ledgers
  // one familiar ledger (Windows' rows) splits on "one" into three, each with its OS header already on;
  // each card pulses (glow + gold underline) as it is named, and its mechanism builds in below it.
  const aA = 1 - io(cFront - 0.1, 0.7);
  if (aA > 0) {
    const kSplit = io(wOne - 0.15, 0.8);
    const lift = (1 - aA) * -30;
    const W = 460, LY = 312, HY = 286;
    const kPF = io(wPerFile - 0.15, 0.6);
    const cards = [
      { name: 'Linux', cx: K.lerp(960, 1520, kSplit), at: wLinux,
        rows: [{ label: '.txt', door: 'Text Editor' }, { label: '.py', door: 'V S Code' }, { label: '.pdf', door: 'Doc Viewer' }] },
      { name: 'Mac', cx: 960, at: wMac,
        rows: [{ label: '.txt', door: 'TextEdit', hi: kPF }, { label: '.py', door: 'V S Code' }, { label: '.pdf', door: 'Preview' }] },
      { name: 'Windows', cx: K.lerp(960, 400, kSplit), at: wWin,
        rows: [{ label: '.txt', door: 'Notepad' }, { label: '.py', door: 'V S Code' }, { label: '.pdf', door: 'Browser' }] },
    ];
    K.layer(aA, () => K.at(0, lift, 1, 0, () => {
      cards.forEach((c, i) => {
        const al = 1; // stacked under Windows until the split, so nothing shows through
        const pulse = K.env(t, c.at - 0.15, c.at + 1.4, 0.35);
        if (pulse > 0) K.glow(c.cx, LY + 110, 300, C.head, 0.22 * pulse);
        K.layer(al, () => M.ledger(c.cx - W / 2, LY, W, { rows: c.rows }));
        K.text(c.name, c.cx, HY, { font: 'head', weight: 700, size: 40, color: C.head, align: 'center', alpha: kSplit });
        const mk = io(c.at - 0.1, 0.5);
        if (mk > 0) { const hw = K.measure(c.name, { font: 'head', weight: 700, size: 40 }) / 2 + 6; K.mark(c.cx - hw, HY + 12, hw * 2, mk, { w: 4, alpha: 0.85 * kSplit }); }
      });
      const SY = 712; // the strings' bead row

      // Windows: the registry; the label alone picks the row
      const kReg = io(wReg - 0.15, 0.5);
      if (kReg > 0) {
        M.chip('registry', 400, 612, { alpha: kReg });
        M.drawString(510, SY, 0.3, { preset: 'notes', n: 6, t, tagS: 0.8, alpha: kReg, tag: { name: 'notes.txt', mark: io(wReg + 0.3, 0.6) } });
      }

      // Mac: label → type → app, then a per-file choice that overrides the default row
      const chain = [['label', wLabel], ['type', wType], ['app', wApp]];
      const fo = { font: 'ui', weight: 600, size: 28 };
      const ws = chain.map(([s]) => K.measure(s, fo) + 28 * 1.6), gap = 50;
      let x = 960 - (ws.reduce((p, q) => p + q, 0) + gap * 2) / 2;
      chain.forEach(([s, at], i) => {
        const k = io(at - 0.1, 0.45);
        if (k > 0) M.label(s, x + ws[i] / 2, 612, { alpha: k });
        if (i < 2) {
          const ka = io(chain[i + 1][1] - 0.25, 0.4);
          if (ka > 0) K.text('→', x + ws[i] + gap / 2, 622, { font: 'mono', size: 30, color: C.soft, align: 'center', alpha: ka });
        }
        x += ws[i] + gap;
      });
      if (kPF > 0) {
        M.drawString(1070, SY, 0.3, { preset: 'notes', n: 6, t, tagS: 0.8, alpha: kPF });
        K.line(1070, SY + 14, 1092, 770, { color: P.cord, w: 2, alpha: kPF });
        M.slip('→ V S Code', 1092, 800, { s: 0.9, rot: -0.04, alpha: io(wPerFile + 0.2, 0.5) });
        M.quiet('per-file choice', 960, 880, { alpha: io(wPerFile + 0.5, 0.5) });
      }

      // Linux: peeks at the contents; your choices live in a plain text file
      const kL = io(wLinux + 0.2, 0.6), kPeek = io(wPeek - 0.1, 0.6);
      if (kL > 0) M.drawString(1630, SY, 0.3, { preset: 'notes', n: 6, t, tagS: 0.8, alpha: kL, lit: kPeek });
      if (kPeek > 0) {
        g.save(); g.globalAlpha *= kPeek; g.strokeStyle = C.head; g.lineWidth = 3;
        g.beginPath(); g.moveTo(1530, SY); g.quadraticCurveTo(1630, SY - 66, 1730, SY); g.quadraticCurveTo(1630, SY + 66, 1530, SY); g.stroke();
        g.restore();
        M.label('peeks at contents', 1520, 612, { alpha: kPeek });
      }
      const kTxt = io(wPlain - 0.1, 0.6);
      if (kTxt > 0) {
        K.icon('file', 1330, 870, 46, { color: C.strong, alpha: kTxt });
        K.text('your choices: a text file', 1368, 881, { font: 'ui', weight: 400, size: 30, color: C.soft, alpha: kTxt });
      }
    }));
  }

  // ================================================================ B–E: the strip and the room
  // the strip steps back to 30% while the two routes cross under it, and returns for the calm exit
  const kStrip = io(cFront + 0.3, 0.7) * (1 - 0.7 * io(cTwo, 0.6) * (1 - io(cWeb, 0.7)));
  if (kStrip > 0) {
    M.label('Windows · registry', 400, 168, { alpha: kStrip });
    M.label('Mac · label → type → app', 960, 168, { alpha: kStrip });
    M.label('Linux · peeks at contents', 1520, 168, { alpha: kStrip });
  }

  const kRoom = io(cFront + 0.2, 0.8);
  if (kRoom <= 0) return;

  // porter's gaze: ledger (-) or doors (+)
  let look = K.lerp(0, -0.6, io(cFront + 0.6, 0.6));
  look = K.lerp(look, 0.6, io(wNoLedger - 1.4, 0.6));
  look = K.lerp(look, -0.8, io(wDblScript + 0.3, 0.5));
  look = K.lerp(look, 0.6, io(wDblScript + 1.2, 0.5));
  look = K.lerp(look, 0, io(cWeb, 0.6));

  // timings for the routes
  const walkA = wNoLedger - 1.6;                 // dashed arrow terminal → Python (after the command is typed)
  const walkArr = walkA + 0.8;
  const prA = wDblScript + 1.2, prArr = prA + 1.4;      // carry: desk at prA-0.1, door at prArr // porter's carry of script.py
  const venvA = wTyping + 1.3, venvArr = venvA + 0.8;
  const kOutWeb = io(cWeb - 0.3, 0.6);           // terminal and trails leave for the web parcel

  // ledger glow when the porter consults it (double-click) and when "the ledger points at"
  const ledGlow = Math.max(K.env(t, wDblScript + 0.5, wDblScript + 1.6, 0.4), K.env(t, wPoints - 0.3, wPoints + 1.6, 0.5));

  K.layer(kRoom, () => {
    if (ledGlow > 0) K.glow(640, 470, 190, C.head, 0.32 * ledGlow);
    M.room({ t, doors: false, porter: { look }, ledger: { open: 0 } });

    // ---- doors: Notepad, V S Code, Python (ledger's) and, for the two-Pythons beat, Python (.venv).
    // On two-pythons the row spreads so each Python door can carry a full 30 px label under its sill.
    const k4 = io(cTwo + 0.1, 0.7), kSpread = io(cTwo, 0.8);
    const xsA = [1080, 1270, 1460, 1650], xsB = [1040, 1205, 1430, 1690];
    const xs = xsA.map((v, i) => K.lerp(v, xsB[i], kSpread));
    const fWalk = io(walkArr, 0.4) * (1 - io(cTwo, 0.5));
    const hWalk = io(walkArr + 0.1, 0.6) * (1 - io(cTwo, 0.5));
    const hPR = io(prArr + 0.1, 0.6), h4 = io(venvArr + 0.1, 0.6);
    // who is lit: each on arrival; then only the ledger's on "The double-click runs…", only .venv on "not the one…"; calm on web
    const kOnlyL = io(wDbl2 - 0.1, 0.5), kOnlyV = io(wNotOne - 0.05, 0.5), kCalm = io(cWeb, 0.7);
    let fL = io(prArr, 0.4), fV = io(venvArr, 0.4);
    fL = K.lerp(K.lerp(K.lerp(fL, 1, kOnlyL), 0, kOnlyV), 0, kCalm);
    fV = K.lerp(K.lerp(K.lerp(fV, 0, kOnlyL), 1, kOnlyV), 0, kCalm);
    const dL = 0.6 * kOnlyV * (1 - kCalm), dV = 0.6 * kOnlyL * (1 - kOnlyV) * (1 - kCalm);
    const dimSide = K.lerp(0.55 * io(cWalk, 0.6), 0.75, kSpread);
    const D = M.doors({
      names: ['Notepad', 'V S Code', 'Python', 'Python'],
      xs, w: K.lerp(170, 160, kSpread),
      k: (i) => (i < 3 ? K.stagger(t, cFront + 0.3, i, 0.12, 0.6) : k4),
      each: (i) => {
        if (i < 2) return { dim: dimSide };
        if (i === 2) {
          const hold = Math.max(hWalk, hPR);
          return { focus: Math.max(fWalk, fL), dim: dL, holding: hold, t, icon: hold > 0.98 ? 'none' : undefined };
        }
        return { focus: fV, dim: dV, holding: h4, t, icon: h4 > 0.98 ? 'none' : undefined };
      },
    });
    const d3 = D[2], d4 = D[3];
    const labOf = (txt, d, k, lit, dim) => {
      if (k <= 0) return;
      K.text(txt, d.cx, d.y1 + 46, { font: 'ui', weight: 600, size: 30, color: K.mixColor(C.strong, C.head, lit), align: 'center', alpha: k * (1 - 0.55 * dim) });
    };
    labOf("ledger's Python", d3, io(cTwo + 0.3, 0.5), fL, dL);
    labOf('.venv Python', d4, k4 * io(cTwo + 0.5, 0.5), fV, dV);
    const kLMark = io(wPoints - 0.1, 0.6) * (1 - kOnlyV);
    if (kLMark > 0) K.mark(d3.cx - 104, d3.y1 + 60, 208, kLMark, { w: 4 });
    const kVenvMark = io(wVenv - 0.1, 0.6);
    if (kVenvMark > 0) K.mark(d4.cx - 88, d4.y1 + 60, 176, kVenvMark, { w: 4 });

    // ---- the front door: an arch around the porter's desk, and the three ways in
    const kArch = io(cFront + 0.5, 0.7) * (1 - 0.65 * io(cWalk, 0.6));
    if (kArch > 0) {
      g.save(); g.globalAlpha *= kArch; g.strokeStyle = C.head; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(170, 735); g.lineTo(170, 450); g.ellipse(480, 450, 310, 120, 0, Math.PI, Math.PI * 2); g.lineTo(790, 735); g.stroke();
      g.restore();
      K.text('front door', 480, 312, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center', alpha: kArch });
    }
    const ways = [['double-click', wDbl], ['Open with', wOpenWith], ['open command', wOpenCmd]];
    const wsW = ways.map(([s]) => K.measure(s, { font: 'ui', weight: 600, size: 28 }) + 28 * 1.6), wg = 18;
    let wx = 480 - (wsW.reduce((p, q) => p + q, 0) + wg * 2) / 2;
    const kWaysOut = 1 - io(cWalk, 0.5);
    ways.forEach(([s, at], i) => {
      const k = io(at - 0.1, 0.45) * kWaysOut;
      if (k > 0) M.label(s, wx + wsW[i] / 2, 790, { alpha: k });
      wx += wsW[i] + wg;
    });

    // ---- the terminal: naming the program yourself
    const kTerm = io(cWalk + 0.2, 0.7) * (1 - kOutWeb);
    const TX = 820, TY = 745, TW = 680, TH = 170, tsz = 26, tpad = 18;
    const p1 = 'C:\\proj> ', c1 = 'python notes.txt', p2 = '(.venv) C:\\proj> ', c2 = 'python script.py';
    const mono = { font: 'mono', size: tsz };
    const end1 = TX + tpad + K.measure(p1 + c1, mono), end2 = TX + tpad + K.measure(p2 + c2, mono);
    if (kTerm > 0) {
      const r = K.win(TX, TY, TW, TH, { kind: 'terminal', title: 'Terminal', titleSize: 26, alpha: kTerm });
      K.layer(kTerm, () => K.term(r, t, [
        { at: wPython - 0.05, cmd: c1, cps: 8, prompt: p1 },
        { at: wTyping, cmd: c2, cps: 14, prompt: p2 },
      ], { size: tsz, pad: tpad, lh: 38, rows: 2, prompt: p1 }));
    }
    // dashed arrows: the command goes straight to the door it names; no ledger on the way
    const kArrOut = 1 - kOutWeb;
    const kW = io(walkA, 0.8) * (1 - io(cTwo, 0.5));
    if (kW > 0) K.arrow(end1 + 6, TY + 4, d3.cx - 10, d3.y1 + 74, { k: kW, bend: 30, dash: [12, 10], color: C.head, w: 3, alpha: kArrOut });
    // the typed .venv command: out of the terminal's right edge, then straight up to the .venv door's label
    const kV = io(venvA, 0.8);
    if (kV > 0) K.path([[TX + TW + 8, TY + 123], [d4.cx - 40, TY + 123], [d4.cx, TY + 95], [d4.cx, d4.y1 + 88]],
      { k: kV, dash: [12, 10], color: C.head, w: 3, alpha: kArrOut, headSize: 14 });
    const kNo = K.env(t, wNoLedger - 0.1, cTwo - 0.2, 0.4);
    if (kNo > 0) M.quiet('no ledger consulted', 480, 800, { alpha: kNo });

    // ---- the double-click: script.py stays where it is; its beads go through the porter's desk (the front door),
    // where the ledger is read, and only then out to whichever Python the ledger names.
    const kStr = io(wDblScript - 0.25, 0.5) * (1 - kOutWeb);
    if (kStr > 0) {
      const SX = 480, SYs = 860;
      M.drawString(SX, SYs, 0.3, { preset: 'py', n: 8, t, tag: 'script.py', tagS: 0.8, alpha: kStr });
      // route: from the tag up the OUTSIDE of the arch's left leg, over its top (the front door), then above the
      // door row and down onto the ledger's Python. It never crosses the desk, the ledger or the door labels.
      const AR = [];
      for (let i = 0; i <= 4; i++) { const a = Math.PI + (i / 4) * 0.5 * Math.PI; AR.push([480 + 360 * Math.cos(a), 450 + 186 * Math.sin(a)]); }
      const PR = [[150, SYs - 44], [122, 700], ...AR, [760, 242], [960, 214], [d3.cx - 80, 212], [d3.cx - 16, 216], [d3.cx, 226]];
      // two stages: up to the top of the arch (pause while the porter reads the ledger), then on to the door
      const kc = 0.45 * io(prA - 0.9, 0.8) + 0.55 * io(prA + 0.2, 1.2);
      const trailA = (0.5 + 0.4 * K.env(t, wPoints - 0.3, wPoints + 1.6, 0.5)) * (1 - 0.5 * kOnlyV);
      if (kc > 0) K.path(PR, { k: kc, color: C.head, w: 3, dash: [12, 10], alpha: trailA * kStr, headSize: 14 });
      const hk = io(prArr - 0.45, 0.45);
      const p = M.along(PR, kc);
      if (kc > 0 && hk < 1) M.drawString(p.x, p.y, 0.3, { preset: 'py', n: 8, t, tag: false, alpha: K.clamp(kc * 8) * (1 - hk) });
      // two soft ripples: the double-click
      for (let i = 0; i < 2; i++) {
        const u = K.clamp((t - (wDblScript + 0.05 + i * 0.25)) / 0.6);
        if (u > 0 && u < 1) K.ring(SX, SYs, 118 + 30 * u, 30 + 16 * u, 1, { color: C.head, w: 3, rot: 0, alpha: 1 - u });
      }
    }
    void wDiff;

    // ---- the web: a parcel whose server stamp decides, not its tag
    const kWeb = io(cWeb, 0.5);
    if (kWeb > 0) {
      K.icon('globe', 470, 840, 72, { color: C.strong, alpha: kWeb });
      K.text('the web', 470, 912, { font: 'ui', weight: 600, size: 28, color: C.soft, align: 'center', alpha: kWeb });
      K.arrow(520, 842, 630, 842, { k: io(cWeb + 0.2, 0.6), color: C.soft, w: 3 });
      const kBox = io(cWeb + 0.4, 0.6);
      if (kBox > 0) {
        K.layer(kBox, () => {
          K.card(900, 775, 520, 135, { r: 14, fill: P.wood, stroke: P.woodEdge, shadow: true });
        });
        const dimTag = io(wNot - 0.1, 0.7);
        M.tag(872, 842, { name: 'page.txt', s: 0.8, t, alpha: kBox * (1 - 0.6 * dimTag) });
      }
      const kStamp = io(wServer - 0.1, 0.45);
      if (kStamp > 0) {
        K.layer(kStamp, () => K.at(1160, 842, K.lerp(1.25, 1, kStamp), 0, () => M.chip('Content-Type: text/html', 0, 0)));
        K.ring(1160, 842, 224, 40, io(wDecides - 0.05, 0.7), { color: C.head, w: 3, rot: 0 });
      }
    }
  });
});
