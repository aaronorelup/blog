/* 13 — Rooms and buildings: modes and platforms
   The desk shrinks into a floor plan: three rooms (modes: Chat, Cowork, Code) over a row of buildings (platforms).
   Chat and Cowork merge into one "Claude" room (rolling out, Sep 2026); Code stays its own room. The buildings fill in
   one by one; then local vs cloud as two panels; then the same shape at OpenAI and Google. */
SCENE('13', (t, S) => {
  K.bg();
  const C = K.C, P = M.palette;
  const W = (re, n, fb) => S.find(re, n, fb);

  // ---- cue / word times (local seconds)
  const cMvp = S.cue('mode-vs-platform', 3.74), cModes = S.cue('modes', 10.39), cMerge = S.cue('merge', 20.79);
  const cBld = S.cue('buildings', 36.83), cLC = S.cue('local-cloud', 48.43), cEq = S.cue('equivalents', 56.89);
  const wMode = W(/^mode$/i, 0, cMvp + 0.2), wPlat = W(/^platform$/i, 0, cMvp + 2.3), wTouch = W(/^touch/i, 0, cMvp + 5.6);
  const wChat = W(/^chat,?$/i, 0, cModes + 1.4), wCow = W(/^cowork$/i, 0, cModes + 2.1), wCode = W(/^code\.?$/i, 0, cModes + 3.3);
  const wJan = W(/^january/i, 0, cModes + 6);
  const wMerging = W(/^merging/i, 0, cMerge + 2.4), wOne = W(/^one$/i, 0, cMerge + 4.7);
  const wAnswer = W(/^answer/i, 0, cMerge + 7.4), wWork = W(/^work\.?$/i, 1, cMerge + 8.6);
  const wRoll = W(/^rolling/i, 0, cMerge + 9.8), wPro = W(/^pro$/i, 0, cMerge + 10.8), wStays = W(/^stays/i, 0, cMerge + 13.4);
  const bWords = [W(/^browser/i, 0, cBld + 1), W(/^desktop/i, 0, cBld + 1.9), W(/^phone/i, 0, cBld + 3.2),
    W(/^terminal/i, 0, cBld + 4.2), W(/^editor/i, 0, cBld + 5.7), W(/^cloud$/i, 0, cBld + 7.9)];
  const wStops = W(/^stops/i, 0, cLC + 1.5), wSleeps = W(/^sleeps/i, 0, cLC + 2.8);
  const wCloud = W(/^cloud$/i, 1, cLC + 3.7), wGive = W(/^give/i, 0, cLC + 5.8), wKeeps = W(/^keeps/i, 0, cLC + 5.9);
  const wOpen = cEq, wOneApp = W(/^one$/i, 1, cEq + 3), wJuly = W(/^july/i, 0, cEq + 4.5);
  const wGoogle = W(/^google/i, 0, cEq + 5.6), wAnti = W(/^antigravity/i, 0, cEq + 8.6), wCoding = W(/^coding/i, 0, cEq + 11);

  // ---- layout
  const RY = 250, RH = 300, RW = 480, RX = [200, 720, 1240];
  const BY = 744, BS = 100, BX = [260, 540, 820, 1100, 1380, 1660];
  const BNAMES = ['browser', 'desktop app', 'phone', 'terminal · CLI', 'editor', 'cloud session'];
  const BICONS = ['globe', 'laptop', 'phone', 'terminal', 'code', 'cloud'];

  // phase weights
  const lcK = K.io(t, cLC, 0.6) * (1 - K.io(t, cEq, 0.6));     // local/cloud panels on
  const eqK = K.io(t, cEq, 0.6);                               // equivalents replace the building row
  const roomsA = 1 - lcK;

  // ---- opening: the desk from the previous scenes shrinks into the middle room
  const zk = K.io(t, 0.4, 2.0);
  const roomIn = K.io(t, 1.6, 0.8);
  if (zk < 1) {
    const s = K.lerp(1, 0.16, zk), y = K.lerp(600, RY + 88 + 300 * 0.417, zk);
    K.layer(1 - K.io(t, 1.7, 0.7), () => K.at(960, y, s, 0, () => {
      M.stage(t, { desk: M.desk('standard', { cx: 0, cy: 0 }), clerk: { bob: false } });
    }));
  }

  // ---- top label: mode = the kind of job
  const lblA = (1 - 0.7 * lcK);
  K.layer(K.io(t, wMode, 0.5) * lblA, () => {
    K.spans([{ s: 'mode', color: C.head }, { s: ' = the kind of job', color: C.strong }], 200, 222, { font: 'ui', weight: 600, size: 30 });
  });

  // ---- the rooms
  const litAt = (a) => 0.15 + 0.85 * K.io(t, a, 0.5);
  const mk = K.io(t, wMerging, 0.9);                       // Chat + Cowork merge
  const titleClaude = K.io(t, wOne + 0.4, 0.5);
  const codePulse = K.io(t, wStays, 0.4) * (1 - K.io(t, wStays + 1.6, 0.8));
  const titleCC = K.io(t, wStays, 0.5);
  const roomTitle = (s, x, y, lit, a) => K.text(s, x, y, { font: 'head', weight: 700, size: 38, color: K.mixColor(C.soft, C.head, lit), align: 'center', tracking: -0.5, alpha: a });

  K.layer(roomIn * roomsA, () => {
    // Code room (right)
    const lCode = litAt(wCode);
    M.room(t, RX[2], RY, RW, RH, { lit: Math.min(1, lCode + 0.5 * codePulse) });
    if (codePulse > 0) K.glow(RX[2] + RW / 2, RY + RH / 2, 300, C.head, 0.12 * codePulse);
    roomTitle('Code', RX[2] + RW / 2, RY + 56, lCode, K.io(t, wCode, 0.5) * (1 - titleCC));
    roomTitle('Claude Code', RX[2] + RW / 2, RY + 56, lCode, titleCC);

    // Cowork room (middle) slides into the Chat room and fades as the wall comes down
    const lCow = litAt(wCow);
    if (mk < 1) {
      const cx = K.lerp(RX[1], RX[0] + 520, mk);
      K.layer(1 - K.clamp(mk * 1.6), () => {
        M.room(t, cx, RY, RW, RH, { lit: lCow });
        roomTitle('Cowork', cx + RW / 2, RY + 56, lCow, K.io(t, wCow, 0.5));
        K.pill('Jan 2026 · office work on your files', cx + RW / 2, RY + RH + 38, { size: 26, color: C.body, alpha: K.io(t, wJan, 0.5) });
      });
    }
    // Chat room (left) widens into the merged Claude room
    const lChat = litAt(wChat);
    const cw = K.lerp(RW, 1000, mk), ccx = RX[0] + cw / 2;
    M.room(t, RX[0], RY, cw, RH, { lit: Math.max(lChat, mk) });
    roomTitle('Chat', ccx, RY + 56, lChat, K.io(t, wChat, 0.5) * (1 - K.clamp(mk * 3)));
    roomTitle('Chat + Cowork', ccx, RY + 56, 1, K.clamp((mk - 0.6) / 0.4) * (1 - titleClaude));
    roomTitle('Claude', ccx, RY + 56, 1, titleClaude);
    // the wall between them: a short beam that lifts away
    if (mk > 0 && mk < 1) {
      const wx = K.lerp(700, 700, mk), lift = mk * 80;
      K.line(wx, RY + 16 - lift, wx, RY + RH - 16 - lift, { color: P.beam, w: 10, alpha: 1 - mk });
    }
    // inside the merged room: answer / do the work (left), rolling out (right)
    const mA = mk;
    if (mA > 0) {
      const ax = 300;
      K.layer(K.io(t, wAnswer, 0.5), () => {
        K.icon('chat', ax, 420, 40, { color: C.head });
        K.text('answers you', ax + 36, 430, { font: 'ui', weight: 600, size: 28, color: C.strong });
      });
      K.layer(K.io(t, wWork, 0.5), () => {
        K.icon('gear', ax, 482, 40, { color: C.head });
        K.text('or does the work', ax + 36, 492, { font: 'ui', weight: 600, size: 28, color: C.strong });
      });
      M.flag('rolling out', 1000, 412, { alpha: K.io(t, wRoll, 0.5) });
      K.text('Pro and Max first', 1000, 478, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center', alpha: K.io(t, wPro, 0.5) });
    }
  });

  // ---- dated corner tag
  M.dated('Sep 2026', 1720, 176, { align: 'right', alpha: K.io(t, wMerging, 0.5) * (1 - K.io(t, cEq, 0.5)) });
  M.dated('Oct 2026', 1720, 176, { align: 'right', alpha: K.io(t, cEq + 0.2, 0.5) });

  // ---- platform label + building row
  const platK = K.io(t, wPlat, 0.5);
  K.layer(platK * (1 - eqK) * (1 - 0.6 * lcK), () => {
    K.spans([{ s: 'platform', color: C.head }, { s: ' = where it runs', color: C.strong },
      { s: ', what it can touch', color: C.strong, alpha: K.io(t, wTouch, 0.5) }], 200, 648, { font: 'ui', weight: 600, size: 30 });
  });
  K.layer(K.io(t, cEq + 0.3, 0.5), () => {
    K.spans([{ s: 'the same shape', color: C.head }, { s: ' at OpenAI and Google', color: C.strong }], 200, 648, { font: 'ui', weight: 600, size: 30 });
  });

  const localSet = [1, 3, 4];
  K.layer(1 - eqK, () => {
    const g = K.ctx();
    BX.forEach((x, i) => {
      // empty dashed slot (from the opening "buildings")
      const slotA = K.io(t, W(/^buildings/i, 0, 2.7), 0.5) * (1 - K.io(t, bWords[i], 0.4));
      if (slotA > 0) {
        g.save(); g.globalAlpha *= 0.5 * slotA; g.setLineDash([8, 8]); g.strokeStyle = C.line2; g.lineWidth = 2;
        K.rr(x - BS / 2, BY - BS / 2, BS, BS, 28); g.stroke(); g.restore();
      }
      const k = K.io(t, bWords[i], 0.5);
      if (k <= 0) return;
      // local / cloud emphasis
      const loc = localSet.includes(i), cl = i === 5;
      const lcOn = K.io(t, cLC, 0.5) * (1 - K.io(t, cEq, 0.5));
      const clOn = K.io(t, wCloud, 0.5) * (1 - K.io(t, cEq, 0.5));
      // local phase: desktop app, terminal, editor lit; cloud phase: ONLY the cloud session lit
      const locPhase = lcOn * (1 - clOn);
      const hi = loc ? locPhase : cl ? clOn : 0;
      const dim = 1 - 0.65 * K.clamp(locPhase * (loc ? 0 : 1) + clOn * (cl ? 0 : 1));
      K.layer(k * dim, () => {
        K.at(x, BY + (1 - k) * 16, 1, 0, () => {
          K.iconTile(BICONS[i], 0, 0, BS, { glow: 0.2 + 0.8 * hi, stroke: hi > 0 ? K.rgba(C.head, 0.4 + 0.6 * hi) : C.line2 });
        });
        K.text(BNAMES[i], x, BY + 96, { font: 'ui', weight: 600, size: 26, color: K.mixColor(C.body, C.head, hi), align: 'center' });
      });
    });
  });

  // ---- local vs cloud panels (in the rooms' place)
  if (lcK > 0) {
    const crescent = (x, y, r, a) => {
      const g = K.ctx(); g.save(); g.globalAlpha *= a;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
      g.fillStyle = P.cold; g.beginPath(); g.rect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4);
      g.arc(x + r * 0.45, y - r * 0.3, r * 0.85, 0, Math.PI * 2, true); g.fill();
      g.restore();
    };
    const panel = (x, k, title, lines, dark, extra) => {
      if (k <= 0) return;
      K.layer(k * lcK, () => K.at(0, (1 - k) * 18, 1, 0, () => {
        K.card(x, RY, 720, RH, { r: 22, fill: K.rgba(C.tile, 0.92), stroke: K.mixColor(C.line2, C.head, 0.6), glow: 0.3, lw: 2 });
        K.text(title, x + 40, RY + 62, { font: 'head', weight: 700, size: 38, color: C.head });
        M.mini(t, x + 170, RY + 96 + 300 * 0.44, 0.44, { dark });
        lines.forEach((ln, j) => K.layer(ln.k, () => {
          const ly = RY + 150 + j * 80;
          ln.icon(x + 352, ly);
          K.text(ln.s, x + 392, ly + 10, { font: 'ui', weight: 600, size: 30, color: C.strong });
        }));
        if (extra) extra();
      }));
    };
    const darkK = K.io(t, wSleeps - 0.2, 0.8);
    panel(200, K.io(t, cLC, 0.6), 'on your laptop', [
      { s: 'sees your files', k: K.io(t, cLC + 0.4, 0.5), icon: (x, y) => K.folder(x, y, 30) },
      { s: 'stops when it sleeps', k: K.io(t, wStops, 0.5), icon: (x, y) => crescent(x, y, 15, 1) },
    ], darkK, () => crescent(200 + 660, RY + 58, 22, darkK));
    panel(1000, K.io(t, wCloud, 0.6), 'in the cloud', [
      { s: 'sees what you give it', k: K.io(t, wGive - 0.6, 0.5), icon: (x, y) => K.icon('envelope', x, y, 34, { color: C.head }) },
      { s: 'keeps going, lid shut', k: K.io(t, wKeeps, 0.5), icon: (x, y) => K.icon('clock', x, y, 34, { color: C.head }) },
    ], 0, () => K.glow(1000 + 170, RY + 150, 120, C.head, 0.15 * (0.8 + 0.2 * Math.sin(t * 1.4))));
  }

  // ---- equivalents: the same shape at OpenAI and Google
  const row = (y, name, items, result, when, at, k0) => {
    const k = K.io(t, k0, 0.6);
    if (k <= 0) return;
    K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => {
      K.text(name, 220, y + 11, { font: 'ui', weight: 700, size: 32, color: C.strong });
      K.pill(items.join(' · '), 620, y, { size: 26, color: C.body });
      const ak = K.io(t, at, 0.6);
      K.arrow(830, y, 930, y, { k: ak, color: C.head, w: 3 });
      K.layer(K.io(t, at + 0.3, 0.5), () => {
        const pw = K.pill(result, 1110, y, { size: 30, color: C.head, stroke: K.rgba(C.head, 0.6) });
        K.text(when, 1110 + pw / 2 + 30, y + 9, { font: 'mono', weight: 600, size: 26, color: C.soft });
      });
    }));
  };
  row(728, 'OpenAI', ['Chat', 'Work', 'Codex'], 'one desktop app', 'Jul 2026', wOneApp, wOpen + 0.2);
  row(818, 'Google', ['Gemini CLI'], 'Antigravity', 'Jun 2026', wAnti, wGoogle);

  M.shelf('The Machine', 1840, 880, { prefix: 'coding agents', k: K.io(t, wCoding, 0.6) });
});
