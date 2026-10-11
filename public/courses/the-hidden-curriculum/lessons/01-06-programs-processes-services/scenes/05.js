/* 01.06 scene 05 — The night staff: services and daemons
   The kitchen at night. Grey night-staff cooks come out of the building manager's door (the OS), keep
   working after "you" sign out, get restarted by the manager, share one svchost.exe card (Service Host),
   go by "daemon" elsewhere; then the tray app clocks in with you; exit on the three-kinds card. */
SCENE('05', (t, S) => {
  const C = K.C, M = window.M, L = M.L;
  const T0 = S.cue('night', 0), T1 = S.cue('no-one-home', 8.64), T2 = S.cue('svchost', 13.63);
  const T3 = S.cue('daemon', 26.91), T4 = S.cue('tray', 30.72), T5 = S.cue('three-kinds', 40.81);
  const w = (re, n, fb) => S.find(re, n || 0, fb);

  // word times (with fallbacks from cues.json)
  const tService = w('service', 0, 2.32);
  const tManager = w('manager', 0, 4.96);
  const tNoWin = w('window', 0, 7.73);
  const tNobody = w('nobody', 0, 9.4);
  const tRestart = w('restart', 0, 11.69);
  const tShare = w('share', 0, 15.41);
  const tSvcHost = w(/^Service$/, 0, 17.66);
  const t166 = w('hundred', 0, 20.75);
  const t97 = w('ninety', 0, 23.21);
  const tDaemon = w('daemon', 0, 29.57);
  const tTray = w('tray', 0, 31.82);
  const tArrive = w('arrives', 0, 33.13);
  const tOllama = w('Ollama', 0, 37.53);
  const tNotSvc = w('not', 0, 39.29);
  const tApps = w('apps', 0, 42.3);
  const tTrayApps = w('tray', 1, 43.46);
  const tNight = w('night', 0, 45.78);

  // ---- lighting: the front room dims at night
  const nightK = K.io(t, T0 + 0.2, 1.0);
  const kindsK = K.io(t, T5, 0.6);                // the closing card: kitchen dims behind
  K.bg({ glow: K.lerp(0.13, 0.05, nightK), glowX: 1650, glowY: 120 });
  if (nightK > 0) { const g = K.ctx(); g.save(); g.fillStyle = K.rgba('#06070e', 0.22 * nightK); g.fillRect(0, 0, 1920, 1080); g.restore(); }

  const kitchenA = 1 - 0.66 * kindsK;
  // the counter settles lower and slimmer as night falls, freeing a caption row right under the cooks
  const cgK = K.io(t, T0 + 0.2, 1.0);
  const CGEO = { ...L.counter, y: K.lerp(L.counter.y, 718, cgK), h: K.lerp(L.counter.h, 124, cgK) };
  const CY = 652;                                 // caption row (between the cooks and the counter)

  // ---- the manager's door (the OS) top-right
  const DX = 1650, DY0 = 185, DW = 140, DH = 150;
  const doorK = K.io(t, T0 + 0.6, 0.6);
  const pulse = Math.max(K.env(t, tManager - 0.1, tManager + 1.0, 0.35), K.env(t, tRestart - 0.1, tRestart + 1.1, 0.3));

  // the svchost card + copies; Service Host numbers
  const SVX = 1268, SVY = 250;
  const cardK = K.io(t, T2 + 0.5, 0.6, 'out');
  const svCooks = [4, 5, 6];

  K.layer(kitchenA, () => {
    // shelf (programs on disk), dimmed at night
    M.shelf(t, { cards: [{ name: 'node.exe' }, { name: 'python.exe' }, { name: 'ollama.exe' }, { name: 'hello.py', icon: 'file' }].map((c) => ({ ...c, dim: 0.55 * nightK })) });

    // door
    K.layer(doorK, () => {
      if (pulse > 0) K.glow(DX, DY0 + DH / 2, 170, C.head, 0.22 * pulse);
      K.card(DX - DW / 2, DY0, DW, DH, { r: 12, fill: C.page, stroke: K.mixColor(C.line2, C.head, pulse), lw: 2 });
      const g = K.ctx(); g.save(); const gr = g.createLinearGradient(0, DY0 + DH, 0, DY0); gr.addColorStop(0, K.rgba(C.soft, 0.18)); gr.addColorStop(1, K.rgba(C.soft, 0)); g.fillStyle = gr; K.rr(DX - DW / 2 + 8, DY0 + 8, DW - 16, DH - 8, 8); g.fill(); g.restore();
      K.line(DX - DW / 2 - 10, DY0 + DH, DX + DW / 2 + 10, DY0 + DH, { color: C.line2, w: 4 });
      M.badge('gear', DX, DY0 + DH / 2 + 4, 34, { color: pulse > 0.3 ? C.head : C.soft });
      K.icon('house', DX - 182, 151, 34, { color: C.head, w: 2.2 });
      M.eyebrow('the building (OS)', DX - 157, 160, { align: 'left' });
    });

    // svchost.exe card (one host program)
    if (cardK > 0) {
      M.recipe(SVX, SVY + (1 - cardK) * -30, { name: 'svchost.exe', w: 230, h: 140, size: 28, alpha: cardK, lit: 0.5 * K.io(t, tSvcHost, 0.5) * (1 - kindsK) });
      M.eyebrow('Service Host', SVX, 160, { alpha: K.io(t, tSvcHost, 0.5) });
    }

    // counter
    const appLeave = K.io(t, T1 + 0.05, 0.55);
    const nightLit = (i) => 0.32 * K.io(t, T0 + 1.6 + (i - 4) * 0.5 + 1.0, 0.5);
    M.counter(t, {
      geo: CGEO,
      lit: { 1: 0.55 * (1 - appLeave), 2: 0.55 * (1 - appLeave), 4: nightLit(4), 5: nightLit(5), 6: nightLit(6), 7: 0.32 * K.io(t, tSvcHost + 1.6, 0.5), 0: 0, 3: 0 },
    });
  });

  // ---- "you" (signed in) and the front-room app cooks
  const youOut = K.io(t, T1 + 0.05, 0.55);
  const youIn = K.io(t, tTray - 0.1, 0.8);
  const youA = (1 - youOut) + youIn * (youOut >= 1 ? 1 : 0);
  const youX = cookX(0) + (youOut < 1 ? -60 * youOut : -60 * (1 - youIn));
  function cookX(i) { return M.cookAt(i).x; }
  const drawYou = (a) => {
    if (a <= 0.01) return;
    K.layer(a * kitchenA, () => {
      K.glow(youX, L.cookY, 90, C.head, 0.18);
      const g = K.ctx(); g.save(); g.beginPath(); g.arc(youX, L.cookY, 46, 0, Math.PI * 2); g.fillStyle = C.panel; g.fill(); g.lineWidth = 3; g.strokeStyle = C.head; g.stroke(); g.restore();
      K.icon('person', youX, L.cookY + 3, 56, { color: C.head, w: 3 });
      M.label('you', youX, L.cookY + 88, { color: C.head, size: 30 });
    });
  };
  drawYou(youA);

  K.layer(kitchenA, () => {
    const appA = 1 - K.io(t, T1 + 0.05, 0.55);
    M.cook(t, cookX(1), L.cookY, 96, { pid: 18412, name: 'node.exe', satchel: true, alpha: appA, dim: 0.25 * nightK });
    M.cook(t, cookX(2), L.cookY, 96, { pid: 20118, name: 'python.exe', satchel: true, alpha: appA, dim: 0.25 * nightK });
  });

  // ---- the night staff: walk out of the manager's door
  const doorOut = { x: DX, y: DY0 + DH + 30 };
  const walkIn = (i, start, dur = 1.1) => {
    const k = K.io(t, start, dur);
    const end = { x: cookX(i), y: L.cookY };
    return { k, x: K.lerp(doorOut.x, end.x, k), y: K.lerp(doorOut.y, end.y, K.ease.out(K.clamp(k * 1.4))), walking: k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0, a: K.clamp(k * 5) };
  };
  // stop + restart of the cook at stretch 6
  const stopK = K.io(t, tRestart - 0.75, 0.4);
  const backK = K.io(t, tRestart + 0.55, 0.5);
  const restartLit = K.env(t, tRestart + 0.55, tRestart + 2.2, 0.4);

  K.layer(kitchenA, () => {
    svCooks.forEach((i, j) => {
      const p = walkIn(i, T0 + 1.6 + j * 0.5);
      if (p.a <= 0) return;
      const gearsK = K.io(t, tShare + 0.5 + j * 0.25, 0.4);
      const stopped = i === 6 ? stopK * (1 - backK) : 0;
      if (stopped > 0.01) M.cook(t, p.x, p.y, 96, { kind: 'ghost', alpha: stopped });
      M.cook(t, p.x, p.y, 96, { kind: 'service', walking: p.walking, alpha: p.a * (1 - stopped), lit: i === 6 ? restartLit : 0 });
      // the services this host process carries: small gear chips under it
      if (gearsK > 0) [-38, 0, 38].forEach((dx, m) => M.badge('gear', p.x + dx, p.y + 82, 15, { color: C.soft, alpha: K.clamp(gearsK * 3 - m) * (1 - stopped) }));
    });
    // a service with its own program (not hosted): spoolsv.exe, out at stretch 7
    const lone = walkIn(7, tSvcHost + 0.9, 0.8);
    if (lone.a > 0) M.cook(t, lone.x, lone.y, 96, { kind: 'service', walking: lone.walking, alpha: lone.a, name: lone.k > 0.9 && kindsK < 0.5 ? 'spoolsv.exe' : null });

    // dashed copies of svchost.exe flying to its three cooks
    svCooks.forEach((i, j) => {
      const fk = K.io(t, tShare + j * 0.25, 0.7);
      if (fk <= 0 || fk >= 1) return;
      const x = K.lerp(SVX, cookX(i), fk), y = K.lerp(SVY + 80, L.cookY - 10, fk);
      M.recipe(x, y, { w: 96, h: 64, dashed: true, alpha: Math.min(1, fk * 6, (1 - fk) * 3) });
    });
  });

  // ---- the tray app: clocks in with you
  const trayK = K.io(t, tTray - 0.1, 1.0);
  const trayX = K.lerp(cookX(0) + 60, cookX(1), trayK);   // steps out from beside you
  K.layer(kitchenA, () => {
    if (trayK > 0) {
      const nmK = K.io(t, tTray + 0.6, 0.4);
      M.cook(t, trayX, L.cookY, 96, { kind: 'tray', walking: trayK < 1 ? Math.sin(trayK * Math.PI) : 0, alpha: K.clamp(trayK * 2.5),
        pid: 1168, pidK: nmK, name: trayK > 0.75 ? 'ollama app.exe' : null, named: K.env(t, tOllama, tNotSvc + 1.4, 0.4) });
    }
  });

  // ---- captions right under the cooks they describe (y 648, 30 px)
  const SVC = (cookX(4) + cookX(6)) / 2;
  const capA = (a, b) => K.env(t, a, b, 0.4) * (1 - kindsK);
  // night: "service: started by the OS" + ", no window"
  {
    const a = capA(tService, T1 - 0.3);
    if (a > 0) K.spans([
      { s: 'service: ', color: C.soft },
      { s: 'started by the OS', color: C.strong },
      { s: ', no window', color: C.strong, alpha: K.io(t, tNoWin - 0.2, 0.4) },
    ], SVC, CY, { size: 30, font: 'ui', align: 'center', alpha: a });
  }
  {
    const a = capA(T1 + 0.15, tRestart - 0.45);
    if (a > 0) M.label('runs with nobody signed in', SVC, CY, { size: 30, color: C.strong, alpha: a });
    const b = capA(tRestart, T2 + 0.2);
    if (b > 0) M.label('restarted by the manager', SVC, CY, { size: 30, color: C.head, alpha: b });
  }
  // tray caption
  {
    const a = capA(tTray, T5 + 0.1);
    if (a > 0) K.spans([{ s: 'tray app: ', color: C.head }, { s: 'comes and goes with you', color: C.strong }], cookX(1), CY, { size: 30, font: 'ui', align: 'center', alpha: a });
  }

  // ---- Service Host numbers (front room, now empty)
  {
    const a1 = K.env(t, t166, T3 + 0.1, 0.5), a2 = K.env(t, t97, T3 + 0.1, 0.5);
    const NX = 330;
    if (a1 > 0) { K.text('166', NX, 425, { font: 'mono', weight: 700, size: 64, color: C.head, align: 'right', alpha: a1 }); M.label('services running', NX + 22, 418, { size: 30, color: C.strong, align: 'left', alpha: a1 }); }
    if (a2 > 0) { K.text('97', NX, 515, { font: 'mono', weight: 700, size: 64, color: C.soft, align: 'right', alpha: a2 }); M.label('Service Host processes', NX + 22, 508, { size: 30, color: C.strong, align: 'left', alpha: a2 }); }
    if (a1 > 0) M.obsTag(150, 590, { alpha: a1 });
  }

  // ---- daemon: same idea, other names
  {
    const a = K.env(t, T3 + 0.1, T4 + 0.1, 0.45);
    const b = K.env(t, tDaemon - 0.1, T4 + 0.1, 0.45);
    if (a > 0) K.pill('Windows: service', 330, 400, { size: 30, fill: C.panel, stroke: C.soft, color: C.strong, icon: 'gear', iconColor: C.soft, alpha: a });
    if (b > 0) {
      K.pill('Mac / Linux: daemon', 330, 480, { size: 30, fill: C.panel, stroke: C.head, color: C.head, icon: 'gear', iconColor: C.head, alpha: b });
      K.text('launchd · systemd', 330, 560, { font: 'mono', weight: 600, size: 26, color: C.body, align: 'center', alpha: b });
    }
  }

  // ---- three kinds of cook (exit card)
  if (kindsK > 0) {
    const X = 200, Y = 470, W = 1520, H = 430, LW = 380, CW = (W - LW) / 3;
    K.layer(kindsK, () => {
      K.card(X, Y + (1 - kindsK) * 20, W, H, { r: 24, fill: C.panel, stroke: C.line2, shadow: true });
    });
    const y0 = Y + (1 - kindsK) * 20;
    const headY = y0 + 75;
    const rows = [['who starts it', ['you', 'sign-in', 'the OS']], ['window?', ['yes', 'tray icon only', 'none']], ['survives sign-out?', ['no', 'no', 'yes']]];
    const rowY = (r) => y0 + 170 + r * 88;
    M.eyebrow('three kinds of cook', X + 40, headY + 9, { align: 'left', alpha: kindsK });
    rows.forEach((r, i) => {
      const rk = K.stagger(t, T5 + 0.3, i, 0.15, 0.5);
      if (i > 0) K.line(X + 30, rowY(i) - 44, X + W - 30, rowY(i) - 44, { color: C.line, w: 1.5, alpha: rk });
      M.label(r[0], X + 40, rowY(i) + 9, { align: 'left', size: 30, color: C.body, alpha: rk });
    });
    K.line(X + 30, headY + 44, X + W - 30, headY + 44, { color: C.line2, w: 2, alpha: kindsK });
    const kinds = [
      { name: 'app', kind: 'app', at: tApps, col: C.head },
      { name: 'tray app', kind: 'tray', at: tTrayApps, col: C.head },
      { name: 'service', kind: 'service', at: tNight, col: C.head, hero: true },
    ];
    kinds.forEach((kd, j) => {
      const ck = K.io(t, kd.at - 0.15, 0.5);
      if (ck <= 0) return;
      const cx = X + LW + CW * j + CW / 2;
      // the column the narration lands on ("night staff the building hires") gets the highlight
      const hk = kd.hero ? K.io(t, kd.at + 0.1, 0.5) : 0;
      if (hk > 0) K.card(cx - CW / 2 + 14, headY - 64, CW - 28, rowY(2) + 50 - (headY - 64), { r: 18, fill: K.rgba(C.head, 0.07 * hk * ck), stroke: K.rgba(C.head, 0.55 * hk * ck), lw: 2, shadow: false });
      K.layer(ck, () => {
        const lw = K.measure(kd.name, { font: 'ui', weight: 600, size: 30 }), gx = cx - (52 + 18 + lw) / 2;
        M.cook(t, gx + 26, headY - 4, 52, { kind: kd.kind, idle: 0.5, lit: hk });
        M.label(kd.name, gx + 70, headY + 10, { align: 'left', size: 30, color: kd.col });
        rows.forEach((r, i) => {
          const v = r[1][j];
          const strong = (i === 2 && v === 'yes') || (i === 0 && j === 2);
          M.label(v, cx, rowY(i) + 9, { size: 30, color: strong ? C.head : C.strong, weight: 600 });
        });
      });
    });
  }
});
