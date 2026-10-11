/* 01.06 scene 06 — Task Manager: the staff board.
   The staff board on the kitchen wall grows into Task Manager (M.board, a drawn mock-up). Tabs light in step with
   the narration: Processes -> Details (rows linked to their cooks) -> Services (night staff) -> Startup apps ->
   End task (a row and its cook go) -> the two new hidden columns (NPU, Isolation) -> Mac / Linux equivalents.
   Exit: Task Manager steady on the Processes view. */
SCENE('06', (t, S) => {
  const M = window.M, C = K.C, L = M.L, g = K.ctx();
  K.bg();

  // ---------------------------------------------------------------- cues (local seconds)
  const cShort = S.cue('shortcut', 0);
  const cProc = S.cue('processes-tab', 11.02);
  const cDet = S.cue('details', 17.4);
  const cSvc = S.cue('services-tab', 21.97);
  const cEnd = S.cue('end-task', 27.62);
  const cCols = S.cue('new-columns', 33.15);
  const cElse = S.cue('elsewhere', 44.76);
  const wWin = S.find('Windows', 0, cShort + 2.6);
  const wCtrl = S.find('Control', 0, cShort + 4.7);
  const wShift = S.find('Shift', 0, cShort + 5.6);
  const wEsc = S.find('Escape', 0, cShort + 6.2);
  const wFive = S.find('Five', 0, cShort + 7.5);
  const wApps = S.find('apps', 0, cProc + 2.5);
  const wBack = S.find('background', 0, cProc + 3.1);
  const wWinP = S.find('Windows', 1, cProc + 4.7);
  const wRow = S.find('row', 0, cDet + 1.1, { whole: true });
  const wPid = S.find('P', 1, cDet + 2.9, { whole: true });
  const wStart = S.find('Startup', 0, cSvc + 2.3);
  const wStops = S.find('stops', 0, cEnd + 0.8);
  const wOnce = S.find('once', 0, cEnd + 1.94);
  const wGone = S.find('gone', 0, cEnd + 4.34);
  // End task beats: select at the cue, press on "once", row + cook fade, then the gap closes
  const selK = K.io(t, cEnd - 0.05, 0.45);
  const pressAt = wOnce - 0.1;
  const goneK = K.io(t, pressAt + 0.3, 0.4);
  const closeK = K.io(t, pressAt + 0.8, 0.45);
  const wWhat = S.find('Whatever', 0, cEnd + 2.7);
  const wHidden = S.find('hidden', 0, cCols + 2.2);
  const wN = S.find('N', 0, cCols + 4.3, { whole: true });
  const wIso = S.find('Isolation', 0, cCols + 8.4);
  const wAct = S.find('Activity', 0, cElse + 1.5);
  const wLinux = S.find('Linux', 0, cElse + 3.3);

  // ---------------------------------------------------------------- the kitchen behind (05's end state), fading away
  const grow = K.io(t, wWin - 0.2, 1.0);
  const kitchenA = 0.55 * (1 - K.io(t, wWin - 0.2, 0.9));
  if (kitchenA > 0.002) K.layer(kitchenA, () => {
    M.shelf(t, { cards: [{ name: 'node.exe' }, { name: 'python.exe' }, { name: 'ollama.exe' }, { name: 'hello.py', icon: 'file' }] });
    M.counter(t, {});
    M.cook(t, M.cookAt(0).x, L.cookY, 96, { pid: 18412, satchel: true });
    M.cook(t, M.cookAt(2).x, L.cookY, 96, { kind: 'tray', pid: 1168 });
    M.cook(t, M.cookAt(3).x, L.cookY, 96, { ai: true, pid: 22124, satchel: true });
    M.cook(t, M.cookAt(6).x, L.cookY, 96, { kind: 'service' });
    M.cook(t, M.cookAt(7).x, L.cookY, 96, { kind: 'service' });
  });

  // ---------------------------------------------------------------- board geometry
  // narrow (cooks shown at the right) from Details until the new columns; full width otherwise
  const nk = K.io(t, cDet, 0.7) * (1 - K.io(t, cCols, 0.7));
  const bxw = K.lerp(240, 100, nk), bw = K.lerp(1440, 1180, nk), by = 150, bh = 700;
  const navW = L.board.nav, bodyX = bxw + navW + 36, bodyW = bw - navW - 72, headY = by + 120;
  const rowH = 52;

  // ---------------------------------------------------------------- tab phases
  const ph = [
    { at: -99, tab: 'Processes', id: 'empty' },
    { at: cProc, tab: 'Processes', id: 'proc' },
    { at: cDet, tab: 'Details', id: 'det' },
    { at: cSvc, tab: 'Services', id: 'svc' },
    { at: wStart, tab: 'Startup apps', id: 'start' },
    { at: cEnd - 0.3, tab: 'Details', id: 'end' },
    { at: cCols, tab: 'Processes', id: 'cols' },
  ];
  let pi = 0; ph.forEach((p, i) => { if (t >= p.at) pi = i; });
  const FADE = 0.25;
  // 'proc' keeps the same rows as 'empty' (they light up); 'end' arrives already filled (no empty table)
  const noFade = ph[pi].id === 'proc' || ph[pi].id === 'end';
  const inFade = !noFade && pi > 0 && t < ph[pi].at + FADE;
  const content = inFade ? ph[pi - 1] : ph[pi];
  const cA = inFade ? 1 - (t - ph[pi].at) / FADE : 1; // old content fading out
  const c0 = ph[pi].at + FADE; // new rows start here
  const navTab = ph[pi].tab;
  const tabK = pi === 0 ? 0 : (ph[pi - 1].tab === navTab && ph[pi - 1].id !== 'empty' ? 1 : K.io(t, ph[pi].at, 0.45));

  // rows k: staggered from start time a
  const st = (a, i, step = 0.09) => K.io(t, a + i * step, 0.45);

  const npuK = K.io(t, wN - 0.15, 0.6), isoK = K.io(t, wIso - 0.15, 0.6);
  function tabSpec(id) {
    if (id === 'empty' || id === 'proc' || id === 'cols') {
      const cols = [{ name: 'Name' }, { name: 'CPU', w: 170 }, { name: 'Memory', w: 170 }];
      if (id === 'cols') { cols.push({ name: 'NPU', w: 120, dashed: true, k: npuK, align: 'center' }); cols.push({ name: 'Isolation', w: 160, dashed: true, k: isoK, align: 'center' }); }
      // before the Processes cue the rows sit faint (30%); each group lights as it is named
      const ga = id === 'cols' ? [c0, c0 + 0.25, c0 + 0.5] : [wApps - 0.15, wBack - 0.15, wWinP - 0.15];
      const rk = id === 'cols' ? (gi, j) => st(ga[gi], j, 0.07) : () => 1;
      const lightA = (gi, j) => (id === 'cols' ? 1 : id === 'empty' ? 0.3 : 0.3 + 0.7 * st(ga[gi], j, 0.14));
      return {
        cols,
        rows: [
          { group: 'Apps', k: rk(0, 0), alpha: lightA(0, 0) },
          { name: 'Windows Terminal', icon: 'terminal', cells: [{ bar: 0.1 }, { bar: 0.16 }, '0%', null], k: rk(0, 1), alpha: lightA(0, 1) },
          { name: 'sandboxed app', icon: 'program', cells: [{ bar: 0.04 }, { bar: 0.1 }, '0%', { mark: true }], k: rk(0, 2), alpha: lightA(0, 2) },
          { group: 'Background processes', k: rk(1, 0), alpha: lightA(1, 0) },
          { name: 'Ollama', ai: true, cells: [{ bar: 0.02 }, { bar: 0.06 }, '0%', null], k: rk(1, 1), alpha: lightA(1, 1) },
          { name: 'Node.js', icon: 'code', cells: [{ bar: 0.08 }, { bar: 0.12 }, '0%', null], k: rk(1, 2), alpha: lightA(1, 2) },
          { group: 'Windows processes', k: rk(2, 0), alpha: lightA(2, 0) },
          { name: 'Service Host: Windows Audio', kind: 'service', cells: [{ bar: 0.03 }, { bar: 0.05 }, '0%', null], k: rk(2, 1), alpha: lightA(2, 1) },
          { name: 'Windows Explorer', icon: 'program', cells: [{ bar: 0.05 }, { bar: 0.2 }, '0%', null], k: rk(2, 2), alpha: lightA(2, 2) },
        ],
      };
    }
    if (id === 'det' || id === 'end') {
      const a = c0;
      const isEnd = id === 'end';
      const rkE = (i) => (isEnd ? 1 : st(a, i)); // End task: the table is already settled
      const gK = isEnd ? goneK : 0, hlK = isEnd ? selK : 0;
      return {
        cols: [{ name: 'Name' }, { name: 'PID', w: 140 }, { name: 'Memory', w: 180 }],
        rows: [
          { name: 'node.exe', mono: true, icon: 'code', cells: ['18412', { bar: 0.14 }], k: rkE(0) },
          { name: 'ollama app.exe', mono: true, ai: true, cells: ['1168', { bar: 0.05 }], k: rkE(1) },
          { name: 'ollama.exe', mono: true, ai: true, cells: ['22124', { bar: 0.3 }], k: rkE(2) },
          { name: 'notepad.exe', mono: true, icon: 'file', cells: ['9216', { bar: 0.04 }], k: rkE(3), named: hlK * (1 - gK), gone: gK },
          { name: 'svchost.exe', mono: true, kind: 'service', cells: ['1432', { bar: 0.03 }], k: rkE(4) },
          { name: 'svchost.exe', mono: true, kind: 'service', cells: ['2280', { bar: 0.02 }], k: rkE(5) },
        ],
      };
    }
    if (id === 'svc') {
      return {
        cols: [{ name: 'Name' }, { name: 'PID', w: 140 }, { name: 'Status', w: 200, align: 'center' }],
        rows: [
          { name: 'Audiosrv', mono: true, kind: 'service', cells: ['3120', { pill: 'Running' }], k: st(c0, 0) },
          { name: 'Spooler', mono: true, kind: 'service', cells: ['4088', { pill: 'Running' }], k: st(c0, 1) },
          { name: 'WSearch', mono: true, kind: 'service', cells: ['6644', { pill: 'Running' }], k: st(c0, 2) },
          { name: 'wuauserv', mono: true, kind: 'service', cells: ['', { pill: 'Stopped' }], k: st(c0, 3) },
          { name: 'BthServ', mono: true, kind: 'service', cells: ['1876', { pill: 'Running' }], k: st(c0, 4) },
        ],
      };
    }
    // startup apps
    return {
      cols: [{ name: 'Name' }, { name: 'Status', w: 200, align: 'center' }],
      rows: [
        { name: 'Ollama', ai: true, cells: ['Enabled'], k: st(c0, 0, 0.15) },
        { name: 'Microsoft OneDrive', icon: 'cloud', cells: ['Enabled'], k: st(c0, 1, 0.15) },
      ],
    };
  }

  const spec = tabSpec(content.id);
  // 'end' rows fade in together over 0.25 s as the Startup rows leave (a crossfade, never an empty table)
  const enterA = content.id === 'end' ? K.io(t, ph[pi].at, 0.25) : 1;
  spec.rows.forEach((r) => { r.alpha = (r.alpha == null ? 1 : r.alpha) * cA * enterA; });

  // ---------------------------------------------------------------- the staff board thumbnail -> Task Manager
  const sbX = 1700, sbY = 225;
  const fcx = bxw + bw / 2, fcy = by + bh / 2;
  const ge = K.ease.io(grow);
  const sc = K.lerp(150 / 1440, 1, ge);
  const ccx = K.lerp(sbX, fcx, ge), ccy = K.lerp(sbY, fcy, ge);
  // the pinned staff board (fades as it grows)
  const sbA = 1 - K.clamp(grow * 2.2);
  if (sbA > 0.002) {
    const sbLit = K.io(t, cShort + 0.3, 0.6);
    K.at(ccx, ccy, K.lerp(1, 2.2, ge), 0, () => {
      g.translate(-sbX, -sbY);
      M.staffBoard(t, sbX, sbY, { w: 150, h: 170, rows: 6, night: 2, lit: sbLit, alpha: sbA, label: null });
    });
    M.label('staff board', sbX - 105, sbY + 9, { align: 'right', color: C.head, alpha: sbLit * (1 - K.clamp(grow * 4)) });
  }
  let res = null;
  const bA = K.clamp((grow - 0.15) * 2);
  if (bA > 0.002) {
    K.at(ccx, ccy, sc, 0, () => {
      g.translate(-fcx, -fcy);
      res = M.board(t, {
        x: bxw, y: by, w: bw, h: bh, focus: true, alpha: bA,
        tab: navTab, tabK, cols: spec.cols, rows: spec.rows, rowH,
      });
      // End task: once notepad.exe has faded, the rows below slide up to close the gap. M.board places rows by
      // index, so redraw the same board clipped to the rows from index 3 down, shifted up by closeK * rowH,
      // with only the rows below the ended one visible.
      if (content.id === 'end' && closeK > 0.001 && res) {
        const top = res.body.y + 3 * rowH, bot = res.body.y + 6 * rowH + 2;
        const rows2 = spec.rows.map((r, i) => ({ ...r, alpha: i > 3 ? r.alpha : 0 }));
        g.save(); g.beginPath(); g.rect(res.body.x - 30, top, res.body.w + 60, bot - top); g.clip();
        g.translate(0, -K.ease.io(closeK) * rowH);
        M.board(t, { x: bxw, y: by, w: bw, h: bh, focus: true, alpha: bA, tab: navTab, tabK, cols: spec.cols, rows: rows2, rowH });
        g.restore();
      }
    });
  }

  // ---------------------------------------------------------------- shortcut keys + "five years ago"
  const midX = 960; // centred under the Task Manager window
  // the keys sit under the window (y 892), never over the list; they hand the spot to the "2021" chip on "Five"
  const keyY = 894;
  const keysOut = 1 - K.io(t, wFive - 0.35, 0.35);
  if (keysOut > 0.002) K.layer(keysOut, () => {
    const keys = [['Ctrl', wCtrl], ['Shift', wShift], ['Esc', wEsc]];
    const ws = keys.map(([s]) => K.measure(s, { font: 'mono', weight: 700, size: 32 }) + 52);
    const plusW = 52, total = ws.reduce((a, b) => a + b, 0) + plusW * 2;
    let x = midX - total / 2;
    keys.forEach(([s, at], i) => {
      const cx = x + ws[i] / 2;
      K.pop(t, at - 0.05, cx, keyY, () => K.pill(s, cx, keyY, { size: 32, font: 'mono', weight: 700, color: C.head, stroke: C.head, fill: K.mixColor(C.tile, C.head, 0.1) }), 0.4);
      x += ws[i];
      if (i < 2) { K.text('+', x + plusW / 2, keyY + 12, { font: 'ui', weight: 600, size: 32, color: C.soft, align: 'center', alpha: K.io(t, keys[i + 1][1] - 0.1, 0.3) }); x += plusW; }
    });
  });
  const fiveA = K.io(t, wFive - 0.05, 0.4) * (1 - K.io(t, wFive + 2.6, 0.5));
  if (fiveA > 0.002) K.layer(fiveA, () => {
    const s = '2021: End task on a frozen app';
    const tw = K.measure(s, M.T.label), cw = tw + 96, cx0 = midX - cw / 2, cy0 = keyY - 32;
    K.card(cx0, cy0, cw, 64, { r: 16, fill: C.tile, stroke: C.line2, shadow: false });
    K.icon('clock', cx0 + 38, cy0 + 32, 28, { color: C.soft, w: 2 });
    K.text(s, cx0 + 66, cy0 + 41, { ...M.T.label, color: C.soft });
  });

  // ---------------------------------------------------------------- cooks at the right, linked to their rows
  // slots: a column of four at x 1430
  const slotX = 1480, slotYs = [250, 430, 610, 790], cs = 76;
  const sets = {
    det: [
      { row: 0, o: { pid: 18412, icon: 'person' }, name: 'node.exe' },
      { row: 1, o: { kind: 'tray', pid: 1168 }, name: 'ollama app.exe' },
      { row: 2, o: { ai: true, pid: 22124 }, name: 'ollama.exe' },
      { row: 3, o: { pid: 9216 }, name: 'notepad.exe', end: true },
    ],
    svc: [
      { row: 0, o: { kind: 'service', pid: 3120 }, name: 'Audiosrv' },
      { row: 1, o: { kind: 'service', pid: 4088 }, name: 'Spooler' },
      { row: 2, o: { kind: 'service', pid: 6644 }, name: 'WSearch' },
      { row: 4, o: { kind: 'service', pid: 1876 }, name: 'BthServ' },
    ],
    start: [
      { row: 0, o: { kind: 'tray', ai: true }, name: 'ollama app.exe', slot: 1 },
      { row: 1, o: { kind: 'tray' }, name: 'OneDrive.exe', slot: 2 },
    ],
  };
  const setId = content.id === 'end' ? 'det' : content.id;
  const set = sets[setId];
  const rightA = nk * cA;
  if (set && rightA > 0.002 && res) {
    const tOn = content.id === 'det' ? Math.max(c0, wRow - 0.3) : c0;
    const pidLit = content.id === 'det' && t >= wPid - 0.1;
    set.forEach((c, i) => {
      const slot = c.slot != null ? c.slot : i;
      const y = slotYs[slot];
      let k = content.id === 'end' ? K.io(t, ph[pi].at, 0.25) : K.io(t, tOn + i * 0.16, 0.5);
      let gone = 0;
      if (content.id === 'end' && c.end) gone = goneK;
      const a = rightA * k * (1 - gone);
      const rowY = res.rowY(c.row);
      const x1 = res.body.x + res.body.w + 14, x2 = slotX - cs / 2 - 14;
      const lk = content.id === 'end' ? 1 : K.io(t, tOn + i * 0.16 + 0.2, 0.6);
      const rowK = spec.rows[c.row] ? K.clamp(spec.rows[c.row].k == null ? 1 : spec.rows[c.row].k) : 1;
      if (a > 0.002) {
        K.layer(a * rowK, () => {
          g.save(); g.beginPath(); g.arc(x1, rowY, 5, 0, Math.PI * 2); g.fillStyle = K.rgba(C.head, 0.7); g.fill(); g.restore();
          K.path([[x1, rowY], [K.lerp(x1, x2, 0.5), K.lerp(rowY, y, 0.5)], [x2, y]], { k: lk, color: K.rgba(C.head, 0.55), w: 2, dash: [6, 7], head: false, tension: 0.2 });
        });
        const named = content.id === 'end' && c.end ? selK : 0;
        M.cook(t, slotX, y, cs, { ...c.o, alpha: a, named, pidLit: pidLit && c.o.pid != null, phase: i * 1.7 });
        K.text(c.name, slotX + cs / 2 + 24, y + 9, { font: 'mono', weight: 600, size: 26, color: c.o.kind === 'service' ? C.soft : C.strong, alpha: a });
      }
    });
    // Startup: "clocks in at sign-in"
    if (content.id === 'start') {
      M.label('clock in at sign-in', slotX + 110, slotYs[3] - 10, { alpha: rightA * K.io(t, c0 + 0.5, 0.5), color: C.soft });
    }
  }

  // ---------------------------------------------------------------- End task pill + "unsaved work lost"
  if (content.id === 'end' && res) {
    const ek = K.io(t, cEnd + 0.1, 0.45) * cA;
    const pressK = K.io(t, pressAt - 0.12, 0.15) * (1 - K.io(t, pressAt + 0.25, 0.35));
    const px = res.body.x + res.body.w - 100, py = headY - 12;
    if (ek > 0.002) {
      K.at(px, py, 1 - 0.06 * pressK, 0, () => {
        K.pill('End task', 0, 0, { size: 28, color: C.strong, fill: K.mixColor(C.tile, C.accent, 0.25 + 0.4 * pressK), stroke: C.accent, alpha: ek, icon: 'cross', iconColor: C.accent });
      });
    }
    // the pointer: rests on the selected notepad.exe row, then travels to End task and clicks on "once"
    const curA = K.io(t, cEnd - 0.05, 0.35) * (1 - K.io(t, pressAt + 0.7, 0.4)) * cA;
    if (curA > 0.002) {
      const mv = K.ease.io(K.io(t, pressAt - 0.75, 0.6));
      const rx = res.body.x + 330, ry = res.rowY(3) + 6;
      const cx = K.lerp(rx, px + 40, mv), cy = K.lerp(ry, py + 8, mv) + 3 * pressK;
      g.save(); g.globalAlpha *= curA; g.translate(cx, cy); g.scale(1 - 0.08 * pressK, 1 - 0.08 * pressK);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 34); g.lineTo(9, 26); g.lineTo(15, 39); g.lineTo(21, 36); g.lineTo(15, 23); g.lineTo(26, 23); g.closePath();
      g.fillStyle = C.strong; g.fill(); g.lineWidth = 2.5; g.lineJoin = 'round'; g.strokeStyle = C.bg || '#111'; g.stroke();
      g.restore();
    }
    const wk = K.io(t, wGone - 0.15, 0.5) * cA * nk;
    if (wk > 0.002) {
      const y = slotYs[3];
      K.icon('warning', slotX - 10, y - 2, 44, { color: C.accent, w: 3, alpha: wk });
      K.text('unsaved work lost', slotX + 30, y + 9, { ...M.T.label, color: C.accent, alpha: wk });
    }
  }

  // ---------------------------------------------------------------- new columns tag, then Mac / Linux pills
  const pillY = 892;
  const tagA = K.io(t, wHidden - 0.1, 0.5) * (1 - K.io(t, cElse - 0.1, 0.4));
  if (tagA > 0.002) {
    K.pill('newer Windows 11 · hidden by default', 960, pillY, { size: 26, color: C.head, fill: C.tile, stroke: K.rgba(C.head, 0.6), alpha: tagA });
  }
  const p1 = K.io(t, wAct - 0.2, 0.5), p2 = K.io(t, wLinux - 0.2, 0.5);
  if (p1 > 0.002) K.pill('Mac: Activity Monitor', 700, pillY, { size: 28, color: C.strong, fill: C.tile, stroke: C.line2, alpha: p1, icon: 'laptop', iconColor: C.soft });
  if (p2 > 0.002) K.pill('Linux: top · htop · systemctl', 1240, pillY, { size: 28, font: 'mono', color: C.strong, fill: C.tile, stroke: C.line2, alpha: p2, icon: 'terminal', iconColor: C.soft });
});
