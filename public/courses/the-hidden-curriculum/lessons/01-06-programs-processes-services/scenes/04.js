// 01.06 scene 04: What a process really is
// Zoom on the first node cook (PID 18412): a process = private memory, a PID, a copy of the environment,
// an account it runs as; threads share its counter. Pull back: 457 processes at one moment; one app is
// several processes. Then where the kitchen picture breaks: no judgement, cores take turns, private counters.
SCENE('04', (t, S) => {
  const M = window.M, C = K.C, P = M.P, g = K.ctx();
  K.bg();
  // clean hand-overs: the content dips to the plain background at both crossfades, so the
  // neighbouring scene never dissolves through it (the shared 0.6 s crossfade starts at mid-gap)
  const sceneA = K.io(t, 0.05, 0.35) * (1 - K.io(t, S.out - 0.5, 0.45));
  if (sceneA <= 0.002) return;
  K.layer(sceneA, () => body());
  function body() {

  // ---- beats (local seconds; fallbacks from cues.json)
  const cIng = S.cue('ingredients', 0);
  const cThreads = S.cue('threads', 10.57);
  const cCount = S.cue('count', 15.76);
  const cMany = S.cue('many-per-app', 21.46);
  const cBreaks = S.cue('breaks', 26.1);
  const cCores = S.cue('cores', 31.87);
  const cPrivate = S.cue('private', 41.6);
  const wMemory = S.find('private', 0, 1.9);
  const wPid = S.find('PID', 0, 3.5);
  const wEnv = S.find('copy', 0, 4.9);
  const wAccount = S.find('account', 0, 6.7);
  const wThreads = S.find('threads', 0, 11.2);
  const wSeven = S.find('module', 0, 14.6);
  const w457 = S.find('four', 0, 18.2);
  const wBrowser = S.find('browser', 0, 23.4);
  const wCode = S.find(/^v/i, 0, 24.3);
  const wOllama = S.find('ollama', 0, 25.4);
  const wJudge = S.find('judgement', 0, 28.6);
  const wProcess2 = S.find('process', 1, 29.5, { whole: true });   // 'a process follows its card', not 'processes'
  const wExactly = S.find('card', 0, 30.6);
  const wCoresW = S.find('cores', 0, 38.2);
  const wSwitch = S.find('switches', 0, 39.1);
  const wGlance = S.find('glance', 0, 42.3);
  const wCant = S.find(/^can't/i, 0, 45.0);
  const wUnless = S.find('unless', 0, 45.6);
  const wDebug = S.find('debugger', 0, 47.9);

  // ---- phase weights
  const zoomOut = K.io(t, cCount, 1.4);                 // camera back to the whole kitchen
  const kitchenOut = K.io(t, cCount + 0.3, 0.7);        // cooks + shelf give way to the crowd
  const crowdIn = K.io(t, cCount + 1.1, 0.6);
  const crowdOut = K.io(t, cBreaks + 0.75, 0.5);       // the Ollama ring holds ~1 s before the grid leaves
  const breaksIn = K.io(t, cBreaks + 0.95, 0.6);       // the heading lands on "breaks"

  const hero = M.cookAt(0);                              // node cook, PID 18412, stretch 0
  const crowdX = [440, 585, 730, 875, 1020, 1165, 1310, 1455, 1600, 1745];

  // ================================================================ the kitchen (phase A, under the camera)
  const cam = K.cam(t, [
    { at: 0, x: 960, y: 540, z: 1 },
    { at: 0.15, x: 549, y: 585, z: 1.5, d: 1.6 },
    { at: cCount, x: 960, y: 540, z: 1, d: 1.4 },
  ]);
  const zoomIn = K.io(t, 0.15, 1.6);
  const kA = 1 - kitchenOut;
  const counterLit = K.io(t, wMemory, 0.5);
  const threadK = K.io(t, wThreads, 1.0, 'lin');
  const extend = K.io(t, cCount + 0.2, 1.2) * (1 - K.io(t, cBreaks, 1.0));
  K.withCam(cam, () => {
    // shelf: fades as the camera pushes in (it would sit in the badge corner)
    M.shelf(t, {
      cards: [{ name: 'node.exe', lit: 0.6 }, { name: 'python.exe' }, { name: 'ollama.exe' }, { name: 'hello.py', icon: 'file' }],
      label: 'programs: instructions on disk', alpha: (1 - K.io(t, 0.1, 0.6)) * kA,
    });
    // while zoomed the counter is a 4-stretch piece that ends (rounded cap) inside the frame;
    // the full 8-stretch counter fades in as the camera pulls back
    const fullK = K.io(t, cCount, 0.9);
    const cOpts = {
      lit: { 0: counterLit * (1 - kitchenOut) },
      threads: { 0: { n: 3, k: threadK * (1 - kitchenOut) } },
    };
    if (fullK < 1) M.counter(t, { ...cOpts, geo: { ...M.L.counter, w: 820, n: 4 }, alpha: 1 - fullK });
    if (fullK > 0) M.counter(t, { ...cOpts, extend, alpha: fullK * (1 - 0.8 * breaksIn) });
    // the other node cooks (scene 03's crowd), quiet while we look at one
    const crowdA0 = 1 - K.io(t, 0.15, 0.6);              // gone before the 'a process' card arrives
    if (crowdA0 > 0.002) crowdX.forEach((x, i) => M.cook(t, x, i % 2 ? 470 : 440, 64, { alpha: crowdA0, phase: i }));
    // the hero cook
    const pidLit = t >= wPid && t < wEnv + 0.4;
    M.cook(t, hero.x, M.L.cookY, 96, {
      pid: '18412', pidLit, name: 'node.exe',
      satchel: { glow: K.io(t, wEnv, 0.5) * (1 - K.io(t, wAccount, 0.5)) },
      lit: K.io(t, wAccount, 0.5) * (1 - K.io(t, wThreads, 0.5)),
      alpha: kA,
    });
  });

  // ================================================================ "a process" card (phase A, screen space)
  const cardA = K.io(t, cIng + 0.5, 0.6) * (1 - K.io(t, cCount - 0.1, 0.5));
  if (cardA > 0.002) {
    const X = 1060, Y = 200, W = 740, H = 560;
    K.layer(cardA, () => {
      K.card(X, Y, W, H, { fill: C.panel, stroke: C.line2 });
      M.eyebrow('a process', X + 44, Y + 58, { align: 'left' });
      K.line(X + 44, Y + 80, X + W - 44, Y + 80, { color: C.line2, w: 1.5 });
      const rows = [wMemory, wPid, wEnv, wAccount, wThreads];
      const ry = (i) => Y + 138 + i * 92;
      const IX = X + 72, TX = X + 124;
      const rowA = (i) => K.io(t, rows[i] - 0.15, 0.5);
      const active = (i) => K.io(t, rows[i] - 0.15, 0.4) * (i < 4 ? 1 - K.io(t, rows[i + 1] - 0.15, 0.4) : 1 - K.io(t, cCount - 0.4, 0.4));
      for (let i = 0; i < 5; i++) {
        const a = rowA(i); if (a <= 0.002) continue;
        const y = ry(i), act = active(i);
        K.layer(a, () => {
          if (act > 0.01) { g.save(); g.globalAlpha *= act; K.rr(X + 24, y - 42, W - 48, 84, 16); g.fillStyle = K.rgba(C.head, 0.08); g.fill(); g.restore(); }
          const dy = (1 - K.ease.out(a)) * 14;
          const tcol = K.mixColor(C.body, C.strong, act);
          if (i === 0) {
            K.icon('lock', IX, y + dy, 40, { color: C.head, w: 2.5 });
            M.label('private memory', TX, y + 10 + dy, { size: 30, align: 'left', color: tcol });
            M.label('its own counter', X + W - 44, y + 10 + dy, { align: 'right', color: C.soft, weight: 400 });
          } else if (i === 1) {
            K.icon('pin', IX, y + dy, 40, { color: C.head, w: 2.5 });
            const tw = M.ticket('PID 18412', 0, 0, { alpha: 0 });
            M.ticket('PID 18412', TX + tw / 2, y + dy, { lit: act > 0.5 });
            M.label('its ticket number', X + W - 44, y + 10 + dy, { align: 'right', color: C.soft, weight: 400 });
          } else if (i === 2) {
            M.satchel(t, IX, y + 6 + dy, 56, { names: false, strap: 'none', glow: act });
            M.label('a copy of the environment', TX, y + 10 + dy, { size: 30, align: 'left', color: tcol });
          } else if (i === 3) {
            K.icon('person', IX, y + dy, 40, { color: C.head, w: 2.5 });
            M.label('an account: usually yours', TX, y + 10 + dy, { size: 30, align: 'left', color: tcol });
          } else {
            for (let j = 0; j < 3; j++) { const px = IX - 16 + j * 16, py = y + dy + (j === 1 ? -8 : 6); g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fillStyle = C.head; g.fill(); }
            const lw = M.label('threads: workers sharing it', TX, y + 10 + dy, { size: 30, align: 'left', color: tcol });
            const pk = K.io(t, wSeven - 0.1, 0.5);
            const pw = K.measure('module 07', { font: 'mono', weight: 600, size: 26 }) + 42;
            K.pill('module 07', Math.max(TX + lw + 18 + pw / 2, 0), y + dy, { font: 'mono', size: 26, color: C.head, stroke: C.head, fill: C.panel, alpha: pk });
          }
        });
      }
    });
  }

  // ================================================================ the crowd: 457 processes (phase B)
  const crowdA = crowdIn * (1 - crowdOut);
  if (crowdA > 0.002) {
    const COLS = 46, PX = 36, X0 = 150, Y0 = 200, D = 22, N = 457;
    const rnd = K.rng(457), order = [];
    for (let i = 0; i < N; i++) order.push(rnd());
    // three apps, several processes each: blocks in the grid
    const groups = [
      { c0: 6, r0: 2, cw: 3, rh: 3, at: wBrowser, icon: 'globe', name: 'browser' },
      { c0: 21, r0: 3, cw: 3, rh: 2, at: wCode, icon: 'code', name: 'VS Code' },
      { c0: 36, r0: 4, cw: 2, rh: 1, at: wOllama, icon: 'sparkle', name: 'Ollama' },
    ];
    const groupOf = (c, r) => groups.findIndex((G) => c >= G.c0 && c < G.c0 + G.cw && r >= G.r0 && r < G.r0 + G.rh);
    const manyK = K.io(t, cMany, 0.6);
    K.layer(crowdA, () => {
      for (let i = 0; i < N; i++) {
        const c = i % COLS, r = Math.floor(i / COLS);
        const dk = K.io(t, cCount + 1.2 + order[i] * 2.4, 0.35, 'out'); if (dk <= 0) continue;
        const x = X0 + c * PX, y = Y0 + r * PX + (1 - dk) * -10;
        const gi = groupOf(c, r);
        const gk = gi >= 0 ? K.io(t, groups[gi].at, 0.4) : 0;
        const a = dk * (1 - 0.55 * manyK * (1 - gk));
        g.save(); g.globalAlpha *= a;
        K.rr(x - D / 2, y - D / 2, D, D, 7); g.fillStyle = gk > 0 ? K.mixColor(C.tile, C.head, 0.35 * gk) : C.tile; g.fill();
        g.lineWidth = 1.5; g.strokeStyle = K.mixColor(K.mixColor(C.line2, C.head, 0.45), C.head, gk); g.stroke();
        g.beginPath(); g.arc(x, y - 1, 3.5, 0, Math.PI * 2); g.fillStyle = C.head; g.fill();
        g.restore();
      }
      // rings + labels per app
      groups.forEach((G) => {
        const k = K.io(t, G.at, 0.4); if (k <= 0) return;
        const cx = X0 + (G.c0 + (G.cw - 1) / 2) * PX, cy = Y0 + (G.r0 + (G.rh - 1) / 2) * PX;
        const rx = (G.cw * PX) / 2 + 26, ry = (G.rh * PX) / 2 + 24;
        K.ring(cx, cy, rx, ry, k, { color: C.head, w: 4, rot: 0 });
        K.pill(G.name, cx, cy + ry + 34, { icon: G.icon, iconColor: C.head, size: 26, fill: C.panel, stroke: C.head, alpha: K.seg(k, 0.3, 1) });
      });
      K.pill('one app, several processes', 960, 156, { size: 26, fill: C.panel, stroke: C.line2, color: C.strong, alpha: manyK });
    });
    // the number, on the counter
    const nk = K.io(t, w457 - 0.1, 0.6) * (1 - crowdOut);
    if (nk > 0.002) K.layer(nk, () => {
      K.card(600, 648, 720, 124, { fill: C.panel, stroke: C.line2, r: 22 });
      K.text('457', 640, 742, { font: 'mono', weight: 700, size: 96, color: C.head });
      M.label('processes running', 870, 700, { size: 30, align: 'left', color: C.strong });
      M.label('at one moment', 870, 742, { size: 30, align: 'left', color: C.body, weight: 400 });
      M.obsTag(960, 880, { align: 'center' });
    });
  }

  // ================================================================ where the picture breaks (phase C)
  if (breaksIn > 0.002) {
    K.title('Where the kitchen breaks', 960, 226, { size: 54, align: 'center', alpha: breaksIn });
    const CW = 520, CH = 500, CY = 280, cxs = [390, 960, 1530];
    const starts = [cBreaks + 1.2, cCores, cPrivate];
    const ends = [cCores, cPrivate, Infinity];
    const settle = K.io(t, S.dur - 0.9, 0.6);
    for (let n = 0; n < 3; n++) {
      const ck = K.io(t, starts[n], 0.6); if (ck <= 0.002) continue;
      const cx = cxs[n], x0 = cx - CW / 2;
      const act = K.io(t, starts[n] + 0.2, 0.5) * (1 - K.io(t, ends[n], 0.5)) * (1 - settle);
      K.layer(ck, () => {
        g.save(); g.translate(0, (1 - K.ease.out(ck)) * 24);
        K.card(x0, CY, CW, CH, { fill: C.panel, stroke: K.mixColor(C.line2, C.head, act), lw: act > 0.05 ? 2.5 : 1.5, glow: act * 0.6 });
        if (n === 0) {
          M.eyebrow('judgement', cx, CY + 56);
          M.cook(t, cx - 100, 525, 110, { phase: 1 });
          // thought bubble: a cook thinks, a process doesn't
          const bk = K.io(t, wJudge - 0.6, 0.5);
          K.layer(bk, () => {
            [[cx - 40, 452, 7], [cx - 18, 432, 11]].forEach(([bx, by, br]) => { g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fillStyle = C.page; g.fill(); g.lineWidth = 2; g.strokeStyle = C.line2; g.stroke(); });
            g.beginPath(); g.arc(cx + 40, 396, 48, 0, Math.PI * 2); g.fillStyle = C.page; g.fill(); g.lineWidth = 2; g.strokeStyle = C.line2; g.stroke();
            K.icon('brain', cx + 40, 396, 56, { color: C.head, w: 2.5 });
          });
          M.cross(cx + 76, 430, 56, K.io(t, wProcess2, 0.6), { w: 7 });   // on the bubble's corner: the brain stays legible
          M.recipe(cx + 120, 560, { name: 'node.exe', w: 150, h: 100, lit: K.io(t, wExactly - 0.3, 0.5), rot: 0.04 });
          K.arrow(cx + 40, 560, cx - 38, 540, { k: K.io(t, wExactly - 0.2, 0.6), color: C.head, w: 3, bend: 10 });
          M.label('follows its card exactly', cx, CY + 440, { size: 30, color: C.strong, alpha: K.io(t, wExactly - 0.4, 0.5) });
        } else if (n === 1) {
          M.eyebrow('side by side?', cx, CY + 56);
          const laneK = K.io(t, wCoresW - 0.2, 0.6);
          const turnK = K.io(t, wSwitch - 0.3, 0.8);
          const on = (u) => { u = ((u % 2) + 2) % 2; if (u < 0.3) return K.ease.io(u / 0.3); if (u < 1) return 1; if (u < 1.3) return 1 - K.ease.io((u - 1) / 0.3); return 0; };
          for (let j = 0; j < 4; j++) {
            const lx = cx + (j - 1.5) * 118;
            // the core: a gold lane plate; the cook on it is running, the one above waits its turn
            K.layer(laneK, () => {
              K.card(lx - 52, 574, 104, 46, { r: 12, fill: K.mixColor(C.tile, C.head, 0.28), stroke: C.head, lw: 2, shadow: false, glow: 0.3 });
              M.label('core', lx, 606, { color: C.strong });
            });
            const p = Math.max(0, t - wSwitch) / 1.4 + j * 0.5;
            const onA = on(p);
            [0, 1].forEach((s) => {
              const k = s === 0 ? onA : 1 - onA;              // 1 = on the core
              const kk = turnK * k + (1 - turnK) * (s === 0 ? 1 : 0);
              const yy = K.lerp(428, 518, kk);
              const xx = lx + (s ? 1 : -1) * 34 * Math.sin(Math.PI * kk);
              M.cook(t, xx, yy, 58, { flicker: turnK * (1 - k), lit: turnK * k * 0.8, phase: j * 2 + s, idle: 0.6 });
            });
          }
          const capA = K.io(t, cCores + 0.4, 0.5) * (1 - K.io(t, wCoresW + 0.4, 0.4));
          const capB = K.io(t, wCoresW + 0.7, 0.5);
          M.label('cooks: all at once', cx, CY + 440, { size: 30, color: C.strong, alpha: capA });
          M.label('cores take turns, very fast', cx, CY + 440, { size: 30, color: C.strong, alpha: capB });
        } else {
          M.eyebrow('private counters', cx, CY + 56);
          const geo = { x: cx - 220, y: 552, w: 440, h: 100, n: 2 };   // wall post ends at y 662
          const wallK = K.io(t, wCant - 0.6, 0.7);
          M.counter(t, { geo, lit: { 0: K.io(t, cPrivate + 0.4, 0.5) }, wall: { at: 0, k: wallK } });
          M.cook(t, cx - 110, 470, 76, { phase: 3, lit: K.io(t, cPrivate + 0.4, 0.5) * 0.7 });
          M.cook(t, cx + 110, 470, 76, { phase: 5 });
          // the glance across, stopped by the wall
          const gk = K.io(t, wGlance - 0.1, 0.8);
          const gone = K.io(t, wCant, 0.5);
          K.layer(1 - 0.6 * gone, () => K.arrow(cx - 70, 440, cx + 92, 590, { k: gk, bend: -70, color: C.soft, w: 3, dash: [9, 8] }));
          M.cross(cx + 92, 590, 64, K.io(t, wCant, 0.5));
          // ... unless the system lets it in (a debugger)
          const dk = K.io(t, wDebug - 0.5, 0.6);
          if (dk > 0) M.badge('key', cx, 602, 28, { alpha: dk, color: C.head });
          M.label("can't see another's memory", cx, CY + 434, { size: 30, color: C.strong, alpha: K.io(t, wCant - 0.2, 0.5) });
          M.label('unless allowed: a debugger', cx, CY + 476, { size: 28, color: C.body, weight: 500, alpha: K.io(t, wUnless + 0.3, 0.5) });
        }
        g.restore();
      });
    }
  }
  }
});
