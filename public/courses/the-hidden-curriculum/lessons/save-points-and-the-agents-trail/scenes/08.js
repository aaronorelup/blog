// 08 · Tracing paper: what changed.
// Map left at M.VIEW.left (z .85) for the whole scene; a sheet of tracing paper lowers over it.
// [[tracing]] the sheet lowers; a gold '+' over the newly added side stretch, a terracotta '−' over a removed squiggle;
//   a small legend at right: '+ additions', '− removals', '= the diff'.
// [[indicator]] a drawn mock-up of the desktop app's session header ("drawn after Anthropic's docs, October 2026"):
//   chip '+12 −1' appears on "indicator"; "lines added" / "lines removed" under it as spoken; the pointer clicks it and
//   a file-by-file list unfolds; S208 card. On "disk": a file icon with the stamp "already on disk" (auto mode).
// [[cloudiff]] a cloud-session row: '+42 −18', "against the base branch", 'Compare against ▾' (S129); changelog card
//   (v2.1.309, 2026-10-22): read the label on the Changes pane first.
// [[list]] the mock-up fades; the real changed-files terminal opens (pre-rolled so the file list prints on "code").
// [[stray]] a terracotta box on 'deploy.yml | 1 +' ("the file you never asked about"); a terracotta square lands on the
//   tracing paper away from the path; the walker's sight-line jumps to it.
// [[self]] a gold box on 'index.html | 2 +-' labelled "the file you asked about"; on "slash" a check ring under the
//   terminal, tied to that row: "/code-review: bugs in the code"; the guide wears a '/code-review' badge; S208 card with the /code-review sentence. On "Only you" the deploy.yml label becomes
//   "only you: files you never named" and the sight-line brightens.
// Exit: terminal resting with deploy.yml boxed, tracing sheet over the map.
SCENE('08', (t, S) => {
  const K = window.K, C = K.C, M = window.M, L = M.L, g = K.ctx();

  const cTrace = S.cue('tracing', 0);
  const cInd = S.cue('indicator', 8.62);
  const cCloud = S.cue('cloudiff', 24.17);
  const cList = S.cue('list', 28.41);
  const cStray = S.cue('stray', 33.61);
  const cSelf = S.cue('self', 40.1);
  const wAdd = S.find('additions', 0, cTrace + 4.1);
  const wRem = S.find('removals', 0, cTrace + 5.7);
  const wDiff = S.find('diff', 0, cTrace + 7.56);
  const wInd = S.find('indicator', 0, cInd + 4.45);
  const wAdded = S.find('added', 0, cInd + 9.67);
  const wRemoved = S.find('removed', 0, cInd + 10.95);
  const wDisk = S.find('disk', 0, cInd + 14.15);
  const wCode = S.find('code', 0, cList + 4.26);          // "...without reading code."
  const wDeploy = S.find('deploy', 0, cStray + 4.62);
  const wSlash = S.find('slash', 0, cSelf + 2.58);
  const wOnly = S.find('only', 0, cSelf + 5.85);

  const cam = K.cam(t, [{ at: -10, ...M.VIEW.left }]);
  const ts = M.ts(cam);
  const id = M.ids();

  K.bg();

  // ------------------------------------------------------------------ the map (identical to 05-07), under the camera
  const SQ = [1085, 680];                                  // the stray file's square on the tracing paper (world)
  const WALK = [1170, 810];                                // the walker, below the tracing sheet's bottom edge (world)
  const SHEET = [170, 190, 1065, 540];                     // the tracing sheet (world): its bottom (730) clears both tiles
  const kTrace = K.io(t, cTrace + 0.3, 0.8, 'out');
  const kPlus = K.io(t, wAdd, 0.5, 'out'), kMinus = K.io(t, wRem, 0.5, 'out');
  const kSq = K.io(t, cStray + 0.35, 0.5, 'out');
  let walkEye = null, guideTip = null;
  // while the right column is up the sheet ends at screen x 980, so it never shows through the gaps between panels
  const kNarrow = K.io(t, cInd - 0.2, 0.7, 'io');
  const sheetR = L.sheet.x + L.sheet.w, narrowR = (980 - 960) / cam.z + cam.x;
  K.withCam(cam, () => {
    M.sheet(t, { w: K.lerp(sheetR, narrowR, kNarrow) - L.sheet.x });
    M.mainPath();
    M.trail(L.side, { kind: 'side' });
    const [s1, s2] = L.sideStones;
    M.back(L.stoneX[0], L.pathY, L.stoneX[1], L.pathY);
    M.back(L.stoneX[1], L.pathY, s1[0], s1[1], { bend: 0 });
    M.back(s1[0], s1[1], s2[0], s2[1], { bend: 0 });
    M.back(s2[0], s2[1], L.mergeX, L.pathY, { bend: 0 });
    M.back(L.stoneX[1], L.pathY, L.mergeX, L.pathY, { bend: 30 });
    M.stone(L.stoneX[0], L.pathY, { id: id.home, ts });
    M.stone(L.stoneX[1], L.pathY, { id: id.about, ts });
    M.stone(s1[0], s1[1], { id: id.contact, ts, idAlpha: 0 });
    M.stone(s2[0], s2[1], { id: id.phone, ts, idAlpha: 0 });
    M.stone(L.mergeX, L.pathY, { id: id.merge, ts });
    M.signFor('feature/contact', s2[0], s2[1], { ts });
    M.signFor('main', L.mergeX, L.pathY, { ts, t, lantern: 1 });

    // yesterday's squiggle, rubbed out (shows faintly through the paper once it lies down)
    const SQUIG = [[600, 690], [625, 668], [648, 694], [672, 668], [696, 692]];
    K.layer(0.55 * kTrace, () => K.path(SQUIG, { head: false, color: C.soft, w: 3, dash: [5, 7], tension: 0.5 }));

    // the tracing paper and its marks: what was added is traced in gold, what was removed in terracotta
    M.tracing(SHEET[0], SHEET[1], SHEET[2], SHEET[3], { k: kTrace, label: 'tracing paper · what changed' });
    const dy = -(1 - K.ease.out(kTrace)) * 40;              // marks ride down with the sheet
    K.at(0, dy, 1, 0, () => {
      // added: the side trail and its two new stones, traced over in gold as the word lands
      if (kPlus > 0) {
        g.save(); g.shadowColor = K.rgba(C.head, 0.6); g.shadowBlur = 14;
        K.path(L.side, { head: false, color: C.head, w: 6, tension: 0.5, k: K.io(t, wAdd - 0.1, 0.9, 'io'), alpha: 0.9 });
        g.restore();
        L.sideStones.forEach(([x, y], i) => {
          const k = K.io(t, wAdd + 0.3 + i * 0.2, 0.4, 'out'); if (k <= 0) return;
          g.save(); g.globalAlpha *= k; g.beginPath(); g.arc(x, y, 30 + 6 * (1 - k), 0, 7); g.lineWidth = 4; g.strokeStyle = C.head; g.stroke(); g.restore();
        });
      }
      // removed: yesterday's squiggle, traced over in terracotta
      if (kMinus > 0) K.path(SQUIG, { head: false, color: C.accent, w: 6, tension: 0.5, k: K.io(t, wRem - 0.1, 0.8, 'io') });
      M.diff('+', 760, 372, { k: kPlus, s: 40 });
      M.diff('-', 740, 682, { k: kMinus, s: 40 });
      // a page of the file itself, sketched on the paper: one line struck out in terracotta, one added in gold
      const kPg = K.io(t, cTrace + 0.9, 0.6, 'out');
      if (kPg > 0) K.layer(kPg, () => {
        const px = 212, py = 268, pw = 262, ph = 150, fs = 26 * ts;
        g.save(); g.fillStyle = K.rgba(C.paper, 0.08); g.strokeStyle = K.rgba(C.paper, 0.5); g.lineWidth = 2;
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + pw - 24, py); g.lineTo(px + pw, py + 24); g.lineTo(px + pw, py + ph); g.lineTo(px, py + ph); g.closePath(); g.fill(); g.stroke(); g.restore();
        K.text('index.html', px + 16, py + 34, { font: 'mono', size: fs, color: C.strong });
        const ln = (y, x1, col, w) => { g.save(); g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(px + 44, y); g.lineTo(x1, y); g.stroke(); g.restore(); };
        ln(py + 66, px + pw - 40, K.rgba(C.paper, 0.35), 5);
        // removed line: terracotta, with a '-' in the gutter
        if (kMinus > 0) K.layer(kMinus, () => { ln(py + 96, px + 44 + (pw - 110) * K.ease.out(kMinus), C.accent, 6); M.diff('-', px + 22, py + 96, { k: 1, s: 18 }); });
        else ln(py + 96, px + pw - 66, K.rgba(C.paper, 0.35), 5);
        // added line: gold, with a '+' in the gutter
        if (kPlus > 0) K.layer(kPlus, () => { ln(py + 124, px + 44 + (pw - 80) * K.ease.out(kPlus), C.head, 6); M.diff('+', px + 22, py + 124, { k: 1, s: 18 }); });
      });
    });
    // the two new stones' IDs, drawn after the gold trace (on a paper backing) so the curve never runs over them
    [[s1, id.contact], [s2, id.phone]].forEach(([[x, y], sid]) => {
      const ly = y + L.stoneR + 34 * ts + 10, sz = 26 * ts, w = K.measure(sid, { ...M.T.mono, size: sz }) + 16;
      g.save(); g.fillStyle = K.rgba(K.mixColor(M.P.sheet, C.paper, 0.12), 0.88);
      K.rr(x - w / 2, ly - sz * 0.95, w, sz * 1.3, 8); g.fill(); g.restore();
      K.text(sid, x, ly, { ...M.T.mono, size: sz, color: C.body, align: 'center' });
    });
    M.diff('square', SQ[0], SQ[1], { k: kSq, s: 46 });
    if (kSq > 0) K.text('deploy.yml', SQ[0] - 40, SQ[1] + 9 * ts, { ...M.T.mono, size: 26 * ts, color: C.accent, alpha: kSq, align: 'right' });

    // the guide and the walker
    const kSelfG = K.io(t, cSelf + 0.2, 0.6);
    const GY = K.lerp(L.guide[1], L.guide[1] + 40, K.io(t, cTrace + 0.3, 0.8, 'io'));   // steps down off the sheet's edge
    const gd = M.guide(t, L.guide[0], GY, { penTo: kSelfG > 0.5 ? [L.guide[0] + 400, GY - 120] : [L.guide[0] + 120, GY - 160] });
    guideTip = gd.tip;
    const wk = M.walker(t, WALK[0], WALK[1], {});
    walkEye = wk.eye;
  });
  const eye = M.toScreen(cam, walkEye[0], walkEye[1]);
  const gMid = M.toScreen(cam, L.guide[0], L.guide[1] + 40);

  // ------------------------------------------------------------------ right column, phase A: the legend
  const RX = 1000, RW = 800;
  const aLeg = 1 - K.io(t, cInd - 0.1, 0.5);
  const kLegIn = K.io(t, cTrace + 1.5, 0.6, 'out');        // on "lay tracing paper": the right half is never empty
  if (aLeg > 0.002 && kLegIn > 0) K.layer(aLeg * kLegIn, () => {
    K.eyebrow('lay it over yesterday’s map', RX + 20, 360, { size: 26, color: C.head });
    // each row waits at .3 until its word, then lights and pins itself to its mark on the paper
    const row = (k, kind, word, sub, y, to, ctl) => K.layer(0.3 + 0.7 * k, () => {
      M.diff(kind, RX + 50, y, { k: Math.max(0.6, k), s: 40 });
      K.text(word, RX + 100, y + 12, { font: 'ui', weight: 600, size: 36, color: kind === '+' ? C.head : C.accent });
      K.text(sub, RX + 100 + K.measure(word, { font: 'ui', weight: 600, size: 36 }) + 18, y + 12, { font: 'ui', size: 28, color: C.body });
      if (k > 0) K.arrow(RX + 18, y, to[0], to[1], { k, cx: ctl[0], cy: ctl[1], color: kind === '+' ? C.head : C.accent, w: 2.5, dash: [6, 7], headSize: 10 });
    });
    const pPlus = M.toScreen(cam, 760 + 36, 372), pMinus = M.toScreen(cam, 740 + 34, 690);
    row(K.io(t, wAdd + 0.2, 0.6, 'out'), '+', 'additions', 'in one colour', 440, pPlus, [820, 385]);
    row(K.io(t, wRem + 0.2, 0.6, 'out'), '-', 'removals', 'in another', 520, pMinus, [830, 760]);
    const kd = K.io(t, wDiff - 0.1, 0.5, 'out');
    K.layer(kd, () => {
      K.line(RX + 20, 578, RX + 520, 578, { color: C.line2, w: 2, k: kd });
      K.text('= the diff', RX + 100, 640, { font: 'ui', weight: 700, size: 40, color: C.strong });
    });
  });

  // ------------------------------------------------------------------ phase B/C: the drawn desktop-app mock-up
  // chip: '+N' gold, '−M' terracotta in a rounded pill; returns {x0, w, plusX, minusX}
  const pm = (plus, minus, x, y, o = {}) => {
    const sz = o.size || 30, f = { font: 'mono', weight: 600, size: sz };
    const wp = K.measure(plus, f), wm = K.measure(minus, f), w = wp + wm + 18 + 44, h = sz * 1.7;
    const x0 = o.right ? x - w : x;
    K.card(x0, y - h / 2, w, h, { r: h / 2, fill: C.panel || C.tile, stroke: o.hot ? C.head : C.line2, lw: o.hot ? 2.5 : 1.5, shadow: false });
    K.text(plus, x0 + 22, y + sz * 0.36, { ...f, color: C.head });
    K.text(minus, x0 + 22 + wp + 18, y + sz * 0.36, { ...f, color: C.accent });
    return { x0, w, h, plusX: x0 + 22 + wp / 2, minusX: x0 + 22 + wp + 18 + wm / 2 };
  };
  // the session panel steps back to half strength once the changelog card arrives
  const aMock = K.io(t, cInd + 0.1, 0.6) * (1 - K.io(t, cList, 0.5)) * (1 - 0.5 * K.io(t, cCloud + 0.9, 0.6));
  const MY = 180, MH = 280;
  let chipGeo = null;
  if (aMock > 0.002) K.layer(aMock, () => {
    K.text("DRAWN AFTER ANTHROPIC'S DOCS, OCTOBER 2026", RX + 4, MY - 16, { font: 'ui', weight: 600, size: 20, tracking: 2.5, color: C.soft });
    K.card(RX, MY, RW, MH, { r: 22, fill: C.tile, stroke: C.line2, lw: 1.5 });
    // header: the session and its change count
    K.icon('sparkle', RX + 42, MY + 50, 30, { color: C.head });
    K.text('Session · fix the typo', RX + 74, MY + 60, { font: 'ui', weight: 600, size: 28, color: C.strong });
    const kChip = K.io(t, wInd, 0.5, 'out');
    K.layer(kChip, () => { chipGeo = pm('+12', '-1', RX + RW - 28, MY + 50, { right: true, hot: K.env(t, wInd + 5, wInd + 7.6, 0.4) > 0.5 }); });
    if (!chipGeo) chipGeo = { x0: RX + RW - 160, w: 132, h: 51, plusX: RX + RW - 110, minusX: RX + RW - 56 };
    K.line(RX + 24, MY + 96, RX + RW - 24, MY + 96, { color: C.line2, w: 1.5 });
    // "lines added" / "lines removed": arrows up to the two halves of the chip, before the list opens
    const kOpen = K.io(t, wRemoved + 1.0, 0.6);
    const kA = K.io(t, wAdded - 0.15, 0.45, 'out') * (1 - kOpen), kR = K.io(t, wRemoved - 0.15, 0.45, 'out') * (1 - kOpen);
    K.layer(kA, () => {
      K.text('lines added', RX + RW - 300, MY + 160, { font: 'ui', weight: 600, size: 28, color: C.head, align: 'right' });
      K.arrow(RX + RW - 292, MY + 150, chipGeo.plusX, MY + 80, { k: kA, color: C.head, w: 2.5, headSize: 11, bend: -20 });
    });
    K.layer(kR, () => {
      K.text('lines removed', RX + RW - 160, MY + 225, { font: 'ui', weight: 600, size: 28, color: C.accent, align: 'right' });
      K.arrow(RX + RW - 150, MY + 214, chipGeo.minusX, MY + 80, { k: kR, color: C.accent, w: 2.5, headSize: 11, bend: -16 });
    });
    // the diff view, file by file
    const rowF = (i, name, plus, minus, nameCol) => {
      const k = K.stagger(t, wRemoved + 1.15, i, 0.15, 0.5), y = MY + 140 + i * 50;
      K.layer(k * kOpen, () => {
        K.icon('file', RX + 44, y - 9, 28, { color: nameCol || C.body });
        K.text(name, RX + 72, y, { font: 'mono', size: 26, color: nameCol || C.strong });
        const f = { font: 'mono', weight: 600, size: 26 };
        const wm = minus ? K.measure(minus, f) : 0;
        if (minus) K.text(minus, RX + RW - 36, y, { ...f, color: C.accent, align: 'right' });
        K.text(plus, RX + RW - 36 - (minus ? wm + 16 : 0), y, { ...f, color: C.head, align: 'right' });
      });
    };
    // the same two files the real capture shows later; together the docs' example +12 -1
    rowF(0, 'index.html', '+11', '-1');
    rowF(1, 'deploy.yml', '+1', '', C.accent);
    // auto mode: the change is already on disk
    const kDisk = K.io(t, wDisk - 0.1, 0.5, 'out');
    K.layer(kDisk, () => {
      K.icon('file', RX + 44, MY + 247, 28, { color: C.head });
      const w1 = M.pillL('already on disk', RX + 72, MY + 252, { size: 26, color: C.head, stroke: C.head, fill: C.tile });
      M.chip('in auto mode', RX + 72 + w1 + 14, MY + 252);
    });
  });
  // the pointer: arrives at the chip, clicks it, leaves
  const tClick = wRemoved + 0.75;
  const aCur = K.env(t, wAdded + 0.4, tClick + 1.3, 0.4) * aMock;
  if (aCur > 0.002 && chipGeo) {
    const kMove = K.io(t, wAdded + 0.4, tClick - wAdded - 0.55, 'io');
    const cx = K.lerp(RX + RW - 250, chipGeo.x0 + chipGeo.w * 0.45, kMove), cy = K.lerp(MY + MH + 90, MY + 58, kMove);
    K.cursor(cx, cy, { alpha: aCur, click: K.seg(t, tClick, tClick + 0.55), ripple: true, press: K.env(t, tClick - 0.05, tClick + 0.15, 0.08) });
  }

  // S208 card (desktop app), then the cloud row and the changelog card (cloud sessions)
  const CY = MY + MH + 20;
  const aS208 = K.io(t, cInd + 2.4, 0.6) * (1 - K.io(t, cCloud - 0.2, 0.5));
  M.dated(RX, CY, RW, {
    alpha: aS208, quote: true, size: 28,
    eyebrow: 'Anthropic · Get started with the desktop app · ' + M.READ,
    body: 'After Claude edits files, a +12 -1 indicator appears. Click it to open the diff view, review modifications file by file, and comment on specific lines.',
  });
  const aCloud = K.io(t, cCloud + 0.1, 0.6) * (1 - K.io(t, cList, 0.5));
  if (aCloud > 0.002) K.layer(aCloud, () => {
    const h = 120;
    K.card(RX, CY, RW, h, { r: 22, fill: C.tile, stroke: C.line2, lw: 1.5 });
    K.icon('cloud', RX + 44, CY + 36, 30, { color: C.body });
    K.text('CLOUD SESSION · ANTHROPIC, USE CLAUDE CODE IN THE CLOUD', RX + 72, CY + 44, { font: 'ui', weight: 600, size: 20, tracking: 2, color: C.head });
    const cg = pm('+42', '-18', RX + 28, CY + 84, { size: 28 });
    K.text('vs the base branch', cg.x0 + cg.w + 18, CY + 93, { font: 'ui', size: 26, color: C.body });
    K.pill('Compare against ▾', RX + RW - 176, CY + 84, { size: 26, font: 'mono', color: C.strong, stroke: C.line2 });
  });
  M.dated(RX, CY + 120 + 16, RW, {
    alpha: K.io(t, cCloud + 0.9, 0.6) * (1 - K.io(t, cList, 0.5)), size: 28,
    eyebrow: 'Claude Code changelog · v2.1.309 · 2026-10-22',
    body: 'The cloud Changes pane “now says when it lists only pushed commits or only Claude’s edits.” Read that label first.',
    footer: true,
  });

  // ------------------------------------------------------------------ phase D: the real terminal (changed-files)
  // only the commit and the file list: the staging commands that planted the stray change stay off screen
  const TO = { cps: 40, speed: 3, think: 0.25, gap: 0.45, size: 26, pad: 24, start: 0.3, only: [8, 9] };
  const sch = K.termTimes('changed-files', TO);
  const it9 = sch.items[sch.items.length - 1];       // git diff --stat main
  // pre-roll: the file list prints just before "code" ends the sentence about it
  const outAt = it9 && it9.out.length ? it9.out[0].at : 8;
  const off = (wCode - 0.4) - outAt;
  const kTerm = K.io(t, cList + 0.15, 0.6);
  const TR = { x: RX - 10, y: 180, w: RW + 30, h: 450 };
  let rect = null;
  if (kTerm > 0.002) {
    rect = M.term({ k: kTerm, x: TR.x, y: TR.y, w: TR.w, h: TR.h, title: 'Git Bash · demo-site · the changed files' });
    const tt = t - off;
    const kAsk = K.io(t, cSelf + 0.1, 0.6, 'out');
    K.termReplay(rect, tt, 'changed-files', {
      ...TO, alpha: kTerm,
      marks: [{ at: cSelf + 0.1 - off, until: 1e9, match: 'index.html | 2 +-' }],
    });
    const rows = termRows(K.capture('changed-files'), sch, rect, tt, TO);
    const dep = rows.find('deploy.yml | 1 +'), idx = rows.find('index.html | 2 +-');
    // terracotta box: the file you never asked about
    const kBox = K.io(t, cStray + 0.1, 0.6, 'out');
    if (dep && kBox > 0) {
      K.layer(kTerm, () => {
        g.save();
        const per = 2 * (dep.bw + dep.bh);
        g.setLineDash([per * kBox, per]); g.lineWidth = 3.5; g.strokeStyle = C.accent; g.shadowColor = K.rgba(C.accent, 0.45); g.shadowBlur = 12;
        K.rr(dep.bx, dep.by, dep.bw, dep.bh, 10); g.stroke(); g.restore();
        const lx = Math.max(dep.endX, idx ? idx.endX : 0) + 36, ly = dep.by + dep.bh / 2;
        const k1 = K.io(t, cStray + 0.35, 0.5, 'out') * (1 - K.io(t, wOnly - 0.1, 0.4));
        const k2 = K.io(t, wOnly + 0.1, 0.5, 'out');
        K.layer(k1, () => K.text('the file you never asked about', lx, ly + 9, { font: 'ui', weight: 700, size: 26, color: C.accent }));
        K.layer(k2, () => K.text('only you: files you never named', lx, ly + 9, { font: 'ui', weight: 700, size: 26, color: C.accent }));
        // a thin terracotta thread from the line to its square on the tracing paper
        const sq = M.toScreen(cam, SQ[0], SQ[1]);
        K.line(dep.bx - 4, ly, sq[0] + 30, sq[1], { k: K.io(t, cStray + 0.45, 0.6, 'out'), color: C.accent, w: 2, alpha: 0.7, dash: [6, 7] });
      });
    }
    // gold label on index.html: the file you asked about (labels on both rows share one left edge)
    if (idx && kAsk > 0) K.layer(kAsk * kTerm, () => {
      const lx = Math.max(idx.endX, dep ? dep.endX : 0) + 36, ly = idx.by + idx.bh / 2;
      K.text('the file you asked about', lx, ly + 9, { font: 'ui', weight: 700, size: 26, color: C.head });
    });
    // the agent's own review, on "slash code review": a check ring under the terminal, tied to index.html
    const kRev = K.io(t, wSlash - 0.1, 0.5, 'out');
    if (idx && kRev > 0) K.layer(kRev * kTerm, () => {
      const cy = TR.y + TR.h + 44, cx = TR.x + 34;
      const ex = TR.x - 16, iy = idx.by + idx.bh / 2;
      K.path([[idx.bx - 2, iy], [ex, iy], [ex, cy], [cx - 22, cy]], { head: false, color: C.head, w: 2, dash: [5, 6], tension: 0, k: kRev });
      g.save(); g.beginPath(); g.arc(cx, cy, 19, 0, 7); g.fillStyle = C.tile; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.head; g.stroke(); g.restore();
      K.icon('check', cx, cy, 24, { color: C.head, w: 2.6 });
      M.chip('/code-review: bugs in the code', cx + 32, cy, { color: C.strong });
    });
    // the /code-review card under the terminal
    M.dated(TR.x, TR.y + TR.h + 90, TR.w, {
      alpha: K.io(t, cSelf + 0.5, 0.6), size: 28, quote: true,
      eyebrow: 'Anthropic · Get started with the desktop app · ' + M.READ,
      body: 'To have Claude review the changes itself, enter /code-review',
    });
  }

  // the guide's badge (screen space so it stays 26 px), and a faint pen line toward its own review
  const kBadge = K.io(t, wSlash - 0.1, 0.5, 'out');
  // right of the guide tile, at its height (clear of the sheet's bottom edge and the pen)
  const bw = K.measure('/code-review', { font: 'mono', size: 26 }) + 44;
  if (kBadge > 0) K.layer(kBadge, () => K.pill('/code-review', gMid[0] + 150 + bw / 2, gMid[1], { size: 26, font: 'mono', color: C.page, fill: C.head, stroke: C.head }));

  // ------------------------------------------------------------------ the walker's sight-line (screen space)
  const tracingC = M.toScreen(cam, 700, 470);
  const mockP = [RX - 6, MY + 140];
  const termP = rect ? [RX - 6, TR.y + 260] : mockP;
  const sqS = M.toScreen(cam, SQ[0] + 6, SQ[1] + 36);
  let tgt = tracingC, sa = 0.4;
  const kToMock = K.io(t, cInd + 0.2, 0.6), kToTerm = K.io(t, cList + 0.4, 0.6), kToSq = K.io(t, cStray + 0.35, 0.3, 'out');
  const mix = (a, b, k) => [K.lerp(a[0], b[0], k), K.lerp(a[1], b[1], k)];
  tgt = mix(tracingC, mockP, kToMock);
  tgt = mix(tgt, termP, kToTerm);
  tgt = mix(tgt, sqS, kToSq);
  sa = K.lerp(0.4, 0.8, kToSq) + 0.2 * K.io(t, wOnly, 0.5);
  M.sight(eye[0], eye[1], tgt[0], tgt[1], { alpha: sa * K.io(t, cTrace + 0.4, 0.6) });
  void guideTip; void wDeploy;

  // The rows the terminal replay is showing at capture time tt (mirrors engine/kit.js drawTerm for a bash capture:
  // no blank lines, the same wrapping and scrolling), so a scene can box a line in a colour of its own.
  // Returns {find(text) -> {bx, by, bw, bh, endX} | null} for the newest visible row containing text.
  function termRows(c, sch, r, tt, o) {
    if (!c || !sch || !sch.items.length) return { find: () => null };
    const size = o.size || 30, lh = o.lh || size * 1.45, pad = o.pad ?? 30;
    const cw = K.measure('M', { font: 'mono', size }), cols = Math.max(10, Math.floor((r.w - pad * 2) / cw));
    const rows = [];
    const wrap = (s) => { if (!s.length) { rows.push(''); return; } for (let i = 0; i < s.length; i += cols) rows.push(s.slice(i, i + cols)); };
    sch.items.forEach((it, i) => {
      const shownFrom = i === 0 ? -Infinity : sch.items[i - 1].done;
      if (tt < shownFrom) return;
      const n = it.keys.filter((k) => k <= tt).length;
      wrap(it.prompt + it.cmd.slice(0, n));
      if (tt < it.enter) return;
      it.out.forEach((ln) => { if (ln.at <= tt) wrap(ln.s); });
    });
    const last = sch.items[sch.items.length - 1];
    if (tt >= last.done && o.idle !== false) wrap(last.prompt);
    const maxRows = Math.max(1, Math.floor((r.h - pad * 2 + (lh - size)) / lh));
    const first = Math.max(0, rows.length - maxRows), shown = rows.slice(first);
    return {
      find(text) {
        let hit = null;
        shown.forEach((s, i) => { const at = s.indexOf(text); if (at >= 0) hit = { i, at, len: s.length }; });
        if (!hit) return null;
        const yy = r.y + pad + size * 0.85 + hit.i * lh;
        return { bx: r.x + pad + hit.at * cw - 10, by: yy - size * 0.98, bw: text.length * cw + 20, bh: size * 1.4, endX: r.x + pad + hit.len * cw };
      },
    };
  }
});
