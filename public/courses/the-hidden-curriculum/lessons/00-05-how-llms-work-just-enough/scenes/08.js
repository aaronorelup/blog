// 08 — The knobs, then and now: the lamp over the desk grows dials; the old ones get taped, effort is the dial that matters now.
SCENE('08', (t, S) => {
  const C = K.C;
  K.bg();

  // ---- cues (local seconds)
  const cTemp = S.cue('temperature', 3.1), cTop = S.cue('top-p', 7.07), cMax = S.cue('max', 12.69);
  const cTape = S.cue('taped', 18.13), cEff = S.cue('effort', 25.74), cWrong = S.cue('wrong', 35.43);
  const w = (word, nth, fb) => S.find(word, nth, fb);
  const tSend = w('Send', 0, cTape + 5), tError = tSend + 0.8; // error lands on 'you get an error'
  const tReq = cTape + 1.5; // the request types itself while 'stopped accepting a custom temperature' is said
  const cOut = cEff + 1.2; // the error panel holds until here, then the effort dial takes over
  const tThink = w(/^thinking/, 0, cEff + 2.8), tLow = w(/^low$/, 0, cEff + 7.2), tMax = w(/^max\.?$/, 0, cEff + 8.6);
  const tConf = w(/^wrong\.?$/, 0, cWrong + 2.4), tLess = w('Less', 0, cWrong + 3.7);
  const tAction = w(/^action/, 0, cWrong + 9.4), tPkg = w('package', 0, cWrong + 10.7), tSet = w('settings', 0, cWrong + 13.4);

  // ---- the lamp (steady the whole scene)
  const LX = 960, LY = 210, LS = 1.3, lampBot = LY + 38 * LS;

  // ---- opening: the desk drops away below the lamp (the camera tilts up to it)
  const drop = K.io(t, 1.0, 1.0);
  if (drop < 1) {
    const D = M.desk('standard', { cx: 960, cy: 600 + drop * 520 });
    M.stage(t, { desk: D, lamp: false, alpha: 1 - drop, clerk: { label: 0 } });
  }
  M.lamp(t, { x: LX, y: LY, s: LS, cordTop: 130 });

  // ---- dial positions: a row of three under the lamp, then a small taped column at left
  const toCol = K.io(t, cOut, M.motion.grow);
  const appear = (i) => K.io(t, 1.7 + i * 0.25, 0.6, 'out');
  const names = ['temperature', 'top-p · top-k', 'max output tokens'];
  const active = (i) => {
    const a = [cTemp, cTop, cMax][i], b = [cTop, cMax, cTape][i];
    return K.io(t, a - 0.1, 0.4) * (1 - K.io(t, b - 0.1, 0.4));
  };
  const needle = (i) => {
    if (i === 0) { // temperature sweeps up (more randomness)
      return 0.2 + 0.6 * K.io(t, cTemp + 0.3, 1.4);
    }
    if (i === 1) { // top-p drops (fewer choices)
      return 0.9 - 0.5 * K.io(t, cTop + 1.6, 1.2);
    }
    return 0.75 - 0.35 * K.io(t, cMax + 0.4, 1.0);
  };
  const tapeK = (i) => (i < 2 ? K.io(t, cTape + 0.3 + i * 0.5, 1.5, 'lin') : 0);
  for (let i = 0; i < 3; i++) {
    const ap = appear(i);
    if (ap <= 0) continue;
    const x = K.lerp(M.layout.dials.xs[i], 230, toCol), y = K.lerp(390, 330 + i * 140, toCol);
    const r = K.lerp(80, 44, toCol);
    const lit = 0.25 + 0.75 * active(i);
    const top = y - r;
    // cord from the lamp's base (fades as the dials move away to the side)
    K.line(LX + (i - 1) * 14, lampBot, x, top, { color: C.line2, w: 2, alpha: ap * (1 - toCol), k: ap });
    K.layer(ap, () => K.at(x, y - (1 - ap) * 30, 1, 0, () => {
      M.dial(t, 0, 0, needle(i), { r, lit: lit * (1 - 0.6 * toCol), taped: tapeK(i) });
    }));
    // labels: centred under the big dial, then to the right of the small one
    const lk = ap * (1 - K.io(t, cOut, 0.35));
    if (lk > 0) K.text(names[i], x, y + r + 44, { ...M.type.label, color: K.mixColor(C.soft, C.strong, active(i) + 0.3), align: 'center', alpha: lk });
    const rk = K.io(t, cOut + 0.8, 0.5);
    if (rk > 0) K.text(names[i], x + r + 22, y + 9, { ...M.type.label, color: C.soft, alpha: rk });
  }

  // ---- corner eyebrows (then / now)
  const eThen = K.io(t, 2.0, 0.6) * (1 - K.io(t, cTape - 0.2, 0.4));
  if (eThen > 0) K.eyebrow('THE OLD DIALS', 100, 176, { alpha: eThen, color: C.soft });
  const eNow = K.io(t, cTape + 0.1, 0.5);
  if (eNow > 0) {
    K.eyebrow('NEWEST CLAUDE MODELS', 100, 176, { alpha: eNow });
    M.dated('Oct 2026', 100, 214, { alpha: eNow });
  }

  // ---- the demo panel under the dials (phase A: temperature, top-p, max, taped)
  const panelK = K.io(t, cTemp - 0.2, 0.5) * (1 - K.io(t, cOut, 0.5));
  const PX = 500, PY = 580, PW = 920, PH = 270;
  const cands = [['warm', 0.45], ['bright', 0.25], ['golden', 0.15], ['purple', 0.1], ['loud', 0.05]];
  const candK = K.io(t, cTemp - 0.1, 0.4) * (1 - K.io(t, cMax - 0.2, 0.4));
  const replyK = K.io(t, cMax, 0.4) * (1 - K.io(t, cTape - 0.1, 0.4));
  const termK = K.io(t, cTape + 0.1, 0.4);
  if (panelK > 0) K.layer(panelK, () => {
    K.card(PX, PY, PW, PH, { r: 22, fill: K.rgba(C.tile, 0.9), stroke: C.line2 });

    // candidates (temperature + top-p)
    if (candK > 0) K.layer(candK, () => {
      // which word gets picked: at low temperature always the top one; as the dial turns up it wanders
      const hot = K.io(t, cTemp + 0.8, 0.6) > 0.5;
      const cut = K.io(t, cTop + 1.6, 1.2); // top-p trims the tail
      let pickI = 0;
      if (hot && t < cTop - 0.1) pickI = Math.floor((t - cTemp - 0.8) / 0.5) % 3;
      else if (t >= cTop + 2.8) pickI = Math.floor((t - cTop - 2.8) / 0.9) % 2;
      // sentence with the chosen next word
      K.text('The lamp is', 870, 650, { font: 'read', size: 34, color: C.strong, align: 'right' });
      M.chip(cands[pickI][0], 900 + (K.measure(cands[pickI][0], { font: 'mono', size: 30, weight: 600 }) + 27) / 2, 638, { size: 30, stroke: C.head, fill: K.rgba(C.head, 0.14) });
      K.text('next word?', 1250, 648, { ...M.type.label, color: C.soft });
      // five candidates with likelihood bars
      const ws = cands.map(([s]) => K.measure(s, { font: 'mono', size: 28, weight: 600 }) + 28 * 0.9);
      const gap = 28, tot = ws.reduce((a, b) => a + b, 0) + gap * 4;
      let x = 960 - tot / 2;
      cands.forEach(([s, p], i) => {
        const cx = x + ws[i] / 2; x += ws[i] + gap;
        const gone = i >= 2 ? cut : 0, on = i === pickI ? 1 : 0;
        const a = 1 - 0.8 * gone;
        M.chip(s, cx, 740, { size: 28, alpha: a, stroke: on ? C.head : K.rgba(C.line2, 1), color: on ? C.head : C.body });
        const bh = 44 * p / 0.45;
        K.card(cx - 14, 818 - bh, 28, bh, { r: 4, fill: K.rgba(C.head, (on ? 0.85 : 0.45) * a), stroke: false, shadow: false });
        if (gone > 0) K.line(cx - ws[i] / 2 + 6, 740, cx - ws[i] / 2 + 6 + (ws[i] - 12) * gone, 740, { color: C.soft, w: 2, alpha: 0.8 });
      });
      K.line(PX + 40, 820, PX + PW - 40, 820, { color: C.line2, w: 1.5 });
    });

    // max output tokens: a reply being written, then cut by a hard gold line
    if (replyK > 0) K.layer(replyK, () => {
      const x0 = 688, y0 = 680, cell = 26, g6 = 8, per = 16, n = 26, full = 40;
      K.text('reply', x0, 652, { ...M.type.label, color: C.soft });
      const t0 = cMax + 0.5, step = 0.14;
      M.write(t, x0, y0, { t0, step, n, cell, gap: g6, perRow: per });
      const capK = K.io(t, t0 + n * step - 0.1, 0.4, 'out');
      // ghost of the rest of the reply that never gets written
      K.layer(capK * 0.5, () => {
        for (let i = n; i < full; i++) {
          const r = Math.floor(i / per), c = i % per;
          K.card(x0 + c * (cell + g6), y0 + r * (cell + g6), cell, cell, { r: 4, fill: 'rgba(0,0,0,0)', stroke: K.rgba(C.soft, 0.7), shadow: false });
        }
      });
      // the hard cap line, right after token n
      const cr = Math.floor(n / per), cc = n % per, lx = x0 + cc * (cell + g6) - g6 / 2;
      K.line(lx, y0 + cr * (cell + g6) - 16, lx, y0 + cr * (cell + g6) + cell + 16, { color: C.head, w: 5, k: capK });
      K.glow(lx, y0 + cr * (cell + g6) + cell / 2, 50, C.head, 0.25 * capK);
      K.text('hard cap', lx, y0 + cr * (cell + g6) + cell + 62, { ...M.type.label, color: C.head, align: 'center', alpha: capK });
    });

    // taped: the request that sets temperature gets an error back
    if (termK > 0) K.layer(termK, () => {
      const rect = K.win(PX + 20, PY + 20, PW - 40, PH - 40, { kind: 'terminal', title: 'request → api', titleSize: 26 });
      if (t >= tReq) K.term(rect, t, [
        { at: tReq, cmd: 'POST /v1/messages   temperature: 0.7', cps: 24, prompt: '' },
        { at: tError, out: 'error: temperature is not supported', color: C.accent },
        { at: tError + 0.35, out: '       for this model', color: C.accent },
      ], { size: 26, pad: 24, rows: 3, prompt: '' });
    });
  });

  // ---- now: the effort dial under the lamp
  const effK = K.io(t, cOut + 0.4, 0.7, 'back');
  // effort level: medium, then low, up to max, settles on high
  const sel = 1 - K.io(t, tLow - 0.1, 0.5) + 4 * K.io(t, tMax - 0.5, 0.7) - 2 * K.io(t, tMax + 0.8, 0.6);
  const EX = 960, EY = 430, ER = 115;
  if (effK > 0) {
    K.line(LX, lampBot, EX, EY - ER, { color: C.line2, w: 2, alpha: K.clamp(effK) });
    K.layer(K.clamp(effK), () => K.at(EX, EY, 0.7 + 0.3 * effK, 0, () => {
      M.dial(t, 0, 0, 0.1 + 0.8 * (sel / 4), { r: ER, lit: 1 });
    }));
    K.text('effort · thinking', EX, EY + ER + 48, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center', alpha: K.clamp(effK) });
  }
  // the picker and the app row (fade when the "wrong" beat takes the bottom)
  const lowerOut = 1 - K.io(t, cWrong - 0.2, 0.5);
  const pickK = K.io(t, cOut + 0.8, 0.5) * lowerOut;
  if (pickK > 0) M.picker(EX, 690, ['low', 'medium', 'high', 'xhigh', 'max'], sel, { size: 28, alpha: pickK });
  const appK = K.io(t, tThink, 0.5) * lowerOut;
  if (appK > 0) K.layer(appK, () => {
    K.text('in the app', 760, 812, { ...M.type.label, color: C.soft, align: 'right' });
    M.picker(1010, 803, ['model', 'effort', 'speed'], 1, { size: 26 });
  });
  // scratch paper: how long the clerk works before it answers (grows with effort)
  const scrK = K.io(t, cOut + 1.2, 0.5);
  if (scrK > 0) K.layer(scrK, () => {
    const nP = 1 + sel * 1.75; // 1 .. 8 sheets
    for (let i = 0; i < 8; i++) {
      const k = K.clamp(nP - i);
      if (k <= 0) continue;
      const rr = K.rng(30 + i);
      M.paper(1480 + (rr() - 0.5) * 22, 560 - i * 20 - (1 - k) * 16, { w: 150, h: 96, rot: (rr() - 0.5) * 0.16, alpha: Math.min(1, k * 3), kind: 'text', lines: 3 });
    }
    K.text('scratch work', 1480, 650, { ...M.type.label, color: C.soft, align: 'center' });
  });

  // ---- still confidently wrong
  const wrK = K.io(t, cWrong, 0.6);
  if (wrK > 0) K.layer(wrK, () => {
    const turned = K.io(t, tConf - 0.1, 0.5);
    const col = M.mixHex(C.head, C.accent, turned);
    const x0 = 600, y0 = 650, wd = 720, ht = 130;
    K.card(x0, y0 + (1 - wrK) * 20, wd, ht, { r: 20, fill: K.rgba(C.tile, 0.95), stroke: K.rgba(col, 0.8), glow: 0.3 });
    const ix = x0 + 64, iy = y0 + 50 + (1 - wrK) * 20;
    K.layer(1 - turned, () => K.icon('check', ix, iy, 44, { color: C.head, w: 4 }));
    K.layer(turned, () => K.icon('warning', ix, iy, 46, { color: C.accent, w: 3 }));
    K.text('Fixed it. All tests pass.', x0 + 116, iy + 12, { font: 'read', size: 32, color: C.strong });
    const lk = K.io(t, tLess, 0.5);
    if (lk > 0) K.text('less often with search and tools · not never', x0 + 116, iy + 58, { ...M.type.label, color: C.soft, alpha: lk });
  });
  const p1 = K.io(t, tAction - 0.2, 0.45), p2 = K.io(t, tPkg - 0.2, 0.45);
  if (p1 > 0) K.layer(p1, () => K.pill('wrong action', 810, 850 + (1 - p1) * 10, { size: 26, color: C.accent, stroke: K.rgba(C.accent, 0.6) }));
  if (p2 > 0) K.layer(p2, () => K.pill('invented package name', 1110, 850 + (1 - p2) * 10, { size: 26, color: C.accent, stroke: K.rgba(C.accent, 0.6) }));
  const shK = K.io(t, tSet - 0.1, 0.5);
  if (shK > 0) M.shelf('The Network', 1840, 880, { k: shK });
});
