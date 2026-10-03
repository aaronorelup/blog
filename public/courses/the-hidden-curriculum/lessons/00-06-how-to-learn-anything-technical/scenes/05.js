/* 00.06 scene 05: The rulebook and the briefing
   File slides from 04's side spot to 'left' and records each tab on its ruled sheet. Right half: the rulebook (Python 3.14 docs) with its slim
   /llms.txt edition, the clerk behind its long desk. Rulebook beats, then the briefing: four evidence cards fly from
   the file onto the desk. Close: your "explain why" request and the January 2026 study. */
SCENE('05', (t, S) => {
  K.bg();
  const C = K.C;
  const io = (a, d = 0.45, e = 'io') => K.io(t, a, d, e);
  const W = (w, fb) => S.find(w, 0, fb);

  // ------------------------------------------------------------- beats (local seconds)
  const cRule = S.cue('rulebook', 0);
  const tVersion = W('version.', 3.56);
  const tElse = W('Everything', 4.38);
  const tStale = W('stale.', 6.65);
  const cDoor = S.cue('second-door', 7.71);
  const tSecond = W('second', 8.6);
  const tForAI = S.find(/^AI$/i, 0, 9.42);
  const tL = W('L', 10.22);
  const tTools = W('tools.', 16.52);
  const cServers = S.cue('docs-servers', 17.65);
  const tAmazon = W('Amazon', 18.61);
  const tGoogle = W('Google', 19.42);
  const tSearch = W('search', 22.07);
  const tVersions = W("version's", 25.36);
  const tNot = W('not', 26.59);
  const tMemory = W('memory.', 26.98);
  const cBrief = S.cue('briefing', 27.94);
  const tBriefing = W('briefing.', 29.27);
  const tExact = W('exact', 30.23);
  const tYourV = W('versions', 31.66);
  const tCommand = W('command', 32.59);
  const tFile = S.find('file', 1, 33.48);
  const tAgents = W('Agents', 35.89);
  const tThemselves = W('themselves.', 37.27);
  const cExplain = S.cue('explain', 38.37);
  const tStudy = W('study', 42.0);
  const tLearners = W('learners', 43.27);
  const tLess = W('less', 46.2);
  const tDebug = W('debugging', 47.79);
  const tThose = W('those', 48.76);
  const tBetter = W('better.', 50.46);
  const tMode = W('learning', 53.42);

  // ------------------------------------------------------------- the case file (04 side -> 05 left)
  const F = M.lerpGeo('side', 'left', io(0, M.motion.move));
  const tabs = [2, 1 + io(cRule + 0.1), io(cRule + 0.1) + io(cBrief + 0.4), io(cBrief + 0.4), 0];

  // the case sheet records each tab as it is worked (rows sit on the ruled lines; geometry from F so it rides the slide)
  const rows = (G) => {
    const s = G.s, rule = (i) => G.sheet.y + 64 * s + 44 * s * i;
    return { lx: G.inner.x + 124 * s, vx: G.inner.x + 144 * s, a: rule(1) - 8 * s, b: rule(3) - 8 * s, c: rule(5) - 8 * s, say: rule(6) + 4 * s };
  };
  const lab = (s, x, y, k) => K.text(s, x, y, { font: 'ui', weight: 600, size: 26, color: K.rgba(C.soft, k), align: 'right' });
  const briefItems = [['error', tExact], ['versions', tYourV], ['command', tCommand], ['file', tFile]];
  const BF = { font: 'ui', weight: 600, size: 26 };
  // x of each briefing item on the sheet (screen coords; the evidence cards launch from these words)
  const itemX = (G) => {
    const R = rows(G); let x = R.vx; const sep = K.measure('  ·  ', BF);
    return briefItems.map(([w]) => { const x0 = x, ww = K.measure(w, BF); x += ww + sep; return { x: x0, w: ww, cx: x0 + ww / 2 }; });
  };
  const kSay = io(cExplain, 0.5);
  const sayH = 84;
  const sheetContent = (G) => {
    const R = rows(G), X = itemX(G);
    // row A: Rulebook -> the docs for your version
    const kA = io(cRule + 0.4, 0.45);
    if (kA > 0) {
      lab('Rulebook', R.lx, R.a, kA);
      K.text(K.typed('docs.python.org/3.14', t, tVersion - 0.3, 26), R.vx, R.a, { font: 'mono', weight: 600, size: 26, color: C.strong });
    }
    // row B: checked against the current docs, not memory
    const kB = io(tVersions - 0.1, 0.45);
    if (kB > 0) {
      M.tick(R.lx - 20, R.b - 9, 34, K.io(t, tMemory - 0.1, 0.45), { color: C.strong });
      K.text('current docs, not its memory', R.vx, R.b, { font: 'read', italic: true, size: 30, color: K.rgba(C.strong, 0.9 * kB) });
    }
    // row C: Briefing -> error · versions · command · file, each word brightening as it is said
    const kC = io(tBriefing - 0.4, 0.45);
    if (kC > 0) {
      lab('Briefing', R.lx, R.c, kC);
      const sep = K.measure('  ·  ', BF);
      briefItems.forEach(([w, at], i) => {
        const on = io(at - 0.1, 0.35);
        K.text(w, X[i].x, R.c, { ...BF, color: K.rgba(on > 0.5 ? C.strong : C.soft, kC * (0.45 + 0.55 * on)) });
        if (i < 3) K.text('·', X[i].x + X[i].w + sep / 2, R.c, { ...BF, color: K.rgba(C.soft, 0.6 * kC), align: 'center' });
      });
    }
    // row D: your request to the clerk (explain beat)
    if (kSay > 0) {
      const x = G.inner.x, w = G.inner.w, y = R.say + (1 - kSay) * 12;
      K.layer(kSay, () => {
        K.card(x, y, w, sayH, { r: 18, fill: '#2B2634', stroke: K.rgba(C.strong, 0.75), shadow: false });
        K.icon('person', x + 46, y + sayH / 2, 46, { color: C.strong });
        K.text('Explain why, not just the fix.', x + 88, y + 53, { font: 'read', italic: true, size: 32, color: C.strong });
      });
    }
  };
  M.drawFile(t, F, { tabs, content: sheetContent });
  const RW = rows(F), IX = itemX(F);

  // ------------------------------------------------------------- the clerk's desk + clerk (present from the start)
  // one desk design across the lesson: 03's thin wood shelf, scaled up, with a card-coloured surface and a gold top edge.
  // It deepens as the briefing cards arrive (two rows: the two-line error, then versions / command / file).
  const kDeep = io(tExact - 0.6, 0.6);
  const DK = { x: 945, y: 610, w: 895, h: K.lerp(204, 292, kDeep) };
  const drawDesk = (x, y, w, h) => {
    const ins = 22, lip = 18, legY = y + h + lip, legH = Math.max(0, Math.min(30, 930 - legY));
    if (legH > 0) {
      K.card(x + w * 0.06, legY - 2, 14, legH + 2, { r: 3, fill: M.palette.woodDark, shadow: false });
      K.card(x + w * 0.94 - 14, legY - 2, 14, legH + 2, { r: 3, fill: M.palette.woodDark, shadow: false });
    }
    const g = K.ctx();
    g.save();
    g.beginPath(); g.moveTo(x + ins, y); g.lineTo(x + w - ins, y); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath();
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
    g.fillStyle = '#211F2C'; g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = K.rgba(C.line2, 0.9); g.lineWidth = 1.5; g.stroke();
    g.restore();
    K.glow(x + w / 2, y + h * 0.4, w * 0.42, C.head, 0.07);
    K.line(x + ins, y, x + w - ins, y, { color: K.rgba(C.head, 0.6), w: 2.5 });
    K.card(x, y + h, w, lip, { r: 6, fill: M.palette.wood, stroke: K.rgba(C.line2, 0.9), shadow: false });
    K.line(x + 10, y + h + 2, x + w - 10, y + h + 2, { color: K.rgba(C.head, 0.25), w: 2 });
  };
  drawDesk(DK.x, DK.y, DK.w, DK.h);
  const CL = { x: 1745, y: 572 };
  const deskCx = DK.x + DK.w / 2;

  // ------------------------------------------------------------- the rulebook (official docs, Python 3.14: the running example)
  const kWin = io(cRule + 0.3, 0.6);
  const kStudy = io(tStudy - 0.4, 0.6);
  const RB = { x: 1000, y: 150, w: 640, h: 340 };
  const kEdOut = io(tSecond, 0.7);                 // the slim edition slides out from behind the window
  const kCopy = io(tVersions - 0.1, 0.8);          // ...then that same book slides onto the clerk's desk
  const kClear = 1 - io(cBrief + 0.3, 0.55);       // the rulebook props clear off the desk for the briefing
  let rb = null;
  if (kWin > 0) {
    K.layer(kWin * (1 - kStudy), () => K.at(0, (1 - kWin) * 18, 1, 0, () => {
      rb = M.rulebook(RB.x, RB.y, RB.w, RB.h, {
        url: 'docs.python.org/3.14/', versions: ['3.13', '3.14'],
        litK: io(tVersion - 0.2), lines: K.seg(t, cRule + 0.6, cRule + 1.8),
        edition: kCopy > 0 ? 0 : kEdOut, focus: true,
      });
    }));
  }
  // edition rect (same formula as M.rulebook) for arrows, glow and the slide to the desk
  const ED = { x: RB.x + 36, y: RB.y + RB.h - 72 + kEdOut * 84, w: 300, h: 66 };
  ED.cx = ED.x + ED.w / 2; ED.cy = ED.y + ED.h / 2;
  const kSpell = K.env(t, tL - 0.2, tTools, 0.5);
  if (kSpell > 0) K.glow(ED.cx, ED.cy, 220, C.head, 0.22 * kSpell);

  // 3.14 pill position (M.rulebook's own layout, wide window)
  const content = rb ? rb.content : { x: RB.x, y: RB.y + 104, w: RB.w, h: RB.h - 104 };
  const pw = K.measure('3.14', { font: 'mono', size: 26, weight: 600 }) + 36;
  const V3 = { x: content.x + content.w - 30 - pw / 2, y: content.y + 50 };
  const kRing = K.io(t, tVersions - 0.1, 0.6) * (1 - io(cBrief + 0.2, 0.5));
  if (kRing > 0) K.ring(V3.x, V3.y, pw / 2 + 12, 32, kRing, { color: C.strong, w: 3 });

  // ------------------------------------------------------------- summaries go stale (laid on the empty desk, then swept off)
  const kSumOut = 1 - io(cDoor + 0.1, 0.6);
  const sums = [['blog post', '2022'], ['forum answer', '3.11'], ['tutorial video', '2023'], ['AI answer', '3.12']];
  const SF = { font: 'ui', weight: 600, size: 26 };
  const sw = sums.map(([s]) => K.measure(s, SF) + 52), sGap = 24;
  let sx = deskCx - (sw.reduce((a2, b2) => a2 + b2, 0) + sGap * 3) / 2;
  const kStaleDim = io(tStale - 0.15, 0.6);
  sums.forEach(([s, tag], i) => {
    const k = K.stagger(t, tElse - 0.05, i, 0.18, 0.5) * kSumOut;
    const w = sw[i], h = 58, x = sx; sx += w + sGap;
    if (k <= 0) return;
    const y = 676, rot = [-0.04, 0.03, -0.02, 0.035][i];
    K.layer(k * (1 - 0.5 * kStaleDim), () => K.at(x + w / 2, y + h / 2 + (1 - k) * 14, 1, rot, () => {
      K.card(-w / 2, -h / 2, w, h, { r: 14, fill: '#24222F', stroke: C.line2, shadow: false });
      K.text(s, 0, 9, { ...SF, color: C.soft, align: 'center' });
    }));
    // a dated tag stamps onto each as "stale" is said
    const kt = K.stagger(t, tStale - 0.2, i, 0.1, 0.3) * kSumOut;
    if (kt > 0) K.at(x + w - 18, y - 16, K.lerp(1.3, 1, kt), rot + 0.06, () => M.dated(tag, 0, 0, { alpha: kt }));
  });
  const kStaleTxt = io(tStale - 0.1, 0.5) * kSumOut;
  if (kStaleTxt > 0) K.text('summaries go stale', deskCx, 782, { font: 'read', italic: true, size: 30, color: K.rgba(C.strong, kStaleTxt), align: 'center' });

  // ------------------------------------------------------------- docs servers (on the desk)
  const kSrv = io(cServers - 0.1, 0.55) * kClear;
  const SV = { x: 990, y: 634, w: 560, h: 156 };
  if (kSrv > 0) {
    K.layer(kSrv, () => {
      const y0 = SV.y + (1 - kSrv) * 14;
      K.card(SV.x, y0, SV.w, SV.h, { r: 18, fill: '#262333', stroke: K.rgba(C.head, 0.55), shadow: false });
      K.icon('server', SV.x + 46, y0 + 46, 40, { color: C.head });
      K.text('docs servers', SV.x + 84, y0 + 56, { font: 'ui', weight: 600, size: 30, color: C.strong });
      const kSf = io(tSearch - 0.1);
      if (kSf > 0) K.text('search · fetch', SV.x + SV.w - 28, y0 + 56, { font: 'mono', weight: 600, size: 26, color: K.rgba(C.head, kSf), align: 'right' });
      const names = [['Microsoft', cServers], ['Amazon', tAmazon], ['Google', tGoogle]];
      let px = SV.x + 30;
      names.forEach(([n, at]) => {
        const nw = K.measure(n, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
        const k = io(at - 0.05, 0.4);
        if (k > 0) K.pill(n, px + nw / 2, y0 + 112 + (1 - k) * 8, { size: 26, color: C.body, stroke: K.rgba(C.head, 0.4), fill: '#1C1B2A', alpha: k });
        px += nw + 14;
      });
    });
  }

  // the clerk's dashed lines: edition -> clerk (second door), clerk -> docs servers (search)
  const kEdLine = K.io(t, tForAI - 0.1, 1.0) * (1 - io(tVersions - 0.4, 0.35));
  if (kEdLine > 0) M.clerkLine(ED.x + ED.w + 10, ED.cy, CL.x - 60, CL.y + 2, kEdLine, { bend: -24 });
  const kSrvLine = K.io(t, tSearch - 0.1, 0.8) * kClear;
  if (kSrvLine > 0) M.clerkLine(CL.x - 30, CL.y + 50, SV.x + SV.w + 8, SV.y + 52, kSrvLine, { bend: -16 });

  // "your version's rulebook, not its memory": the slim edition itself slides onto the desk in front of the clerk...
  const kCopyA = kCopy > 0 ? kClear : 0;
  if (kCopyA > 0) {
    const tx = 1700, ty = 752;
    const x = K.lerp(ED.cx, tx, kCopy), y = K.lerp(ED.cy, ty, kCopy) - Math.sin(Math.PI * kCopy) * 60;
    const sc = K.lerp(1, 0.84, kCopy);
    K.layer(kCopyA, () => K.at(x, y, sc, 0, () => {
      const ew = 300, eh = 66, ex = -ew / 2, ey = -eh / 2;
      K.card(ex, ey, ew, eh, { r: 12, fill: '#2E2838', stroke: K.rgba(C.head, 0.8), glow: 0.4, shadow: false });
      K.line(ex + 18, ey + 12, ex + 18, ey + eh - 12, { color: K.rgba(C.head, 0.5), w: 3 });
      K.line(ex + 28, ey + 12, ex + 28, ey + eh - 12, { color: K.rgba(C.head, 0.25), w: 2 });
      K.text('/llms.txt', ex + 46, ey + eh / 2 + 10, { font: 'mono', weight: 600, size: 28, color: C.head });
      K.icon('sparkle', ex + ew - 34, ey + eh / 2, 30, { color: C.head, alpha: 0.85 });
    }));
  }
  // ...while the clerk's old memory, a faded thought bubble, is crossed out
  const kOldOut = 1 - io(cBrief + 0.6, 0.5);
  const kOld = io(tVersions - 0.2, 0.45) * kOldOut;
  if (kOld > 0) {
    const BX = CL.x, BY = 420;
    const bub = (x, y, r) => K.card(x - r, y - r, 2 * r, 2 * r, { r, fill: '#23212E', stroke: K.rgba(C.body, 0.45), shadow: false });
    K.layer(kOld * 0.85, () => {
      bub(CL.x - 18, CL.y - 66, 8); bub(CL.x - 8, CL.y - 92, 12);
      bub(BX, BY, 56);
      K.icon('book', BX, BY, 54, { color: C.soft });
      K.text('old memory', BX, BY - 74, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center' });
    });
    M.cross(BX, BY, 58, K.io(t, tMemory - 0.1, 0.45) * kOldOut, {});
  }

  // the clerk itself, behind the desk's back edge
  M.clerk(t, CL.x, CL.y, 96, { glow: 0.8 });

  // ------------------------------------------------------------- the briefing: evidence flies from its word on the sheet onto the desk
  const evW = (o) => {
    const E = { error: 'the exact error', versions: 'your versions', command: 'the command', file: 'the file' }[o.kind];
    return Math.max(o.w || 300, K.measure(o.text, M.type.mono) + 116, K.measure((o.eyebrow || E).toUpperCase(), { font: 'ui', weight: 600, size: 20, tracking: 4 }) + 116);
  };
  // the error card is two lines: the whole last line, never paraphrased (M.evidence is single-line, so drawn here)
  const ERR1 = "NameError: name 'pirnt' is not defined.", ERR2 = "Did you mean: 'print'?";
  const errW = K.measure(ERR1, M.type.mono) + 116, errH = 150;
  const errorCard = (x, y, lit) => {
    K.card(x, y, errW, errH, { r: 16, fill: '#262333', stroke: K.mixColor(C.line2, C.head, lit * 0.8), glow: lit * 0.5 });
    K.icon('warning', x + 44, y + 56, 40, { color: C.accent });
    K.eyebrow('the exact error', x + 84, y + 40, { size: 20 });
    K.text(ERR1, x + 84, y + 82, { font: 'mono', weight: 600, size: 26, color: C.strong });
    K.text(ERR2, x + 84, y + 122, { font: 'mono', weight: 600, size: 26, color: C.strong });
  };
  const ev = [
    { kind: 'error', at: tExact, w: errW, h: errH },
    { kind: 'versions', text: 'Python 3.14', eyebrow: 'versions', w: 1, at: tYourV },
    { kind: 'command', text: 'python app.py', w: 1, at: tCommand },
    { kind: 'file', text: 'app.py', w: 1, at: tFile },
  ];
  for (let i = 1; i < 4; i++) { ev[i].w = evW(ev[i]); ev[i].h = 112; }
  const r1 = 624, r2 = r1 + errH + 10, gap = 10;
  ev[0].x = deskCx - errW / 2 - 52; ev[0].y = r1;
  const row2 = ev[1].w + ev[2].w + ev[3].w + 2 * gap;
  ev[1].x = deskCx - row2 / 2; ev[1].y = r2;
  ev[2].x = ev[1].x + ev[1].w + gap; ev[2].y = r2;
  ev[3].x = ev[2].x + ev[2].w + gap; ev[3].y = r2;
  // "Agents gather most of it themselves": the clerk reaches into the file; three cards get its gold rim
  const kReach = K.io(t, tAgents - 0.05, 1.0) * (1 - io(cExplain - 0.35, 0.4));
  const litAt = [Infinity, tAgents + 0.7, tAgents + 0.95, tAgents + 1.2];
  ev.forEach((e, i) => {
    const k = K.io(t, e.at - 0.1, M.motion.land);
    if (k <= 0) return;
    const sx0 = IX[i].cx, sy0 = RW.c - 10, tx = e.x + e.w / 2, ty = e.y + e.h / 2;
    const x = K.lerp(sx0, tx, k), y = K.lerp(sy0, ty, k) - Math.sin(Math.PI * k) * 90;
    const sc = K.lerp(0.4, 1, k);
    const rot = (1 - k) * -0.12 + (i % 2 ? 0.006 : -0.006);
    const lit = Math.max(0.15 * (1 - k), io(litAt[i], 0.45));
    K.layer(Math.min(1, k * 2.5), () => K.at(x, y, sc, i ? 0 : rot, () => {
      if (i === 0) errorCard(-e.w / 2, -e.h / 2, lit);
      else M.evidence(-e.w / 2, -e.h / 2, { kind: e.kind, text: e.text, eyebrow: e.eyebrow, w: e.w, rot, lit });
    }));
  });
  if (kReach > 0) M.clerkLine(CL.x - 58, CL.y + 18, F.x1 + 14, 596, kReach, { bend: 10 });

  // ------------------------------------------------------------- explain: your request goes to the clerk
  const kYouLine = K.io(t, cExplain + 0.35, 0.9);
  if (kYouLine > 0) {
    // two joined curves so the line rises clear of the error card's corner, then runs level under the docs window
    const WP = { x: 1000, y: 560 }, split = 0.22;
    M.youLine(F.x1 - 24, RW.say - 6, WP.x, WP.y, K.clamp(kYouLine / split), { bend: -80, head: kYouLine < split ? undefined : false });
    if (kYouLine > split) M.youLine(WP.x, WP.y, CL.x - 60, CL.y + 6, (kYouLine - split) / (1 - split), { bend: -40 });
  }

  // the January 2026 study: one card in the rulebook's place (the docs window has faded out completely)
  if (kStudy > 0) {
    const SX = 1010, SY = 150, SW = 640, SH = 396;
    K.layer(kStudy, () => {
      const dy = (1 - kStudy) * 14;
      K.card(SX, SY + dy, SW, SH, { r: 22, fill: '#22202D', stroke: K.rgba(C.head, 0.5) });
      M.dated('Anthropic study · Jan 2026', SX + SW / 2, SY + 52 + dy);
      // row 1: AI wrote the code -> understood less, most at debugging
      const k1 = io(tLearners - 0.1, 0.5);
      if (k1 > 0) K.layer(k1, () => {
        K.spans([{ s: 'AI wrote the code: ', color: C.soft }, { s: 'understood less', color: C.strong }], SX + 104, SY + 140 + dy, { font: 'read', size: 30 });
      });
      M.cross(SX + 56, SY + 130 + dy, 54, K.io(t, tLess - 0.1, 0.5), { disc: true });
      const k1b = io(tDebug - 0.15, 0.45);
      if (k1b > 0) K.text('most of all at debugging', SX + 104, SY + 184 + dy, { font: 'read', italic: true, size: 30, color: K.rgba(C.body, k1b) });
      // row 2 (pre-placed quietly with row 1, full at "those who asked"): asked it to explain -> did better
      const k2 = Math.max(0.22 * k1, io(tThose - 0.1, 0.5));
      if (k2 > 0) K.layer(k2, () => {
        K.spans([{ s: 'Asked it to explain: ', color: C.soft }, { s: 'did better', color: C.strong }], SX + 104, SY + 262 + dy, { font: 'read', size: 30 });
      });
      M.tick(SX + 56, SY + 252 + dy, 54, K.io(t, tBetter - 0.15, 0.5), { disc: true });
      // "most assistants now offer a learning mode": a chip clips on right under the "did better" row
      const kMode = io(tMode - 0.3, 0.4);
      if (kMode > 0) {
        const s = 'learning mode', cw = K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 96;
        const cx0 = SX + 104, cy = SY + 336 + dy - (1 - kMode) * 8;
        K.layer(kMode, () => {
          K.line(cx0 + 34, SY + 278 + dy, cx0 + 34, cy - 26, { color: K.rgba(C.head, 0.6), w: 2.5 });
          K.card(cx0, cy - 26, cw, 52, { r: 26, fill: '#1C1B2A', stroke: K.rgba(C.head, 0.7), glow: 0.3, shadow: false });
          K.icon('book', cx0 + 34, cy, 30, { color: C.head });
          K.text(s, cx0 + 60, cy + 9, { font: 'ui', weight: 600, size: 26, color: C.strong });
        });
      }
    });
  }
});
