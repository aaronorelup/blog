// 10 — The lantern: model servers on your own machine
// then: "about 2021" card (one terminal, one dev server at hatch 3000) ; now: hatches multiply, AI ones sparkle ;
// model-server: hatch 11434 flies to the back wall, its cook appears ; ollama-pair: tray app (PID 1168) is the parent
// of ollama.exe (PID 22124) ; keep-alive: brain stays lit on the counter after the slips stop ; others: LM Studio
// (llmster, 1234) + Foundry Local ; no-password: no lock on 11434, globe on the far side with a warning.
SCENE('10', (t, S) => {
  K.bg();
  const C = K.C;
  const cNow = S.cue('now', 7.12), cMS = S.cue('model-server', 9.93), cPair = S.cue('ollama-pair', 14.79);
  const cKeep = S.cue('keep-alive', 24.98), cOth = S.cue('others', 32.02), cNo = S.cue('no-password', 37.77);
  const w = (s, n, fb) => S.find(s, n || 0, fb);
  const tDev = w('dev', 0, 2.98), tTerm = w('terminal', 0, 4.63);
  const tProc = w('process', 0, 12.39), tLocal = w('localhost', 0, 13.14);
  const tTray = w('tray', 0, 16.75), tParent = w('parent', 0, 17.68), tServer = w('server', 2, 18.82);
  const tPort = w(/^eleven|^11434/, 0, 19.92), tOneApp = w('One', 1, 21.74), tProgs = w('programs', 0, 22.83);
  const tModel = w('model', 1, 26.25), tFive = w('five', 1, 27.42), tMem = w('memory', 0, 30.15);
  const tFoundry = w('Foundry', 0, 34.0), tNoPw = w('password', 0, 39.16), tFine = w('fine', 0, 40.82);
  const tRisky = w('risky', 0, 42.55), tNet = w('network', 0, 43.56), tRes = w('researchers', 0, 44.63);

  // M.label passes alpha to K.text, which treats 0 as unset: skip invisible labels
  const lab = (str, x, y, o = {}) => { if (o.alpha == null || o.alpha > 0.002) M.label(str, x, y, o); };

  M.lanternMark(t, { k: K.io(t, -0.6, 0.6) });

  // ------------------------------------------------------------ then / now split (fades at model-server)
  const splitA = 1 - K.io(t, cMS, 0.5);
  const GX = [1140, 1405, 1670], GY = [440, 660];
  // "now" panel: an AI tool (agent tile) in cell 0 is the parent of the servers; Ollama sits under it (it flies later)
  const grid = [
    null, { num: '3000', owner: 'Node' }, { num: '5173', owner: 'Vite' },
    { num: '11434', owner: 'Ollama', ai: true }, { num: '1234', owner: 'LM Studio', ai: true }, { num: '8188', owner: 'ComfyUI', ai: true },
  ];
  const tStart = w('start', 0, 8.36);
  if (splitA > 0.002) K.layer(splitA, () => {
    // left: about 2021
    K.card(110, 270, 790, 580, { r: 24, fill: K.rgba(C.tile, 0.55), stroke: C.line2 });
    M.eyebrow('about 2021', 505, 325);
    const tk = K.io(t, tTerm - 0.2, 0.5);
    if (tk > 0) K.layer(tk, () => {
      const r = K.win(150, 400, 400, 230, { kind: 'terminal', title: 'Terminal', titleSize: 26 });
      K.term(r, t, [{ at: tTerm + 0.2, cmd: 'npm run dev', cps: 18 }], { size: 26, rows: 3 });
    });
    const devK = K.io(t, tDev - 0.1, 0.5);
    M.hatch(t, 720, 470, { w: 190, num: '3000', state: devK > 0.5 ? 'open' : 'idle', k: 1 });
    if (devK > 0) M.cook(t, 720, 650, 96, { alpha: devK, name: 'node.exe' });
    M.parentLink(552, 540, 662, 640, { k: K.io(t, tTerm + 0.5, 0.6), label: null, bend: 30 });
    // right: now
    const nowK = K.io(t, cNow - 0.1, 0.5);
    if (nowK > 0) {
      K.card(1000, 270, 810, 580, { r: 24, fill: K.rgba(C.tile, 0.55), stroke: C.line2, alpha: nowK });
      M.eyebrow('now', 1405, 325, { alpha: nowK });
    }
    grid.forEach((h, i) => {
      if (!h) return;
      if (i === 3 && t >= cMS) return; // 11434 is carried to the back wall below
      const a = i < 3 ? cNow + 0.15 + i * 0.25 : tStart - 0.3 + (i - 3) * 0.3;
      const k = K.io(t, a, 0.5);
      if (k <= 0) return;
      const x = GX[i % 3], y = GY[i < 3 ? 0 : 1];
      M.hatch(t, x, y, { w: 190, num: h.num, state: 'open', ai: h.ai, k, owner: h.owner });
    });
    // the AI tool that starts them (mirrors the 2021 terminal -> node.exe arrow)
    const agK = K.io(t, cNow + 0.1, 0.5);
    if (agK > 0) {
      M.cook(t, GX[0], 455, 80, { kind: 'agent', alpha: agK });
      lab('AI tool', GX[0] + 8, 532, { alpha: agK, weight: 600, color: C.strong });
    }
    const ak = (j) => K.io(t, tStart + 0.15 + j * 0.3, 0.6);
    M.parentLink(GX[0] + 46, 445, GX[1] - 100, 445, { k: ak(0), label: null, bend: 0 });
    M.parentLink(GX[0] - 32, 498, GX[0] - 50, 592, { k: ak(1), label: null, bend: 0 });
    M.parentLink(GX[0] + 50, 482, GX[1] - 92, 600, { k: ak(2), label: null, bend: 12 });
  });

  // ------------------------------------------------------------ the kitchen around hatch 11434
  const mainA = K.io(t, cMS, 0.6);
  const CG = { x: 100, y: 700, w: 1300, h: 130, n: 6 };
  const SX = (i) => M.stretchAt(i, CG).cx; // 208 425 642 858 1075 1292
  const HY = 260, HW = 190;
  const xs = SX(3), xt = SX(1), xl = SX(4), xf = SX(5);
  const noK = K.io(t, cNo, 0.6);
  const othDim = 0.6 * noK;

  if (mainA > 0.002) K.layer(mainA, () => {
    // back wall behind the three hatches
    const ww = (1405 - 750) * K.io(t, cMS + 0.2, 0.7);
    if (ww > 2) { K.rr(750, HY - 88, ww, 176, 18); const g = K.ctx(); g.fillStyle = K.rgba(M.P.wall, 0.85); g.fill(); }
    // the counter (memory)
    const brainK = K.io(t, tModel - 0.1, 0.5), memK = K.io(t, tMem, 0.6);
    M.counter(t, {
      geo: CG, k: K.io(t, cMS + 0.3, 0.8),
      lit: { 3: Math.max(0.35 * brainK, memK) },
      items: { 3: [{ icon: 'brain', k: brainK, lit: true, s: 64 }] },
    });
    // programs on paper: one app, two programs
    const progK = K.io(t, tProgs - 0.3, 0.5) * (1 - K.io(t, cKeep, 0.5));
    if (progK > 0) {
      M.recipe(225, 255, { name: 'ollama app.exe', w: 260, h: 150, size: 26, alpha: progK });
      M.recipe(510, 255, { name: 'ollama.exe', w: 210, h: 150, size: 26, alpha: progK });
    }
    // other model servers
    const lmK = K.io(t, cOth + 0.05, 0.5), fdK = K.io(t, tFoundry - 0.1, 0.5);
    if (lmK > 0) K.layer(lmK * (1 - othDim), () => {
      M.hatch(t, xl, HY, { w: HW, num: '1234', state: 'open', ai: true, k: lmK, owner: 'LM Studio' });
      M.cook(t, xl, 520, 96, { ai: true, name: 'llmster' });
      lab('new · Jan 2026', xl, 652, { color: C.soft, weight: 400 });
    });
    if (fdK > 0) K.layer(fdK * (1 - othDim), () => {
      M.hatch(t, xf, HY, { w: HW, state: 'open', ai: true, k: fdK, owner: 'Foundry Local' });
      lab('port varies', xf, HY - 62 + 34, { color: C.soft, weight: 400 });
      M.cook(t, xf, 520, 96, { ai: true });
      lab('GA · Apr 2026', xf, 652, { color: C.soft, weight: 400 });
    });
    // the tray app (parent) and the server (child)
    const trayK = K.io(t, tTray - 0.1, 0.5);
    const namedTray = K.io(t, tTray, 0.4) * (1 - K.io(t, tParent + 0.6, 0.5));
    if (trayK > 0) M.cook(t, xt, 520, 120, { kind: 'tray', alpha: trayK, named: namedTray, pid: 1168, pidK: K.io(t, tTray + 0.3, 0.5), name: 'ollama app.exe' });
    M.parentLink(xt + 72, 505, xs - 72, 505, { k: K.io(t, tParent, 0.7), lit: true, bend: -40 });
    const srvK = K.io(t, w('server', 1, 10.8) - 0.1, 0.5);
    const namedSrv = K.io(t, tServer - 0.3, 0.4) * (1 - K.io(t, tOneApp, 0.5));
    // order slips arriving through the hatch, one every 1.7 s, until keep-alive
    // (routed down the hatch's right edge so they never cover the 'Ollama' owner label)
    const sl0 = tProc + 0.6, per = 1.7;
    for (let j = 0; j < 12; j++) {
      const a = sl0 + j * per; if (a > cKeep - 1.2) break;
      const p = (t - a) / 1.3; if (p <= 0 || p >= 1) continue;
      const e = K.ease.io(p);
      M.slip(K.lerp(xs + 74, xs + 86, e), K.lerp(HY + 30, 440, e), 40, { alpha: K.clamp(p * 5) * (1 - K.seg(p, 0.7, 1)), rot: 0.12 * e });
    }
    if (srvK > 0) M.cook(t, xs, 520, 120, { alpha: srvK, ai: true, named: namedSrv, lit: K.io(t, tMem, 0.6) * 0.8, pid: 22124, pidK: K.io(t, tServer, 0.5), name: srvK > 0 && t >= tServer ? 'ollama.exe' : null });
  });

  // hatch 11434: flies from the "now" grid to the back wall, then stays as the hero hatch
  {
    const fk = K.io(t, cMS + 0.05, 0.8);
    if (t >= cMS) {
      const x = K.lerp(GX[0], xs, fk), y = K.lerp(GY[1], HY, fk);
      const busy = (K.io(t, tLocal, 0.3) * (1 - K.io(t, cPair, 0.4))) + (K.io(t, tPort, 0.3) * (1 - K.io(t, tPort + 1.6, 0.4)));
      M.hatch(t, x, y, { w: HW, num: '11434', state: busy > 0.5 ? 'busy' : 'open', ai: true, k: 1, owner: 'Ollama' });
      // no password: an empty, crossed-out lock beside the label
      const lk = K.io(t, tNoPw - 0.1, 0.5);
      if (lk > 0) {
        K.icon('lock', 680, HY - 72, 40, { color: C.body, alpha: lk, w: 2.2 });
        M.cross(680, HY - 72, 60, K.io(t, tNoPw + 0.1, 0.5), { w: 4 });
      }
    }
  }

  // ------------------------------------------------------------ the open network (no-password beat)
  if (noK > 0) {
    const gk = K.io(t, tNet - 0.9, 0.6);
    const lineK = K.io(t, tNet - 0.6, 0.9);
    if (gk > 0) K.layer(gk, () => {
      K.glow(190, HY, 90, C.accent, 0.18);
      K.icon('globe', 190, HY, 92, { color: C.body, w: 3 });
    });
    K.line(252, HY, xs - HW / 2 - 12, HY, { k: lineK, color: C.accent, w: 3, dash: [12, 10] });
    if (lineK > 0.5) K.layer(K.seg(lineK, 0.5, 1), () => {
      const g = K.ctx();
      g.save(); g.beginPath(); g.arc(470, HY, 34, 0, Math.PI * 2); g.fillStyle = C.page; g.fill(); g.restore();
      K.icon('warning', 470, HY - 2, 50, { color: C.accent, w: 3 });
    });
    lab('no password by default', 480, HY - 62, { color: C.accent, alpha: K.io(t, tNoPw, 0.5) });
    lab('researchers: many found exposed', 480, HY + 80, { color: C.soft, weight: 400, alpha: K.io(t, tRes, 0.5) });
  }

  // ------------------------------------------------------------ bottom captions (one at a time) + observation tag
  const BY = 885, BX = 750;
  const capMS = K.io(t, tProc, 0.5) * (1 - K.io(t, cPair, 0.4));
  lab('model server = long-running process on a port', BX, BY, { alpha: capMS });
  const capPair = K.io(t, tOneApp - 0.2, 0.5) * (1 - K.io(t, cKeep, 0.4));
  lab('one app · two programs · two processes', BX, BY, { alpha: capPair, color: C.head });
  const capKeep = K.io(t, tFive, 0.5) * (1 - K.io(t, tFine - 0.3, 0.4));
  if (capKeep > 0) K.layer(capKeep, () => {
    K.icon('clock', BX - 230, BY - 9, 34, { color: C.head, w: 2.5 });
    lab('kept loaded ~5 min by default', BX + 20, BY);
  });
  const capFine = K.io(t, tFine, 0.5);
  if (capFine > 0) K.spans([
    { s: 'fine on localhost', color: C.body },
    { s: '  ·  ', color: C.soft },
    { s: 'risky on the network', color: C.accent, alpha: Math.max(0.001, K.io(t, tRisky, 0.5)) },
  ], BX, BY, { align: 'center', size: 26, font: 'ui', alpha: capFine });
  M.obsTag(1840, BY, { align: 'right', alpha: K.io(t, w('course', 0, 15.13), 0.5) });
});
