/* 09 — Why a new terminal after an install
   Phase A (installer-home .. new-courier): the installer writes a new street onto the master PATH card at home;
   the terminal that left earlier still carries the old card ("not recognized"); a new courier leaves with a
   fresh copy. Phase B (new-tab .. end): who has to start fresh to see the change: a new Windows Terminal tab
   (since 2023), the editor that hands its terminal a copy, and the agent that reads the environment at start. */
SCENE('09', (t, S) => {
  const C = K.C, P = M.P;
  K.bg();

  const cInst = S.cue('installer-home', 0);
  const cOld = S.cue('old-satchel', 6.0);
  const cNew = S.cue('new-courier', 13.85);
  const cTab = S.cue('new-tab', 18.3);
  const cEd = S.cue('editor', 29.9);
  const cAg = S.cue('agent-restart', 37.4);
  const w = (word, n, fb) => S.find(word, n || 0, fb);

  // ------------------------------------------------------------ the PATH card, read as a short list
  // paper card with a dark PATH tab; rows [{n, text, k (reveal), state: 'new' | 'missing'}]
  const ROW = 44, TAB = 44;
  function pathList(x, y, wd, rows, o = {}) {
    const a = K.clamp(o.alpha == null ? 1 : o.alpha);
    if (a <= 0.002) return;
    const g = K.ctx();
    const h = TAB + rows.length * ROW + 18;
    K.layer(a, () => {
      g.save();
      if (o.glow) { g.shadowColor = K.rgba(C.head, 0.6 * o.glow); g.shadowBlur = 36; }
      else { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 40; g.shadowOffsetY = 14; }
      K.rr(x, y, wd, h, 14); g.fillStyle = P.paper; g.fill(); g.shadowColor = 'transparent';
      g.save(); K.rr(x, y, wd, h, 14); g.clip();
      g.fillStyle = P.tab; g.fillRect(x, y, wd, TAB);
      g.fillStyle = P.path; g.fillRect(x, y, 9, h);
      g.restore();
      K.text('PATH', x + 26, y + TAB / 2 + 9, { font: 'mono', weight: 700, size: 26, color: C.head });
      if (o.tag) K.text(o.tag, x + wd - 18, y + TAB / 2 + 9, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'right' });
      rows.forEach((r, i) => {
        const ry = y + TAB + 10 + i * ROW, k = K.clamp(r.k == null ? 1 : r.k);
        if (r.state === 'missing') {
          g.save(); g.setLineDash([8, 7]); g.lineWidth = 2; g.strokeStyle = K.rgba(P.inkSoft, 0.55);
          K.rr(x + 22, ry + 3, wd - 44, ROW - 6, 8); g.stroke(); g.restore();
          K.text(String(r.n), x + 34, ry + ROW / 2 + 9, { font: 'mono', weight: 600, size: 26, color: K.rgba(P.inkSoft, 0.6) });
          return;
        }
        if (k <= 0) return;
        if (r.state === 'new') {
          g.save(); K.rr(x + 22, ry + 3, (wd - 44) * K.ease.io(K.clamp(k * 1.6)), ROW - 6, 8); g.fillStyle = K.rgba(C.head, 0.38); g.fill(); g.restore();
        }
        const s = r.text.slice(0, Math.round(r.text.length * K.clamp(k * 1.25 - 0.1)));
        K.text(String(r.n), x + 34, ry + ROW / 2 + 9, { font: 'mono', weight: 700, size: 26, color: P.inkSoft, alpha: K.clamp(k * 3) });
        K.text(s, x + 74, ry + ROW / 2 + 9, { font: 'mono', weight: 600, size: 26, color: P.ink });
      });
      g.restore();
    });
  }
  const R1 = { n: 1, text: 'C:\\Windows\\system32' };
  const R2 = { n: 2, text: 'C:\\…\\Python310' };
  const R3 = 'C:\\…\\tool\\bin';

  // a gold "start again" loop around a tile
  function restartLoop(x, y, r, k) {
    k = K.clamp(k); if (k <= 0) return;
    const g = K.ctx(), a0 = -Math.PI * 0.62, sweep = Math.PI * 1.65 * K.ease.io(k), a1 = a0 + sweep;
    g.save();
    g.shadowColor = K.rgba(C.head, 0.5); g.shadowBlur = 16;
    g.strokeStyle = C.head; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke();
    if (k > 0.15) {
      const hx = x + r * Math.cos(a1), hy = y + r * Math.sin(a1), tx = -Math.sin(a1), ty = Math.cos(a1);
      const nx = Math.cos(a1), ny = Math.sin(a1), hs = 18;
      g.fillStyle = C.head; g.beginPath();
      g.moveTo(hx + tx * hs, hy + ty * hs);
      g.lineTo(hx - tx * hs * 0.4 + nx * hs * 0.75, hy - ty * hs * 0.4 + ny * hs * 0.75);
      g.lineTo(hx - tx * hs * 0.4 - nx * hs * 0.75, hy - ty * hs * 0.4 - ny * hs * 0.75);
      g.closePath(); g.fill();
    }
    g.restore();
  }

  // ============================================================ PHASE A: home, the old courier, the new one
  const aOut = 1 - K.io(t, cTab - 0.3, 0.6);
  if (aOut > 0.002) K.layer(aOut, () => {
    // the door: opens for the new courier, then shuts
    const dOpen = K.io(t, cNew, 0.6) * (1 - K.io(t, cNew + 2.75, 0.6));
    M.door(t, { open: dOpen, glow: 0.35 * K.env(t, w('master', 0, 3.86), w('But', 0, 6.0), 0.5) });

    // the master PATH card at home
    const mX = 400, mY = 170, mW = 430;
    const addK = K.io(t, w('adds', 0, 2.67), 1.2, 'lin');
    const mGlow = K.env(t, w('master', 0, 3.86), cOld, 0.5);
    pathList(mX, mY, mW, [R1, R2, { n: 3, text: R3, state: 'new', k: addK }], { glow: mGlow * 0.8 });
    M.label('master copy at home', mX + mW / 2, mY + TAB + 3 * ROW + 18 + 40, { color: C.head, alpha: K.io(t, w('master', 0, 3.86), 0.5) });

    // the installer (a program at home) writes the new street
    const instA = K.io(t, w('install', 0, 0.29), 0.5) * (1 - K.io(t, cNew - 0.7, 0.6));
    const inst = M.courier(t, 920, 580, 100, { icon: 'gear', label: 'installer', lit: K.env(t, w('installer', 0, 2.0), cOld, 0.4), alpha: instA });
    K.arrow(905, 518, mX + mW + 16, mY + TAB + 2 * ROW + 32, { k: K.io(t, w('installer', 0, 2.0), 0.6), bend: 30, color: K.rgba(C.head, instA), w: 3 });
    void inst;

    // the old courier: already out on the road, carrying the old card
    const oX = 1480;
    const oA = K.io(t, cOld, 0.6);
    const stale = K.io(t, w('old', 0, 10.48), 0.5);
    const oc = M.courier(t, oX, 540, 100, { icon: 'terminal', label: 'opened earlier', alpha: oA,
      satchel: { open: 1, cards: [{ name: 'PATH', kind: 'path', lift: 0.8 }] } });
    pathList(oX - 210, 680, 420, [R1, R2, { n: 3, state: 'missing' }], { alpha: K.io(t, w('carrying', 0, 9.79), 0.5) });
    if (stale > 0) M.label('old card', oX, 912, { color: C.soft, alpha: stale });
    // the change never reaches it
    const blk = K.seg(t, w('left', 0, 8.3), w('left', 0, 8.3) + 1.0) * (1 - K.io(t, cNew - 0.4, 0.5));
    M.blocked(mX + mW + 10, mY + 80, oc.sx - 30, oc.sy - 40, blk, { stop: 0.72 });
    // its terminal: not recognized
    const sayT = w('says', 0, 11.82), notT = w('recognized', 0, 12.39);
    M.termStrip(t, [
      { at: w('So', 0, 11.48), cmd: 'tool', cps: 14 },
      { at: notT, out: "'tool' is not recognized…", color: C.accent },
    ], { x: 1120, y: 200, w: 720, h: 160, rows: 2, alpha: K.io(t, sayT - 0.6, 0.4) });

    // the new courier: out of the door, a fresh copy, then down the lane
    const nA = K.io(t, cNew + 0.25, 0.4);
    const walkK = K.io(t, cNew + 1.35, 1.2);
    const nX = K.lerp(470, 1000, walkK);
    const walking = t > cNew + 1.35 && t < cNew + 2.55 ? 1 : 0;
    const got = t >= cNew + 1.3;
    const nc = M.courier(t, nX, 540, 100, { icon: 'terminal', label: 'new terminal', alpha: nA, walking, lit: K.io(t, cNew + 1.3, 0.4),
      satchel: { open: got ? 1 : K.io(t, cNew + 0.4, 0.5), cards: got ? [{ name: 'PATH', kind: 'path', lift: 0.8, lit: 1 }] : [] } });
    M.copyFly(mX + mW / 2, mY + TAB + 3 * ROW + 18, nc.sx, nc.sy - 40, K.seg(t, cNew + 0.5, cNew + 1.3),
      { name: 'PATH', kind: 'path', w: 100, h: 110, bend: -60 });
    pathList(nX - 210, 680, 420, [R1, R2, { n: 3, text: R3, state: 'new', k: 1 }], { alpha: K.io(t, w('open', 1, 16.48), 0.5) });
  });

  // a courier with a CLOSED satchel nudged 18 px further out on the hip, so the tile's glyph stays fully
  // visible (M.courier has no satchel offset: hide its own satchel and draw ours; the strap loop still shows)
  function hipCourier(x, y, s, o, glow) {
    const r = M.courier(t, x, y, s, { ...o, satchel: { alpha: 0 } });
    const a = K.clamp(o.alpha == null ? 1 : o.alpha);
    const sx = r.sx + 18;
    M.satchel(t, sx, r.sy, r.ss, { open: 0, strap: 'none', names: false, glow: glow || 0, alpha: a });
    return { ...r, sx };
  }

  // ============================================================ PHASE B: who has to start fresh
  const bIn = K.io(t, cTab, 0.6);
  if (bIn > 0.002) K.layer(bIn, () => {
    // --- 2021: close the whole window
    const shut = K.io(t, w('closed', 0, 19.47), 0.7);
    K.layer(1 - 0.55 * shut, () => {
      K.win(110, 210, 540, 230, { kind: 'terminal', title: 'Command Prompt', titleSize: 26 });
      M.label('close the whole window', 380, 345, { color: C.body, size: 30 });
    });
    M.eyebrow('2021', 380, 180, { color: C.soft });

    // --- since 2023: Windows Terminal, an old tab and a new tab
    const wtA = K.io(t, w('Since', 0, 21.08), 0.5);
    const tabB = K.io(t, w('new', 2, 22.9), 0.6, 'back');
    const picks = K.io(t, w('picks', 0, 24.99), 0.5);
    const oldTab = K.io(t, w('already', 0, 27.56), 0.5);
    const notK = K.io(t, w('does', 0, 28.7), 0.5);
    K.layer(wtA, () => {
      M.eyebrow('since 2023', 1300, 180);
      const wx = 760, wy = 210, ww = 1080, wh = 260;
      K.win(wx, wy, ww, wh, { kind: 'terminal', title: 'Windows Terminal', titleSize: 26 });
      const ty = wy + 62, th = 48;
      // tab A (already open)
      K.card(790, ty, 490, th, { r: 10, fill: C.tile, stroke: C.line2, shadow: false });
      K.text('PowerShell', 812, ty + th / 2 + 9, { font: 'mono', weight: 600, size: 26, color: C.body });
      // tab B (new)
      if (tabB > 0) {
        K.at(1555, ty + th / 2, K.lerp(0.6, 1, tabB), 0, () => {
          K.layer(K.clamp(tabB), () => {
            K.card(-245, -th / 2, 490, th, { r: 10, fill: K.mixColor(C.tile, C.head, 0.14), stroke: C.head, glow: 0.6 * picks, shadow: false });
            K.text('PowerShell', -223, 9, { font: 'mono', weight: 600, size: 26, color: C.head });
            K.text('+', 220, 13, { font: 'head', weight: 700, size: 36, color: C.head, align: 'center' });
          });
        });
      }
      // column bodies
      const by = ty + th + 18;
      // A: still stale
      M.chip(860, by, { w: 92, h: 104, name: null, kind: 'path', dashed: false, alpha: 1 - 0.55 * oldTab });
      K.text('already open', 930, by + 40, { font: 'ui', weight: 600, size: 30, color: C.body, alpha: oldTab });
      K.text('still stale', 930, by + 82, { font: 'ui', weight: 600, size: 30, color: C.soft, alpha: notK });
      // B: picks up the change
      M.chip(1380, by, { w: 92, h: 104, kind: 'path', lit: picks, alpha: K.clamp(tabB) });
      K.text('new tab', 1450, by + 40, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: K.clamp(tabB) });
      K.text('picks up the change', 1450, by + 82, { font: 'ui', weight: 600, size: 30, color: C.head, alpha: picks });
    });

    // --- the editor hands its terminal a copy; restart the editor
    const edA = K.io(t, cEd, 0.5);
    const inner = K.io(t, w('inside', 0, 30.63), 0.5);
    const handK = K.seg(t, w('gets', 0, 32.08), w('gets', 0, 32.08) + 0.9);
    const edRestart = K.io(t, w('usually', 0, 35.37), 0.9);
    // the handed copy flies first so the terminal's closed satchel covers it as it sinks in
    { // clipped at the satchel's bottom edge so the sinking copy never pokes out underneath it
      const g = K.ctx(), tsy = 700 + 80 * 0.3;
      g.save(); g.beginPath(); g.rect(0, 0, 1920, tsy + 80 * 0.7 * 0.34 - 2); g.clip();
      M.copyFly(300 + 110 * 0.48 + 18, 690 + 110 * 0.3 - 30, 700 + 80 * 0.48 + 18, tsy - 14, handK,
        { name: null, kind: 'path', w: 60, h: 72, bend: -110 });
      g.restore();
    }
    const ed = hipCourier(300, 690, 110, { icon: 'code', alpha: edA, lit: edRestart }, edRestart);
    const tc = hipCourier(700, 700, 80, { icon: 'terminal', alpha: inner }, 0);
    K.arrow(372, 640, 640, 640, { k: inner, bend: -40, color: C.line2, w: 3 });
    void ed; void tc;
    restartLoop(300, 690, 82, edRestart);
    M.label('editor', 300, 822, { alpha: edA });
    M.label('its terminal', 700, 822, { alpha: inner });
    M.label('restart the editor', 300, 884, { color: C.head, size: 30, alpha: K.io(t, w('restart', 0, 36.27), 0.5) });

    // --- the agent: reads the environment at start
    const agA = K.io(t, cAg, 0.5);
    const docK = K.io(t, w('reads', 0, 41.45), 0.5);
    const agRestart = K.io(t, w('restart', 1, 44.88), 0.9);
    hipCourier(1180, 690, 110, { icon: 'sparkle', lantern: 1, alpha: agA, lit: agRestart }, agRestart);
    K.icon('clock', 1420, 680, 64, { color: C.strong, alpha: docK, w: 3 });
    K.text('reads the environment', 1475, 672, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: docK });
    K.text('when it starts', 1475, 714, { font: 'ui', weight: 600, size: 30, color: C.body, alpha: docK });
    restartLoop(1180, 690, 82, agRestart);
    M.label('Claude Code', 1180, 822, { alpha: agA });
    M.label('restart it to see a change', 1180, 884, { color: C.head, size: 30, alpha: K.io(t, w('restart', 1, 44.88), 0.5) });
  });
});
