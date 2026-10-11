// 01.06 · 11 — The lantern: M C P servers are cooks your app hires
// The AI app (a window at left + its cook) launches one child cook per local MCP server in its config;
// they carry the satchel the app packs; the app stops them (politely, then by force) and should restart a
// crashed one; a remote server is a cook in somebody else's kitchen (a cloud); and a config line is, in
// effect, a command to run (the line morphs into its terminal twin).
SCENE('11', (t, S) => {
  const C = K.C, M = window.M, g = K.ctx();
  K.bg();

  // ---------------------------------------------------------------- cues (local seconds)
  const cHire = S.cue('mcp-hire', 0);
  const cInherit = S.cue('inherit', 13.9);
  const cShut = S.cue('shutdown', 19.8);
  const cRemote = S.cue('remote', 27.4);
  const cCmd = S.cue('config-is-command', 32.0);
  const w = (word, n, fb) => S.find(word, n || 0, fb, { whole: true });
  const tOpens = w('opens', 0, cHire + 1.5);
  const tConfig = w('config', 0, cHire + 6.3);
  const tChild = w('child', 0, cHire + 7.1);
  const tFive = w('Five', 0, cHire + 9.4);
  const tSatchel = w('satchel', 0, cInherit + 0.5);
  const tPacks = w('packs', 0, cInherit + 1.4);
  const tKeys = w('keys', 0, cInherit + 2.7);
  const tPerm = w('permissions', 0, cInherit + 4.7);
  const tCloses = w('closes', 0, cShut + 0.5);
  const tStop = w('stop', 0, cShut + 1.7);
  const tPolite = w('politely', 0, cShut + 2.8);
  const tForce = w('force', 0, cShut + 4.1);
  const tRestart = w('restart', 0, cShut + 5.4);
  const tCrashes = w('crashes', 0, cShut + 6.3);
  const tSomebody = w('somebody', 0, cRemote + 1.1);
  const tKitchen = w('kitchen', 0, cRemote + 3.5);
  const tResearch = w('researchers', 0, cCmd + 1.2);
  const tLine = w('line', 0, cCmd + 4.5);
  const tCommand = w('command', 0, cCmd + 6.3);
  const tDesign = w('design', 0, cCmd + 8.8);
  const tCaution = w('caution', 0, cCmd + 10.7);
  const tTreat = w('Treat', 0, cCmd + 11.7);

  // ---------------------------------------------------------------- layout
  const WIN = { x: 120, y: 160, w: 720, h: 420 };
  const APP = { x: 1250, y: 262, s: 110 };
  const CY = 590, CS = 84;                                  // children's line
  const CG = { x: 905, y: 700, w: 930, h: 90, n: 5 };      // their stretch of counter
  const kidX = (i) => M.stretchAt(i, CG).cx;
  const CAP = { x: 1370, y: 862 };                          // caption row under the kitchen
  const SAT = { x: 480, y: 812, s: 260 };                   // the satchel the app packs
  const CLOUD = { x: 470, y: 752, w: 440, h: 230 };

  const names = ['npx', 'uvx', 'python', 'node', 'node'];
  const cfg = [
    '{ "mcpServers": {',
    '  "files":   { "command": "npx" },',
    '  "search":  { "command": "uvx" },',
    '  "notes":   { "command": "python" },',
    '  "browser": { "command": "node" },',
    '  "github":  { "command": "node",',
    '     "env": { "KEY": "sk-…" } }',
    '} }',
  ];
  const lineOf = [1, 2, 3, 4, 5];                            // config line for child i

  // ---------------------------------------------------------------- global phases
  const outK = K.io(t, cCmd - 0.1, 0.6);                     // the kitchen gives way to the hero line
  const kAlpha = 1 - outK;
  const winOpen = K.io(t, tOpens - 1.3, 0.7);                // window opens with "When your A I app opens"
  const closeK = K.io(t, tCloses, 0.6) * (1 - K.io(t, tCrashes - 1.9, 0.5)); // closes, then the app is open again
  const reopenT = tCrashes - 1.9;

  // children: launch times, ghosting on shutdown, relaunch, crash + restart
  const launch = [tChild, tFive + 0.1, tFive + 0.45, tFive + 0.8, tFive + 1.15];
  const politeAt = (i) => tPolite + 0.05 + i * 0.25;          // 0..2 stop when asked
  const forceAt = (i) => tForce + 0.05 + (i - 3) * 0.2;       // 3, 4 are forced
  const relaunch = (i) => reopenT + 0.25 + i * 0.12;
  const crashI = 2, crashAt = tCrashes - 0.15, restartAt = tCrashes + 0.5;
  const swapK = K.io(t, tRestart - 0.1, 0.4);                 // python's name gives way to its PID ticket
  const flashK = K.env(t, crashAt, crashAt + 0.55, 0.15);     // the crash: a terracotta flash
  const freshK = K.io(t, restartAt, 0.45);                    // a fresh python, new PID
  const kid = (i) => {
    const p = K.io(t, launch[i], 0.8);
    const appear = K.io(t, launch[i], 0.35);
    const stopK = i < 3 ? K.io(t, politeAt(i), 0.45) : K.io(t, forceAt(i) + 0.35, 0.4);
    const back = K.io(t, relaunch(i), 0.4);
    let ghost = stopK * (1 - back);
    let crash = 0;
    if (i === crashI) { crash = K.io(t, crashAt + 0.3, 0.35) * (1 - freshK); ghost = Math.max(ghost, crash); }
    // spawn in place: rise and grow at its own stretch (never from behind the AI app)
    const x = kidX(i), y = CY + (1 - p) * 20, sc = K.lerp(0.78, 1, p);
    return { p, appear, ghost, crash, x, y, sc, walking: 0 };
  };

  // ---------------------------------------------------------------- the lantern mark (continuity from 10)
  M.lanternMark(t, {});

  // ================================================================ the kitchen part (fades at config-is-command)
  if (kAlpha > 0.002) K.layer(kAlpha, () => {
    // ---- the AI app's window, with its config
    const hlServers = K.io(t, tConfig - 0.6, 0.5) * (1 - K.io(t, cInherit - 0.4, 0.5));
    const envK = K.io(t, tKeys - 0.1, 0.5) * (1 - K.io(t, cShut, 0.5));
    if (winOpen > 0) M.doorWin(t, {
      ...WIN, title: 'AI app · config', kind: 'code', close: Math.max(1 - winOpen, closeK), ghost: winOpen >= 1,
      alpha: K.io(t, tOpens - 1.4, 0.4), focus: t > tOpens - 0.6 && closeK < 0.5,
      inner: (r) => {
        const size = 26, lh = size * 1.55, base = (i) => r.y + 26 + size + i * lh;
        // a gold bracket around "servers in its config"
        if (hlServers > 0) K.card(r.x + 10, base(1) - 31, r.w - 20, lh * 5 + 4, { r: 10, fill: K.rgba(C.head, 0.07), stroke: K.rgba(C.head, 0.8), shadow: false, alpha: hlServers });
        // each line lights as its cook is launched
        lineOf.forEach((ln, i) => {
          const lk = K.io(t, launch[i] - 0.15, 0.3) * (1 - 0.6 * K.io(t, launch[i] + 0.9, 0.6));
          if (lk > 0) K.card(r.x + 10, base(ln) - 30, r.w - 20, lh - 2, { r: 8, fill: K.rgba(C.head, 0.22), stroke: false, shadow: false, alpha: lk });
        });
        if (envK > 0) K.card(r.x + 10, base(6) - 30, r.w - 20, lh - 2, { r: 8, fill: K.rgba(C.accent, 0.3), stroke: C.accent, shadow: false, alpha: envK });
        K.editor(r, t, cfg, { size, syntax: 'none' });
      },
    });

    // ---- the satchel the app packs (left, under the window)
    const satK = K.io(t, tSatchel - 0.2, 0.5) * (1 - K.io(t, cShut, 0.5));
    if (satK > 0) {
      M.satchel(t, SAT.x, SAT.y, SAT.s, {
        open: 1, alpha: satK, glow: K.io(t, tPacks, 0.5) * 0.8,
        cards: [{ name: 'KEY', kind: 'key', lit: K.io(t, tKeys, 0.4) }, { name: 'PATH', kind: 'path' }, { name: 'HOME' }],
      });
      // the env line feeds the KEY card
      const ak = K.io(t, tKeys - 0.1, 0.6);
      if (ak > 0) K.layer(satK, () => K.arrow(318, 520, 392, 676, { k: ak, bend: -30, color: C.accent, w: 3, dash: [9, 7] }));
    }

    // ---- the counter: each child's own stretch
    const ctrK = K.io(t, tChild - 0.5, 0.7);
    const litMap = {};
    for (let i = 0; i < 5; i++) { const s = kid(i); litMap[i] = 0.55 * K.io(t, launch[i] + 0.7, 0.5) * (1 - s.ghost); }
    M.counter(t, { geo: CG, k: ctrK, lit: litMap, named: { [crashI]: flashK } });

    // ---- parent links: app -> each child
    for (let i = 0; i < 5; i++) {
      const s = kid(i);
      if (s.appear <= 0 || s.p < 0.15) continue;
      const la = (1 - 0.7 * s.ghost) * s.appear;
      M.parentLink(APP.x + (i - 2) * 22, APP.y + 112, s.x, s.y - 92, { k: K.io(t, launch[i] + 0.1, 0.7), label: null, bend: (i - 2) * 10, alpha: la, lit: s.ghost < 0.5 });
    }

    // ---- the app's own cook
    const appK = K.io(t, tOpens - 0.2, 0.5);
    const appDim = K.io(t, tCloses + 0.2, 0.5) * (1 - K.io(t, reopenT, 0.4));
    M.cook(t, APP.x, APP.y, APP.s, { icon: 'chat', ai: true, name: 'AI app', nameColor: C.head, alpha: appK, dim: appDim * 0.7, lit: 0.6 * (1 - appDim) });

    // ---- "please stop" slips travel down the links
    for (let i = 0; i < 5; i++) {
      const sp = K.seg(t, tStop + 0.05 + i * 0.08, tStop + 0.75 + i * 0.08);
      if (sp <= 0 || sp >= 1) continue;
      const s = kid(i), e = K.ease.io(sp);
      M.slip(K.lerp(APP.x, s.x, e), K.lerp(APP.y + 120, s.y - 80, e), 40, { alpha: K.clamp(sp * 5) * (1 - K.seg(sp, 0.8, 1)), rot: (i - 2) * 0.08 });
    }

    // ---- the children (local MCP servers)
    for (let i = 0; i < 5; i++) {
      const s = kid(i);
      if (s.appear <= 0) continue;
      const satArrive = tPacks + 0.15 + i * 0.12 + 0.7;
      const o = {
        ai: true, name: names[i], walking: s.walking, phase: i * 1.3,
        satchel: true, satchelK: K.io(t, satArrive - 0.1, 0.3),
        lit: 0, named: 0,
      };
      if (i === crashI && swapK > 0) {
        // the crash and restart beat: python wears its PID ticket instead of its name
        const nameA = 1 - swapK;
        const old = { ...o, name: null, pid: 9140, pidK: swapK };
        if (freshK < 1) {
          if (s.ghost < 1) M.cook(t, s.x, s.y, CS, { ...old, named: flashK, alpha: (1 - s.ghost) });
          if (s.ghost > 0) M.cook(t, s.x, s.y, CS, { ...old, kind: 'ghost', alpha: s.ghost, badge: 'cross', ai: false });
          if (nameA > 0) K.text(names[i], s.x, s.y + CS / 2 + 38, { font: 'mono', weight: 600, size: 26, color: C.strong, align: 'center', alpha: nameA });
        }
        if (freshK > 0) {
          const freshLit = 1 - K.io(t, cRemote + 0.8, 0.5);
          const sc = K.lerp(0.8, 1, K.ease.out(freshK));
          M.cook(t, s.x, s.y, CS * sc, { ...o, name: null, pid: 9318, pidK: K.io(t, restartAt + 0.3, 0.35), pidLit: freshLit, lit: freshLit, alpha: freshK });
          // circular-arrow badge: restarted
          const bx = s.x - CS * sc * 0.44, by = s.y - CS * sc * 0.44, br = 17;
          K.layer(freshK, () => {
            g.save();
            g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fillStyle = C.panel; g.fill();
            g.lineWidth = 2; g.strokeStyle = C.head; g.stroke();
            const rr = 8.5, a0 = -Math.PI * 0.35, a1 = a0 + Math.PI * 1.55;
            g.beginPath(); g.arc(bx, by, rr, a0, a1); g.lineWidth = 2.6; g.lineCap = 'round'; g.stroke();
            const hx = bx + rr * Math.cos(a1), hy = by + rr * Math.sin(a1);
            const tx = -Math.sin(a1), ty = Math.cos(a1);           // tangent (direction of travel)
            const nx = Math.cos(a1), ny = Math.sin(a1);
            g.beginPath();
            g.moveTo(hx + tx * 5, hy + ty * 5);
            g.lineTo(hx - tx * 2 + nx * 5, hy - ty * 2 + ny * 5);
            g.lineTo(hx - tx * 2 - nx * 5, hy - ty * 2 - ny * 5);
            g.closePath(); g.fillStyle = C.head; g.fill();
            g.restore();
          });
        }
        continue;
      }
      if (s.ghost < 1) M.cook(t, s.x, s.y, CS * s.sc, { ...o, alpha: s.appear * (1 - s.ghost) });
      if (s.ghost > 0) M.cook(t, s.x, s.y, CS, { ...o, kind: 'ghost', alpha: s.ghost });
      // forced: a terracotta X over the tile
      if (i >= 3) {
        const xk = K.io(t, forceAt(i), 0.3), xa = 1 - K.io(t, forceAt(i) + 0.45, 0.35);
        if (xk > 0 && xa > 0) M.cross(s.x, s.y, 90, xk, { alpha: xa });
      }
    }

    // ---- key chips: copies fly from the satchel to each child's hip
    for (let i = 0; i < 5; i++) {
      const st = tPacks + 0.15 + i * 0.12, sp = K.seg(t, st, st + 0.7);
      if (sp <= 0 || sp >= 1 || satK <= 0) continue;
      const e = K.ease.io(sp), tx = kidX(i) + CS * 0.5, ty = CY + CS * 0.32 - 30;
      const x = K.lerp(SAT.x, tx, e), y = K.lerp(SAT.y - 110, ty, e) - Math.sin(e * Math.PI) * 80;
      M.chip(x, y, { w: 46, h: 58, kind: 'key', dashed: true, alpha: K.clamp(sp * 6) * (1 - K.seg(sp, 0.85, 1)), rot: (i - 2) * 0.06 });
    }

    // ---- captions under the kitchen (one at a time)
    const cap1 = K.io(t, tChild + 0.2, 0.5) * (1 - K.io(t, cInherit - 0.3, 0.4));
    if (cap1 > 0) K.spans([{ s: 'local MCP server', color: C.strong }, { s: ' = ', color: C.soft }, { s: 'child process', color: C.head }], CAP.x, CAP.y, { align: 'center', size: 30, font: 'ui', weight: 600, alpha: cap1 });
    const cap2 = K.io(t, tPerm - 0.3, 0.5) * (1 - K.io(t, cShut, 0.4));
    if (cap2 > 0) K.spans([{ s: 'your permissions', color: C.strong }, { s: '  ·  ', color: C.soft }, { s: 'your keys', color: C.accent }], CAP.x, CAP.y, { align: 'center', size: 30, font: 'ui', weight: 600, alpha: cap2 });
    const capOut3 = 1 - K.io(t, reopenT - 0.1, 0.4);
    const p1 = K.io(t, tStop, 0.4) * capOut3, p2 = K.io(t, tForce - 0.1, 0.4) * capOut3;
    if (p1 > 0) K.pill('1 · please stop', CAP.x - 150, CAP.y - 10, { size: 26, fill: C.panel, stroke: C.line2, color: C.strong, alpha: p1 });
    if (p2 > 0) K.pill('2 · by force', CAP.x + 150, CAP.y - 10, { size: 26, fill: C.panel, stroke: C.accent, color: C.accent, alpha: p2 });
    const p3 = K.io(t, tRestart, 0.4) * (1 - K.io(t, cRemote + 0.8, 0.4));
    if (p3 > 0) K.pill('should restart', CAP.x, CAP.y - 10, { size: 26, fill: C.panel, stroke: C.head, color: C.head, icon: 'clock', alpha: p3 });

    // ---- remote: somebody else's kitchen, in a cloud
    const rk = K.io(t, cRemote + 0.1, 0.6);
    if (rk > 0) {
      // the dashed road over the web
      K.path([[APP.x - 64, APP.y + 10], [905, 330], [900, 560], [CLOUD.x + 200, CLOUD.y - 50]], { k: K.io(t, cRemote + 0.1, 0.9), color: C.soft, w: 3, dash: [10, 8], tension: 0.35 });
      M.badge('globe', 902, 450, 24, { alpha: K.io(t, cRemote + 0.5, 0.4), color: C.soft });
      const ck = K.io(t, cRemote + 0.5, 0.6);
      K.layer(ck, () => {
        const { x, y, w: cw, h } = CLOUD;
        const blobs = [[x - cw * 0.27, y + h * 0.05, h * 0.3], [x - cw * 0.04, y - h * 0.12, h * 0.42], [x + cw * 0.24, y - h * 0.02, h * 0.34]];
        const shape = (pad) => {
          g.beginPath();
          K.rr(x - cw / 2 - pad, y + h * 0.02 - pad, cw + pad * 2, h * 0.48 + pad * 2, h * 0.24 + pad);
          blobs.forEach(([bx, by, br]) => { g.moveTo(bx + br + pad, by); g.arc(bx, by, br + pad, 0, Math.PI * 2); });
        };
        g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 40; g.shadowOffsetY = 12; shape(3); g.fillStyle = C.soft; g.fill(); g.restore();
        g.save(); shape(0); g.fillStyle = K.mixColor(C.panel, C.page, 0.3); g.fill(); g.restore();
        // a tiny kitchen inside: hatch, two cooks, a counter
        M.hatch(t, x + 150, y - 30, { small: true, state: 'open' });
        const kk = K.io(t, tSomebody, 0.5);
        K.card(x - 150, y + 82, 300, 30, { r: 10, fill: K.mixColor(C.tile, C.head, 0.05), stroke: C.line2, shadow: false, alpha: kk });
        M.cook(t, x - 70, y + 34, 54, { kind: 'app', ai: true, alpha: kk, phase: 2 });
        M.cook(t, x + 40, y + 34, 54, { kind: 'app', alpha: kk, phase: 4 });
      });
      const lk = K.io(t, tKitchen - 1.0, 0.5);
      if (lk > 0) K.spans([{ s: 'remote MCP', color: C.strong }, { s: ' = ', color: C.soft }, { s: "someone else's kitchen", color: C.soft }], CLOUD.x, 912, { align: 'center', size: 26, font: 'ui', weight: 600, alpha: lk });
    }
  });

  // ================================================================ config line = a command to run
  if (outK > 0) {
    const heroK = K.io(t, cCmd + 0.2, 0.7);
    const HX = 280, HW = 1360;
    const H1 = { x: HX, y: 244, w: HW, h: 196 }, H2 = { x: HX, y: 516, w: HW, h: 150 };
    const size = 32, mono = { font: 'mono', weight: 600, size };
    const parts = [
      ['"files": { "command": ', C.strong], ['"npx"', C.head], [', "args": [', C.strong], ['"-y", "files-mcp"', C.head], ['] }', C.strong],
    ];
    const sc = K.lerp(0.9, 1, K.ease.out(heroK));
    K.layer(heroK, () => K.at(H1.x + H1.w / 2, H1.y + H1.h / 2, sc, 0, () => {
      const r = K.win(-H1.w / 2, -H1.h / 2, H1.w, H1.h, { title: 'AI app · config', titleSize: 26, kind: 'code', focus: true });
      const by = r.y + r.h / 2 + 11;
      let x = r.x + 40;
      parts.forEach(([s, col]) => { x += K.text(s, x, by, { ...mono, color: col }); });
      // "config line": gold underline
      const uk = K.io(t, tLine - 0.4, 0.6);
      if (uk > 0) K.line(r.x + 40, by + 16, K.lerp(r.x + 40, x, K.ease.io(uk)), by + 16, { color: C.head, w: 4 });
    }));

    // positions of the moving tokens (no scale once settled)
    const by1 = H1.y + 50 + (H1.h - 50) / 2 + 11, x0 = H1.x + 40;
    const mw = (s) => K.measure(s, mono);
    const npxX = x0 + mw(parts[0][0]) + mw('"');
    const argsX = x0 + mw(parts[0][0] + parts[1][0] + parts[2][0]);
    const yX = argsX + mw('"'), fX = argsX + mw('"-y", "');
    const prompt = 'C:\\Users\\you> ';
    const by2 = H2.y + 50 + (H2.h - 50) / 2 + 11, px = H2.x + 40, pw = mw(prompt);
    const tgt = { npx: px + pw, y: px + pw + mw('npx '), f: px + pw + mw('npx -y ') };

    // the terminal twin
    const tk = K.io(t, tLine - 0.3, 0.6);
    if (tk > 0) {
      K.arrow(H1.x + H1.w / 2, H1.y + H1.h + 14, H2.x + H2.w / 2, H2.y - 12, { k: K.io(t, tLine - 0.1, 0.5), color: C.head, w: 3, bend: 0 });
      K.layer(tk, () => {
        K.win(H2.x, H2.y, H2.w, H2.h, { title: 'what it really runs', titleSize: 26, kind: 'terminal' });
        K.text(prompt, px, by2, { ...mono, color: C.head });
      });
      const fly = K.ease.io(K.seg(t, tLine + 0.1, tLine + 1.0));
      const land = K.seg(t, tLine + 0.9, tLine + 1.1);
      const tokens = [['npx', npxX, tgt.npx], ['-y', yX, tgt.y], ['files-mcp', fX, tgt.f]];
      tokens.forEach(([s, fx, tx], j) => {
        const e = K.ease.io(K.seg(t, tLine + 0.1 + j * 0.1, tLine + 0.9 + j * 0.1));
        if (e <= 0) return;
        const x = K.lerp(fx, tx, e), y = K.lerp(by1, by2, e) - Math.sin(e * Math.PI) * 30;
        K.text(s, x, y, { ...mono, color: K.mixColor(C.head, C.strong, e), alpha: K.clamp((e - 0.08) * 4) });
      });
      if (fly >= 1 && land >= 1 && K.caretOn(t)) { g.save(); g.fillStyle = C.strong; g.fillRect(tgt.f + mw('files-mcp') + 6, by2 - size * 0.8, size * 0.55, size); g.restore(); }
      // like installing software
      const ik = K.io(t, tTreat, 0.5);
      if (ik > 0) K.pill('like installing software', H2.x + H2.w - 230, by2 - 10, { size: 26, fill: C.panel, stroke: C.head, color: C.head, icon: 'shield', alpha: ik });
    }

    // the idea
    const lk = K.io(t, tCommand - 0.1, 0.5);
    if (lk > 0) K.spans([{ s: 'a config line', color: C.strong }, { s: ' = ', color: C.soft }, { s: 'a command to run', color: C.head }], 960, 782, { align: 'center', size: 40, font: 'ui', weight: 700, alpha: lk });
    // who says what
    const r1 = K.io(t, tResearch, 0.5), r2 = K.io(t, tDesign - 0.4, 0.5), r3 = K.io(t, tCaution - 0.4, 0.5);
    if (r1 > 0) K.pill('researchers · Apr 2026', 560, 866, { size: 26, fill: C.panel, stroke: C.line2, color: C.body, alpha: r1 });
    if (r2 > 0) K.pill('makers: by design', 960, 866, { size: 26, fill: C.panel, stroke: C.line2, color: C.body, alpha: r2 });
    if (r3 > 0) K.pill('docs: use with caution', 1360, 866, { size: 26, fill: C.panel, stroke: C.accent, color: C.accent, icon: 'warning', alpha: r3 });
  }
});
