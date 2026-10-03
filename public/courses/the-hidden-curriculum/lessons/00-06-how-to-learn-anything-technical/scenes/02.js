/* 00.06 scene 02: Where it lives, and the old case room.
   Map half: pin drops on Start; the case file (from 01's title position) shrinks onto the Start gate; the 00.01
   callback chip points into it ("a habit"). Case-room half (2021): the file grows to M.POS.room, you beside it, the
   five old steps as pills, Stack Overflow's wall of case reports, its question chart (peak, ChatGPT, cliff), and the
   wall packed into an ARCHIVE box that the clerk (the AI) still reads. */
SCENE('02', (t, S) => {
  const C = K.C;
  const cPin = S.cue('pin', 1), cForums = S.cue('forums', 3.7), cRoom = S.cue('old-room', 10.4);
  const cWall = S.cue('wall', 18.3), cFade = S.cue('fade', 23.6), cArch = S.cue('archive', 32.1);
  const w = (word, n, fb) => S.find(word, n, fb);
  const tBefore = w('before', 0, cPin + 1.3), tHabit = w('habit', 0, cForums + 5);
  const tTrace = w('traceback', 0, cRoom + 1.9), tGoogle = w('Google', 0, cRoom + 2.8), tStack = w('Stack', 0, cRoom + 4.4);
  const tDocs = w('docs', 0, cRoom + 6.1), tTry = w('try', 0, cRoom + 6.7);
  const tMillion = w('million', 0, cWall + 3.2), tNinety = w('ninety-nine', 0, cFade + 2.4);
  const tAlready = w('already', 0, cFade + 4.7), tChat = w('ChatGPT', 0, cFade + 6.2), tCliff = w('cliff', 0, cFade + 7.7);
  const tInside = w('inside', 0, cArch + 1.8);

  // ---------------------------------------------------------------- where the file is
  const MINI = { cx: 150, cy: 590, s: 0.17 };           // on the map, under the Start gate
  const fileIn = K.io(t, cPin + 0.45, 1.0);             // from 01's title spot down onto the gate
  const toRoom = K.io(t, cRoom, 0.9);                   // and up into the 2021 case room
  const F = toRoom > 0 ? M.lerpGeo(MINI, 'room', toRoom) : M.lerpGeo('title', MINI, fileIn);
  const fileA = K.clamp((t - cPin - 0.45) / 0.2);

  // ---------------------------------------------------------------- map half
  const mapA = 1 - K.io(t, cRoom, 0.9);
  const GATE = K.map.GATE;                               // Start (00): x 135, y 408, r 50
  const tagK = K.io(t, tBefore - 0.1, 0.5) * (1 - K.io(t, cForums - 0.2, 0.3));
  const callK = K.io(t, cForums + 0.2, 0.45);
  const hk = K.io(t, tHabit - 0.9, 0.9);                 // the 00.01 pill drops into the file: it becomes a habit
  const habitGlow = K.env(t, tHabit - 0.1, tHabit + 0.9, 0.35);
  K.bg();
  if (mapA > 0) {
    const z = K.lerp(1, 1.15, K.io(t, cRoom, 0.9));
    K.layer(mapA, () => K.zoomAt(135, 408, z, () => {
      // the map's own pin is small; this lesson draws its own (>= 48 px) and its own gold ring on Start
      K.map.draw(t, {
        focus: '00', pin: '00', lanterns: 1, lanternLabels: 1 - K.io(t, tBefore - 0.4, 0.4),
        pinK: 0, pinGlowK: K.io(t, cPin + 0.3, 0.6),
      });
      const g = K.ctx();
      // Start is HERE: gold ring and glow
      const rk = K.io(t, cPin + 0.3, 0.6);
      if (rk > 0) {
        K.glow(GATE.x, GATE.y, 150, C.head, 0.32 * rk);
        g.save(); g.globalAlpha *= rk; g.strokeStyle = C.head; g.lineWidth = 4;
        g.beginPath(); g.arc(GATE.x, GATE.y, 58, 0, 7); g.stroke(); g.restore();
      }
      // the pin (the scene's one overshoot), tip resting on the ring
      const pk = K.clamp((t - cPin) / 0.15);
      if (pk > 0) {
        const drop = (1 - K.io(t, cPin, 0.7, 'back')) * -90, bob = K.wave(t, 2.4, 3) * K.io(t, cPin + 0.7, 0.4);
        K.icon('pin', GATE.x, 322 + drop + bob, 80, { color: C.head, alpha: pk });
      }
      // The Machine: only a dim dashed 'next' outline (the lesson lives at Start, not here)
      const m = K.map.district('machine');
      const nk = K.io(t, tBefore - 0.1, 0.5);
      if (nk > 0) {
        g.save(); g.globalAlpha *= nk * 0.8; g.strokeStyle = K.rgba(C.head, 0.4); g.lineWidth = 2; g.setLineDash([10, 9]);
        K.rr(m.x - 4, m.y - 4, m.w + 8, m.h + 8, 28); g.stroke(); g.restore();
        K.text('next', m.x + m.w - 26, m.y + 52, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'right', alpha: nk });
        K.arrow(GATE.x + 66, GATE.y, m.x - 14, GATE.y, { k: K.io(t, tBefore, 0.6), color: K.rgba(C.head, 0.8), w: 3, head: 12 });
      }
      // the tag sits by Start (above it, in the faded lantern-label row), then gives way to the 00.01 callback
      if (tagK > 0) {
        const tw = K.measure('last stop before The Machine  →', { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
        K.pill('last stop before The Machine  →', 84 + tw / 2, 222 + (1 - tagK) * 8, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.6), fill: '#1C1B2A', alpha: tagK });
      }
      if (callK > 0 && hk < 1) {
        const lbl = 'lesson 00.01 · forums, breaking things';
        const cw = K.measure(lbl, { font: 'ui', weight: 600, size: 28 }) + 28 * 1.6;
        const x0 = 84 + cw / 2, y0 = 222;
        const px = K.lerp(x0, MINI.cx, hk), py = K.lerp(y0, MINI.cy, hk), sc = K.lerp(1, 0.25, hk);
        K.layer(callK * (1 - hk * hk), () => K.zoomAt(px, py, sc, () =>
          K.pill(lbl, px, py + (1 - callK) * 8, { size: 28, color: C.strong, stroke: K.rgba(C.strong, 0.45), fill: '#1C1B2A' })));
      }
      const hp = K.io(t, tHabit - 0.1, 0.5) * (1 - K.io(t, cRoom - 0.1, 0.3));
      if (hp > 0) K.text('a habit', MINI.cx, 676, { font: 'ui', weight: 700, size: 30, color: C.head, align: 'center', alpha: hp });
    }));
  }

  // ---------------------------------------------------------------- case room (2021)
  const roomA = K.io(t, cRoom + 0.2, 0.8);
  const ROWY = 198;                                      // the old loop's row and the wall's eyebrow share one line

  // the wall of case reports: 6 x 4, row by row
  const WALL = { x: 1140, y: 240, w: 640, h: 460, cols: 6, rows: 4, gap: 14 };
  const archK = K.io(t, cArch, 0.8);
  const BOX = { x: 1140, y: 300, w: 400, h: 350 };
  // the wall clears completely (0.4 s) before the chart line starts, then comes back as it slides into the box
  const dimK = K.io(t, cFade, 0.4);
  const wallA = roomA * K.lerp(1 - dimK, 0.55, archK);
  const cellW = (WALL.w - (WALL.cols - 1) * WALL.gap) / WALL.cols, cellH = (WALL.h - (WALL.rows - 1) * WALL.gap) / WALL.rows;
  const drawWall = () => {
    const fx = K.lerp(WALL.x, BOX.x + 24, archK), fy = K.lerp(WALL.y, BOX.y + 70, archK);
    const sc = K.lerp(1, (BOX.w - 48) / WALL.w, archK);
    for (let r = 0; r < WALL.rows; r++) for (let c = 0; c < WALL.cols; c++) {
      const i = r * WALL.cols + c;
      const k = K.stagger(t, cWall, r * 1.6 + c * 0.6, 0.6, 0.5);  // row by row
      if (k <= 0) continue;
      const x = fx + (c * (cellW + WALL.gap)) * sc, y = fy + (r * (cellH + WALL.gap)) * sc - (1 - k) * 18;
      const cw = cellW * sc, ch = cellH * sc;
      K.layer(k * wallA, () => {
        K.card(x, y, cw, ch, { r: 12 * sc, fill: '#26232F', stroke: K.rgba(C.line2, 0.9), shadow: false });
        K.icon('question', x + 24 * sc, y + 28 * sc, 30 * sc, { color: '#A89D8B', w: 2 });
        const R = K.rng(17 + i);
        K.line(x + 14 * sc, y + 64 * sc, x + (14 + 46 + R() * 22) * sc, y + 64 * sc, { color: K.rgba(C.body, 0.35), w: 6 * sc });
        K.line(x + 14 * sc, y + 84 * sc, x + (14 + 26 + R() * 36) * sc, y + 84 * sc, { color: K.rgba(C.body, 0.22), w: 6 * sc });
      });
    }
  };

  // the 2021 loop: one row from the start, each chip lighting the tab it is (Briefing stays dark: no one to brief).
  // Everything of the old loop packs away at [[archive]], leaving the file as 03 picks it up (tabs off, tucked low).
  const PIPE = [['traceback', 'warning', tTrace, 0], ['Google', 'globe', tGoogle, 1], ['Stack Overflow', 'question', tStack, 1],
    ['docs', 'book', tDocs, 2], ['try it', 'check', tTry, 4]];
  const CHIP = { size: 26, h: 50, padL: 16, icon: 28, iconGap: 10, padR: 20 };
  const chipW = PIPE.map(([l]) => K.measure(l, { font: 'ui', weight: 600, size: CHIP.size }) + CHIP.padL + CHIP.icon + CHIP.iconGap + CHIP.padR);
  const RX0 = 96, RX1 = 1104;
  const gap = Math.max(26, Math.min(48, (RX1 - RX0 - chipW.reduce((a, b) => a + b, 0)) / (PIPE.length - 1)));
  const chipX = []; { let x = RX0; chipW.forEach((cw) => { chipX.push(x); x += cw + gap; }); }
  const packK = K.io(t, cArch, 0.8);
  const tabV = [0, 0, 0, 0, 0], tabF = [0, 0, 0, 0, 0];
  PIPE.forEach(([, , at, ti]) => { tabV[ti] = Math.max(tabV[ti], K.io(t, at - 0.1, 0.45)); tabF[ti] = Math.max(tabF[ti], K.env(t, at - 0.1, at + 0.5, 0.3)); });
  for (let i = 0; i < 5; i++) tabV[i] *= 1 - packK;
  const reveal = K.lerp(1, 0.3, packK);
  const tNoBrief = tTry + 0.5;

  if (roomA > 0) K.layer(roomA, () => {
    // eyebrow chip over the wall: each swap runs in sequence (old out with a small lift, then new in)
    const swapA = K.io(t, cWall - 0.4, 0.3), swapB = K.io(t, cFade, 0.3);
    const inA = K.io(t, cWall - 0.05, 0.3), inB = K.io(t, cFade + 0.35, 0.3);
    const chipA = K.io(t, cRoom + 0.9, 0.5) * (1 - archK);
    if (chipA > 0) K.layer(chipA, () => {
      const cx = WALL.x + WALL.w / 2;
      if (swapA < 1) M.dated('2021 · by hand', cx, ROWY - 10 * swapA, { alpha: 1 - swapA });
      if (inA > 0 && swapB < 1) M.dated('Stack Overflow · 2021', cx, ROWY + (1 - inA) * 8 - 10 * swapB, { alpha: inA * (1 - swapB) });
      if (inB > 0) M.dated('Stack Overflow · new questions a month', cx, ROWY + (1 - inB) * 8, { alpha: inB });
    });
    drawWall();

    // the wall's foot note: 2021, then the 2026 numbers (in sequence too)
    const n1 = K.io(t, tMillion - 0.2, 0.5) * (1 - K.io(t, tNinety - 0.7, 0.3));
    const n2 = K.io(t, tNinety - 0.3, 0.45) * (1 - K.io(t, cArch, 0.5));
    if (n1 > 0) {
      K.card(WALL.x, 740, WALL.w, 110, { r: 22, fill: '#1C1B2A', stroke: K.rgba(C.head, 0.4), alpha: n1 });
      K.text('1M+ new questions a year', WALL.x + 36, 806, { font: 'ui', weight: 600, size: 34, color: C.strong, alpha: n1 });
      K.text('2021', WALL.x + WALL.w - 36, 806, { font: 'mono', size: 26, color: C.head, align: 'right', alpha: n1 });
    }
    if (n2 > 0) {
      K.card(WALL.x, 740, WALL.w, 150, { r: 22, fill: '#1C1B2A', stroke: K.rgba(C.head, 0.4), alpha: n2 });
      K.text('~1,000–1,500 new questions a month', WALL.x + 32, 798, { font: 'ui', weight: 600, size: 32, color: C.strong, alpha: n2 });
      K.text('summer 2026 · was ~200,000 in 2014', WALL.x + 32, 850, { font: 'mono', size: 26, color: C.head, alpha: n2 });
    }

    // the question chart, on the cleared wall space
    const chartA = K.io(t, cFade + 0.25, 0.4) * (1 - archK);
    if (chartA > 0) {
      const X0 = 1180, X1 = 1740, Y0 = 640, Y1 = 300;      // y for 0 and for ~210k/month
      const data = [[2010, 60], [2011, 105], [2012, 140], [2013, 178], [2014, 200], [2015, 192], [2016, 183], [2017, 174],
        [2018, 160], [2019, 147], [2020, 152], [2021, 126], [2022, 111], [2023, 66], [2024, 33], [2025, 9], [2026.5, 1.3]];
      const px = (yr) => K.lerp(X0, X1, (yr - 2010) / 16.5), py = (v) => K.lerp(Y0, Y1, v / 210);
      K.layer(chartA, () => {
        K.card(X0 - 30, Y1 - 60, X1 - X0 + 60, Y0 - Y1 + 120, { r: 22, fill: '#17161F', stroke: K.rgba(C.line2, 0.7), shadow: false });
        K.line(X0, Y0, X1, Y0, { color: K.rgba(C.body, 0.4), w: 2 });
        ['2010', '2014', '2018', '2022', '2026'].forEach((s) => K.text(s, px(+s), Y0 + 36, { font: 'mono', size: 22, color: C.soft, align: 'center' }));
      });
      // the line starts once the wall is gone, and finishes as 'from peak' is said
      const tEnd = Math.max(cFade + 2.8, w('peak', 0, cFade + 3.6) + 0.4);
      const prog = K.io(t, cFade + 0.55, tEnd - cFade - 0.55, 'sine') * (data.length - 1);
      const g = K.ctx();
      K.layer(chartA, () => {
        g.save(); g.strokeStyle = C.head; g.lineWidth = 4; g.lineJoin = 'round'; g.lineCap = 'round';
        g.beginPath();
        const n = Math.floor(prog);
        for (let i = 0; i <= Math.min(n, data.length - 1); i++) { const [yr, v] = data[i]; i ? g.lineTo(px(yr), py(v)) : g.moveTo(px(yr), py(v)); }
        if (n < data.length - 1 && prog > 0) {
          const f = prog - n, [ya, va] = data[n], [yb, vb] = data[n + 1];
          g.lineTo(px(K.lerp(ya, yb, f)), py(K.lerp(va, vb, f)));
        }
        if (prog > 0) g.stroke();
        g.restore();
        const pkK = K.clamp((prog - 4.2) / 0.6);
        if (pkK > 0) {
          K.layer(pkK, () => {
            g.save(); g.fillStyle = C.head; g.beginPath(); g.arc(px(2014), py(200), 7, 0, 7); g.fill(); g.restore();
            K.text('peak · 2014', px(2014), py(200) - 20, { align: 'center', font: 'ui', weight: 600, size: 26, color: C.head });
          });
        }
        const ck = K.io(t, tChat - 0.1, 0.5);
        if (ck > 0) {
          const x = px(2022.85);
          K.line(x, Y0, x, Y1 + 40, { k: ck, color: K.rgba(C.strong, 0.75), w: 2, dash: [6, 7] });
          K.text('Nov 2022 · ChatGPT', x - 14, Y0 - 26, { font: 'mono', size: 26, color: C.strong, align: 'right', alpha: ck });
        }
        const clK = K.io(t, tCliff - 0.2, 0.6);
        if (clK > 0) {
          g.save(); g.globalAlpha *= clK; g.strokeStyle = K.rgba(C.head, 0.28); g.lineWidth = 16; g.lineJoin = 'round'; g.lineCap = 'round';
          g.beginPath(); g.moveTo(px(2022.85), py(K.lerp(111, 66, 0.85)));
          for (let i = 13; i < data.length; i++) g.lineTo(px(data[i][0]), py(data[i][1]));
          g.stroke(); g.restore();
        }
        const ek = K.clamp((prog - (data.length - 1.2)) / 0.2);
        if (ek > 0) { g.save(); g.globalAlpha *= ek; g.fillStyle = C.head; g.beginPath(); g.arc(px(2026.5), py(1.3), 7, 0, 7); g.fill(); g.restore(); }
      });
    }

    // the archive box and the clerk that still reads it
    if (archK > 0) {
      const bk = K.io(t, cArch + 0.3, 0.6);
      K.layer(bk, () => {
        K.card(BOX.x, BOX.y, BOX.w, BOX.h, { r: 20, fill: K.rgba('#1C1B2A', 0.35), stroke: K.rgba(C.body, 0.55), shadow: false });
        K.text('ARCHIVE · still read', BOX.x + BOX.w / 2, BOX.y + 46, { font: 'ui', weight: 700, size: 28, color: C.body, align: 'center', tracking: 2 });
      });
      const ak = K.io(t, tInside - 0.3, 0.9);
      const lk = K.io(t, tInside - 0.1, 0.5);
      const clx = 1700, cly = 470;
      if (ak > 0) M.clerkLine(BOX.x + BOX.w + 8, BOX.y + BOX.h / 2, clx - 64, cly, ak, { bend: -0.15 });
      M.clerk(t, clx, cly, 80, { alpha: lk, glow: 0.8 * lk, label: lk, labelText: 'inside the AI' });
    }
  });

  // the case file (on the map it sits under the Start gate)
  if (fileA > 0) {
    M.drawFile(t, F, { tabs: tabV, flash: tabF, reveal, alpha: fileA, glow: habitGlow * mapA,
      caseNo: toRoom > 0.9 ? 'CASE 00.06' : false });
  }

  // the old loop's row over the file, with a thin cream thread from each chip down to its tab
  if (roomA > 0) K.layer(roomA * (1 - packK), () => {
    PIPE.forEach(([label, icon, at, ti], i) => {
      const k = K.io(t, at - 0.1, 0.45);
      if (k <= 0) return;
      const x = chipX[i], cw = chipW[i], cy = ROWY + (1 - k) * 8;
      const T = F.tabs[ti];
      K.line(x + cw / 2, ROWY + CHIP.h / 2 + 4, T.cx, T.top + 4, { k: K.io(t, at, 0.5), color: K.rgba(C.strong, 0.4), w: 2 });
      if (i > 0) {
        const ax = chipX[i - 1] + chipW[i - 1] + 6;
        K.arrow(ax, ROWY, x - 6, ROWY, { k: K.io(t, at - 0.2, 0.3), color: K.rgba(C.strong, 0.6), w: 2.5, head: 9 });
      }
      K.layer(k, () => {
        K.card(x, cy - CHIP.h / 2, cw, CHIP.h, { r: CHIP.h / 2, fill: '#1C1B2A', stroke: K.rgba(C.strong, 0.35), shadow: false });
        K.icon(icon, x + CHIP.padL + CHIP.icon / 2, cy, CHIP.icon, { color: C.head, w: 2.5 });
        K.text(label, x + CHIP.padL + CHIP.icon + CHIP.iconGap, cy + CHIP.size * 0.34, { font: 'ui', weight: 600, size: CHIP.size, color: C.body });
      });
    });
    // Briefing: the empty tab of 2021
    const nb = K.io(t, tNoBrief, 0.5);
    if (nb > 0) {
      const T = F.tabs[3];
      K.layer(nb, () => {
        const g = K.ctx();
        g.save(); g.strokeStyle = K.rgba(C.soft, 0.7); g.lineWidth = 2; g.setLineDash([7, 7]);
        K.rr(T.x - 4, T.top - 4, T.w + 8, T.h + 4, 14); g.stroke(); g.restore();
        K.text('2021: no one to brief', T.cx, 528, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center' });
        K.arrow(T.cx, 494, T.cx, T.top + T.h + 10, { color: K.rgba(C.soft, 0.7), w: 2, head: 9 });
      });
    }
  });
  // you, beside the file
  if (roomA > 0) M.you(t, 150, 650, 100, { alpha: roomA, label: K.io(t, cRoom + 0.6, 0.5) });
});
