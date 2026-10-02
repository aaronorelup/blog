// 10 — Notes pinned to the desk: system prompt, your instructions, CLAUDE.md / AGENTS.md; a note is not a lock.
SCENE('10', (t, S) => {
  K.bg();
  const C = K.C, P = M.palette, g = K.ctx();
  const W = (re, n, fb) => S.find(re, n, fb);

  // ---- beats (local seconds; cues + spoken words)
  const cSys = S.cue('system', 3.2), cYours = S.cue('yours', 14.23), cMd = S.cue('claude-md', 22.25);
  const cAg = S.cue('agents-md', 38.93), cLock = S.cue('not-lock', 53.56);
  const tRail = 0.9;
  const tPub = W(/^Anthropic/, 0, 10.6);
  const tPrefs = W(/^preferences/, 0, 16.27);
  const tResent = W(/^re-sent/, 0, 20.28);
  const tFile = W(/^file$/, 0, 26.2);
  const tReads = W(/^reads$/, 0, 31.5);
  const tStart = W(/^start$/, 0, 32.3);
  const tUser = W(/^user$/, 0, 34.75);
  const tComp = W(/^company$/, 0, 35.9);
  const tSub = W(/^sub-folders$/, 0, 36.43);
  const tOpen = W(/^open$/, 0, 40.89);
  const tNow = W(/^now$/, 0, 44.35);
  const tGem = W(/^Gemini$/, 0, 48.69);
  const tCur = W(/^Cursor/, 0, 50.53);
  const tLockW = W(/^lock\.?$/, 0, 54.74);
  const tHooks = W(/^Hooks$/, 0, 55.4);
  const tLong = W(/^long$/, 0, 58.35);
  const tFollow = W(/^followed$/, 0, 59.42);
  const tCosts = W(/^costs$/, 0, 61.15);
  const tShelf = W(/^Instruction$/, 0, 63.8);

  // ---- the desk: arrives from 09's hall desk, settles left to leave room for the project tree
  const D0 = M.at(M.layout.hall);
  const D1 = M.desk({ w: 1120, h: 380 }, { cx: 690, cy: 640 });
  const D = M.lerpDesk(D0, D1, K.io(t, 0.2, M.motion.grow));

  // token cost of everything pinned (gold squares on the ruler)
  const fill = 0.07 * K.io(t, cSys + 0.4, 0.6) + 0.08 * K.io(t, cYours + 0.4, 0.6) + 0.1 * K.io(t, tReads + 1.0, 0.6)
    + 0.07 * K.io(t, tUser + 0.3, 1.4) + 0.14 * K.io(t, tLong + 0.2, 1.0);
  const costPulse = K.env(t, tCosts, tCosts + 1.6, 0.4);

  M.stage(t, { desk: D, ruler: { fill } });
  if (costPulse > 0) K.glow(D.x0 + 30 + fill * (D.w - 60) * 0.5, D.y1 - 30, 260, C.head, 0.22 * costPulse);

  // ---- pin rail along the far edge
  const railY = D.y0 + 30;
  const railK = K.io(t, tRail, 0.9);
  K.line(D.x0 + 70, railY, D.x1 - 70, railY, { k: railK, color: K.rgba(C.head, 0.45), w: 3 });

  const NW = 300, NH = 140;
  const nx = [360, 690, 1020];
  const noteTop = D1.y0 + 30; // final rail, notes hang from it
  const ny = noteTop + NH / 2 + 4;
  const after = K.io(t, 0.2, M.motion.grow) >= 1;
  const asks = K.io(t, cLock, 0.6);                   // lower-row helpers leave, "a note asks" arrives
  const lowerA = 1 - asks;

  const ink = (s, x, y, o = {}) => K.text(s, x, y, { font: 'ui', weight: 600, size: 26, color: C.ink, ...o });

  // a pinned note: drops from above onto the rail, pin pops when it lands
  function note(i, t0, draw, o = {}) {
    if (t < t0) return;
    const L = M.land(t, t0, nx[i], ny, nx[i], ny - 70, M.motion.land);
    const pin = K.io(t, t0 + 0.45, 0.3, 'out');
    const h = o.h || NH, rot = o.rot || 0, cy = L.y + (h - NH) / 2;
    M.paper(nx[i], cy, { w: NW, h, kind: 'note', lines: 0, alpha: L.a, rot, glow: o.glow || 0 });
    K.layer(L.a, () => K.at(nx[i], cy, 1, rot, () => draw(-NW / 2 + 18, -h / 2, h)));
    if (pin > 0) {
      g.save(); g.globalAlpha *= pin; g.fillStyle = C.head; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 6;
      g.beginPath(); g.arc(nx[i], L.y - NH / 2 + 4, 9 * (0.6 + 0.4 * pin), 0, Math.PI * 2); g.fill(); g.restore();
    }
  }

  // note 1: the system prompt
  note(0, cSys, (x, y) => {
    ink('system prompt', x, y + 50, { size: 30 });
    ink("the app's own", x, y + 96, { alpha: K.io(t, cSys + 0.9, 0.5), color: '#5A4A35', weight: 500 });
  });
  // "published by Anthropic" under it
  K.layer(K.io(t, tPub, 0.5) * lowerA, () => K.pill('published by Anthropic', nx[0], 700, { size: 26, color: C.strong }));

  // note 2: your instructions (sags when it gets long)
  const longK = K.io(t, tLong, 1.0);
  const lineFade = K.io(t, tFollow, 1.2);
  note(1, cYours, (x, y, h) => {
    ink('your instructions', x, y + 50, { size: 30 });
    ink('preferences · styles', x, y + 96, { alpha: K.io(t, tPrefs, 0.5), color: '#5A4A35', weight: 500 });
    // the long version: many more lines, the lower ones fading (followed less)
    if (longK > 0) {
      const n = 7;
      for (let j = 0; j < n; j++) {
        const yy = y + 128 + j * 17;
        if (yy > y + h - 14) break;
        const fade = 1 - lineFade * K.clamp((j - 1) / (n - 2));
        K.line(x, yy, x + NW - 40 - (j % 3) * 30, yy, { color: P.inkLine, w: 3, alpha: K.io(t, tLong + j * 0.08, 0.3) * (0.12 + 0.88 * fade) });
      }
    }
  }, { h: NH + 100 * longK, rot: 0.025 * longK });

  // "every turn" loop under note 2
  const loopK = K.io(t, tResent, 0.8);
  if (loopK > 0) K.layer(lowerA, () => {
    const lx = nx[1] - 80, ly = 700, r = 20;
    g.save(); g.strokeStyle = C.head; g.lineWidth = 3; g.lineCap = 'round';
    const a0 = -Math.PI * 0.5, a1 = a0 + Math.PI * 1.65 * loopK;
    g.beginPath(); g.arc(lx, ly, r, a0, a1); g.stroke();
    if (loopK > 0.95) {
      const hx = lx + r * Math.cos(a1), hy = ly + r * Math.sin(a1), tx = -Math.sin(a1), ty = Math.cos(a1);
      g.fillStyle = C.head; g.beginPath();
      g.moveTo(hx + tx * 10, hy + ty * 10); g.lineTo(hx - tx * 2 + Math.cos(a1) * 8, hy - ty * 2 + Math.sin(a1) * 8);
      g.lineTo(hx - tx * 2 - Math.cos(a1) * 8, hy - ty * 2 - Math.sin(a1) * 8); g.closePath(); g.fill();
    }
    g.restore();
    K.text('every turn', lx + 38, ly + 10, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: K.io(t, tResent + 0.4, 0.5) });
  });

  // ---- the project tree (right)
  const winA = K.io(t, cMd, 0.6) * (1 - 0.6 * K.io(t, cLock + 0.3, 0.8));
  const WX = 1290, WY = 205, WW = 520, WH = 340;
  const rowY = (i) => WY + 50 + 46 + i * 50;
  const rowX = WX + 40;
  const mdGlow = K.env(t, tFile, tReads + 0.6, 0.4);
  const flyK = K.io(t, tReads - 0.2, 0.9);
  if (winA > 0) K.layer(winA, () => {
    const dy = (1 - K.io(t, cMd, 0.6, 'out')) * 20;
    K.at(0, dy, 1, 0, () => {
      K.win(WX, WY, WW, WH, { kind: 'explorer', title: 'my-project', titleSize: 26 });
      const fileRow = (i, label, o = {}) => K.layer(o.alpha == null ? 1 : o.alpha, () => {
        const x = rowX + (o.indent || 0), y = rowY(i);
        if (o.folder) {
          g.save(); g.fillStyle = C.head; K.rr(x, y - 13, 30, 22, 4); g.fill(); K.rr(x, y - 18, 13, 8, 2); g.fill(); g.restore();
        } else {
          g.save(); g.strokeStyle = o.color || C.soft; g.lineWidth = 2; K.rr(x + 4, y - 18, 22, 28, 3); g.stroke(); g.restore();
        }
        if (o.glow) { K.glow(x + 120, y - 4, 140, C.head, 0.3 * o.glow); g.save(); g.strokeStyle = K.rgba(C.head, 0.8 * o.glow); g.lineWidth = 2.5; K.rr(x - 12, y - 30, WW - 56 - (o.indent || 0), 44, 10); g.stroke(); g.restore(); }
        K.text(label, x + 46, y + 4, { font: 'mono', weight: 600, size: 26, color: o.color || C.body });
      });
      fileRow(0, 'src/', { folder: true });
      fileRow(1, 'CLAUDE.md', { indent: 40, alpha: 0.75 * K.io(t, tSub, 0.5), color: C.strong });
      fileRow(2, 'CLAUDE.md', { glow: mdGlow, color: C.strong });
      fileRow(3, 'README.md');
      const agA = K.io(t, cAg, 0.6);
      fileRow(4, 'AGENTS.md', { alpha: 0.8 * agA, color: C.strong });
      K.layer(K.io(t, tOpen, 0.5), () => K.pill('open version', WX + WW - 125, rowY(4) - 5, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5) }));
    });
  });

  // under the tree: the AGENTS.md rule + the same idea elsewhere
  const sideA = 1 - 0.6 * K.io(t, cLock + 0.3, 0.8);
  K.layer(K.io(t, tNow, 0.6) * sideA, () => {
    K.text('Claude Code: only if no CLAUDE.md', WX + 10, 600, { font: 'ui', weight: 600, size: 26, color: C.strong });
  });
  const chipY = 670;
  const gw = K.measure('GEMINI.md', { font: 'mono', size: 26, weight: 600 }) + 26 * 0.9;
  K.layer(K.io(t, tGem, 0.5) * sideA, () => M.chip('GEMINI.md', WX + 10 + gw / 2, chipY, { size: 26, stroke: K.rgba(C.line2, 1) }));
  const cw = K.measure('Cursor rules', { font: 'mono', size: 26, weight: 600 }) + 26 * 0.9;
  K.layer(K.io(t, tCur, 0.5) * sideA, () => M.chip('Cursor rules', WX + 10 + gw + 20 + cw / 2, chipY, { size: 26, stroke: K.rgba(C.line2, 1) }));

  // ---- note 3: CLAUDE.md flies from the tree and pins itself
  // the two extra levels (user folder, company) land first in the lower row, faint
  const small = [['user folder', tUser], ['company', tComp]];
  small.forEach(([s, t0], j) => {
    if (t < t0) return;
    const x = 950 + j * 180, y = 700;
    const L = M.land(t, t0, x, y, x + 90, y, M.motion.land);
    K.layer(L.a * lowerA, () => {
      M.paper(L.x, L.y, { w: 164, h: 58, kind: 'note', lines: 0, dim: 0.08 });
      ink(s, L.x, L.y + 9, { align: 'center' });
    });
  });

  if (flyK > 0) {
    const fx = K.lerp(rowX + 110, nx[2], flyK), fyBase = K.lerp(rowY(2) - 4, ny, flyK);
    const fy = fyBase - Math.sin(flyK * Math.PI) * 60;
    const sc = K.lerp(0.55, 1, flyK);
    const pinK = K.io(t, tReads + 0.75, 0.3, 'out');
    K.at(fx, fy, sc, 0, () => {
      M.paper(0, 0, { w: NW, h: NH, kind: 'note', lines: 0, glow: 1 - K.io(t, tStart + 0.4, 1.2) });
      K.text('CLAUDE.md', -NW / 2 + 18, -NH / 2 + 50, { font: 'mono', weight: 700, size: 30, color: C.ink });
      ink('loads every session', -NW / 2 + 18, -NH / 2 + 96, { alpha: K.io(t, tStart, 0.5), color: '#5A4A35', weight: 500 });
    });
    if (pinK > 0) {
      g.save(); g.globalAlpha *= pinK; g.fillStyle = C.head; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 6;
      g.beginPath(); g.arc(nx[2], ny - NH / 2 + 4, 9 * (0.6 + 0.4 * pinK), 0, Math.PI * 2); g.fill(); g.restore();
    }
  }

  // ---- not a lock: notes ask, hooks and permissions enforce
  K.layer(K.io(t, cLock + 0.3, 0.6), () => {
    K.text('a note asks', nx[0], 712, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center' });
  });
  const dropK = K.io(t, tLockW - 0.25, 0.6, 'out');
  if (dropK > 0) {
    const lx = 1335, ly = 780 - (1 - dropK) * 70;
    K.layer(K.clamp(dropK * 1.6), () => {
      K.iconTile('lock', lx, ly, 76, { color: C.head, stroke: K.rgba(C.head, 0.6) });
    });
    K.layer(K.io(t, tHooks, 0.5), () => {
      K.text('hooks · permissions', lx + 58, 774, { font: 'ui', weight: 600, size: 30, color: C.strong });
      K.text('a lock enforces', lx + 58, 810, { font: 'ui', weight: 600, size: 26, color: C.soft });
    });
  }
  K.layer(K.io(t, tFollow, 0.6), () => {
    K.text('long notes: followed less', nx[1], 772, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
  });

  M.shelf('The Machine', 1840, 880, { k: K.io(t, tShelf, 0.6) });
});
