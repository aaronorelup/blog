/* 04 — What a ledger row holds
   The .py row lifts out of the ledger and grows into a wide paper card with four cells: program (its door),
   icon, type name, right-click menu. Below it a file (01.01's string + its folder icon and type name) is renamed
   hello.txt -> hello.py: icon and type name swap on the same frame, the beads hold still (gold ring), and a gold
   line shows the porter now reading the .py row. Then notes.xyz: blank icon, terracotta ring on its label, a '?'. */
SCENE('04', (t, S) => {
  K.bg();
  const P = M.palette;
  const cue = (n, f) => S.cue(n, f);
  const cOpen = cue('row-opens', 0), cCols = cue('columns', 3.3), cMenu = cue('menu', 15.5);
  const cFlip = cue('icon-flip', 19.4), cNo = cue('no-row', 28.7);
  const w = (word, n, f) => S.find(word, n, f);
  const tProgram = w('program', 0, cCols + 1.1), tIcon = w('icon', 0, cCols + 3.3), tType = w("type's", 0, cCols + 6.7);
  const tPyFile = w('Python', 0, cCols + 9.5), tCmds = w('commands', 0, cMenu + 1.2);
  const tEnter = w('Enter', 0, cFlip + 3.9), tBead = w('bead', 0, cFlip + 5.3), tReads = w('reads', 0, cFlip + 7.5);
  const tNoRow = w('row', 3, cNo + 1.2), tBlank = w('blank', 0, cNo + 2.4), tQuestion = w('question', 0, cNo + 3.6);
  const tWhich = w('which', 0, cNo + 4.6), tText = w('Text', 0, cCols + 10.7);

  // ------------------------------------------------ the room, as 03 left it (ledger lifted, string at Notepad)
  const fade = K.io(t, cOpen + 0.9, 0.9);
  const hiK = K.io(t, cOpen + 0.15, 0.5);
  const R = M.room({
    t, alpha: 1 - fade, lift: 1,
    doors: { each: (i, n) => (n === 'Notepad' ? { focus: 1, holding: 1, holdName: 'hello.txt', t } : {}) },
    ledger: { rows: M.ROWS.map((r, i) => (i === 1 ? { ...r, hi: hiK, alpha: 1 - K.clamp(K.seg(t, cOpen + 0.9, cOpen + 1.2)) } : r)) },
  });

  // ------------------------------------------------ the row card grows out of the ledger's .py row
  const CX = 200, CY = 230, CW = 1520, CH = 300;
  const LAB = 240, CELL = (CW - LAB) / 4;
  const cellX = (i) => CX + LAB + CELL * (i + 0.5);
  const LG = M.layout.ledger, src0 = M.ledger(LG.x, LG.y, LG.w, { alpha: 0 }).rowRect(1);
  // camera on the card: centred and 1.12x while its columns build, then it slides up just before the
  // two strings arrive (on 'icon-flip'). The source row is mapped back through the camera so it still lifts from the ledger.
  const CC = { x: CX + CW / 2, y: CY + CH / 2 };
  const camK = K.io(t, cFlip - 1.3, 1.1);
  const camS = K.lerp(1.12, 1, camK), camDY = K.lerp(150, 0, camK);
  const camIn = (x, y) => ({ x: CC.x + (x - CC.x) / camS, y: CC.y + (y - camDY - CC.y) / camS });
  const s0 = camIn(src0.x, src0.y);
  const src = { x: s0.x, y: s0.y, w: src0.w / camS, h: src0.h / camS };
  const gk = K.io(t, cOpen + 0.9, 0.9);
  const dimK = K.io(t, cNo, 0.7), noDim = 1 - 0.4 * dimK;   // card and first file step back for notes.xyz
  const rx = K.lerp(src.x, CX, gk), ry = K.lerp(src.y, CY, gk), rw = K.lerp(src.w, CW, gk), rh = K.lerp(src.h, CH, gk);
  const g = K.ctx();
  const ink = P.ink, inkSoft = P.inkSoft;
  const pulse = K.io(t, tReads, 0.5) * (1 - K.io(t, tReads + 1.6, 0.6));
  g.save(); g.translate(CC.x, CC.y + camDY); g.scale(camS, camS); g.translate(-CC.x, -CC.y);
  K.layer(K.clamp(hiK * 2), () => {
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 20 + 50 * gk; g.shadowOffsetY = 8 + 18 * gk;
    K.rr(rx, ry, rw, rh, K.lerp(10, 18, gk)); g.fillStyle = P.paper; g.fill(); g.restore();
    K.rr(rx, ry, rw, rh, K.lerp(10, 18, gk)); g.strokeStyle = K.mixColor(P.paperLine, C_gold(), pulse); g.lineWidth = 2 + 3 * pulse; g.stroke();
    // margin rule like the ledger page
    K.line(rx + 18, ry + 8, rx + 18, ry + rh - 8, { color: K.rgba(K.C.accent, 0.35), w: 1.5 });
    // the label: from the row's label spot to the card's label column
    const ls = K.lerp(30, 76, gk), lfont = { font: 'mono', weight: 700, size: ls };
    const lw = K.measure('.py', lfont);
    const lx = K.lerp(src.x + 18, CX + LAB / 2 - lw / 2, gk), lyb = K.lerp(src.y + src.h / 2 + 10, CY + 190, gk);
    K.text('.py', lx, lyb, { ...lfont, color: ink });
    const hk = K.io(t, cOpen + 1.6, 0.6);
    K.text('label', CX + LAB / 2, CY + 62, { font: 'ui', weight: 600, size: 26, color: inkSoft, align: 'center', alpha: hk });
    // the row's arrow fades as it grows
    K.text('→', K.lerp(src.x + 150, CX + LAB, gk), lyb - (ls - 30) * 0.2, { font: 'mono', weight: 400, size: 30, color: inkSoft, alpha: 1 - K.clamp(gk * 2) });
    // the door name: slides into cell 1, then becomes the door itself on "program"
    const dk = K.io(t, tProgram, 0.6);
    const ds = K.lerp(30, 36, gk), dfont = { font: 'ui', weight: 600, size: ds };
    const dw = K.measure('V S Code', dfont);
    const dx = K.lerp(src.x + 185, cellX(0) - dw / 2, gk), dyb = K.lerp(src.y + src.h / 2 + 10, CY + 190, gk);
    K.text('V S Code', dx, dyb, { ...dfont, color: ink, alpha: 1 - dk });
    if (gk >= 1) {
      // cell dividers + headers, each arriving with its words
      const heads = ['program', 'icon', 'type name', 'right-click menu'];
      const at = [tProgram, tIcon, tType, tCmds];
      heads.forEach((hd, i) => {
        const k = K.io(t, at[i], 0.6);
        const x0 = CX + LAB + CELL * i;
        K.line(x0, CY + 26, x0, CY + CH - 26, { color: P.paperLine, w: 2, k: Math.max(hk, k) * (i === 0 ? 1 : k) });
        K.text(hd, cellX(i), CY + 62, { font: 'ui', weight: 600, size: 26, color: inkSoft, align: 'center', alpha: k });
      });
      // 1 program: its door
      if (dk > 0) K.layer(dk, () => M.door(cellX(0), CY + 92 + (1 - dk) * 20, 150, 180, { name: 'V S Code', focus: 0.6 }));
      // 2 icon
      const ik = K.io(t, tIcon, 0.6);
      if (ik > 0) K.file(cellX(1), CY + 185 + (1 - ik) * 16, 130, { ext: 'py', alpha: ik });
      // 3 type name
      const tk = K.io(t, tPyFile, 0.6), tk0 = K.io(t, tType, 0.6);
      K.text('Python file', cellX(2), CY + 196 + (1 - tk) * 12, { font: 'ui', weight: 600, size: 40, color: ink, align: 'center', alpha: tk });
      if (tk < 1) K.line(cellX(2) - 90, CY + 210, cellX(2) + 90, CY + 210, { color: K.rgba(inkSoft, 0.5), w: 2, dash: [6, 8], alpha: tk0 * (1 - tk) });
      // 4 right-click menu: a small menu card with three commands
      const mk = K.io(t, tCmds, 0.6);
      if (mk > 0) {
        const mx = cellX(3) - 100, my = CY + 100 + (1 - mk) * 14;
        K.card(mx, my, 200, 162, { r: 12, fill: K.C.tile, stroke: K.C.line2, alpha: mk, shadow: true });
        ['Open', 'Edit', 'Run'].forEach((c, i) => {
          const ck = K.stagger(t, tCmds + 0.2, i, 0.25, 0.5);
          if (i === 0) { K.rr(mx + 8, my + 10, 184, 44, 8); g.fillStyle = K.rgba(K.C.head, 0.22 * ck * mk); g.fill(); }
          K.text(c, mx + 30, my + 42 + i * 48, { font: 'ui', weight: 600, size: 28, color: K.C.strong, alpha: ck * mk });
        });
      }
    }
  });
  if (dimK > 0) { K.rr(CX - 2, CY - 2, CW + 4, CH + 4, 18); g.fillStyle = K.rgba(K.C.page, 0.42 * dimK); g.fill(); }
  // ------------------------------------------------ "or Text document": the next row of the ledger peeks out below
  const gA = K.io(t, tText - 0.1, 0.6) * (1 - K.io(t, cFlip - 0.7, 0.6));
  if (gA > 0) K.layer(gA, () => {
    const gy = CY + CH + 22 - (1 - K.io(t, tText - 0.1, 0.6)) * 30, gh = 104;
    K.rr(CX + 30, gy, CW - 60, gh, 12); g.fillStyle = K.rgba(P.paper, 0.82); g.fill();
    g.strokeStyle = P.paperLine; g.lineWidth = 2; g.stroke();
    const my = gy + gh / 2 + 12;
    for (let i = 0; i < 4; i++) K.line(CX + LAB + CELL * i, gy + 14, CX + LAB + CELL * i, gy + gh - 14, { color: P.paperLine, w: 2 });
    K.text('.txt', CX + LAB / 2 + 15, my, { font: 'mono', weight: 700, size: 44, color: inkSoft, align: 'center' });
    K.text('Notepad', cellX(0), my, { font: 'ui', weight: 600, size: 32, color: inkSoft, align: 'center' });
    K.file(cellX(1), gy + gh / 2, 80, { ext: 'txt' });
    K.text('Text document', cellX(2), my, { font: 'ui', weight: 600, size: 36, color: ink, align: 'center' });
    K.text('Open · Edit · Print', cellX(3), my, { font: 'ui', weight: 600, size: 28, color: inkSoft, align: 'center', alpha: K.io(t, tCmds, 0.6) });
  });
  K.eyebrow('one row of the ledger', CX + 6, CY - 22, { size: 22, alpha: K.io(t, cOpen + 1.6, 0.6) * noDim });
  g.restore();

  // ------------------------------------------------ the renamed file: icon + type name swap, beads hold still
  const fA = K.io(t, cFlip, 0.6) * noDim;
  if (fA > 0) K.layer(fA, () => {
    const ix = 300, iy = 745, sx = 790;
    const sw = K.io(t, tEnter - 0.05, 0.2);              // icon + type name swap on the same frame
    const nk = K.io(t, tEnter - 0.25, 0.5);               // tag crossfade, centred on that frame
    const st = K.io(t, cFlip + 1.0, 0.6);                 // "renamed": the old label is struck
    const hold = K.io(t, tEnter - 0.6, 0.5) * (1 - K.io(t, tReads + 1.2, 0.8));
    K.file(ix, iy, 130, { ext: 'txt', alpha: 1 - sw });
    K.file(ix, iy, 130, { ext: 'py', alpha: sw });
    K.text('Text document', ix, iy + 112, { font: 'ui', weight: 600, size: 28, color: K.C.soft, align: 'center', alpha: 1 - sw });
    K.text('Python file', ix, iy + 112, { font: 'ui', weight: 600, size: 28, color: K.C.head, align: 'center', alpha: sw });
    const str = M.drawString(sx, iy, 0.45, {
      t, n: 6, preset: 'txt', hold, tagS: 0.8,
      tag: { name: 'hello.txt', to: 'hello.py', k: nk, strike: st, mark: K.io(t, tReads, 0.5) * (1 - K.io(t, cNo, 0.6)) },
    });
    M.quiet('no bead moved', sx, iy + 102, { size: 28, color: K.C.strong, alpha: 0.7 * K.io(t, tBead, 0.5) * (1 - K.io(t, cNo, 0.6)) });
    // the porter now reads a different row: a gold line from the label up to the card's label
    const lk = K.io(t, tReads, 0.8);
    if (lk > 0 && str.tag) {
      const ex = str.tag.ext.cx, ey = str.tag.y0 - 8;
      K.arrow(ex, ey, CX + LAB / 2, CY + CH + 10, { k: lk, color: K.C.head, w: 3, dash: [10, 10], bend: -40, alpha: 1 - K.io(t, cNo, 0.6) });
    }
  });

  // ------------------------------------------------ a label with no row
  const nA = K.io(t, cNo, 0.7);
  if (nA > 0) K.layer(nA, () => {
    const ix = 1150, iy = 745, sx = 1640;
    const bk = K.io(t, tBlank, 0.5);
    K.glow(ix, iy, 110, K.C.accent, 0.10 * bk);
    K.file(ix, iy, 130, { alpha: 0.6 });
    K.text('no icon', ix, iy + 112, { font: 'ui', weight: 600, size: 28, color: K.C.soft, align: 'center', alpha: bk });
    const ns = M.drawString(sx, iy, 0.45, {
      t, n: 6, preset: 'notes', tagS: 0.8,
      tag: { name: 'notes.xyz' },
    });
    // terracotta ring round '.xyz' only (drawn here, tighter than the shared tag ring so it clears the 's')
    const rk = K.io(t, tNoRow, 0.7);
    if (rk > 0 && ns.tag) {
      const e = ns.tag.ext, th = ns.tag.y1 - ns.tag.y0;
      K.ring(e.cx + 5, e.cy, (e.x1 - e.x0) / 2 + 1, th * 0.36, rk, { color: P.changed, w: 3.5, rot: ns.tag.rot || 0 });
    }
    const qk = K.io(t, tQuestion, 0.5);
    K.icon('question', ix, iy - 118 + (1 - qk) * 10, 64, { color: P.changed, alpha: qk, w: 4 });
    // the system's question, as a small dialog card above the tag
    const dk2 = K.io(t, tWhich - 0.25, 0.45);
    if (dk2 > 0) {
      const bx = 1330, bw = 400, by = 560 + (1 - dk2) * 14, bh = 100, bc = bx + bw / 2;
      K.card(bx, by, bw, bh, { r: 14, fill: K.C.tile, stroke: K.C.line2, alpha: dk2, shadow: true });
      K.text('Select an app to open', bc, by + 42, { font: 'ui', weight: 600, size: 28, color: K.C.strong, align: 'center', alpha: dk2 });
      K.text('this .xyz file', bc, by + 80, { font: 'ui', weight: 600, size: 28, color: K.C.strong, align: 'center', alpha: dk2 });
    }
  });

  function C_gold() { return K.C.gold; }
});
