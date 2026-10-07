/* 13 — The lantern: AI makes the file, the ledger still opens it
   Room under the lantern. 2021: you tie your own tag, AI is a ghost line of autocomplete.
   2023 → 2025: the agent (gold sparkle) ties tags on six new strings. show → asks the porter (ledger lifts,
   .pdf carried to Browser); run → names the program (dashed path straight to the Python door, ledger shut).
   Then three dated panels over the dimmed room (AI actions by label · File Explorer connector · macOS 27 names),
   and the heading: guarded rows + permissioned doors. Exit: room under the lantern, strings at their doors. */
SCENE('13', (t, S) => {
  K.bg();
  const C = K.C, L = M.layout;
  const io = (a, d = 0.6, e) => K.io(t, a, d, e);
  const inOut = (a, b, d = 0.5) => K.io(t, a, d) * (1 - K.io(t, b, d));
  const W = (re, n, f) => S.find(re, n, f);

  // ---------------------------------------------------------------- beats
  const tAsk = S.cue('assistants', 6.7), tSR = S.cue('show-run', 21.75), tAI = S.cue('ai-actions', 32.22);
  const tCon = S.cue('connector', 42.96), tMac = S.cue('mac-names', 51.33), tHead = S.cue('heading', 57.67);
  const wNamed = W('named', 0, 2.03), wAI = W('AI', 0, 4.15), wAuto = W('autocomplete', 0, 4.74);
  const wAssist = W('assistants', 0, 10.1), wClaude = W('Claude', 0, 10.98), wWord = W('Word', 0, 13.18), wExcel = W('Excel', 0, 14.06);
  const wPP = W('PowerPoint', 0, 15.14), wPDF = wPP + 0.9, wCoding = W('coding', 0, 17.8), wProject = W('project', 0, 18.84);
  const wLabels = W('labels', 0, 19.86);
  const wShows = W('shows', 0, 22.52), wAsks = W('asks', 0, 24.65), wRuns = W('runs', 0, 27.05);
  const wNames = W('names', 0, 28.33), wWalks = W('walks', 0, 29.49);
  const wStarted = W('started', 0, 32.96), wRight = W('right-click', 0, 34.97), wDepends = W('depends', 0, 37.55);
  const wLabel = W('label:', 0, 38.22), wImage = W('image', 0, 39.1);
  const wPreview = W('previewing', 0, 44.01), wReach = W('reach', 0, 45.65), wOnly = W('only', 1, 46.77);
  const wAllow = W('allow', 0, 47.87), wReports = W('reports', 0, 49.25), wExt = W('extension', 0, 49.8);
  const wSuggests = W('suggests', 0, 53.16), wStillLabel = W('label', 2, 55.97);
  const wRows = W('rows', 0, 59.51), wDoors = W('doors', 0, 61.95);

  // ---------------------------------------------------------------- the lantern (top-right, always lit)
  const lanX = 1700, lanY = 162;
  K.glow(lanX, lanY + 40, 420, C.head, 0.10);
  K.line(lanX, 128, lanX, lanY - 30, { color: K.rgba(C.line2, 0.8), w: 2 });
  K.glow(lanX, lanY, 90, C.head, 0.30);
  K.icon('lantern', lanX, lanY, 58, { color: C.head, w: 3 });

  // ---------------------------------------------------------------- room alpha: dim · full (show/run) · dim (panels) · full (heading)
  // under the panels the room stays as a quiet background (15%): the panels crossfade in while it is still ~40-80%
  const roomA = 0.58 + 0.42 * io(tSR, 0.7) - 0.6 * io(tAI, 0.6) - 0.25 * io(tAI + 0.6, 0.8) - 0.08 * io(tMac - 0.3, 0.6) + 0.93 * io(tHead, 0.8);
  // (during macOS the room drops a little further, ~7%, so the lone Preview door does not read as a sixth rack door)

  // the show / run carry timings
  const liftK = io(wShows + 0.5, 0.8) * (1 - io(wRuns - 0.3, 0.8));
  const fingerK = io(wShows + 1.4, 0.4) * (1 - io(wRuns - 0.5, 0.3));
  const cA = wAsks, cD = 1.4, pdfHold = io(cA + cD - 0.05, 0.5);
  const rA = wNames + 0.5, rD = 1.4, appHold = io(rA + rD - 0.05, 0.5);
  const browserFocus = io(cA + cD - 0.3, 0.4) * (1 - 0.85 * io(rA + rD - 0.3, 0.5));
  const pyFocus = io(rA + rD - 0.3, 0.4) * (1 - 0.85 * io(tAI + 1, 0.8));
  const headLift = io(tHead + 0.4, 0.8);
  const lockK = (i) => io(wDoors + i * 0.3, 0.5);

  // ledger rows: finger on .pdf during "show"; glass slides onto .html and .pdf in the heading
  const rows = M.ROWS.map((r, i) => ({ ...r, glass: i >= 3 ? io(wRows + (i - 3) * 0.25, 0.6) : 0 }));
  const R = M.room({
    t, alpha: Math.max(roomA, 0.004), // K.layer skips at alpha <= 0.002 (M.room would return no doors); 0.004 is invisible
    porter: { look: -1 * io(wShows + 0.4, 0.6) * (1 - io(wRuns - 0.3, 0.6)) },
    lift: Math.max(liftK, headLift),
    ledger: { rows, finger: 4, fingerK },
    doors: {
      names: ['Notepad', 'V S Code', 'Photos', 'Browser', 'Python'],
      each: (i, n) => n === 'Browser' ? { focus: browserFocus, holding: pdfHold, holdTint: M.STRINGS.pdf.tint, t }
        : n === 'Python' ? { focus: pyFocus, holding: appHold, t } : {},
    },
  });
  // fallback geometry so a skipped room layer can never leave the doors undefined
  const doorFallback = (cx) => ({ cx, x0: cx - 85, x1: cx + 85, y0: 300, y1: 700, mouth: { x: cx, y: 700 } });
  const dBrowser = R.doors.byName['Browser'] || doorFallback(1560), dPython = R.doors.byName['Python'] || doorFallback(1740);
  // Python's handed-over tag hangs one step lower than Browser's (doors5 are too close for two tags side by side)
  // brief.pdf's handed-over tag is drawn here (not by the door) so it can step back to 30% once 'run' starts
  const pdfQuiet = 1 - 0.7 * io(wRuns - 0.2, 0.6) * (1 - io(tHead, 0.8));
  if (pdfHold > 0) K.layer(roomA * pdfHold * pdfQuiet, () => {
    const tw = M.tagWidth('brief.pdf', 0.74, 36);
    M.tag(dBrowser.cx + tw / 2, dBrowser.y1 + 46, { name: 'brief.pdf', s: 0.74, size: 36, t, rot: -0.03 });
  });
  if (appHold > 0) K.layer(roomA * appHold, () => {
    const tw = M.tagWidth('app.py', 0.74, 36), ey = dPython.y1 + 128, ex = dPython.cx + tw / 2 - 60;
    K.line(dPython.cx, dPython.y1 + 2, ex - 24 * 0.74, ey, { color: M.palette.cord, w: 3 });
    M.tag(ex, ey, { name: 'app.py', s: 0.74, size: 36, t, rot: -0.03 });
  });

  // heading: permission locks on the two doors the agent used
  [dBrowser, dPython].forEach((d, i) => {
    const k = lockK(i); if (k <= 0) return;
    K.iconTile('lock', d.x1 - 2, d.y0 + 2, 48, { color: C.head, alpha: k, stroke: K.rgba(C.head, 0.7) });
  });

  // ---------------------------------------------------------------- date cards (top-left, one at a time)
  const cardX = 110, cardY = 140;
  M.dateCard('about 2021', 'you named every file yourself', cardX, cardY, { k: io(0.5, 0.6), alpha: 1 - io(tAsk, 0.5) });
  M.dateCard('2023 → 2025', 'AI assistants make real files', cardX, cardY, { k: io(tAsk + 0.4, 0.6), alpha: 1 - io(tSR, 0.5) });
  M.dateCard('Oct 2025 · rolling out', 'AI actions · .jpg .jpeg .png · varies by market', cardX, cardY, { k: io(wStarted, 0.6), alpha: 1 - io(tCon - 0.45, 0.45) });
  M.dateCard('Dec 2025 · preview', 'File Explorer agent connector', cardX, cardY, { k: io(tCon, 0.6), alpha: 1 - io(tMac, 0.5) });
  M.dateCard('Sept 2026', 'macOS 27 · suggested file names', cardX, cardY, { k: io(tMac + 0.3, 0.6), alpha: 1 - io(tHead, 0.5) });

  // ---------------------------------------------------------------- 1. five years ago: your hand, AI as a ghost line
  const a1 = 1 - io(tAsk, 0.6);
  if (a1 > 0) K.layer(a1, () => {
    const sx = 700, sy = 812;
    M.drawString(sx, sy, 0.3, {
      n: 8, preset: 'notes', t, labels: 'none', cordK: io(0.9, 0.6),
      beadK: (i) => K.io(t, 1.2 + i * 0.07, 0.4), tagS: 0.8,
      tag: { name: 'notes.txt', swing: io(wNamed - 0.1, 0.8) }, tagK: io(wNamed - 0.2, 0.3),
    });
    const tw = M.tagWidth('notes.txt', 0.8, 34), tagL = sx - 105 - 18.6 - tw;
    M.hand('person', 'you', 200, 800, tagL - 8, sy, { k: io(1.0, 0.8), alpha: io(0.6, 0.5) });
    // a small editor with an autocomplete ghost line
    const ek = io(wAI - 0.3, 0.6);
    if (ek > 0) K.layer(ek, () => {
      const r = K.win(1000, 744, 640, 178, { kind: 'code', title: 'total.py', titleSize: 26 });
      K.text('def total(items):', r.x + 30, r.y + 50, { font: 'mono', weight: 600, size: 28, color: C.strong });
      const gk = io(wAuto, 0.5);
      K.text('    return sum(items)', r.x + 30, r.y + 100, { font: 'mono', weight: 600, size: 28, color: C.quiet, alpha: 0.75 * gk, italic: true });
      if (gk > 0) M.agent(r.x + 470, r.y + 90, 30, { t, alpha: gk, glow: 0.6 });
      M.label('AI = autocomplete', 1320, 696, { alpha: io(wAuto + 0.2, 0.5) });
    });
  });

  // ---------------------------------------------------------------- 2. the agent ties tags on six new strings
  const agX = 860, agY = 470;
  const agentA = io(tAsk, 0.6) * (1 - io(tAI, 0.6)) + io(tHead, 0.8);
  M.agent(agX, agY, 72, { t, alpha: Math.min(1, agentA) });

  const FILES = [
    { name: 'report.docx', bytes: M.STRINGS.docx.bytes, tint: M.STRINGS.docx.tint, at: wClaude },
    { name: 'budget.xlsx', bytes: M.STRINGS.docx.bytes, tint: '#2C3640', at: wExcel },
    { name: 'deck.pptx', bytes: M.STRINGS.docx.bytes, tint: '#3A302E', at: wPP },
    { name: 'brief.pdf', bytes: M.STRINGS.pdf.bytes, tint: M.STRINGS.pdf.tint, at: wPDF },
    { name: 'app.py', bytes: M.BYTES, at: wCoding + 0.3 },
    { name: 'README.md', bytes: M.STRINGS.notes.bytes, at: wProject - 0.2 },
  ];
  const SS = 0.22, TS = 0.77, wid = (n) => M.tagWidth(n, TS, 34) + 116.2, lead = (n) => M.tagWidth(n, TS, 34) + 57.6;
  // two band rows, laid out from the measured widths
  const gap = 70, pillW = K.measure('coding agents', { font: 'ui', weight: 600, size: 28 }) + 45;
  const row1 = [0, 1, 2], row2 = [3, 4, 5];
  const tot1 = row1.reduce((s, i) => s + wid(FILES[i].name), 0) + gap * 2;
  const tot2 = row2.reduce((s, i) => s + wid(FILES[i].name), 0) + gap * 3 + pillW;
  const pos = [];
  let x = 1000 - tot1 / 2; row1.forEach((i) => { pos[i] = { x: x + lead(FILES[i].name), y: 788 }; x += wid(FILES[i].name) + gap; });
  x = 1000 - tot2 / 2; row2.forEach((i) => { pos[i] = { x: x + lead(FILES[i].name), y: 884 }; x += wid(FILES[i].name) + gap; });
  const pillX = x + pillW / 2;

  // where the two that stay go for show / run
  const pdfRest = { x: 1360, y: 862 }, appRest = { x: 1080, y: 768 };
  const pdfMove = io(tSR + 0.3, 0.8), appMove = io(tSR, 0.7);
  const pdfAt = { x: K.lerp(pos[3].x, pdfRest.x, pdfMove), y: K.lerp(pos[3].y, pdfRest.y, pdfMove) };
  const appAt = { x: K.lerp(pos[4].x, appRest.x, appMove), y: K.lerp(pos[4].y, appRest.y, appMove) };
  const carryPts = M.carryPath(pdfRest.x, pdfRest.y, dBrowser, 30);
  // app.py travels BELOW brief.pdf's tag (under the Browser sill) and stops where its hold tag hangs;
  // the dashed 'run' arrow then turns up into the Python door right of brief.pdf
  const runPts = [[appRest.x, appRest.y], [1300, 806], [1560, 808], [dPython.cx, 786]];
  const runLine = [[appRest.x, appRest.y], [1300, 806], [1560, 808], [dPython.cx + 52, 760], [dPython.cx + 52, 656]];
  const cK = io(cA, cD, 'io'), rK = io(rA, rD, 'io');

  FILES.forEach((f, i) => {
    const tie = f.at;
    if (t < tie - 0.4) return;
    // the lower row drops straight down (no swing) so its tags never sweep across the row above
    let p = pos[i], al = 1 - io(tSR, 0.6), mark = 0;
    if (i === 3) {
      al = 1 - pdfHold; p = pdfAt;
      if (cK > 0) p = M.along(carryPts, cK);
      mark = io(wShows + 1.4, 0.5);
    }
    if (i === 4) {
      al = 1 - appHold; p = appAt;
      if (rK > 0) p = M.along(runPts, rK);
    }
    if (i >= 4) mark = Math.max(mark, io(wLabels, 0.5) * (1 - io(tSR, 0.5)));
    if (i >= 3) p = { x: p.x, y: p.y - 18 * (1 - io(tie - 0.05, 0.6)) };
    if (al <= 0) return;
    // the agent's gold thread while it ties this one
    const th = inOut(tie - 0.3, tie + 0.9, 0.35);
    if (th > 0) K.line(agX, agY + 40, p.x - 44 - 13.6, p.y, { color: K.rgba(C.head, 0.55), w: 2, dash: [6, 8], alpha: th });
    M.drawString(p.x, p.y, SS, {
      n: 5, bytes: f.bytes, tint: f.tint, t, labels: 'none', alpha: al,
      beadK: (j) => K.io(t, tie - 0.3 + j * 0.06, 0.4), cordK: io(tie - 0.4, 0.4), tagS: TS,
      tag: { name: f.name, swing: i >= 3 ? 1 : io(tie, 0.8), mark }, tagK: io(tie - 0.05, 0.3),
    });
  });
  M.label('coding agents', pillX, 884, { alpha: io(wCoding + 0.5, 0.5) * (1 - io(tSR, 0.5)), color: C.head });

  // ---------------------------------------------------------------- 3. show → asks the porter · run → names the program
  const srA = 1 - io(tAI, 0.5);
  if (srA > 0 && t > tSR) K.layer(srA, () => {
    K.arrow(818, 446, 500, 404, { k: io(wShows, 0.7), bend: 95, color: C.head, w: 3.5 });
    M.label('show → asks the porter', 650, 300, { alpha: io(wShows + 0.4, 0.5) * (1 - io(wRuns - 0.2, 0.5)), color: C.head });
    // run: a dashed path straight to the Python door; the ledger stays shut
    K.path(runLine, { k: io(wRuns, 1.0), color: K.rgba(C.head, 0.85), w: 3, dash: [10, 10], head: true });
    M.chip('python app.py', 1190, 726, { alpha: io(wNames, 0.5) });
    M.label('run → names the program', 1330, 896, { alpha: io(wNames + 0.3, 0.5), color: C.head });
  });

  // ---------------------------------------------------------------- 4. AI actions follow the label
  const aiA = io(tAI + 0.6, 0.6) * (1 - io(tCon - 0.2, 0.5));
  if (aiA > 0) K.layer(aiA, () => {
    const menuItem = (s, x, y, o = {}) => K.text(s, x, y, { font: 'ui', weight: 600, size: 28, color: C.strong, ...o });
    // left: photo.png
    const lx = 620, rx = 1380, sy = 360;
    const tw1 = M.tagWidth('photo.png', 0.8, 34), tw2 = M.tagWidth('notes.txt', 0.8, 34);
    const markK = io(wLabel - 0.1, 0.5);
    M.drawString(lx + tw1 / 2, sy, 0.3, { n: 8, preset: 'png', t, labels: 'none', tagS: 0.8, tag: { name: 'photo.png', mark: markK } });
    const m1 = io(wRight, 0.5);
    if (m1 > 0) {
      const mx = lx - 180, my = 420 + (1 - m1) * 14;
      K.card(mx, my, 360, 252, { r: 16, fill: C.tile, stroke: C.line2, alpha: m1, shadow: true });
      K.layer(m1, () => {
        menuItem('Open', mx + 30, my + 48); menuItem('Open with', mx + 30, my + 98); menuItem('Rename', mx + 30, my + 148);
        K.line(mx + 20, my + 172, mx + 340, my + 172, { color: C.line2, w: 1.5 });
        const hk = io(wRight + 0.6, 0.5);
        if (hk > 0) K.card(mx + 10, my + 184, 340, 56, { r: 10, fill: K.rgba(C.head, 0.14), stroke: K.rgba(C.head, 0.6), alpha: hk });
        K.icon('sparkle', mx + 46, my + 212, 30, { color: C.head, w: 2.5 });
        menuItem('AI actions', mx + 74, my + 222, { color: C.head });
        menuItem('›', mx + 326, my + 222, { color: C.head, align: 'right' });
      });
      // the image submenu
      const sk = io(wImage - 0.2, 0.5);
      if (sk > 0) {
        const sx = mx + 372, sy2 = my + 160 + (1 - sk) * 12;
        K.card(sx, sy2, 330, 236, { r: 16, fill: C.tile, stroke: K.rgba(C.head, 0.6), alpha: sk, shadow: true });
        K.layer(sk, () => ['Visual search', 'Blur background', 'Erase objects', 'Remove background'].forEach((s, i) => menuItem(s, sx + 26, sy2 + 50 + i * 52, { size: 27 })));
      }
    }
    // right: notes.txt, same menu without AI actions
    const rk = io(wDepends - 0.3, 0.5);
    if (rk > 0) K.layer(rk, () => {
      M.drawString(rx + tw2 / 2, sy, 0.3, { n: 8, preset: 'notes', t, labels: 'none', tagS: 0.8, tag: { name: 'notes.txt', mark: markK } });
      const mx = rx - 180, my = 420;
      K.card(mx, my, 360, 252, { r: 16, fill: C.tile, stroke: C.line2, shadow: true });
      menuItem('Open', mx + 30, my + 48); menuItem('Open with', mx + 30, my + 98); menuItem('Rename', mx + 30, my + 148);
      K.line(mx + 20, my + 172, mx + 340, my + 172, { color: C.line2, w: 1.5 });
      K.text('no AI actions', mx + 180, my + 222, { font: 'ui', weight: 400, size: 28, color: C.soft, align: 'center', italic: true });
    });
    M.quiet('the label decides the menu', 960, 884, { alpha: io(wLabel + 0.3, 0.6) });
  });

  // ---------------------------------------------------------------- 5. the File Explorer connector (preview)
  const cnA = io(tCon - 0.1, 0.6) * (1 - io(tMac - 0.2, 0.5));
  if (cnA > 0) K.layer(cnA, () => {
    const ax = 380, ay = 580;
    M.agent(ax, ay, 84, { t });
    const fx = 880, f1 = 450, f2 = 740;
    const fk = io(tCon, 0.6);
    K.layer(fk, () => {
      K.folder(fx, f1, 150, { name: 'Documents', nameSize: 26 });
      K.folder(fx, f2, 150, { name: 'other folders', nameSize: 26, color: '#6E6457', alpha: 0.75 });
    });
    K.arrow(ax + 60, ay - 30, fx - 110, f1 + 10, { k: io(wReach, 0.7), color: C.head, w: 3.5, dash: [10, 9] });
    // only folders you allow: the other one is locked, the arrow stops short
    const ok = io(wOnly, 0.6);
    K.arrow(ax + 60, ay + 30, fx - 150, f2 - 20, { k: 0.85 * ok, color: K.rgba(C.soft, 0.7), w: 3, dash: [6, 9], head: false });
    if (ok > 0) K.iconTile('lock', fx, f2 + 4, 64, { color: C.strong, alpha: ok, stroke: C.line2 });
    M.label('you allow this one', fx, f1 - 120, { alpha: io(wAllow - 0.3, 0.5), color: C.head });
    // what the connector reports: the extension as its own field
    const rk = io(wReports - 0.3, 0.6);
    K.arrow(fx + 110, f1 + 10, 1180, f1 + 10, { k: rk, color: C.head, w: 3 });
    if (rk > 0) {
      const cx = 1200, cy = 360;
      K.card(cx, cy, 520, 230, { r: 18, fill: C.tile, stroke: K.rgba(C.head, 0.6), alpha: rk, shadow: true });
      K.layer(rk, () => {
        K.text('get_file_details', cx + 32, cy + 50, { font: 'mono', weight: 600, size: 26, color: C.soft });
        K.line(cx + 24, cy + 72, cx + 496, cy + 72, { color: C.line2, w: 1.5 });
        K.text('name', cx + 32, cy + 126, { font: 'mono', weight: 600, size: 30, color: C.soft });
        K.text('report', cx + 250, cy + 126, { font: 'mono', weight: 600, size: 30, color: C.strong });
        K.text('extension', cx + 32, cy + 186, { font: 'mono', weight: 600, size: 30, color: C.soft });
        const ew = K.text('.docx', cx + 250, cy + 186, { font: 'mono', weight: 600, size: 30, color: C.head });
        K.mark(cx + 250, cy + 198, ew || 92, io(wExt, 0.6), { color: C.head, w: 4 });
      });
    }
  });

  // ---------------------------------------------------------------- 6. macOS 27 suggests the name; the label still picks the app
  const mcA = io(tMac - 0.15, 0.6) * (1 - io(tHead, 0.5));
  if (mcA > 0) K.layer(mcA, () => {
    const s = 0.4, n = 8, ts = 0.8;
    const twA = M.tagWidth('Trip receipts.pdf', ts, 34);
    const bx = 330 + twA + 62 * s + 3.5 * 100 * s, by = 540;
    const rn = io(wSuggests + 0.3, 1.0);
    const st = M.drawString(bx, by, s, {
      n, preset: 'pdf', t, labels: 'none', tagS: ts, hold: inOut(wSuggests + 0.1, wStillLabel - 0.3, 0.5),
      tag: { name: 'scan_0412.pdf', to: 'Trip receipts.pdf', k: rn, mark: io(wStillLabel, 0.5), w: twA },
    });
    // macOS's own suggestion: a small gold sparkle by the tag while the name is rewritten
    const sg = inOut(wSuggests - 0.2, wStillLabel, 0.5);
    if (sg > 0 && st.tag) M.agent(st.tag.x0 + 40, st.tag.y0 - 30, 36, { t, alpha: sg, glow: 0.7 });
    const pd = M.door(1480, 300, 170, 400, { name: 'Preview', focus: io(wStillLabel + 0.7, 0.5), t });
    if (st.tag) K.arrow(st.tag.ext.cx, st.tag.ext.cy - 40, pd.x0 - 18, pd.y0 + 170, { k: io(wStillLabel + 0.2, 0.7), cx: 1000, cy: 300, color: C.head, w: 3.5 });
  });

  // ---------------------------------------------------------------- 7. the direction looks like
  const hdA = io(tHead + 0.5, 0.6);
  if (hdA > 0) K.layer(hdA, () => {
    K.eyebrow('the direction looks like', 112, 170, { size: 22 });
    const p1 = 'more guarded rows', p2 = 'permissioned doors for agents';
    const w1 = K.measure(p1, { font: 'ui', weight: 600, size: 28 }) + 45, w2 = K.measure(p2, { font: 'ui', weight: 600, size: 28 }) + 45;
    M.label(p1, 112 + w1 / 2, 228, { alpha: io(wRows - 0.2, 0.5), color: C.head });
    M.label(p2, 112 + w1 + 22 + w2 / 2, 228, { alpha: io(wDoors - 0.2, 0.5), color: C.head });
  });
});
