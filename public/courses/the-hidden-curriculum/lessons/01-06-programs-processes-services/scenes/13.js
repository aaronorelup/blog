// 13 — Background A I already on your PC
// The Services list from 06 in a small Task Manager window; three night-staff cooks get sparkle badges and
// link to the three observed AI service rows; then Chrome's on-device model download; then the 01.12 chip.
SCENE('13', (t, S) => {
  K.bg();
  const C = K.C;
  const cAI = S.cue('ai-services', 0), cChrome = S.cue('chrome', 15.94), cInv = S.cue('inventory', 23.09);
  const tAI = S.find('AI.', 0, 1.78);
  const tCourse = S.find('course', 0, 3.44);
  const tWin = S.find('Windows', 0, 6.01);
  const tCodex = S.find('Codex', 0, 8.75);
  const tCop = S.find('Copilot', 0, 13.39);
  const tDl = S.find('download', 0, 16.52);
  const tBg = S.find('background', 0, 19.03);
  const tSwitch = S.find('switch', 0, 21.15);
  const tTwelve = S.find('twelve', 0, 27.71);

  // dip at the hand-over: the whole frame fades to the bare background before the crossfade starts,
  // so scene 14's kitchen recap never draws on top of the Services window or the Chrome window
  const out = S.out != null ? S.out : 29.19;
  const dip = 1 - K.io(t, out - 0.55, 0.5);
  K.layer(dip, () => {

  // ------------------------------------------------ the Services list (Task Manager, small, no nav)
  const kW = K.io(t, tWin, 0.5), kC = K.io(t, tCodex, 0.5), kP = K.io(t, tCop, 0.5);
  const boardA = 1 - 0.2 * K.io(t, cChrome, 0.6) * (1 - K.io(t, cInv, 0.6));
  const BX = 200, BY = 200, BW = 900, BH = 560;
  const rows = [
    { name: ' ', kind: 'service', cells: [{ pill: 'Running' }], alpha: 0.7 },
    { name: 'Windows AI Components Host', kind: 'service', cells: [{ pill: 'Running' }], hl: kW },
    { name: ' ', kind: 'service', cells: [{ pill: 'Running' }], alpha: 0.7 },
    { name: 'ChatGPT', kind: 'service', cells: [{ pill: 'Running' }], hl: kC },
    { name: ' ', kind: 'service', cells: [{ pill: 'Stopped' }], alpha: 0.7 },
    { name: 'MicrosoftCopilotElevationService', mono: true, kind: 'service', cells: [{ pill: 'Stopped' }], hl: kP },
  ];
  const brd = M.board(t, {
    x: BX, y: BY, w: BW, h: BH, nav: false, tab: 'Services', heading: 'Services', focus: true, alpha: boardA,
    cols: [{ name: 'Name' }, { name: 'Status', w: 200, align: 'center' }], rows,
  });
  const bx = brd.body.x;
  K.layer(boardA, () => {
    // the other night staff: unreadable grey name bars (only the AI rows are named on screen)
    [[0, 300], [2, 250], [4, 340]].forEach(([i, w]) => K.line(bx + 54, brd.rowY(i), bx + 54 + w, brd.rowY(i), { color: C.line2, w: 10, alpha: 0.9 }));
    // sparkle badges at the right end of the name column, one per AI row, as it is named
    [[1, kW], [3, kC], [5, kP]].forEach(([i, k]) => { if (k > 0) M.badge('sparkle', brd.colX(1) - 26, brd.rowY(i), 16, { alpha: k }); });
    // the ChatGPT row: what it is, in soft type next to the observed name
    const nw = K.measure('ChatGPT', { font: 'ui', weight: 600, size: 26 });
    K.text('Codex sandbox service', bx + 52 + nw + 22, brd.rowY(3) + 9, { font: 'ui', weight: 400, size: 26, color: C.soft, alpha: kC, italic: true });
  });
  M.obsTag(BX + 4, BY + BH + 52, { alpha: K.io(t, tCourse, 0.5) });

  // ------------------------------------------------ the night staff (right), already AI
  const cookOut = 1 - K.io(t, cChrome - 0.1, 0.5);
  if (cookOut > 0.002) {
    const kAI = K.io(t, tAI, 0.5);
    const CY = 560, S0 = 96;
    const crew = [
      { x: 1290, k: kW, row: 1, kind: 'service' },
      { x: 1500, k: kC, row: 3, kind: 'service' },
      { x: 1710, k: kP, row: 5, kind: 'ghost' },
    ];
    K.layer(cookOut, () => {
      M.eyebrow('night staff', 1500, 372, { alpha: 1 - kAI });
      M.eyebrow('night staff · already AI', 1500, 372, { alpha: kAI });
      // links: row -> cook (drawn when the row is named)
      const ex = BX + BW + 6;
      const paths = [
        [[ex, brd.rowY(1)], [1170, brd.rowY(1) + 10], [1238, CY + 4]],
        [[ex, brd.rowY(3)], [1170, 672], [1310, 690], [1418, 660], [1450, CY + 18]],
        [[ex, brd.rowY(5)], [1300, 752], [1560, 744], [1606, 660], [1660, CY + 18]],
      ];
      crew.forEach((c, i) => {
        if (c.k > 0) K.path(paths[i], { k: c.k, color: C.head, w: 2.5, dash: [8, 7], alpha: 0.75, head: false });
      });
      crew.forEach((c) => {
        M.cook(t, c.x, CY, S0, {
          kind: c.kind, ai: kAI > 0.5, badge: kAI > 0.02 ? 'sparkle' : (c.kind === 'ghost' ? 'gear' : null),
          badgeColor: K.mixColor(C.soft, C.head, kAI), lit: c.kind === 'ghost' ? 0 : c.k,
        });
      });
      // each cook takes a short mono name the moment its row is named (ties cook to row)
      [['AI host', kW], ['Codex', kC], ['Copilot', kP]].forEach(([nm, k], i) => {
        M.label(nm, crew[i].x, CY + 96, { font: 'mono', color: i === 2 ? C.soft : C.strong, alpha: k });
      });
      M.label('stopped', 1710, CY + 134, { color: C.soft, alpha: kP, weight: 400 });
    });
  }

  // ------------------------------------------------ Chrome: an on-device model, downloaded in the background
  const kB = K.io(t, cChrome, 0.6);
  if (kB > 0.002) {
    const WX = 1180, WY = 200, WW = 620, WH = 560;
    K.layer(kB, () => {
      const g = K.ctx();
      g.save(); g.translate(0, (1 - kB) * 30);
      const r = K.win(WX, WY, WW, WH, { title: 'Chrome', titleSize: 26, kind: 'browser' });
      const cx = r.x + r.w / 2;
      // the model card
      const kCard = K.io(t, tDl, 0.5);
      K.layer(kCard, () => {
        K.card(cx - 110, r.y + 50, 220, 170, { r: 22, fill: K.mixColor(C.tile, C.head, 0.08), stroke: C.line2 });
        K.icon('brain', cx, r.y + 120, 84, { color: C.head, w: 3 });
        M.badge('sparkle', cx + 96, r.y + 62, 16, {});
        M.label('on-device model', cx, r.y + 265, { color: C.strong });
      });
      // progress line: fills slowly while it is said, keeps creeping (background download)
      const p = K.clamp(K.seg(t, tDl + 0.3, tBg + 1.6) * 0.62 + K.seg(t, tBg + 1.6, tBg + 14) * 0.3);
      const px = r.x + 70, pw = r.w - 140, py = r.y + 334;
      K.layer(kCard, () => {
        K.rr(px, py - 6, pw, 12, 6); g.fillStyle = K.rgba(C.line2, 0.7); g.fill();
        K.rr(px, py - 6, Math.max(12, pw * p), 12, 6); g.fillStyle = C.head; g.fill();
        // a small download arrow riding the head of the bar
        const ax = px + Math.max(12, pw * p);
        K.arrow(ax, py - 40, ax, py - 14, { color: C.head, w: 3, k: 1 });
      });
      M.label('in the background', cx, py + 52, { color: C.soft, weight: 400, alpha: K.io(t, tBg, 0.5) });
      // the off switch (newer versions)
      const kS = K.io(t, tSwitch, 0.5);
      if (kS > 0) {
        const sy = r.y + r.h - 70;
        K.layer(kS, () => {
          const tw = 68, th = 36, tx = r.x + 70;
          const on = 1 - K.io(t, tSwitch + 0.6, 0.5); // the knob slides to off
          K.rr(tx, sy - th / 2, tw, th, th / 2); g.fillStyle = K.mixColor(C.tile, C.head, 0.25 * on); g.fill();
          g.lineWidth = 2; g.strokeStyle = K.mixColor(C.line2, C.head, on); g.stroke();
          g.beginPath(); g.arc(tx + th / 2 + (tw - th) * on, sy, th / 2 - 5, 0, Math.PI * 2); g.fillStyle = on > 0.5 ? C.head : C.soft; g.fill();
          M.label('off switch (newer versions)', tx + tw + 20, sy + 9, { align: 'left', color: C.strong });
        });
      }
      g.restore();
    });
  }

  // ------------------------------------------------ inventory: the 01.12 map chip slides in, bottom right
  const kI = K.io(t, cInv, 0.7);
  if (kI > 0.002) {
    const lit = K.io(t, tTwelve, 0.5);
    const txt = 'What AI is already on your PC?';
    const tw = K.measure(txt, { font: 'ui', weight: 600, size: 26 });
    const nw = K.measure('01.12', { font: 'mono', weight: 600, size: 26 });
    const w = 30 + 40 + 16 + nw + 18 + tw + 30, h = 76;
    const x = 1800 - w + (1 - K.ease.out(kI)) * 80, y = 818;
    K.layer(kI, () => {
      if (lit > 0) K.glow(x + w / 2, y + h / 2, w * 0.6, C.head, 0.18 * lit);
      K.card(x, y, w, h, { r: h / 2, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.4 + 0.6 * lit), glow: lit * 0.6 });
      K.icon('map', x + 30 + 20, y + h / 2, 36, { color: C.head, w: 2.5 });
      K.text('01.12', x + 30 + 40 + 16, y + h / 2 + 9, { font: 'mono', weight: 600, size: 26, color: C.head });
      K.text(txt, x + 30 + 40 + 16 + nw + 18, y + h / 2 + 9, { font: 'ui', weight: 600, size: 26, color: C.strong });
    });
  }
  });
});
